#!/usr/bin/env bash
# shellcheck disable=SC2001,SC2015  # sed prefixes output lines; 'A && pass || fail' is a deliberate test idiom where pass cannot fail
# Tests for deploy/security-scan.sh. Plain bash, no framework.
# Policy cases use fixture Grype reports and a fixture KEV file, so they need no network.
# Live cases run the real pinned tools on fixture SBOMs, lockfiles and a throwaway git repo.
#
#   deploy/tests/security-scan.test.sh
#
# Needs the tools: deploy/security-scan.sh install-tools
# Optional live image scan: LS_SCAN_LIVE_IMAGE=name@sha256:digest deploy/tests/security-scan.test.sh

set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCAN="$HERE/../security-scan.sh"
FIX="$HERE/fixtures"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

export LS_KEV_FILE="$FIX/kev.json"
export LS_SCAN_TODAY="2026-11-06"

pass=0; fail=0; out=""; code=0

# check NAME EXPECTED_EXIT PATTERN COMMAND...   (PATTERN is a grep -E pattern on combined output)
check() {
  local name="$1" want="$2" pattern="$3"; shift 3
  out="$("$@" 2>&1)"; code=$?
  if [ "$code" -eq "$want" ] && echo "$out" | tr "\n" " " | grep -Eq -- "$pattern"; then
    pass=$((pass + 1)); echo "ok   $name"
  else
    fail=$((fail + 1)); echo "FAIL $name (exit $code, wanted $want, pattern: $pattern)"; echo "$out" | sed 's/^/     | /'
  fi
}

# report ID SCORE FIXED [SEVERITY] -> Grype-shaped JSON with one match. SCORE or FIXED may be "null".
report() {
  jq -n --arg id "$1" --argjson score "$2" --arg fixed "$3" --arg sev "${4:-Medium}" '
    { matches: [ { vulnerability: { id: $id, severity: $sev,
                    cvss: (if $score == null then [] else [{ metrics: { baseScore: $score } }] end),
                    fix: { versions: (if $fixed == "null" then [] else [$fixed] end) } },
                  relatedVulnerabilities: [],
                  artifact: { name: "demo-lib", version: "1.0.0" } } ] }'
}

exceptions() { # CVE EXPIRES [omit-mitigation]  -> writes a file, prints its path
  local f="$TMP/exceptions-$RANDOM.yaml"
  { echo "exceptions:"; echo "  - cve: $1"; echo "    reason: no fix published"
    [ "${3:-}" = omit-mitigation ] || echo "    mitigation: feature disabled"
    echo "    expires: $2"; } > "$f"
  echo "$f"
}

NONE="$TMP/none.yaml"; echo 'exceptions: []' > "$NONE"
export LS_EXCEPTIONS_FILE="$NONE"

# ---- policy (offline) ------------------------------------------------------------------------
report CVE-2000-0001 5.0 null > "$TMP/kev.json"
check "KEV finding blocks" 1 "BLOCK.*KEV=yes" "$SCAN" evaluate "$TMP/kev.json"

report CVE-2030-0002 7.5 1.2.3 > "$TMP/high.json"
check "CVSS 7.5 finding blocks" 1 "BLOCK.*CVSS=7.5.*fixed=1.2.3" "$SCAN" evaluate "$TMP/high.json"

report CVE-2030-0003 7.0 1.2.3 > "$TMP/seven.json"
check "CVSS exactly 7.0 blocks" 1 "BLOCK" "$SCAN" evaluate "$TMP/seven.json"

report CVE-2030-0004 5.0 null > "$TMP/low.json"
check "CVSS 5.0 not in KEV passes with a warning" 0 "warn.*CVSS=5.0" "$SCAN" evaluate "$TMP/low.json"

report CVE-2030-0005 null null High > "$TMP/unscored.json"
check "unscored High finding blocks" 1 "BLOCK" "$SCAN" evaluate "$TMP/unscored.json"

report CVE-2030-0006 9.8 null Critical > "$TMP/nofix.json"
check "no exception, no fix: blocks" 1 "BLOCK" "$SCAN" evaluate "$TMP/nofix.json"

LS_EXCEPTIONS_FILE="$(exceptions CVE-2030-0006 2026-11-16)" \
  check "valid exception passes" 0 "EXCEPTED.*exception until 2026-11-16" "$SCAN" evaluate "$TMP/nofix.json"

