#!/bin/sh
# Creates Keycloak's role and schema in the shared database. Safe to run again.
# The DHI PostgreSQL image has no docker-entrypoint-initdb.d support, so compose runs this
# from a one-shot service (keycloak-db-init) that uses the same pinned image.
# Inputs (environment): PGHOST PGPORT PGUSER PGPASSWORD PGDATABASE, KC_DB_USER, KC_DB_PASSWORD.
set -eu
: "${KC_DB_USER:?KC_DB_USER is required}" "${KC_DB_PASSWORD:?KC_DB_PASSWORD is required}"
if [ "$KC_DB_USER" = "${PGUSER:-}" ]; then
  echo "KC_DB_USER must differ from the PostgreSQL superuser ($PGUSER)" >&2
  exit 1
fi

# \getenv reads the values inside psql, so the password never appears on a command line.
psql -v ON_ERROR_STOP=1 <<'SQL'
\getenv kcuser KC_DB_USER
\getenv kcpass KC_DB_PASSWORD
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'kcuser', :'kcpass')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'kcuser') \gexec
SELECT format('ALTER ROLE %I PASSWORD %L', :'kcuser', :'kcpass') \gexec
SELECT format('CREATE SCHEMA IF NOT EXISTS keycloak AUTHORIZATION %I', :'kcuser') \gexec
SELECT format('ALTER ROLE %I SET search_path = keycloak', :'kcuser') \gexec
SQL
echo "keycloak role and schema ready"
