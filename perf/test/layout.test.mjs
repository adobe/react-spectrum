/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import assert from 'node:assert/strict';
import {layoutSignature, validLayout} from '../app/layout.mjs';
import {test} from 'node:test';

const expected = {width: 600, total: 10000};
function snapshot() {
  return {
    width: 600,
    contentWidth: 598,
    height: 300,
    scrollTop: 1000,
    rows: [
      {id: 'item-10', index: 10, top: -20, height: 60, allocatedHeight: 60, width: 598},
      {id: 'item-11', index: 11, top: 40, height: 100, allocatedHeight: 100, width: 598},
      {id: 'item-12', index: 12, top: 140, height: 80, allocatedHeight: 80, width: 598},
      {id: 'item-13', index: 13, top: 220, height: 100, allocatedHeight: 100, width: 598}
    ]
  };
}

test('a measured variable-height window fills the viewport without rendering the whole dataset', () => {
  assert.equal(validLayout(snapshot(), expected), true);
  assert.equal(validLayout(snapshot(), {...expected, total: 4}), false);
  assert.equal(validLayout(null, expected), false);
});

test('gaps, overlaps, clipped content, and missing or reordered visible records invalidate layout', () => {
  for (let corrupt of [
    s => {
      s.rows[1].top += 10;
    },
    s => {
      s.rows[1].top -= 10;
    },
    s => {
      s.rows[1].allocatedHeight -= 20;
    },
    s => {
      s.rows[1].index = 12;
    },
    s => {
      s.rows.shift();
    },
    s => {
      s.rows.pop();
    }
  ]) {
    let s = snapshot();
    corrupt(s);
    assert.equal(validLayout(s, expected), false);
  }
});

test('resizing must reach the requested width and measure actual variable heights', () => {
  assert.equal(validLayout(snapshot(), {...expected, width: 360}), false);
  let s = snapshot();
  s.rows.forEach((row, i) => {
    row.top = -20 + i * 80;
    row.height = row.allocatedHeight = 80;
  });
  assert.equal(validLayout(s, expected), false);
  s = snapshot();
  s.rows[0].width = 300;
  assert.equal(validLayout(s, expected), false);
  s = snapshot();
  s.width = NaN;
  assert.equal(validLayout(s, expected), false);
});

test('the top anchor must remain the first record at zero scroll offset', () => {
  assert.equal(validLayout(snapshot(), {...expected, atTop: true}), false);
  let s = snapshot();
  s.scrollTop = 0;
  s.rows.forEach((row, i) => {
    row.id = `item-${i}`;
    row.index = i;
    row.top += 20;
  });
  assert.equal(validLayout(s, {...expected, atTop: true}), true);
  s.rows[0].id = 'item-99';
  assert.equal(validLayout(s, {...expected, atTop: true}), false);
});

test('stable visible geometry ignores DOM ordering and offscreen recycling', () => {
  let s = snapshot();
  let signature = layoutSignature(s);
  s.rows.reverse();
  s.rows.push({id: 'item-14', index: 14, top: 320, height: 80, allocatedHeight: 80, width: 598});
  let original = structuredClone(s);
  assert.equal(validLayout(s, expected), true);
  assert.equal(layoutSignature(s), signature);
  assert.deepEqual(s, original);
  s.rows.pop();
  assert.equal(layoutSignature(s), signature);
  s.rows[0].top += 10;
  assert.notEqual(layoutSignature(s), signature);
  s = snapshot();
  s.rows[0].height += 10;
  assert.notEqual(layoutSignature(s), signature);
});

test('measured tables must resize columns and allocate each row its natural content height', () => {
  let s = snapshot();
  s.columns = [150, 100, 348];
  s.rows.forEach(row => {
    row.contentHeight = row.height;
  });
  let table = {...expected, columns: [150, 100, 348]};
  assert.equal(validLayout(s, table), true);
  assert.equal(validLayout(s, {...table, columns: [150, 300, 148]}), false);
  s.rows[1].contentHeight -= 20;
  assert.equal(validLayout(s, table), false);
});