LS_EXCEPTIONS_FILE="$(exceptions CVE-2030-0006 2026-11-05)" \
  check "expired exception blocks" 1 "CVE-2030-0006: EXPIRED on 2026-11-05" "$SCAN" evaluate "$TMP/nofix.json"

LS_EXCEPTIONS_FILE="$(exceptions CVE-2030-0006 2026-12-30)" \
  check "exception more than 30 days away blocks" 1 "more than 30 days away" "$SCAN" evaluate "$TMP/nofix.json"

LS_EXCEPTIONS_FILE="$(exceptions CVE-2030-0006 2026-11-16 omit-mitigation)" \
  check "exception without mitigation blocks" 1 "missing mitigation" "$SCAN" evaluate "$TMP/nofix.json"

LS_EXCEPTIONS_FILE="$(exceptions CVE-2030-0006 11/16/2026)" \
  check "exception with malformed date blocks" 1 "malformed expiry" "$SCAN" evaluate "$TMP/nofix.json"

printf 'exceptions:\n  - cve: x\n    nonsense\n' > "$TMP/garbled.yaml"
LS_EXCEPTIONS_FILE="$TMP/garbled.yaml" \
  check "unparseable exceptions file blocks" 1 "cannot parse" "$SCAN" evaluate "$TMP/nofix.json"

LS_EXCEPTIONS_FILE="$(exceptions CVE-2030-0002 2026-11-16)" \
  check "exception ignored when a fix exists" 1 "BLOCK.*exception ignored" "$SCAN" evaluate "$TMP/high.json"

LS_IMAGE_IS_LATEST=true LS_EXCEPTIONS_FILE="$(exceptions CVE-2030-0002 2026-11-16)" \
  check "image: library fix not in the latest image, valid exception passes" 0 "EXCEPTED.*library fix not in the latest image|EXCEPTED.*exception until" "$SCAN" evaluate "$TMP/high.json"
LS_IMAGE_IS_LATEST=true check "image: library fix not in the latest image, no exception still blocks" 1 "BLOCK" "$SCAN" evaluate "$TMP/high.json"
LS_IMAGE_IS_LATEST=false LS_EXCEPTIONS_FILE="$(exceptions CVE-2030-0002 2026-11-16)" \
  check "image: a newer image exists, exception ignored" 1 "BLOCK.*exception ignored" "$SCAN" evaluate "$TMP/high.json"

# image_is_latest: the pinned digest must equal the tag's current digest; any doubt is "not latest".
printf 'images:\n  - name: acme/tool\n    tag: "1.2"\n    digest: sha256:aaa\n' > "$TMP/latest-images.yaml"
printf '#!/bin/sh\necho sha256:aaa\n' > "$TMP/digest-same.sh"; printf '#!/bin/sh\necho sha256:bbb\n' > "$TMP/digest-new.sh"; printf '#!/bin/sh\nexit 1\n' > "$TMP/digest-fail.sh"
chmod +x "$TMP"/digest-*.sh
latest_check() { # CMD -> prints yes or no
  ( export ROOT="$HERE/../.." LS_IMAGES_FILE="$TMP/latest-images.yaml" LS_LATEST_DIGEST_CMD="$1"
    eval "$(awk '/^image_is_latest\(\) \{/,/^}/; /^latest_digest\(\) \{/,/^}/' "$SCAN")"
    if image_is_latest "acme/tool@sha256:aaa"; then echo yes; else echo no; fi )
}
check "image_is_latest: same digest" 0 "yes" latest_check "$TMP/digest-same.sh"
check "image_is_latest: tag moved on" 0 "no" latest_check "$TMP/digest-new.sh"
check "image_is_latest: lookup failed, fails closed" 0 "no" latest_check "$TMP/digest-fail.sh"

report GHSA-aaaa-bbbb-cccc 5.0 null | jq '.matches[0].relatedVulnerabilities = [{id: "CVE-2000-0001"}]' > "$TMP/alias.json"
check "KEV match through a GHSA alias blocks" 1 "BLOCK.*CVE-2000-0001.*KEV=yes" "$SCAN" evaluate "$TMP/alias.json"

