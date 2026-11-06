# Issue triage digest — 2026-10-26

> Presentation-only revision of the original digest. This is not a fresh triage run; no historical proposal is executed or newly authorized by this rewrite.

## At a glance

- Three reports: CheckboxGroup inheritance and two iOS Sheet gestures.
- The validation cause was source-backed; device-only Sheet behavior remained unverified.
- All stayed open, with proposed new labels explicitly conditional.

## Issues

### [#10856](https://github.com/adobe/react-spectrum/issues/10856) — CheckboxGroup validation inheritance

**Decision:** Keep open; fix item-level validation inheritance.
**Impact / severity:** Medium.
**Complexity:** Not assessed in the original run.
**Confidence:** high.

#### What matters

- Required groups reportedly block native submission despite opting into aria validation.
- The RAC wrapper supplies a native default before the group fallback can run.
- The public per-child prop is a workaround; release-tag attribution and S2 impact were not independently checked.

#### Would have done

**Labels (proposed)**

- add `bug` (confirmed regression in behavior)
- `CheckboxGroup` and `Checkbox` (affected components)
- `RAC` (layer)
- `has workaround` (set the prop on each Checkbox). Would also add `regression` if it existed
- it does not exist in the repo yet (proposed new label). Not adding `needs investigation`, the cause is already identified.

**Maintainer next step**

- Preserve standalone defaults while fixing group inheritance; add a CheckboxGroup test.
- Historical comment proposal only: maintainer-reviewed wording is retained in the #10856 evidence appendix; nothing was posted by this revision.

### [#10854](https://github.com/adobe/react-spectrum/issues/10854) — Sheet slow-drag threshold

**Decision:** Keep open; reproduce on a device and decide the dismiss model.
**Impact / severity:** Medium.
**Complexity:** Not assessed in the original run.
**Confidence:** medium.

#### What matters

- A short sheet reportedly cannot dismiss by slow drag before crossing half the viewport.
- Source uses a viewport-based native scroll-snap track; real iOS touch behavior was not verified.
- Flick or an app-provided close control may remain available; snapPoints reportedly does not help.

#### Would have done

**Labels (proposed)**

- `needs investigation` (iOS touch behavior must be reproduced on a device)
- `RAC` (layer)
- `mobile testing`. Would add `Sheet` and `bug` or `enhancement` once decided. `Sheet` does not exist as a label in the repo (proposed new label). Not adding `bug` yet because the intended dismiss model is a maintainer call.

**Maintainer next step**

- Ask Sheet owners whether height-relative or velocity-based dismissal belongs in the model; request earlier-iOS results if needed.
- Historical comment proposal only: maintainer-reviewed wording is retained in the #10854 evidence appendix; nothing was posted by this revision.

### [#10855](https://github.com/adobe/react-spectrum/issues/10855) — Sheet gesture hand-off

**Decision:** Keep open; investigate native-scroller hand-off on iOS.
**Impact / severity:** Medium.
**Complexity:** Not assessed in the original run.
**Confidence:** medium.

#### What matters

- A quick second gesture reportedly targets the previous scroller for about 500 ms.
- The nested snapping architecture is source-backed; the delay and browser/OS attribution remain unverified.
- The behavior self-recovers and no data loss is reported; #10854 shares architecture, not the symptom.

#### Would have done

**Labels (proposed)**

- `needs investigation` — remaining behavior or cause verification.
- `RAC` — reported component layer.
- `mobile testing`. Possibly `browser bug` or `OS bug` if confirmed as WebKit behavior. Would add `Sheet` (proposed new label, does not exist). Not adding `bug` until investigated.

**Maintainer next step**

- Run device tests with Sheet owners; treat the historical local scroll-snap experiment as maintainer-editable, not a supported workaround.
- Historical comment proposal only: maintainer-reviewed wording is retained in the #10855 evidence appendix; nothing was posted by this revision.

## Evidence and verification appendix

### #10856 — Evidence and verification

Link: https://github.com/adobe/react-spectrum/issues/10856 (author `msenejoa`, no labels, no comments)

#### Summary

A `CheckboxGroup` with `isRequired validationBehavior="aria"` still blocks a native form submit when nothing is checked.

Worked in 1.17.0, broken in 1.18.0 through 1.22.1.

Reporter attributes it to #9877 (f23d22f).

#### Verification against `origin/main` (read-only)

- `packages/react-aria-components/src/Checkbox.tsx:432-447`, `useCheckboxAria`:
  `let validationBehavior = props.validationBehavior ?? formValidationBehavior ?? 'native';` and then `checkboxProps = {..., validationBehavior}` is passed to `useCheckboxGroupItem(checkboxProps, groupState, inputRef)` when inside a group.
- `packages/react-aria/src/checkbox/useCheckboxGroupItem.ts:62-64`:
  `let {name, form, descriptionId, errorMessageId, validationBehavior} = checkboxGroupData.get(state)!;` then `validationBehavior = props.validationBehavior ?? validationBehavior;`.
  Because the RAC wrapper always supplies a defined value (`'native'` by default), the group's `validationBehavior` is never used as the fallback. The reporter's diagnosis is correct.
