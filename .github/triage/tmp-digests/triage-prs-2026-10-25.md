# PR triage digest, 2026-10-25 (read-only draft)

- Branch: `triage_support`; `git fetch origin` run, `origin/main` is `338cf2e194` and was already merged ("Already up to date", no conflicts).
- Scope: open, non-draft, non-bot PRs created since the last digest (2026-10-24 ~16:56 UTC), without `ai reviewed`. One PR found. (#10850 and #10848 were covered in the 2026-10-24 digest.)
- Nothing was run, checked out, or posted. All claims come from reading `gh pr view|diff|checks`, issue text, and `origin/main` source. Behavior and test claims were reasoned from the diff, not verified by running.

## Summary

| PR | Complexity | Red flags | Would label | Would comment | Would close / duplicate of | Confidence |
| --- | --- | --- | --- | --- | --- | --- |
| [#10852](https://github.com/adobe/react-spectrum/pull/10852) DateField: move overflowing digit to next segment | Medium | CLA check failing; behavior change in shared `useDateSegment` (also affects TimeField hours); no maintainer sign-off on the issue; no `@adobe/react-spectrum` / S2 coverage | `ai reviewed`, `needs signoff`, `medium impact`, `risk` | CLA reminder; ask team/author about time-segment scope | Would not close; no duplicate found | Medium |

---

## #10852 - fix: move overflowing digit to the next DateField segment

Author: dilipsaroj (external, AI-assisted per PR body). 4 files, +140/-0 (23 lines of source in `packages/react-aria/src/datepicker/useDateSegment.ts`, 117 lines of tests in RAC `DateField`, `DateRangePicker`, `TimeField` tests). Labels: none. Complexity: **Medium** (one source file, but a behavior change in a shared hook that backs RAC DateField/TimeField/DateRangePicker, RSP v3 `DatePickerSegment`, and S2 date fields; so I did not apply the full low-complexity red-flag pass).

**Summary.** When a typed digit makes a segment's value exceed its max (e.g. `32` for day, `13` for month), `useDateSegment` now keeps the previously typed digits and calls `focusManager.focusNext()`, handing the overflowing key to the next segment via a module-level `WeakMap<FocusManager, string>` that the next segment's `onFocus` consumes by calling its own `onInput`. Typing `532026` gives `5/3/2026` (was `5/2/yyyy`). If there is no next segment, the old replace behavior is kept.

**Issue verification.** Closes [#10849](https://github.com/adobe/react-spectrum/issues/10849) (open, no labels, created 2026-10-23 by yoeun-pen-zocdoc). Expected: `532` renders `5/3/2` and `13` in month renders `1/3/yyyy`. On `origin/main`, `useDateSegment.ts` has `if (segment.maxValue !== undefined && numberValue > segment.maxValue) { segmentValue = parser.parse(key); }`, i.e. the segment is replaced by only the new key, which is the cause the issue describes. The diff produces exactly the issue's expected outputs, and the PR's tests assert them (`532026`, `13`, `1132`).

**Issue discussion.** Only comment is the PR author announcing the PR. No maintainer has weighed in on whether this is the desired behavior, and the issue reporter notes this was previously closed as "wontfix" in their own app. Candidate for **needs signoff** (listed separately for feedback).

**Already solvable?** No. There is no prop or doc to change segment-overflow behavior (checked `useDateSegment.ts` on `origin/main`; there is no option). Not a `has workaround` case.

**API / compatibility.**
- No new/renamed/removed props, exports, or types. No DOM, class name, `data-*`, or CSS variable changes.
- **Behavior change (needs API/behavior review):** applies to every numeric segment, including time. The author says so explicitly: typing `13` in a 12-hour hour segment now gives `1:3_` instead of `3:__`, and 24h `25` in hour now yields hour `2` + minute `5`. The author offers to restrict to date segments. Consumers (and existing user muscle memory/tests) relying on "replace with last digit" will see different results. Should be decided by the team.
- Behavior also now crosses field boundaries in `DateRangePicker` (digit moves from start field into end field), because both fields share a `FocusManager`.
- If the next segment is non-numeric (e.g. `dayPeriod` or `era`), the handed-off digit is silently dropped by that segment's `onInput`, while the previous segment keeps its value. Not tested; worth a maintainer glance.

**Code review notes (from reading the diff).**
- New `pendingKeys` `WeakMap` set/deleted synchronously around `focusNext()`; relies on the next segment's `onFocus` firing synchronously. This is true for DOM focus in React, but is a coupling between two `onInput`/`onFocus` paths and is worth a look (re-entrancy: handed-off key can itself trigger `focusNext()` in the next segment).
- No disabled checks (`eslint-disable`, `@ts-ignore`, `as any`) and no timing hacks (`setTimeout`, `rAF`, etc.) in the diff.
- Accessibility: no ARIA changes, keyboard-only flow, focus moves forward only as it already did. No regression spotted. Screen reader announcement when digits are split across segments is not discussed. The PR checklist leaves the accessibility item unchecked.

**Test quality.** 9 new cases in RAC `DateField.test.js` (it.each over `532026`, `13`, `1132`; `onChange` emits full date; editing an existing date; "digits that fit" regression guard; ja-JP last-segment case), `DateRangePicker.test.js` (start → end field), and `TimeField.test.js` (`135` → `1:35`, then `p` → `Time(13, 35)`). They use real `user.click`/`user.keyboard` interaction and assert rendered segment text and focus, which matches the issue scenario. Reasoning from the diff, the overflow cases should fail on `origin/main` and pass with the change. Gaps: no `@adobe/react-spectrum` (v3) or S2 tests, no story, no docs update (checklist boxes unchecked; PR says existing stories cover it). Not run, per rules.

**CI / CLA.** `Adobe CLA Signed?` check: **fail** (`https://opensource.adobe.com/cla.html`). All CircleCI jobs (lint, test, test-ssr, typecheck, storybook, etc.), `Kodiak`, `labeler`, `commit` pass.

**Security.** Does not touch workflows, `package.json`, lockfiles, or build config. No needs-security-review flag. No prompt-injection content seen in the PR or issue.

**Duplicates.** Searched PRs for the issue number and for "DateField segment overflow"; only #10852 matches #10849. A broader issue search for related older reports hit a GitHub API connection error once and a second query returned nothing, so older "wontfix"/related issues (mentioned by the reporter) could not be confirmed.

### Would have done

- **Labels:** add `ai reviewed` (digest covered it); `needs signoff` (behavior change to shared hook with no team agreement on the issue, and scope question on time segments); `medium impact` (broad, but edge-case typing flow); `risk` (touches shared hook used by RAC, RSP, and S2; plausible side effects for time/range fields). `small review` would not apply. `regression`/`patch worthy`: none. Labels needing creation: `ai reviewed`, `needs signoff`, `medium impact`, `risk` (per prompt file, may not exist yet).
- **Comment (draft, not posted):**
  > Thanks for the contribution! The `Adobe CLA Signed?` check is failing. Please sign the CLA at https://opensource.adobe.com/cla.html so we can move forward.
  >
  > Also, this change applies to all numeric segments, including time (e.g. typing `13` in a 12-hour hour field now gives `1:3_` instead of `3:__`) and across the start/end fields of a `DateRangePicker`. The team will want to confirm whether that scope is desired, or whether it should be limited to date segments, before review.
- **Close / link:** none. Not a duplicate; keep open.
- **Other:** escalate to the team for sign-off on the intended behavior (date-only vs. date+time; cross-field in range pickers; dropped digit when the next segment is `dayPeriod`/`era`) on #10849 before a detailed code review. No assignment.
- **Confidence:** medium. Would become high on "needs signoff" if a maintainer confirms the behavior is undesired for time fields; would drop `needs signoff` if the team has already agreed on the approach somewhere not visible on the issue.
- **Feedback prompt:** Is applying the behavior change to time segments and cross-field range pickers a reason to require `needs signoff`, or should a bug with a clear reporter-provided expectation go straight to review?

---

## Rule feedback

- Complexity: a 23-line source change was classified **Medium** (rather than Low) because it changes behavior in a shared hook across all layers. The "roughly < 50 lines, one package" rule would call it Low; the "behavior changes in shared hooks" rule says Medium. Judgment call; please confirm.
- "Needs signoff" criterion is still ambiguous: here the issue is a plausible bug report with an explicit expected behavior but no maintainer comment.
- The scope "since the last digest" was interpreted as after the 2026-10-24 PR digest commit (eca43580ee, 09:56 PDT); #10850/#10848 were excluded as already covered, even though neither carries an `ai reviewed` label (labels are only proposed, never applied).
- One `gh search issues` call failed with a connection reset, so related-issue duplicate search is partial.