report CVE-2030-0007 9.1 4.5.6 | jq '.matches[0].artifact.name = "left-pad"' > "$TMP/npm.json"
check "vulnerable npm package blocks, named by target" 1 "FAIL\] frontend.*BLOCK  left-pad" "$SCAN" evaluate "$TMP/npm.json" frontend

check "vulnerable image blocks, named by image" 1 "FAIL\] image dhi.io/x@sha256:abc.*BLOCK" "$SCAN" evaluate "$TMP/high.json" "image dhi.io/x@sha256:abc"

report CVE-2030-0008 null null | jq '.matches[0].vulnerability.cvss = []
    | .matches[0].relatedVulnerabilities = [{id: "CVE-2030-0008", cvss: [{metrics: {baseScore: 8.0}}]}]' > "$TMP/related.json"
check "score only on a related vulnerability still blocks" 1 "BLOCK.*CVSS=8" "$SCAN" evaluate "$TMP/related.json"

jq -s '{matches: (.[0].matches + .[1].matches)}' "$TMP/low.json" <(report CVE-2030-0004 8.8 9.9.9) \
  | jq '.matches[0].vulnerability.id = "GHSA-dup-one-aaaa" | .matches[0].relatedVulnerabilities = [{id: "CVE-2030-0004"}]' > "$TMP/dup.json"
check "duplicate matches keep the blocking one" 1 "BLOCK.*CVE-2030-0004" "$SCAN" evaluate "$TMP/dup.json"

LS_EXCEPTIONS_FILE="$(exceptions CVE-2030-0006 2026-13-45)" \
  check "exception with an impossible date blocks with a message" 1 "not a real date" "$SCAN" evaluate "$TMP/nofix.json"

printf 'exceptions:\n- cve: CVE-2030-0006\n  reason: no fix published\n  mitigation: feature disabled\n  expires: 2026-11-16\n' > "$TMP/unindented.yaml"
LS_EXCEPTIONS_FILE="$TMP/unindented.yaml" \
  check "unindented list items in exceptions.yaml are accepted" 0 "EXCEPTED" "$SCAN" evaluate "$TMP/nofix.json"

# ---- KEV cache (offline) ---------------------------------------------------------------------
mkdir -p "$TMP/empty-root"
env -u LS_KEV_FILE LS_ROOT="$TMP/empty-root" LS_KEV_URL="http://127.0.0.1:1/kev.json" \
  "$SCAN" evaluate "$TMP/low.json" > "$TMP/o.txt" 2>&1; code=$?
out="$(cat "$TMP/o.txt")"
if [ "$code" -eq 1 ] && echo "$out" | grep -q "no cached copy"; then pass=$((pass + 1)); echo "ok   no KEV cache and no network fails with the reason"
else fail=$((fail + 1)); echo "FAIL no KEV cache and no network fails with the reason (exit $code)"; echo "$out" | sed 's/^/     | /'; fi

mkdir -p "$TMP/empty-root/build/security/cache"; cp "$FIX/kev.json" "$TMP/empty-root/build/security/cache/kev.json"
touch -t 202001010000 "$TMP/empty-root/build/security/cache/kev.json"
env -u LS_KEV_FILE LS_ROOT="$TMP/empty-root" LS_KEV_URL="http://127.0.0.1:1/kev.json" \
  "$SCAN" evaluate "$TMP/low.json" > "$TMP/o.txt" 2>&1; code=$?
out="$(cat "$TMP/o.txt")"
if [ "$code" -eq 0 ] && echo "$out" | grep -q "WARNING: could not refresh"; then pass=$((pass + 1)); echo "ok   stale KEV cache is used with a warning when offline"
else fail=$((fail + 1)); echo "FAIL stale KEV cache is used with a warning when offline (exit $code)"; echo "$out" | sed 's/^/     | /'; fi

cp "$FIX/kev.json" "$TMP/empty-root/build/security/cache/kev.json"
env -u LS_KEV_FILE LS_ROOT="$TMP/empty-root" LS_KEV_URL="http://127.0.0.1:1/kev.json" \
  "$SCAN" evaluate "$TMP/low.json" > "$TMP/o.txt" 2>&1; code=$?
out="$(cat "$TMP/o.txt")"
if [ "$code" -eq 0 ] && ! echo "$out" | grep -q "WARNING"; then pass=$((pass + 1)); echo "ok   a KEV cache under a day old is used without touching the network"
else fail=$((fail + 1)); echo "FAIL a KEV cache under a day old is used without touching the network (exit $code)"; echo "$out" | sed 's/^/     | /'; fi

