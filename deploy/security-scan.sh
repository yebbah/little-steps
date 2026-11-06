#!/usr/bin/env bash
# Security scan (AD-25): the single entry point run by .githooks/pre-commit and by CI.
#
#   deploy/security-scan.sh                run every check (default)
#   deploy/security-scan.sh install-tools  download the pinned tools, verify checksums
#   deploy/security-scan.sh secrets        gitleaks on staged changes only
#   deploy/security-scan.sh evaluate FILE [TARGET]
#                                          apply the blocking policy to one Grype JSON report
#   deploy/security-scan.sh images         print the image references from deploy/images.yaml
#                                          (entries marked `scan: deferred` are listed on stderr, not scanned)
#   deploy/security-scan.sh scan TARGET    one target only (backend, frontend or images), for tests
#
# Blocking rule: a finding whose CVE is in CISA KEV, or whose CVSS is 7.0 or above, fails the
# scan. The only pass without a fix is a valid entry in security/exceptions.yaml.
# There is no switch that skips the scan. Never commit with --no-verify.
#
# Test hooks (used by deploy/tests): LS_ROOT, LS_KEV_FILE, LS_EXCEPTIONS_FILE, LS_SCAN_TODAY,
# LS_TOOLS_DIR.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="${LS_ROOT:-$(cd "$SCRIPT_DIR/.." && pwd)}"
POLICY="$SCRIPT_DIR/security-policy.jq"
TOOLS_DIR="${LS_TOOLS_DIR:-$SCRIPT_DIR/../.tools}"
OUT_DIR="$ROOT/build/security"
CACHE_DIR="$OUT_DIR/cache"
EXCEPTIONS_FILE="${LS_EXCEPTIONS_FILE:-$ROOT/security/exceptions.yaml}"
KEV_URL="${LS_KEV_URL:-https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json}"
CYCLONEDX_PLUGIN="org.cyclonedx:cyclonedx-maven-plugin:2.9.3"

# ---- pinned tools -------------------------------------------------------------------------
GRYPE_VERSION=0.121.2
SYFT_VERSION=1.57.0
GITLEAKS_VERSION=8.30.1

# SHA-256 of each release archive, copied from the publisher's checksums file.
sha256_for() {
  case "$1" in
    grype_0.121.2_darwin_amd64.tar.gz)  echo 1a748df28f72e841dea5c6a19c736b61a79c3e81dc376e0c18e1ab0d274cfe08 ;;
    grype_0.121.2_darwin_arm64.tar.gz)  echo 3633c113d81ec1460b0520e23633d72a25caae62875fd48a8b0e4f22dcc7c704 ;;
    grype_0.121.2_linux_amd64.tar.gz)   echo 9c8965ced9df657e5e851c14021bae838802f711edd7a48f9bc3c923a8d28f12 ;;
    grype_0.121.2_linux_arm64.tar.gz)   echo d7d2e160255b0f087280feabf6f213cf4c45d475690f3f1fe5dc336eb1037bf0 ;;
    syft_1.57.0_darwin_amd64.tar.gz)    echo f0e8568a9429ac1c8e4ae9e9c399fede5fcd09e4a7348b47b0532baf1c6500c1 ;;
    syft_1.57.0_darwin_arm64.tar.gz)    echo 17012a5a110323bb1069e513a8665f1ae445905c56b4e3f9a9df4f95c5bb6161 ;;
    syft_1.57.0_linux_amd64.tar.gz)     echo 9c077a7d43029b3b13e98a8db720661e700c4d58db6352153a06395ae4a2a704 ;;
    syft_1.57.0_linux_arm64.tar.gz)     echo 410cbfa0ae0f63246bc0057843760b1de2833cd23919e025e368fd7681308cdb ;;
    gitleaks_8.30.1_darwin_arm64.tar.gz) echo b40ab0ae55c505963e365f271a8d3846efbc170aa17f2607f13df610a9aeb6a5 ;;
    gitleaks_8.30.1_darwin_x64.tar.gz)  echo dfe101a4db2255fc85120ac7f3d25e4342c3c20cf749f2c20a18081af1952709 ;;
    gitleaks_8.30.1_linux_arm64.tar.gz) echo e4a487ee7ccd7d3a7f7ec08657610aa3606637dab924210b3aee62570fb4b080 ;;
    gitleaks_8.30.1_linux_x64.tar.gz)   echo 551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb ;;
    *) return 1 ;;
  esac
}

