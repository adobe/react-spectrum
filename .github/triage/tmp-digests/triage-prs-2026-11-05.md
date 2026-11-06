# PR triage digest — 2026-11-05

> Presentation-only revision of the original digest. This is not fresh triage: findings, labels, comments and closures remain historical proposals, not executed actions or current authorization.

## At a glance

- 1 PR assessed in the original run; these are historical recommendations, not fresh readiness checks.
- No analyzed PR was judged ready; concrete author blockers and unresolved maintainer direction remain historical findings.

## Analyzed PRs

### [#10926](https://github.com/adobe/react-spectrum/pull/10926) — Overlay focus-restoration targets

**Decision:** Not ready: resolve CLA, API direction, committed docs and contributor confirmation.

**Complexity:** High

**Impact / severity:** Not assessed in the original run

**Merge risk:** High

#### What matters

- Explicit targets can override a surviving trigger and bypass the restoration event.
- Maintainer interest is not approval of this contract; #10696 is coordination work and #6765 remains unresolved after two reads.

#### Would have done

**Labels (proposed)**

- would apply `merge-risk: high` because this adds a shared focus API and unresolved event/target-priority semantics
- `ai-reviewed` for completed scoped triage with limitations recorded
- `needs API review` for the widened prop and cross-layer contract
- `needs decision` for override versus fallback, prop shape and restoration-event participation
- `waiting for author` for CLA completion, agreed-API documentation and contributor-understanding confirmation
- `waiting for maintainer` for the direction decision and coordination with #10696.
- Remove: none.
- Existing `RAC`, `Modal` and `Popover` labels would remain.


**Maintainer next step**

- **Historical proposal:** would not close.
- **Historical proposal:** would escalate the API/direction decision to devongovett and snowystinger, using their existing #10696 discussion as context; no assignment proposed.
- No automated comment was proposed; any explicitly optional comment remains optional in the appendix.

## Evidence and verification appendix

### #10926 — Evidence and verification

