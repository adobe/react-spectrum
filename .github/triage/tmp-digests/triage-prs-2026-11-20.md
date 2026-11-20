# PR triage digest: 2026-11-20

## At a glance

- Five non-member PRs analysed, three member PRs skipped, one draft excluded.
- Focus API alternatives need a decision; the Calendar blur fix diverges from the agreed investigation, and the Activity warning fix is partial.
- The Hebrew month fix has supported regression evidence. Its unsigned CLA, and the collection PR's missing CLA result, prevent unconditional readiness.

### [#11011](https://github.com/adobe/react-spectrum/pull/11011): Imperative DateField and TimeField focus

**Decision:** Not ready for substantive review until the team chooses between this approach and the overlapping focusableRef proposal.

**Complexity:** High: changes the behavioural contract of a public DOM ref in two components.

**Impact/severity:** Medium: automatic invalid-field focus fails for form-library integrations; explicit segment refs offer a supported alternative.

**Merge risk:** High: mutates the actual outer DOM element's focus method, with unresolved compatibility and coverage questions.

#### What matters

- The [diff](https://github.com/adobe/react-spectrum/pull/11011/files) uses `Object.assign(domRef.current!, {focus() {...}})` to redirect focus into DateInput. The HTMLDivElement type and other DOM methods remain unchanged, but native focus options are not forwarded.
- [#9185](https://github.com/adobe/react-spectrum/pull/9185) addresses the same first-segment/form-library requirement through DateInput, including picker and range-picker tests. Both authors have successful CLA checks, so correctness, API direction and coverage decide the comparison.
- Devon [suggested overriding outer-element focus](https://github.com/adobe/react-spectrum/pull/9185#issuecomment-4078304477), while explicitly questioning side effects. This is a supported alternative to investigate, not an already accepted API decision.
- The new rendered-focus test covers DateField only. TimeField, native focus options, ref lifecycle and picker consistency remain uncovered; the PR explicitly excludes picker root refs.

#### Would have done

**Labels (proposed), bot-eligible additions:**

- `ai-reviewed`: this revision's analysis and limits are recorded.
- `merge-risk: high`: unresolved native-ref compatibility and competing API direction.
- `needs API review`: consumers calling an existing DOM method receive new behaviour.
- `needs decision`: choose outer-ref overriding versus DateInput focusableRef, including picker coverage.
- `has workaround`: public render state and DateSegment refs can select the first editable segment without DOM querying or locale assumptions.

**Removals:** None; preserve `RAC` and `DateField`.

**Maintainer next step:**

1. Compare with #9185. Prefer its broader tested coverage unless the team adopts the newer no-extra-ref direction; keep both open until that decision. If focusableRef is chosen, close this competing PR in its favour.
2. If overriding focus is chosen, define FocusOptions and disabled/read-only/ref-lifecycle behaviour, request TimeField coverage and document the imperative contract before consolidating the alternatives.

### [#11000](https://github.com/adobe/react-spectrum/pull/11000): Calendar-triggered NumberField blur

**Decision:** Not ready: reconcile the Calendar-only timing change with the maintainer-supported NumberField investigation and strengthen the scenario test.

**Complexity:** High: changes shared calendar focus scheduling and its interaction with another control's commit/announcement behaviour.

**Impact/severity:** Medium: corrected values are not announced on the reported pointer path; leaving the NumberField with Tab is a reported working alternative.

**Merge risk:** High: queued focus is not cancelled when focus state changes, and the wider commit-time blur problem remains.

#### What matters

- The [diff](https://github.com/adobe/react-spectrum/pull/11000/files) queues CalendarCell focus only when the active element is an INPUT. Guards check connection and ref identity, not whether that cell remains focused in state when the task runs.
- The [issue investigation](https://github.com/adobe/react-spectrum/issues/10935#issuecomment-7019186650) also identifies a plain autoFocus input as a trigger. Snowystinger [agreed to try the NumberField-side approach](https://github.com/adobe/react-spectrum/issues/10935#issuecomment-7021945937); changing CalendarCell alone does not implement that direction.
- The added test mounts an auto-focused Calendar instead of clicking a day in the existing Calendar, as the issue describes. It checks value/callback and a mocked announcement, but does not assert that the Calendar actually took focus.
- CLA is signed, but the contribution/AI-understanding checklist is unchecked. A proposed scheduler boundary can be legitimate, but it still needs lifecycle and accessibility evidence rather than treating the microtask as proof of correctness.

#### Would have done

**Labels (proposed), bot-eligible additions:**

- `ai-reviewed`: current-revision analysis completed with verification limits.
- `merge-risk: high`: uncancelled deferred focus and incomplete root-cause coverage.
- `needs decision`: should the fix live in NumberField and cover all commit-time blur triggers, or intentionally address only Calendar?
- `waiting on author`: the real pointer scenario, focus outcome and contribution-understanding confirmation remain actionable author tasks.

**Removals:** None.

**Maintainer next step:**

1. Snowystinger can reconcile this with the agreed NumberField-side experiment and the author's concerns about consumer onBlur timing.
2. Request a test clicking a day while an invalid NumberField owns focus, including actual focused element and rendered live-region evidence; cover stale queued focus/unmount and plain autoFocus input separately.
3. Request explicit confirmation of contribution and AI-understanding requirements. Do not infer rejection or misconduct from the unchecked boxes.

### [#11006](https://github.com/adobe/react-spectrum/pull/11006): Activity-hidden label warnings

**Decision:** Needs a scope decision: acceptable as a narrowly documented warning reduction, not a complete resolution of the linked issue.

**Complexity:** High: changes diagnostic lifecycle behaviour in the shared label hook used across component layers.

**Impact/severity:** Low: repeated development warnings obscure real accessibility diagnostics, but the reporter says the visible page works; no blocked user task is established.

**Merge risk:** Medium: broad hook consumers and a reveal-time false warning need attention despite the small diff.

#### What matters

- The [diff](https://github.com/adobe/react-spectrum/pull/11006/files) moves the warning into an effect and permits only one warning per mounted hook. It does not change useSlot or restore hidden label associations.
- The author explicitly reports one false warning on reveal. The new test asserts silence before reveal and association restoration afterwards, but never asserts silence after reveal.
- Snowystinger [suggested either both useSlot fixes or an effect-based warning](https://github.com/adobe/react-spectrum/issues/10984#issuecomment-6965707765). This follows one offered direction, while leaving the issue's hidden id/aria-labelledby requirement unresolved.
- CLA is signed. Existing diagnostic frequency changes, but no prop, export, type, visible DOM structure or selector is added or removed.

#### Would have done

**Labels (proposed), bot-eligible additions:**

- `ai-reviewed`: shared-hook triage and the remaining gap are recorded.
- `merge-risk: medium`: partial resolution and changed warning timing/frequency.
- `needs decision`: accept a partial warning reduction or require hidden label wiring and reveal silence before closing the issue?

**Removals:** None.

**Maintainer next step:**

1. Decide the partial-fix boundary with Snowystinger; do not close #10984 as fully resolved by this revision.
2. If proceeding, request explicit reveal-warning expectations and a genuinely unlabelled-field test, and describe the remaining slot-wiring work separately.

### [#11007](https://github.com/adobe/react-spectrum/pull/11007): Unsupported collection element warning

**Decision:** Direction is established and otherwise suitable for focused maintainer review; CLA readiness cannot be confirmed from the available checks.

**Complexity:** High: modifies the shared core collection Document and adds cross-layer RAC tests.

**Impact/severity:** Low: improves diagnosis of intentionally unsupported composition; direct supported section children avoid the problem.

**Merge risk:** Medium: core collection traversal and hidden-subtree handling need reviewer attention; a full red-flag review was not performed.

#### What matters

- The [diff](https://github.com/adobe/react-spectrum/pull/11007/files) remembers element type and warns once per Document in development when a visible node has no collection node. Production rendering behaviour stays unchanged.
- This follows [the agreed warning direction](https://github.com/adobe/react-spectrum/issues/5399#issuecomment-6752915303): inexpensive and not repeated every render. It does not attempt to permit arbitrary DOM children.
- Tests cover valid section content, adding unsupported siblings, warning deduplication and hidden Activity visibility. The originally reported DOM wrapper containing items is not directly exercised.
- No Adobe CLA check appears in the PR rollup or the current commit's complete three-check GET result. This is missing evidence, not a claim that the author refused or failed the CLA.

#### Would have done

**Labels (proposed), bot-eligible additions:**

- `ai-reviewed`: current core-collection revision analysed within the complexity boundary.
- `merge-risk: medium`: shared traversal and hidden Activity interactions need review.

**Removals:** None.

**Maintainer next step:**

1. Confirm CLA through the existing CLA process before treating the PR as ready; do not add a waiting label solely for the missing result.
2. Review warning cost and supported-but-unattached nodes. Request the wrapper-with-items scenario from #5399 if the warning promises to explain lost descendants.

### [#11010](https://github.com/adobe/react-spectrum/pull/11010): Hebrew year cycling preserves month

**Decision:** Otherwise ready for maintainer review within the restricted high-complexity triage; CLA handled by separate automation.

**Complexity:** High: changes core date state across calendar systems, with a RAC interaction test.

**Impact/severity:** Unknown: a silently shifted holiday/anniversary date is meaningful, but no field incident, essential-task consequence or practical supported workaround is established.

**Merge risk:** Medium: the month-copy guard is scoped, but other calendars, incomplete input and era boundaries need reviewer attention.

#### What matters

- The [diff](https://github.com/adobe/react-spectrum/pull/11010/files) retains the month adjusted by CalendarDate.cycle only when the starting entered month was valid. Keyboard tests cover leap-to-regular Adar II and regular-to-leap Nisan.
- Regression is supported by [#9510's merged diff](https://github.com/adobe/react-spectrum/pull/9510/files): it replaced whole-date cycling with IncompleteDate cycling that copied only era/year. Current HebrewCalendar still adjusts month identity across leap years.
- [#10781](https://github.com/adobe/react-spectrum/pull/10781) changes the same method's timezone-offset handling, not month identity. They are complementary, not duplicates; coordinate their tests and integration.
- The Adobe CLA check is ACTION_REQUIRED. The author's browser and baseline-failure results are reported evidence only; RTL, screen-reader and other-calendar behaviour were not independently verified.

#### Would have done

**Labels (proposed), bot-eligible additions:**

- `ai-reviewed`: current revision and restricted verification recorded.
- `merge-risk: medium`: core calendar-state compatibility needs review.
- `regression`: historical whole-date cycling versus the merged IncompleteDate implementation supports the transition.

**Removals:** None.

**Maintainer next step:**

1. Let the separate CLA automation handle the sole confirmed readiness blocker; no waiting-on-author label for CLA.
2. Review incomplete/invalid month and Japanese era-boundary behaviour, and coordinate with #10781. Keep typed-year behaviour and the separate Adar-to-Adar-II arithmetic question outside this fix's scope.

## Member PRs skipped

- [#11008](https://github.com/adobe/react-spectrum/pull/11008): author_association MEMBER; `rsp-core` proposed; analysis skipped (member PR).
- [#11004](https://github.com/adobe/react-spectrum/pull/11004): author_association MEMBER; `rsp-core` proposed; analysis skipped (member PR).
- [#11001](https://github.com/adobe/react-spectrum/pull/11001): author_association MEMBER; `rsp-core` proposed; analysis skipped (member PR).

## Evidence and verification

### #11011: Public refs, existing composition and competing scope

On [current main](https://github.com/adobe/react-spectrum/blob/54d8f8080c7c26e50aa681dcb5981fb0824ba463/packages/react-aria-components/src/DateField.tsx#L187-L217), DateField forwards its ref to the outer div. DateSegment [accepts an HTMLSpanElement ref](https://github.com/adobe/react-spectrum/blob/54d8f8080c7c26e50aa681dcb5981fb0824ba463/packages/react-aria-components/src/DateField.tsx#L500-L508), and DateField exposes state as public render props. A supported composition can derive the segment from state rather than querying private DOM:

```tsx
<DateField>
  {({state}) => (
    <DateInput>
      {segment => (
        <DateSegment
          segment={segment}
          ref={segment.type === state.segments.find(s => s.isEditable)?.type ? focusRef : null}
        />
      )}
    </DateInput>
  )}
</DateField>
```

This is a source-derived illustration, not executed code or a guarantee about any external form adapter. Native RAC validation already uses [focusManager.focusFirst](https://github.com/adobe/react-spectrum/blob/54d8f8080c7c26e50aa681dcb5981fb0824ba463/packages/react-aria/src/datepicker/useDateField.ts#L183-L193); it does not supply the external root-ref contract requested here.

All 11 comments on [#7756](https://github.com/adobe/react-spectrum/issues/7756) were read. The older preference for outer-element refs is qualified by Devon's later #9185 suggestion to override focus. #9185 has a maintainer approval with an explicit unresolved ref-count decision, successful CLA, concurrent-segment-ref coverage and picker/range-picker tests. #11011 avoids an extra public prop but currently has narrower coverage and picker scope. Neither is proven superior solely by submission date. No regression transition is established for #11011.

### #11000: Timing boundary, tests and related prior work

Current [NumberField commitAndAnnounce](https://github.com/adobe/react-spectrum/blob/54d8f8080c7c26e50aa681dcb5981fb0824ba463/packages/react-aria/src/numberfield/useNumberField.ts#L134-L150) flushes the commit and reads DOM text immediately. The Calendar change plausibly moves one blur outside the passive effect, but does not repair plain autoFocus or the disabled synthetic-blur path.

The new test changes its root from TestNumberField to a fragment containing TestNumberField and Calendar. Whether React retains the original input under that transition must be checked; the test keeps querying the original input, making its claimed interaction evidence weaker without an identity/focus assertion. A one-argument console matcher may also miss a warning with additional logged arguments. These are review questions based on reading, not observed executions.

All five #10935 comments and six [#10044](https://github.com/adobe/react-spectrum/issues/10044) comments were read. Tab is the former's reported working alternative; changing isReadOnly addresses the latter's disable scenario, not Calendar-caused blur, and is not offered here as the solution.

Closed, unmerged [#10861](https://github.com/adobe/react-spectrum/pull/10861) ultimately changed synthetic blur and included disabled-field/browser tests; it did not implement Calendar focus deferral. Its CLA passed, but it was closed for contribution-guideline reasons. Do not revive that rejected contribution or declare this PR a duplicate from the shared warning text. No supported version transition establishes a regression label for this PR.

### #11006 and #11007: Diagnostics, Activity and related matches

Current [useSlot](https://github.com/adobe/react-spectrum/blob/54d8f8080c7c26e50aa681dcb5981fb0824ba463/packages/react-aria-components/src/utils.tsx#L364-L386) sets slot presence from ref attachment. #11006 leaves that mechanism unchanged. Both original issue comments were read; hiding still loses label wiring, while the PR's post-reveal attribute checks establish only eventual restoration by reasoning. The claim that genuine missing labels still warn needs focused coverage after warning deduplication. No confirmed visible accessibility regression or historical version transition was established.

All five #5399 comments were read. The restriction is intentional for collection semantics; [current ListBox section documentation](https://github.com/adobe/react-spectrum/blob/54d8f8080c7c26e50aa681dcb5981fb0824ba463/packages/dev/s2-docs/pages/react-aria/ListBox.mdx#L115-L145) uses direct headers/items. The warning addresses discoverability, not the need to support arbitrary wrappers. #11007 adds an internal ElementNode type field but no consumer prop/export or rendered DOM/selector change.

Search match [#10786](https://github.com/adobe/react-spectrum/pull/10786) contains a source-link line number 5399, not an implementation of issue #5399; its file inventory has no Document/ListBox collection change. Other Activity search matches concerned collection disappearance rather than label warning lifecycle. No competing same-behaviour warning implementation was found.

### #11010: Regression support and remaining calendar scope

[#11009](https://github.com/adobe/react-spectrum/issues/11009) has no comments. It reports RAC 1.22.1 and internationalized/date 3.12.4 on macOS/Chromium, attributing the transition to RAC 1.15.0. The exact first released version and last passing binary were not independently confirmed.

The historical code-path transition is independently supported: merged #9510 removed `value.cycle(part, amount, {round: part === 'year'})` and introduced an IncompleteDate year branch copying only era/year. Current [HebrewCalendar.balanceYearMonth](https://github.com/adobe/react-spectrum/blob/54d8f8080c7c26e50aa681dcb5981fb0824ba463/packages/@internationalized/date/src/calendars/HebrewCalendar.ts#L200-L212) adjusts the month when crossing leap-year boundaries. The current IncompleteDate branch discards that adjusted month; this PR copies it back.

The interaction test observes onChange after actual year-key input, rather than testing a private helper. It does not cover invalid/incomplete months, both Adar identities, other calendars, or RTL. The separate regular-Adar-to-leap-Adar-II question would change shared date arithmetic and is not resolved here. No public type or export changes; keyboard year cycling intentionally produces different month values.

## Run notes

### Scope, discovery and membership

Window: since previous PR digest commit `f18a293fee85a3aa845d94613a72691d6cca09ca`, `2026-11-19T16:36:21Z`, through final discovery `2026-11-20T16:13:54Z`. Initial discovery used the previous digest's slightly earlier final-read time, `2026-11-19T16:35:03Z`; no extra PR fell into that difference.

Paginated open-PR GET discovery covered 130 records, pages of 100 and 30. Nine were in the window: five eligible non-member analyses, three MEMBER skips and draft #11003. No candidate had ai-reviewed; no bot exclusion was necessary. Release-related member #11004 receives only the member exception, not a release or code review.

The five eligible authors have NONE or CONTRIBUTOR association. Collaborator-permission GETs for poulet42, 0z5a, okeken, Mwrnk and sarthakkatta each returned HTTP 403, "Must have push access to view collaborator permission." No root, .github or docs CODEOWNERS file exists on origin/main. Core membership could not be verified; normal triage followed, without treating CONTRIBUTOR or a stated company/project as membership.

All-state GET searches covered the four closing issue numbers, DateField focus/ref, Hebrew year, unsupported collection, Activity label, CalendarCell flushSync and #7756. Results reported incomplete_results false, with each total within its requested page size. Related candidates were compared by behaviour, not title alone.

Final discovery confirmed unchanged, open, non-draft analysed heads:

- #11011: `8a3694039344c5c4d7b5a5325db33cbf1c259a77`.
- #11000: `352bc94928ef0ed9e7792bfb76bd5b717276c2ba`.
- #11006: `2ba05a63eecbf746e0bae796b0e96192dcd98083`.
- #11007: `6a6c92ec81e9bfbf6680423ea3dd662fd4f58b81`.
- #11010: `e7710e65240ed4e6269312b1cfd09e65502f41c8`.

### Verification boundary and label availability

All five analyses are high complexity under the core-behaviour/public-API rubric. They received classification, API/compatibility and duplicate analysis, not the full low-complexity red-flag review. Available issue/discussion, diff and check evidence informed the specific readiness caveats; this is not approval or a complete code/security audit.

No analysed PR had issue comments, PR review text or inline review comments omitted: the linked issues' comments were read, primary PR discussions were empty, and paginated inline GETs returned empty arrays. External reproductions for #10935, #10984 and #5399 were provided but not inspected. Contributor-supplied URLs and issue media were not opened, and no PR code, tests, build, dependencies or snippets were executed.

No analysed diff touches CI workflows, script/dependency manifests, lockfiles, installation scripts or build config, so the mandatory needs-security-review sensitive-file flag is not triggered. Member diffs were not inspected. No suspected instruction-changing prompt injection was identified; author test commands were treated as reported evidence, not executed instructions.

Repository labels were read with paginated GET. Every proposed label exists; no label creation is needed. Existing labels are preserved. Maintainer-only ready-for-review is not recommended unconditionally while the recorded blockers remain.

### Synchronisation, read recovery and commit bookkeeping

Verified the dedicated checkout `/Users/darobins/dev/react-spectrum-triage`, branch triage_support, empty index, absent target digest and no merge in progress. Initial and pre-write live session checks showed no other active issue or PR triage run.

`git fetch origin` succeeded. The tracked-change check outside .github/triage was empty, and `git merge origin/main --no-edit` succeeded with "Already up to date." origin/main `54d8f8080c7c26e50aa681dcb5981fb0824ba463` was verified as an ancestor of pre-digest HEAD `ed151b12af329addf97299f2034d33b77f5184b2`. No conflict or skipped merge.

The local setup.md adaptation was not edited and remains unstaged; its blob hash is `a194d4c22c50544f28e10db1f99d70fd47c948de`. No other checkout was created or used; no branch was switched.

The prompt's initial large-file read and one out-of-range continuation were recovered with bounded reads through EOF. Oversized discovery/search/prior-PR responses were recovered by reading tool output or issuing compact GET projections. The permission-denied membership reads remain an explicit evidence limitation; no access restriction was bypassed.

An initial pre-stage validation command was blocked by the shell tool's expansion guard before execution. It was replaced with simple read commands and separate explicit staging/commit checks; no permission control was disabled.

Dry run: GitHub access used only permitted gh pr/issue view, gh pr diff and explicit GET API reads. No GitHub comments, labels, reviews, closures, edits, assignments, gists or other writes. No PR branch/fork was fetched, checked out or applied. Correctness assessments are reading and reasoning only.

Only `.github/triage/tmp-digests/triage-prs-2026-11-20.md` is to be staged after another empty-index check, verified as the sole staged path, and committed with `chore: add PR triage digest 2026-11-20` and the prescribed Copilot co-author trailer. The resulting hash and single-file commit are verified and reported separately to avoid a self-referential digest edit. No push.