die() { echo "security-scan: $*" >&2; exit 1; }
note() { echo "security-scan: $*" >&2; }

platform() {
  case "$(uname -s)" in Darwin) OS=darwin ;; Linux) OS=linux ;; *) die "unsupported OS $(uname -s)" ;; esac
  case "$(uname -m)" in arm64|aarch64) ARCH=arm64 ;; x86_64|amd64) ARCH=amd64 ;; *) die "unsupported CPU $(uname -m)" ;; esac
}

tool_bin() { # name version -> path of the pinned binary
  echo "$TOOLS_DIR/$1-$2/$1"
}

require_tools() {
  local missing=""
  [ -x "$(tool_bin grype "$GRYPE_VERSION")" ] || missing="$missing grype"
  [ -x "$(tool_bin syft "$SYFT_VERSION")" ] || missing="$missing syft"
  [ -x "$(tool_bin gitleaks "$GITLEAKS_VERSION")" ] || missing="$missing gitleaks"
  [ -z "$missing" ] || die "missing tool(s):$missing. Run: deploy/security-scan.sh install-tools"
  command -v jq >/dev/null || die "jq is required (brew install jq)"
}

install_one() { # name version
  local name="$1" version="$2" arch="$ARCH" file url expected actual dir tmp
  [ "$name" = gitleaks ] && [ "$arch" = amd64 ] && arch=x64
  file="${name}_${version}_${OS}_${arch}.tar.gz"
  expected="$(sha256_for "$file")" || die "no pinned checksum for $file"
  dir="$TOOLS_DIR/$name-$version"
  if [ -x "$dir/$name" ]; then echo "$name $version already installed"; return; fi
  case "$name" in
    gitleaks) url="https://github.com/gitleaks/gitleaks/releases/download/v$version/$file" ;;
    *)        url="https://github.com/anchore/$name/releases/download/v$version/$file" ;;
  esac
  tmp="$(mktemp -d)"
  echo "downloading $file"
  if ! curl --fail --silent --show-error --location --output "$tmp/$file" "$url"; then
    rm -rf "$tmp"; die "download failed: $url"
  fi
  if command -v shasum >/dev/null 2>&1; then
    actual="$(shasum -a 256 "$tmp/$file" | awk '{print $1}')"
  else
    actual="$(sha256sum "$tmp/$file" | awk '{print $1}')"
  fi
  if [ "$actual" != "$expected" ]; then
    rm -rf "$tmp"
    die "checksum mismatch for $file (expected $expected, got $actual). Not installed."
  fi
  mkdir -p "$dir"
  tar -xzf "$tmp/$file" -C "$dir" "$name"
  rm -rf "$tmp"
  echo "$name $version installed, checksum verified"
}

cmd_install_tools() {
  platform
  mkdir -p "$TOOLS_DIR"
  install_one grype "$GRYPE_VERSION"
  install_one syft "$SYFT_VERSION"
  install_one gitleaks "$GITLEAKS_VERSION"
}

