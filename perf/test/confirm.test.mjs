/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import assert from 'node:assert/strict';
import {conclusion, summarizeConfirmation} from '../confirm.mjs';
import {test} from 'node:test';

const regression = 'regression detected';
const within = 'within practical threshold';

test('a result is confirmed only when every repeat agrees', () => {
  assert.equal(conclusion(regression, [regression, regression]), 'confirmed');
  assert.equal(conclusion(regression, [regression, 'inconclusive']), 'unresolved');
  assert.equal(conclusion(regression, [regression, within]), 'not confirmed');
  assert.equal(conclusion(regression, ['improvement detected']), 'not confirmed');
  assert.equal(conclusion(within, [within]), 'confirmed');
  assert.equal(conclusion('inconclusive', [regression]), 'unresolved');
});

test('the summary sets each repeat beside the original result', () => {
  let comparison = (delta, verdict) => ({delta, interval: [delta - 1, delta + 1], verdict});
  let original = {
    options: {seed: 2026, blocks: 8, samples: 5, cpu: 1, scale: 1},
    builds: {base: {name: 'main'}, candidate: {name: 'pr'}},
    comparisons: {'listbox.mount': comparison(12, regression)}
  };
  let markdown = summarizeConfirmation(
    original,
    '/results/original',
    [
      {dir: '/results/one', seed: 2027, comparisons: {'listbox.mount': comparison(10, regression)}},
      {dir: '/results/two', seed: 2028, comparisons: {'listbox.mount': comparison(9.5, regression)}}
    ],
    ['listbox.mount']
  );
  assert.match(markdown, /2 confirmation runs, fixed before starting, with seeds 2027, 2028/);
  assert.match(
    markdown,
    /\| listbox\.mount \| \+12\.00 ms \[\+11\.00 ms, \+13\.00 ms\] regression detected \| \+10\.00 ms .* \| \*\*confirmed\*\* \|/
  );
});
