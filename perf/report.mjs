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
    // Mean interval is the scroll's elapsed time per frame callback, so each late
    // frame raises it in proportion to the time it lost.
    frameMean: sample.frameIntervals.length
      ? sample.frameIntervals.reduce((total, interval) => total + interval, 0) /
        sample.frameIntervals.length
      : null,
    frameP95: percentile(sample.frameIntervals, 0.95),
    frameMax: sample.frameIntervals.length ? Math.max(...sample.frameIntervals) : null,
    missedFrames: missedFrames(sample.frameIntervals),
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
  let median = (pairs, arm) =>
    percentile(
      pairs.flatMap(pair => pair[arm]),
      0.5
    );
  let base = median(pairs, 'base');
  let candidate = median(pairs, 'candidate');
  let delta = candidate - base;
  let threshold = Math.max(options.absolute ?? 8, base * (options.relative ?? 0.05));
  let interval = null;
  let verdict = 'inconclusive';
  // Resample whole paired browser-launch blocks, not individual keystrokes/trials.
  if (pairs.length >= 6) {
    let rng = random(2026);
    let deltas = Array.from({length: 2000}, () => {
      let resampled = pairs.map(() => pairs[Math.floor(rng() * pairs.length)]);
      return median(resampled, 'candidate') - median(resampled, 'base');
    });
    interval = [percentile(deltas, 0.025), percentile(deltas, 0.975)];
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
    interval,
    threshold,
    verdict,
    blocks: blocks.length
  };
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
    'Times below are medians. Completion uses a two-animation-frame rendering-opportunity proxy, not presented-pixel timing. Scroll uses the mean rAF interval within each trial, not compositor frame delivery.',
    '',
    'Decision thresholds are exploratory defaults, not calibrated merge criteria. Intervals are paired block bootstrap estimates; fewer than six blocks are always inconclusive. Multiple scenarios are exploratory comparisons, not a family-wide significance test.',
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
    '| Scenario | Metric | Base | Candidate | Change | 95% interval of change | Result |',
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
        `| ${scenario.id} | ${metric} | ${ms(comparison.base)} | ${ms(comparison.candidate)} | ${ms(comparison.delta)} (${comparison.percent === null ? 'n/a' : `${comparison.percent.toFixed(1)}%`}) | ${comparison.interval ? comparison.interval.map(ms).join(' to ') : 'insufficient blocks'} | ${comparison.verdict} |`
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
    '',
    '## Supporting measurements',
    '',
    '| Scenario / arm | Semantic ready median | Trials with Event Timing entries | Observed interaction max* | rAF interval p95 median | Worst rAF interval | Missed frames median |',
    '|---|---:|---:|---:|---:|---:|---:|'
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
      let missed = samples
        .map(sample => sample.metrics.missedFrames)
        .filter(value => value != null);
      lines.push(
        `| ${scenario.id} / ${arm} | ${ms(
          percentile(
            samples.map(sample => sample.metrics.ready),
            0.5
          )
        )} | ${entries.length}/${samples.length} | ${entries.length ? ms(Math.max(...entries)) : 'none reported'} | ${p95s.length ? ms(percentile(p95s, 0.5)) : '—'} | ${frames.length ? ms(Math.max(...frames)) : '—'} | ${missed.length ? percentile(missed, 0.5) : '—'} |`
      );
    }
  }
  lines.push(
    '',
    '*Event Timing omits ordinary entries below its reporting threshold and rounds durations. These maxima describe only observed entries; missing entries are not zeros. No interaction percentile or INP is inferred from this censored sample.',
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
  for (let diagnostic of result.diagnostics ?? []) {
    lines.push(
      `Trace ${diagnostic.scenario} / ${diagnostic.arm}: ${diagnostic.error ? `FAILED: ${diagnostic.error}` : diagnostic.file}`,
      ''
    );
  }
  if (result.diagnosticsError) {
    lines.push(`Traces incomplete: ${result.diagnosticsError}`, '');
  }
  return lines.join('\n');
}
