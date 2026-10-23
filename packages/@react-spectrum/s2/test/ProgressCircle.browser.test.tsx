/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0
 * (the "License"). You may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR REPRESENTATIONS OF ANY KIND, either express or
 * implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

import {ProgressCircle} from '../src/ProgressCircle';
import {Provider} from '../src/Provider';
import {expect, it} from 'vitest';
import React from 'react';
import {render} from './utils/render';

it('uses CSS geometry radii instead of calc() SVG r attributes', async () => {
  let {container} = await render(
    <Provider>
      <ProgressCircle aria-label="Loading" size="L" isIndeterminate />
    </Provider>
  );

  let circles = container.querySelectorAll('svg circle');
  expect(circles).toHaveLength(3);

  for (let circle of circles) {
    expect(circle.hasAttribute('r')).toBe(false);
    expect(circle.style.getPropertyValue('r')).toBe('calc(50% - 0.125rem)');
  }
});
