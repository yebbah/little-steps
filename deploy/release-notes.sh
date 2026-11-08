#!/usr/bin/env bash
# shellcheck disable=SC2012,SC2016,SC2086  # ls|head picks one file; backticks are Markdown; set -- splits a number list on purpose
# Epic release notes (Story 1.9).
#
#   deploy/release-notes.sh <epic>            create docs/release-notes/epic-NN-<slug>.md from TEMPLATE.md,
#                                             pre-filled from git, the compose/env/image files and the latest reports.
#                                             Refuses to overwrite an existing note unless --force is given.
#   deploy/release-notes.sh check <file>      fail if the note's KEV or High/Critical count is not 0, the scan
#                                             did not pass, or (Status: done) a TODO(author) remains or a story
#                                             spec of the epic (spec-<epic>-*.md) has a status other than done.
#                                             --strict applies the "done" rules whatever the Status line says,
#                                             and also fails when the note's Commit hash is not on main (#101).
#   deploy/release-notes.sh tag <epic>        run the strict check, then tag HEAD `epic-NN` (local; push it yourself).
#   deploy/release-notes.sh shell-tests       run deploy/tests/*.test.sh and write build/test-reports/shell-tests.tsv
#                                             (suite, passed, failed, seconds) for the next generated note.
#
# Reads (all optional; a missing input becomes a TODO(author) line, never a silent zero):
#   build/security/summary.txt, report.json, *sbom*.json     deploy/security-scan.sh
#   backend/target/surefire-reports/TEST-*.xml, site/jacoco/jacoco.csv     ./mvnw verify
#   frontend/test-results/junit.xml, coverage/coverage-summary.json        Vitest (Story 1.8 wires these)
#   build/test-reports/shell-tests.tsv                                      this script, shell-tests
# Test hooks: LS_ROOT, LS_EPICS_DIR, LS_SPECS_DIR, LS_MAIN_REF.

set -euo pipefail
shopt -u patsub_replacement 2>/dev/null || true   # bash 5.2: keep & and \ in titles literal

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="${LS_ROOT:-$(cd "$SCRIPT_DIR/.." && pwd)}"
EPICS_DIR="${LS_EPICS_DIR:-$ROOT/.specs/planning-artifacts/epics}"
SPECS_DIR="${LS_SPECS_DIR:-$ROOT/.specs/implementation-artifacts}"
MAIN_REF="${LS_MAIN_REF:-main}"
NOTES_DIR="$ROOT/docs/release-notes"
TEMPLATE="$NOTES_DIR/TEMPLATE.md"
SEC_DIR="$ROOT/build/security"
TODO='TODO(author)'

die() { echo "release-notes: $*" >&2; exit 1; }
need() { command -v "$1" >/dev/null || die "$1 is required"; }

epic_number() { # arg -> two digits
  [[ "$1" =~ ^[0-9]+$ ]] || die "epic must be a number, got '$1'"
  printf '%02d' "$((10#$1))"
}

# ---- generation ---------------------------------------------------------------------------
# Each section function writes its Markdown to "$W/<NAME>".

sec_stories() { # epic file
  local n="$1" file="$2" key title cl rp summary line
  : > "$W/STORIES"
  while IFS= read -r line; do
    key="${line#\#\#\# Story }"; title="${key#*: }"; key="${key%%:*}"
    local dash="${key//./-}"
    cl="$(ls "$ROOT"/docs/changelogs/story-"$dash"-*.md 2>/dev/null | head -1 || true)"
    rp="$(ls "$ROOT"/docs/security-reports/story-"$dash"-*.md 2>/dev/null | head -1 || true)"
    if [ -n "$cl" ]; then
      summary="$(awk '/^## Summary/{f=1;next} f&&/^#/{exit} f&&NF{print;exit}' "$cl")"
      [ -n "$summary" ] || summary="$TODO: summarise this story."
      printf -- '- **Story %s, %s.** %s ([changelog](../changelogs/%s)%s)\n' "$key" "$title" "$summary" "$(basename "$cl")" \
        "$([ -n "$rp" ] && printf ', [security report](../security-reports/%s)' "$(basename "$rp")")" >> "$W/STORIES"
    else
      printf -- '- **Story %s, %s.** %s no changelog exists yet.\n' "$key" "$title" "$TODO" >> "$W/STORIES"
    fi
  done < <(grep -E "^### Story ${n#0}\.[0-9]+:" "$file" || true)
  [ -s "$W/STORIES" ] || echo "- $TODO: no stories found in the epic file." > "$W/STORIES"
}

