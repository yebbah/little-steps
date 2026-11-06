#!/usr/bin/env bash
# Tests the lint rule that flags string literals in JSX (messages belong in the catalog).
set -euo pipefail

cd "$(dirname "$0")/.."
fail=0
dir="src/__lint_fixture__"
trap 'rm -rf "$dir"' EXIT
mkdir -p "$dir"

expect_lint() { # name expected(pass|fail) source
  printf '%s\n' "$3" >"$dir/Fixture.tsx"
  out="$(npx oxlint --deny-warnings "$dir/Fixture.tsx" 2>&1)" && got=pass || got=fail
  # A failure must come from the literal rule, not from a crash or another rule.
  if [ "$got" = fail ] && ! grep -q 'jsx-no-literals' <<<"$out"; then got="fail-other"; fi
  if [ "$got" = "$2" ]; then echo "PASS  $1"; else echo "FAIL  $1 (expected $2, got $got)"; fail=1; fi
}

expect_lint "text child is flagged" fail 'export const A = () => <p>Hello there</p>'
expect_lint "string expression child is flagged" fail 'export const A = () => <p>{"Hello there"}</p>'
expect_lint "template literal child is flagged" fail 'export const A = () => <p>{`Hello there`}</p>'
expect_lint "class names are not flagged" pass 'export const A = () => <p className="note">{1}</p>'
expect_lint "catalog lookup passes" pass 'import { t } from "../i18n/messages"; export const A = () => <p>{t("greeting")}</p>'
expect_lint "numbers and variables pass" pass 'export const A = ({ n }: { n: number }) => <p>{n}</p>'

exit "$fail"
