# PR triage digest — 2026-11-03

> Presentation-only revision of the original digest. This is not fresh triage: findings, labels, comments and closures remain historical proposals, not executed actions or current authorization.

## At a glance

- 1 PR assessed in the original run; these are historical recommendations, not fresh readiness checks.
- No analyzed PR was judged ready; concrete author blockers and unresolved maintainer direction remain historical findings.

## Analyzed PRs

### [#10910](https://github.com/adobe/react-spectrum/pull/10910) — Experimental verification harness

**Decision:** Keep the DNM experiment on hold for adoption/ownership direction; title lint and author evidence also remain.

**Complexity:** High

**Impact / severity:** Not assessed in the original run

**Merge risk:** High

#### What matters

- This new toolset adds dependency/configuration/instrumentation exposure requiring security review.
- Existing green contexts do not establish successful harness validation or model/instrumentation safety.

#### Would have done

**Labels (proposed)**

- would apply `merge-risk: high` for broad new tooling, dependency/configuration exposure and unresolved adoption
- would apply `ai-reviewed` because this revision's scoped triage and gaps are recorded
- would apply `needs decision` for whether to adopt the harness and assign model-maintenance ownership
- would apply `on hold` pending that decision, coordinated by reidbarber
- would apply `waiting for author` for failed title lint and missing explicit local results/contributor confirmation.
- Would remove none: current label set is empty.
- Of these proposed labels, only `on hold` exists in the paginated repository label inventory
- `merge-risk: high`, `ai-reviewed`, `needs decision` and `waiting for author` would need creation.
- Would not substitute the existing `waiting on author` for the rule's exact spelling.


**Maintainer next step**

- **Historical proposal:** would not close; would link #10786 for methodology and #10787 for shared root-tooling integration.
- **Historical proposal:** would escalate adoption/model-maintenance ownership to reidbarber and request team security review of tooling/dependency changes; would make no assignment.
- No automated comment was proposed; any explicitly optional comment remains optional in the appendix.

## Evidence and verification appendix

### #10910 — Evidence and verification

