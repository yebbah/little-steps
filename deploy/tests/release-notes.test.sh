#!/usr/bin/env bash
# shellcheck disable=SC2001  # sed prefixes every line of the captured output
# Tests for deploy/release-notes.sh. Plain bash, no framework, no network: a throwaway git repo
# holds the fixture epic, reports and tags.
#   deploy/tests/release-notes.test.sh

set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="$HERE/../release-notes.sh"
TEMPLATE_SRC="$HERE/../../docs/release-notes/TEMPLATE.md"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

pass=0; fail=0
# check NAME EXPECTED_EXIT PATTERN COMMAND...
check() {
  local name="$1" want="$2" pattern="$3"; shift 3
  local out code
  out="$("$@" 2>&1)"; code=$?
  if [ "$code" -eq "$want" ] && echo "$out" | tr "\n" " " | grep -Eq -- "$pattern"; then
    pass=$((pass + 1)); echo "ok   $name"
  else
    fail=$((fail + 1)); echo "FAIL $name (exit $code, wanted $want, pattern: $pattern)"; echo "$out" | sed 's/^/     | /'
  fi
}
# has NAME FILE PATTERN : the generated note contains the pattern
has() { # NAME FILE PATTERN (line-based, so ^ and $ anchors work)
  if grep -Eq -- "$3" "$2"; then pass=$((pass + 1)); echo "ok   $1"; else fail=$((fail + 1)); echo "FAIL $1 (not found: $3)"; fi
}
hasnt() { # NAME FILE PATTERN
  if grep -Eq -- "$3" "$2"; then fail=$((fail + 1)); echo "FAIL $1 (found: $3)"; else pass=$((pass + 1)); echo "ok   $1"; fi
}

git_q() { git -C "$R" -c user.email=t@example.com -c user.name=t -c commit.gpgsign=false -c tag.gpgsign=false "$@"; }

# make_repo DIR : a fixture repo with epic 1 (two stories), one changelog and report, images, env, compose
make_repo() {
  R="$1"; mkdir -p "$R"/{deploy,docs/release-notes,docs/changelogs,docs/security-reports,.specs/planning-artifacts/epics,.specs/implementation-artifacts,build/security}
  git init -q -b main "$R"
  echo 'build/' > "$R/.gitignore"
  cp "$TEMPLATE_SRC" "$R/docs/release-notes/TEMPLATE.md"
  cat > "$R/.specs/planning-artifacts/epics/epic-01-first-epic.md" <<'EOT'
---
epic: 1
title: First epic
---
# Epic 1: First epic
### Story 1.1: Scaffold
### Story 1.2: Scan
EOT
  cat > "$R/.specs/planning-artifacts/epics/epic-02-second-epic.md" <<'EOT'
---
title: Second epic
---
### Story 2.1: Tokens
EOT
  local s
  for s in 1-1-scaffold 1-2-scan 2-1-tokens; do
    printf -- "---\ntitle: 'Story %s'\nstatus: 'done'\n---\n# body\nstatus: not frontmatter\n" "${s%%-*}.${s#*-}" > "$R/.specs/implementation-artifacts/spec-$s.md"
  done
  printf '# Changelog\n\n## Summary\n\nAdds the scaffold.\n\n## Added\n' > "$R/docs/changelogs/story-1-1-scaffold.md"
  printf '# Security report\n' > "$R/docs/security-reports/story-1-1-scaffold.md"
  printf 'LS_APP_PORT=8080\nLS_DB_PASSWORD=change-me\n' > "$R/deploy/local.env.example"
  printf 'services:\n  postgres:\n    image: x\n  app:\n    image: y\n' > "$R/deploy/compose.yaml"
  cat > "$R/deploy/images.yaml" <<'EOT'
images:
  - name: dhi.io/postgres
    source: dhi
    tag: "18"
    digest: sha256:1
  - name: axllent/mailpit
    source: other
    tag: "v1"
    digest: sha256:2
    reason: Not in the DHI catalog.
EOT
  printf -- '- #56  2026-12-04  A deferred item  (origin #28, Story 1.3)\n' > "$R/.specs/implementation-artifacts/deferred-work.md"
  scan_ok "$R"
  git_q add -A >/dev/null; git_q commit -qm "feat: first" >/dev/null
}

