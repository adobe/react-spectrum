| Issue | Severity | Reproduction? | Solvable without changes? | Ready for review? | Would label | Would comment | Would close / duplicate of | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [#10907](https://github.com/adobe/react-spectrum/issues/10907) Stale descendants under falsy parent keys | High: inconsistent tree mutations, limited to affected keys | Inline component and precise steps; not run | No, not for all valid keys | Yes | Would apply `bug`, `Tree`, `ready for review`, `ai-reviewed` (new) | Would comment with source confirmation and link to fix PR | Would not close; would link [#10908](https://github.com/adobe/react-spectrum/pull/10908) | High for cause; runtime unverified |
| [#10909](https://github.com/adobe/react-spectrum/issues/10909) Quiet Picker menu width | Medium: wrapped options, selection still available | Complete inline app and steps; not run | No for quiet styling; standard Picker is a partial workaround | Yes | Would apply `bug`, `Picker`, `Tabs`, `S2`, `has workaround`, `ready for review`, `ai-reviewed` (new) | Would comment with source confirmation and supported fallback | Would not close; no matching duplicate/fix found | High for Picker; medium for TabsPicker/runtime |

# Issue triage digest - 2026-11-02

**Git synchronization:** Verified `/Users/darobins/dev/react-spectrum-triage`, branch `triage_support`, no staged changes, no in-progress merge, and no other active triage session. Only the local `.github/triage/setup.md` adaptation was modified. `git fetch origin` succeeded. The tracked-change check excluding `.github/triage` was empty; `git merge origin/main --no-edit` reported "Already up to date." Merged baseline: `83fb30648fe0a1c463256423553d6b3a4ee2ce82`. No merge conflict. The setup adaptation remains unstaged. Nothing is pushed.

**Scope:** Since the previous issue digest commit, `2026-11-01T18:20:37Z`, through this run's collection before `2026-11-03T00:10:01Z` (local digest date: 2026-11-02). Read open issues created from 2026-11-01 onward to cover the boundary, then excluded previously covered and already triaged issues. Two eligible issues have no labels and no comments. Excluded [#10899](https://github.com/adobe/react-spectrum/issues/10899), already covered yesterday; [#10900](https://github.com/adobe/react-spectrum/issues/10900), labeled `bug`; [#10902](https://github.com/adobe/react-spectrum/issues/10902), labeled `waiting on author`; and [#10903](https://github.com/adobe/react-spectrum/issues/10903), labeled `needs investigation`. These labels are non-component triage labels, so those issues are outside the requested scope even where accessibility is involved.

**Read-only boundary:** All GitHub access used `gh issue list/view`, `gh pr list/view`, `gh search issues/prs`, or `gh api --method GET` for labels. No GitHub writes, gists, issue-supplied URL requests, reproduction execution, installs, builds, or tests. Source and documentation evidence below was read from the pinned `origin/main` commit, not issue snippets or PR code.

## [#10907](https://github.com/adobe/react-spectrum/issues/10907) useTreeData mutations leave stale descendants under parents keyed by 0 or an empty string

**Report:** Created 2026-11-02T22:36:12Z. Reports `react-stately` 3.51.0 at the same main commit as this digest, React 19.3.0, Jest/jsdom, macOS 27.2; no browser verification. No labels or comments.

**Evidence and assessment:**

- The [issue](https://github.com/adobe/react-spectrum/issues/10907) states: "`update` changes the lookup entry but leaves the old value in `items`" and "Moving the child to the root leaves a stale copy under its original parent."
- The [public key type](https://github.com/adobe/react-spectrum/blob/83fb30648fe0a1c463256423553d6b3a4ee2ce82/packages/%40react-types/shared/src/key.d.ts#L13) is `string | number`. The hook's [initial key extraction and parent construction](https://github.com/adobe/react-spectrum/blob/83fb30648fe0a1c463256423553d6b3a4ee2ce82/packages/react-stately/src/data/useTreeData.ts#L152-L185) preserve `0` and `''`; these are not invalid-input cases.
- [Ancestor reconstruction](https://github.com/adobe/react-spectrum/blob/83fb30648fe0a1c463256423553d6b3a4ee2ce82/packages/react-stately/src/data/useTreeData.ts#L192-L255) updates the map, then uses `while (node && node.parentKey)`. Either falsy parent key skips reconstruction, and the final root identity comparison cannot replace the descendant. This supports the reported tree/map mismatch without running the supplied code.
- [Remove and move](https://github.com/adobe/react-spectrum/blob/83fb30648fe0a1c463256423553d6b3a4ee2ce82/packages/react-stately/src/data/useTreeData.ts#L351-L425) use the same helper. Would escalate as **high severity** because consumers rendering or saving `items` can receive stale or duplicated state after valid mutations, not merely a visual discrepancy. Persistent data loss or a production incident is not established.
- The [documentation](https://github.com/adobe/react-spectrum/blob/83fb30648fe0a1c463256423553d6b3a4ee2ce82/packages/dev/s2-docs/pages/react-aria/useTreeData.mdx#L24-L32) promises immutable updates that re-render the tree. Existing APIs do not resolve the contract violation for these valid keys. No `has workaround` proposal: changing application identifiers is not a general repair.

**Duplicates and fix search:** Searched open and closed issues/PRs for `useTreeData`, `parentKey`, and falsy keys. [#10908](https://github.com/adobe/react-spectrum/pull/10908) is open, not draft, explicitly says "Closes #10907", and describes checking "null/undefined rather than truthiness." Would link this fix, not close the issue as a duplicate. Its claimed passing tests are contributor-reported, not independently verified. [#10539](https://github.com/adobe/react-spectrum/issues/10539) instead reports moving "a node into its own subtree"; [#8097](https://github.com/adobe/react-spectrum/issues/8097) reports "`getItem()` ... undefined" after moving a parent. These are related mutation defects, not evidence that the falsy-parent case is a duplicate.

**Reproduction/readiness:** The inline component, expected/actual output, exact source revision, and runtime/OS information are enough for a maintainer to reproduce. No hosted StackBlitz or independently executed reproduction exists here. Would ask for a hosted version as helpful, not block readiness on it. No `regression`: no previously working release is identified; regression tests in a PR do not establish a release regression.

### Would have done

- **Labels:** Would apply `bug` because the ancestor loop contradicts the valid-key contract; `Tree` because this is tree-data mutation; `ready for review` because the report is actionable; and `ai-reviewed` because automated triage is complete. `ai-reviewed` does not currently exist and would require maintainer approval to create. Would remove none. Would not apply `RAC` or `S2`: the defect is in the shared state hook, not a component-only layer.
- **Ready for review:** Would have added `ready for review`: yes. No blocking information is missing. Hosted reproduction and browser confirmation are absent, but the minimal steps and exact hook revision suffice for this state-only issue.
- **Comment:** Would comment:

  > The current main source supports this diagnosis: `updateTree` updates the lookup map, then stops rebuilding ancestors when `parentKey` is `0` or an empty string. Both are valid keys, so the returned tree can remain stale. I have not run your reproduction. The open fix PR https://github.com/adobe/react-spectrum/pull/10908 targets this report; the issue should remain open pending that fix. A StackBlitz or CodeSandbox using the reported version would also help others verify the behaviour, but the inline steps and exact revision are enough to investigate. No previously working version has been established.

- **Close / link:** Would not close or mark duplicate; would link #10908 as the proposed fix. No issue would be closed in favour of another.
- **Other:** Would escalate inconsistent tree/map state to maintainers through the existing fix PR; would request an optional hosted reproduction. No API/design decision appears necessary.
- **Confidence:** High for root cause and readiness; runtime and downstream persistence impact are unverified. A source-only explanation that preserves tree/map consistency for the supplied case would change the diagnosis; evidence that no consumer can persist stale state would lower severity.
- **Feedback prompt:** Is high severity appropriate for key-limited state inconsistency with no demonstrated production data loss?

## [#10909](https://github.com/adobe/react-spectrum/issues/10909) S2 quiet Picker menu is always 192px wide: its width calc() has no unit

**Report:** Created 2026-11-02T23:40:25Z. Reports RSP S2 1.7.1, Chrome, macOS. Includes a full inline Vite reproduction and measurements, but no hosted reproduction. No labels or comments.

**Evidence and assessment:**

- The [issue](https://github.com/adobe/react-spectrum/issues/10909) reports: "The menu is 192px wide whatever the field's width, and longer options wrap onto two or three lines." These exact dimensions are author observations, not independently measured here.
- [Picker.tsx:454-466](https://github.com/adobe/react-spectrum/blob/83fb30648fe0a1c463256423553d6b3a4ee2ce82/packages/%40react-spectrum/s2/src/Picker.tsx#L454-L466) contains `isQuiet: '[calc(var(--trigger-width) - 24)]'`, a quiet minimum of `192`, and an explicit `menuWidth && !isQuiet` guard. The unitless subtraction is inconsistent with subtracting a length. Merely recommending `menuWidth` would not repair a quiet Picker because that prop is ignored in this branch.
- [TabsPicker.tsx:261-270](https://github.com/adobe/react-spectrum/blob/83fb30648fe0a1c463256423553d6b3a4ee2ce82/packages/%40react-spectrum/s2/src/TabsPicker.tsx#L261-L270) also contains `width: 'calc(var(--trigger-width) - 24)'` and `minWidth: 192`. Would include collapsed Tabs in a maintainer's investigation, but its generated CSS and runtime behaviour have not been independently checked.
- Would propose **medium severity**: option wrapping and incorrect layout affect quiet menus, but no crash, inaccessible selection, or data loss is established. Would not generalise the 192px result to every content/viewport combination without browser verification.
- Would propose a library fix to make the subtraction dimensionally valid in both source locations, with browser checks for quiet Picker and collapsed Tabs. No code change is made by this digest.

**Existing API fallback:** [PickerStyleProps](https://github.com/adobe/react-spectrum/blob/83fb30648fe0a1c463256423553d6b3a4ee2ce82/packages/%40react-spectrum/s2/src/Picker.tsx#L109-L119) exposes `isQuiet`. The non-quiet [width branch](https://github.com/adobe/react-spectrum/blob/83fb30648fe0a1c463256423553d6b3a4ee2ce82/packages/%40react-spectrum/s2/src/Picker.tsx#L454-L466) uses `--trigger-width`; the [docs](https://github.com/adobe/react-spectrum/blob/83fb30648fe0a1c463256423553d6b3a4ee2ce82/packages/dev/s2-docs/pages/s2/Picker.mdx#L331-L359) describe popover options. Would offer `isQuiet={false}` only if standard styling is acceptable. This changes appearance, does not fix quiet styling or TabsPicker, and is source-supported rather than runtime-verified. Would not recommend the author's app stylesheet override or editing generated CSS.

**Duplicates and fix search:** Searched open/closed issues and PRs for quiet Picker, Picker width/calc, TabsPicker, and direct references to #10909. No matching fix PR or duplicate found. [#5460](https://github.com/adobe/react-spectrum/issues/5460) reports "the selected item text ... can overflow outside the container" on version 3.32.2, not S2 popover width. [#5592](https://github.com/adobe/react-spectrum/pull/5592) addresses "a large space between the text and the caret" on a label-free quiet Picker, also not this defect. [#6812](https://github.com/adobe/react-spectrum/pull/6812) introduced quiet S2 styling but supplies no earlier working version; would not apply `regression`.

**Reproduction/readiness:** Full app files, steps, expected/actual widths, package version, browser, OS, and matching main source are enough detail to reproduce. Would request an optional StackBlitz/CodeSandbox, without withholding readiness.

### Would have done

- **Labels:** Would apply `bug` for the malformed width expression; `Picker` for the reported component; `Tabs` for the same expression in TabsPicker; `S2` for the RSP layer; `has workaround` for the standard-style fallback, with its appearance tradeoff; `ready for review` for the actionable report; and `ai-reviewed` for completed automated triage. Only `ai-reviewed` is absent from the current repository label set. Would remove none.
- **Ready for review:** Would have added `ready for review`: yes. No blocking information is missing. Hosted reproduction and independent measurements remain unavailable.
- **Comment:** Would comment:

  > Both width expressions are still present on current main: the quiet Picker subtracts a unitless `24` from `--trigger-width`, and TabsPicker has the same subtraction. That supports the reported invalid CSS diagnosis, although I have not built or run the reproduction or independently measured the menus. `menuWidth` is not a quiet-mode workaround because the current implementation explicitly ignores it when `isQuiet` is true. If standard styling is acceptable temporarily, use `isQuiet={false}` on the existing Picker; that branch uses the trigger width. For example:
  >
  > ```tsx
  > <Picker label="Data model" isQuiet={false}>
  >   <PickerItem id="experience">Experience Data Model</PickerItem>
  > </Picker>
  > ```
  >
  > See https://react-spectrum.adobe.com/s2/Picker for the Picker API and popover options. This is only an appearance-changing fallback, not a repair for quiet Picker or collapsed Tabs. The library fix should address both source expressions and verify their rendered widths. A hosted StackBlitz or CodeSandbox would help independent verification; the inline app already gives enough detail to investigate.

- **Close / link:** Would not close or link as duplicate; no matching fix PR found. Would retain this issue.
- **Other:** Would request an optional hosted reproduction and maintainer verification of both quiet Picker and collapsed Tabs. Would not recommend DOM-dependent overrides, `!important`, or generated-file edits.
- **Confidence:** High for Picker's malformed width and ignored quiet `menuWidth`; medium for exact browser dimensions and TabsPicker consequences. Browser output showing valid generated CSS or a different sizing cause would change the assessment.
- **Feedback prompt:** Should `has workaround` be used when the only supported fallback changes the requested quiet appearance?

## Rule feedback

- **Window:** Used the prior digest commit time as the reproducible "since last digest" boundary rather than a strict rolling 24-hour window. The broad list query covered the entire preceding calendar day to avoid boundary gaps.
- **Already triaged:** Excluded issues with any non-component label, including the keyboard accessibility report #10903. Its importance does not override the explicit untriaged-only scope.
- **Reproduction:** Accepted detailed inline examples under "or enough detail to reproduce." Would request hosted reproductions as optional, not apply `waiting for author` when no blocking author action is needed. No reproduction was executed and no issue-supplied URL was opened.
- **Labels:** Live GET enumeration covered two pages, including `S2`, `RAC`, `Tree`, `Tabs`, `has workaround`, and `ready for review`. `ai-reviewed` is absent; both proposals explicitly mark it as new. The repository has `waiting on author`, not the rule's exact `waiting for author`; neither is proposed here. Yesterday's digest's claim that `S2` was absent is not reused.
- **Severity and fallback:** High severity for #10907 is a judgment about state integrity, not a verified production incident. `has workaround` on #10909 refers only to the non-quiet appearance tradeoff, not a complete solution.
- **Search limitations:** All searches included open and closed results. Some exact multi-term/body searches returned no hits even though broader searches found relevant reports; those empty searches are not proof of absence. Broader results, related issue bodies, and direct issue-number PR searches were also checked. Search result limits were not reached.
- **Read failures:** Initial reads at the obsolete paths `packages/@react-stately/data/src/useTreeData.ts` and `packages/react-stately/src/types/shared.ts` failed. Recovered via `git ls-tree`/`git grep` and successfully read the actual main paths cited above. No required source check remained blocked.
- **Local validation:** Initial digest-structure checks failed due to a reserved `awk` counter name and then counting the Rule feedback label note as an issue action. The checker was corrected to inspect issue blocks only and rerun before staging; neither failure changed the index.
- **Trust boundary:** Reproduction commands in issue bodies were treated as data and not executed. No instruction override or suspected prompt injection was observed. PR #10908 test claims were read as untrusted contributor evidence, not reported as this run's validation.
- **Git scope:** The local setup adaptation is intentionally preserved and not staged. Only this generated digest is eligible for staging/commit; no push or GitHub mutation is authorised or performed.
