/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import React from 'react';
import {renderHook} from 'react-hooks-testing-library';
import {usePagination} from '../';

describe('usePagination tests', function () {

  let setValue = jest.fn();
  let state = {};
  let props = {};
  let preventDefault = jest.fn();
  let onPrevious = jest.fn();
  let onNext = jest.fn();
  let onIncrement = jest.fn();
  let onDecrement = jest.fn();
  let maxValue = 20;
  let event = (key) => ({
    key,
    preventDefault
  });

  let renderPaginationHook = (props) => {
    props.onPrevious = onPrevious;
    props.onNext = onNext;
    let {result} = renderHook(() => usePagination(props, state));
    return result.current;
  };

  beforeEach(() => {
    state.value = 1;
    state.ref = {current: 1};
    state.onChange = setValue;
    state.onIncrement = onIncrement;
    state.onDecrement = onDecrement;
    props.onPrevious = onPrevious;
    props.onNext = onNext;
  });

  afterEach(() => {
    preventDefault.mockClear();
    setValue.mockClear();
    onPrevious.mockClear();
    onNext.mockClear();
    onIncrement.mockClear();
    onDecrement.mockClear();
    state.value = 1;
    state.ref = {};
  });

  it('handles defaults', () => {
    let paginationProps = renderPaginationHook({defaultValue: 1});
    expect(typeof paginationProps.prevButtonProps.onPress).toBe('function');
    expect(typeof paginationProps.nextButtonProps.onPress).toBe('function');
    expect(typeof paginationProps.textProps.onKeyDown).toBe('function');
  });

  it('handles aria props', function () {
    let paginationProps = renderPaginationHook({defaultValue: 1});
    expect(paginationProps.prevButtonProps['aria-label']).toEqual('Previous');
    expect(paginationProps.nextButtonProps['aria-label']).toBe('Next');
  });

  it('handles valid onkeydown', function () {
    let paginationProps = renderPaginationHook({defaultValue: 1, maxValue: maxValue});
    paginationProps.textProps.onKeyDown(event('Up'));
    expect(state.onIncrement).toHaveBeenCalled();
  });

  it('handles invalid onkeydown : value <= 1', function () {
    let paginationProps = renderPaginationHook({defaultValue: 1, maxValue: maxValue});
    paginationProps.textProps.onKeyDown(event('Down'));
    expect(state.onDecrement).toHaveBeenCalled();
  });

  it('handles invalid onkeydown : value is a character', function () {
    let paginationProps = renderPaginationHook({defaultValue: 1, maxValue: maxValue});
    paginationProps.textProps.onKeyDown(event('a'));
    expect(state.onChange).not.toHaveBeenCalled();
  });

  it('handles valid previous', function () {
    state.value = 2;
    let paginationProps = renderPaginationHook({defaultValue: 1, maxValue: maxValue});
    paginationProps.prevButtonProps.onPress(event('click'));
    expect(state.onDecrement).toHaveBeenCalled();
    expect(props.onPrevious).toHaveBeenCalledWith(state.ref.current);
  });

  it('handles invalid previous', function () {
    let paginationProps = renderPaginationHook({defaultValue: 1, maxValue: maxValue});
    paginationProps.prevButtonProps.onPress(event('click'));
    expect(state.onDecrement).toHaveBeenCalled();
    expect(props.onPrevious).toHaveBeenCalledWith(state.ref.current);
  });

  it('handles valid next', function () {
    let paginationProps = renderPaginationHook({defaultValue: 1, maxValue: maxValue});
    paginationProps.nextButtonProps.onPress(event('click'));
    expect(state.onIncrement).toHaveBeenCalled();
    expect(props.onNext).toHaveBeenCalledWith(state.ref.current);
  });

  it('handles invalid next', function () {
    state.value = maxValue;
    let paginationProps = renderPaginationHook({defaultValue: 1, maxValue: maxValue});
    paginationProps.nextButtonProps.onPress(event('click'));
    expect(state.onIncrement).toHaveBeenCalled();
    expect(props.onNext).toHaveBeenCalledWith(state.ref.current);
  });
});