# scan_ok DIR [KEV [HIGH]] : fixture scan reports with the given counts of unexcepted findings
scan_ok() {
  local d="$1" kev="${2:-0}" high="${3:-0}" findings='[]'
  mkdir -p "$d/build/security"
  findings="$(jq -n --argjson kev "$kev" --argjson high "$high" '
    [ range(0;$kev) | {severity:"Medium",cvss:5,kev:true,status:"block"} ]
    + [ range(0;$high) | {severity:"High",cvss:8,kev:false,status:"block"} ]
    + [ {severity:"High",cvss:7.5,kev:false,status:"excepted"}, {severity:"Low",cvss:2,kev:false,status:"warn"} ]')"
  jq -n --argjson f "$findings" '{generated:"2026-11-06T10:00:00Z",targets:[{target:"images",components:3,findings:$f,status:"PASS"}],
    activeExceptions:[{cve:"CVE-2099-1",reason:"No fix",mitigation:"m",expires:"2026-12-04"}]}' > "$d/build/security/report.json"
  printf 'Security scan 2026-11-06T10:00:00Z\ngrype 0.121.2, syft 1.57.0, gitleaks 8.30.1\nRESULT: PASS\n' > "$d/build/security/summary.txt"
  echo '{}' > "$d/build/security/frontend.sbom.json"
}

NOTE() { echo "$R/docs/release-notes/epic-01-first-epic.md"; }
rn() { LS_ROOT="$R" "$SCRIPT" "$@"; }

# ---- generation: positive ----------------------------------------------------------------
make_repo "$TMP/a"; R="$TMP/a"
mkdir -p "$R/backend/target/surefire-reports" "$R/backend/target/site/jacoco" "$R/frontend/coverage" "$R/frontend/test-results" "$R/build/test-reports"
cat > "$R/backend/target/surefire-reports/TEST-a.xml" <<'EOT'
<testsuite name="a" time="1.5" tests="10" errors="0" skipped="1" failures="0">
EOT
cat > "$R/backend/target/surefire-reports/TEST-ModularityTests.xml" <<'EOT'
<testsuite name="app.ModularityTests" time="0.5" tests="2" errors="0" skipped="0" failures="0">
EOT
printf 'GROUP,PACKAGE,CLASS,IM,IC,BM,BC,LM,LC\napp,p,C,0,0,0,0,20,80\n' > "$R/backend/target/site/jacoco/jacoco.csv"
echo '{"total":{"lines":{"pct":91.5}}}' > "$R/frontend/coverage/coverage-summary.json"
echo '<testsuites><testsuite name="f" tests="5" failures="0" skipped="0" time="2.0"></testsuite></testsuites>' > "$R/frontend/test-results/junit.xml"
printf 'check-images\t24\t0\t2\n' > "$R/build/test-reports/shell-tests.tsv"
check "generate epic 1" 0 "wrote docs/release-notes/epic-01-first-epic.md" rn 1
N="$(NOTE)"
has "title from the epic file" "$N" "Epic 01, First epic"
has "story entry uses the changelog summary" "$N" "Story 1\.1, Scaffold\.\*\* Adds the scaffold\."
has "story links its security report" "$N" "story-1-1-scaffold\.md\)\)"
has "story without changelog is a TODO" "$N" "Story 1\.2, Scan\.\*\* TODO\(author\)"
has "commits listed" "$N" "feat: first"
has "first epic compares with repo start" "$N" "first epic"
has "env keys listed" "$N" "LS_DB_PASSWORD"
has "services listed" "$N" "postgres, app"
has "ports listed" "$N" "LS_APP_PORT=8080"
has "non-DHI image warned" "$N" "WARNING: axllent/mailpit:v1 is not a Docker Hardened Image"
hasnt "DHI image not warned" "$N" "WARNING: dhi.io/postgres"
has "scan date and tools" "$N" "2026-11-06T10:00:00Z\. Tool versions: grype 0\.121\.2, syft 1\.57\.0, gitleaks 8\.30\.1"
has "scan result" "$N" "Scan result: PASS\."
has "KEV count 0" "$N" "^- KEV findings \(not excepted\): 0$"
has "High/Critical count 0 (excepted ignored)" "$N" "^- High or Critical findings \(not excepted\): 0$"
has "severity table counts the excepted High" "$N" "\| High \| 1 \| 1 \|"
has "exception with expiry" "$N" "\| CVE-2099-1 \| 2026-12-04 \|"
has "SBOM location" "$N" "build/security/frontend\.sbom\.json"
has "story security reports linked" "$N" "\[story-1-1-scaffold\]"
has "backend coverage" "$N" "80\.0% lines \(80 of 100\)"
has "frontend coverage" "$N" "91\.5% lines"
has "modularity result" "$N" "ModularityTests\) \| PASS \(2 tests\)"
has "backend test counts" "$N" "Backend \(JUnit\) \| 12 \| 0 \| 1 \| 2\.0s"
has "frontend test counts" "$N" "Frontend \(Vitest\) \| 5 \| 0 \| 0 \| 2\.0s"
has "shell suite counts" "$N" "Shell: check-images \| 24 \| 0 \| 0 \| 2s"
has "full suite total" "$N" "Full suite\*\* \| \*\*41\*\* \| \*\*0\*\* \| \*\*1\*\* \| \*\*6s\*\*"
has "known issues from the index" "$N" "#56  2026-12-04  A deferred item"
has "starts as draft" "$N" "^Status: draft$"
hasnt "no unfilled placeholder" "$N" "\{\{[A-Z_]+\}\}"
hasnt "no absolute local path" "$N" "/Users/|/home/|/private/"

