| Issue | Severity | Reproduction? | Solvable without changes? | Would label | Would comment | Would close / duplicate of | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [#10856](https://github.com/adobe/react-spectrum/issues/10856) CheckboxGroup `validationBehavior="aria"` ignored since 1.18 | Medium (regression) | Yes, minimal code; root cause confirmed by reading source on `origin/main` | Workaround only (set `validationBehavior="aria"` on each `Checkbox`); needs a real fix | `bug`, `CheckboxGroup`, `Checkbox`, `RAC`, `has workaround` (+ proposed new `regression`) | Yes, acknowledge and point to the cause | No / no duplicate found | High |
| [#10854](https://github.com/adobe/react-spectrum/issues/10854) Sheet slow-drag dismissal depends on viewport, not sheet height | Medium | Docs example, iOS Safari only. Cannot be run here; source read is consistent | No (`snapPoints` reportedly does not help) | `needs investigation`, `RAC`, `mobile testing` (+ proposed new `Sheet`) | Yes, short ack and ask for device and version details | No / no duplicate found | Medium |
| [#10855](https://github.com/adobe/react-spectrum/issues/10855) Sheet iOS Safari second gesture latches to previous scroller for ~500 ms | Medium | Docs example, iOS Safari only. Cannot be run here | No | `needs investigation`, `browser bug` (possible), `RAC`, `mobile testing` (+ proposed new `Sheet`) | Yes, short ack | No / no duplicate found (same reporter and architecture as #10854) | Medium |

# Issue triage digest - 2026-10-26

**Git synchronization:** Verified `/Users/danilu/dev/react-spectrum-triage` is on `triage_support`. `git fetch origin` succeeded. `git status --porcelain --untracked-files=no -- . ':!.github/triage'` showed no tracked changes, so `git merge origin/main --no-edit` ran and reported "Already up to date". `origin/main` is `338cf2e1940e395c899e79b7ac09eb0de6b1cea7`. No merge conflicts. Only this digest is committed; nothing is pushed.

**Window:** Since the previous issue digest (2026-10-25, cutoff about 2026-10-25 16:50 UTC) through this run (2026-10-26 16:31 UTC). `gh issue list --state all --search "created:>=2026-10-24"` returned three issues, all unlabeled and created today (2026-10-26), none with comments: #10854, #10855, #10856.

**Evidence limits:** GitHub reads used only `gh issue list|view`, `gh pr list`, `gh label list`. No writes, no gists, no pushes. Nothing from any issue was executed, installed, checked out or opened, and no issue links were fetched. The repro snippet in #10856 was judged by reading it against `origin/main` source. The iOS Safari behavior in #10854 and #10855 could not be verified without a device, so those claims are unverified.

---

## #10856 CheckboxGroup: `validationBehavior="aria"` is ignored by its checkboxes since 1.18

Link: https://github.com/adobe/react-spectrum/issues/10856 (author `msenejoa`, no labels, no comments)

**Summary:** A `CheckboxGroup` with `isRequired validationBehavior="aria"` still blocks a native form submit when nothing is checked. Worked in 1.17.0, broken in 1.18.0 through 1.22.1. Reporter attributes it to #9877 (f23d22f).

**Verification against `origin/main` (read-only):**
- `packages/react-aria-components/src/Checkbox.tsx:432-447`, `useCheckboxAria`:
  `let validationBehavior = props.validationBehavior ?? formValidationBehavior ?? 'native';` and then `checkboxProps = {..., validationBehavior}` is passed to `useCheckboxGroupItem(checkboxProps, groupState, inputRef)` when inside a group.
- `packages/react-aria/src/checkbox/useCheckboxGroupItem.ts:62-64`:
  `let {name, form, descriptionId, errorMessageId, validationBehavior} = checkboxGroupData.get(state)!;` then `validationBehavior = props.validationBehavior ?? validationBehavior;`.
  Because the RAC wrapper always supplies a defined value (`'native'` by default), the group's `validationBehavior` is never used as the fallback. The reporter's diagnosis is correct.
- The group itself resolves `props.validationBehavior ?? formValidationBehavior ?? 'native'` (`Checkbox.tsx:280-281`), so only the item-level resolution is wrong.
- Only affects `react-aria-components` (RAC, and by extension S2's `CheckboxGroup` if it passes `validationBehavior` to the RAC group). The `useCheckboxGroupItem` hook is correct when called directly. I did not check S2 specifically.
- The existing RAC tests (`packages/react-aria-components/test/Checkbox*.test.js`) have no hits for `validationBehavior`, so nothing covers group inheritance.
- Regression range: introduced in 1.18.0 per the reporter (not independently confirmed from release tags; the code path above matches the claim).

**Duplicates:** searched open and closed issues for "CheckboxGroup validationBehavior" and "Checkbox validationBehavior aria group required". Only #10856 itself matched. Searched PRs for "CheckboxGroup validationBehavior". No open fix PR found.

**Reproduction:** Minimal inline snippet is enough, no StackBlitz needed. Judged by reading, not run.

**Solvable without changes?** Workaround from the reporter (`validationBehavior="aria"` on every `Checkbox`) is acceptable. It does not use internals or hacks, so `has workaround` applies. A real fix is still needed.

**Severity:** Medium. Regression, breaks react-hook-form style flows on required groups, workaround is available and simple, not accessibility-impacting (aria validation is the opt-in path).

**Suggested fix direction (from `origin/main` source only):** in `useCheckboxAria`, when inside a group (`groupState` set), pass `props.validationBehavior` (possibly `undefined`) instead of the `'native'`-defaulted value, so `useCheckboxGroupItem` falls back to the group's behavior. Keep the `?? formValidationBehavior ?? 'native'` default for standalone checkboxes. This needs a test in `CheckboxGroup.test.js`.

**Would have done**
- **Labels:** add `bug` (confirmed regression in behavior), `CheckboxGroup` and `Checkbox` (affected components), `RAC` (layer), `has workaround` (set the prop on each Checkbox). Would also add `regression` if it existed; it does not exist in the repo yet (proposed new label). Not adding `needs investigation`, the cause is already identified.
- **Comment:**
  > Thanks for the report and the detailed analysis. We confirmed that `useCheckboxAria` in `react-aria-components` resolves `validationBehavior` to `'native'` by default and passes it to `useCheckboxGroupItem`, so the group's `validationBehavior` is never used as a fallback. Until this is fixed, setting `validationBehavior="aria"` on each `Checkbox` inside the group works around it.
- **Close / link:** none. Keep open. No duplicate found.
- **Other:** none needed; a fix PR plus a test in `packages/react-aria-components/test/CheckboxGroup.test.js` would be welcome (candidate for `help wanted` or `good first issue`, but not applying).
- **Confidence:** high. Would change if the 1.18.0 attribution turns out to be a different commit, which does not alter the labels.
- **Feedback prompt:** should a `regression` label be created and used for this kind of issue, and is `has workaround` right when the workaround is repeating a prop on every child?

---

## #10854 Sheet: slow-drag dismissal depends on the viewport, not the sheet's height

Link: https://github.com/adobe/react-spectrum/issues/10854 (author `Cheesus-Crust1`, no labels, no comments; filed 1 second before #10855 by the same author)

**Summary:** On iOS Safari, a slow drag only dismisses a short (content-sized) `Sheet` once it passes about half the viewport, so a sheet shorter than half the screen cannot be closed by a slow drag. Only a flick closes it.

**Verification (source read only, not run):** `packages/react-aria-components/src/Sheet.tsx:866-870` uses a `200dvh` scroll track with scroll snapping, and `Sheet.tsx:552-571` describes snap markers at the content extremes and "1 viewport" of rest/travel. That matches the reporter's description (snap decision is made in viewport units, independent of the sheet's height). Real touch behavior on iOS 27.0.1 was not checked.

**Duplicates:** Searched "Sheet" across open and closed issues. Related but different Sheet issues: #10749 (cannot drag with a mouse), #10813 (Sheet stays exiting, IntersectionObserver), #10805 (Brave focus with overflowPadding), #10808 and #10814 (closed). None cover the dismissal threshold. Same-author #10855 shares the root architecture (native scroller with snapping) but is a different symptom. Related PRs (all Sheet fixes: #10732, #10815 merged; #10829, #10835 closed; #10783 open) do not mention a height-relative threshold.

**Reproduction:** Uses the docs example unchanged, on a physical iOS device. A StackBlitz would not help since it is device specific; ask for iOS and Safari details only if maintainers cannot reproduce.

**Solvable without changes?** No. The reporter states `snapPoints` does not help, and I found no documented prop for a dismiss threshold. Not verified further.

**Severity:** Medium. Affects mobile users of any short sheet (confirmations, small forms), where dismissal is by flick only. The sheet remains closable via a close button or Escape (assuming the app provides one), so this is not blocking or accessibility-breaking. Sheet is new (blog post and PRs from this month), so it may be considered an enhancement to the swipe model rather than a bug.

**Would have done**
- **Labels:** `needs investigation` (iOS touch behavior must be reproduced on a device), `RAC` (layer), `mobile testing`. Would add `Sheet` and `bug` or `enhancement` once decided. `Sheet` does not exist as a label in the repo (proposed new label). Not adding `bug` yet because the intended dismiss model is a maintainer call.
- **Comment:**
  > Thanks for the report. We'll look at this on a device. The current dismissal threshold comes from the native scroll-snap track (`200dvh`), so it does not scale with the sheet's height. Does this also reproduce on earlier iOS versions?
  (Maintainer should edit the question as needed.)
- **Close / link:** none. Keep open. Cross-link to #10855 (same reporter and same native-scroll architecture) when commenting.
- **Other:** escalate to the Sheet owners for a decision on whether a height-relative or velocity-based dismiss threshold is in scope. May need `needs API review` if a prop is added (not applying).
- **Confidence:** medium. Would change after reproducing on a device, or if maintainers say sheets are intended to dismiss only via flick or close button.
- **Feedback prompt:** is this a `bug` or an `enhancement`, and should a missing `Sheet` label be created?

---

## #10855 Sheet: on iOS Safari a quick second gesture stays with the previous scroller for ~500 ms

Link: https://github.com/adobe/react-spectrum/issues/10855 (author `Cheesus-Crust1`, no labels, no comments)

**Summary:** On iOS Safari, a second gesture shortly after the previous one stays with the scroller that handled the first (content or sheet) for about 500 ms. Reporter guesses (unverified) that iOS keeps touches on a scroller with a running snap or momentum animation, because the sheet is a native snapping scroller around the content scroller.

**Verification:** `Sheet.tsx:866-870` confirms the nested native scroller design (`200dvh` snapping track). The 500 ms hand-off delay is iOS WebKit behavior and could not be verified here. Plausibly a `browser bug` or `OS bug` (both labels exist), but that is a guess.

**Duplicates:** Searched "Sheet" across open and closed issues and PRs. No match for nested scroller hand-off. Related to #10854 only by architecture. #10749 and #10805 are different.

**Reproduction:** Docs example with 60 rows on iOS 27.0.1 Safari. Device-only. Could not be run here.

**Solvable without changes?** No. The reporter's suggested fix (drag without a nested native scroller) would be a design change to Sheet, and the guardrails say not to propose DOM-depending hacks.

**Severity:** Medium. Affects touch users with scrollable sheet content on iOS, where fast successive gestures go to the wrong target; the behavior is self-recovering after about 500 ms and there is no data loss.

**Would have done**
- **Labels:** `needs investigation`, `RAC`, `mobile testing`. Possibly `browser bug` or `OS bug` if confirmed as WebKit behavior. Would add `Sheet` (proposed new label, does not exist). Not adding `bug` until investigated.
- **Comment:**
  > Thanks for the detailed report. Sheet uses a native scroll-snap scroller around the content scroller, so this hand-off behavior may be related to how iOS keeps a touch on a scroller with an active snap or momentum animation. We'll need to investigate on a device. Does this also happen on earlier iOS versions, and if you remove `scroll-snap-type` from the content scroller?
  (Maintainer to edit; the last question suggests modifying the example locally, which is safe for the reporter to try but is a maintainer's call.)
- **Close / link:** none. Keep open. Cross-link #10854.
- **Other:** escalate to the Sheet owners for device testing. Might end up as `external dependency` or `OS bug` if it is WebKit behavior.
- **Confidence:** medium. Would change after a device reproduction or if Sheet's architecture is already known to have this limitation.
- **Feedback prompt:** should iOS-specific native-scroll behavior like this default to `browser bug` or `OS bug`, or to `needs investigation` until confirmed?

---

## Rule feedback

- There is no `regression` or `Sheet` label in the repo, so both are proposed only. Say whether they should be created.
- `issues.md` asks for a regression label, but `gh label list` has none; unclear whether to use `bug` only or create it.
- #10854 and #10855 are device-only (iOS 27.0.1) and could not be verified; the rules forbid running anything from an issue, so confirmation relies on reading `Sheet.tsx`. Unclear what depth of source verification is expected for behavior that can only be seen on hardware.
- Bug versus enhancement is a judgment call for the Sheet issues (new component, swipe model is native scroll snapping).
- The Sheet comment drafts include questions the maintainer may not want to ask; they are marked as editable suggestions.
- The 1.18.0 regression attribution for #10856 comes from the issue text and was matched to current code, but not checked against release tags.
- S2 impact for #10856 was not checked.
