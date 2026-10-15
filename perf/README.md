# Performance benchmarking

Performance benchmarks should measure things users experience: how quickly components appear, how promptly interactions update the screen, and how smoothly collections scroll. Useful measurements require representative workloads in realistic environments, using production builds in a real browser. This captures the combined cost of React Aria, React, and the browser's rendering work, helping us judge whether an optimization improves the experience for users.

This suite uses production React and React Aria, built with Parcel and performed in Chromium via Playwright. It is intended for local use, and has no CI integration at the moment. All results are written to `perf/.local/` (git ignored).

## Quick start

Use the repository's installed dependencies. Install the matching full Chromium browser once if it is missing:

```sh
yarn playwright install chromium
yarn perf smoke
```

`yarn perf smoke` checks the setup and the whole suite: it builds a throwaway production snapshot of the working tree, runs every scenario once as an A/A comparison (2 browser launches, 1 warmup and 1 measured trial per arm), and removes the snapshot afterward. It passes only if every action reaches its completion condition, its assertions hold, and the report is generated; the results directory is kept. It takes a few minutes. Pass `--build <name>` to check an existing snapshot instead, or `--scenario` to check only some scenarios. Smoke results are far too small to compare anything. `yarn perf list` lists all actions and `yarn perf --help` lists options.

## Comparing a change

1. With the benchmark harness present on the baseline source, run `yarn perf build --name baseline`.
2. Make or apply the library change, keeping the benchmark harness and dependency versions the same.
3. Run `yarn perf build --name candidate`.
4. Run `yarn perf compare --base baseline --candidate candidate`.
5. If a scenario reports an improvement or regression, confirm it before relying on it: `yarn perf confirm --results <results id> --runs 2`, where the results id is the directory name printed at the end of the comparison.

Builds are immutable named snapshots. Choose a new name for another investigation. The comparison never rebuilds a snapshot or edits your working tree. It alternates base/candidate order on the same machine. Do not compare reports from separate times/machines.

