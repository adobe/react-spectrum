# PR triage digest: 2026-11-23

## At a glance

- Zero new open PRs in scope; zero analysed, member skips, or label proposals.
- The wider discovery found only [#11014](https://github.com/adobe/react-spectrum/pull/11014), already covered in yesterday's digest and created before this run's window.
- No maintainer decision is required from this run. Existing PRs were not reassessed.

## Run notes

### Scope and discovery

Window: `2026-11-22T19:56:23Z`, the previous digest's final discovery cutoff, through final discovery at `2026-11-23T17:47:39Z`. Using the prior discovery cutoff rather than its later commit time avoids a coverage gap.

The previous digest is `triage-prs-2026-11-22.md`, committed as `9618bd9824b13df3e58769bb6899bafb68bd25ea` at `2026-11-22T20:57:12Z`.

Initial `gh pr list` discovery used the wider `created:>=2026-11-22T00:00:00Z` search, with a limit of 100. It returned only #11014, created at `2026-11-22T08:42:07Z`, outside the selected window. Two subsequent paginated GET discovery passes each covered all 130 open PRs in pages of 100 and 30; the final pass found zero PRs created in the selected window, before any draft, bot, membership or `ai-reviewed` exclusion.

No PR qualified for a per-PR note or a "Would have done" block. No member PRs were skipped, and no diffs, checks, linked issues or review discussions were read. Membership verification, complexity, severity, API review, duplicate detection and readiness assessment were therefore not applicable.

### Boundaries and read limitations

Dry run: GitHub was accessed only through permitted `gh pr list` and explicit `gh api --method GET` reads. No comments, labels, edits, closures, reviews, assignments, gists, PR creation or other GitHub writes occurred.

No PR branch, fork or patch was fetched, checked out or applied. No contributor-supplied URL was opened, and no PR code, tests, dependencies or scripts were executed. Repository identity was confirmed as `adobe/react-spectrum` by GET.

The initial whole-file read of `pull-requests.md` exceeded the tool size limit. Bounded reads recovered the instructions, including a corrected request after one range extended beyond EOF.

An ancillary `git show origin/main:.github/CODEOWNERS` failed because that path does not exist. A subsequent tree listing confirmed no CODEOWNERS at `.github/CODEOWNERS`, `CODEOWNERS` or `docs/CODEOWNERS`. This did not block triage because there were no in-scope authors to classify. No required Git synchronization or GitHub discovery step failed.

### Synchronisation and commit bookkeeping

Verified the existing checkout `/Users/darobins/dev/react-spectrum-triage`, branch `triage_support`, empty index, no merge in progress, absent target digest and no other active issue/PR triage run. Activity, branch, index and target checks were repeated before writing.

`git fetch origin` succeeded. No tracked changes existed outside `.github/triage`; `git merge origin/main --no-edit` returned "Already up to date." Synchronized origin/main is `6be3466d87cc628ee69461230c1b5f4e3b64c6e3`; pre-digest HEAD is `9618bd9824b13df3e58769bb6899bafb68bd25ea`. No conflict or skipped merge.

Digest path: `/Users/darobins/dev/react-spectrum-triage/.github/triage/tmp-digests/triage-prs-2026-11-23.md`.

Only this digest is to be staged after another empty-index check and committed with `chore: add PR triage digest 2026-11-23` and the prescribed Copilot co-author trailer. The resulting hash and exact single-file commit are verified and reported separately to avoid a self-referential digest edit. The local setup.md adaptation remains untouched and unstaged. No checkout was created, branch switched or push performed.
