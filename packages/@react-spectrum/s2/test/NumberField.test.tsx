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

import {NumberField} from '../src';
import {pointerMap, render} from '@react-spectrum/test-utils-internal';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('NumberField', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('should warn if the NumberField renders/blurs without a placeholder', async () => {
    let spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    let {getByRole, rerender} = render(
      <NumberField label="Quantity" />
    );

    expect(spy).toHaveBeenCalledWith('Your NumberField is empty and not focused but doesn\'t have a placeholder. Please add one.');
    spy.mockClear();

    await user.tab();
    await user.tab();
    expect(spy).toHaveBeenCalledWith('Your NumberField is empty and not focused but doesn\'t have a placeholder. Please add one.');
    spy.mockClear();

    let input = getByRole('textbox');
    await user.click(input);
    await user.keyboard('1');
    await user.tab();
    expect(spy).not.toHaveBeenCalled();

    rerender(<NumberField label="Quantity" placeholder="test" />);
    expect(spy).not.toHaveBeenCalled();

    rerender(<NumberField label="Quantity" autoFocus />);
    expect(spy).not.toHaveBeenCalled();
  });
});
