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

import {pointerMap, render} from '@react-spectrum/test-utils-internal';
import React from 'react';
import {Switch, SwitchContext} from '../';
import userEvent from '@testing-library/user-event';

describe('Switch', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });
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

  it('should support data- props on label element', () => {
    let {getByRole} = render(<Switch data-foo="bar" >Test</Switch>);
    let s = getByRole('switch');
    let label = s.closest('label');
    expect(label).toHaveAttribute('data-foo', 'bar');
    expect(s).not.toHaveAttribute('data-foo');
  });

  it('should support render props', async () => {
    let {getByRole} = render(
      <Switch>{({isSelected}) => isSelected ? 'On' : 'Off'}</Switch>
    );
    let s = getByRole('switch');
    let label = s.closest('label');
    expect(s).not.toBeChecked();
    expect(label).toHaveTextContent('Off');

    await user.click(s);

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

  it('should support hover', async () => {
    let hoverStartSpy = jest.fn();
    let hoverChangeSpy = jest.fn();
    let hoverEndSpy = jest.fn();
    let {getByRole} = render(<Switch className={({isHovered}) => isHovered ? 'hover' : ''} onHoverStart={hoverStartSpy} onHoverChange={hoverChangeSpy} onHoverEnd={hoverEndSpy}>Test</Switch>);
    let s = getByRole('switch').closest('label');

    expect(s).not.toHaveAttribute('data-hovered');
    expect(s).not.toHaveClass('hover');

    await user.hover(s);
    expect(s).toHaveAttribute('data-hovered', 'true');
    expect(s).toHaveClass('hover');
    expect(hoverStartSpy).toHaveBeenCalledTimes(1);
    expect(hoverChangeSpy).toHaveBeenCalledTimes(1);

    await user.unhover(s);
    expect(s).not.toHaveAttribute('data-hovered');
    expect(s).not.toHaveClass('hover');
    expect(hoverEndSpy).toHaveBeenCalledTimes(1);
    expect(hoverChangeSpy).toHaveBeenCalledTimes(2);
  });

  it('should support focus ring', async () => {
    let {getByRole} = render(<Switch className={({isFocusVisible}) => isFocusVisible ? 'focus' : ''}>Test</Switch>);
    let s = getByRole('switch');
    let label = s.closest('label');

    expect(label).not.toHaveAttribute('data-focus-visible');
    expect(label).not.toHaveClass('focus');

    await user.tab();
    expect(document.activeElement).toBe(s);
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
        <Switch onBlur={onBlur} onFocus={onFocus} onFocusChange={onFocusChange}>Test</Switch>
        <button>Steal focus</button>
      </>
    );

    let s = getByRole('switch');
    let button = getByText('Steal focus');

    await user.tab();
    expect(document.activeElement).toBe(s);
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

  it('should support press state', async () => {
    let {getByRole} = render(<Switch className={({isPressed}) => isPressed ? 'pressed' : ''}>Test</Switch>);
    let s = getByRole('switch').closest('label');

    expect(s).not.toHaveAttribute('data-pressed');
    expect(s).not.toHaveClass('pressed');

    await user.pointer({target: s, keys: '[MouseLeft>]'});
    expect(s).toHaveAttribute('data-pressed', 'true');
    expect(s).toHaveClass('pressed');

    await user.pointer({target: s, keys: '[/MouseLeft]'});
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

  it('should support selected state', async () => {
    let onChange = jest.fn();
    let {getByRole} = render(<Switch onChange={onChange} className={({isSelected}) => isSelected ? 'selected' : ''}>Test</Switch>);
    let s = getByRole('switch');
    let label = s.closest('label');

    expect(s).not.toBeChecked();
    expect(label).not.toHaveAttribute('data-selected');
    expect(label).not.toHaveClass('selected');

    await user.click(s);
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(s).toBeChecked();
    expect(label).toHaveAttribute('data-selected', 'true');
    expect(label).toHaveClass('selected');

    await user.click(s);
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

  it('should render data- attributes only on the outer element', () => {
    let {getAllByTestId} = render(
      <Switch data-testid="switch-test">Test</Switch>
    );
    let outerEl = getAllByTestId('switch-test');
    expect(outerEl).toHaveLength(1);
    expect(outerEl[0]).toHaveClass('react-aria-Switch');
  });

  it('should support refs', () => {
    let ref = React.createRef();
    let {getByRole} = render(<Switch ref={ref}>Test</Switch>);
    expect(ref.current).toBe(getByRole('switch').closest('.react-aria-Switch'));
  });

  it('should support input ref', () => {
    let inputRef = React.createRef();
    let {getByRole} = render(<Switch inputRef={inputRef}>Test</Switch>);
    expect(inputRef.current).toBe(getByRole('switch'));
  });

  it('should support and merge input ref on context', () => {
    let inputRef = React.createRef();
    let contextInputRef = React.createRef();
    let {getByRole} = render(
      <SwitchContext.Provider value={{inputRef: contextInputRef}}>
        <Switch inputRef={inputRef}>Test</Switch>
      </SwitchContext.Provider>
    );
    expect(inputRef.current).toBe(getByRole('switch'));
    expect(contextInputRef.current).toBe(getByRole('switch'));
  });
});
