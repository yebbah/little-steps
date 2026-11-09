#!/usr/bin/env bash
# shellcheck disable=SC2001  # sed prefixes every line of the captured output
# Tests for deploy/check-records.sh. Plain bash, no framework, no network: a throwaway git repo.
#   deploy/tests/check-records.test.sh

set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="$HERE/../check-records.sh"
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

R="$TMP/repo"
mkdir -p "$R/docs/changelogs" "$R/docs/security-reports"
git init -q -b main "$R"
g() { git -C "$R" -c user.email=t@example.com -c user.name=t -c commit.gpgsign=false "$@"; }
echo base > "$R/README.md"; echo idx > "$R/docs/changelogs/README.md"; echo tpl > "$R/docs/changelogs/TEMPLATE.md"
echo idx > "$R/docs/security-reports/README.md"; echo tpl > "$R/docs/security-reports/TEMPLATE.md"
g add -A; g commit -qm "base"
g update-ref refs/remotes/origin/main HEAD
# GITHUB_HEAD_REF is set in CI and would override the fixture branch name: tests unset it, or set it explicitly.
cr() { env -u GITHUB_HEAD_REF LS_ROOT="$R" "$SCRIPT" "$@"; }
new_branch() { g checkout -q main; g checkout -q -B "$1"; }

new_branch feature/epic-02-issue-1-code-only
echo code > "$R/app.txt"; g add -A; g commit -qm "code only"
check "no records at all fails" 1 "FAIL docs/changelogs.*FAIL docs/security-reports.*FAILED" cr
check "the failure names the expected file" 1 "change-epic-02-issue-1-code-only\.md" cr

check "in CI the pull request branch names the expected file" 1 "change-epic-09-issue-9-from-ci\.md" env GITHUB_HEAD_REF=feature/epic-09-issue-9-from-ci LS_ROOT="$R" "$SCRIPT"

echo cl > "$R/docs/changelogs/change-epic-02-issue-1-code-only.md"; g add -A; g commit -qm "changelog only"
check "a changelog without a security report fails" 1 "ok   docs/changelogs.*FAIL docs/security-reports" cr

echo sr > "$R/docs/security-reports/change-epic-02-issue-1-code-only.md"; g add -A; g commit -qm "both records"
check "both records pass" 0 "check-records: OK" cr

new_branch feature/epic-02-issue-2-readme-only
echo more >> "$R/docs/changelogs/README.md"; echo more >> "$R/docs/security-reports/README.md"; echo more >> "$R/docs/changelogs/TEMPLATE.md"
g add -A; g commit -qm "indexes and template only"
check "README and TEMPLATE do not count as records" 1 "FAIL docs/changelogs.*FAIL docs/security-reports" cr

new_branch feature/epic-02-issue-3-story
echo cl > "$R/docs/changelogs/story-2-12-something.md"; echo sr > "$R/docs/security-reports/story-2-12-something.md"
g add -A; g commit -qm "story records"
check "story records pass" 0 "check-records: OK" cr

new_branch feature/epic-02-issue-4-legacy
echo cl > "$R/docs/changelogs/pr-171-x.md"; echo sr > "$R/docs/security-reports/pr-171-x.md"
g add -A; g commit -qm "legacy names"
check "pr- names pass" 0 "check-records: OK" cr

new_branch feature/epic-02-issue-5-wrong-name
echo cl > "$R/docs/changelogs/notes.md"; echo sr > "$R/docs/security-reports/notes.md"
g add -A; g commit -qm "wrong names"
check "files with other names do not count" 1 "FAILED" cr

new_branch feature/epic-02-issue-6-wrong-folder
mkdir -p "$R/docs/other"; echo cl > "$R/docs/other/change-x.md"; echo sr > "$R/docs/other/change-y.md"
g add -A; g commit -qm "wrong folder"
check "records in another folder do not count" 1 "FAILED" cr

check "a missing base fails with a clear message" 1 "base 'origin/nothing' not found" cr origin/nothing

echo; echo "passed: $pass, failed: $fail"
[ "$fail" -eq 0 ]
