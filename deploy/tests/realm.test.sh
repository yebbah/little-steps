#!/usr/bin/env bash
# shellcheck disable=SC2001,SC2016  # sed prefixes output lines; the jq filters keep a literal ${...} placeholder in single quotes
# Tests for deploy/keycloak/littlesteps-realm.json and the env wiring. Plain bash plus jq, no Docker.
#   deploy/tests/realm.test.sh

set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REALM="${LS_REALM_FILE:-$HERE/../keycloak/littlesteps-realm.json}"
EXAMPLE="$HERE/../local.env.example"
COMPOSE="$HERE/../compose.yaml"

pass=0; fail=0
# t NAME JQ-EXPRESSION  (passes when the expression is true for the realm)
t() {
  if jq -e "$2" "$REALM" >/dev/null 2>&1; then pass=$((pass + 1)); echo "ok   $1"
  else fail=$((fail + 1)); echo "FAIL $1"; fi
}
# s NAME COMMAND...
s() {
  local name="$1"; shift
  if "$@" >/dev/null 2>&1; then pass=$((pass + 1)); echo "ok   $name"
  else fail=$((fail + 1)); echo "FAIL $name"; fi
}

C='.clients[] | select(.clientId == "littlesteps-pwa")'
t "realm is littlesteps"                         '.realm == "littlesteps"'
t "client littlesteps-pwa is public"             "[$C | .publicClient] == [true]"
t "PKCE S256 is required"                        "[$C | .attributes[\"pkce.code.challenge.method\"]] == [\"S256\"]"
t "no password grant or implicit flow"           "[$C | (.directAccessGrantsEnabled // false) or (.implicitFlowEnabled // false)] == [false]"
t "refresh token rotation on (no reuse)"         '.revokeRefreshToken == true and .refreshTokenMaxReuse == 0'
t "redirect URI for localhost:5173"              "[$C | .redirectUris[] | select(. == \"http://localhost:5173/*\")] | length == 1"
t "redirect URI for localhost:8080"              "[$C | .redirectUris[] | select(. == \"http://localhost:8080/*\")] | length == 1"
t "exactly three redirect URIs"                  "[$C | .redirectUris | length] == [3]"
t "brute-force protection is on"                 '.bruteForceProtected == true'
t "redirect URI for the Tailscale host from env" "[$C | .redirectUris[] | select(. == \"https://\${LS_TAILSCALE_HOST}/*\")] | length == 1"
t "exactly two users"                            '.users | length == 2'
t "user caregiver.a@example.test"                '[.users[] | select(.username == "caregiver.a@example.test" and .enabled)] | length == 1'
t "user caregiver.b@example.test"                '[.users[] | select(.username == "caregiver.b@example.test" and .enabled)] | length == 1'
t "user passwords are env placeholders"          '[.users[].credentials[].value] == ["${LS_CAREGIVER_A_PASSWORD}", "${LS_CAREGIVER_B_PASSWORD}"]'
t "mail goes to Mailpit"                         '.smtpServer.host == "mailpit" and .smtpServer.port == "1025"'

s "compose passes every realm variable to Keycloak" bash -c "
  for v in LS_CAREGIVER_A_PASSWORD LS_CAREGIVER_B_PASSWORD LS_TAILSCALE_HOST; do grep -q \"^      \$v:\" '$COMPOSE' || exit 1; done"
s "example env defines every compose variable"      bash -c "
  for v in \$(grep -o '\${LS_[A-Z_]*' '$COMPOSE' | sed 's/^\${//' | sort -u); do grep -q \"^\$v=\" '$EXAMPLE' || { echo missing \$v; exit 1; }; done"
s "Keycloak does not use port 8080"                 bash -c "! grep -q '^LS_KEYCLOAK_PORT=8080\$' '$EXAMPLE'"
s "example env holds only placeholders"             bash -c "! grep -E '^[A-Z_]*(PASSWORD|SECRET)=' '$EXAMPLE' | grep -v 'change-me'"
s "local.env is git-ignored"                        bash -c "cd '$HERE/../..' && git check-ignore -q deploy/local.env"

# Missing env: compose must refuse and point at the example.
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  out="$(env -i PATH="$PATH" HOME="$HOME" docker compose -f "$COMPOSE" config 2>&1)"; code=$?
  if [ "$code" -ne 0 ] && echo "$out" | grep -q "Copy deploy/local.env.example to deploy/local.env"; then
    pass=$((pass + 1)); echo "ok   compose refuses to start without local.env and says to copy the example"
  else fail=$((fail + 1)); echo "FAIL compose refuses to start without local.env and says to copy the example"; echo "$out" | sed 's/^/     | /'; fi
else
  echo "skip missing-env case (docker compose not available)"
fi

echo
echo "passed: $pass, failed: $fail"
[ "$fail" -eq 0 ]
