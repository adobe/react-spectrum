# PR triage digest, 2026-10-27 (read-only draft)

- Branch: `triage_support`; `git fetch origin` run, `origin/main` is `0752308bb1` and was merged cleanly (no conflicts, no tracked local changes).
- Scope: open, non-draft, non-bot PRs created since the last digest (committed 2026-10-26 ~16:10 UTC), without `ai reviewed`. 11 PRs: #10876, #10874, #10872, #10871, #10869, #10868, #10867, #10864, #10861, #10860, #10857. (#10853 was covered on 2026-10-26.)
- Nothing was run, checked out, or posted. All claims come from `gh pr view|diff|checks`, `gh api` GETs, issue text, and `origin/main` source. Correctness claims were reasoned from the diffs, not verified by running anything.
- No prompt-injection content found in any PR text. No PR touches CI workflows, `package.json`, lockfiles, or build config, so none is flagged **needs security review**. (#10874 adds a file to the published S2 package, which only affects emitted types.)
- **Pattern worth a look:** 8 of the 11 PRs are from `mangeshraut712`, who has 10 PRs open (also #10841, #10842), all AI-assisted ("Codex"), opened across ~6 hours. Four (#10868, #10869, #10871, #10872) got the same "CI is green on this one. Ready for review/merge" comment within ~8 seconds (14:26:13Z to 14:26:21Z). A maintainer already replied on #10872: "[devongovett] Please stop. You have too many open PRs and commenting that CI is green is useless noise." Maintainer reviewers (nwidynski, yihuiliao) have found substantive problems in 4 of these PRs. See Rule feedback for a proposed "too many open PRs by one author" rule.

## Summary

| PR | Complexity | Red flags | Would label | Would comment | Would close / duplicate of | Confidence |
| --- | --- | --- | --- | --- | --- | --- |
| [#10871](https://github.com/adobe/react-spectrum/pull/10871) fix: announce Select options for VoiceOver | Medium | Workaround for a Safari/VoiceOver bug maintainers already attributed to the browser (#10844, confirmed on Safari 27); no manual a11y testing; test mocks `isAppleDevice` and `LiveAnnouncer` for the whole `Select.test.js` file; announces on every Apple device, not just Safari+VO; author spam comment | `ai reviewed`, `accessibility`, `needs signoff`* | Ask for maintainer signoff on approach and manual VO verification | none (do not close; hold) | Medium |
| [#10868](https://github.com/adobe/react-spectrum/pull/10868) fix: allow Mod+A to select ComboBox input text while multi-select menu is open | Low | **Test is vacuous**: `preventDefault` passed in `fireEvent` init is never wired to the event, and `onChange`/`aria-selected` assertions would already pass without the fix; maintainer already flagged test assertions | `ai reviewed`, `small impact` | Test does not exercise the bug | none | Medium |
| [#10861](https://github.com/adobe/react-spectrum/pull/10861) fix(useNumberField): skip blur commit when input already disabled | Low | Maintainer says approach is wrong (also drops commit of typed text; real cause is stale closure in `useSyntheticBlurEvent`); fix is a guard on a symptom | `ai reviewed` | Echo nwidynski's feedback; suggest fixing the stale closure | none | Medium |
| [#10860](https://github.com/adobe/react-spectrum/pull/10860) fix(RAC): inherit CheckboxGroup validationBehavior (#10856) | Low | Incomplete fix: RAC `<Form>` default still overrides group's `aria`; test uses a plain `<form>` so it hides this (yihuiliao); stray comment test line (nwidynski) | `ai reviewed`, `regression`*, `patch worthy`* | Echo the RAC `Form` gap and test change request | none | Medium |
| [#10867](https://github.com/adobe/react-spectrum/pull/10867) fix: keep Menu as sole scrollport in Popover MenuTrigger | Low | Papers over the root cause (maintainer: "We should be fixing that instead"); edits docs example with `style={{maxHeight: 240}}` to force the scroll path; touches 3 starters + docs | `ai reviewed` | Ask for root cause of the scrollbar glitch | none | Medium |
| [#10872](https://github.com/adobe/react-spectrum/pull/10872) fix: batch virtualizer item measurements | Medium | New `queueMicrotask` plus module-level mutable queue shared by all virtualizers; moves measurement from synchronous to microtask; issue has no maintainer buy-in (reproduction requested); maintainer told author to stop spamming | `ai reviewed`, `performance`, `risk`*, `needs signoff`* | Ask for repro, perf numbers, and team signoff | none | Medium |
| [#10857](https://github.com/adobe/react-spectrum/pull/10857) feat: add focus events to Table rows | High | New public API (`onFocus`, `onBlur`, `onFocusChange` on `Row`) | `ai reviewed`, `needs API review`, `RAC`/`Table` already set | Note API surface needs review | none | Medium |
| [#10874](https://github.com/adobe/react-spectrum/pull/10874) fix(s2): restore page.css declaration | Low | none | `ai reviewed`, `small review`, `small impact`, `patch worthy`* | none (already approved by reidbarber) | none | High |
| [#10864](https://github.com/adobe/react-spectrum/pull/10864) fix(useCalendarYearPicker): preserve month when changing years | Low | none significant; fix applies in the picker's `onChange` rather than at year-option generation | `ai reviewed`, `small review`, `small impact` | none | none | Medium |
| [#10869](https://github.com/adobe/react-spectrum/pull/10869) fix(ComboBox): don't commit value on blur when isReadOnly | Low | none; second PR for #10846 (earlier #10850 by another contributor was closed by its author) | `ai reviewed`, `small review`, `small impact` | none | none (not a live duplicate) | Medium |
| [#10876](https://github.com/adobe/react-spectrum/pull/10876) fix: preserve numbering system for separator-only input | Medium | none; Adobe author, issue filed minutes earlier | `ai reviewed`, `NumberField`, `internationalization`, `small impact` | none | none | Medium |

\* label does not exist in the repo yet. Labels that need to be created: `ai reviewed`, `needs signoff`, `risk`, `regression`, `patch worthy`, `small impact`/`medium impact`/`large impact`. Existing and usable: `small review`, `needs API review`, `has workaround`, `accessibility`, `performance`, `Virtualizer`.

---

## #10871 - fix: announce Select options for VoiceOver

Author: mangeshraut712 (external). 2 files (`useSelect.ts`, `Select.test.js`), +44/-1. Closes [#10844](https://github.com/adobe/react-spectrum/issues/10844). Complexity: **Medium** (behavior change in a shared hook, a11y).

**Summary.** `useSelect` now copies ComboBox's "N options available." live-region announcement: on open (when no focused item, or always on Apple devices) and whenever the count changes while open. It reuses the `@react-aria/combobox` intl strings.

**Medium PR: API and duplicate checks only**
- **API/compat:** no prop changes. Behavior change: a new live-region announcement for every `useSelect` consumer (Select, Picker via S2) on any Apple device (`isAppleDevice()` is true for iOS/iPadOS/macOS in any browser, not just Safari+VoiceOver). Debatable, so list for a11y review. Cross-package string reuse (`useSelect` imports `../../intl/combobox/*.json` and the `'@react-aria/combobox'` package key) is unusual.
- **Duplicates:** none open for #10844. Related: #10641 (yihuiliao: "likely a bug in Safari 26", Safari 27 release notes mention a VoiceOver `focus()` fix).

**Notes worth the maintainer's time (not full red-flag review, but material):**
- Issue discussion: yihuiliao and reidbarber (2026-10-27) say this looks like a Safari bug and "it doesn't work on Safari 27 either". No maintainer asked for an announcement workaround. The PR is a product decision (adding announcements to compensate for a browser bug).
- Test quality: `jest.mock('react-aria/src/utils/platform', ...)` with `isAppleDevice: () => true` and `jest.mock('.../LiveAnnouncer')` at the top of `Select.test.js` apply to **every** test in that file, not just the new one. It also asserts a mocked call (`announce` toHaveBeenCalledWith), i.e. an implementation detail rather than rendered/AT behavior.
- PR text admits manual VoiceOver verification "was not manually performed". Maintainer nwidynski (2026-10-27): "Have you taken the time to test this manually? Relying on AI to make assertions about accessibility programs isn't a great idea ... a stackblitz/codesandbox with your applied patch." No response yet.
- Author posted the "CI is green" comment at 14:26:19Z.

### Would have done
- **Labels:** add `ai reviewed` (digest covered it); `accessibility` (a11y behavior change); `needs signoff`* (team has not agreed to an announcement workaround for a Safari bug); `Select` already likely via labeler.
- **Comment:** "Thanks for the PR. #10844 looks like a Safari/VoiceOver bug (see #10641 and the Safari 27 notes; it still reproduces on 27), so we need to agree whether React Aria should work around it by adding announcements. Please also verify manually on macOS Safari with VoiceOver and share a CodeSandbox/StackBlitz with the patch applied. Separately, the new test mocks `isAppleDevice` and `LiveAnnouncer` for the whole `Select.test.js`; please scope the mocks to this test."
- **Close / link:** none.
- **Other:** escalate to a11y owners (yihuiliao, reidbarber) for signoff on whether to add the announcement; do not review further until then.
- **Confidence:** medium. Would change to "close" if the team decides this is a pure browser bug with no workaround.
- **Feedback prompt:** Should AI-authored a11y workarounds for browser bugs be held until a maintainer asks for them on the issue?

---

## #10868 - fix: allow Mod+A to select ComboBox input text while multi-select menu is open

Author: mangeshraut712. 2 files, +23/-0 (1 source line: `disallowSelectAll: true` in `useComboBox`). Closes [#10866](https://github.com/adobe/react-spectrum/issues/10866). Complexity: **Low**.

**Summary.** Passes `disallowSelectAll: true` to `useSelectableCollection` in `useComboBox` so Cmd/Ctrl+A is not consumed by `selectAll()` and falls through to the browser (select input text).

### Red flags
- **Disabled checks / timing hacks / workarounds / accessibility:** none. Keeping Mod+A as native "select input text" in a text input is the expected accessible behavior.
- **Issue verification:** #10866 (open, no labels, no comments, created 2026-10-27) says Cmd/Ctrl+A does nothing while the popover is open with `selectionMode="multiple"`. On `origin/main`, `useSelectableCollection.ts:356` runs `manager.selectAll()` and returns (so the event is handled/`preventDefault`ed) unless `disallowSelectAll !== true`; `useComboBox.ts:~170-181` does not pass it. So the diagnosis is plausible and the one-line fix would prevent the interception. Not run.
- **Already solvable with existing code:** no existing prop on ComboBox exposes `disallowSelectAll`. Not solvable by users.
- **Issue discussion:** no maintainer comments.
- **Test quality (flag):** the new test cannot fail before the fix. (1) It passes `preventDefault` inside `fireEvent.keyDown(input, {..., preventDefault})` init; testing-library does not use that as the event's `preventDefault`, so `expect(preventDefault).not.toHaveBeenCalled()` is vacuous. (2) The `onChange` not called and all-options `aria-selected="false"` assertions hold today too, since the PR itself says ComboBox state ignores `selectAll`. Maintainer nwidynski commented on the test: "Asserting onChange and selection is enough. The rest is implementation detail." That matches, but with only those assertions the test would pass without the fix. A real test would check `event.defaultPrevented` (e.g. `fireEvent.keyDown` return value is `false` when prevented) or `userEvent` select-all then check `input.selectionStart/End`. Reasoned from the diff, not run.
- **CLA:** signed (check passes). All CI checks pass.
- **Suspicious behavior:** same-second "CI is green" comment at 14:26:13Z.

**API/compat:** none public. Behavior change: Mod+A in a multiple-selection ComboBox no longer selects all options, but ComboBox state already ignored it. **Duplicates:** none.

### Would have done
- **Labels:** `ai reviewed`, `small impact`*.
- **Comment:** "Thanks. The fix looks right, but the test would pass without it: the `preventDefault` jest.fn passed in the `fireEvent` init is never attached to the event, and the `onChange`/`aria-selected` assertions already hold because ComboBox state ignores `selectAll`. Please assert on `defaultPrevented` (the return value of `fireEvent.keyDown`) or on the input's selection range, and drop the implementation-detail assertions as noted in the review."
- **Close / link:** none.
- **Other:** none.
- **Confidence:** medium (test conclusion reasoned, not run). Would change if the test environment attaches `preventDefault` from init.
- **Feedback prompt:** Is it acceptable to flag tests as "cannot fail before fix" purely from reading, given we cannot run them?

---

## #10861 - fix(useNumberField): skip blur commit when input already disabled

Author: mangeshraut712. 2 files, +44/-0. Closes [#10044](https://github.com/adobe/react-spectrum/issues/10044). Complexity: **Low**.

**Summary.** In `useNumberField`, `commitAndAnnounce` returns early when `inputRef.current?.disabled`, and `isDisabled` is passed to `useFocus`.

### Red flags
- **Disabled checks / timing hacks / accessibility:** none.
- **Issue verification:** #10044 (open): `onChange` sets value then disables the field; the increment doesn't stick and `flushSync` logs an error. snowystinger (2026-05-12) said there are "two issues, one with stale closures and one with event timing", supplied a unit test, and recommended readonly + progress instead of disabling. The PR's new test is essentially that scenario (click increment, expect `26` and disabled). The diff skips the blur commit if the input is already disabled, which avoids the `flushSync`-during-commit path but does not address the stale closure.
- **Issue discussion / maintainer feedback (flag):** nwidynski on the PR (2026-10-27): "Your change also stops the commit of text the user typed. The underlying cause is simply a stale closure on the blur handler in `useSyntheticBlurEvent`" (links `interactions/utils.ts#L81`). The guard drops legitimate commits when a field is disabled with typed-but-uncommitted text. Contradicts the maintainer's root-cause direction.
- **Already solvable:** per snowystinger, use `isReadOnly` plus a progress indicator (a11y-preferred); a documented workaround exists (`has workaround` was effectively already given on the issue).
- **Test quality:** exercises the issue scenario with user interaction (click), reasonable; no test for typed-then-disabled.
- **CLA:** signed. CI green.

**API/compat:** none public; blur/commit behavior for disabled NumberFields changes. **Duplicates:** none found.

### Would have done
- **Labels:** `ai reviewed`.
- **Comment:** "Thanks. As noted in the review, this guard also skips committing text the user typed before the field is disabled, and the real cause is the stale closure in `useSyntheticBlurEvent` (`packages/react-aria/src/interactions/utils.ts`). Could you look at fixing that instead? Please also add a test for typed text followed by disabling."
- **Close / link:** none.
- **Other:** none.
- **Confidence:** medium. Would change if the maintainers decide #10044 is "won't fix" (disabling a focused field is an a11y anti-pattern) in which case close.
- **Feedback prompt:** Should PRs for issues where a maintainer already proposed a different root cause get `needs signoff`-style holds?

---

## #10860 - fix(react-aria-components): inherit CheckboxGroup validationBehavior (#10856)

Author: mangeshraut712. Labels: `Checkbox`, `RAC`. 2 files, +26/-1. Closes [#10856](https://github.com/adobe/react-spectrum/issues/10856). Complexity: **Low**.

**Summary.** In RAC `Checkbox.tsx`, inside a `CheckboxGroup` (groupState present) leaves `validationBehavior` undefined unless set on the checkbox or the form context, so `useCheckboxGroupItem` inherits the group's value.

### Red flags
- **Disabled checks / timing hacks / accessibility:** none.
- **Issue verification:** #10856 (open, 2026-10-26, regression since 1.18 via #9877) proposes exactly "leaving the `'native'` default out for checkboxes inside a group". The diff does that. On `origin/main`, `useCheckboxGroupItem.ts:64` does `validationBehavior = props.validationBehavior ?? validationBehavior` where the second value is the group's, confirming the inheritance mechanism.
- **Incomplete fix (flag):** yihuiliao (review): with a RAC `<Form validationBehavior="native"|default>` wrapping a `CheckboxGroup validationBehavior="aria"`, `formValidationBehavior` takes precedence and defaults to `native`, so the group's `aria` is still overridden. The test passes only because it uses a plain `<form>`. She suggests the check be restructured (group value should win over the form default).
- **Maintainer review comment:** nwidynski on `CheckboxGroup.test.js:351`: "remove pls" (the long regression comment in the test).
- **Test quality:** would fail before the fix (checkbox has `required` under buggy default) per reasoning; but misses the RAC `Form` case.
- **CLA:** signed. CI green.

**API/compat:** no API change; bug fix restoring pre-1.18 behavior. **Duplicates:** none.

### Would have done
- **Labels:** `ai reviewed`, `regression`* (link: introduced in 1.18.0 via #9877), `patch worthy`* (restores prior behavior, small), `small impact`*.
- **Comment:** "Thanks. Two items from the review: (1) the fix should also work inside a RAC `<Form>`, where `formValidationBehavior` currently wins over the group's `validationBehavior`; please see yihuiliao's suggestion and add a test that wraps the group in `Form`; (2) remove the explanatory comment in the test as nwidynski noted."
- **Close / link:** none.
- **Other:** none.
- **Confidence:** medium-high. Would change if yihuiliao's `Form` concern turns out not to apply.
- **Feedback prompt:** Is `patch worthy` right for a 1.18 regression fix whose PR is still incomplete?

---

## #10867 - fix: keep Menu as sole scrollport in Popover MenuTrigger

Author: mangeshraut712. Label: `Popover`. 4 files (docs example + 3 starters), +8/-1. Closes [#10230](https://github.com/adobe/react-spectrum/issues/10230). Complexity: **Low** by size (CSS/docs), but design-sensitive.

**Summary.** Adds `overflow: hidden` to `Popover` when it is a `MenuTrigger`/`SubmenuTrigger` in the docs/hooks starter CSS and the Tailwind starter; also adds `style={{maxHeight: 240}}` / `maxHeight: 'inherit'` to the inline Autocomplete docs example.

### Red flags
- **Disabled checks / timing hacks / accessibility:** none.
- **Issue verification:** #10230 (open, `bug`, Windows Chrome, glitching scroll in the inline Autocomplete docs example). LFDanLu: "it seems related to visible scrollbars somehow". The PR attributes it to nested `overflow: auto` scrollports. This is a plausible hypothesis but the PR gives no reproduction or explanation of why always-visible scrollbars cause the glitch.
- **Maintainer feedback (flag):** nwidynski (2026-10-27): "Whats the underlying reason for why always on scrollbars cause this behavior? We should be fixing that instead." The change is a styling workaround in starters, not a library fix.
- **Already solvable / workaround:** users can already set overflow on their own popover; the starters are copy-paste templates. The change adjusts the templates only.
- **Scope concern:** the docs example now includes an inline comment and arbitrary `maxHeight: 240` solely so "the scroll path is exercised", which changes the documentation sample rather than fixing it.
- **Test quality:** none (CSS/docs); cannot be verified without a Windows always-on-scrollbar browser. Not verified.
- **CLA:** signed. CI green.

**API/compat:** changes starter CSS output (consumers who copied starters are unaffected; new copies change popover overflow for menu triggers). Not a library API change. **Duplicates:** none.

### Would have done
- **Labels:** `ai reviewed`.
- **Comment:** "Thanks. Before changing the starters, could you identify why always-visible scrollbars cause the glitch (e.g., a layout loop with nested scrollports)? As noted in the review, the fix should address that rather than hide overflow on the Popover in templates. A StackBlitz or short recording on Windows Chrome with always-on scrollbars would help."
- **Close / link:** none.
- **Other:** none.
- **Confidence:** medium. Would change if maintainers accept starters-only changes.
- **Feedback prompt:** Are CSS/starter-only workarounds for unexplained browser glitches acceptable, or should the PR need a root cause first?

---

## #10872 - fix: batch virtualizer item measurements

Author: mangeshraut712. 2 files, +180/-15. Closes [#10858](https://github.com/adobe/react-spectrum/issues/10858). Complexity: **Medium** (shared virtualizer hook used by ListBox, GridList, Table, Select, Picker).

**Summary.** `useVirtualizerItem`'s `updateSize` now pushes measurements into a module-level `Map` and flushes them in one `queueMicrotask`: clear all heights, read all scroll sizes, restore all heights, then call `updateItemSize`. This avoids per-item layout thrash (write/read interleaving).

**Medium PR: API and duplicate checks only**
- **API/compat:** no public API. Behavior: measurement moves from synchronous (inside layout effects/ResizeObserver) to a microtask, so `updateItemSize` runs a tick later; layout effects that previously saw updated sizes synchronously may now see them after. Module-level shared queue is global across all virtualizers on the page (`pendingMeasurements`, `isMeasurementQueued`), including across different virtualizer instances and test files. Also adds `queueMicrotask` (listed in the red-flag list for low PRs).
- **Duplicates:** none for #10858. #10858 itself asks for a reproduction (nwidynski, 2026-10-27: "Please provide a stackblitz or codesandbox ... Nobody is going to clone an unknown repo"); no maintainer confirmed the issue or a desired approach.
- **Other flags:** PR text has no performance measurements (before/after), only a spy-order test; test mocks `CSSStyleDeclaration.prototype.height` and `scrollWidth/scrollHeight`; author skipped `test:browser` ("Playwright's fresh Chromium installation stalled"), although CI `test-browser` passes. devongovett: "Please stop. You have too many open PRs and commenting that CI is green is useless noise." (2026-10-27T17:02Z).

### Would have done
- **Labels:** `ai reviewed`, `performance`, `Virtualizer`, `risk`*, `needs signoff`*.
- **Comment:** "Thanks. This changes when every virtualized item is measured (now a microtask, with a module-level queue shared by all virtualizers). Before reviewing, we need a reproduction for #10858 and before/after numbers showing the improvement, and the Virtualizer owners to agree on the approach. Please also avoid pinging about CI status."
- **Close / link:** none; hold.
- **Other:** escalate to virtualizer owners (devongovett/snowystinger) for signoff.
- **Confidence:** medium. Would change if the maintainers want to close the author's backlog.
- **Feedback prompt:** Should medium/high AI-authored perf PRs without a maintainer-agreed issue be labeled `needs signoff` immediately?

---

## #10857 - feat: add focus events to Table rows

Author: dagemawinegash (external). Labels: `RAC`, `Table`. 3 files, +136/-0 (source: ~5 lines). Part of [#6460](https://github.com/adobe/react-spectrum/issues/6460) (no closing keyword). Complexity: **High** (new public API on RAC `Row`).

**Summary.** `Row` now accepts `onFocus`, `onBlur`, `onFocusChange` (`FocusEvents<HTMLTableRowElement | HTMLDivElement>` added to `RowProps`), wired via `useFocus(props)` merged into the row props, same pattern already merged for `GridListItem` in #10822 (`GridList.tsx:562`, `focusEventProps`). Adds a story and tests.

**API change detection**
- **New props** on `Row`: `onFocus`, `onBlur`, `onFocusChange`. Semantics: only fires for focus on the row element itself, not descendants (`useFocus`, not `useFocusWithin`).
- No renamed/removed props, no DOM/class/CSS-variable changes. Additive, non-breaking. Should get **`needs API review`** (exists in repo).
- Parity gap: #6460 asks for collection items generally (`ListBoxItem`, `MenuItem`, `Row`, `GridListItem`); `GridListItem` shipped in #10822 (same author, merged 2026-10-22), `Row` here; `ListBoxItem`/`MenuItem` remain.

**Duplicates / signoff:** no other open PR for Table row focus events. #6460 is `enhancement`, `help wanted` and LFDanLu agreed in 2024 ("This sounds reasonable, would definitely be good to have parity with the hover events"), so the team has signed off on the idea; not a "needs signoff" case.

**Brief notes:** CLA signed, CI green. No review activity yet. Table tests include rerender and descendant-focus cases (reasoned from diff). Quoted validation "16 failures that also reproduce on unchanged source" is unverified.

### Would have done
- **Labels:** `ai reviewed`, `needs API review`. (`RAC`, `Table` already present.)
- **Comment:** none (maintainer review pending). Optionally: "Thanks, this follows the GridListItem change in #10822; please also cover how `onFocus`/`onBlur` interact with `onFocusChange` for the `aria-label`-only rerender case in docs."
- **Close / link:** none.
- **Other:** route to RAC/Table owners for API review; note #6460 stays open for `ListBoxItem`/`MenuItem`.
- **Confidence:** medium. Would change if docs for `Row` props are not auto-generated from `FocusEvents` as the PR claims (not verified).
- **Feedback prompt:** Should every "Part of #N" feature PR on a partially-complete issue get a comment linking the remaining pieces?

---

## #10874 - fix(s2): restore page.css declaration

Author: rojoangel (external). Label: `S2`. 1 file, +13/-0 (new empty `export {};` module with license header). Closes [#10873](https://github.com/adobe/react-spectrum/issues/10873). Complexity: **Low**.

**Summary.** Re-adds `packages/@react-spectrum/s2/src/page.ts` so the build emits `dist/types/src/page.d.ts`, the declaration that the `./page.css` export in `package.json` points to.

### Red flags
- **Disabled checks / timing hacks / workarounds / accessibility:** none.
- **Issue verification:** #10873 (open, 2026-10-27): published S2 1.7.0-1.8.2 lack `dist/types/src/page.d.ts`; strict consumers with `noUncheckedSideEffectImports` hit TS2882. On `origin/main`, `package.json:36-38` still declares `"types": "./dist/types/src/page.d.ts"` for `./page.css`, and `git log --diff-filter=D` shows `src/page.ts` was deleted in `3f46f5d5c1` "chore: Add opt-in Parcel v3 build (#10454)" (`src/` now only has `page.macro.ts`). So the diagnosis and fix are correct.
- **Already solvable:** no; consumers can't fix a missing published file (workaround: custom `declare module`).
- **Issue discussion:** no maintainer comments on the issue. On the PR, reidbarber requested removing the regression test, author removed it, reidbarber **approved** (2026-10-27T21:54Z).
- **Test quality:** no test remains (removed at maintainer's request); acceptable given a trivially checkable output file. Not verified by running.
- **CLA:** signed. All CI green.
- Note: PR body mentions test source preserved "locally" and in commit `eaed8d5e3`. No concern.

**API/compat:** none (emits an existing advertised declaration). **Duplicates:** none.

### Would have done
- **Labels:** `ai reviewed`, `small review`, `small impact`*, `patch worthy`* (fixes consumers of published packages).
- **Comment:** no comment.
- **Close / link:** none.
- **Other:** none; already approved, ready for merge.
- **Confidence:** high. Would change only if Parcel v3 output is meant to drop the `types` entry instead.
- **Feedback prompt:** Should publishing-regression fixes like this always get `patch worthy`?

---

## #10864 - fix(useCalendarYearPicker): preserve month when changing years

Author: mangeshraut712. 2 files, +68/-1 (source: 5 lines). Closes [#10838](https://github.com/adobe/react-spectrum/issues/10838). Complexity: **Low**.

**Summary.** In `useCalendarYearPicker`'s `onChange`, uses `years[key].date.set({month: focused.month, day: focused.day})` so a bounded full-range list (year options clamped to `minValue` Jan 1) doesn't change the focused month.

### Red flags
- **Disabled checks / timing hacks / workarounds / accessibility:** none.
- **Issue verification:** #10838 (open, 2026-10-23): with `visibleYears={101}` and 2000-2100 bounds, selecting 2028 from June 2026 goes to January 2028. The reporter's analysis (comment 2026-10-26) is that the clamped range start makes each year option a January date. The diff changes the apply step to keep the focused month/day. Plausible; `setFocusedDate` still constrains to min/max and `CalendarDate#set` clamps days (per PR text).
- **Issue discussion:** snowystinger (2026-10-23) first replied that it works in the docs and suggested a month picker; the reporter then reproduced with both pickers and explained the cause. No maintainer follow-up since confirming the behavior as a bug. Approach alternative: generate year items using the focused month/day (the other place the date originates) rather than patching `onChange`. Not stated by maintainers.
- **Test quality:** good: RAC integration test renders Calendar with month+year `select`s, selects 2028, asserts month stays 6 and grid label "June 2028", plus an assertion on the option's `data-date` documenting the clamped January. Would fail before the change by reasoning (month goes to January). Not run.
- **CLA:** signed. CI green.

**API/compat:** no API change; changed behavior of selecting a year (now keeps the month) in the bounded case. Related (not duplicates): #10841 by the same author (CalendarYearPicker 9999 loop) and merged #10536. **Duplicates:** none.

### Would have done
- **Labels:** `ai reviewed`, `small review`, `small impact`*.
- **Comment:** no comment.
- **Close / link:** none.
- **Other:** none.
- **Confidence:** medium. Would change if maintainers want the fix in item generation, not `onChange`.
- **Feedback prompt:** Is patching the apply step (vs. generating year items with the focused month) the right layer?

---

## #10869 - fix(ComboBox): don't commit value on blur when isReadOnly

Author: mangeshraut712. 2 files, +25/-1 (source: 1 line in `useComboBoxState.ts`: `if (shouldCloseOnBlur && !props.isReadOnly)`). Closes [#10846](https://github.com/adobe/react-spectrum/issues/10846). Complexity: **Low** (state-layer guard, single component, no API).

**Summary.** Skips the blur `commitValue()` for read-only ComboBoxes so controlled `value`/`inputValue` whose item isn't in the collection are not cleared via `onChange`/`onSelectionChange`.

### Red flags
- **Disabled checks / timing hacks / workarounds / accessibility:** none. Read-only fields shouldn't mutate selection on blur.
- **Issue verification:** #10846 (open, `bug`): read-only ComboBox fires change events on blur. On `origin/main` the blur path (`useComboBoxState.ts:~604-606`) runs `commitValue()` when `shouldCloseOnBlur` regardless of `isReadOnly`, while the focus path already checks `!props.isReadOnly` (line 601). The diff matches. Side effect to be aware of: `commitValue()` also resets the input and closes the menu; for a read-only field the menu cannot normally open, so this seems safe (could not verify a controlled `isOpen` + read-only case).
- **Already solvable with existing code:** no.
- **Issue discussion:** no comments on the issue. nwidynski on the PR: "LGTM. Thanks!"
- **Test quality:** RAC test with `isReadOnly value="4" inputValue="Finland"`, focus/blur, asserts no `onChange`/`onSelectionChange` after clearing mocks. Exercises the issue scenario; would fail before by reasoning. Not run.
- **CLA:** signed. CI green. Author "CI is green" comment 14:26:15Z.

**API/compat:** none. Behavior: blur no longer commits for read-only ComboBox.
**Duplicates:** [#10850](https://github.com/adobe/react-spectrum/pull/10850) (florianaltendorfer, same title and same one-line fix, opened 2026-10-24) was **closed by its author** on 2026-10-27T11:24Z with no comments, ~1.5h before this PR. It is not a live duplicate, but this PR duplicates the same fix that another contributor had already prepared, and #10850 was written by someone other than the issue author. Candidate for a "contributor credit" discussion (see Rule feedback).

### Would have done
- **Labels:** `ai reviewed`, `small review`, `small impact`*.
- **Comment:** no comment.
- **Close / link:** none; note #10850 (closed) as the earlier equivalent.
- **Other:** none; already has nwidynski's LGTM.
- **Confidence:** medium. Would change if reviewers want `isReadOnly` handled inside `commitValue` instead.
- **Feedback prompt:** Do we care that this PR re-implements an identical fix that another contributor closed hours earlier?

---

## #10876 - fix: preserve numbering system for separator-only input

Author: adobe-ddavidso (Adobe; `authorAssociation` not shown by `gh`, org-member by handle). 3 files, +108/-1 (source: ~11 lines). Closes [#10875](https://github.com/adobe/react-spectrum/issues/10875) (filed by the same author ~5 minutes earlier). Complexity: **Medium** (lowest layer, `@internationalized/number`, used by NumberField).

**Summary.** `NumberParser#getNumberingSystem` now falls back to the configured default numbering system when the sanitized input contains neither a numeral nor the decimal separator (e.g. only `.`, `,`, `-`), instead of letting `getNumberParserImpl` pick another numbering system (Arabic), which caused `1%` to become `١٪؜` on blur.

**Medium PR: API and duplicate checks only**
- **API/compat:** no public API change. Behavior of `getNumberingSystem` changes for separator-only strings (returns the default instead of a detected alternate). Used in `useNumberFieldState.ts` (only in-repo non-test caller). Consumers who relied on detection from a lone separator in a non-default numbering system (e.g. `ar-EG` with `-`) could change; the new tests cover `ar-EG`, `en-US-u-nu-arab` and `ar-EG-u-nu-latn`.
- **Duplicates:** none for #10875. Related closed [#3862](https://github.com/adobe/react-spectrum/issues/3862) (comma-only case).
- Tests: parser-level `it.each` plus two RAC NumberField interaction tests (clear, type `.`/`,`, blur, expect `1%` / `0%`). Good integration coverage by reading.
- CLA signed, CI green. PR checklist leaves "Added/updated unit tests" unchecked although tests are included; "AI-assisted with GitHub Copilot".

### Would have done
- **Labels:** `ai reviewed`, `NumberField`, `internationalization`, `small impact`*.
- **Comment:** no comment.
- **Close / link:** none.
- **Other:** none; internal author, standard review.
- **Confidence:** medium. Would change if a maintainer knows a caller relying on separator-only detection.
- **Feedback prompt:** Should medium-complexity PRs in `@internationalized/*` get a deeper review pass despite the Medium bucket?

---

## Rule feedback

- **Complexity buckets:** #10869 changes `@react-stately` (listed as High in the rules: "changes in `@react-stately` / `@react-aria` core behavior") but is a one-line guard; I classified it Low. Same for #10861 (`@react-aria` hook, small guard) and #10868 (one line in `useComboBox`). Clarify whether "core behavior" means any source change in those packages or only broad behavior. #10876 is a small source change at the lowest layer (`@internationalized/number`); I classified it Medium because of its reach, but size alone would say Low.
- **Per-author volume:** `mangeshraut712` has 10 open AI-assisted PRs and posts identical "CI is green" pings. Suggest a rule, e.g. after N open PRs from one external author, propose a "one PR at a time" comment and `needs signoff` on new ones. Also a rule for same-second boilerplate pings.
- **"needs signoff" candidates** (issue without maintainer agreement before the PR): #10872 (#10858 asks for a repro; no triage), #10871 (#10844 looks like a browser bug), #10861 (#10044: maintainer suggested not disabling a focused field), #10867 (#10230: root cause unknown), #10864 (#10838: maintainer was initially unconvinced, then reporter clarified). Not on this list: #10857 (#6460 team-agreed), #10860, #10869, #10874, #10876.
- **Existing review comments:** several PRs (#10860, #10861, #10867, #10868, #10871) already have maintainer feedback. The rules don't say whether the digest should propose a comment that restates it. I proposed comments that echo the maintainers' points, which may be redundant.
- **Test quality without running:** the #10868 "vacuous test" finding is reasoned from testing-library behavior, not run. The rules forbid running PR tests, so this stays a medium-confidence flag.
- **Duplicate detection:** #10869 vs closed #10850 has no clear rule: is a PR closed by its own author a duplicate worth noting? I noted it informationally.
- **Scope timestamp:** "since the last digest" was taken as the last digest's commit time (2026-10-26 16:10 UTC); the PR list was a 100-item `gh pr list` filtered locally by `createdAt`.
- **Could not verify:** whether `Row` prop docs auto-generate from `FocusEvents` (#10857); the Windows always-on-scrollbar behavior (#10867); VoiceOver behavior (#10871); `authorAssociation` (`gh pr view --json` doesn't expose it). Also `gh pr diff` context lines were abbreviated by the shell output compressor in my environment; I re-read key hunks from `origin/main` where it mattered.
