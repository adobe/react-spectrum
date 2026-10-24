# PR triage digest, 2026-10-24 (read-only draft)

- Branch: `triage_support`; merged `origin/main` at `338cf2e194` (clean merge, no conflicts).
- Scope: open, non-draft, non-bot PRs created since the last digest (2026-10-23 16:21 UTC), without `ai reviewed`. Two PRs found.
- Nothing was run, checked out, or posted. All claims come from reading `gh pr view|diff` output and `origin/main` source.

## Summary

| PR | Complexity | Red flags | Would label | Would comment | Would close / duplicate of | Confidence |
| --- | --- | --- | --- | --- | --- | --- |
| [#10850](https://github.com/adobe/react-spectrum/pull/10850) ComboBox: no blur commit when `isReadOnly` | Low | CLA check `ACTION_REQUIRED`; test is RAC-only; edge: menu left open if `isReadOnly` flips while open | `small review`, `ai reviewed`, `small impact` | CLA reminder | Would not close; no duplicate found | High |
| [#10848](https://github.com/adobe/react-spectrum/pull/10848) Scroll anchoring follow-ups | Low | Empty checklist/body, no linked issue (follow-up to merged #10600, already approved) | `ai reviewed` (already has `small review`, `no testing`, `AI`) | No comment | Would not close; no duplicate | High |

---

## #10850 - fix(ComboBox): don't commit value on blur when isReadOnly

Author: florianaltendorfer (external). 2 files, +22/-1. Complexity: **Low** (one-line change in `@react-stately`, plus a RAC test). Labels: none.

**Summary.** `useComboBoxState.setFocused(false)` now skips `commitValue()` when `props.isReadOnly`. This stops a read-only, fully controlled ComboBox from firing `onChange`/`onSelectionChange(null)` on blur when the selected key is not in the collection (e.g. async items not loaded).

**Issue verification.** Closes [#10846](https://github.com/adobe/react-spectrum/issues/10846) (open, `bug`, no maintainer comments). The issue's "Possible Solution" is literally "Gate the blur commit on `isReadOnly` in `useComboBoxState`'s `setFocused`". On `origin/main`, `useComboBoxState.ts` has `if (shouldCloseOnBlur) { commitValue(); }` with no read-only check, while the focus branch already checks `menuTrigger === 'focus' && !props.isReadOnly`. The diff matches the issue's expected behavior.

**Already solvable?** Only by workarounds the issue itself names (always keep the selected item in `items`, or ignore `null` selection changes when read-only). Both are workarounds, not documented behavior, so no `has workaround` label.

**Issue discussion.** No comments, so no team constraints to contradict.

**Test quality.** Added `should not fire change events on blur when isReadOnly` in `packages/react-aria-components/test/ComboBox.test.js`. It renders a read-only controlled ComboBox with `value="4"` / `inputValue="Finland"`, clicks the input, tabs away, and asserts neither `onChange` nor `onSelectionChange` fired. That is a real user interaction rather than an internal-state check. Reasoning from the diff, it should fail before the change and pass after. Not verified by running (not permitted). Minor: the diff shows no blank line before the next `it(`. Coverage is RAC only. The PR body says the other suites were run, but no tests were added for react-aria, RSP or S2.

**Red flags.**
- Disabled checks / timing hacks / a11y regressions: none. Keyboard commit was already disabled for read-only, as the PR body says.
- Edge case: blur no longer runs `commitValue()`, which also resets `closedDueToEmpty.current` and closes the menu via `commitSelection`. Opening a read-only ComboBox is already blocked on focus, but if `isReadOnly` turned true while the menu was open, blur would no longer close it. Low likelihood; worth a maintainer glance.
- CLA: `Adobe CLA Signed?` is `ACTION_REQUIRED`.
- All CircleCI checks pass, including lint, test, typecheck and browser tests. (Checked at the time of this run; the PR is only minutes old.)
- Does not touch CI, `package.json`, lockfiles or build config, so no security-review flag.

**API / compatibility.** No API change. Behavior change: read-only blur no longer calls `onChange` / `onSelectionChange` / `onInputChange` through `commitValue`. This is the intended fix. Could arguably matter for apps relying on a blur-time reset of `inputValue` for read-only fields, so note it for the changelog.

**Duplicates.** Searched open and closed PRs for "ComboBox isReadOnly blur" and for the issue number. #10850 is the only PR referencing #10846. No duplicate.

**Needs signoff?** No. The issue is a labeled `bug` and the fix is what the reporter suggested.

### Would have done
- **Labels:** add `small review` (one-line source change, localized); add `ai reviewed` (digest covered it; label does not exist yet and needs creating); add `small impact` (edge case with read-only, controlled ComboBox; label does not exist yet and needs creating). Remove: none.
- **Comment:** "Thanks for the fix! Heads-up that the Adobe CLA check shows as action required. Please sign it at the link in the check so we can proceed with review. Also, since this changes `useComboBoxState`, it would be nice to confirm React Spectrum v3 / S2 ComboBox behave the same for a read-only field (an extra test there is optional)."
- **Close / link:** none. No duplicate; closes #10846 once merged.
- **Other:** no escalation. A maintainer should consider the read-only-flips-while-open edge case.
- **Confidence:** high. Would change if a maintainer knows of consumers depending on blur-time commit for read-only fields.
- **Feedback prompt:** Is a RAC-only regression test enough for a change in `@react-stately`, or should the comment ask for an RSP/S2 test too?

---

## #10848 - chore: scroll anchoring follow-ups

Author: yihuiliao (maintainer). 2 files, +14/-8. Complexity: **Low**. Existing labels: `small review`, `no testing`, `AI`. Review: LFDanLu **APPROVED** (2026-10-23 22:18 UTC).

**Summary.** Follow-up to merged [#10600](https://github.com/adobe/react-spectrum/pull/10600) addressing Rob's review feedback. It rewrites the JSDoc on `ScrollAnchorInfo.isAnchorable` / `isEdgeContent` in `packages/react-stately/src/virtualizer/ScrollAnchor.ts` and the copy in `packages/@react-spectrum/ai/src/ListLayout.ts`. It also renames the private `getNewestKey()` to `getLastContentKey()` and updates its single use in `isEdgeContent`.

**Issue verification.** No linked issue. The body says it responds to review feedback on #10600 (merged 2026-10-23 18:58 UTC). PR checklist is entirely unchecked and test instructions are empty. Expected for an internal follow-up, but flagged per rules.

**Already solvable?** n/a (docs and a private rename).

**Red flags.**
- Disabled checks / timing hacks / workarounds / a11y: none in the diff.
- Tests: none added or needed; docs and private rename only, behavior unchanged (`no testing` label fits).
- CLA: `SUCCESS`. All CircleCI checks pass (lint, test, typecheck, ts-diff, etc.).
- Does not touch CI, `package.json`, lockfiles or build config.
- Note: `ScrollAnchorInfo` is declared twice (react-stately and the ai package) with duplicated docs; this PR keeps them in sync, so no issue. The first `gh pr view ... statusCheckRollup` call hit a transient network error and was retried successfully.

**API / compatibility.** `getNewestKey` is `private`, so the rename is not breaking. `ScrollAnchorInfo` is an exported interface, but only doc comments changed. No type or runtime change. Verified on the diff.

**Duplicates.** Related open PR [#10558](https://github.com/adobe/react-spectrum/pull/10558) (box layout / anchor observer primitives) is adjacent but distinct. No duplicate.

### Would have done
- **Labels:** add `ai reviewed` (label does not exist yet). Keep `small review`, `no testing`, `AI`. Remove: none. Not adding an impact label (internal, no behavior change).
- **Comment:** no comment.
- **Close / link:** none.
- **Other:** none; already approved, so only needs the merge flow.
- **Confidence:** high. Would change only if the rename touches code outside the two shown files (diff shows none).
- **Feedback prompt:** Should internal follow-up PRs with an empty checklist and no linked issue be flagged at all, or exempted for maintainer authors?

---

## Needs signoff candidates (for feedback only)

None this run. #10850's issue is a labeled `bug` with a suggested fix; #10848 is a maintainer follow-up.

## Labels that would need to be created

`ai reviewed`, `small impact` (both not currently in the repo per the rules file).

## Rule feedback

- #10850: the "already solvable" check is ambiguous when the issue itself lists workarounds. I treated workarounds as not a reason to reject; no `has workaround` label proposed.
- #10848: the checklist is empty and no issue is linked. The rules say to flag missing issues, but for maintainer follow-ups the flag is probably noise.
- The scope rule says "last 24 hours (or since the last digest)". I used the last digest's run time (2026-10-23 16:21 UTC), which excluded nothing relevant. #10848 (created 19:43 UTC on 10-23) was not in the 10-23 digest, so it is included here.
- Could not verify by running anything (by design). The edge case about `isReadOnly` flipping while the menu is open was reasoned from source, not tested.
- #10850 is only minutes old, so CI status may still change.
