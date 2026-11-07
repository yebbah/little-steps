#!/usr/bin/env bash
# Tests the stylelint rules for flat design and focus (UX-DR12, UX-DR14): no box-shadow other than none,
# and no outline removed without a replacement.
set -euo pipefail

cd "$(dirname "$0")/.."
fail=0
# A temporary folder outside src/, so a lint or test run in parallel (or an interrupted run) never sees the fixture.
dir="$(mktemp -d)"
trap 'rm -rf "$dir"' EXIT

expect_css() { # name expected(pass|fail) source
  printf '%s\n' "$3" >"$dir/fixture.css"
  out="$(npx stylelint --config .stylelintrc.json "$dir/fixture.css" 2>&1)" && got=pass || got=fail
  # A failure must come from one of the two rules, not from a crash or a syntax error.
  if [ "$got" = fail ] && ! grep -qE 'declaration-property-value-(allowed|disallowed)-list' <<<"$out"; then got="fail-other"; fi
  if [ "$got" = "$2" ]; then echo "PASS  $1"; else echo "FAIL  $1 (expected $2, got $got)"; fail=1; fi
}

expect_css "box-shadow with a blur is flagged" fail '.a { box-shadow: 0 2px 4px rgb(0 0 0 / 20%); }'
expect_css "box-shadow with a variable is flagged" fail '.a { box-shadow: var(--lift); }'
expect_css "inset box-shadow is flagged" fail '.a { box-shadow: inset 0 0 0 2px red; }'
expect_css "box-shadow none passes" pass '.a { box-shadow: none; }'
expect_css "outline none is flagged" fail '.a:focus { outline: none; }'
expect_css "outline 0 is flagged" fail '.a:focus { outline: 0; }'
expect_css "outline-style none is flagged" fail '.a:focus { outline-style: none; }'
expect_css "outline-width 0 is flagged" fail '.a:focus { outline-width: 0; }'
expect_css "outline 0px is flagged" fail '.a:focus { outline: 0px; }'
expect_css "outline NONE is flagged" fail '.a:focus { outline: NONE; }'
expect_css "outline with a width and none is flagged" fail '.a:focus { outline: 2px none; }'
expect_css "outline hidden is flagged" fail '.a:focus { outline: hidden; }'
expect_css "outline-style hidden is flagged" fail '.a:focus { outline-style: hidden; }'
expect_css "outline-width 0px is flagged" fail '.a:focus { outline-width: 0px; }'
expect_css "outline solid 0 is flagged" fail '.a:focus { outline: solid 0 red; }'
expect_css "webkit box-shadow is flagged" fail '.a { -webkit-box-shadow: 0 0 4px red; }'
expect_css "uppercase BOX-SHADOW is flagged" fail '.a { BOX-SHADOW: 0 0 4px red; }'
expect_css "a real focus outline passes" pass '.a:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 2px; }'
expect_css "a transparent outline (forced-colors safe) passes" pass '.a { outline: 2px solid transparent; }'

exit "$fail"
