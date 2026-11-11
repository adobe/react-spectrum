# Issue triage digest — 2026-10-31

> Presentation-only revision of the original digest. This is not a fresh triage run; no historical proposal is executed or newly authorized by this rewrite.

## At a glance

- Five reports; animation rejection was proposed as a duplicate of #10772.
- Observer batching and Separator were ready; iOS geometry and motion API work were not.
- Readiness was historical judgment, not executed test or device evidence.

## Issues

### [#10891](https://github.com/adobe/react-spectrum/issues/10891) — iOS keyboard popover geometry

**Decision:** Not ready for review: confirm the Safari viewport reproduction first.
**Impact / severity:** High on iOS.
**Complexity:** Not assessed in the original run.
**Confidence:** medium.

#### What matters

- The mismatch between container and visual-viewport origins is plausible from source.
- The author has not confirmed the standalone reproduction reaches max-height zero; a maintainer could not reproduce.
- The custom boundary may be decisive, and the open PR tests recorded geometry rather than a device.

#### Would have done

**Labels (proposed)**

- add `Popover` (the popover is the affected component)
- `Overlay Positioning` (the code is in `calculatePosition.ts`)
- `browser bug` (WebKit-specific viewport values)
- `needs investigation` (maintainer cannot reproduce)
- `ai-reviewed`. Not `regression` (no earlier-working version).

**Maintainer next step**

- Confirm bad-state geometry on iOS and default boundary behavior; also check html scrolling before reviewing #10892.
- Historical comment proposal only: maintainer-reviewed wording is retained in the #10891 evidence appendix; nothing was posted by this revision.

### [#10895](https://github.com/adobe/react-spectrum/issues/10895) — Animation rejection prevents unmount

**Decision:** Historical proposal: close as a duplicate of #10772, not as newly fixed.
**Impact / severity:** High.
**Complexity:** Not assessed in the original run.
**Confidence:** high.

#### What matters

- The canonical issue and #10783 already track rejection of the animation finished promise.
- The inspected implementation still catches Promise.all rejection without completing unmount.
- Competing regression attributions were not resolved; they do not change the duplicate linkage.

#### Would have done

**Labels (proposed)**

- `ai-reviewed` only (the canonical issue carries `bug`). Not `regression` here since it is a duplicate
- the canonical issue should get it if confirmed.

**Maintainer next step**

- Link #10772/#10783; preserve downstream iPhone details on the canonical report and consider a reviewer nudge separately.
- Historical comment proposal only: maintainer-reviewed wording is retained in the #10895 evidence appendix; nothing was posted by this revision.

### [#10897](https://github.com/adobe/react-spectrum/issues/10897) — Sheet observer entry batching

**Decision:** Ready for review: keep open as actionable observer-batching work.
**Impact / severity:** Medium.
**Complexity:** Not assessed in the original run.
**Confidence:** medium.

#### What matters

- Only the first observer entry is read, which can miss a later ratio-zero entry.
- The supplied CPU-throttling logs are stochastic, not independently reproduced.
- Processing only the last entry can miss an earlier entering state; ordered processing is the safer proposal.

#### Would have done

**Labels (proposed)**

- `bug` — reported defect.
- `RAC` — reported component layer.
- `Sheet` — affected sheet component.
- `ai-reviewed` (Sheet and `bug` for the stuck state; the issue is in RAC). Not `has workaround` (the workaround depends on internals).

**Maintainer next step**

- Review an ordered-entry fix with a simulated batched callback test; relate #10813 and #10877 without duplicate closure.
- Historical comment proposal only: maintainer-reviewed wording is retained in the #10897 evidence appendix; nothing was posted by this revision.

### [#10894](https://github.com/adobe/react-spectrum/issues/10894) — Separator element semantics

**Decision:** Ready for review: fix the final element passed to the separator hook.
**Impact / severity:** Low.
**Complexity:** Not assessed in the original run.
**Confidence:** high.

#### What matters

- The default hr gains a redundant role, affecting validators rather than established assistive-technology behavior.
- Defaulting the original prop to hr would remove semantics from the later vertical div.
- The original run offers elementType="hr" as a workaround, with optional workaround labeling.

#### Would have done

**Labels (proposed)**

