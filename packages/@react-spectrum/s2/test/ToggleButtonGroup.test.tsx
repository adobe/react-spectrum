/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {describe, expect, it} from 'vitest';
import {render} from './utils/render';
import {Text, ToggleButton, ToggleButtonGroup} from '../src';

describe('ToggleButtonGroup', () => {
  it('renders', async () => {
    const screen = await render(
      <ToggleButtonGroup>
        <ToggleButton id="bold">
          <Text>Bold</Text>
        </ToggleButton>
        <ToggleButton id="italic">
          <Text>Italic</Text>
        </ToggleButton>
        <ToggleButton id="underline">
          <Text>Underline</Text>
        </ToggleButton>
      </ToggleButtonGroup>
    );
    const radios = screen.container.querySelectorAll('[role="radio"]');
    expect(radios.length).toBe(3);
  });
});
