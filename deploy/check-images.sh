#!/usr/bin/env bash
# Fails when deploy/compose.yaml and deploy/images.yaml disagree (AD-26).
#
#   deploy/check-images.sh
#
# Checks: every compose image (commented Presidio refs included) is in the manifest with the same
# tag and digest; every manifest entry has a digest; every `other` has a reason; every `dhi`
# entry is from dhi.io. Test hooks: LS_COMPOSE_FILE, LS_IMAGES_FILE.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE="${LS_COMPOSE_FILE:-$SCRIPT_DIR/compose.yaml}"
MANIFEST="${LS_IMAGES_FILE:-$SCRIPT_DIR/images.yaml}"

[ -f "$COMPOSE" ] || { echo "check-images: missing $COMPOSE" >&2; exit 1; }
[ -f "$MANIFEST" ] || { echo "check-images: missing $MANIFEST" >&2; exit 1; }

# Manifest -> lines "name|source|tag|digest|reason|scan" (one per entry; an entry starts at `- name:`).
manifest_rows() {
  awk '
    function val(s) { sub(/^[^:]*:[ \t]*/, "", s); sub(/[ \t]+#.*$/, "", s); gsub(/["\047]/, "", s); return s }
    function flush() { if (name != "") print name "|" source "|" tag "|" digest "|" reason "|" scan; name = source = tag = digest = reason = scan = "" }
    /^[ \t]*#/ { next }
    /^[ \t]*-[ \t]+name:/ { flush(); name = val($0); next }
    /^[ \t]+source:/ { source = val($0); next }
    /^[ \t]+tag:/ { tag = val($0); next }
    /^[ \t]+digest:/ { digest = val($0); next }
    /^[ \t]+reason:/ { reason = val($0); next }
    /^[ \t]+scan:/ { scan = val($0); next }
    END { flush() }' "$MANIFEST"
}

# Compose -> only the active (uncommented) image refs.
active_refs() {
  sed -n -E 's/^[[:space:]]*image:[[:space:]]*"?([^"[:space:]]+)"?.*$/\1/p' "$COMPOSE"
}

# Compose -> the image refs, commented ones included.
compose_refs() {
  sed -n -E 's/^[[:space:]#]*image:[[:space:]]*"?([^"[:space:]]+)"?.*$/\1/p' "$COMPOSE"
}

errors=0
fail() { echo "check-images: $*" >&2; errors=$((errors + 1)); }

ACTIVE="$(active_refs)"
rows="$(manifest_rows)"
[ -n "$rows" ] || fail "$MANIFEST lists no images"

# Manifest rules.
while IFS='|' read -r name source tag digest reason scan; do
  [ -n "$name" ] || continue
  [ -n "$digest" ] || fail "manifest entry $name has no digest"
  case "$source" in
    dhi)   case "$name" in dhi.io/*) ;; *) fail "manifest entry $name is marked dhi but is not from dhi.io" ;; esac ;;
    other) [ -n "$reason" ] || fail "manifest entry $name is 'other' and has no reason" ;;
    *)     fail "manifest entry $name has source '$source' (use dhi or other)" ;;
  esac
  case "$scan" in
    ""|deferred) ;;
    *) fail "manifest entry $name has scan '$scan' (only 'deferred' is allowed)" ;;
  esac
  if [ "$scan" = deferred ] && printf '%s\n' "$ACTIVE" | awk -v n="$name" 'index($0, n) == 1 { c = substr($0, length(n) + 1, 1); if (c == ":" || c == "@") found = 1 } END { exit !found }'; then
    fail "manifest entry $name is scan: deferred but runs in compose (uncommented); remove scan: deferred"
  fi
done <<< "$rows"

# Compose refs against the manifest.
while IFS= read -r ref; do
  [ -n "$ref" ] || continue
  case "$ref" in
    *@sha256:*) ;;
    *) fail "compose image $ref has no @sha256 digest"; continue ;;
  esac
  digest="${ref#*@}"; nametag="${ref%@*}"
  tag="${nametag##*:}"; name="${nametag%:*}"
  case "$nametag" in *:*) ;; *) fail "compose image $ref has no tag"; continue ;; esac
  row="$(printf '%s\n' "$rows" | awk -F'|' -v n="$name" '$1 == n { print; exit }')"
  if [ -z "$row" ]; then fail "compose image $name is not in the manifest"; continue; fi
  IFS='|' read -r _ _ mtag mdigest _ _ <<< "$row"
  [ "$tag" = "$mtag" ] || fail "tag mismatch for $name: compose has $tag, manifest has $mtag"
  [ "$digest" = "$mdigest" ] || fail "digest mismatch for $name: compose has $digest, manifest has $mdigest"
done <<< "$(compose_refs)"

if [ "$errors" -gt 0 ]; then
  echo "check-images: FAIL ($errors problem(s))" >&2
  exit 1
fi
echo "check-images: OK, compose and manifest agree"
