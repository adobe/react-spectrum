# Issue triage digest: 2026-11-25

## At a glance

- 2 eligible issues analysed; 0 verified team authors skipped. Both concern keyboard accessibility.
- Table focus scrolling overlaps an existing investigation; PromptField Escape dismissal has maintainer agreement and an open fix PR.
- External reproductions were not opened or executed. Author membership could not be verified with available read access.

### [#11032](https://github.com/adobe/react-spectrum/issues/11032): Table navigation hides the focused header

**Decision:** Ready for focused maintainer investigation, not a confirmed duplicate; compare this unbounded, document-scrolling case with #10182 and #10196 before consolidating it.

**Impact/severity:** High, provisionally: the reported keyboard-navigation path hides the active header beneath a fixed banner, a significant focus-visibility failure with no verified supported workaround. The external demonstration and actual task obstruction were not independently verified.

**Complexity:** Unknown: the shared scrolling fallback is implicated, but the acceptable fix and required refactor/call-site migration are not established.

#### What matters

- The [issue](https://github.com/adobe/react-spectrum/issues/11032) reports horizontal navigation changing page scroll from 0 to 361px while revealing column 4. It explicitly removes the bounded-height and scroll-padding conditions in #10196.
- The [author's follow-up](https://github.com/adobe/react-spectrum/issues/11032#issuecomment-7158902460) says merely tabbing to an already visible row also moves the page: "container `scrollLeft` and `scrollTop` both remained `0`." That entry symptom needs separate verification, not an assumption that every jump has the same trigger.
- Trusted [scrolling source](https://github.com/adobe/react-spectrum/blob/b1e8cf579fcc4cda0031f09d7d4e3bdff299fc3a/packages/react-aria/src/utils/scrollIntoView.ts#L158-L168) centres the containing element after movement in either axis. This supports the horizontal-jump hypothesis, not a measured call trace.
- A [contributor comment](https://github.com/adobe/react-spectrum/issues/11032#issuecomment-7159681318) says this waits on #10556 and ideally #10558. Both remain open and explicitly defer call-site migration; the supplied Vercel reproduction is **provided but not inspected**.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `Table`, `RAC`, `scrollIntoView`, `accessibility` for the component, shared behaviour and focus-visibility consequence.
- Bot-eligible additions: `needs investigation`, `waiting on maintainer`, `ai-reviewed` for unresolved causal coverage and completed triage. No removals.
- Maintainer-only recommendation: `ready for review` for the concrete steps and environment, provided this distinct scenario is retained rather than consolidated. No `regression` proposal: no working-to-failing transition is established.

**Maintainer next step**

1. Independently verify horizontal column navigation and initial Tab entry, recording focused-element geometry and document/container scroll positions before and after each action.
2. Compare with #10182 and #10196. If the same fix covers all three, preserve this unbounded/no-scroll-padding case in the canonical report before considering duplicate closure; do not discard it based on matching titles.
3. Clarify whether a targeted change or the planned scroll-utility migration owns the fix. The current PRs' additive scope does not establish delivery of a Table fix.
4. Retain coverage for sticky headers, oversized tables and a containing table genuinely outside the viewport. Do not recommend deleting the centring fallback or patching library internals as a consumer workaround.

### [#11029](https://github.com/adobe/react-spectrum/issues/11029): PromptField completions ignore Escape

**Decision:** Ready for maintainer review; the expected dismissal behaviour is agreed, and #11031 is a proposed fix rather than a reason to skip this issue.

**Impact/severity:** Medium: keyboard mention composition is degraded, but a maintainer confirms Space dismisses suggestions. That alternate path changes the text and does not satisfy text-preserving Escape dismissal.

**Complexity:** Low: a localised PromptField dismissal-state/keyboard change is plausible from the current source; async completions, text-versus-caret changes and nested-menu handling still require focused review.

#### What matters

- The [report](https://github.com/adobe/react-spectrum/issues/11029) supplies an inline component and steps: type `@`, then Escape; the menu stays open and the consumer's `onKeyDown` does not receive Escape. No hosted reproduction is supplied, but the inline scenario is sufficient to start investigation.
- A [member response](https://github.com/adobe/react-spectrum/issues/11029#issuecomment-7152613174) says "agreed Esc should do something" and invites a fix exploration. The author clarified that typing after dismissal should reopen matching suggestions.
- Trusted [popover source](https://github.com/adobe/react-spectrum/blob/b1e8cf579fcc4cda0031f09d7d4e3bdff299fc3a/packages/@react-spectrum/ai/src/PromptField.tsx#L795-L835) derives `isOpen` from focus, anchor and nonempty results, with no dismissal state or `onOpenChange`. This supports the diagnosis by reading, not execution.
- [#11031](https://github.com/adobe/react-spectrum/pull/11031) remains open and describes text-preserving dismissal and reopening tests. Its claimed passing results are author-reported, not independently verified here; no other matching issue surfaced in the bounded searches.

#### Would have done

**Labels (proposed)**

- Bot-eligible additions: `PromptField`, `AI`, `S2`, `accessibility` for the RSP AI component and keyboard dismissal gap.
- Bot-eligible additions: `has workaround`, `ai-reviewed` for the member-confirmed Space alternative and completed triage. No removals.
- Maintainer-only recommendation: `ready for review`; the description, inline scenario, versions, browser/OS and agreed expected behaviour support review. No `waiting on author` or `regression` proposal.

**Maintainer next step**

1. Review #11031 against the agreed behaviour: Escape preserves text/focus, the next text edit reopens suggestions, caret-only movement does not, and Escape remains available to enclosing UI when completions are closed.
2. Verify asynchronously resolved/empty results and toolbar submenus in a real browser, including assistive technology. Do not assume the PR's jsdom results establish these interactions.
3. Suggested interim answer: Space can dismiss suggestions, as confirmed in the discussion; it changes the input and is not an equivalent Escape fix. The [trusted AI example source](https://github.com/adobe/react-spectrum/blob/b1e8cf579fcc4cda0031f09d7d4e3bdff299fc3a/packages/dev/s2-docs/pages/s2/ai-components.mdx#L137-L149) provides a starting point for completion examples. Do not recommend the reported capture-phase wrapper as the library solution.

## Evidence and verification

### #11032: shared mechanism, distinct scenarios

[Collection focus handling](https://github.com/adobe/react-spectrum/blob/b1e8cf579fcc4cda0031f09d7d4e3bdff299fc3a/packages/react-aria/src/selection/useSelectableCollection.ts#L514-L525) calls `scrollIntoViewport` with the collection as containing element on keyboard entry. [Focused-key updates](https://github.com/adobe/react-spectrum/blob/b1e8cf579fcc4cda0031f09d7d4e3bdff299fc3a/packages/react-aria/src/selection/useSelectableCollection.ts#L679-L690) first scroll the container, then call the viewport helper. The helper's >1px movement check uses either axis; horizontal movement can therefore trigger vertical centring. The additional Tab-entry claim lacks an instrumented trace and is not independently explained by this comparison.

[#10196](https://github.com/adobe/react-spectrum/issues/10196) describes "Moving horizontally along a row ... `scrollTop` changes unexpectedly" with bounded height, sticky regions and scroll-padding. Its [author clarification](https://github.com/adobe/react-spectrum/issues/10196#issuecomment-4708873034) calls #10182 "Not a strict duplicate, but same underlying issue I think." #11032 instead reports document scrolling without the bounded-height/padding setup.

On [#10182](https://github.com/adobe/react-spectrum/issues/10182), a [member reproduced the older scenario](https://github.com/adobe/react-spectrum/issues/10182#issuecomment-4675621402) and said #9780 did not fix it. Later [member guidance](https://github.com/adobe/react-spectrum/issues/10182#issuecomment-5287295718) accepts trying nearest alignment with cross-browser testing. This is historical evidence and direction, not reproduction of today's report. [#10211](https://github.com/adobe/react-spectrum/pull/10211) is still an open proposed fix for #10182.

[#10556](https://github.com/adobe/react-spectrum/pull/10556) and [#10558](https://github.com/adobe/react-spectrum/pull/10558) both say "Migrating call sites ... is to be done in chore follow-ups." Neither is merged. Their scope supports tracking a dependency, not asserting that merging either will resolve #11032.

Reported environment: RAC 1.22.1, `react-aria` 3.53.1, React/React DOM 19.3.1, Chrome on macOS; exact browser/OS releases are unspecified. The Vercel link was neither opened nor executed. Current [utility tests](https://github.com/adobe/react-spectrum/blob/b1e8cf579fcc4cda0031f09d7d4e3bdff299fc3a/packages/react-aria/test/utils/scrollIntoView.test.ts) exercise root-border scrolling calculations, not this native viewport/sticky-table sequence. No passing reproduction or cross-browser result is claimed.

### #11029: dismissal ownership and coverage

[PromptField keyboard setup](https://github.com/adobe/react-spectrum/blob/b1e8cf579fcc4cda0031f09d7d4e3bdff299fc3a/packages/@react-spectrum/ai/src/PromptField.tsx#L561-L565) defines Tab/Shift+Tab shortcuts only. [Autocomplete Escape handling](https://github.com/adobe/react-spectrum/blob/b1e8cf579fcc4cda0031f09d7d4e3bdff299fc3a/packages/react-aria/src/autocomplete/useAutocomplete.ts#L345-L415) returns for default-prevented Escape; otherwise it forwards keyboard handling to the wrapped collection and stops the input event propagating. This explains why a consumer bubbling handler is not a reliable dismissal mechanism.

The [current PromptField suite](https://github.com/adobe/react-spectrum/blob/b1e8cf579fcc4cda0031f09d7d4e3bdff299fc3a/packages/@react-spectrum/ai/test/PromptField.test.tsx#L88-L151) covers opening, filtering, insertion and async results, but the inspected file has no Escape test. #11031 claims to add dismissal/reopening and propagation tests; its reported 35/35 results and manual instructions were read as evidence only, not rerun or treated as verified.

Reported environment: `@react-spectrum/ai` 0.5.1, also claimed affected in 0.5.2/current main; S2 1.8.1; React 19.2.6; Chrome on macOS. No last-known-working version is identified, so a regression is not supported. The [member's Space workaround](https://github.com/adobe/react-spectrum/issues/11029#issuecomment-7147416503) is attributed evidence, not independent verification. The comment's website, StackBlitz suggestion and image were not opened under the URL prohibition.

## Run notes

### Scope and discovery

Cutoff: `2026-11-25T16:13:46Z`, from the supplied timestamp at second precision; filename date is November 25 in the checkout's local timezone. Since-last-digest start: `2026-11-24T16:01:56Z`, taken from the November 24 issue digest. This covers the entire last-24-hours interval beginning `2026-11-24T16:13:46Z`.

Initial open-issue discovery began slightly earlier at `2026-11-24T16:00:00Z`; the exact since-last-digest query returned the same two candidates. Both queries used inclusive creation ranges and a 100-result limit. Independent GET discovery of the newest 100 open issues/PRs reached `2026-10-19T05:55:04Z`, before the required window; excluding PRs produced the same candidates, so pagination was unnecessary. Final individual GETs confirmed both remained open and unlabelled, with all 2 and 3 comments respectively read.

Open/closed issue and PR searches covered `scrollIntoViewport`, Table/scroll/focus, horizontal/keyboard/scroll, PromptField/Escape, TokenField/Escape, PromptTokenField and exact new issue numbers, using limits of 10-20. These are bounded duplicate searches, not an exhaustive historical audit. Proposed labels were checked against the repository's paginated label list; every proposed label exists.

### Membership and access failures

Both authors have `author_association=NONE`. Collaborator-permission GETs for `smohadjer` and `samatsea` failed with HTTP 403, "Must have push access to view collaborator permission." A full main-tree filename search found no CODEOWNERS or core-contributor-named file providing alternative membership evidence. Membership is unverified, not disproved; normal triage was used. Adobe employment and other people's member comments were not treated as author membership.

An initial `.github/CODEOWNERS` source read failed because the path does not exist; the full-tree search resolved that lookup. A previous-digest line-range read exceeded the file length and was corrected before selecting the cutoff. A `gh pr view` read failed with a connection reset; GET-only REST reads recovered all required PR metadata. A source-search chain stopped on no literal Escape match in the RAC wrapper; the implementation hook was subsequently located and read. No access restriction was bypassed.

### Synchronization and checkout

Verified `/Users/darobins/dev/react-spectrum-triage`, branch `triage_support`, an empty index, absent in-progress merge and absent target digest before synchronization. Initial and pre-write app status snapshots showed this as the only active shared-checkout triage run. No checkout was created or branch switched.

`git fetch origin` and `git merge origin/main --no-edit` succeeded. The tracked-change check outside `.github/triage` was empty. Merged source revision: `b1e8cf579fcc4cda0031f09d7d4e3bdff299fc3a`; pre-digest merge HEAD: `5137f3615a17d6f91c37e20318e26bf7351ce5db`. The only pre-existing local change was `.github/triage/setup.md`, retained unstaged. Trusted source/docs/tests were read from `origin/main` using `git show`, never from issue or PR branches.

### Boundary and commit bookkeeping

Dry run only: GitHub reads used `gh issue list`, `gh search`, `gh pr view` and GET-only `gh api`. No comments, labels, closures, edits, assignments, notifications, gists, PR creation or other GitHub writes occurred. No issue-supplied URL/image was opened and no issue, PR, reproduction or test code was executed. All "Would have done" actions are proposals for maintainer review.

The sole generated file is `.github/triage/tmp-digests/triage-issues-2026-11-25.md`. Commit procedure requires an empty index before staging and exactly this file before committing, with message `chore: add issue triage digest 2026-11-25` and trailer `Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>`. The actual digest-only commit hash is verified and reported in the final response rather than embedded in its own contents. No push.
