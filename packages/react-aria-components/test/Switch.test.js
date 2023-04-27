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
import React from 'react';
import {Switch, SwitchContext} from '../';
import userEvent from '@testing-library/user-event';

describe('Switch', () => {
  it('should render a s with default class', () => {
    let {getByRole} = render(<Switch>Test</Switch>);
    let s = getByRole('switch').closest('label');
    expect(s).toHaveAttribute('class', 'react-aria-Switch');
  });

  it('should render a s with custom class', () => {
    let {getByRole} = render(<Switch className="test">Test</Switch>);
    let s = getByRole('switch').closest('label');
    expect(s).toHaveAttribute('class', 'test');
  });

  it('should support DOM props', () => {
    let {getByRole} = render(<Switch data-foo="bar">Test</Switch>);
    let s = getByRole('switch');
    expect(s).toHaveAttribute('data-foo', 'bar');
  });

  it('should support render props', () => {
    let {getByRole} = render(
      <Switch>{({isSelected}) => isSelected ? 'On' : 'Off'}</Switch>
    );
    let s = getByRole('switch');
    let label = s.closest('label');
    expect(s).not.toBeChecked();
    expect(label).toHaveTextContent('Off');
    
    userEvent.click(s);
    
    expect(s).toBeChecked();
    expect(label).toHaveTextContent('On');
  });

  it('should support slot', () => {
    let {getByRole} = render(
      <SwitchContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <Switch slot="test">Test</Switch>
      </SwitchContext.Provider>
    );

    let s = getByRole('switch');
    expect(s.closest('label')).toHaveAttribute('slot', 'test');
    expect(s).toHaveAttribute('aria-label', 'test');
  });

  it('should support hover', () => {
    let {getByRole} = render(<Switch className={({isHovered}) => isHovered ? 'hover' : ''}>Test</Switch>);
    let s = getByRole('switch').closest('label');

    expect(s).not.toHaveAttribute('data-hovered');
    expect(s).not.toHaveClass('hover');

    userEvent.hover(s);
    expect(s).toHaveAttribute('data-hovered', 'true');
    expect(s).toHaveClass('hover');

    userEvent.unhover(s);
    expect(s).not.toHaveAttribute('data-hovered');
    expect(s).not.toHaveClass('hover');
  });

  it('should support focus ring', () => {
    let {getByRole} = render(<Switch className={({isFocusVisible}) => isFocusVisible ? 'focus' : ''}>Test</Switch>);
    let s = getByRole('switch');
    let label = s.closest('label');
    
    expect(label).not.toHaveAttribute('data-focus-visible');
    expect(label).not.toHaveClass('focus');

    userEvent.tab();
    expect(document.activeElement).toBe(s);
    expect(label).toHaveAttribute('data-focus-visible', 'true');
    expect(label).toHaveClass('focus');

    userEvent.tab();
    expect(label).not.toHaveAttribute('data-focus-visible');
    expect(label).not.toHaveClass('focus');
  });

  it('should support press state', () => {
    let {getByRole} = render(<Switch className={({isPressed}) => isPressed ? 'pressed' : ''}>Test</Switch>);
    let s = getByRole('switch').closest('label');

    expect(s).not.toHaveAttribute('data-pressed');
    expect(s).not.toHaveClass('pressed');

    fireEvent.mouseDown(s);
    expect(s).toHaveAttribute('data-pressed', 'true');
    expect(s).toHaveClass('pressed');

    fireEvent.mouseUp(s);
    expect(s).not.toHaveAttribute('data-pressed');
    expect(s).not.toHaveClass('pressed');
  });

  it('should support disabled state', () => {
    let {getByRole} = render(<Switch isDisabled className={({isDisabled}) => isDisabled ? 'disabled' : ''}>Test</Switch>);
    let s = getByRole('switch');
    let label = s.closest('label');

    expect(s).toBeDisabled();
    expect(label).toHaveAttribute('data-disabled', 'true');
    expect(label).toHaveClass('disabled');
  });

  it('should support selected state', () => {
    let onChange = jest.fn();
    let {getByRole} = render(<Switch onChange={onChange} className={({isSelected}) => isSelected ? 'selected' : ''}>Test</Switch>);
    let s = getByRole('switch');
    let label = s.closest('label');

    expect(s).not.toBeChecked();
    expect(label).not.toHaveAttribute('data-selected');
    expect(label).not.toHaveClass('selected');

    userEvent.click(s);
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(s).toBeChecked();
    expect(label).toHaveAttribute('data-selected', 'true');
    expect(label).toHaveClass('selected');

    userEvent.click(s);
    expect(onChange).toHaveBeenLastCalledWith(false);
    expect(s).not.toBeChecked();
    expect(label).not.toHaveAttribute('data-selected');
    expect(label).not.toHaveClass('selected');
  });

  it('should support read only state', () => {
    let {getByRole} = render(<Switch isReadOnly className={({isReadOnly}) => isReadOnly ? 'readonly' : ''}>Test</Switch>);
    let s = getByRole('switch');
    let label = s.closest('label');

    expect(s).toHaveAttribute('aria-readonly', 'true');
    expect(label).toHaveAttribute('data-readonly');
    expect(label).toHaveClass('readonly');
  });
});
