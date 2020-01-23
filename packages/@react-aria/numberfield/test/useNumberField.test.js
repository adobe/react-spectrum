import React from 'react';
import {renderHook} from 'react-hooks-testing-library';
import {useNumberField} from '../';

describe('useNumberField tests', function () {

  let setValue = jest.fn();
  let state = {};
  let props = {};
  let preventDefault = jest.fn();
  let increment = jest.fn();
  let decrement = jest.fn();
  let minValue = 0;
  let maxValue = 20;
  let event = (key) => ({
    key,
    preventDefault
  });

  let renderNumberFieldHook = (props) => {
    let {result} = renderHook(() => useNumberField(props, state));
    return result.current;
  };

  beforeEach(() => {
    state.value = 1;
    state.ref = {current: 1};
    state.onChange = setValue;
    state.increment = increment;
    state.decrement = decrement;
    state.validationState = false;
  });

  afterEach(() => {
    preventDefault.mockClear();
    setValue.mockClear();
    increment.mockClear();
    decrement.mockClear();
    state.value = 1;
    state.validationState = false
    state.ref = {};
  });

  it('handles defaults', () => {
    const elementMock = { addEventListener: jest.fn() };
    jest.spyOn(document, 'getElementById').mockImplementation(() => elementMock);
    let numberFieldProps = renderNumberFieldHook({defaultValue: 1});
    expect(typeof numberFieldProps.incrementButtonProps.onPress).toBe('function');
    expect(typeof numberFieldProps.decrementButtonProps.onPress).toBe('function');
  });

  it('increment button can toggle valid state', function () {
    const elementMock = { addEventListener: jest.fn() };
    jest.spyOn(document, 'getElementById').mockImplementation(() => elementMock);
    let numberFieldProps = renderNumberFieldHook({defaultValue: 1, maxValue: maxValue, minValue: minValue, validationState: false});
    let mockEvent = {
      target: {
        value: 45
      }
    };
    props.onChange(mockEvent);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(mockEvent.target.value);
    expect(state.validationState).toBe('invalid');
  });

  it('decrement button can toggle valid state', function () {

  });

  it('scrolling can toggle valid state', function () {

  });
});
