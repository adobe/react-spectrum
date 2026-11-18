# Issue triage digest: 2026-11-18

## At a glance

- One eligible issue analysed; two discovery results excluded by non-component labels. No verified team-author skips.
- Wide RAC tables can stop loading after horizontal scrolling; trusted source supports the report, and an open fix covers both table rendering modes.
- Recommend maintainer review of the focused fix. Browser behaviour and contributor test results were not independently verified.

### [#10986](https://github.com/adobe/react-spectrum/issues/10986): Horizontal scrolling hides the table loading sentinel

**Decision:** Ready for maintainer investigation alongside open [#10995](https://github.com/adobe/react-spectrum/pull/10995); confirm horizontal intersection coverage in virtualized and native tables before accepting the fix.

**Impact/severity:** Medium: infinite loading stops for users reading later columns in wide tables, but the reporter says scrolling back left resumes loading. This degrades access to later rows without establishing an entirely blocked workflow.

**Complexity:** Low: the likely fix is localized to the table sentinel's width and native-cell span, with focused browser coverage; no public API change appears necessary.

#### What matters

- The [report](https://github.com/adobe/react-spectrum/issues/10986) states, "Scroll back to the left and it loads straight away", and supplies a 400 px viewport with 2400 px of columns plus inline reproduction steps.
- The [trusted table sentinel](https://github.com/adobe/react-spectrum/blob/2ac28d36146c2acd008fc397fbd36535e894a516/packages/react-aria-components/src/Table.tsx#L2413-L2425) remains `width: 1`; the [observer](https://github.com/adobe/react-spectrum/blob/2ac28d36146c2acd008fc397fbd36535e894a516/packages/react-aria/src/utils/useLoadMoreSentinel.ts#L60-L73) expands horizontally by only `100 * scrollOffset` percent. This supports the reported out-of-bounds mechanism, not independent browser confirmation.
- [#10995](https://github.com/adobe/react-spectrum/pull/10995) explicitly closes this issue and proposes a full-width sentinel plus native-table `colSpan`. Its author reports fail-before/pass-after browser coverage, but WebKit was not run locally; those are attributed claims, not verified results or a merged fix.
- The supplied inline reproduction was read, not executed. The report includes package versions, Chrome and Linux; exact browser/OS versions are absent, but the concrete geometry and steps are sufficient for focused investigation.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `Table`, `RAC` for component/layer; `has workaround` for the reported scroll-left recovery; `waiting on maintainer` for the source-supported fix investigation; `ai-reviewed` for completed triage.
- Removals: none; currently unlabelled. All proposed labels exist.
- Maintainer-only addition: `ready for review`, because the description, inline reproduction, package versions and environment identify a reproducible scenario. No `regression`: no last-working/first-failing release transition is established.

**Maintainer next step**

1. Review #10995 rather than starting a competing fix. Confirm that the sentinel spans the scrollable table width in both virtualized and native tables without changing column sizing or loading-row accessibility.
2. Verify callback behaviour after horizontal scrolling beyond one viewport width and then reaching the bottom, including WebKit and RTL. Preserve vertical trigger distance, empty/loading states and column-resize behaviour; mocked intersection callbacks alone cannot establish geometry.
3. If sharing an interim response, explain that scrolling back towards the left edge reportedly resumes loading, but does not fix the defect. Do not recommend internal sentinel selectors, DOM manipulation or inflated `scrollOffset` values.
4. Keep the issue open until the fix lands and release availability is known. No specific author action currently blocks source-level review.

## Evidence and verification

### #10986: source, existing APIs and coverage

The [documented asynchronous-loading composition](https://github.com/adobe/react-spectrum/blob/2ac28d36146c2acd008fc397fbd36535e894a516/packages/dev/s2-docs/pages/react-aria/Table.mdx#L310-L312) places `TableLoadMoreItem` at the end of the collection. The report follows that model; this is not established API misuse. `scrollOffset` is documented as a vertical prefetch distance, while the implementation also uses it for horizontal margins. Increasing it would couple unrelated geometry and is not a robust fix for arbitrarily wide tables.

The [virtualized loader layout](https://github.com/adobe/react-spectrum/blob/2ac28d36146c2acd008fc397fbd36535e894a516/packages/react-stately/src/layout/TableLayout.ts#L429-L439) takes its width from the table header. In [TableLoadMoreItem](https://github.com/adobe/react-spectrum/blob/2ac28d36146c2acd008fc397fbd36535e894a516/packages/react-aria-components/src/Table.tsx#L2403-L2435), the visible native loading cell receives `colSpan`, but the separate sentinel cell does not. These are source-supported reasons to examine both rendering modes; the report's width change was not executed or copied into a suggested implementation.

The existing [intersection test](https://github.com/adobe/react-spectrum/blob/2ac28d36146c2acd008fc397fbd36535e894a516/packages/react-aria-components/test/Table.test.js#L2910-L2932) manually triggers `isIntersecting: true`. It confirms callback wiring, not whether a horizontally displaced sentinel actually intersects. The PR description reports Chromium/Firefox fail-before/pass-after checks, 181 passing Jest tests with one skipped, and an unavailable local WebKit launch; no tests, builds or repro commands were run in this triage.

Reported versions: RAC components 1.21.1 and RAC hooks 3.52.1, Chrome on Linux. No known-good version or release transition is supplied. Current source still containing the mechanism does not prove a regression.

### #10986: related work, not a duplicate

Open [#10627](https://github.com/adobe/react-spectrum/issues/10627) concerns the same shared observer but says, "Every page loads immediately after mount", with page scrolling and an explicit document-element root. Here, loading stops after horizontal movement inside an element scroll container. Different triggering conditions and opposite outcomes do not justify closing this issue as a duplicate.

All three issue comments were read. [costajohnt's latest comment](https://github.com/adobe/react-spectrum/issues/10986#issuecomment-6969839788) says, "I'm putting the PR up today with the colSpan handling and a regression test"; #10995 is now open and references this issue. Contributor agreement is not maintainer approval. No exact duplicate issue or already-merged fix was found in the searches performed.

## Run notes

### Boundary and synchronization

Dry run only: GitHub reads used `gh issue list|view`, `gh search issues|prs`, `gh pr view` and explicit `gh api --method GET`. No comments, labels, edits, closures, gists, PR creation, other GitHub writes or pushes. Issue/PR text, comments and links were treated as untrusted evidence. No issue-supplied URL was opened, and no supplied code, scripts, tests or commands were executed. No suspected prompt injection was identified.

Verified `/Users/darobins/dev/react-spectrum-triage` on `triage_support`, no merge in progress, an empty index and no other active triage session. Rechecked activity and Git guards before writing. Today's target was absent. The sole pre-existing local change was `.github/triage/setup.md`, left untouched and unstaged.

The initial `git fetch origin` stalled without output and was stopped. A retry using `GIT_SSH_COMMAND='ssh -o BatchMode=yes -o ConnectTimeout=20 -o ConnectionAttempts=1' git fetch origin` succeeded without changing stored configuration. `git merge origin/main --no-edit` then succeeded without conflicts. Merged main/source SHA: `2ac28d36146c2acd008fc397fbd36535e894a516`, verified as an ancestor of HEAD. Pre-digest merge commit: `bfed813e3d1e6b660adcd0e7b4acc560ebf81f22`. No skipped merge or unresolved synchronization failure.

### Scope and membership

Creation cutoff: `2026-11-18T16:22:59Z`, from the supplied run timestamp. The last-24-hours lower bound is `2026-11-17T16:22:59Z`; overlapping since-last-digest discovery used the November 17 digest's recorded cutoff, `2026-11-17T16:17:14Z`. Both open-issue queries returned the same three results, below their 100-result limits.

[#10987](https://github.com/adobe/react-spectrum/issues/10987) already had non-component `enhancement` and was excluded without investigation. [#10991](https://github.com/adobe/react-spectrum/issues/10991) was initially unlabelled, but acquired non-component `bug` at `2026-11-18T16:54:06Z` during the stalled fetch; the later body read and discovery recheck exposed that change. It was excluded from analysis and proposals under the current eligibility rule. #10986 remained open and unlabelled at the final eligibility GET.

Before issue-body investigation, #10986 had `author_association: NONE` and #10991 had `CONTRIBUTOR`; neither establishes team membership. Both collaborator-permission GETs returned HTTP 403, "Must have push access to view collaborator permission." Trusted-main tree inspection found no CODEOWNERS or explicitly named maintainer/core-contributor list. Membership therefore remains unverified, not disproved; normal triage proceeded for the eligible issue. There were no verified team-author skips.

### Discovery coverage and verification limits

Open/closed searches covered `onLoadMore horizontal` (zero), `sentinel table` (zero), `onLoadMore` (16 issues), `"load more" "horizontal"` (zero), and `"horizontal" "loading"` (five issues; API reported `incomplete_results: false`). PR searches covered `10986` (one), `sentinel table` (zero) and `TableLoadMoreItem` (20). The exact linked fix and the closest shared-observer report were read; no exhaustive duplicate guarantee is claimed.

Source, layout, documentation and existing tests were inspected with `git show origin/main:<path>`. Reproduction and browser/test claims were assessed by reading only. Permission-denied membership checks are the specific access limitation, not evidence of non-membership. Source-list searches returning no matching membership file produced grep status 1; the preceding merge and ancestry checks succeeded.

### Digest bookkeeping

Only `.github/triage/tmp-digests/triage-issues-2026-11-18.md` is authorised for staging and committing. The commit uses `chore: add issue triage digest 2026-11-18` and the prescribed Copilot co-author trailer. The resulting hash is reported separately after verifying that the commit contains only this digest; it is not self-embedded. No push is authorised.
