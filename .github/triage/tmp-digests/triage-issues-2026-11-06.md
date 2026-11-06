# Issue triage - November 6, 2026

*Presentation-only revision of the original read-only digest; no new triage or runtime verification.*

## At a glance

- **1 issue analyzed:** [#10932](https://github.com/adobe/react-spectrum/issues/10932), repeat form submission while a Button is pending.
- **Ready for maintainer review.** Inline examples are sufficient to investigate; a hosted sandbox is still missing.
- **Likely incomplete earlier fix, not a duplicate.** Browser behavior remains unverified.

## Triage

### [#10932 - Enter can submit again while the Button is pending](https://github.com/adobe/react-spectrum/issues/10932)

**Decision:** Recommend maintainer review; keep the issue open as a follow-up to an incomplete fix.

**Impact/severity: Medium** - duplicate requests are reported; an application guard offers partial mitigation. No data loss or crash is established.

**Complexity:** Not assessed in the original run.

#### What matters

- Pressing Enter can reportedly resubmit a one-field form or activate another submit button while the original Button is pending.
- An [existing test explicitly excludes the one-field case](https://github.com/adobe/react-spectrum/blob/8203ef81549ef9e01391a57b2e244b13cf36daaa/packages/react-aria-components/test/Button.test.js#L387-L415). This supports investigating a coverage gap, not claiming a reproduced browser failure.
- A request-handler guard is **not a complete fix**: it cannot prevent the other button's earlier `onPress` callback.

#### Would have done

**Labels (proposed)**

- Add `bug`, `Button`, `Form`, and `RAC` for the reported behavior, components, and layer.
- Add `needs investigation` for unverified runtime behavior and `ai-reviewed` for completed triage, not approval.
- Recommend maintainer-only `ready for review`: enough detail exists to begin. All seven proposed labels exist; remove none.

**Maintainer next step**

1. Check Enter with one input, two inputs, and another submit button on current RAC in real browser tests.
2. Verify submitter identity, alternate-button callbacks, focus retention, and pending announcements.
3. Request a matching StackBlitz or CodeSandbox, without blocking investigation on it.

**Confidence: Medium** - source evidence supports the gap; browser behavior and the author's cancellation proposal were not tested.

## Evidence and verification

### Evidence for #10932

#### Reproduction and environment

The report includes expected/actual behavior, two inline examples, and numbered steps. The StackBlitz field is the placeholder `<to create from the code below>`, not a supplied runnable link.

Reported environment: RAC 1.16.0, hooks 3.47.0, React 18.3.1, Chromium 153 / Playwright 1.63, and macOS 27.2. Current-release behavior and Firefox/Safari were not measured.

The author reports `onSubmit` running again with `event.nativeEvent.submitter === null` in the one-field case, and the other button's `onPress` running in the two-button case.

#### Source and test coverage

- [Button implementation](https://github.com/adobe/react-spectrum/blob/8203ef81549ef9e01391a57b2e244b13cf36daaa/packages/react-aria-components/src/Button.tsx#L165-L172) changes a pending submit button's type to `button` and uses `aria-disabled`.
- The implicit-submission test linked above says, "Implicit form submission can happen if there's only one," and uses two text inputs.
- [New browser tests](https://github.com/adobe/react-spectrum/blob/8203ef81549ef9e01391a57b2e244b13cf36daaa/packages/react-aria-components/test/Button.browser.test.tsx#L19-L55) activate the focused button, not Enter in a field while pending.

These are reading-based findings, not an independent reproduction. No previously working version is supplied; the acknowledged exception does not establish a regression.

#### Related reports, not a duplicate disposition

- Closed [#6197](https://github.com/adobe/react-spectrum/issues/6197) reports form submission while pending. [#7498](https://github.com/adobe/react-spectrum/pull/7498), merged December 19, 2024, added the type change to disable implicit and explicit pending submission. They are incomplete-fix history, not proof this case is resolved.
- Open [#7543](https://github.com/adobe/react-spectrum/issues/7543) concerns pending state not reflecting `useFormStatus`; this report already has pending set.
- Closed [#10721](https://github.com/adobe/react-spectrum/pull/10721) concerns duplicate callbacks on Space activation, not Enter from a field.

No supported duplicate or complete fix was found. Differently worded reports cannot be ruled out.

#### Partial mitigation and label boundaries

The [Form docs](https://github.com/adobe/react-spectrum/blob/8203ef81549ef9e01391a57b2e244b13cf36daaa/packages/dev/s2-docs/pages/react-aria/Form.mdx#L49-L97) cover React 18 `onSubmit` with `preventDefault`. Gating request dispatch there while retaining `isPending` can reduce duplicate requests, but is not a full API-only solution.

Native disabling is not recommended as the fix. The [Button docs](https://github.com/adobe/react-spectrum/blob/8203ef81549ef9e01391a57b2e244b13cf36daaa/packages/dev/s2-docs/pages/react-aria/Button.mdx#L70-L72) require pending buttons to remain focusable; a [maintainer comment](https://github.com/adobe/react-spectrum/issues/6197#issuecomment-2052692015) explains focus and screen-reader feedback. The author's click-cancellation proposal still needs evaluation.

Do not propose `regression` without earlier-version evidence, `has workaround` for the incomplete guard, `browser bug` without attribution, or `accessibility` without an established assistive-technology failure. No author action currently blocks investigation, so `waiting for author` is not proposed. No comment, duplicate notice, or closure is recommended.

## Run notes

### Scope and discovery

- Window: previous digest commit `f44203be0bc8be7b1f056f3dd1526255d9501f87` at `2026-11-05T16:50:20Z` through `2026-11-06T16:00:57Z`.
- The exact-window query returned only #10932. Broader discovery also returned #10925 and #10924, both outside the window. No discovery/duplicate search reached its result limit.
- Final eligibility: #10932 was open, unlabeled, and without comments. Labels/comments were live reads, not an atomic historical snapshot.

### Git synchronization - original run

- Checkout: `/Users/darobins/dev/react-spectrum-triage`; branch: `triage_support`.
- Index was empty; no merge, other active triage session, or existing target digest was found.
- `git fetch origin` and `git merge origin/main --no-edit` succeeded. Source main: `8203ef81549ef9e01391a57b2e244b13cf36daaa`, verified as an ancestor of HEAD.
- The pre-existing local `setup.md` adaptation remained unstaged. The original run recorded only this digest as authored/staged for its digest commit; this presentation edit makes no new commit.

### Permissions and rule feedback

- No GitHub writes, push, external URL/reproduction/attachment retrieval, or code execution occurred. Reads used `gh issue list/view`, `gh pr view`, `gh search`, and `gh api --method GET`.
- Trusted source/docs came from the main revision above. Routine shell checks and `git show origin/main:...` used the original automation's standing authorization.
- The since-last-digest window and inline-detail readiness exception were used. A sandbox request remains useful, but is not an author blocker.
- Runtime claims and external specification links remain unverified. Changed browser evidence or a complete fix could change the original disposition.
