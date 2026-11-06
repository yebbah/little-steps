#!/usr/bin/env bash
# Fails when deploy/compose.yaml and deploy/images.yaml disagree (AD-26).
#
#   deploy/check-images.sh
#
# Checks: every compose image (commented Presidio refs included) is in the manifest with the same
# tag and digest; every manifest entry has a digest; every `other` has a reason; every `dhi`
# entry is from dhi.io. Every FROM line in deploy/Dockerfile gets the same checks (a digest, a tag,
# a manifest entry, matching tag and digest). Test hooks: LS_COMPOSE_FILE, LS_IMAGES_FILE, LS_DOCKERFILE.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE="${LS_COMPOSE_FILE:-$SCRIPT_DIR/compose.yaml}"
MANIFEST="${LS_IMAGES_FILE:-$SCRIPT_DIR/images.yaml}"
DOCKERFILE="${LS_DOCKERFILE:-$SCRIPT_DIR/Dockerfile}"

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

# check_ref WHERE REF: REF must be name:tag@digest and match the manifest.
check_ref() {
  local where="$1" ref="$2" digest nametag tag name row mtag mdigest
  case "$ref" in
    *@sha256:*) ;;
    *) fail "$where image $ref has no @sha256 digest"; return ;;
  esac
  digest="${ref#*@}"; nametag="${ref%@*}"
  case "$nametag" in *:*) ;; *) fail "$where image $ref has no tag"; return ;; esac
  tag="${nametag##*:}"; name="${nametag%:*}"
  # An image name may be listed with several tags: prefer the entry with the same tag.
  row="$(printf '%s\n' "$rows" | awk -F'|' -v n="$name" -v t="$tag" '$1 == n && $3 == t { print; exit }')"
  [ -n "$row" ] || row="$(printf '%s\n' "$rows" | awk -F'|' -v n="$name" '$1 == n { print; exit }')"
  if [ -z "$row" ]; then fail "$where image $name is not in the manifest"; return; fi
  IFS='|' read -r _ _ mtag mdigest _ _ <<< "$row"
  [ "$tag" = "$mtag" ] || fail "tag mismatch for $name: $where has $tag, manifest has $mtag"
  [ "$digest" = "$mdigest" ] || fail "digest mismatch for $name: $where has $digest, manifest has $mdigest"
}

while IFS= read -r ref; do
  [ -n "$ref" ] || continue
  check_ref compose "$ref"
done <<< "$(compose_refs)"

# Dockerfile -> the external image of each FROM line (stage references and scratch are skipped).
dockerfile_refs() {
  awk '
    toupper($1) == "FROM" {
      i = 2
      while (i <= NF && $i ~ /^--/) i++
      ref = $i
      if (ref in stages || tolower(ref) == "scratch") { } else print ref
      for (k = i + 1; k < NF; k++) if (toupper($k) == "AS") stages[$(k + 1)] = 1
    }' "$DOCKERFILE"
}

if [ ! -f "$DOCKERFILE" ]; then
  # A missing Dockerfile would leave its FROM lines unchecked. Only the test hook may point elsewhere.
  [ -n "${LS_DOCKERFILE:-}" ] || fail "missing $DOCKERFILE (its FROM lines must be checked)"
else
  while IFS= read -r ref; do
    [ -n "$ref" ] || continue
    check_ref Dockerfile "$ref"
  done <<< "$(dockerfile_refs)"
fi

if [ "$errors" -gt 0 ]; then
  echo "check-images: FAIL ($errors problem(s))" >&2
  exit 1
fi
echo "check-images: OK, compose and manifest agree"
