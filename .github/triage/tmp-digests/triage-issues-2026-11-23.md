# Issue triage digest: 2026-11-23

## At a glance

- Two eligible issues assessed; no verified team-authored issues skipped.
- Sheet entry can reportedly strand a workflow; FocusScope may undo collection focus restoration after Tab.
- Neither browser failure was reproduced. Sheet needs a minimal example and clarification of what interrupts entry before a fix or duplicate decision.

### [#11015](https://github.com/adobe/react-spectrum/issues/11015): Sheet entry interrupted with panel off-screen

**Decision:** Not ready for a fix review; investigate entry completion, distinguishing normal focus interaction from external writes to the sheet scroller.

**Impact/severity:** High if confirmed as reported: the affected sheet workflow is inaccessible behind its scrim, with no established supported workaround. Frequency and behaviour outside the reported headless environment remain unverified.

**Complexity:** Medium provisionally: entry completion, scroll snapping and deferred modal focus need coordinated review; the precise interruption mechanism is not established.

#### What matters

- The [report](https://github.com/adobe/react-spectrum/issues/11015) says the panel stays "off the right edge of the window, with its scrim over the page" after focusing and activating a Menu trigger during arrival. Its "30 runs out of 30" result is reporter evidence, not independent confirmation.
- [Sheet entry](https://github.com/adobe/react-spectrum/blob/6be3466d87cc628ee69461230c1b5f4e3b64c6e3/packages/react-aria-components/src/Sheet.tsx#L360-L414) resolves on one `scrollend`, without checking arrival at the intended detent. This supports investigating completion, but does not establish whether the event is absent or fires at an unintended position.
- [Related interruption guidance](https://github.com/adobe/react-spectrum/issues/10877#issuecomment-6482335035) says, "We can't control when something programmatically reaches into the DOM and interferes with scrolling." That closed report concerns router writes during exit, not a Menu interaction during entry; do not assume the same disposition.
- Steps and environment are supplied, but no minimal project or component composition is included. The reported timer/private-DOM patch is not a supported workaround and must not be recommended.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `Sheet`, `RAC`, `accessibility` for the affected component, layer and reported focus/access failure; `needs investigation` for the unresolved event sequence; `waiting on author` for the specific minimal-example request below; `ai-reviewed` for completed dry-run triage.
- Maintainer-only recommendation: withhold `ready for review` until the interruption and ordinary-use impact can be established. No `regression` proposal: no working-to-failing transition is evidenced.
- Removals: none. All proposed additions exist.

**Maintainer next step**

1. Request a minimal StackBlitz or CodeSandbox with the actual Sheet composition, open-on-mount/route setup and Menu trigger, including any wrapper library and version. Ask whether ordinary keyboard/pointer use triggers it without Playwright `focus()` or application writes to the internal scroller.
2. Obtain the exact Chromium/Playwright versions and whether the same sequence strands the sheet in headed Chrome. Preserve the supplied package version, Linux environment and reduced-motion distinction.
3. If normal supported interaction reproduces it, inspect whether `scrollend` is missing or arrives short of the target, and how entry state and focus recover. Compare the initial custom detent and reduced-motion paths; do not substitute a timer or private-selector patch.
4. If only external scroll restoration causes it, decide whether the boundary established in #10877 applies. Do not close this as a duplicate without matching the trigger and lifecycle phase.

### [#11016](https://github.com/adobe/react-spectrum/issues/11016): FocusScope selection after collection focus redirect

**Decision:** Ready for initial maintainer investigation, not a verified fix; the supplied steps and trusted source identify a focused candidate code path.

**Impact/severity:** Unknown: keyboard users can reportedly land on the wrong checkbox, but the report alternates between persistent misfocus and a brief flash. Whether a task is blocked and whether a supported workaround exists need confirmation.

**Complexity:** Low provisionally: an active-element check appears local, but its correctness and input-selection compatibility require browser confirmation.

#### What matters

- The [report](https://github.com/adobe/react-spectrum/issues/11016) describes Tab returning to a GridList/Tree inside a dialog and says focus "either stays on the checkbox" or remains there briefly instead of immediately returning to the second item.
- [FocusScope's Tab handler](https://github.com/adobe/react-spectrum/blob/6be3466d87cc628ee69461230c1b5f4e3b64c6e3/packages/react-aria/src/focus/FocusScope.tsx#L393-L398) calls `focusElement(nextElement, true)` and then `nextElement.select()` for any input, without rechecking focus. [Collection entry handling](https://github.com/adobe/react-spectrum/blob/6be3466d87cc628ee69461230c1b5f4e3b64c6e3/packages/react-aria/src/selection/useSelectableCollection.ts#L462-L527) can synchronously redirect focus to the remembered item.
- A [StackBlitz reproduction is provided](https://stackblitz.com/edit/sqtykpby?file=src%2FExample.tsx), with six keyboard steps and package/browser/OS details. It was provided but not inspected because issue-supplied URLs must not be opened.
- No matching duplicate or fixing PR was established. Existing checkbox focus-ring and text-selection reports describe different interactions, not this Tab-entry ordering.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `FocusScope`, `GridList`, `Tree`, `RAC` for the shared hook and affected components/layer; `accessibility` for keyboard focus; `needs investigation` for unverified browser behaviour; `ai-reviewed` for completed dry-run triage.
- Maintainer-only addition: `ready for review`, meaning ready for an initial investigation from the supplied details, not reproduced or approved. No `regression` proposal without version-transition evidence.
- Removals: none. All proposed additions exist.

**Maintainer next step**

1. Inspect the provided example in an approved reproduction workflow and distinguish persistent checkbox focus from transient focus. Record the exact Chrome version.
2. Evaluate guarding input selection when focus has already moved. Preserve normal text-input selection, forward/backward Tab containment and remembered-item focus for both GridList and Tree.
3. Cover the actual dialog/collection/checkbox interaction with browser-level assertions before accepting a fix. Do not disable focus containment, remove selection controls or add delayed refocusing as a workaround.

## Evidence and verification

### #11015: lifecycle and related reports

The reported environment is `react-aria-components@1.22.1`, Linux, Chromium via Playwright's headless shell, without reduced motion. No runnable project is supplied, although the open-on-mount right-sheet/Menu sequence is described. No last-known-working version is given; this is not a supported regression finding.

Trusted source sets `UNSTABLE_deferUntilEntered` and `UNSTABLE_overrideFocus` on the modal, then starts scrolling before registering a once-only `scrollend` listener. The listener resolves entry without verifying the resting position. [Modal](https://github.com/adobe/react-spectrum/blob/6be3466d87cc628ee69461230c1b5f4e3b64c6e3/packages/react-aria-components/src/Modal.tsx#L268-L282) passes deferred entry into modal behaviour and dialog focus. These observations explain the candidate state dependency, not the reporter's claimed browser outcome.

[#10937](https://github.com/adobe/react-spectrum/issues/10937) is related but not an established duplicate: its first defect concerns IntersectionObserver visibility at an edge-adjacent frame, while its second concerns a Select popover becoming inert after deferred hiding. #11015 instead alleges an interrupted arrival scroll and a panel remaining off-screen. The [request for a real-life visual summary](https://github.com/adobe/react-spectrum/issues/10937#issuecomment-6746250105) reinforces the need for a concrete example rather than adopting the proposed source diagnosis.

[#10808](https://github.com/adobe/react-spectrum/issues/10808) and merged [#10815](https://github.com/adobe/react-spectrum/pull/10815) concern off-screen travel before a sheet appears. Main includes that optimisation but still has the entry-completion path above. Closed, unmerged [#10835](https://github.com/adobe/react-spectrum/pull/10835) concerns exit completion, not entry, and is not an available merged fix. [#10814](https://github.com/adobe/react-spectrum/issues/10814) was closed as a duplicate of an aria-hide reference-count issue; it does not establish that interrupted entry is fixed.

The inspected [Sheet unit-test setup](https://github.com/adobe/react-spectrum/blob/6be3466d87cc628ee69461230c1b5f4e3b64c6e3/packages/react-aria-components/test/Sheet.test.js#L81-L103) mocks `scrollTo` with direct position assignments. That setup alone cannot confirm interrupted native smooth-scroll behaviour. No test or reproduction code was executed.

### #11016: focus ordering and comparison

The reported environment is `react-aria-components@1.22.0`, Chrome, Windows 11; Chrome's exact version is absent. The focus-order explanation is plausible because collection focus handling explicitly restores the remembered item and FocusScope subsequently selects the original input. Static tracing cannot establish the checkbox's native `select()` effect or duration in Chrome.

[#4288](https://github.com/adobe/react-spectrum/issues/4288) concerns pointer/label interaction producing checkbox/radio focus rings, not keyboard re-entry to a remembered collection item. [#1604](https://github.com/adobe/react-spectrum/issues/1604) concerns selecting page text inside containment, not selection being called after a focus redirect. Neither establishes duplicate status or an applicable supported workaround. No relevant existing-API solution was established from the inspected source; an active-element guard remains a fix candidate, not a verified answer.

## Run notes

### Scope and discovery

Run cutoff: `2026-11-23T17:48:33Z`, using the supplied timestamp; filename date is November 23. Since-last-digest discovery starts at the November 22 digest cutoff, `2026-11-22T16:53:13Z`. A separate last-24-hours query starts at `2026-11-22T17:48:33Z`. Both open-issue queries used inclusive creation bounds and a 100-result limit, returning exactly #11015 and #11016, both without labels.

A GET of `repos/adobe/react-spectrum/issues?state=open&sort=created&direction=desc&per_page=100`, excluding PRs, independently returned those two in-window issues. Its 100-item page reached `2026-10-16T19:13:07Z`, before the window, so no additional page was needed. Final individual GETs confirmed both remained open, unlabelled and without comments.

Duplicate discovery searched open/closed issues and PRs for FocusScope selection, checkbox focus, Sheet entry and scrolling, plus exact issue-number PR searches. Title-based discovery used limits of 50; focused searches used 10-30. These searches are bounded evidence, not an exhaustive historical audit.

### Membership and access limitations

Membership was checked before issue investigation. #11016 has `author_association=CONTRIBUTOR`; #11015 has `NONE`. Neither proves team membership. Repository collaborator-permission GETs for both authors failed with HTTP 403, "Must have push access to view collaborator permission." No CODEOWNERS or core-contributor-named file was found in the main-tree path listing. Membership remains unverified, so both followed normal triage; no team-authored skip was inferred.

### Synchronization and checkout

Verified `/Users/darobins/dev/react-spectrum-triage`, branch `triage_support`, origin `git@github.com:adobe/react-spectrum.git`, empty index and no in-progress merge. The app status snapshot showed this run as the only busy session; other shared-checkout triage sessions were idle. No checkout or branch was created or switched.

`git fetch origin` succeeded. The prescribed tracked-change check outside `.github/triage` was empty; `git merge origin/main --no-edit` succeeded with "Already up to date." Source revision: `6be3466d87cc628ee69461230c1b5f4e3b64c6e3`. Pre-digest HEAD: `e051ab62b63b2c555b3a60389d5210c4c34a3d7f`.

The only pre-existing change was the local `.github/triage/setup.md` adaptation. It is not part of this digest and must remain unstaged. An optional FocusScope-test text search found no matching selection assertions and returned exit status 1; later trusted-source inspection completed separately. The two permission checks above failed explicitly; required synchronization and discovery succeeded.

### Boundary and commit bookkeeping

Dry run only: GitHub access used `gh issue view|list`, `gh search` and GET-only `gh api`. No comments, labels, closures, edits, assignments, notifications, gists, PR creation or other GitHub writes were made. No issue-supplied URL was opened and no issue, PR or reproduction code was executed. Suggested actions are maintainer proposals only.

The target digest was absent before writing. Only `.github/triage/tmp-digests/triage-issues-2026-11-23.md` is authorised for staging and committing, with message `chore: add issue triage digest 2026-11-23` and the prescribed Copilot co-author trailer. The actual hash is reported after verifying the commit contains only this digest; it cannot be self-embedded. No push is authorised.
