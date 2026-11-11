# PR triage digest — 2026-10-31

> Presentation-only revision of the original digest. This is not fresh triage: findings, labels, comments and closures remain historical proposals, not executed actions or current authorization.

## At a glance

- 4 PRs assessed in the original run; these are historical recommendations, not fresh readiness checks.

## Analyzed PRs

### [#10892](https://github.com/adobe/react-spectrum/pull/10892) — Popovers above the iOS keyboard

**Decision:** Not ready: await maintainer reproduction and on-device verification.

**Complexity:** Medium

**Impact / severity:** Not assessed in the original run

**Merge risk:** medium

#### What matters

- Recorded geometry explains the zero-height result and is captured by fixture-level tests.
- The reduced repro and fix were not confirmed on iOS; shared positioning and overscroll behavior still need review.

#### Would have done

**Labels (proposed)**

- `ai-reviewed` (triage done, with the reproduction gap recorded)
- `merge-risk: medium` (shared overlay positioning for all popovers, fix not reproduced by a maintainer or verified on-device)
- `waiting for maintainer` (the author answered snowystinger's repro request
- a maintainer must assess it).
- Existing optional alternative: `mobile testing` if the team wants device verification tracked.


**Maintainer next step**

- No automated comment was proposed; any explicitly optional comment remains optional in the appendix.

### [#10890](https://github.com/adobe/react-spectrum/pull/10890) — RangeCalendar picker focus

**Decision:** Ready for substantive review, with the expanded-trigger tradeoff beside the decision.

**Complexity:** Medium

**Impact / severity:** Not assessed in the original run

**Merge risk:** medium

#### What matters

- The portal/expanded-trigger guards prevent early range commits in the tested month-picker flow.
- An expanded non-modal trigger can suppress a legitimate blur commit; the focus-scope alternative needs a maintainer choice.

#### Would have done

**Labels (proposed)**

- Proposed `ai-reviewed`: historical scoped triage, not approval.
- `merge-risk: medium` (shared hook behavior change used by RangeCalendar and DateRangePicker in RAC/S2/v3, plus the disclosed non-modal tradeoff)
- `ready for review` (see below). No `small review` since it changes shared blur behavior despite its size.


**Maintainer next step**

- **Historical proposal:** no `needs API review`.
- No automated comment was proposed; any explicitly optional comment remains optional in the appendix.

### [#10889](https://github.com/adobe/react-spectrum/pull/10889) — Turbopack locale array type

**Decision:** Historically ready for review; already approved, so the realistic next step is merge.

**Complexity:** Low

**Impact / severity:** Not assessed in the original run

**Merge risk:** low

#### What matters

- Only the output array becomes mutable; readonly inputs and runtime behavior remain unchanged.
- The plugin is excluded from repository type checks; standalone Next/TypeScript validation is author-reported.

#### Would have done

**Labels (proposed)**

- Proposed `ai-reviewed`: historical scoped triage, not approval.
- `merge-risk: low` (one-line type-only change, maintainer-suggested, no runtime effect)
- `small review` (low complexity)
- Proposed `ready for review`: original component/scope classification.


**Maintainer next step**

- No automated comment was proposed; any explicitly optional comment remains optional in the appendix.

### [#10893](https://github.com/adobe/react-spectrum/pull/10893) — Contributor templates

**Decision:** Do not add another readiness marker; a maintainer merge/process decision is next.

**Complexity:** Low

**Impact / severity:** Not assessed in the original run

**Merge risk:** low

#### What matters

- The docs/templates impose more explicit problem detail and a required StackBlitz field.
- Two approvals exist; typo nits and the policy-labeling judgment remain, with low historical confidence.

#### Would have done

**Labels (proposed)**

- Proposed `ai-reviewed`: historical scoped triage, not approval.
- `merge-risk: low` (templates and docs only, nothing shipped)
- `small review` (low complexity).
- Keep existing `rsp-core`.


**Maintainer next step**

- No automated comment was proposed; any explicitly optional comment remains optional in the appendix.

## Evidence and verification appendix

### #10892 — Evidence and verification

