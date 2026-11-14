# PR triage digest: 2026-11-14

## At a glance

- 0 open PRs created since the previous digest; 0 PRs analyzed or member PRs skipped.
- No label proposals or maintainer decisions arise from this window.

## Run notes

### Scope and discovery

Window: since the previous PR digest commit `ef7d5aba418c7f4498339eea12e75fc54ad6cd58`, committed at `2026-11-13T17:31:25Z`, through final discovery at `2026-11-14T17:15:45Z`.

Initial broad discovery used `gh pr list --repo adobe/react-spectrum --state open --search 'created:>=2026-11-13T00:00:00Z' --limit 100 --json number,title,url,author,createdAt,updatedAt,isDraft,labels`. Its sole result was #10962, created at `2026-11-13T04:27:16Z`, before the window and already included in the previous digest. It was not re-triaged.

Complete discovery used `gh api --method GET 'repos/adobe/react-spectrum/pulls?state=open&sort=created&direction=desc&per_page=100' --paginate --jq` with a local creation-time filter for `2026-11-13T17:31:25Z`. Both pages succeeded, covering all 112 open PRs (100 + 12); neither contained an in-window PR. The corroborating `gh pr list --repo adobe/react-spectrum --state open --search 'created:>=2026-11-13T17:31:25Z' --limit 100 --json number,title,url,author,createdAt,isDraft,labels` returned `[]`.

No candidate reached membership, draft/bot, or non-member `ai-reviewed` filtering. No diff, CI, CLA, issue, discussion, API, severity or duplicate analysis was needed. There are no per-PR entries requiring a **Would have done** block, and no reviewed head SHAs or missing proposed labels.

### Synchronization and checkout

Verified `/Users/darobins/dev/react-spectrum-triage` on `triage_support`, an empty index, no in-progress merge or index lock, and no existing target digest. Initial and pre-write session-status checks found no overlapping PR or issue triage run.

`git fetch origin` succeeded. The tracked-change gate outside `.github/triage` was empty, so `git merge origin/main --no-edit` ran and reported "Already up to date." Incorporated main is `360e35170568dfc99a2baaa78e6b7bdd36458d91`, verified as an ancestor of HEAD. No merge conflict or skipped merge.

The pre-existing local `.github/triage/setup.md` adaptation was preserved untouched and unstaged. Today's issue digest and all previous digests were preserved.

### Read failures and recovery

The initial full prompt read exceeded the file-size limit; subsequent overlapping range reads covered the complete instructions. The optional local `.github/CODEOWNERS` read found no file; no eligible PR required further membership discovery.

An initial paginated API command failed because this `gh` version disallows combining `--slurp` with `--jq`. A retry using a separate `jq` pipe failed with a connection reset and incomplete JSON. The final supported `--paginate --jq` command succeeded for both pages, so neither failed attempt was used as discovery evidence. The paginated GET label inventory also succeeded.

### Boundaries and commit bookkeeping

Dry run only: GitHub access used permitted `gh pr list` and explicit `gh api --method GET` reads. No comments, reviews, labels, edits, closures, gists, PR creation or other GitHub writes. No PR code or branch was checked out, fetched, applied or executed, and no contributor-supplied URL was opened.

Only `.github/triage/tmp-digests/triage-prs-2026-11-14.md` is to be staged and committed on `triage_support`, after rechecking the empty index and exact staged path. Use `chore: add PR triage digest 2026-11-14` with the prescribed Copilot co-author trailer. Verify the resulting commit hash and single-file contents and report them separately to avoid a self-referential digest edit. Never push.
