# Pull requests

## Commenting

Comments while developing are fine. Before presenting code for review, trim verbose comments so the diff reads cleanly. When a genuinely complex section still warrants a comment, prefer a higher-level explanation of the whole section over annotating individual lines. Specific line comments are warranted when it's addressing a browser bug or the code deviates from other patterns.

## Opening a PR

Start from `.github/PULL_REQUEST_TEMPLATE.md` (e.g. `gh pr create --body-file .github/PULL_REQUEST_TEMPLATE.md`) rather than writing a body from scratch: fill in every section, complete the checklist honestly, and disclose AI use. Above the checklist, add a holistic summary of how the changes work and why this approach was chosen — give the intent separately from the implementation.

See also `CONTRIBUTING.md` (AI-assisted contributions).