# ---- KEV feed -----------------------------------------------------------------------------
# Prints the path of a usable KEV file or exits. Downloaded at most once a day.
kev_path() {
  if [ -n "${LS_KEV_FILE:-}" ]; then
    [ -s "$LS_KEV_FILE" ] || die "LS_KEV_FILE is empty or missing: $LS_KEV_FILE"
    echo "$LS_KEV_FILE"; return
  fi
  local cache="$CACHE_DIR/kev.json" tmp
  mkdir -p "$CACHE_DIR"
  if [ -s "$cache" ] && [ -z "$(find "$cache" -mmin +1440 2>/dev/null)" ] \
     && jq -e '(.vulnerabilities | length) > 0' "$cache" >/dev/null 2>&1; then
    echo "$cache"; return
  fi
  tmp="$cache.download"
  if curl --fail --silent --show-error --location --max-time 60 --output "$tmp" "$KEV_URL" 2>/dev/null \
     && jq -e '(.vulnerabilities | length) > 0' "$tmp" >/dev/null 2>&1; then
    mv "$tmp" "$cache"
    echo "$cache"; return
  fi
  rm -f "$tmp"
  if [ -s "$cache" ] && jq -e '(.vulnerabilities | length) > 0' "$cache" >/dev/null 2>&1; then
    note "WARNING: could not refresh the KEV feed, using the cached copy older than a day"
    echo "$cache"; return
  fi
  die "the CISA KEV feed could not be downloaded and there is no cached copy ($KEV_URL). Connect to the network once to fill the cache."
}

