# Behavioral verification

This directory keeps models, configurations, source mappings, assumptions, and review metadata. Agents obtain verification tools outside the checkout and follow each package's instructions. Implementation checks stay in the owning package's `test/` directory. Findings, counterexamples, and run results belong in the PR description alongside the source fix and regression tests, rather than in a saved findings archive here.

The local harness standardizes package discovery, tool checks, and execution. Package guides describe contracts, investigation, and correspondence review. The harness does not install tools, change product source, renew review records, or run in CI.

## Quick start

From the repository root:

```sh
yarn verify list
yarn verify status use-press
yarn verify doctor use-press
yarn verify run use-press
# Select checks associated with one property.
yarn verify run use-press --property PointerOwnership
```

`list` and `status` use only Node built-ins, with no dependency installation, Git invocation, Java, browser launch, or network access. They also work as `node verification/cli.mjs <command>`. The original `node verification/status.mjs [package] [--json]` remains supported.

`doctor` checks installed tools for the selected package/checks. For the usePress package, set `TLA2TOOLS_JAR` to the externally acquired, checksum-verified JAR described in its [setup guide](use-press/README.md#agent-tool-setup). Java and the matching browser must already be installed. Browser checks include launching and closing a headless Chromium instance. Corepack network acquisition is disabled when invoking Yarn. Missing tools are errors with setup information, not installation requests performed by the harness.

`run` executes registered checks sequentially and continues independent checks after a counterexample, failed assertion, or missing tool. Each check has a finite timeout; `--timeout-ms 60000` overrides each selected check's budget. Timeout/interruption terminates the runner's process group on Unix (on Windows, only the immediate process is terminated). Ctrl+C preserves completed results and marks remaining checks incomplete. Tool probes have their own 15-second timeouts.

A `--property` filter selects associated checks. Browser tests use the package's property-specific test-name pattern. A shared TLC configuration or regression suite may also check other properties; the report includes both requested and configured properties. No checks are silently dropped to obtain a passing run.

`doctor`, `run`, and `validate` accept `--backend tlc|tla-ts`. TLC remains the default. Selecting `tla-ts` substitutes the checker for each TLA+ model/configuration; implementation checks and property filters remain the same. Only packages registering a pinned `tools.tla-ts` runtime support this option. See [usePress setup](use-press/README.md#optional-tla-ts-backend). The optional backend requires no Java and installs nothing. Both checkers run with one worker and seed 1 in separate processes with per-check timeouts. Reports identify the backend, tool version/checksum, state counts, and commands. Agreement between engines checks compatibility for those models; it does not establish source/model correspondence.

All commands accept `--json`. Execution commands (`run`, `replay`, and `validate`) accept `--output <directory>`, which chooses an external parent directory for a fresh evidence directory. The default parent is the operating system's temporary directory. Output inside the checkout is rejected. Each run retains `results.json`, full per-check logs, runner JSON reports, and TLC state/trace artifacts there. Copy relevant evidence into the response or PR description; do not commit a findings archive. Replay and mutation validation use the commands below.

## Replay a counterexample

When a supported TLC check finds a counterexample, `run` exports `<check>.trace.json` beside its log and prints the path. The model must label each step with `action` and `step`; older unlabeled traces are explicitly unsupported and need a fresh model run.

The optional `tla-ts` backend writes `<check>.json` containing its status, state counts, and full counterexample states (values formatted as TLA+ syntax). Package adapters convert those structured states into the same replay format, preserving backend origin. Errors, unsupported features, deadlocks, and unhandled property kinds are infrastructure failures rather than passes or replayable invariant violations. The initial adapter supports self-contained models using standard modules; external modules/operator overrides are not loaded.

```sh
yarn verify replay use-press --trace /tmp/evidence/ownership.trace.json
yarn verify replay use-press --trace /tmp/evidence/ownership.trace.json --minimize
```

The versioned JSON trace contains `schemaVersion`, `package`, `adapter`, `property`, `initial`, ordered `actions`, and optional `origin` fingerprints. The registered package adapter validates both its schema and supported input ordering. Trace data never supplies executable code or an adapter path. Unknown actions, parameters, versions, or initial conditions are rejected rather than ignored.

The usePress adapter supports one connected target, one activation attempt, two pointer IDs, and 1–8 actions. It replays synthetic pointer/click events, committed prop updates, timer advancement, and unmount against the actual hook in Chromium. `observations.json` captures callbacks, pressed state, timer count, and document listeners after each action, stopping at the first violation of the requested property. A missing pending timer is an unsupported replay, not evidence of a product bug. Synthetic replay does not establish that a browser/device can naturally produce the sequence; usePress's existing trusted mouse/touch ownership test supplies separate corroborating evidence for that case.

Replay reports `reproduced` only when the intended property assertion fails and the observations confirm the corresponding action prefix. It reports `not-reproduced` only after all actions execute without that violation. Unsupported traces, runner failures, incomplete runs, and missing evidence cannot establish either conclusion. Exit codes are 1 for reproduced, 0 for not reproduced, and 2 for unsupported/incomplete/error. A non-reproducing run is not proof of correctness.

Replay copies the input into its evidence directory and records origin fingerprint differences, allowing a counterexample to be tried against a candidate fix. The adapter ID/version must still match. Files changing during execution invalidate provenance. Neither replay nor a passing check renews the correspondence record.

`--minimize` tries single-action deletions that preserve the adapter's input protocol and the same reproduced property failure. It never overwrites the original trace. It writes `minimized.trace.json`, trial evidence paths, and whether minimization completed. `--max-replays <count>` sets a 1–100 trial budget (default 20); each attempt also has the usual per-check timeout. A completed result is minimal under single-action deletion within that protocol, not necessarily globally shortest. Source drift, infrastructure errors, interruption, or budget exhaustion stop reduction and preserve the last confirmed trace.

## Validate check sensitivity

```sh
yarn verify validate use-press
yarn verify validate use-press --property ActivationUnique
```

Validation first runs the selected ordinary checks. For each registered source defect it then runs a targeted clean baseline, the mutation, and a restored clean check in fresh runner processes. The usePress mutations apply only in Vite's source transform; the product file is never overwritten. Each mutation emits a receipt with the source path, mutation ID, and original/mutated hashes. A missing, mismatched, or unchanged receipt cannot count as detection.

Detection requires the same selected tests to pass before/after the mutation, and the mutation to fail at its declared assertion marker. A compilation error, skipped test, different assertion, pre-existing failure, or changed source snapshot cannot count. A failing targeted baseline skips that mutation while preserving its failure. Independent controls continue, and the selected ordinary checks run again at the end. Interrupted restoration is incomplete, not a pass.

usePress registers four defects and runs each against both its existing implementation tests and the new replay assertions. The report separates `detected`, `survived`, `baseline-failure`, `unexpected-failure`, and infrastructure/incomplete outcomes. Properties without a mutation are labeled `not-covered`, or `baseline-failure` when the corresponding implementation test already demonstrates a violation; no permanent expected-bug list is maintained. An unrelated baseline failure does not hide successful sensitivity checks for other properties.

`validation.json` links every baseline, mutation, restoration, receipt, and final check report. Exit 0 requires all selected properties' sensitivity checks and ordinary checks to pass. Existing baseline failures produce exit 1 even when all mutation controls are detected. Undetected/unvalidated controls, missing coverage, drift, or infrastructure problems produce exit 2. No run updates `review.json`.

## Coverage discovery

[usePress](use-press/README.md) is the first registered package. Its [verification.json](use-press/verification.json) is the machine-readable coverage index. `yarn verify list [package]` derives property IDs, contracts, methods, source paths/functions, and bounds from these manifests. `--json` also includes assumptions, exclusions, and transition mappings. Coverage identifies specific behavior, not verification of every function in a file.

Packages are direct child directories containing `verification.json` or a legacy `review.json`; unrelated harness directories are ignored. A new package needs a valid `verification.json` before `list`, `doctor`, or `run` can use it. Status still supports legacy review-only packages.

## Interpret results

Correspondence and check outcomes are independent. The status command never runs verification:

| Status | Meaning |
| --- | --- |
| `MATCHES RECORD` | All listed files match recorded snapshots; this does not establish correctness or a passing verification result. |
| `NEEDS REVIEW` | Covered files changed, are missing, or newly declared coverage is absent from the review record. |
| `NOT RECORDED` | A package has no review record yet. |
| `ERROR` | Metadata is invalid, the package is unknown, or a file cannot be read. |

A run reports each check separately:

| Outcome | Meaning |
| --- | --- |
| `bounded-model-pass` | TLC completed the configured model exploration without an invariant violation, within the stated scope/bounds. |
| `model-counterexample` | TLC reported a named invariant violation. Other properties in that configuration are not certified; replay is still needed. |
| `implementation-checks-pass` | Selected implementation tests completed successfully. This is not exhaustive verification of the implementation. |
| `implementation-failure` | Selected implementation assertions failed. Inspect the evidence and contract before attributing a product bug. |
| `infrastructure-error` | A required tool is unavailable, the runner/report failed, or an error could not be identified as an assertion failure. |
| `inconclusive` | Checks timed out, were interrupted, or selected tests were missing/skipped. |

Execution status, failure details, and test counts accompany these outcomes. Reports fingerprint covered files, the manifest/review record, harness modules, root package manifest, and dependency lock. They also record Node, installed runner/React/browser/tool versions, exact commands, and budgets. A change to fingerprinted files during execution invalidates run provenance. This is a snapshot of listed inputs, not automatic discovery of transitive dependencies or an immutable source checkout. Keep the working tree stable while running checks.

`run` exits 0 when every selected check passes, 1 for model counterexamples or implementation assertion failures, and 2 for invalid setup, incomplete execution, or invalid provenance. Exit 2 takes precedence if failures and infrastructure problems coexist. A zero exit does not renew correspondence: a stale review remains prominently reported. `status` exits 0 for matching records, 1 for review needed/not recorded, and 2 for invalid input/metadata. `doctor` exits 2 if any selected requirement is unavailable.

## Add a package

Create `verification/<name>/verification.json` with `schemaVersion: 1`. Use the usePress manifest as a runnable example. [metadata.mjs](metadata.mjs) validates the format:

- `name`, `description`, and `properties` with unique stable `id` and `contract` fields.
- `sources`: repository-relative `path`, `functions`, property IDs, and a transition/operation `mapping`.
- `bounds`, `assumptions`, and `exclusions` describing the claim's limits.
- `verificationFiles`: models, configs, guides, and implementation checks. The manifest itself is always fingerprinted.
- `checks`: unique `id`, `kind`, property IDs, and `timeoutMs` (1–3600000). TLC checks declare `model` and `config`. Jest/Vitest checks declare `testFile` and `config`; Vitest additionally declares a Chromium `browser` and `project`. Optional `testNamePatterns` must map every property of that check to a regex.
- TLC packages supply `tools.tlc` with `version`, external `jarEnv`, pinned `sha256`, `minimumJavaVersion`, and `acquisition` instructions. Other checks use the repository's installed Yarn dependencies.
- Optional `tools.tla-ts` supplies `version`, external `directoryEnv`, `sha256`, and `acquisition`. The checksum covers `package.json` and every file recursively under `dist`, including imported chunks, using `runtimeHash` in `tla-ts.mjs`. Doctor verifies the external runtime without executing it; the worker verifies it again before importing it. Changes to the pin require an explicit tool review.
- Optional `mutationEnvironment` lists variables that must be unset for normal runs, preventing manual negative-control settings from contaminating a baseline run.

Optional `replay` metadata declares a registered Vitest `check`, `testFile`, `testNamePattern`, registered adapter module, stable `adapterId`, and distinct `traceEnvironment` / `resultEnvironment` names. The module exports `validateTrace` and `fromTLC`; adapters supporting replay mutation controls also export `createTrace(property, actions)`.

Adapters supporting the optional backend also export `fromTlaTS(report, property)`. Unknown states/action labels must be rejected rather than guessed. Replay itself is backend-independent and needs only the exported trace and implementation-test tools.

Optional `validation` metadata declares its Vitest `check`, covered `source`, mutation `environment` (also listed in `mutationEnvironment`), `receiptEnvironment`, and `mutations`. Each mutation has an `id`, covered `property`, `testNamePattern`, and a distinct intended `failureMarker`. Optional `replayActions` validates the replay assertion with the same defect. Normal runs reject inherited mutation, receipt, and replay variables; workflows set them only for their child processes.

Keep implementation tests in their owning package's test directory. Declare every model/config/test path in `verificationFiles`; explicitly register relevant setup files and shared dependencies. Metadata does not establish correspondence by itself. Check method, input domain, independent oracle, and negative-control instructions belong in the package guide. The check adapters support TLC, Jest, and Chromium Vitest; other methods can add adapters later.

## Review records

Each package's `review.json` records a `schemaVersion` (currently 1), `reviewedAt` date, `reviewedCommit`, a correspondence-review `note`, and two maps from repository-relative paths to SHA-256 hashes:

- `sourceFiles`: covered implementation and explicitly covered shared dependencies.
- `verificationFiles`: model, configuration, specification/assumptions, and implementation checks used for verification.

Keep both groups nonempty. Fingerprints refer to exact working-tree bytes, so they include staged, unstaged, and untracked file contents; even a comment-only edit requires review. A snapshot does not imply a file is committed. Hashes do not identify unlisted dependencies, discover new coverage, or prove semantic correspondence. Register new covered dependencies explicitly in `verification.json` and the review record.

To inspect an individual file's hash:

```sh
node --input-type=module -e "import {readFileSync} from 'node:fs'; import {createHash} from 'node:crypto'; console.log(createHash('sha256').update(readFileSync(process.argv[1])).digest('hex'))" packages/react-aria/src/interactions/usePress.ts
```

Update the manifest manually only after reviewing the diff, confirming the mapping/assumptions, and running the appropriate checks and negative controls. A passing tool run must not automatically renew correspondence. Record a concise review reason, including whether covered source has uncommitted changes. The review record contains no pass/fail history or finding list. Run `status` again after updating it.

For another target, add its actual properties, source mapping, bounds, tool acquisition/rerun instructions, and review record. Choose the tool for that target; TLA+ and browsers are not required for every package.

Harness tests run without external tools:

```sh
yarn test:verification
# Or, without Yarn/dependencies:
node --test verification/test/*.test.mjs
```

After changing adapters or package commands, also run the affected package with its installed tools and inspect the reported outcomes. A real counterexample can be the correct harness result. Harness tests use temporary fixtures and subprocesses; they need no Java, browser, or network. Format with `yarn format verification package.json` and lint with `yarn exec oxlint verification`.
