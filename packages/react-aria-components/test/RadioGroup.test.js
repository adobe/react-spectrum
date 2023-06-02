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

import {fireEvent, render} from '@react-spectrum/test-utils';
import {Label, Radio, RadioGroup, RadioGroupContext, Text} from '../';
import React from 'react';
import userEvent from '@testing-library/user-event';

let TestRadioGroup = ({groupProps, radioProps}) => (
  <RadioGroup {...groupProps}>
    <Label>Test</Label>
    <Radio {...radioProps} value="a">A</Radio>
    <Radio {...radioProps} value="b">B</Radio>
    <Radio {...radioProps} value="c">C</Radio>
  </RadioGroup>
);

let renderGroup = (groupProps, radioProps) => render(<TestRadioGroup {...{groupProps, radioProps}} />);

describe('RadioGroup', () => {
  it('should render a radio group with default classes', () => {
    let {getByRole, getAllByRole} = renderGroup();
    let group = getByRole('radiogroup');
    expect(group).toHaveAttribute('class', 'react-aria-RadioGroup');
    expect(group).toHaveAttribute('aria-labelledby');
    expect(document.getElementById(group.getAttribute('aria-labelledby'))).toHaveTextContent('Test');

    let radios = getAllByRole('radio');
    for (let radio of radios) {
      let label = radio.closest('label');
      expect(label).toHaveAttribute('class', 'react-aria-Radio');
    }
  });

  it('should render a radio group with custom classes', () => {
    let {getByRole, getAllByRole} = renderGroup({className: 'group'}, {className: 'radio'});
    let group = getByRole('radiogroup');
    expect(group).toHaveAttribute('class', 'group');
    let radios = getAllByRole('radio');
    for (let radio of radios) {
      let label = radio.closest('label');
      expect(label).toHaveAttribute('class', 'radio');
    }
  });

  it('should support DOM props', () => {
    let {getByRole, getAllByRole} = renderGroup({'data-foo': 'bar'}, {'data-test': 'test'});
    let group = getByRole('radiogroup');
    expect(group).toHaveAttribute('data-foo', 'bar');
    for (let radio of getAllByRole('radio')) {
      expect(radio.closest('label')).toHaveAttribute('data-test', 'test');
    }
  });

  it('should support render props', () => {
    let {getByRole} = render(
      <RadioGroup isRequired>
        {({isRequired}) => (
          <>
            <Label data-required={isRequired}>Test</Label>
            <Radio value="a">A</Radio>
            <Radio value="b">B</Radio>
            <Radio value="c">C</Radio>
          </>
        )}
      </RadioGroup>
    );
    let group = getByRole('radiogroup');
    let label = document.getElementById(group.getAttribute('aria-labelledby'));
    expect(label).toHaveAttribute('data-required', 'true');
  });

  it('should support slot', () => {
    let {getByRole} = render(
      <RadioGroupContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <TestRadioGroup groupProps={{slot: 'test'}} />
      </RadioGroupContext.Provider>
    );

    let group = getByRole('radiogroup');
    expect(group).toHaveAttribute('slot', 'test');
    expect(group).toHaveAttribute('aria-label', 'test');
  });

  it('should support hover', () => {
    let {getAllByRole} = renderGroup({}, {className: ({isHovered}) => isHovered ? 'hover' : ''});
    let radio = getAllByRole('radio')[0].closest('label');

    expect(radio).not.toHaveAttribute('data-hovered');
    expect(radio).not.toHaveClass('hover');

    userEvent.hover(radio);
    expect(radio).toHaveAttribute('data-hovered', 'true');
    expect(radio).toHaveClass('hover');

    userEvent.unhover(radio);
    expect(radio).not.toHaveAttribute('data-hovered');
    expect(radio).not.toHaveClass('hover');
  });

  it('should support focus ring', () => {
    let {getAllByRole} = renderGroup({}, {className: ({isFocusVisible}) => isFocusVisible ? 'focus' : ''});
    let radio = getAllByRole('radio')[0];
    let label = radio.closest('label');
    
    expect(label).not.toHaveAttribute('data-focus-visible');
    expect(label).not.toHaveClass('focus');

    userEvent.tab();
    expect(document.activeElement).toBe(radio);
    expect(label).toHaveAttribute('data-focus-visible', 'true');
    expect(label).toHaveClass('focus');

    userEvent.tab();
    expect(label).not.toHaveAttribute('data-focus-visible');
    expect(label).not.toHaveClass('focus');
  });

  it('should support press state', () => {
    let {getAllByRole} = renderGroup({}, {className: ({isPressed}) => isPressed ? 'pressed' : ''});
    let radio = getAllByRole('radio')[0].closest('label');

    expect(radio).not.toHaveAttribute('data-pressed');
    expect(radio).not.toHaveClass('pressed');

    fireEvent.mouseDown(radio);
    expect(radio).toHaveAttribute('data-pressed', 'true');
    expect(radio).toHaveClass('pressed');

    fireEvent.mouseUp(radio);
    expect(radio).not.toHaveAttribute('data-pressed');
    expect(radio).not.toHaveClass('pressed');
  });

  it('should support disabled state on radio', () => {
    let {getAllByRole} = renderGroup({}, {isDisabled: true, className: ({isDisabled}) => isDisabled ? 'disabled' : ''});
    let radio = getAllByRole('radio')[0];
    let label = radio.closest('label');

    expect(radio).toBeDisabled();
    expect(label).toHaveAttribute('data-disabled', 'true');
    expect(label).toHaveClass('disabled');
  });

  it('should support disabled state on group', () => {
    let className = ({isDisabled}) => isDisabled ? 'disabled' : '';
    let {getByRole, getAllByRole} = renderGroup({isDisabled: true, className}, {className});
    let group = getByRole('radiogroup');
    let radio = getAllByRole('radio')[0];
    let label = radio.closest('label');

    expect(group).toHaveAttribute('aria-disabled');
    expect(group).toHaveClass('disabled');

    expect(radio).toBeDisabled();
    expect(label).toHaveAttribute('data-disabled', 'true');
    expect(label).toHaveClass('disabled');
  });

  it('should support selected state', () => {
    let onChange = jest.fn();
    let {getAllByRole} = renderGroup({onChange}, {className: ({isSelected}) => isSelected ? 'selected' : ''});
    let radios = getAllByRole('radio');
    let label = radios[0].closest('label');

    expect(radios[0]).not.toBeChecked();
    expect(label).not.toHaveAttribute('data-selected');
    expect(label).not.toHaveClass('selected');

    userEvent.click(radios[0]);
    expect(onChange).toHaveBeenLastCalledWith('a');
    expect(radios[0]).toBeChecked();
    expect(label).toHaveAttribute('data-selected', 'true');
    expect(label).toHaveClass('selected');

    userEvent.click(radios[1]);
    expect(onChange).toHaveBeenLastCalledWith('b');
    expect(radios[0]).not.toBeChecked();
    expect(label).not.toHaveAttribute('data-selected');
    expect(label).not.toHaveClass('selected');
  });

  it('should support read only state', () => {
    let className = ({isReadOnly}) => isReadOnly ? 'readonly' : '';
    let {getByRole, getAllByRole} = renderGroup({isReadOnly: true, className}, {className});
    let group = getByRole('radiogroup');
    let label = getAllByRole('radio')[0].closest('label');

    expect(group).toHaveAttribute('aria-readonly');
    expect(group).toHaveClass('readonly');

    expect(label).toHaveAttribute('data-readonly');
    expect(label).toHaveClass('readonly');
  });

  it('should support validation state', () => {
    let className = ({validationState}) => validationState;
    let {getByRole, getAllByRole} = renderGroup({validationState: 'invalid', className}, {className});
    let group = getByRole('radiogroup');
    let radio = getAllByRole('radio')[0];
    let label = radio.closest('label');

    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(group).toHaveClass('invalid');

    expect(label).toHaveAttribute('data-validation-state', 'invalid');
    expect(label).toHaveClass('invalid');
  });

  it('should support required state', () => {
    let className = ({isRequired}) => isRequired ? 'required' : '';
    let {getByRole, getAllByRole} = renderGroup({isRequired: true, className}, {className});
    let group = getByRole('radiogroup');
    let radio = getAllByRole('radio')[0];
    let label = radio.closest('label');

    expect(group).toHaveAttribute('aria-required', 'true');
    expect(group).toHaveClass('required');

    expect(label).toHaveAttribute('data-required', 'true');
    expect(label).toHaveClass('required');
  });

  it('should support orientation', () => {
    let {getByRole} = renderGroup({orientation: 'horizontal', className: ({orientation}) => orientation});
    let group = getByRole('radiogroup');

    expect(group).toHaveAttribute('aria-orientation', 'horizontal');
    expect(group).toHaveClass('horizontal');
  });

  it('supports help text', () => {
    let {getByRole, getAllByRole} = render(
      <RadioGroup validationState="invalid">
        <Label>Test</Label>
        <Radio value="a">A</Radio>
        <Text slot="description">Description</Text>
        <Text slot="errorMessage">Error</Text>
      </RadioGroup>
    );

    let group = getByRole('radiogroup');
    expect(group).toHaveAttribute('aria-describedby');
    expect(group.getAttribute('aria-describedby').split(' ').map(id => document.getElementById(id).textContent).join(' ')).toBe('Description Error');

    let radio = getAllByRole('radio')[0];
    expect(radio).toHaveAttribute('aria-describedby');
    expect(radio.getAttribute('aria-describedby').split(' ').map(id => document.getElementById(id).textContent).join(' ')).toBe('Error Description');
  });
});
