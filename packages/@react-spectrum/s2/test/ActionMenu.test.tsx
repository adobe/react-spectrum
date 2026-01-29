/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ActionMenu, Keyboard, MenuItem, Text} from '../src';
import Copy from '@react-spectrum/s2/icons/Copy';
import Cut from '@react-spectrum/s2/icons/Cut';
import {describe, expect, it} from 'vitest';
import Paste from '@react-spectrum/s2/icons/Paste';
import React from 'react';
import {render} from './utils/render';

describe('ActionMenu', () => {
  it('renders', async () => {
    const screen = await render(
      <ActionMenu>
        <MenuItem
          textValue="Copy"
          onAction={() => alert('copy')}>
          <Copy />
          <Text slot="label">Copy</Text>
          <Text slot="description">Copy the selected text</Text>
          <Keyboard>⌘C</Keyboard>
        </MenuItem>
        <MenuItem
          textValue="Cut"
          onAction={() => alert('cut')}>
          <Cut />
          <Text slot="label">Cut</Text>
          <Text slot="description">Cut the selected text</Text>
          <Keyboard>⌘X</Keyboard>
        </MenuItem>
        <MenuItem
          textValue="Paste"
          onAction={() => alert('paste')}>
          <Paste />
          <Text slot="label">Paste</Text>
          <Text slot="description">Paste the copied text</Text>
          <Keyboard>⌘V</Keyboard>
        </MenuItem>
      </ActionMenu>
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