# ---- generation: negative ----------------------------------------------------------------
check "refuses to overwrite" 1 "exists; use --force" rn 1
check "--force regenerates" 0 "wrote" rn 1 --force
check "non-numeric epic" 1 "must be a number" rn one
check "unknown epic" 1 "no epic file epic-09" rn 9
check "epic 2 needs the epic-01 tag" 1 "previous epic tag epic-01 not found" rn 2
check "no scan reports gives TODOs, not zeros" 0 "wrote" env LS_ROOT="$R" bash -c "rm -rf '$R/build/security'; '$SCRIPT' 1 --force"
has "missing reports flagged" "$N" "no scan reports in build/security"
has "missing KEV count is not a number" "$N" "KEV findings \(not excepted\): TODO\(author\)"
scan_ok "$R"
rn 1 --force >/dev/null 2>&1

# ---- second epic: base is the previous tag -------------------------------------------------
git_q tag epic-01
printf 'LS_APP_PORT=8080\nLS_DB_PASSWORD=change-me\nLS_NEW_KEY=1\n' > "$R/deploy/local.env.example"
mkdir -p "$R/backend/src/main/resources/db/migration"; echo 'select 1;' > "$R/backend/src/main/resources/db/migration/V2__x.sql"
git_q add -A >/dev/null; git_q commit -qm "feat: second" >/dev/null
check "generate epic 2" 0 "epic-02-second-epic.md" rn 2
N2="$R/docs/release-notes/epic-02-second-epic.md"
has "only new env keys" "$N2" "LS_NEW_KEY"
hasnt "old env keys not repeated" "$N2" "LS_DB_PASSWORD\`$"
has "new migration listed" "$N2" "V2__x\.sql"
has "commits since the previous tag" "$N2" "feat: second"
hasnt "earlier commits excluded" "$N2" "feat: first"
has "compared with the tag" "$N2" "tag \`epic-01\`"

