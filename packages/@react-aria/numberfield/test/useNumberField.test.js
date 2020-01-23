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
  });

  afterEach(() => {
    preventDefault.mockClear();
    setValue.mockClear();
    increment.mockClear();
    decrement.mockClear();
    state.value = 1;
    state.ref = {};
  });

  it('handles defaults', () => {
    let numberFieldProps = renderNumberFieldHook({defaultValue: 1});
    //expect(typeof paginationProps.prevButtonProps.onPress).toBe('function');
    //expect(typeof paginationProps.nextButtonProps.onPress).toBe('function');
  });

  it('increment button can toggle valid state', function () {

  });

  it('decrement button can toggle valid state', function () {

  });
});
