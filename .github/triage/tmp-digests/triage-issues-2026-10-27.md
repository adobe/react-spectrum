| Issue | Severity | Reproduction? | Solvable without changes? | Would label | Would comment | Would close / duplicate of | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [#10866](https://github.com/adobe/react-spectrum/issues/10866) Multi-select ComboBox: Cmd/Ctrl+A does nothing while popover is open | Medium | Yes, minimal snippet; root cause confirmed by reading source on `origin/main` | No (no clean workaround); fix PR [#10868](https://github.com/adobe/react-spectrum/pull/10868) already open | `bug`, `ComboBox`, `RAC` | Yes, short ack, link the open PR | No / no duplicate found | High |
| [#10862](https://github.com/adobe/react-spectrum/issues/10862) ColorField ignores Form `validationBehavior="aria"` | Low to medium | Yes, minimal snippet; root cause confirmed by reading source | Workaround only (set `validationBehavior="aria"` on each `ColorField`); fix PR [#10863](https://github.com/adobe/react-spectrum/pull/10863) already open | `bug`, `ColorField`, `Form`, `RAC`, `has workaround` | Yes, short ack, link the open PR | No / no duplicate found | High |
| [#10858](https://github.com/adobe/react-spectrum/issues/10858) Virtualized Picker re-measures per option, repeated style/layout on open | Low to medium | External repo only (not opened); code path confirmed by reading source, numbers unverified | No | `performance`, `Picker`, `Virtualizer`, `v3` | Yes, ack, ask for a StackBlitz or a trace instead of a repo clone, link open PR | No / no duplicate found | Medium |

# Issue triage digest - 2026-10-27

**Git synchronization:** Verified `/Users/danilu/dev/react-spectrum-triage` is on `triage_support`. `git fetch origin` succeeded. `git status --porcelain --untracked-files=no -- . ':!.github/triage'` showed no tracked changes, so `git merge origin/main --no-edit` ran and reported "Already up to date". `origin/main` is `06891def3e7488f4e598debb8418bf17cf060279` (already an ancestor of `triage_support`). No merge conflicts. Only this digest is committed; nothing is pushed.

**Window:** Since the previous issue digest (2026-10-26, cutoff about 2026-10-26 16:31 UTC) through this run (2026-10-27 16:39 UTC). `gh issue list --state all --search "created:>=2026-10-26"` returned six issues. Three were already covered by the 2026-10-26 digest (#10854, #10855, #10856). Three are new, all unlabeled, none with maintainer comments: #10858, #10862, #10866.

**Carried over from the 2026-10-26 digest (not re-triaged, new activity only):**
- #10854 and #10855 (Sheet, iOS Safari): `devongovett` has now commented on both. On #10854: "I cannot reproduce. I dragged the sheet to the bottom of the screen and it dismissed." On #10855: "Pretty sure that's just how native scroll chaining works so I wouldn't necessarily consider this to be a bug." The reporter replied with videos on both. This weakens the earlier `needs investigation` proposal for #10855 and suggests it may be closable as expected behavior. The maintainer's view should drive that. Both are still unlabeled.
- #10856 (CheckboxGroup `validationBehavior`): no new activity, still unlabeled.

**Evidence limits:** GitHub reads used only `gh issue list|view`, `gh pr list|view`, `gh label list`. No writes, no gists, no pushes. Nothing from any issue was executed, installed, checked out or opened, and no issue links were fetched. The repro link in #10858 was not opened. Snippets were judged by reading them against `origin/main` source. Performance numbers in #10858 (133 layouts, 150 style recalculations, 227 ms) could not be verified.

**Label check:** all labels proposed below already exist in the repo (`bug`, `ComboBox`, `ColorField`, `Form`, `Picker`, `Virtualizer`, `performance`, `RAC`, `v3`, `has workaround`, `needs investigation`). No new labels proposed this run.

**Observation (not an action):** #10862 and #10858 were filed by `mangeshraut712`, who also opened fix PRs #10863 (07:34 UTC, a minute after the issue), #10868 (for #10866, which this author did not file) and #10872 (for #10858) within hours of the issues being created. The PRs are out of scope for this digest (see `.github/triage/pull-requests.md`), but #10872's body keeps the AI-assistant template comment and the pattern looks like automated or AI-assisted contributions. The PR triage should check them against the AI-assisted contributions section of `CONTRIBUTING.md`.

---

## #10866 ComboBox with `selectionMode="multiple"`: Cmd/Ctrl+A does nothing while the popover is open

Link: https://github.com/adobe/react-spectrum/issues/10866 (author `Laurens256`, no labels, no comments, `react-aria-components` 1.22.0, Firefox, macOS)

**Summary:** In a multi-select `ComboBox`, Mod+A in the input does nothing while the popover is open. It neither selects the input text nor selects options. Works with `selectionMode="single"` or when the popover is closed. Suggested fix: pass `disallowSelectAll: true` to `useSelectableCollection` inside `useComboBox`.

**Verification against `origin/main` (read-only):**
- `packages/react-aria/src/combobox/useComboBox.ts:173-181`: `useSelectableCollection({selectionManager, keyboardDelegate, disallowTypeAhead: true, disallowEmptySelection: true, shouldFocusWrap, ref: inputRef, isVirtualized: true})`. No `disallowSelectAll`, matching the reporter's claim.
- `packages/react-aria/src/selection/useSelectableCollection.ts:355-361`: `aHandler` is `if (manager.selectionMode === 'multiple' && disallowSelectAll !== true) { manager.selectAll(); return; } return false;`. For multiple mode it returns `undefined` (not `false`), so the shortcut handler treats the event as handled and default is prevented. This matches the "default-prevented" claim. The handler is registered as `'Mod+A': aHandler` at line 444.
- `packages/react-stately/src/combobox/useComboBoxState.ts:260`: `if (keys === 'all') { ...` which, per the reporter, returns early, so `selectAll()` has no effect. I did not re-read the body of that branch past the condition, but it is consistent with the report.
- In single mode `aHandler` returns `false`, so default is not prevented. That explains why single mode works. Adding `disallowSelectAll: true` only changes multiple mode.
- Not verified: browser behavior (Firefox on macOS), since nothing is run. The source analysis fully explains the symptom in any browser, so the Firefox-only mention looks incidental.

**Duplicates:** searched issues for "ComboBox select all", "ComboBox multiple Ctrl+A" (open and closed). Only #4476 ("Keyboard shortcut to deselect all items in a selectable collection", closed) is loosely related and is not a duplicate. Open PR [#10868](https://github.com/adobe/react-spectrum/pull/10868) "fix: allow Mod+A to select ComboBox input text while multi-select menu is open" already implements the suggested fix and says "Closes #10866".

**Reproduction:** Minimal inline snippet is sufficient (RAC `ComboBox selectionMode="multiple"`). No StackBlitz needed. Judged by reading.

**Solvable without changes?** No. There is no supported prop to disable select-all in `ComboBox`. A user-land `onKeyDown` that stops propagation would depend on internals and is not recommended. Needs a real fix.

**Severity:** Medium. Affects every multi-select ComboBox with the popover open, blocks a standard text-editing shortcut, no clean workaround. Not data loss or a crash. Keyboard-only users are affected, but the field remains usable otherwise, so I would not add `accessibility`.

**Regression:** unknown. The issue does not say what version last worked. No `regression` label exists, so none proposed.

**Would have done**
- **Labels:** add `bug` (shortcut swallowed), `ComboBox` (component), `RAC` (reported against `react-aria-components`; the fix is in `@react-aria/combobox`, so S2 `ComboBox` is likely affected too, not verified). Not adding `needs investigation`, the cause is already identified.
- **Comment:**
  > Thanks for the report and the detailed analysis. We confirmed that `useComboBox` doesn't pass `disallowSelectAll` to `useSelectableCollection`, so in multiple selection mode the Mod+A handler runs `selectAll()` (which the ComboBox state ignores) and the event's default is prevented, which is why the text isn't selected. There's already a fix open in #10868.
- **Close / link:** none. Keep open until #10868 merges. Link PR #10868.
- **Other:** none.
- **Confidence:** high. Would change if the maintainers want Mod+A to select options in the ComboBox, which seems unlikely since `selectAll` is already a no-op there.
- **Feedback prompt:** is it right to leave this unlabeled as an accessibility issue, and should the comment link to a community PR that is likely AI-assisted?

---

## #10862 ColorField ignores Form `validationBehavior="aria"`

Link: https://github.com/adobe/react-spectrum/issues/10862 (author `mangeshraut712`, no labels, no comments, `react-aria-components` `main`)

**Summary:** `ColorField` always resolves `validationBehavior` to `'native'` and never reads `FormContext`, so `<Form validationBehavior="aria">` has no effect on it. Expected: input gets `aria-required` and no native `required`, same as `TextField`.

**Verification against `origin/main` (read-only):**
- `packages/react-aria-components/src/ColorField.tsx:162`, `:201`, `:210`: all three call sites use `validationBehavior: props.validationBehavior ?? 'native'` with no Form fallback. Matches the report.
- `ColorField.tsx` has no import or use of `FormContext` (the grep for `FormContext` in the file returns nothing).
- `TextField.tsx:106-107` and `NumberField.tsx:111-112` both do `let {validationBehavior: formValidationBehavior} = useSlottedContext(FormContext) || {}; let validationBehavior = props.validationBehavior ?? formValidationBehavior ?? 'native';`, which is exactly the pattern the reporter proposes.
- Confirmed that the issue is real. The suggested fix is consistent with sibling components.

**Duplicates:** searched open and closed issues for "ColorField validationBehavior"; only #10862 matches. Open PR [#10863](https://github.com/adobe/react-spectrum/pull/10863) "fix(react-aria-components): inherit Form validationBehavior in ColorField" ("Fixes #10862") already implements it.

**Reproduction:** Inline snippet is sufficient. Judged by reading.

**Solvable without changes?** Workaround: set `validationBehavior="aria"` on each `ColorField`. It uses a public prop and no hacks, so `has workaround` applies. A real fix is still needed for consistency with other fields.

**Severity:** Low to medium. Only affects users who combine `Form validationBehavior="aria"` with `ColorField`, a workaround exists, no crash or data loss. Behavior is inconsistent with the other fields but the native validation fallback is still accessible.

**Regression:** not claimed and not verified.

**Would have done**
- **Labels:** add `bug`, `ColorField`, `Form`, `RAC`, `has workaround`. `S2` not added, I did not check whether S2 `ColorField` forwards `validationBehavior` (it likely wraps RAC `ColorField`, so it would inherit the fix).
- **Comment:**
  > Thanks for the report. You're right: `ColorField` hardcodes `props.validationBehavior ?? 'native'` and doesn't read `FormContext` like `TextField` and `NumberField` do. In the meantime, you can set `validationBehavior="aria"` directly on `ColorField`. There's a fix open in #10863.
- **Close / link:** none. Link PR #10863.
- **Other:** none.
- **Confidence:** high. Would change if the S2 wrapper is found to resolve the Form value itself.
- **Feedback prompt:** is `Form` worth adding as a component label for context-inheritance bugs like this one, and is `has workaround` right for a one-prop workaround?

---

## #10858 Virtualized Picker recalculates its layout several times for each visible option when it opens

Link: https://github.com/adobe/react-spectrum/issues/10858 (author `denodell`, no labels, 1 comment from contributor `nwidynski`: "Please provide a stackblitz or codesandbox for reproduction. Nobody is going to clone an unknown repo and execute arbitrary code on their machine.")

**Summary:** On Picker open, each visible option is measured in its own layout effect: `isElementVisible()` calls `checkVisibility()`, then `getSize()` clears `style.height`, reads `scrollWidth`/`scrollHeight`, and restores the height. Interleaving a style write with a layout read per item forces a layout per item. Reporter measured 133 layouts and about 150 style recalculations for 17 options, 227 ms to open at 4x CPU throttle (162 ms unresponsive), independent of item count. Proposed fix: batch (clear all heights, read all sizes, restore).

**Verification against `origin/main` (read-only):**
- `packages/react-aria/src/virtualizer/useVirtualizerItem.ts:35-46`: `updateSize` calls `isElementVisible(ref.current)` then `getSize(ref.current)` then `virtualizer.updateItemSize(key, size)`. The layout effect at `:50-54` calls it per item when `layoutInfo?.estimatedSize` is set.
- `useVirtualizerItem.ts:92-97`: `getSize` does `let height = node.style.height; node.style.height = ''; let size = new Size(node.scrollWidth, node.scrollHeight); node.style.height = height;`. This is a write followed by a read per item, matching the description.
- `packages/react-aria/src/utils/isElementVisible.ts:16,65`: uses `element.checkVisibility({visibilityProperty: true})` when available, and recurses to the parent (`:74`), as described.
- So the per-item write-then-read pattern is real in the source. I could not verify the measured counts or timings, or whether the Picker is the slowest of the compared design systems.

**Duplicates:** searched issues for "useVirtualizerItem", "Picker layout virtualizer performance". No duplicate. Related but not duplicates: closed #10171 and #9519 (virtualizer resize / dynamic height). Open PR [#10872](https://github.com/adobe/react-spectrum/pull/10872) "fix: batch virtualizer item measurements" ("Fixes #10858") and open PR [#10748](https://github.com/adobe/react-spectrum/pull/10748) "perf: memoize VirtualizerItem" (related, not the same change).

**Reproduction:** Provided only as a separate GitHub repo plus DevTools profiling steps. I did not open it. A contributor already asked for a StackBlitz/CodeSandbox. Judged by the described code path. A StackBlitz is still appropriate, since the repo template expects one.

**Solvable without changes?** No. The measurement is internal to `useVirtualizerItem`; the only user-land mitigations (smaller lists, different layouts) do not remove the per-item cost and the reporter says count does not matter.

**Severity:** Low to medium. Affects every virtualized collection and Picker open, but the cost is tens to low hundreds of milliseconds on a 4x throttled CPU, not a crash or accessibility problem.

**Regression:** not claimed.

**Would have done**
- **Labels:** add `performance`, `Picker`, `Virtualizer`, `v3` (reported against `@adobe/react-spectrum` 3.47.6). The hook is shared, so `RAC` and `S2` collections that use `Virtualizer` are probably affected, not labeled because not verified.
- **Comment:**
  > Thanks for the detailed write-up. `useVirtualizerItem` does measure each visible item separately (it clears `style.height`, reads `scrollWidth`/`scrollHeight`, and restores the height), so batching those reads is a reasonable direction. Could you share a StackBlitz or CodeSandbox for the reproduction, or the exported Performance trace, instead of the repo link? There's also a candidate change in #10872.
- **Close / link:** none. Keep open. Link related PRs #10872 and #10748.
- **Other:** none beyond the repro request (the `waiting` label is not applied since the issue is real enough to investigate on its own; see feedback). A maintainer should decide whether #10872's approach (microtask batching) is acceptable, because it changes when item sizes are reported.
- **Confidence:** medium. Would go to high if the profile is reproduced or the maintainers agree the batching is safe. Would change toward `waiting` if the report cannot be reproduced from a StackBlitz.
- **Feedback prompt:** should `waiting` be applied when we asked for a StackBlitz but the source already supports the claim?

---

## Rule feedback

- **Scope with prior digests:** the window ("since the last digest") included three issues from the previous digest that are still unlabeled. I only noted new activity on them rather than re-triaging. Clarify whether still-unlabeled, already-digested issues should be re-listed in the table.
- **Maintainer activity as a triage signal:** #10854 and #10855 got maintainer replies after the last digest. The rules define "untriaged" only by labels, so a maintainer-replied unlabeled issue is ambiguous. Clarify whether it should still be proposed for labels.
- **`regression` label:** none exists; I did not propose it this run (no regression claimed). Earlier digests proposed creating it.
- **Repro rule vs. external repro repo:** #10858 provides only a repo link. I did not open it per the security rules and could not verify the profiling numbers. The rules say to propose asking for a StackBlitz, which I did. Whether `waiting` should accompany it is a judgment call.
- **Existing fix PRs:** all three issues already have community PRs. The issue rules do not say whether to link them in the comment or to leave that to the PR digest. I linked them in the proposed comments.
- **Version labels:** `v3` vs `RAC` vs `S2` is hard to pick when a shared hook is involved (#10858, #10866). I labeled by the layer the reporter named.
- **Could not check:** browser behavior (#10866, Firefox), performance numbers and the external repro (#10858), and S2 forwarding behavior for #10862 and #10866, because nothing is run and S2 was not read.
