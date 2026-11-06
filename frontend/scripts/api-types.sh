#!/usr/bin/env bash
# Generates src/api/schema.d.ts from ../backend/openapi.json (AD-20).
#   api-types.sh           write the file
#   api-types.sh --check   fail when the committed file is out of date
# openapi-typescript does not support TypeScript 7, so it runs with its own TypeScript 5.9.3.
set -euo pipefail

cd "$(dirname "$0")/.."
spec="../backend/openapi.json"
out="src/api/schema.d.ts"

generate() {
  npx --yes -p typescript@5.9.3 -p openapi-typescript@7.13.0 openapi-typescript "$spec" -o "$1" >/dev/null
}

case "${1:-}" in
  "")
    generate "$out"
    echo "wrote $out"
    ;;
  --check)
    tmp="$(mktemp -d)"
    trap 'rm -rf "$tmp"' EXIT
    generate "$tmp/schema.d.ts"
    if ! diff -u "$out" "$tmp/schema.d.ts"; then
      echo "API types are out of date: run 'npm run api:types' and commit $out" >&2
      exit 1
    fi
    echo "API types are up to date"
    ;;
  *)
    echo "usage: api-types.sh [--check]" >&2
    exit 2
    ;;
esac
