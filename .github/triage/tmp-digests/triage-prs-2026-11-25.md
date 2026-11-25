# PR triage digest: 2026-11-25

## At a glance

- Five in-window open PRs: two analysed, two member PRs skipped, one release-notes PR excluded.
- PromptTokenField's Escape fix adds public type properties and needs API assessment; CLA is unsigned.
- The maintainer-approved Tabs follow-up has a specific default-constructor test gap. No competing fix was found in targeted searches.

### [#11031](https://github.com/adobe/react-spectrum/pull/11031): Dismiss PromptTokenField completions with Escape

**Decision:** Not ready to merge: resolve the exported-type change and unsigned CLA before accepting the fix; the requested Escape behaviour has maintainer support.

**Complexity:** High because two optional properties are added to an exported public type, despite the implementation being confined to one component.

**Impact/severity:** Medium: keyboard dismissal is degraded in mention workflows; the maintainer identifies Space as an alternate path, although it changes the text.

**Merge risk:** Medium: dismissal changes keyboard propagation and asynchronous popover state, with public-type exposure and browser verification gaps.

#### What matters

- The [source change](https://github.com/adobe/react-spectrum/pull/11031/files) records dismissal until the next text change, preserves the text and focus, and consumes Escape only while completions are open.
- `isDismissed?: boolean` and `isOpenRef?: RefObject<boolean>` are added to `PromptTokenFieldPopoverProps`. That type is [exported from the package entrypoint](https://github.com/adobe/react-spectrum/blob/b1e8cf579fcc4cda0031f09d7d4e3bdff299fc3a/packages/@react-spectrum/ai/exports/index.ts), so this is not exclusively private plumbing.
- The [issue discussion](https://github.com/adobe/react-spectrum/issues/11029#issuecomment-7152613174) agrees Escape should dismiss and invites an implementation. The added interaction tests cover unchanged text/focus, caret-only movement, reopening after editing back to the same text, and closed-menu propagation.
- CLA reports `ACTION_REQUIRED`. The author reports jsdom testing but no real-browser or screen reader verification; nested-dialog, toolbar submenu and asynchronous-completion behaviour are not covered by the two added tests.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `ai-reviewed` for this analysed revision; `merge-risk: medium` for the keyboard/state and verification boundaries.
- Bot-eligible addition: `needs API review` because dismissal state and a mutable open-state ref enter an exported props type.
- Recommendation: `waiting on maintainer` for assessment of that API exposure and the existing invitation to explore the fix, not for CLA.
- Removals: none; preserve `PromptField` and `AI`.

**Maintainer next step**

1. Decide whether dismissal plumbing should remain private rather than become part of `PromptTokenFieldPopoverProps`; request a private internal type or an intentional, documented API as appropriate.
2. Verify open-menu Escape inside a dialog, Escape from toolbar submenus, and delayed/empty completion results in a real browser. Include screen reader focus and dismissal feedback; the reported jsdom results do not establish these cases.
3. CLA is a readiness blocker handled by separate automation. Do not request an author response or apply a waiting label solely for CLA.

### [#11033](https://github.com/adobe/react-spectrum/pull/11033): Normalize Tabs delegate defaults before calling the base class

**Decision:** Direction is established and the current revision is approved, but the default-constructor case still needs focused coverage under the triage readiness criteria.

**Complexity:** Low: five additions and three deletions normalize existing defaults in one private component delegate; no public API is added.

**Impact/severity:** Low: the demonstrated mismatch affects direct construction with omitted options, not the ordinary supported hook path, which already supplies orientation and locale direction.

**Merge risk:** Medium: the change is contained and matches the requested fix, but existing integration tests bypass the exact defaulting defect.

#### What matters

- The patch implements the [maintainer's exact suggestion](https://github.com/adobe/react-spectrum/pull/11018#discussion_r4687715362): compute horizontal/LTR defaults before `super` and pass the same values to both delegate layers.
- In the [baseline base constructor](https://github.com/adobe/react-spectrum/blob/b1e8cf579fcc4cda0031f09d7d4e3bdff299fc3a/packages/react-aria/src/selection/ListKeyboardDelegate.ts), omitted orientation defaults to vertical and removes left/right methods. The derived delegate independently defaults to horizontal, creating inconsistent method availability.
- No test, story or verification instructions are added. The maintainer explicitly says the case is "Not caught by our tests" because `useTabList` supplies horizontal orientation; successful CI does not close that gap.
- Reidbarber [approved this revision](https://github.com/adobe/react-spectrum/pull/11033#pullrequestreview-6060395413). The parent refactor is merged, but the normalization is still absent from `origin/main`; this is a follow-up, not a duplicate of an already-applied fix.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `ai-reviewed` for this analysed revision; `merge-risk: medium` for missing coverage of the default-constructor path.
- Recommendation: `waiting on author` for a focused test exercising omitted orientation/direction, a non-CLA task.
- Removals: none; preserve the existing `small review`, which describes review effort rather than merge risk.

**Maintainer next step**

1. Request a focused test that observes left/right navigation with omitted orientation and direction, and would fail against the pre-fix constructor. Existing rendered Tabs tests alone cannot expose this defect because the hook supplies those options.
2. Once that gap is addressed, recommend `ready for review` for the maintainer to apply if re-review is needed; the present revision already has approval and a signed CLA. This is not a recommendation to reject the change or revisit its agreed direction.

## Member PRs skipped

- [#11030: Lightbox single slide](https://github.com/adobe/react-spectrum/pull/11030): REST `author_association: MEMBER`; `rsp-core` proposed; analysis skipped (member PR).
- [#11027: TagGroup overflow, collapsing and RTL](https://github.com/adobe/react-spectrum/pull/11027): REST `author_association: MEMBER`; `rsp-core` proposed; analysis skipped (member PR).

## Evidence and verification

### #11031: Compatibility, issue scope and overlap

The public type gains optional properties without removing existing ones. Escape now intentionally stops reaching enclosing consumers while the completion menu is open; it continues to propagate when closed. No changed DOM structure, classes, data attributes or CSS variables were identified in the diff. API review concerns the newly exposed state/ref contract, not opposition to the agreed dismissal behaviour.

All three comments on [#11029](https://github.com/adobe/react-spectrum/issues/11029) were read. Snowystinger asks about reopening after typing, identifies Space as an alternate dismissal, then supports exploring Escape. The patch's next-text-change reset and preservation of typed text align with that discussion. Space is a supported alternate interaction, not an equivalent text-preserving fix; no internal wrapper hack is endorsed.

The report specifies AI 0.5.1, the same source in 0.5.2/main, S2 1.8.1, React 19.2.6, Chrome and macOS. It supplies inline component/interaction steps but no standalone StackBlitz. Contributor-supplied example, reproduction and image URLs were not opened. The behaviour was assessed through source and discussion, not by executing the example. No historical working version establishes a regression.

The two added tests observe rendered menu visibility, field text, focus and event propagation. The caret-only case changes the controlled selection because jsdom cannot implement the real arrow-key movement. The baseline suite skips React versions below 19, consistent with the package's React 19 peer requirement; passing older-React CI contexts do not extend this suite's coverage. GitHub reports successful CI contexts other than CLA, but job logs and actual browser/screen reader execution were not inspected.

Exact-reference and behaviour searches found this issue and PR, not a competing Escape fix. Merged [#10614](https://github.com/adobe/react-spectrum/pull/10614) also touches PromptField, but its described changes concern virtualized completion menus, steering and moving consumer key handlers above the token field. The current baseline still has no dismissal state, so that overlap is not an existing fix.

This high-complexity PR received classification, summary/context, API/compatibility and duplicate assessment, not the full low-complexity red-flag review. That boundary contributes to the recorded verification gap.

### #11033: Baseline, tests and red flags

`TabsKeyboardDelegate` passes unnormalized options to `ListKeyboardDelegate` in the baseline. The base class defaults to a vertical stack and sets `getKeyLeftOf`/`getKeyRightOf` to `undefined`; the derived class then assumes horizontal defaults and disables above/below navigation. The patch supplies normalized horizontal/LTR values before this method selection. Explicit vertical/RTL values remain unchanged.

The supported [useTabList implementation](https://github.com/adobe/react-spectrum/blob/b1e8cf579fcc4cda0031f09d7d4e3bdff299fc3a/packages/react-aria/src/tabs/useTabList.ts) already supplies defaults and locale direction, for example `useTabList(props, state, ref)` with omitted `orientation`. Its [API documentation](https://react-aria.adobe.com/Tabs/useTabList) exposes the hook, not direct delegate construction. That protects ordinary consumers but does not repair the private constructor invariant requested by the maintainer; no new product/scope decision is inferred.

The baseline RAC Tabs tests cover vertical RTL navigation and wrapping options. They construct through the hook, so they would not fail for the omitted-options mismatch. No focused new coverage was supplied.

The complete eight-line diff adds no error suppression, assertions, arbitrary scheduling, DOM poking, user-agent checks or accessibility removal. Existing `@ts-expect-error` comments in the surrounding baseline are not introduced by this PR. The patch changes internal default method availability, not public props, exports, DOM, classes or CSS. CLA is signed; no failing CI context was reported.

Merged [#11018](https://github.com/adobe/react-spectrum/pull/11018) introduced the superclass refactor and contains the request for this follow-up. Open [#10794](https://github.com/adobe/react-spectrum/pull/10794) is the broader ProgressList/Wizard work that motivated reuse; its current file list has no TabsKeyboardDelegate change. Merged [#10467](https://github.com/adobe/react-spectrum/pull/10467) concerns vertical RTL left/right consistency, not constructor default normalization. No competing default-normalization fix was found, and no closure is recommended.

## Run notes

### Scope and discovery

Window: the previous PR digest's final discovery cutoff, `2026-11-24T16:17:56Z`, through final discovery at `2026-11-25T17:17:26Z`. Previous digest commit: `0ac3ceedbbbbe9f322ca1d34c684180a75d37175`, committed at `2026-11-24T16:23:58Z`. Discovery time rather than commit time avoids a gap.

Initial and final `gh api --method GET repos/adobe/react-spectrum/pulls` discovery each paginated all 135 open PRs in pages of 100 and 35. Both found the same five in-window PRs; none was a draft, bot-authored or already labelled `ai-reviewed`. [#11028](https://github.com/adobe/react-spectrum/pull/11028), "nov release notes", is excluded as a release PR. #11030 carries a `release` label but is a Lightbox component follow-up, not release-note preparation; it receives only the member entry.

Membership was checked before diffs, CI, linked issues or discussions. The two skipped PRs have `MEMBER` association. #11033 has `CONTRIBUTOR` and #11031 has `NONE`; neither proves core membership. Their collaborator-permission GETs both returned HTTP 403, "Must have push access to view collaborator permission." No CODEOWNERS exists in the three standard paths on `origin/main`. Core membership for these two authors therefore remains unverified and normal triage was used.

Analysed heads were unchanged at final refresh: #11031 `0e6206b586af57cbc64c41f9583658af3bea78d8`; #11033 `230fb85c6bd529a812c1479424c1d51c169dda4b`. Member discovery heads: #11030 `ebc7728e243181080e145895ac850584561c3ebb`; #11027 `e3fd680bbc241e324321f1ac7c812093b465af69`.

Duplicate discovery used all-state exact-reference and behaviour searches (`11029`, `PromptTokenField Escape`, `PromptField completion`, `TabsKeyboardDelegate`) plus recently updated Tabs/keyboard results since 2026-10-25. These searches were paginated and reported no incomplete-results flag; indexed discovery is not proof that no duplicate exists. Related candidates were compared against descriptions, file lists and baseline source rather than similar titles alone.

### Boundaries and read failures

Dry run: GitHub access used only permitted `gh pr view`, `gh pr diff`, `gh issue view` and explicit `gh api --method GET`. No comments, reviews, labels, edits, closures, assignments, notifications, gists, issues, PR creation or other GitHub writes occurred. No PR branch, patch, contributor URL, reproduction, dependency, script or test was checked out, opened or executed.

Every analysed non-member PR has one "Would have done" block. The member exception requires the one-line skipped entry only. Existing labels are preserved; all proposed labels exist in the repository. Neither analysed diff changes workflows, manifests, lockfiles, install scripts or build configuration, so no file-triggered "needs security review" flag applies.

Required synchronization and GitHub discovery succeeded. Membership permission reads failed as described above. Two exploratory `git show` reads assumed nonexistent AI entry paths (`src/index.ts` and `exports/PromptField.ts`); trusted tree/package discovery recovered the actual `exports/index.ts`, and public-type exposure was verified there. An optional literal-text grep of the generated Tabs API page returned no matches and interrupted a chained read; the page and remaining baseline reads were subsequently recovered. These failures are not represented as successful verification.

### Synchronization and commit bookkeeping

Verified the dedicated checkout `/Users/darobins/dev/react-spectrum-triage`, branch `triage_support`, no in-progress merge or index lock, empty index, absent target digest and no other active issue/PR triage run. Session activity and branch/index/target safeguards were repeated before writing. Today's issue digest already exists, but its run is idle; it was not modified.

`git fetch origin` succeeded. No tracked changes existed outside `.github/triage`; `git merge origin/main --no-edit` returned "Already up to date." Synchronized `origin/main`: `b1e8cf579fcc4cda0031f09d7d4e3bdff299fc3a`. Pre-digest HEAD: `c38d6e50e953105ab595466367d7196c6cab2a9a`. No conflict or skipped merge.

Digest: `/Users/darobins/dev/react-spectrum-triage/.github/triage/tmp-digests/triage-prs-2026-11-25.md`.

Only this exact digest is to be staged after another empty-index check and committed as `chore: add PR triage digest 2026-11-25`, with the prescribed Copilot co-author trailer. The resulting commit hash and single-file contents are verified and reported separately to avoid a self-referential edit. The local setup.md adaptation remains untouched and unstaged; its pre-write blob hash is `a194d4c22c50544f28e10db1f99d70fd47c948de`. No branch switch, additional checkout or push occurred.
