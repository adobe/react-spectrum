/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

export function percentile(values, fraction) {
  if (!values.length) {
    return null;
  }
  let sorted = [...values].sort((a, b) => a - b);
  let position = (sorted.length - 1) * fraction;
  let low = Math.floor(position);
  return sorted[low] + (sorted[Math.ceil(position)] - sorted[low]) * (position - low);
}

// Estimates frames the main thread missed: an interval spanning n frame periods
// skipped n - 1 frames. The period is the trial's median interval, so it adapts to
// the display rate and holds while fewer than half the frames are late.
export function missedFrames(intervals) {
  if (!intervals.length) {
    return null;
  }
  let period = percentile(intervals, 0.5);
  return intervals.reduce(
    (missed, interval) => missed + Math.max(0, Math.round(interval / period) - 1),
    0
  );
}

export function metrics(sample) {
  let interactions = new Map();
  for (let event of sample.events) {
    interactions.set(
      event.interactionId,
      Math.max(interactions.get(event.interactionId) ?? 0, event.duration)
    );
  }
  // Without a long frame there is nothing to attribute; that is missing, not zero.
  let longFrames = sample.longFrames ?? [];
  let scripts = longFrames.flatMap(frame => frame.scripts);
  let total = values => (longFrames.length ? values.reduce((sum, value) => sum + value, 0) : null);
  return {
    ready: sample.semanticReady - sample.start,
    opportunity: sample.renderingOpportunity - sample.start,
    // Mean interval is the action's elapsed time per frame callback, so each late
    // frame raises it in proportion to the time it lost.
    frameMean: sample.frameIntervals.length
      ? sample.frameIntervals.reduce((total, interval) => total + interval, 0) /
        sample.frameIntervals.length
      : null,
    frameP95: percentile(sample.frameIntervals, 0.95),
    frameMax: sample.frameIntervals.length ? Math.max(...sample.frameIntervals) : null,
    missedFrames: missedFrames(sample.frameIntervals),
    mutations: sample.mutations ?? null,
    nodesChanged: sample.nodesAdded === undefined ? null : sample.nodesAdded + sample.nodesRemoved,
    reportedInteractionMax: interactions.size ? Math.max(...interactions.values()) : null,
    reportedInteractions: interactions.size,
    longFrames: longFrames.length,
    longFrameMax: longFrames.length ? Math.max(...longFrames.map(frame => frame.duration)) : null,
    longFrameBlocking: total(longFrames.map(frame => frame.blockingDuration)),
    longFrameScript: total(scripts.map(script => script.duration)),
    longFrameStyleLayout: total(
      longFrames.map(frame =>
        frame.styleAndLayoutStart ? frame.startTime + frame.duration - frame.styleAndLayoutStart : 0
      )
    ),
    longFrameForcedLayout: total(scripts.map(script => script.forcedStyleAndLayoutDuration))
  };
}

function topInvoker(samples) {
  let totals = new Map();
  for (let script of samples.flatMap(sample => sample.longFrames.flatMap(frame => frame.scripts))) {
    totals.set(script.invoker, (totals.get(script.invoker) ?? 0) + script.duration);
  }
  let [invoker] = [...totals].sort((a, b) => b[1] - a[1])[0] ?? [];
  if (!invoker) {
    return '—';
  }
  let text = invoker.length > 60 ? `${invoker.slice(0, 59)}…` : invoker;
  return `\`${text.replaceAll('|', '\\|').replaceAll('`', "'")}\``;
}

