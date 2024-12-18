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

import {act, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {Checkbox, CheckboxGroup, Form} from '../src';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('CheckboxGroup', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('should not require all checkboxes to be checked when Form has isRequired', async () => {
    let {getByRole, getAllByRole, getByTestId} = render(
      <Form data-testid="form" isRequired>
        <CheckboxGroup label="Favorite sports">
          <Checkbox value="soccer">Soccer</Checkbox>
          <Checkbox value="baseball">Baseball</Checkbox>
          <Checkbox value="basketball">Basketball</Checkbox>
        </CheckboxGroup>
      </Form>
    );


    let group = getByRole('group');
    let checkbox = getAllByRole('checkbox')[0];

    await user.click(checkbox);
    act(() => {getByTestId('form').checkValidity();});
    expect(group).not.toHaveAttribute('aria-describedby');
    expect(group).not.toHaveAttribute('data-invalid');

    await user.click(checkbox);
    act(() => {getByTestId('form').checkValidity();});
    expect(group).toHaveAttribute('data-invalid');
    expect(group).toHaveAttribute('aria-describedby');
    let errorMsg = document.getElementById(group.getAttribute('aria-describedby'));
    expect(errorMsg).toHaveTextContent('Constraints not satisfied');
  });
});


