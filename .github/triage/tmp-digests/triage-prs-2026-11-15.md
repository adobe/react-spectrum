# PR triage digest: 2026-11-15

## At a glance

- 2 eligible PRs analyzed; 0 member PRs skipped and no duplicate replacement identified.
- Second-window overlay support needs a scope decision and has an unsigned CLA; the inert-warning fix is ready for focused API review.
- Both are high complexity under the core-behavior/API rubric, not full low-complexity reviews. Reported green CI does not independently establish real popup/Picture-in-Picture coverage.

### [#10967](https://github.com/adobe/react-spectrum/pull/10967): Position overlays in their own window

**Decision:** Not ready pending a scoped direction decision and CLA; establish whether automatic owner-document inference is the accepted overlay fix rather than treating this as a complete multi-window solution.

**Complexity:** High. Changes shared overlay geometry, scroll handling, viewport lifecycle and resize observation across four core source files.

**Impact/severity:** Unknown. Menus/popovers are misplaced or unexpectedly dismissed in Document Picture-in-Picture and Electron secondary windows; the reporter uses a local patch, but no supported workaround or extent of blocked tasks is established.

**Merge risk:** High. Shared positioning and viewport-freezing behavior changes beyond the secondary-window case; added iframe tests do not establish hidden-opener or real popup behavior.

#### What matters