Author: kokoskiwi (external, `NONE`), created 2026-10-29. 3 files, +78/-3: `calculatePosition.ts` (+8/-2), and tests in `calculatePosition.test.ts` and `useOverlayPosition.test.tsx`. Closes [#10891](https://github.com/adobe/react-spectrum/issues/10891).

No labels. Complexity: **Medium** (shared `@react-aria` overlay positioning, localized change).

AI-assisted (the body says "prepared with Codex. A second agent reviewed the exact diff; human contributor review remains pending").



#### Summary

`getMaxHeight` used `visualViewport.offsetTop` for the top and bottom of the viewport bounding rect. The PR replaces it with the top returned by the existing `getContainerDimensions(document.body, visualViewport)`, which is `max(0, pageTop - scrollTop)` (and has the pinch-zoom handling).
The reported iOS 26.5 Simulator values (`pageTop` 466, `offsetTop` 310, scrollTop 466, viewport height 404, trigger top 214) make `offsetTop` disagree with `pageTop - scrollTop` (0), clamping a top popover's `max-height` to 0.



#### CI / CLA

all checks green. CLA check passes now (yihuiliao asked on the PR to sign it and re-run; it passes).



#### Issue verification ([#10891](https://github.com/adobe/react-spectrum/issues/10891))

The diff matches the issue's own proposed solution ("Use the visual viewport origin already calculated by `getContainerDimensions`"). On `origin/main`, `getMaxHeight` indeed uses `(visualViewport?.offsetTop ?? ...)` for both `top` and `bottom` (lines ~351-363) while `getContainerDimensions` uses `visualViewport.pageTop - scroll.top` (line ~142), so the inconsistency described exists in the code.
By reading, the change would remove the zero `max-height` for the recorded geometry. Could not verify behavior on a device.



#### Issue discussion

- snowystinger (2026-10-30): "Can you make a Stackblitz or point to a specific example in our docs to reproduce? I've been unable to reproduce." The same maintainer left a PR review: "Need more info for reproduction ... so we can verify the changes."
- kokoskiwi replied with a reduced repro repo and StackBlitz import link (not opened, per the rules), but states: "I have not yet confirmed that this new standalone page reaches the same inconsistent Safari viewport state". The PR also says it "has not yet been retested on the Simulator".
- So the failure is still unconfirmed by anyone other than the reporter, and the maintainer's ask is only partly answered.
- No maintainer comment is contradicted.


#### Red flags

- No timing hacks, disabled checks, non-null-assertion silencing (the test uses `window.visualViewport!` in test code only), or ARIA/keyboard changes.
- Test quality: two unit tests (calculation-level with `calculatePositionInternal`, plus a `useOverlayPosition` render test) that pin the recorded geometry. They mock `visualViewport`, `clientHeight`, and `scrollTop`, so they are fixture-level rather than real-browser tests; the real-world scenario (iOS keyboard) cannot be tested in jsdom.
- The reasoning that they fail before the change holds (old code would use `offsetTop` 310 and clamp to 0). `window.visualViewport` is recreated in `beforeEach`, so the `Object.assign` does not leak. Nit: the new `useOverlayPosition` test has no blank line before the following `it`.
- Behavior risk: `getMaxHeight` now computes the viewport top as `max(0, pageTop - scrollTop)`. When `offsetTop` and `pageTop - scrollTop` agree (all non-buggy browsers) the result is identical except that negative values (overscroll/bounce) are now clamped to 0.
- Since this is the shared path for every popover (Select, Menu, ComboBox, Tooltip...), it deserves a maintainer's eye even though the change is small.
- Also reads `document.body` explicitly; the PR argues this covers body-scrolling documents. Plausible from `getContainerDimensions` (it reads `documentElement.scrollTop || containerNode.scrollTop`).
- Possible conflict with open [#10556](https://github.com/adobe/react-spectrum/pull/10556) (nwidynski, "feat: rework scroll utilities and fix layout bugs"), which also edits `calculatePosition.ts`. Not a duplicate (different purpose), but whichever merges second may need a rebase.


#### Already solvable with existing code

none found. `placement`/`maxHeight`/`containerPadding` props exist, but none address a wrong viewport origin.



#### API/compat

no public API, DOM, class or default changes.



#### Duplicates

none found (searched open and closed PRs for `visualViewport`, `calculatePosition`, #10891, iOS keyboard popover).

#### Original confidence and decision-changing evidence

medium. Would go up to high-for-ready if a maintainer reproduces on iOS (or accepts the recorded geometry as sufficient) and confirms the fix.

#### Original summary caveats

Bug not yet reproduced by a maintainer (snowystinger: "Need more info for reproduction"); fix not verified on a real iOS device; AI-assisted (Codex), human review pending; touches shared overlay positioning used by every popover; overlaps in file with open #10556


#### Historical action and comment detail (not executed)

#### Readiness rationale
Would have added `ready for review`: **no**. Missing: maintainer confirmation that the bug reproduces (the reduced repro is itself unconfirmed on iOS), and on-device verification of the fix.

CLA, linked issue, tests, and CI are fine.
#### Historical close / link proposal
none.
#### Historical other proposal
none. No `needs API review`.
- **Historical comment proposal:** no comment.

### #10890 — Evidence and verification

Author: costajohnt (external, `CONTRIBUTOR`), created 2026-10-29. 2 files, +54/0: `useRangeCalendar.ts` (+7) and a test in `RangeCalendar.test.tsx` (+47). Closes [#10881](https://github.com/adobe/react-spectrum/issues/10881).

No labels. Complexity: **Medium** (behavior change in a shared hook used by RAC, S2 and v3 `RangeCalendar` and `DateRangePicker`; no API change).

AI-assisted ("Drafted with Claude Code; I reviewed the change and the tests myself"), checklist filled in.



#### Summary

`useRangeCalendar`'s `onBlur` runs `commitBehavior` whenever focus leaves the calendar's DOM. Because the month/year `Select` popover is portaled, React bubbles blur events from the trigger and from options inside the popover to the calendar, and `relatedTarget` is outside the calendar's DOM, so the range was committed as start = end (closing the `DateRangePicker` popover too).
The PR returns early from the handler when the blur target is outside the calendar's DOM (portal bubbling) or when the target has `aria-expanded="true"` (trigger moving focus into its popup).



#### CI / CLA

all checks green; CLA passes.



#### Issue verification ([#10881](https://github.com/adobe/react-spectrum/issues/10881))

On `origin/main`, `onBlur` is exactly `if ((!e.relatedTarget || !nodeContains(ref.current, e.relatedTarget)) && state.anchorDate) commitBehaviorMapping[commitBehavior]()`, which matches the issue's described behavior. By reading, the two new guards would skip the commit for both blur paths the PR describes, and `getEventTarget` is already imported in the file on `origin/main`.
The scenario in the issue (RangeCalendar docs example with month/year pickers) matches the test. Not run.



#### Issue discussion

The issue has no maintainer comments. One comment (sadeghbarati, 2026-10-31) says "Related #9430" and, on the PR, pastes an alternative AI-generated approach that walks `focusScopeTree` (an `isElementInChildOfElement` helper in `FocusScope.tsx`) to detect that `relatedTarget` is a portaled child of the calendar.
That is a suggestion, not a competing PR, and it is a larger change touching `FocusScope`. Related open issue [#9430](https://github.com/adobe/react-spectrum/issues/9430) ("Feature to select another month or year (nested popover) inside DateRangePicker while start range is selected") describes the same symptom (and links #8850, #3311); this PR would address it too, so a maintainer may want to link/close it with this PR.



#### Red flags

- No disabled checks (`as Element` is a narrow cast from `getEventTarget`, not `as any`), no timing hacks, no a11y regressions (keyboard behavior for tabbing away and `pointerup` unchanged, per description and diff).
- Test quality: good. It renders a real `RangeCalendar` with a `Select`-based `CalendarMonthPicker` in a portaled `Popover`, clicks a start date, opens the picker, chooses "Jun", and picks the end date, asserting `onChange` is not called early and ends with `{start: Apr 8, end: Jun 10}`.
- This is user-interaction level, and by reading it would fail on `main` (blur commit fires `onChange` with Apr 8 to Apr 8 when the popover opens). It does not cover `DateRangePicker` or `CalendarYearPicker` (same code path).
- The PR says four `CalendarDateTime` time-field tests fail identically on `main` locally; I could not verify that.
- Tradeoff, disclosed in the PR: if a non-modal disclosure-style button inside the calendar is left expanded and the user tabs out, the range is no longer committed on that blur (any blur whose target has `aria-expanded="true"`, including an expanded combobox input in the calendar). This is a judgment call a maintainer should accept or reject; a narrower check (e.g. verifying the popup is a descendant of the trigger via `aria-controls`, or a focus-scope based check like the one suggested in the comment) would be an alternative.
- Docs not updated (none needed; no API change).


#### Already solvable with existing code

none found; `commitBehavior` options (`select`/`reset`/`clear`) all go through the same `onBlur`, so none avoid this.



#### API/compat

no API or default changes. Behavior change only in the portal/expanded-trigger blur cases.



#### Duplicates

none among open PRs (searched RangeCalendar, useRangeCalendar, CalendarMonthPicker, #10881).

#### Original confidence and decision-changing evidence

medium. Would drop to low if a maintainer prefers the focus-scope approach or considers the non-modal tradeoff unacceptable.

#### Original summary caveats

Behavior change in shared `useRangeCalendar` blur handling; documented tradeoff for non-modal expanded triggers; AI-assisted (Claude Code); also relates to open #9430; no maintainer has weighed in on the approach yet


#### Historical action and comment detail (not executed)

#### Readiness rationale
Would have added `ready for review`: **yes**. CLA signed, issue linked, understandable description, integration-style test, CI green, no unresolved red flags.

Caveat for the reviewer: choose between the `aria-expanded` guard and the focus-scope approach from the comment.
#### Historical close / link proposal
none. Suggest the maintainer link #9430 as related (or close it once this merges).
#### Historical other proposal
none; no `needs API review`.
- **Historical comment proposal:** no comment.

### #10889 — Evidence and verification

Author: costajohnt (external, `CONTRIBUTOR`), created 2026-10-29. 1 file, +1/-1: `packages/dev/optimize-locales-plugin/LocalesPlugin.d.ts`. Closes [#10880](https://github.com/adobe/react-spectrum/issues/10880).

No labels. Complexity: **Low**.

AI-assisted ("Drafted with Claude Code; I reviewed the change and the verification myself"). Already **APPROVED** by devongovett (2026-10-29 18:42 UTC).



#### Summary

Changes `TurbopackRule.loaders[0].options.locales` from `readonly string[]` to `string[]` so that spreading `optimizeLocales.turbopack(...).rules` into Next's `NextConfig` type-checks (Next's `TurbopackLoaderOptions` is `Record<string, JSONValue>` where `JSONValue[]` is mutable). The `Options` input type stays `readonly string[]`, so callers can still pass `as const` arrays.



#### CI / CLA

all checks green; CLA passes.



#### Issue verification ([#10880](https://github.com/adobe/react-spectrum/issues/10880))

The diff is exactly the change proposed in the issue and then in devongovett's comment ("If I understand correctly, you're saying this change works? ... If so, we'd accept a PR for this.").
On `origin/main`, line 28 of `LocalesPlugin.d.ts` has `options: {locales: readonly string[]}`, matching the issue. `LocalesPlugin.js` passes `locales` through unchanged (`options: {locales}`), so no runtime change. The TS2322 error is plausibly gone by reading (not run).
Slight type-honesty note: the declaration now says the plugin's returned array is mutable while it is the caller's (possibly readonly) array passed through; harmless since it is never mutated and consistent with the maintainer-approved suggestion.



#### Issue discussion

Only devongovett's comment above; the PR follows it exactly.



#### Red flags

none blocking. No tests: type-only `.d.ts` change, and the PR says the plugin directory is excluded from `yarn check-types`, so CI cannot catch regressions here.
The author's verification was done standalone against `next@16.4.2` and TypeScript 6.0.3 (self-reported, unverified by me). Accepting no automated test is reasonable for a type-only fix.
No a11y, timing, disabled-check, or workaround concerns.



#### Already solvable with existing code

a user could cast (`as any`) in their own config, but that is a workaround, and the maintainer already agreed the declaration should change.



#### API/compat

public type change in a published package's declaration (`@react-aria/optimize-locales-plugin`), but strictly loosening the output type to what Next accepts; inputs unchanged. Not breaking, no API review needed.



#### Duplicates

none (searched optimize-locales PRs; only merged earlier work).

#### Original confidence and decision-changing evidence

high.

#### Original summary caveats

None blocking. Type-only `.d.ts` change with no automated check (plugin dir excluded from `yarn check-types`); AI-assisted (Claude Code)


#### Historical action and comment detail (not executed)

#### Readiness rationale
Would have added `ready for review`: **yes**, though it is already approved, so the realistic next step is merge.
#### Historical close / link proposal
none.
#### Historical other proposal
none.
- **Historical comment proposal:** no comment.

### #10893 — Evidence and verification

Author: yihuiliao (maintainer, `MEMBER`), created 2026-10-29. 3 files, +74/-28: `.github/ISSUE_TEMPLATE/Bug_Report.yml`, `.github/PULL_REQUEST_TEMPLATE.md`, `CONTRIBUTING.md`. Label already present: `rsp-core`.

No linked issue. Complexity: **Low** (docs/templates only; no source).

Already **APPROVED** by devongovett and snowystinger. Body: "Just throwing out some ideas.

Open for discussion".



#### Summary

Adds a Summary section and a Release impact section to the PR template, shortens the checklist, adds a "Describing the problem" section to `CONTRIBUTING.md` (PRs without an issue must carry the issue-level detail), and in the bug report form adds a required StackBlitz link field, moves "Steps to Reproduce" right after "Current Behavior", and changes Version to a textarea listing packages and versions.



#### CI / CLA

all checks green; CLA passes. rspbot posted build links and an Agent Skills diff (generated docs, unrelated to the change).



#### Red flags

- Touches `.github/ISSUE_TEMPLATE` and the PR template (not workflows, `package.json`, or build config), so not flagged for security review. Nothing in `.github` parses the template text (grep), so no automation depends on the removed checklist wording.
- Product/process decision embedded: the bug form now requires a StackBlitz link (`required: true`) for every bug report, which raises the bar for reporters. The description says "open for discussion", but two maintainers have already approved.
- Nits: `CONTRIBUTING.md` has "relevant[bug report]" (missing space before the link); "packages(s)" in the Version description; "reproduction steps ;" stray space in the template comment. The PR body itself still uses the old template (empty "Test Instructions"/"Your Project", unchecked checklist, no `Closes`), which is understandable for a template PR.
- No tests/stories needed. A11y not applicable.


#### Already solvable with existing code

n/a.



#### API/compat

no code or public API change. Process change for contributors: a stricter bug-report form, and PRs with no issue must restate the issue content.



#### Duplicates

none found.

#### Original confidence and decision-changing evidence

low (this is a process/policy PR; the right labeling for approved maintainer PRs is not defined by the rules).

#### Original summary caveats

None. Docs/template-only.

Minor typos; open-for-discussion framing



#### Historical action and comment detail (not executed)

#### Readiness rationale
Would have added `ready for review`: **no**. It is a maintainer-authored, already-approved discussion/idea PR, so the next step is a decision to merge, not a code review; adding the label would be noise.

Missing nothing from the author's side except the typo nits.
#### Historical close / link proposal
none.
#### Historical other proposal
none.
- **Historical comment proposal:** no comment.

## Run notes

The following records the original run, including its operational history and policy feedback; it does not describe actions taken during this presentation-only revision.

- Branch: `triage_support`. `git fetch origin` run. `git merge origin/main --no-edit` returned "Already up to date" (`origin/main` = `a562b335e6`, "fix(s2): restore page.css declaration (#10874)"); no conflicts, no tracked local changes. HEAD before the digest commit: `a2707f0254`.
- Scope: open, non-draft, non-bot PRs created since the last PR digest (2026-10-29 09:36 PDT / 16:36 UTC) without `ai-reviewed`: **#10889, #10890, #10892, #10893**. There is no 2026-10-30 PR digest in `tmp-digests/`; #10886 and #10888 were already covered on 2026-10-29 and are not repeated.
- Nothing in the window was a bot PR or a draft.
- Nothing was run, checked out, or posted. All claims come from `gh pr view|diff|checks`, `gh api` GETs, `gh issue view`, and `origin/main` source read with `git show origin/main:<path>`.
- Correctness claims are reasoned from the diffs, not verified by running anything. CI log pages were not opened.
- All CI checks on all four PRs are green (the only non-pass output was a transient `gh` network error while listing checks on #10890; a re-run showed no failures).
- No prompt-injection content found. None of the four PRs touches CI workflows, `package.json`, lockfiles, or build config, so none is flagged **needs security review**.
- (#10893 edits `.github/ISSUE_TEMPLATE` and the PR template but not workflows. I grepped `.github` for anything that parses the template text and found nothing but the template itself.)
- Labels that do **not** exist in the repo yet and would be needed: `merge-risk: low`, `merge-risk: medium`, `ai-reviewed`, `waiting for maintainer`. (`small review`, `ready for review`, `on hold`, `needs API review`, `has workaround` exist.)
`*` = label does not exist in the repo yet.
#### Feedback for #10892

#10892: Is the recorded geometry (`pageTop` 466 vs `offsetTop` 310) enough to accept this without a maintainer-run iOS reproduction, or should it stay `waiting for maintainer`?
#### Feedback for #10890

#10890: Is a blanket `aria-expanded="true"` blur-skip acceptable, or should the guard be narrowed to a popup that is a descendant of the expanded trigger?
#### Feedback for #10889

#10889: For type-only fixes in directories excluded from `check-types`, is no test acceptable, or should these require a type test?
#### Rule feedback


- **Maintainer-authored and already-approved PRs:** `pull-requests.md` scope only excludes drafts and bots. #10893 is a maintainer PR with two approvals, and #10889 already has an approval. Step 5 and the `ready for review` meaning ("next step is substantive code review or re-review") do not say what to do with already-approved PRs.
- I proposed `yes` for #10889 (approved by a maintainer, small) and `no` for #10893 (policy PR); please clarify the rule.
- **Complexity boundary:** #10890 (7 source lines in one hook) and #10892 (8 source lines) fit the "Low" size threshold but touch shared hooks/overlay positioning used across many components. I classified both as Medium by the "behavior changes in shared hooks" rule.
- A tie-break rule (size vs. blast radius) would help, since only Low gets the full red-flag review (I did the red-flag review for all four anyway).
- **Bugs a maintainer cannot reproduce (#10892):** there is no label for "reproduction pending from the reporter". I used `waiting for maintainer` (the author already responded).
- If the team wants `waiting for author` when a repro is still insufficient, say so.
- **Type-only fixes in directories excluded from CI type-checking (#10889):** the "Test quality" rule does not say whether a missing test is a red flag there. I treated it as acceptable and noted the lack of automation.
- **Verifying claims:** I could not run anything, so claims such as "four DatePicker tests fail the same on `main`" (#10890), the author's `tsc` verification (#10889), and the iOS geometry (#10892) are unverified. The reduced repro links in #10892 were not opened, per the rules.
- **Digest gap:** no digest exists for 2026-10-30, so this one covers everything created since the 2026-10-29 digest was committed. If a PR was created between the two digests and then closed or merged it would not be listed (none seen).
- **Label set:** the labels `merge-risk: *`, `ai-reviewed`, `waiting for maintainer` do not exist yet (the repo has `waiting on author` rather than `waiting for author`), so the bot rollout needs them created or the names aligned.
#### Feedback for #10893

#10893: For maintainer-authored PRs that are already approved, should the digest still propose `ready for review` or skip the readiness marker?