# ---- exceptions ---------------------------------------------------------------------------
# Parses the small YAML subset of security/exceptions.yaml into a JSON array, no yq needed.
exceptions_raw() {
  [ -f "$EXCEPTIONS_FILE" ] || die "missing $EXCEPTIONS_FILE"
  awk '
    function esc(s) { gsub(/\\/, "\\\\", s); gsub(/"/, "\\\"", s); return s }
    function unq(s) { sub(/^[ \t]+/, "", s); sub(/[ \t]+$/, "", s)
      if (s ~ /^".*"$/ || s ~ /^\047.*\047$/) s = substr(s, 2, length(s) - 2); return s }
    function bad(msg) { err = err (err == "" ? "" : "; ") "line " NR ": " msg }
    function put(k, v) {
      if (k != "cve" && k != "reason" && k != "mitigation" && k != "expires") { bad("unknown key " k); return }
      cur = cur (cur == "" ? "" : ",") "\"" k "\":\"" esc(unq(v)) "\""
    }
    function flush() { if (inentry) { items = items (items == "" ? "" : ",") "{" cur "}"; cur = ""; inentry = 0 } }
    /^[ \t]*#/ || /^[ \t]*$/ { next }
    /^exceptions:[ \t]*\[\][ \t]*(#.*)?$/ { seen = 1; next }
    /^exceptions:[ \t]*(#.*)?$/ { seen = 1; next }
    /^[ \t]*-[ \t]+[a-z_]+:/ {
      if (!seen) { bad("entry before exceptions:"); next }
      flush(); inentry = 1
      line = $0; sub(/^[ \t]*-[ \t]+/, "", line)
      k = line; sub(/:.*/, "", k); v = line; sub(/^[^:]*:/, "", v); put(k, v); next
    }
    /^[ \t]+[a-z_]+:/ {
      if (!inentry) { bad("field outside an entry"); next }
      line = $0; sub(/^[ \t]+/, "", line)
      k = line; sub(/:.*/, "", k); v = line; sub(/^[^:]*:/, "", v); put(k, v); next
    }
    { bad("cannot parse: " $0) }
    END {
      flush()
      if (!seen) bad("missing top-level exceptions: key")
      printf "{\"items\":[%s],\"parseError\":\"%s\"}\n", items, esc(err)
    }' "$EXCEPTIONS_FILE"
}

today() { echo "${LS_SCAN_TODAY:-$(date +%Y-%m-%d)}"; }

# Prints {"valid":[...],"errors":[...]}. Any error fails the scan.
exceptions_checked() {
  exceptions_raw | jq -c --arg today "$(today)" '
    def epoch: (. + "T00:00:00Z") | try fromdateiso8601 catch -1;
    ($today | epoch) as $t
    | .items as $items
    | ( [ if .parseError != "" then "exceptions.yaml: " + .parseError else empty end ]
      + [ $items | to_entries[] | .key as $n | .value as $e
          | ["cve","reason","mitigation","expires"][] as $f
          | select(($e[$f] // "") == "")
          | "exceptions.yaml entry \($n + 1) (\($e.cve // "no cve")): missing \($f)" ]
      + [ $items[] | select((.expires // "") != "" and ((.expires | test("^[0-9]{4}-[0-9]{2}-[0-9]{2}$")) | not))
          | "exceptions.yaml \(.cve): malformed expiry \(.expires), use YYYY-MM-DD" ]
      + [ $items[] | select((.expires // "") | test("^[0-9]{4}-[0-9]{2}-[0-9]{2}$"))
          | select((.expires | epoch) == -1)
          | "exceptions.yaml \(.cve): malformed expiry \(.expires), not a real date" ]
      + [ $items[] | select((.expires // "") | test("^[0-9]{4}-[0-9]{2}-[0-9]{2}$"))
          | select((.expires | epoch) != -1 and (.expires | epoch) < $t)
          | "exceptions.yaml \(.cve): EXPIRED on \(.expires)" ]
      + [ $items[] | select((.expires // "") | test("^[0-9]{4}-[0-9]{2}-[0-9]{2}$"))
          | select((.expires | epoch) > $t + 30 * 86400)
          | "exceptions.yaml \(.cve): expiry \(.expires) is more than 30 days away" ]
      ) as $errors
    | { valid: $items, errors: $errors }'
}

# ---- policy -------------------------------------------------------------------------------
# policy_result REPORT TARGET COMPONENTS -> JSON {target, components, findings, status}
policy_result() {
  local report="$1" target="$2" components="$3" kevfile kev exc
  kevfile="$(kev_path)" || exit 1
  kev="$(jq -c '[.vulnerabilities[].cveID]' "$kevfile")"
  exc="$(exceptions_checked | jq -c '.valid')"
  jq -c --argjson kev "$kev" --argjson exceptions "$exc" -f "$POLICY" "$report" \
    | jq -c --arg target "$target" --argjson components "$components" \
        '{target: $target, components: $components, findings: .,
          status: (if any(.[]; .status == "block") then "FAIL" else "PASS" end)}'
}

render_result() { # JSON on stdin -> text
  jq -r '
    def f: if .cvss == null then "n/a" else (.cvss | tostring) end;
    def line($tag): "  \($tag)  \(.package) \(.version)  \(.cve)  KEV=\(if .kev then "yes" else "no" end)  CVSS=\(f)  fixed=\(if (.fixed | length) > 0 then (.fixed | join(",")) else "none" end)";
    "[\(.status)] \(.target): \(.components) components",
    ( .findings[] | select(.status == "block") | line("BLOCK") + (if .exceptionNote then "  (" + .exceptionNote + ")" else "" end) ),
    ( .findings[] | select(.status == "excepted") | line("EXCEPTED") + "  (exception until " + .exceptionExpires + ")" ),
    ( .findings[] | select(.status == "warn") | line("warn") )'
}

check_exceptions_or_fail() {
  local checked errs
  if ! checked="$(exceptions_checked)" || [ -z "$checked" ]; then
    echo "[FAIL] exceptions: security/exceptions.yaml could not be evaluated"
    return 1
  fi
  errs="$(echo "$checked" | jq -r '.errors[]')"
  if [ -n "$errs" ]; then
    echo "[FAIL] exceptions"
    echo "$errs" | sed 's/^/  /'
    return 1
  fi
}

cmd_evaluate() {
  local report="${1:-}" target="${2:-report}" result n
  [ -f "$EXCEPTIONS_FILE" ] || die "missing $EXCEPTIONS_FILE"
  [ -f "$report" ] || die "usage: security-scan.sh evaluate GRYPE_JSON [TARGET]"
  LS_KEV_FILE="$(kev_path)" || exit 1
  export LS_KEV_FILE
  check_exceptions_or_fail || exit 1
  n="$(jq '[.matches[]?] | length' "$report")"
  result="$(policy_result "$report" "$target" "$n")"
  echo "$result" | render_result
  [ "$(echo "$result" | jq -r .status)" = PASS ]
}

# ---- scans --------------------------------------------------------------------------------
cmd_secrets() {
  require_tools
  cd "$ROOT"
  git rev-parse --git-dir >/dev/null 2>&1 || die "not a git repository: $ROOT"
  if env -u GITLEAKS_CONFIG -u GITLEAKS_CONFIG_TOML "$(tool_bin gitleaks "$GITLEAKS_VERSION")" git --pre-commit --staged \
       --config "$SCRIPT_DIR/gitleaks.toml" --redact --no-banner --log-level warn "$ROOT"; then
    echo "[PASS] secrets: staged changes clean"
  else
    echo "[FAIL] secrets: gitleaks found a secret in the staged changes (values redacted above)"
    return 1
  fi
}

grype_scan() { # SBOM-FILE OUT-FILE
  "$(tool_bin grype "$GRYPE_VERSION")" "sbom:$1" -o json --quiet > "$2" \
    || { echo "[FAIL] grype could not scan $1 (vulnerability database unavailable?)"; return 1; }
}

# Results are appended to $RESULTS_FILE, one JSON object per line.
scan_backend() {
  local pom="$ROOT/backend/pom.xml" bom="$ROOT/backend/target/bom.json" regen=0 staged
  [ -f "$pom" ] || { echo "[FAIL] backend: backend/pom.xml not found"; return 1; }
  [ -f "$bom" ] || regen=1
  [ "$pom" -nt "$bom" ] && regen=1
  staged="$(git -C "$ROOT" diff --cached --name-only 2>/dev/null || true)"
  case "
$staged
" in *"
backend/pom.xml
"*) regen=1 ;; esac
  if [ "$regen" = 1 ]; then
    note "regenerating the backend SBOM (pom.xml changed or SBOM missing)"
    (cd "$ROOT/backend" && ./mvnw -q "$CYCLONEDX_PLUGIN:makeBom" >"$OUT_DIR/maven-sbom.log" 2>&1) \
      || { echo "[FAIL] backend: SBOM generation failed, see build/security/maven-sbom.log (is JAVA_HOME a JDK 25?)"; return 1; }
  fi
  [ -s "$bom" ] || { echo "[FAIL] backend: no SBOM at backend/target/bom.json"; return 1; }
  finish_target backend "$bom" "$(jq '.components | length' "$bom")"
}

scan_frontend() {
  local fe="$ROOT/frontend" tmp sbom
  [ -f "$fe/package-lock.json" ] || { echo "[FAIL] frontend: package-lock.json is missing"; return 1; }
  [ -f "$fe/package.json" ] || { echo "[FAIL] frontend: package.json is missing"; return 1; }
  if ! jq -e -n --slurpfile p "$fe/package.json" --slurpfile l "$fe/package-lock.json" '
        ($l[0].packages[""] // {}) as $root
        | (($p[0].dependencies // {}) == ($root.dependencies // {}))
          and (($p[0].devDependencies // {}) == ($root.devDependencies // {}))' >/dev/null; then
    echo "[FAIL] frontend: package-lock.json is out of step with package.json. Run: (cd frontend && npm install)"
    return 1
  fi
  tmp="$(mktemp -d)"
  cp "$fe/package.json" "$fe/package-lock.json" "$tmp/"
  sbom="$OUT_DIR/frontend.sbom.json"
  SYFT_JAVASCRIPT_INCLUDE_DEV_DEPENDENCIES=true "$(tool_bin syft "$SYFT_VERSION")" scan "dir:$tmp" -o "cyclonedx-json=$sbom" --quiet \
    || { rm -rf "$tmp"; echo "[FAIL] frontend: syft could not read the lockfile"; return 1; }
  rm -rf "$tmp"
  finish_target frontend "$sbom" "$(jq '.components | length' "$sbom")"
}

# Prints "name@digest" for each image in deploy/images.yaml (name:, digest: lines).
# An entry with a name but no digest (or a digest before its name) is an error: an image must
# never be skipped silently.
cmd_images() {
  awk '
    function val(s) { sub(/^[^:]*:[ \t]*/, "", s); gsub(/["\047]/, "", s); return s }
    function flush() {
      if (name == "") return
      if (digest == "") { print "image " name " has no digest" > "/dev/stderr"; bad = 1 }
      else if (deferred) print "security-scan: image " name " is deferred (scan: deferred in images.yaml), not scanned" > "/dev/stderr"
      else print name "@" digest
      name = ""; digest = ""; deferred = 0
    }
    /^[ \t]*-?[ \t]*name:/ { flush(); name = val($0) }
    /^[ \t]*digest:/ {
      if (name == "") { print "digest " val($0) " has no name before it" > "/dev/stderr"; bad = 1 }
      else if (digest != "") { print "image " name " has more than one digest" > "/dev/stderr"; bad = 1 }
      else digest = val($0)
    }
    /^[ \t]*scan:/ {
      s = val($0); sub(/[ \t]+#.*$/, "", s)
      if (name == "") { print "scan marker has no name before it" > "/dev/stderr"; bad = 1 }
      else if (s == "deferred") deferred = 1
    }
    END { flush(); exit bad }' "${LS_IMAGES_FILE:-$ROOT/deploy/images.yaml}"
}

scan_images() {
  local manifest="${LS_IMAGES_FILE:-$ROOT/deploy/images.yaml}" refs ref n=0 failed=0 out safe
  if [ ! -f "$manifest" ]; then
    if [ -f "$ROOT/deploy/compose.yaml" ] || [ -f "$ROOT/deploy/Dockerfile" ]; then
      echo "[FAIL] images: deploy/compose.yaml or deploy/Dockerfile exists but deploy/images.yaml does not. Add the manifest so every image is scanned."
      return 1
    fi
    echo "[SKIP] images: no deploy/images.yaml yet (arrives with Story 1.3); no compose file or Dockerfile exists either"
    printf '%s\n' '{"target":"images","components":0,"findings":[],"status":"SKIP"}' >> "$RESULTS_FILE"
    return 0
  fi
  refs="$(cmd_images)" || { echo "[FAIL] images: deploy/images.yaml has an entry without a digest (see above)"; return 1; }
  [ -n "$refs" ] || { echo "[FAIL] images: deploy/images.yaml lists no image with a digest"; return 1; }
  while IFS= read -r ref; do
    n=$((n + 1))
    safe="$n-$(echo "$ref" | tr -c 'A-Za-z0-9._\n-' '_')"
    out="$OUT_DIR/image-$safe.grype.json"
    if ! "$(tool_bin grype "$GRYPE_VERSION")" "registry:$ref" -o json --quiet > "$out" 2>"$OUT_DIR/image-$safe.err" </dev/null; then
      echo "[FAIL] image $ref could not be pulled or scanned (see build/security/image-$safe.err; dhi.io images need 'docker login dhi.io')"
      failed=1; continue
    fi
    finish_target "image $ref" "$out" "$(jq '[.matches[]?.artifact.id] | unique | length' "$out")" report || failed=1
  done <<EOF
$refs
EOF
  return "$failed"
}

# finish_target NAME FILE COUNT [report]: FILE is an SBOM (run grype) unless the 4th arg says
# FILE is already a grype report. An empty target fails: an empty SBOM must not pass silently.
finish_target() {
  local name="$1" file="$2" count="$3" mode="${4:-sbom}" report result safe
  safe="$(echo "$name" | tr -c 'A-Za-z0-9._\n-' '_')"
  if [ "$count" -eq 0 ] && [ "$mode" = sbom ]; then
    echo "[FAIL] $name: zero components found, the SBOM is empty"
    return 1
  fi
  if [ "$mode" = sbom ]; then
    report="$OUT_DIR/$safe.grype.json"
    grype_scan "$file" "$report" || return 1
  else
    report="$file"
  fi
  result="$(policy_result "$report" "$name" "$count")"
  echo "$result" >> "$RESULTS_FILE"
  echo "$result" | render_result
  [ "$(echo "$result" | jq -r .status)" = PASS ]
}

# The dependency scans read the working tree, but a commit takes the index. When one of the
# scanned inputs is only partly staged (git add -p), the scan would describe the wrong content.
check_partial_staging() {
  local f bad=0
  git -C "$ROOT" rev-parse --git-dir >/dev/null 2>&1 || return 0
  for f in backend/pom.xml frontend/package.json frontend/package-lock.json deploy/images.yaml; do
    [ -e "$ROOT/$f" ] || continue
    if ! git -C "$ROOT" diff --cached --quiet -- "$f" && ! git -C "$ROOT" diff --quiet -- "$f"; then
      echo "[FAIL] $f is partly staged: the scan reads the working copy, the commit takes the staged one. Stage the whole file or stash the rest."
      bad=1
    fi
  done
  return "$bad"
}

cmd_run() {
  local failed=0 summary="$OUT_DIR/summary.txt"
  mkdir -p "$OUT_DIR"
  rm -f "$summary" "$OUT_DIR/report.json"   # never leave a previous run's PASS behind
  [ -f "$EXCEPTIONS_FILE" ] || die "missing $EXCEPTIONS_FILE"
  require_tools
  LS_KEV_FILE="$(kev_path)" || exit 1
  export LS_KEV_FILE
  RESULTS_FILE="$OUT_DIR/results.ndjson"
  : > "$RESULTS_FILE"
  : > "$summary"
  {
    echo "Security scan $(date -u +%Y-%m-%dT%H:%M:%SZ)  (blocking: KEV, or CVSS >= 7.0)"
    echo "grype $GRYPE_VERSION, syft $SYFT_VERSION, gitleaks $GITLEAKS_VERSION"
  } | tee -a "$summary" >&2
  {
    check_exceptions_or_fail || failed=1
    check_partial_staging || failed=1
    cmd_secrets || failed=1
    scan_backend || failed=1
    scan_frontend || failed=1
    scan_images || failed=1
    [ "$failed" = 0 ]   # the group's exit status carries the result out of the pipeline
  } 2>&1 | tee -a "$summary" || failed=1
  # Belt and braces: any [FAIL] line in the summary also fails the run.
  if grep -q '^\[FAIL\]' "$summary"; then failed=1; fi
  jq -s --arg date "$(date -u +%Y-%m-%dT%H:%M:%SZ)" --argjson exceptions "$(exceptions_checked | jq -c '.valid')" \
    '{generated: $date, targets: ., activeExceptions: $exceptions}' "$RESULTS_FILE" > "$OUT_DIR/report.json"
  if [ "$failed" = 0 ]; then
    echo "RESULT: PASS" | tee -a "$summary"
  else
    echo "RESULT: FAIL, fix the findings above before committing (never use --no-verify)" | tee -a "$summary"
    return 1
  fi
}

# scan TARGET: run a single target (used by tests): backend, frontend or images.
cmd_scan() {
  require_tools
  mkdir -p "$OUT_DIR"
  check_exceptions_or_fail || exit 1
  LS_KEV_FILE="$(kev_path)" || exit 1
  export LS_KEV_FILE
  RESULTS_FILE="$OUT_DIR/results.ndjson"
  : > "$RESULTS_FILE"
  case "${1:-}" in
    backend)  scan_backend ;;
    frontend) scan_frontend ;;
    images)   scan_images ;;
    *)        die "usage: security-scan.sh scan backend|frontend|images" ;;
  esac
}

case "${1:-run}" in
  run)           cmd_run ;;
  install-tools) cmd_install_tools ;;
  secrets)       cmd_secrets ;;
  evaluate)      shift; cmd_evaluate "$@" ;;
  images)        cmd_images ;;
  scan)          shift; cmd_scan "$@" ;;
  -h|--help|help) sed -n '2,/^set -euo/p' "$0" | sed '$d' ;;
  *)             die "unknown command: $1 (try --help)" ;;
esac