# ---- check ---------------------------------------------------------------------------------
check "draft with TODOs passes" 0 "OK \(draft\)" rn check "$N"
sed 's/^Status: draft/Status: done/' "$N" > "$TMP/done.md"
check "done with TODOs fails" 1 "TODO\(author\) remain.*FAILED" rn check "$TMP/done.md"
check "--strict ignores a draft status" 1 "TODO\(author\) remain" rn check --strict "$N"
sed 's/TODO(author)[^|]*//' "$TMP/done.md" > "$TMP/clean.md"
check "finished note passes" 0 "OK \(done\)" rn check "$TMP/clean.md"
sed 's/^- KEV findings (not excepted): 0/- KEV findings (not excepted): 2/' "$TMP/clean.md" > "$TMP/kev.md"
check "KEV count not 0 fails" 1 "KEV findings is '2'" rn check "$TMP/kev.md"
sed 's/^- High or Critical findings (not excepted): 0/- High or Critical findings (not excepted): 1/' "$TMP/clean.md" > "$TMP/high.md"
check "High/Critical count not 0 fails" 1 "High or Critical findings is '1'" rn check "$TMP/high.md"
check "KEV count fails even for a draft" 1 "KEV findings is '2'" rn check "$(sed 's/^Status: done/Status: draft/' "$TMP/kev.md" > "$TMP/kevd.md"; echo "$TMP/kevd.md")"
grep -v '^- KEV findings' "$TMP/clean.md" > "$TMP/nokev.md"
check "missing KEV line fails" 1 "KEV findings is 'missing'" rn check "$TMP/nokev.md"
sed 's/Scan result: PASS/Scan result: FAIL/' "$TMP/clean.md" > "$TMP/scanfail.md"
check "failed scan fails" 1 "scan result is not PASS" rn check "$TMP/scanfail.md"
sed 's/^## Known issues/## Other/' "$TMP/clean.md" > "$TMP/nosec.md"
check "missing section fails" 1 "missing section '## Known issues'" rn check "$TMP/nosec.md"
grep -v '^Status:' "$TMP/clean.md" > "$TMP/nostatus.md"
check "missing Status line fails" 1 "no 'Status" rn check "$TMP/nostatus.md"
check "check without a file" 1 "usage" rn check
check "check with a missing file" 1 "usage" rn check "$TMP/none.md"

sed 's/^| \*\*Full suite\*\* | \*\*\([0-9]*\)\*\* | \*\*0\*\*/| **Full suite** | **\1** | **3**/' "$TMP/clean.md" > "$TMP/suitefail.md"
check "failed tests in the suite fail the check" 1 "full suite has 3 failed" rn check "$TMP/suitefail.md"
sed 's/PASS (2 tests)/FAIL/' "$TMP/clean.md" > "$TMP/modfail.md"
check "failed modularity verification fails" 1 "modularity verification failed" rn check "$TMP/modfail.md"
sed 's/$/\r/' "$TMP/clean.md" > "$TMP/crlf.md"
# ---- check: bookkeeping (#101) -------------------------------------------------------------
SP="$R/.specs/implementation-artifacts"
sed -i.bak "s/^status: 'done'/status: 'in-review'/" "$SP/spec-1-2-scan.md"; rm -f "$SP/spec-1-2-scan.md.bak"
check "a story spec that is not done fails a done note" 1 "spec-1-2-scan.md has status 'in-review'.*FAILED" rn check "$TMP/clean.md"
check "a story spec that is not done fails --strict too" 1 "spec-1-2-scan.md has status 'in-review'" rn check --strict "$TMP/clean.md"
sed 's/^Status: done/Status: draft/' "$TMP/clean.md" > "$TMP/cleand.md"
check "a draft note skips the story spec check" 0 "OK \(draft\)" rn check "$TMP/cleand.md"
sed -i.bak "s/^status: 'in-review'/status: 'done'/" "$SP/spec-1-2-scan.md"; rm -f "$SP/spec-1-2-scan.md.bak"
check "all story specs done passes again" 0 "OK \(done\)" rn check "$TMP/clean.md"
printf -- "---\ntitle: 'Story 1.2'\n---\n" > "$SP/spec-1-2-scan.md"
check "a story spec with no status fails" 1 "spec-1-2-scan.md has status 'missing'" rn check "$TMP/clean.md"
printf -- "---\ntitle: 'Story 1.2'\nstatus: 'done'\n---\n" > "$SP/spec-1-2-scan.md"
mkdir -p "$TMP/nospecs"
check "an epic with no story specs fails" 1 "no story specs spec-1-\*.md found" env LS_SPECS_DIR="$TMP/nospecs" LS_ROOT="$R" "$SCRIPT" check "$TMP/clean.md"
sed 's/^# Release note: Epic 01.*/# Release note/' "$TMP/clean.md" > "$TMP/notitle.md"
check "a note that names no epic fails" 1 "cannot tell which epic" rn check "$TMP/notitle.md"
check "a note without a Commit row fails --strict" 1 "no 'Commit' row" rn check --strict "$(grep -v '^| Commit |' "$TMP/clean.md" > "$TMP/nocommit.md"; echo "$TMP/nocommit.md")"
check "a Commit on main passes --strict" 0 "OK \(done\)" rn check --strict "$TMP/clean.md"
sed 's/^| Commit | [0-9a-f]* |/| Commit | 1234567 |/' "$TMP/clean.md" > "$TMP/badhash.md"
check "a Commit that does not exist fails --strict" 1 "Commit '1234567' is not a commit on main" rn check --strict "$TMP/badhash.md"
check "a done note before the merge may name a Commit not yet on main" 0 "OK \(done\)" rn check "$TMP/badhash.md"
git_q checkout -q -b side; git_q commit -q --allow-empty -m "side only"; SIDE="$(git_q rev-parse --short HEAD)"; git_q checkout -q main
sed "s/^| Commit | [0-9a-f]* |/| Commit | $SIDE |/" "$TMP/clean.md" > "$TMP/side.md"
check "a pre-squash Commit on another branch fails --strict" 1 "Commit '$SIDE' is not a commit on main" rn check --strict "$TMP/side.md"
check "CRLF note passes" 0 "OK \(done\)" rn check "$TMP/crlf.md"
check "template comment does not count as a TODO" 0 "OK \(done\)" rn check "$TMP/clean.md"

