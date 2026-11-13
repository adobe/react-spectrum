# PR triage digest: 2026-11-13

## At a glance

- 3 in-window open PRs, all verified member PRs; 0 non-member PRs analyzed.
- All three lack `rsp-core`; propose only that label and skip analysis.
- Membership is established by REST `author_association: MEMBER`; an optional collaborator-permission lookup was denied.

## Member PRs skipped

- [#10962: FocusScope custom restore focus target](https://github.com/adobe/react-spectrum/pull/10962), @snowystinger, REST `author_association: MEMBER`; `rsp-core` proposed; analysis skipped (member PR).

#### Would have done

**Labels (proposed)**

- Bot-eligible addition for #10962: `rsp-core`, because the author is a verified member and the label is absent. No removals or other label proposals.

**Maintainer next step**

- Member exception applies; no triage review task or readiness recommendation.

- [#10961: Stabilize number and list formatter options](https://github.com/adobe/react-spectrum/pull/10961), @snowystinger, REST `author_association: MEMBER`; `rsp-core` proposed; analysis skipped (member PR).

#### Would have done

**Labels (proposed)**

- Bot-eligible addition for #10961: `rsp-core`, because the author is a verified member and the label is absent. No removals or other label proposals.

**Maintainer next step**

- Member exception applies; no triage review task or readiness recommendation.

- [#10960: Update AI Button design](https://github.com/adobe/react-spectrum/pull/10960), @devongovett, REST `author_association: MEMBER`; `rsp-core` proposed; analysis skipped (member PR).

#### Would have done

**Labels (proposed)**

- Bot-eligible addition for #10960: `rsp-core`, because the author is a verified member and the label is absent. No removals or other label proposals.

**Maintainer next step**

- Member exception applies; no triage review task or readiness recommendation.

## Run notes

### Scope and discovery

Window: since the previous PR digest commit `cc7db739b92c85ce424b2ecb2deef7fd2d5eceef`, committed at `2026-11-12T16:22:45Z`, through final discovery at `2026-11-13T17:30:48Z`.

`gh pr list --repo adobe/react-spectrum --state open --search 'created:>=2026-11-12T00:00:00Z' --limit 100 --json number,title,url,author,createdAt,isDraft,labels` returned the three candidates. Explicit GET requests to `repos/adobe/react-spectrum/pulls?state=open&sort=created&direction=desc&per_page=100`, using `--paginate --slurp` and local `jq`, covered all 114 open PRs. Discovery was repeated with the exact previous-commit cutoff and confirmed the same three candidates.

Creation timestamps: #10960 at `2026-11-12T22:21:02Z`, #10961 at `2026-11-12T22:54:32Z`, and #10962 at `2026-11-13T04:27:16Z`. All are non-draft human-authored PRs. The `release` label on two member PRs was preserved; membership is sufficient to stop analysis without inferring that they are automated release PRs. Member selection precedes the non-member `ai-reviewed` filter.

REST membership evidence was obtained before any diff, check, linked-issue or discussion reads. No complexity, impact, merge risk, API, duplicate, readiness, test or CLA assessment was performed. No reviewed head SHAs apply. The paginated repository-label inventory confirms `rsp-core` exists; no missing labels need creation.

### Synchronization and checkout

Verified `/Users/darobins/dev/react-spectrum-triage` on `triage_support`, an empty index, no in-progress merge and no existing target digest. Initial and pre-write session-status checks found only this run active and no overlapping triage session.

`git fetch origin` succeeded. The tracked-change gate outside `.github/triage` was empty, so `git merge origin/main --no-edit` ran and reported "Already up to date." Incorporated main is `1bff7d0a2e27185d317777779d08784da6966113`, verified as an ancestor of HEAD. No merge conflict or skipped merge.

The only pre-existing local change was `.github/triage/setup.md`; it was left untouched and unstaged. The existing issue digest and all previous digests were preserved.

### Read limitations and instruction handling

The initial full prompt read exceeded the file-size limit; overlapping range reads covered the complete instructions. Local CODEOWNERS discovery found no matching file.

An optional explicit GET to `repos/adobe/react-spectrum/collaborators/snowystinger/permission` failed with HTTP 403: "Must have push access to view collaborator permission." The chained devongovett permission lookup consequently did not run. Both authors are independently verified by the allowed REST `MEMBER` association, so no required membership step remains blocked and no additional permissions were sought.

The direct run request requires a **Would have done** block for every PR. These label-only blocks are included for member PRs despite the prompt file's one-line-only presentation exception. The substantive member boundary is preserved: no analysis, `ai-reviewed`, merge-risk labels, other triage labels, comments or readiness proposals.

### Boundaries and commit bookkeeping

Dry run only: GitHub access used permitted `gh pr list` and explicit `gh api --method GET` reads. No GitHub comments, reviews, labels, edits, closures, gists, PR creation or other writes. No PR branch or code was checked out, fetched, applied or executed, and no contributor-supplied URL was opened.

Only `.github/triage/tmp-digests/triage-prs-2026-11-13.md` is to be staged and committed on `triage_support`, after rechecking the empty index and exact staged path. Use `chore: add PR triage digest 2026-11-13` and the prescribed Copilot co-author trailer. Verify the resulting commit hash and single-file contents and report them separately to avoid a self-referential digest edit. Never push.
