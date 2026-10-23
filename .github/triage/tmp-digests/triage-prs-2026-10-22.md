| PR | Complexity | Red flags | Would label | Would comment | Would close / duplicate of | Confidence |
| --- | --- | --- | --- | --- | --- | --- |
| [#10828](https://github.com/adobe/react-spectrum/pull/10828) Breadcrumbs after font load | Low | Missing regression test; CLA action required | Would apply `small review`, `ai reviewed`, `small impact` | Would comment: test scenario and CLA | Would not close; no competing fix found | High |
| [#10835](https://github.com/adobe/react-spectrum/pull/10835) Sheet exit fallback | Medium | CLA action required; already-closed competing PR | Would apply `ai reviewed`, `small impact` | Would comment: CLA | Would keep this over closed #10829 | High |
| [#10830](https://github.com/adobe/react-spectrum/pull/10830) SearchField clear focus | High | CLA action required; intentional shared focus-contract change | Would apply `ai reviewed`, `medium impact`, `risk`, `needs API review` | Would comment: CLA and behavior-change documentation | Would not close; no competing fix found | High |
| [#10831](https://github.com/adobe/react-spectrum/pull/10831) Layout types | High | New public `Point` export hidden within a relocation | Would apply `ai reviewed`, `small impact`, `needs API review` | Would comment: identify public API addition | Would keep split; coordinate with #10556 | High |
| [#10836](https://github.com/adobe/react-spectrum/pull/10836) ToggleButton forms RFC | High (design) | Proposed API/DOM change; team signoff needed | Would apply `ai reviewed`, `needs API review`, `needs signoff` | Would comment: prior discussions and design decisions | Would not close; link related issues | Medium |
| [#10834](https://github.com/adobe/react-spectrum/pull/10834) Shadow-safe parent traversal | High | Existing `small review` understates cross-layer scope | Would apply `ai reviewed`, `large impact`, `risk`; would remove `small review` | No comment | Would keep split; coordinate with #10556 | High |
| [#10826](https://github.com/adobe/react-spectrum/pull/10826) Card anatomy closing tags | Low | CLA action required; reminder already posted | Would apply `ai reviewed`, `small impact`; retain `small review` | No comment; avoid duplicate CLA reminder | Would not close; no competing fix found | High |
| [#10832](https://github.com/adobe/react-spectrum/pull/10832) Type guards | Medium | No additional flag within limited review | Would apply `ai reviewed`, `small impact` | No comment | Would keep split; coordinate with #10556 | High |

Scope: open PRs created from **2026-10-21 22:26:35 UTC through 2026-10-22 22:26:35 UTC** (October 22, 15:26:35 PDT cutoff), excluding drafts, bot/release PRs, and PRs carrying `ai reviewed`. No prior digest was present in this session's artifacts folder, so the 24-hour window was used. Eight PRs qualified; all eight were non-draft human-authored PRs, with no release PRs or `ai reviewed` labels. The newest-first listing reached PRs older than the cutoff on its first 100-item page.

Read-only: GitHub data came exclusively from `gh` reads/explicit GET requests. No GitHub changes, review drafts, checkout changes, commits, pushes, or test runs were performed. This digest is the only file written.

Checks: the reported technical CI checks were successful for all eight PRs at inspection. `Adobe CLA Signed?` reported `ACTION_REQUIRED` for #10826, #10828, #10830, and #10835; it reported `SUCCESS` for the others. An action-required CLA check is not proof of why the CLA is unresolved.

## #10828 - Breadcrumbs after font load

**Low:** one S2 source file, +6/-4, no new API. The diff replaces captured `updateOverflow` callbacks with `useEffectEvent(updateOverflow)`, addressing the stale collection-size callback described in [#10817](https://github.com/adobe/react-spectrum/issues/10817).

- **Issue verification/discussion:** the issue reproduces three fitting crumbs in an 800px container collapsing after a delayed font finishes. Its sole [maintainer comment](https://github.com/adobe/react-spectrum/issues/10817#issuecomment-6303958449) explicitly recommends this effect-event approach; the PR follows it. The helper updates its callback ref in an early effect, making the deferred call use the committed current callback ([helper](https://github.com/adobe/react-spectrum/blob/main/packages/react-aria/src/utils/useEffectEvent.ts)).
- **Test quality:** [the complete changed-file list](https://github.com/adobe/react-spectrum/pull/10828/files) contains only `packages/@react-spectrum/s2/src/Breadcrumbs.tsx`; no regression test was added. A test should resolve the font-ready promise after the collection becomes populated and assert that the current crumb remains visible without a resize. It should fail with the old mount-captured callback and pass with this change; that is reasoning, not an executed before/after result.
- **Other red flags:** no added suppression, `as any`, non-null assertion, arbitrary timeout, or removed ARIA/keyboard behavior in the diff. `queueMicrotask(updateOverflowEffect)` replaces an existing `queueMicrotask(updateOverflow)` rather than adding a new timing workaround; the obsolete exhaustive-deps suppression is removed. CLA requires action ([checks](https://github.com/adobe/react-spectrum/pull/10828/checks)).
- **API/compatibility:** no prop/export/default, DOM-template, class, attribute, or CSS-variable changes. Intended observable behavior is keeping fitting crumbs visible after font completion.
- **Duplicates:** searches across open/closed issues and PRs for `breadcrumbs fonts` and `10817` found the source issue and this fix, but no competing fix. The issue's suggestion that TagGroup/Tabs might share the bug is not evidence that this focused PR must fix them.

**Would have done**
- **Labels:** would apply `small review` because the patch is localized; `ai reviewed` because this digest covered it; `small impact` because it fixes a font-loading edge case. Would remove none.
- **Comment:** would comment:
  > Thanks for following the useEffectEvent approach discussed in #10817. Please add a regression test that mounts three fitting breadcrumbs while document.fonts.ready is pending, lets the collection populate, then resolves font readiness and verifies all three crumbs, including the current page, remain visible without a resize. It should fail with the original captured callback. The Adobe CLA check also currently reports ACTION_REQUIRED; please complete the CLA steps so it can pass.
- **Close / link:** would not close; would retain the existing #10817 link. No duplicate closure proposed.
- **Other:** none; the approach already has team guidance and a PR approval.
- **Confidence:** high; a reproducible failing-before/passing-after test and a passing CLA check would clear the outstanding concerns.
- **Feedback prompt:** Is requesting a regression test worthwhile for this already-approved, ten-line fix?

## #10835 - Sheet exit fallback

**Medium:** a RAC component behavior change plus a new test, +53/-1 across two files. It allows Sheet exit completion on `scrollend` at the exit target when the final IntersectionObserver report is missed, while preserving the observer-event completion path ([diff](https://github.com/adobe/react-spectrum/pull/10835/files)).

**API/compatibility:** no new public signatures or markup/CSS contract changes in the diff; exit timing and overlay removal intentionally change in the stuck-exit case. The issue's [maintainer reply](https://github.com/adobe/react-spectrum/issues/10813#issuecomment-6331878724) calls the fallback reasonable and invites the author's PR, so no new signoff flag is warranted.

**Duplicates:** [#10829](https://github.com/adobe/react-spectrum/pull/10829) implements the same fallback for #10813 and is already closed, unmerged. Both add a synthetic missing-observer test, but #10835 explicitly holds back the smooth exit scroll and asserts `data-exiting` before finishing; #10829 additionally changes a dependency and lockfile, whereas #10835 touches only source/test. Most decisively, the [maintainer's closure comment](https://github.com/adobe/react-spectrum/pull/10829#issuecomment-6348930134) prefers the original reporter's fix because they have tested it in their CI environment. Would prefer #10835 on scope, reported real-environment evidence, and that explicit team decision; no need to choose by speculative author responsiveness.

**Operational blocker:** [CLA check](https://github.com/adobe/react-spectrum/pull/10835/checks) is `ACTION_REQUIRED`. Full low-complexity red-flag review was not performed.

**Would have done**
- **Labels:** would apply `ai reviewed` for this limited triage coverage and `small impact` for the missed-observer exit edge case. Would remove none.
- **Comment:** would comment:
  > The Adobe CLA check currently reports ACTION_REQUIRED. Please complete the contributor license agreement steps at https://opensource.adobe.com/cla.html so the check can pass.
- **Close / link:** would keep #10835 over #10829; would link the already-closed competing PR for context. Would close none because the duplicate is already closed.
- **Other:** none; team agreement on the fallback is already recorded. Patch-release suitability remains deferred until CLA and human review are complete.
- **Confidence:** high; a changed maintainer preference or evidence that the two fixes address materially different cases would change the duplicate recommendation.
- **Feedback prompt:** Is keeping the original reporter's focused fix the right duplicate disposition?

## #10830 - SearchField clear focus

**High:** this changes shared React Aria hook behavior consumed by RAC and Spectrum, despite a small source edit. Removing `onPressStart`'s `inputRef.current?.focus()` means clearing an unfocused field no longer focuses it, while `preventFocusOnPress: true` remains ([source diff](https://github.com/adobe/react-spectrum/pull/10830/files)).

**API/compatibility:** no new props or DOM/CSS shape changes, but this intentionally changes the existing clear-button focus contract across layers; would apply `needs API review` for that behavioral compatibility decision, not because a signature changed. The [issue discussion](https://github.com/adobe/react-spectrum/issues/10806) supports removing the handler, explicitly asks about preserving an already-open keyboard, and invites the PR; the [PR review](https://github.com/adobe/react-spectrum/pull/10830#pullrequestreview) says, "Tested on iOS Safari and it seems to fix it without regressions. LGTM."

**Duplicates:** searches for `SearchField clear focus` and `10806` found no competing fix for this issue. The similarly mentioned NumberField behavior in the issue is context, not a duplicate or a mandate to expand this PR.

**Operational blocker:** [CLA check](https://github.com/adobe/react-spectrum/pull/10830/checks) is `ACTION_REQUIRED`. The author's body reports unrelated local browser-test failures, but the current reported GitHub browser check is successful; this digest does not independently establish those local failures' causes. Full low-complexity red-flag review was not performed.

**Would have done**
- **Labels:** would apply `ai reviewed` for limited triage coverage; `medium impact` because a shared SearchField interaction changes across consumers; `risk` for focus side effects; `needs API review` for the changed interaction contract. Would remove none.
- **Comment:** would comment:
  > The Adobe CLA check currently reports ACTION_REQUIRED; please complete the CLA steps so it can pass. This also intentionally changes the shared clear-button focus behavior: clearing an unfocused SearchField no longer focuses its input. Please make sure that compatibility change is explicitly captured in the release note or API-review decision, while retaining the already-focused keyboard/cursor behavior verified in #10806.
- **Close / link:** would not close; would retain the existing #10806 link. No duplicate closure proposed.
- **Other:** would escalate the behavior-contract decision for API review, without asking the team to repeat its already-recorded iOS test.
- **Confidence:** high; a maintainer decision that this is strictly restoration of the supported contract would remove the API-review recommendation.
- **Feedback prompt:** Should an intentional shared focus-behavior fix receive `needs API review`, even with maintainer approval?

## #10831 - Layout types

**High:** new public API takes precedence over the relocation framing and small diff. This moves `Rect`/`Size` to `layout.d.ts`, preserves their root export via `export * from './layout'`, and additionally exports the new `Point {x: number; y: number}` type ([diff](https://github.com/adobe/react-spectrum/pull/10831/files)).

**API/compatibility:** `Point` is an additive public export from `@react-types/shared`; `Rect`/`Size` retain their shapes and root availability. Their definitions are removed from `collections.d.ts`, so direct imports of those types from that source subpath would need adjustment, but this digest has not established that such deep imports are a supported contract; no confirmed breaking root-API change or runtime DOM/CSS change.

**Duplicates:** the same layout files occur in open [#10556](https://github.com/adobe/react-spectrum/pull/10556), and this PR explicitly identifies itself as split `[1/3]`. The [maintainer request](https://github.com/adobe/react-spectrum/pull/10556#issuecomment-6331604296) asks for reorganization to be pulled out first; would keep this focused extraction, with #10556 updated afterward rather than closing it as a redundant feature PR. Searches for `layout types` found no other competing extraction.

**Would have done**
- **Labels:** would apply `ai reviewed` for limited triage coverage; `small impact` for a type-only change; `needs API review` because `Point` is a new root export. Would remove none.
- **Comment:** would comment:
  > This is not solely a relocation: layout.d.ts adds Point, and the new root export makes it public from @react-types/shared. Please confirm that this API addition is intentional and include it in API review, or keep this extraction limited to the existing Rect/Size types. Their root exports appear preserved.
- **Close / link:** would not close; would keep #10831 as the focused layout extraction and link #10556 as its parent workstream.
- **Other:** would escalate the new `Point` export for API review and coordinate landing/reconciliation with #10556.
- **Confidence:** high; removing `Point` or confirming it was already part of the intended approved public API would change the API-review recommendation.
- **Feedback prompt:** Is the additive `Point` export enough to classify this otherwise-small chore as high complexity?

## #10836 - ToggleButton form RFC

**High (design, not implementation):** the RFC proposes hidden checkbox/radio inputs and `form`, `name`, and `value` support, with ToggleButtonGroup values taking precedence over ToggleButton values. The [RFC's Detailed Design](https://github.com/adobe/react-spectrum/pull/10836/files) says the input "could" render only when `form` and/or `name` are provided, so the actual opt-in selector remains undecided.

**API/compatibility:** there is no shipped code change here, but the proposal would change public props, form serialization, and rendered DOM. "Existing users will inherit this new behavior" in the compatibility section does not resolve whether additional DOM/serialization is unconditional; would request API/team signoff before implementation rather than call the RFC an existing regression.

**Duplicates/prior agreement:** searches for `ToggleButton form` surfaced related closed [#4403](https://github.com/adobe/react-spectrum/issues/4403) and [#1264](https://github.com/adobe/react-spectrum/issues/1264), not a competing current implementation. #4403 was [closed in favor of #4377](https://github.com/adobe/react-spectrum/issues/4403#issuecomment-1515081580), but a [later comment](https://github.com/adobe/react-spectrum/issues/4403#issuecomment-3793948666) says ToggleButton was not covered; #1264's [maintainer explanation](https://github.com/adobe/react-spectrum/issues/1264#issuecomment-726306588) distinguishes toggle-button semantics from checkbox/switch semantics. These are relevant design context, not evidence that the team rejected this exact opt-in hidden-input design.

**Would have done**
- **Labels:** would apply `ai reviewed` for design-level triage coverage; `needs API review` for proposed public form props and DOM; `needs signoff` because the approach and opt-in boundary remain undecided. Would remove none.
- **Comment:** would comment:
  > Please link the related ToggleButton form discussions in #4403 and #1264. Before implementation, could the RFC settle whether the hidden input is rendered only when form/name opts in, how group versus item name/form/value precedence works, and how submission, disabled state, and form reset interact with selection? Please also distinguish the hidden serialization input from the existing accessible toggle-button semantics. That would make the API and compatibility decision reviewable without assuming the proposal is already approved.
- **Close / link:** would not close as a duplicate; would link #4403 and #1264 as prior context, not replace this RFC with those closed issues.
- **Other:** would escalate for team/API design signoff before implementation; no assignment proposed. Tests are not demanded for an RFC-only PR.
- **Confidence:** medium; an existing approved design decision or a revised RFC resolving the opt-in/semantics questions would change the signoff recommendation.
- **Feedback prompt:** Should RFC-only proposals get high-complexity/signoff labels, or a separate design-triage category?

## #10834 - Shadow-safe parent traversal

**High:** +583/-78 across 44 files, including React Aria focus/overlay/selection utilities, RAC, Spectrum v3/S2, and lint infrastructure. It introduces `getParentNode`/`getParentElement` and migrates parent traversal across layers rather than merely adding lint rules ([changed files](https://github.com/adobe/react-spectrum/pull/10834/files)).

**API/compatibility:** the helpers are added to `react-aria/exports/private/utils/shadowdom/DOMFunctions.ts`, a private export surface, not a newly established public prop API. The helper's `if (!shadowDOM()) return currentNode?.parentNode ?? null` preserves direct-node traversal in that branch; the other branch follows slots/shadow hosts, so traversal behavior can change where the flag enables it. No claim is made here about the flag's default or activation configuration, and no new markup, class, attribute, CSS-variable, or public prop signature was identified in the inspected diff.

**Duplicates/overlap:** this is split `[3/3]` from [#10556](https://github.com/adobe/react-spectrum/pull/10556), and overlaps that PR's traversal/scroll files and #10832's DOM-helper files. The [maintainer's split request](https://github.com/adobe/react-spectrum/pull/10556#issuecomment-6331604296) and approval on #10834 support retaining the split; shared files alone are not a reason to close the broader scroll work. Searches for `shadow parent` also found [#10729](https://github.com/adobe/react-spectrum/pull/10729), whose SelectionIndicator transition scope is not this parent-traversal migration.

**Would have done**
- **Labels:** would apply `ai reviewed` for limited triage coverage; `large impact` because many components share the migrated traversal; `risk` for shared focus/overlay/layout behavior. Would remove `small review` because 44 files and cross-layer behavior do not match a quick localized review. Would retain existing component and `ready for review` labels.
- **Comment:** no comment; would avoid duplicating the existing approval with an unsolicited broad review request.
- **Close / link:** would not close; would keep this extraction and link #10556/#10832 for overlapping landing order and reconciliation.
- **Other:** would flag cross-layer scope to the human reviewer, not treat the existing `small review` label as authoritative. No new API-review label proposed solely for private helpers.
- **Confidence:** high; narrowing the patch to lint-only enforcement or a team convention that `small review` measures only remaining reviewer effort would change the label-removal decision.
- **Feedback prompt:** Should `small review` be removed from an already-approved but objectively cross-layer change?

## #10826 - Card anatomy closing tags

**Low:** one docs file, +3/-3. All three changed lines replace `</CardView>` with `</CardPreview>` in AssetCard, UserCard, and ProductCard anatomy examples ([diff](https://github.com/adobe/react-spectrum/pull/10826/files), `packages/dev/s2-docs/pages/s2/Card.mdx`, new lines 291, 308, 327).

- **Issue verification/discussion:** [#10825](https://github.com/adobe/react-spectrum/issues/10825) names exactly these three mismatches and explains that copied JSX is invalid. The complete two-comment issue discussion consists of contributors offering to work on it; no maintainer scope constraint is contradicted.
- **Test quality:** this is correction of displayed docs examples, not runtime source. No interaction/integration test is needed for these three tag substitutions; the reported [S2 docs build](https://circleci.com/gh/adobe/react-spectrum/712152) succeeded. This does not independently verify the downstream generated agent-skill reference also mentioned by the issue.
- **Other red flags:** no suppression, type escape, new timing code, DOM workaround, or removed accessibility behavior in the three-line diff. The [CLA check](https://github.com/adobe/react-spectrum/pull/10826/checks) requires action, but a [maintainer already posted the exact reminder](https://github.com/adobe/react-spectrum/pull/10826#issuecomment-6339001923): "you'll need to sign the CLA".
- **API/compatibility:** no runtime/public API, DOM/CSS contract, prop, or default changes.
- **Duplicates:** searches for `CardPreview` and `10825` found the issue and this fix, with no competing fix for the mismatch. Offers to take the issue are not duplicate PRs.

**Would have done**
- **Labels:** would apply `ai reviewed` because the low-complexity review is complete and `small impact` for documentation-only correction. Would retain existing `small review`; would remove none.
- **Comment:** no comment; the maintainer's existing CLA reminder already covers the only blocker.
- **Close / link:** would not close; would retain the existing #10825 link. No duplicate closure proposed.
- **Other:** none; would regard this as ready for quick human merge consideration once CLA passes, not as merge-ready today.
- **Confidence:** high; evidence of an independently maintained generated skill file requiring a separate correction would expand the documentation follow-up.
- **Feedback prompt:** Is suppressing a redundant CLA reminder the right choice for this otherwise-ready docs fix?

## #10832 - Type guards

**Medium:** +59/-49 across seven React Aria files, with no demonstrated intended runtime behavior change. It moves the existing `isNode`, `isWindow`, `isDocument`, and `isShadowRoot` implementations into `typeHelpers.ts` and updates internal imports ([diff](https://github.com/adobe/react-spectrum/pull/10832/files)).

**API/compatibility:** the existing private `domHelpers` entry continues to re-export `isDocument` and `isShadowRoot`; a new private `typeHelpers` entry exports `isWindow`, `isDocument`, and `isShadowRoot`. Source-level `isNode` moves and `isWindow` becomes exported from the new internal module, but no supported public prop/export removal, changed guard logic, DOM/CSS contract, or default change is established by this diff.

**Duplicates:** the same extraction is present in [#10556](https://github.com/adobe/react-spectrum/pull/10556), with this PR explicitly marked split `[2/3]` in response to the [maintainer's request](https://github.com/adobe/react-spectrum/pull/10556#issuecomment-6331604296). Would keep the focused extraction, then reconcile #10556; the separate #10834 also edits `domHelpers.ts`, so would coordinate those changes rather than call either a duplicate. Searches for `type guards` found no other competing current extraction.

**Would have done**
- **Labels:** would apply `ai reviewed` for limited triage coverage and `small impact` for an implementation-preserving internal relocation. Would remove none; no `small review` proposed for a multi-file refactor.
- **Comment:** no comment.
- **Close / link:** would not close; would keep #10832 as the type-guard extraction and link #10556/#10834 for overlap.
- **Other:** would coordinate reconciliation with #10556 and #10834; no new team/API signoff proposed for preserved implementations and private entries.
- **Confidence:** high; a downstream supported import break or semantic change in a guard would raise risk and change the compatibility assessment.
- **Feedback prompt:** Is medium complexity appropriate for a seven-file internal relocation with preserved behavior?

## Rule feedback

- **Label creation:** `ai reviewed`, `small impact`, `medium impact`, `large impact`, `risk`, and `needs signoff` were absent from the paginated label inventory and would need creation before use. `small review` and `needs API review` already exist. No labels were created or applied.
- **Coverage wording:** only #10826/#10828 received the full low-complexity red-flag review. Medium/high entries received classification, two-sentence summaries, API/compatibility and duplicate assessment; CLA/check metadata was retained as an operational blocker, not represented as a full code review. Proposed `ai reviewed` therefore means digest coverage, not approval or exhaustive review.
- **Classification precedence:** new public `Point` made #10831 high despite small size; core hook/cross-layer focus changes made #10830 high. #10835 remains medium because it changes RAC Sheet behavior in two files without a public API addition. The RFC is high design complexity even though its only changed file is Markdown; maintainers may prefer a separate RFC category.
- **Separate signoff candidate:** #10836 alone would receive `needs signoff`. No new signoff request is proposed for #10828/#10830/#10835, whose issue discussions already support their approach, or for the chore splits requested by the team.
- **API-review boundary:** the new `Point` export clearly adds API; applying API review to #10830's deliberate focus-contract change is a judgment call. Private helper exports alone did not trigger that label.
- **Duplicate disposition:** #10835 is preferred over already-closed #10829, following explicit maintainer preference and its narrower source/test scope. #10831/#10832/#10834 overlap #10556 by design; would keep the extractions and reconcile the parent rather than close any. Searches covered open and closed items without a date restriction, thus included recently closed PRs; all search result sets were complete and below 100 items. GitHub search indexing can still lag.
- **Label removal / comment restraint:** would remove `small review` from #10834 despite approval, but would not remove `ready for review`. Would not repeat the CLA reminder on #10826 because the maintainer has already posted it.
- **Not a proven regression:** affected versions in #10806/#10817 are not evidence of an introducing version; no `regression` label is proposed. No `patch worthy` recommendation is made before unresolved CLA/API/test concerns are cleared.
- **Unavailable verification:** no checkout, dependency install, test execution, source reversion, or live device/browser reproduction was attempted under the read-only restriction. Reasoned issue/diff alignment and observed GitHub check statuses are not independently executed validation. The issue-linked videos and external reproductions were not run.
- **Generated docs:** #10825 mentions the generated Card skill reference; this digest verified the source substitutions and reported docs-build status, not downstream generation output. Would leave generated-reference verification to the maintainer's docs workflow rather than assume it was corrected or demand unrelated generated edits.
- **Instruction source:** `.github/triage/pull-requests.md` was outside Scout's index and was read locally as an unindexed instruction file. All PR, issue, discussion, diff, helper, label, and check evidence was read from GitHub using `gh`; no indexed-source review or repository modification was required.
