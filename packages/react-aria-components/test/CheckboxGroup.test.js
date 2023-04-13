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

import {Checkbox, CheckboxGroup, CheckboxGroupContext, Label, Text} from '../';
import React from 'react';
import {render} from '@react-spectrum/test-utils';
import userEvent from '@testing-library/user-event';

let TestCheckboxGroup = ({groupProps, checkboxProps}) => (
  <CheckboxGroup {...groupProps}>
    <Label>Test</Label>
    <Checkbox {...checkboxProps} value="a">A</Checkbox>
    <Checkbox {...checkboxProps} value="b">B</Checkbox>
    <Checkbox {...checkboxProps} value="c">C</Checkbox>
  </CheckboxGroup>
);

let renderGroup = (groupProps, checkboxProps) => render(<TestCheckboxGroup {...{groupProps, checkboxProps}} />);

describe('CheckboxGroup', () => {
  it('should render a checkbox group with default classes', () => {
    let {getByRole, getAllByRole} = renderGroup();
    let group = getByRole('group');
    expect(group).toHaveAttribute('class', 'react-aria-CheckboxGroup');
    expect(group).toHaveAttribute('aria-labelledby');
    expect(document.getElementById(group.getAttribute('aria-labelledby'))).toHaveTextContent('Test');

    let checkboxes = getAllByRole('checkbox');
    for (let checkbox of checkboxes) {
      let label = checkbox.closest('label');
      expect(label).toHaveAttribute('class', 'react-aria-Checkbox');
    }
  });

  it('should render a checkbox group with custom classes', () => {
    let {getByRole, getAllByRole} = renderGroup({className: 'group'}, {className: 'checkbox'});
    let group = getByRole('group');
    expect(group).toHaveAttribute('class', 'group');
    let checkboxes = getAllByRole('checkbox');
    for (let checkbox of checkboxes) {
      let label = checkbox.closest('label');
      expect(label).toHaveAttribute('class', 'checkbox');
    }
  });

  it('should support DOM props', () => {
    let {getByRole} = renderGroup({'data-foo': 'bar'});
    let group = getByRole('group');
    expect(group).toHaveAttribute('data-foo', 'bar');
  });

  it('should support slot', () => {
    let {getByRole} = render(
      <CheckboxGroupContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <TestCheckboxGroup groupProps={{slot: 'test'}} />
      </CheckboxGroupContext.Provider>
    );

    let group = getByRole('group');
    expect(group).toHaveAttribute('slot', 'test');
    expect(group).toHaveAttribute('aria-label', 'test');
  });

  it('should support disabled state on checkbox', () => {
    let {getAllByRole} = renderGroup({}, {isDisabled: true, className: ({isDisabled}) => isDisabled ? 'disabled' : ''});
    let checkbox = getAllByRole('checkbox')[0];
    let label = checkbox.closest('label');

    expect(checkbox).toBeDisabled();
    expect(label).toHaveAttribute('data-disabled', 'true');
    expect(label).toHaveClass('disabled');
  });

  it('should support disabled state on group', () => {
    let className = ({isDisabled}) => isDisabled ? 'disabled' : '';
    let {getByRole, getAllByRole} = renderGroup({isDisabled: true, className}, {className});
    let group = getByRole('group');
    let checkbox = getAllByRole('checkbox')[0];
    let label = checkbox.closest('label');

    expect(group).toHaveAttribute('aria-disabled');
    expect(group).toHaveClass('disabled');

    expect(checkbox).toBeDisabled();
    expect(label).toHaveAttribute('data-disabled', 'true');
    expect(label).toHaveClass('disabled');
  });

  it('should support selected state', () => {
    let onChange = jest.fn();
    let {getAllByRole} = renderGroup({onChange}, {className: ({isSelected}) => isSelected ? 'selected' : ''});
    let checkboxes = getAllByRole('checkbox');
    let label = checkboxes[0].closest('label');

    expect(checkboxes[0]).not.toBeChecked();
    expect(label).not.toHaveAttribute('data-selected');
    expect(label).not.toHaveClass('selected');

    userEvent.click(checkboxes[0]);
    expect(onChange).toHaveBeenLastCalledWith(['a']);
    expect(checkboxes[0]).toBeChecked();
    expect(label).toHaveAttribute('data-selected', 'true');
    expect(label).toHaveClass('selected');

    userEvent.click(checkboxes[0]);
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(checkboxes[0]).not.toBeChecked();
    expect(label).not.toHaveAttribute('data-selected');
    expect(label).not.toHaveClass('selected');
  });

  it('should support read only state', () => {
    let className = ({isReadOnly}) => isReadOnly ? 'readonly' : '';
    let {getByRole, getAllByRole} = renderGroup({isReadOnly: true, className}, {className});
    let group = getByRole('group');
    let label = getAllByRole('checkbox')[0].closest('label');

    expect(group).toHaveAttribute('data-readonly');
    expect(group).toHaveClass('readonly');

    expect(label).toHaveAttribute('data-readonly');
    expect(label).toHaveClass('readonly');
  });

  it('should support validation state', () => {
    let className = ({validationState}) => validationState;
    let {getByRole, getAllByRole} = renderGroup({validationState: 'invalid', className}, {className});
    let group = getByRole('group');
    let checkbox = getAllByRole('checkbox')[0];
    let label = checkbox.closest('label');

    expect(group).toHaveAttribute('data-validation-state', 'invalid');
    expect(group).toHaveClass('invalid');

    expect(label).toHaveAttribute('data-validation-state', 'invalid');
    expect(label).toHaveClass('invalid');
  });

  it('should support required state', () => {
    let className = ({isRequired}) => isRequired ? 'required' : '';
    let {getByRole, getAllByRole} = renderGroup({isRequired: true, className}, {isRequired: true, className});
    let group = getByRole('group');
    let checkbox = getAllByRole('checkbox')[0];
    let label = checkbox.closest('label');

    expect(group).toHaveAttribute('data-required', 'true');
    expect(group).toHaveClass('required');

    expect(label).toHaveAttribute('data-required', 'true');
    expect(label).toHaveClass('required');
  });

  it('supports help text', () => {
    let {getByRole, getAllByRole} = render(
      <CheckboxGroup validationState="invalid">
        <Label>Test</Label>
        <Checkbox value="a">A</Checkbox>
        <Text slot="description">Description</Text>
        <Text slot="errorMessage">Error</Text>
      </CheckboxGroup>
    );

    let group = getByRole('group');
    expect(group).toHaveAttribute('aria-describedby');
    expect(group.getAttribute('aria-describedby').split(' ').map(id => document.getElementById(id).textContent).join(' ')).toBe('Description Error');

    let checkbox = getAllByRole('checkbox')[0];
    expect(checkbox).toHaveAttribute('aria-describedby');
    expect(checkbox.getAttribute('aria-describedby').split(' ').map(id => document.getElementById(id).textContent).join(' ')).toBe('Error Description');
  });

  it('should support render props', () => {
    let {getByRole} = render(
      <CheckboxGroup isRequired>
        {({isRequired}) => (
          <>
            <Label data-required={isRequired}>Test</Label>
            <Checkbox value="a">A</Checkbox>
          </>
        )}
      </CheckboxGroup>
    );
    let group = getByRole('group');
    let label = document.getElementById(group.getAttribute('aria-labelledby'));
    expect(label).toHaveAttribute('data-required', 'true');
  });
});