[PR](https://github.com/adobe/react-spectrum/pull/10910), reviewed revision `6dc6cb2552f498e8723066f76df9c56771b49fc1`. **High complexity:** a new developer toolset spanning 36 files, 6,082 additions and five deletions, including root scripts, dependency/lockfile changes and browser instrumentation.

New feature scope takes precedence over the medium-complexity test-infrastructure example; this is not a small review.


The harness models stateful RAC behavior with TLA+, checks bounded model/code conformance, and replays counterexamples against real targets in Chromium. It supplies seven targets and four formal models, but the author explicitly presents adoption as an undecided experiment rather than an agreed merge candidate.



#### API and compatibility

the [file list and diff](https://github.com/adobe/react-spectrum/pull/10910/files) contain no production package source changes. `package.json:68` expands lint to `oxlint packages verification`; the scripts hunk adds `verify` and `test:verification`, and the dependency hunk adds pinned development dependency `tla-ts: "0.0.3"`. `tsconfig.json:46-52` includes `verification`, while its exclusion hunk excludes `verification/targets.config.ts` because of Playwright CDP types and the imported browser config.

These change contributor tooling, not shipped component props, exports, defaults, events, DOM structure, classes, data attributes or CSS variables on the available evidence.

Would not apply `needs API review` for library API changes.



#### Needs security review

would escalate the new dependency and lockfile, root script/lint changes, browser configuration and instrumentation before merge. [Evidence](https://github.com/adobe/react-spectrum/pull/10910/files): `package.json` adds `tla-ts`, `yarn.lock` adds its resolution and CLI binary, and `verification/instrumentation.ts:15-16` says "Private-state probes are injected only by the verification Vite config.

Production modules and public exports are unchanged." That config installs the plugin at `verification/targets.config.ts:38`; this boundary is an author/code claim requiring review, not a verified safety guarantee.

This is the mandated tooling-change flag, not a vulnerability finding. No dependency or harness was executed.



#### Direction and readiness evidence

the [body](https://github.com/adobe/react-spectrum/pull/10910) says "I'm still not sure if this is something we definitely want" and "this doesn't run in CI"; the title begins `[DNM]`. Would apply `needs decision`: should the team adopt and maintain this bounded formal-model/replay toolset, and who owns keeping models aligned with implementation?
Would apply `on hold`, with reidbarber coordinating that decision. DNM does not make a GitHub non-draft PR out of scope, but it does preclude ready-for-review status here.


The [checks](https://github.com/adobe/react-spectrum/pull/10910/checks) report Adobe CLA SUCCESS and `Lint PR Title` FAILURE. The [title-lint job](https://github.com/adobe/react-spectrum/actions/runs/41556642145/job/125657039451) GET confirms the failed step is "Check PR Title"; would require the author to resolve it without silently removing their DNM intent.

The body leaves local-testing/results, contributor-understanding and release-impact checklist items unchecked. It links harness instructions; the diff includes `verification/test/explorer.test.mjs` and `verification/test/model.test.mjs`, so tests are present, but no successful execution of `test:verification` is established by the returned checks or body.

Existing green CircleCI contexts on this SHA date from October 29, before PR creation; would not equate them with validation of this newly described workflow. No full low-complexity red-flag, integration-test or accessibility review was performed, per step 1.



#### Duplicates

would not close #10910 or draft a duplicate notice. Searches across open and closed PRs/issues covered "Verification harness", verification titles, "model checker", "model checking" and "TLA"; the broad `verification/` text search was noisy and capped at 50, so it was supplemented with focused searches and direct related-PR comparisons.
No same-purpose replacement was identified.


- [#10786](https://github.com/adobe/react-spectrum/pull/10786), open, CLA SUCCESS, is the stated inspiration: its body describes finding and fixing component bugs via counterexamples, and its 30 changed files are production fixes, tests and stories, not a reusable `verification/` harness. Would retain both as complementary work and link #10786 for the methodology discussion, not select a duplicate winner.
- [#10787](https://github.com/adobe/react-spectrum/pull/10787), open, CLA SUCCESS, adds a performance benchmark suite under `perf/`. Its body focuses on production Chromium latency/scrolling measurements; #10910's `verification/README.md:23` explicitly says it does not check rendering, layout, styling or performance.
- Shared `.oxlintrc.json` and `package.json` edits are integration overlap, not duplicate behavior. Would retain both and link #10787 for root-tooling coordination.

Both related candidates have signed CLAs, as does #10910, so the CLA preference does not choose a winner. No linked issue claims to close a reproduction; the self-contained tool proposal explains the problem sufficiently for initial triage, without inventing a missing bug issue.

#### Original confidence and decision-changing evidence

high on not-ready status, medium on merge risk and non-duplication because implementation review is deliberately limited and no code or dependency was executed. An agreed adoption/ownership decision, resolved DNM/title check, documented successful harness validation and completed security review would change readiness and risk.

#### Original summary caveats

DNM experiment; adoption undecided; title lint fails; needs security review



#### Historical action and comment detail (not executed)

#### Readiness rationale
Would have added `ready for review`: no. Missing team adoption/ownership direction, resolution of DNM intent and failed title lint, explicit local validation results/contributor confirmation, and required security review of dependency/configuration changes.

CLA is signed, instructions and harness tests exist, and GitHub reports non-draft.
#### Historical close / link proposal
would not close; would link #10786 for methodology and #10787 for shared root-tooling integration. Neither is a duplicate replacement, so none would be kept in preference to another.
#### Historical other proposal
would escalate adoption/model-maintenance ownership to reidbarber and request team security review of tooling/dependency changes; would make no assignment. No `small review`, `regression`, `patch worthy` or library `needs API review` proposal on this evidence.
- **Historical comment proposal:** no comment.

## Run notes

The following records the original run, including its operational history and policy feedback; it does not describe actions taken during this presentation-only revision.

Read-only GitHub draft. All actions are proposals, not applied.
- Branch: `triage_support`, dedicated checkout `/Users/darobins/dev/react-spectrum-triage`. Initial index empty, no merge in progress, and no other active triage session observed; overlap status rechecked before writing.
- Existing local `.github/triage/setup.md` adaptation remains untouched and unstaged.
- Synchronization: `git fetch origin` succeeded. `git merge origin/main --no-edit` succeeded with "Already up to date." Main incorporated: `6dec77beccf0545a04318e6a01b8eb9cbe2dccc6`.
- Scope: open, non-draft, non-bot PRs without `ai-reviewed`, created since the previous PR digest commit at `2026-11-03T00:06:14Z` (November 2, 16:06:14 PST), through `2026-11-03T16:14:21Z`. Exact timestamp search and a recent-open-PR GET cross-check identify only #10910. #10911 is excluded as a draft; #10908 and #10901 precede the cutoff and were in the previous digest.
- Method: only `gh pr list/view/diff`, `gh issue list`, `gh search`, and explicit GET API calls. No PR checkout, patch application, contributor URL retrieval, installation, code execution, GitHub write, or push.
#### Rule feedback


- Scope uses the previous PR digest commit timestamp rather than a rolling 24 hours, as expressly allowed; older unlabeled PRs are not re-triaged. A first query used unsupported `is:draft=false` syntax and returned no candidates; its result was discarded, and `-is:draft` plus REST draft flags confirmed the final scope.
- A `gh search prs` attempt with embedded repository qualifiers failed with "Invalid search query" because the CLI interpreted the supplied string incorrectly. Retrying with `--repo adobe/react-spectrum --match title` succeeded.
- No required search remained blocked; the failed attempt is reported rather than hidden.
- New developer tooling is classified high under "new features" despite the medium "new test infrastructure" example. Only scoped classification, summary, compatibility, duplicate and readiness checks were done; no full low-complexity red-flag review or security audit was performed.
- Treat DNM and the author's undecided adoption as a hold even though GitHub reports non-draft. The decision needing maintainer feedback is adoption/maintenance responsibility, not whether a specific reported bug should be fixed.
- The mandated "needs security review" flag is recorded as an escalation, not invented as an exact label absent from step 6. Root lint/type inclusion and documented type exclusions are noted as tooling compatibility changes without claiming a complete disabled-check audit.
- Proposed label spellings are preserved even when absent from the repository. `on hold` and `waiting for author` represent separate team and author blockers; the maintainer should confirm whether both are desirable.
- Test quality, formal-model fidelity, instrumentation isolation, dependency safety and browser behavior were not established by execution. No contributor-supplied README URL, external model-checker URL or repro was opened; evidence came from permitted GitHub GET diff patches and reported check state.
#### Feedback for #10910

#10910: review whether a non-draft DNM tooling experiment should receive both `on hold` for adoption and `waiting for author` for concrete readiness gaps.
