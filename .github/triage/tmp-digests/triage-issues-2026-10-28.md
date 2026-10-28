| Issue | Severity | Reproduction? | Solvable without changes? | Would label | Would comment | Would close / duplicate of | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [#10873](https://github.com/adobe/react-spectrum/issues/10873) S2 `page.css` export points to a missing `.d.ts` | Medium (regression from #10454) | Yes, deterministic; cause confirmed by reading source on `origin/main` | Workaround only (local module declaration or turning off `noUncheckedSideEffectImports`); fix PR [#10874](https://github.com/adobe/react-spectrum/pull/10874) already open | `bug`, `S2`, `typescript`, `Build Infra`, `has workaround` | Yes, short ack, link the open PR | No / no duplicate found | High |
| [#10881](https://github.com/adobe/react-spectrum/issues/10881) RangeCalendar: opening month/year picker commits the in-progress range | Medium | Yes, steps + docs example (not run); cause consistent with source | No (only prev/next buttons) | `bug`, `RangeCalendar`, `RAC` | Yes, ack + pointer to cause | No / no duplicate found | Medium |
| [#10877](https://github.com/adobe/react-spectrum/issues/10877) Sheet: writing scroll position while exiting leaves it open, `data-exiting`, forever | Medium | Yes, snippet + console steps (not run) | Reporter-specific workaround only (TanStack `data-scroll-restoration-id`) | `bug`, `RAC`, `needs investigation`, new `Sheet` label | Yes, ack, note related closed #10813 | No / related to closed #10813 (not a duplicate) | Medium |
| [#10875](https://github.com/adobe/react-spectrum/issues/10875) NumberField switches to Arabic numbering after `.`-only input in percent fields | Low to medium | Yes, parser snippet + docs steps (not run); code path confirmed | No; fix PR [#10876](https://github.com/adobe/react-spectrum/pull/10876) already open | `bug`, `NumberField`, `internationalization` | Yes, short ack, link PR | No / #3862 is related, closed, not a duplicate | High |
| [#10878](https://github.com/adobe/react-spectrum/issues/10878) Sheet: native `autoFocus` scrolls the page behind the sheet | Low to medium | Yes, snippet (not run) | Yes for RAC users (`TextField autoFocus`); native `<textarea autoFocus>` needs a fix | `bug`, `RAC`, `has workaround`, new `Sheet` label | Yes, ack + the supported alternative | No / no duplicate found | Medium |
| [#10880](https://github.com/adobe/react-spectrum/issues/10880) optimize-locales-plugin: `turbopack()` rules fail `NextConfig` type-check (readonly `locales`) | Low | Yes, error text + declarations; declaration confirmed on `origin/main` | Workaround: cast the rules | `bug`, `typescript`, `has workaround` | Yes, ack, confirm cause | No / related to open #9213 (Next 16 Turbopack support), not a duplicate | High |

# Issue triage digest - 2026-10-28

**Git synchronization:** Verified `/Users/danilu/dev/react-spectrum-triage` is on `triage_support`. `git fetch origin` succeeded. `git status --porcelain --untracked-files=no -- . ':!.github/triage'` showed no tracked changes, so `git merge origin/main --no-edit` ran and reported "Already up to date". `origin/main` is `0752308bb18ca03e55c06892bf8dbf81760c7f78`. No merge conflicts. Only this digest is committed; nothing is pushed.

**Window:** Since the previous issue digest (2026-10-27, cutoff about 2026-10-27 16:39 UTC) through this run (2026-10-28 about 16:40 UTC). `gh issue list --state all --search "created:>=2026-10-27"` returned nine issues. Three were already covered by the 2026-10-27 digest (#10858, #10866, #10862). Six are new, all unlabeled: #10873, #10875, #10877, #10878, #10880, #10881. None has maintainer comments.

**Carried over from the 2026-10-27 digest (not re-triaged, new activity only):**
- #10862 (ColorField `validationBehavior`): now **closed** (updated 2026-10-27 23:47 UTC), presumably by #10863. No action needed.
- #10858 (virtualized Picker layout): two new comments, from the author `denodell` (2026-10-28 02:42 UTC) and `nwidynski` (02:52 UTC). Not re-read in depth. Still unlabeled.
- #10854, #10855: reporter follow-ups only (2026-10-27 06:15 and 06:53 UTC), no new maintainer comment since `devongovett`'s. #10856 and #10866: no new comments. All four still unlabeled and open.

**Evidence limits:** GitHub reads used only `gh issue list|view`, `gh pr list|view`, `gh search issues`, `gh label list`. No writes, no gists, no pushes. Nothing from any issue was executed, installed, checked out or opened, and no issue links were fetched (the video in #10881, the docs links, and the repro snippets were not run). Behavior claims were judged by reading the issue text against source on `origin/main`. Browser behavior (Chrome scroll-snap, focus-induced scrolling, popover focus handling) could not be verified.

**Label check:** all labels proposed below exist in the repo except **`Sheet`**, which does not exist (there are no component labels for Sheet in `gh label list`, and the earlier Sheet issues #10854/#10855/#10813 are unlabeled). Proposed as a new label; otherwise skip it. `regression` does not exist either (as noted in earlier digests), so it is not proposed for #10873.

**Observations (not actions):**
- #10873's fix PR #10874 and #10875's fix PR #10876 were each opened within minutes of the issue by the same people who filed it. #10874's body retains the AI-assistant template comment and says "The packed-package regression test was removed at the maintainer's request"; #10875's body says "Prepared with GitHub Copilot assistance". PR triage should check these against the AI-assisted contributions section of `CONTRIBUTING.md`; PRs are out of scope here (see `.github/triage/pull-requests.md`).
- #10877 and #10878 were filed one minute apart by the same author (`oztune`) and both concern Sheet. #10877 references #10813 and #10870, both closed without merging (see below). Maintainers may want to decide on a general policy for Sheet scroll/exit edge cases rather than per-issue fixes.

---

## #10873 S2 `page.css` export points to a missing declaration

Link: https://github.com/adobe/react-spectrum/issues/10873 (author `rojoangel`, no labels, no comments, `@react-spectrum/s2` 1.8.2, TypeScript 7.0.2)

**Summary:** `@react-spectrum/s2/page.css` declares `types: ./dist/types/src/page.d.ts`, but that file is not in the published package, so `import '@react-spectrum/s2/page.css'` fails with TS2882 when `noUncheckedSideEffectImports` is on. Reporter says 1.7.0 to 1.8.2 are affected and points at #10454.

**Verification against `origin/main` (read-only):**
- `packages/@react-spectrum/s2/package.json:36-39`: `"./page.css": {"types": "./dist/types/src/page.d.ts", "default": "./page.css"}`. The export is still there.
- `git show 3f46f5d5c1 --stat` (#10454, "Add opt-in Parcel v3 build") deletes `packages/@react-spectrum/s2/src/page.ts` (15 lines) and `src/page.macro.ts`, and adds `scripts/buildPageCss.mjs` and a checked-in `page.css`. `packages/@react-spectrum/s2/src/page.ts` does not exist on `origin/main`, so nothing emits `dist/types/src/page.d.ts`. This matches the reporter's analysis.
- `2e27d7c83a` (#10016, "Fix types for page.css") is what added the `types` entry originally, so this is a regression of that fix.
- Not verified: which published versions lack the file (the reporter's 1.7.0 to 1.8.2 range), and the packed archive contents. The source analysis is consistent with the claim.

**Duplicates:** searched issues for "page.css" and "page.d.ts" (open and closed). Related only: #8355 (missing `page.css.map`, closed) and #9407 (fonts, closed); neither is this. Open PR [#10874](https://github.com/adobe/react-spectrum/pull/10874) "fix(s2): restore page.css declaration" ("Closes #10873") restores `src/page.ts`.

**Reproduction:** Deterministic from packaging, no StackBlitz needed. Judged by reading.

**Solvable without changes?** Consumer-side workarounds exist and are accessible-neutral: add `declare module '@react-spectrum/s2/page.css';` in an app `.d.ts`, or relax `noUncheckedSideEffectImports`. A real fix is still needed.

**Severity:** Medium. Breaks type-checking for any strict TypeScript consumer following the documented `page.css` import. No runtime impact, workaround exists.

**Regression:** yes, caused by #10454 per git history. Version range per reporter only. No `regression` label exists.

**Would have done**
- **Labels:** add `bug` (declared export is missing), `S2` (layer), `typescript` (type-check failure), `Build Infra` (packaging), `has workaround` (local module declaration). Not adding `RAC`, `page.css` is S2-only.
- **Comment:**
  > Thanks for the report. We confirmed that #10454 removed the `src/page.ts` that produced `dist/types/src/page.d.ts`, while the `./page.css` export still points at it. There's a fix open in #10874. In the meantime you can add `declare module '@react-spectrum/s2/page.css';` to a local `.d.ts` file to satisfy `noUncheckedSideEffectImports`.
- **Close / link:** none. Keep open until #10874 merges. Link PR #10874.
- **Other:** none. A packed-package check in CI would prevent this class of regression, but that is a team decision, not a triage action.
- **Confidence:** high. Would change if the published tarballs actually contain the file (not verified).
- **Feedback prompt:** is `Build Infra` the right label here, and should the comment link a community PR whose body suggests AI assistance?

---

## #10881 RangeCalendar: opening the CalendarMonthPicker / CalendarYearPicker popover commits the in-progress range

Link: https://github.com/adobe/react-spectrum/issues/10881 (author `ogogorev`, no labels, no comments, `react-aria-components` 1.22.0, `react-aria` 3.53.0, Chrome, macOS)

**Summary:** In a `RangeCalendar`, after clicking the start date, opening the month or year picker commits the range as start = end. The anchor is lost and the next click starts a new range. Inside `DateRangePicker` it also closes the popover. Users cannot select ranges across months/years with the pickers.

**Verification against `origin/main` (read-only):**
- `packages/react-aria/src/calendar/useRangeCalendar.ts:94-103`: `res.calendarProps.onBlur` runs `commitBehaviorMapping[commitBehavior]()` when `!e.relatedTarget || !nodeContains(ref.current, e.relatedTarget)` and `state.anchorDate` is set. Default `commitBehavior` is `select`, which calls `state.commitSelection()` (line 62).
- `useRangeCalendar.ts:63-87`: the window `pointerup` handler also commits when the pointer target is not inside the calendar or not a button.
- If the month/year picker renders its listbox in a portal popover outside the calendar element, focus moving into it is a blur with a `relatedTarget` outside `ref.current`, which hits the branch above. This fits the report ("When focus moves into the picker's popover, the selection ends right away"). I did not check how `CalendarMonthPicker`'s popover is portaled (`Calendar.tsx:783-794` only wraps `useCalendarMonthPicker`), and could not observe the behavior.
- The `reset` and `clear` commit behaviors both also drop the anchor, so there is no `commitBehavior` workaround.

**Duplicates:** searched issues for "CalendarMonthPicker", "RangeCalendar month picker", "RangeCalendar commit selection popover" (open and closed). Related only: #10838 (CalendarYearPicker month change, open) and closed #10531 / #10140 (year list cutoffs). None covers the commit-on-blur behavior. No open PR found.

**Reproduction:** Clear steps against the public docs example; video attached. Not run. No StackBlitz needed.

**Solvable without changes?** No. No supported prop prevents the commit, and a user-land `onBlur` stopping propagation would depend on internals. Prev/next buttons are the only path, as the reporter says.

**Severity:** Medium. Pickers are an advertised feature of `RangeCalendar` and `DateRangePicker`, and range selection across months/years with them is impossible. Not a crash or data loss; the prev/next buttons work. Keyboard and pointer users are both affected, so I would not add `accessibility`.

**Regression:** the pickers appear to be new; no earlier working version is stated. Not proposed.

**Would have done**
- **Labels:** add `bug`, `RangeCalendar` (component), `RAC` (reported against `react-aria-components`; the cause is in `@react-aria/calendar`, so S2 `RangeCalendar` and `DateRangePicker` are likely affected, not verified).
- **Comment:**
  > Thanks for the report. `useRangeCalendar` commits the selection when focus leaves the calendar element, and moving focus into the month/year picker popover looks like it counts as leaving, so the anchor date is committed and cleared. We'll look at keeping the anchor while focus is in one of the calendar's own pickers.
- **Close / link:** none.
- **Other:** none. Not adding `needs investigation`; the likely cause is identified, but the portal behavior is unconfirmed, so the maintainer may prefer it.
- **Confidence:** medium. Would change if the popover is actually rendered inside the calendar element, in which case the cause is elsewhere (for example the `pointerup` handler).
- **Feedback prompt:** is it OK to describe the likely cause in the comment before the popover portal behavior has been confirmed?

---

## #10877 Sheet: setting its scroll position while it slides out leaves it open, `data-exiting`, for good

Link: https://github.com/adobe/react-spectrum/issues/10877 (author `oztune`, no labels, no comments, `react-aria-components` 1.22.1, Chrome, macOS)

**Summary:** If anything writes the sheet scroller's `scrollTop` while a closing `Sheet` slides out (even to its current value), the smooth exit scroll is cancelled, scroll snapping rests at the open position, and the exit never resolves. The sheet stays open with `data-exiting`, blocks the page, and Escape no longer works. A table in the issue gives timings: a write on the next frame or 50 ms and 150 ms after Close gets stuck; at 300 ms it closes. Real trigger: TanStack Router's scroll restoration.

**Verification against `origin/main` (read-only):**
- `packages/react-aria-components/src/Sheet.tsx:414-455`: `onExit` calls `scrollAlongAxis(scroller, axis, target, true)` (smooth) and then returns a promise that resolves only on the `react-aria-sheet-close` event (line 452).
- `Sheet.tsx:286-300`: that event is dispatched from an `IntersectionObserver` callback (line 300). No `scrollend` fallback in `onExit`, which matches the report. (`scrollend` is used in `onEnter` at 395, and in the Safari-only branch at 422.)
- So if the smooth scroll is cancelled and the content stays on screen, nothing resolves the promise. The source supports the mechanism; the exact timings and snap behavior were not verified.

**Duplicates:** searched issues for "Sheet scroll exit", "Sheet data-exiting" (none found), and PRs for "Sheet scrollend". Related: [#10813](https://github.com/adobe/react-spectrum/issues/10813) "Sheet stays exiting over the page when its IntersectionObserver's last report never comes" (closed, `NOT_PLANNED`), with PRs #10870, #10829, #10835 all closed unmerged. The reporter notes that the #10870 approach would not cover this case. Same symptom, different trigger; not a duplicate.

**Reproduction:** Full snippet plus a console script. Not run. No StackBlitz needed.

**Solvable without changes?** Not generally. The reporter's workaround (changing `data-scroll-restoration-id` so TanStack skips the scroller) only works for that router. Anything else that sets the scroller's position still triggers it.

**Severity:** Medium. A stuck modal-like overlay that blocks the page and ignores Escape is serious for the affected user, but it needs external code to write the scroller's position during the exit, which narrows it. Recovery requires a reload.

**Regression:** unknown; not claimed.

**Would have done**
- **Labels:** add `bug`, `RAC`, `needs investigation` (design choice needed for a robust exit), and the new `Sheet` label (does not exist yet; skip if not created).
- **Comment:**
  > Thanks for the detailed report and the timing table. This matches what we see in `Sheet`'s `onExit`: it only resolves when the IntersectionObserver reports the content off screen, so a cancelled smooth scroll that rests at the open snap point never finishes. We'll take a look. For context, #10813 covered a related stuck-exit case.
- **Close / link:** none. Link related #10813 in the comment only.
- **Other:** escalate to the team: the earlier #10813 fix attempts (#10829, #10835, #10870) were closed without merging, so a maintainer should decide the intended approach before anyone builds another one.
- **Confidence:** medium. Would change if maintainers consider external scroller writes unsupported, in which case this would be closed as expected.
- **Feedback prompt:** since #10813 was closed as not planned, should this be treated as wontfix or kept open as `needs investigation`?

---

## #10875 NumberField switches to Arabic numbering after entering only a period in percentage fields

Link: https://github.com/adobe/react-spectrum/issues/10875 (author `adobe-ddavidso`, no labels, no comments, `@react-spectrum/s2` 1.8.2, `@internationalized/number` 3.6.9, Chrome, macOS)

**Summary:** Replacing a percent `NumberField`'s value with a single `.` and blurring displays Arabic digits and percent sign (`1%` becomes `١٪؜`) while the numeric value stays 1. Reported on the v3 docs example (`style: 'percent'`) and an S2 integer-percent field (`style: 'unit'`, `unit: 'percent'`). `,` alone restores normally.

**Verification against `origin/main` (read-only):**
- `packages/@internationalized/number/src/NumberParser.ts:70-72`: `getNumberingSystem(value)` returns `getNumberParserImpl(...).options.numberingSystem`.
- `NumberParser.ts:76-97`: if the default parser's `isValidPartialNumber(value)` is false and the locale has no hard-coded `-nu-`, it loops over `NUMBERING_SYSTEMS` and returns the first parser that accepts the value as partial input. So whatever numbering system first accepts `.` as a partial number wins, which matches the reporter's explanation. I did not trace the Arabic grouping-separator normalization or run the parser.
- #3862 ("NumberField - Comma as the first character displays unreadable values", closed by #8592) is the earlier comma-only version of the same loop. This is the same class of bug for the period.

**Duplicates:** searched issues for "NumberField Arabic", "NumberField numbering system", "getNumberingSystem" (open and closed). Only #3862 is related (closed, fixed). Open PR [#10876](https://github.com/adobe/react-spectrum/pull/10876) "fix: preserve numbering system for separator-only input" ("Closes #10875") changes `NumberParser.ts` and adds parser and RAC NumberField tests.

**Reproduction:** Parser snippet and docs steps are sufficient. Not run.

**Solvable without changes?** No (cannot control the numbering system from user code short of forcing `-u-nu-latn` in the locale, which hides the real bug and changes behavior for Arabic users; not recommended). Fix is open.

**Severity:** Low to medium. Affects locale-aware numeric input after an unusual partial edit (typing only `.`). The numeric value is unchanged, but the displayed value becomes unreadable to most users and the field is affected in both v3 and S2.

**Regression:** unknown. #3862 shows the underlying behavior is long-standing.

**Would have done**
- **Labels:** add `bug`, `NumberField` (component), `internationalization` (numbering system selection). Not adding layer labels: the cause is in `@internationalized/number`, shared by v3, RAC, and S2.
- **Comment:**
  > Thanks for the report. `NumberParser.getNumberingSystem` falls back to the first numbering system that accepts the input as a partial number, and `.` is accepted as a grouping separator by the Arabic parser, so the field formats in Arabic on blur (the comma-only variant of this was #3862). There's a fix open in #10876.
- **Close / link:** none. Keep open until #10876 merges. Link PR #10876.
- **Other:** none.
- **Confidence:** high. Would change if the fix PR's approach is not what maintainers want.
- **Feedback prompt:** should `internationalization` be applied here, and should the comment link a PR whose body discloses Copilot assistance?

---

## #10878 Sheet: a native `autoFocus` inside a Sheet scrolls the page behind it when the sheet opens

Link: https://github.com/adobe/react-spectrum/issues/10878 (author `oztune`, no labels, no comments, `react-aria-components` 1.22.1, Chrome, macOS)

**Summary:** A native `autoFocus` field in a `Sheet` (`<textarea autoFocus>` or standalone RAC `<TextArea autoFocus>`) makes the page behind scroll (0 to 1248 px at 390x844) when the sheet opens and it stays scrolled after close. `<TextField autoFocus><Input /></TextField>` does not.

**Verification against `origin/main` (read-only):**
- `packages/react-aria-components/src/Sheet.tsx:355-361`: the overlay is created with `UNSTABLE_deferUntilEntered` and `UNSTABLE_overrideFocus`, as the reporter describes (the comment at 357-359 says focus is deferred until the sheet has entered).
- The reporter's explanation (React runs a native `autoFocus` during commit, before `usePreventScroll`'s layout effect, whereas `useFocusable` autofocuses in an effect) is plausible. I did not read `useFocusable` or `ModalOverlay` to confirm the ordering, and could not run it in a browser.

**Duplicates:** searched issues for "Sheet autoFocus" and PRs for "Sheet autoFocus" (no matches; #10102 only matches on "overlay placement"). No duplicate found. Related to #10877 by author only.

**Reproduction:** Full snippet with exact numbers and a comparison table. Not run. No StackBlitz needed.

**Solvable without changes?** Partly. For React Aria users, `TextField` with `autoFocus` (and `TextArea` as its child) uses the supported focus path and does not scroll, per the reporter's own comparison. Native `autoFocus` on a bare element, or standalone `TextArea autoFocus`, is not covered. Suggested answer would point to `TextField` and note that docs for `autoFocus` inside overlays could mention this; docs not verified. The reporter's render-after-layout-effect workaround is a timing hack and should not be recommended.

**Severity:** Low to medium. Page position jumps and is lost after close, mostly at phone-width viewports; no crash, the alternative above works.

**Regression:** unknown; not claimed.

**Would have done**
- **Labels:** add `bug`, `RAC`, `has workaround` (use `TextField autoFocus`), and the new `Sheet` label (does not exist yet; skip if not created).
- **Comment:**
  > Thanks for the report and the comparison table. A native `autoFocus` runs while React commits, before the overlay sets up scroll-free focus, whereas `TextField`'s `autoFocus` runs from an effect afterwards. Wrapping the field in `<TextField autoFocus><TextArea /></TextField>` should avoid the page scroll for now. We'll look at making the first focus inside a `Sheet` scroll-free regardless of how it's triggered.
- **Close / link:** none.
- **Other:** `needs investigation` is not proposed because the cause is already identified, but the maintainer may want to decide whether standalone `TextArea autoFocus` is in scope.
- **Confidence:** medium. Would change if `TextField autoFocus` also scrolls in the maintainer's repro, or if the effect-order claim is wrong.
- **Feedback prompt:** is `has workaround` right given the workaround requires switching to `TextField`?

---

## #10880 optimize-locales-plugin: turbopack() rules are refused by Next 16.4's NextConfig type (readonly locales)

Link: https://github.com/adobe/react-spectrum/issues/10880 (author `felzab`, no labels, no comments, `@react-aria/optimize-locales-plugin` 2.1.0, `next` 16.4.2, TypeScript 6.0)

**Summary:** Spreading `optimizeLocales.turbopack({locales}).rules` into `turbopack.rules` in a typed `next.config.ts` fails with TS2322: `options.locales` is `readonly string[]`, but Next's `TurbopackLoaderOptions` requires mutable `JSONValue[]`. Runtime works. Suggested fix: type `options.locales` as `string[]`.

**Verification against `origin/main` (read-only):**
- `packages/dev/optimize-locales-plugin/LocalesPlugin.d.ts:26-29`: `type TurbopackRule = {condition?: ...; loaders: [{loader: string; options: {locales: readonly string[]}}]; as: '*.js'}`. Matches the report. Version is `2.1.0` (`package.json`).
- `LocalesPlugin.d.ts:4`: the plugin's input `Options` is also `locales: readonly string[]`, so a fix would need the output rule type to be mutable (and `LocalesPlugin.js` to pass a copy to the loader options) rather than just retyping the existing field. `LocalesPlugin.js:70-75` builds `loaders: [{... options: {locales}}]` straight from the input.
- Added by #10462 ("feat: add turbopack support to optimize-locales"). The Next.js types themselves were not checked (`next` 16.4.2 not available), so the Next side of the claim is taken from the issue.

**Duplicates:** searched issues for "optimize-locales-plugin turbopack" and "locales plugin next". #9213 "Support Next.js 16 Turbopack (optimize-locales-plugin)" is open but is about adding support, which #10462 implemented; this is a follow-up typing issue, not a duplicate. No open PR found.

**Reproduction:** Config, both declarations, and exact TS error are included. Not run. No StackBlitz needed.

**Solvable without changes?** Yes as a workaround: a type assertion on the spread rules (for example `as unknown as NonNullable<NextConfig['turbopack']>['rules']`), at the cost of losing type checking on that value. It is not a hack on internals, only a cast. Real fix needed in the declaration.

**Severity:** Low. Type-only, runtime is correct, and a cast unblocks users, but it hits every typed Next 16.4 config following the documented setup.

**Regression:** likely introduced when Next tightened its loader option types; not claimed by the reporter.

**Would have done**
- **Labels:** add `bug`, `typescript`, `has workaround` (cast). No component label applies, and not adding `RAC`.
- **Comment:**
  > Thanks for the clear report. We confirmed that `LocalesPlugin.d.ts` types `options.locales` as `readonly string[]` for the rule returned from `turbopack()`, which Next's `TurbopackLoaderOptions` (`JSONValue[]`) doesn't accept. Until this is fixed, casting the spread rules to Next's `turbopack.rules` type works around it. We'll update the declaration.
- **Close / link:** none. Mention related #9213 only if the maintainer wants cross-linking.
- **Other:** none.
- **Confidence:** high on the cause in this repo. Would change if the Next typing differs from what the issue quotes.
- **Feedback prompt:** is a cast acceptable to recommend as a workaround, or should the comment only acknowledge the bug?

---

## Rule feedback

- **Labels:** there is no `Sheet` component label, and no `regression` label (the rules mention `regression` but it does not exist). I proposed a new `Sheet` label but would like confirmation. Component labels were assigned by judgment for packages that are not components (`@internationalized/number`, optimize-locales-plugin, S2 packaging: `internationalization`, `typescript`, `Build Infra`).
- **Duplicates vs. already-closed work:** #10877 is adjacent to #10813 (closed, `NOT_PLANNED`, with three closed fix PRs). The rules say to recommend closing duplicates, but not what to do when a related issue was closed as not planned. I treated it as distinct and flagged it as a maintainer decision.
- **Linking community PRs:** several issues already have same-day fix PRs from the issue author whose bodies mention AI assistance. The issue rules do not say whether the proposed comment should link such PRs. I proposed linking them; please confirm.
- **Workarounds:** the rules disallow hacks and `setTimeout`-style workarounds but not type casts or local module declarations. I treated those as acceptable and marked `has workaround` (#10873, #10880); #10878's workaround requires changing to `TextField`, which may be a stretch for `has workaround`.
- **Not verifiable without running code:** browser behavior for #10877, #10878, #10881 (scroll snap, focus/scroll ordering, popover portal focus) and the Arabic numbering path in #10875 were judged from source and issue text only. The published tarball contents for #10873 were not checked.
- **Window cutoff:** the previous digest's cutoff was about 2026-10-27 16:39 UTC; the first new issue (#10873) was created at 16:40 UTC, so nothing was missed or double-counted.