function longFrameRows(result) {
  let rows = [];
  for (let scenario of result.scenarios) {
    for (let arm of Object.keys(result.builds)) {
      let samples = result.samples.filter(
        sample => sample.scenario === scenario.id && sample.arm === arm
      );
      if (samples.some(sample => sample.longFramesSupported === false)) {
        rows.push(`| ${scenario.id} / ${arm} | unsupported | — | — | — | — | — | — |`);
        continue;
      }
      let observed = samples.filter(sample => sample.metrics.longFrames);
      let median = metric =>
        observed.length
          ? ms(
              percentile(
                observed.map(sample => sample.metrics[metric]),
                0.5
              )
            )
          : '—';
      rows.push(
        `| ${scenario.id} / ${arm} | ${observed.length}/${samples.length} | ${observed.length ? ms(Math.max(...observed.map(sample => sample.metrics.longFrameMax))) : 'none reported'} | ${median('longFrameBlocking')} | ${median('longFrameScript')} | ${median('longFrameStyleLayout')} | ${median('longFrameForcedLayout')} | ${topInvoker(observed)} |`
      );
    }
  }
  return rows;
}

export function random(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

// A seeded Fisher–Yates shuffle, leaving the input unchanged.
export function shuffled(items, rng) {
  let result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    let j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Exact null distribution of the Wilcoxon signed-rank statistic for n pairs:
// cdf[k] is the probability that the positive-rank sum is at most k.
function signedRankCdf(n) {
  let counts = [1];
  for (let rank = 1; rank <= n; rank++) {
    let next = Array(counts.length + rank).fill(0);
    counts.forEach((count, sum) => {
      next[sum] += count;
      next[sum + rank] += count;
    });
    counts = next;
  }
  let cumulative = 0;
  return counts.map(count => (cumulative += count) / 2 ** n);
}

// Hodges–Lehmann estimate and distribution-free confidence interval for a paired
// shift, from the sorted Walsh averages of the per-block changes. The interval uses
// the smallest exact confidence level at or above the requested one; fewer than six
// blocks cannot reach 95%, so they get no interval.
export function signedRankInterval(deltas, confidence = 0.95) {
  let walsh = deltas.flatMap((a, i) => deltas.slice(i).map(b => (a + b) / 2));
  let estimate = percentile(walsh, 0.5);
  walsh.sort((a, b) => a - b);
  let cdf = signedRankCdf(deltas.length);
  let trim = 0;
  while (cdf[trim] <= (1 - confidence) / 2) {
    trim++;
  }
  if (!trim) {
    return {estimate, interval: null, confidence: null};
  }
  return {
    estimate,
    interval: [walsh[trim - 1], walsh[walsh.length - trim]],
    confidence: 1 - 2 * cdf[trim - 1]
  };
}

// Probability of at least `observed` successes in `total` trials with success rate p.
export function binomialTail(observed, total, p) {
  let probability = (1 - p) ** total;
  let tail = 0;
  for (let k = 0; k <= total; k++) {
    if (k >= observed) {
      tail += probability;
    }
    probability *= ((total - k) / (k + 1)) * (p / (1 - p));
  }
  return Math.min(1, tail);
}

export function compare(samples, metric, options = {}) {
  if (!samples.length) {
    throw new Error('Comparison requires samples.');
  }
  let blocks = [...new Set(samples.map(sample => sample.block))];
  let pairs = blocks.map(block => {
    let values = arm =>
      samples
        .filter(sample => sample.block === block && sample.arm === arm)
        .map(sample => sample.metrics[metric]);
    return {base: values('base'), candidate: values('candidate')};
  });
  if (
    pairs.some(
      pair =>
        !pair.base.length ||
        pair.base.length !== pair.candidate.length ||
        [...pair.base, ...pair.candidate].some(value => !Number.isFinite(value))
    )
  ) {
    throw new Error('Comparison requires complete, finite paired samples for every block.');
  }
  let median = values => percentile(values, 0.5);
  let base = median(pairs.flatMap(pair => pair.base));
  let candidate = median(pairs.flatMap(pair => pair.candidate));
  // Each browser launch is compared with itself, so drift between launches cancels;
  // the blocks, not the trials within them, are the independent observations.
  let deltas = pairs.map(pair => median(pair.candidate) - median(pair.base));
  let {
    estimate: delta,
    interval,
    confidence
  } = signedRankInterval(deltas, options.confidence ?? 0.95);
  let threshold = Math.max(options.absolute ?? 8, base * (options.relative ?? 0.05));
  let verdict = 'inconclusive';
  if (interval) {
    if (interval[1] < -threshold) {
      verdict = 'improvement detected';
    } else if (interval[0] > threshold) {
      verdict = 'regression detected';
    } else if (interval[0] >= -threshold && interval[1] <= threshold) {
      verdict = 'within practical threshold';
    }
  }
  return {
    base,
    candidate,
    delta,
    percent: base ? (delta / base) * 100 : null,
    deltas,
    interval,
    confidence,
    threshold,
    verdict,
    blocks: blocks.length
  };
}

// Per-launch paired changes, for inspecting drift over a run and order effects.
function launchSection(result) {
  let blocks = [...new Set(result.samples.map(sample => sample.block))].sort((a, b) => a - b);
  if (!result.builds.candidate || !blocks.length) {
    return [];
  }
  let signed = value => {
    let digits = Math.abs(value).toFixed(2);
    // Values that round to zero get no minus sign.
    return `${value < 0 && digits !== '0.00' ? '−' : '+'}${digits}`;
  };
  let lines = [
    '',
    '## Changes by browser launch',
    '',
    'Each cell is one launch’s paired change in milliseconds (candidate median minus base median), marked B or C for the arm that led that launch’s ABBA trials. The last two columns are medians over launches led by each arm; a consistent gap between them suggests an order effect. A trend across launches suggests drift during the run.',
    ''
  ];
  let starts = blocks.map(block =>
    Math.min(
      ...(result.order ?? [])
        .filter(entry => entry.block === block && entry.started !== undefined)
        .map(entry => entry.started)
    )
  );
  if (starts.every(Number.isFinite)) {
    lines.push(
      `Launch start times, in minutes into the run: ${starts.map(start => (start / 60000).toFixed(1)).join(', ')}.`,
      ''
    );
  }
  lines.push(
    `| Scenario | ${blocks.map(block => `L${block + 1}`).join(' | ')} | Base led | Candidate led |`,
    `|---|${blocks.map(() => '---:').join('|')}|---:|---:|`
  );
  for (let scenario of result.scenarios) {
    let metric = scenario.metric ?? 'opportunity';
    let cells = blocks.map(block => {
      let median = arm =>
        percentile(
          result.samples
            .filter(
              sample =>
                sample.scenario === scenario.id && sample.block === block && sample.arm === arm
            )
            .map(sample => sample.metrics[metric]),
          0.5
        );
      let base = median('base');
      let candidate = median('candidate');
      return {
        delta: base === null || candidate === null ? null : candidate - base,
        led: result.order?.find(entry => entry.block === block && entry.scenario === scenario.id)
          ?.arms[0]
      };
    });
    let byLead = arm => {
      let deltas = cells.filter(cell => cell.led === arm && cell.delta !== null);
      return deltas.length
        ? signed(
            percentile(
              deltas.map(cell => cell.delta),
              0.5
            )
          )
        : '—';
    };
    lines.push(
      `| ${scenario.id} | ${cells
        .map(cell =>
          cell.delta === null
            ? '—'
            : `${signed(cell.delta)}${cell.led ? ` ${cell.led === 'base' ? 'B' : 'C'}` : ''}`
        )
        .join(' | ')} | ${byLead('base')} | ${byLead('candidate')} |`
    );
  }
  return lines;
}

// Main-thread breakdowns of the diagnostic trace reruns, within the measured window.
function traceSection(diagnostics) {
  if (!diagnostics.length) {
    return [];
  }
  let lines = [
    '## Diagnostic traces',
    '',
    'Each trace is a separate rerun after the same warmups as the measured trials, excluded from comparisons. Times cover the renderer main thread inside the measured window (input to rendering opportunity), attributing each moment to its innermost trace event. Forced style and layout is the part of style and layout that script triggered synchronously; it is already included in those columns.',
    '',
    '| Scenario / arm | Window | Main thread busy | Script | Style | Layout | Forced style and layout | Paint | GC | Other | Trace |',
    '|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|'
  ];
  for (let diagnostic of diagnostics) {
    let {summary} = diagnostic;
    let label = `${diagnostic.scenario} / ${diagnostic.arm}`;
    if (diagnostic.error) {
      lines.push(
        `| ${label} | FAILED: ${diagnostic.error.replaceAll('|', '\\|').split('\n')[0]} |||||||||| |`
      );
    } else if (!summary) {
      lines.push(`| ${label} | no measurement window in trace |||||||||| ${diagnostic.file} |`);
    } else {
      lines.push(
        `| ${label} | ${[
          summary.window,
          summary.busy,
          summary.script,
          summary.style,
          summary.layout,
          summary.forcedStyleLayout,
          summary.paint,
          summary.gc,
          summary.other
        ]
          .map(ms)
          .join(' | ')} | ${diagnostic.file} |`
      );
    }
  }
  lines.push('');
  return lines;
}

const ms = value => (value === null ? 'unavailable' : `${value.toFixed(2)} ms`);

export function report(result) {
  let lines = [
    '# React Aria local benchmark',
    '',
    `${result.started} · Chromium ${result.environment.browser} · React ${result.builds.base.versions.react}`,
    '',
    `${result.environment.mode ?? 'test'} · ${result.options.cpu ?? 1}× CPU slowdown · ${result.options.scale ?? 1}× workload · ${result.environment.cpu ?? 'CPU not recorded'}`,
    '',
    `Base: ${result.builds.base.name} (${result.builds.base.source.sha.slice(0, 10)}).${result.builds.candidate ? ` Candidate: ${result.builds.candidate.name} (${result.builds.candidate.source.sha.slice(0, 10)}).` : ''}`,
    '',
    `${result.options.blocks} browser-launch blocks × ${result.options.samples} measured trials per arm; ${result.options.warmup} discarded warmups per scenario/arm/block.`,
    '',
    'Times below are medians. Completion uses a two-animation-frame rendering-opportunity proxy, not presented-pixel timing. Scrolling and continuous resizing use the mean rAF interval within each trial, not compositor frame delivery.',
    '',
    'Decision thresholds are exploratory defaults, not calibrated merge criteria. Changes are Hodges–Lehmann estimates of the per-block paired change, with exact Wilcoxon signed-rank intervals at the smallest achievable confidence of at least 95%; fewer than six blocks cannot reach 95% and are always inconclusive. Multiple scenarios are exploratory comparisons, not a family-wide significance test.',
    ''
  ];
  if (result.options.delay) {
    lines.push(
      `Calibration: candidate mount adds ${result.options.delay} ms of ${result.options.delayMode} work.`,
      ''
    );
  }
  if (result.status === 'running') {
    let completed = new Set(result.samples.map(sample => sample.block)).size;
    lines.push(
      `**IN PROGRESS / INCOMPLETE: ${completed} of ${result.options.blocks} blocks saved.**`,
      '',
      'Partial samples are retained; comparison verdicts are produced only when the run completes.',
      ''
    );
    return lines.join('\n');
  }
  if (result.status !== 'complete') {
    lines.push(
      `**FAILED / INCOMPLETE: ${result.error ?? 'run interrupted'}**`,
      '',
      'Partial samples are retained for diagnosis; no comparison verdicts are produced.',
      ''
    );
    return lines.join('\n');
  }
  lines.push(
    '| Scenario | Metric | Base | Candidate | Paired change | Interval of change (confidence) | Result |',
    '|---|---|---:|---:|---:|---|---|'
  );
  result.comparisons = {};
  for (let scenario of result.scenarios) {
    let samples = result.samples.filter(sample => sample.scenario === scenario.id);
    let metric = scenario.metric ?? 'opportunity';
    if (result.builds.candidate) {
      let comparison = compare(samples, metric, {
        absolute:
          metric === 'frameMean' ? result.options.frameThreshold : result.options.absoluteThreshold,
        relative: result.options.relativeThreshold
      });
      result.comparisons[scenario.id] = comparison;
      lines.push(
        `| ${scenario.id} | ${metric} | ${ms(comparison.base)} | ${ms(comparison.candidate)} | ${ms(comparison.delta)} (${comparison.percent === null ? 'n/a' : `${comparison.percent.toFixed(1)}%`}) | ${comparison.interval ? `${comparison.interval.map(ms).join(' to ')} (${(comparison.confidence * 100).toFixed(1)}%)` : 'insufficient blocks'} | ${comparison.verdict} |`
      );
    } else {
      lines.push(
        `| ${scenario.id} | ${metric} | ${ms(
          percentile(
            samples.map(sample => sample.metrics[metric]),
            0.5
          )
        )} | — | — | — | observation only |`
      );
    }
  }
  lines.push(
    ...launchSection(result),
    '',
    '## Supporting measurements',
    '',
    '| Scenario / arm | Semantic ready median | Trials with Event Timing entries | Observed interaction max* | rAF interval p95 median | Worst rAF interval | Missed frames median | DOM mutations median‡ |',
    '|---|---:|---:|---:|---:|---:|---:|---:|'
  );
  for (let scenario of result.scenarios) {
    for (let arm of Object.keys(result.builds)) {
      let samples = result.samples.filter(
        sample => sample.scenario === scenario.id && sample.arm === arm
      );
      let entries = samples
        .map(sample => sample.metrics.reportedInteractionMax)
        .filter(value => value !== null);
      let frames = samples.map(sample => sample.metrics.frameMax).filter(value => value !== null);
      let p95s = samples.map(sample => sample.metrics.frameP95).filter(value => value != null);
      let median = metric => {
        let values = samples.map(sample => sample.metrics[metric]).filter(value => value != null);
        return values.length ? percentile(values, 0.5) : null;
      };
      let missed = samples
        .map(sample => sample.metrics.missedFrames)
        .filter(value => value != null);
      lines.push(
        `| ${scenario.id} / ${arm} | ${ms(
          percentile(
            samples.map(sample => sample.metrics.ready),
            0.5
          )
        )} | ${entries.length}/${samples.length} | ${entries.length ? ms(Math.max(...entries)) : 'none reported'} | ${p95s.length ? ms(percentile(p95s, 0.5)) : '—'} | ${frames.length ? ms(Math.max(...frames)) : '—'} | ${missed.length ? percentile(missed, 0.5) : '—'} | ${median('mutations') === null ? '—' : `${median('mutations')} (${median('nodesChanged')} nodes)`} |`
      );
    }
  }
  lines.push(
    '',
    '*Event Timing omits ordinary entries below its reporting threshold and rounds durations. These maxima describe only observed entries; missing entries are not zeros. No interaction percentile or INP is inferred from this censored sample.',
    '',
    '‡Mutation records observed from the input until the rendering opportunity, with nodes added plus removed in parentheses. Counts barely vary between trials, so a difference between arms means the DOM work changed even when times are within noise.',
    '',
    '## Long animation frames',
    '',
    '| Scenario / arm | Trials with long frames† | Longest frame | Blocking | Script | Style and layout | Forced style and layout | Top script invoker |',
    '|---|---:|---:|---:|---:|---:|---:|---|',
    ...longFrameRows(result),
    '',
    '†Long Animation Frames (LoAF) reports only frames of at least 50 ms, and lists scripts only when they run for at least 5 ms. Except for the longest frame, columns are medians over trials with long frames, summed across each trial’s long frames that overlap its measurement window. Trials without entries had no long frame; that is not a zero cost. Blocking is each frame’s time beyond 50 ms. Invokers name the event, callback, or timer that ran the script; script sources are minified production code.',
    '',
    'Raw timestamps, event entries, long animation frames, frame intervals, ordering, build fingerprints, and machine metadata are in results.json. Full Chrome traces, when requested, are separate diagnostic reruns and excluded from comparisons.',
    ''
  );
  lines.push(...traceSection(result.diagnostics ?? []));
  if (result.diagnosticsError) {
    lines.push(`Traces incomplete: ${result.diagnosticsError}`, '');
  }
  return lines.join('\n');
}
