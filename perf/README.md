# Performance benchmarking

Good performance benchmarks for the web should measure things that actually affect the user's experience: how quickly components appear, how promptly interactions update the screen, and how smoothly collections scroll. Useful measurements require representative workloads in realistic environments.

The suite builds production React and React Aria with Parcel and runs evaluations in Chromium through Playwright. It runs locally, with no CI integration. Snapshots and results stay in the git-ignored `perf/.local/` directory.

- [When to use it](#when-to-use-it)
- [Quick start](#quick-start)
- [Compare a change](#compare-a-change)
- [Choose a workload](#choose-a-workload)
- [Read the results](#read-the-results)
- [Investigate unexpected results](#investigate-unexpected-results)
- [Maintain the suite](#maintain-the-suite)
- [Measurement reference](#measurement-reference)

## When to use it

Use the suite to investigate a performance regression, evaluate an optimization, or check changes to shared rendering, interaction, collection, or virtualization code. Choose scenarios that exercise the affected behavior; add a representative scenario when coverage is missing.

The fixtures cover mounting, keyboard and pointer interactions, collection updates, scrolling, and resizing. They include application logic, React work, and browser rendering work. Hydration, network loading, memory retention, and other browsers are outside the current coverage.

## Quick start

From the repository root, with dependencies already installed:

```sh
# Install the matching full Chromium browser if it is missing.
yarn playwright install chromium

# Check the setup and all scenarios.
yarn perf smoke
```

Smoke builds a temporary production snapshot, compares it with itself, and removes the snapshot afterward. It runs two browser launches with one warmup and one measured trial per arm, scenario, and launch. Every action must complete, its assertions must pass, and the report must be generated. Results are kept. Allow a few minutes for the full suite.

**Smoke verifies that the suite works; it does not establish a performance improvement or regression.**

For a focused check, use `yarn perf smoke --scenario table.scroll`. Pass `--build <name>` to reuse an existing snapshot. Use `yarn perf list` to list actions and `yarn perf --help` for all options.

## Compare a change

### 1. Build the baseline

With the harness present on the source you want to compare against:

```sh
yarn perf build --name baseline
```

Choose an unused name for each snapshot. Builds cannot overwrite existing names, and the runner does not manage branches or change your working tree. If the baseline branch predates the suite, apply the same harness there before building it.

### 2. Build and compare the candidate

Apply the library change, keeping the harness and dependencies identical, then run:

```sh
yarn perf build --name candidate
yarn perf compare --base baseline --candidate candidate --scenario listbox.focus,table
```

Select the affected actions or fixtures with `--scenario`; omit it to run all scenarios. Keep the default measurement counts for performance conclusions: eight browser launches, five measured trials per arm per launch, and two discarded warmups. Reducing counts is useful for checking setup, but reduces confidence in the comparison.

Both snapshots are measured in the same run with alternating arm order. Use the same machine, browser, and power settings for follow-up runs, close heavy workloads, and avoid concurrent builds or benchmarks. The default is headless full Chromium. With `--headed`, keep the measured window foreground.

If the harness or dependencies change, rebuild **both** snapshots. Comparisons reject incompatible snapshots and modified bundles; see [snapshot verification](#snapshot-verification).

### 3. Read and confirm the result

Open `report.md` in the results directory printed by the command. If an improvement or regression is detected, confirm it before relying on it:

```sh
yarn perf confirm --results <results-id> --runs 2
```

`<results-id>` is the directory name under `perf/.local/results/`. Confirmation repeats detected scenarios with the original settings and new seeds; use `--scenario` to select other scenarios from that run. It disables diagnostic tracing. Choose the number of confirmation runs before starting; every requested run is performed regardless of early verdicts.

Confirmation checks both snapshots' artifact, harness, dependency-lock, and tool-version fingerprints against the original results. Reusing a deleted snapshot's name for a different build cannot confirm the old comparison. If the snapshots have changed, start a new comparison.

The confirmation `summary.md` places each repeat beside the original:

| Conclusion | Meaning |
| --- | --- |
| Confirmed | Every confirmation run reached the original verdict. |
| Not confirmed | At least one run contradicted the original verdict. |
| Unresolved | The repeats did not consistently support or contradict it. |

Judge the size of the change from the confirmation runs: selecting an initial run because it showed an effect can overstate that effect.

## Choose a workload

A filter accepts an exact scenario ID or a whole fixture, separated by commas. For example, `--scenario table.scroll,collection` runs one table action and all collection-mutation actions.

| Fixture filter | Default workload | Actions |
| --- | --- | --- |
| `listbox` | 100 items with labels, team, and status | Mount, focus, select, unrelated parent update |
| `combobox` | 500 options with an icon, label, and description | Open, type `99` to filter, keyboard and pointer navigation |
| `select` | 500 rich options | Keyboard and pointer navigation in an open popup |
| `table-data` | 100 nonvirtualized rows × six columns | Sort, filter by `9`, clear the filter, move cell focus without selection |
| `table-cells` | 100 nonvirtualized rows × six columns with controls | Select one/all rows, open/close a menu or dialog |
| `table` | 10,000 virtualized rows × six columns, fixed 40 px rows | Mount, scroll 4,000 px near the top or after traversing 4,000 rows, update one visible record |
| `table-measured` | 1,000 virtualized rows × eight columns, measured heights and wrapping labels | Mount, narrow/widen labels, resize another column, narrow or continuously animate the container |
| `variable` | 10,000 virtualized items with wrapping descriptions | Mount, scroll 4,000 px, narrow from 600 to 360 px |
| `collection` | 100 GridList records, a prepared 50-record page, and a replacement dataset | Append, delete five selected records, replace the dataset |
| `tree` | 20 projects with 50 files each | Expand, navigate into a project, collapse |
| `resize` | 500 nonvirtualized rows × six flexible columns | Mount, narrow the container from 960 to 660 px |
| `form` | 30 mixed text fields, checkboxes, and switches | Mount, type in a controlled field, open a dialog and autofocus |
| `dnd` | 200 draggable cards beside an independently controlled text field | Type after pointer input, type while already in keyboard mode |

`table-measured` uses `estimatedRowHeight: 32` and rows containing two, four, or six wrapping labels. Its discrete actions change the labels column from 300 to 100 px, widen it back, resize another column from 150 to 170 px while labels remain narrow, or narrow the container from 1,000 to 800 px. `table-measured.resize-animation` starts with narrow labels and animates container width between 1,000 and 800 px over five 600 ms legs, ending at 800 px. This exercises repeated ResizeObserver and table context updates during a sidebar animation; it does not drive a column resize handle. Completion requires the animation to end, three stable layout frames, the requested column widths, natural content heights, and contiguous rows filling the viewport.

`table.scroll-deep` first traverses 160,000 px in the same mounted table using a browser-generated wheel gesture at 40,000 px/s. This preparation builds scroll history outside the measurement window. It then measures the same 4,000 px at 2,000 px/s as `table.scroll`, ending at row 4,100. The history distance is fixed as `--scale` increases the dataset. This action adds about four seconds of preparation per trial, plus rendering overhead.

To check the new interaction workloads together:

```sh
yarn perf smoke --scenario table-data.focus,table.scroll-deep,table-measured.resize-animation,dnd
```

Use `run` to observe one build without a comparison verdict:

```sh
yarn perf run --build candidate --scenario table-data,table-cells
```

`--scale` multiplies record/control counts, not the viewport dimensions. For example, `--scale 5` gives the two 100-row table fixtures 500 rows. For trees it increases files per project; collection deletion stays at five records. `--cpu` applies browser CPU throttling ([`Emulation.setCPUThrottlingRate`](https://chromedevtools.github.io/devtools-protocol/tot/Emulation/#method-setCPUThrottlingRate)) as a separate experiment; it does not emulate mobile hardware.

```sh
yarn perf compare --base baseline --candidate candidate --scenario table-data --scale 5
yarn perf compare --base baseline --candidate candidate --scenario table.scroll --cpu 4
```

## Read the results

Each run saves these files under `perf/.local/results/<results-id>/`:

| File | Contents |
| --- | --- |
| `report.md` | Comparison verdicts, changes by browser launch, and supporting measurements |
| `results.json` | Raw samples, timestamps, ordering, build fingerprints, options, and machine/browser metadata |
| `*.trace.json` | Separate diagnostic reruns, when `--trace` is requested |
| `failure.png` | A failure screenshot when the active page can be captured |

Failed or interrupted measurements retain partial results but produce no comparison verdicts. Completion timeouts, failed assertions, and browser runtime/console errors invalidate the run; they are not discarded as outliers. A diagnostic trace failure is reported separately and does not invalidate completed measurements.

### Primary metrics and verdicts

Lower values are better for both primary metrics:

| Metric | Used for | Meaning |
| --- | --- | --- |
| `opportunity` | Discrete actions | Time from the initiating trusted event to two animation-frame callbacks after the expected DOM/focus state is observed. A rendering-opportunity proxy, not proof that pixels were presented. |
| `frameMean` | `table.scroll`, `table.scroll-deep`, `variable.scroll`, `table-measured.resize-animation` | Mean animation-frame callback interval within a trial. Measures main-thread callback cadence, not compositor frame delivery. The action's total duration is not the score. |

Base and candidate columns show medians of trial values. **Paired change** is estimated from each launch's candidate median minus its base median, so it may differ from subtracting the two displayed columns. Negative changes favor the candidate. The interval describes uncertainty in that paired change.

The practical threshold is the larger of **8 ms or 5% of the base median** for `opportunity`, and **0.25 ms or 5%** for `frameMean`. These are exploratory defaults, not calibrated merge budgets. Override them with `--absolute-threshold`, `--relative-threshold`, and `--frame-threshold` after investigating noise on your machine.

| Verdict | Meaning |
| --- | --- |
| Improvement detected | The entire interval is below the negative practical threshold. Confirm the result. |
| Regression detected | The entire interval is above the positive practical threshold. Confirm and investigate. |
| Within practical threshold | The entire interval lies inside the threshold bounds. |
| Inconclusive | The interval crosses a threshold, or there are too few launches to form an interval. |

Fewer than six launches always produce inconclusive verdicts, regardless of inner trial count. Comparisons require an even `--blocks` to balance which arm leads. Multiple scenarios are exploratory comparisons without adjustment for family-wide false positives; use them alongside correctness tests and inspection of the affected interaction.

## Investigate unexpected results

Start with the report's **Changes by browser launch** table. A trend can indicate drift, a gap between base-led and candidate-led launches can indicate an order effect, and an isolated extreme launch shows where a result may be sensitive to noise.

Compare a build with itself (A/A) to inspect noise under the same workload and settings:

```sh
yarn perf compare --base baseline --candidate baseline --scenario table.scroll
```

For diagnostic detail, add `--trace` to a comparison:

```sh
yarn perf compare --base baseline --candidate candidate --scenario table.scroll --trace
```

Traces run separately after all measured trials, following the same warmups, and are excluded from comparison scores. Open the JSON files in the [Chrome DevTools Performance panel](https://developer.chrome.com/docs/devtools/performance/reference). [User Timing](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API/User_timing) measures in each trace show `bench:ready` (input to semantic readiness) and `bench:window` (input to rendering opportunity).

The report's **Diagnostic traces** table divides renderer main-thread time inside `bench:window` into script, style, layout, paint, GC, and other work. It attributes time to the innermost trace event and reports [forced style/layout](https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing) as a subset of style/layout time. Use it with DOM mutation counts and long-frame attribution to understand why work changed even if the primary score did not.

### Common problems

| Problem | Next step |
| --- | --- |
| Chromium is missing | Run `yarn playwright install chromium` using the repository's dependencies. |
| Snapshot name already exists | Choose a new name. Builds are immutable. |
| Harness/dependencies differ, or a bundle was modified | Rebuild both snapshots with the same harness and dependencies, then start a new comparison. |
| Confirmation fingerprints do not match | Use the original snapshots or start a new comparison. Renaming/rebuilding a snapshot does not preserve its identity. |
| A scenario fails or times out | Inspect the saved error and screenshot, then reproduce with `yarn perf smoke --scenario <id> --headed`. |
| Results remain inconclusive | Check workload coverage, launch-level drift, and A/A noise before changing sample counts or thresholds. |

## Maintain the suite

After changing harness code, run:

```sh
yarn test:perf
yarn check-types --project perf/tsconfig.json
```

For fixture or driver changes, also run `yarn perf smoke --scenario <filter>`. For changes shared across scenarios, such as the runner or measurement code, run the full `yarn perf smoke`. Unit tests cover reports, statistics, confirmation fingerprints, driver specifications, layout validation, and trace summaries; smoke exercises actual browser actions and completion checks.

### Add a scenario

1. Reuse a fixture or add one under [`app/`](app/), registering new fixtures in [`app/app.tsx`](app/app.tsx).
2. Add the action's ID, fixture, label, and optional primary metric in [`scenarios.mjs`](scenarios.mjs). Add a default `sizes` entry for a new fixture.
3. Add its action under the fixture in [`drivers.mjs`](drivers.mjs). Use `prepare` for unmeasured prerequisites, `spec` for serializable input and completion conditions, and `verify` for post-measurement assertions. The runner sends the input described by `spec`; use `input` only for custom sequences.
4. Run the unit tests, type-check, and `yarn perf smoke --scenario <id>`.

Completion conditions should describe the actual requested result, including focus or layout settling when relevant. Prepare deterministic data outside the measurement window, while keeping the application work caused by the action inside it. Rebuild both snapshots before comparing with a changed fixture or driver.

### Validate the measurement system

Use these when changing measurement behavior or investigating whether the harness detects effects reliably on your machine:

```sh
yarn perf calibrate --build baseline
yarn perf validate --build baseline --runs 20 --scenario listbox,table.scroll
```

`calibrate` runs four paired ListBox-mount experiments: A/A, then a candidate with an added 40 ms of synchronous work, a deferred update, or forced-layout work. Check whether the injected effects are detected. Calibration does not automatically set thresholds or establish machine stability.

`validate` repeats A/A comparisons with different seeds and checks how often intervals exclude zero against their nominal error rate. Scenarios share browser launches, so its probability calculation is approximate. Each repeat costs a full comparison; a 20-run validation can take overnight. Its summary is saved under `perf/.local/results/validation-*/summary.md`.

## Measurement reference

### Trial lifecycle and statistics

Each block launches a new Chromium process. Each scenario gets a fresh context and page per arm, with both pages kept open while trials alternate in ABBA order (AB, BA, AB, …). Which arm leads alternates across blocks. A seed controls scenario shuffles, leading-arm order, and short gaps between launches.

Before every trial, the fixture is unmounted and recreated in the same document. Fonts, setup, and prerequisite interactions settle outside the timing window. Warmups exercise the same action and are discarded. These are **warm browser/module-cache measurements on fresh component instances**; datasets and fixture modules are already loaded. They do not represent a component's first-ever execution.

The independent observations are browser launches. For each launch, the candidate's median trial is compared with the base's median trial. The reported change is the [Hodges–Lehmann estimate](https://en.wikipedia.org/wiki/Hodges%E2%80%93Lehmann_estimator) (median of pairwise averages) of those launch-level changes. Its [Wilcoxon signed-rank](https://en.wikipedia.org/wiki/Wilcoxon_signed-rank_test) interval uses the smallest achievable confidence at or above 95%: 96.1% with the default eight blocks. There is no p95 interaction-latency verdict.

### Timing boundaries and supporting measurements

Timing begins at the trusted browser event timestamp, excluding Playwright's locator/actionability polling. The ComboBox filter includes the deliberate 75 ms pause between its two keys. Assertions and result collection happen after the measurement window. Measured trials use neither traces nor React profiling builds.

| Measurement | Interpretation |
| --- | --- |
| Semantic readiness (`ready`) | First observation of the expected DOM/focus state, through mutation/focus observation or the frame loop. Layout-dependent conditions run in the frame loop rather than mutation callbacks. This is not React render duration or paint time. |
| [Event Timing](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceEventTiming) | Browser-reported event durations, input delays, processing times, and interaction IDs. Entries are grouped by interaction ID for observed maxima. Durations are quantized and short entries may be absent; missing entries are not zeros. These scripted interactions do not measure field [INP](https://web.dev/articles/inp). |
| [Long animation frames (LoAF)](https://developer.chrome.com/docs/web-platform/long-animation-frames) | Frames of at least 50 ms overlapping the window, with blocking duration, script, style/layout, and forced style/layout attribution. Scripts are listed only when they take at least 5 ms. A trial with no long frame has no attribution, not zero cost. Raw entries are retained; sources are minified production code. |
| rAF interval p95 and maximum | Supporting per-trial frame-interval statistics. The report shows the median p95 and worst interval. Intervals cluster around whole frame periods, making the tail percentile less stable than the mean for comparisons. |
| Missed frames | Estimated from intervals spanning multiple periods, using the trial's median interval as the period. This assumes fewer than half the callbacks are late and does not count compositor-dropped frames. |
| DOM mutations | Mutation records and nodes added/removed from input to rendering opportunity. Helps identify changed DOM work even when timing is noisy; does not capture re-renders that leave the DOM unchanged. |

Long-frame summary columns are medians over trials with entries, summed across each trial's overlapping long frames, except for the longest-frame maximum. The report also shows coverage so missing observations remain visible.

### Fixture completion checks

- **Fixed-height scrolling:** Chromium synthesizes a trusted mouse-wheel stream at its own cadence for 4,000 px at 2,000 px/s. Completion requires reaching the distance and exposing the expected row. Frame intervals must span at least 90% of the two-second gesture, however many frames were missed. The table must render a virtualized subset; updating one record retains the other record objects.
- **Variable-height lists:** `ListLayout` observes actual heights from wrapping descriptions. Readiness requires three consecutive frames with stable visible geometry: rows fill the viewport in order without gaps or overlap, fit their wrappers and width, and have different heights. DOM ordering and offscreen recycling do not affect the comparison. Resize preserves the first record at the top. Geometry checks and settling are included in the score; the layout is checked again when collecting results.
- **Resizable tables:** Data and the table element remain stable as the container narrows, exercising ResizeObserver and column layout updates. Completion waits for width styles; assertions verify all six actual column widths and retained rows.
- **Sorting/filtering tables:** Actions operate on an already-mounted table and retain record identities. Completion checks the full expected row-ID sequence and sort direction; assertions check labels. Clearing measures restoration of all rows. Application filter/sort work is included.
- **Table focus:** ArrowDown moves from the first row's first data cell to the same column in the second row. Selection is disabled. Completion requires actual DOM focus on the destination and no selection; assertions verify all row identities, labels, and ordering.
- **Continuous table resizing:** A three-second CSS width animation drives five narrow/wide legs without a parent React update on every frame. The score includes the animation and final layout settling. Frame samples must span at least 2.8 seconds, so an abbreviated run cannot pass as a fast result.
- **DnD modality:** The text field owns its state separately from the draggable cards, so typing does not re-render their parent. Preparation verifies pointer-mode drag instructions for `dnd.modality-type`; `dnd.type` first uses ArrowLeft to establish keyboard mode. Both measure typing one `a`, require the updated field and retained focus, and verify every card's identity, label, draggable state, and keyboard instructions afterward. Locale is fixed to `en-US` by the runner.
- **Table controls:** Selection waits for both row and checkbox state. Opening menus/dialogs waits for focus inside; closing waits for removal and focus restoration to the originating button. The table remains mounted behind overlays.
- **Popup navigation:** ComboBox and Select start open with the first option focused and measure one move to the second. Completion checks focus styling plus ComboBox `aria-activedescendant` or Select DOM focus. Pointer timing begins at `pointerover`; coordinates are resolved beforehand. Hover does not generate an Event Timing interaction and does not measure a continuous pointer sweep.
- **Collection mutations:** Append preserves objects and selection. Delete starts with five selected records and focus on the fifth, then requires their removal, cleared selection, and focus on the next survivor. Replace uses new keys, clears selection, and keeps focus on the switch button. Complete item order and labels are checked. Payloads are prepared before mounting.
- **Trees:** ArrowRight expands the first project, ArrowDown enters its first file, and ArrowLeft collapses it. Completion checks all exposed rows in order, expansion state, and focus; assertions check labels and hierarchy levels. All data is available and the tree is nonvirtualized.

### Snapshot verification

Manifests record the git SHA, dirty state, tracked diff hash, dependency lock hash, actual React/React DOM/Parcel/Playwright versions, harness hash, and bundle hash. The bundle graph must contain production React DOM and React Aria/RAC/Stately source from this checkout; runtime checks also verify production mode and React version.

The harness and dependency fingerprints must agree across a comparison, and bundles must still match their manifests. A dirty snapshot cannot be reproduced from its git SHA alone, especially when it includes untracked source files.

Keep snapshots needed for confirmation. Remove obsolete directories under `perf/.local/builds/` and `perf/.local/results/` when they are no longer useful; these artifacts do not need to be committed.
