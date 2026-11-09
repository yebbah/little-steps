#!/usr/bin/env bash
# Fails when a pull request adds or changes no changelog and no security report (docs/CONTRIBUTING.md,
# "Non-story pull requests"). Every pull request carries both records in the same pull request.
#
#   deploy/check-records.sh [BASE_REF]       BASE_REF defaults to origin/main
#
# A record is docs/changelogs/ or docs/security-reports/ with a story-, change- or pr- file name; README.md
# and TEMPLATE.md do not count. Needs the history back to the merge base (fetch-depth: 0 in CI).
# Test hook: LS_ROOT (the repository to check).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="${LS_ROOT:-$(cd "$SCRIPT_DIR/.." && pwd)}"
BASE="${1:-origin/main}"

die() { echo "check-records: $*" >&2; exit 1; }

cd "$ROOT"
git rev-parse -q --verify "$BASE^{commit}" > /dev/null || die "base '$BASE' not found; fetch it first (git fetch origin main)"
base_commit="$(git merge-base "$BASE" HEAD)" || die "no common ancestor with '$BASE'; fetch the full history (fetch-depth: 0)"
changed="$(git diff --name-only --diff-filter=AMR "$base_commit" HEAD)"

branch="${GITHUB_HEAD_REF:-$(git branch --show-current 2> /dev/null || true)}"
slug="${branch#*/}"
[ -n "$slug" ] || slug="<branch slug>"

missing=0
for folder in changelogs security-reports; do
  if printf '%s\n' "$changed" | grep -Eq "^docs/$folder/(story|change|pr)-[^/]+\.md$"; then
    echo "ok   docs/$folder has a record in this pull request"
  else
    echo "FAIL docs/$folder: this pull request adds or changes no record (expected docs/$folder/change-$slug.md, or story-<N>-<M>-<slug>.md for a story)"
    missing=$((missing + 1))
  fi
done

if [ "$missing" -gt 0 ]; then
  echo "check-records: FAILED. Every pull request carries its changelog and security report; see docs/CONTRIBUTING.md, 'Non-story pull requests'." >&2
  exit 1
fi
echo "check-records: OK"
