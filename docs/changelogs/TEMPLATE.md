# Changelog: Story {N.M}, {story title}

<!--
One changelog per story, from this template, in docs/changelogs/story-{N}-{M}-{slug}.md.
Written when the story implementation is complete, before the final commit of the story.
Fill every section; write "None" rather than deleting one.
Describe the change for someone who has not seen the code: what they can now do, what behaves
differently, and what they must do after pulling.
The repository is public: no personal data, no absolute local paths, no secret values.
Also add the story to the index in docs/changelogs/README.md.
-->

| | |
|---|---|
| Story | {N.M}, issue #{issue} |
| Epic | {N}, {epic title} |
| Branch | {branch} |
| Commits | {short hashes, oldest first} |
| Date | {YYYY-MM-DD} |
| Security report | [{file name}](../security-reports/{file name}) |

## Summary

{Two or three sentences: what this story delivers and why.}

## Added

- {New capability, command, file or endpoint, in plain words.}

## Changed

- {Existing behaviour that is different now. "None" if nothing.}

## Fixed

- {Bugs fixed, including problems found in review. "None" if nothing.}

## Removed or deprecated

- {What is gone or on its way out. "None" if nothing.}

## Security

{One short paragraph and a link to the story's security report: verdict, new warnings, exceptions.}

## Operations impact

| Area | What changes | README section |
|---|---|---|
| Setup | {new tool, install step, environment variable, or "No change"} | {section} |
| Development | {new command or rule, or "No change"} | {section} |
| Release | {No change / what} | {section} |
| Deployment | {No change / what} | {section} |

## After you pull

{Steps a developer must run, in order. "Nothing to do" if none.}

## Tests

{New positive and negative tests, the non-regression result, and the commands.}

## Deferred and known issues

{Items parked for later, each with the story that owns it. "None" if nothing.}
