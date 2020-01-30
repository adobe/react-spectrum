import {cleanup, fireEvent, render, within} from '@testing-library/react';
import {NumberField} from '../';
import NumberInput from '@react/react-spectrum/NumberInput';
import React from 'react';
import {triggerPress} from '@react-spectrum/test-utils';
import userEvent from '@testing-library/user-event';

describe('NumberField', function () {
  let onChangeSpy = jest.fn();

  afterEach(() => {
    onChangeSpy.mockClear();
    cleanup();
  });

  function renderNumberField(Component, props = {}) {
    let {container} = render(<Component {...props} />);

    container = within(container).queryByRole('group');
    let textField = container.firstChild;
    let buttons = within(container).queryAllByRole('button');
    let incrementButton = buttons[0];
    let decrementButton = buttons[1];
    // in v3 TextField is wrapped with one more div
    if (Component === NumberField) {
      textField = textField.firstChild;
    }
    return {
      container,
      textField,
      buttons,
      incrementButton,
      decrementButton
    };
  }

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
    ${'v2 NumberField'} | ${NumberInput}
  `('$Name has correct aria and props', ({Component}) => {
    let {
      container,
      textField,
      incrementButton,
      decrementButton
    } = renderNumberField(Component);

    expect(container).toBeTruthy();
    expect(container).toHaveAttribute('role', 'group');
    expect(textField).toBeTruthy();
    expect(textField).toHaveAttribute('type', 'number');
    expect(incrementButton).toBeTruthy();
    expect(decrementButton).toBeTruthy();
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
    ${'v2 NumberField'} | ${NumberInput}
  `('$Name handles input change', ({Component}) => {
    let {textField} = renderNumberField(Component, {onChange: onChangeSpy});

    userEvent.type(textField, '5');
    expect(onChangeSpy).toHaveBeenCalledWith(5);
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
    ${'v2 NumberField'} | ${NumberInput}
  `('$Name handles input change with custom step number', ({Component}) => {
    let {textField, incrementButton} = renderNumberField(Component, {onChange: onChangeSpy, step: 5});

    userEvent.type(textField, '2');
    expect(onChangeSpy).toHaveBeenCalledWith(2);
    onChangeSpy.mockReset();
    triggerPress(incrementButton);
    expect(onChangeSpy).toHaveBeenCalledWith(7);
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
    ${'v2 NumberField'} | ${NumberInput}
  `('$Name increment value by one when increment button is pressed', ({Component}) => {
    let {incrementButton} = renderNumberField(Component, {onChange: onChangeSpy});

    triggerPress(incrementButton);
    expect(onChangeSpy).toHaveBeenCalledWith(1);
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
    ${'v2 NumberField'} | ${NumberInput}
  `('$Name decrement value by one when increment button is pressed', ({Component}) => {
    let {decrementButton} = renderNumberField(Component, {onChange: onChangeSpy});

    triggerPress(decrementButton);
    expect(onChangeSpy).toHaveBeenCalledWith(-1);
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
    ${'v2 NumberField'} | ${NumberInput}
  `('$Name use step for increasing and decreasing value', ({Component}) => {
    let {decrementButton, incrementButton} = renderNumberField(Component, {step: 10, onChange: onChangeSpy});

    triggerPress(decrementButton);
    expect(onChangeSpy).toHaveBeenCalledWith(-10);

    onChangeSpy.mockReset();
    triggerPress(incrementButton);
    expect(onChangeSpy).toHaveBeenCalledWith(0);
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
    ${'v2 NumberField'} | ${NumberInput}
  `('$Name decrement value when scrolling downwards', ({Component}) => {

    let {textField} = renderNumberField(Component, {onChange: onChangeSpy});

    fireEvent.focus(textField);
    fireEvent.wheel(textField, {deltaY: 10});
    expect(onChangeSpy).toHaveBeenCalledWith(-1);
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
    ${'v2 NumberField'} | ${NumberInput}
  `('$Name increment value when scrolling upwards', ({Component}) => {
    let {textField} = renderNumberField(Component, {onChange: onChangeSpy});

    fireEvent.focus(textField);
    fireEvent.wheel(textField, {deltaY: -10});
    expect(onChangeSpy).toHaveBeenCalledWith(1);
  });



  // clone this test -> use value instad of default value
  // textfield should be undefined
  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
  `('$Name increment button can toggle aria label', ({Component}) => {
    let {
      container,
      textField,
      incrementButton,
      decrementButton
    } = renderNumberField(Component, {onChange: onChangeSpy, minValue: 3, defaultValue: 2});

    expect(container).toBeTruthy();
    expect(container).toHaveAttribute('role', 'group');
    expect(container).toHaveAttribute('aria-invalid', 'true');

    triggerPress(incrementButton);
    expect(container).toHaveAttribute('aria-invalid', 'false');
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
  `('$Name decrement button can toggle aria label', ({Component}) => {
    let {
      container,
      textField,
      incrementButton,
      decrementButton
    } = renderNumberField(Component, {onChange: onChangeSpy, maxValue: 3, defaultValue: 4});

    expect(container).toBeTruthy();
    expect(container).toHaveAttribute('role', 'group');
    expect(container).toHaveAttribute('aria-invalid', 'true');

    triggerPress(decrementButton);
    expect(container).toHaveAttribute('aria-invalid', 'false');
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
  `('$Name controlled input', ({Component}) => {
    let {
      container,
      textField,
      incrementButton,
      decrementButton
    } = renderNumberField(Component, {onChange: onChangeSpy, minValue: 3, value: 3});

    expect(container).toBeTruthy();
    expect(container).toHaveAttribute('role', 'group');
    expect(container).toHaveAttribute('aria-invalid', 'false');
    triggerPress(decrementButton);
    expect(onChangeSpy).toHaveBeenCalledTimes(0);
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
  `('$Name can hide step buttons', ({Component}) => {
    let {textField, incrementButton, decrementButton} = renderNumberField(Component, {showStepper: false});

    expect(textField).toBeDefined();
    expect(incrementButton).not.toBeDefined();
    expect(decrementButton).not.toBeDefined();
  });
});
