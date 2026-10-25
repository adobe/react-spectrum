| Issue | Severity | Reproduction? | Solvable without changes? | Would label | Would comment | Would close / duplicate of | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| None: no new issues in the window | n/a | n/a | n/a | n/a | n/a | n/a | High |

# Issue triage digest - 2026-10-25

**Git synchronization:** Verified `/Users/danilu/dev/react-spectrum-triage` is on `triage_support`. `git fetch origin` succeeded. `git status --porcelain --untracked-files=no -- . ':!.github/triage'` showed no tracked changes, so `git merge origin/main --no-edit` ran and reported "Already up to date". `origin/main` is `338cf2e1940e395c899e79b7ac09eb0de6b1cea7`, already contained in the branch (HEAD before this commit: `d376bdf45a46e015935be0c6e2d05dc15d2faebf`). No merge conflicts. Only this digest is committed; nothing is pushed.

**Window:** Since the previous issue digest (2026-10-24, cutoff about 2026-10-24 17:30 UTC) through this run (2026-10-25 16:50 UTC). `gh issue list --state all --search "created:>=2026-10-23"` returned six issues, #10838, #10839, #10843, #10844, #10846 and #10849. All six were created before the previous cutoff and are already covered in the 2026-10-23 and 2026-10-24 digests. **No new issues were opened in this window, so there is nothing new to triage and no per-issue "Would have done" blocks.**

**Evidence limits:** GitHub reads used only `gh issue list|view`, `gh pr view`. No writes, no gists, no pushes. Nothing from any issue or PR was executed, checked out, or opened.

---

## Status of previously digested issues (no action beyond what earlier digests proposed)

| Issue | State / labels | Activity since last digest |
| --- | --- | --- |
| #10838 | Open, no labels | One comment by maintainer `snowystinger` (2026-10-23, before last digest). No change. |
| #10839 | Open, no labels | None. |
| #10843 | Open, no labels | None. |
| #10844 | Open, no labels | None. |
| #10846 | Open, `bug` | Label added by a maintainer on 2026-10-24 (already noted in the last digest). |
| #10849 | Open, no labels | **New:** community PR #10852 by `dilipsaroj` (2026-10-25) claims to fix it. |

### #10849 follow-up: community PR opened

Link: https://github.com/adobe/react-spectrum/issues/10849

`dilipsaroj` (association NONE) commented: "I've opened #10852 with a fix for this. When the typed digits go over a segment's maximum (e.g. `32` for a day or `13` for a month), the earlier digits are now kept and the extra digit goes into the next segment. So `532026` gives `5/3/2026` and `13` gives `1/3/yyyy`."

PR #10852, "fix: move overflowing digit to the next DateField segment", is open and non-draft. It changes `packages/react-aria/src/datepicker/useDateSegment.ts` and adds tests in `DateField.test.js`, `DateRangePicker.test.js` and `TimeField.test.js`. It is handled by the PR triage, not here. Context from the 2026-10-24 digest: the current behavior (new key replaces the segment when the combined value exceeds the max) is intentional overflow handling, so the question of whether this is a bug or an enhancement still needs a maintainer decision before the PR is reviewed.

**Would have done** (update to the 2026-10-24 proposal, no new issue triage):
- **Labels:** none new. The 2026-10-24 proposal (`bug` or enhancement, `DateField`, `RAC`, `S2`, `needs investigation`) stands. Nothing is applied.
- **Comment:** no comment. A maintainer reply on the issue should wait for the product decision on the intended behavior.
- **Close / link:** none. Keep open. A fix PR exists (#10852), so it would auto-close on merge only if the PR body has a closing keyword (not checked).
- **Other:** route PR #10852 through the PR triage digest. Flag that a significant behavior change to typing may need a maintainer or design call before review.
- **Confidence:** medium. Would change if maintainers confirm the current overflow behavior is deliberate.
- **Feedback prompt:** should a community PR changing intentional typing behavior be reviewed before the bug-vs-enhancement decision is made?

---

## Rule feedback

- The scope says "since the last digest". I used the previous digest's cutoff (2026-10-24 17:30 UTC) and found no new issues, so I wrote a short digest instead of skipping. It would help to state whether a no-op day should still produce and commit a digest file.
- The rules ask for "Would have done" on every issue. With no new issues, I included only one follow-up block for #10849 because it had new activity. It is not clear whether activity on already-digested issues is in scope.
- I did not verify whether PR #10852 has a closing keyword linking #10849, because I only read PR metadata and not its body.
