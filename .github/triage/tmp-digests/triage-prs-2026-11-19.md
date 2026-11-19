# PR triage digest: 2026-11-19

## At a glance

- Two eligible PRs analysed: one needs author follow-up; one is ready and already approved. No verified member PRs or competing open duplicates.
- The Table starter change omits its synchronised hook CSS counterpart and has unanswered maintainer questions.
- The ColorSwatchPickerItem change adds public focus-event types, not new runtime handling; retain API-review visibility despite its small production diff.

### [#10996](https://github.com/adobe/react-spectrum/pull/10996): Accessible sortable Table starter headers

**Decision:** Not ready; resolve CSS synchronisation and outstanding maintainer feedback before substantive re-review.

**Complexity:** Low. A small, localised Table starter fix across the vanilla and Tailwind variants; no package API changes.

**Impact/severity:** Unknown. Screen reader users lack the sortable header text's interactive role, but the issue does not establish essential-task blockage, affected browser/AT scope or a practical supported workaround.

**Merge risk:** Medium. Native focus-visible styling replaces RAC focus-ring state, and the changed CSS has an established synchronisation dependency.

#### What matters

- The [three-file diff](https://github.com/adobe/react-spectrum/pull/10996/files) replaces `Group` with a `div` carrying `role={allowsSorting ? 'button' : undefined}`. This follows the [earlier maintainer direction](https://github.com/adobe/react-spectrum/pull/10364#discussion_r3701623196) to avoid widening Group's role API.
- The [current PR review](https://github.com/adobe/react-spectrum/pull/10996) reports `Hook starter CSS is out of date: Table.css`. The diff changes `starters/docs/src/Table.css` but not `starters/hooks/src/Table.css`; the repository sync script requires these to match.
- Maintainer questions about the [focus-selector change](https://github.com/adobe/react-spectrum/pull/10996#discussion_r4622309489) and [non-sortable presentation role](https://github.com/adobe/react-spectrum/pull/10996#discussion_r4622314052) remain unanswered. `s2-docs` and `typecheck-docs` are failing; their separate underlying logs were not available in GitHub check output.
- The author describes a discarded integration test and Chromium recording, not a retained regression test. Tailwind browser behaviour, forced colours, RTL, Firefox, Safari and screen reader output remain unverified; supplied media was not opened.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `small review`, because the implementation is focused; `ai-reviewed`, because this revision was triaged; `merge-risk: medium`, for focus-styling and verification exposure; `waiting on author`, for the concrete non-CLA tasks below.
- Maintainer-only: no readiness addition while these blockers remain.
- Removals: none. Preserve `Table`. All proposed labels exist.

**Maintainer next step**

1. Ask the author to synchronise the hook starter CSS using the repository's existing mechanism and resolve the two failing docs checks, identifying any unrelated failure separately.
2. Obtain answers to the existing review questions, including the intentional semantics of non-sortable headers and why native focus-visible preserves the required focus behaviour.
3. Request durable interaction coverage where feasible for sortable/non-sortable names, keyboard and screen reader activation, resizer navigation and focus indication in both starters. Review the declared browser/AT gaps rather than treating the discarded test or recording as independent verification.
4. Continue with this PR rather than reopening the older closed proposal; no duplicate closure is needed.

### [#10997](https://github.com/adobe/react-spectrum/pull/10997): ColorSwatchPickerItem focus-event API

**Decision:** Ready for maintainer review and already approved at the analysed head; preserve that state and make the additive API explicit.

**Complexity:** High under the rubric because it adds public API, despite only two production lines changing.

**Impact/severity:** Unknown. Typed focus callbacks improve keyboard/hover parity, but the linked request does not establish task consequence, scope or a supported workaround sufficient for a severity rating.

**Merge risk:** Medium. Runtime forwarding already exists, but public type exposure needs API assessment; this high-complexity classification receives the limited review, not the full low-complexity red-flag review.

#### What matters

- The [source diff](https://github.com/adobe/react-spectrum/pull/10997/files) adds `FocusEvents<HTMLDivElement>` to `ColorSwatchPickerItemProps`, exposing `onFocus`, `onBlur` and `onFocusChange`. It does not change DOM structure, defaults or production event handling.
- Mainline already spreads item props into `ListBoxItem`, which invokes `useFocus(props)`. The new story exercises the typed API; interaction tests cover keyboard/mouse transitions and focused rerenders.
- The [original request's maintainer response](https://github.com/adobe/react-spectrum/issues/6460#issuecomment-2153382508) supports focus/hover parity. Snowystinger approved this exact revision, CLA is signed and the reported CI checks are green.
- This is not a duplicate of the merged GridListItem, Table Row or TreeItem changes: each extends a different component. Existing `ready for review` is retained; no unresolved direction decision was identified.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `ai-reviewed`, because this revision was triaged; `merge-risk: medium`, for additive public typing and the limited-review scope; `needs API review`, to make the exported event surface explicit.
- Maintainer-only: retain existing `ready for review`; the current-head approval may already satisfy API review, which maintainers can confirm before resolving that marker.
- Removals: none. Preserve `RAC` and `ColorSwatchPicker`. Do not add `small review`: public API makes this high complexity under the prescribed rule. All proposed labels exist.

**Maintainer next step**

1. Confirm the existing approval covers the three event props and their `HTMLDivElement` target type, then continue normal review/merge handling.
2. Check generated prop documentation reflects the inherited events. No author blocker was identified by this limited review; browser/AT behaviour was not independently exercised.

## Evidence and verification

### #10996: CSS dependency and accessibility behaviour

The [mainline CSS synchroniser](https://github.com/adobe/react-spectrum/blob/7e229ef6139e08d3bf75d2ddb444425108f271ec/scripts/syncStarterCss.mjs#L5-L59) compares shared vanilla/hook CSS byte-for-byte; only Modal, RangeCalendar and Tooltip are exceptions. Table is not exempt. Its missing companion edit is therefore supported by both source inspection and the maintainer's quoted CI output. Neither the synchroniser nor any PR code was executed.

GitHub's commit-check summary confirms both docs jobs failed but contains no job error logs or annotations. The specific cause of each job cannot be independently assigned from that summary alone. The author-reported local type-check pass does not override the failing remote jobs.

All three comments on [original #8502](https://github.com/adobe/react-spectrum/issues/8502) were read. The reporter explains that the focused text receives screen reader clicks that propagate to the column header. Current [column-header behaviour](https://github.com/adobe/react-spectrum/blob/7e229ef6139e08d3bf75d2ddb444425108f271ec/packages/react-aria/src/table/useTableColumnHeader.ts#L71-L144) installs sorting press handling on the header; the proposed inner element retains its focusability. This plausibly fixes role exposure, but does not itself verify screen reader activation or native focus-visible parity.

Mainline starters still use `Group role="presentation"` and data-driven focus indication. The [sorting documentation](https://github.com/adobe/react-spectrum/blob/7e229ef6139e08d3bf75d2ddb444425108f271ec/packages/dev/s2-docs/pages/react-aria/Table.mdx#L519-L521) exposes `allowsSorting`; that enables sorting but does not repair the nested starter role. No existing public starter prop or already-merged fix was found that supplies the missing semantics without changing the starter. Custom RAC composition is possible, but is not evidence that these shipped starter examples are already correct.

The full low-complexity diff was read. No new suppressions, unsafe casts, timing delays, user-agent branches or imperative DOM workaround appear. The role and focus-selector changes are compatibility-relevant DOM/styling changes, not a new exported prop or Group API. There is no retained test in the diff: the author's reported throwaway rendered/interaction test would distinguish the old missing button role, but cannot provide ongoing regression coverage.

Closed [#10364](https://github.com/adobe/react-spectrum/pull/10364) targets the same issue and starter files. Both PRs have successful CLA checks. The older proposal widened `GroupProps.role`; the maintainer rejected that approach and later closed it as stale, not because the accessibility fix was unwanted. The current PR follows the requested plain-element direction and is the better continuation, subject to its blockers.

No prior working version or historical transition was supplied for #8502. It establishes an existing accessibility defect, not a supported regression; no regression label is proposed.

### #10997: API-only production change and review limits

Current [ColorSwatchPickerItem](https://github.com/adobe/react-spectrum/blob/7e229ef6139e08d3bf75d2ddb444425108f271ec/packages/react-aria-components/src/ColorSwatchPicker.tsx#L108-L175) lacks `FocusEvents` in its exported interface but passes props to ListBoxItem. Current [ListBoxItem handling](https://github.com/adobe/react-spectrum/blob/7e229ef6139e08d3bf75d2ddb444425108f271ec/packages/react-aria-components/src/ListBox.tsx#L559-L624) invokes `useFocus(props)` and merges its focus props. The added JavaScript tests can therefore pass before this type-only change; the story's previously failing TypeScript call site is the meaningful before/after API evidence. The author reports that before/after type-check result; it was not independently run.

The author reports nine ColorSwatchPicker tests and a broader 122-pass, one-skip selection, plus lint/type checks. These are attributed results, not automation execution. CI also reports browser tests successful, but per-case browser/AT coverage is not exposed here; the author explicitly did not perform local interactive Storybook, screen reader or RTL checks.

All three comments on [#6460](https://github.com/adobe/react-spectrum/issues/6460) and the available PR discussions were read. Merged [#10822](https://github.com/adobe/react-spectrum/pull/10822), [#10857](https://github.com/adobe/react-spectrum/pull/10857) and [#10993](https://github.com/adobe/react-spectrum/pull/10993) extend GridListItem, Table Row and TreeItem respectively, not ColorSwatchPickerItem. The [current documentation](https://github.com/adobe/react-spectrum/blob/7e229ef6139e08d3bf75d2ddb444425108f271ec/packages/dev/s2-docs/pages/react-aria/ColorSwatchPicker.mdx#L97-L99) generates the item prop table, so inherited API documentation needs checking rather than assuming a missing handwritten section.

The original request's render-time dataset workaround is not recommended. No regression transition is claimed or established.

### Duplicate discovery and sensitive-file boundary

All-state PR/issue searches covered #8502, sortable column/button semantics, #6460, ColorSwatchPicker focus and the exact ColorSwatchPickerItem identifier. Related results for generic DOM-event forwarding, render customisation and documentation do not establish another implementation of these new typed callbacks. No competing open same-behaviour PR was found; the closed Table predecessor is compared above.

Neither analysed diff changes CI workflows, dependency/script manifests, lockfiles, install scripts or build configuration. The mandatory **needs security review** sensitive-file flag is not triggered. No security audit was performed.

## Run notes

### Scope and discovery

Window: since previous PR digest commit `1af451e713cbb513ab051ddc9668e4c196bc1efe`, `2026-11-18T17:23:52Z`, through final discovery at `2026-11-19T16:35:03Z`. Initial broader discovery started at `2026-11-18T00:00:00Z`; #10994 and #10995 precede the exact cutoff and were not retriaged.

Paginated open-PR GET discovery covered 123 records in pages of 100 and 23. Exactly two records fall within the final window, both non-draft User accounts without `ai-reviewed`; no draft, bot or member exclusion was needed.

Both authors have `CONTRIBUTOR` association, which does not establish membership. Collaborator-permission GETs for bellussi1 and jsabutis each failed with HTTP 403, "Must have push access to view collaborator permission." Current-main tree inspection found no CODEOWNERS at root, `.github` or `docs`; no other verified core-contributor evidence was available. Normal triage was used, without inferring membership from prior contributions or approvals.

Final discovery confirmed both PRs remained open, non-draft, unlabelled `ai-reviewed`, and at their analysed heads:

- #10996: `853e47d078af1ba76301e69fd1e2bc28dfd61d07`.
- #10997: `cdf989ca08ef29bef984df76f202b3401a5494ee`.

No member PRs were skipped. Repository labels were read with paginated GET; every proposal exists and no label creation is needed. No unresolved product/scope decision requiring a separate feedback item was identified.

### Synchronisation and checkout

Verified `/Users/darobins/dev/react-spectrum-triage`, branch `triage_support`, empty index, absent target digest, no merge in progress and no index lock. Initial and pre-write live session checks showed no other active triage run.

`git fetch origin` succeeded. The tracked-change check outside `.github/triage` was empty, so `git merge origin/main --no-edit` ran successfully. Merged main commit: `7e229ef6139e08d3bf75d2ddb444425108f271ec`; resulting merge commit: `cc0384838a01b3a6739fae50d7b9f50093736a0e`. Main was verified as an ancestor of HEAD. No merge was skipped or conflicted.

The pre-existing local `.github/triage/setup.md` adaptation remains unstaged and was not edited; its pre-write blob hash is `a194d4c22c50544f28e10db1f99d70fd47c948de`. No other checkout was used and no branch was switched.

### Read failures and recovery

The triage prompt exceeded the initial file-read limit; bounded reads recovered its content, including the final label/ordering rules. One out-of-range read was corrected. An oversized PR response was recovered using separate diff, discussion and compact check reads. A local search initially had an unescaped brace and was corrected. The two permission-denied membership reads remain an explicit evidence limitation, not a failed safety check.

All required synchronisation and safety steps succeeded. GitHub check summaries, rather than external CI URLs, were read for the failing Table jobs; their underlying logs remain unavailable within this run's permitted reads.

### Boundaries and commit bookkeeping

Dry run: GitHub access used only allowed `gh pr view/diff`, `gh issue view`, `gh search`, and explicit GET API reads. No GitHub comments, labels, reviews, edits, closures, gists or other writes. No PR branch was fetched, checked out or applied; no PR code, dependencies, tests or reproductions were installed, built or executed. Contributor-supplied URLs and media were not opened. Correctness assessments are by reading and reasoning.

Only `.github/triage/tmp-digests/triage-prs-2026-11-19.md` is to be staged after repeating the empty-index check, verified as the sole staged path, and committed with `chore: add PR triage digest 2026-11-19` and the prescribed Copilot co-author trailer. The resulting hash and single-file commit are verified and reported separately to avoid self-referential edits. No push.
