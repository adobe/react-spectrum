# PR triage digest: 2026-11-24

## At a glance

- Seven new open, non-draft human PRs: six analysed and one verified member skipped.
- Tabs adds a public wrapping option without focused tests; NumberField has competing fixes and a disclosed blur-compatibility change.
- Two unsigned CLAs block readiness. Popover and searchable Select still need coverage or scope decisions; FocusScope is ready for substantive review.

### [#11018](https://github.com/adobe/react-spectrum/pull/11018): Tabs delegate inheritance and configurable wrapping

**Decision:** Not ready; settle the API and add targeted compatibility tests before substantive review.

**Complexity:** High, changing shared keyboard delegation and hook-to-RAC API wiring.

**Impact/severity:** Low, an optional capability for Wizard navigation; no essential task is shown to be blocked in existing Tabs.

**Merge risk:** High, constructor/inherited-method changes and a new public option have no added tests or verification instructions.

#### What matters

- [`useTabList.ts`](https://github.com/adobe/react-spectrum/pull/11018/files) adds `shouldFocusWrap?: boolean`, defaulting to `true`; RAC Tabs inherits the prop and forwards it. The exported delegate changes from positional constructor arguments to an options object.
- The [Wizard discussion](https://github.com/adobe/react-spectrum/pull/10794#discussion_r4591475078) supports extracting this work, but the PR's cited comment is only "?". This is a prerequisite/refactor, not a duplicate of the larger Wizard PR.
- `TabsKeyboardDelegate.ts` adds four `@ts-expect-error` declarations to make inherited methods optional. The refactor also inherits disabled-item semantics; preserving old keyboard behavior needs explicit evidence.
- [Merged RTL fix #10467](https://github.com/adobe/react-spectrum/pull/10467) establishes the vertical ArrowLeft/Right contract. No tests/docs are changed here, although the new wrapping option needs both.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `ai-reviewed`, recording this revision's limited triage; `merge-risk: high`, for API and delegate compatibility exposure.
- Bot-eligible addition: `needs decision`, asking whether configurable wrapping and changed delegate semantics are the intended prerequisite for Wizard.
- Addition: `needs API review`, for `shouldFocusWrap` and the exported delegate signature.
- Addition: `waiting on author`, for focused tests and API verification instructions. Preserve existing `Tabs` and `RAC`; no removals.

**Maintainer next step**

1. Confirm the wrapping API and expected disabled-item behavior with the Wizard reviewers.
2. Request wrapping on/off, horizontal/vertical LTR/RTL, all-disabled and keyboard-activation tests, plus a documented example of the new prop.
3. Review the optional-method typing rather than treating successful CI as proof that the suppressions preserve the delegate contract.

### [#11023](https://github.com/adobe/react-spectrum/pull/11023): NumberField correction announcements during React commits

**Decision:** Needs a compatibility decision; provisionally prefer this broader fix over #11000, subject to validating the changed blur contract.

**Complexity:** Medium, shared NumberField announcement timing with cross-layer tests.

**Impact/severity:** Medium, screen reader users miss corrected values in booking-form interactions; ordinary Tab/button blur provides an alternate path.

**Merge risk:** High, removing synchronous blur flushing changes DOM values observable by consumer `onBlur` handlers.

#### What matters

- [`useNumberField.ts`](https://github.com/adobe/react-spectrum/pull/11023/files) replaces blur `flushSync` with `commit()` plus a microtask announcement. Enter retains synchronous flushing; no new prop/export or DOM structure is introduced.
- The author explicitly discloses that `onBlur` now reads typed `9`, not clamped `8`. [Maintainer direction](https://github.com/adobe/react-spectrum/issues/10935#issuecomment-7021945937) supports trying the approach, not silently accepting that compatibility trade-off.
- Both this PR and [#11000](https://github.com/adobe/react-spectrum/pull/11000) have signed CLAs. This PR covers Calendar and mounting `autoFocus` inputs; #11000 defers Calendar focus only and cannot address the generic mounting-input trigger.
- Tests assert corrected text, `onChange`, announcement and absence of React warnings. Real browser/screen reader verification is expressly absent; the related disabled-field issue #10044 remains unverified.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `ai-reviewed`, recording analysed revision and gaps; `merge-risk: high`, for consumer-visible blur timing.
- Bot-eligible addition: `needs decision`, asking whether the asynchronous blur DOM contract is acceptable and whether #11023 should supersede #11000.
- Addition: `needs API review`, for changed observable `onBlur` behavior. No removals.

**Maintainer next step**

1. Prefer #11023 for root-cause coverage, but decide the blur compatibility contract before accepting it.
2. Request real-browser/screen-reader confirmation and a controlled-field check, including #10044's disable-on-change case; do not claim that separate stale-closure problem is fixed.
3. If the broader approach is accepted and verified, recommend closing #11000 in its favour. Otherwise retain both pending the decision.

### [#11020](https://github.com/adobe/react-spectrum/pull/11020): Preserve popover scroll position during repositioning

**Decision:** Not fully ready; obtain virtual-focus coverage and agree how to track the explicitly unfixed Windows reposition loop.

**Complexity:** Medium, shared positioning behavior and a new virtual-focus anchor lookup.

**Impact/severity:** High for the reported Windows scenario, where lower options become unreachable or keyboard focus moves out of view; no demonstrated complete workaround covers all reposition paths.

**Merge risk:** Medium, changing scroll restoration across overlays with incomplete virtual-focus verification.

#### What matters

- [`useOverlayPosition.ts`](https://github.com/adobe/react-spectrum/pull/11020/files) restores saved `scrollTop` without an anchor and resolves `aria-activedescendant` for virtual-focus anchors. No public API, markup or CSS-variable change is added.
- The [issue discussion](https://github.com/adobe/react-spectrum/issues/10964#issuecomment-6970147677) explicitly suggests both paths. The browser test exercises only the unfocused mouse-scroll path; virtual focus is author-reported manual verification.
- The author excludes the continuous Windows `visualViewport` loop while using `Closes #10964`. That issue should not disappear without retaining the remaining problem.
- [#9168](https://github.com/adobe/react-spectrum/issues/9168) describes matching scroll bounce; [#10230](https://github.com/adobe/react-spectrum/issues/10230) is a related inline Autocomplete report. Their external reproductions were provided but not inspected, so equivalence is not established.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `ai-reviewed`, recording limited analysis; `merge-risk: medium`, for shared scrolling and virtual-focus gaps.
- Bot-eligible addition: `needs decision`, asking whether this partial fix should close #10964 or leave/factor out the continuous reposition loop.
- Addition: `waiting on author`, for automated virtual-focus anchor coverage. No removals.

**Maintainer next step**

1. Request a ComboBox keyboard test that preserves the highlighted option's offset, including a shadow-root case for the new lookup claim.
2. Retain #10964 or explicitly track its loop separately before allowing its closing reference to retire the entire report.
3. Compare #9168 and #10230 on an approved reproduction surface before recommending duplicate closure.

### [#11019](https://github.com/adobe/react-spectrum/pull/11019): Resynchronise searchable Select focus before Enter

**Decision:** Not ready; verify the single-select and multi-select contract and review the shared focus-event change. CLA is a separate blocker.

**Complexity:** High, changing core collection focus coordination consumed across selection components.

**Impact/severity:** Medium, fast typing breaks keyboard selection; documented non-virtual focus provides an alternate Tab-based path.

**Merge risk:** Medium, a narrow event dispatch in shared collection code with only single-selection regression coverage.

#### What matters

- [`useSelectableCollection.ts`](https://github.com/adobe/react-spectrum/pull/11019/files) dispatches virtual focus when the first key already matches the input's active descendant, allowing Autocomplete to replace a stale queued descendant. No new API or markup is added, but synthetic focus-event delivery changes.
- The new rendered test types `33` quickly and verifies Enter closes the popup, selects Item 33 and restores trigger focus. It covers the exact stale-queue sequence described in [#8938](https://github.com/adobe/react-spectrum/issues/8938#issuecomment-3344861044).
- [Maintainer discussion](https://github.com/adobe/react-spectrum/issues/8938#issuecomment-3403772563) suggests passing queue information through `FOCUS_EVENT`; this implementation instead infers it from collection-side DOM state. That is an approach difference to review, not evidence of rejection.
- The issue includes multi-select toggling, which the author has not covered. CLA is `ACTION_REQUIRED`; manual browser/screen-reader verification is also absent.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `ai-reviewed`, recording core-focus analysis limits; `merge-risk: medium`, for shared focus events and incomplete selection coverage.
- Addition: `waiting on author`, specifically for multi-select toggle coverage, not for CLA. No removals.

**Maintainer next step**

1. Request the same rapid-refilter scenario in multi-select toggle mode and an assertion that `aria-activedescendant` remains valid after its pending delay.
2. Have collection/Autocomplete reviewers compare the inferred-state dispatch with the proposed queue-aware event approach, including screen reader announcement ordering.
3. Keep CLA follow-up with the separate automation; no waiting label or comment is proposed for CLA itself.

### [#11017](https://github.com/adobe/react-spectrum/pull/11017): Do not reselect an input after collection focus moves

**Decision:** Ready for substantive maintainer review; the guarded selection matches the reported focus-restoration failure.

**Complexity:** Low, one localized FocusScope guard with a rendered browser regression test and no API change.

**Impact/severity:** Low for the reporter's confirmed transient focus flash; persistent keyboard blockage is an author claim, not independently established.

**Merge risk:** Medium, shared focus containment needs a browser spot-check, especially Tree and WebKit beyond the supplied GridList case.

#### What matters

- [`FocusScope.tsx`](https://github.com/adobe/react-spectrum/pull/11017/files) calls `select()` only when the next element is an input and remains the active element after its focus handler. This retains normal focused text-input selection without stealing focus back from a row.
- The GridList/Dialog browser test follows Tab, ArrowDown, Shift+Tab, Tab and asserts both final row focus and no later focus target after that row. It plausibly catches Chrome's `select()` refocus that jsdom cannot model.
- The [maintainer's inline requests](https://github.com/adobe/react-spectrum/pull/11017#discussion_r4672122294) concern redundant test comments; the current diff removes them and the author has replied. No substantive unaddressed review request is visible.
- No added suppression, timing workaround, inaccessible workaround, public API or markup change was found. The Tree reproduction and WebKit behavior were not independently verified.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `small review`, for the localized guard; `ai-reviewed`, for completed low-complexity triage; `merge-risk: medium`, for shared browser-sensitive focus behavior.
- Maintainer-only recommendation: `ready for review`, because the problem, focused test and signed CLA are present. No removals.

**Maintainer next step**

1. Review the guard and spot-check the Tree/Dialog path plus ordinary text-input selection in Chrome and WebKit.
2. Do not recommend disabling FocusScope containment as a workaround: modal keyboard containment must remain intact.

### [#11026](https://github.com/adobe/react-spectrum/pull/11026): Ignore Safari's composition-ending shortcut keydown

**Decision:** Otherwise ready; CLA is handled by separate automation. Review the Safari IME fallback with the supplied test instructions.

**Complexity:** Medium, a tiny predicate change affecting shared shortcut handling and overlay dismissal.

**Impact/severity:** High for affected Safari IME form entry: cancelling a candidate can close an overlay and lose typed work; no practical supported complete workaround is established.

**Merge risk:** Medium, browser-specific `keyCode` handling is covered by synthetic events rather than a real Safari IME session.

#### What matters

- [`useKeyboard.ts`](https://github.com/adobe/react-spectrum/pull/11026/files) treats `keyCode === 229` as composing alongside `isComposing`, unless `allowComposing` is true. This changes shortcut filtering, not user `onKeyDown` callbacks or public API.
- [#11025](https://github.com/adobe/react-spectrum/issues/11025) provides concrete event and Japanese IME steps. The new tests cover ignored/allowed keydowns and Escape overlay closure; local execution claims were not independently run.
- [Merged #5923](https://github.com/adobe/react-spectrum/pull/5923) only checked `isComposing`. It is related prior work, not a duplicate fix for Safari's `isComposing: false`, `keyCode: 229` case.
- CLA is `ACTION_REQUIRED`. No last-known-working Safari version is supplied, so a `regression` label is not justified by the earlier IME fix alone.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `ai-reviewed`, recording limited shared-hook triage; `merge-risk: medium`, for real-browser IME uncertainty. No removals.
- Maintainer-only recommendation: `ready for review` after CLA is signed, since no other author blocker was identified.

**Maintainer next step**

1. Confirm composition commit/cancel does not dismiss the overlay in Safari, while ordinary Escape still closes it and `allowComposing` remains an explicit opt-in.
2. Leave CLA follow-up to its separate automation. Confirm a working/failing version transition before proposing `regression`.

## Member PRs skipped

- [#11021: Lightbox followup](https://github.com/adobe/react-spectrum/pull/11021), author association `MEMBER`; `rsp-core` proposed; analysis skipped (member PR).

## Evidence and verification

### #11023: Competing NumberField fixes

Both #11023 and #11000 target #10935 and have successful CLA checks, so correctness and test coverage decide the preference, not signing status or submission order. #11000 changes `useCalendarCell` only when the active element is an input. #11023 changes the common NumberField blur path and includes an unrelated mounting-input trigger, ordinary blur and calendar interaction. It also acknowledges the changed synchronous DOM-read contract rather than concealing it.

The [#10935 discussion](https://github.com/adobe/react-spectrum/issues/10935#issuecomment-7019186650) distinguishes regular blur during a Calendar effect from the synthetic disabled-input blur in [#10044](https://github.com/adobe/react-spectrum/issues/10044). The latter also has a stale-closure problem. Closed, unmerged [#10861](https://github.com/adobe/react-spectrum/pull/10861) is not an existing released fix; its body describes an earlier approach, while its final file list includes `interactions/utils.ts` and focus tests. No claim is made that #11023 fixes that entire issue.

The author reports jsdom verification on React 19.3, 18.3 and 17, with local Windows resolver changes excluded from the PR. React 16, browser, SSR and screen reader checks were not performed locally. GitHub currently reports successful CI contexts, including browser/SSR names, but those statuses do not establish a real screen reader correction announcement or inspect the underlying CI execution.

### #11020: Overlap and incomplete scope

The measured reset in #10964 occurs above or below the trigger, whereas #9168 attributes bounce to flipping. That supports overlap, not proof of identical cause. #10230 reports Windows Chrome/Brave inline Autocomplete scrolling, but reports its standalone StackBlitz working. Closed [#10867](https://github.com/adobe/react-spectrum/pull/10867) instead changes nested scrollport styling; it is not equivalent to restoring transiently clamped scroll offsets.

`origin/main` still restores anchors only when real focus is within the scroll container. Reserving a page scrollbar reportedly stops the repeating Windows loop, but does not prove that an explicit resize avoids temporary max-height clamping. Disabling flipping is not a complete solution for both placements. The new test's `requestAnimationFrame` waits for browser layout after resize; it is a test synchronization step, not a production timing fix.

### #11019: Supported alternate interaction

[Autocomplete documentation](https://react-aria.adobe.com/Autocomplete) states that `disableVirtualFocus` permits Tab-based navigation between input and list. For example, `<Autocomplete disableVirtualFocus filter={contains}>...</Autocomplete>` offers a supported alternate interaction, not an equivalent repair of virtual-focus Enter semantics. The issue's custom handler reaching into `selectionManager` is not endorsed here as a workaround.

Baseline source has the same stale-queue opportunity: `moveVirtualFocus` returns when source and destination match, while `useAutocomplete` maintains the delayed descendant separately. The supplied test directly observes popup selection, rather than only helper calls. [#10126](https://github.com/adobe/react-spectrum/issues/10126) concerns IME first-item focus and #11003 concerns pressing non-field popover content; neither describes this rapid numeric-refilter/Enter sequence.

### #11017: Existing behavior and limitations

Baseline `FocusScope` calls `select()` unconditionally after focusing an input; a collection can move focus synchronously before that call. The proposed active-element guard leaves ordinary focused input selection reachable and does not change ARIA or the tab-stop model. The browser test would expose an extra checkbox focus after row restoration by reasoning from its event assertions; the author reports failure before the fix and success in Chromium/Firefox.

[FocusScope documentation](https://react-aria.adobe.com/FocusScope) distinguishes `contain`, unmount `restoreFocus` and initial `autoFocus`; none prevents the unconditional post-focus `select()`. Removing containment would undermine the dialog rather than fix collection focus. The supplied StackBlitz was provided but not inspected. No historical working version establishes a regression transition, and no `regression` label is proposed.

### #11018 and #11026: Compatibility boundaries

#11018 must preserve #10467's vertical RTL contract: ArrowLeft moves next and ArrowRight previous, while ArrowUp/Down retain their directional meaning. Default wrapping remains `true`, but inherited delegate methods and disabled-item rules are separate compatibility questions. No full red-flag review was performed for this high-complexity refactor.

#11026's prior fix #5923 establishes only handling of events with `isComposing: true`; it does not establish that the Safari late-keydown case ever worked. Baseline `useKeyboard` retains that narrower predicate, and `useOverlay` routes Escape through it. Globally setting `isKeyboardDismissDisabled` would remove ordinary Escape behavior and is not recommended as a complete IME workaround.

## Run notes

### Scope, discovery and revisions

Window: the prior digest's final discovery cutoff, `2026-11-23T17:47:39Z`, through final discovery at `2026-11-24T16:17:56Z`. The previous digest is `triage-prs-2026-11-23.md`, committed as `e051ab62b63b2c555b3a60389d5210c4c34a3d7f` at `2026-11-23T17:48:02Z`. Using discovery time avoids a gap before its commit.

Initial and final `gh api --method GET repos/adobe/react-spectrum/pulls` discovery each paginated all 133 open PRs in pages of 100 and 33. Both found the same seven in-window PRs. None was a draft, bot/release PR or already labelled `ai-reviewed`. The member exception in step 0 requires the one-line skipped entry only; every analysed PR has its own "Would have done" block.

Analysed head revisions, unchanged at final refresh: #11018 `fc688197d35b4368d3603e3340311ed26e23490f`; #11023 `78158936629384019a1a3013bd186931cfba419e`; #11020 `6fe533a2b9e27079365d7578328f460729d367fe`; #11019 `e6f2860b25af5305a60634849072de3e8d2088a2`; #11017 `53be06daf840481e9826793a68a3f90bdbced6c7`; #11026 `a7a51c6ac04232bef6949a9adbae18a5e3bd047e`.

Membership was checked before diffs, CI, linked issues or discussion. #11021 has `MEMBER` evidence and received no substantive analysis. Other associations were `NONE` or `CONTRIBUTOR`; neither proves core status. All six collaborator-permission GETs returned HTTP 403, "Must have push access to view collaborator permission." Repository identity GET confirmed `adobe/react-spectrum` and a read-only account. No CODEOWNERS exists at `.github/CODEOWNERS`, `CODEOWNERS` or `docs/CODEOWNERS` in `origin/main`; member status for these six remains unverified, so normal triage was used as prescribed.

Duplicate discovery searched all states by linked issue numbers, `TabsKeyboardDelegate` and described behavior. Exact-reference searches were complete and identified #11000 as the direct competitor. Broad popover search results shifted between requests (109 initially, 65 on a later page request); a separate recent-update query returned 15 results with no incomplete flag. These indexed searches are candidate discovery, not proof of absence; all-open PR discovery used the paginated REST list instead.

### Analysis boundary and access failures

Dry run: GitHub access used only permitted `gh pr view`, `gh pr diff`, `gh issue view` and explicit `gh api --method GET`. No comments, reviews, labels, closures, edits, assignments, notifications, gists, issues, PR creation or other GitHub writes occurred. No contributor URL was opened and no PR branch, patch, code, reproduction, dependency, test or script was fetched into the checkout or executed.

Only #11017 received the full low-complexity red-flag review. Medium/high PRs received classification, limited summary/context, API/compatibility and duplicate assessment, with readiness and verification gaps retained. No analysed diff changes CI workflows, dependency manifests, lockfiles, install scripts or build configuration; no "needs security review" flag was triggered by those files. Existing labels are preserved, and every proposed label exists in the repository.

Required synchronization and final GitHub discovery succeeded. The initial whole-file instruction read exceeded the tool limit and a follow-up range began beyond EOF; bounded reads recovered the full file. The first #11023 diff read failed with a GraphQL TLS handshake timeout; the permitted retry succeeded. Optional documentation globs used two absent directories; subsequent discovery found the docs under `packages/dev/s2-docs/pages/react-aria`. Tool-output size limits were recovered with bounded reads. The initial structure validator mistakenly included the footer in the last PR block; the corrected boundary isolates PR notes. Membership permission failures remain the explicit limitation described above.

### Synchronization and commit bookkeeping

Verified `/Users/darobins/dev/react-spectrum-triage`, branch `triage_support`, no in-progress merge, empty index, absent target and no other active issue/PR triage run. Session activity and checkout/index/target safeguards were repeated before writing. Today's issue digest already exists, but its run was idle; no issue digest was modified.

`git fetch origin` succeeded. No tracked changes existed outside `.github/triage`; `git merge origin/main --no-edit` returned "Already up to date." Synchronized `origin/main` is `7743784aa065cd42bf0d144ddc5dd5e03e0e651f`; pre-digest HEAD is `43ef45940d69e6522ad5de04d0efaae58f2f91c1`. No conflict or skipped merge.

Digest: `/Users/darobins/dev/react-spectrum-triage/.github/triage/tmp-digests/triage-prs-2026-11-24.md`.

Only this exact file is to be staged after another empty-index check and committed as `chore: add PR triage digest 2026-11-24`, with the prescribed Copilot co-author trailer. The resulting hash and single-file commit are verified and reported separately to avoid a self-referential edit. The local setup.md adaptation remains untouched and unstaged; its pre-write blob hash is `a194d4c22c50544f28e10db1f99d70fd47c948de`. No branch switch, additional checkout or push occurred.
