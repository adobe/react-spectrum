# PR triage digest: 2026-11-17

## At a glance

- Six non-member PRs analysed; two verified member PRs skipped.
- NumberField changes a documented parser contract and has failing React 16/17 checks; Select adds an apparently unused public hook parameter.
- Four PRs are ready for focused maintainer review, not merge approval. The prose fix still needs verification through its actual published entry.

### [#10985](https://github.com/adobe/react-spectrum/pull/10985): Delete partial NumberField units

**Decision:** Not ready; resolve the parser contract and missing documentation, contributor attestation, and failing-check attribution before substantive review.

**Complexity:** High: changes the public parser's accepted input across NumberField consumers, not just one component's keyboard handling.

**Impact/severity:** Low: suffix editing is inconvenient, but selecting and deleting the complete unit is an existing supported workaround.

**Merge risk:** High: previously invalid input becomes a committed numeric value across the shared parser, with a documented compatibility change and unresolved React 16/17 failures.

#### What matters

- The [diff](https://github.com/adobe/react-spectrum/pull/10985/files) strips trailing prefixes during shared sanitisation, affecting both `isValidPartialNumber` and `parse`. It explicitly changes `parse('23.5 i')` for inches from `NaN` to `23.5`.
- [Current parser documentation](https://github.com/adobe/react-spectrum/blob/main/packages/dev/s2-docs/pages/react-aria/internationalized/number/NumberParser.mdx#L118-L133) says "`parse` ... only accepts complete input" and rejects partial units. Neither documentation copy is updated; the [approved issue direction](https://github.com/adobe/react-spectrum/issues/2806#issuecomment-5887343551) specifically discusses partial validation, not an explicit decision to relax committed parsing.
- [Current checks and checklist](https://github.com/adobe/react-spectrum/pull/10985) show `test-16` and `test-17` failing, CLA `ACTION_REQUIRED`, and contributor understanding unchecked. GitHub's check output names the failed jobs but supplies no failing assertions, so PR attribution is not established.
- Rendered RAC tests cover backspacing and committing an edited value with a partial suffix. Leading literals remain deliberately unsupported; the author reports no manual RTL verification.

#### Would have done

**Labels (proposed)**

Bot-eligible additions:

- `ai-reviewed`: prescribed high-complexity triage completed with compatibility and verification gaps recorded.
- `merge-risk: high`: shared parser acceptance changes and unexplained compatibility-check failures.
- `needs API review`: public parsing and partial-validation semantics change.
- `needs decision`: should committed `parse` accept partial literals, or should the change be confined to partial validation with a separate commit strategy?
- `waiting on author`: documentation and contributor-understanding confirmation are missing independently of CLA.

Removals: none. All proposed labels exist. No maintainer-only readiness label is recommended.

**Maintainer next step**

1. Resolve the committed-parsing question with the issue's existing reviewer, snowystinger; the suffix-validation direction itself already has support.
2. Request updates to both NumberParser documentation copies and the contributor's own confirmation that they understand the change.
3. Inspect the failed React 16/17 assertions and compare against a clean baseline before attributing or dismissing them. Retain the successful-job evidence without treating it as an explanation of the failures.
4. Record unsigned CLA as an additional readiness blocker handled by separate automation, not the reason for the waiting label.

### [#10977](https://github.com/adobe/react-spectrum/pull/10977): Enable Select select-all

**Decision:** Not ready for substantive review until the unexplained public `useListState` extension is removed or justified and reviewed.

**Complexity:** High: shared state behaviour plus a new exported hook parameter, with RAC integration coverage.

**Impact/severity:** Medium: multi-select bulk selection is broken, but individual selection and explicit controlled-value updates remain available.

**Merge risk:** Medium: changes shared list-hook construction and Select selection handling; the additive API and resulting review scope need resolution.

#### What matters

- The [Select diff](https://github.com/adobe/react-spectrum/pull/10977/files) expands `'all'` to enabled item keys and tests keyboard selection, disabled-item exclusion and subsequent deselection. This addresses [#10958](https://github.com/adobe/react-spectrum/issues/10958), including the author's need to select all except a few items.
- The same diff gives exported `useListState` a second callback parameter and an alternate selection-state construction path. No changed call site passes that argument, so the public extension is not demonstrated as necessary for this fix.
- The [maintainer's earlier lint concern](https://github.com/adobe/react-spectrum/pull/10977#issuecomment-6940513974) has a specific [author response](https://github.com/adobe/react-spectrum/pull/10977#issuecomment-6953640899), and current lint succeeds. Do not retain stale lint failure as a blocker; CLA also succeeds.
- This is the prescribed high-complexity assessment, not a full red-flag review. Changes in shared hook ordering and the extra callback path have not been independently executed.

#### Would have done

**Labels (proposed)**

Bot-eligible additions:

- `ai-reviewed`: prescribed high-complexity triage completed.
- `merge-risk: medium`: shared hook construction and selection behaviour need focused review.
- `needs API review`: adds an optional argument to exported `useListState`.
- `needs decision`: is the extra public callback needed for Select, or should this PR retain the existing hook signature and scope?

Removals: none. All proposed labels exist. No maintainer-only readiness label until the scope decision is resolved.

**Maintainer next step**

1. Resolve the public-hook scope question; request removal of unused API expansion unless a concrete caller and contract justify it.
2. Review enabled-item expansion and deselection semantics against #10958's discussion. The proposed synthetic "All" item did not meet the reporter's all-except-some workflow.
3. Reassess readiness after that decision, using the current successful lint rather than the superseded failure.

### [#10983](https://github.com/adobe/react-spectrum/pull/10983): Preserve ComboBox selection on Tab

**Decision:** Ready for focused keyboard/API review; preserve the distinction between multiple-selection dismissal and the deliberately retained single-selection commit behaviour.

**Complexity:** High: changes shared RAC core keyboard behaviour for an existing public selection mode.

**Impact/severity:** Medium: keyboard form navigation can undo a selection or add an unintended one; closing with Escape before Tab is an available alternate path.

**Merge risk:** Medium: a contained branch changes selection/commit semantics in shared keyboard handling; full low-complexity red-flag review was not performed.

#### What matters

- The [hook change](https://github.com/adobe/react-spectrum/pull/10983/files) calls `state.close()` rather than `state.commit()` for Tab in multiple selection, leaving Enter and the single-selection branch unchanged. No new props, exports, DOM or styling contracts are introduced.
- [#10974's maintainer response](https://github.com/adobe/react-spectrum/issues/10974#issuecomment-6929398379) agrees that toggling an already committed checkmark on Tab is undesirable. Rendered RAC cases cover Tab, Shift+Tab, an unselected focused option and custom input preservation.
- [#8744's earlier decision](https://github.com/adobe/react-spectrum/issues/8744#issuecomment-3331105870) retained the old single-selection behaviour. It is related context, not a replacement duplicate or evidence that the explicitly multi-select fix was rejected.
- The issue provides keyboard reproduction steps, not a standalone StackBlitz. CLA and current checks succeed; the author's before/after test claims were assessed by reading, not executed.

#### Would have done

**Labels (proposed)**

Bot-eligible additions:

- `ai-reviewed`: prescribed high-complexity triage completed.
- `merge-risk: medium`: shared keyboard commit behaviour changes.
- `needs API review`: Tab's observable behaviour changes for `selectionMode="multiple"`.

Maintainer-only recommendation:

- `ready for review`: clear reproduction, maintainer direction, rendered coverage and no current readiness blocker identified.

Removals: none. All proposed labels exist.

**Maintainer next step**

1. Review the multi-select-only compatibility boundary and focus traversal, including custom values and existing action/link handling.
2. Keep the older single-select decision intact unless separately reconsidered. No last-working version is established, so do not infer a regression from the bug report.

### [#10982](https://github.com/adobe/react-spectrum/pull/10982): Repair v3 testing links

**Decision:** Ready for maintainer review; the twenty documentation-only replacements point to existing test files.

**Complexity:** Low: link-only edits within one documentation package, with no executable or API change.

**Impact/severity:** Low: testing-reference navigation is broken; developers can navigate directly to the existing repository test files.

**Merge risk:** Low: bounded hyperlink repairs with target existence verified against main.

#### What matters

- The [twenty-line diff](https://github.com/adobe/react-spectrum/pull/10982/files) replaces obsolete package paths and fixes the swapped AlertDialog/ContextualHelp destinations plus DateRangePicker's self-reference.
- All eighteen distinct replacement paths exist in current-main's Git tree. Existing docs still contain the obsolete paths, so the repair is not already incorporated.
- ColorSlider and Slider intentionally retain their previous ColorArea test target, and DatePicker retains DateField. Those are existing reference choices, not newly introduced mismatches.
- No tests are needed for these link-only edits beyond static target inspection. No timing workaround, disabled check, accessibility behaviour change or sensitive configuration file is added; CLA succeeds.

#### Would have done

**Labels (proposed)**

Bot-eligible additions:

- `ai-reviewed`: low-complexity red-flag, existing-solution and duplicate checks completed.
- `merge-risk: low`: only hyperlink targets change, and every destination exists.
- `small review`: twenty localised link replacements require little review effort.

Maintainer-only recommendation:

- `ready for review`: description and static verification are sufficient for this documentation-only correction.

Removals: none. All proposed labels exist.

**Maintainer next step**

1. Review the three corrected destinations and merge through the normal review process if satisfied.
2. Treat any wish to retarget the other components' references as separate scope, not a blocker to restoring their existing links.

### [#10979](https://github.com/adobe/react-spectrum/pull/10979): Correct BC and derived-calendar leap years

**Decision:** Ready for calendar-focused maintainer review; current evidence resolves the earlier explanation, verification-instruction and CLA requests.

**Complexity:** Medium: coordinated changes to four calendar implementations and two test files, without new public signatures.

**Impact/severity:** Unknown: BC date arithmetic and derived-calendar year lengths can be wrong, but affected application workflows and a practical supported workaround are not established.

**Merge risk:** Medium: observable date-conversion and year-length corrections affect shared calendar consumers; this was not a full low-complexity red-flag review.

#### What matters

- The [diff](https://github.com/adobe/react-spectrum/pull/10979/files) uses astronomical years for Gregorian leap checks and converts Buddhist, Japanese and Taiwan dates before `getDaysInYear`. Existing methods return corrected values; no new API, DOM or styling contract is added.
- Tests cover BC leap-day manipulation, day-by-day Julian round trips from 10 BC through AD 10, and modern derived-calendar year lengths including 1900/2000 century cases.
- The [maintainer's requests](https://github.com/adobe/react-spectrum/pull/10979#issuecomment-6940588998) are reflected in the current body and [author reply](https://github.com/adobe/react-spectrum/pull/10979#issuecomment-6943427146). The live CLA result succeeds despite older comments about signing.
- Historical [#3060](https://github.com/adobe/react-spectrum/pull/3060) introduced BC extended-year conversion but left the era-year leap check in `fromJulianDay`. This is a remaining correctness gap, not an established regression or a competing duplicate.

#### Would have done

**Labels (proposed)**

Bot-eligible additions:

- `ai-reviewed`: prescribed medium-complexity triage completed.
- `merge-risk: medium`: shared calendar result changes need specialist review.

Maintainer-only recommendation:

- `ready for review`: current explanation, manual verification instructions, tests and checks support review.

Removals: none. All proposed labels exist.

**Maintainer next step**

1. Review proleptic-year consistency and inherited calendar semantics, especially year/era boundaries.
2. Treat the older CLA/explanation comments as addressed by current evidence, without assuming the PR has already been approved.

### [#10976](https://github.com/adobe/react-spectrum/pull/10976): Repair published prose macro evaluation

**Decision:** Ready for packaging-focused maintainer review; require actual package-entry consumer verification before merging, since the new tests use a custom source-entry target.

**Complexity:** Medium: macro compilation-boundary refactor, nested CSS emission correction and new packaging-test infrastructure.

**Impact/severity:** High for consumers of the published macro: build-time evaluation fails and prevents using shared prose styles; no practical supported fix for that published entry is established.

**Merge risk:** Medium: no intended public API change, but compilation and emitted language-specific CSS change; the downstream export/build path remains unverified.

#### What matters

- The [diff](https://github.com/adobe/react-spectrum/pull/10976/files) moves font resolution into a macro-imported helper and recursively emits nested conditional declarations. It plausibly addresses [#10975's missing `fontSize` binding](https://github.com/adobe/react-spectrum/issues/10975), with no new package export or consumer prop.
- New tests package and invoke CommonJS/ESM output and check nested CJK font weights. They build `src/style/prose.ts` directly; the actual `@react-spectrum/ai/style` export and downstream Vite macro-plugin path are not exercised.
- Current hosted checks and CLA succeed. The body separately discloses local date-test/lint failures without a clean-baseline reproduction; those are not established PR-caused failures, and green hosted status does not itself prove the missing downstream scenario.
- Reported output-size savings compare unoptimised build-time modules, not browser bundles. No package manifest, lockfile, CI workflow or build configuration is changed.

#### Would have done

**Labels (proposed)**

Bot-eligible additions:

- `ai-reviewed`: prescribed medium-complexity triage completed.
- `merge-risk: medium`: macro packaging and conditional CSS need focused verification.

Maintainer-only recommendation:

- `ready for review`: the failure is clear and targeted packaging coverage is present, with the remaining release-path gate explicitly identified.

Removals: none; preserve existing `AI`. All proposed labels exist.

**Maintainer next step**

1. Verify the built package through `@react-spectrum/ai/style` with the downstream Vite/plugin setup before merging; request that evidence if it cannot be supplied during review.
2. Review the compilation boundary and nested CJK CSS output. Do not interpret the disclosed local baseline/environment failures as proven regressions or the byte comparison as a browser-performance result.

## Member PRs skipped

- **Would have done:** [#10981](https://github.com/adobe/react-spectrum/pull/10981), snowystinger: API `author_association=MEMBER`; `rsp-core` proposed; analysis skipped (member PR).
- **Would have done:** [#10978](https://github.com/adobe/react-spectrum/pull/10978), reidbarber: API `author_association=MEMBER`; `rsp-core` proposed; analysis skipped (member PR).

## Evidence and verification

### #10985: Contract, coverage and existing workaround

Both `packages/@internationalized/number/docs/NumberParser.mdx` and the current RAC internationalized-number page describe strict committed parsing and rejection of partial unit/currency input. The changed parser tests deliberately reverse those outcomes. The proposal therefore needs documentation and an explicit compatibility decision, even though no method signature changes.

The original issue's [complete-unit deletion explanation](https://github.com/adobe/react-spectrum/issues/2806#issuecomment-1030217907) supplies a practical existing path: select the complete `mL` suffix and delete it. The later approval supersedes the older opposition to partial validation, but does not explicitly settle committed parsing. [#9905](https://github.com/adobe/react-spectrum/pull/9905), suggested for retesting in the issue, fixes input reset after equivalent `formatOptions` rerenders rather than partial-literal validation. Current-main parser assertions still reproduce the strict semantics by inspection.

Added parser cases reject a different unit such as `5 L` in a millilitre field and include a Greek unit fragment; rendered tests exercise backspace and Enter. These are relevant tests, not evidence that leading-unit, RTL or every numerical-punctuation ambiguity was manually verified. Author-reported results are 601 passed and two skipped across six suites; current hosted React 16/17 failures remain unexplained.

All thirteen original issue comments and the PR's author comment were read. The supplied CodeSandbox and before/after images are **provided but not inspected** under the contributor-URL restriction. No earlier working version supports a `regression` proposal.

### #10977 and #10983: Selection compatibility and workarounds

For #10977, current-main `useSelectState` returns immediately for `'all'`, matching the reporter's no-op. Current [Select documentation](https://github.com/adobe/react-spectrum/blob/main/packages/dev/s2-docs/pages/react-aria/Select.mdx#L273-L275) documents array-controlled multiple selection; assigning all known enabled keys to that array is an alternate bulk-action path, not a fix for the broken keyboard shortcut. The public `useListState` re-export is confirmed in `packages/react-stately/exports/useListState.ts`. The proposed second argument is not used by the changed Select call.

For #10983, current-main `useComboBox` unconditionally commits an open popup on Tab, while its Escape handler reverts/closes. #10974 reports RAC 1.22.0 / react-aria 3.53.0 on Firefox and Chrome/Linux, with steps that show selection undone after Enter then Tab. No working version is supplied. The older #8744 report concerns the single-select default and cross-browser/platform expectations; all eight comments were read before distinguishing it from the newer multiple-selection issue.

The Select StackBlitz and ComboBox's supplied recordings/docs URLs were not opened. All original-issue comments were read: two for #10958 and one for #10974. A non-member's favourable PR review on #10983 is not treated as maintainer approval.

### #10979: Historical comparison

The historical #3060 diff retains `else if (isLeapYear(year))` after converting the calculated extended year back to an era/year pair. Current main still does so, and its month/year lengths still inspect `date.year` directly. This supports a remaining defect rather than proof of a later regression. The derived-calendar additions override inherited year-length behaviour; they do not add a previously unavailable public operation.

### #10976: Actual packaging path and related work

Current-main `packages/@react-spectrum/ai/package.json` defines `exports/*.ts` library targets, whereas the new packaging test supplies a custom Node target for `src/style/prose.ts`. This distinction is the basis for the remaining verification gate, not a claim that the test is useless or the patch incorrect.

The issue records `@react-spectrum/ai` 0.5.2, Vite 7.3.2, `unplugin-parcel-macros` 0.2.0 and Node 24/macOS. Its StackBlitz and published-output URL are **provided but not inspected**. No issue comments exist. Merged [#10356](https://github.com/adobe/react-spectrum/pull/10356) and [#10375](https://github.com/adobe/react-spectrum/pull/10375) adjust prose typography and spacing rather than this packaging failure; neither is a replacement duplicate. No known-good package version establishes a regression.

### Duplicate and security-review boundaries

All-state PR searches covered closing issue numbers 2806, 10974, 10958 and 10975; behavioural terms for Gregorian leap years and test-suite links; and source terms including NumberParser, GregorianCalendar and prose. Issue searches covered the corresponding behaviours and exact phrases. No competing implementation with matching behaviour was identified; historical and related-but-distinct results are compared above. There is therefore no duplicate-closure recommendation or competing CLA preference to apply.

Only #10982 received the full low-complexity red-flag review. The other five received the prescribed medium/high summary, API and duplicate assessment, with current checks, available direction and material verification gaps recorded. None of the analysed diffs changes a CI workflow, dependency/script manifest, lockfile, install script or build configuration, so the mandatory sensitive-file **needs security review** flag is not triggered. This is not a security audit or an execution-based correctness claim.

## Run notes

### Scope and discovery

Window: since prior PR digest commit `2a70607a247d709c153d49dcdc5e9c1012a1e240`, `2026-11-16T16:23:11Z`, through final candidate confirmation at approximately `2026-11-17T16:30:35Z`.

An initial broader `gh pr list` query from `2026-11-16T08:00:00-08:00` returned the same eight candidates. Paginated GET discovery of all open PRs then covered 121 records in pages of 100 and 21, filtering creation timestamps against the exact prior-digest cutoff. All eight candidates are non-draft User accounts; none has `ai-reviewed` or a release label. No in-window bot or draft exclusion was needed.

Author association was checked before diffs, checks, linked issues or discussions. The two API `MEMBER` authors were skipped without reading those materials; only their membership/labels were assessed. Their requested "Would have done" actions are kept inline to preserve the member rule's one-line-only format.

For the other six authors, association is `NONE` or `CONTRIBUTOR`, which does not establish membership. Permission GETs for all six returned HTTP 403, "Must have push access to view collaborator permission." Current-main tree inspection found no CODEOWNERS under the root, `.github` or `docs`; core membership could not be independently verified, so normal triage was used.

Final reads confirmed all six analysed PRs remained open, non-draft, without `ai-reviewed`, and at the same heads:

- #10985: `69d18f80dd4cb8c876283a685a6cccbb0cdc5610`.
- #10983: `6a6cfd5f52fc6fb7afffbc3ca40aacbf0c5a2291`.
- #10982: `6efde86b71f7a6928bd8fa85ba8eb56ed78b9552`.
- #10979: `921cd396c3dc4372fab0e3400d21e2f5e9129df7`.
- #10977: `df941c4c7fab0f030a5e8de54dd86e8016ea239a`.
- #10976: `ab88f89d2c49944dc3e1ad73107e95840da0b7bc`.

Repository labels were read with paginated GET. Every proposed label, including `rsp-core`, exists. No labels need creation.

### Synchronization and checkout

Verified `/Users/darobins/dev/react-spectrum-triage`, branch `triage_support`, an empty index, no merge in progress and an absent target digest. Initial and pre-write session-status checks found no other active triage run; pre-write checks also found no index lock.

`git fetch origin` succeeded. The tracked-change check outside `.github/triage` was empty; `git merge origin/main --no-edit` reported "Already up to date." Incorporated `origin/main` is `360e35170568dfc99a2baaa78e6b7bdd36458d91`, verified as an ancestor of HEAD. No merge was skipped or conflicted.

The pre-existing local `.github/triage/setup.md` adaptation remains unchanged and unstaged. Its pre-write Git blob hash is `a194d4c22c50544f28e10db1f99d70fd47c948de`.

### Read failures and recovery

The full prompt exceeded the file-read limit; bounded reads covered its contents. Several combined GitHub outputs exceeded the display limit; their saved outputs were read in bounded ranges or recovered with narrower queries.

Reading `.github/CODEOWNERS` from main failed because that path does not exist; a subsequent tree listing checked all conventional locations. Collaborator-permission restrictions remain as described above.

`gh pr diff 10983` failed with HTTP 500, "diff ... temporarily unavailable due to heavy server load." Paginated GET of its three changed-file patches recovered the complete diff; no PR code was fetched or applied.

NumberField's failed-check detail was safely investigated through GitHub check-run and commit-status GETs. Those responses identify failed jobs but no assertions; external CircleCI links and the CLI command suggested in check output were not followed or executed. No required synchronization or safety check failed.

### Boundaries and commit bookkeeping

Dry run: GitHub access used only allowed `gh pr list/view/diff`, `gh issue view`, `gh search` and explicit GET API reads. No comments, labels, reviews, edits, closures, gists or other GitHub writes. No contributor URL was opened, and no PR branch, patch, reproduction or code was fetched, checked out, applied, installed or executed. Test claims were assessed through reading and reasoning only.

Only `.github/triage/tmp-digests/triage-prs-2026-11-17.md` is to be staged after repeating the empty-index check, verified as the sole staged path, and committed with `chore: add PR triage digest 2026-11-17` and the prescribed Copilot co-author trailer. The resulting hash and single-file commit are verified and reported separately to avoid self-referential edits. No push.
