#!/usr/bin/env bash
# Tests for deploy/dev-up.sh and deploy/dev-down.sh. Plain bash, no framework, no network.
# Uses stub docker, java, node and ollama on a temp PATH and a temp copy of the repo: it never
# touches the real Docker stack, real volumes or the real data/ folder.
#   deploy/tests/dev-scripts.test.sh

set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY="$HERE/.."
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

pass=0; fail=0
# check NAME EXPECTED_EXIT PATTERN COMMAND...   (pattern is matched against stdout and stderr)
check() {
  local name="$1" want="$2" pattern="$3"; shift 3
  local out code
  out="$("$@" 2>&1)"; code=$?
  if [ "$code" -eq "$want" ] && echo "$out" | tr "\n" " " | grep -Eq -- "$pattern"; then
    pass=$((pass + 1)); echo "ok   $name"
  else
    fail=$((fail + 1)); echo "FAIL $name (exit $code, wanted $want, pattern: $pattern)"; printf "%s\n" "$out" | while IFS= read -r l; do echo "     | $l"; done
  fi
}
# assert NAME CONDITION...  passes when the command succeeds
assert() {
  local name="$1"; shift
  if "$@"; then pass=$((pass + 1)); echo "ok   $name"; else fail=$((fail + 1)); echo "FAIL $name"; fi
}

# ---- fixture: a fresh repo copy, a stub PATH and a fake Docker config -------------------------
STUBS="$TMP/stubs"
mkdir -p "$STUBS"
cat > "$STUBS/docker" <<'STUB'
#!/usr/bin/env bash
echo "docker $*" >> "$STUB_LOG"
case "$1" in
  info) [ -z "${STUB_NO_DAEMON:-}" ] || exit 1; exit 0 ;;
  compose)
    case " $* " in
      *" build "*) [ -z "${STUB_BUILD_FAIL:-}" ] || { echo "ERROR: build failed: compile error in app"; exit 1; } ;;
      *" logs "*) echo "app log: crashed on start"; exit 0 ;;
      *" up "*) [ -z "${STUB_UP_FAIL:-}" ] || exit 1 ;;
      *" ps "*)
        case "$*" in
          *"{{.Service}}|"*)
            [ -z "${STUB_PS_EMPTY:-}" ] || exit 0
            [ -z "${STUB_APP_EXITED:-}" ] || echo "app|exited||1"
            echo "postgres|running|healthy|0"; echo "keycloak|running|${STUB_KC_HEALTH:-healthy}|0"; echo "keycloak-db-init|exited||${STUB_INIT_EXIT:-0}" ;;
          *) echo "  postgres: running healthy"; echo "  keycloak: running healthy" ;;
        esac ;;
    esac ;;
