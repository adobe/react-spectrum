# PR triage digest: 2026-11-21

## At a glance

- One eligible non-member PR analysed; no member, draft, bot or already-reviewed candidates in the window.
- #11013 plausibly removes the Trusted Types failure in announcement clearing without changing public APIs.
- Not ready: lint is failing with no diagnostic exposed on GitHub, and the reported NumberField interaction lacks integration-level coverage.

### [#11013](https://github.com/adobe/react-spectrum/pull/11013): Clear live announcements without a TrustedHTML sink

**Decision:** Not ready for substantive review; retain the focused fix, but obtain interaction coverage and resolve or explain the lint failure first.

**Complexity:** Low. Two DOM-clearing substitutions in one package, plus focused tests; announcement selection, timing and public contracts are unchanged.

**Impact/severity:** Unknown. Enforced Trusted Types without a default policy causes announcement clearing to throw in Chromium; the affected essential workflow, extent of disruption and practical supported workaround are not established.

**Merge risk:** Medium. The replacement is contained, but real NumberField/announcement behaviour under CSP is not covered by the added tests, and lint attribution remains unresolved.

#### What matters

- The [source diff](https://github.com/adobe/react-spectrum/pull/11013/files) replaces both `innerHTML = ''` assignments with `replaceChildren()`. It retains each log element, its ARIA attributes and assertiveness selection.
- [Issue #11012](https://github.com/adobe/react-spectrum/issues/11012) identifies RAC hooks package `react-aria` 3.53.1 and the exact CSP condition. Current main still contains the offending assignments; no supported prop or documented composition bypass was found.
- Added tests observe rendered log children and retained roles, including a throwing `innerHTML` setter. They do not exercise focused NumberField value changes or actual browser Trusted Types enforcement.
- [GitHub check evidence](https://github.com/adobe/react-spectrum/pull/11013/checks) reports failing lint and the aggregate commit check. CLA is signed; the GitHub output supplies neither lint diagnostics nor proof that the new scenario ran in browser CI.

#### Would have done

**Labels (proposed)**

Bot-eligible additions:

- `small review`: localized, low-complexity implementation.
- `ai-reviewed`: current revision analysed with verification limitations recorded.
- `merge-risk: medium`: interaction/CSP coverage and unresolved lint attribution need attention.
- `waiting on author`: add focused coverage of the reported NumberField interaction using the real announcer.

Removals: None; the PR currently has no labels.

Maintainer-only recommendations: Do not add `ready for review` yet. Do not add `regression` without a working-to-failing version transition.

**Maintainer next step**

1. Request a rendered NumberField interaction test that focuses the input, changes the value and verifies announcement clearing/re-announcement without mocking the announcer. Retain the targeted log tests.
2. Inspect the lint diagnostic through the normal CI interface and ask for a fix if attributable to this PR; otherwise document the baseline/infrastructure explanation. GitHub GET evidence alone does not establish its cause.
3. Confirm the browser/CSP and screen-reader scenario described in the PR before marking it ready. No API decision or duplicate closure is indicated by available evidence.

## Evidence and verification

### #11013: Source, existing solutions and compatibility

On [current main](https://github.com/adobe/react-spectrum/blob/6be3466d87cc628ee69461230c1b5f4e3b64c6e3/packages/react-aria/src/live-announcer/LiveAnnouncer.tsx#L165-L176), both selected logs are cleared via an HTML assignment. The change avoids parsing HTML while preserving the same child-removal result. [useSpinButton](https://github.com/adobe/react-spectrum/blob/6be3466d87cc628ee69461230c1b5f4e3b64c6e3/packages/react-aria/src/spinbutton/useSpinButton.ts#L150-L155) clears the assertive log before announcing a focused value change, supporting the reported NumberField call path.

The constructor and announcement insertion use element creation, attributes and textContent, not the replaced HTML sink. No new props, exports, events, defaults, DOM wrappers, classes, data attributes or CSS variables are introduced. The intentional compatibility improvement is clearing under enforced Trusted Types. No need for `needs API review` was identified.

Source and NumberField documentation searches found no supported setting that avoids the internal clear while preserving announcement behaviour. Relaxing CSP, disabling announcements or adding a permissive default policy is not proposed as a workaround. This fix is not already present on origin/main.

### #11013: Test quality and red flags

The throwing-setter test would encounter the old assignment and fail; with the proposed removal it plausibly passes. The selective-clear tests also check that the other log retains its message and that the cleared log retains its role. These are observable DOM outcomes, not assertions about private helper call counts.

The new file matches the root Jest testMatch pattern. Existing [RAC NumberField tests](https://github.com/adobe/react-spectrum/blob/6be3466d87cc628ee69461230c1b5f4e3b64c6e3/packages/react-aria-components/test/NumberField.test.js#L13-L15) mock the announcer, so their success does not establish the failing real-announcer path. The added tests simulate one sink failure, not a CSP-enabled browser, keyboard interaction or assistive-technology result.

The test lookup helper adds a non-null assertion to a DOM query. It assumes fixture existence rather than changing production error handling; a missing node would fail the test. No added lint/type suppression, loose configuration, timing hack, ARIA removal, focus workaround or user-agent sniffing was found. Existing source timers and ts-ignore comments are unchanged.

GitHub reports lint failure; the aggregate check identifies lint as the failed job. Its annotations endpoint returns an empty array and the status description only points to an external CircleCI failure-report command. That command and external URL were not followed. Unit/browser/type job success is not proof of scenario coverage or a substitute for the missing diagnostic.

### #11013: Issue discussion, duplicates and regression evidence

The linked issue has no comments; the PR has no conversation comments, reviews or inline review comments. No maintainer constraints or objections were available to contradict the proposed approach.

All-state searches for LiveAnnouncer, Trusted Types, TrustedHTML, issue 11012 and the source filename found no competing implementation of this failure. Same-file text matches [#9763](https://github.com/adobe/react-spectrum/pull/9763) and [#1260](https://github.com/adobe/react-spectrum/pull/1260) concern overlay visibility and a ComboBox blog post, respectively; their file inventories do not change announcement clearing. Other announcer search results concern announcement order, initial delivery, hidden live regions or dangling label references, not enforced-TrustedHTML clearing. No duplicate closure recommendation or CLA comparison between alternatives is warranted.

The issue reports a failing published version and current source, but supplies no earlier working version or historical transition. Calling the added test a regression test does not establish a user-facing regression. No regression label is proposed.

## Run notes

### Scope and discovery

Window: since previous PR digest commit `91411564faf3c51cda6b8ad61baa8140cd041c09`, `2026-11-20T16:16:11Z`, through final discovery `2026-11-21T16:13:16Z`. Initial gh pr list used the slightly wider `created:>=2026-11-20T16:00:00Z`; paginated open-PR GET discovery then confirmed the exact window.

Both discovery passes covered 129 open PRs in pages of 100 and 29. Only #11013 was in scope; it remained open, non-draft, without ai-reviewed, at head `a0b6e7912c9a9d7e4f6fe34b735a284afe603514`. No member skips or bot exclusions were needed. All five duplicate searches reported incomplete_results false, with totals within the requested page size.

Member status was checked before diffs, checks, issues or review discussions. The author has CONTRIBUTOR association, which is not proof of core membership. The collaborator-permission GET returned HTTP 403, "Must have push access to view collaborator permission"; no CODEOWNERS file exists on origin/main. Membership could not be verified, so normal triage followed.

### Verification boundary and labels

Low-complexity red-flag, issue/source, test-quality, API, duplicate and readiness checks were performed by reading and reasoning only. No PR code, tests, builds, scripts, dependencies or snippets were executed, fetched into the checkout or applied. Contributor-supplied URLs were not opened. No external reproduction was supplied beyond source references and textual instructions.

No changed CI workflow, dependency/script manifest, lockfile, install script or build configuration triggers the mandatory needs-security-review flag. No suspected instruction-changing prompt injection was identified; CI's suggested external CLI command was treated as data and not executed.

Paginated repository-label GETs confirmed all proposed additions exist. No missing labels require creation. Existing labels are preserved. Dry run: all GitHub operations were permitted gh read commands or explicit GET API calls; no GitHub writes, comments, labels, reviews, edits, closures, assignments, gists or PR creation.

### Synchronisation and commit bookkeeping

Verified the existing dedicated checkout `/Users/darobins/dev/react-spectrum-triage`, branch `triage_support`, empty index, no in-progress merge, absent target digest and no other active issue/PR triage run. Live activity checks were repeated before writing.

`git fetch origin` succeeded. The tracked-change check outside .github/triage was empty; `git merge origin/main --no-edit` returned "Already up to date." origin/main `6be3466d87cc628ee69461230c1b5f4e3b64c6e3` is an ancestor of pre-digest HEAD `3af7ef374cd997857e14e129813ff43097023b27`. No merge conflict or skipped synchronisation.

The local setup.md adaptation remains untouched and unstaged. No other checkout was created or used, and no branch was switched.

The oversized prompt/source reads were recovered with bounded reads; one out-of-range prompt continuation failed and was corrected through EOF. A documentation search included a nonexistent packages/react-aria/docs path; the existing packages/dev/s2-docs NumberField pages and source were subsequently searched. Membership HTTP 403 remains an explicit access limitation; no permission control was bypassed.

Only `.github/triage/tmp-digests/triage-prs-2026-11-21.md` is to be staged after another empty-index check, verified as the sole staged file, and committed with `chore: add PR triage digest 2026-11-21` plus the prescribed Copilot co-author trailer. The resulting hash and single-file commit are verified and reported separately, avoiding a self-referential digest edit. Never push.
