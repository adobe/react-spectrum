# Issue triage digest — 2026-11-04

> Presentation-only revision of the original digest. This is not a fresh triage run; no historical proposal is executed or newly authorized by this rewrite.

## At a glance

- Three reports cover preview Escape, dialog naming and NavigationTree activation.
- Escape and tree actions were ready; naming had a public-prop solution and an unresolved fallback contract.
- All had medium impact; browser, axe and reproduction claims were not executed.

## Issues

### [#10918](https://github.com/adobe/react-spectrum/issues/10918) — Closed preview consumes Escape

**Decision:** Ready for review: keep open pending PR #10921 and integration verification.
**Impact / severity:** Medium.
**Complexity:** Not assessed in the original run.
**Confidence:** High for unconditional cancellation and matching PR; medium for runtime impact.

#### What matters

- The closed preview trigger still prevents Escape in the baseline handler.
- A parent overlay honoring defaultPrevented may then fail to dismiss.
- The matching PR diff is evidence of a candidate fix, not a passing test or runtime confirmation.

#### Would have done

**Labels (proposed)**

- Would apply `RAC` (component layer)
- `Popover` (preview overlay)
- `accessibility` (keyboard dismissal)
- `needs investigation` (confirm parent-overlay integration)
- `ready for review` (sufficient detail plus matching fix)
- `ai-reviewed` (triage completed; absent label would need creation). Would remove none.

**Maintainer next step**

- Request a minimal parent-overlay reproduction and verify first/second Escape; do not stop and redispatch events.
- Historical comment proposal only: maintainer-reviewed wording is retained in the #10918 evidence appendix; nothing was posted by this revision.

### [#10917](https://github.com/adobe/react-spectrum/issues/10917) — Preview dialog accessible name

**Decision:** Not ready for a fallback change: offer explicit naming and keep docs/default follow-up open.
**Impact / severity:** Medium.
**Complexity:** Not assessed in the original run.
**Confidence:** High for public naming support; medium for the overall resolution.

#### What matters

- Public Popover naming props can supply an accessible name.
- The docs example also omits naming, so this is not simply established application misuse.
- An automatic fallback contract is undecided; axe and screen-reader claims were not executed.

#### Would have done

**Labels (proposed)**

- Would apply `RAC` (component layer)
- `Popover` (dialog naming)
- `accessibility` (accessible name)
- `has workaround` (explicit public naming prop)
- `needs docs` (example omits naming)
- `needs investigation` (fallback/default behavior)
- `ai-reviewed` (triage completed; absent label would need creation). Would remove none.

**Maintainer next step**

- Confirm whether explicit naming meets the need; review docs and the desired default-name contract.
- Historical comment proposal only: maintainer-reviewed wording is retained in the #10917 evidence appendix; nothing was posted by this revision.

### [#10920](https://github.com/adobe/react-spectrum/issues/10920) — Non-link NavigationTree activation

**Decision:** Ready for review: keep the non-link NavigationTree action/API question separate.
**Impact / severity:** Medium.
**Complexity:** Not assessed in the original run.
**Confidence:** Medium.

#### What matters

- Types accept press events, while the action path uses onAction and NavigationTree omits that API.
- Plain Tree onAction is an alternative, not a drop-in NavigationTree workaround.
- The reporter also did not run the minimal browser example; runtime remains unverified.

#### Would have done

**Labels (proposed)**

- Would apply `RAC` (component layer)
- `Tree` (tree action path)
- `accessibility` (keyboard activation)
- `typescript` (advertised event contract)
- `needs API review` (decide non-link NavigationTree actions versus narrowing PressEvents)
- `needs investigation` (runtime and inherited events)
- `ready for review` (self-contained reproduction details)
- `ai-reviewed` (triage completed; absent label would need creation). Would remove none. Would not apply `has workaround`: the plain Tree alternative does not preserve the requested NavigationTree contract.

**Maintainer next step**

- Request browser click/Enter results and decide non-link action support versus narrowing inherited events.
- Historical comment proposal only: maintainer-reviewed wording is retained in the #10920 evidence appendix; nothing was posted by this revision.

## Evidence and verification appendix

### #10918 — Evidence and verification

#### Evidence and severity