esac
exit 0
STUB
cat > "$STUBS/curl" <<'STUB'
#!/usr/bin/env bash
echo "curl $*" >> "$STUB_LOG"
[ -z "${STUB_APP_DOWN:-}" ] || exit 7
echo '{"status":"UP"}'
STUB
cat > "$STUBS/tailscale" <<'STUB'
#!/usr/bin/env bash
echo "tailscale $*" >> "$STUB_LOG"
[ -z "${STUB_TS_LOGGED_OUT:-}" ] || exit 1
echo "{\"BackendState\":\"${STUB_TS_STATE:-Running}\",\"Self\":{\"DNSName\":\"mymac.tail1234.ts.net.\"}}"
STUB
cat > "$STUBS/java" <<'STUB'
#!/usr/bin/env bash
echo "openjdk version \"${STUB_JAVA_VERSION:-25.0.1}\" 2026-10-20" >&2
STUB
cat > "$STUBS/node" <<'STUB'
#!/usr/bin/env bash
echo v24.0.0
STUB
cat > "$STUBS/ollama" <<'STUB'
#!/usr/bin/env bash
echo "NAME ID SIZE MODIFIED"
[ -z "${STUB_OLLAMA_MODEL:-}" ] || echo "$STUB_OLLAMA_MODEL abc 1GB now"
STUB
chmod +x "$STUBS"/*
SAFE_PATH="/usr/bin:/bin"
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null

new_repo() { # NAME -> prints path of a fresh repo copy (no local.env, tools present, git initialised)
  local r="$TMP/$1"
  mkdir -p "$r/deploy" "$r/.tools"
  cp "$DEPLOY"/dev-up.sh "$DEPLOY"/dev-down.sh "$DEPLOY"/security-scan.sh "$DEPLOY"/compose.yaml "$DEPLOY"/local.env.example "$r/deploy/"
  local t v
  for t in grype syft gitleaks; do
    v="$(grep -E "^$(echo "$t" | tr '[:lower:]' '[:upper:]')_VERSION=" "$DEPLOY/security-scan.sh" | head -n 1)"; v="${v#*=}"
    mkdir -p "$r/.tools/$t-$v"; printf '#!/bin/sh\n' > "$r/.tools/$t-$v/$t"; chmod +x "$r/.tools/$t-$v/$t"
  done
  git -C "$r" init -q
  echo "$r"
}
DOCKER_CFG="$TMP/dockercfg"; mkdir -p "$DOCKER_CFG"
echo '{"auths":{"dhi.io":{}}}' > "$DOCKER_CFG/config.json"
NOLOGIN_CFG="$TMP/nologin"; mkdir -p "$NOLOGIN_CFG"; echo '{"auths":{}}' > "$NOLOGIN_CFG/config.json"

export STUB_LOG="$TMP/docker.log"
# up REPO [ENV=VALUE...]: run dev-up.sh from another directory with the stub PATH
# Arguments with = are environment, the rest (--full ...) go to the script.
run_up() { # STUBDIR REPO ARGS...
  local stubdir="$1" r="$2"; shift 2
  local envs=() args=() a
  for a in "$@"; do case "$a" in *=*) envs+=("$a") ;; *) args+=("$a") ;; esac; done
  ( cd "$TMP" && env PATH="$stubdir:$SAFE_PATH" DOCKER_CONFIG="$DOCKER_CFG" JAVA_HOME= HOME="$TMP" ${envs[@]+"${envs[@]}"} "$r/deploy/dev-up.sh" ${args[@]+"${args[@]}"} )
}
up() { run_up "$STUBS" "$@"; }
down() { local r="$1"; shift; ( cd "$TMP" && env PATH="$STUBS:$SAFE_PATH" "$@" ); }
hook() { git -C "$1" config --local --get core.hooksPath || true; }
no_state_change() { # REPO: no hook, no local.env, no compose up
  [ -z "$(hook "$1")" ] && [ ! -f "$1/deploy/local.env" ] && ! grep -q " up " "$STUB_LOG" 2>/dev/null
}

# ---- dev-up: prerequisites --------------------------------------------------------------------
R="$(new_repo ok1)"; : > "$STUB_LOG"
FRESH_OUT="$(up "$R" 2>&1)"
check "fresh clone: starts, creates local.env, prints URLs" 0 "created deploy/local.env.*Service state.*localhost:8080.*localhost:8180/admin.*localhost:8025.*psql -h localhost -p 5432" printf '%s\n' "$FRESH_OUT"
assert "fresh clone: hook path set" test "$(hook "$R")" = ".githooks"
assert "fresh clone: local.env created from the example" test -f "$R/deploy/local.env"
assert "fresh clone: compose started with --wait" grep -q "up -d --wait" "$STUB_LOG"
assert "fresh clone: no value from local.env.example matching change-me is echoed" bash -c "! grep -q 'change-me' <<< \"\$1\"" _ "$FRESH_OUT"

sed 's/^LS_POSTGRES_PORT=.*/LS_POSTGRES_PORT=6543/' "$R/deploy/local.env" > "$TMP/le" && cp "$TMP/le" "$R/deploy/local.env"
echo "# keep-me" >> "$R/deploy/local.env"
: > "$STUB_LOG"
check "re-run: reports state and uses ports from local.env" 0 "postgres: running healthy.*-p 6543" up "$R"
assert "re-run: local.env not overwritten" grep -q "keep-me" "$R/deploy/local.env"

R="$(new_repo nodocker)"; : > "$STUB_LOG"
check "no Docker daemon: listed with one fix, exit 1" 1 "missing: Docker Desktop.*fix: +install Docker Desktop" up "$R" STUB_NO_DAEMON=1
assert "no Docker daemon: nothing changed" no_state_change "$R"

R="$(new_repo nologin)"; : > "$STUB_LOG"
check "no dhi.io login: fix step docker login dhi.io" 1 "missing: dhi.io login.*fix: +docker login dhi.io" up "$R" DOCKER_CONFIG="$NOLOGIN_CFG"
assert "no dhi.io login: nothing changed" no_state_change "$R"

