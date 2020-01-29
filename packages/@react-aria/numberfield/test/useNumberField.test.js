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
  // let minValue = 0;
  // let maxValue = 20;
  let event = (key) => ({
    key,
    preventDefault
  });

  let renderNumberFieldHook = (props) => {
    let {result} = renderHook(() => useNumberField(props, state));
    return result.current;
  };

  beforeEach(() => {
    state.value = 7;
    state.ref = {current: 7};
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
    let numberFieldProps = renderNumberFieldHook({minValue: 1, maxValue: 5});
    // let mockEvent = {
    //   target: {
    //     value: 21
    //   }
    // };
    // state.value = 6
    // state.onChange(mockEvent)
    console.log('xyz', state.value) // 7
    //expect(state.onChange).toHaveBeenCalledTimes(1);
    //expect(state.onChange).toHaveBeenCalledWith(mockEvent.target.value);
    // expect(state.validationState).toBe('invalid');
    // expect(state.validationState).toBe(undefined);
    numberFieldProps.decrementButtonProps.onPress(event('click'));
    numberFieldProps.decrementButtonProps.onPress();
    console.log('xyz', state.value) // .... should be 6 ... but its still 7
    expect(state.validationState).toBe('invalid'); // getting glase here instead
    numberFieldProps.decrementButtonProps.onPress(event('click'));
    console.log('xyz', state.value) // should be 5 ... but its still 7
    numberFieldProps.decrementButtonProps.onPress(event('click'));
    expect(state.validationState).toBe(false);

  });

  it('decrement button can toggle valid state', function () {

  });

  it('scrolling can toggle valid state', function () {

  });
});
