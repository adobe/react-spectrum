# PR triage digest 2026-11-11

## At a glance

- Four eligible PRs analyzed; no member, draft, bot or already-`ai-reviewed` PR in scope.
- Overlay focus restoration has failing CI and a description that does not match the current implementation; optional React type peers need packaging/API and security review.
- Slider callback suppression is ready for scoped maintainer review. Virtualizer caching is otherwise reviewable, but CLA remains unsigned and invalidation coverage needs reviewer attention.

### [#10955: Restore focus during overlay exit](https://github.com/adobe/react-spectrum/pull/10955)

**Decision:** Not ready; reconcile the implementation description and determine why all four unit-test matrix jobs fail before substantive review.

**Complexity:** High: shared focus/overlay/select behavior, RAC components and test utilities change across nine files.

**Impact/severity:** Medium: keyboard users can activate a closing menu item, including unwanted navigation, during an exit animation; waiting for exit completion provides an alternate path.

**Merge risk:** High: focus timing and nested scope behavior change across layers, with failing CI and a mechanism that differs from the documented cancellation design.

#### What matters

- Restores focus during Escape dismissal instead of waiting for unmount, and changes Select blur handling and tester unmount waits. The current diff uses a document Escape listener and synchronous layout-effect restoration, not the described cancellable restoration microtask.
- [The maintainer requested investigation of prior immediate-restoration problems](https://github.com/adobe/react-spectrum/issues/10943#issuecomment-6778925486). Historical containment and pointer-interaction changes are documented, but they do not establish that earlier restoration hazards are resolved.
- The [checks](https://github.com/adobe/react-spectrum/pull/10955/checks) report failures in `test`, `test-16`, `test-17` and `test-18`; job-level causes are not exposed in the available GitHub summary. Author-reported local passes are not a substitute.
- No new `FocusScopeProps` member or DOM wrapper is introduced, but two private helpers become module exports and existing focus/blur timing changes. [#10926](https://github.com/adobe/react-spectrum/pull/10926) changes restoration destinations, not exit timing; coordinate the overlapping implementation rather than close either as a duplicate.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `ai-reviewed`, for scoped triage at the recorded revision; `merge-risk: high`, for shared focus changes and unresolved verification; `needs API review`, for observable focus/blur timing; `waiting for author`, for the description and CI follow-up.
- Removals: none. Preserve `RAC`, `Modal` and `Popover`.
- Maintainer-only readiness recommendation: do not add `ready for review` yet.

**Maintainer next step**

1. Ask the author to document the actual Escape-only synchronous path, including the microtask that merely clears the Escape flag, and explain how it avoids the historical restoration hazards.
2. Obtain the four failing job diagnostics; fix attributable failures or document a supported baseline explanation.
3. Review nested overlays, outside focus, reopen timing and interaction with #10926. The reported browser reproductions are provided but not inspected, and passing browser-job status does not prove these specific cases ran.

### [#10953: Declare optional React type peers](https://github.com/adobe/react-spectrum/pull/10953)

**Decision:** Needs author ownership confirmation and maintainer packaging/API assessment; route the dependency and constraint changes for security review.

**Complexity:** High: consumer dependency compatibility changes across four published packages, plus workspace constraints and the lockfile.

**Impact/severity:** Medium: TypeScript consumers using pnpm's global virtual store lose contextual typing or get compilation errors; the issue supplies `addMissingPeerTypes` and `packageExtensions` workarounds.

**Merge risk:** Medium: metadata-only runtime intent, but broad package-resolution and constraint effects; full published-artifact verification is author-reported rather than independently established.

#### What matters

- Adds optional `@types/react: "*"` peers to RAC, `react-aria`, `react-stately` and `@react-types/shared`. [#10940](https://github.com/adobe/react-spectrum/issues/10940) describes resolution from package real paths and the matching suggested metadata.
- `yarn.config.cjs` stops propagating optional peers as required peers. Dependency manifests, workspace configuration and `yarn.lock` change: **needs security review**, irrespective of patch size.
- The author reports direct/transitive tarball typechecks and a JavaScript-only install, but repacked released artifacts rather than building this branch. The human ownership/understanding checklist is explicitly left unchecked.
- No prop, event, DOM or runtime export changes appear. Published peer requirements and workspace optional-peer behavior change; no competing same-behavior PR was identified.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `ai-reviewed`, for scoped triage; `merge-risk: medium`, for packaging/constraint compatibility; `needs API review`, for public peer metadata; `waiting for author`, for explicit ownership confirmation.
- Removals: none. Preserve `RAC`.
- Maintainer-only readiness recommendation: defer `ready for review` until ownership is confirmed and packaging direction is accepted.

**Maintainer next step**

1. Obtain the human author's confirmation that they understand and own every change.
2. Review whether `"*"` and the optional-peer propagation exemption are the intended compatibility policy; arrange security review of the manifest, lockfile and constraint changes.
3. Verify newly built published artifacts in isolated direct/transitive consumer layouts, with and without React types. Assess the reported Windows test failures against a baseline rather than assuming they are attributable to this patch.

### [#10952: Suppress unchanged controlled Slider callbacks](https://github.com/adobe/react-spectrum/pull/10952)

**Decision:** Ready for scoped maintainer review; review the restored equality guard and callback contract, without treating high complexity as rejection.

**Complexity:** High under the triage rubric because it changes core `react-stately` behavior, despite only three added source lines and one focused test.

**Impact/severity:** Medium: redundant callbacks can interrupt a URL-synchronization workflow through Safari rate limiting; the reporter already filters unchanged values in a wrapper.

**Merge risk:** Medium: shared controlled-state callback behavior changes; the available test covers the hook, not rendered pointer interaction.

#### What matters

- Returns after snapping/clamping when the thumb value equals `valuesRef.current[index]`. [#10950](https://github.com/adobe/react-spectrum/issues/10950) explains the distinct controlled-array references and repeated same-step callback.
- The test reproduces a controlled parent rerender between two identical thumb updates. [The maintainer's refinements](https://github.com/adobe/react-spectrum/pull/10952#discussion_r4530505767) are present in the current diff; CLA now passes, and neither waiting nor unsigned-CLA labels remains.
- No prop/type/export/DOM changes; `onChange` stops firing for unchanged snapped values. Historical [#999](https://github.com/adobe/react-spectrum/pull/999) added the guard and [#1031](https://github.com/adobe/react-spectrum/pull/1031) removed it, supporting a historical regression mechanism rather than only a current-code inference.
- No active competing duplicate was found. The merged multi-thumb synchronization fix [#5655](https://github.com/adobe/react-spectrum/pull/5655) addresses external controlled-value changes, not repeated callbacks within one dragged step.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `ai-reviewed`, for scoped triage; `merge-risk: medium`, for shared callback behavior and rendered-interaction verification limits; `regression`, for the independently read guard addition/removal history; `needs API review`, for the observable `onChange` contract correction.
- Removals: none; the current PR has no labels. Do not propose removing already-absent waiting or CLA labels.
- Maintainer-only addition: `ready for review`, because the problem, test instructions and current checks support substantive review.

**Maintainer next step**

1. Review the current callback behavior and historical stale-state rationale, including multi-thumb and externally updated controlled values.
2. Verify repeated same-step pointer movement in a rendered Slider and preservation of `onChangeEnd`. These are review verification tasks, not a new author-blocking request or a claim that tests were executed.

### [#10956: Cache persisted-key ancestor membership](https://github.com/adobe/react-spectrum/pull/10956)

**Decision:** Otherwise reviewable; CLA is handled by separate automation. A core reviewer should assess cache invalidation and performance evidence before approval.

**Complexity:** High: changes core Virtualizer behavior and adds a new test file.

**Impact/severity:** Unknown: avoids repeated ancestor traversal, but no affected collection size, measured slowdown, blocked workflow or supported workaround is supplied.

**Merge risk:** Medium: ancestor membership now depends on cache invalidation, with limited layout/rendered-collection verification.

#### What matters

- Lazily builds ancestor membership and clears it during relayout and persisted-set replacement. Main still walks each persisted key's ancestor chain on every membership query.
- The test checks membership and call-count reuse, then replaces persisted keys. Its layout returns no visible items; it does not demonstrate rendered focus persistence or parent-chain changes during relayout.
- No public signature, prop, event or DOM contract changes appear; equivalent membership results are intended. Scope is optimization, not an established regression fix, so do not add `regression`.
- CLA is `ACTION_REQUIRED`. No competing cache PR was found; [#10472](https://github.com/adobe/react-spectrum/pull/10472) changes Table drop-highlight CSS/tests and does not implement this ancestor cache.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `ai-reviewed`, for scoped triage; `merge-risk: medium`, for cache invalidation and coverage gaps; `waiting for maintainer`, for core invalidation/performance assessment.
- Removals: none. No `waiting for author` proposal solely for CLA.
- Maintainer-only readiness recommendation: defer `ready for review` while CLA is unsigned and the core reviewer assesses verification adequacy.

**Maintainer next step**

1. Assess layout/collection/persisted-set invalidation, including changes after the first cache read, and decide whether additional behavioral coverage is necessary.
2. Obtain a representative deep-tree/many-persisted-keys workload to establish the user benefit. Separate CLA follow-up from these technical review tasks.

## Evidence and verification

### #10955: Current implementation versus description

The [current Overlay diff](https://github.com/adobe/react-spectrum/pull/10955/files) registers an owner-document capture listener, sets `isDismissedByEscapeRef`, and uses `queueMicrotask` only to reset that flag. `useLayoutEffect` returns unless the overlay is exiting, focus management is enabled and the Escape flag is set; it restores synchronously through `restoreFocusToElement`. There is no restoration-microtask cancellation flag described in the body. This matters for the timing rationale and for dismissals not caused by Escape, not merely wording.

The [inline layering request](https://github.com/adobe/react-spectrum/pull/10955#discussion_r4534655748) was addressed by leaving `FocusScopeProps` unchanged, but the body/reply's claim that all `FocusScope.tsx` changes were reverted is inaccurate: `isElementInChildScope` and `restoreFocusToElement` become `@private` source-module exports. Main's private barrel explicitly exports three other helpers and is unchanged by this PR; no new public root or private-barrel exports were identified.

Read [#4785's overlay change](https://github.com/adobe/react-spectrum/pull/4785/files) confirms release of containment during exit. [#8475's diff](https://github.com/adobe/react-spectrum/pull/8475/files) disables pointer/touch interaction on exiting RSP popovers, not keyboard focus. Neither is a competing unmerged fix. #10942 concerns autofocus after reopening; it should not be claimed fixed merely by restoring focus on dismissal. No duplicate closure is recommended.

The GitHub commit check summary confirms all 26 jobs completed, with four unit-test failures and zero annotations; it does not identify failed assertions or establish attribution. Test-browser, type builds, lint and SSR jobs are reported successful, but scenario-level browser coverage is not exposed. The issue's Playwright Chromium/Firefox/WebKit results are reporter claims; the Safari app itself was explicitly not run.

### #10953: Packaging verification limits and workaround

The four manifests and lockfile entries add the same optional type peer. The constraint predicate now excludes peers where `peerDependenciesMeta[ident].optional` is true; normal required-peer propagation remains in the existing branch. Manifest reordering does not itself change exports. The issue describes package-manager workarounds, not a missing component prop; they were not executed or independently verified here.

The author reports successful lint/immutable install/constraint smoke checks and consumer negative type assertions, while the full Windows unit suite had 16 failures and two SSR suites timed out before passing with a longer timeout. Those source suites are unchanged, but causation was not independently checked. Current returned GitHub checks have no failing result and CLA passes. The branch build was not run locally by the author because `make` was unavailable.

### #10952: Regression and callback evidence

Main's `updateValue` snaps/clamps and calls `setValues` even if `replaceIndex` returns the same array. The current test sets a controlled value, rerenders its parent, repeats the value and ends dragging; its callback observation matches the reported mechanism by reading. This is hook-level verification, not an executed drag or full red-flag review.

#999 merged on 2020-08-28 with `if (value === values[index]) return`. #1031 merged on 2020-09-02, removed that guard and introduced functional updates plus `replaceIndex` reference reuse to fix stale closures. This supports the historical transition cited by the reporter. It does not establish uninterrupted failing behavior since 2020 or the first affected published release. Reported failing versions are RAC 1.22.0 and `react-stately` 3.51.0; the external StackBlitz is provided but not inspected.

#5655's merged external-value synchronization work is related, not a better duplicate of same-step suppression. No closure recommendation follows from either historical comparison.

### #10956: Membership and invalidation evidence

[Main Virtualizer](https://github.com/adobe/react-spectrum/blob/d354aa2a642fa1d34bc0bdc27e8ae9bcf0c59b32/packages/react-stately/src/virtualizer/Virtualizer.ts) performs uncached parent traversal. The patch adds resets in `relayout` and the unequal persisted-set branch of `render`; the new test changes the persisted set but never renders visible layout items. The author says local tests/types were unavailable because Node and Yarn were missing; current CI reports successful tests/types, but no benchmark or scenario inventory is exposed.

All four PRs are high complexity under the current rubric. Analysis was limited to classification, summary, API/compatibility, duplicate checks and available readiness evidence; the full low-complexity red-flag review was not performed. No PR code, tests, installation, build or reproduction was executed.

## Run notes

### Synchronization and checkout

Verified `/Users/darobins/dev/react-spectrum-triage` on `triage_support`, no staged changes or in-progress merge, no existing target digest and no other active triage session. `git fetch origin` succeeded; `git merge origin/main --no-edit` reported "Already up to date." Incorporated main is `d354aa2a642fa1d34bc0bdc27e8ae9bcf0c59b32`, verified as an ancestor of HEAD. The only pre-existing change is the local `.github/triage/setup.md` adaptation, left untouched and unstaged.

### Scope and discovery

Window: since the previous PR digest commit `710264c24351bb8966989360018275b5c9bc055b`, at `2026-11-10T16:21:54Z`, through refreshed discovery at `2026-11-11T17:37:51Z`. Initial discovery used a slightly narrower 17:00 UTC cutoff; paginated REST reads subsequently covered the full previous-digest window and all open PRs. Four candidates remained open, non-draft, non-bot and without `ai-reviewed`; no member PR was skipped.

Reviewed head SHAs: #10955 `5a0bbcc51fea337f2703ad39ed76a4a3cbc89606`; #10953 `ae0954c0590cfb340b203f8edf36a7e0287d6de7`; #10952 `c107feacc5e41bc202e1b274c020f046a1d15945`; #10956 `6e404321c7b52662e2a4012e3463ee4e6f268956`. Final eligibility reads returned these same revisions. Maintainer comments did not cause a blanket skip.

Duplicate searches covered closing-issue references, persisted/ancestor/cache terms, overlay exit/focus, optional type peers and unchanged Slider behavior, with title-based fallbacks for sparse text-search results. Matching source changes and different underlying behaviors were compared, rather than relying on titles. Search indexing is not guaranteed complete; paginated REST, not search, established discovery coverage.

### Membership, labels and read limitations

All four REST author associations are `NONE`, which does not prove non-membership. Collaborator-permission GETs for every author failed with HTTP 403: "Must have push access to view collaborator permission." No CODEOWNERS was found at root or under `.github/` or `docs/` on main. Membership could not be independently verified, so normal triage was used; no `rsp-core` proposal.

The label inventory was read through paginated GET. Proposed `ai-reviewed`, both selected merge-risk labels, `needs API review`, `regression`, `waiting for maintainer` and `ready for review` exist. Exact `waiting for author` does not exist; maintainers would need to create it before use. Do not substitute the existing `waiting on author`, and do not create any label automatically.

Two guessed source paths failed: `.github/CODEOWNERS` and `packages/react-aria/exports/focus.ts` do not exist. Tree reads established CODEOWNERS absence and found `exports/private/focus/FocusScope.ts`; a follow-up read confirmed its explicit helper exports. An initial range read of yesterday's digest exceeded its 35 lines; the full valid range was then read. These failures were not treated as successful evidence. No required synchronization step failed.

### Boundaries and commit bookkeeping

Dry run only: all GitHub access used permitted read-only `gh` commands or explicit GET. No comment, review, label, edit, close, gist, PR creation or other GitHub write occurred. Contributor URLs were not opened, and contributor code was not checked out, fetched or executed.

Only this digest is to be staged and committed with the prescribed conventional message and Copilot co-author trailer. Verify the exact staged path and resulting single-file commit before reporting its hash. The hash belongs in the final report, not a self-referential digest edit. Never push.
