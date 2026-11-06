#!/usr/bin/env bash
# Check every local URL from the README "Local URLs to test" table (Story 1.4).
#
#   deploy/check-urls.sh
#
# Ports come from deploy/local.env (the example if missing). Sends no credentials. Exit 1 if a
# required URL fails. The app on port 8080 is informational until Story 1.5.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/local.env"
[ -f "$ENV_FILE" ] || ENV_FILE="$SCRIPT_DIR/local.env.example"

env_port() { # KEY DEFAULT
  local line value
  line="$(grep -E "^$1=" "$ENV_FILE" | tail -n 1 || true)"
  value="${line#*=}"; value="${value%%#*}"; value="$(printf '%s' "$value" | tr -d '\r"'"'"' ')"
  echo "${value:-$2}"
}

KC="$(env_port LS_KEYCLOAK_PORT 8180)"
MAIL="$(env_port LS_MAILPIT_UI_PORT 8025)"
PG="$(env_port LS_POSTGRES_PORT 5432)"
FAILED=0

pass() { echo "PASS  $1"; }
fail() { echo "FAIL  $1 ($2)"; FAILED=$((FAILED + 1)); }

# http NAME URL [BODY_PATTERN]: follows redirects, wants a final 200, and the pattern in the body if given
http() {
  local name="$1" url="$2" pattern="${3:-}" body code
  body="$(mktemp)"
  code="$(curl -sS -L --max-time 10 -o "$body" -w '%{http_code}' "$url" 2>/dev/null || true)"
  if [ "$code" != "200" ]; then
    fail "$name $url" "HTTP ${code:-none}"
  elif [ -n "$pattern" ] && ! grep -Eq -- "$pattern" "$body"; then
    fail "$name $url" "unexpected body, wanted /$pattern/"
  else
    pass "$name $url"
  fi
  rm -f "$body"
}

echo "check-urls: ports from $(basename "$ENV_FILE")"
http "Keycloak admin console    " "http://localhost:${KC}/admin"
http "Keycloak realm metadata   " "http://localhost:${KC}/realms/littlesteps/.well-known/openid-configuration" "\"issuer\" *: *\"[^\"]*/realms/littlesteps\""
http "Keycloak account console  " "http://localhost:${KC}/realms/littlesteps/account"
http "Mailpit inbox             " "http://localhost:${MAIL}"
http "Mailpit API               " "http://localhost:${MAIL}/api/v1/info" "\"Version\""

if command -v nc >/dev/null 2>&1; then
  if nc -z -w 3 localhost "$PG" >/dev/null 2>&1; then
    pass "PostgreSQL port           localhost:${PG}"
  else
    fail "PostgreSQL port           localhost:${PG}" "connection refused"
  fi
else
  fail "PostgreSQL port           localhost:${PG}" "nc not found, cannot check the port"
fi

if curl -sS --max-time 3 -o /dev/null "http://localhost:8080" 2>/dev/null; then
  echo "INFO  App                      http://localhost:8080 answers"
else
  echo "INFO  App                      http://localhost:8080 not running (expected until Story 1.5)"
fi

if [ "$FAILED" -gt 0 ]; then
  echo "check-urls: $FAILED required check(s) failed" >&2
  exit 1
fi
echo "check-urls: all required URLs passed"