echo '{"vulnerabilities": []}' > "$TMP/empty-root/build/security/cache/kev.json"
env -u LS_KEV_FILE LS_ROOT="$TMP/empty-root" LS_KEV_URL="http://127.0.0.1:1/kev.json" \
  "$SCAN" evaluate "$TMP/low.json" > "$TMP/o.txt" 2>&1; code=$?
out="$(cat "$TMP/o.txt")"
if [ "$code" -eq 1 ] && echo "$out" | grep -q "no cached copy"; then pass=$((pass + 1)); echo "ok   an empty or corrupt KEV cache is not trusted"
else fail=$((fail + 1)); echo "FAIL an empty or corrupt KEV cache is not trusted (exit $code)"; echo "$out" | sed 's/^/     | /'; fi

# ---- targets that need no tools to fail ------------------------------------------------------
cat > "$TMP/images.yaml" <<'EOF'
images:
  - name: dhi.io/postgres
    source: dhi
    tag: "18"
    digest: sha256:aaa
  - name: quay.io/keycloak/keycloak
    source: other
    tag: "26.8.1"
    digest: sha256:bbb
EOF
check "images manifest parsing" 0 "dhi.io/postgres@sha256:aaa" env LS_IMAGES_FILE="$TMP/images.yaml" "$SCAN" images

printf 'images:\n  - name: dhi.io/postgres\n    tag: "18"\n  - name: quay.io/keycloak/keycloak\n    digest: sha256:bbb\n' > "$TMP/images-nodigest.yaml"
check "an image entry without a digest is an error, never skipped" 1 "dhi.io/postgres has no digest" env LS_IMAGES_FILE="$TMP/images-nodigest.yaml" "$SCAN" images

cat > "$TMP/images-deferred.yaml" <<'EOF'
images:
  - name: dhi.io/postgres
    source: dhi
    tag: "18"
    digest: sha256:aaa
  - name: ghcr.io/example/p2-service
    source: other
    tag: "1"
    digest: sha256:ccc
    reason: not running yet
    scan: deferred
EOF
check "a scan: deferred image is skipped with a visible notice" 0 "p2-service is deferred" env LS_IMAGES_FILE="$TMP/images-deferred.yaml" "$SCAN" images
out="$(LS_IMAGES_FILE="$TMP/images-deferred.yaml" "$SCAN" images 2>/dev/null)"
if echo "$out" | grep -q "dhi.io/postgres@sha256:aaa"; then pass=$((pass + 1)); echo "ok   the non-deferred image is still listed"; else fail=$((fail + 1)); echo "FAIL the non-deferred image is still listed"; fi
if ! echo "$out" | grep -q p2-service; then pass=$((pass + 1)); echo "ok   a deferred image is not in the scanned list"; else fail=$((fail + 1)); echo "FAIL a deferred image is not in the scanned list"; fi
printf 'images:\n  - name: a/b\n    scan: deferred\n' > "$TMP/images-deferred-nodigest.yaml"
check "a deferred image without a digest is still an error" 1 "a/b has no digest" env LS_IMAGES_FILE="$TMP/images-deferred-nodigest.yaml" "$SCAN" images

# ---- live (real pinned tools) ----------------------------------------------------------------
if env LS_ROOT="$TMP/empty-root" "$SCAN" scan images 2>&1 | grep -q "missing tool"; then
  fail=$((fail + 1)); echo "FAIL live cases need the tools. Run: deploy/security-scan.sh install-tools"
