# eval/guardrails

Guardrail cases, tagged `guardrail-eval`. Each file holds a list of `cases`; a case has a `name`, `tags` and
`steps`. A step gives the Restriction set the Guardrail sees (`restrictions` with `text`, optional `goal`
(`a` or `b`), `retired` and `avoidTerms`; `sensitivities` with `text` and `avoid`), the `scope`
(`family`, `goal-a` or `goal-b`), `lookup: throws` to make the lookup unavailable, the `items` to check
(`kind`, `origin`, `text`) and what is `expect`ed for each (`outcome` of `keep` or `drop`, and `flags`).
`versionChanged: true|false` asserts whether the set's version differs from the previous step's.

They need no model, so they run in the default `./mvnw verify` through `GuardrailEvalFilesTest`, and again
under the `guardrail-eval` tag through `GuardrailEvalTaggedTest`, which the pom excludes until Epic 13 (run it
from the IDE). A case that needs a model is tagged
`needs-model` and is skipped by the untagged run (none yet; Epic 13).
