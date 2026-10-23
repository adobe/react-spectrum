| Issue | Severity | Reproduction? | Solvable without changes? | Would label | Would comment | Would close / duplicate of | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [#10839: year-9999 render hang](https://github.com/adobe/react-spectrum/issues/10839) | High | Self-contained component; not executed here | No general fix; narrower valid application range may avoid boundary | Would apply `bug`, `Calendar`, `RAC` | Would link pending fix #10841 and request saved sandbox | Would keep open pending fix; no duplicate closure | High |
| [#10844: Safari/VoiceOver Select silence](https://github.com/adobe/react-spectrum/issues/10844) | High | Public docs example and exact interaction; not executed here | No verified supported workaround | Would apply `bug`, `Select`, `RAC`, `accessibility`, `needs investigation` | Would request Safari/macOS versions and announcement/navigation details | Would keep open; older reports differ | Medium |
| [#10846: read-only ComboBox clears on blur](https://github.com/adobe/react-spectrum/issues/10846) | Medium | Detailed Storybook snippet with a type typo; no saved runnable project | Partial: author-reported retained selected item; underlying bug remains | Would apply `bug`, `ComboBox`, `RAC`, `has workaround`, `needs investigation` | Would request sandbox and show retained-item mitigation | Would keep open; no matching duplicate found | Medium |
| [#10838: year choice changes month](https://github.com/adobe/react-spectrum/issues/10838) | Medium | Self-contained component; not executed here | Not established; existing month-picker advice is unverified | Would apply `Calendar`, `RAC`, `needs investigation` | Would distinguish bounded year-only case from docs example | Would keep open; #10531 concerns missing final year | Medium |
| [#10843: Autocomplete stable/API request](https://github.com/adobe/react-spectrum/issues/10843) | Low | N/A: release/API question, not a defect reproduction | No confirmed stable RAC alternative meeting all requirements | Would apply `Autocomplete`, `ListBox`, `RAC`, `enhancement`, `needs API review` | Would separate release discussion from concrete API request | Would keep API request open; no duplicate found | Medium |

# Issue triage digest - 2026-10-23

**Git synchronization:** Verified `/Users/danilu/dev/react-spectrum-triage` on `triage_support`. Fetch and merge succeeded; merged `origin/main` commit `c53ff23df8ca0b7ec2205a3ecd4a0c7e3433e58f`. No pre-existing changes were reported. Only this digest is staged and committed by this run; never pushed.

**Window:** Since the previous issue digest's stated cutoff, 2026-10-22 22:40:25 UTC, through this run's initial snapshot, 2026-10-23 18:51:46 UTC. All five open issues in that window have no labels and qualify. The exact cutoff query was rechecked. Earlier #10833 is outside this window; already-labeled #10837 is also outside it.

**Evidence limits:** GitHub reads used only `gh` list/view/search and GET requests. No GitHub changes, gists, or pushes. Issue bodies and comments are reports, not independently reproduced results. Source observations below came from Scout; the owner/repository selector resolves multiple attached checkouts, so they are corroboration rather than proof of the exact merged-main implementation. Browser, screen-reader, and sandbox execution were not performed. No known-good release is supplied for any defect, so no regression is established.

## #10839 - CalendarYearPicker enters an infinite loop at Gregorian year 9999

**Decision and evidence:** Would prioritize high: the [report](https://github.com/adobe/react-spectrum/issues/10839) says rendering alone makes the page "unresponsive before the year picker's child can render." It reports RAC 1.22.1, react-aria 3.53.1, and date 3.12.4 on Windows Playwright engines. A synchronous main-thread hang blocks the whole page; no data loss or broader critical impact is established. Would link the already-open [fix #10841](https://github.com/adobe/react-spectrum/pull/10841), whose body explicitly says "Closes #10839" and reports the pre-fix test exhausting memory and 63 post-fix calendar tests passing. These are PR-author results, not checks run by this digest.

**Existing APIs / duplicate check:** A genuinely narrower application date range may avoid year 9999 but changes allowed dates, so would not treat it as a general fix or apply `has workaround`. The indexed loop advances without a progress check at [`packages/react-aria/src/calendar/useCalendarYearPicker.ts:85-105`](https://github.com/adobe/react-spectrum/blob/main/packages/react-aria/src/calendar/useCalendarYearPicker.ts#L85-L105). Searches for `CalendarYearPicker` found #10841, #10531/#10536 and older #10140/#10149. [#3109](https://github.com/adobe/react-spectrum/issues/3109) concerns December-9999 DatePicker navigation; [#3149](https://github.com/adobe/react-spectrum/pull/3149) says to verify "the next button is disabled." That is distinct from this render-time year-list loop. Would not close as their duplicate.

### Would have done

- **Labels:** Would add `bug` for the reported hang, `Calendar` for the owning component, and `RAC` for the reproduction layer. Would remove none. All exist. Would not add `needs investigation` while an explicitly linked corrective PR already describes the cause and coverage.
- **Comment:** Would post:

  > Thanks for the isolated render-only example. This is being addressed by [#10841](https://github.com/adobe/react-spectrum/pull/10841), which explicitly links this issue and adds termination coverage at the supported upper year boundary. The PR is still open, so this is not yet a released fix.
  >
  > Could you save the supplied component in a minimal StackBlitz or CodeSandbox with the reported versions so the reproduction stays runnable? There is no need for a custom dropdown example. Constraining dates below the boundary is only an option if it matches your application's actual allowed range; it is not a general replacement for the fix.
- **Close / link:** Would keep open until the corrective PR is merged and resolution confirmed; would link #10841 as the pending fix, not close in favor of another issue.
- **Other:** Would route to the calendar team for review of #10841, including final-year uniqueness and constrained ranges; would request the saved sandbox without marking `waiting`, because the standalone snippet and fix already enable work.
- **Confidence:** High on priority and fix linkage, not independent verification. A merged/released fix or evidence that a supported year still hangs would change the next action.
- **Feedback prompt:** Review high priority despite the unusual boundary, and whether additional triage labels are useful while a fix PR exists.

## #10844 - Select does not announce opening with Safari and VoiceOver

**Decision and evidence:** Would prioritize high and apply `accessibility`: the [report](https://github.com/adobe/react-spectrum/issues/10844) says "When the Select popover is opened, nothing is announced" on the public [Select example](https://react-aria.adobe.com/Select), using Space with VoiceOver. Missing opening feedback affects nonvisual discovery and context. It does not establish that options cannot subsequently be navigated or selected, so that stronger claim is not made. Reported package is react-aria 3.53.1; Safari/macOS versions and VoiceOver mode are absent.

**Duplicate / existing API check:** Open/closed issue and PR searches used `Select VoiceOver Safari`, `Select announcement`, `Select VoiceOver`, and `Select Safari`. The broader search found [#8077](https://github.com/adobe/react-spectrum/issues/8077), about arrows reaching outside the popover, with a [follow-up](https://github.com/adobe/react-spectrum/issues/8077#issuecomment-2803737093) saying VO-command navigation "is contained in the List as expected." [#2779](https://github.com/adobe/react-spectrum/issues/2779) describes the selected value "audibly cutting off" highlighted options in Chrome and was [closed after a newer Chrome/macOS retest](https://github.com/adobe/react-spectrum/issues/2779#issuecomment-2305670339). Neither establishes the same Safari opening-announcement failure. No matching fix surfaced. Would not recommend extra live regions or focus manipulation without isolation, and would not apply `browser bug` based only on Safari specificity.

### Would have done

- **Labels:** Would add `bug` for missing opening feedback, `Select` and `RAC` for the docs component, `accessibility` for screen-reader impact, and `needs investigation` for Safari/VoiceOver isolation. Would remove none. All exist.
- **Comment:** Would post:

  > Thanks for the public docs reproduction; a separate sandbox is not needed to start investigating this. Please share your exact macOS and Safari versions, whether VoiceOver Quick Nav is enabled, and whether the Select starts with a selected value.
  >
  > After opening with Space, are option labels announced when navigating the list, and can an option still be selected? Does opening with VoiceOver's activation command differ? This will help distinguish missing opening feedback from a broader navigation failure. We have not yet established a browser-level cause or a safe workaround.
- **Close / link:** Would keep open. Would not mark duplicate of #8077 or #2779 because their quoted failures and environments differ.
- **Other:** Would escalate to accessibility/Select maintainers for a real Safari/VoiceOver reproduction; no Spectrum-design or API-review escalation indicated. Would not apply `waiting` because the linked docs example is actionable.
- **Confidence:** Medium. A specific Safari/VoiceOver reproduction, evidence of complete operability loss, or a same-root-cause fix would change severity or linkage.
- **Feedback prompt:** Review high severity for missing opening feedback before total navigation failure is established.

## #10846 - Read-only controlled ComboBox clears a selection missing from items

**Decision and evidence:** Would prioritize medium: the [report](https://github.com/adobe/react-spectrum/issues/10846) says focus then blur makes a "Change event [fire] with `null` and the input is cleared," despite `isReadOnly`, on RAC 1.22.0. This risks unexpected form-state mutation, but persisted data loss is not established. The reporter explicitly provides two workarounds, including "ensuring that the items always contain at least the selected item." The indexed [`setFocused` blur branch](https://github.com/adobe/react-spectrum/blob/main/packages/react-stately/src/combobox/useComboBoxState.ts#L597-L607) calls `commitValue()` under `shouldCloseOnBlur` without an `isReadOnly` check; [`commitSelection`](https://github.com/adobe/react-spectrum/blob/main/packages/react-stately/src/combobox/useComboBoxState.ts#L551-L559) resolves missing item text to `''`. This supports investigating blur behavior, not independent confirmation of the exact `null` payload.

**Reproduction / duplicate check:** Detailed Storybook code is supplied, but `Countryy[]` is a typo for the defined `Country[]`, and no runnable project is linked. Would request a saved sandbox, not dismiss the useful snippet. Open/closed issue and PR searches used `ComboBox readonly`, `ComboBox blur null`, and `ComboBox "read only"`; only this issue surfaced. The report's `Ok` example retains the selected item and uses the supported collection surface rather than internals. Would consider `has workaround`, explicitly author-reported and unverified here, while keeping the underlying read-only behavior open.

### Would have done

- **Labels:** Would add `bug` for the reported read-only mutation, `ComboBox`, `RAC`, `has workaround` for the author-reported retained-item mitigation, and `needs investigation` for blur/commit behavior. Would remove none. All exist.
- **Comment:** Would post:

  > Thanks for the paired empty-collection and selected-item examples. Could you save them in a minimal StackBlitz or CodeSandbox on RAC 1.22.0? The `options` annotation currently says `Countryy[]`; changing that to the defined `Country[]` should make the example easier to run.
  >
  > As a temporary mitigation, keep the selected record in the items collection while asynchronous results are absent, as your `Ok` example does:
  >
  > ```tsx
  > const items = selectedItem && !results.some(item => item.id === selectedItem.id)
  >   ? [selectedItem, ...results]
  >   : results;
  >
  > <ComboBox items={items} value={value} inputValue={inputValue}
  >   onChange={onChange} onInputChange={setInputValue} isReadOnly>
  >   {/* Keep your existing Label, Input, Button, Popover, and ListBox. */}
  > </ComboBox>
  > ```
  >
  > Here `selectedItem` is the retained record for the controlled key and `results` is the current fetched collection. This uses the public `items` API ([ComboBox docs](https://react-aria.adobe.com/ComboBox)), but the mitigation is based on your report and is not independently verified here. A read-only field emitting a clearing change on blur still merits investigation; this is not a reason to remove labels or focus indicators.
- **Close / link:** Would keep open; duplicate target none. A mitigated application does not establish correct library read-only behavior.
- **Other:** Would request the sandbox and a last-known-good version if available; would route to ComboBox/state maintainers. Would not copy the report's `outline: "none"` styles or recommend callback suppression as a general solution.
- **Confidence:** Medium. Exact callback payload reproduction, a failing prior version comparison, or failure of the retained-item example would change labeling or proposed mitigation.
- **Feedback prompt:** Review `has workaround` for the retained-item approach while retaining the underlying defect.

## #10838 - Bounded year selection also changes the displayed month

**Decision and evidence:** Would prioritize medium and investigate before declaring a confirmed bug. The [report](https://github.com/adobe/react-spectrum/issues/10838) says "June 2026" becomes "January 2028" with a bounded year-only picker. It supplies a standalone native-select example on RAC 1.22.1 and react-aria 3.53.1. The indexed range setup replaces the starting date with `minValue` at [`useCalendarYearPicker.ts:77-82`](https://github.com/adobe/react-spectrum/blob/main/packages/react-aria/src/calendar/useCalendarYearPicker.ts#L77-L82), and `onChange` uses the generated whole date at [`:113-119`](https://github.com/adobe/react-spectrum/blob/main/packages/react-aria/src/calendar/useCalendarYearPicker.ts#L113-L119). This is consistent with the reported month shift; intended year-only behavior still needs confirmation.

**Existing advice / duplicate check:** An [existing comment](https://github.com/adobe/react-spectrum/issues/10838#issuecomment-6358245260) says "Looks like it works here" at the docs' month-and-year example and suggests a hidden month picker. Would not repeat that as a verified workaround: it does not address the supplied bounded, year-only case, and mounting a hidden control is not an established supported solution. CalendarYearPicker searches found [#10531](https://github.com/adobe/react-spectrum/issues/10531), whose failure is "Options are `[2024]`" when 2025 should be included. Its merged [fix #10536](https://github.com/adobe/react-spectrum/pull/10536) "includes the final overlapping calendar year and clamps its item date to `maxValue`." That fixes membership, not preservation of the current month. The scoped `"CalendarYearPicker" "month"` search returned no additional results; this does not prove none exist.

### Would have done

- **Labels:** Would add `Calendar` and `RAC` for the component/layer, and `needs investigation` because intended month preservation and the existing reply need reconciliation. Would remove none. All exist. Would hold `bug` and `has workaround` pending that confirmation.
- **Comment:** Would post:

  > The bounded, year-only example is a useful distinction from the docs' combined month-and-year example: it reports June 2026 becoming January 2028 when only the year changes. Could you save that exact component in a minimal StackBlitz or CodeSandbox with the stated versions?
  >
  > The generated item date being passed to `setFocusedDate` is consistent with the month changing when the range starts at January 1. We should confirm the intended year-only behavior and check valid-month preservation, invalid days, and range boundaries before recommending a change.
  >
  > #10531/#10536 concern inclusion of the final year rather than this month-preservation question. I would not rely on a hidden month picker as a confirmed workaround without verifying that it addresses this bounded example through supported behavior.
- **Close / link:** Would keep open; would link #10531/#10536 as related range-construction history, not a resolving duplicate.
- **Other:** Would ask calendar maintainers to resolve the behavioral expectation and test the exact bounded example. Would request the sandbox without applying `waiting`; the supplied component is already actionable.
- **Confidence:** Medium. Confirmed intended behavior, a runnable reproduction, or a supported month-preserving composition would change bug/workaround labeling.
- **Feedback prompt:** Review holding `bug` pending the year-only behavior decision, and not endorsing the hidden-picker suggestion.

## #10843 - Autocomplete stability and a supported ListBox virtual-focus API

**Decision and evidence:** Would prioritize low as a planning/API request, not a runtime defect. The [report](https://github.com/adobe/react-spectrum/issues/10843) says its design system cannot ship RC APIs and asks for a "documented prop on RAC `ListBox`." It reports RAC 1.21.0/react-aria 3.52.0. The indexed [Autocomplete docs declaration](https://github.com/adobe/react-spectrum/blob/main/packages/dev/s2-docs/pages/react-aria/Autocomplete.mdx#L9-L11) explicitly has `version = 'rc'`; the cited merged [#9289](https://github.com/adobe/react-spectrum/pull/9289) is titled "docs: add rc badge to react aria autocomplete," not a stable-release commitment. No date is inferred.

**Existing APIs / duplicate check:** Open/closed issue/PR searches used `Autocomplete stable`, `Autocomplete "release"`, and `shouldUseVirtualFocus ListBox`; no matching release commitment or duplicate surfaced. Indexed [`ListBoxProps`](https://github.com/adobe/react-spectrum/blob/main/packages/react-aria-components/src/ListBox.tsx#L154-L160) inherits hook props, and [`ListBoxInner`](https://github.com/adobe/react-spectrum/blob/main/packages/react-aria-components/src/ListBox.tsx#L286-L295) spreads props into the hook. That does not by itself promise a documented, supported input-driven ListBox API or prove the reporter's exact type/export claims across releases. Would not endorse synthetic keyboard/click redispatch or dependencies on Autocomplete bridge internals. A hook-based composition could require application-level accessibility integration; no complete stable alternative is verified here.

### Would have done

- **Labels:** Would add `Autocomplete`, `ListBox`, and `RAC` for the requested surface; `enhancement` and `needs API review` for the concrete supported-prop request. Would remove none. All exist.
- **Comment:** Would post:

  > The Autocomplete docs currently mark it as RC; #9289 added that badge and does not establish a stable release date. I do not have a confirmed timeline to share. Release-planning questions are better suited to [Discussions](https://github.com/adobe/react-spectrum/discussions).
  >
  > There is also a concrete API request here worth evaluating separately: a documented, supported way to keep DOM focus on an external search input while a RAC ListBox, optionally virtualized, manages active options and selection. The requirements include arrow navigation, Enter selection, and the input-to-list accessibility relationship, not just accepting a prop.
  >
  > Passing an undocumented prop or redispatching keyboard/click events should not be treated as a supported workaround. The team needs to confirm whether to expose this integration independently or make it part of Autocomplete's stable API; no delivery date or API commitment is implied.
- **Close / link:** Would keep the concrete API request open; would direct only the release-timeline discussion to Discussions. Would not create a discussion, close as a duplicate, or link to an invented release tracker.
- **Other:** Would escalate to the Autocomplete/ListBox API owners. Runnable reproduction request none: the desired interaction and current workaround are described sufficiently for API review.
- **Confidence:** Medium. A maintainer-approved roadmap, documented supported composition covering the full interaction, or existing matching API tracker would change the recommendation.
- **Feedback prompt:** Review retaining the actionable API request while routing timeline discussion out of the issue tracker.

## Rule feedback

- Used the previous digest's explicit window end rather than its later Git commit timestamp, avoiding gaps. No earlier untriaged issue was reprocessed solely because it remains open.
- All proposed labels exist in the fetched repository label list. Severity values and `regression` are not existing labels; severity remains prose, and no known-good version supports a regression recommendation. No new labels are proposed.
- The issue form accepts a specific public docs example; #10844 therefore does not need an additional sandbox. For the three standalone defect snippets, would request a saved runnable project without blocking investigation or applying `waiting`.
- #10839 already has a direct corrective PR, so linking it is more useful than a fresh generic investigation request. It remains open; reported PR test results are not independently verified.
- #10838's existing hidden-month-picker suggestion is not assumed safe, effective, or intended API behavior. Confirmation of the bounded year-only behavior is the maintainer decision.
- #10843 combines a discussion-style timeline question with a specific API proposal. Would preserve the latter for API review instead of proposing unconditional closure.
- Scout searches used the owner/repository selector before its multiple attached-checkout ambiguity was visible. Retrieved source is qualified corroboration, not a claim that an exact release or merged-main snapshot was verified. The live issue/PR quotes independently support the recommendations; browser execution, screen-reader reproduction, and exact release-source verification remain open.
- Search phrases and inspected candidate reports are documented per issue. No matching search result is not proof that no duplicate exists. Historical attachment videos/images were not needed to distinguish the quoted failures and were not inspected.
