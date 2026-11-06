# Issue triage digest — 2026-10-29

> Presentation-only revision of the original digest. This is not a fresh triage run; no historical proposal is executed or newly authorized by this rewrite.

## At a glance

- No new issues in the original window.
- Historical follow-ups preserve maintainer replies, workarounds and overlapping PRs.

## Issues

### [#10858](https://github.com/adobe/react-spectrum/issues/10858) — Virtualized Picker measurement cost

**Decision:** Historical follow-up: keep open pending the overlapping candidate PRs.
**Impact / severity:** Low to medium.
**Complexity:** Not assessed in the original run.
**Confidence:** medium.

#### What matters

- A StackBlitz is now supplied, but was not opened.
- The reporter says #10886 cuts style/layout operations to about a quarter for 250 options.
- That claim was not reproduced; #10886 and #10872 overlap.

#### Would have done

**Labels (proposed)**

- `performance` — reported measurement cost.
- `Picker` — affected picker.
- `Virtualizer` — measurement implementation.
- `v3` (as proposed in 2026-10-27; unchanged). Severity low to medium: a measurable perf cost on large lists, no functional break.

**Maintainer next step**

- Reconcile the PRs in PR triage; no new issue comment was proposed because a maintainer already replied.
- Historical comment decision: no comment (maintainer already responded and linked the fix).

### [#10880](https://github.com/adobe/react-spectrum/issues/10880) — `turbopack()` rules fail `NextConfig` typing

**Decision:** Historical follow-up: keep open; a maintainer has invited a PR.
**Impact / severity:** Low.
**Complexity:** Not assessed in the original run.
**Confidence:** high.

#### What matters

- The proposed declaration change is from readonly to mutable locales.
- The cast remains the historical workaround.
- Optional good-first-issue labeling depends on label existence, which was not rechecked.

#### Would have done

**Labels (proposed)**

- `bug` — reported defect.
- `typescript` — type contract failure.
- `has workaround` (cast the rules), plus `good first issue` if that label exists (a maintainer explicitly accepts a PR for a one-line type change).

**Maintainer next step**

- Accept a focused type-change proposal if maintainers agree; an acknowledgment was optional, not required.
- Historical comment decision: none needed; optionally "Thanks! A PR changing the `locales` type to a mutable `string[]` is welcome."

### [#10881](https://github.com/adobe/react-spectrum/issues/10881) — Picker opening commits a range

**Decision:** Historical follow-up: keep open and acknowledge the actionable report.
**Impact / severity:** Medium.
**Complexity:** Not assessed in the original run.
**Confidence:** medium.

#### What matters

- The report is unchanged and no matching fix surfaced.
- This run did not re-read the commit trigger source.
- The likely focus/blur explanation remains provisional, not an executed diagnosis.

#### Would have done

**Labels (proposed)**

- `bug` — reported defect.
- `RangeCalendar` — affected range-selection component.
- `RAC` (severity medium).

**Maintainer next step**

- Investigate the trigger; keep any historical acknowledgment limited to the reported behavior.
- Historical comment proposal only: maintainer-reviewed wording is retained in the #10881 evidence appendix; nothing was posted by this revision.

### [#10843](https://github.com/adobe/react-spectrum/issues/10843) — Autocomplete stability and ListBox API

**Decision:** Historical follow-up: keep open until the virtual-focus API decision.
**Impact / severity:** Low.
**Complexity:** Not assessed in the original run.
**Confidence:** low.

#### What matters

- A maintainer says there are no significant stable-release blockers, not a promised date.
- The team is unsure about exposing ListBox virtual focus and will discuss it.
- The timeline answer does not resolve the concrete API request.

#### Would have done

**Labels (proposed)**

- `Autocomplete` — requested search/completion surface.
- `RAC` — reported component layer.
- `question` (if it exists). A `needs investigation` or equivalent for the `ListBox` virtual-focus API question, if the team uses one for API discussions.

**Maintainer next step**

- Consider splitting the API request so the timeline question can be closed; no additional comment was needed.
- Historical comment decision: no comment (answered).

### [#10877](https://github.com/adobe/react-spectrum/issues/10877) and [#10878](https://github.com/adobe/react-spectrum/issues/10878) — Sheet maintainer follow-up