else
  new_root() { local r="$TMP/root-$RANDOM"; mkdir -p "$r"; echo "$r"; }

  check "tool missing gives one install step" 1 "Run: deploy/security-scan.sh install-tools" \
    env LS_TOOLS_DIR="$TMP/no-tools" "$SCAN" scan images

  R="$(new_root)"; mkdir -p "$R/deploy"; echo 'services: {}' > "$R/deploy/compose.yaml"
  check "compose file without images.yaml blocks" 1 "deploy/images.yaml does not" env LS_ROOT="$R" "$SCAN" scan images

  R="$(new_root)"; mkdir -p "$R/deploy"
  check "no compose, no manifest: images skipped with a notice" 0 "SKIP\] images" env LS_ROOT="$R" "$SCAN" scan images

  R="$(new_root)"; mkdir -p "$R/frontend"; echo '{"name":"x","dependencies":{}}' > "$R/frontend/package.json"
  check "missing lockfile blocks" 1 "package-lock.json is missing" env LS_ROOT="$R" "$SCAN" scan frontend

  R="$(new_root)"; mkdir -p "$R/frontend"; cp "$FIX/npm-vulnerable/"* "$R/frontend/"
  jq '.dependencies.lodash = "4.17.21"' "$R/frontend/package.json" > "$R/p.json" && mv "$R/p.json" "$R/frontend/package.json"
  check "lockfile out of step with package.json blocks" 1 "out of step" env LS_ROOT="$R" "$SCAN" scan frontend

  R="$(new_root)"; mkdir -p "$R/frontend"; cp "$FIX/npm-vulnerable/"* "$R/frontend/"
  check "live: vulnerable npm package (lodash 4.17.15) blocks" 1 "FAIL\] frontend.*BLOCK  lodash 4.17.15" env LS_ROOT="$R" "$SCAN" scan frontend

  R="$(new_root)"; mkdir -p "$R/backend/target"; cp "$FIX/backend-log4j/pom.xml" "$R/backend/"
  echo '{"bomFormat":"CycloneDX","specVersion":"1.6","version":1,"components":[]}' > "$R/backend/target/bom.json"
  check "empty SBOM blocks" 1 "zero components" env LS_ROOT="$R" "$SCAN" scan backend

  R="$(new_root)"; mkdir -p "$R/backend/target"; cp "$FIX/backend-log4j/pom.xml" "$R/backend/"
  touch -t 202001010000 "$R/backend/pom.xml"; cp "$FIX/backend-log4j/target/bom.json" "$R/backend/target/bom.json"
  check "live: log4j-core 2.14.1 SBOM blocks as KEV" 1 "BLOCK  log4j-core 2.14.1  CVE-2021-44228  KEV=yes" env LS_ROOT="$R" "$SCAN" scan backend

  R="$(new_root)"; mkdir -p "$R/frontend"; cp "$FIX/npm-dev-vulnerable/"* "$R/frontend/"
  check "live: a vulnerable devDependency blocks (dev packages are scanned)" 1 "BLOCK  lodash 4.17.15" env LS_ROOT="$R" "$SCAN" scan frontend

  # SBOM regeneration, with a stub mvnw that records each call and writes a clean SBOM.
  stub_backend() { # ROOT -> backend with stub mvnw and the pom (older than the SBOM)
    mkdir -p "$1/backend/target"; cp "$FIX/backend-clean/pom.xml" "$1/backend/"
    printf '#!/usr/bin/env bash\necho "$@" >> "%s/mvnw.log"\nmkdir -p target\ncp "%s" target/bom.json\n' "$1" "$FIX/backend-clean/target/bom.json" > "$1/backend/mvnw"
    chmod +x "$1/backend/mvnw"
  }
  R="$(new_root)"; stub_backend "$R"
  check "missing SBOM triggers regeneration" 0 "PASS\] backend" env LS_ROOT="$R" "$SCAN" scan backend
  [ -s "$R/mvnw.log" ] && { pass=$((pass + 1)); echo "ok   ... and mvnw was called"; } || { fail=$((fail + 1)); echo "FAIL missing SBOM did not call mvnw"; }

  R="$(new_root)"; stub_backend "$R"; cp "$FIX/backend-clean/target/bom.json" "$R/backend/target/bom.json"
  touch -t 202001010000 "$R/backend/pom.xml"
  check "an up-to-date SBOM is reused" 0 "PASS\] backend" env LS_ROOT="$R" "$SCAN" scan backend
  [ ! -e "$R/mvnw.log" ] && { pass=$((pass + 1)); echo "ok   ... and mvnw was not called"; } || { fail=$((fail + 1)); echo "FAIL an up-to-date SBOM still called mvnw"; }

  R="$(new_root)"; stub_backend "$R"; cp "$FIX/backend-clean/target/bom.json" "$R/backend/target/bom.json"
  touch -t 202001010000 "$R/backend/target/bom.json"
  check "a pom newer than the SBOM triggers regeneration" 0 "PASS\] backend" env LS_ROOT="$R" "$SCAN" scan backend
  [ -s "$R/mvnw.log" ] && { pass=$((pass + 1)); echo "ok   ... and mvnw was called"; } || { fail=$((fail + 1)); echo "FAIL a newer pom did not call mvnw"; }

  R="$(new_root)"; git -C "$R" init -q; stub_backend "$R"; cp "$FIX/backend-clean/target/bom.json" "$R/backend/target/bom.json"
  touch -t 202001010000 "$R/backend/pom.xml"; git -C "$R" add backend/pom.xml
  check "a staged pom triggers regeneration" 0 "PASS\] backend" env LS_ROOT="$R" "$SCAN" scan backend
  [ -s "$R/mvnw.log" ] && { pass=$((pass + 1)); echo "ok   ... and mvnw was called"; } || { fail=$((fail + 1)); echo "FAIL a staged pom did not call mvnw"; }

  # The full run (the path the hook takes), on a root that is clean in every target.
  clean_root() {
    local r; r="$(new_root)"; git -C "$r" init -q; git -C "$r" config user.email t@example.com; git -C "$r" config user.name t
    mkdir -p "$r/backend/target" "$r/frontend" "$r/deploy"
    cp "$FIX/backend-clean/pom.xml" "$r/backend/"; cp "$FIX/backend-clean/target/bom.json" "$r/backend/target/"
    touch -t 202001010000 "$r/backend/pom.xml"
    cp "$FIX/npm-clean/"* "$r/frontend/"
    echo "$r"
  }
  R="$(clean_root)"
  check "run: every target clean passes and lists all targets" 0 "secrets.*backend.*frontend.*images.*RESULT: PASS" env LS_ROOT="$R" "$SCAN" run
  [ -s "$R/build/security/report.json" ] && jq -e '.targets | length >= 3' "$R/build/security/report.json" >/dev/null \
    && { pass=$((pass + 1)); echo "ok   ... and report.json lists the targets"; } || { fail=$((fail + 1)); echo "FAIL report.json missing or incomplete"; }

  R="$(clean_root)"; cp "$FIX/npm-vulnerable/"* "$R/frontend/"
  check "run: one vulnerable frontend fails the whole run" 1 "FAIL\] frontend.*RESULT: FAIL" env LS_ROOT="$R" "$SCAN" run

  R="$(clean_root)"; cp "$FIX/backend-log4j/target/bom.json" "$R/backend/target/bom.json"
  check "run: one vulnerable backend fails the whole run" 1 "FAIL\] backend.*RESULT: FAIL" env LS_ROOT="$R" "$SCAN" run

  R="$(clean_root)"; echo 'services: {}' > "$R/deploy/compose.yaml"
  check "run: a compose file without a manifest fails the whole run" 1 "FAIL\] images.*RESULT: FAIL" env LS_ROOT="$R" "$SCAN" run

  R="$(clean_root)"; printf 'aws_access_key_id = %s\naws_secret_access_key = %s\n' "AKIA""IOSFODNN7EXAMPLQ" "wJalrXUtnFEMI/K7MDENG/bPxRfiCYzZpLmNqRsT" > "$R/config.txt"
  git -C "$R" add config.txt
  check "run: a staged secret fails the whole run" 1 "FAIL\] secrets.*RESULT: FAIL" env LS_ROOT="$R" "$SCAN" run

  R="$(clean_root)"; cp "$FIX/backend-clean/pom.xml" "$R/backend/pom.xml"
  LS_EXCEPTIONS_FILE="$(exceptions CVE-2030-0006 2026-11-05)" \
    check "run: an expired exception fails the whole run" 1 "FAIL\] exceptions.*EXPIRED.*RESULT: FAIL" env LS_ROOT="$R" "$SCAN" run

  R="$(clean_root)"; git -C "$R" add frontend/package-lock.json; echo " " >> "$R/frontend/package-lock.json"
  check "run: a partly staged lockfile fails" 1 "package-lock.json is partly staged" env LS_ROOT="$R" "$SCAN" run

  R="$(clean_root)"; mkdir -p "$R/build/security"; echo "RESULT: PASS" > "$R/build/security/summary.txt"
  check "run: a failed run does not leave an old PASS summary" 1 "missing tool" env LS_ROOT="$R" LS_TOOLS_DIR="$TMP/no-tools" "$SCAN" run
  if grep -q "RESULT: PASS" "$R/build/security/summary.txt" 2>/dev/null; then fail=$((fail + 1)); echo "FAIL old PASS summary survived a failed run"; else pass=$((pass + 1)); echo "ok   ... and the old summary is gone"; fi

  # The real git hook: a throwaway repo with the hook enabled, committing through git itself.
  H="$(new_root)"; git -C "$H" init -q; git -C "$H" config user.email t@example.com; git -C "$H" config user.name t
  mkdir -p "$H/deploy" "$H/.githooks" "$H/backend/target" "$H/frontend"
  cp "$HERE/../security-scan.sh" "$HERE/../security-policy.jq" "$HERE/../gitleaks.toml" "$H/deploy/"
  cp "$HERE/../../.githooks/pre-commit" "$H/.githooks/"; mkdir -p "$H/security"; echo 'exceptions: []' > "$H/security/exceptions.yaml"
  cp "$FIX/backend-clean/pom.xml" "$H/backend/"; cp "$FIX/backend-clean/target/bom.json" "$H/backend/target/"
  touch -t 202001010000 "$H/backend/pom.xml"; cp "$FIX/npm-clean/"* "$H/frontend/"
  git -C "$H" config core.hooksPath .githooks
  stub_backend "$H"
  TOOLS_REAL="$(cd "$HERE/../.." && pwd)/.tools"
  git -C "$H" add -A
  check "hook: a clean commit goes through" 0 "RESULT: PASS" env LS_TOOLS_DIR="$TOOLS_REAL" LS_KEV_FILE="$LS_KEV_FILE" git -C "$H" commit -m "clean"
  printf 'aws_access_key_id = %s\naws_secret_access_key = %s\n' "AKIA""IOSFODNN7EXAMPLQ" "wJalrXUtnFEMI/K7MDENG/bPxRfiCYzZpLmNqRsT" > "$H/config.txt"
  git -C "$H" add config.txt
  before="$(git -C "$H" rev-parse HEAD)"
  check "hook: a commit with a staged secret is blocked" 1 "RESULT: FAIL" env LS_TOOLS_DIR="$TOOLS_REAL" LS_KEV_FILE="$LS_KEV_FILE" git -C "$H" commit -m "secret"
  [ "$(git -C "$H" rev-parse HEAD)" = "$before" ] && { pass=$((pass + 1)); echo "ok   ... and HEAD did not move"; } || { fail=$((fail + 1)); echo "FAIL the blocked commit was created"; }

  if [ -n "${LS_SCAN_LIVE_IMAGE:-}" ]; then
    R="$(new_root)"; mkdir -p "$R/deploy"
    printf 'images:\n  - name: %s\n    digest: %s\n' "${LS_SCAN_LIVE_IMAGE%@*}" "${LS_SCAN_LIVE_IMAGE#*@}" > "$R/deploy/images.yaml"
    check "live image scan reports the image (LS_SCAN_LIVE_IMAGE)" 0 "image ${LS_SCAN_LIVE_IMAGE%@*}.*components" env LS_ROOT="$R" "$SCAN" scan images
  fi

  # Staged fake secret in a throwaway repository. The key is assembled here, never stored.
  R="$(new_root)"; git -C "$R" init -q; git -C "$R" config user.email t@example.com; git -C "$R" config user.name t
  echo "clean" > "$R/readme.txt"; git -C "$R" add readme.txt
  check "staged clean file passes" 0 "PASS\] secrets" env LS_ROOT="$R" "$SCAN" secrets
  KEY="AKIA""IOSFODNN7EXAMPLQ"
  printf 'aws_access_key_id = %s\naws_secret_access_key = %s\n' "$KEY" "wJalrXUtnFEMI/K7MDENG/bPxRfiCYzZpLmNqRsT" > "$R/config.txt"
  git -C "$R" add config.txt
  check "staged fake secret blocks" 1 "FAIL\] secrets" env LS_ROOT="$R" "$SCAN" secrets
  out="$(LS_ROOT="$R" "$SCAN" secrets 2>&1)"
  if echo "$out" | grep -q "wJalrXUtnFEMI"; then fail=$((fail + 1)); echo "FAIL the secret value leaked into the output"; else pass=$((pass + 1)); echo "ok   no secret value in the output"; fi

  # History scope (CI): nothing staged, the secret sits in a commit.
  R="$(new_root)"; git -C "$R" init -q; git -C "$R" config user.email t@example.com; git -C "$R" config user.name t
  echo "clean" > "$R/readme.txt"; git -C "$R" add readme.txt; git -C "$R" commit -q -m clean
  check "history scope: clean history passes" 0 "PASS\] secrets: commit history clean" env LS_ROOT="$R" LS_SECRETS_SCOPE=history "$SCAN" secrets
  printf 'aws_access_key_id = %s\naws_secret_access_key = %s\n' "$KEY" "wJalrXUtnFEMI/K7MDENG/bPxRfiCYzZpLmNqRsT" > "$R/config.txt"
  git -C "$R" add config.txt; git -C "$R" commit -q -m leak
  check "history scope: a committed secret blocks" 1 "FAIL\] secrets: gitleaks found a secret in the commit history" env LS_ROOT="$R" LS_SECRETS_SCOPE=history "$SCAN" secrets
  check "an unknown secrets scope is refused, not treated as staged" 1 "LS_SECRETS_SCOPE must be staged or history" env LS_ROOT="$R" LS_SECRETS_SCOPE=History "$SCAN" secrets
  git clone -q --depth 1 "file://$R" "$R-shallow" 2>/dev/null
  check "history scope refuses a shallow clone" 1 "needs the full history" env LS_ROOT="$R-shallow" LS_SECRETS_SCOPE=history "$SCAN" secrets
  check "staged scope (default) ignores a committed secret" 0 "PASS\] secrets: staged changes clean" env LS_ROOT="$R" "$SCAN" secrets
