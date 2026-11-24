# Issue triage digest: 2026-11-24

## At a glance

- Three eligible issues assessed; no verified team-authored issues skipped.
- Safari IME cancellation can reportedly dismiss a form; an open fix PR targets the source-supported gap.
- TagGroup overflow needs layout confirmation. Firefox simulated-touch failure lacks an exact browser version and event evidence; no reproduction was executed.

### [#11025](https://github.com/adobe/react-spectrum/issues/11025): Safari IME Escape dismisses overlays

**Decision:** Ready for initial maintainer review; coordinate with the matching open fix rather than closing this as an already-fixed duplicate.

**Impact/severity:** High provisionally: Japanese/Chinese IME users reportedly lose form input when cancelling conversion candidates, with no established supported, composition-specific workaround. Native Safari behaviour and application state loss were not independently confirmed.

**Complexity:** Low provisionally: the identified shortcut guard is localized, but shared keyboard behaviour and normal Escape dismissal need compatibility review.

#### What matters

- The [report](https://github.com/adobe/react-spectrum/issues/11025) says Escape cancels a conversion candidate but "closes the surrounding Modal, Dialog or Popover, and the user loses what they typed." It provides a small component example, synthetic-event steps and a native Japanese-IME sequence.
- [The trusted shortcut guard](https://github.com/adobe/react-spectrum/blob/7743784aa065cd42bf0d144ddc5dd5e03e0e651f/packages/react-aria/src/interactions/useKeyboard.ts#L48-L64) checks `isComposing`, not `keyCode === 229`; [overlay dismissal](https://github.com/adobe/react-spectrum/blob/7743784aa065cd42bf0d144ddc5dd5e03e0e651f/packages/react-aria/src/overlays/useOverlay.ts#L128-L139) uses that guard. This supports the supplied event-shape diagnosis, not independent Safari verification.
- Open [#11026](https://github.com/adobe/react-spectrum/pull/11026) explicitly says "Closes #11025" and proposes the missing guard plus keyboard/overlay tests. Its reported passing tests are author claims; this run did not execute or independently validate them.
- Closed [#5921](https://github.com/adobe/react-spectrum/issues/5921) concerned Escape during composition and was addressed by [#5923](https://github.com/adobe/react-spectrum/pull/5923). The new report distinguishes a composition-ending event with `isComposing: false`; no working-to-failing version transition is established.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `Overlays`, `RAC`, `internationalization`, `accessibility` for overlay use and IME keyboard input; `needs investigation` for native-event verification; `ai-reviewed` for completed dry-run triage.
- Maintainer-only addition: `ready for review`, meaning actionable issue investigation, not acceptance of #11026. Withhold `regression` without evidence that this Safari sequence worked in an earlier release.
- Removals: none. All proposed additions exist.

**Maintainer next step**

1. Review the linked fix against the reported event shape, preserving `allowComposing` and ordinary Escape behaviour. Keep this issue open until a verified fix lands.
2. Confirm the native Safari Japanese/Chinese sequence in an approved reproduction workflow, recording the exact Safari/macOS versions and whether dismissal actually discards form state. The synthetic example alone does not establish native event ordering.
3. Verify input survives candidate cancellation, a subsequent ordinary Escape still dismisses, and nested overlays behave correctly. Do not blanket-disable keyboard dismissal or adopt the reporter's propagation workaround as a library fix.

### [#11022](https://github.com/adobe/react-spectrum/issues/11022): S2 TagGroup overflow with long text

**Decision:** Ready for initial maintainer investigation; inspect collapsed-tag measurement and actual scroll geometry before choosing a CSS fix.

**Impact/severity:** Low on current evidence: unwanted horizontal scrolling is a layout inconvenience; no essential task blockage or inaccessible control is reported. A supported workaround for the same collapsed layout is not established.

**Complexity:** Low provisionally: the candidate is a single component's measurement/layout styling, but causality and collapse calculations remain unverified.

#### What matters

- The [report](https://github.com/adobe/react-spectrum/issues/11022) says the parent scrolls horizontally "even though the tag text is truncated." Its steps isolate a fixed-width scrolling container with long text and `maxRows={2}`, then remove that tag to compare.
- [S2 measurement markup](https://github.com/adobe/react-spectrum/blob/7743784aa065cd42bf0d144ddc5dd5e03e0e651f/packages/@react-spectrum/s2/src/TagGroup.tsx#L348-L415) creates an invisible absolute collection whenever `maxRows` is supplied. It already sets `overflow: hidden`; prescribing that property alone would not address the current implementation.
- [Visible tags](https://github.com/adobe/react-spectrum/blob/7743784aa065cd42bf0d144ddc5dd5e03e0e651f/packages/@react-spectrum/s2/src/TagGroup.tsx#L508-L523) have full-width limits and [text truncation](https://github.com/adobe/react-spectrum/blob/7743784aa065cd42bf0d144ddc5dd5e03e0e651f/packages/@react-spectrum/s2/src/TagGroup.tsx#L612-L630). Static markup cannot establish which box contributes excess scroll width.
- A [StackBlitz reproduction is provided](https://stackblitz.com/edit/moz5fz7d-niwwgm4j?file=src%2FExample.tsx), but not inspected. The supplied image was also not fetched under the issue-URL prohibition; no matching duplicate or fixing PR was established.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `TagGroup`, `S2` for component/layer; `needs investigation` for unverified layout causality; `ai-reviewed` for completed dry-run triage.
- Maintainer-only addition: `ready for review`, based on the concrete composition, steps and environment, with external reproduction still uninspected. No `regression` proposal without a last-known-working version.
- Removals: none. All proposed additions exist.

**Maintainer next step**

1. Inspect the supplied example through an approved reproduction workflow. Compare parent `scrollWidth`/`clientWidth` with short/long text, with/without `maxRows`, and with removal enabled/disabled.
2. Establish whether the hidden measurement collection or visible tags cause overflow. Preserve row counting, Show all/Show less actions, resizing, RTL layout and focus indicators in any fix.
3. Check the documented `styles` width API if the parent constraints are implicated. Do not recommend hiding parent overflow, private-selector overrides or shortening user data as an equivalent fix.

### [#11024](https://github.com/adobe/react-spectrum/issues/11024): Checkbox taps ignored in Firefox touch simulation

**Decision:** Not ready for a targeted fix or duplicate disposition; obtain the exact Firefox environment and establish the simulated event sequence.

**Impact/severity:** Low on current evidence: local touch testing is impeded, while the reporter explicitly says normal Firefox is unaffected. Actual Gecko touch-device failure is not established.

**Complexity:** Unknown: virtual-pointer classification is a candidate, but no pointer geometry or event sequence is supplied to establish the cause or required change.

#### What matters

- The [report](https://github.com/adobe/react-spectrum/issues/11024) says "Tap is ignored; checkbox remains in its state" after enabling Firefox Responsive Design Mode touch simulation and reloading the Checkbox demo. "Firefox normal mode is not affected" supplies an alternate testing path, not a fix for touch emulation.
- It provides public-demo steps, so a separate StackBlitz is not inherently necessary. The issue-supplied demo URL was not opened; the exact Firefox version and deployed package version are absent.
- [Checkbox uses the shared toggle hook](https://github.com/adobe/react-spectrum/blob/7743784aa065cd42bf0d144ddc5dd5e03e0e651f/packages/react-aria/src/checkbox/useCheckbox.ts#L62-L79), which [ignores virtual label presses](https://github.com/adobe/react-spectrum/blob/7743784aa065cd42bf0d144ddc5dd5e03e0e651f/packages/react-aria/src/toggle/useToggle.ts#L168-L200). This could explain a misclassified tap, but this report does not show the required event attributes.
- [#10998](https://github.com/adobe/react-spectrum/issues/10998) describes zero-size touch events under Android Chrome's desktop user agent, not Firefox simulation. Closed [#4422](https://github.com/adobe/react-spectrum/issues/4422) describes Select opening then immediately closing, not a checkbox failing to toggle; neither is an established duplicate.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `Checkbox`, `usePress`, `RAC` for the component and candidate shared interaction layer; `needs investigation`; `waiting on author` for the specific browser/version request; `has workaround` for the reported unaffected normal-browser path, with the touch-testing limitation retained; `ai-reviewed`.
- Maintainer-only recommendation: withhold `ready for review` until the browser environment is pinned down. Do not add `browser bug` or `regression` without event/browser or version-transition evidence.
- Removals: none. All proposed additions exist.

**Maintainer next step**

1. Request Firefox version/edition, Linux distribution and the date/version of the demo tested, plus confirmation that touch simulation was enabled before the reload. Preserve the supplied steps; do not ask for a missing StackBlitz as if no reproduction detail existed.
2. In an approved browser investigation, compare simulated taps on checkbox and label, native input activation, and the pointer/click sequence and geometry. Determine whether zero-size events or another path cause the failure before linking it as a duplicate of #10998.
3. Use normal Firefox for unaffected interaction checks in the meantime, explicitly noting that it does not validate touch. If classification needs changing, preserve screen-reader virtual activation; do not replace it with timer-based suppression.

## Evidence and verification

### #11025: history and verification limits

Reported versions are `react-aria@3.52.1`, `react-aria-components@1.21.1` and `@react-aria/overlays@3.32.1`, on macOS Safari. No exact Safari/macOS build or last-known-working release is supplied. The inline synthetic reproduction was read, not executed.

Trusted [keyboard tests](https://github.com/adobe/react-spectrum/blob/7743784aa065cd42bf0d144ddc5dd5e03e0e651f/packages/react-aria/test/interactions/useKeyboard.test.js#L266-L292) cover `isComposing` and opt-in composition. The inspected cases do not cover Safari's reported false-composition/229 shape. This is static test analysis only.

[#10249](https://github.com/adobe/react-spectrum/issues/10249) is related but not an overlay duplicate: it concerns SearchField submission/clearing during CJK input. A [maintainer comment](https://github.com/adobe/react-spectrum/issues/10249#issuecomment-4783450205) says it should be fixed by #10200; that does not prove the new late-Safari event is handled. Neither the reporter's Chrome guidance nor WebKit bug URL was fetched.

### #11022: measurement constraints and environment

Reported environment: `@react-spectrum/s2@1.7.1`, Chrome, macOS; exact browser/OS builds are not supplied. [Measurement calculations](https://github.com/adobe/react-spectrum/blob/7743784aa065cd42bf0d144ddc5dd5e03e0e651f/packages/@react-spectrum/s2/src/TagGroup.tsx#L209-L275) depend on hidden child rectangles, row positions and action-button space. Removing or changing that collection can alter collapse behaviour, even if visible truncation remains correct.

The trusted [S2 documentation example](https://github.com/adobe/react-spectrum/blob/7743784aa065cd42bf0d144ddc5dd5e03e0e651f/packages/dev/s2-docs/pages/s2/TagGroup.mdx#L60-L69) demonstrates `styles={style({maxWidth: 320})}`. This establishes a public width API, not a verified workaround for this report. No issue-provided source URL was fetched; source was read independently from `origin/main`.

### #11024: distinguish emulation and device bugs

Trusted [virtual-pointer detection](https://github.com/adobe/react-spectrum/blob/7743784aa065cd42bf0d144ddc5dd5e03e0e651f/packages/react-aria/src/utils/isVirtualEvent.ts#L42-L57) classifies zero-width/height non-Android events as virtual. [Press handling](https://github.com/adobe/react-spectrum/blob/7743784aa065cd42bf0d144ddc5dd5e03e0e651f/packages/react-aria/src/interactions/usePress.ts#L562-L575) then defers them to virtual click processing, while toggle label handling skips virtual presses and prevents native label clicks. This is a conditional causal path; Firefox event evidence is missing.

On #10998, a [maintainer comment](https://github.com/adobe/react-spectrum/issues/10998#issuecomment-7032391918) questions zero-size Chrome touch geometry and requests browser-bug investigation. It is not a conclusion about Firefox. On #4422, the [closing comment](https://github.com/adobe/react-spectrum/issues/4422#issuecomment-2557768278) says "Cannot reproduce anymore. May have been fixed by #7026." That older, different symptom does not establish a regression here. Firefox on iOS, reported unaffected, is not evidence that Gecko on a real touch device is unaffected.

## Run notes

### Scope and discovery

Run cutoff: `2026-11-24T16:01:56Z`, using the supplied timestamp at second precision; filename date is November 24. Since-last-digest discovery starts at the November 23 digest cutoff, `2026-11-23T17:48:33Z`. The separate last-24-hours window starts at `2026-11-23T16:01:56Z`.

Both `gh issue list` open-issue queries used inclusive creation ranges and a 100-result limit, returning exactly #11022, #11024 and #11025, all unlabelled. Independent GET discovery of the newest 100 open issues/PRs reached `2026-10-18T06:55:55Z`, before both windows; excluding PRs produced the same three candidates, so another page was unnecessary. Final individual GETs confirmed all three remained open, unlabelled and without comments.

Duplicate discovery covered open/closed issues and PRs using composition/Escape, `isComposing`, IME, Firefox/touch, checkbox/Firefox, virtual-pointer, TagGroup/overflow, truncation and measurement searches, plus exact issue-number PR searches. Limits were 10-30 per search. Searches found the matching open #11026 and the related historical reports above; they are bounded discovery, not an exhaustive historical audit.

### Membership and access failures

Membership was checked before issue investigation. All three authors have `author_association=NONE`. Collaborator-permission GETs for `mfroembgen`, `bikubi` and `vanykardjikian` each failed with HTTP 403, "Must have push access to view collaborator permission." A main-tree path search found no CODEOWNERS or core-contributor-named file providing alternative membership evidence. Membership remains unverified; normal triage was used without inferring membership or non-membership.

The optional `.github` membership-path search returned exit status 1 because no matching path existed; subsequent full main-tree discovery likewise found no such path. Required issue discovery, reads and synchronization succeeded. No permission failure was bypassed.

### Synchronization and checkout

Verified the dedicated `/Users/darobins/dev/react-spectrum-triage` checkout, branch `triage_support`, empty index, absent merge/index locks and absent target digest. Initial and pre-write app snapshots showed no other active shared-checkout triage session; other busy work was in a different project. No checkout was created and no branch was switched.

`git fetch origin` succeeded. The tracked-change check outside `.github/triage` was empty, so `git merge origin/main --no-edit` ran and succeeded. Merged source revision: `7743784aa065cd42bf0d144ddc5dd5e03e0e651f`. Pre-digest HEAD/merge commit: `fb570fee66728bd8dd20188ed572a52c2fc2bfe6`. The merge did not change the issue or PR triage rules.

The only pre-existing local change was `.github/triage/setup.md`; it remains excluded from staging and committing. Trusted source and test content were read with `git show origin/main:<path>` only.

### Boundary and commit bookkeeping

Dry run only: GitHub reads used `gh issue list|view`, `gh pr view`, `gh search` and GET-only `gh api`. No GitHub comments, labels, closures, edits, assignments, notifications, gists, PR creation or other writes were made. No issue-supplied URL or image was opened, and no issue, PR, reproduction or test code was executed. All action blocks are proposals only.

The sole generated file is `.github/triage/tmp-digests/triage-issues-2026-11-24.md`. Before staging, the index must be empty; before committing, it must contain only that exact digest. Authorized message: `chore: add issue triage digest 2026-11-24`, with `Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>`. The verified digest-only commit hash is reported in the final response rather than self-embedded. No push is authorized.
