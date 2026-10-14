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

export function metrics(sample) {
  let interactions = new Map();
  for (let event of sample.events) {
    interactions.set(
      event.interactionId,
      Math.max(interactions.get(event.interactionId) ?? 0, event.duration)
    );
  }
  return {
    ready: sample.semanticReady - sample.start,
    opportunity: sample.renderingOpportunity - sample.start,
    frameP95: percentile(sample.frameIntervals, 0.95),
    frameMax: sample.frameIntervals.length ? Math.max(...sample.frameIntervals) : null,
    reportedInteractionMax: interactions.size ? Math.max(...interactions.values()) : null,
    reportedInteractions: interactions.size
  };
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
    'Times below are medians. Completion uses a two-animation-frame rendering-opportunity proxy, not presented-pixel timing. Scroll uses p95 rAF intervals within each trial, not compositor frame delivery.',
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
          metric === 'frameP95' ? result.options.frameThreshold : result.options.absoluteThreshold,
        relative: result.options.relativeThreshold
      });
      result.comparisons[scenario.id] = comparison;
      lines.push(
        `| ${scenario.id} | ${metric} | ${ms(comparison.base)} | ${ms(comparison.candidate)} | ${ms(comparison.delta)} (${comparison.percent?.toFixed(1)}%) | ${comparison.interval ? comparison.interval.map(ms).join(' to ') : 'insufficient blocks'} | ${comparison.verdict} |`
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
    '| Scenario / arm | Semantic ready median | Trials with Event Timing entries | Observed interaction max* | Worst rAF interval |',
    '|---|---:|---:|---:|---:|'
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
      lines.push(
        `| ${scenario.id} / ${arm} | ${ms(
          percentile(
            samples.map(sample => sample.metrics.ready),
            0.5
          )
        )} | ${entries.length}/${samples.length} | ${entries.length ? ms(Math.max(...entries)) : 'none reported'} | ${frames.length ? ms(Math.max(...frames)) : '—'} |`
      );
    }
  }
  lines.push(
    '',
    '*Event Timing omits ordinary entries below its reporting threshold and rounds durations. These maxima describe only observed entries; missing entries are not zeros. No interaction percentile or INP is inferred from this censored sample.',
    '',
    'Raw timestamps, event entries, frame intervals, ordering, build fingerprints, and machine metadata are in results.json. Full Chrome traces, when requested, are separate diagnostic reruns and excluded from comparisons.',
    ''
  );
  for (let diagnostic of result.diagnostics ?? []) {
    lines.push(
      `Trace ${diagnostic.scenario} / ${diagnostic.arm}: ${diagnostic.error ? `FAILED: ${diagnostic.error}` : diagnostic.file}`,
      ''
    );
  }
  return lines.join('\n');
}
