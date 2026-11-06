#!/usr/bin/env bash
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

report GHSA-aaaa-bbbb-cccc 5.0 null | jq '.matches[0].relatedVulnerabilities = [{id: "CVE-2000-0001"}]' > "$TMP/alias.json"
check "KEV match through a GHSA alias blocks" 1 "BLOCK.*CVE-2000-0001.*KEV=yes" "$SCAN" evaluate "$TMP/alias.json"

report CVE-2030-0007 9.1 4.5.6 | jq '.matches[0].artifact.name = "left-pad"' > "$TMP/npm.json"
check "vulnerable npm package blocks, named by target" 1 "FAIL\] frontend.*BLOCK  left-pad" "$SCAN" evaluate "$TMP/npm.json" frontend

check "vulnerable image blocks, named by image" 1 "FAIL\] image dhi.io/x@sha256:abc.*BLOCK" "$SCAN" evaluate "$TMP/high.json" "image dhi.io/x@sha256:abc"

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
  sleep 1; cp "$FIX/backend-log4j/target/bom.json" "$R/backend/target/bom.json"
  check "live: log4j-core 2.14.1 SBOM blocks as KEV" 1 "BLOCK  log4j-core 2.14.1  CVE-2021-44228  KEV=yes" env LS_ROOT="$R" "$SCAN" scan backend

  if [ -n "${LS_SCAN_LIVE_IMAGE:-}" ]; then
    R="$(new_root)"; mkdir -p "$R/deploy"
    printf 'images:\n  - name: %s\n    digest: %s\n' "${LS_SCAN_LIVE_IMAGE%@*}" "${LS_SCAN_LIVE_IMAGE#*@}" > "$R/deploy/images.yaml"
    check "live image scan reports the image (LS_SCAN_LIVE_IMAGE)" "$(echo 0)" "image ${LS_SCAN_LIVE_IMAGE%@*}.*components" env LS_ROOT="$R" "$SCAN" scan images
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
fi

echo
echo "$pass passed, $fail failed"
[ "$fail" -eq 0 ]
