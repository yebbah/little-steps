#!/usr/bin/env bash
# Start the local stack (Story 1.4): PostgreSQL, Keycloak and Mailpit with Docker Compose.
#
#   deploy/dev-up.sh
#
# Checks every prerequisite first (nothing is changed if one is missing), enables the git hook,
# checks Ollama, creates deploy/local.env from the example if missing, starts compose and waits
# until every service is healthy. Running it again while the stack is up only reports the state.
# Stop with deploy/dev-down.sh. Never commit with --no-verify.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TOOLS_DIR="$ROOT/.tools"
ENV_FILE="$SCRIPT_DIR/local.env"
ENV_EXAMPLE="$SCRIPT_DIR/local.env.example"
COMPOSE_FILE="$SCRIPT_DIR/compose.yaml"
WAIT_TIMEOUT="${LS_WAIT_TIMEOUT:-300}"

compose() { docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"; }

# env_value KEY: the environment wins, then local.env, then the example. Used for non-secret keys only.
env_value() {
  local key="$1" file line
  if [ -n "${!key:-}" ]; then echo "${!key}"; return; fi
  for file in "$ENV_FILE" "$ENV_EXAMPLE"; do
    [ -f "$file" ] || continue
    line="$(grep -E "^${key}=" "$file" | tail -n 1 || true)"
    if [ -n "$line" ]; then clean_value "${line#*=}"; return; fi
  done
}

# clean_value RAW: strip CR, a trailing " # comment" and surrounding quotes.
clean_value() {
  local v="${1%$'\r'}"
  v="$(printf '%s' "$v" | sed -e 's/[[:space:]]#.*$//' -e 's/[[:space:]]*$//')"
  case "$v" in
    \"*\") v="${v#\"}"; v="${v%\"}" ;;
    \'*\') v="${v#\'}"; v="${v%\'}" ;;
  esac
  printf '%s\n' "$v"
}

# ---- prerequisites ------------------------------------------------------------------------
MISSING=0
missing() { # what, fix
  MISSING=$((MISSING + 1))
  echo "  missing: $1" >&2
  echo "    fix:   $2" >&2
}

pinned_version() { # name -> version pinned in security-scan.sh
  local line
  line="$(grep -E "^$(echo "$1" | tr '[:lower:]' '[:upper:]')_VERSION=" "$SCRIPT_DIR/security-scan.sh" | head -n 1 || true)"
  echo "${line#*=}"
}

java_major() {
  local bin=java out
  if [ -n "${JAVA_HOME:-}" ] && [ -x "$JAVA_HOME/bin/java" ]; then bin="$JAVA_HOME/bin/java"; fi
  command -v "$bin" >/dev/null 2>&1 || return 1
  out="$("$bin" -version 2>&1 | head -n 1 || true)"
  out="${out#*\"}"; out="${out%%\"*}"
  out="$(printf '%s' "$out" | sed -n 's/^\([0-9][0-9]*\).*/\1/p')"
  [ -n "$out" ] || return 1
  echo "$out"
}

check_prerequisites() {
  local major tool version docker_config

  if ! command -v docker >/dev/null 2>&1 || ! docker info >/dev/null 2>&1; then
    missing "Docker Desktop (not installed, or the daemon is not reachable)" \
      "install Docker Desktop (brew install --cask docker), then start it and wait until it is running"
  fi

  docker_config="${DOCKER_CONFIG:-$HOME/.docker}/config.json"
  if ! { [ -f "$docker_config" ] && grep -q '"dhi.io"' "$docker_config"; }; then
    missing "dhi.io login (needed to pull the hardened images)" "docker login dhi.io"
  fi

  major="$(java_major || true)"
  if [ "$major" != "25" ]; then
    missing "Java 25 (found: ${major:-none})" \
      "brew install openjdk@25, then set JAVA_HOME to it in your shell profile"
  fi

  command -v node >/dev/null 2>&1 || missing "Node" "brew install node@24 (the version in frontend/.nvmrc)"

  for tool in grype syft gitleaks; do
    version="$(pinned_version "$tool")"
    if ! command -v "$tool" >/dev/null 2>&1 && [ ! -x "$TOOLS_DIR/$tool-$version/$tool" ]; then
      missing "$tool" "deploy/security-scan.sh install-tools"
    fi
  done

  if [ "$MISSING" -gt 0 ]; then
    echo "dev-up: $MISSING prerequisite(s) missing, nothing was changed or started." >&2
    exit 1
  fi
}

check_ollama() {
  local required model
  required="$(env_value LS_AI_REQUIRED | tr '[:upper:]' '[:lower:]')"; required="${required:-false}"
  model="$(env_value OLLAMA_MODEL)"
  local problem=""
  if [ -z "$model" ]; then
    problem="OLLAMA_MODEL is not set in deploy/local.env"
  elif ! command -v ollama >/dev/null 2>&1; then
    problem="Ollama is not installed (brew install ollama, then: ollama pull $model)"
  elif ! ollama list 2>/dev/null | awk 'NR > 1 { print $1 }' | grep -Fxq -e "$model" -e "$model:latest"; then
    problem="Ollama model $model is not pulled (fix: ollama pull $model)"
  fi
  [ -n "$problem" ] || return 0
  if [ "$required" = "true" ]; then
    echo "dev-up: error: $problem (LS_AI_REQUIRED=true)." >&2
    [ -z "$model" ] || echo "  fix: ollama pull $model" >&2
    exit 1
  fi
  echo "dev-up: warning: $problem. Continuing: AI is optional while LS_AI_REQUIRED=false." >&2
}

print_urls() { # keep in step with "Local URLs to test" in README.md
  local kc mail pg db user
  kc="$(env_value LS_KEYCLOAK_PORT)"; kc="${kc:-8180}"; mail="$(env_value LS_MAILPIT_UI_PORT)"; mail="${mail:-8025}"
  pg="$(env_value LS_POSTGRES_PORT)"; pg="${pg:-5432}"; db="$(env_value LS_POSTGRES_DB)"; user="$(env_value LS_POSTGRES_USER)"
  echo
  echo "Local URLs (passwords are in deploy/local.env)"
  echo "  App (not running until Story 1.5)  http://localhost:8080"
  echo "  Keycloak admin console             http://localhost:${kc}/admin"
  echo "  Keycloak realm metadata            http://localhost:${kc}/realms/littlesteps/.well-known/openid-configuration"
  echo "  Keycloak account console           http://localhost:${kc}/realms/littlesteps/account"
  echo "  Mailpit inbox                      http://localhost:${mail}"
  echo "  Mailpit API                        http://localhost:${mail}/api/v1/info"
  echo "  PostgreSQL                         psql -h localhost -p ${pg} -U ${user} ${db}"
}

report_state() {
  echo
  echo "Service state"
  compose ps -a --format '  {{.Service}}: {{.State}} {{.Health}}' || true
}

report_unhealthy() {
  local service state health code found=0
  while IFS='|' read -r service state health code; do
    [ -n "$service" ] || continue
    if [ "$state" = "exited" ] && [ -z "$health" ] && [ "$code" = "0" ]; then continue; fi # finished one-shot
    if [ "$state" = "exited" ] && [ -z "$health" ]; then
      echo "dev-up: service failed: $service (exited with code $code)" >&2
      found=1
    elif [ "$state" != "running" ] || [ "$health" != "healthy" ]; then
      echo "dev-up: service not healthy: $service (state: $state, health: ${health:-none})" >&2
      found=1
    fi
  done < <(compose ps -a --format '{{.Service}}|{{.State}}|{{.Health}}|{{.ExitCode}}' 2>/dev/null || true)
  [ "$found" -eq 1 ] || echo "dev-up: compose up failed (service unknown, see: docker compose logs)" >&2
}

main() {
  echo "dev-up: checking prerequisites"
  check_prerequisites

  git -C "$ROOT" config core.hooksPath .githooks
  echo "dev-up: git hook enabled (core.hooksPath=.githooks)"

  check_ollama

  if [ ! -f "$ENV_FILE" ]; then
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    echo "dev-up: created deploy/local.env from the example. Change the placeholder values when you like."
  fi

  echo "dev-up: starting the stack (waiting up to ${WAIT_TIMEOUT}s for healthy services)"
  if ! compose up -d --wait --wait-timeout "$WAIT_TIMEOUT"; then
    report_unhealthy
    exit 1
  fi

  report_state
  print_urls
}

main "$@"
