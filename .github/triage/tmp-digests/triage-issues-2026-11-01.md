# Issue triage digest — 2026-11-01

> Presentation-only revision of the original digest. This is not a fresh triage run; no historical proposal is executed or newly authorized by this rewrite.

## At a glance

- One report: S2 DatePicker popup TimeField collapses inside Form.
- Medium severity and ready for review; a scoped form-context reset was proposed.
- The source matched the report, but the StackBlitz was not opened or run.

## Issues

### [#10899](https://github.com/adobe/react-spectrum/issues/10899) — DatePicker TimeField inside Form

**Decision:** Ready for review: keep open for a scoped S2 form-context fix.
**Impact / severity:** Medium.
**Complexity:** Not assessed in the original run.
**Confidence:** high.

#### What matters

- Popover TimeField still sees FormContext through its portal.
- Subgrid is applied inside a flex parent, with shrinking styles that explain the collapse.
- The source matches the report, but the supplied StackBlitz and release behavior were not run.

#### Would have done

**Labels (proposed)**

- `bug` — reported defect corroborated by source.
- `DatePicker` — affected component.
- `Form` — surrounding form-context interaction.
- `ready for review` — actionable report and matching cause.
- `ai-reviewed` — original automated triage completed.
- `S2` — proposed new layer label in this run; creation was a maintainer decision.
- `RAC` was not proposed because the defect was S2-only.

**Maintainer next step**

- Consider a scoped context reset; test label placement, size inheritance and a time-enabled DatePicker in Form.
- Historical comment proposal only: maintainer-reviewed wording is retained in the #10899 evidence appendix; nothing was posted by this revision.

## Evidence and verification appendix

### #10899 — Evidence and verification

Author: `jabrks`, created 2026-11-01.

Version `@react-spectrum/s2` 1.8.2, Chrome, macOS.

No labels yet.

#### Summary

A time-enabled S2 `DatePicker` inside S2 `Form` renders its popover `TimeField` collapsed, clipping the segments.

Outside `Form` it renders correctly.

The author already diagnosed the cause.

#### Evidence (checked against `origin/main`, not run)

- `packages/@react-spectrum/s2/src/TimeField.tsx:81` reads `useContext(FormContext)`, and `:93` passes `isInForm: !!formContext` to the field style.
- `packages/@react-spectrum/s2/src/style-utils.ts:62` maps `isInForm: 'subgrid'` for `gridTemplateColumns` (and `gridColumnStart`/`gridColumnEnd` just above it).
- `packages/@react-spectrum/s2/src/DatePicker.tsx:260-275` renders that `TimeField` inside `<div className={style({display: 'flex', gap: 16, contain: 'inline-size'})}>`, which is a flex container, not a grid, so `subgrid` has no parent grid to inherit and resolves to `none`.
- The popover content (`DatePicker.tsx:296-310`) only resets `OverlayTriggerStateContext`.

- React context passes through the portal, so the popover's `TimeField` still sees the Form's `FormContext`.

- Other S2 components (`CheckboxGroup.tsx:159`, `RadioGroup.tsx:170`, `TagGroup.tsx:363`) provide their own `FormContext.Provider`, so a scoped reset is an established pattern.
- The author's quote: "The popup TimeField's immediate parent is a flex container rather than the Form's grid. Its computed `grid-template-columns` is `none`, and the input collapses to its minimum width." This matches the code.
- The popover `TimeField` also gets `timeField` styles (`DatePicker.tsx:144-149`: `minWidth: 0`, `flexShrink: 1`, `width: 'unset'`), which is why it shrinks to its minimum content instead of its normal width.

#### Likely fix direction (for maintainers, from source only)

clear the form context for the popover's time field, for example by wrapping the popover content in `<FormContext.Provider value={null}>` (or only the `TimeField`), so `isInForm` is false there.

Check that the label stays on top and that `size` still comes from the `DatePicker` props.

Add an S2 test or story with a time-enabled `DatePicker` inside `Form`.

#### Duplicates

searched open and closed issues ("DatePicker Form popover time subgrid", "TimeField Form collapses") and open/closed PRs ("DatePicker TimeField Form", "subgrid DatePicker").

Nothing matches.

No existing fix PR.

#### Other notes

- A community comment (`Sufiyan-MSA`) asks to be assigned.

- This is not a triage action; assignment is a maintainer decision.

- See Rule feedback.
- Regression: not claimed in the issue and no version history is given, so no `regression` label.
- Suggested workarounds: none that are clean.

- Passing a wrapper that clears context is not possible from outside the popover, so this needs a library fix.

- Do not suggest `!important` or overriding the grid via internals.

#### Original readiness qualifications

Would have added `ready for review`: **yes**.

Clear summary, expected vs. current behavior, StackBlitz repro, version/browser/OS, and a root cause that matches the source.

Not a duplicate and not answerable without changes.

#### Confidence and decision-changing evidence

high. It would drop to medium if the StackBlitz showed a different parent structure than `main` (the report is on 1.8.2; I only read `origin/main`).

#### Historical proposed comment (not posted by this revision)

> Thanks for the detailed report and for tracking down the cause.
>
> This matches what I see in the source: the popover's `TimeField` still reads the surrounding `Form`'s `FormContext` (the context passes through the popover portal), so it applies `grid-template-columns: subgrid` while its parent in the popover is a flex container.
>
> We'll look at clearing the form context for the popover's time field.
>
> Nothing for you to change on your side in the meantime.

#### Historical closure and escalation proposals

- Close / link: none.
- Close / link: No duplicate; no related fix PR.
- Other: no request for more info; no API review needed.
- Other: A maintainer decides whether to accept the external contributor's request in the comments (`Sufiyan-MSA`), and I would not reply to it automatically.

## Run notes

#### Git synchronization

Verified `/Users/danilu/dev/react-spectrum-triage` is on `triage_support`. `git fetch origin` succeeded. `git status --porcelain --untracked-files=no -- . ':!.github/triage'` showed no tracked changes, so `git merge origin/main --no-edit` ran and reported "Already up to date". `origin/main` is `a562b335e645c172ec5a940b3e47ccdadbeeaa15`.

No merge conflicts.

Only this digest is committed; nothing is pushed.

#### Scope

The last digest (2026-10-31) already covered #10891, #10894, #10895, #10897 and #10898.

The only open issue created since then is #10899.

Nothing was written to GitHub; all reads were `gh issue list|view|search` and `gh pr list`.

#### Rule feedback — #10899

is `ready for review` right for an issue where the author already supplied the root cause, and should the missing `S2` label be created?

### Historical label-list ambiguity

The original November 1 wording said “no `S2` or `RAC` label exists in the repo label list” and then “`RAC` exists but the bug is in S2 only.”

This contradictory inventory statement is retained as a historical limitation, not resolved by a new label lookup.

The original action still proposed `S2` as absent and left its creation to a maintainer.

### Rule feedback from the original run

- **Scope window:** "last 24 hours (or since the last digest)" was interpreted as "since the 2026-10-31 digest", which left a single new issue (#10899).

- Older untriaged issues in the open list (for example #10881, #10880, #10875, #10866) were not re-triaged here; they were either covered by earlier digests or are out of scope.
- **Layer label:** the rules mention a layer label (`RAC`, `S2`), but the repo has no `S2` label. I proposed it rather than substituting `RAC`.
- **External contributor requests:** the rules do not say how to handle "please assign me" comments. I treated them as a maintainer decision and made no suggestion to assign.
- **Not verified by running:** the StackBlitz repro was not opened (untrusted link, not allowed), so the collapse was judged only from reading the source.
