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

import {Checkbox, CheckboxContext} from '../';
import {fireEvent, pointerMap, render} from '@react-spectrum/test-utils-internal';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('Checkbox', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('should render a checkbox with default class', () => {
    let {getByRole} = render(<Checkbox>Test</Checkbox>);
    let checkbox = getByRole('checkbox').closest('label');
    expect(checkbox).toHaveAttribute('class', 'react-aria-Checkbox');
  });

  it('should render a checkbox with custom class', () => {
    let {getByRole} = render(<Checkbox className="test">Test</Checkbox>);
    let checkbox = getByRole('checkbox').closest('label');
    expect(checkbox).toHaveAttribute('class', 'test');
  });

  it('should support DOM props', () => {
    let {getByRole} =  render(<Checkbox data-foo="bar">Test</Checkbox>);
    let checkbox = getByRole('checkbox').closest('label');
    expect(checkbox).toHaveAttribute('data-foo', 'bar');
    expect(getByRole('checkbox')).not.toHaveAttribute('data-foo', 'bar');
  });

  it('should support slot', () => {
    let {getByRole} = render(
      <CheckboxContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <Checkbox slot="test">Test</Checkbox>
      </CheckboxContext.Provider>
    );

    let checkbox = getByRole('checkbox');
    expect(checkbox.closest('label')).toHaveAttribute('slot', 'test');
    expect(checkbox).toHaveAttribute('aria-label', 'test');
  });

  it('should support hover', async () => {
    let hoverStartSpy = jest.fn();
    let hoverChangeSpy = jest.fn();
    let hoverEndSpy = jest.fn();
    let {getByRole} = render(<Checkbox className={({isHovered}) => isHovered ? 'hover' : ''} onHoverStart={hoverStartSpy} onHoverChange={hoverChangeSpy} onHoverEnd={hoverEndSpy}>Test</Checkbox>);
    let checkbox = getByRole('checkbox').closest('label');

    expect(checkbox).not.toHaveAttribute('data-hovered');
    expect(checkbox).not.toHaveClass('hover');

    await user.hover(checkbox);
    expect(checkbox).toHaveAttribute('data-hovered', 'true');
    expect(checkbox).toHaveClass('hover');
    expect(hoverStartSpy).toHaveBeenCalledTimes(1);
    expect(hoverChangeSpy).toHaveBeenCalledTimes(1);

    await user.unhover(checkbox);
    expect(checkbox).not.toHaveAttribute('data-hovered');
    expect(checkbox).not.toHaveClass('hover');
    expect(hoverEndSpy).toHaveBeenCalledTimes(1);
    expect(hoverChangeSpy).toHaveBeenCalledTimes(2);
  });

  it('should support focus ring', async () => {
    let {getByRole} = render(<Checkbox className={({isFocusVisible}) => isFocusVisible ? 'focus' : ''}>Test</Checkbox>);
    let checkbox = getByRole('checkbox');
    let label = checkbox.closest('label');

    expect(label).not.toHaveAttribute('data-focus-visible');
    expect(label).not.toHaveClass('focus');

    await user.tab();
    expect(document.activeElement).toBe(checkbox);
    expect(label).toHaveAttribute('data-focus-visible', 'true');
    expect(label).toHaveClass('focus');

    await user.tab();
    expect(label).not.toHaveAttribute('data-focus-visible');
    expect(label).not.toHaveClass('focus');
  });

  it('should support focus events', async () => {
    let onBlur = jest.fn();
    let onFocus = jest.fn();
    let onFocusChange = jest.fn();
    let {getByRole, getByText} = render(
      <>
        <Checkbox onFocus={onFocus} onFocusChange={onFocusChange} onBlur={onBlur}>Test</Checkbox>
        <button>Steal focus</button>
      </>
    );

    let checkbox = getByRole('checkbox');
    let button = getByText('Steal focus');

    await user.tab();
    expect(document.activeElement).toBe(checkbox);
    expect(onBlur).not.toHaveBeenCalled();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onFocusChange).toHaveBeenCalledTimes(1);  // triggered by onFocus
    expect(onFocusChange).toHaveBeenLastCalledWith(true);

    await user.tab();
    expect(document.activeElement).toBe(button);
    expect(onBlur).toHaveBeenCalled();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onFocusChange).toHaveBeenCalledTimes(2);  // triggered by onBlur
    expect(onFocusChange).toHaveBeenLastCalledWith(false);
  });

  it('should support press state', () => {
    let {getByRole} = render(<Checkbox className={({isPressed}) => isPressed ? 'pressed' : ''}>Test</Checkbox>);
    let checkbox = getByRole('checkbox').closest('label');

    expect(checkbox).not.toHaveAttribute('data-pressed');
    expect(checkbox).not.toHaveClass('pressed');

    fireEvent.mouseDown(checkbox);
    expect(checkbox).toHaveAttribute('data-pressed', 'true');
    expect(checkbox).toHaveClass('pressed');

    fireEvent.mouseUp(checkbox);
    expect(checkbox).not.toHaveAttribute('data-pressed');
    expect(checkbox).not.toHaveClass('pressed');
  });

  it('should support disabled state', () => {
    let {getByRole} = render(<Checkbox isDisabled className={({isDisabled}) => isDisabled ? 'disabled' : ''}>Test</Checkbox>);
    let checkbox = getByRole('checkbox');
    let label = checkbox.closest('label');

    expect(checkbox).toBeDisabled();
    expect(label).toHaveAttribute('data-disabled', 'true');
    expect(label).toHaveClass('disabled');
  });

  it('should support selected state', async () => {
    let onChange = jest.fn();
    let {getByRole} = render(<Checkbox onChange={onChange} className={({isSelected}) => isSelected ? 'selected' : ''}>Test</Checkbox>);
    let checkbox = getByRole('checkbox');
    let label = checkbox.closest('label');

    expect(checkbox).not.toBeChecked();
    expect(label).not.toHaveAttribute('data-selected');
    expect(label).not.toHaveClass('selected');

    await user.click(checkbox);
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(checkbox).toBeChecked();
    expect(label).toHaveAttribute('data-selected', 'true');
    expect(label).toHaveClass('selected');

    await user.click(checkbox);
    expect(onChange).toHaveBeenLastCalledWith(false);
    expect(checkbox).not.toBeChecked();
    expect(label).not.toHaveAttribute('data-selected');
    expect(label).not.toHaveClass('selected');
  });

  it('should support indeterminate state', () => {
    let {getByRole} = render(<Checkbox isIndeterminate className={({isIndeterminate}) => isIndeterminate ? 'indeterminate' : ''}>Test</Checkbox>);
    let checkbox = getByRole('checkbox');
    let label = checkbox.closest('label');

    expect(checkbox).toHaveProperty('indeterminate', true);
    expect(label).toHaveAttribute('data-indeterminate');
    expect(label).toHaveClass('indeterminate');
  });

  it('should support read only state', () => {
    let {getByRole} = render(<Checkbox isReadOnly className={({isReadOnly}) => isReadOnly ? 'readonly' : ''}>Test</Checkbox>);
    let checkbox = getByRole('checkbox');
    let label = checkbox.closest('label');

    expect(checkbox).toHaveAttribute('aria-readonly', 'true');
    expect(label).toHaveAttribute('data-readonly');
    expect(label).toHaveClass('readonly');
  });

  it('should support invalid state', () => {
    let {getByRole} = render(<Checkbox isInvalid className={({isInvalid}) => isInvalid ? 'invalid' : ''}>Test</Checkbox>);
    let checkbox = getByRole('checkbox');
    let label = checkbox.closest('label');

    expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    expect(label).toHaveAttribute('data-invalid', 'true');
    expect(label).toHaveClass('invalid');
  });

  it('should support required state', () => {
    let {getByRole} = render(<Checkbox isRequired className={({isRequired}) => isRequired ? 'required' : ''}>Test</Checkbox>);
    let checkbox = getByRole('checkbox');
    let label = checkbox.closest('label');

    expect(checkbox).toHaveAttribute('required');
    expect(label).toHaveAttribute('data-required', 'true');
    expect(label).toHaveClass('required');
  });

  it('should support render props', async () => {
    let {getByRole} =  render(<Checkbox>{({isSelected}) => isSelected ? 'Selected' : 'Not Selected'}</Checkbox>);
    let checkbox = getByRole('checkbox').closest('label');

    expect(checkbox).toHaveTextContent('Not Selected');

    await user.click(checkbox);
    expect(checkbox).toHaveTextContent('Selected');
  });

  it('should support refs', () => {
    let ref = React.createRef();
    let {getByRole} = render(<Checkbox ref={ref}>Test</Checkbox>);
    expect(ref.current).toBe(getByRole('checkbox').closest('.react-aria-Checkbox'));
  });

  it('should support input ref', () => {
    let inputRef = React.createRef();
    let {getByRole} = render(<Checkbox inputRef={inputRef}>Test</Checkbox>);
    expect(inputRef.current).toBe(getByRole('checkbox'));
  });

  it('should support and merge input ref on context', () => {
    let inputRef = React.createRef();
    let contextInputRef = React.createRef();
    let {getByRole} = render(
      <CheckboxContext.Provider value={{inputRef: contextInputRef}}>
        <Checkbox inputRef={inputRef}>Test</Checkbox>
      </CheckboxContext.Provider>
    );
    expect(inputRef.current).toBe(getByRole('checkbox'));
    expect(contextInputRef.current).toBe(getByRole('checkbox'));
  });
});
