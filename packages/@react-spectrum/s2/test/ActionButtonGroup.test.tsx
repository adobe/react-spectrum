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

import {ActionButton, ActionButtonGroup, Text} from '../src';
import Copy from '@react-spectrum/s2/icons/Copy';
import Cut from '@react-spectrum/s2/icons/Cut';
import {describe, expect, it} from 'vitest';
import Paste from '@react-spectrum/s2/icons/Paste';
import {render} from './utils/render';

describe('ActionButtonGroup', () => {
  it('renders', async () => {
    const screen = await render(
      <ActionButtonGroup>
        <ActionButton>
          <Cut />
          <Text>Cut</Text>
        </ActionButton>
        <ActionButton>
          <Copy />
          <Text>Copy</Text>
        </ActionButton>
        <ActionButton>
          <Paste />
          <Text>Paste</Text>
        </ActionButton>
      </ActionButtonGroup>
    );
    const buttons = screen.container.querySelectorAll('button');
    expect(buttons.length).toBe(3);
  });
});