```sh
# Focus on a particular PR's affected operations.
yarn perf compare --base baseline --candidate candidate --scenario listbox.focus,table

# Collection data changes, controls in table cells, and popup navigation.
yarn perf run --build candidate --scenario table-data,table-cells,combobox.keyboard,combobox.hover,select

# Exercise the two new table fixtures with 500 rows instead of 100.
yarn perf run --build candidate --scenario table-data,table-cells --scale 5

# Measured row heights, collection mutations, and nested collections.
yarn perf run --build candidate --scenario variable,collection,tree

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
| ComboBox | 500 local options with an inline icon, label, and description | First open per component instance; type `99` with a 75 ms pause between keys; arrow-key and pointer navigation |
| Select | Same 500 rich options as ComboBox | Arrow-key and pointer navigation in an open popup |
| Sortable/filterable table | 100 nonvirtualized records × six columns | Reverse the numeric name sort; type `9` to filter; clear with Backspace to restore all rows |
| Interactive table | 100 nonvirtualized records × six columns, with selection checkboxes, menus, and dialogs | Select one/all rows; open and dismiss a cell menu; open and close a cell dialog |
| Virtualized table | 10,000 records × six columns, fixed 40 px rows | Mount, a 4,000 px wheel scroll at 2,000 px/s, update one visible record |
| Variable-height ListBox | 10,000 records with wrapping descriptions of three different lengths | Mount, the same 4,000 px wheel scroll, narrow from 600 to 360 px and remeasure rows |
| Mutable GridList | 100 records, plus a prepared 50-record next page and a replacement dataset | Append a page, delete five selected records, switch datasets |
| Tree | 20 projects with 50 files each | Expand a project, navigate into its first file, collapse the project |
| Resizable table | 500 nonvirtualized records × six flexible columns | Mount, narrow the container from 960 to 660 px as when opening a side panel |
| Form and dialog | 30 mixed text fields, checkboxes, and switches | Mount, controlled field keypress, dialog opening and autofocus |

The table retains unchanged record identities on a one-record update. The suite verifies virtualization and checks that scrolling exposes the expected row. Scrolling uses Chromium's synthesized mouse-wheel gesture (`Input.synthesizeScrollGesture`), so the browser generates a steady stream of trusted wheel events at its own frame cadence; Node timers and protocol round trips do not shape the input or leave idle gaps that hide jank. Each scroll must reach 4,000 px, receive a wheel stream, and collect frame intervals spanning at least 90% of the two-second gesture, however many frames were missed. Every measured action has an explicit semantic completion condition; failures/timeouts invalidate the run rather than being discarded as outliers. Browser runtime/console errors also fail the run.

The resizable table keeps its data and table element stable while its container narrows, exercising the browser's ResizeObserver and React Aria's column layout updates. Completion waits for the column width styles to update; assertions then verify all six columns' actual widths and that the rows remain present.

`table-data.sort`, `.filter`, and `.clear` operate on an already-mounted table. Sorting and filtering retain the original record objects. Completion requires the entire expected sequence of row IDs and the correct sort direction, with row text checked afterward. Clearing starts from the filtered view and measures restoring the full collection. The application-side filter/sort work is included; these cases do not replace records with fresh objects.

`table-cells.select` and `.select-all` wait for both row selection and checkbox state. `.menu` and `.dialog` wait for focus inside the overlay, while `.menu-close` (Escape) and `.dialog-close` (Close button) wait for overlay removal and focus restoration to the originating cell button. The full table remains mounted behind the overlay.

`combobox.keyboard`, `combobox.hover`, `select.keyboard`, and `select.hover` start with an open popup and its first option focused. Each trial measures one move to the second option. Completion requires the new focus styling and either the ComboBox input's matching `aria-activedescendant` or actual DOM focus for Select. Pointer navigation starts at the trusted `pointerover` timestamp; target coordinates are resolved before timing. Hover is not an Event Timing interaction and is not included in interaction/INP claims. These are discrete option transitions, not a continuous pointer-sweep score.

The ComboBox now shares the richer option content with Select, including for its existing open/filter scenarios. Rebuild both snapshots when comparing with this version of the harness.

`variable.mount`, `.scroll`, and `.resize` use `ListLayout` with an estimated row height and item size observation. The browser determines the actual heights from wrapping text. Layout readiness requires three consecutive animation-frame samples with unchanged visible geometry: visible rows must have different heights, fill the viewport in order without gaps or overlap, fit their allocated wrappers, and occupy the requested width. DOM ordering and offscreen row recycling do not affect this comparison. Only a virtualized subset may be rendered. Geometry is sampled once per frame after the action's other conditions hold; this bounded instrumentation and settling interval are included in the score. The usual two-frame rendering opportunity follows, and the layout must still match when results are collected.

The variable-height resize starts at the top and preserves the first record while its description reflows. Scrolling uses the same 4,000 px wheel gesture as the fixed-height table and also requires a complete settled viewport. Its primary score remains frame-callback cadence, including the final layout settling frames. Raw results retain the final row geometry and input-event count.

`collection.append` adds half the initial record count while preserving existing objects and selection. `.remove` starts with the first five records selected and focus on the fifth; Delete must remove those records, clear selection, and focus the next surviving record. `.replace` switches to fresh records with different keys, clears the previous selection, and retains focus on the switch button. Completion verifies the whole item sequence, and assertions verify labels. Payloads are prepared before mounting, so these scenarios measure applying already-available data rather than network latency or data generation.

`tree.expand` uses ArrowRight on the first project, `.navigate` uses ArrowDown on that already-expanded project to focus its first file, and `.collapse` uses ArrowLeft on the expanded project. Completion verifies every exposed row in order, the parent's expansion state, and keyboard focus. The tree is nonvirtualized, with all data already available. `--scale` increases files per project and the collection/page sizes; the deletion batch stays at five records.

Each scenario gets a new browser context and page per arm in each block, and both arms' pages stay open while their trials alternate. Before every trial, the fixture is unmounted and recreated in the same document; setup, fonts, and prerequisite interactions settle outside the measurement window. Default warmups exercise the same action and are discarded. These are **warm browser/module-cache measurements on fresh component instances**. There is no claim that a component's first-ever execution is represented. Datasets and all fixture modules are already loaded, local, and deterministic. The filtering, data update, React work, and browser work caused by the action are included.

The basic styling intentionally includes real layout and focus/selection styles without animations or remote fonts. It is not a Spectrum design-system benchmark. Hydration, network loading, memory retention, and cross-browser timing are future additions, not covered by these results.

## Adding a scenario

List the action in `scenarios.mjs` (ID, fixture, label, and optional metric), then add its driver in `drivers.mjs` under the fixture's `actions`. A driver declares an optional unmeasured `prepare`, the `spec` armed in the page (input event, target, key, scroll distance and speed, and completion conditions), and an optional `verify` that runs after measurement. The runner sends the measured input described by `spec`; use `input` only when an action needs a custom input sequence. `yarn test:perf` checks that every scenario has a driver and that each spec is serializable. Then run `yarn perf smoke --scenario <id>` to check the new scenario in the browser.

## What the numbers mean

- **`ready`**: initiating trusted browser event timestamp → first observation of the correct semantic DOM/focus state. A MutationObserver and focus listener observe updates; a frame loop also checks completion. Conditions that read layout (scroll position or variable-height geometry) are checked only by the frame loop, so the check never forces synchronous layout during the action. This is not React render duration or paint time.
- **`opportunity`** (default comparison metric): initiating event → two animation-frame callbacks after semantic readiness. This gives the browser a rendering opportunity, but **does not prove pixels were presented**. Frame alignment adds noise and a floor. Read it alongside semantic readiness and diagnostic traces.
- **Event Timing**: raw browser event durations, input delays, processing times, and interaction IDs. Entries are grouped by interaction ID for observed maxima. Ordinary entries below the API's reporting threshold may be absent, and durations are quantized. Missing entries stay missing; the report shows coverage and does not compute a biased percentile from only slow entries. These are scripted interactions, not field INP.
- **Long animation frames (LoAF)**: frames of at least 50 ms that overlap the measurement window, with the time spent in script, style and layout, and forced style and layout, plus the event, callback, or timer that ran each script of at least 5 ms. This attributes slow interactions to their cause; fast interactions have no long frames, and those trials are reported as having none rather than as zero cost. Raw frames and script attribution are kept in results.json. Script sources are minified production code, so use `--trace` for function-level detail.
- **`frameMean`** (scroll comparison metric): the mean animation-frame callback interval during one scroll trial, i.e. the scroll's elapsed time per frame callback. Each late frame raises it in proportion to the time it lost, so it tracks how many frames the main thread delivered without jumping between whole frame periods the way a tail percentile does. The report compares medians of the per-trial values. This is **main-thread frame-callback cadence**, not compositor-delivered frames. A two-second scroll yields roughly 120–240 intervals per trial, depending on the display rate. Raw intervals are retained. The gesture's wall-clock duration is not a score.
- **rAF interval p95** (supporting): the per-trial 95th-percentile interval, reported as a median. It shows whether late frames exist, but because intervals cluster at whole frame periods it jumps between periods once a few frames are late, which made it a noisy comparison metric. The worst interval is also reported.
- **DOM mutations** (supporting): mutation records observed from the input until the rendering opportunity, with nodes added plus removed. Counts barely vary between trials, so a difference between arms shows that the DOM work changed even when times are within noise. They do not capture work that never reaches the DOM, such as re-renders that produce the same output.
- **Missed frames** (supporting): per trial, each rAF interval spanning *n* frame periods counts *n* − 1 missed frames, using the trial's median interval as the period. It estimates main-thread jank during the scroll; it is not a compositor dropped-frame count.

Browser timestamps exclude Playwright locator/actionability polling. The filtering action's completion duration includes the intentional typing cadence and all work through the final result, while Event Timing entries describe individual qualifying interactions. Assertions and collecting results happen outside the measurement window. Timed trials do not record traces or use React profiling builds. `--trace` runs separate diagnostic passes after all measurement and writes Chrome-compatible JSON traces; open them in Chrome DevTools Performance. Each traced trial follows the same warmups as the measured trials, and the page adds User Timing measures, `bench:window` (input to rendering opportunity) and `bench:ready` (input to semantic readiness), so the Timings track shows exactly what the score covered. Measured trials never add these measures. The report's **Diagnostic traces** table splits the renderer main thread's time inside `bench:window` into script, style, layout, paint, GC, and other work, attributing each moment to the innermost trace event covering it as DevTools does for self time, and shows how much style and layout script forced synchronously. This helps explain a result whose score did not move even though the work changed, or the reverse. A trace failure or interruption is listed in the report and does not invalidate the completed measurements.

## Repetition and interpretation

Defaults: eight independent Chromium launches, five measured trials per scenario per launch, two discarded warmups. Within each launch, base and candidate trials alternate in ABBA order (AB, BA, AB, …) on side-by-side pages, so drift within a launch affects both arms alike. Which arm leads alternates between launches, so comparisons require an even `--blocks`. A fixed seed controls the scenario order within each launch (a fresh shuffle per launch, so every scenario runs at different positions), which arm leads, and the short gaps between launches. Runs are serial with no concurrent builds.

Reports include absolute and relative changes, raw observations, browser/machine metadata, and paired intervals. Each launch is compared with itself: its change is the candidate's median trial minus the base's median trial, so drift between launches cancels. The reported change is the Hodges–Lehmann estimate (the median of pairwise averages) of those per-launch changes, and the interval is the exact, distribution-free Wilcoxon signed-rank interval at the smallest achievable confidence of at least 95% (96.1% for eight blocks), shown next to the interval. Launches, not trials, are the independent observations. Fewer than six blocks cannot reach 95%, so they always produce an inconclusive verdict regardless of the number of inner trials. In simulations with heavy-tailed noise, these intervals excluded zero in A/A data at or below their nominal rate both with and without drift between launches; the earlier pooled-trial bootstrap was too narrow without drift (7–10% at a nominal 5%) and too wide with it. Forty trials are not enough to make strong population-tail claims: there is no p95 interaction-latency verdict.

The default practical threshold is the larger of 8 ms or 5% for completion, and 0.25 ms or 5% for the scroll mean frame interval. For scrolling, the 5% term is the one that applies at ordinary display rates (about 0.42 ms at 120 Hz, 0.83 ms at 60 Hz): a 5% higher mean interval means roughly 5% fewer frames delivered, about one frame in twenty. In A/A comparisons with the default 8 blocks (Apple M2 Max, Chromium 143 headless), the interval of the scroll change stayed within 0.05 ms at 1× CPU and 0.27 ms (3.0%) at 4× CPU, all within threshold. Completion thresholds are **exploratory starting values, not calibrated budgets**, and the scroll calibration is from one machine. Override them with `--absolute-threshold`, `--relative-threshold`, and `--frame-threshold` after calibration on your machine. An interval must lie entirely beyond the practical threshold to report an improvement/regression, or entirely within it to report “within practical threshold”; other cases are inconclusive. Multiple scenario comparisons are exploratory and are not adjusted for family-wide false positives. Confirm a suspected result in another paired run and inspect the affected interaction before making a merge decision.

Compare reports include a **Changes by browser launch** table: each launch's paired change for every scenario, marked with the arm that led its ABBA trials, plus medians over base-led and candidate-led launches and each launch's start time. A trend across launches suggests drift during the run, a consistent gap between the two leading-arm medians suggests an order effect, and a single extreme launch shows when one launch drives a result. Raw order, positions, and start times are in results.json.

`yarn perf confirm --results <id>` repeats scenarios from a completed comparison with the same builds and settings but new seeds, so scenario order, arm order, and launch gaps differ. By default it repeats the scenarios that reported an improvement or regression; `--scenario` chooses others. `--runs` (default 1) is fixed before any run starts, and every run completes regardless of early results, so a result cannot be confirmed by stopping at a favorable run. The summary (`perf/.local/results/confirmation-*/summary.md`) sets each repeat beside the original: a scenario is **confirmed** when every repeat reaches the original verdict, **not confirmed** when any repeat contradicts it, and **unresolved** otherwise. The original run is often chosen because it showed an effect, so its estimate tends to overstate the change; judge the size from the confirmation runs.

Use the same machine and power settings, close heavy workloads, and avoid running builds alongside benchmarks. Headless full Chromium is the default; `--headed` is useful for inspection but requires keeping the window foreground. Browser versions, modes, CPU slowdown profiles, and hardware are not interchangeable. CPU throttling does not reproduce mobile hardware or eliminate shared-machine noise.

## Validate the measurement system

```sh
yarn test:perf
yarn tsc --project perf/tsconfig.json --noEmit
yarn perf smoke
yarn perf calibrate --build baseline
yarn perf validate --build baseline --runs 20 --scenario listbox,table.scroll
```

`validate` runs repeated A/A comparisons of one build, each with a different seed, and reports how often an interval excluded zero compared with the nominal error rate, plus the chance of seeing at least that many by luck. A low chance means the intervals are too narrow on that machine, for example because of an order or position effect, and verdicts should be treated with caution. Scenarios in one run share browser launches, so that chance is approximate. Each run takes as long as a full comparison, so a 20-run validation is an overnight job for many scenarios. The summary is saved under `perf/.local/results/validation-*`.

Calibration produces four paired ListBox-mount reports using the same build: A/A; an added 40 ms synchronous delay; a 40 ms deferred update; and 40 ms of forced-layout work. The deferred case checks that completing the requested result is measured even when the initial event is responsive. Inspect A/A noise and whether the injected effects are detected; calibration does not claim your hardware is stable or set thresholds automatically. Sample overrides can smoke-test calibration, but fewer than six blocks cannot establish confidence. These are harness checks, not substitutes for investigating actual component regressions.

Tests cover missing/censored observations, interaction grouping, long animation frame attribution, drift within paired blocks, insufficient independent samples, practical thresholds, incomplete runs, statistics, and rejection of incomplete or incorrect variable-height layouts. The production browser smoke run exercises each scenario's actual actions and completion checks.

No results need to be committed. Remove obsolete subdirectories of `perf/.local/builds/` or `perf/.local/results/` whenever they are no longer useful.
