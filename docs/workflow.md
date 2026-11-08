# Development workflow

The decision trees behind the policies, drawn once. This page only draws them: the rules live in [CONTRIBUTING.md](CONTRIBUTING.md), the scan policy in [security/README.md](../security/README.md), the deferred process in [deferred-items.md](deferred-items.md) and the CI job list in the [README](../README.md#continuous-integration). If a diagram and its rule disagree, the rule wins: fix the diagram.

## 1. A change arrives: spec first

Rule: [Spec first](CONTRIBUTING.md#spec-first).

```mermaid
flowchart TD
  A["Change wanted: feature, bug or found deviation"] --> B{"Do the specs already<br/>describe the intended behaviour?"}
  B -- "yes: the code is the bug" --> F["Raise the issue"]
  B -- "no: the change would cause drift" --> C["Run the spec update<br/>(SPEC, PRD, architecture, UX, epics)"]
  C --> D{"Human confirms<br/>the spec change?"}
  D -- "no" --> C
  D -- "yes" --> E["Update every affected document<br/>in the same pass"]
  E --> F
  F --> G["Branch from main, implement"]
  G --> H["PR links the issue and the spec change"]
```

## 2. A story, start to merge

Rules: [Branching](CONTRIBUTING.md#branching), [Security gate](CONTRIBUTING.md#security-gate), [Finishing a story](CONTRIBUTING.md#finishing-a-story).

```mermaid
flowchart TD
  S["Story starts"] --> M["git checkout main, git pull, new branch<br/>(never ask which branch)"]
  M --> W["Write code and tests"]
  W --> C["git commit"]
  C --> HK{"pre-commit hook:<br/>deploy/security-scan.sh run"}
  HK -- "blocking finding" --> FIX["Fix, or written exception<br/>(section 4)"]
  FIX --> C
  HK -- "pass" --> W2{"More work?"}
  W2 -- "yes" --> W
  W2 -- "no" --> SC1["Scan 1 of 2: before validation"]
  SC1 --> R["Three-reviewer pass:<br/>blind, edge cases, verification gaps"]
  R --> T["Triage every finding (section 3)"]
  T --> ART["Changelog + security report + README review"]
  ART --> V{"Human validates?"}
  V -- "changes needed" --> W
  V -- "yes" --> SC2["Scan 2 of 2: after the last fix"]
  SC2 --> DEF["Deferred items become issues,<br/>index sync check"]
  DEF --> PR["Push, open PR: Closes #N"]
  PR --> CI{"CI green? (section 5)"}
  CI -- "no" --> W
  CI -- "yes" --> SQ["Squash-merge to main, close the story issue"]
```

The review pass, changelog and security report all exist before the human is asked to validate.

## 3. Review triage routing

Rule: [Review triage log format](CONTRIBUTING.md#review-triage-log-format).

```mermaid
flowchart TD
  F["Finding"] --> Q{"Real?"}
  Q -- "no" --> REJ["Verdict false, route: rejected<br/>(reason in Evidence)"]
  Q -- "yes" --> P{"Fix in this story?"}
  P -- "yes" --> PF["patch, fixed<br/>(test or check shown)"]
  P -- "no" --> SPEC{"Does the fix change a spec?"}
  SPEC -- "yes" --> SF["Spec first (section 1)<br/>then route again"]
  SPEC -- "no" --> DF["defer #issue<br/>(section 6)"]
  F --> IG{"Spec unclear or contradicted?"}
  IG -- "yes" --> IGR["intent_gap, resolved<br/>by the human, spec updated"]
```

A row never stays plain `patch` at the second scan or the last commit.

## 4. Security finding

Rule: [security/README.md](../security/README.md#blocking-rule).

```mermaid
flowchart TD
  X["Scan finding"] --> K{"In CISA KEV, or CVSS 7.0+,<br/>or unscored High/Critical?"}
  K -- "no" --> WARN["Passes with a warning<br/>(deferred issue if it needs follow-up)"]
  K -- "yes" --> FV{"Fix available?<br/>(images: in the latest image of the tag)"}
  FV -- "yes" --> UP["Upgrade, replace or remove the component"]
  FV -- "no" --> EX["Entry in security/exceptions.yaml:<br/>reason, mitigation, expiry at most 30 days"]
  EX --> ISS["One deferred issue per set, target date = expiry"]
  ISS --> REL["Listed in the epic release note"]
```

## 5. Continuous integration

Rule: [Continuous integration](CONTRIBUTING.md#continuous-integration). Jobs and artifacts: [README](../README.md#continuous-integration). Workflow: [ci.yml](../.github/workflows/ci.yml).

```mermaid
flowchart LR
  E["push or pull request"] --> J1["Backend<br/>mvnw verify, tests, JaCoCo, SBOM,<br/>required test reports exist"]
  E --> J2["Frontend<br/>lint, typecheck, Vitest, build,<br/>OpenAPI drift check"]
  E --> JA["Frontend: accessibility<br/>Playwright, axe, reflow"]
  E --> J3["Scripts<br/>action SHA pins, shellcheck,<br/>images.yaml digests"]
  E --> J4["Security<br/>secrets, backend and frontend<br/>dependency scan"]
  J1 --> G{"All five green?"}
  J2 --> G
  JA --> G
  J3 --> G
  J4 --> G
  G -- "yes" --> OK["Mergeable"]
  G -- "no" --> NO["Fix and push again, never merge on red"]
  J1 -.-> ART["Artifacts: backend-reports,<br/>frontend-reports, security-reports"]
  J4 -.-> ART
  ART -.-> RN["Epic release note"]
  MAN["By hand before a release:<br/>scan images, scan app-image"] -.-> RN
```

## 6. Deferred item

Rule: [Deferred items](CONTRIBUTING.md#deferred-items), process in [deferred-items.md](deferred-items.md).

```mermaid
flowchart TD
  D["Item parked instead of fixed"] --> SP{"Would completing it<br/>change a spec?"}
  SP -- "yes" --> SF["Not deferrable: spec first (section 1)"]
  SP -- "no" --> I["deferred issue: Origin, target date, remediation"]
  I --> X["Index line in deferred-work.md,<br/>link from changelog and security report"]
  X --> TR["Triage row: defer #issue"]
  TR --> CL["Done: close issue, remove index line"]
```

## 7. Finishing an epic

Rule: [Finishing an epic](CONTRIBUTING.md#finishing-an-epic).

```mermaid
flowchart TD
  A["Last story merged"] --> B["Full scan, mvnw verify,<br/>frontend tests, shell tests"]
  B --> C["release-notes.sh epic"]
  C --> D["Write narrative, remove TODO(author), Status: done"]
  D --> E{"release-notes.sh check passes?<br/>(no TODO, KEV and High/Critical = 0,<br/>every story spec done)"}
  E -- "no" --> D
  E -- "yes" --> F["Merge, tag main, push the tag"]
  F --> G["Retrospective reviews open deferred issues"]
```

## 8. Epic and story issues

Rule: [Issues](CONTRIBUTING.md#issues).

```mermaid
flowchart TD
  E["Epic approved"] --> EI["Epic issue #N+1<br/>labels: epic, P1 or P2"]
  E --> SI["One sub-issue per story<br/>labels: story, P1 or P2, full story text"]
  SI --> LINK["gh issue edit --parent: epic issue<br/>carries 'Tracked as sub-issues #X to #Y'"]
  SI --> ST["Story branch, PR 'Closes #story' (section 2)"]
  ST --> SC["Story issue closed with a short comment"]
  SC --> LAST{"Last story of the epic?"}
  LAST -- "no" --> SI
  LAST -- "yes" --> REL["Epic finish (section 7), then close the epic issue"]
  CR["Change request or bug"] --> SPEC["Spec first (section 1) before the issue is created"]
```

## Keeping this current

Update this page in any change to a policy or to the CI workflow, in the same PR.