sec_changes() {
  local out
  out="$(git -C "$ROOT" log --no-merges --format='- `%h` %s' "$RANGE" 2>/dev/null || true)"
  [ -n "$out" ] || out="- $TODO: no commits found in $RANGE."
  printf '%s\n' "$out" > "$W/COMMITS"
}

sec_integration() {
  local added keys_now keys_base services ports
  added="$(git -C "$ROOT" diff --name-only --diff-filter=A "$BASE_REF" HEAD -- backend/src/main/resources/db/migration 2>/dev/null || true)"
  if [ -n "$added" ]; then printf '%s\n' "$added" | sed 's/^/- `/; s/$/`/' > "$W/MIGRATIONS"
  else echo "None in this epic." > "$W/MIGRATIONS"; fi

  keys_now="$(sed -n -E 's/^([A-Z_][A-Z0-9_]*)=.*/\1/p' "$ROOT/deploy/local.env.example" 2>/dev/null | sort -u || true)"
  keys_base="$(git -C "$ROOT" show "$BASE_REF:deploy/local.env.example" 2>/dev/null | sed -n -E 's/^([A-Z_][A-Z0-9_]*)=.*/\1/p' | sort -u || true)"
  added="$(comm -23 <(printf '%s\n' "$keys_now") <(printf '%s\n' "$keys_base") | sed '/^$/d')"
  if [ -n "$added" ]; then printf '%s\n' "$added" | sed 's/^/- `/; s/$/`/' > "$W/ENV_KEYS"
  else echo "None in this epic." > "$W/ENV_KEYS"; fi

  services="$(awk '/^services:/{f=1;next} /^[^ #]/{f=0} f&&/^  [a-z][a-z0-9_-]*:[ ]*$/{gsub(/[ :]/,"");print}' "$ROOT/deploy/compose.yaml" 2>/dev/null | paste -sd, - | sed 's/,/, /g' || true)"
  ports="$(sed -n -E 's/^(LS_[A-Z_]*PORT)=(.*)$/\1=\2/p' "$ROOT/deploy/local.env.example" 2>/dev/null | sed 's/^/- `/; s/$/` (host port)/' || true)"
  {
    echo "Services in \`deploy/compose.yaml\`: ${services:-$TODO: none found}."
    echo
    echo "Ports (from \`deploy/local.env.example\`):"
    echo
    printf '%s\n' "${ports:-- $TODO: no ports found.}"
  } > "$W/SERVICES"
}

