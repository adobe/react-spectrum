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
        assert.ok(spec.eventCount > 0 && spec.deltaY > 0, `${scenario.id} has no wheel input`);
      }
      // Scroll scenarios are scored on frame cadence, so they must collect frames.
      assert.equal(!!spec.frames, scenario.metric === 'frameP95', scenario.id);
    }
  }
});