- The group itself resolves `props.validationBehavior ?? formValidationBehavior ?? 'native'` (`Checkbox.tsx:280-281`), so only the item-level resolution is wrong.
- Only affects `react-aria-components` (RAC, and by extension S2's `CheckboxGroup` if it passes `validationBehavior` to the RAC group).

- The `useCheckboxGroupItem` hook is correct when called directly.

- I did not check S2 specifically.
- The existing RAC tests (`packages/react-aria-components/test/Checkbox*.test.js`) have no hits for `validationBehavior`, so nothing covers group inheritance.
- Regression range: introduced in 1.18.0 per the reporter (not independently confirmed from release tags; the code path above matches the claim).

#### Duplicates

searched open and closed issues for "CheckboxGroup validationBehavior" and "Checkbox validationBehavior aria group required".

Only #10856 itself matched.

Searched PRs for "CheckboxGroup validationBehavior".

No open fix PR found.

#### Reproduction

Minimal inline snippet is enough, no StackBlitz needed. Judged by reading, not run.

#### Solvable without changes?

Workaround from the reporter (`validationBehavior="aria"` on every `Checkbox`) is acceptable.

It does not use internals or hacks, so `has workaround` applies.

A real fix is still needed.

#### Severity

Medium. Regression, breaks react-hook-form style flows on required groups, workaround is available and simple, not accessibility-impacting (aria validation is the opt-in path).

#### Suggested fix direction (from `origin/main` source only)

in `useCheckboxAria`, when inside a group (`groupState` set), pass `props.validationBehavior` (possibly `undefined`) instead of the `'native'`-defaulted value, so `useCheckboxGroupItem` falls back to the group's behavior.

Keep the `?? formValidationBehavior ?? 'native'` default for standalone checkboxes.

This needs a test in `CheckboxGroup.test.js`.

#### Confidence and decision-changing evidence

high. Would change if the 1.18.0 attribution turns out to be a different commit, which does not alter the labels.

#### Historical proposed comment (not posted by this revision)

> Thanks for the report and the detailed analysis.
>
> We confirmed that `useCheckboxAria` in `react-aria-components` resolves `validationBehavior` to `'native'` by default and passes it to `useCheckboxGroupItem`, so the group's `validationBehavior` is never used as a fallback.
>
> Until this is fixed, setting `validationBehavior="aria"` on each `Checkbox` inside the group works around it.

#### Historical closure and escalation proposals

- Close / link: none.
- Close / link: Keep open.
- Close / link: No duplicate found.
- Other: none needed; a fix PR plus a test in `packages/react-aria-components/test/CheckboxGroup.test.js` would be welcome (candidate for `help wanted` or `good first issue`, but not applying).

### #10854 — Evidence and verification

Link: https://github.com/adobe/react-spectrum/issues/10854 (author `Cheesus-Crust1`, no labels, no comments; filed 1 second before #10855 by the same author)

#### Summary

On iOS Safari, a slow drag only dismisses a short (content-sized) `Sheet` once it passes about half the viewport, so a sheet shorter than half the screen cannot be closed by a slow drag. Only a flick closes it.

#### Verification (source read only, not run)

`packages/react-aria-components/src/Sheet.tsx:866-870` uses a `200dvh` scroll track with scroll snapping, and `Sheet.tsx:552-571` describes snap markers at the content extremes and "1 viewport" of rest/travel.

That matches the reporter's description (snap decision is made in viewport units, independent of the sheet's height).

Real touch behavior on iOS 27.0.1 was not checked.

#### Duplicates

Searched "Sheet" across open and closed issues.

Related but different Sheet issues: #10749 (cannot drag with a mouse), #10813 (Sheet stays exiting, IntersectionObserver), #10805 (Brave focus with overflowPadding), #10808 and #10814 (closed).

None cover the dismissal threshold.

Same-author #10855 shares the root architecture (native scroller with snapping) but is a different symptom.