sec_security() {
  local rep="$SEC_DIR/report.json" sum="$SEC_DIR/summary.txt" out="$W/SECURITY" tools date res sboms
  if [ ! -f "$rep" ] || [ ! -f "$sum" ]; then
    {
      echo "- $TODO: no scan reports in build/security/. Run deploy/security-scan.sh, then regenerate this note with --force."
      echo "- KEV findings (not excepted): $TODO"
      echo "- High or Critical findings (not excepted): $TODO"
    } > "$out"
  else
    tools="$(sed -n -E 's/^(grype .*gitleaks [0-9.]+).*/\1/p' "$sum" | head -1)"
    date="$(jq -r '.generated // empty' "$rep" 2>/dev/null || true)"
    jq -e '(.targets | type == "array") and (.targets | length > 0)' "$rep" >/dev/null 2>&1 \
      || { echo "- $TODO: $rep has no scan targets; rerun deploy/security-scan.sh." > "$out"; return 0; }
    res="$(grep -E '^RESULT:' "$sum" | head -1 | sed -E 's/^RESULT: *([A-Z]+).*/\1/')"
    {
      echo "- Scan date: ${date:-$TODO: no date in report.json}. Tool versions: ${tools:-$TODO: tool versions not found}."
      echo "- Scan result: ${res:-$TODO: no RESULT line}."
      echo "- Blocking rule: CISA KEV, or CVSS 7.0 or above, unless a valid entry in \`security/exceptions.yaml\` covers a finding with no fix."
      echo
      echo "| Severity | Findings | Of which excepted |"
      echo "|---|---|---|"
      jq -r '[(.targets // [])[] | (.findings // [])[] | .severity = ((.severity // "Unknown") | ascii_downcase)] as $f
        | ["critical","high","medium","low","negligible","unknown"][] as $s
        | "| \($s[:1] | ascii_upcase)\($s[1:]) | \([$f[]|select(.severity==$s)]|length) | \([$f[]|select(.severity==$s and .status=="excepted")]|length) |"' "$rep"
      echo
      jq -r '[(.targets // [])[] | (.findings // [])[]] as $f
        | "- KEV findings (not excepted): \([$f[]|select(.kev and .status!="excepted")]|length)",
          "- High or Critical findings (not excepted): \([$f[]|select((((.severity // "")|ascii_downcase|test("^(high|critical)$")) or (((.cvss // 0)|tonumber? // 0) >= 7)) and .status!="excepted")]|length)"' "$rep"
      echo
      echo "Active exceptions:"
      echo
      if [ "$(jq '(.activeExceptions // []) | length' "$rep")" -gt 0 ]; then
        echo "| CVE | Expires | Reason |"; echo "|---|---|---|"
        jq -r '(.activeExceptions // [])[] | "| \(.cve) | \(.expires) | \(.reason) |"' "$rep"
      else echo "None."; fi
    } > "$out"
  fi
  {
    echo
    echo "Images from outside Docker Hardened Images:"
    echo
    local rows
    rows="$(awk '
      function val(s){sub(/^[^:]*:[ \t]*/,"",s);sub(/[ \t]+#.*$/,"",s);gsub(/["\047]/,"",s);return s}
      function flush(){ if(name!=""&&source=="other") print "- WARNING: " name ":" tag " is not a Docker Hardened Image. " reason (scan=="deferred"?" Scan deferred until the image is enabled.":""); name=source=tag=reason=scan="" }
      /^[ \t]*#/{next}
      /^[ \t]*-[ \t]+name:/{flush();name=val($0);next}
      /^[ \t]+source:/{source=val($0);next}
      /^[ \t]+tag:/{tag=val($0);next}
      /^[ \t]+reason:/{reason=val($0);next}
      /^[ \t]+scan:/{scan=val($0);next}
      END{flush()}' "$ROOT/deploy/images.yaml" 2>/dev/null || true)"
    printf '%s\n' "${rows:-None.}"
    echo
    sboms="$(cd "$ROOT" 2>/dev/null; ls build/security/*sbom*.json backend/target/bom.json backend/target/classes/META-INF/sbom/*.json 2>/dev/null | sed 's/^/`/; s/$/`/' | paste -sd, - | sed 's/,/, /g' || true)"
    echo "SBOM location (CycloneDX, not committed): ${sboms:-$TODO: no SBOM found, run deploy/security-scan.sh}."
    echo
    echo "Story security reports:"
    echo
    local r any=0
    for r in "$ROOT"/docs/security-reports/story-"${EPIC_N#0}"-*.md; do
      [ -e "$r" ] || continue
      any=1; echo "- [$(basename "$r" .md)](../security-reports/$(basename "$r"))"
    done
    [ "$any" = 1 ] || echo "- $TODO: no story security reports found."
  } >> "$out"
}

# Sum <testsuite ...> attributes (tests, failures, errors, skipped, time) over JUnit XML files.
junit_totals() { # files... -> "tests failed skipped seconds" or empty
  [ "$#" -gt 0 ] || return 0
  grep -ho '<testsuite [^>]*>' "$@" 2>/dev/null | awk '
    function a(s,k,  m){ if (match(s, k "=\"[^\"]*\"")) { m=substr(s,RSTART+length(k)+2,RLENGTH-length(k)-3); return m+0 } return 0 }
    { t+=a($0,"tests"); f+=a($0,"failures")+a($0,"errors"); s+=a($0,"skipped"); d+=a($0,"time"); n++ }
    END{ if(n>0) printf "%d %d %d %.1f\n", t,f,s,d }'
}

sec_quality_tests() {
  local jac="$ROOT/backend/target/site/jacoco/jacoco.csv" fe="$ROOT/frontend/coverage/coverage-summary.json" cov mod
  local files bt ft st line
  {
    echo "| Check | Result |"; echo "|---|---|"
    echo "| Lint (backend and frontend) | $TODO: record the lint result |"
    echo "| Typecheck | $TODO: record the typecheck result |"
    if [ -f "$jac" ]; then
      cov="$(awk -F, 'NR>1{m+=$8;c+=$9}END{if(m+c>0)printf "%.1f%% lines (%d of %d)", 100*c/(m+c), c, m+c}' "$jac")"
      echo "| Backend coverage (JaCoCo) | ${cov:-$TODO: empty JaCoCo report} |"
    else echo "| Backend coverage (JaCoCo) | $TODO: no backend/target/site/jacoco/jacoco.csv, run ./mvnw verify |"; fi
    if [ -f "$fe" ] && [ -n "$(jq -r '.total.lines.pct // empty' "$fe" 2>/dev/null)" ]; then echo "| Frontend coverage (Vitest) | $(jq -r '.total.lines.pct | tostring + "% lines"' "$fe") |"
    else echo "| Frontend coverage (Vitest) | $TODO: no frontend/coverage/coverage-summary.json |"; fi
    mod="$(ls "$ROOT"/backend/target/surefire-reports/TEST-*ModularityTests.xml 2>/dev/null | head -1 || true)"
    if [ -n "$mod" ]; then
      line="$(junit_totals "$mod")"; set -- $line
      if [ "${2:-1}" = 0 ] && [ "${1:-0}" -gt 0 ]; then echo "| Modularity verification (ModularityTests) | PASS ($1 tests) |"
      else echo "| Modularity verification (ModularityTests) | FAIL |"; fi
    else echo "| Modularity verification (ModularityTests) | $TODO: no ModularityTests report (arrives with Story 1.6) |"; fi
  } > "$W/QUALITY"

  {
    echo "| Suite | Tests | Failed | Skipped | Duration |"; echo "|---|---|---|---|---|"
    local tp=0 tf=0 ts=0 td=0 have=0
    files="$(ls "$ROOT"/backend/target/surefire-reports/TEST-*.xml 2>/dev/null || true)"
    # shellcheck disable=SC2086
    bt="$(junit_totals $files)"
    if [ -n "$bt" ]; then set -- $bt; echo "| Backend (JUnit) | $1 | $2 | $3 | ${4}s |"; tp=$((tp+$1)); tf=$((tf+$2)); ts=$((ts+$3)); td="$(awk "BEGIN{print $td+$4}")"; have=1
    else echo "| Backend (JUnit) | $TODO: no surefire reports, run ./mvnw verify | | | |"; fi
    ft="$(junit_totals "$ROOT/frontend/test-results/junit.xml" 2>/dev/null || true)"
    if [ -f "$ROOT/frontend/test-results/junit.xml" ] && [ -n "$ft" ]; then set -- $ft; echo "| Frontend (Vitest) | $1 | $2 | $3 | ${4}s |"; tp=$((tp+$1)); tf=$((tf+$2)); ts=$((ts+$3)); td="$(awk "BEGIN{print $td+$4}")"
    else echo "| Frontend (Vitest) | $TODO: no frontend/test-results/junit.xml (Vitest arrives with Story 1.8) | | | |"; fi
    st="$ROOT/build/test-reports/shell-tests.tsv"
    if [ -f "$st" ]; then
      while IFS=$'\t' read -r suite p f s; do
        [[ "$p" =~ ^[0-9]+$ && "$f" =~ ^[0-9]+$ && "$s" =~ ^[0-9]+$ ]] || { echo "| Shell: ${suite:-?} | $TODO: malformed row in shell-tests.tsv | | | |"; continue; }
        echo "| Shell: $suite | $((p+f)) | $f | 0 | ${s}s |"; tp=$((tp+p+f)); tf=$((tf+f)); td="$(awk "BEGIN{print $td+$s}")"
      done < "$st"
    else echo "| Shell suites (deploy/tests) | $TODO: run deploy/release-notes.sh shell-tests | | | |"; fi
    echo "| **Full suite** | **$tp** | **$tf** | **$ts** | **${td}s** |"
    : "$have"
  } > "$W/SUITE"

  {
    echo "New test files in this epic (added since $BASE_LABEL):"
    echo
    local added
    added="$(git -C "$ROOT" diff --name-only --diff-filter=A "$BASE_REF" HEAD -- ':(glob)deploy/tests/*.test.sh' ':(glob)backend/src/test/**/*Test*.java' ':(glob)frontend/src/**/*.test.*' 2>/dev/null | grep -v '/fixtures/' || true)"
    if [ -n "$added" ]; then printf '%s\n' "$added" | sed 's/^/- `/; s/$/`/'; else echo "- $TODO: no new test files found."; fi
    echo
    echo "| Kind | Count |"; echo "|---|---|"
    echo "| New positive tests | $TODO: count of new happy-path tests |"
    echo "| New negative tests | $TODO: count of new failure and rejection tests |"
    echo
    echo "Full non-regression suite (all tests, this commit):"
    echo
    cat "$W/SUITE"
    echo
    echo "Commands: \`./mvnw verify\` in \`backend/\`, \`npm test\` in \`frontend/\`, \`deploy/release-notes.sh shell-tests\`."
  } > "$W/TESTS"
}

sec_known() {
  local out
  out="$(grep -E '^- #[0-9]+' "$ROOT/.specs/implementation-artifacts/deferred-work.md" 2>/dev/null || true)"
  printf '%s\n' "${out:-None.}" > "$W/KNOWN_ISSUES"
}

fill_template() { # template out
  local line key
  : > "$2"
  while IFS= read -r line || [ -n "$line" ]; do
    if [[ "$line" =~ ^\{\{([A-Z_]+)\}\}$ ]]; then
      key="${BASH_REMATCH[1]}"
      cat "$W/$key" >> "$2"
    else
      line="${line//\{\{EPIC_NUM\}\}/$EPIC_N}"; line="${line//\{\{EPIC_TITLE\}\}/$EPIC_TITLE}"
      line="${line//\{\{DATE\}\}/$(date -u +%Y-%m-%d)}"; line="${line//\{\{HEAD\}\}/$HEAD_SHORT}"
      line="${line//\{\{BASE\}\}/$BASE_LABEL}"
      printf '%s\n' "$line" >> "$2"
    fi
  done < "$1"
}

cmd_generate() {
  need jq; need git
  local n force=0 file out
  n="$(epic_number "$1")"; [ "${2:-}" = "--force" ] && force=1
  EPIC_N="$n"
  file="$(ls "$EPICS_DIR"/epic-"$n"-*.md 2>/dev/null | head -1 || true)"
  [ -n "$file" ] || die "no epic file epic-$n-*.md in $EPICS_DIR"
  local slug
  slug="$(basename "$file" .md)"
  EPIC_TITLE="$(awk '/^---$/{n++;next} n==1&&/^title:/{sub(/^title:[ ]*/,"");gsub(/^["\047]|["\047]$/,"");print;exit}' "$file")"
  [ -n "$EPIC_TITLE" ] || die "$file has no title: line in its front matter"
  [ -f "$TEMPLATE" ] || die "missing $TEMPLATE"
  out="$NOTES_DIR/$slug.md"
  if [ -e "$out" ] && [ "$force" = 0 ]; then die "$out exists; use --force to regenerate (this discards edits)"; fi

  local prev
  prev="epic-$(printf '%02d' $((10#$n - 1)))"
  if [ "$((10#$n))" -gt 1 ] && git -C "$ROOT" rev-parse -q --verify "refs/tags/$prev" >/dev/null; then
    BASE_REF="$prev"; BASE_LABEL="tag \`$prev\`"; RANGE="$prev..HEAD"
  elif [ "$((10#$n))" -gt 1 ]; then
    die "previous epic tag $prev not found; tag it first (deploy/release-notes.sh tag $((10#$n - 1)))"
  else
    BASE_REF=4b825dc642cb6eb9a060e54bf8d69288fbee4904; BASE_LABEL="the start of the repository (first epic)"; RANGE="HEAD"
  fi
  if [ -n "$(git -C "$ROOT" status --porcelain 2>/dev/null)" ]; then
    echo "release-notes: warning: uncommitted changes; the note describes commits only (generate from a clean tree)" >&2
  fi
  HEAD_SHORT="$(git -C "$ROOT" rev-parse --short HEAD)"

  W="$(mktemp -d)"; trap 'rm -rf "$W"' EXIT
  sec_stories "$n" "$file"; sec_changes; sec_integration; sec_security; sec_quality_tests; sec_known
  mkdir -p "$NOTES_DIR"
  fill_template "$TEMPLATE" "$out"
  echo "release-notes: wrote ${out#"$ROOT"/} ($(grep -c "$TODO" "$out" || true) TODO(author) to resolve)"
}

# ---- check --------------------------------------------------------------------------------
cmd_check() {
  local file="" strict=0 a status fails=0 todos
  for a in "$@"; do case "$a" in --strict) strict=1 ;; *) file="$a" ;; esac; done
  if [ -z "$file" ] || [ ! -f "$file" ]; then die "usage: release-notes.sh check [--strict] <note.md>"; fi
  local orig="$file" tmp
  tmp="$(mktemp)"
  # CRLF tolerated; HTML comments (the template's own instructions) are not content.
  tr -d '\r' < "$orig" | awk '/<!--/{c=1} !c{print} /-->/{c=0}' > "$tmp"; file="$tmp"
  fail() { echo "FAIL $1"; fails=$((fails + 1)); }

  status="$(sed -n -E 's/^Status: *(draft|done) *$/\1/p' "$file" | head -1)"
  [ -n "$status" ] || fail "no 'Status: draft' or 'Status: done' line"
  [ "$strict" = 1 ] && status="done"

  local h
  for h in Summary "New features" Changes "Integration notes" Security "Code quality" "Test results" "Known issues"; do
    grep -q "^## $h\$" "$file" || fail "missing section '## $h'"
  done

  local kev hc
  kev="$(sed -n -E 's/^- KEV findings \(not excepted\): *([^ ]+).*$/\1/p' "$file" | head -1)"
  hc="$(sed -n -E 's/^- High or Critical findings \(not excepted\): *([^ ]+).*$/\1/p' "$file" | head -1)"
  [ "$kev" = 0 ] || fail "KEV findings is '${kev:-missing}', must be 0"
  [ "$hc" = 0 ] || fail "High or Critical findings is '${hc:-missing}', must be 0"
  grep -qE '^- Scan result: PASS\.' "$file" || fail "security scan result is not PASS"

  local row suitefail
  row="$(grep -E '^\| \*\*Full suite\*\*' "$file" | head -1)"
  suitefail="$(printf '%s' "$row" | awk -F'|' '{gsub(/[* ]/,"",$4); print $4}')"
  [ -n "$row" ] || fail "no 'Full suite' row in Test results"
  [ -z "$row" ] || [ "$suitefail" = 0 ] || fail "the full suite has $suitefail failed tests"
  grep -qE 'ModularityTests\) \| FAIL' "$file" && fail "modularity verification failed"
  todos="$(grep -c 'TODO(author)' "$file" || true)"
  if [ "$todos" -gt 0 ]; then
    if [ "$status" = "done" ]; then
      fail "$todos TODO(author) remain:"; grep -n 'TODO(author)' "$file" | sed 's/^/     line /' | cut -c1-140
    else echo "note: $todos TODO(author) remain (allowed while Status is draft)"; fi
  fi
  # Bookkeeping (#101): a done note needs every story spec of its epic done, and a strict check needs the
  # note's Commit on main. Missing evidence fails; it is never read as "nothing to check".
  if [ "$status" = "done" ]; then
    local epic spec specs=0 st
    # The title line ("# Release note: Epic 02, ...") names the epic; the file name is the fallback.
    epic="$(sed -n -E 's/^# Release note: Epic 0*([0-9]+).*$/\1/p' "$file" | head -1)"
    [ -n "$epic" ] || epic="$(basename "$orig" | sed -n -E 's/^epic-0*([0-9]+)-.*$/\1/p')"
    if [ -z "$epic" ]; then fail "cannot tell which epic the note is for (no 'Release note: Epic NN' title, no epic-NN file name)"
    else
      for spec in "$SPECS_DIR"/spec-"$epic"-*.md; do
        [ -f "$spec" ] || continue
        specs=$((specs + 1))
        st="$(awk 'NR==1 && $0!="---"{exit} NR>1 && $0=="---"{exit} /^status:/{print; exit}' "$spec" | sed -E "s/^status: *//; s/^['\"]//; s/['\"] *$//; s/ *$//")"
        [ "$st" = "done" ] || fail "story spec $(basename "$spec") has status '${st:-missing}', must be done"
      done
      [ "$specs" -gt 0 ] || fail "no story specs spec-$epic-*.md found in ${SPECS_DIR#"$ROOT"/}"
    fi
  fi
  if [ "$strict" = 1 ]; then
    local hash
    hash="$(sed -n -E 's/^\| Commit \| *([0-9a-f]{7,40}) *\|.*$/\1/p' "$file" | head -1)"
    if [ -z "$hash" ]; then fail "no 'Commit' row with a commit hash"
    elif ! git -C "$ROOT" merge-base --is-ancestor "$hash" "$MAIN_REF" 2>/dev/null; then
      fail "the Commit '$hash' is not a commit on $MAIN_REF; replace it with the squash commit"
    fi
  fi
  rm -f "$tmp"
  if [ "$fails" -gt 0 ]; then echo "release-notes check: FAILED ($fails)"; return 1; fi
  echo "release-notes check: OK ($status)"
}

