| Issue | Severity | Reproduction? | Solvable without changes? | Would label | Would comment | Would close / duplicate of | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [#10849: DateField does not consistently move to next segment](https://github.com/adobe/react-spectrum/issues/10849) | Low | Exact keystrokes given; no sandbox. Confirmed by reading source, not executed | No supported workaround in the library | Would apply `bug`, `DateField`, `RAC`, `S2`, `needs investigation` | Would acknowledge, explain the cause and ask whether this should be an enhancement | Would keep open; no duplicate found | Medium |

# Issue triage digest - 2026-10-24

**Git synchronization:** Verified `/Users/danilu/dev/react-spectrum-triage` is on `triage_support`. The first `git fetch origin` failed (could not reach the remote, "correct access rights" error). A retry later succeeded. `git status --porcelain --untracked-files=no -- . ':!.github/triage'` showed no tracked changes, so `git merge origin/main --no-edit` ran and reported "Already up to date". `origin/main` is `338cf2e1940e395c899e79b7ac09eb0de6b1cea7`, already contained in the branch (HEAD before this commit: `eca43580ee939604c8c6048b3d2bbb8bfa91c9f1`). No merge conflicts. Only this digest is committed; nothing is pushed.

**Window:** Since the previous issue digest's cutoff (2026-10-23 18:51:46 UTC) through this run (2026-10-24 17:30 UTC). `gh issue list --search "created:>=2026-10-23"` returned six issues. Five (#10838, #10839, #10843, #10844, #10846) were created before the cutoff and are covered in the 2026-10-23 digest. Only #10849 is new and unlabeled. Note: #10846 now carries a `bug` label that was added after the previous digest, so a maintainer has already looked at it.

**Evidence limits:** GitHub reads used only `gh issue list|view`, `gh pr list` and `gh search`/`gh api` GET. No writes, no gists, no pushes. Nothing from the issue was executed or opened. The source analysis is from reading `packages/react-aria/src/datepicker/useDateSegment.ts` on the merged branch. Behavior was not verified by running it.

---

## #10849: DateField does not consistently move to next segment

Link: https://github.com/adobe/react-spectrum/issues/10849
Author: yoeun-pen-zocdoc. Created 2026-10-23 21:20 UTC. Version reported: v1.22.0, Chrome, macOS. No labels, no comments.

**Report:** Typing `5`, `3`, `2` in a month/day/year DateField gives `5/2/yyyy`. The author expects `5/3/2`, where the `2` starts the year segment. Same for month: `13` gives `3/dd/yyyy` instead of `1/3/yyyy`. Quote: "It dropped the `3` and replaced it with `2`... To the user, the component swallowed their input."

**Reproduction:** Not a project or sandbox, but the steps are exact and short ("Place cursor in month segment / Type `5` / Type `3` / Type `2`"). Not run here per the security rules.

**Source check (explains the behavior):** In `useDateSegment.ts` `onInput` (lines ~190-250):
- `newValue = enteredKeys.current + key`, so day `3` then `2` gives `"32"`.
- `if (segment.maxValue !== undefined && numberValue > segment.maxValue) { segmentValue = parser.parse(key); }`: `32 > 31`, so the segment is set to the new key alone (`2`).
- The segment then advances (`Number("320") > 31`), so focus goes to the year segment and the typed `2` is not carried over.
- The same path explains month `1` then `3` (`13 > 12`): month becomes `3`, focus moves to day, and the first `1` is lost.

So this is the current, intentional overflow rule ("restart the segment with the latest digit"). The reporter wants the latest digit to start the next segment instead, when the previous digit alone was a valid committed value. That is a behavior change in `@react-aria/datepicker`, which affects RAC `DateField`/`DatePicker`, S2 `DateField`/`DatePicker`, and the v3 `DateField` that share `useDateSegment`.

**Duplicates / related (none is a duplicate):**
- #8637 (closed, completed): "DateField UX regression in entering some dates". Related area (auto-advance after leading-zero change #8447). It concerned not advancing after `01`/`1`, not overflow digits.
- #4174 (closed, completed): "Unexpected behavior with DateField auto tabbing". Related area, different complaint (advancing too early).
- #5364 (open): "Usability issues in DateField/DatePicker". Umbrella feedback issue on segment typing. A maintainer may prefer to link this report there.
- #10683 (open): "DateRangePicker: keystroke completing a field is lost when the field blurs in the same event". Also about a lost keystroke, but in DateRangePicker with a different cause (zero handling and `setValue` display reset).
- Open PRs touching `useDateSegment`: only #10842 (12-hour time with no day period crash), unrelated.

The reporter's context says a similar bug was filed against their app and closed as "wontfix" because it is in a dependency. That is a claim about their own tracker, not verifiable here.

**Severity:** Low. Data entry is still possible (arrow keys or retyping), no crash or data loss, not an accessibility barrier by itself. It affects keyboard users who type dates quickly, and the first digit is silently dropped. It could be raised to medium if maintainers see it as a usability regression for common dates (3rd, 13th..19th of the month, and months 10-12).

**Regression:** Not established. The reporter gives no earlier version where it worked. The overflow rule predates the reported version as far as the git log of the file suggests, but history was not bisected.

**Solvable without changes:** No documented option changes the auto-advance behavior. A user can press the right arrow after the `3` or type the zero-padded form (`03`, which since #8447 is ignored for leading zeros, so it may not help). None verified, so no `has workaround`.

**Would have done**
- **Labels:** Would add `DateField` (component), `RAC` and `S2` (layer; behavior lives in shared `useDateSegment`), `bug` (swallowed input is user-visible), and `needs investigation` (intended overflow rule vs. desired behavior needs a maintainer decision). Would not add `regression`, `waiting`, or `accessibility`. All labels exist in the repo.
- **Comment:**
  > Thanks for the clear report. We can see why this happens: when the typed digits form a number larger than the segment's maximum (`32` for the day, `13` for the month), the segment is currently restarted with the latest digit and focus moves on, so the earlier digit is not kept and the new digit does not start the next segment. We have not run your steps ourselves, but this matches the logic in `useDateSegment`. We'll look at whether the overflow digit should be committed to the next segment instead. In the meantime, can you confirm whether you are using `DateField` from `react-aria-components`, React Spectrum S2, or v3, and the locale and segment order? The expected result can differ between locales.
- **Close / link:** Would keep open. Would mention #5364 (umbrella usability feedback) and #8637 as related, not duplicates.
- **Other:** Would escalate to the team for a decision on whether this is a bug or an enhancement, since it changes established typing behavior shared across RAC, S2 and v3. Would not ask for a StackBlitz since the steps are minimal and match the source.
- **Confidence:** Medium. Would change to high on closing as intended behavior or on confirming the fix design. Would drop if the behavior differs from the source reading, for example because the real handler path (beforeinput vs keydown) differs.
- **Feedback prompt:** Is carrying the overflow digit into the next segment (`5/3/2`, `1/3/yyyy`) a desired change, or should the current "restart segment" rule stay and this be treated as a won't-fix?

---

## Rule feedback

- The window rule ("last 24 hours or since the last digest") was ambiguous when the previous digest's cutoff (18:51 UTC) fell inside the last 24 hours. I used the last digest's cutoff, which is the later of the two, and listed the earlier issues as already covered.
- The first `git fetch origin` failed with an access error and a retry worked. setup.md does not say what to do when fetch fails. I retried once and proceeded; the merge was a no-op either way.
- `gh search issues` with the repo inside the query string returned no results or an error; `--repo` worked. Search results are keyword-based, so a missed duplicate is possible.
- Layer labeling for a shared `@react-aria` hook is a judgment call (`RAC` plus `S2`; v3 not labeled because the `v3` label's meaning for hooks is unclear).
- The "wontfix" mention in the issue could not be checked: it refers to the reporter's own tracker.
