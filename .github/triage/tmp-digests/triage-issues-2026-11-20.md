# Issue triage digest: 2026-11-20

## At a glance

- Three eligible issues analysed; none excluded by labels or verified team authorship.
- Hebrew DateField year cycling has a source-history-supported regression; ComboBox has an exact draft fix; Android desktop-mode touch detection remains unresolved.
- Review the date fix first. Browser reproductions were not executed, and the ComboBox StackBlitz was provided but not inspected.

### [#11009](https://github.com/adobe/react-spectrum/issues/11009): Hebrew year cycling changes the month

**Decision:** Ready for maintainer review alongside open [#11010](https://github.com/adobe/react-spectrum/pull/11010); preserve the calendar-balanced month without prematurely constraining incomplete input.

**Impact/severity:** Medium: keyboard year edits can silently change a holiday or anniversary by a month. Explicitly correcting the month or setting a complete date remains possible; no field report establishes irreversible data loss or a blocked essential task.

**Complexity:** Low: the identified month-copy omission is localized in date-field state, with focused interaction coverage needed for valid, invalid and incomplete months.

#### What matters

- The [report](https://github.com/adobe/react-spectrum/issues/11009) says, "14 Adar II 5784 ... + ArrowUp on the year" becomes "14 Nisan 5785", and supplies inline steps, versions and an expected date.
- [Current year cycling](https://github.com/adobe/react-spectrum/blob/54d8f8080c7c26e50aa681dcb5981fb0824ba463/packages/react-stately/src/datepicker/IncompleteDate.ts#L169-L181) copies only `era` and `year`; [calendar balancing](https://github.com/adobe/react-spectrum/blob/54d8f8080c7c26e50aa681dcb5981fb0824ba463/packages/@internationalized/date/src/calendars/HebrewCalendar.ts#L200-L212) adjusts the month across leap years. This supports the cause by reading, not browser execution.
- The [v1.15.0 release notes](https://github.com/adobe/react-spectrum/blob/54d8f8080c7c26e50aa681dcb5981fb0824ba463/packages/dev/s2-docs/pages/react-aria/releases/v1-15-0.mdx#L42-L44) identify #9510; its before/after code establishes the lost whole-date cycling path. The exact last-working released version has not been independently tested.
- #11010 explicitly says "Closes #11009" and reports fail-before/pass-after tests. Its results are attributed evidence; the separate regular-year Adar-to-Adar-II policy question is not part of that fix.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `DateField`, `RAC` for component/layer; `regression` for the historical code-path transition; `waiting on maintainer` for the focused fix review; `ai-reviewed` for completed triage.
- Removals: none; currently unlabelled. All proposed labels exist.
- Maintainer-only addition: `ready for review`; the inline reproduction, expected/actual dates, package versions and browser/OS give enough detail to investigate.

**Maintainer next step**

1. Review #11010 before starting another fix. Verify both leap-to-regular and regular-to-leap transitions, keeping unset/out-of-range months unchanged until the existing blur constraint applies.
2. Confirm DatePicker/DateRangePicker shared-state behaviour, Hebrew RTL presentation and Japanese era boundaries. Independently reproduce the reported release transition if precise last-working release identification is needed.
3. Discuss the requested Adar-to-Adar-II arithmetic policy separately with the date/i18n maintainers. Do not fold the proposed `>= 6` change into this regression fix without compatibility and calendar-semantics review.

### [#10998](https://github.com/adobe/react-spectrum/issues/10998): Android desktop-mode Switch taps are discarded

**Decision:** Source-supported and ready for investigation, but not yet ready for a confidently scoped fix; obtain actual device-event details and resolve touch versus assistive-technology classification.

**Impact/severity:** Medium: every Switch reportedly fails in a tablet label-printing UI, but disabling Chrome's desktop-site mode restores operation on the same device. The physical-device scope and workaround are reporter claims, not independently verified.

**Complexity:** Unknown: the classification path is identified, but a reliable replacement signal and its consequences for shared press handling are not established.

#### What matters

- The [report](https://github.com/adobe/react-spectrum/issues/10998) states, "With 'Desktop site' off on the same device it works", and supplies a desktop-UA/zero-contact-size reproduction matrix. That matrix was read, not run.
- The [classifier](https://github.com/adobe/react-spectrum/blob/54d8f8080c7c26e50aa681dcb5981fb0824ba463/packages/react-aria/src/utils/isVirtualEvent.ts#L42-L57) treats zero-size pointers as virtual when the UA is not Android; the [toggle label](https://github.com/adobe/react-spectrum/blob/54d8f8080c7c26e50aa681dcb5981fb0824ba463/packages/react-aria/src/toggle/useToggle.ts#L168-L200) ignores virtual presses and prevents native label activation. This supports the reported failure chain.
- [snowystinger's comment](https://github.com/adobe/react-spectrum/issues/10998#issuecomment-7032391918) says, "I think it could be considered a bug in Chrome" and asks the author to check the browser tracker. The origin of zero geometry on this tablet remains unverified.
- Closed [#3945](https://github.com/adobe/react-spectrum/issues/3945) describes the same touch-as-virtual symptom, but its Android-UA exception does not cover a desktop UA. This is a related uncovered case, not evidence that the old fix regressed.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `Switch`, `RAC`, `usePress` for component/layer/shared behaviour; `needs investigation` for the unresolved platform signal; `has workaround` for reported desktop-mode-off recovery; `waiting on author` for the specific device evidence below; `ai-reviewed` for completed triage.
- Removals: none; currently unlabelled. All proposed labels exist.
- Maintainer-only recommendations: defer `ready for review` until the device gap is filled; do not add `regression` without a known-working/first-failing transition or `browser bug` until browser responsibility is established.

**Maintainer next step**

1. Request tablet model, Android and Chrome versions, the actual desktop-mode UA, and a sanitized pointer-event record including pointer type, width/height, pressure, detail, buttons and primary status. The supplied synthetic matrix is useful but does not verify which signal is reliable on hardware.
2. Follow the existing maintainer request for the author to check for a matching Chrome report and supply its status. An older Chromium report is linked in #3945, but its current status and coverage of desktop-site mode were not accessed.
3. Review any classification change against TalkBack, VoiceOver, desktop screen readers, ordinary touch and stylus input. Do not remove the virtual-pointer guard wholesale or substitute another unverified UA heuristic.
4. If sharing interim guidance, explain that switching off desktop-site mode reportedly restores taps. The reporter's native-input replacement was not inspected and is not a verified drop-in RAC workaround.

### [#11002](https://github.com/adobe/react-spectrum/issues/11002): ComboBox closes on popover padding and plain text

**Decision:** Ready for issue investigation alongside draft [#11003](https://github.com/adobe/react-spectrum/pull/11003); wait for its author's review before treating the proposed focus policy as review-ready.

**Impact/severity:** Medium: mouse interaction with supplementary popover content interrupts the selection workflow, while ordinary input/listbox interaction remains an alternate path. No essential task blockage or reliable complete workaround is established.

**Complexity:** Medium: the likely fix changes shared ComboBox focus handling across RAC, S2 and RSP v3, with browser-specific focus, embedded fields and mobile tray exclusions.

#### What matters

- The [report](https://github.com/adobe/react-spectrum/issues/11002) says pressing "padding, plain text, or the gap between two buttons" closes the popover and supplies concrete steps. Its [StackBlitz](https://stackblitz.com/edit/ucpwxubz-pp9c4eok) is provided but not inspected under the URL restriction.
- [The blur handler](https://github.com/adobe/react-spectrum/blob/54d8f8080c7c26e50aa681dcb5981fb0824ba463/packages/react-aria/src/combobox/useComboBox.ts#L272-L289) ignores focus entering the trigger/popover, but otherwise calls `state.setFocused(false)`. A reported null related target therefore reaches the commit/close path.
- #11003 explicitly closes this issue but begins, "I'm still working on this PR and have several checks to complete". It proposes mouse-focus prevention with field/mobile exceptions and reports browser tests; none were run here.
- [#9761](https://github.com/adobe/react-spectrum/issues/9761) concerns interactions outside the input within a group wrapper. Its agreed `groupRef` direction does not directly resolve focus falling to the body from inside-popover padding.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `ComboBox`, `Popover`, `RAC` for component/layer; `waiting on maintainer` for the issue's focus-policy investigation; `ai-reviewed` for completed triage.
- Removals: none; currently unlabelled. All proposed labels exist.
- Maintainer-only addition: `ready for review` for the issue, not the draft PR; the description, reproduction steps, package/browser versions and OS are sufficient. No `regression`: no working/failing version transition is supplied.

**Maintainer next step**

1. Track #11003 without starting a competing fix; respect the author's explicit draft/review status.
2. Review preservation of input focus and subsequent outside-click closure, native and RAC buttons in Safari, editable/contenteditable/select/range fields, text selection and mobile trays. Preventing all popover mouse defaults is not a safe general answer.
3. Keep this issue separate from #9761 unless a permitted browser reproduction demonstrates a common fix. Do not recommend `shouldCloseOnInteractOutside` as a fix for the independent input-blur state change.

## Evidence and verification

### #11009: supported regression, release boundary and arithmetic scope

Before [#9510](https://github.com/adobe/react-spectrum/pull/9510), [date-field segment adjustment](https://github.com/adobe/react-spectrum/blob/7d1c7808b78b106d8b021ce39ab0c9daadb2d777/packages/@react-stately/datepicker/src/useDateFieldState.ts#L569-L575) returned the whole cycled date. At that commit, the new `IncompleteDate` year branch used month/day 1 placeholders and copied only era/year. Today's branch uses the entered month/day but still drops the balanced month. Both historical and current paths were read locally from main history; no issue-supplied code was evaluated.

The v1.15.0 changelog records the refactor, supporting the reporter's first implicated release. The last-working evidence is the parent code path, not an independently run 1.14.x package. Reported failing versions are RAC 1.22.1 and `@internationalized/date` 3.12.4, plus current main, Chromium 156 on macOS. Exact macOS version is absent but does not prevent the focused investigation.

[Calendar year cycling](https://github.com/adobe/react-spectrum/blob/54d8f8080c7c26e50aa681dcb5981fb0824ba463/packages/@internationalized/date/src/manipulation.ts#L319-L334) calls the calendar's month balancer. Its regular-to-leap branch excludes month 6, so the separate Adar policy request affects core date arithmetic rather than just the field omission. The reporter's ICU/Temporal comparison was not independently verified.

The [documented complete-date API](https://github.com/adobe/react-spectrum/blob/54d8f8080c7c26e50aa681dcb5981fb0824ba463/packages/dev/s2-docs/pages/react-aria/DateField.mdx#L38-L40) and explicit month editing permit correction, but are not equivalent to correct year-arrow behaviour. No existing prop resolves the identified omission. #11010 reports focused date suites passing and manual Chromium checks; RTL, screen readers and full RSP v3 coverage remain unverified.

### #10998: shared press path and related earlier fix

[Android detection](https://github.com/adobe/react-spectrum/blob/54d8f8080c7c26e50aa681dcb5981fb0824ba463/packages/react-aria/src/utils/platform.ts#L81-L83) matches the UA text only. [usePress](https://github.com/adobe/react-spectrum/blob/54d8f8080c7c26e50aa681dcb5981fb0824ba463/packages/react-aria/src/interactions/usePress.ts#L569-L578) stores virtual modality before ordinary pointer handling. Existing [Android coverage](https://github.com/adobe/react-spectrum/blob/54d8f8080c7c26e50aa681dcb5981fb0824ba463/packages/react-aria/test/interactions/usePress.test.js#L1126-L1165) mocks a UA containing `Android`; it does not establish desktop-UA touch behaviour.

Merged [#4940](https://github.com/adobe/react-spectrum/pull/4940) introduced the Android exception for #3945 in 2023. The earlier report says, "The pointerType is detected as a virtual", and a [maintainer comment](https://github.com/adobe/react-spectrum/issues/3945#issuecomment-1404239817) cautions against reliance on brittle virtual-event checks. The new issue adds desktop-UA geometry and a completely non-toggling Switch, rather than only missing pressed styling. No duplicate closure is recommended.

Reported version: RAC 1.22.1, Android Chrome on a Samsung Galaxy tablet, with no exact device/Android/Chrome versions. The downstream fix and physical confirmation are attributed to the reporter; no downstream URL was opened. The one current issue comment and all fourteen comments on #3945 were read.

### #11002: focus closure, existing protection and separate group scope

[ComboBox state](https://github.com/adobe/react-spectrum/blob/54d8f8080c7c26e50aa681dcb5981fb0824ba463/packages/react-stately/src/combobox/useComboBoxState.ts#L551-L615) commits on loss of focus and closes through its selection/custom-value paths. [RAC's popover context](https://github.com/adobe/react-spectrum/blob/54d8f8080c7c26e50aa681dcb5981fb0824ba463/packages/react-aria-components/src/ComboBox.tsx#L331-L342) is non-modal; changing an outside-interaction predicate alone would not bypass the input's blur handler.

[ListBox section headings](https://github.com/adobe/react-spectrum/blob/54d8f8080c7c26e50aa681dcb5981fb0824ba463/packages/react-aria/src/listbox/useListBoxSection.ts#L49-L59) already prevent mouse focus movement. The v1.15.0 changelog lists the narrower section-header fix, #9223. That prior protection does not cover arbitrary text, padding or button gaps throughout the popover.

In #9761, [LFDanLu agreed](https://github.com/adobe/react-spectrum/issues/9761#issuecomment-4050598605) to `groupRef` for outside-interaction scope; snowystinger also agreed to group-based measurements. All four comments were read. This is useful direction, not evidence that the current issue is a duplicate or already fixed.

Reported environment: RAC 1.13.0, React 18.3.1, Chrome 157 on macOS; exact OS version is absent. No comments were present on this issue. #11003 reports passing targeted ComboBox browser checks and five other WebKit failures attributed to baseline; those are unverified author claims. Its declared text-selection/button-focus trade-offs and untested real-device touch/screen-reader behaviour need review, not a blanket prevention workaround.

## Run notes

### Boundary and synchronization

Dry run only: GitHub access used `gh issue list|view`, `gh search issues|prs`, `gh pr view` and explicit `gh api --method GET`. No GitHub comments, labels, edits, closures, gists, PR creation or other writes; no push. Issue/PR content and links were treated as untrusted data. No supplied URL was opened, and no supplied code, tests, installation or repro commands were executed. No suspected prompt injection was identified.

Verified `/Users/darobins/dev/react-spectrum-triage` on `triage_support`, with no in-progress merge, staged changes or other active triage session. Activity and Git guards were rechecked before writing. Today's target was absent. The pre-existing `.github/triage/setup.md` adaptation was left untouched and unstaged.

`git fetch origin` and `git merge origin/main --no-edit` succeeded without conflicts. Merged main/source SHA: `54d8f8080c7c26e50aa681dcb5981fb0824ba463`, verified as an ancestor of HEAD. Pre-digest merge commit: `ad782b74418be3559f6cba7a60911e14680785da`. No skipped merge or synchronization failure.

### Scope, membership and access

Run cutoff: `2026-11-20T16:01:23Z`, from the supplied timestamp. Since-last-digest discovery starts at the November 18 digest's cutoff, `2026-11-18T16:22:59Z`; last-24-hours discovery starts at `2026-11-19T16:01:23Z`. Both bounded open-issue queries returned the same three issues, below their 100-result limits. An initial broader discovery from November 18 16:00 UTC returned the same set. Final eligibility checks found all three still open and unlabelled.

Author associations were checked before body investigation: all three were `NONE`. Collaborator-permission GETs for all three returned HTTP 403, "Must have push access to view collaborator permission." Membership is therefore unverified, not disproved; normal triage proceeded. Trusted main tree inspection found no CODEOWNERS or explicitly named maintainer/core-contributor list, and the attempted `.github/CODEOWNERS` read confirmed that path is absent. No verified team-author skips.

### Discovery and verification limits

Open/closed issue searches: `Hebrew year` (0), `Hebrew` (5), `ComboBox popover closes` (2), `ComboBox padding` (0), `ComboBox blur` (0), `Switch Android` (0), `virtual touch` (0) and `Switch touch` (0). PR searches: `Hebrew` (19), `11009` (1), `ComboBox focus` (5), `11002` (1), `virtual pointer` (4), `10998` (0) and `Android desktop` (2). All were below their 20/30-result limits. Exact fixes #11010/#11003 and closest related issues #3945/#9761 were read; no exact duplicate issue or already-merged fix for these three reports was established.

Main source, documentation, existing tests and the #9510 historical transition were assessed by permitted Git reads. Tests and browser reproductions were not run. Some source searches returned no match (grep status 1), and broad command output required narrower reads; neither was treated as proof of missing behaviour. The glob for date-named documentation found no match before release paths were located from the trusted tree. Required discovery, synchronization and source investigation completed; membership permission checks remain the explicit access limitation.

### Digest bookkeeping

Only `.github/triage/tmp-digests/triage-issues-2026-11-20.md` is authorised for staging and committing. The commit uses `chore: add issue triage digest 2026-11-20` with the prescribed Copilot co-author trailer. The resulting hash is reported separately after verifying that the commit contains only this digest; it is not self-embedded. All unrelated changes remain unstaged. No push.