- `bug` — reported defect.
- `RAC` — reported component layer.
- `Separator` — affected separator component.
- `good first issue` (trivial and well-scoped, a maintainer already proposed the edit)
- `ai-reviewed`. Not `accessibility` (it does not affect users). `has workaround` is optional (passing `elementType="hr"`).

**Maintainer next step**

- Pass the resolved element to the hook and test horizontal hr and vertical div; retain the caution on the maintainer suggestion.
- Historical comment proposal only: maintainer-reviewed wording is retained in the #10894 evidence appendix; nothing was posted by this revision.

### [#10898](https://github.com/adobe/react-spectrum/issues/10898) — Sheet enter/exit speed

**Decision:** Not ready for review: remeasure with #10815 and decide the motion API.
**Impact / severity:** Low.
**Complexity:** Not assessed in the original run.
**Confidence:** medium.

#### What matters

- The leading-edge enter-delay change is already merged; reported measurements may predate it.
- RAC 1.22.1 contents were not verified, and configurable duration/easing remains unavailable.
- Native smooth scrolling chooses speed; any new API must respect reduced motion.

#### Would have done

**Labels (proposed)**

- `enhancement` — requested behavior or API change.
- `RAC` — reported component layer.
- `Sheet` — affected sheet component.
- `needs API review` (new prop vs CSS variable)
- `ai-reviewed`. `needs decision` would fit but does not exist in the repo yet.

**Maintainer next step**

- Request current-nightly measurements and an API/design decision before choosing a new animation mechanism.
- Historical comment proposal only: maintainer-reviewed wording is retained in the #10898 evidence appendix; nothing was posted by this revision.

## Evidence and verification appendix

### #10891 — Evidence and verification

