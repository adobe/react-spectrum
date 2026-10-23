| Issue | Severity | Reproduction? | Solvable without changes? | Would label | Would comment | Would close / duplicate of | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [#10833: locale-dependent date-field crash](https://github.com/adobe/react-spectrum/issues/10833) | High | Inline component and Intl snippets; no complete runnable project | Temporary, author-reported locale override only; proper fix needed | Would apply `bug`, `DateField`, `DatePicker`, `TimeField`, `RAC`, `internationalization`, `has workaround`, `needs investigation` | Would request a runnable reproduction and runtime details; show a scoped, temporary locale override | Would keep open; no matching duplicate found | Medium |
| [#10837: S2 ProgressCircle SVG diagnostics](https://github.com/adobe/react-spectrum/issues/10837) | Low | Runnable gist reported; fetching it was rate-limited; not executed | No supported consumer fix established | Would apply `bug`, `ProgressCircle`, `S2`, `needs investigation` | Would acknowledge supplied reproduction and request shipping-browser confirmation | Would keep open; no matching duplicate found | Medium |

# Issue triage digest - 2026-10-22

**Window:** 2026-10-21 22:40:25 UTC through 2026-10-22 22:40:25 UTC, the last 24 hours at invocation. Four open issues were created in this window; two qualify because they have no labels. Excluded already-triaged issues: [#10827](https://github.com/adobe/react-spectrum/issues/10827) (`enhancement`) and [#10825](https://github.com/adobe/react-spectrum/issues/10825) (`documentation`, `good first issue`). Scope and labels were rechecked before drafting.

**Read-only status:** No issues, comments, labels, PRs, repository files, or git state changed. Recommendations below are proposals only. Browser reproductions were not executed. Source observations use the Scout-indexed checkout, not an independently verified live `main` snapshot.

## #10833 - useDateSegment crashes when a locale has no dayPeriod

**Evidence and impact.** The [report](https://github.com/adobe/react-spectrum/issues/10833) states: "`DatePicker`, `DateField` and `TimeField` throw during render when the locale is `fr-CM`," with `TypeError: Cannot read properties of undefined (reading 'value')`. It reports `react-aria 3.51.0 / react-aria-components 1.20.0`, and that visitors "couldn't open a birthdate picker." The indexed implementation corroborates unchecked lookups in both AM and PM memos: [`packages/react-aria/src/datepicker/useDateSegment.ts:147-158`](https://github.com/adobe/react-spectrum/blob/main/packages/react-aria/src/datepicker/useDateSegment.ts#L147-L158). Actual locale output remains runtime-dependent and unverified here.

**Would prioritize high severity:** rendering failure blocks affected users' date/time input, including keyboard and assistive-technology access; it is not merely a formatting defect. Scope is locale/runtime-specific, a reported workaround exists, and no data loss is reported, so critical severity is not supported. Would not apply `accessibility` solely because a general render crash also blocks assistive technology.

**Reproduction / existing APIs.** The inline JSX and Intl snippets are useful but not a complete runnable sandbox, so would request StackBlitz or CodeSandbox plus browser/runtime details. The author reports "wrapping `DateInput` in an `I18nProvider` that falls back from `fr-CM` to `fr`." The documented locale override is supported by [`packages/dev/s2-docs/pages/react-aria/DateField.mdx:80-92`](https://github.com/adobe/react-spectrum/blob/main/packages/dev/s2-docs/pages/react-aria/DateField.mdx#L80-L92). Would present this only as a temporary, app-approved locale change, not a transparent fix preserving Cameroonian French conventions.

**Duplicates / existing fixes.** Searches across open and closed issues/PRs used `fr-CM`, `dayPeriod`, `dayPeriod crash`, and `useDateSegment crash`; no matching duplicate or existing fix surfaced. Related reports are not duplicates: [#5832](https://github.com/adobe/react-spectrum/issues/5832) says Korean input "removes focus from the dayPeriod once the user enters 2 characters"; [#6793](https://github.com/adobe/react-spectrum/issues/6793) describes clearing the hour making the segment "flip from 'PM' to 'AM'." Closed [PR #8826](https://github.com/adobe/react-spectrum/pull/8826) addresses a "`NARROW NO-BREAK SPACE`" hydration mismatch, not an absent part or render crash. Would not close in favor of any of these.

**Investigation / regression.** Would escalate the absent-part handling and require coverage for date-only fields, time-bearing fields, AM/PM keyboard entry, and composition input. The latter two consumers are visible at [`useDateSegment.ts:197-206`](https://github.com/adobe/react-spectrum/blob/main/packages/react-aria/src/datepicker/useDateSegment.ts#L197-L206) and [`useDateSegment.ts:321-325`](https://github.com/adobe/react-spectrum/blob/main/packages/react-aria/src/datepicker/useDateSegment.ts#L321-L325). Would not endorse the proposed empty-string fallback without checking these consumers. No earlier working version is identified, so would not apply `regression`.

### Would have done

- **Labels:** Would add `bug` for the reported render exception; `DateField`, `DatePicker`, and `TimeField` for the explicitly reported affected components; `RAC` for the supplied component example; `internationalization` for the locale trigger; `has workaround` for the author's reported scoped locale override, with the limitations above; and `needs investigation` for runtime verification and a library fix. Would remove none. All proposed labels exist. Would not apply `waiting`: the team can investigate the supplied snippets while requesting a complete reproduction.
- **Comment:** Would post:

  > Thanks for the component and Intl examples. The unchecked AM/PM lookups are consistent with the reported crash when the formatter returns no `dayPeriod`.
  >
  > Could you share a minimal StackBlitz or CodeSandbox using the affected versions, and the exact browser/version and Node/ICU versions where you observe the missing part? If a previous release worked, please include the last working and first failing versions.
  >
  > As a temporary workaround, if changing the displayed locale is acceptable for your application, the documented [I18nProvider locale override](https://react-spectrum.adobe.com/react-aria/DateField.html#international-calendars) can be scoped to the affected field, as you reported:
  >
  > ```tsx
  > import {I18nProvider} from 'react-aria';
  > import {DateField, DateInput, DateSegment, Label} from 'react-aria-components';
  >
  > <I18nProvider locale="fr">
  >   <DateField>
  >     <Label>Birthdate</Label>
  >     <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
  >   </DateField>
  > </I18nProvider>
  > ```
  >
  > This changes locale conventions rather than fixing `fr-CM`; it should not be applied globally without your application's approval. A library fix still needs to handle missing parts without breaking AM/PM keyboard or composition input.
- **Close / link:** Would not close; duplicate target none. Would retain this issue as the distinct missing-part crash report.
- **Other:** Would request the runnable sandbox and precise runtime details; would escalate to the date/time maintainers for investigation. No API-review or Spectrum-design escalation indicated.
- **Confidence:** Medium. Source corroborates the unsafe lookup, but the exact ICU/browser behavior and workaround were not independently reproduced. A runnable reproduction, known-good release, or same-root-cause fix would change the recommendation.
- **Feedback prompt:** Review high severity and whether the locale-changing, author-reported mitigation merits `has workaround`.

## #10837 - S2 ProgressCircle emits SVG radius diagnostics

**Evidence and impact.** The [report](https://github.com/adobe/react-spectrum/issues/10837) states one indeterminate `size="L"` circle emits three WebKit errors or Firefox warnings under `@react-spectrum/s2@1.8.2`, including `Invalid value for <circle> attribute r="calc(50% - 0.125rem)"`. Crucially, it says: "The spinner **still renders**" and "no uncaught page errors were observed." Indexed source constructs the expression at [`packages/@react-spectrum/s2/src/ProgressCircle.tsx:174-182`](https://github.com/adobe/react-spectrum/blob/main/packages/@react-spectrum/s2/src/ProgressCircle.tsx#L174-L182) and passes it to three circle attributes at [`ProgressCircle.tsx:201-209`](https://github.com/adobe/react-spectrum/blob/main/packages/@react-spectrum/s2/src/ProgressCircle.tsx#L201-L209).

**Would prioritize low severity:** reported impact is repeated console noise, not a missing indicator, crash, data loss, or demonstrated accessibility failure. Would raise severity if shipping-browser testing shows missing progress or broken accessibility.

**Reproduction / existing APIs.** A [complete runnable gist](https://gist.github.com/carterworks/b482296aecc85083c936fcf6f55938a9) is supplied with an inline entry point and `npm ci && npm start` instructions. Its contents could not be verified: `gh api` GET returned HTTP 403, `Rate Limit Exceeded`. Would not request another sandbox simply because this review could not fetch the supplied one. No supported consumer API fix was established; would not suggest DOM mutation, internal-style overrides, console suppression, or switching away from an accessible progress indicator.

**Duplicates / existing fixes.** Open/closed searches used `ProgressCircle`, `ProgressCircle radius`, and `SVG calc`, plus PR searches for `ProgressCircle` and `ProgressCircle radius`. No matching duplicate or corrective PR surfaced. Merged [PR #7036](https://github.com/adobe/react-spectrum/pull/7036) says it "updates the S2 ProgressCircle component to be implemented with SVG instead of divs"; this is relevant implementation history, not a fix for the parser diagnostics and not proof of a regression range.

**Investigation / regression.** Would ask the team to verify the CSS geometry-property approach proposed by the reporter across sizes, determinate/indeterminate states, animation, and forced colors before recommending a change. The reporter explicitly cautions: "**Playwright WebKit is not shipping Safari.**" Would not claim a shipping Safari defect, label this `browser bug` without isolating a browser standards violation, or apply `regression` without a known-good version.

### Would have done

- **Labels:** Would add `bug` for reported invalid-attribute diagnostics; `ProgressCircle` for the affected component; `S2` for the implementation layer; and `needs investigation` for cross-browser verification and a library-level fix. Would remove none. All proposed labels exist.
- **Comment:** Would post:

  > Thanks for the detailed reproduction and for distinguishing parser diagnostics from rendering failure. The radius expression is assigned to all three SVG circle attributes, consistent with the three diagnostics you report.
  >
  > The supplied gist and browser matrix are enough to begin investigation; there is no need to prepare another reproduction. If available, please add results from shipping Safari and a manually installed Firefox, keeping those separate from the Playwright engine results. Please also include a last known-good S2 version if you have one.
  >
  > Moving the expression to the CSS `r` geometry property is a candidate for investigation, not a verified fix yet. It needs cross-browser checks for supported sizes, determinate and indeterminate behavior, and forced colors. We would not recommend mutating the component's internal SVG or suppressing console diagnostics as a workaround.
- **Close / link:** Would not close; duplicate target none. Would link PR #7036 only as relevant implementation history, not as a resolving fix.
- **Other:** Would escalate to the S2 maintainers for reproduction and SVG/CSS compatibility investigation; would request optional shipping-browser results and a known-good version. Would not apply `waiting` because a runnable reproduction has already been supplied.
- **Confidence:** Medium. Source corroborates the attribute assignments, but the linked project and browser results were not independently verified. Actual rendering/accessibility failure, a known-good release, or a matching corrective PR would change prioritization.
- **Feedback prompt:** Review low severity for diagnostic-only impact and leaving `browser bug` unset pending isolation.

## Rule feedback

- Used the explicit last-24-hours option; no previous-digest timestamp was supplied. This can overlap an earlier digest.
- Component-only labels are eligible, but none of this run's qualifying issues had labels. Non-component labels excluded the other two issues.
- Severity is prose only: `low`, `medium`, `high`, `critical`, and `regression` were not present in the fetched repository label list. No new labels are proposed.
- `has workaround` for #10833 is conditional on an author-reported mitigation that changes locale conventions; it does not mean the original locale works correctly.
- Did not use `waiting` merely because additional evidence was requested: both issues have enough information for parallel maintainer investigation.
- No sandbox/browser execution was performed. The ProgressCircle gist GET was rate-limited; its completeness is reported, not verified. Shipping-browser coverage and claims that code remains on live `main` were not independently established.
- An initial `gh search` with a repository qualifier was rejected; equivalent searches succeeded with `--repo adobe/react-spectrum`. Search results are evidence of no match found, not proof that no duplicate or fix exists.
- The DateField documentation path was resolved through Scout after an initial path-scope miss. Indexed docs verify the locale-override API; the rendered documentation URL was not fetched.
- Secret-gist publication was attempted once with `gh gist create --desc "Issue triage digest 2026-10-22"` and no `--public` flag. GitHub returned HTTP 403, `Rate Limit Exceeded`; no gist URL was returned. Per the instructions, publication was not retried and no alternative GitHub write was attempted. This local file is the output.