R="$(new_repo oldjava)"; : > "$STUB_LOG"
check "Java 21: listed, names found version" 1 "missing: Java 25 \(found: 21\)" up "$R" STUB_JAVA_VERSION=21.0.5
assert "Java 21: nothing changed" no_state_change "$R"

R="$(new_repo notools)"; rm -rf "$R/.tools"; : > "$STUB_LOG"
check "no tools: each listed with install-tools step" 1 "missing: grype.*install-tools.*missing: syft.*install-tools.*missing: gitleaks.*install-tools" up "$R"
assert "no tools: nothing changed" no_state_change "$R"

R="$(new_repo several)"; rm -rf "$R/.tools"; : > "$STUB_LOG"
check "several missing: all listed at once, with a count" 1 "Java 25 \(found: 21\).*4 prerequisite\(s\) missing" up "$R" STUB_JAVA_VERSION=21.0.5

R="$(new_repo nonode)"; : > "$STUB_LOG"
NONODE="$TMP/nonode-stubs"; mkdir -p "$NONODE"; cp "$STUBS/docker" "$STUBS/java" "$NONODE/"
check "no node: listed" 1 "missing: Node" bash -c "cd '$TMP' && env PATH='$NONODE:$SAFE_PATH' DOCKER_CONFIG='$DOCKER_CFG' JAVA_HOME= '$R/deploy/dev-up.sh'"

# ---- dev-up: Ollama ---------------------------------------------------------------------------
R="$(new_repo ai-optional)"; : > "$STUB_LOG"
check "AI optional, model missing: warning and continues" 0 "warning: Ollama model qwen3:8b is not pulled.*Service state" up "$R" STUB_OLLAMA_MODEL=
assert "AI optional: stack started" grep -q "up -d --wait" "$STUB_LOG"

R="$(new_repo ai-required)"; : > "$STUB_LOG"
check "AI required, model missing: error with ollama pull, exit 1" 1 "error: Ollama model qwen3:8b is not pulled.*fix: ollama pull qwen3:8b" up "$R" LS_AI_REQUIRED=true
assert "AI required, model missing: no containers started" bash -c "! grep -q ' up ' '$STUB_LOG'"
assert "AI required, model missing: local.env not created" test ! -f "$R/deploy/local.env"

R="$(new_repo ai-present)"; : > "$STUB_LOG"
check "AI required, model present: continues" 0 "Service state" up "$R" LS_AI_REQUIRED=true STUB_OLLAMA_MODEL=qwen3:8b:latest

R="$(new_repo ai-noollama)"; : > "$STUB_LOG"
NOOLLAMA="$TMP/noollama-stubs"; mkdir -p "$NOOLLAMA"; cp "$STUBS/docker" "$STUBS/java" "$STUBS/node" "$NOOLLAMA/"
check "AI optional, Ollama not installed: warning only" 0 "warning: Ollama is not installed" bash -c "cd '$TMP' && env PATH='$NOOLLAMA:$SAFE_PATH' DOCKER_CONFIG='$DOCKER_CFG' JAVA_HOME= '$R/deploy/dev-up.sh'"

# ---- dev-up: health timeout ---------------------------------------------------------------------
R="$(new_repo timeout)"; : > "$STUB_LOG"
check "health timeout: names the unhealthy service, exit 1" 1 "service not healthy: keycloak \(state: running, health: starting\)" up "$R" STUB_UP_FAIL=1 STUB_KC_HEALTH=starting

R="$(new_repo initfail)"; : > "$STUB_LOG"
check "one-shot init exits non-zero: named with its exit code" 1 "service failed: keycloak-db-init \(exited with code 3\)" up "$R" STUB_UP_FAIL=1 STUB_INIT_EXIT=3
R="$(new_repo psempty)"; : > "$STUB_LOG"
check "up fails and ps is empty: generic fallback, no timeout claim" 1 "compose up failed \(service unknown" up "$R" STUB_UP_FAIL=1 STUB_PS_EMPTY=1