[PR](https://github.com/adobe/react-spectrum/pull/10926), revision `72979b105a135642afde9dfc7534c30c9abe12f4`. **High complexity:** new public API and shared focus-management behavior spanning hooks and RAC components, six files, 262 additions and 12 deletions.


This adds ref/callback targets to `FocusScope.restoreFocus` and exposes the option through `Overlay`, `Modal`, `ModalOverlay` and `Popover`, keeping overlay restoration enabled by default. It targets focus falling to body when a closing overlay's trigger disappears, with new focus-scope and row-deletion integration cases, but its API contract awaits team agreement and the CLA check requires action.



#### API and compatibility


- [`packages/react-aria/src/focus/FocusScope.tsx`, new lines 44-53](https://github.com/adobe/react-spectrum/blob/72979b105a135642afde9dfc7534c30c9abe12f4/packages/react-aria/src/focus/FocusScope.tsx#L44-L53): `restoreFocus` widens from `boolean` to `boolean | RefObject<FocusableElement | null> | ((modality: Modality | null) => FocusableElement | boolean | null)`. Callback `true`/`null` and an empty ref select the default target; `false` opts out.
- This is a new public contract, not simply an internal bug fix.
- [`packages/react-aria/src/overlays/Overlay.tsx`, new lines 41-52 and 87-91](https://github.com/adobe/react-spectrum/blob/72979b105a135642afde9dfc7534c30c9abe12f4/packages/react-aria/src/overlays/Overlay.tsx#L41-L52): adds `restoreFocus?: FocusScopeProps['restoreFocus']` and passes `props.restoreFocus ?? true` to `FocusScope`. The previous overlay default is retained; callers gain the ability to suppress or redirect restoration.
- [`packages/react-aria-components/src/Modal.tsx`, new lines 92-100](https://github.com/adobe/react-spectrum/blob/72979b105a135642afde9dfc7534c30c9abe12f4/packages/react-aria-components/src/Modal.tsx#L92-L100) and [`Popover.tsx`, new lines 113-121](https://github.com/adobe/react-spectrum/blob/72979b105a135642afde9dfc7534c30c9abe12f4/packages/react-aria-components/src/Popover.tsx#L113-L121): expose the prop via `OverlayProps['restoreFocus']`. Modal forwards it to its overlay; Popover uses the existing prop forwarding path.
- The body explicitly says RSP v3/S2 wrappers do not yet expose it.
- [`FocusScope.tsx`, new lines 806-818](https://github.com/adobe/react-spectrum/blob/72979b105a135642afde9dfc7534c30c9abe12f4/packages/react-aria/src/focus/FocusScope.tsx#L806-L818): an explicit connected target is focused directly when focus has fallen to body. The body calls out that this bypasses `react-aria-focus-scope-restore`, and that a ref also wins when the trigger still exists.
- Would apply `needs API review` for override-versus-fallback semantics, callback/modality behavior and interaction with existing restoration-event consumers.

No new export name, removed prop, default-value change, DOM structure, class, data attribute or CSS-variable change is apparent in the diff. Existing boolean usage is intended to remain compatible; compatibility of the widened shared behavior has not been independently executed.



#### Direction and readiness


The linked [#9876](https://github.com/adobe/react-spectrum/issues/9876) asks for fallback/opt-out control when a modal trigger is removed. Its sole returned [comment](https://github.com/adobe/react-spectrum/issues/9876#issuecomment-6657955441) extends the case to deleting a row from its Menu and asks, "should we widen `restoreFocus`, or add a separate prop (`restoreFocusTo`)?" That comment is by the PR author, not evidence that maintainers agreed to the proposed shape.


There is relevant, mixed direction in [#10696's discussion](https://github.com/adobe/react-spectrum/pull/10696#issuecomment-6176712470): snowystinger says, "A FocusScope prop could be useful in this case. PopoverTrigger and DialogTrigger could set it automatically." A [later maintainer response](https://github.com/adobe/react-spectrum/pull/10696#issuecomment-6178557185) also welcomes trying restoration-event interception.

Would apply `needs decision`: should custom restoration widen the existing prop or use a distinct fallback API, should a live trigger retain priority, and should explicit targets participate in the restoration event? Interest in a prop is not approval of this exact contract.


The [current checks](https://github.com/adobe/react-spectrum/pull/10926/checks) report `Adobe CLA Signed? = ACTION_REQUIRED`; all other returned checks/contexts are successful, including unit/browser/SSR tests, lint and type/API comparison. Would require the author to complete the CLA.

The body says "there are no docs examples yet" and offers to add them after shape agreement; it also leaves the contributor-understanding checklist unchecked despite saying the author reviewed the diff. Would require a committed usage example/docs for the agreed public API and confirmation of contributor ownership before readiness.


The diff adds five RAC dialog cases, including keyboard deletion of a row from Menu and Modal and `restoreFocus={false}`, plus ten focus-scope cases. These are relevant evidence, not proof of browser/screen-reader acceptance: the author's manual checks cover Chrome only, and the manual story is not committed.

The author's reported four full-suite failures are claimed to reproduce on main; this was not executed, and the returned CI test contexts are green. Per step 1, no full low-complexity red-flag or correctness review was performed.



#### Duplicates


Searches covered #9876, `restoreFocus`, `restoreFocusTo`, focus-restoration behavior and recent PRs mentioning `FocusScope`. No competing implementation of this custom-target API was found.


- [#10696](https://github.com/adobe/react-spectrum/pull/10696) fixes a different case: a default-open overlay recorded body at mount, and focus should return to its existing trigger. Its current approach uses the restoration event rather than exposing this custom-target API.
- It overlaps the same restoration path and would need coordination, not duplicate closure. Its CLA check is successful, versus #10926's action-required result, but CLA preference does not make different fixes duplicates.
- [#10596](https://github.com/adobe/react-spectrum/pull/10596) preserves the active scope/containment owner while a sibling unmounts. [#10800](https://github.com/adobe/react-spectrum/pull/10800) adds a styled popover-backdrop wrapper. Both touch related files but address different behavior.
- Merged [#10371](https://github.com/adobe/react-spectrum/pull/10371) guards a missing restoration target against a null dereference; it does not expose a consumer-chosen target or replace this feature.
- The author's reference to [#6765](https://github.com/adobe/react-spectrum/issues/6765) could not be resolved: `gh issue view` failed with "Could not resolve to an issue or pull request", and an explicit GET fallback returned HTTP 404. Its claimed table-row-deletion context is unverified.

#### Original confidence and decision-changing evidence

high on CLA, API additions and missing direction/docs; medium on merge risk and readiness beyond those blockers because this is scoped triage, not a full shared-focus review. An agreed contract, completed CLA, committed docs and resolved ownership checklist would change readiness.

#### Original summary caveats

CLA action required; API direction unresolved; no committed docs example



#### Historical action and comment detail (not executed)

#### Readiness rationale
Would have added `ready for review`: no. Missing signed CLA, agreement on the API/restoration semantics, a committed docs/example for the agreed behavior and contributor-ownership confirmation.

CI failures are not asserted; all non-CLA returned checks are successful.
#### Historical close / link proposal
would not close. Would link #9876 as the feature request and #10696 as related restoration-path work, not as a preferred duplicate.

No PR would be kept in place of this one on the available evidence.
#### Historical other proposal
would escalate the API/direction decision to devongovett and snowystinger, using their existing #10696 discussion as context; no assignment proposed. No changed workflow, dependency/lockfile, package script, install script or build configuration appears in the six-file diff, so the rules' mandatory security-review trigger does not apply.
- **Historical comment proposal:** no comment.

## Run notes

The following records the original run, including its operational history and policy feedback; it does not describe actions taken during this presentation-only revision.

Read-only GitHub draft. No proposed action was applied.
- Branch: `triage_support`, dedicated checkout `/Users/darobins/dev/react-spectrum-triage`. Initial and pre-write checks found an empty index, no merge in progress, no existing target digest and no other active triage session.
- The pre-existing local `.github/triage/setup.md` adaptation remains untouched and unstaged.
- Synchronization: `git fetch origin` succeeded; `git merge origin/main --no-edit` succeeded with "Already up to date." Incorporated main: `36f3adde26ccd12f3cc18c9d0293ece0f10e94c7`; ancestry was verified.
- Scope: open, non-draft, non-bot PRs without `ai-reviewed`, created after the previous PR digest commit at `2026-11-04T16:17:44Z`, through discovery at approximately `2026-11-05T16:51:17Z`. Exact timestamp search and an independent recent-open-PR GET both found only #10926.
- Older PRs, even those updated since yesterday, are outside this creation-based window. The reviewed head and eligibility were rechecked at `2026-11-05T16:52:00Z`.
- Method: GitHub reads through `gh pr list/view/diff`, `gh issue view`, `gh search` and explicit GET API calls only. No PR checkout/fetch, patch application, contributor-code execution, dependency installation, contributor-URL retrieval, GitHub write, gist or push.
- Findings are based on reading, not running PR tests.
- Label inventory: proposed `merge-risk: high`, `ai-reviewed`, `needs API review`, `needs decision` and `waiting for maintainer` exist. Proposed `waiting for author` does not exist and would need creation; the existing `waiting on author` is not substituted for the exact rule label.
- No removals are proposed.
#### Rule feedback


- Used the previous PR digest's commit time as "since the last digest", rather than a rolling 24-hour cutoff. Discovery was cross-checked against the newest open PRs; no eligible draft or bot was found.
- High-complexity scope limits full red-flag review, while readiness still requires checking CLA, CI, tests and instructions. Those readiness facts were read; no complete correctness, accessibility or workaround audit is claimed.
- `waiting for author` is absent from the live label inventory. It is proposed with the required exact spelling, not silently mapped to `waiting on author`.
- #10696 provides evidence of maintainer interest in a FocusScope prop and willingness to try an event-based alternative, not approval of this PR's particular widening/override semantics.
- The issue/PR reference #6765 remains unavailable after both GraphQL view and REST GET attempts. This read failure is explicit; it does not establish a duplicate or justify closure.
- No PR code, reproduction, external prior-art link or contributor-supplied URL was executed or opened. Author claims about before/after tests, base-branch failures and manual browser results were not independently reproduced.
#### Feedback for #10926

#10926: Review whether explicit targets should override a surviving trigger and bypass the restoration event, or whether the feature should be a fallback-only API coordinated with #10696.
