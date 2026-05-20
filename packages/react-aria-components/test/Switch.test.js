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

import {act, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {
  Switch as AriaSwitch,
  SwitchButton,
  SwitchContext,
  SwitchField,
  SwitchFieldContext
} from '../src/Switch';
import {FieldError} from '../src/FieldError';
import {Form} from '../src/Form';
import React, {forwardRef} from 'react';
import {Text} from '../src/Text';
import userEvent from '@testing-library/user-event';

const SwitchExample = forwardRef(function SwitchExample(props, ref) {
  return (
    <SwitchField {...props} ref={ref}>
      <SwitchButton
        className={props.buttonClassName}
        onHoverStart={props.onHoverStart}
        onHoverEnd={props.onHoverEnd}
        onHoverChange={props.onHoverChange}>
        {props.children}
      </SwitchButton>
      {props.description && <Text slot="description">{props.description}</Text>}
      <FieldError />
    </SwitchField>
  );
});

const SwitchLegacy = forwardRef(function SwitchLegacy(props, ref) {
  return <AriaSwitch {...props} ref={ref} className={props.className || props.buttonClassName} />;
});

describe.each(['Switch', 'SwitchField'])('%s', comp => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  let Switch = comp === 'SwitchField' ? SwitchExample : SwitchLegacy;
  let findRoot = el =>
    comp === 'SwitchField' ? el.closest('label').parentElement : el.closest('label');

  it('should render a s with default class', () => {
    let {getByRole} = render(<Switch>Test</Switch>);
    let s = getByRole('switch').closest('label');
    expect(findRoot(s)).toHaveAttribute('class', `react-aria-${comp}`);
  });

  it('should render a s with custom class', () => {
    let {getByRole} = render(<Switch className="test">Test</Switch>);
    let s = getByRole('switch').closest('label');
    expect(findRoot(s)).toHaveAttribute('class', 'test');
  });

  it('should support data- props on label element', () => {
    let {getByRole} = render(<Switch data-foo="bar">Test</Switch>);
    let s = getByRole('switch');
    let label = s.closest('label');
    expect(findRoot(label)).toHaveAttribute('data-foo', 'bar');
    expect(s).not.toHaveAttribute('data-foo');
  });

  it('should support custom render function', () => {
    let {getByRole} = render(
      <Switch
        render={props =>
          comp === 'SwitchField' ? (
            <div {...props} data-custom="bar" />
          ) : (
            // eslint-disable-next-line jsx-a11y/label-has-associated-control
            <label {...props} data-custom="bar" />
          )
        }>
        Test
      </Switch>
    );
    let checkbox = getByRole('switch').closest('label');
    expect(findRoot(checkbox)).toHaveAttribute('data-custom', 'bar');
  });

  it('should support render props', async () => {
    let {getByRole} = render(<Switch>{({isSelected}) => (isSelected ? 'On' : 'Off')}</Switch>);
    let s = getByRole('switch');
    let label = s.closest('label');
    expect(s).not.toBeChecked();
    expect(label).toHaveTextContent('Off');

    await user.click(s);

    expect(s).toBeChecked();
    expect(label).toHaveTextContent('On');
  });

  it('should support slot', () => {
    let Context = comp === 'SwitchField' ? SwitchFieldContext : SwitchContext;
    let {getByRole} = render(
      <Context.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <Switch slot="test">Test</Switch>
      </Context.Provider>
    );

    let s = getByRole('switch');
    expect(findRoot(s)).toHaveAttribute('slot', 'test');
    expect(s).toHaveAttribute('aria-label', 'test');
  });

  it('should support hover', async () => {
    let hoverStartSpy = jest.fn();
    let hoverChangeSpy = jest.fn();
    let hoverEndSpy = jest.fn();
    let {getByRole} = render(
      <Switch
        buttonClassName={({isHovered}) => (isHovered ? 'hover' : '')}
        onHoverStart={hoverStartSpy}
        onHoverChange={hoverChangeSpy}
        onHoverEnd={hoverEndSpy}>
        Test
      </Switch>
    );
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
    let {getByRole} = render(
      <Switch buttonClassName={({isFocusVisible}) => (isFocusVisible ? 'focus' : '')}>Test</Switch>
    );
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
        <Switch onBlur={onBlur} onFocus={onFocus} onFocusChange={onFocusChange}>
          Test
        </Switch>
        <button>Steal focus</button>
      </>
    );

    let s = getByRole('switch');
    let button = getByText('Steal focus');

    await user.tab();
    expect(document.activeElement).toBe(s);
    expect(onBlur).not.toHaveBeenCalled();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onFocusChange).toHaveBeenCalledTimes(1); // triggered by onFocus
    expect(onFocusChange).toHaveBeenLastCalledWith(true);

    await user.tab();
    expect(document.activeElement).toBe(button);
    expect(onBlur).toHaveBeenCalled();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onFocusChange).toHaveBeenCalledTimes(2); // triggered by onBlur
    expect(onFocusChange).toHaveBeenLastCalledWith(false);
  });

  it('should support press state', async () => {
    let onPress = jest.fn();
    let onClick = jest.fn();
    let onClickCapture = jest.fn();
    let {getByRole} = render(
      <Switch
        buttonClassName={({isPressed}) => (isPressed ? 'pressed' : '')}
        onPress={onPress}
        onClick={onClick}
        onClickCapture={onClickCapture}>
        Test
      </Switch>
    );
    let s = getByRole('switch').closest('label');

    expect(s).not.toHaveAttribute('data-pressed');
    expect(s).not.toHaveClass('pressed');

    await user.pointer({target: s, keys: '[MouseLeft>]'});
    expect(s).toHaveAttribute('data-pressed', 'true');
    expect(s).toHaveClass('pressed');

    await user.pointer({target: s, keys: '[/MouseLeft]'});
    expect(s).not.toHaveAttribute('data-pressed');
    expect(s).not.toHaveClass('pressed');

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClickCapture).toHaveBeenCalledTimes(1);
  });

  it('should support press state with keyboard', async () => {
    let onPress = jest.fn();
    let onClick = jest.fn();
    let {getByRole} = render(
      <Switch
        buttonClassName={({isPressed}) => (isPressed ? 'pressed' : '')}
        onPress={onPress}
        onClick={onClick}>
        Test
      </Switch>
    );
    let s = getByRole('switch').closest('label');

    expect(s).not.toHaveAttribute('data-pressed');
    expect(s).not.toHaveClass('pressed');

    await user.tab();
    await user.keyboard('[Space>]');
    expect(s).toHaveAttribute('data-pressed', 'true');
    expect(s).toHaveClass('pressed');

    await user.keyboard('[/Space]');
    expect(s).not.toHaveAttribute('data-pressed');
    expect(s).not.toHaveClass('pressed');

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should support disabled state', () => {
    let {getByRole} = render(
      <Switch isDisabled className={({isDisabled}) => (isDisabled ? 'disabled' : '')}>
        Test
      </Switch>
    );
    let s = getByRole('switch');
    let label = s.closest('label');

    expect(s).toBeDisabled();
    expect(label).toHaveAttribute('data-disabled', 'true');
    expect(findRoot(label)).toHaveAttribute('data-disabled', 'true');
    expect(findRoot(label)).toHaveClass('disabled');
  });

  it('should support selected state', async () => {
    let onChange = jest.fn();
    let {getByRole} = render(
      <Switch
        onChange={onChange}
        buttonClassName={({isSelected}) => (isSelected ? 'selected' : '')}>
        Test
      </Switch>
    );
    let s = getByRole('switch');
    let label = s.closest('label');

    expect(s).not.toBeChecked();
    expect(label).not.toHaveAttribute('data-selected');
    expect(findRoot(label)).not.toHaveAttribute('data-selected');
    expect(label).not.toHaveClass('selected');

    await user.click(s);
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(s).toBeChecked();
    expect(label).toHaveAttribute('data-selected', 'true');
    expect(findRoot(label)).toHaveAttribute('data-selected');
    expect(label).toHaveClass('selected');

    await user.click(s);
    expect(onChange).toHaveBeenLastCalledWith(false);
    expect(s).not.toBeChecked();
    expect(label).not.toHaveAttribute('data-selected');
    expect(findRoot(label)).not.toHaveAttribute('data-selected');
    expect(label).not.toHaveClass('selected');
  });

  it('should support read only state', () => {
    let {getByRole} = render(
      <Switch isReadOnly buttonClassName={({isReadOnly}) => (isReadOnly ? 'readonly' : '')}>
        Test
      </Switch>
    );
    let s = getByRole('switch');
    let label = s.closest('label');

    expect(s).toHaveAttribute('aria-readonly', 'true');
    expect(label).toHaveAttribute('data-readonly');
    expect(findRoot(label)).toHaveAttribute('data-readonly');
    expect(label).toHaveClass('readonly');
  });

  it('should render data- attributes only on the outer element', () => {
    let {getAllByTestId} = render(<Switch data-testid="switch-test">Test</Switch>);
    let outerEl = getAllByTestId('switch-test');
    expect(outerEl).toHaveLength(1);
    expect(outerEl[0]).toHaveClass(`react-aria-${comp}`);
  });

  it('should support refs', () => {
    let ref = React.createRef();
    let {getByRole} = render(<Switch ref={ref}>Test</Switch>);
    expect(ref.current).toBe(findRoot(getByRole('switch')));
  });

  it('should support input ref', () => {
    let inputRef = React.createRef();
    let {getByRole} = render(<Switch inputRef={inputRef}>Test</Switch>);
    expect(inputRef.current).toBe(getByRole('switch'));
  });

  it('should support and merge input ref on context', () => {
    let inputRef = React.createRef();
    let contextInputRef = React.createRef();
    let Context = comp === 'SwitchField' ? SwitchFieldContext : SwitchContext;
    let {getByRole} = render(
      <Context.Provider value={{inputRef: contextInputRef}}>
        <Switch inputRef={inputRef}>Test</Switch>
      </Context.Provider>
    );
    expect(inputRef.current).toBe(getByRole('switch'));
    expect(contextInputRef.current).toBe(getByRole('switch'));
  });

  it('should support form prop', () => {
    let {getByRole} = render(<Switch form="test">Test</Switch>);
    let input = getByRole('switch');
    expect(input).toHaveAttribute('form', 'test');
  });

  if (comp === 'SwitchField') {
    it('should support description', () => {
      let {getByRole} = render(<Switch description="hello">Test</Switch>);
      let checkbox = getByRole('switch');
      expect(checkbox).toHaveAttribute('aria-describedby');
      expect(document.getElementById(checkbox.getAttribute('aria-describedby'))).toHaveTextContent(
        'hello'
      );
    });

    it('should update aria-describedby when changing description prop', () => {
      let {getByRole, rerender} = render(<Switch>Test</Switch>);
      let checkbox = getByRole('switch');
      expect(checkbox).not.toHaveAttribute('aria-describedby');

      rerender(<Switch description="hello">Test</Switch>);
      expect(checkbox).toHaveAttribute('aria-describedby');

      rerender(<Switch>Test</Switch>);
      expect(checkbox).not.toHaveAttribute('aria-describedby');
    });

    it('should support required state', async () => {
      let {getByRole} = render(
        <Form>
          <Switch isRequired buttonClassName={({isRequired}) => (isRequired ? 'required' : '')}>
            Test
          </Switch>
        </Form>
      );
      let checkbox = getByRole('switch');
      let label = checkbox.closest('label');
      let field = label.parentElement;

      expect(checkbox).toHaveAttribute('required');
      expect(label).toHaveAttribute('data-required', 'true');
      expect(label).toHaveClass('required');
      expect(field).toHaveAttribute('data-required', 'true');

      expect(checkbox).not.toHaveAttribute('aria-describedby');
      act(() => checkbox.form.requestSubmit());

      expect(checkbox).toHaveAttribute('aria-invalid', 'true');
      expect(label).toHaveAttribute('data-invalid', 'true');
      expect(field).toHaveAttribute('data-invalid', 'true');

      expect(checkbox).toHaveAttribute('aria-describedby');
      expect(document.getElementById(checkbox.getAttribute('aria-describedby'))).toHaveTextContent(
        'Constraints not satisfied'
      );

      await user.click(label);

      expect(checkbox).not.toHaveAttribute('aria-invalid');
      expect(label).not.toHaveAttribute('data-invalid');
      expect(field).not.toHaveAttribute('data-invalid');
      expect(checkbox).not.toHaveAttribute('aria-describedby');
    });
  }
});
