# Issue triage digest: 2026-11-12

## At a glance

- **2 issues triaged; neither already labelled; no verified team-authored skips.**
- **Main finding:** multi-Select discards the selection manager's `"all"` value on main. Manual selection and explicit controlled values remain available, but do not repair the keyboard shortcut.
- **Decision needed:** choose the supported way for application wrappers to avoid hidden-collection side effects. Open-state gating works around the reported case; a member explicitly requested the broader issue remain actionable.

### [#10958: Multi-Select silently ignores select all](https://github.com/adobe/react-spectrum/issues/10958)

**Decision:** Ready for maintainer investigation and a focused state fix; retain this report separately from the related range-selection issue. The source supports the failure mechanism, but browser behaviour and the supplied reproduction were not independently exercised.

**Impact/severity:** Medium. Bulk selection is unavailable through both the state action and keyboard shortcut; individual selection works, and an application-owned bulk action can supply explicit values.

**Complexity:** Medium. Shared Select state and component-level coverage must agree on disabled/filtered items and array-valued selection, without changing single-selection behaviour.

#### What matters

- The report says both `selectionManager.selectAll()` and Cmd/Ctrl+A leave selection unchanged and "`onChange` is never called"; selecting an individual item works. Versions, Chrome/macOS, steps and a StackBlitz are supplied; the external reproduction is **provided but not inspected**.
- Trusted main's [Select state conversion](https://github.com/adobe/react-spectrum/blob/6fc06c8e39770dd5530809b85a6fbdef94d86afc/packages/react-stately/src/select/useSelectState.ts#L199-L224) returns immediately for `"all"`, while the shared selection manager produces exactly that value. This supports a real library-state defect, not merely a missing consumer prop.
- Closed [#2663 already records the dropdown-specific gap](https://github.com/adobe/react-spectrum/issues/2663#issuecomment-5860463702): a member replied, "Seems like something we can fix in Select". Its original request was a visible ListBox select-all control, not this precise state failure; do not close this new, reproducible report as a title-level duplicate.
- [#10147](https://github.com/adobe/react-spectrum/issues/10147) loses range-selection anchors through the same array conversion, but concerns a different gesture and value. The original multi-selection PR already introduced the `"all"` guard; no previously working multi-Select release was established, so this is not a supported regression claim.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `Select`, `RAC` for component/layer; `has workaround` for explicit application-owned values; `ai-reviewed` for completed dry-run analysis.
- Removals: none. All proposed labels exist.
- Maintainer-only recommendation: `ready for review`, based on the clear scenario, supplied reproduction, environment and source-backed mechanism. Do not add `regression` without a working/failing release transition.

**Maintainer next step**

1. Confirm the direct state action and Cmd/Ctrl+A in a permitted maintainer environment. Cover controlled and uncontrolled values, disabled items, sections, filtering and unchanged single-selection behaviour before accepting a fix.
2. Coordinate the shared state change with #10147, without assuming its reverted fix is usable. The [member's revert explanation](https://github.com/adobe/react-spectrum/pull/10213#issuecomment-4849703236) explicitly rejects reading a ref during render; avoid reviving that approach.
3. Suggested interim answer: use the public controlled `value`/`onChange` API for an accessible bulk-action button, deriving explicit keys from application-owned enabled options. For a finite, fully loaded list, the integration pattern is:

   ```tsx
   const [value, setValue] = React.useState<string[]>([]);
   const selectEnabledOptions = () =>
     setValue(enabledOptions.map(option => option.id));
   // Select: selectionMode="multiple" value={value} onChange={setValue}
   // Button: onPress={selectEnabledOptions}, with a visible "Select all" label.
   ```

   Here `enabledOptions` is application data with string IDs, already filtered according to the intended selectable scope, not an internal collection traversal. See the [Select documentation](https://react-aria.adobe.com/Select). This mitigates the explicit bulk action only: it does not restore Cmd/Ctrl+A, preserve an abstract `"all"` across unloaded data, or remove the need for a library fix.

### [#10957: Hidden collection rendering activates application effects](https://github.com/adobe/react-spectrum/issues/10957)

**Decision:** Ready for a maintainer API/documentation decision, not a predetermined hook-export implementation; keep the feature request open despite the existing workaround.

**Impact/severity:** Medium. An exclusive shortcut provider reportedly disables page shortcuts while the Select is closed; forwarding open state provides a practical workaround. No blocked essential workflow or broader affected population is established.

**Complexity:** Unknown. Documentation, exposing a public hook and changing shared collection execution have different costs; maintainers have not chosen the required change.

#### What matters

- The reported integration activates an exclusive hotkey scope during hidden collection building. Main's [CollectionBuilder hidden pass](https://github.com/adobe/react-spectrum/blob/6fc06c8e39770dd5530809b85a6fbdef94d86afc/packages/react-aria/src/collections/CollectionBuilder.tsx#L49-L78) and Popover's preservation of hidden children support why application components can mount before the overlay opens.
- The [linked discussion confirms the open-state workaround](https://github.com/adobe/react-spectrum/discussions/10944#discussioncomment-19512136): "using the `isOpen` state from Select + ComboBox works". That confirmation is attributed discussion evidence, not an independently run integration test or verified identity match with the issue author.
- A [verified member explicitly requested this issue](https://github.com/adobe/react-spectrum/discussions/10944#discussioncomment-19551085): "we need to make this easier to address" and "whether it's exposing `useIsHidden` publicly or something else". Existing maintainer engagement is not grounds to skip triage or close it as already answered.
- The issue provides no standalone reproduction or version/browser/OS inventory. That does not block the scoped design discussion, but runtime scope and third-party behaviour remain unverified; neither a private hook import nor a host-ref heuristic is recommended.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `Select`, `Popover`, `RAC` for affected components/layer; `has workaround` for public open-state gating; `needs decision` for the supported wrapper/hidden-effect contract; `ai-reviewed` for completed dry-run analysis.
- Removals: none. All proposed labels exist.
- Maintainer-only: no implementation `ready for review` recommendation until scope is chosen; no `waiting for author` proposal because missing runtime details do not currently block the design decision.

**Maintainer next step**

1. Decide whether to document public open-state forwarding, expose a supported hidden-state API, or change collection handling so wrappers need not know about the hidden pass. The member who requested the issue is an evidenced participant in that decision; nobody was contacted or assigned.
2. Suggested interim answer: use Select's public `isOpen` render value to enable only the shortcut scope, leaving the collection content present during the hidden pass:

   ```tsx
   <Select>
     {({isOpen}) => (
       <ApplicationSelectContents shortcutScopeEnabled={isOpen} />
     )}
   </Select>
   ```

   `ApplicationSelectContents` is an application-owned wrapper, not a RAC export: it must still render the Label, trigger, Popover and ListBox, and honour the flag only for shortcut registration/activation. Never conditionally remove the ListBox needed to build the collection. This pattern follows [Select's documented render-prop API](https://react-aria.adobe.com/Select) and trusted source, without assuming a third-party provider API.
3. Before implementing broader behaviour, obtain a minimal wrapper example plus RAC/React/hotkey-library versions and browser/OS. Check closed/open transitions, cleanup, collection discovery and any claimed ComboBox applicability; a discussion participant's test report is not validation of all collection components.

## Evidence and verification

### #10958: State path, history and related fixes

[SelectionManager.selectAll](https://github.com/adobe/react-spectrum/blob/6fc06c8e39770dd5530809b85a6fbdef94d86afc/packages/react-stately/src/selection/SelectionManager.ts#L427-L434) sets selected keys to `"all"` in multiple-selection mode. The [shared keyboard handler](https://github.com/adobe/react-spectrum/blob/6fc06c8e39770dd5530809b85a6fbdef94d86afc/packages/react-aria/src/selection/useSelectableCollection.ts#L355-L360) also calls `manager.selectAll()`. Select supplies its state to the nested ListBox through [ListStateContext](https://github.com/adobe/react-spectrum/blob/6fc06c8e39770dd5530809b85a6fbdef94d86afc/packages/react-aria-components/src/Select.tsx#L243-L266), supporting a common failure path.

The public [state types and value setter](https://github.com/adobe/react-spectrum/blob/6fc06c8e39770dd5530809b85a6fbdef94d86afc/packages/react-stately/src/select/useSelectState.ts#L154-L197) use arrays for multiple selection. Existing [RAC tests](https://github.com/adobe/react-spectrum/blob/6fc06c8e39770dd5530809b85a6fbdef94d86afc/packages/react-aria-components/test/Select.test.js#L889-L940) exercise individual selection/deselection and callbacks; the [controlled-value test](https://github.com/adobe/react-spectrum/blob/6fc06c8e39770dd5530809b85a6fbdef94d86afc/packages/react-aria-components/test/Select.test.js#L997-L1012) supports the explicit-value mitigation. A focused file search found no select-all test in this RAC test file; this is not a repository-wide coverage claim.

The GET files response for merged [#8734](https://github.com/adobe/react-spectrum/pull/8734) shows the `"all"` guard arriving with multi-selection support. This supports an implementation gap since feature introduction, not a proven previously-working-to-failing release transition. The report's claim that its node_modules patch works was not executed or independently accepted as the correct fix.

Merged [#10868](https://github.com/adobe/react-spectrum/pull/10868) intentionally lets Mod+A select **ComboBox input text** rather than options; it does not fix a focused Select ListBox or the direct state action. Merged [#9621](https://github.com/adobe/react-spectrum/pull/9621) concerns retaining unfiltered selection when toggling after an Autocomplete filter, not Select discarding `"all"`. Both were checked through PR metadata/body and file lists only, not treated as shipped fixes for this report.

Reported environment: `react-aria-components@1.22.1`, `react-stately@3.51.0`, React `19.3.1`, Chrome, macOS 15. Chrome's exact version is absent. The linked StackBlitz and external tracking discussion were not opened.

### #10957: Hidden pass, public API and historical scope

[Select's collection render function](https://github.com/adobe/react-spectrum/blob/6fc06c8e39770dd5530809b85a6fbdef94d86afc/packages/react-aria-components/src/Select.tsx#L145-L164) receives `isOpen: false`; its [visible render state](https://github.com/adobe/react-spectrum/blob/6fc06c8e39770dd5530809b85a6fbdef94d86afc/packages/react-aria-components/src/Select.tsx#L211-L235) receives `state.isOpen`. [Popover's hidden branch](https://github.com/adobe/react-spectrum/blob/6fc06c8e39770dd5530809b85a6fbdef94d86afc/packages/react-aria-components/src/Popover.tsx#L182-L203) returns children before the closed-overlay return. These explain the workaround without relying on issue-supplied code.

[Hidden](https://github.com/adobe/react-spectrum/blob/6fc06c8e39770dd5530809b85a6fbdef94d86afc/packages/react-aria/src/collections/Hidden.tsx#L64-L103) renders a template/context; it does not generally suppress arbitrary child effects. `useIsHidden` exists internally, but neither inspected public root export lists nor the [public CollectionBuilder entry](https://github.com/adobe/react-spectrum/blob/6fc06c8e39770dd5530809b85a6fbdef94d86afc/packages/react-aria/exports/CollectionBuilder.ts) exposes it. Its presence in a private path does not make it a supported consumer solution.

Closed [#6453](https://github.com/adobe/react-spectrum/issues/6453) also requested hidden-suite exports. Its [maintainer explanation](https://github.com/adobe/react-spectrum/issues/6453#issuecomment-2231816571) calls the facility an implementation detail, rather than a general-purpose utility. The newer member request in discussion #10944 keeps the present application-effect problem open for design; the historical closure is not evidence that this newer request should be rejected.

Closed [#10368](https://github.com/adobe/react-spectrum/issues/10368) instead concerns independent nested collections contributing items to the wrong collection and throwing. Its [context-clearing guidance](https://github.com/adobe/react-spectrum/issues/10368#issuecomment-5721500968) is not an established fix for an arbitrary hotkey provider's effects. No matching active implementation PR was found.

All source and test conclusions are reading-based. No tests, builds, dependency installation, issue/PR code or third-party integration were executed.

## Run notes

### Boundary and checkout

Dry run only: GitHub access used allowed `gh issue`/`gh pr`/`gh search` reads and `gh api --method GET`. No comments, labels, assignments, edits, closures, gists, PR creation or pushes. Issue/PR/discussion text and links were treated as untrusted data; related repository items were read through structured `gh` requests, not by opening supplied URLs. No suspected prompt injection was identified.

Verified `/Users/darobins/dev/react-spectrum-triage` on `triage_support`, no merge in progress, an empty index and no existing target digest. App status showed no other active issue/PR triage run; process and triage lock-file checks found no competing run. The local `.github/triage/setup.md` adaptation remained unstaged and untouched.

`git fetch origin` succeeded. With no tracked changes outside `.github/triage`, `git merge origin/main --no-edit` succeeded, creating synchronization commit `3b4a8123457647b60d0f7be444202085cafe0730`. Merged main/source commit: `6fc06c8e39770dd5530809b85a6fbdef94d86afc`, verified as an ancestor of HEAD. No merge conflict or skipped synchronization.

### Scope and discovery coverage

Window: since previous issue-digest commit `62999ccf63e889dec4e4229c13f51ccf1c5ee377`, committed at `2026-11-11T17:47:38Z`, through supplied run timestamp `2026-11-12T16:01:19Z`. The exact creation-window query and separate last-24-hours query each returned the same two open, unlabelled issues, below the 100-result limit. Preliminary broader updated-issue discovery was narrowed by creation time; a preliminary approximate cutoff was replaced by the exact prior commit timestamp.

Both authors had `author_association: NONE`. Final issue GETs still showed both open, unlabelled and with zero comments. No verified team-author exclusion applied; no organisation/employer inference was used.

Open/closed issue and PR searches covered Select/selectAll, select-all titles, multi-selection, hidden-tree effects, `useIsHidden`, collection effects and the exact new issue numbers. Searches stayed below their 30/50-result caps. Related issue/PR bodies and all returned comments were read; discussion #10944's eight returned top-level comments were also read. No matching pending select-all fix or hidden-effect implementation was established.

### Access failures and safe recovery

Collaborator-permission GETs for both authors returned HTTP 403, "Must have push access to view collaborator permission." `.github/CODEOWNERS` was absent from trusted main, and a tree-path search found no CODEOWNERS or explicitly named core-contributor list. Membership could not be verified, so normal triage proceeded with that uncertainty.

Initial guessed paths for `Select.test.tsx` and `useSelectState.test.js` were absent. A trusted tree listing located `packages/react-aria-components/test/Select.test.js`, which was inspected instead; no dedicated useSelectState test was established. These read failures do not imply a failed test run. No required issue discovery or source read remained blocked.

### Digest bookkeeping

The only new file intended for staging and the authorised digest commit is `.github/triage/tmp-digests/triage-issues-2026-11-12.md`, on `triage_support`, with the required Copilot co-author trailer. The index must be empty before staging and contain exactly this path before committing. The resulting digest commit hash and single-file verification are reported after committing rather than self-embedded here.
