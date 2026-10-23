| PR | Complexity | Red flags | Would label | Would comment | Would close / duplicate of | Confidence |
| --- | --- | --- | --- | --- | --- | --- |
| [#10847](https://github.com/adobe/react-spectrum/pull/10847) Search collapsed doc props | Low | No linked issue or test; prior table-layout objection; CLA action required | Would apply `small review`, `ai reviewed`, `small impact`, `needs signoff` | Would comment: link #9374, browser regression coverage, CLA | Would not close; would link #9374 | Medium |
| [#10845](https://github.com/adobe/react-spectrum/pull/10845) ProgressCircle SVG radius | Low | Lint failure; CLA action required; test checks representation, not reported diagnostics | Would apply `small review`, `ai reviewed`, `small impact` | Would comment: browser-level diagnostic/geometry assertions | Would not close; no competing fix found | High |
| [#10841](https://github.com/adobe/react-spectrum/pull/10841) Calendar year bounds | High | Latest revision expands behavior; old approval dismissed; fresh CI pending; existing `small review` understates scope | Would apply `ai reviewed`, `small impact`, `risk`, `needs API review`; would remove `small review` | Would comment: boundary-window behavior and fresh review | Would not close; related #10536/#10838 are distinct | High |
| [#10840](https://github.com/adobe/react-spectrum/pull/10840) Keyboard double activation | High | Shared event contract; closed competing fixes | Would apply `ai reviewed`, `medium impact`, `risk`, `needs API review` | No comment; existing discussion already selects this fix | Would keep over already-closed #10694/#10721 | High |
| [#10842](https://github.com/adobe/react-spectrum/pull/10842) Missing locale day period | High | No additional flag within limited review | Would apply `ai reviewed`, `small impact`, `risk` | No comment | Would not close; no competing fix found | High |

Scope: **2026-10-22 22:26:35 UTC through 2026-10-23 18:56:47 UTC**, using the previous PR digest's stated cutoff rather than a fresh overlapping 24-hour window. Five open, non-draft, human-authored PRs qualified; none had `ai reviewed` or was a release PR. The exact timestamp-bounded listing was repeated before writing. Older PRs already covered yesterday are not repeated.

Setup: verified `/Users/danilu/dev/react-spectrum-triage` on **`triage_support`**, with no initial tracked or staged changes. `git fetch origin` succeeded; `git merge origin/main --no-edit` reported already up to date. Incorporated `origin/main`: **`c53ff23df8ca0b7ec2205a3ecd4a0c7e3433e58f`**; ancestry verified. No merge skip or conflict.

GitHub access was read-only through `gh` views, diffs, checks, and explicit GET requests. No comments, reviews, labels, closures, edits, gists, or pushes. Only this digest is written and committed. No PR checkout, source edits, or local test runs; before/after conclusions below are reasoning, not executed validation.

## #10847 - Search collapsed documentation props

**Low:** +29/-20 across two docs implementation files, with no library public API addition. [The diff](https://github.com/adobe/react-spectrum/pull/10847/files) replaces `{state.isExpanded && children}` with an always-mounted panel `<TableBody {...panelProps} ref={ref} role="rowgroup">`, and makes the internal `TableBody` accept a ref.

- **Issue verification/discussion:** the PR's `Closes` line is still an empty template placeholder, and `closingIssuesReferences` is empty. [#9374](https://github.com/adobe/react-spectrum/issues/9374) supplies the matching reproduction: open the Button docs and search for `onFocusChange`. Its sole [maintainer comment](https://github.com/adobe/react-spectrum/issues/9374#issuecomment-3671937982) says, "we can't add a hidden until found wrapper around the rows since it is a table." Using a valid sibling `tbody` rather than a non-table wrapper is a plausible alternative, not proof it works in the browser. Current [PR discussion](https://github.com/adobe/react-spectrum/pull/10847#issuecomment-6371947923) already requests an issue link; [another maintainer](https://github.com/adobe/react-spectrum/pull/10847#issuecomment-6371409408) requests a useful description.
- **Test quality:** neither changed file is a test, and the test instructions are blank. Would request browser coverage that searches a collapsed prop, observes expansion and a visible match, and verifies manual keyboard disclosure still works with valid table layout. The old conditional rendering removes the searched rows, so the find scenario plausibly distinguishes before/after. Browser find-in-page itself was not run.
- **Other red flags/accessibility:** no new suppression, `as any`, error-silencing non-null assertion, timer, or user-agent branch in the diff. The shown `@ts-ignore` was already present; an oxlint suppression is removed. The change restores the generated `aria-controls` relationship instead of deleting it. Existing hook behavior supplies the DOM manipulation and timing: `packages/react-aria/src/disclosure/useDisclosure.ts:60-74` handles `beforematch`, and `:85-95` sets `hidden="until-found"` when collapsed; those mechanisms are reused, not newly introduced workarounds.
- **API/compatibility:** no exported library prop/event/default changes. Docs DOM changes from one `tbody` to two, keeps collapsed rows mounted, and adds a real controlled panel ID/rowgroup. Would validate table rendering, hidden content, and keyboard behavior rather than claim accessibility is proven.
- **Checks:** 29 passing checks; `Adobe CLA Signed?` is `ACTION_REQUIRED` ([checks](https://github.com/adobe/react-spectrum/pull/10847/checks)). This is unresolved CLA status, not proof of its cause.
- **Duplicates/signoff:** searches for `9374`, `DisclosureRow`, collapsed props, and prop-table search found the matching issue but no competing focused fix. Would request team confirmation of the `tbody` approach because of the explicit earlier table-layout concern; this is a design-validation flag, not a claim that the team rejected the PR.

**Would have done**
- **Labels:** would apply `small review` for the localized docs patch; `ai reviewed` for digest coverage; `small impact` for docs-only scope; `needs signoff` for confirming the table-specific approach. Would remove none.
- **Comment:** would comment:
  > This appears to address #9374; please link it and replace the template-only description with the problem and test instructions. That issue notes a table-layout constraint around hidden-until-found, so please demonstrate that the sibling tbody approach preserves layout and expands a collapsed property when browser find matches it, including the onFocusChange example. Please add browser regression coverage for the reveal and manual keyboard disclosure paths, and complete the CLA steps so the Adobe CLA check can pass.
- **Close / link:** would not close; would link #9374. No duplicate closure.
- **Other:** would escalate the table/find-in-page compatibility question for team signoff; assignments none.
- **Confidence:** medium; browser evidence and team acceptance of this table strategy would increase confidence and clear the signoff concern.
- **Feedback prompt:** Is `needs signoff` warranted for revisiting the documented table-layout limitation?

## #10845 - ProgressCircle SVG radius diagnostics

**Low:** +38/-3 in one S2 component and a new browser test. [The diff](https://github.com/adobe/react-spectrum/pull/10845/files) moves all three circles from `r={radius}` to `style={{r: radius}}`, preserving the radius expression.

- **Issue verification/discussion:** [#10837](https://github.com/adobe/react-spectrum/issues/10837) reproduces three parser diagnostics per mount in Playwright WebKit/Firefox using published S2 1.8.2 and `<ProgressCircle size="L" aria-label="Loading" isIndeterminate />`. It explicitly says the spinner still renders and gives a 60x60 circle bounding box inside a 64x64 progressbar. The issue has no comments, confirmed through its comments endpoint. Removing the invalid SVG attribute plausibly removes its parser diagnostic; the issue itself proposes CSS geometry. The linked external reproduction was not downloaded or executed.
- **Test quality:** the rendered-component browser test covers all three circles, but asserts `circle.hasAttribute('r')` is false and the inline style equals `calc(50% - 0.125rem)`. It would fail on the old representation and pass on the new one, but does not assert the actual warning/error disappearance or nonzero rendered geometry. Would request those outcome assertions, especially in WebKit/Firefox, rather than call the existing test absent.
- **Other red flags/accessibility:** no added suppressions, unsafe casts, timing hacks, manual DOM mutation, user-agent sniffing, or removed ARIA/keyboard behavior in the patch. `querySelectorAll('svg circle')` is test inspection, not a production workaround.
- **API/compatibility:** no new public props/types/events or changed numeric defaults. Consumer-visible DOM representation changes: `circle[r]` is removed and inline CSS `r` is added; selectors or DOM inspection relying on the old attribute may change. No class, `data-*`, or CSS-variable change. Would not automatically apply `needs API review` for this internal SVG correction; visual equivalence remains a browser-validation question.
- **Checks:** `ci/circleci: lint` and aggregate `commit` fail; CLA is `ACTION_REQUIRED` ([checks](https://github.com/adobe/react-spectrum/pull/10845/checks)). [The maintainer already says](https://github.com/adobe/react-spectrum/pull/10845#issuecomment-6369705562), "Imports should be sorted alphabetically," and asks for CLA completion; would not repeat that existing reminder. The body acknowledges lint is unresolved; the browser test check passes.
- **Duplicates/signoff:** searches for `10837` and `ProgressCircle radius` found this fix and the issue, plus historical table-feature PRs #9883/#6778, not a competing diagnostic fix. Would not require new signoff for this focused correction.

**Would have done**
- **Labels:** would apply `small review` for the localized patch; `ai reviewed` for coverage; `small impact` for diagnostic cleanup. Would remove none. Would not apply `regression` or `patch worthy`: an affected version alone does not establish a regression, and lint/CLA remain unresolved.
- **Comment:** would comment:
  > The new test checks the attribute-to-style move, but #10837 reports browser parser diagnostics while the spinner still renders. Please extend the browser coverage to verify that mounting the issue's example emits no invalid-radius warnings/errors in WebKit and Firefox and that the circles retain nonzero, equivalent rendered geometry. Keep the current all-three-circles assertions as a structural check.
- **Close / link:** would not close; would retain #10837. No duplicate closure.
- **Other:** would wait for the already-requested lint and CLA fixes; assignments and escalation none.
- **Confidence:** high on the missing outcome assertions and reported CI blockers; actual browser geometry/diagnostic evidence could clear the test concern.
- **Feedback prompt:** Should outcome-level browser assertions be required beyond the existing representation test?

## #10841 - Calendar year bounds and termination

**High:** the latest head, `3db0fb8654bccfe2ce10c448465c4263fb728095`, changes shared React Aria calendar behavior and RAC Calendar/RangeCalendar tests (+294/-11, three files). In addition to terminating year iteration, [the latest diff](https://github.com/adobe/react-spectrum/pull/10841/files) now shifts an unconstrained end of the year window at calendar-system bounds to preserve `visibleYears`, rather than merely stopping the infinite loop.

**API/compatibility:** no public signature/export or DOM/CSS-template changes. The existing `visibleYears` behavior changes at upper and lower calendar limits: `if (!state.maxValue && isSameYear(maxDate.add({years: 1}), maxDate))` shifts the minimum, while the symmetric `!state.minValue` branch can shift the maximum; explicit min/max constraints are reapplied. Would apply `needs API review` to this newly expanded behavior, distinct from the original termination guard `if (isSameYear(nextDate, itemDate)) { break; }`.

**Duplicates:** [#10839](https://github.com/adobe/react-spectrum/issues/10839) is the linked page-hang reproduction. Exact issue-number and `CalendarYearPicker` searches found no competing boundary-termination PR. [#10536](https://github.com/adobe/react-spectrum/pull/10536), merged September 9, fixes omission of a constrained final year, not the unbounded loop; [#10838](https://github.com/adobe/react-spectrum/issues/10838) concerns selecting a year unexpectedly changing the displayed month, not termination. Would keep these separate and consider their constraints during review.

**Freshness:** the head changed during this run from `6d1cc194...` to `3db0fb86...`; classification and API assessment use the new patch. The earlier "Thanks for the PR" approval is now `DISMISSED`; fresh `commit`/install checks are pending or in progress, not a green build. The prior revision's passing checks do not validate this revision ([checks](https://github.com/adobe/react-spectrum/pull/10841/checks)). Full low-complexity red-flag review was not performed.

**Would have done**
- **Labels:** would apply `ai reviewed` for scoped coverage; `small impact` for calendar-boundary inputs; `risk` for shared year-window construction; `needs API review` for altered `visibleYears` behavior. Would remove `small review` because this is a shared behavior change with expanded cross-component tests; would retain `ready for review`.
- **Comment:** would comment:
  > The latest revision now shifts year windows at both calendar-system bounds to preserve visibleYears, in addition to stopping the year-9999 loop. Please call out that behavior change explicitly for API review, including how explicit minValue/maxValue interact with it. The prior approval is dismissed and the new head's checks are still running, so this revision needs fresh review and CI results.
- **Close / link:** would not close; would retain #10839 and link #10536/#10838 as related but distinct.
- **Other:** would request fresh human/API review of the expanded revision; assignments none.
- **Confidence:** high on scope/API change and snapshot state; maintainer acceptance of the boundary-window contract and fresh passing checks would clear those concerns.
- **Feedback prompt:** Should a boundary-window behavior expansion lose `small review` and require `needs API review`?

## #10840 - Duplicate keyboard activation on native controls

**High:** shared `usePress` behavior plus RAC Button/Toggle browser tests and browser-runner configuration (+175/-1, four files). [The patch](https://github.com/adobe/react-spectrum/pull/10840/files) records the relevant keyboard event and excludes trusted default keyboard clicks from virtual activation when `state.defaultKeyboardClickEvent?.defaultPrevented === false`, addressing [#10658](https://github.com/adobe/react-spectrum/issues/10658).

**API/compatibility:** no new public prop/type/export or DOM/class/CSS-variable change. The observable `onPress`/`onClick` event contract changes from duplicate to single keyboard activation on affected native controls, while canceled default activation and programmatic/virtual activation need to remain valid; the shared hook affects more than submit/reset buttons. Browser tests also become file-serial through `fileParallelism: false`, a repository-wide test-execution change. Would apply `needs API review` for the shared event-contract correction, not assert a new public signature.

**Duplicates:** [#10694](https://github.com/adobe/react-spectrum/pull/10694) and [#10721](https://github.com/adobe/react-spectrum/pull/10721) are already closed, unmerged competitors. Both use zero-delay timeout guards; #10721 specifically gates submit/reset buttons and adds Jest tests, while #10694 uses the shared emulated-click guard and browser tests. The [maintainer explicitly rejected timer dependence](https://github.com/adobe/react-spectrum/pull/10721#issuecomment-6115224273), noted [Checkbox also duplicates clicks](https://github.com/adobe/react-spectrum/pull/10721#issuecomment-6049972975), and closed both in favor of #10840 ([#10721 closure](https://github.com/adobe/react-spectrum/pull/10721#issuecomment-6357950519), [#10694 closure](https://github.com/adobe/react-spectrum/pull/10694#issuecomment-6357959587)). Would keep #10840: it avoids those timeout guards, includes native-control browser coverage, has team approval, and follows the explicit selection; no speculative responsiveness ranking is needed. Open [#10750](https://github.com/adobe/react-spectrum/pull/10750) changes Enter behavior in `useRadio` rather than duplicate Space activation in `usePress`; would coordinate keyboard expectations, not close it as a duplicate.

**Checks:** all 31 reported checks pass, including CLA; a maintainer approval is present ([checks](https://github.com/adobe/react-spectrum/pull/10840/checks)). Full low-complexity red-flag review was not performed.

**Would have done**
- **Labels:** would apply `ai reviewed` for scoped coverage; `medium impact` for multiple native-control consumers; `risk` and `needs API review` for the shared event-contract change. Would remove none.
- **Comment:** no comment; duplicate selection and the no-timeout constraint are already documented.
- **Close / link:** would not close #10840; would keep it over already-closed #10694/#10721. Would link #10750 as related, not duplicate.
- **Other:** would request shared-event/API review and coordinate with #10750; new assignments and signoff escalation none because the team is already engaged.
- **Confidence:** high on the preference, scope, and snapshot checks; evidence of a genuine virtual-activation regression could change readiness, which this limited review does not certify.
- **Feedback prompt:** Is `needs API review` useful for an approved bug fix that corrects observable shared event counts?

## #10842 - Locales without a day-period part

**High:** shared `useDateSegment` behavior plus RAC DateField/TimeField tests (+115/-16, three files), despite the focused crash fix. [The diff](https://github.com/adobe/react-spectrum/pull/10842/files) replaces the assumed day-period value with `?.value ?? ''` and guards both keyboard and composition matching with `am !== ''` / `pm !== ''`, addressing [#10833](https://github.com/adobe/react-spectrum/issues/10833).

**API/compatibility:** no new public prop/export/type/event or DOM/class/CSS-variable change. Existing fields in locales such as `fr-CM` render rather than throw, and an absent AM/PM marker is not treated as a keyboard/composition match; the formatter lookup still runs for every segment. Would not apply `needs API review` solely for handling this previously crashing input, but would apply `risk` because the shared input path affects DateField/TimeField/DatePicker consumers.

**Duplicates:** exact `10833` and `fr-CM` searches returned only the source issue and this PR, across open/closed results. The issue's reproduction and proposed guard align with the patch; it has no discussion establishing a conflicting team constraint. Would not require a new signoff label just because a reported crash has no prior maintainer reply.

**Checks:** all 29 reported checks pass, including CLA ([checks](https://github.com/adobe/react-spectrum/pull/10842/checks)). Full low-complexity red-flag review was not performed; the author's claimed local test counts were not independently reproduced.

**Would have done**
- **Labels:** would apply `ai reviewed` for scoped coverage; `small impact` for the affected locale/input edge; `risk` for shared segment keyboard/composition behavior. Would remove none.
- **Comment:** no comment.
- **Close / link:** would not close; would retain #10833. No competing fix found in the targeted searches.
- **Other:** none; assignments and new signoff/API escalation none.
- **Confidence:** high on classification, compatibility assessment, and targeted duplicate search; broader locale/input regressions found in human review would change readiness.
- **Feedback prompt:** Is high complexity plus `risk`, without `needs API review`, the right treatment for a localized shared-hook crash fix?

## Rule feedback

- **Since-last-digest scope:** used the preceding digest's explicit end timestamp, not its file modification/commit time, and froze the new scope at the first candidate inventory. PR-head updates during the run were still assessed; #10841 was refreshed when its head changed.
- **Complexity precedence:** core `@react-aria` behavior takes the explicit high-complexity rule even when source changes are small or an existing `small review` label suggests otherwise. Only #10847/#10845 received full low-complexity red-flag coverage.
- **API judgment:** would use `needs API review` for #10841's expanded boundary-window behavior and #10840's shared event counts; would not automatically use it for #10845's internal SVG attribute-to-style change or #10842's crash guard. All observable compatibility changes are still recorded.
- **Signoff candidates:** #10847 alone would be escalated because of the concrete prior table-layout concern; absence of a maintainer comment on a straightforward crash report is not itself lack of permission to fix it.
- **Labels to create:** the live repository label list lacks `ai reviewed`, `small impact`, `medium impact`, `risk`, and `needs signoff`, all proposed above. `small review` and `needs API review` exist. No labels were created or applied.
- **Search limitation/recovery:** initial `gh search issues` calls misparsed the repository-qualified query. Retried with explicit `gh api --method GET search/issues` and proper `q` parameters; duplicate recommendations use those successful results. Broad keyword searches produce unrelated historical PRs and are not proof of exhaustive uniqueness; no unsupported duplicate closure is proposed.
- **Evidence limits:** no PR checkout or test execution, browser find interaction, screen-reader pass, or external reproduction download. #10845's existing browser test was read, but browser diagnostic/geometry equivalence was not independently verified. #10847's valid table markup and reused disclosure hook are plausible evidence, not a successful cross-browser reproduction. CLA `ACTION_REQUIRED` is reported as unresolved, not conclusively unsigned.
- **Snapshot freshness:** #10841 is assessed at `3db0fb8654bccfe2ce10c448465c4263fb728095` with pending checks and a dismissed approval; #10847 at `0345657fc177213b417bd691a677c1758121f6f1`, #10845 at `7cedeaddfe3a45516ea8350ddc45270ef1433dd6`, #10840 at `b1c554e818c93741b1196aa46b074ced84bad86f`, and #10842 at `76ec943c209f25acef31837213fe3a28c5e8e8fd`. Checks and discussions can change after observation.
