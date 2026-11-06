#!/usr/bin/env bash
# shellcheck disable=SC2001  # sed prefixes every line of the captured output
# Tests for deploy/check-actions.sh. Plain bash, no framework, no network.
#   deploy/tests/check-actions.test.sh

set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHECK="$HERE/../check-actions.sh"
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

SHA=3d3c42e5aac5ba805825da76410c181273ba90b1
# workflow NAME  (steps on stdin) -> writes $TMP/NAME/workflows/ci.yml, prints the .github dir
workflow() {
  mkdir -p "$TMP/$1/workflows"
  { printf 'name: t\non: push\njobs:\n  j:\n    runs-on: ubuntu-latest\n    steps:\n'; cat; } > "$TMP/$1/workflows/ci.yml"
  echo "$TMP/$1"
}

D="$(workflow good <<EOT
      - uses: actions/checkout@$SHA # v7.0.1
      - uses: "actions/cache@$SHA" # v6.1.0
      - uses: ./.github/actions/local
      - uses: docker://alpine:3.20@sha256:1111111111111111111111111111111111111111111111111111111111111111
      - run: echo "uses: actions/checkout@v4 is only text here"
      # - uses: actions/checkout@v4
EOT
)"
check "pinned SHAs, local path and pinned docker image pass" 0 "PASS .*4 action reference" env LS_GITHUB_DIR="$D" "$CHECK"

D="$(workflow tag <<EOT
      - uses: actions/checkout@v4
EOT
)"
check "a tag fails and names file and line" 1 "ci.yml:7: actions/checkout@v4 is not pinned.*FAIL" env LS_GITHUB_DIR="$D" "$CHECK"

D="$(workflow branch <<EOT
      - uses: actions/checkout@main # main
EOT
)"
check "a branch fails" 1 "not pinned to a full 40-character commit SHA" env LS_GITHUB_DIR="$D" "$CHECK"

D="$(workflow short <<EOT
      - uses: actions/checkout@3d3c42e # v7.0.1
EOT
)"
check "a short SHA fails" 1 "not pinned to a full 40-character" env LS_GITHUB_DIR="$D" "$CHECK"

D="$(workflow nover <<EOT
      - uses: actions/checkout@$SHA
EOT
)"
check "a SHA without a version comment fails" 1 "no version comment" env LS_GITHUB_DIR="$D" "$CHECK"

D="$(workflow nover2 <<EOT
      - uses: actions/checkout@$SHA # pinned
EOT
)"
check "a comment that is not a version fails" 1 "no version comment" env LS_GITHUB_DIR="$D" "$CHECK"

D="$(workflow dockertag <<EOT
      - uses: docker://alpine:3.20
EOT
)"
check "a docker image by tag fails" 1 "not pinned by @sha256" env LS_GITHUB_DIR="$D" "$CHECK"

D="$(workflow mixed <<EOT
      - uses: actions/checkout@$SHA # v7.0.1
      - uses: actions/cache@v6
EOT
)"
check "one bad reference among good ones fails" 1 "ci.yml:8: actions/cache@v6" env LS_GITHUB_DIR="$D" "$CHECK"

D="$(workflow flow <<EOT
      - { name: x, uses: actions/checkout@v4 }
EOT
)"
check "a flow mapping is refused, not skipped" 1 "cannot be checked" env LS_GITHUB_DIR="$D" "$CHECK"

D="$(workflow block <<EOT
      - uses: >-
          actions/checkout@v4
EOT
)"
check "a block scalar value is refused" 1 "cannot be checked" env LS_GITHUB_DIR="$D" "$CHECK"

D="$(workflow quotedkey <<EOT
      - "uses": actions/checkout@v4
EOT
)"
check "a quoted key is refused" 1 "cannot be checked" env LS_GITHUB_DIR="$D" "$CHECK"

D="$(workflow badhex <<EOT
      - uses: docker://alpine@sha256:zzzz1111111111111111111111111111111111111111111111111111111111
EOT
)"
check "a docker digest that is not hex fails" 1 "not pinned" env LS_GITHUB_DIR="$D" "$CHECK"

D="$(workflow dotdot <<EOT
      - uses: actions/../evil@$SHA # v1.0.0
EOT
)"
check "a path with .. fails" 1 "not pinned" env LS_GITHUB_DIR="$D" "$CHECK"

D="$(workflow crlf <<EOT
      - uses: actions/checkout@$SHA # v7.0.1
EOT
)"
sed -i.bak 's/$/\r/' "$D/workflows/ci.yml"
check "CRLF line endings pass" 0 "PASS" env LS_GITHUB_DIR="$D" "$CHECK"

D="$(workflow nonl <<EOT
EOT
)"
printf '      - uses: actions/checkout@v4' >> "$D/workflows/ci.yml"
check "a last line without a newline is still checked" 1 "not pinned" env LS_GITHUB_DIR="$D" "$CHECK"

mkdir -p "$TMP/empty"
check "no workflow files fails" 1 "no workflow files" env LS_GITHUB_DIR="$TMP/empty" "$CHECK"

check "the repository's own workflows pass" 0 "PASS" "$CHECK"

echo; echo "$pass passed, $fail failed"
[ "$fail" -eq 0 ]
