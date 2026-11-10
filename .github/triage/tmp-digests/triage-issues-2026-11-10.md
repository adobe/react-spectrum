## At a glance

- **2 issues triaged:** Android DatePicker soft-keyboard navigation and repeated unchanged-value callbacks from a controlled Slider. Both are open, unlabelled and have no comments.
- **Priorities:** medium severity for both. Investigate the DatePicker's accessibility impact first; agree whether the soft-keyboard action should advance a segment, leave the field or submit. Slider callbacks reportedly trigger Safari's History API rate limit.
- **Maintainer decisions:** distinguish historical related reports from current duplicates. Neither report has a confirmed current fix or a demonstrated working-release range. Deferring Slider persistence to `onChangeEnd` is a conditional mitigation, not a callback fix.
- **Read-only:** no GitHub changes, issue-supplied URL access, reproduction execution or pushes. All actions below are proposals.

**Git synchronization:** Verified `/Users/darobins/dev/react-spectrum-triage` on `triage_support`, an empty index, no merge in progress, no other active triage session and no existing target digest. `git fetch origin` and `git merge origin/main --no-edit` succeeded. Merged `origin/main`: `d354aa2a642fa1d34bc0bdc27e8ae9bcf0c59b32`, verified as an ancestor of HEAD. The existing local `.github/triage/setup.md` adaptation remains unstaged.

**Scope / method:** Since the previous issue digest commit, `429717363e2e47a66d18175440e4cb3d44f920be` at `2026-11-09T17:58:40Z`, through the supplied run timestamp, `2026-11-10T16:01:46Z`. The exact-window open-issue query returned these two issues, below its 100-item limit; the broader last-24-hours query returned the same two. Read bodies, comments, live labels, open/closed issue and PR searches, and relevant source/docs on `origin/main`. Rechecked both issues' eligibility before writing. Assessments are by reading only.

### [#10948: DatePicker: Focus isn't moved to next element when pressing "submit/next" on Android soft-keyboard](https://github.com/adobe/react-spectrum/issues/10948)

