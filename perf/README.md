# Performance benchmarking

Performance benchmarks should measure things users experience: how quickly components appear, how promptly interactions update the screen, and how smoothly collections scroll. Useful measurements require representative workloads in realistic environments, using production builds in a real browser. This captures the combined cost of React Aria, React, and the browser's rendering work, helping us judge whether an optimization improves the experience for users.

This suite uses production React and React Aria, built with Parcel and performed in Chromium via Playwright. It is intended for local use, and has no CI integration at the moment. All results are written to `perf/.local/` (git ignored).

## Quick start

Use the repository's installed dependencies. Install the matching full Chromium browser once if it is missing:

```sh
yarn playwright install chromium
yarn perf build --name baseline
yarn perf run --build baseline --scenario listbox --blocks 2 --samples 1 --warmup 0
```

The short run just verifies the setup. For a normal run, omit the sample overrides. `yarn perf list` lists all actions and `yarn perf --help` lists options.

## Comparing a change

1. With the benchmark harness present on the baseline source, run `yarn perf build --name baseline`.
2. Make or apply the library change, keeping the benchmark harness and dependency versions the same.
3. Run `yarn perf build --name candidate`.
4. Run `yarn perf compare --base baseline --candidate candidate`.

Builds are immutable named snapshots. Choose a new name for another investigation. The comparison never rebuilds a snapshot or edits your working tree. It alternates base/candidate order on the same machine. Do not compare reports from separate times/machines.

```sh
# Focus on a particular PR's affected operations.
yarn perf compare --base baseline --candidate candidate --scenario listbox.focus,table

# Compare a build with itself to inspect noise.
yarn perf compare --base baseline --candidate baseline

# Separate CPU-slowdown experiment (not an emulated phone).
yarn perf compare --base baseline --candidate candidate --cpu 4

# Larger workload; changes collection/control counts, not viewport size.
yarn perf compare --base baseline --candidate candidate --scale 2

# Record diagnostic Chrome traces after all measurement trials finish.
yarn perf compare --base baseline --candidate candidate --scenario table.scroll --trace
```

Snapshots record the git SHA, dirty state and tracked diff hash, dependency lock hash, actual React/Parcel/Playwright versions, harness hash, and bundle hash. The bundle graph must contain production React DOM and React Aria/RAC/Stately source from this checkout. Runtime checks also verify React version and production mode. Comparisons reject mismatched harnesses or dependencies and modified bundles. Source edits are reflected in the immutable bundle hash; a dirty snapshot is not reproducible from its git SHA alone, particularly for untracked source files.

If a dependency or benchmark change is necessary, rebuild **both** snapshots under the same new environment. For an older baseline branch without this suite, apply the same harness there before building; the runner intentionally leaves branch management to you.

## Workloads

| Fixture | Default data | Measured actions |
| --- | --- | --- |
| ListBox | 100 items with labels, team, and status | Mount, arrow-key focus, selection, unrelated parent update |
| ComboBox | 500 local options | First open per component instance; type `99` with a 75 ms pause between keys |
| Virtualized table | 10,000 records × six columns, fixed 40 px rows | Mount, 12 wheel steps of 160 px with 32 ms pauses, update one visible record |
| Form and dialog | 30 mixed text fields, checkboxes, and switches | Mount, controlled field keypress, dialog opening and autofocus |

The table retains unchanged record identities on a one-record update. The suite verifies virtualization and checks that scrolling exposes the expected row. Every measured action has an explicit semantic completion condition; failures/timeouts invalidate the run rather than being discarded as outliers. Browser runtime/console errors also fail the run.

Each scenario gets a new browser context and page in each block. Before every trial, the fixture is unmounted and recreated in the same document; setup, fonts, and prerequisite interactions settle outside the measurement window. Default warmups exercise the same action and are discarded. These are **warm browser/module-cache measurements on fresh component instances**. There is no claim that a component's first-ever execution is represented. Datasets and all fixture modules are already loaded, local, and deterministic. The filtering, data update, React work, and browser work caused by the action are included.

The basic styling intentionally includes real layout and focus/selection styles without animations or remote fonts. It is not a Spectrum design-system benchmark. Hydration, loading, memory retention, variable-height rows, and cross-browser timing are future additions, not covered by these results.