**Decision:** Historical follow-up: leave closure to the maintainer; clarify the autofocus workaround.
**Impact / severity:** Medium / Low to medium.
**Complexity:** Not assessed in the original run.
**Confidence:** medium.

#### What matters

- Both Sheet reports now have maintainer labels and replies.
- For #10877, upstream TanStack handling and a router-specific workaround were suggested.
- For #10878, the ref callback still scrolls; the reporter says effect-based focus works.

#### Would have done

**Labels (proposed)**

- none to add
- both already have `Sheet` and `has workaround`. For #10878, consider `needs investigation` unless the team has decided it's a won't-fix.

**Maintainer next step**

- For #10878 only, confirm the effect-based focus guidance; close #10877 as external only with maintainer agreement.
- Historical comment decision: for #10878 only, confirm that the `useEffect` focus workaround is the supported one and the ref-callback variant doesn't avoid the scroll.

## Evidence and verification appendix

### #10858 — Evidence and verification

Link: https://github.com/adobe/react-spectrum/issues/10858 (author `denodell`, still unlabeled, 5 comments)

#### Status

`nwidynski` asked for a StackBlitz (2026-10-27 15:54 UTC), the reporter supplied one, and `nwidynski` opened fix PR [#10886](https://github.com/adobe/react-spectrum/pull/10886) (2026-10-28 17:43 UTC).

Reporter replied: "It's cut the number of style and layout operations down to about a quarter of what they were before for the 250-option Picker!" Related open PR [#10872](https://github.com/adobe/react-spectrum/pull/10872) ("fix: batch virtualizer item measurements") targets the same code, so the two PRs overlap (PR triage should reconcile).

#### Confidence and decision-changing evidence

medium. Would change if the maintainers decide #10886 supersedes #10872.

#### Historical closure and escalation proposals

- Close / link: none; keep open until #10886 (or #10872) merges, then it closes via the PR.

### #10880 — Evidence and verification

Link: https://github.com/adobe/react-spectrum/issues/10880 (author `felzab`, unlabeled, 1 comment)

#### Status

`devongovett` (2026-10-28 22:33 UTC): "If so, we'd accept a PR for this", for changing `locales: readonly string[]` to `locales: string[]` in the declaration.

#### Confidence and decision-changing evidence

high.

#### Historical closure and escalation proposals

- Close / link: none; related to open #9213.

### #10881 — Evidence and verification

Link: https://github.com/adobe/react-spectrum/issues/10881 (author `ogogorev`, unlabeled, 0 comments, no activity since filing)

#### Status

unchanged from the 2026-10-28 digest.

Still a plausible bug with steps and a docs example.

A search for fix PRs found none (#10841 is about the year picker looping at 9999, unrelated).

#### Confidence and decision-changing evidence

medium. Would change after reading the `useRangeCalendar` source for the commit trigger (not done in this run).

#### Historical proposed comment (not posted by this revision)

short ack that the steps are clear and that it looks like the picker's focus/blur or popover open ends the range selection; say a maintainer will look. No code claims beyond that.

#### Historical closure and escalation proposals

- Other: `needs investigation` is optional.

### #10843 — Evidence and verification

Link: https://github.com/adobe/react-spectrum/issues/10843 (feedback issue, unlabeled, 1 comment)

#### Status

`devongovett` (2026-10-28 23:22 UTC): "I think we can move it along soon... there aren't any significant blockers." On exposing `shouldUseVirtualFocus` on RAC `ListBox`: "I'm unsure about this. The team will discuss."

#### Confidence and decision-changing evidence

low.

#### Historical closure and escalation proposals

- Close / link: none; keep open until the team decides on the `shouldUseVirtualFocus` question or splits it into a separate feature request.
- Other: consider asking the reporter to file the `ListBox` virtual-focus request as a separate feature request so the RC-to-stable question can be closed.

### #10877 — Evidence and verification

Links: https://github.com/adobe/react-spectrum/issues/10877, https://github.com/adobe/react-spectrum/issues/10878 (author `oztune`; both now `Sheet`, `has workaround`)

#### Status

#10877: `devongovett` says this is more a TanStack Router issue, recommends the `data-scroll-restoration-id` workaround and filing upstream. #10878: `devongovett` suggests focusing from a ref callback; the reporter replied that this runs before `usePreventScroll`, which still scrolls, while focusing in `useEffect` doesn't.

#### Confidence and decision-changing evidence

medium.

#### Historical closure and escalation proposals

- Close / link: none. #10877 could be closed as "external (TanStack Router)" if the maintainer wants; I would not close without their say.

## Run notes

#### Git synchronization

Verified `/Users/danilu/dev/react-spectrum-triage` is on `triage_support`. `git fetch origin` succeeded. `git status --porcelain --untracked-files=no -- . ':!.github/triage'` showed no tracked changes, so `git merge origin/main --no-edit` ran and reported "Already up to date". `origin/main` is `a562b335e645c172ec5a940b3e47ccdadbeeaa15`.

No merge conflicts.

Only this digest is committed; nothing is pushed.

#### Window

Since the previous issue digest (2026-10-28, cutoff about 2026-10-28 16:40 UTC) through this run (2026-10-29 about 16:40 UTC).

`gh issue list --state all --search "created:>=2026-10-28"` returned only #10877, #10878, #10880, #10881, all of which were already covered by the 2026-10-28 digest. **There are no new, untriaged issues in this window.** The newest issue number is #10881 (the PRs #10882 to #10888 were filed since; those belong to the PR digest).

#### Activity on previously digested issues

(via `gh issue list --search "updated:>=2026-10-28T12:00:00Z"`):
- #10873: now **closed** (fixed by merged PR #10874). No action needed.
- #10877, #10878: now labeled `Sheet` and `has workaround` by a maintainer, who also replied (details below). The `Sheet` label I proposed on 2026-10-28 now exists.
- #10880: maintainer `devongovett` replied inviting a PR.
- #10858: fix PR #10886 opened by `nwidynski`; reporter confirmed it works.
- #10843: maintainer reply (details below); first digested 2026-10-23.
- #10881: no activity since filing, still unlabeled.
- #10570: already labeled (`bug`, `ssr`, `RAC`), updated 2026-10-28, not re-triaged.

#### Evidence limits

GitHub reads used only `gh issue list|view` and `gh pr list`.

No writes, no gists, no pushes.

Nothing from any issue was executed, installed, checked out or opened, and no links were fetched (the StackBlitz in #10858 was not opened).

Statements below about code behavior come from issue and maintainer comment text, not from running anything.

#### Observation (not an action)

#10878's reporter replied that a ref callback and `autoFocus` both run in the commit before `usePreventScroll` installs its `focus` override, and that focusing in `useEffect` does work.

The maintainer's suggested `ref` workaround therefore doesn't work as stated; the effect-based one does.

If anyone follows up on #10878, the effect-based workaround should be the one recommended.

#### New issues

None.

#### Carried over (activity since last digest)

These are listed so the "Would have done" feedback loop stays complete; nothing here is a fresh triage unless stated.

#### Rule feedback — #10858

whether the `performance` label exists and should be used for this.

#### Rule feedback — #10880

whether to apply `good first issue` when a maintainer invites a PR.

#### Rule feedback — #10881

whether an ack-only comment is wanted when no cause was verified.

#### Rule feedback — #10843

whether feedback issues like this should be split into a separate feature request.

#### Rule feedback — #10877

whether #10878 stays open as a docs/limitation note or is closed as won't-fix.

### Rule feedback from the original run

- **No new issues:** the scope ("created in the last 24 hours, not triaged") produced an empty set.

- I still listed carried-over issues with new activity, because every issue needs a "Would have done" block; if empty days should just say "none", say so.
- **Label existence:** I did not re-run `gh label list`; `performance`, `good first issue`, `question`, `typescript`, `Virtualizer`, `Autocomplete` were assumed to exist, as in earlier digests. Verify before applying.
- **#10881 root cause not verified:** I did not read `useRangeCalendar` / `RangeCalendar` source this time, so cause claims are limited to the issue text.
- **Unlabeled-but-answered issues:** #10858, #10843 and #10880 have maintainer replies but no labels. The rules don't say whether such issues still count as "untriaged".
- **Overlapping PRs (#10872 and #10886)** fix the same Virtualizer measurement problem; PR digest territory, flagged only.