- **Problem:** **Medium severity, accessibility impact:** Android users cannot advance out of a filled DatePicker using the soft-keyboard action: "focus remains on the datepicker input." No evidence establishes that all ways of leaving the field are blocked.
- **Concerns / notes:** RAC 1.22.0, Chrome, Android 15/16/17 reported; a StackBlitz and steps against a docs example are supplied, but neither URL was opened. Main renders editable segments with `enterKeyHint: 'next'` ([useDateSegment.ts, lines 398-416](https://github.com/adobe/react-spectrum/blob/d354aa2a642fa1d34bc0bdc27e8ae9bcf0c59b32/packages/react-aria/src/datepicker/useDateSegment.ts#L398-L416)); its `beforeinput` handler prevents default without a dedicated line-break/next-action branch ([lines 281-309](https://github.com/adobe/react-spectrum/blob/d354aa2a642fa1d34bc0bdc27e8ae9bcf0c59b32/packages/react-aria/src/datepicker/useDateSegment.ts#L281-L309)). These are investigation leads, not proof of the Android event sequence or root cause.
- **Concerns / notes:** Related closed [#5102](https://github.com/adobe/react-spectrum/issues/5102) says "you cannot get to the next field by hitting Enter in a form", but describes backward focus on desktop. Merged [#8279](https://github.com/adobe/react-spectrum/pull/8279) fixed that backward movement, explaining that whitespace press handling "should do nothing when pointerType is keyboard"; the pointer-only guards remain in [main](https://github.com/adobe/react-spectrum/blob/d354aa2a642fa1d34bc0bdc27e8ae9bcf0c59b32/packages/react-aria/src/datepicker/useDatePickerGroup.ts#L117-L129). It does not establish Android next-field advancement. Merged [#10728](https://github.com/adobe/react-spectrum/pull/10728) addresses arrow-key scrolling, not soft-keyboard submit. No supported current duplicate or fixing PR found; no evidence for `regression` or `browser bug`.
- **Labels (proposed):** Add `DatePicker`, `RAC`, `accessibility`, `needs investigation`, `needs decision`, `ai-reviewed`. Recommend `ready for review` for a maintainer to apply. Remove none; all proposed labels exist. The decision is the intended destination/action for "next" versus "submit", including the last segment and calendar button.
- **Maintainer next step:** Ready for initial investigation from the supplied steps, version and environment. Use a maintainer-controlled Android example to capture key/input events and confirm the focus destination. Collect exact Chrome version, device and keyboard app/version if results differ. No verified existing-prop solution or safe workaround was established; do not close as misuse or require an additional repro before first review.

> **Would have done**
>
> Proposed the listed labels, leaving `ready for review` to maintainers. Retained separately from #5102; no duplicate notice, closure, assignment or bot information request. Actual GitHub actions: none.

### [#10950: Controlled Slider calls onChange with an unchanged value on every pointer move once the thumb has changed value](https://github.com/adobe/react-spectrum/issues/10950)

- **Problem:** **Medium severity:** controlled Slider consumers receive repeated unchanged values during dragging; an integration writing every callback to the URL reportedly throws `SecurityError` after "more than 100 times per 10 seconds". This is an application exception, not evidence that every Slider crashes.
- **Concerns / notes:** RAC 1.22.0 / state package 3.51.0, macOS, Chrome/Firefox/Safari reported. A linked StackBlitz, drag steps and hook-level output are supplied but not executed or opened. Main builds controlled values with `useMemo`, keeps a separate `valuesRef`, and calls `setValues` even when `replaceIndex` returns the existing array ([useSliderState.ts, lines 246-307](https://github.com/adobe/react-spectrum/blob/d354aa2a642fa1d34bc0bdc27e8ae9bcf0c59b32/packages/react-stately/src/slider/useSliderState.ts#L246-L307), [lines 410-415](https://github.com/adobe/react-spectrum/blob/d354aa2a642fa1d34bc0bdc27e8ae9bcf0c59b32/packages/react-stately/src/slider/useSliderState.ts#L410-L415)). `useControlledState` resets its ref after render and compares with `Object.is` ([lines 53-77](https://github.com/adobe/react-spectrum/blob/d354aa2a642fa1d34bc0bdc27e8ae9bcf0c59b32/packages/react-stately/src/utils/useControlledState.ts#L53-L77)). This supports the reported reference-identity explanation, but does not independently reproduce it.
- **Concerns / notes:** Historical [#944](https://github.com/adobe/react-spectrum/issues/944) matches the symptom: "onChange should only fire if the slider value is actually changing." The read-only file APIs confirm [#999](https://github.com/adobe/react-spectrum/pull/999) added an unchanged-value return and [#1031](https://github.com/adobe/react-spectrum/pull/1031) removed it while adding an identity-preserving `replaceIndex` and functional updates to fix stale state. This is a plausible recurrence, not a closure-ready duplicate of the closed report. No current fixing PR found. Do not assign `regression` yet: those historical changes do not demonstrate a working released version of the current controlled composition. Related [#5655](https://github.com/adobe/react-spectrum/pull/5655) fixes externally updated multi-thumb values and warns that naive ref synchronisation broke form reset; it is not proof this callback issue is fixed.
- **Labels (proposed):** Add `Slider`, `RAC`, `needs investigation`, `has workaround`, `ai-reviewed`; recommend `ready for review` for a maintainer to apply. Remove none; all exist. `has workaround` is conditional on accepting persistence only at interaction end, not a claim that callback duplication is solved.
- **Maintainer next step:** Ready for investigation. Verify scalar and multi-thumb controlled versus uncontrolled callback counts after parent re-render, including boundaries, rapid updates and form reset. React version is missing; collect it if required to reproduce. For consumers that can defer persistence, a suggested maintainer answer is: keep controlled state updates in `onChange` and move URL persistence to `onChangeEnd`. The [Slider value docs](https://react-aria.adobe.com/Slider#value) explicitly distinguish dragging from thumb release; this [main-branch example](https://github.com/adobe/react-spectrum/blob/d354aa2a642fa1d34bc0bdc27e8ae9bcf0c59b32/packages/dev/s2-docs/pages/react-aria/Slider.mdx#L39-L64) supports the following props on an existing composed Slider. It changes persistence timing and does not resolve consumers that need live URL updates.

  ```tsx
  <Slider
    label="Value"
    value={value}
    onChange={setValue}
    onChangeEnd={persistValueToUrl}
  />
  ```

> **Would have done**
>
> Proposed the listed labels, leaving `ready for review` to maintainers. Kept the historical recurrence open for investigation rather than recommending duplicate closure. Suggested mitigation stays in this digest; no bot answer or duplicate notice. Actual GitHub actions: none.

## Rule feedback

- Reproduction execution and issue-supplied URL access are prohibited, so Android event delivery, browser results and the Slider exception remain unverified. No suspected prompt-injection attempt was identified; ordinary contribution-template instructions in a historical PR were treated as data.
- The rules name `waiting for author`, but the live inventory has `waiting on author`. Neither is proposed because no specific author action blocks initial investigation. No proposed label is missing.
- No source/dependency/build changes were made. Repository formatter/test commands were not run under this workflow's narrower shell-command restrictions; only this Markdown digest was authored.