cmd_tag() {
  local n slug file
  n="$(epic_number "$1")"
  file="$(ls "$NOTES_DIR"/epic-"$n"-*.md 2>/dev/null | head -1 || true)"
  [ -n "$file" ] || die "no release note for epic $n; run deploy/release-notes.sh $((10#$n))"
  [ -z "$(git -C "$ROOT" status --porcelain -- . 2>/dev/null)" ] || die "uncommitted changes; commit the finished note first"
  cmd_check --strict "$file" || die "the release note does not pass the check; not tagging"
  slug="epic-$n"
  git -C "$ROOT" rev-parse -q --verify "refs/tags/$slug" >/dev/null && die "tag $slug already exists"
  git -C "$ROOT" tag -a "$slug" -m "Epic $((10#$n)) closed" HEAD
  echo "release-notes: tagged $(git -C "$ROOT" rev-parse --short HEAD) as $slug (local; push with: git push origin $slug)"
}

cmd_shell_tests() {
  local out="$ROOT/build/test-reports/shell-tests.tsv" t s e p f log rc=0
  mkdir -p "$(dirname "$out")"; : > "$out"
  for t in "$ROOT"/deploy/tests/*.test.sh; do
    s=$SECONDS
    log="$(bash "$t" 2>&1)" || rc=1
    e=$((SECONDS - s))
    p="$(printf '%s\n' "$log" | grep -c '^ok' || true)"
    f="$(printf '%s\n' "$log" | grep -c '^FAIL' || true)"
    if [ "$f" = 0 ] && ! bash -n "$t" 2>/dev/null; then f=1; fi
    printf '%s\t%s\t%s\t%s\n' "$(basename "$t" .test.sh)" "$p" "$f" "$e" >> "$out"
    echo "$(basename "$t"): $p passed, $f failed, ${e}s"
  done
  return "$rc"
}

case "${1:-}" in
  ""|-h|--help) sed -n '2,16p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; [ -n "${1:-}" ] ;;
  check) shift; cmd_check "$@" ;;
  tag) shift; [ "$#" -ge 1 ] || die "usage: release-notes.sh tag <epic>"; cmd_tag "$1" ;;
  shell-tests) cmd_shell_tests ;;
  *) cmd_generate "$@" ;;
esac