## What the numbers mean

- **`ready`**: initiating trusted browser event timestamp → first observation of the correct semantic DOM/focus state. A MutationObserver and focus listener observe updates; a frame loop also checks completion. This is not React render duration or paint time.
- **`opportunity`** (default comparison metric): initiating event → two animation-frame callbacks after semantic readiness. This gives the browser a rendering opportunity, but **does not prove pixels were presented**. Frame alignment adds noise and a floor. Read it alongside semantic readiness and diagnostic traces.
- **Event Timing**: raw browser event durations, input delays, processing times, and interaction IDs. Entries are grouped by interaction ID for observed maxima. Ordinary entries below the API's reporting threshold may be absent, and durations are quantized. Missing entries stay missing; the report shows coverage and does not compute a biased percentile from only slow entries. These are scripted interactions, not field INP.
- **`frameP95`** (scroll comparison metric): the 95th percentile of animation-frame callback intervals during one scroll trial. The report compares medians of those per-trial values. This is **main-thread frame-callback cadence**, not compositor-delivered frames or a dropped-frame count. Each trial must collect at least ten intervals. Raw intervals and the worst interval are retained. The wheel loop's wall-clock duration is not a score.

Browser timestamps exclude Playwright locator/actionability polling. The filtering action's completion duration includes the intentional typing cadence and all work through the final result, while Event Timing entries describe individual qualifying interactions. Assertions and collecting results happen outside the measurement window. Timed trials do not record traces or use React profiling builds. `--trace` runs separate diagnostic passes and writes Chrome-compatible JSON traces; open them in Chrome DevTools Performance.

## Repetition and interpretation

Defaults: eight independent Chromium launches, five measured trials per scenario per launch, two discarded warmups. Base/candidate order is balanced across launches; scenario order rotates. A fixed seed controls initial scenario order and short gaps between launches. Runs are serial with no concurrent builds.

Reports include absolute and relative changes, raw observations, browser/machine metadata, and paired block-bootstrap intervals. The bootstrap resamples whole browser-launch blocks, retaining the pair and within-block observations. Fewer than six blocks always produce an inconclusive verdict regardless of the number of inner trials. Forty trials are not enough to make strong population-tail claims: there is no p95 interaction-latency verdict.

The default practical threshold is the larger of 8 ms or 5% for completion, and 2 ms or 5% for scroll frame intervals. These are **exploratory starting values, not calibrated budgets**. Override them with `--absolute-threshold`, `--relative-threshold`, and `--frame-threshold` after calibration on your machine. An interval must lie entirely beyond the practical threshold to report an improvement/regression, or entirely within it to report “within practical threshold”; other cases are inconclusive. Multiple scenario comparisons are exploratory and are not adjusted for family-wide false positives. Confirm a suspected result in another paired run and inspect the affected interaction before making a merge decision.

Use the same machine and power settings, close heavy workloads, and avoid running builds alongside benchmarks. Headless full Chromium is the default; `--headed` is useful for inspection but requires keeping the window foreground. Browser versions, modes, CPU slowdown profiles, and hardware are not interchangeable. CPU throttling does not reproduce mobile hardware or eliminate shared-machine noise.

## Validate the measurement system

```sh
yarn test:perf
yarn tsc --project perf/tsconfig.json --noEmit
yarn perf calibrate --build baseline
```

Calibration produces four paired ListBox-mount reports using the same build: A/A; an added 40 ms synchronous delay; a 40 ms deferred update; and 40 ms of forced-layout work. The deferred case checks that completing the requested result is measured even when the initial event is responsive. Inspect A/A noise and whether the injected effects are detected; calibration does not claim your hardware is stable or set thresholds automatically. Sample overrides can smoke-test calibration, but fewer than six blocks cannot establish confidence. These are harness checks, not substitutes for investigating actual component regressions.

Tests cover missing/censored observations, interaction grouping, drift within paired blocks, insufficient independent samples, practical thresholds, incomplete runs, and statistics. The production browser smoke run exercises each scenario's actual actions and completion checks.

No results need to be committed. Remove obsolete subdirectories of `perf/.local/builds/` or `perf/.local/results/` whenever they are no longer useful.
