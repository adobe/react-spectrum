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
import {describe, expect, it, vi} from 'vitest';
import {Picker, PickerItem} from '../src';
import React from 'react';
import {render} from './utils/render';

describe('Picker', () => {
  it('renders', async () => {
    vi.useFakeTimers();
    const screen = await render(
      <Picker label="Ice cream flavors">
        <PickerItem>Chocolate</PickerItem>
        <PickerItem>Mint</PickerItem>
        <PickerItem>Strawberry</PickerItem>
        <PickerItem>Vanilla</PickerItem>
        <PickerItem>Chocolate Chip Cookie Dough</PickerItem>
      </Picker>
    );
    vi.runAllTimers();
    expect(screen.getByRole('button')).toBeInTheDocument();
    vi.useRealTimers();
  });
});