- [The diff](https://github.com/adobe/react-spectrum/pull/10967/files) replaces module-global geometry/listeners with owning-window lookups and changes the default `boundaryElement` to the overlay's document body. Explicit boundaries remain respected.
- [#10951](https://github.com/adobe/react-spectrum/issues/10951) reports four owner-window failures. New iframe cases cover placement, owning-window resize dispatch and scroll filtering, not the reported observer failure while the opener is hidden.
- [Earlier team direction](https://github.com/adobe/react-spectrum/issues/4634#issuecomment-1577042002) left broader document support for discussion. [Later approval of owner-document inference](https://github.com/adobe/react-spectrum/issues/10581#issuecomment-5576848687) concerns a different function; neither establishes rejection or blanket approval here.
- CLA is `ACTION_REQUIRED`; the remaining reported CI contexts succeed. Author-reported local Windows locale errors and Table SSR timeouts are not established PR-caused failures.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `ai-reviewed` for this revision; `merge-risk: high` for shared viewport/geometry exposure; `needs API review` for the changed boundary default.
- Bot-eligible addition: `needs decision`. Is owner-document inference accepted for this scoped overlay fix, independently of the broader document-provider proposal?
- Removals: none. All proposed labels already exist.

**Maintainer next step**

1. Resolve the scoped direction question, with the earlier discussion as context, not a veto. reidbarber supplied the original team-discussion guidance; snowystinger supported owner inference for the separate modal-hiding issue.
2. Review same-window positioning, explicit boundaries, pinch zoom and visual-viewport lifecycle compatibility; confirm a popup/Picture-in-Picture case with the opener hidden exercises the owning `ResizeObserver`.
3. CLA remains a readiness blocker handled by separate automation. Do not add `waiting on author` solely for CLA.

### [#10968](https://github.com/adobe/react-spectrum/pull/10968): Suppress false inert-subtree dev warnings

**Decision:** Ready for focused maintainer/API review; assess the new exported utility option separately from the otherwise contained development-warning fix.

**Complexity:** High under the API rubric. Adds an option to `isFocusable`, re-exported by `@react-aria/utils`, plus two hook-layer call sites and RAC browser coverage.

**Impact/severity:** Low. [#10966](https://github.com/adobe/react-spectrum/issues/10966) describes development-console/e2e noise when content mounts behind an open overlay, explicitly stating production is unaffected; no essential task failure is reported.

**Merge risk:** Medium. Default focusability and `isTabbable` checks remain unchanged, but the utility API widens; this was not a full low-complexity red-flag review.

#### What matters

- [The diff](https://github.com/adobe/react-spectrum/pull/10968/files) adds `skipInertCheck`; only the `Focusable` and `Pressable` development warnings opt in. Other callers continue rejecting inert elements by default.
- Two unit cases cover inert ancestors, and a RAC browser case mounts a valid trigger behind an open Popover and asserts both the inert ancestor and absence of the warning.
- [Merged #10547](https://github.com/adobe/react-spectrum/pull/10547) fixed hidden-ancestor warnings in the same call sites, not inert ancestors. It is a precedent, not a duplicate or an existing complete fix.
- The CLA and reported test/browser/type/lint CI contexts succeed. The proposed test results were read, not independently executed; API acceptance remains a maintainer task.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `ai-reviewed` for this revision; `merge-risk: medium` for utility API exposure and bounded-review uncertainty; `needs API review` for the additive exported option.
- Maintainer-only recommendation: `ready for review`, since the problem, tests, verification instructions and CLA are present with no established pre-review blocker.
- Removals: none. All proposed labels already exist. No `small review`: the public-API criterion overrides source-line count.

**Maintainer next step**

1. Review whether an exported `skipInertCheck` option is the right surface for development-only validation.
2. Confirm ordinary focus navigation still honors inert content and the existing invalid-child warnings remain effective.

## Evidence and verification

### #10967: Coverage and related work

The reported environment is `react-aria` 3.52.1, React 18.3.1, Chrome Document Picture-in-Picture/Electron on macOS. The PR author reports 8 Chrome browser tests passing and 2 skipped; the skipped cases are not identified. The GitHub `test-browser` success does not expose which individual cases or platforms ran.

The new tests use same-origin iframes, move a trigger before dispatching its owner's resize event, and assert placement/max-height. The scroll case dispatches events and checks `onClose`; it is not an end-to-end rendered Menu dismissal test. No execution or external reproduction inspection was performed.

[#10581](https://github.com/adobe/react-spectrum/issues/10581) concerns `ariaHideOutside` hiding the wrong document, which this diff does not modify. [#4634](https://github.com/adobe/react-spectrum/issues/4634) is a broader document-support request. Neither should be closed as a duplicate fixed in full by this PR.

[#10892](https://github.com/adobe/react-spectrum/pull/10892) also touches `calculatePosition.ts`, but fixes iOS keyboard viewport-coordinate/max-height disagreement. [#10470](https://github.com/adobe/react-spectrum/pull/10470) fixes user-set max-height flip decisions. These are distinct symptoms, with integration overlap rather than replacement recommendations.

### #10968: API and regression evidence

On `origin/main`, `packages/react-aria/src/utils/isFocusable.ts` still unconditionally checks `!isInert(element)` at line 43. `packages/@react-aria/utils/src/index.ts:84` re-exports `isFocusable` through the private `react-aria` subpath, so the option is consumer-visible through the compatibility package, not merely a file-local helper.

The issue reports RAC 1.22.1 / `react-aria` 3.53.1 on macOS in Chrome, Safari and Firefox. It has an inline reproduction and no comments. The new browser test uses rerendering rather than the reproduction's delay to establish mounting behind an open overlay.

Neither PR supplies a supported last-working/first-failing transition. No `regression` label is proposed. Source inspection and the earlier visibility fix establish the remaining current-code condition, not an earlier working release.

## Run notes

### Scope and discovery

Window: since previous PR digest commit `6011f45645204a575cab163c926e873c1d6f5379` at `2026-11-14T17:16:19Z`, through the final discovery at `2026-11-15T18:35:02Z`.

Paginated `gh api --method GET 'repos/adobe/react-spectrum/pulls?state=open&sort=created&direction=desc&per_page=100' --paginate --jq ...` covered all 114 open PRs, in pages of 100 and 14. The exact creation-time filter returned only #10967 and #10968. Initial discovery used the slightly broader `2026-11-14T17:16:00Z` cutoff and a corroborating `gh pr list`; the exact-cutoff repeat confirmed identical candidates. Both are non-draft User accounts without `ai-reviewed`.

Both API `author_association` values are `NONE`. Permission GETs for wintery and Hanan88 returned HTTP 403, "Must have push access to view collaborator permission." No CODEOWNERS file was found in the root, `.github` or `docs`; membership could not be independently verified, so normal triage was used without inferring core status from names.

Duplicate discovery used all-state `gh pr list` queries for `10966` and `10951`, plus `gh search issues` / `gh search prs` with `--repo adobe/react-spectrum` for inert/Focusable, secondary-window, overlay-window, `isFocusable`, `useOverlayPosition` and issue-number terms. Only the candidate PRs matched their closing issue numbers. Related matches were compared by behavior above; search indexes are not proof that no duplicate exists.

Reviewed heads: #10967 `51e951de42d65685f71de77c0858a9dcd8d0835f`; #10968 `bcfa15995dce4f0d2b0b035d805e4d3f967942a1`. Final discovery confirmed unchanged heads and labels. Repository label inventory was read with a paginated GET; no proposed label is missing.

### Synchronization and checkout

Verified `/Users/darobins/dev/react-spectrum-triage` on `triage_support`, an empty index, no in-progress merge and no existing target digest. Initial and pre-write app status snapshots showed no other active issue/PR triage run; pre-write checks also found no index lock.

`git fetch origin` succeeded. The tracked-change gate outside `.github/triage` was empty; `git merge origin/main --no-edit` reported "Already up to date." Incorporated `origin/main` is `360e35170568dfc99a2baaa78e6b7bdd36458d91`, verified as an ancestor of HEAD. No merge conflict or skip.

The pre-existing local `.github/triage/setup.md` adaptation and all previous digests were preserved unchanged and unstaged.

### Read failures and recovery

The full prompt read exceeded the size limit; subsequent range reads covered the file. An attempted range beginning at line 215 failed because the file has 164 lines; a corrected range succeeded. A large overlay diff/report response was read from its tool-output file in bounded ranges.

Initial `gh search issues` calls with an embedded repository-qualified query were rejected by this CLI's query construction. Separate search terms with `--repo adobe/react-spectrum` succeeded. An assumed `packages/react-aria/src/utils/index.ts` path did not exist on `origin/main`; `git grep` verified the actual compatibility export. These failed reads were not used as successful evidence. Membership access remains limited as described above.

### Boundaries and commit bookkeeping

Dry run only: GitHub access used permitted `gh pr list/view/diff`, `gh issue view`, `gh search` and explicit GET API reads. No comments, labels, reviews, edits, closures, gists or other GitHub writes. No contributor-supplied URL was opened, and no PR branch, patch, reproduction or code was fetched, checked out, applied or executed.

Both PRs received the prescribed high-complexity summary/API/duplicate assessment, not a full low-complexity red-flag review. Their changed-file lists contain no CI workflows, package scripts/dependencies, lockfiles, install scripts or build configuration requiring that specific security-review flag.

Only `.github/triage/tmp-digests/triage-prs-2026-11-15.md` is to be staged and committed after the empty-index and exact-path checks, using `chore: add PR triage digest 2026-11-15` and the prescribed Copilot co-author trailer. The resulting commit hash and single-file contents are verified and reported separately to avoid a self-referential edit. Never push.