# ---- env parsing and Ollama matching ----
R="$(new_repo similar)"; : > "$STUB_LOG"
check "similar model name (qwen3x8b) does not count as qwen3:8b" 1 "error: Ollama model qwen3:8b is not pulled" up "$R" LS_AI_REQUIRED=true STUB_OLLAMA_MODEL=qwen3x8b
R="$(new_repo upper)"; : > "$STUB_LOG"
check "LS_AI_REQUIRED=True is treated as true" 1 "error: Ollama model qwen3:8b is not pulled" up "$R" LS_AI_REQUIRED=True
R="$(new_repo crlf)"; mkdir -p "$R/deploy"; : > "$STUB_LOG"
{ cat "$R/deploy/local.env.example"; printf 'LS_AI_REQUIRED="true" # strict\r\nOLLAMA_MODEL=qwen3:8b # model\r\n'; } > "$R/deploy/local.env"
check "quotes, CR and inline comment in local.env are read correctly" 1 "error: Ollama model qwen3:8b is not pulled" up "$R"

# ---- dev-up --full ------------------------------------------------------------------------------
# Tailscale is only present in the stub dir for the tests that want it.
NOTS="$TMP/nots-stubs"; mkdir -p "$NOTS"; cp "$STUBS/docker" "$STUBS/java" "$STUBS/node" "$STUBS/ollama" "$STUBS/curl" "$NOTS/"
upnots() { run_up "$NOTS" "$@"; }

R="$(new_repo full-ok)"; : > "$STUB_LOG"
check "--full: builds, starts, app UP, URL list shows the app running" 0 "building the app image.*app is UP.*App \(running\) +http://localhost:8080" upnots "$R" --full
assert "--full: built with --profile full build" grep -q -- "--profile full build" "$STUB_LOG"
assert "--full: build ran before up" bash -c "awk '/ build\$/ {b=NR} / up / {u=NR} END {exit !(b && u && b < u)}' '$STUB_LOG'"
assert "--full: polled /actuator/health on the app port" grep -q "localhost:8080/actuator/health" "$STUB_LOG"
assert "--full: tailscale not called when absent" bash -c "! grep -q '^tailscale' '$STUB_LOG'"
OUT="$(upnots "$R" --full 2>&1)"
assert "--full without tailscale: prints nothing about Tailscale" bash -c "! grep -qi tailscale <<< \"\$1\"" _ "$OUT"

R="$(new_repo plain)"; : > "$STUB_LOG"
upnots "$R" >/dev/null 2>&1
assert "plain dev-up: no build, no profile, no health poll" bash -c "! grep -q -e ' build' -e '--profile' -e 'curl' '$STUB_LOG'"
check "plain dev-up: app listed as not running" 0 "App \(not running\).*deploy/dev-up.sh --full" upnots "$R"

R="$(new_repo full-ts)"; : > "$STUB_LOG"
check "--full with tailscale logged in: prints the serve command and the HTTPS URL" 0 "tailscale serve --bg --https=443 http://localhost:8080.*https://mymac.tail1234.ts.net" up "$R" --full
check "--full with tailscale logged out: nothing about Tailscale" 0 "App \(running\)" up "$R" STUB_TS_LOGGED_OUT=1 --full
OUT="$(up "$R" STUB_TS_LOGGED_OUT=1 --full 2>&1)"
assert "--full with tailscale logged out: no serve command" bash -c "! grep -qi 'tailscale serve' <<< \"\$1\"" _ "$OUT"

R="$(new_repo full-port)"; mkdir -p "$R/deploy"; cp "$R/deploy/local.env.example" "$R/deploy/local.env"; sed -i.bak 's/^LS_APP_PORT=.*/LS_APP_PORT=9090/' "$R/deploy/local.env"; : > "$STUB_LOG"
check "--full uses LS_APP_PORT from local.env" 0 "App \(running\) +http://localhost:9090" up "$R" --full
assert "--full custom port: health polled on it" grep -q "localhost:9090/actuator/health" "$STUB_LOG"

R="$(new_repo full-buildfail)"; : > "$STUB_LOG"
check "--full build failure: output shown, exit 1" 1 "build failed: compile error in app.*Nothing was started" up "$R" STUB_BUILD_FAIL=1 --full
assert "--full build failure: nothing started" bash -c "! grep -q ' up ' '$STUB_LOG'"

R="$(new_repo full-never)"; : > "$STUB_LOG"
check "--full app never UP: names app, exit 1" 1 "service not healthy: app .*did not report UP within 1s" up "$R" STUB_APP_DOWN=1 LS_WAIT_TIMEOUT=1 LS_POLL_INTERVAL=1 --full