[Issue](https://github.com/adobe/react-spectrum/issues/10891), opened 2026-10-29 by `kokoskiwi`, v3.53.1 / RAC 1.22.1, iOS 26.5 Safari simulator.

Open PR [#10892](https://github.com/adobe/react-spectrum/pull/10892) by the same author ("Closes #10891").

- **Claim:** with the keyboard open, `getContainerDimensions` uses `pageTop - scrollTop` (0) as the viewport top, but `getMaxHeight` uses `visualViewport.offsetTop` (310), so a top popover clamps to `max-height: 0`.
- **Source check:** consistent with the code on `origin/main`. `packages/react-aria/src/overlays/calculatePosition.ts:140` says "Uses pageTop/pageLeft instead of offsetTop/offsetLeft because WebKit misreports those during pans", while the `boundingRect` in `getMaxHeight` still reads `visualViewport?.offsetTop` at lines 353 and 357.

- So the two calculations do use different origins; I could not verify that this reaches zero on a real device.
- **Duplicates:** searched issues for "visualViewport popover max-height iOS keyboard" and PRs for "popover iOS keyboard max-height visual viewport"; no other match besides #10892.
- **Reproduction:** maintainer `snowystinger` (2026-10-30): "Can you make a Stackblitz or point to a specific example in our docs to reproduce?

- I've been unable to reproduce." The author then linked a repro repo and a StackBlitz import, but wrote: "I have not yet confirmed that this new standalone page reaches the same inconsistent Safari viewport state, so please treat it as a focused reproduction candidate." The steps depend on a specific layout (fixed composer dock as `triggerRef`, a custom `boundaryElement` capped at the visible viewport bottom, a scrolled page, keyboard open).

- That is an unusual setup: the custom `boundaryElement` may matter, so this may be an integration edge case rather than the default Popover.
- **Severity:** high for affected users (a keyboard-open popover shows no choices and cannot scroll them), no workaround listed, though it only seems to hit WebKit with a specific layout.

- Not accessibility-specific by itself, but it blocks a keyboard-driven flow on iOS.
- **Regression:** no version info; not claimed.
- **Observation:** the PR is already open and the issue says its tests pin the recorded geometry rather than a real device.

- A maintainer with an iPhone should confirm before merging. `maxHeight` comes from `getContainerDimensions(document.body, ...)` per the PR body, so check the `html`-scrolling case too.

#### Original readiness qualifications

no. Missing: a confirmed repro on a real iOS device or simulator (the author says it is untested), and confirmation that the default Popover (without a custom `boundaryElement`) is affected.

#### Confidence and decision-changing evidence

medium. A confirmed device repro would raise it to high and make `ready for review` yes; a finding that it needs the custom `boundaryElement` would lower the severity to medium.

#### Historical proposed comment (not posted by this revision)

"Thanks for the report and the fix PR.

We looked at `calculatePosition.ts`: `getMaxHeight` reads `visualViewport.offsetTop` for the bounding top (lines 353 and 357), while the container dimensions use `pageTop` (line 140, with a comment that WebKit misreports `offsetTop`), so the mismatch you describe is plausible.

We still need a reproduction that reaches the bad viewport state in Safari.

Could you confirm whether the repro repo does so on a device or simulator, and whether it also happens with the default `boundaryElement`?

Please also let us know if you can share a video." (maintainer to review wording)

#### Historical closure and escalation proposals

- Close / link: no close.
- Close / link: Link to PR #10892.
- Other: ask a maintainer with iOS Safari access to check the repro; no API review needed.

### #10895 — Evidence and verification

[Issue](https://github.com/adobe/react-spectrum/issues/10895), opened 2026-10-31 by `Sifat07`, react-aria 3.53.1, iOS Safari (downstream report; the trigger is unconfirmed).

- **Duplicate:** this is [#10772](https://github.com/adobe/react-spectrum/issues/10772) ("Overlay stays open when its exit animation is cancelled (regression of #8786 in 3.53.0)", open, labeled `bug`), with fix PR [#10783](https://github.com/adobe/react-spectrum/pull/10783) (open, `REVIEW_REQUIRED`).

- The diff of #10783 replaces `Promise.all([startPromise, ...animations.map(a => a.finished)])` with `Promise.allSettled(...)`, which is exactly this issue's proposed solution, and adds a Dialog test with a rejecting `finished`.

- Maintainers already said so in the thread: `snowystinger` ("This looks like a duplicate...") and `nwidynski` linking #10772 / #10783.
- **Source check:** `packages/react-aria/src/utils/animation.ts:138` on `origin/main` still has `Promise.all(...)` followed by `.catch(() => {})`, so the bug is real until #10783 lands.
- **Severity:** high, because an overlay (Sheet menu, Modal, Popover) stays mounted forever with no error; but it is already tracked.
- **Regression:** the issue says it regressed with #10674 (Sheet commit), whereas #10772 says regression of #8786 in 3.53.0. I could not verify which is correct; not needed for the duplicate decision.

#### Original readiness qualifications

no (duplicate). Missing: nothing, it is just redundant.

#### Confidence and decision-changing evidence

high. It would change if #10772 turns out to be a different failure (for example not `finished` rejection).

#### Historical proposed comment (not posted by this revision)

"Thanks for the thorough report.

This is a duplicate of #10772, and the `Promise.allSettled` change you propose is in #10783.

Closing in favor of #10772; please add any extra detail there (for example the iPhone Safari Sheet case)."

#### Historical closure and escalation proposals

- Close / link: would close as a duplicate of #10772 (the one to keep, it has the fix PR).
- Close / link: Nobody closed it yet; maintainers already identified it as a duplicate.
- Other: the PR #10783 has had no review since 2026-10-22; a nudge to a reviewer (outside the issue) may be worthwhile since this keeps reappearing.

#### Original assessment qualification

- [#10895](https://github.com/adobe/react-spectrum/issues/10895) `useAnimation` never unmounts when `finished` rejects

### #10897 — Evidence and verification

[Issue](https://github.com/adobe/react-spectrum/issues/10897), opened 2026-10-31 by `egaitan-godaddy`, RAC 1.22.1 and nightly `3.0.0-nightly-2691598d3-261008`, Chrome, macOS 26 and Ubuntu CI.

- **Related, not a duplicate:** [#10813](https://github.com/adobe/react-spectrum/issues/10813) ("Sheet stays exiting over the page when its IntersectionObserver's last report never comes", closed as not planned on 2026-10-27). `nwidynski` commented: "This sounds similar to #10813, which was closed as not planned, until it can be reproduced reliably.

- If you want to have this issue worked on, please look into what fails under CPU throttling and why." This issue's text says it is "the root cause of #10813 ...

- It isn't missing", and supplies exactly that missing piece (two entries in one callback, the ratio 0 entry is second) with timestamps.
- **Source check:** `packages/react-aria-components/src/Sheet.tsx:288` on `origin/main` reads `let entry = entries[0];`, then uses it for `setExpanded`, `isVisible.current` and the close check (`hasEntered ... intersectionRatio <= 0` then dispatches `react-aria-sheet-close`).

- IntersectionObserver delivers entries in time order and a batch can hold several entries for the same target, so reading only the first can miss the newest state.

- The claim is consistent with the code; I could not reproduce it (no running).
- **Reproduction:** stochastic with CPU throttling (10 of 40 runs per the reporter), but the log lines are specific. This is enough detail to act on without a runnable repro.
- **Solvable without changes:** no. The reporter's workaround (dispatching `react-aria-sheet-close` on `scrollend`) relies on an internal event, so it should not be recommended; do not add `has workaround`.
- **Suggested fix note:** the issue proposes `entries[entries.length - 1]`.

- Iterating every entry in order would be safer, because `hasEntered ||= entry.intersectionRatio > 0` should also see an earlier entering entry in the same batch; with only the last entry, a first batch of "entering, then gone" would never set `hasEntered`.

- Edge case, but worth a mention to the implementer.
- **Severity:** medium.

- An invisible overlay stays in the DOM and blocks all clicks on the page, but it needs slow frames to hit.

- Also related: #10877 (stuck exiting by a different cause, already labeled `Sheet`).
- **Regression:** not claimed.

#### Original readiness qualifications

yes.

It has a clear description, current behavior, a log showing the cause, a one-line proposed fix, version info and environment.

Missing: a deterministic repro, but a unit test can simulate it by calling the observer callback with two entries (as the issue notes).

#### Confidence and decision-changing evidence

medium. It would go to high if a maintainer confirms the batching behavior on throttled Chrome, or low if `entries` can only ever contain one entry for the observed element in the supported browsers.

#### Historical proposed comment (not posted by this revision)

"Thanks, this is useful.

It supplies the root cause #10813 was missing: `Sheet.tsx` reads only `entries[0]`, so when two entries for the content arrive in one callback, the ratio 0 entry is ignored.

We would accept a PR that handles all entries in the callback (in order, so `hasEntered` also sees earlier entries) with a unit test that invokes the observer callback with a batch."

#### Historical closure and escalation proposals

- Close / link: no close.
- Close / link: Link to #10813 (closed, same symptom) and mention #10877 as a different cause of the same stuck state.
- Other: none; no API change.

### #10894 — Evidence and verification

[Issue](https://github.com/adobe/react-spectrum/issues/10894), opened 2026-10-30 by `ludwighogstrom`, RAC 1.21.1.

- **Source check:** confirmed on `origin/main`. `packages/react-aria-components/src/Separator.tsx:68-69` has `let {elementType, ...} = props; let Element = elementType || 'hr';` and line 76-80 passes the original `elementType` (undefined) to `useSeparator`. `packages/react-aria/src/separator/useSeparator.ts:46` adds `role: 'separator'` when `props.elementType !== 'hr'`, so an undefined `elementType` yields `<hr role="separator">`.
- **Maintainer's suggestion (`snowystinger`):** change the destructuring to `let {elementType = 'hr', ...} = props;`. **This would break the vertical case.** After that change, `useSeparator` receives `'hr'` for all default separators, including `orientation="vertical"`, but the component then swaps `Element` to `'div'` (`Separator.tsx:70-72`, `if (Element === 'hr' && orientation === 'vertical') Element = 'div'`).

- A `<div>` would get no `role="separator"` and no `aria-orientation="vertical"` from `useSeparator`, which is an accessibility regression for vertical separators.

- The issue's own proposed solution is safer: pass `elementType: Element` (the final element, after the vertical swap) to `useSeparator`.

- This is from reading the code; not run.

- A test for the vertical case should accompany the fix.
- **Duplicates:** searched "Separator role hr redundant"; none found.
- **Severity:** low.

- The redundant role is harmless to assistive technology; it only trips HTML validators (`no-redundant-role`).

- Workaround: pass `elementType="hr"` (documented in the issue).
- **Regression:** not claimed.

#### Original readiness qualifications

yes. Clear problem, expected/actual, version, and root cause.

#### Confidence and decision-changing evidence

high. It would change only if the vertical swap is removed.

#### Historical proposed comment (not posted by this revision)

"Thanks.

Confirmed in `Separator.tsx`: the original `elementType` (undefined) is passed to `useSeparator`, which only skips the role for `'hr'`.

One caution on defaulting `elementType` in the destructuring: the component later switches `Element` to `div` for `orientation="vertical"`, and `useSeparator` would then no longer add `role="separator"` / `aria-orientation="vertical"` to that div.

Passing `elementType: Element` (the final element) to `useSeparator`, as you proposed, avoids that.

A PR with a test for both the horizontal `<hr>` and vertical `<div>` cases is welcome."

### #10898 — Evidence and verification

[Issue](https://github.com/adobe/react-spectrum/issues/10898), opened 2026-10-31 by `egaitan-godaddy` (GoDaddy), RAC 1.22.1 (the issue's own measurements; no version given for them), feature request.

- **Already partly addressed:** possible solution 1 (start the enter scroll at the sheet's leading edge) matches [#10815](https://github.com/adobe/react-spectrum/pull/10815) "fix: sheet enter offscreen travel" (merged, commit `e36b8c2869` is in `origin/main`; closes #10808).

- Its summary: "Jump to where the sheet's leading edge meets the viewport before smooth scrolling, so the animation is instant after clicking the trigger." `nwidynski` pointed this out.

- The reporter's table (150 to 200 ms to first visible) may predate it; the latest release listed is RAC 1.22.0 (2026-10-09), which is before the 2026-10-22 merge, so the fix is likely only in nightlies.

- I could not verify the 1.22.1 contents.
- **Remaining ask:** control over duration/easing (options 2 and 3: a JS-driven animation or an `animationDuration` / CSS custom property).

- The current code uses native `scrollTo` with `behavior: 'smooth'` (`Sheet.tsx:1133`, `1172`), so the browser decides the speed; a prop would need a design/API decision and a different animation mechanism (`nwidynski` mentions the Animation API approach from carousel exploration).

- Related: #10854 (viewport-dependent drag distance, open) and #10877 (scroll changes during smooth scroll leave the sheet stuck), which the reporter cites as a reason not to drive the scroll themselves.
- **Duplicates:** searched "sheet animation duration speed" for issues; no match.
- **Solvable without changes:** the part about the delay may already be fixed on `main`; the configurable speed is not available.
- **Severity:** low (enhancement, no accessibility impact; note `prefers-reduced-motion` should stay respected in any new duration API).

#### Original readiness qualifications

no. Missing: measurements on a current nightly (with #10815), and an API/design decision on whether duration should be configurable at all.

#### Confidence and decision-changing evidence

medium. It would change if the nightly still shows ~500 ms with nothing on screen (then the issue stays a bug, not just an enhancement).

#### Historical proposed comment (not posted by this revision)

"Thanks for the measurements.

The 'first visible' delay is what #10815 addresses (the enter scroll now starts where the sheet's leading edge meets the viewport); it merged on 2026-10-22, after the latest release, so please retest on a nightly and share new numbers.

Whether Sheet should expose duration or easing (an `animationDuration` prop or a CSS variable) is a separate API question that would need a design/API review, and it interacts with how the scroll is animated today (native smooth scroll).

We'll leave this open for that discussion."

#### Historical closure and escalation proposals

- Close / link: no close.
- Close / link: Link #10815, #10854, #10877.
- Other: escalate to the team for the API question (`needs API review`); `spectrum design` is not needed unless motion tokens are involved.

## Run notes

#### Git synchronization

Verified `/Users/danilu/dev/react-spectrum-triage` is on `triage_support`. `git fetch origin` succeeded. `git status --porcelain --untracked-files=no -- . ':!.github/triage'` showed no tracked changes, so `git merge origin/main --no-edit` ran and reported "Already up to date". `origin/main` is `a562b335e645c172ec5a940b3e47ccdadbeeaa15` (committed 2026-10-28T16:53:07Z).

No merge conflicts.

Only this digest is committed; nothing is pushed.

#### Window

The last issue digest was 2026-10-29 (cutoff about 2026-10-29 16:40 UTC); there were no issue digests for 10-30 or 10-31, so this run covers everything created since then. `gh issue list --state open --search "created:>=2026-10-28"` returned #10891, #10894, #10895, #10897, #10898 as new, all unlabeled.

The other results (#10877, #10878, #10880, #10881) were already digested. (#10892 and #10893 are PRs.)

#### Evidence limits

GitHub reads used only `gh issue view|list`, `gh pr view|list|diff`, `gh search` and `gh label list`.

No writes, no gists, no pushes.

Nothing from any issue was executed, installed, checked out or opened, and no links were fetched (the repro repo and StackBlitz in #10891 were not opened).

Code claims below come from reading `origin/main` source in this checkout, not from running it.

The label set was checked with `gh label list`: `ai-reviewed`, `regression`, `needs decision`, `waiting for author` and `waiting for maintainer` do not exist in the repo yet (`waiting on author` does); `Sheet`, `Separator`, `Popover`, `Overlay Positioning`, `needs API review`, `has workaround` do.

#### Rule feedback — #10891

is a plausible-from-source but unconfirmed WebKit bug worth `ready for review` before a maintainer reproduces it on iOS?

#### Rule feedback — #10895

should duplicates of an issue that already has an open fix PR be closed right away, or left to the maintainer who flagged them?

#### Rule feedback — #10897

is a code-level root cause plus log enough to reopen the ground of a not-planned issue, or should a deterministic repro still be required?

#### Rule feedback — #10894

is it right to correct a maintainer's suggested fix in the comment (here, the vertical-separator regression), or should that go to the maintainer privately?

#### Activity on previously digested issues (no re-triage)

[#10880](https://github.com/adobe/react-spectrum/issues/10880) optimize-locales-plugin readonly `locales`

- Status since 2026-10-29: Fix PR [#10889](https://github.com/adobe/react-spectrum/pull/10889) opened; maintainer had invited a PR
- Digest note: No action beyond the earlier digest

[#10881](https://github.com/adobe/react-spectrum/issues/10881) RangeCalendar month/year picker commits range

- Status since 2026-10-29: Fix PR [#10890](https://github.com/adobe/react-spectrum/pull/10890) opened; `sadeghbarati` linked related [#9430](https://github.com/adobe/react-spectrum/issues/9430) (2026-10-31); still unlabeled
- Digest note: Would still add `RangeCalendar`, `bug`, `RAC`; worth checking #9430 for a duplicate

[#10858](https://github.com/adobe/react-spectrum/issues/10858) Virtualized Picker re-measure

- Status since 2026-10-29: Reporter confirmed fix PR #10886 works

[#10878](https://github.com/adobe/react-spectrum/issues/10878) Sheet native autoFocus

- Status since 2026-10-29: Maintainers agreed an interceptor in an insertion effect could work
- Digest note: None; the earlier note about the effect-based workaround still stands

[#10877](https://github.com/adobe/react-spectrum/issues/10877) Sheet scroll position leaves it exiting

- Status since 2026-10-29: No new comments

[#10843](https://github.com/adobe/react-spectrum/issues/10843) Autocomplete stable timeline

- Status since 2026-10-29: Answered by maintainer (2026-10-28)

#### Rule feedback — #10898

should a feature request that is partly fixed on `main` be labeled `needs API review` right away, or wait for the author's re-measure?

### Rule feedback from the original run

- **Missing labels:** `ai-reviewed`, `regression`, `needs decision`, `waiting for author` and `waiting for maintainer` are used in `issues.md` but do not exist in the repo (`waiting on author` does).

- I used the issue-file names; the maintainer should confirm whether to create them or map to the existing ones.
- **Duplicate of an open issue with a fix PR (#10895):** the rules say "only recommend closing", so I proposed closing in favor of #10772 even though a maintainer already called it a duplicate.

- A rule on whether the bot should post the duplicate comment when a maintainer already has would help.
- **Judgment call (#10897):** treated an issue that supplies the root cause of a closed not-planned issue as new work rather than a duplicate. The rules do not say what to do with a closed-as-not-planned predecessor.
- **Judgment call (#10894):** I flagged a vertical-separator regression in a maintainer's proposed fix.

- The rules say suggested solutions must avoid accessibility regressions, but do not say how to treat maintainer comments; nothing here was run, only read.
- **Not verifiable:** whether #10891 reproduces on a real iOS device, whether 1.22.1 contains #10815 (#10898), and whether the stochastic Sheet failure (#10897) reproduces; none of these can be run under the no-execution rule.
- **Window:** there were no issue digests for 10-30 and 10-31, so the window spans two days. #10891 was created 2026-10-29 21:59 UTC, after the previous digest's cutoff but before the run date.
