| Issue | Severity | Reproduction? | Solvable without changes? | Would label | Would comment | Would close / duplicate of | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| (none new) | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| [#10858](https://github.com/adobe/react-spectrum/issues/10858) Virtualized Picker re-measures per option (carried over, now has fix PR) | Low to medium | StackBlitz now provided (not opened) | No; fix PR [#10886](https://github.com/adobe/react-spectrum/pull/10886) open, reporter confirms it helps | `performance`, `Picker`, `Virtualizer`, `v3` | No (maintainer already replied) | No / no duplicate | Medium |
| [#10880](https://github.com/adobe/react-spectrum/issues/10880) optimize-locales-plugin readonly `locales` (carried over) | Low | Yes (declarations) | Workaround: cast the rules | `bug`, `typescript`, `has workaround`, `good first issue` (if it exists) | Optional: point to the maintainer's invitation for a PR | No / related to open #9213 | High |
| [#10881](https://github.com/adobe/react-spectrum/issues/10881) RangeCalendar month/year picker commits range (carried over, no activity) | Medium | Yes (not run) | No | `bug`, `RangeCalendar`, `RAC` | Yes, ack | No / no duplicate | Medium |
| [#10843](https://github.com/adobe/react-spectrum/issues/10843) Autocomplete RC to stable timeline (carried over) | Low | n/a (feedback) | Partly (answered by maintainer) | `Autocomplete`, `RAC`, `question` (if it exists), maybe `needs investigation` for the ListBox API question | No (answered) | No | Low |
| [#10877](https://github.com/adobe/react-spectrum/issues/10877), [#10878](https://github.com/adobe/react-spectrum/issues/10878) Sheet (carried over, maintainer-triaged) | Medium / Low to medium | Yes (not run) | Yes (workarounds discussed) | Already labeled `Sheet`, `has workaround` | No | No | Medium |

# Issue triage digest - 2026-10-29

**Git synchronization:** Verified `/Users/danilu/dev/react-spectrum-triage` is on `triage_support`. `git fetch origin` succeeded. `git status --porcelain --untracked-files=no -- . ':!.github/triage'` showed no tracked changes, so `git merge origin/main --no-edit` ran and reported "Already up to date". `origin/main` is `a562b335e645c172ec5a940b3e47ccdadbeeaa15`. No merge conflicts. Only this digest is committed; nothing is pushed.

**Window:** Since the previous issue digest (2026-10-28, cutoff about 2026-10-28 16:40 UTC) through this run (2026-10-29 about 16:40 UTC). `gh issue list --state all --search "created:>=2026-10-28"` returned only #10877, #10878, #10880, #10881, all of which were already covered by the 2026-10-28 digest. **There are no new, untriaged issues in this window.** The newest issue number is #10881 (the PRs #10882 to #10888 were filed since; those belong to the PR digest).

**Activity on previously digested issues** (via `gh issue list --search "updated:>=2026-10-28T12:00:00Z"`):
- #10873: now **closed** (fixed by merged PR #10874). No action needed.
- #10877, #10878: now labeled `Sheet` and `has workaround` by a maintainer, who also replied (details below). The `Sheet` label I proposed on 2026-10-28 now exists.
- #10880: maintainer `devongovett` replied inviting a PR.
- #10858: fix PR #10886 opened by `nwidynski`; reporter confirmed it works.
- #10843: maintainer reply (details below); first digested 2026-10-23.
- #10881: no activity since filing, still unlabeled.
- #10570: already labeled (`bug`, `ssr`, `RAC`), updated 2026-10-28, not re-triaged.

**Evidence limits:** GitHub reads used only `gh issue list|view` and `gh pr list`. No writes, no gists, no pushes. Nothing from any issue was executed, installed, checked out or opened, and no links were fetched (the StackBlitz in #10858 was not opened). Statements below about code behavior come from issue and maintainer comment text, not from running anything.

**Observation (not an action):** #10878's reporter replied that a ref callback and `autoFocus` both run in the commit before `usePreventScroll` installs its `focus` override, and that focusing in `useEffect` does work. The maintainer's suggested `ref` workaround therefore doesn't work as stated; the effect-based one does. If anyone follows up on #10878, the effect-based workaround should be the one recommended.

---

## New issues

None.

---

## Carried over (activity since last digest)

These are listed so the "Would have done" feedback loop stays complete; nothing here is a fresh triage unless stated.

### #10858 Virtualized Picker recalculates its layout several times for each visible option

Link: https://github.com/adobe/react-spectrum/issues/10858 (author `denodell`, still unlabeled, 5 comments)

**Status:** `nwidynski` asked for a StackBlitz (2026-10-27 15:54 UTC), the reporter supplied one, and `nwidynski` opened fix PR [#10886](https://github.com/adobe/react-spectrum/pull/10886) (2026-10-28 17:43 UTC). Reporter replied: "It's cut the number of style and layout operations down to about a quarter of what they were before for the 250-option Picker!" Related open PR [#10872](https://github.com/adobe/react-spectrum/pull/10872) ("fix: batch virtualizer item measurements") targets the same code, so the two PRs overlap (PR triage should reconcile).

**Would have done**
- **Labels:** add `performance`, `Picker`, `Virtualizer`, `v3` (as proposed in 2026-10-27; unchanged). Severity low to medium: a measurable perf cost on large lists, no functional break.
- **Comment:** no comment (maintainer already responded and linked the fix).
- **Close / link:** none; keep open until #10886 (or #10872) merges, then it closes via the PR.
- **Other:** none.
- **Confidence:** medium. Would change if the maintainers decide #10886 supersedes #10872.
- **Feedback prompt:** whether the `performance` label exists and should be used for this.

### #10880 optimize-locales-plugin: `turbopack()` rules fail `NextConfig` type-check

Link: https://github.com/adobe/react-spectrum/issues/10880 (author `felzab`, unlabeled, 1 comment)

**Status:** `devongovett` (2026-10-28 22:33 UTC): "If so, we'd accept a PR for this", for changing `locales: readonly string[]` to `locales: string[]` in the declaration.

**Would have done**
- **Labels:** `bug`, `typescript`, `has workaround` (cast the rules), plus `good first issue` if that label exists (a maintainer explicitly accepts a PR for a one-line type change).
- **Comment:** none needed; optionally "Thanks! A PR changing the `locales` type to a mutable `string[]` is welcome."
- **Close / link:** none; related to open #9213.
- **Other:** none.
- **Confidence:** high.
- **Feedback prompt:** whether to apply `good first issue` when a maintainer invites a PR.

### #10881 RangeCalendar: opening the month/year picker commits the in-progress range

Link: https://github.com/adobe/react-spectrum/issues/10881 (author `ogogorev`, unlabeled, 0 comments, no activity since filing)

**Status:** unchanged from the 2026-10-28 digest. Still a plausible bug with steps and a docs example. A search for fix PRs found none (#10841 is about the year picker looping at 9999, unrelated).

**Would have done**
- **Labels:** `bug`, `RangeCalendar`, `RAC` (severity medium).
- **Comment:** short ack that the steps are clear and that it looks like the picker's focus/blur or popover open ends the range selection; say a maintainer will look. No code claims beyond that.
- **Close / link:** none.
- **Other:** `needs investigation` is optional.
- **Confidence:** medium. Would change after reading the `useRangeCalendar` source for the commit trigger (not done in this run).
- **Feedback prompt:** whether an ack-only comment is wanted when no cause was verified.

### #10843 Autocomplete: timeline for stable release

Link: https://github.com/adobe/react-spectrum/issues/10843 (feedback issue, unlabeled, 1 comment)

**Status:** `devongovett` (2026-10-28 23:22 UTC): "I think we can move it along soon... there aren't any significant blockers." On exposing `shouldUseVirtualFocus` on RAC `ListBox`: "I'm unsure about this. The team will discuss."

**Would have done**
- **Labels:** `Autocomplete`, `RAC`, `question` (if it exists). A `needs investigation` or equivalent for the `ListBox` virtual-focus API question, if the team uses one for API discussions.
- **Comment:** no comment (answered).
- **Close / link:** none; keep open until the team decides on the `shouldUseVirtualFocus` question or splits it into a separate feature request.
- **Other:** consider asking the reporter to file the `ListBox` virtual-focus request as a separate feature request so the RC-to-stable question can be closed.
- **Confidence:** low.
- **Feedback prompt:** whether feedback issues like this should be split into a separate feature request.

### #10877 and #10878 Sheet issues (labeled by a maintainer)

Links: https://github.com/adobe/react-spectrum/issues/10877, https://github.com/adobe/react-spectrum/issues/10878 (author `oztune`; both now `Sheet`, `has workaround`)

**Status:** #10877: `devongovett` says this is more a TanStack Router issue, recommends the `data-scroll-restoration-id` workaround and filing upstream. #10878: `devongovett` suggests focusing from a ref callback; the reporter replied that this runs before `usePreventScroll`, which still scrolls, while focusing in `useEffect` doesn't.

**Would have done**
- **Labels:** none to add; both already have `Sheet` and `has workaround`. For #10878, consider `needs investigation` unless the team has decided it's a won't-fix.
- **Comment:** for #10878 only, confirm that the `useEffect` focus workaround is the supported one and the ref-callback variant doesn't avoid the scroll.
- **Close / link:** none. #10877 could be closed as "external (TanStack Router)" if the maintainer wants; I would not close without their say.
- **Other:** none.
- **Confidence:** medium.
- **Feedback prompt:** whether #10878 stays open as a docs/limitation note or is closed as won't-fix.

---

## Rule feedback

- **No new issues:** the scope ("created in the last 24 hours, not triaged") produced an empty set. I still listed carried-over issues with new activity, because every issue needs a "Would have done" block; if empty days should just say "none", say so.
- **Label existence:** I did not re-run `gh label list`; `performance`, `good first issue`, `question`, `typescript`, `Virtualizer`, `Autocomplete` were assumed to exist, as in earlier digests. Verify before applying.
- **#10881 root cause not verified:** I did not read `useRangeCalendar` / `RangeCalendar` source this time, so cause claims are limited to the issue text.
- **Unlabeled-but-answered issues:** #10858, #10843 and #10880 have maintainer replies but no labels. The rules don't say whether such issues still count as "untriaged".
- **Overlapping PRs (#10872 and #10886)** fix the same Virtualizer measurement problem; PR digest territory, flagged only.
