#!/usr/bin/env bash
# shellcheck disable=SC2001  # sed prefixes every line of the captured output
# Guards .github/workflows/ci.yml against losing a required step (Story 1.8 acceptance criteria).
# Plain bash, no network. Test hook: LS_CI_FILE (default: the repository's ci.yml).
#   deploy/tests/ci-workflow.test.sh

set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CI="${LS_CI_FILE:-$HERE/../../.github/workflows/ci.yml}"
README="$HERE/../../README.md"
POM="$HERE/../../backend/pom.xml"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

pass=0; fail=0
# has NAME FILE REGEX: the file contains a line matching REGEX
has() {
  if grep -Eq -- "$3" "$2"; then pass=$((pass + 1)); echo "ok   $1"; else fail=$((fail + 1)); echo "FAIL $1 (no line matches: $3)"; fi
}
# lacks NAME FILE REGEX
lacks() {
  if grep -Eq -- "$3" "$2"; then fail=$((fail + 1)); echo "FAIL $1 (found: $3)"; else pass=$((pass + 1)); echo "ok   $1"; fi
}

[ -f "$CI" ] || { echo "FAIL missing $CI"; exit 1; }

has "runs on push" "$CI" '^  push:'
has "runs on pull request" "$CI" '^  pull_request:'
has "backend: ./mvnw verify" "$CI" 'run: \./mvnw .*verify'
has "backend: logs in to dhi.io before Testcontainers pulls the image" "$CI" "name: \"Backend: log in to dhi.io"
has "frontend: npm ci" "$CI" 'run: npm ci$'
has "frontend: lint" "$CI" 'run: npm run lint$'
has "frontend: typecheck" "$CI" 'run: npm run typecheck$'
has "frontend: Vitest with coverage" "$CI" 'run: npm run test:coverage$'
has "frontend: build" "$CI" 'run: npm run build$'
has "frontend: OpenAPI drift check" "$CI" 'run: npm run api:check$'
lacks "frontend: the drift check never skips" "$CI" 'api:check script arrives|skipped, the'
has "backend: required test reports are checked" "$CI" 'ModularityTests PersistenceBaselineTests'
has "backend: a missing report fails the job" "$CI" 'was not produced'
has "shellcheck on deploy and hooks" "$CI" 'shellcheck deploy/\*\.sh .*\.githooks/\*'
has "images.yaml digest check" "$CI" 'run: deploy/check-images\.sh'
has "action pinning check" "$CI" 'run: deploy/check-actions\.sh'
lacks "the image is never pushed" "$CI" 'docker push|push: true'
has "secret scan of the history" "$CI" 'run: deploy/security-scan\.sh secrets$'
has "backend dependency scan" "$CI" 'security-scan\.sh scan backend'
has "frontend dependency scan" "$CI" 'security-scan\.sh scan frontend'
lacks "no image scan in CI" "$CI" 'scan app-image|scan images|docker build'
has "secret scan reads the history in CI" "$CI" 'LS_SECRETS_SCOPE: history'
has "full history is checked out" "$CI" 'fetch-depth: 0'
has "Maven cache" "$CI" 'cache: maven'
has "npm cache" "$CI" 'cache: npm'
has "vulnerability database cache" "$CI" 'grype'
has "backend reports uploaded" "$CI" 'name: backend-reports'
has "frontend reports uploaded" "$CI" 'name: frontend-reports'
has "security reports uploaded" "$CI" 'name: security-reports'
has "read-only token" "$CI" '^  contents: read'
lacks "only GitHub-hosted free runners" "$CI" 'runs-on:[[:space:]]*(self-hosted|.*(large|xlarge|-[0-9]+-core))'
has "guardrail-eval is excluded by default" "$POM" '<excludedGroups>guardrail-eval</excludedGroups>'
has "JaCoCo report in the backend build" "$POM" 'jacoco-maven-plugin'
has "README shows the status badge" "$README" 'actions/workflows/ci\.yml/badge\.svg'

# Every step has a name, so a failure says what failed.
unnamed="$(awk '
  /^      - / { if (open && !named) print NR; open = 1; named = ($0 ~ /^      - name:/) ; next }
  /^    [a-z]/ { if (open && !named) print NR; open = 0 }
  /^  [a-z]/ { if (open && !named) print NR; open = 0 }
  END { if (open && !named) print NR }' "$CI")"
if [ -z "$unnamed" ]; then pass=$((pass + 1)); echo "ok   every step has a name"; else fail=$((fail + 1)); echo "FAIL steps without a name near line(s): $unnamed"; fi

# Negative: the checks above really fail when a step is removed (skipped in the nested run).
if [ -z "${LS_CI_NESTED:-}" ]; then
  grep -v 'deploy/check-images.sh' "$CI" > "$TMP/ci.yml"
  if LS_CI_NESTED=1 LS_CI_FILE="$TMP/ci.yml" "${BASH_SOURCE[0]}" >/dev/null 2>&1; then
    fail=$((fail + 1)); echo "FAIL a workflow without the images.yaml check still passes"
  else
    pass=$((pass + 1)); echo "ok   a workflow without the images.yaml check fails"
  fi
fi

echo; echo "$pass passed, $fail failed"
[ "$fail" -eq 0 ]
