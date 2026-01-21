/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Button, Menu, MenuItem, MenuSection, MenuTrigger} from '../src';
import {describe, expect, it, vi} from 'vitest';
import React from 'react';
import {render} from './utils/render';

describe('Menu', () => {
  it('renders', async () => {
    vi.useFakeTimers();
    const screen = await render(
      <MenuTrigger defaultOpen>
        <Button>Publish</Button>
        <Menu>
          <MenuSection>
            <MenuItem textValue="quick export" onAction={() => alert('Quick export')}>
              Quick Export
            </MenuItem>
            <MenuItem textValue="open a copy">Open a copy</MenuItem>
          </MenuSection>
          <MenuSection selectionMode="multiple" defaultSelectedKeys={['files']}>
            <MenuItem id="files">Show files</MenuItem>
            <MenuItem id="folders">Show folders</MenuItem>
          </MenuSection>
        </Menu>
      </MenuTrigger>
    );
    vi.runAllTimers();
    expect(screen.getByRole('menu')).toBeInTheDocument();
    vi.useRealTimers();
  });
});