# ---- robustness of the inputs ---------------------------------------------------------------
make_repo "$TMP/c"; R="$TMP/c"
echo '{"targets":[],"generated":"x"}' > "$R/build/security/report.json"
check "empty scan targets give a TODO, not a green zero" 0 "wrote" rn 1
has "empty targets flagged" "$(NOTE)" "has no scan targets"
echo '{"generated":"2026-11-06T10:00:00Z","targets":[{"target":"t","components":1,"findings":[{"severity":"high","cvss":"8.1","kev":false,"status":"block"}]}]}' > "$R/build/security/report.json"
rn 1 --force >/dev/null 2>&1
has "lowercase severity and string CVSS are counted" "$(NOTE)" "^- High or Critical findings \(not excepted\): 1$"
mkdir -p "$R/frontend/coverage"; echo '{}' > "$R/frontend/coverage/coverage-summary.json"
rn 1 --force >/dev/null 2>&1
has "empty coverage summary is a TODO" "$(NOTE)" "Frontend coverage \(Vitest\) \| TODO"
mkdir -p "$R/build/test-reports"; printf 'a\tx\t\t3\n' > "$R/build/test-reports/shell-tests.tsv"
check "malformed shell-tests.tsv does not abort" 0 "wrote" rn 1 --force
has "malformed row flagged" "$(NOTE)" "malformed row in shell-tests.tsv"
make_repo "$TMP/d"; R="$TMP/d"
sed -i.bak 's/^title: First epic/title: "Build \& Deploy"/' "$R/.specs/planning-artifacts/epics/epic-01-first-epic.md"
rn 1 >/dev/null 2>&1
has "quoted title with ampersand stays literal" "$(NOTE)" "^# Release note: Epic 01, Build & Deploy$"
R="$TMP/a"

# ---- tag -----------------------------------------------------------------------------------
git_q add -A >/dev/null; git_q commit -qm "docs: draft note" >/dev/null
check "tag refused while TODOs remain" 1 "does not pass the check; not tagging" rn tag 2
cp "$TMP/clean.md" "$N2"
sed -i.bak 's/Epic 01/Epic 02/' "$N2"; rm -f "$N2.bak"
check "tag refused with an uncommitted note" 1 "uncommitted changes" rn tag 2
git_q add -A >/dev/null; git_q commit -qm "docs: finish note" >/dev/null
check "tag creates epic-02" 0 "tagged .* as epic-02" rn tag 2
check "tag exists in git" 0 "epic-02" git -C "$R" tag
check "tag refused when it exists" 1 "tag epic-02 already exists" rn tag 2
check "tag without a note" 1 "no release note for epic 03" rn tag 3
check "tag needs an epic" 1 "usage" rn tag

# ---- shell-tests ----------------------------------------------------------------------------
make_repo "$TMP/b"; R="$TMP/b"; mkdir -p "$R/deploy/tests"
printf '#!/usr/bin/env bash\necho "ok   one"\necho "ok   two"\necho "FAIL three"\nexit 1\n' > "$R/deploy/tests/x.test.sh"
check "shell-tests records counts and fails when a suite fails" 1 "x\.test\.sh: 2 passed, 1 failed" rn shell-tests
check "shell-tests writes the tsv" 0 "x.2.1.[0-9]+" cat "$R/build/test-reports/shell-tests.tsv"

echo
echo "passed: $pass, failed: $fail"
[ "$fail" -eq 0 ]