R="$(new_repo full-crash)"; : > "$STUB_LOG"
check "--full app container exited: fails at once (not after the timeout), logs shown, names app" 1 "service failed: app .*exited.*app log: crashed on start" up "$R" STUB_APP_DOWN=1 STUB_APP_EXITED=1 LS_WAIT_TIMEOUT=300 --full

R="$(new_repo full-needslogin)"; : > "$STUB_LOG"
OUT="$(up "$R" STUB_TS_STATE=NeedsLogin --full 2>&1)"
assert "--full with tailscale NeedsLogin: no Tailscale hint" bash -c "! grep -qi 'tailscale serve' <<< \"\$1\"" _ "$OUT"
assert "--full with tailscale NeedsLogin: app still reported running" bash -c "grep -q 'App (running)' <<< \"\$1\"" _ "$OUT"

R="$(new_repo full-prereq)"; : > "$STUB_LOG"
check "--full: same prerequisite checks first, nothing built" 1 "missing: dhi.io login" up "$R" DOCKER_CONFIG="$NOLOGIN_CFG" --full
assert "--full missing prerequisite: no build" bash -c "! grep -q 'build' '$STUB_LOG'"

R="$(new_repo badflag)"; : > "$STUB_LOG"
check "unknown flag: usage, exit non-zero" 2 "usage: deploy/dev-up.sh \[--full\]" up "$R" --bogus
assert "unknown flag: nothing changed" no_state_change "$R"

# ---- dev-down -----------------------------------------------------------------------------------
R="$(new_repo down)"; mkdir -p "$R/data"; echo x > "$R/data/file"; : > "$STUB_LOG"
check "stop: keeps volumes and data/" 0 "Volumes and the local storage folder .* are kept" down "$R" "$R/deploy/dev-down.sh"
assert "stop: also stops the app service (profile full)" grep -q -- "--profile full down" "$STUB_LOG"
assert "stop: plain down, no --volumes" bash -c "grep -q ' down\$' '$STUB_LOG' && ! grep -q -- '--volumes' '$STUB_LOG'"
assert "stop: data/ kept" test -f "$R/data/file"

: > "$STUB_LOG"
check "wipe, typed wipe: removes containers, volumes, data/" 0 "wiped" bash -c "echo wipe | PATH='$STUBS:$SAFE_PATH' '$R/deploy/dev-down.sh' --wipe"
assert "wipe: down --volumes --remove-orphans" grep -q "down --volumes --remove-orphans" "$STUB_LOG"
assert "wipe: data/ removed" test ! -e "$R/data"

mkdir -p "$R/data"; echo x > "$R/data/file"; : > "$STUB_LOG"
check "wipe, typed something else: aborted, exit 1" 1 "aborted" bash -c "echo yes | PATH='$STUBS:$SAFE_PATH' '$R/deploy/dev-down.sh' --wipe"
assert "wipe declined: nothing removed" bash -c "test -f '$R/data/file' && ! grep -q 'down' '$STUB_LOG'"
check "wipe, empty input (EOF): aborted, exit 1" 1 "aborted" bash -c "PATH='$STUBS:$SAFE_PATH' '$R/deploy/dev-down.sh' --wipe < /dev/null"
assert "wipe EOF: data/ kept" test -f "$R/data/file"

check "wipe --yes skips the prompt" 0 "wiped" bash -c "PATH='$STUBS:$SAFE_PATH' '$R/deploy/dev-down.sh' --wipe --yes < /dev/null"
assert "wipe --yes: data/ removed" test ! -e "$R/data"
check "--yes without --wipe is refused" 2 "only applies to --wipe" down "$R" "$R/deploy/dev-down.sh" --yes
check "unknown argument is refused" 2 "usage" down "$R" "$R/deploy/dev-down.sh" --nuke

NODOCKER="$TMP/nodocker-stubs"; mkdir -p "$NODOCKER"; cp "$STUBS/docker" "$NODOCKER/"
mkdir -p "$R/data"; : > "$STUB_LOG"
check "Docker down: --wipe fails before prompting, data kept" 1 "Docker is not running" bash -c "echo wipe | PATH='$NODOCKER:$SAFE_PATH' STUB_NO_DAEMON=1 '$R/deploy/dev-down.sh' --wipe"
assert "Docker down: nothing removed" test -d "$R/data"

echo
echo "passed: $pass, failed: $fail"
[ "$fail" -eq 0 ]
