# PR triage - November 6, 2026

*Presentation-only revision of the original read-only digest; no new triage or runtime verification.*

## At a glance

- **1 PR analyzed:** [#10933](https://github.com/adobe/react-spectrum/pull/10933), a focused fix for stacked Sheet backdrop flashes.
- **Recommend maintainer review.** The change follows the agreed direction; returned CLA and CI checks are successful.
- **Main caveat:** green CI does not prove Firefox ran the relevant browser tests. **1 member PR skipped.**

## Triage

### [#10933 - Fix stacked Sheet backdrop flashes in Firefox](https://github.com/adobe/react-spectrum/pull/10933)

**Decision:** Ready for substantive maintainer review; confirm enabled-Firefox evidence.

**Complexity: Low** - 27 source lines in one component, plus two test files using the existing harness.

**Impact/severity:** Not assessed in the original run. The reported problem affects nested Sheet users.

**Merge risk: Medium** - animation bindings change, and Firefox-specific verification remains incomplete.

#### What matters

- Stable per-sheet timeline names replace stack-index names across backdrop, swipe, and descendant animations.
- The approach follows [maintainer guidance on the originating issue](https://github.com/adobe/react-spectrum/issues/10924#issuecomment-6663457398); no public API change was found.
- Browser tests have a capability gate and may skip Firefox. Fresh outer-sheet reopening is in the manual instructions, but not automated.

#### Would have done

**Labels (proposed)**

- Add `merge-risk: medium` for animation changes and the Firefox verification gap.
- Add `small review` for focused scope and `ai-reviewed` for completed read-only triage.
- Add `has workaround` for the temporary CSS mitigation and `waiting for maintainer` for the next review.
- Recommend maintainer-only `ready for review`. All proposed labels exist; remove none and keep `RAC`.

**Maintainer next step**

1. Review timeline identity and compatibility of the generated CSS names.
2. Confirm Firefox validation with view timelines enabled, including closing and reopening the outer sheet.

**Confidence: Medium** - no code was run, and successful CI does not establish coverage of the reported Firefox scenario. No author blocker is asserted.

## Member PRs skipped

- [#10929 - Upgrade to CSF3](https://github.com/adobe/react-spectrum/pull/10929): `author_association: MEMBER` verifies snowystinger. **Would have done:** add missing `rsp-core`; skip analysis, other labels, comments, and readiness assessment.

## Evidence and verification

### Evidence for #10933

#### Fix and agreed direction

Originating issue [#10924](https://github.com/adobe/react-spectrum/issues/10924) reports that an unregistered child initially reuses `--sheet-timeline-0`, letting the parent backdrop bind to the child in Firefox.

All returned issue comments were read. The maintainer asked for "a stable unique timeline name independent of its index." The [new name exists before registration](https://github.com/adobe/react-spectrum/blob/05d1d6a2f57f931d446f541a8fb4da0a499624ad/packages/react-aria-components/src/Sheet.tsx#L249-L260) and is used by descendants, backdrop animations, and content declarations. Reading supports the approach; it does not verify runtime correctness.

#### Compatibility

No public prop, export, type, event, default, DOM-structure, class, or data-attribute change was found.

Generated `view-timeline-name`, `animation-timeline`, and root `timeline-scope` values change from indices to IDs ([scope declarations](https://github.com/adobe/react-spectrum/blob/05d1d6a2f57f931d446f541a8fb4da0a499624ad/packages/react-aria-components/src/Sheet.tsx#L168-L173), [content declarations](https://github.com/adobe/react-spectrum/blob/05d1d6a2f57f931d446f541a8fb4da0a499624ad/packages/react-aria-components/src/Sheet.tsx#L1117-L1123)). Hard-coded old names could be affected.

Main's docs describe `swipeAnimation` and `stackAnimation`, not these generated names. Stack order and styling attributes remain index-based. The original assessment did not recommend `needs API review`.

#### Browser coverage and CI

- [Browser tests](https://github.com/adobe/react-spectrum/blob/05d1d6a2f57f931d446f541a8fb4da0a499624ad/packages/react-aria-components/test/Sheet.browser.test.tsx#L65-L86) use `it.skipIf(!CSS.supports('animation-timeline: view()'))`.
- [Main's Firefox configuration](https://github.com/adobe/react-spectrum/blob/8203ef81549ef9e01391a57b2e244b13cf36daaa/vitest.browser.config.ts#L259-L280) supplies no enabling preference. Author-reported enabled-Firefox before/after and manual results remain unverified.
- Cases exercise opening/closing, three-level nesting, and rendered backdrop opacity. Supplemental unit assertions check timeline identity.
- Both attempts reopen inner sheets while the outer stays open; neither automates fresh outer-sheet reopening.
- [Returned checks](https://github.com/adobe/react-spectrum/pull/10933/checks), including CLA, lint, unit/browser/SSR tests, and type comparison, are successful. This is not proof a capability-gated scenario ran.

#### Existing workaround and red flags

Main still generates index-based names at `Sheet.tsx:170-172`; the fix was not already incorporated.

The issue's `.react-aria-SheetBackdrop[data-has-descendants] { animation: none !important; }` workaround sacrifices synchronized animation. It is historical temporary mitigation, not an equivalent replacement or an endorsed `!important` fix.

No new suppression, unsafe cast, accessibility removal, or production timing hack was identified. Existing `@ts-ignore` and non-null assertions are unchanged; new `requestAnimationFrame` calls sample test frames.

No CI workflow, manifest, dependency, lockfile, install-script, or build-config change triggered the mandatory security-review flag.

#### Related work, not duplicates

- Searches covered #10924, Sheet/Firefox, backdrop flashes, timelines, and recent `Sheet.tsx` mentions; no supported competing implementation was found.
- Closed [#10835](https://github.com/adobe/react-spectrum/pull/10835) adds a `scrollend` exit fallback, not a backdrop-collision fix.
- Merged [#10674](https://github.com/adobe/react-spectrum/pull/10674) introduced Sheet. Its [index-versus-ID discussion](https://github.com/adobe/react-spectrum/pull/10674#discussion_r4127917114) is design history.

#10924 is the originating issue, not a duplicate to close. No comment, duplicate notice, closure, assignment, or request-changes review was recommended.

## Run notes

### Scope and discovery

- Window: previous PR digest commit time `2026-11-05T16:52:59Z` through discovery at `2026-11-06T16:40:23Z`.
- Rolling-24-hour and since-last-digest queries both returned #10929 and #10933; neither had `ai-reviewed`. Head, labels, and eligibility were rechecked.
- Reviewed head: `05d1d6a2f57f931d446f541a8fb4da0a499624ad`.

### Git synchronization - original run

- Checkout: `/Users/darobins/dev/react-spectrum-triage`; branch: `triage_support`.
- Index was empty; no merge, other active triage session, or existing target digest was found.
- Fetch succeeded; merge reported "Already up to date." Main: `8203ef81549ef9e01391a57b2e244b13cf36daaa`, verified as an ancestor of HEAD.
- The pre-existing local `setup.md` adaptation remained untouched/unstaged. This presentation edit makes no new commit.

### Permissions and rule feedback

- No GitHub writes, push, contributor-code/reproduction execution, contributor-URL retrieval, or gist creation occurred.
- #10933 returned `CONTRIBUTOR`, not confirmed core membership. Collaborator-permission GET failed with HTTP 403, "Must have push access to view collaborator permission." No `.github/CODEOWNERS`, root `CODEOWNERS`, or `docs/CODEOWNERS` was found, so normal triage was used.
- An initial combined-query search failed; explicit `--repo adobe/react-spectrum` succeeded. The legacy `packages/react-aria-components/docs` path was absent; current docs came from `packages/dev/s2-docs/pages/react-aria/`.
- The skipped-member line retains its inline **Would have done** statement without expanding into a full review.
- External reproduction and baseline-failure claims remain unverified. Source findings and CI results above are from the original run, not fresh checks.