The report states, "a second Escape should close the popup but is prevented by the trigger." The [baseline trigger handler](https://github.com/adobe/react-spectrum/blob/6dec77beccf0545a04318e6a01b8eb9cbe2dccc6/packages/react-aria/src/tooltip/usePreviewTrigger.ts#L169-L182) calls `preventDefault()` for Escape without checking `state.isOpen`.

In contrast, [useTooltipTrigger](https://github.com/adobe/react-spectrum/blob/6dec77beccf0545a04318e6a01b8eb9cbe2dccc6/packages/react-aria/src/tooltip/useTooltipTrigger.ts#L62-L79) registers its listener only while open.

Would classify medium: keyboard dismissal is blocked for a containing overlay that respects `defaultPrevented`; no data loss, crash, or unavoidable focus trap is established.

#### Duplicates / fixes

Would link [#10921](https://github.com/adobe/react-spectrum/pull/10921), not close the issue.

Its body says, "Now it calls preventDefault() only while the preview is open" and "Closes #10918." It is open, not merged, and its read-only file diff gates prevention on `state.isOpen` while retaining `state.close(true)`.

Its added assertion checks that a second Escape is not canceled.

This is matching fix evidence, not proof the test passes.

Component-wide and focused Escape searches across open/closed issues and PRs found no separate duplicate; [#10777](https://github.com/adobe/react-spectrum/issues/10777) asks for touch activation rather than closed-state Escape handling.

#### Reproduction / resolution

Description, expected/actual behavior, steps, package versions, Chrome and macOS are present.

There is enough source-backed detail for maintainer review, although no runnable hosted reproduction was supplied or executed.

Would request a StackBlitz or CodeSandbox showing the containing overlay.

Would not recommend the author's stop-and-redispatch workaround; no safe public API workaround was established.

Reported affected versions are RAC 1.21.1 and the hooks package 3.52.1 / 3.53.1, not a proven regression range.

#### Original readiness qualifications

Would have added `ready for review`: yes. No blocking description/environment gaps; hosted reproduction is absent but source and the linked PR provide enough detail to investigate.

#### Confidence and decision-changing evidence

High for unconditional cancellation and matching PR; medium for runtime impact. A reproduction showing cancellation outside this handler, or a merged verified fix, would change the decision.

#### Historical proposed comment (not posted by this revision)

Would comment the following, based on the source and fix linked above:

> The current source prevents Escape on the trigger even when the preview is closed.
>
> This matches the second-Escape behaviour you describe. [#10921](https://github.com/adobe/react-spectrum/pull/10921) proposes gating `preventDefault()` on the preview being open and adds a second-Escape assertion; it has not merged.
> Could you share a minimal StackBlitz or CodeSandbox containing the preview and its parent overlay, including the parent's Escape handler?
>
> That will let maintainers check the integration as well as event cancellation.
>
> I have only read the report, source and proposed diff, not run the reproduction.
>
> I would not recommend stopping and redispatching keyboard events as a library workaround.

#### Historical closure and escalation proposals

- Close / link: Would not close or mark duplicate.
- Close / link: Would link #10921 and keep #10918 as the report until the fix is reviewed and merged.
- Other: Would request the minimal reproduction and maintainer verification of closed/open preview Escape behavior and parent-overlay dismissal.
- Other: No API/design escalation is needed yet.

### #10917 — Evidence and verification

#### Evidence and severity

The report states, "The popover of a `PreviewTrigger` renders `role=\"dialog\"` with no accessible name." The [baseline Popover](https://github.com/adobe/react-spectrum/blob/6dec77beccf0545a04318e6a01b8eb9cbe2dccc6/packages/react-aria-components/src/Popover.tsx#L273-L284) treats previews as dialogs when there is no nested dialog, and [its rendered attributes](https://github.com/adobe/react-spectrum/blob/6dec77beccf0545a04318e6a01b8eb9cbe2dccc6/packages/react-aria-components/src/Popover.tsx#L338-L347) read `aria-label` / `aria-labelledby` from Popover props.

The [trigger hook](https://github.com/adobe/react-spectrum/blob/6dec77beccf0545a04318e6a01b8eb9cbe2dccc6/packages/react-aria/src/tooltip/usePreviewTrigger.ts#L242-L259) supplies no naming relationship.

Would classify medium: unnamed dialogs affect screen-reader context, but an explicit accessible name is a safe public-prop workaround.

The claimed axe "serious" result was not independently run.

#### Duplicates / fixes

Component-wide and focused naming searches across open/closed issues and PRs found no matching duplicate or naming fix.

Would not close in favor of [#10443](https://github.com/adobe/react-spectrum/issues/10443), which says "moving the pointer into it" closes a nested popover, or [#10460](https://github.com/adobe/react-spectrum/issues/10460), which says "hovering the Button closes the Popover immediately." Those are interaction-lifetime reports, not accessible naming.

#### Reproduction / resolution

The minimal composition, focus steps, RAC 1.22.1, Chrome and macOS provide enough detail to inspect the naming path, but no hosted repro was supplied.

Would answer with an explicit Popover name and consider `has workaround`.

The [PreviewTrigger docs example on the baseline](https://github.com/adobe/react-spectrum/blob/6dec77beccf0545a04318e6a01b8eb9cbe2dccc6/packages/dev/s2-docs/pages/react-aria/PreviewTrigger.mdx#L25-L40) also omits explicit naming, so would request docs review rather than dismiss this as misuse.

Whether the trigger should supply a default name remains an API/accessibility question; automatic fallback is not verified as an existing contract.

#### Original readiness qualifications

Would have added `ready for review`: no.

Naming the reported composition is answerable without library changes.

Missing for a fallback-change decision: confirmation explicit naming does not satisfy the requirement and a clear desired default-name contract.

Hosted reproduction is also absent, though the composition is sufficient for source inspection.

#### Confidence and decision-changing evidence

High for public naming support; medium for the overall resolution. An explicitly named reproduction that still lacks a computed name, or an established automatic-labeling contract, would change the recommendation.

#### Historical proposed comment (not posted by this revision)

Would comment this original example, derived from the baseline public props and [PreviewTrigger documentation](https://react-aria.adobe.com/PreviewTrigger):

> You can give the preview an accessible name with `aria-label` on its `Popover`; `aria-labelledby` can instead reference a visible heading.
>
> For example:
  > ```tsx
  > import {Link, Popover, PreviewTrigger} from 'react-aria-components';
  >
  > <PreviewTrigger>
  >   <Link href="/account">Account</Link>
  >   <Popover aria-label="Account preview">
  >     <p>Account details</p>
  >   </Popover>
  > </PreviewTrigger>
  > ```
> The current source forwards these naming props, but does not generate a name from the trigger.
>
> The docs example also warrants a naming check, so I would not treat this solely as application misuse.
>
> Does explicit naming address your use case, or do you need an automatic fallback?
>
> Please share a minimal StackBlitz or CodeSandbox if the explicitly named version still fails your accessibility check.
>
> I have not run axe or a screen-reader reproduction.

#### Historical closure and escalation proposals

- Close / link: Would not close or mark duplicate.
- Close / link: Would keep #10917 for naming/default and docs follow-up until the author and maintainers establish the intended contract.
- Other: Would request author confirmation of the naming workaround and escalate the documentation/default-name question to maintainers.
- Other: Would not use `waiting on author` yet: no demonstrated author blocker prevents reviewing the existing docs omission.

### #10920 — Evidence and verification

#### Evidence and severity

The report says, "`onPress` is accepted by its props ... but it is not called when the row is clicked or when Enter is pressed."

- [TreeItemProps](https://github.com/adobe/react-spectrum/blob/6dec77beccf0545a04318e6a01b8eb9cbe2dccc6/packages/react-aria-components/src/Tree.tsx#L730-L767) includes `PressEvents` and a separate `onAction`.
- [NavigationTree](https://github.com/adobe/react-spectrum/blob/6dec77beccf0545a04318e6a01b8eb9cbe2dccc6/packages/react-aria-components/src/NavigationTree.tsx#L94-L147) omits tree-level `onAction` and fixes selection to none.
- [Item props](https://github.com/adobe/react-spectrum/blob/6dec77beccf0545a04318e6a01b8eb9cbe2dccc6/packages/react-aria-components/src/NavigationTree.tsx#L171-L189) omit item-level `onAction`.

The [action path](https://github.com/adobe/react-spectrum/blob/6dec77beccf0545a04318e6a01b8eb9cbe2dccc6/packages/react-aria/src/gridlist/useGridListItem.ts#L191-L204) composes `node.props.onAction`, not `node.props.onPress`; [Tree hover](https://github.com/adobe/react-spectrum/blob/6dec77beccf0545a04318e6a01b8eb9cbe2dccc6/packages/react-aria-components/src/Tree.tsx#L786-L809) is disabled without selection, action or dragging.

Would classify medium: key-driven non-link destinations lose row activation and interaction cues, but no crash/data loss is reported and a different public Tree API exists.

#### Duplicates / fixes

NavigationTree and TreeItem/onPress searches across open/closed issues and PRs found no matching duplicate or fix. [#10797](https://github.com/adobe/react-spectrum/issues/10797) specifically says "DOM focus sits on the Link inside the row rather than on the row" and concerns swallowed Escape/Home/End for rows with `href`; this report concerns activation of a leaf row without `href`.

Would not close in its favor or treat [#10804](https://github.com/adobe/react-spectrum/pull/10804) as the fix.

#### Reproduction / resolution

The author provides a self-contained example, exact steps, package/React versions, Dia/Chromium and macOS versions, and explains why no StackBlitz was supplied.

The report expressly says, "I did not run the minimal example in a browser." Would ask for a browser-hosted repro, but enough detail exists for maintainer review. [Tree documentation](https://github.com/adobe/react-spectrum/blob/6dec77beccf0545a04318e6a01b8eb9cbe2dccc6/packages/dev/s2-docs/pages/react-aria/Tree.mdx#L276-L300) documents `onAction`.

That addresses plain Tree activation, not a drop-in NavigationTree fix. [NavigationTree documentation](https://github.com/adobe/react-spectrum/blob/6dec77beccf0545a04318e6a01b8eb9cbe2dccc6/packages/dev/s2-docs/pages/react-aria/NavigationTree.mdx#L220-L254) describes href-based routes and router integration.

Would not recommend a fake href, unsupported `onAction` on NavigationTree, or attaching custom press/hover behavior through its render DOM.

#### Original readiness qualifications

Would have added `ready for review`: yes.

Description, expected/actual behavior, sufficient example/steps and environment are present.

Missing hosted/browser-verified minimal repro is a follow-up, not a blocker under the "enough detail to reproduce" rule.

#### Confidence and decision-changing evidence

Medium.

Source supports the action/hover distinction, but runtime was not executed.

A browser reproduction, existing documented non-link action contract, or maintainer API decision would refine the recommendation.

#### Historical proposed comment (not posted by this revision)

Would comment this original example, derived from the baseline Tree API and [Tree documentation](https://react-aria.adobe.com/Tree):

> For a plain `Tree`, use `onAction` for item activation rather than `onPress`:
  > ```tsx
  > import {Tree, TreeItem, TreeItemContent} from 'react-aria-components';
  >
  > function SettingsActions({onSelect}: {onSelect: (page: string) => void}) {
  >   return (
  >     <Tree aria-label="Settings" selectionMode="none">
  >       <TreeItem id="profile" textValue="Profile" onAction={() => onSelect('profile')}>
  >         <TreeItemContent>Profile</TreeItemContent>
  >       </TreeItem>
  >     </Tree>
  >   );
  > }
  > ```
> This is an alternative for key-based actions, not a drop-in fix for `NavigationTree`.
>
> Its public types omit `onAction`, while inheriting press events from `TreeItem`, so the accepted-but-ineffective handler deserves an API review.
>
> Maintainers need to decide whether NavigationTree should support non-link actions or narrow its inherited event props.
> Could you share a minimal StackBlitz or CodeSandbox and check click/Enter on the minimal example in a browser?
>
> Your inline example and environment details are enough to start investigating.
>
> I have read the source but have not executed the reproduction or this illustrative example.

#### Historical closure and escalation proposals

- Close / link: Would not close or mark duplicate.
- Close / link: Would keep #10920 separately from #10797; their focus/activation conditions differ.
- Other: Would request browser reproduction and escalate the exact public-contract choice to the API owners.
- Other: Would not propose broad PressEvents-to-onAction rewiring without reviewing event semantics and compatibility.

## Run notes

#### Git synchronization

Verified `/Users/darobins/dev/react-spectrum-triage` on `triage_support`, no staged changes, no in-progress merge, no other active triage session, and no existing target digest.

Only the local `.github/triage/setup.md` adaptation was modified. `git fetch origin` succeeded.

The tracked-change check excluding `.github/triage` was empty; `git merge origin/main --no-edit` reported "Already up to date." Baseline `6dec77beccf0545a04318e6a01b8eb9cbe2dccc6` was verified as an ancestor of HEAD.

The setup adaptation remains unstaged.

No push is performed.

#### Scope

Open issues created after the previous issue digest commit, `0173cff65cde9f9a98e0ff7825c1fddf7c67f1d9`, at `2026-11-03T16:01:40Z`, through the supplied run timestamp, `2026-11-04T16:01:56Z`.

The digest date is the supplied local date.

A broader query and the exact-window query both returned these three open issues; all remained unlabeled on the final eligibility read.

No query reached its result limit.

All three issue discussions were empty when read.

#### Labels

All proposed labels exist except `ai-reviewed`, which would need creation by a maintainer before application.

No severity labels or `regression` are proposed: none of these reports identifies a previously working release.

Version persistence is not regression evidence.

No PR-only labels are proposed.

#### Read-only boundary

GitHub reads used only `gh issue list/view`, `gh pr list/view`, `gh search issues/prs`, and `gh api --method GET`.

No comments, labels, closes, edits, gists, PR creation or pushes were performed.

No issue-supplied URLs were opened.

No issue or linked-PR code was run, installed, built, imported, evaluated, fetched into the checkout or applied.

Suggested examples were written from docs/source on the pinned `origin/main` baseline.

Reproduction, browser, axe and test claims remain unverified by execution.

Only this digest is written and staged for the authorized commit; the setup adaptation and other existing state are preserved.

#### Rule feedback — #10918

Is source plus an open matching fix sufficient for `ready for review` without a hosted reproduction?

#### Rule feedback — #10917

Should this stay open for an automatic fallback/docs fix despite an accessible public-prop workaround?

#### Rule feedback — #10920

Should non-link NavigationTree activation become supported, or should its inherited press-event surface be narrowed?

### Rule feedback from the original run

- Used the previous issue digest's commit time as the lower bound for "since the last digest"; the collection window is creation-based, not update-based.
- The rules accept "enough detail to reproduce" for readiness but also request a hosted reproduction when none is supplied. Would request one for all three reports without blocking source-backed investigation of #10918 or #10920.
- #10917 has a safe explicit-name solution, but the baseline docs omission and automatic-fallback question justify keeping it open rather than closing as misuse. Its readiness is no under the rule excluding answerable reports.
- `ai-reviewed` does not exist. `needs decision` and `waiting for maintainer` also do not exist; used existing `needs API review` / `needs investigation` for concrete maintainer work rather than proposing additional new labels.

- The existing author-waiting label is `waiting on author`, not the rule's `waiting for author`; no author-waiting label was proposed because the reproduction requests are not currently blocking.
- Severity is a judgment on documented impact, not the report's axe priority or an executed accessibility assessment.

- Medium reflects affected keyboard/screen-reader paths without established data loss, crash or unavoidable trap.

- None establishes an earlier working version.
- Duplicate searches are bounded keyword/component searches, not proof of absence.

- An initial `gh search` with a combined repository qualifier failed because gh parsed it as a repository name; retrying with `--repo adobe/react-spectrum` succeeded.

- An intermediate source-extraction chain stopped when a grep pattern had no match; focused reads recovered the remaining evidence.

- Large source output was replaced with focused baseline ranges.
- Runtime, browser, hosted repro and CI verification were intentionally not performed under the prohibition on executing untrusted code or opening issue-supplied URLs.

- The open fix PR's diff was inspected only as data and supplies no passing-test evidence.
- Session-status and checkout/index checks were repeated before writing. They found no overlapping active issue/PR triage session; they are point-in-time checks, not an atomic cross-run lock.
