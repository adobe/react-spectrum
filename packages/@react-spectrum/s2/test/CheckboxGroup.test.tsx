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

import {act, pointerMap, render, User} from '@react-spectrum/test-utils-internal';
import {Checkbox, CheckboxGroup, Form, Provider} from '../src';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('CheckboxGroup', () => {
  let testUtilUser = new User();
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
    act(() => {(getByTestId('form') as HTMLFormElement).checkValidity();});
    expect(group).not.toHaveAttribute('aria-describedby');
    expect(group).not.toHaveAttribute('data-invalid');

    await user.click(checkbox);
    act(() => {(getByTestId('form') as HTMLFormElement).checkValidity();});
    expect(group).toHaveAttribute('data-invalid');
    expect(group).toHaveAttribute('aria-describedby');
    let errorMsg = document.getElementById(group.getAttribute('aria-describedby')!);
    expect(errorMsg).toHaveTextContent('Constraints not satisfied');
  });

  it.each`
    Name                    | props
    ${'ltr + vertical'}     | ${{locale: 'de-DE', orientation: 'vertical'}}
    ${'rtl + verfical'}     | ${{locale: 'ar-AE', orientation: 'vertical'}}
    ${'ltr + horizontal'}   | ${{locale: 'de-DE', orientation: 'horizontal'}}
    ${'rtl + horizontal'}   | ${{locale: 'ar-AE', orientation: 'horizontal'}}
  `('$Name should select the correct checkbox regardless of orientation and disabled checkboxes', async function ({props}) {
    let {getByRole} = render(
      <Provider locale={props.locale}>
        <CheckboxGroup label="Favorite sports">
          <Checkbox value="soccer">Soccer</Checkbox>
          <Checkbox value="baseball" isDisabled>Baseball</Checkbox>
          <Checkbox value="basketball" isDisabled>Basketball</Checkbox>
          <Checkbox value="tennis">Tennis</Checkbox>
          <Checkbox value="Rugby">Rugby</Checkbox>
        </CheckboxGroup>
      </Provider>
    );

    let checkboxGroupTester = testUtilUser.createTester('CheckboxGroup', {root: getByRole('group')});
    expect(checkboxGroupTester.checkboxgroup).toHaveAttribute('role');
    let checkboxes = checkboxGroupTester.checkboxes;
    await checkboxGroupTester.toggleCheckbox({checkbox: checkboxes[0]});
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxGroupTester.selectedCheckboxes).toHaveLength(1);

    await checkboxGroupTester.toggleCheckbox({checkbox: 4, interactionType: 'keyboard'});
    expect(checkboxes[4]).toBeChecked();
    expect(checkboxGroupTester.selectedCheckboxes).toHaveLength(2);

    let checkbox4 = checkboxGroupTester.findCheckbox({checkboxIndexOrText: 3});
    await checkboxGroupTester.toggleCheckbox({checkbox: checkbox4, interactionType: 'keyboard'});
    expect(checkboxes[3]).toBeChecked();
    expect(checkboxGroupTester.selectedCheckboxes).toHaveLength(3);

    await checkboxGroupTester.toggleCheckbox({checkbox: 'Soccer', interactionType: 'keyboard'});
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxGroupTester.selectedCheckboxes).toHaveLength(2);

    let checkbox5 = checkboxGroupTester.findCheckbox({checkboxIndexOrText: 'Rugby'});
    await checkboxGroupTester.toggleCheckbox({checkbox: checkbox5, interactionType: 'mouse'});
    expect(checkboxes[4]).not.toBeChecked();
    expect(checkboxGroupTester.selectedCheckboxes).toHaveLength(1);
  });
});
