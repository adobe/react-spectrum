# One-off survey: open PRs that would get `ready for review`

Read-only pass over 124 open, non-draft PRs using the criteria in `pull-requests.md` step 5. Nothing was posted or labelled and no code was run. Test quality was judged from diffs and test names only.

Gate: CLA check passing, no failing CI, no conflicts, linked issue, tests for source changes, no held/waiting labels, not a duplicate, no unresolved maintainer threads, no red flags in source. 50 PRs passed the gate; 9 survived the detailed review.

## Would add `ready for review` (9)

| PR | Title | Proposed merge-risk | Notes |
|---|---|---|---|
| #10890 | RangeCalendar: keep anchor date when focus moves into month/year picker | medium | Closes #10881; regression test for the real scenario. |
| #10876 | Preserve numbering system for separator-only input | low | Closes #10875; parser and NumberField tests. Author association NONE, CLA check passes. |
| #10841 | Stop CalendarYearPicker looping at year 9999 | low | Closes #10839; only a maintainer out-of-office note. Overlaps `useCalendarYearPicker` with #10864 (not a shared issue); flag for the reviewer. |
| #10713 | Scroll auto-focused item into view in StrictMode (ComboBox) | medium | Closes #10690; touches shared `useSelectableCollection`; test checks the scroll. Uses rAF but only to fix the existing cleanup, not new. |
| #10707 | Reuse layout nodes built while scrolling in ListLayout | medium | Closes #10706; shared virtualizer code; test asserts rows laid out once. |
| #10697 | Keep custom overlay boundaries in viewport coordinates | medium | Closes #10639; browser regression tests for scroll, flip, height. Touches `calculatePosition` with #10470. |
| #10470 | Menu popover flips when user `maxHeight` can't fit | medium | Closes #10176; unit tests for flip and RTL. Touches `calculatePosition` with #10697. |
| #10629 | Use document viewport for page-scrolling LoadMoreItem | medium | Closes #10627; browser and unit tests. `setTimeout` appears only in the browser test. |

(#10842 is borderline: `useDateSegment` crash fix for fr-CM, closes #10833, large test additions. One open maintainer nit, "remove this comment" in `DateField.test.js`, makes it `waiting for author` until addressed.)

## Would not add, notable blockers among the 50 gate survivors

- **Failing or unfixed tests:** #10753, #10602, #10437 (also lint, linked issue is `needs investigation`).
- **Maintainer pushback or open question:** #10297 (maintainer doesn't want the prop exposed), #10489 (couldn't reproduce), #10861 (accessibility concern in issue discussion), #10398 (screen-reader question, enhancement), #10717 (asked to prioritize other PRs), #10757, #10781.
- **Linked issue `needs investigation`:** #10504, #10437.
- **Red flags in source:** #10828, #10819, #10795, #10704, #10696, #10649, #10623, #10650, #10357.
- **Unresolved maintainer threads:** #10783, #10771, #10723, #10715, #10714, #10710, #10628, #10619, #10595, #10535, #10362, #9983, #9967.
- **Duplicate or overlap:** #10763 (vs #10762), #10884/#10812/#10595 (same issue #10802), ComboBox cluster #10883/#10882/#10869/#10871.

## Caveats

- 13 PRs already carry `ready for review`; they were not re-evaluated here.
- CI detection used commit statuses and check runs; pending checks may be missed.
- The remaining PRs that failed the gate were excluded on mechanical criteria (CLA, CI, conflicts, labels, missing tests or linked issue) and were not individually reviewed.