Related PRs (all Sheet fixes: #10732, #10815 merged; #10829, #10835 closed; #10783 open) do not mention a height-relative threshold.

#### Reproduction

Uses the docs example unchanged, on a physical iOS device. A StackBlitz would not help since it is device specific; ask for iOS and Safari details only if maintainers cannot reproduce.

#### Solvable without changes?

No.

The reporter states `snapPoints` does not help, and I found no documented prop for a dismiss threshold.

Not verified further.

#### Severity

Medium.

Affects mobile users of any short sheet (confirmations, small forms), where dismissal is by flick only.

The sheet remains closable via a close button or Escape (assuming the app provides one), so this is not blocking or accessibility-breaking.

Sheet is new (blog post and PRs from this month), so it may be considered an enhancement to the swipe model rather than a bug.

#### Confidence and decision-changing evidence

medium. Would change after reproducing on a device, or if maintainers say sheets are intended to dismiss only via flick or close button.

#### Historical proposed comment (not posted by this revision)

> Thanks for the report.
>
> We'll look at this on a device.
>
> The current dismissal threshold comes from the native scroll-snap track (`200dvh`), so it does not scale with the sheet's height.
>
> Does this also reproduce on earlier iOS versions?
  (Maintainer should edit the question as needed.)

#### Historical closure and escalation proposals

- Close / link: none.
- Close / link: Keep open.
- Close / link: Cross-link to #10855 (same reporter and same native-scroll architecture) when commenting.
- Other: escalate to the Sheet owners for a decision on whether a height-relative or velocity-based dismiss threshold is in scope.
- Other: May need `needs API review` if a prop is added (not applying).

### #10855 — Evidence and verification

Link: https://github.com/adobe/react-spectrum/issues/10855 (author `Cheesus-Crust1`, no labels, no comments)

#### Summary

On iOS Safari, a second gesture shortly after the previous one stays with the scroller that handled the first (content or sheet) for about 500 ms.

Reporter guesses (unverified) that iOS keeps touches on a scroller with a running snap or momentum animation, because the sheet is a native snapping scroller around the content scroller.

#### Verification

`Sheet.tsx:866-870` confirms the nested native scroller design (`200dvh` snapping track).

The 500 ms hand-off delay is iOS WebKit behavior and could not be verified here.

Plausibly a `browser bug` or `OS bug` (both labels exist), but that is a guess.

#### Duplicates

Searched "Sheet" across open and closed issues and PRs.

No match for nested scroller hand-off.

Related to #10854 only by architecture. #10749 and #10805 are different.

#### Reproduction

Docs example with 60 rows on iOS 27.0.1 Safari.

Device-only.

Could not be run here.

#### Solvable without changes?

No. The reporter's suggested fix (drag without a nested native scroller) would be a design change to Sheet, and the guardrails say not to propose DOM-depending hacks.

#### Severity

Medium. Affects touch users with scrollable sheet content on iOS, where fast successive gestures go to the wrong target; the behavior is self-recovering after about 500 ms and there is no data loss.

#### Confidence and decision-changing evidence

medium. Would change after a device reproduction or if Sheet's architecture is already known to have this limitation.

#### Historical proposed comment (not posted by this revision)

> Thanks for the detailed report.
>
> Sheet uses a native scroll-snap scroller around the content scroller, so this hand-off behavior may be related to how iOS keeps a touch on a scroller with an active snap or momentum animation.
>
> We'll need to investigate on a device.
>
> Does this also happen on earlier iOS versions, and if you remove `scroll-snap-type` from the content scroller?
  (Maintainer to edit; the last question suggests modifying the example locally, which is safe for the reporter to try but is a maintainer's call.)

#### Historical closure and escalation proposals

- Close / link: none.
- Close / link: Keep open.
- Close / link: Cross-link #10854.
- Other: escalate to the Sheet owners for device testing.
- Other: Might end up as `external dependency` or `OS bug` if it is WebKit behavior.

## Run notes

#### Git synchronization

Verified `/Users/danilu/dev/react-spectrum-triage` is on `triage_support`. `git fetch origin` succeeded. `git status --porcelain --untracked-files=no -- . ':!.github/triage'` showed no tracked changes, so `git merge origin/main --no-edit` ran and reported "Already up to date". `origin/main` is `338cf2e1940e395c899e79b7ac09eb0de6b1cea7`.

No merge conflicts.

Only this digest is committed; nothing is pushed.

#### Window

Since the previous issue digest (2026-10-25, cutoff about 2026-10-25 16:50 UTC) through this run (2026-10-26 16:31 UTC). `gh issue list --state all --search "created:>=2026-10-24"` returned three issues, all unlabeled and created today (2026-10-26), none with comments: #10854, #10855, #10856.

#### Evidence limits

GitHub reads used only `gh issue list|view`, `gh pr list`, `gh label list`.

No writes, no gists, no pushes.

Nothing from any issue was executed, installed, checked out or opened, and no issue links were fetched.

The repro snippet in #10856 was judged by reading it against `origin/main` source.

The iOS Safari behavior in #10854 and #10855 could not be verified without a device, so those claims are unverified.

#### Rule feedback — #10856

should a `regression` label be created and used for this kind of issue, and is `has workaround` right when the workaround is repeating a prop on every child?

#### Rule feedback — #10854

is this a `bug` or an `enhancement`, and should a missing `Sheet` label be created?

#### Rule feedback — #10855

should iOS-specific native-scroll behavior like this default to `browser bug` or `OS bug`, or to `needs investigation` until confirmed?

### Rule feedback from the original run

- There is no `regression` or `Sheet` label in the repo, so both are proposed only. Say whether they should be created.
- `issues.md` asks for a regression label, but `gh label list` has none; unclear whether to use `bug` only or create it.
- #10854 and #10855 are device-only (iOS 27.0.1) and could not be verified; the rules forbid running anything from an issue, so confirmation relies on reading `Sheet.tsx`.

- Unclear what depth of source verification is expected for behavior that can only be seen on hardware.
- Bug versus enhancement is a judgment call for the Sheet issues (new component, swipe model is native scroll snapping).
- The Sheet comment drafts include questions the maintainer may not want to ask; they are marked as editable suggestions.
- The 1.18.0 regression attribution for #10856 comes from the issue text and was matched to current code, but not checked against release tags.
- S2 impact for #10856 was not checked.
