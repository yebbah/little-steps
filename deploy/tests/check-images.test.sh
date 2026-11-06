#!/usr/bin/env bash
# Tests for deploy/check-images.sh. Plain bash, no framework, no network.
#   deploy/tests/check-images.test.sh

set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHECK="$HERE/../check-images.sh"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

pass=0; fail=0
# check NAME EXPECTED_EXIT PATTERN COMMAND...
check() {
  local name="$1" want="$2" pattern="$3"; shift 3
  local out code
  out="$("$@" 2>&1)"; code=$?
  if [ "$code" -eq "$want" ] && echo "$out" | tr "\n" " " | grep -Eq -- "$pattern"; then
    pass=$((pass + 1)); echo "ok   $name"
  else
    fail=$((fail + 1)); echo "FAIL $name (exit $code, wanted $want, pattern: $pattern)"; echo "$out" | sed 's/^/     | /'
  fi
}

D1=sha256:1111111111111111111111111111111111111111111111111111111111111111
D2=sha256:2222222222222222222222222222222222222222222222222222222222222222

write_manifest() { # FILE ; entries via heredoc on stdin
  { echo "images:"; cat; } > "$1"
}
GOOD_MANIFEST="$TMP/good-images.yaml"
write_manifest "$GOOD_MANIFEST" <<EOT
  - name: dhi.io/postgres
    source: dhi
    tag: "18"
    digest: $D1
  - name: axllent/mailpit
    source: other
    tag: "v1.33.0"
    digest: $D2
    reason: Not in the DHI catalog.
  - name: ghcr.io/data-privacy-stack/presidio-analyzer
    source: other
    tag: "2.2.366"
    digest: $D2
    reason: Not in the DHI catalog.
EOT
GOOD_COMPOSE="$TMP/good-compose.yaml"
cat > "$GOOD_COMPOSE" <<EOT
services:
  postgres:
    image: dhi.io/postgres:18@$D1
  mailpit:
    image: axllent/mailpit:v1.33.0@$D2
  # presidio-analyzer:
  #   image: ghcr.io/data-privacy-stack/presidio-analyzer:2.2.366@$D2
EOT

run() { env LS_COMPOSE_FILE="$1" LS_IMAGES_FILE="$2" "$CHECK"; }

check "real compose and manifest agree" 0 "OK" "$CHECK"
check "matching refs pass" 0 "OK" run "$GOOD_COMPOSE" "$GOOD_MANIFEST"

sed "s/postgres:18@$D1/postgres:18@$D2/" "$GOOD_COMPOSE" > "$TMP/c-drift.yaml"
check "digest drift fails and names the image and both digests" 1 "digest mismatch for dhi.io/postgres.*$D2.*$D1" run "$TMP/c-drift.yaml" "$GOOD_MANIFEST"

sed "s/postgres:18@/postgres:17@/" "$GOOD_COMPOSE" > "$TMP/c-tag.yaml"
check "tag mismatch fails and names the image" 1 "tag mismatch for dhi.io/postgres" run "$TMP/c-tag.yaml" "$GOOD_MANIFEST"

{ cat "$GOOD_COMPOSE"; printf '  extra:\n    image: example.org/unlisted:1@%s\n' "$D1"; } > "$TMP/c-extra.yaml"
check "unlisted image fails and names it" 1 "example.org/unlisted is not in the manifest" run "$TMP/c-extra.yaml" "$GOOD_MANIFEST"

sed "s/@$D2\$/@$D1/" "$GOOD_COMPOSE" > "$TMP/c-presidio.yaml"
check "commented Presidio ref is checked too" 1 "digest mismatch for ghcr.io/data-privacy-stack/presidio-analyzer" run "$TMP/c-presidio.yaml" "$GOOD_MANIFEST"

printf '  mailpit:\n    image: axllent/mailpit:v1.33.0\n' | { echo "services:"; cat; } > "$TMP/c-nodigest.yaml"
check "compose image without a digest fails" 1 "axllent/mailpit:v1.33.0 has no @sha256 digest" run "$TMP/c-nodigest.yaml" "$GOOD_MANIFEST"

write_manifest "$TMP/m-nodigest.yaml" <<EOT
  - name: dhi.io/postgres
    source: dhi
    tag: "18"
EOT
check "manifest entry without a digest fails" 1 "dhi.io/postgres has no digest" run "$GOOD_COMPOSE" "$TMP/m-nodigest.yaml"

write_manifest "$TMP/m-noreason.yaml" <<EOT
  - name: axllent/mailpit
    source: other
    tag: "v1.33.0"
    digest: $D2
EOT
check "other without a reason fails and names the entry" 1 "axllent/mailpit is 'other' and has no reason" run "$GOOD_COMPOSE" "$TMP/m-noreason.yaml"

write_manifest "$TMP/m-baddhi.yaml" <<EOT
  - name: quay.io/keycloak/keycloak
    source: dhi
    tag: "26.8.1"
    digest: $D1
EOT
check "dhi entry not from dhi.io fails" 1 "quay.io/keycloak/keycloak is marked dhi but is not from dhi.io" run "$GOOD_COMPOSE" "$TMP/m-baddhi.yaml"

write_manifest "$TMP/m-deferred-ok.yaml" <<EOT
  - name: dhi.io/postgres
    source: dhi
    tag: "18"
    digest: $D1
  - name: axllent/mailpit
    source: other
    tag: "v1.33.0"
    digest: $D2
    reason: Local only.
  - name: ghcr.io/data-privacy-stack/presidio-analyzer
    source: other
    tag: "2.2.366"
    digest: $D2
    reason: Not running yet.
    scan: deferred
EOT
perl -pe 's/^(    reason: Local only\.)$/$1\n    scan: deferred/' "$TMP/m-deferred-ok.yaml" > "$TMP/m-deferred-live.yaml"
check "deferred image that is only commented out in compose passes" 0 "OK" run "$GOOD_COMPOSE" "$TMP/m-deferred-ok.yaml"
check "deferred image that runs in compose fails and names it" 1 "axllent/mailpit is scan: deferred but runs in compose" run "$GOOD_COMPOSE" "$TMP/m-deferred-live.yaml"

write_manifest "$TMP/m-badscan.yaml" <<EOT
  - name: dhi.io/postgres
    source: dhi
    tag: "18"
    digest: $D1
    scan: defered
EOT
check "an unknown scan value fails and names the entry" 1 "dhi.io/postgres has scan 'defered'" run "$GOOD_COMPOSE" "$TMP/m-badscan.yaml"

write_manifest "$TMP/m-badsource.yaml" <<EOT
  - name: dhi.io/postgres
    source: foo
    tag: "18"
    digest: $D1
EOT
check "an unknown source fails and names the entry" 1 "dhi.io/postgres has source 'foo'" run "$GOOD_COMPOSE" "$TMP/m-badsource.yaml"

printf 'services:\n  mailpit:\n    image: axllent/mailpit@%s\n' "$D2" > "$TMP/c-notag.yaml"
check "a compose image with a digest but no tag fails" 1 "has no tag" run "$TMP/c-notag.yaml" "$GOOD_MANIFEST"

echo
echo "passed: $pass, failed: $fail"
[ "$fail" -eq 0 ]
