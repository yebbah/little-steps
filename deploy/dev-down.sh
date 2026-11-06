#!/usr/bin/env bash
# Stop the local stack (Story 1.4).
#
#   deploy/dev-down.sh                stop the containers, keep volumes and the /data/ folder
#   deploy/dev-down.sh --wipe         ask (type "wipe"), then remove containers, volumes and /data/
#   deploy/dev-down.sh --wipe --yes   same without the prompt

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$SCRIPT_DIR/local.env"
[ -f "$ENV_FILE" ] || ENV_FILE="$SCRIPT_DIR/local.env.example" # only needed to resolve variables
COMPOSE_FILE="$SCRIPT_DIR/compose.yaml"
STORAGE_DIR="$ROOT/data"

# --profile full so the app service (Story 1.5) is stopped too, whether or not it is running.
compose() { docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" --profile full "$@"; }

WIPE=0
YES=0
for arg in "$@"; do
  case "$arg" in
    --wipe) WIPE=1 ;;
    --yes) YES=1 ;;
    *) echo "usage: deploy/dev-down.sh [--wipe [--yes]]" >&2; exit 2 ;;
  esac
done
if [ "$YES" -eq 1 ] && [ "$WIPE" -eq 0 ]; then
  echo "dev-down: --yes only applies to --wipe" >&2
  exit 2
fi

if ! docker info >/dev/null 2>&1; then
  echo "dev-down: Docker is not running" >&2
  exit 1
fi

if [ "$WIPE" -eq 0 ]; then
  compose down
  echo "dev-down: stopped. Volumes and the local storage folder (data/) are kept."
  exit 0
fi

if [ "$YES" -eq 0 ]; then
  echo "This removes the containers, ALL volumes (database and Keycloak data) and the local storage folder (data/)."
  printf 'Type "wipe" to continue: '
  answer=""
  read -r answer || true
  if [ "$answer" != "wipe" ]; then
    echo "dev-down: aborted, nothing was removed." >&2
    exit 1
  fi
fi

compose down --volumes --remove-orphans
rm -rf "$STORAGE_DIR"
echo "dev-down: wiped containers, volumes and the local storage folder."
