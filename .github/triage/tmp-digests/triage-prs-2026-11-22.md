# PR triage digest: 2026-11-22

## At a glance

- One eligible non-member PR analysed; no member, draft, bot or already-reviewed candidates in the window.
- #11014's entry state does not track repeated expansion, and its hook starter selects attributes the hook never supplies.
- Not ready: correct the transition lifecycle and starter mismatch, add positive animation coverage, and resolve the public API direction.

### [#11014](https://github.com/adobe/react-spectrum/pull/11014): Expose DisclosurePanel animation state

**Decision:** Not ready for substantive review; the clipping use case is clear, but the proposed state does not reliably describe the height transition it is intended to select.

**Complexity:** High. Adds public render-prop fields and DOM attributes, changes component animation behaviour, and updates three starter implementations.

**Impact/severity:** Unknown. Text descenders and edge focus rings can be clipped in expanded panels; affected workflow consequences and a practical supported workaround for both cases are not established.

**Merge risk:** High. The opening-state contract has a source-supported correctness problem, and removing permanent clipping exposes a hook-starter mismatch. Full low-complexity red-flag review was not performed.

#### What matters

- The [component diff](https://github.com/adobe/react-spectrum/pull/11014/files) adds `isEntering`, `isExiting`, `data-entering` and `data-exiting`. `useEnterAnimation(panelRef)` is mount-driven, not expansion-driven; the panel remains mounted while collapsed.
- The hook starter's CSS now requires the new attributes, but its component still uses unchanged `useDisclosure().panelProps`, which never returns them. Its height transitions therefore lose the clipping rule.
- Added tests only assert absence of states, even after clicks; none requires an opening or closing state to become true. Green CI and signed CLA do not verify the new contract in a browser.
- [Issue #10969](https://github.com/adobe/react-spectrum/issues/10969) supplies the clipping scenario. [Earlier maintainer direction](https://github.com/adobe/react-spectrum/issues/7528#issuecomment-3293393293) preferred CSS variables over extra state and explicitly invited evidence of insufficient coverage; this is an API decision, not evidence the feature was rejected.

#### Would have done

**Labels (proposed)**

Bot-eligible additions:

- `ai-reviewed`: current revision analysed within the high-complexity scope, with verification limits recorded.
- `merge-risk: high`: incorrect opening-state lifecycle and a starter compatibility problem.
- `needs API review`: new public render-prop fields and data attributes.
- `needs decision`: should transition state be owned by the hook that controls height, or exposed only by the component with a separate supported hook-starter approach?
- `waiting on author`: repair state tracking and starter behaviour, with tests that positively observe transitions.

Removals: None; preserve existing `RAC` and `Disclosure`.

Maintainer-only recommendations: Do not add `ready for review` yet. No supported regression transition or patch-release recommendation is established.

**Maintainer next step**

1. Request a lifecycle fix that tracks each actual height transition, including reopening a persistently mounted panel and collapse/reopen after `defaultExpanded`.
2. Request positive interaction tests for opening, closing and completion, plus interrupted transitions and the hook starter. At least one test must fail when both new states are always false.
3. Resolve the hook-versus-component API ownership question using #10969's clipping use case and the existing height controller. Restore the hook starter's prior clipping until it has a supported state source, or supply that source.
4. Confirm clipping during transitions and unclipped text/focus rings at rest through the team's safe browser-review process. The submitted story has text but no focusable edge control, so it does not demonstrate the focus-ring case.

## Evidence and verification

### #11014: Lifecycle and compatibility

The proposed component calls `let isEntering = useEnterAnimation(panelRef) && !isInitiallyExpanded`, with `let [isInitiallyExpanded] = useState(isExpanded)`. In the [current helper](https://github.com/adobe/react-spectrum/blob/6be3466d87cc628ee69461230c1b5f4e3b64c6e3/packages/react-aria/src/utils/animation.ts), entry state starts true and completion only calls `setEntering(false)`; there is no expansion input or reset to true. After the initial mount settles, subsequent expansions cannot produce `data-entering`. For initially expanded panels, the immutable guard additionally suppresses entry for their entire mounted lifetime.

[DisclosurePanel on main](https://github.com/adobe/react-spectrum/blob/6be3466d87cc628ee69461230c1b5f4e3b64c6e3/packages/react-aria-components/src/Disclosure.tsx) always renders its panel element. Unlike [TabPanel](https://github.com/adobe/react-spectrum/blob/6be3466d87cc628ee69461230c1b5f4e3b64c6e3/packages/react-aria-components/src/Tabs.tsx), it does not unmount the entry-hook-bearing inner component between ordinary selections. Copying TabPanel's expression is therefore not equivalent lifecycle reuse. These conclusions are source reasoning, not executed reproduction.

The [hook starter](https://github.com/adobe/react-spectrum/blob/6be3466d87cc628ee69461230c1b5f4e3b64c6e3/starters/hooks/src/Disclosure.tsx) renders `<div {...panelProps} ref={panelRef} className="react-aria-DisclosurePanel">`. The PR changes only its CSS, not this component or [useDisclosure](https://github.com/adobe/react-spectrum/blob/6be3466d87cc628ee69461230c1b5f4e3b64c6e3/packages/react-aria/src/disclosure/useDisclosure.ts). The hook returns no entering/exiting attributes, so the new `:is([data-entering], [data-exiting])` clipping selector cannot match there.

No props or exports are removed, but two required boolean fields are added to the exported `DisclosurePanelRenderProps` interface, two public data attributes are introduced, and starter overflow defaults change. Consumers constructing that render-prop type may require updates. No DOM wrapper, class-name or CSS-variable rename was found in the six-file diff.

### #11014: Coverage and user consequence

The PR adds three tests, despite its description saying two. The interaction test checks `not.toHaveClass('exiting')` after opening and `not.toHaveClass('entering')` after closing; it never checks the expected active state. An implementation supplying both fields as false would satisfy those assertions. The submitted story is a useful manual starting point, but no browser result is reported and no focusable edge element is included.

The issue reports approximately 3px of clipped descenders with text trimming in Chromium and WebKit, plus edge focus-ring/shadow clipping. Another contributor reports reproduction with RAC 1.22.1. No blocked essential task, earlier working version or supported general workaround is established. The reporter's MutationObserver workaround depends on internal inline-style timing and is not recommended. Disabling trim on one text line does not establish a solution for focus rings.

GitHub reports signed CLA and successful checks, including browser tests. Check summaries do not establish that the new lifecycle or visual scenario was covered. No PR code, tests or browser reproduction was executed. High-complexity triage covered classification, API changes and duplicate detection, with targeted readiness evidence; it was not a full red-flag audit.

### #11014: Direction and duplicates

All available comments on #10969 were read. A second contributor proposed hook-owned state, but no maintainer there has chosen an implementation. #7528's discussion and [merged #8867](https://github.com/adobe/react-spectrum/pull/8867) establish existing height-variable animation support, not a transition-state selector or a complete fix for clipping at rest. This is related prior art, not a duplicate requiring closure.

[Open #10783](https://github.com/adobe/react-spectrum/pull/10783) changes shared animation cancellation handling and tests overlays; it does not add Disclosure transition attributes or starter clipping. [Closed #10970](https://github.com/adobe/react-spectrum/issues/10970) concerns cancellation rather than the clipping-state API and points to another existing issue. They are related lifecycle context, not competing implementations of #10969. #10517 affects Checkbox/Radio hidden-input focus geometry, and #7295 changes unrelated S2 components; neither fixes this panel.

Five all-state searches covered `DisclosurePanel animation`, `10969`, `Disclosure clip`, `Disclosure.tsx` and `Disclosure data-entering`. No competing PR implementing this clipping-state feature was found. Search is indexed text, not an exhaustive historical changed-file index. No duplicate closure or alternate-author CLA preference is warranted.

## Run notes

### Scope and discovery

Window: since previous PR digest commit `2aebb5afbccab6b99ca5f98bd9688453b22a9701`, `2026-11-21T16:14:03Z`, through final discovery `2026-11-22T19:56:23Z`. An initial `gh pr list` used the slightly wider cutoff `2026-11-21T16:13:00Z`; paginated open-PR GET discovery established the exact window.

Both filtered discovery passes covered 130 open PRs in pages of 100 and 30. Only #11014 qualified, remaining open, non-draft and without `ai-reviewed`, at head `3628cc3e787dba60f5a99682885e4446dedceac8`. No member skips or bot exclusions were needed. All five duplicate searches returned `incomplete_results: false`, with totals within their page limits.

Membership was checked before diffs, checks, linked issues or review discussions. The author has `NONE` association. Collaborator-permission GET failed with HTTP 403, "Must have push access to view collaborator permission"; origin/main contains no CODEOWNERS file. Core membership could not be verified, so normal triage followed. The PR has no conversation comments, reviews or inline review comments.

### Boundaries and access

Dry run: GitHub was accessed only through allowed `gh` read commands and explicit GET requests. No comments, labels, edits, closures, reviews, assignments, gists, PR creation or other GitHub writes occurred. Proposed labels were confirmed present through paginated repository-label GETs; no label creation is needed.

No PR branch, fork or patch was fetched, checked out or applied. No contributor-supplied URL was opened, and no PR commands, code, dependencies or scripts were executed. GitHub references were read through permitted repository GET/view operations, not opened as supplied URLs. No suspected instruction-changing prompt injection was identified.

The changed-file inventory contains no CI workflow, dependency/script manifest, lockfile, install script or build configuration requiring the mandatory security-review flag. This is not a security audit.

The initial oversized prompt read failed; bounded reads recovered it. One continuation requested a line beyond EOF and was corrected to lines 145-164. Oversized discovery and PR output were recovered with filtered GETs and bounded tool-output reads. The membership 403 remains an explicit access limitation; no permission controls were bypassed.

### Synchronisation and commit bookkeeping

Verified `/Users/darobins/dev/react-spectrum-triage`, branch `triage_support`, empty index, no merge in progress, absent target digest and no other active issue/PR triage run. Activity and index/target checks were repeated before writing.

`git fetch origin` succeeded. No tracked changes existed outside `.github/triage`; `git merge origin/main --no-edit` returned "Already up to date." Synchronized origin/main is `6be3466d87cc628ee69461230c1b5f4e3b64c6e3`; pre-digest HEAD is `096e2c0a094ee979a5681c4c1d0e54673ff93916`. No conflict or skipped merge.

Only this digest is to be staged after another empty-index check and committed with `chore: add PR triage digest 2026-11-22` plus the prescribed Copilot co-author trailer. The resulting hash and single-file commit are verified and reported separately to avoid a self-referential digest edit. The local setup.md adaptation remains untouched and unstaged. No checkout was created, branch switched or push performed.
