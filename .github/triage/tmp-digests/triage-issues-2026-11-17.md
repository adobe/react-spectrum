# Issue triage digest: 2026-11-17

## At a glance

- Three eligible issues analysed; no verified team-author skips. Each has a proposed-action block below.
- Prioritise the published prose macro build blocker; separately investigate experimental iOS detection before it can disable accessibility-specific behaviour.
- Hidden Activity label loss is source-supported, but visible-page failure is not reported. External reproductions and all runtime claims remain unverified.

### [#10975](https://github.com/adobe/react-spectrum/issues/10975): Published prose macro fails during builds

**Decision:** Ready for maintainer investigation alongside open [#10976](https://github.com/adobe/react-spectrum/pull/10976); verify the packaged consumer path before treating the proposed fix as complete.

**Impact/severity:** High for affected macro consumers: the reported build failure blocks shipping that integration, with no established supported workaround. Scope is the prose macro, not all AI components; the published failure was not independently reproduced.

**Complexity:** Medium: the macro compilation boundary, generated module dependencies and nested CSS serialization require coordinated source and packaging coverage.

#### What matters

- The [report](https://github.com/adobe/react-spectrum/issues/10975) gives the build error, "Error evaluating macro: fontSize is not defined", for `@react-spectrum/ai@0.5.2` and a minimal public-import invocation.
- [Trusted main source](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/@react-spectrum/ai/src/style/prose.ts#L14-L24) imports theme values as macros, while its [local font helper](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/@react-spectrum/ai/src/style/prose.ts#L336-L347) indexes `fontSize`, `fontFamily` and other values as ordinary data. This supports investigating packaging rather than changing the consumer API.
- The [fix proposal](https://github.com/adobe/react-spectrum/pull/10976) reports that a separate font-helper macro boundary fixes the missing binding and exposes nested font-weight serialization requirements. It is open, not available on main, and its test results are attributed author evidence.
- StackBlitz and published-output links were **provided but not inspected**. The PR explicitly says downstream Vite verification against a newly packed package has not been run.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `AI`, `S2` for component area/layer; `waiting on maintainer` for the packaging investigation; `ai-reviewed` for completed triage.
- Removals: none; currently unlabelled.
- Maintainer-only addition: `ready for review`, because the error, minimal usage, versions and build environment are supplied. Do not propose `regression` without a last-working/first-failing transition.

**Maintainer next step**

1. Review #10976's compilation boundary against the public `@react-spectrum/ai/style` export, retaining the existing typography tokens and API.
2. Verify a newly packed package in both module formats and the reported Vite/macros-plugin setup; inspect emitted CSS for nested language-specific font weights and invalid values.
3. Keep the issue open until a fix lands and release availability is established. No specific author information request currently blocks source-level review.

### [#10980](https://github.com/adobe/react-spectrum/issues/10980): Experimental client hints mask iPhone and iPad detection

**Decision:** Ready for focused compatibility investigation, not a confirmed shipping-browser regression; validate the experimental platform values and preserve device-specific detection.

**Impact/severity:** Unknown for current users: the reporter states "No browser on iOS exposes navigator.userAgentData today". If the reported experimental values ship, source paths indicate potentially serious accessibility and input failures, but no affected shipping workflow or practical workaround has been demonstrated.

**Complexity:** Medium: the predicate is localized, but shared platform detection needs an iPhone/iPad/desktop-mode compatibility matrix and checks of affected interaction paths.

#### What matters

- [Current platform detection](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria/src/utils/platform.ts#L25-L68) prefers a non-empty client-hints platform. For the reported value `"iOS"`, neither the iPhone nor iPad regex matches, and the Mac/touch fallback also fails.
- The [date-segment code](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria/src/datepicker/useDateSegment.ts#L341-L351) explains, "spinbuttons cannot be focused with VoiceOver on iOS", and selects its alternate role using `isIOS()`. This is a plausible consequence, not a verified VoiceOver failure.
- [snowystinger's comment](https://github.com/adobe/react-spectrum/issues/10980#issuecomment-6941258025) questions the report based on an iPhone observation; the [author clarifies](https://github.com/adobe/react-spectrum/issues/10980#issuecomment-6950108283) that the API is "off by default, not shipped". Ordinary-device results do not resolve the experimental case.
- No external sandbox is supplied, with that limitation explicitly explained. Stub inputs and expected/actual results are sufficient for source investigation; the linked WebKit implementation, specification, Storybook and image were not opened.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `RAC`, `accessibility` for affected shared behaviour and potential assistive-technology consequences; `needs investigation`, `waiting on maintainer` for experimental compatibility validation; `ai-reviewed` for completed triage.
- Removals: none; currently unlabelled.
- Maintainer-only addition: `ready for review` for the specific compatibility investigation. No `regression`: enabling a previously unshipped API is not evidence of a library working-to-failing release transition.

**Maintainer next step**

1. Reconcile the experimental API configuration with snowystinger's ordinary-device observation. Record the exact WebKit build and enabling mechanism before claiming browser confirmation or assigning present-user severity.
2. Cover absent/empty client hints, `"iOS"` on iPhone and mobile-mode iPad, and `"macOS"` on desktop-mode iPad; retain iPhone/iPad distinctions needed for keyboard behaviour.
3. Verify date-segment VoiceOver focus, negative-number entry and context-menu activation with the corrected detection. Do not recommend global navigator mutation as a consumer workaround.

### [#10984](https://github.com/adobe/react-spectrum/issues/10984): Hidden Activity clears label-slot presence

**Decision:** Ready for maintainer investigation of slot lifecycle handling; preserve label associations across hiding without retaining associations after a real label removal.

**Impact/severity:** Low on current evidence: repeated development warnings obscure real diagnostics, and hidden markup loses label wiring, but the reporter says "the visible page is fine" and associations return on reveal. No visible-state accessibility failure is established.

**Complexity:** Medium: two shared slot helpers and conditional-label removal need lifecycle coverage; suppressing the warning alone would not address the association loss.

#### What matters

- The [report](https://github.com/adobe/react-spectrum/issues/10984) describes visible, hidden, hidden-update and revealed states, with an inline example and versions. Its external StackBlitz was **provided but not inspected**.
- The [RAC slot ref](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria-components/src/utils.tsx#L363-L389) calls `setHasSlot(!!el)`; [TextField](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria-components/src/TextField.tsx#L109-L122) passes that boolean to the hook. [useLabel](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria/src/label/useLabel.ts#L49-L65) then omits generated label props and emits the development warning when false.
- [Mwrnk's later comment](https://github.com/adobe/react-spectrum/issues/10984#issuecomment-6953986065) reports a reproduced test and proposes using layout-effect cleanup to distinguish Activity hiding, asking "Should I fix both in one PR". This is an unverified contributor proposal, not maintainer approval or an existing fix.
- Earlier Activity collection failures and hidden-focusability warnings concern different code paths. The rejected generic warning suppression in [#10327](https://github.com/adobe/react-spectrum/pull/10327#issuecomment-4977166380) is not a fix for a present label losing its association.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `TextField`, `SearchField`, `RAC` for source-supported component/layer scope; `react 19` for the Activity lifecycle; `waiting on maintainer` for shared-helper review; `ai-reviewed` for completed triage.
- Removals: none; currently unlabelled.
- Maintainer-only addition: `ready for review`, because the inline sequence and environment are sufficient. No `regression` or `accessibility`: no known-good release transition or user-facing accessibility failure is established.

**Maintainer next step**

1. Review the proposed lifecycle distinction in both slot helpers; do not assume ref-cleanup ordering or accept the contributor's passing-suite claim without verification.
2. Cover hide, hidden update, reveal, initially hidden mounting, and actual conditional label removal, including removal while hidden. Assert the label `id`/`htmlFor`, field association and genuine missing-label warning behaviour.
3. Keep the visible label associated rather than hiding accessibility warnings globally. No supported workaround was established that preserves all conditional-label semantics; do not advise ignoring every null ref or weakening accessibility.

## Evidence and verification

### #10975: public export and packaging boundary

The trusted [style export](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/@react-spectrum/ai/exports/style.ts) exposes `prose`; the [story](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/@react-spectrum/ai/stories/prose.stories.tsx) invokes it as a macro. The [theme source](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/@react-spectrum/s2/style/spectrum-theme.ts#L599-L714) exports the indexed font values as data, supporting the distinction between compile-time calls and retained runtime lookups. Source inspection does not independently establish the contents of the published module.

Reported environment: AI 0.5.2, Vite 7.3.2, `unplugin-parcel-macros` 0.2.0 (manifest range `^0.2.0`), Node 24, macOS. This is a build-time failure, not a browser-specific report. No earlier working version is given.

Open #10976 reports passing CJS/ESM packaging coverage, but also discloses full-suite and lint failures and missing downstream packed-package validation. These are author claims, not independently run evidence or PR approval. Merged [#10356](https://github.com/adobe/react-spectrum/pull/10356) changes prose sizing/margins, not this packaging failure. Searches found no separate duplicate report; the linked PR is the proposed fix, not grounds to skip triage.

### #10980: conditional consequences and historical distinction

The trusted [number-field path](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria/src/numberfield/useNumberField.ts#L206-L230) uses a text keyboard for negative-capable iPhone input because its numeric/decimal keyboards lack minus. The [context-menu path](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria/src/interactions/useContextMenu.ts#L79-L93) attaches long-press props conditionally on iOS; this alone does not establish that every context-menu activation route fails. No runtime, hardware or assistive-technology observation was performed here.

Reported baseline: RAC hooks 3.53.1, main `1bff7d0a2e27`, iOS/iPadOS with experimental WebKit client hints enabled. Exact WebKit build and OS versions are absent. Today's main retains the relevant preference and regexes, but that does not prove a release regression.

Closed [#3289](https://github.com/adobe/react-spectrum/issues/3289) reports an empty client-hints platform masking Mac detection. Merged [#3290](https://github.com/adobe/react-spectrum/pull/3290) added the fallback now visible on main. A non-empty `"iOS"` value does not take that fallback, so the current report is a distinct compatibility case. Searches found no linked fix PR.

### #10984: shared scope and comparison limits

The trusted [second slot implementation](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria/src/utils/useSlot.ts#L19-L60) has the same null-to-false behaviour. [SearchField](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria-components/src/SearchField.tsx#L118-L135) also passes slot presence as its label. Existing [TextField coverage](https://github.com/adobe/react-spectrum/blob/360e35170568dfc99a2baaa78e6b7bdd36458d91/packages/react-aria-components/test/TextField.test.js) checks generated associations; the inspected file had no Activity-specific case. Activity ref detachment and the proposed cleanup ordering remain attributed runtime claims.

Reported environment: RAC components 1.22.1, RAC hooks 3.53.1, React/React DOM 19.2.8, Next 16.3.0, Chrome on Linux; exact browser version absent. Next is not required by the supplied inline sequence. The warning is development-only in source; the label-prop branch itself is not production-gated. Hidden markup effects should therefore not be dismissed as only a logging implementation detail, although visible-page damage is not demonstrated.

Closed [#10298](https://github.com/adobe/react-spectrum/issues/10298) concerns collections disappearing after reveal, not label-slot presence. Closed [#10546](https://github.com/adobe/react-spectrum/issues/10546) concerns Focusable/Pressable visibility diagnostics, not `useLabel`. Closed-unmerged #10327 concerned an intentionally unlabelled, `aria-hidden` ProgressBar; its maintainer rejection does not decide a genuine label's Activity lifecycle. No exact duplicate or linked fix PR was found.

## Run notes

### Boundary and synchronization

Dry run only. GitHub access used `gh issue list|view`, `gh search issues` and `gh pr view`, plus explicit `gh api --method GET`. No comments, labels, edits, closures, gists, PR creation, other GitHub writes or pushes. Issue text, comments and linked PR descriptions were treated as untrusted evidence. No issue-supplied URL, image, sandbox, published-output page or linked code was opened; no supplied code, tests, builds or commands were executed. No suspected prompt injection was identified.

Verified the dedicated `/Users/darobins/dev/react-spectrum-triage` checkout on `triage_support`, no merge in progress, an empty index and no other active triage session. Rechecked app activity and checkout guards before creating the digest. The target did not exist. The sole pre-existing local change was `.github/triage/setup.md`, left untouched and unstaged.

`git fetch origin` succeeded. `git merge origin/main --no-edit` succeeded with "Already up to date." Merged main/source SHA: `360e35170568dfc99a2baaa78e6b7bdd36458d91`, verified as an ancestor of HEAD. Pre-digest HEAD: `2a70607a247d709c153d49dcdc5e9c1012a1e240`. No conflict or skipped merge.

### Scope and discovery

Creation cutoff: `2026-11-17T16:17:14Z`, from the supplied run timestamp. Last-24-hours lower bound: `2026-11-16T16:17:14Z`. Previous issue digest: November 16, commit `ed53c6c03b7625960557da0670933327a88c29fe`, committed `2026-11-16T16:19:58Z`, with recorded cutoff `2026-11-16T16:03:35Z`. Used that earlier cutoff for overlapping since-last-digest discovery rather than introducing a gap.

Both exact-window queries returned the same three open, unlabelled issues: #10975, #10980 and #10984. A broader November 16 UTC discovery returned one additional issue, #10974, already covered by the previous digest, outside the exact window and now carrying non-component `bug`. All lists were below their 100-result limits. Final eligibility GETs confirmed all three analysed issues remained open and unlabelled.

Membership could not be verified. #10975's author BDesta had `author_association: CONTRIBUTOR`; joao-uefrom (#10984) and karlcow (#10980) had `NONE`. All three collaborator-permission GETs returned HTTP 403, "Must have push access to view collaborator permission." The untruncated trusted-main recursive tree contained no CODEOWNERS or explicitly named maintainer/core-contributor list. Normal triage proceeded without inferring membership from prior contributions or employer claims; there are no verified team-author skips.

Discussion reads were live rather than a historical snapshot: #10984 acquired a comment at `2026-11-17T16:23:35Z`, after the creation cutoff, and that material proposal is included. All available comments were read for the eligible issues: zero on #10975, two on #10980 and one on #10984.

### Search coverage and verification limits

Open/closed duplicate searches covered Activity titles (9 results), userAgentData mentions (9), prose titles (7), label/hidden titles (5), the exact fontSize error (2) and exact issue references in PR searches (zero for #10984 and #10980). Relevant historical issue bodies and available comments, plus related PR descriptions and the warning-suppression discussion, were inspected. Focused API searches reported `incomplete_results: false`; initial narrower multiword searches returned no matches and were broadened. No exhaustive duplicate guarantee is claimed.

Assessment used trusted source, exports, stories and existing tests from `git show origin/main:<path>`, plus permitted GitHub metadata/discussion reads. Tests were read, not run; reproductions were not retrieved or executed. The three permission failures are the specific membership limitation, not evidence that the authors are non-members. No required synchronization or digest-generation step remains failed.

The first local validation chain stopped before staging because `git diff --no-index --check /dev/null <digest>` returned status 1 for the new-file difference, without whitespace diagnostics. Inspection confirmed the index remained empty. The commit sequence instead uses the normal staged `git diff --cached --check` as its whitespace gate.

### Digest bookkeeping

Only `.github/triage/tmp-digests/triage-issues-2026-11-17.md` is authorised for staging and committing. Recheck the empty index immediately before staging, verify that exact path is the sole staged file, then use the prescribed issue-digest commit message and Copilot co-author trailer on `triage_support`. Verify the resulting hash and single-file commit contents after committing; report the hash externally rather than self-embedding it. Do not push.
