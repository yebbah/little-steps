#!/usr/bin/env bash
# Fails when a GitHub Actions workflow references a third-party action by tag or branch (AD-25).
#
#   deploy/check-actions.sh
#
# Rule: every `uses:` in .github/workflows/ and .github/actions/ is either a local path (./...),
# a docker:// image pinned by @sha256: digest, or owner/repo[/path]@<40-character commit SHA>
# with the version in a trailing comment (`# v4.2.2`). Anything else is named by file and line.
# Test hook: LS_GITHUB_DIR (default: the repository's .github folder).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GITHUB_DIR="${LS_GITHUB_DIR:-$SCRIPT_DIR/../.github}"

files=()
for dir in "$GITHUB_DIR/workflows" "$GITHUB_DIR/actions"; do
  [ -d "$dir" ] || continue
  while IFS= read -r f; do files+=("$f"); done < <(find "$dir" -type f \( -name '*.yml' -o -name '*.yaml' \) | sort)
done

if [ "${#files[@]}" -eq 0 ]; then
  echo "check-actions: no workflow files under $GITHUB_DIR" >&2
  exit 1
fi

bad=0
count=0
for f in "${files[@]}"; do
  n=0
  while IFS= read -r line || [ -n "$line" ]; do
    n=$((n + 1))
    line="${line%$'\r'}"
    # Forms this line-based check cannot read (flow mapping, quoted key, value on the next line or
    # a block scalar) are refused rather than skipped: write `uses: owner/repo@<sha> # vX.Y.Z`.
    if [[ "$line" =~ [{,][[:space:]]*[\"\']?uses[\"\']?[[:space:]]*: ]] \
       || [[ "$line" =~ ^[[:space:]]*(-[[:space:]]+)?[\"\']uses[\"\']: ]] \
       || [[ "$line" =~ ^[[:space:]]*(-[[:space:]]+)?uses:[[:space:]]*([\>\|][-+]?)?[[:space:]]*(#.*)?$ ]]; then
      echo "check-actions: ${f#"$GITHUB_DIR"/}:$n: a uses: in this form cannot be checked; write it as 'uses: owner/repo@<sha> # vX.Y.Z'" >&2
      bad=1; continue
    fi
    # a `uses:` key (optionally after "- "), not inside a comment
    [[ "$line" =~ ^[[:space:]]*(-[[:space:]]+)?uses:[[:space:]]*([^[:space:]#]+)[[:space:]]*(#[[:space:]]*(.*))?$ ]] || continue
    ref="${BASH_REMATCH[2]}"; ref="${ref//\"/}"; ref="${ref//\'/}"
    comment="${BASH_REMATCH[4]:-}"
    count=$((count + 1))
    where="${f#"$GITHUB_DIR"/}:$n"
    case "$ref" in
      ./*) continue ;;
      docker://*@sha256:*) [[ "${ref##*@sha256:}" =~ ^[0-9a-f]{64}$ ]] && continue ;;
      docker://*) echo "check-actions: $where: $ref is not pinned by @sha256: digest" >&2; bad=1; continue ;;
    esac
    if ! [[ "$ref" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+(/[A-Za-z0-9_./-]+)?@[0-9a-f]{40}$ ]] || [[ "$ref" == *..* ]]; then
      echo "check-actions: $where: $ref is not pinned to a full 40-character commit SHA (a tag or branch can move)" >&2
      bad=1; continue
    fi
    if ! [[ "$comment" =~ ^v?[0-9][0-9A-Za-z._+-]*$ ]]; then
      echo "check-actions: $where: $ref has no version comment (add '# v1.2.3' after the SHA)" >&2
      bad=1
    fi
  done < "$f"
done

if [ "$bad" -ne 0 ]; then
  echo "check-actions: FAIL" >&2
  exit 1
fi
echo "check-actions: PASS ($count action reference(s) in ${#files[@]} file(s), all pinned to a commit SHA)"
