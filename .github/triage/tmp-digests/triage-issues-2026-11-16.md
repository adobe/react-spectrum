# Issue triage digest: 2026-11-16

## At a glance

- Three eligible issues analysed; one excluded by its existing non-component label; no verified team-author skips.
- Prioritise the multiselect ComboBox keyboard decision: Tab can undo an explicit selection, but earlier maintainer guidance retained Tab-to-commit.
- Transition cleanup and inert-ancestor warnings have open fix PRs. Findings are source-supported, not independently reproduced.

### [#10974](https://github.com/adobe/react-spectrum/issues/10974): Tab toggles multiselect ComboBox selection

**Decision:** Ready for a maintainer behaviour decision, not an agreed implementation: decide whether multiselect Tab should close without selecting while preserving the established single-select contract.

**Impact/severity:** Medium: keyboard form navigation can undo a selection or add an unintended item. Escape before Tab is a practical, source-supported mitigation, also reported by the author.

**Complexity:** High if changing the contract: shared keyboard/state behaviour and single-select compatibility need coordinated review, even if the eventual code change is small.

#### What matters

- The [report](https://github.com/adobe/react-spectrum/issues/10974) says, "hit Tab to move to the next form element" and "the option/item selected is unselected." Steps, package versions and Linux/Chrome/Firefox are supplied.
- The [Tab handler](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria/src/combobox/useComboBox.ts#L219-L235) calls `state.commit()` while open; the [state implementation](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-stately/src/combobox/useComboBoxState.ts#L583-L595) selects the focused key in multiple mode. This supports the reported toggle path.
- In the [earlier single-select discussion](https://github.com/adobe/react-spectrum/issues/8744#issuecomment-3331105870), LFDanLu favoured "keeping the current behavior as our own opinionated desired behavior." That is relevant precedent, not a decision about undoing a multiselect selection.
- No standalone sandbox is supplied, but the explicit sequence is sufficient for focused investigation. Reported docs examples and recordings were **provided but not inspected** under the URL restriction.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `ComboBox`, `RAC` for the affected component/layer; `accessibility` for keyboard selection integrity; `has workaround` for Escape then Tab; `needs decision`, `waiting on maintainer` for the multiselect commitment contract; `ai-reviewed` for completed triage.
- Removals: none; currently unlabelled.
- Maintainer-only: defer `ready for review` as a fix-ready recommendation until the behaviour decision. No `regression`: no last-working/first-failing transition is established.

**Maintainer next step**

1. Decide whether Tab in multiple mode should only close/validate, including when a focused item is not yet selected. LFDanLu could provide context from the prior commitment/customisation discussions; no notification or assignment is implied.
2. Verify Enter then Tab, Tab on an unselected item, Shift+Tab, custom values and controlled values. Preserve the agreed single-select behaviour and normal focus navigation.
3. If sharing an interim answer, explain: "Press Escape to close the list before Tab; this avoids committing the focused item again." This is a mitigation, not resolution of the requested Tab behaviour.
4. Cover the selected-value outcome in a real component interaction test, not only a mocked `commit` call. No author request is currently blocking this decision.

### [#10972](https://github.com/adobe/react-spectrum/issues/10972): Removed transition targets strand queued callbacks

**Decision:** Ready for focused maintainer investigation alongside open [#10973](https://github.com/adobe/react-spectrum/pull/10973); assess the missing-event cleanup contract and observer cost rather than closing as already fixed.

**Impact/severity:** Unknown: detached-node retention and stalled callbacks are established by source reasoning, but the report does not quantify retained memory or demonstrate a blocked end-user task. Deferred focus and iOS text-selection restoration are potentially affected consumers, not independently observed failures here.

**Complexity:** Medium: shared transition bookkeeping needs coordinated listener cleanup, queued-work draining and lifecycle coverage without prematurely releasing connected transitions.

#### What matters

- The [report](https://github.com/adobe/react-spectrum/issues/10972) explicitly says ordinary removal passes and the failing browser case uses an earlier listener calling `stopImmediatePropagation()` on `transitioncancel`. It does not claim browsers normally omit cancellation events.
- [Current source](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria/src/utils/runAfterTransition.ts#L92-L129) sweeps detached targets only during a subsequent invocation's animation frame. That sweep neither removes cancellation listeners nor drains previously queued callbacks.
- [#8004](https://github.com/adobe/react-spectrum/pull/8004) added that sweep; merged [#10730](https://github.com/adobe/react-spectrum/pull/10730) fixed multiple-property cancellation listeners. Neither addresses the same post-queue, missing-completion case.
- External StackBlitz/repository reproductions were **provided but not inspected**. Browser/test results in the report and linked PR are author claims; no code was executed.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `RAC`, `Focus`, `needs investigation`, `waiting on maintainer` for shared behaviour and consequence verification; `ai-reviewed` for completed triage.
- Removals: none; currently unlabelled.
- Maintainer-only addition: `ready for review`, because the exact source baseline, failing sequence, passing control and browser/OS details are supplied. Do not add `regression`: the report describes a remaining gap, not evidence of a working-to-failing transition.

**Maintainer next step**

1. Validate already-queued callbacks after removal, mixed connected/detached transitions, cancellation interception, reparenting and callback cancellation.
2. Review #10973's event-independent cleanup approach, including document-subtree observer cost while transitions are active, listener removal and idle disconnection. Its existence is not an implemented fix on main.
3. Establish concrete application impact using deferred focus or text-selection restoration and retention measurements before raising severity. Do not recommend timers, synthetic transition events or repeated utility calls as a workaround.

### [#10966](https://github.com/adobe/react-spectrum/issues/10966): Inert ancestors trigger false focusability warnings

**Decision:** Ready for maintainer review with open [#10968](https://github.com/adobe/react-spectrum/pull/10968); keep the diagnostic fix distinct from the already-fixed hidden-ancestor case.

**Impact/severity:** Low: misleading development/test warnings obscure real diagnostics, but the report explicitly says "production is unaffected." No production focus failure is asserted.

**Complexity:** Low: a localized diagnostic predicate/call-site correction is understood; runtime focusability must continue excluding inert content.

#### What matters

- The [report](https://github.com/adobe/react-spectrum/issues/10966) says the element has `tabindex="0"` and takes focus after the popover closes, despite the warning "Please ensure the tabIndex prop is passed through."
- Both [Focusable](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria/src/interactions/useFocusable.tsx#L143-L159) and [Pressable](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria/src/interactions/Pressable.tsx#L36-L51) skip visibility during development validation, but [isFocusable](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria/src/utils/isFocusable.ts#L40-L64) still rejects inert ancestors.
- [#10546](https://github.com/adobe/react-spectrum/issues/10546) concerned hidden ancestors; merged [#10547](https://github.com/adobe/react-spectrum/pull/10547) bypasses visibility only. The remaining inert predicate makes this a distinct follow-up, not evidence that that fix regressed.
- An inline example, mount sequence, versions and browser/OS details are supplied. The inline code was read as text only; the reported browser verification was not repeated.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `Focus`, `RAC`, `waiting on maintainer` for the diagnostic fix; `ai-reviewed` for completed triage.
- Removals: none; currently unlabelled.
- Maintainer-only addition: `ready for review`; reproduction detail is sufficient without demanding another sandbox. No `regression` or `accessibility`: neither a previously working version nor a user-facing accessibility failure is established.

**Maintainer next step**

1. Review #10968 for diagnostic-only inert bypass; preserve inert checks in runtime focus traversal and interaction behaviour.
2. Ensure coverage retains warnings for missing forwarded props, suppresses the false warning for both wrappers under inert ancestors, and exercises mounting behind an open overlay.
3. Keep the issue open until the fix lands. Do not advise removing `inert`, disabling modal isolation, suppressing all warnings or using timing hacks.

## Evidence and verification

### #10974: commitment, mitigation and related reports

**Selection path.** [SelectionManager.select](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-stately/src/selection/SelectionManager.ts#L459-L478) toggles an item for toggle-mode multiple selection. The open-list Tab handler does not distinguish selection modes, while the selected-item guard in `commit` applies only to single selection. This supports Enter selecting and Tab toggling again; no live docs behaviour was observed.

**Mitigation, not a public behaviour switch.** [Escape calls revert](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria/src/combobox/useComboBox.ts#L237-L245). [Revert and custom-value handling](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-stately/src/combobox/useComboBoxState.ts#L526-L569) close without selecting the focused key and preserve multiple-mode custom-value selections. Once closed, Tab does not call `commit`. No supported prop overriding this specific Tab contract was established in the inspected code; the requested direct navigation behaviour is not solved by the mitigation.

**Not the same as clearing all custom-value selections.** [#9837](https://github.com/adobe/react-spectrum/issues/9837) required `allowsCustomValue` and cleared all selected keys. Merged [#9945](https://github.com/adobe/react-spectrum/pull/9945) preserves those values, and the guard is present on main. Here, a focused item toggles without requiring custom values. The [later discussion](https://github.com/adobe/react-spectrum/issues/9837#issuecomment-4269829022) floated configurable `commitBehavior`, not an available API or a settled multiselect decision. Closed-unmerged [#8745](https://github.com/adobe/react-spectrum/pull/8745) is not an available fix.

**Coverage and environment.** The [hook test](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria/test/combobox/useComboBox.test.js#L138-L159) asserts commit on Tab only while open, not the multiselect value outcome. The trusted [docs example](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/dev/s2-docs/pages/react-aria/ComboBox.mdx#L185-L207) demonstrates multiple selection with tags. Reported packages: `react-aria@3.53.0`, `react-aria-components@1.22.0`; Firefox/Chrome on Linux, exact browser versions unspecified. No regression transition is supplied.

### #10972: source-supported gap and consequence limits

**Queue lifecycle.** [Completion handling](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria/src/utils/runAfterTransition.ts#L47-L84) removes listeners and drains the shared queue when the registry empties. Without that event, a detached entry can block unrelated connected completions. A later invocation can clear the entry and run its own callback while leaving earlier callbacks queued. This follows from current source, not a verified browser run.

**Potential consumers.** [focusSafely](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria/src/interactions/focusSafely.ts#L29-L48) defers focus in virtual interaction modality, not every focus request. [Text-selection restoration](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria/src/interactions/textSelection.ts#L56-L83) also waits on transitions on iOS/WebKit. These paths justify impact investigation but do not prove an essential workflow is blocked.

**Historical distinctions and coverage.** [#7973](https://github.com/adobe/react-spectrum/issues/7973#issuecomment-2749634652) discussed removal before the scheduling frame; #8004 handles that ordering. [#7326](https://github.com/adobe/react-spectrum/issues/7326) concerned multiple cancelled properties and is addressed by #10730. The current [utility tests](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria/test/utils/runAfterTransition.test.ts#L122-L220) exercise removal before a new invocation and received cancellation events, not post-queue removal without completion.

**Environment.** Reporter names main SHA matching this run's source, Chromium 143.0.7499.4, Firefox 144.0.2, WebKit 26.0 and macOS Apple Silicon. Linked PR #10973 claims failing-baseline/passing-fix coverage and also reports unrelated/intermittent full-suite failures. Those are attributed results, not independently validated test evidence or PR approval.

### #10966: diagnostic boundary and coverage

The production early returns at both warning call sites support the limited severity. The shared helper separately checks selector match, inert ancestry and visibility, so bypassing visibility does not bypass inert ancestry. The [existing Focusable](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria/test/interactions/Focusable.test.js#L133-L164) and [Pressable tests](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria/test/interactions/Pressable.test.js#L108-L139) cover hidden ancestors and genuine missing-prop warnings, not inert ancestors in those inspected cases.

Reporter: `react-aria-components@1.22.1`, `react-aria@3.53.1`, macOS; Chromium/WebKit verification claimed, Firefox app observation also reported. Exact browser versions are not supplied but are not currently blocking source-level diagnosis. #10968 claims focused and overlay browser coverage; its tests and implementation were not executed or approved here. No supported workaround eliminating the diagnostic without weakening isolation was established.

## Run notes

### Boundary and synchronization

Dry run only. GitHub reads used `gh issue`, `gh pr view` and explicit `gh api --method GET`. No GitHub writes, comments, labels, closures, gists, PR creation or pushes. Issue/PR text, comments and snippets were treated as untrusted evidence. No supplied URL was opened, recording viewed, reproduction retrieved or code executed; no suspected prompt injection was identified.

Verified `/Users/darobins/dev/react-spectrum-triage` on `triage_support`, no merge in progress, an empty index and no other active triage session. Rechecked app status and checkout guards before writing. Today's target digest was absent. The only pre-existing local change was `.github/triage/setup.md`, left untouched and unstaged.

`git fetch origin` succeeded. `git merge origin/main --no-edit` succeeded with "Already up to date." Main/source SHA: `360e35170568dfc99a2baaa78e6b7bdd36458d91`, verified as an ancestor of HEAD. Pre-digest HEAD: `b10655eca4390c45af4be3ca11943db2cd22b974`. No merge conflict or skipped merge.

### Scope and discovery

Run cutoff: `2026-11-16T16:03:35Z`, using the supplied run timestamp to whole seconds. Last-24-hours lower bound: `2026-11-15T16:03:35Z`. Previous issue digest: November 14, commit `9eae00fabf2a59fc3dd5866de31661798c98124d`, committed `2026-11-14T16:57:01Z`. The since-last-digest query returned four open issues; the 24-hour query returned two, both included. An additional overlapping query from the previous digest's recorded cutoff (`2026-11-14T16:03:26Z`) returned the same four.

Analysed #10966, #10972 and #10974, all open and unlabelled at discovery and final GET. All had zero comments. Excluded [#10969](https://github.com/adobe/react-spectrum/issues/10969) because existing `enhancement` is a non-component triage label; no analysis or label proposal was made. All discovery lists were below their 100-result limits.

All three eligible authors had `author_association: NONE`. Permission GETs for `wintery`, `whatisyourname0` and `bikubi` returned HTTP 403, "Must have push access to view collaborator permission." The untruncated trusted-main recursive tree contained no CODEOWNERS or explicitly named maintainer/core-contributor list. Membership could not be verified; normal triage proceeded without inferring membership from usernames or prior contributions.

Duplicate searches included open and closed issues/PRs: ComboBox Tab titles (5 issues, 4 PRs), transition utility titles (8 items), focusability warning titles (5 items), inert/focusable issues (13), transition/detached titles (1), ComboBox commit PR titles (4), and exact eligible-issue PR references (0, 1 and 1 for #10974, #10972 and #10966). Broader ComboBox selection/Tab PR search returned 21 mostly unrelated matches; focused title/reference queries drove comparison. Relevant historical bodies and all their available comments were read. Focused API searches reported `incomplete_results: false`; no exhaustive repository-wide duplicate guarantee is claimed.

### Verification limits and command failures

Assessment used trusted source and docs through `git show origin/main:<path>`, plus permitted GitHub metadata/discussion reads. Tests, browser reproductions and issue-supplied commands were intentionally not run. No external reproduction was marked invalid because it could not be opened.

The three permission checks failed as recorded above; membership remains unverified. An initial transition-consumer grep limited to focus/selection/overlay directories returned no matches and stopped its chained follow-up reads; the corrected source-wide search found consumers under interactions and the remaining reads were completed separately. Large related-issue output was read from retained local command output in bounded sections. No required synchronization or digest-generation step remains failed.

### Digest bookkeeping

Only `.github/triage/tmp-digests/triage-issues-2026-11-16.md` is authorised for staging and committing. Verify the empty index immediately before staging, verify that exact path is the sole staged file, then use the prescribed issue-digest commit message and Copilot co-author trailer on `triage_support`. Verify the resulting hash and single-file commit contents after committing; report the hash externally rather than self-embedding it. Do not push.