fi

# ---- scan app-image (stub docker and grype, no real Docker) ----
AI_STUBS="$TMP/ai-stubs"; AI_TOOLS="$TMP/ai-tools"; AI_ROOT="$TMP/ai-root"
mkdir -p "$AI_STUBS" "$AI_ROOT"
cat > "$AI_STUBS/docker" <<'STUB'
#!/usr/bin/env bash
# only `docker image inspect NAME` is used; succeeds when NAME is STUB_IMAGE
[ "$1 $2" = "image inspect" ] && [ "$3" = "${STUB_IMAGE:-}" ]
STUB
chmod +x "$AI_STUBS/docker"
for t in grype:GRYPE syft:SYFT gitleaks:GITLEAKS; do
  n="${t%%:*}"; v="$(grep -E "^${t##*:}_VERSION=" "$SCAN" | head -n 1)"; v="${v#*=}"
  mkdir -p "$AI_TOOLS/$n-$v"; printf '#!/bin/sh\nexit 0\n' > "$AI_TOOLS/$n-$v/$n"; chmod +x "$AI_TOOLS/$n-$v/$n"
  if [ "$n" = grype ]; then
    cat > "$AI_TOOLS/$n-$v/$n" <<'STUB'
#!/bin/sh
[ -z "$STUB_GRYPE_FAIL" ] || exit 1
cat "$STUB_GRYPE_REPORT"
STUB
  fi
done
echo '{"matches":[]}' > "$TMP/ai-clean.json"
app_image() { env PATH="$AI_STUBS:$PATH" LS_ROOT="$AI_ROOT" LS_TOOLS_DIR="$AI_TOOLS" LS_APP_IMAGE=demo-app STUB_GRYPE_REPORT="$TMP/ai-clean.json" "$@" "$SCAN" scan app-image; }
check "app-image: missing local image fails and says how to build it" 1 "\[FAIL\] app-image.*dev-up.sh --full" app_image STUB_IMAGE=other
check "app-image: grype failure fails" 1 "\[FAIL\] app-image.*could not scan" app_image STUB_IMAGE=demo-app STUB_GRYPE_FAIL=1
check "app-image: blocking finding fails" 1 "BLOCK.*CVE-2030-0002" app_image STUB_IMAGE=demo-app STUB_GRYPE_REPORT="$TMP/high.json"
check "app-image: clean report passes" 0 "PASS\] app-image demo-app" app_image STUB_IMAGE=demo-app

echo
echo "$pass passed, $fail failed"
[ "$fail" -eq 0 ]
