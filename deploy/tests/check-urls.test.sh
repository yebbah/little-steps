#!/usr/bin/env bash
# Tests for deploy/check-urls.sh. Plain bash, no framework, no network: stub curl and nc on a temp PATH.
#   deploy/tests/check-urls.test.sh

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

STUBS="$TMP/stubs"; mkdir -p "$STUBS"
cat > "$STUBS/curl" <<'STUB'
#!/usr/bin/env bash
# args: ... -o FILE -w FORMAT ... URL ; STUB_DOWN = substring of a URL that refuses, STUB_BAD_ISSUER, STUB_APP_UP
out=""; url=""
while [ $# -gt 0 ]; do
  case "$1" in -o) out="$2"; shift ;; -w|--max-time) shift ;; -*) ;; *) url="$1" ;; esac
  shift
done
echo "curl $url" >> "$STUB_LOG"
if [ -n "${STUB_DOWN:-}" ] && [[ "$url" == *"$STUB_DOWN"* ]]; then printf '000'; exit 7; fi
case "$url" in
  *:8080*) [ -n "${STUB_APP_UP:-}" ] || exit 7; exit 0 ;;
  *openid-configuration) body="{\"issuer\": \"http://localhost:8180/realms/${STUB_BAD_ISSUER:-littlesteps}\"}" ;;
  *api/v1/info) body='{"Version":"v1.0"}' ;;
  *) body="<html>ok</html>" ;;
esac
[ -z "$out" ] || printf '%s' "$body" > "$out"
printf '200'
STUB
cat > "$STUBS/nc" <<'STUB'
#!/usr/bin/env bash
echo "nc $*" >> "$STUB_LOG"
[ -z "${STUB_NC_FAIL:-}" ] || exit 1
STUB
chmod +x "$STUBS"/*
export STUB_LOG="$TMP/calls.log"; : > "$STUB_LOG"

new_repo() { local r="$TMP/$1"; mkdir -p "$r/deploy"; cp "$DEPLOY"/check-urls.sh "$DEPLOY"/local.env.example "$r/deploy/"; echo "$r"; }
run() { local r="$1"; shift; ( cd "$TMP" && env PATH="$STUBS:/usr/bin:/bin" "$@" "$r/deploy/check-urls.sh" ); }

R="$(new_repo all)"
check "all up: every URL passes, app not running, exit 0" 0 "PASS.*admin.*PASS.*metadata.*PASS.*account.*PASS.*inbox.*PASS.*Mailpit API.*PASS.*PostgreSQL.*INFO.*not running.*all required URLs passed" run "$R"
check "app answering is reported, not required" 0 "INFO.*8080 answers" run "$R" STUB_APP_UP=1
check "Mailpit down: FAIL names the URL, exit 1" 1 "FAIL.*Mailpit inbox.*localhost:8025.*FAIL.*Mailpit API.*2 required check" run "$R" STUB_DOWN=8025
check "wrong issuer: metadata FAIL, exit 1" 1 "FAIL.*realm metadata.*unexpected body.*1 required check" run "$R" STUB_BAD_ISSUER=other
check "PostgreSQL port closed: FAIL, exit 1" 1 "FAIL.*PostgreSQL port.*connection refused" run "$R" STUB_NC_FAIL=1

: > "$STUB_LOG"
{ cat "$R/deploy/local.env.example"; printf 'LS_KEYCLOAK_PORT=9180\r\nLS_MAILPIT_UI_PORT="9025" # ui\r\nLS_POSTGRES_PORT=6543\r\n'; } > "$R/deploy/local.env"
check "ports come from local.env (CR, quotes, comment handled)" 0 "9180/admin.*9025.*localhost:6543" run "$R"
no_secret() { # the output of a run must not contain any placeholder password from the example
  local out; out="$(run "$R" 2>&1)"; ! printf '%s' "$out" | grep -q 'change-me'
}
check "no password or secret in the output" 0 "" bash -c "$(declare -f run no_secret); R='$R' TMP='$TMP' STUBS='$STUBS' STUB_LOG='$STUB_LOG'; no_secret"

MINBIN="$TMP/minbin"; mkdir -p "$MINBIN"
for t in bash env grep tail tr mktemp rm dirname basename cat; do ln -sf "$(command -v "$t")" "$MINBIN/$t"; done
ln -sf "$STUBS/curl" "$MINBIN/curl"
check "nc missing: required check fails clearly" 1 "nc not found" env PATH="$MINBIN" STUB_LOG="$STUB_LOG" "$R/deploy/check-urls.sh"

echo; echo "passed: $pass, failed: $fail"
[ "$fail" -eq 0 ]
