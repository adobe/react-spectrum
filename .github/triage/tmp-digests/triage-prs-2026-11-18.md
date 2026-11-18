# PR triage digest: 2026-11-18

## At a glance

- Six eligible PRs: three analysed, three verified member PRs skipped.
- Table's horizontal-scroll loading fix is ready for substantive review; ComboBox needs a pending-open behaviour decision and Tree adds public focus-event APIs.
- ComboBox and Tree have unsigned CLAs. No competing implementation requiring a PR closure was identified.

### [#10994](https://github.com/adobe/react-spectrum/pull/10994): Open initially-empty async ComboBox results

**Decision:** Needs a maintainer decision on extending pending-open behaviour beyond the existing empty-collection workaround; unsigned CLA also blocks readiness.

**Complexity:** High: changes core `useComboBoxState` open/close behaviour used across layers.

**Impact/severity:** Medium: initial async search results remain hidden until another interaction; `allowsEmptyCollection` with a loading/empty state provides a supported alternate path, but changes the requested no-empty-popup UX.

**Merge risk:** Medium: focused state-machine change with cancellation tests, but shared dismissal semantics need substantive review; the full low-complexity red-flag review was not performed.

#### What matters

- The [state change](https://github.com/adobe/react-spectrum/pull/10994/files) records `closedDueToEmpty.current = true` when typing into a focused, closed, empty collection. It clears that pending intent on blur, manual closing and selection.
- [The original discussion](https://github.com/adobe/react-spectrum/issues/2333#issuecomment-920286958) explicitly supports revisiting this without `allowsEmptyCollection`. Related [maintainer constraints](https://github.com/adobe/react-spectrum/issues/5234#issuecomment-1919629220) require preserving explicit dismissal while results arrive.
- No new signatures or defaults; existing `menuTrigger="input"` behaviour and `onOpenChange` timing change when initially-empty results arrive. Added rendered tests cover both ComboBox-owned and ListBox-owned items plus Escape cancellation.
- Hosted checks pass apart from CLA `ACTION_REQUIRED`. Author-reported unit/SSR results are not independently executed; no manual screen-reader or browser-interaction evidence is supplied.

#### Would have done

**Labels (proposed)**

Bot-eligible additions:

- `ai-reviewed`: current revision triaged, not approved.
- `merge-risk: medium`: shared pending-open and dismissal behaviour needs reviewer attention.
- `needs decision`: should the merged pending-open approach also cover initially-empty searches, rather than requiring `allowsEmptyCollection` and an empty/loading state?
- `has workaround`: documented empty-collection support permits a usable search path, with different popup UX.

Maintainer-only recommendations: none until the behaviour decision is settled.

Removals: none; preserve existing labels.

**Maintainer next step**

1. Confirm the initially-empty extension is the intended continuation of the merged async-reopen fix, including explicit dismissal and `menuTrigger="manual"` semantics.
2. Review cancellation across blur, Escape, trigger toggles and selection; use the supplied verification instructions for integration review.
3. If accepted, treat the unsigned CLA as the remaining separate-automation blocker, not grounds for a waiting-on-author label.

### [#10993](https://github.com/adobe/react-spectrum/pull/10993): Add TreeItem focus callbacks

**Decision:** Otherwise ready for substantive API review; CLA handled by separate automation.

**Complexity:** High: adds public `onFocus`, `onBlur` and `onFocusChange` support to TreeItem and inherited NavigationTreeItem props.

**Impact/severity:** Unknown: enables keyboard-focus-driven previews and detail panels, but no concrete blocked task or supported application-level workaround establishes the consequence/severity.

**Merge risk:** Medium: small implementation with relevant interaction tests, but public event semantics and inherited NavigationTree coverage need API review; the full low-complexity red-flag review was not performed.

#### What matters

- The [implementation](https://github.com/adobe/react-spectrum/pull/10993/files) extends `TreeItemProps` with `FocusEvents<HTMLDivElement>` and merges `useFocus(props)` handlers onto the row. NavigationTreeItem inherits that interface.
- [Maintainer direction](https://github.com/adobe/react-spectrum/issues/6460#issuecomment-2153382508) supports hover/focus parity. Already-merged GridList and Table equivalents establish direction, but do not implement Tree callbacks.
- Added interaction tests cover keyboard/mouse transitions, descendant buttons, expansion/collapse and rerender stability; a Storybook example supplies verification instructions. No DOM, class, data-attribute or CSS-variable change is proposed.
- Hosted checks pass apart from CLA `ACTION_REQUIRED`. NavigationTree's existing-suite pass is author-reported, not a new callback-specific NavigationTree test or independent manual accessibility result.

#### Would have done

**Labels (proposed)**

Bot-eligible additions:

- `ai-reviewed`: current revision triaged with its verification boundary.
- `merge-risk: medium`: additive public events affect row-versus-descendant focus contracts.
- `needs API review`: assess callback types and semantics on TreeItem and NavigationTreeItem.

Maintainer-only recommendation:

- `ready for review`: substantive API review is the useful next step; otherwise ready, with CLA handled separately.

Removals: none; preserve existing `RAC` and `Tree`.

**Maintainer next step**

1. Confirm direct-row focus rather than focus-within semantics, matching GridListItem and Table Row.
2. Check inherited NavigationTreeItem behaviour and generated API prop documentation during review.
3. Keep CLA as an informational readiness blocker handled by the separate automation.

### [#10995](https://github.com/adobe/react-spectrum/pull/10995): Keep wide-table loading observable

**Decision:** Ready for maintainer review; the localised geometry fix plausibly addresses the reported horizontal-scroll failure.

**Complexity:** Low: one-component source change, using the existing browser-test harness without changing its infrastructure.

**Impact/severity:** Medium: loading more rows in wide tables is degraded after horizontal scrolling; scrolling back left is a practical, reported workaround.

**Merge risk:** Low: contained sentinel geometry change, relevant rendered browser coverage and no identified material correctness concern.

#### What matters

- The [diff](https://github.com/adobe/react-spectrum/pull/10995/files) changes sentinel width from `1` to `'100%'` and adds `colSpan={isVirtualized ? undefined : numColumns}`. The current virtualized loader already spans the header width.
- [The issue](https://github.com/adobe/react-spectrum/issues/10986) describes loading stopping when the sentinel leaves the observer's horizontal margin. Current-main source still has the one-pixel sentinel; no documented prop independently fixes that geometry.
- Browser tests scroll right beyond two container widths, then down and assert `onLoadMore` for virtualized and native tables. The new Jest assertion checks structure, while the browser tests cover the actual failure.
- No new public API or defaults; native sentinel-cell `colSpan` and internal sentinel width change. The author could not launch WebKit locally, but hosted browser CI is successful and its configured glob includes this file in Chromium, Firefox and WebKit.

#### Would have done

**Labels (proposed)**

Bot-eligible additions:

- `ai-reviewed`: full low-complexity triage completed by reading and reasoning.
- `small review`: localised component fix with focused existing-harness tests.
- `merge-risk: low`: contained change with matching browser coverage.
- `has workaround`: scrolling back left resumes loading, as reported.

Maintainer-only recommendation:

- `ready for review`: clear problem, signed CLA, relevant tests and verification instructions, with no identified author blocker.

Removals: none; preserve existing `RAC` and `Table`.

**Maintainer next step**

1. Review native automatic table sizing and virtualized full-row sizing against the supplied scroll test.
2. Confirm browser-job details during review if case-level results are needed; a successful job status is not a locally reproduced result.

## Member PRs skipped

- **Would have done:** [#10990](https://github.com/adobe/react-spectrum/pull/10990), devongovett: API `author_association=MEMBER`; `rsp-core` proposed; analysis skipped (member PR).
- **Would have done:** [#10989](https://github.com/adobe/react-spectrum/pull/10989), snowystinger: API `author_association=MEMBER`; `rsp-core` proposed; analysis skipped (member PR).
- **Would have done:** [#10988](https://github.com/adobe/react-spectrum/pull/10988), yihuiliao: API `author_association=MEMBER`; `rsp-core` proposed; analysis skipped (member PR).

## Evidence and verification

### #10994: Existing alternative, related reports and compatibility

Current [ComboBox documentation](https://github.com/adobe/react-spectrum/blob/main/packages/dev/s2-docs/pages/react-aria/ComboBox.mdx#L425-L435) says `allowsEmptyCollection` keeps the popover open without items. For example, `<ComboBox allowsEmptyCollection {...props}>...</ComboBox>` supports presenting a loading/empty state. This is not equivalent to keeping the popup hidden until results exist. Do not copy the historical hook name `allowEmptyCollection` into the current RAC API.

[#5234](https://github.com/adobe/react-spectrum/issues/5234) reports the same initial-result lag, with react-aria 3.29.0, Chrome and Windows 11; it is an overlapping issue, not a competing implementation. Its maintainer discussion records failed earlier refactoring attempts and the need not to reopen explicitly dismissed menus. All nine comments on original #2333 were read, along with available maintainer comments on #5234. No current maintainer direction rejects fixing the initial-empty case.

Merged [#9823](https://github.com/adobe/react-spectrum/pull/9823) reopens a menu that had already been open before an empty response. Current-main code sets the pending flag only in that auto-close branch, so it leaves the initially-closed case unfixed. Merged [#8720](https://github.com/adobe/react-spectrum/pull/8720) fixes rendering an empty state when items live on ListBox, rather than this delayed initial opening. Neither supersedes this PR.

The author reports before/after failures and passes for the new cases, plus existing ComboBox suites and SSR. Those are attributed results, not automation execution. No known-good version demonstrates a regression, so no `regression` proposal is made.

### #10993: Additive API rather than a duplicate

Merged [#10822](https://github.com/adobe/react-spectrum/pull/10822) adds GridListItem callbacks; merged [#10857](https://github.com/adobe/react-spectrum/pull/10857) adds Table Row callbacks. Merged [#8231](https://github.com/adobe/react-spectrum/pull/8231) exposes MenuItem event types for handlers already passed through. These target different components, not TreeItem.

Current-main TreeItem lacks `FocusEvents`, and `NavigationTreeItemProps` inherits TreeItem props through an `Omit` that does not remove these event names. The Tree documentation uses a generated TreeItem prop table, so inherited API documentation needs review rather than assuming a handwritten documentation omission. Both original #6460 comments were read.

The issue's render-time DOM/dataset callback workaround is not recommended. Available evidence does not establish an essential task that cannot otherwise be completed, or enough supported workaround detail to force an impact rating. No regression is claimed or established.

### #10995: Full low-complexity review and browser limits

Current-main `Table.tsx` renders an inert sentinel row, a one-pixel-wide child and no spanning cell. `useLoadMoreSentinel.ts` calculates the observer's right/left margin from `scrollOffset`; increasing that prop also changes vertical prefetch, so it is not an equivalent horizontal-only fix. The public Table docs expose loading callbacks/offsets, not an independent sentinel-width control. No safe public styling/composition fix for the internal sentinel was established.

All three original #10986 comments were read; they discuss the proposed fix but contain no maintainer approval or conflicting constraint. The issue reports RAC 1.21.1 / react-aria 3.52.1 on Chrome/Linux, with inline steps and code sufficient for reasoning. No earlier working version establishes regression.

Closed [#9944](https://github.com/adobe/react-spectrum/issues/9944) and merged [#9961](https://github.com/adobe/react-spectrum/pull/9961) concern stale virtualized loader width after window resize. The [maintainer explanation](https://github.com/adobe/react-spectrum/issues/9944#issuecomment-4300015452) and current-main `TableLayout.buildLoader` show that wrapper width is already refreshed from the header. This PR changes the child sentinel and native-cell span, so the resize fix is not a replacement duplicate. All five #9944 comments were read.

No new production timing delay, suppression, unsafe cast, user-agent branch, DOM-poking workaround or removal of ARIA/keyboard/focus handling was found. The nearby `@ts-ignore` is unchanged. Double `requestAnimationFrame` calls occur only in the browser test to let horizontal scrolling settle before vertical scrolling; they are not the production fix. The browser test is materially stronger than the structural-only Jest assertion and should distinguish old/new geometry by inspection.

The author reports both browser cases failing before and passing after in Chromium/Firefox, plus 181 passed and one skipped Table Jest test. Local WebKit launch failed for the author. Current-main browser configuration includes `packages/**/test/**/*.browser.test.{ts,tsx}` and all three desktop engines; CircleCI's `test-browser` job invokes `yarn test:browser` without a conditional skip in that job. Its successful status supports coverage but does not expose per-test assertions here. No PR tests, builds or repros were run.

### Duplicate and security boundaries

All-state PR and issue searches covered original issue numbers, TableLoadMoreItem, horizontal tables/sentinels, initially-empty and async ComboBox behaviour, and TreeItem/collection focus events. Broader focus-event results included unrelated focus-ring/collection-pointer changes, not another TreeItem callback implementation. No competing same-behaviour PR was identified, so no CLA preference between duplicate PRs or PR-closure recommendation applies.

None of the three analysed diffs changes CI workflows, dependency/script manifests, lockfiles, install scripts or build configuration. The mandatory sensitive-file **needs security review** flag is therefore not triggered for analysed PRs; no security audit was performed. Member PR contents were not inspected, including the tooling-titled PRs.

## Run notes

### Scope and discovery

Window: since prior PR digest commit `7fe9932ac299175962744bb36d16047676964cc3`, `2026-11-17T16:33:46Z`, through final discovery at `2026-11-18T17:21:48Z`. Initial broader discovery started at `2026-11-17T00:00:00Z`; final paginated GET discovery used the exact prior-digest cutoff.

Open-PR GET pagination covered 126 records in pages of 100 and 26. Six records are in-window, all non-draft User accounts and none carrying `ai-reviewed`; no bot or draft exclusion was needed. #10988's `release` label does not make its member-authored bugfix a bot release PR.

Author association was checked before diffs, checks, linked issues or discussions. The three `MEMBER` PRs received only membership/label handling. For costajohnt (`CONTRIBUTOR`) and bellussi1 (`NONE`), collaborator-permission GETs returned HTTP 403, "Must have push access to view collaborator permission." Current-main tree inspection found no CODEOWNERS at root, `.github` or `docs`. Core membership could not be independently verified for these two authors, so normal triage was used.

Final discovery confirmed the analysed PRs remained open, non-draft, without `ai-reviewed`, and at the analysed heads:

- #10994: `f9561a6eda27e05a34c331b5a62a0d560810287e`.
- #10993: `60fca30ed73cc47e1c16bf20cdf197f8474d8510`.
- #10995: `2308ffe8424f6ab6b2e88c717fcc3e3f05972c5d`.

Repository labels were read with paginated GET. Every proposed label exists; no label creation is needed. The unresolved behaviour decision is listed in #10994's action block for maintainer feedback.

### Synchronization and checkout

Verified `/Users/darobins/dev/react-spectrum-triage`, branch `triage_support`, empty index, no merge in progress and an absent target digest. Initial and pre-write session-status checks found no other active triage run; pre-write verification also found no index lock.

`git fetch origin` succeeded. The tracked-change check outside `.github/triage` was empty; `git merge origin/main --no-edit` reported "Already up to date." Incorporated `origin/main` is `2ac28d36146c2acd008fc397fbd36535e894a516`, verified as an ancestor of HEAD. No merge was skipped or conflicted.

The pre-existing local `.github/triage/setup.md` adaptation remains unstaged and unmodified by this run; its pre-write blob hash is `a194d4c22c50544f28e10db1f99d70fd47c948de`. No other checkout was used or branch switched.

### Read failures and recovery

The prompt initially exceeded the file-read limit; bounded reads recovered all content, including its final label and ordering rules. An attempted range beyond EOF was corrected. `.github/CODEOWNERS` was absent; current-main tree inspection checked conventional locations.

Two initial `gh search` commands misparsed inline `repo:` qualifiers and failed before subsequent chained searches ran. Reissuing with `--repo adobe/react-spectrum` succeeded. Oversized evidence outputs were recovered with narrower JSON fields, separate queries and bounded reads; original-issue comments and complete analysed diffs were available. Collaborator-permission restrictions remain as described above; they do not establish core membership.

No required synchronization or safety step failed. No source was fetched from a PR branch or applied.

### Boundaries and commit bookkeeping

Dry run: GitHub access used only allowed `gh pr list/view/diff`, `gh issue view`, `gh search` and explicit GET API reads. No comments, labels, reviews, edits, closures, gists or other GitHub writes. No contributor-supplied URL was opened, and no PR code, reproduction, dependency or test was checked out, installed, built or executed. External reproductions and media are provided but not inspected where present; the Table inline reproduction was assessed only by reading.

Only `.github/triage/tmp-digests/triage-prs-2026-11-18.md` is to be staged after repeating the empty-index check, verified as the sole staged path, and committed with `chore: add PR triage digest 2026-11-18` and the prescribed Copilot co-author trailer. The resulting hash and single-file commit are verified and reported separately to avoid self-referential edits. No push.
