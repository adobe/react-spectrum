/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import fs from 'node:fs/promises';
import {isDeepStrictEqual} from 'node:util';
import {loadBuild, local} from './build.mjs';
import path from 'node:path';
import {run} from './runner.mjs';

const detected = verdict => verdict.endsWith('detected');

// Repeats scenarios from a completed comparison with the same builds and settings but
// new seeds, so arm order, scenario order, and launch gaps differ. The number of runs
// is fixed before any of them start; all of them run, whatever the early results.
export async function confirm({results, scenario, runs}) {
  let originalDir = path.isAbsolute(results) ? results : path.join(local, 'results', results);
  let original = JSON.parse(await fs.readFile(path.join(originalDir, 'results.json'), 'utf8'));
  if (original.status !== 'complete' || !original.builds.candidate || !original.comparisons) {
    throw new Error('confirm needs a completed compare run.');
  }
  let available = original.scenarios.map(scenario => scenario.id);
  let ids = scenario
    ? available.filter(id =>
        scenario.split(',').some(filter => id === filter || id.startsWith(`${filter}.`))
      )
    : available.filter(id => detected(original.comparisons[id].verdict));
  if (!ids.length) {
    throw new Error(
      scenario
        ? `None of those scenarios were in that run. It measured: ${available.join(', ')}.`
        : 'No scenario in that run reported an improvement or regression. Pass --scenario to choose which to repeat.'
    );
  }
  for (let arm of ['base', 'candidate']) {
    let current = await loadBuild(original.options[arm]);
    let expected = original.builds[arm];
    if (
      ['artifactHash', 'harnessHash', 'lockHash'].some(key => current[key] !== expected[key]) ||
      !isDeepStrictEqual(current.versions, expected.versions)
    ) {
      throw new Error(
        `Snapshot ${current.name} no longer matches the ${arm} build in the original comparison. Start a new comparison instead of confirming these results.`
      );
    }
  }
  let experiments = [];
  for (let i = 0; i < runs; i++) {
    console.log(`\nConfirmation run ${i + 1}/${runs}`);
    let {result, dir} = await run({
      ...original.options,
      scenario: ids.join(','),
      seed: original.options.seed + 1 + i,
      trace: false
    });
    experiments.push({dir, seed: result.options.seed, comparisons: result.comparisons});
  }
  let markdown = summarizeConfirmation(original, originalDir, experiments, ids);
  let dir = path.join(
    local,
    'results',
    `confirmation-${new Date().toISOString().replaceAll(/[:.]/g, '-')}`
  );
  await fs.mkdir(dir, {recursive: true});
  await fs.writeFile(path.join(dir, 'summary.md'), markdown);
  console.log(`\n${markdown}\nSaved ${dir}`);
  return {dir, markdown};
}

// A scenario is confirmed when every confirmation run reaches the original verdict,
// not confirmed when any run contradicts it, and unresolved otherwise.
export function conclusion(original, confirmations) {
  if (confirmations.every(verdict => verdict === original)) {
    return 'confirmed';
  }
  let contradicts = verdict =>
    verdict !== original && verdict !== 'inconclusive' && original !== 'inconclusive';
  return confirmations.some(contradicts) ? 'not confirmed' : 'unresolved';
}

export function summarizeConfirmation(original, originalDir, experiments, ids) {
  let signed = value => {
    let digits = Math.abs(value).toFixed(2);
    // Values that round to zero get no minus sign.
    return `${value < 0 && digits !== '0.00' ? '−' : '+'}${digits} ms`;
  };
  let cell = comparison =>
    `${signed(comparison.delta)}${comparison.interval ? ` [${comparison.interval.map(signed).join(', ')}]` : ''} ${comparison.verdict}`;
  let {options} = original;
  let lines = [
    '# Confirmation',
    '',
    `Original: ${originalDir} · ${original.builds.base.name} vs ${original.builds.candidate.name} · seed ${options.seed} · ${options.blocks} blocks × ${options.samples} trials · ${options.cpu}× CPU · ${options.scale}× workload`,
    '',
    `${experiments.length} confirmation run${experiments.length === 1 ? '' : 's'}, fixed before starting, with seeds ${experiments.map(experiment => experiment.seed).join(', ')} and otherwise identical settings.`,
    '',
    'Cells show the paired change, its interval, and the verdict. A scenario is confirmed when every confirmation run reaches the original verdict, not confirmed when any run contradicts it, and unresolved otherwise. The original run was often chosen because it showed an effect, so its estimate tends to overstate the change; judge the size from the confirmation runs.',
    '',
    `| Scenario | Original | ${experiments.map((_, i) => `Confirmation ${i + 1}`).join(' | ')} | Conclusion |`,
    `|---|---|${experiments.map(() => '---|').join('')}---|`
  ];
  for (let id of ids) {
    let first = original.comparisons[id];
    let repeats = experiments.map(experiment => experiment.comparisons[id]);
    lines.push(
      `| ${id} | ${cell(first)} | ${repeats.map(cell).join(' | ')} | **${conclusion(
        first.verdict,
        repeats.map(comparison => comparison.verdict)
      )}** |`
    );
  }
  lines.push(
    '',
    'Runs:',
    '',
    ...experiments.map((experiment, i) => `- Confirmation ${i + 1}: ${experiment.dir}`),
    ''
  );
  return lines.join('\n');
}
