/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Menu, MenuItem, SearchField} from '../src';
import {pointerMap, render} from '@react-spectrum/test-utils-internal';
import React from 'react';
import {UNSTABLE_Autocomplete} from 'react-aria-components';
import userEvent from '@testing-library/user-event';

describe('SearchField', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('should not apply the focus visible styles on the group when typing in the Autocomplete wrapped SearchField', async () => {
    let {getByRole} = render(
      <UNSTABLE_Autocomplete>
        <SearchField autoFocus label="Search" />
        <Menu aria-label="test menu">
          <MenuItem>Foo</MenuItem>
          <MenuItem>Bar</MenuItem>
          <MenuItem>Baz</MenuItem>
        </Menu>
      </UNSTABLE_Autocomplete>
    );

    let input = getByRole('searchbox');
    await user.click(input);
    let group = getByRole('group');
    expect(group).not.toHaveAttribute('data-focus-visible');
    await user.keyboard('Foo');
    expect(group).not.toHaveAttribute('data-focus-visible');
  });
});
