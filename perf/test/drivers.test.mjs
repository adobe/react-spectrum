/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import assert from 'node:assert/strict';
import {driver, drivers} from '../drivers.mjs';
import {scenarios, sizes} from '../scenarios.mjs';
import {test} from 'node:test';

test('every scenario has a driver and every driver action is a listed scenario', () => {
  for (let scenario of scenarios) {
    assert.doesNotThrow(() => driver(scenario), scenario.id);
  }
  let listed = new Set(scenarios.map(scenario => scenario.id));
  for (let [fixture, {actions}] of Object.entries(drivers)) {
    for (let name of Object.keys(actions)) {
      assert.ok(listed.has(`${fixture}.${name}`), `${fixture}.${name} is not in scenarios.mjs`);
    }
  }
  assert.throws(() => driver({id: 'listbox.missing', fixture: 'listbox'}), /Unknown scenario/);
});

test('armed specs are serializable and describe their measured input', () => {
  for (let scenario of scenarios) {
    for (let scale of [1, 3]) {
      let {action} = driver(scenario);
      let spec = action.spec(sizes[scenario.fixture] * scale);
      assert.deepEqual(JSON.parse(JSON.stringify(spec)), spec, scenario.id);
      assert.ok(spec.conditions.length, `${scenario.id} has no completion condition`);
      assert.ok(spec.target, `${scenario.id} has no event target`);
      if (spec.event === 'keydown') {
        assert.ok(spec.key, `${scenario.id} has no key`);
      }
      if (spec.event === 'wheel') {
        assert.ok(spec.distance > 0 && spec.speed > 0, `${scenario.id} has no scroll gesture`);
      }
      // Continuous actions scored on frame cadence must collect frames.
      assert.equal(!!spec.frames, scenario.metric === 'frameMean', scenario.id);
    }
  }
});

test('deep scrolling measures the same distance and speed after building scroll history', () => {
  let shallow = drivers.table.actions.scroll.spec();
  let deep = drivers.table.actions['scroll-deep'].spec();
  assert.equal(deep.distance, shallow.distance);
  assert.equal(deep.speed, shallow.speed);
  assert.equal(deep.conditions[0].scrollTop - shallow.conditions[0].scrollTop, 4000 * 40);

  let shallowList = drivers.variable.actions.scroll.spec(10000);
  let deepList = drivers.variable.actions['scroll-deep'].spec(10000);
  assert.equal(deepList.distance, shallowList.distance);
  assert.equal(deepList.speed, shallowList.speed);
  assert.deepEqual(deepList.layout, shallowList.layout);
  assert.equal(deepList.conditions[0].scrollTop - shallowList.conditions[0].scrollTop, 4000 * 40);
});

test('resize animation rejects a frame sample that ends before the animation', () => {
  let {verify} = drivers['table-measured'].actions['resize-animation'];
  assert.throws(() => verify({sample: {frameIntervals: [16, 16, 16]}}), /span the three-second/);
  assert.doesNotThrow(() => verify({sample: {frameIntervals: Array(180).fill(1000 / 60)}}));
});
