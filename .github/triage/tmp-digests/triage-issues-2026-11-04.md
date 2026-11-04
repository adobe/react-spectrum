| Issue | Severity | Reproduction? | Solvable without changes? | Ready for review? | Would label | Would comment | Would close / duplicate of | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [#10918](https://github.com/adobe/react-spectrum/issues/10918) - closed preview consumes Escape | medium, keyboard dismissal | Detailed steps; no hosted repro; source and open fix match | No verified API workaround | Yes | Would apply `RAC`, `Popover`, `accessibility`, `needs investigation`, `ready for review`, `ai-reviewed` | Would link the open fix and request a minimal repro | Would not close; would link [#10921](https://github.com/adobe/react-spectrum/pull/10921) | high for source; medium for runtime impact |
| [#10917](https://github.com/adobe/react-spectrum/issues/10917) - unnamed preview dialog | medium, screen-reader naming | Minimal composition and steps; no hosted repro | Yes for naming; automatic fallback still needs a decision | No | Would apply `RAC`, `Popover`, `accessibility`, `has workaround`, `needs docs`, `needs investigation`, `ai-reviewed` | Would show explicit naming and ask whether fallback is still needed | Would not close; no matching duplicate found | high for workaround API; medium overall |
| [#10920](https://github.com/adobe/react-spectrum/issues/10920) - non-link tree row ignores onPress | medium, keyboard activation and API mismatch | Self-contained example, steps and environment; browser execution not verified | Partially: plain Tree supports onAction; not the requested NavigationTree row | Yes | Would apply `RAC`, `Tree`, `accessibility`, `typescript`, `needs API review`, `needs investigation`, `ready for review`, `ai-reviewed` | Would explain Tree actions and request a browser repro | Would not close; no matching duplicate found | medium |

# Issue triage digest - 2026-11-04

**Git synchronization:** Verified `/Users/darobins/dev/react-spectrum-triage` on `triage_support`, no staged changes, no in-progress merge, no other active triage session, and no existing target digest. Only the local `.github/triage/setup.md` adaptation was modified. `git fetch origin` succeeded. The tracked-change check excluding `.github/triage` was empty; `git merge origin/main --no-edit` reported "Already up to date." Baseline `6dec77beccf0545a04318e6a01b8eb9cbe2dccc6` was verified as an ancestor of HEAD. The setup adaptation remains unstaged. No push is performed.

**Scope:** Open issues created after the previous issue digest commit, `0173cff65cde9f9a98e0ff7825c1fddf7c67f1d9`, at `2026-11-03T16:01:40Z`, through the supplied run timestamp, `2026-11-04T16:01:56Z`. The digest date is the supplied local date. A broader query and the exact-window query both returned these three open issues; all remained unlabeled on the final eligibility read. No query reached its result limit. All three issue discussions were empty when read.

**Labels:** All proposed labels exist except `ai-reviewed`, which would need creation by a maintainer before application. No severity labels or `regression` are proposed: none of these reports identifies a previously working release. Version persistence is not regression evidence. No PR-only labels are proposed.

## #10918 - PreviewTrigger prevents Escape while closed

**Evidence and severity:** The report states, "a second Escape should close the popup but is prevented by the trigger." The [baseline trigger handler](https://github.com/adobe/react-spectrum/blob/6dec77beccf0545a04318e6a01b8eb9cbe2dccc6/packages/react-aria/src/tooltip/usePreviewTrigger.ts#L169-L182) calls `preventDefault()` for Escape without checking `state.isOpen`. In contrast, [useTooltipTrigger](https://github.com/adobe/react-spectrum/blob/6dec77beccf0545a04318e6a01b8eb9cbe2dccc6/packages/react-aria/src/tooltip/useTooltipTrigger.ts#L62-L79) registers its listener only while open. Would classify medium: keyboard dismissal is blocked for a containing overlay that respects `defaultPrevented`; no data loss, crash, or unavoidable focus trap is established.

**Duplicates / fixes:** Would link [#10921](https://github.com/adobe/react-spectrum/pull/10921), not close the issue. Its body says, "Now it calls preventDefault() only while the preview is open" and "Closes #10918." It is open, not merged, and its read-only file diff gates prevention on `state.isOpen` while retaining `state.close(true)`. Its added assertion checks that a second Escape is not canceled. This is matching fix evidence, not proof the test passes. Component-wide and focused Escape searches across open/closed issues and PRs found no separate duplicate; [#10777](https://github.com/adobe/react-spectrum/issues/10777) asks for touch activation rather than closed-state Escape handling.

**Reproduction / resolution:** Description, expected/actual behavior, steps, package versions, Chrome and macOS are present. There is enough source-backed detail for maintainer review, although no runnable hosted reproduction was supplied or executed. Would request a StackBlitz or CodeSandbox showing the containing overlay. Would not recommend the author's stop-and-redispatch workaround; no safe public API workaround was established. Reported affected versions are RAC 1.21.1 and the hooks package 3.52.1 / 3.53.1, not a proven regression range.

### Would have done

- **Labels:** Would apply `RAC` (component layer), `Popover` (preview overlay), `accessibility` (keyboard dismissal), `needs investigation` (confirm parent-overlay integration), `ready for review` (sufficient detail plus matching fix), and `ai-reviewed` (triage completed; absent label would need creation). Would remove none.
- **Ready for review:** Would have added `ready for review`: yes. No blocking description/environment gaps; hosted reproduction is absent but source and the linked PR provide enough detail to investigate.
- **Comment:** Would comment the following, based on the source and fix linked above:

  > The current source prevents Escape on the trigger even when the preview is closed. This matches the second-Escape behaviour you describe. [#10921](https://github.com/adobe/react-spectrum/pull/10921) proposes gating `preventDefault()` on the preview being open and adds a second-Escape assertion; it has not merged.
  >
  > Could you share a minimal StackBlitz or CodeSandbox containing the preview and its parent overlay, including the parent's Escape handler? That will let maintainers check the integration as well as event cancellation. I have only read the report, source and proposed diff, not run the reproduction. I would not recommend stopping and redispatching keyboard events as a library workaround.

- **Close / link:** Would not close or mark duplicate. Would link #10921 and keep #10918 as the report until the fix is reviewed and merged.
- **Other:** Would request the minimal reproduction and maintainer verification of closed/open preview Escape behavior and parent-overlay dismissal. No API/design escalation is needed yet.
- **Confidence:** High for unconditional cancellation and matching PR; medium for runtime impact. A reproduction showing cancellation outside this handler, or a merged verified fix, would change the decision.
- **Feedback prompt:** Is source plus an open matching fix sufficient for `ready for review` without a hosted reproduction?

## #10917 - Preview dialog has no accessible name

**Evidence and severity:** The report states, "The popover of a `PreviewTrigger` renders `role=\"dialog\"` with no accessible name." The [baseline Popover](https://github.com/adobe/react-spectrum/blob/6dec77beccf0545a04318e6a01b8eb9cbe2dccc6/packages/react-aria-components/src/Popover.tsx#L273-L284) treats previews as dialogs when there is no nested dialog, and [its rendered attributes](https://github.com/adobe/react-spectrum/blob/6dec77beccf0545a04318e6a01b8eb9cbe2dccc6/packages/react-aria-components/src/Popover.tsx#L338-L347) read `aria-label` / `aria-labelledby` from Popover props. The [trigger hook](https://github.com/adobe/react-spectrum/blob/6dec77beccf0545a04318e6a01b8eb9cbe2dccc6/packages/react-aria/src/tooltip/usePreviewTrigger.ts#L242-L259) supplies no naming relationship. Would classify medium: unnamed dialogs affect screen-reader context, but an explicit accessible name is a safe public-prop workaround. The claimed axe "serious" result was not independently run.

**Duplicates / fixes:** Component-wide and focused naming searches across open/closed issues and PRs found no matching duplicate or naming fix. Would not close in favor of [#10443](https://github.com/adobe/react-spectrum/issues/10443), which says "moving the pointer into it" closes a nested popover, or [#10460](https://github.com/adobe/react-spectrum/issues/10460), which says "hovering the Button closes the Popover immediately." Those are interaction-lifetime reports, not accessible naming.

**Reproduction / resolution:** The minimal composition, focus steps, RAC 1.22.1, Chrome and macOS provide enough detail to inspect the naming path, but no hosted repro was supplied. Would answer with an explicit Popover name and consider `has workaround`. The [PreviewTrigger docs example on the baseline](https://github.com/adobe/react-spectrum/blob/6dec77beccf0545a04318e6a01b8eb9cbe2dccc6/packages/dev/s2-docs/pages/react-aria/PreviewTrigger.mdx#L25-L40) also omits explicit naming, so would request docs review rather than dismiss this as misuse. Whether the trigger should supply a default name remains an API/accessibility question; automatic fallback is not verified as an existing contract.

### Would have done

- **Labels:** Would apply `RAC` (component layer), `Popover` (dialog naming), `accessibility` (accessible name), `has workaround` (explicit public naming prop), `needs docs` (example omits naming), `needs investigation` (fallback/default behavior), and `ai-reviewed` (triage completed; absent label would need creation). Would remove none.
- **Ready for review:** Would have added `ready for review`: no. Naming the reported composition is answerable without library changes. Missing for a fallback-change decision: confirmation explicit naming does not satisfy the requirement and a clear desired default-name contract. Hosted reproduction is also absent, though the composition is sufficient for source inspection.
- **Comment:** Would comment this original example, derived from the baseline public props and [PreviewTrigger documentation](https://react-aria.adobe.com/PreviewTrigger):

  > You can give the preview an accessible name with `aria-label` on its `Popover`; `aria-labelledby` can instead reference a visible heading. For example:
  >
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
  >
  > The current source forwards these naming props, but does not generate a name from the trigger. The docs example also warrants a naming check, so I would not treat this solely as application misuse. Does explicit naming address your use case, or do you need an automatic fallback? Please share a minimal StackBlitz or CodeSandbox if the explicitly named version still fails your accessibility check. I have not run axe or a screen-reader reproduction.

- **Close / link:** Would not close or mark duplicate. Would keep #10917 for naming/default and docs follow-up until the author and maintainers establish the intended contract.
- **Other:** Would request author confirmation of the naming workaround and escalate the documentation/default-name question to maintainers. Would not use `waiting on author` yet: no demonstrated author blocker prevents reviewing the existing docs omission.
- **Confidence:** High for public naming support; medium for the overall resolution. An explicitly named reproduction that still lacks a computed name, or an established automatic-labeling contract, would change the recommendation.
- **Feedback prompt:** Should this stay open for an automatic fallback/docs fix despite an accessible public-prop workaround?

## #10920 - NavigationTreeItem without href ignores onPress

**Evidence and severity:** The report says, "`onPress` is accepted by its props ... but it is not called when the row is clicked or when Enter is pressed." [TreeItemProps](https://github.com/adobe/react-spectrum/blob/6dec77beccf0545a04318e6a01b8eb9cbe2dccc6/packages/react-aria-components/src/Tree.tsx#L730-L767) includes `PressEvents` and a separate `onAction`, while [NavigationTree](https://github.com/adobe/react-spectrum/blob/6dec77beccf0545a04318e6a01b8eb9cbe2dccc6/packages/react-aria-components/src/NavigationTree.tsx#L94-L147) omits tree-level `onAction` and fixes selection to none; [item props](https://github.com/adobe/react-spectrum/blob/6dec77beccf0545a04318e6a01b8eb9cbe2dccc6/packages/react-aria-components/src/NavigationTree.tsx#L171-L189) omit item-level `onAction`. The [action path](https://github.com/adobe/react-spectrum/blob/6dec77beccf0545a04318e6a01b8eb9cbe2dccc6/packages/react-aria/src/gridlist/useGridListItem.ts#L191-L204) composes `node.props.onAction`, not `node.props.onPress`; [Tree hover](https://github.com/adobe/react-spectrum/blob/6dec77beccf0545a04318e6a01b8eb9cbe2dccc6/packages/react-aria-components/src/Tree.tsx#L786-L809) is disabled without selection, action or dragging. Would classify medium: key-driven non-link destinations lose row activation and interaction cues, but no crash/data loss is reported and a different public Tree API exists.

**Duplicates / fixes:** NavigationTree and TreeItem/onPress searches across open/closed issues and PRs found no matching duplicate or fix. [#10797](https://github.com/adobe/react-spectrum/issues/10797) specifically says "DOM focus sits on the Link inside the row rather than on the row" and concerns swallowed Escape/Home/End for rows with `href`; this report concerns activation of a leaf row without `href`. Would not close in its favor or treat [#10804](https://github.com/adobe/react-spectrum/pull/10804) as the fix.

**Reproduction / resolution:** The author provides a self-contained example, exact steps, package/React versions, Dia/Chromium and macOS versions, and explains why no StackBlitz was supplied. The report expressly says, "I did not run the minimal example in a browser." Would ask for a browser-hosted repro, but enough detail exists for maintainer review. [Tree documentation](https://github.com/adobe/react-spectrum/blob/6dec77beccf0545a04318e6a01b8eb9cbe2dccc6/packages/dev/s2-docs/pages/react-aria/Tree.mdx#L276-L300) documents `onAction`. That addresses plain Tree activation, not a drop-in NavigationTree fix. [NavigationTree documentation](https://github.com/adobe/react-spectrum/blob/6dec77beccf0545a04318e6a01b8eb9cbe2dccc6/packages/dev/s2-docs/pages/react-aria/NavigationTree.mdx#L220-L254) describes href-based routes and router integration. Would not recommend a fake href, unsupported `onAction` on NavigationTree, or attaching custom press/hover behavior through its render DOM.

### Would have done

- **Labels:** Would apply `RAC` (component layer), `Tree` (tree action path), `accessibility` (keyboard activation), `typescript` (advertised event contract), `needs API review` (decide non-link NavigationTree actions versus narrowing PressEvents), `needs investigation` (runtime and inherited events), `ready for review` (self-contained reproduction details), and `ai-reviewed` (triage completed; absent label would need creation). Would remove none. Would not apply `has workaround`: the plain Tree alternative does not preserve the requested NavigationTree contract.
- **Ready for review:** Would have added `ready for review`: yes. Description, expected/actual behavior, sufficient example/steps and environment are present. Missing hosted/browser-verified minimal repro is a follow-up, not a blocker under the "enough detail to reproduce" rule.
- **Comment:** Would comment this original example, derived from the baseline Tree API and [Tree documentation](https://react-aria.adobe.com/Tree):

  > For a plain `Tree`, use `onAction` for item activation rather than `onPress`:
  >
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
  >
  > This is an alternative for key-based actions, not a drop-in fix for `NavigationTree`. Its public types omit `onAction`, while inheriting press events from `TreeItem`, so the accepted-but-ineffective handler deserves an API review. Maintainers need to decide whether NavigationTree should support non-link actions or narrow its inherited event props.
  >
  > Could you share a minimal StackBlitz or CodeSandbox and check click/Enter on the minimal example in a browser? Your inline example and environment details are enough to start investigating. I have read the source but have not executed the reproduction or this illustrative example.

- **Close / link:** Would not close or mark duplicate. Would keep #10920 separately from #10797; their focus/activation conditions differ.
- **Other:** Would request browser reproduction and escalate the exact public-contract choice to the API owners. Would not propose broad PressEvents-to-onAction rewiring without reviewing event semantics and compatibility.
- **Confidence:** Medium. Source supports the action/hover distinction, but runtime was not executed. A browser reproduction, existing documented non-link action contract, or maintainer API decision would refine the recommendation.
- **Feedback prompt:** Should non-link NavigationTree activation become supported, or should its inherited press-event surface be narrowed?

**Read-only boundary:** GitHub reads used only `gh issue list/view`, `gh pr list/view`, `gh search issues/prs`, and `gh api --method GET`. No comments, labels, closes, edits, gists, PR creation or pushes were performed. No issue-supplied URLs were opened. No issue or linked-PR code was run, installed, built, imported, evaluated, fetched into the checkout or applied. Suggested examples were written from docs/source on the pinned `origin/main` baseline. Reproduction, browser, axe and test claims remain unverified by execution. Only this digest is written and staged for the authorized commit; the setup adaptation and other existing state are preserved.

## Rule feedback

- Used the previous issue digest's commit time as the lower bound for "since the last digest"; the collection window is creation-based, not update-based.
- The rules accept "enough detail to reproduce" for readiness but also request a hosted reproduction when none is supplied. Would request one for all three reports without blocking source-backed investigation of #10918 or #10920.
- #10917 has a safe explicit-name solution, but the baseline docs omission and automatic-fallback question justify keeping it open rather than closing as misuse. Its readiness is no under the rule excluding answerable reports.
- `ai-reviewed` does not exist. `needs decision` and `waiting for maintainer` also do not exist; used existing `needs API review` / `needs investigation` for concrete maintainer work rather than proposing additional new labels. The existing author-waiting label is `waiting on author`, not the rule's `waiting for author`; no author-waiting label was proposed because the reproduction requests are not currently blocking.
- Severity is a judgment on documented impact, not the report's axe priority or an executed accessibility assessment. Medium reflects affected keyboard/screen-reader paths without established data loss, crash or unavoidable trap. None establishes an earlier working version.
- Duplicate searches are bounded keyword/component searches, not proof of absence. An initial `gh search` with a combined repository qualifier failed because gh parsed it as a repository name; retrying with `--repo adobe/react-spectrum` succeeded. An intermediate source-extraction chain stopped when a grep pattern had no match; focused reads recovered the remaining evidence. Large source output was replaced with focused baseline ranges.
- Runtime, browser, hosted repro and CI verification were intentionally not performed under the prohibition on executing untrusted code or opening issue-supplied URLs. The open fix PR's diff was inspected only as data and supplies no passing-test evidence.
- Session-status and checkout/index checks were repeated before writing. They found no overlapping active issue/PR triage session; they are point-in-time checks, not an atomic cross-run lock.
