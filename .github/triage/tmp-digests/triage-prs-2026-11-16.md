# PR triage digest: 2026-11-16

## At a glance

- One eligible PR analyzed; one draft excluded. No eligible member PRs.
- The transition-cleanup fix addresses a remaining queued-callback gap, rather than repeating the merged multiple-property cancellation fix.
- Readiness is blocked by CLA, an unconfirmed contributor-understanding checklist, and an unresolved observer-versus-event-listener decision.

### [#10973](https://github.com/adobe/react-spectrum/pull/10973): Release removed transition targets

**Decision:** Not ready for substantive review; resolve the event-handling direction and contributor attestation first, with CLA handled by its separate automation.

**Complexity:** High: changes shared RAC core transition bookkeeping used by focus and text-selection handling, despite only 18 added source lines.

**Impact/severity:** Unknown: detached targets and queued callbacks can remain retained; affected production workflow severity and a practical supported workaround are not established for this exact condition.

**Merge risk:** Medium: contained implementation, but it observes document-subtree mutations during active transitions and changes callback-flush timing; performance and consumer-level effects remain unverified.

#### What matters

- The [source diff](https://github.com/adobe/react-spectrum/pull/10973/files) adds a `MutationObserver` using `{childList: true, subtree: true}` while transitions are tracked, sweeps disconnected targets after removals, and flushes queued callbacks when idle. Public signatures, exports, DOM structure and styling contracts are unchanged; callback completion can now happen after removal without another invocation.
- The [original issue](https://github.com/adobe/react-spectrum/issues/10972) reproduces intercepted `transitioncancel`, not ordinary browser removal failure. The browser test includes both cases; author-reported cross-engine results are not independently executed or verified here.
- Historical [maintainer direction on intercepted events](https://github.com/adobe/react-spectrum/issues/1848#issuecomment-837397353) suggests capture-phase listening, and the [closing comment](https://github.com/adobe/react-spectrum/issues/1848#issuecomment-4677989171) specifically invites trying that direction. This PR instead adds document observation, without discussing that comparison or providing performance measurements.
- The [PR checklist and checks](https://github.com/adobe/react-spectrum/pull/10973) leave contributor understanding unchecked and report `Adobe CLA Signed?` as `ACTION_REQUIRED`. Other reported checks succeed, but a successful browser status alone does not establish that every new browser case ran.

#### Would have done

**Labels (proposed)**

Bot-eligible additions:

- `ai-reviewed`: this revision received the prescribed high-complexity triage, with verification limits recorded.
- `merge-risk: medium`: shared callback timing and document-observer cost need reviewer attention.
- `needs decision`: should intercepted completion events be handled with the proposed removal observer, capture-phase listeners as previously suggested, or a combination justified by remaining cases?
- `waiting on author`: obtain the contributor's own confirmation that they understand and can explain this AI-assisted change; this is separate from CLA.

Removals: none. All proposed labels exist. No `small review`, impact label or `regression` proposal; no supported last-working/first-failing transition is supplied. No maintainer-only readiness label is recommended while these blockers remain.

**Maintainer next step**

1. Reconcile the observer approach with the earlier capture-listener suggestion. The maintainers in the linked discussion, snowystinger and devongovett, have relevant historical context; nobody was contacted.
2. Ask the contributor to explain the observer lifecycle and callback timing, confirm the understanding checklist, and explain which cases still require observation if event capture is used.
3. If observation remains the chosen approach, request representative active-transition/mutation-load evidence and verification of affected focus/text-selection consumers. No performance benchmark is claimed in the PR.
4. Record the unsigned CLA as an additional readiness blocker, handled by separate automation, not the reason for the waiting label.

## Evidence and verification

### #10973: Scope and test evidence

The three changed files are `packages/react-aria/src/utils/runAfterTransition.ts` (+18), its existing unit test (+95/-1), and a new browser test (+54). No CI workflow, dependency, lockfile, install script or build configuration is changed, so the specific sensitive-file security-review flag is not triggered.

The utility now calls `flushCallbacks()` from completion events, removal-observer delivery and the existing animation-frame cleanup. Detached-target cleanup also removes its cancellation listener. The observer disconnects when the registry empties. This plausibly covers callbacks already queued before removal, which main's later-invocation cleanup does not flush by itself.

Added unit cases cover subtree removal, mixed connected/detached transitions, reparenting, callback cancellation and repeated removals. The browser case uses a real CSS transition and an earlier application listener calling `stopImmediatePropagation()`, paired with an ordinary-removal control. These are utility/DOM tests, not rendered focus or text-selection integration coverage. This is the prescribed high-complexity summary/API/duplicate assessment, not a full low-complexity red-flag review.

The author reports three new unit regressions failing before the change, all 11 utility tests passing afterward, and both browser cases passing in Chromium 143.0.7499.4, Firefox 144.0.2 and WebKit 26.0 on macOS Apple silicon. The description also discloses baseline DatePicker/DateRangePicker failures and intermittent browser-suite failures rather than claiming fully green local suites. These are author claims; no PR code or tests were run.

Current-main `focusSafely.ts` defers virtual-modality focus through this utility; `textSelection.ts` uses it when restoring iOS WebKit text selection. Those consumers establish potential accessibility/interaction reach, not proof that the current issue blocks an essential task in a production application. No current consumer-level reproduction, affected released-package version or independently supported workaround establishes a severity rating.

The external StackBlitz and reproduction-repository links in #10972 are **provided but not inspected** under the URL prohibition. Inline issue text, the GitHub diff and current-main source supplied the permitted evidence. The original issue and candidate PR have no comments; the PR has no reviews.

### #10973: Related work, not a replacement duplicate

[Merged #10730](https://github.com/adobe/react-spectrum/pull/10730) removes the one-shot cancellation listener so multiple property cancellations can be processed. Its CLA succeeded. That fix is already in the current baseline; #10973 targets completion events the library never receives, so there is no competing open implementation to prefer or close.

[Merged #8004](https://github.com/adobe/react-spectrum/pull/8004) added the detached-target sweep during a subsequent invocation. In [#7973's agreed sequence](https://github.com/adobe/react-spectrum/issues/7973#issuecomment-2749634652), removal precedes the queued animation frame; #10972 instead removes a target after the callback is already queued. Current main still performs its sweep only inside a subsequent `runAfterTransition` frame. The older fix therefore does not eliminate this remaining case.

[Closed #1848](https://github.com/adobe/react-spectrum/issues/1848) describes intercepted transition events and blocked text selection, making it a materially related historical report. Its capture-listener suggestion remains relevant direction, but its old AngularJS environment and temporary styling workaround do not establish an appropriate supported workaround for today's narrower intercepted-cancellation reproduction. No closure recommendation is made for #10972 or #10973.

Neither the current failure nor these older fixes establish a regression from a known working release. A last-working/first-failing comparison is needed before proposing `regression`.

## Run notes

### Scope and discovery

Window: since previous PR digest commit `b10655eca4390c45af4be3ca11943db2cd22b974`, `2026-11-15T18:41:24Z`, through discovery confirmation at `2026-11-16T16:22:03Z`.

Paginated GET discovery of open PRs covered 116 records in pages of 100 and 16. The exact creation-time filter returned #10973 and draft #10971. The draft was excluded before reading its diff, checks, linked issues or discussions. Its API association is `MEMBER`; no label proposal is made for an out-of-scope draft. Older #10967 and #10968 appeared only in the initial broader discovery and fall before the exact cutoff.

#10973 is a non-draft User account with no `ai-reviewed`; API `author_association` is `NONE`. The collaborator-permission GET returned HTTP 403, "Must have push access to view collaborator permission." A `.github/CODEOWNERS` GET returned 404; current-main tree inspection found no CODEOWNERS at the root, `.github` or `docs`. Core membership could not be independently verified, so normal triage was used rather than inferring membership.

Duplicate discovery used all-state `gh pr list` searches for `10972` and `transitionrun`, and `gh search prs/issues --repo adobe/react-spectrum` for `runAfterTransition` and transition/removal terms. Only #10973 matched the closing issue number. Related historical reports and fixes were compared above; search results do not prove exhaustiveness.

Analyzed head: `5f8df1bc38454e71daafb30866533fefabd700f9`. Final candidate read confirmed unchanged head, empty labels, no discussions/reviews and CLA as the sole non-success check. Repository labels were read with paginated GET; every proposed label exists.

### Synchronization and checkout

Verified `/Users/darobins/dev/react-spectrum-triage` on `triage_support`, an empty index, no merge in progress and no existing target digest. Initial and pre-write session-status checks found no other active issue/PR triage run; pre-write checks also found no index lock.

`git fetch origin` succeeded. The tracked-change check outside `.github/triage` was empty; `git merge origin/main --no-edit` reported "Already up to date." Incorporated `origin/main` is `360e35170568dfc99a2baaa78e6b7bdd36458d91`, verified as an ancestor of HEAD. There was no merge conflict or skipped synchronization.

The pre-existing local `.github/triage/setup.md` adaptation and all other files are preserved unchanged and unstaged.

### Read limitations and recovery

The full prompt exceeded the tool's read limit; bounded reads covered its contents. A range starting at line 181 failed because the file has 164 lines; the remainder was then read successfully. Large combined GitHub outputs were recovered through bounded tool-output reads and narrower `gh` queries.

The CODEOWNERS 404 also caused its decode pipeline to fail, preventing the chained label read; label discovery was rerun successfully as a separate read. Permission restrictions remain as described above. No required synchronization or safety check failed.

### Boundaries and commit bookkeeping

Dry run: GitHub access used only permitted `gh pr list/view/diff`, `gh issue view`, `gh search` and explicit GET API reads. No comments, labels, reviews, edits, closures, gists or other GitHub writes. No contributor URL was opened, and no PR branch, patch, reproduction or code was fetched, checked out, applied or executed.

Only `.github/triage/tmp-digests/triage-prs-2026-11-16.md` is to be staged after the empty-index check, verified as the sole staged path, and committed with `chore: add PR triage digest 2026-11-16` and the prescribed Copilot co-author trailer. The resulting hash and single-file commit are verified and reported separately to avoid self-referential edits. No push.
