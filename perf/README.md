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
| Virtualized table | 10,000 records × six columns, fixed 40 px rows | Mount, 12 wheel steps of 160 px with 32 ms pauses, update one visible record |
| Variable-height ListBox | 10,000 records with wrapping descriptions of three different lengths | Mount, 12 wheel steps, narrow from 600 to 360 px and remeasure rows |
| Mutable GridList | 100 records, plus a prepared 50-record next page and a replacement dataset | Append a page, delete five selected records, switch datasets |
| Tree | 20 projects with 50 files each | Expand a project, navigate into its first file, collapse the project |
| Resizable table | 500 nonvirtualized records × six flexible columns | Mount, narrow the container from 960 to 660 px as when opening a side panel |
| Form and dialog | 30 mixed text fields, checkboxes, and switches | Mount, controlled field keypress, dialog opening and autofocus |

The table retains unchanged record identities on a one-record update. The suite verifies virtualization and checks that scrolling exposes the expected row. Every measured action has an explicit semantic completion condition; failures/timeouts invalidate the run rather than being discarded as outliers. Browser runtime/console errors also fail the run.

The resizable table keeps its data and table element stable while its container narrows, exercising the browser's ResizeObserver and React Aria's column layout updates. Completion waits for the column width styles to update; assertions then verify all six columns' actual widths and that the rows remain present.

`table-data.sort`, `.filter`, and `.clear` operate on an already-mounted table. Sorting and filtering retain the original record objects. Completion requires the entire expected sequence of row IDs and the correct sort direction, with row text checked afterward. Clearing starts from the filtered view and measures restoring the full collection. The application-side filter/sort work is included; these cases do not replace records with fresh objects.

`table-cells.select` and `.select-all` wait for both row selection and checkbox state. `.menu` and `.dialog` wait for focus inside the overlay, while `.menu-close` (Escape) and `.dialog-close` (Close button) wait for overlay removal and focus restoration to the originating cell button. The full table remains mounted behind the overlay.

`combobox.keyboard`, `combobox.hover`, `select.keyboard`, and `select.hover` start with an open popup and its first option focused. Each trial measures one move to the second option. Completion requires the new focus styling and either the ComboBox input's matching `aria-activedescendant` or actual DOM focus for Select. Pointer navigation starts at the trusted `pointerover` timestamp; target coordinates are resolved before timing. Hover is not an Event Timing interaction and is not included in interaction/INP claims. These are discrete option transitions, not a continuous pointer-sweep score.

The ComboBox now shares the richer option content with Select, including for its existing open/filter scenarios. Rebuild both snapshots when comparing with this version of the harness.

`variable.mount`, `.scroll`, and `.resize` use `ListLayout` with an estimated row height and item size observation. The browser determines the actual heights from wrapping text. Layout readiness requires three consecutive animation-frame samples with unchanged visible geometry: visible rows must have different heights, fill the viewport in order without gaps or overlap, fit their allocated wrappers, and occupy the requested width. DOM ordering and offscreen row recycling do not affect this comparison. Only a virtualized subset may be rendered. Geometry is sampled once per frame after the action's other conditions hold; this bounded instrumentation and settling interval are included in the score. The usual two-frame rendering opportunity follows, and the layout must still match when results are collected.

The variable-height resize starts at the top and preserves the first record while its description reflows. Scrolling uses the same twelve 160 px wheel steps and 32 ms pauses as the fixed-height table. It also requires all twelve trusted wheel events, at least 1,900 px of scrolling, and a complete settled viewport. Its primary score remains frame-callback cadence, including the final layout settling frames. Raw results retain the final row geometry and input-event count.

`collection.append` adds half the initial record count while preserving existing objects and selection. `.remove` starts with the first five records selected and focus on the fifth; Delete must remove those records, clear selection, and focus the next surviving record. `.replace` switches to fresh records with different keys, clears the previous selection, and retains focus on the switch button. Completion verifies the whole item sequence, and assertions verify labels. Payloads are prepared before mounting, so these scenarios measure applying already-available data rather than network latency or data generation.

`tree.expand` uses ArrowRight on the first project, `.navigate` uses ArrowDown on that already-expanded project to focus its first file, and `.collapse` uses ArrowLeft on the expanded project. Completion verifies every exposed row in order, the parent's expansion state, and keyboard focus. The tree is nonvirtualized, with all data already available. `--scale` increases files per project and the collection/page sizes; the deletion batch stays at five records.

Each scenario gets a new browser context and page in each block. Before every trial, the fixture is unmounted and recreated in the same document; setup, fonts, and prerequisite interactions settle outside the measurement window. Default warmups exercise the same action and are discarded. These are **warm browser/module-cache measurements on fresh component instances**. There is no claim that a component's first-ever execution is represented. Datasets and all fixture modules are already loaded, local, and deterministic. The filtering, data update, React work, and browser work caused by the action are included.

The basic styling intentionally includes real layout and focus/selection styles without animations or remote fonts. It is not a Spectrum design-system benchmark. Hydration, network loading, memory retention, and cross-browser timing are future additions, not covered by these results.

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

Tests cover missing/censored observations, interaction grouping, drift within paired blocks, insufficient independent samples, practical thresholds, incomplete runs, statistics, and rejection of incomplete or incorrect variable-height layouts. The production browser smoke run exercises each scenario's actual actions and completion checks.

No results need to be committed. Remove obsolete subdirectories of `perf/.local/builds/` or `perf/.local/results/` whenever they are no longer useful.
