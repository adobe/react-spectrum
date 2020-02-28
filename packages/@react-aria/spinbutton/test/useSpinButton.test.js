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

jest.mock('@react-aria/live-announcer');
import {announce} from '@react-aria/live-announcer';
import {cleanup, fireEvent, render} from '@testing-library/react';
import React from 'react';
import {useSpinButton} from '../';

function Example(props) {
  let {spinButtonProps} = useSpinButton(props);
  return <div {...spinButtonProps} tabIndex={-1} data-testid="test">{props.children}</div>;
}

describe('useSpinButton', function () {
  afterEach(cleanup);

  it('should have role="spinbutton" and aria props', function () {
    let res = render(<Example value={2} textValue="2 items" minValue={1} maxValue={3} />);
    let el = res.getByTestId('test');
    expect(el).toHaveAttribute('role', 'spinbutton');
    expect(el).toHaveAttribute('aria-valuenow', '2');
    expect(el).toHaveAttribute('aria-valuemin', '1');
    expect(el).toHaveAttribute('aria-valuemax', '3');
    expect(el).toHaveAttribute('aria-valuetext', '2 items');
    expect(el).not.toHaveAttribute('aria-disabled');
    expect(el).not.toHaveAttribute('aria-readonly');
  });

  it('should have aria-disabled if isDisabled is set', function () {
    let res = render(<Example value={2} textValue="2 items" minValue={1} maxValue={3} isDisabled />);
    let el = res.getByTestId('test');
    expect(el).toHaveAttribute('aria-disabled', 'true');
  });

  it('should have aria-readonly if isReadOnly is set', function () {
    let res = render(<Example value={2} textValue="2 items" minValue={1} maxValue={3} isReadOnly />);
    let el = res.getByTestId('test');
    expect(el).toHaveAttribute('aria-readonly', 'true');
  });

  it('should trigger onIncrement on arrow up', function () {
    let onIncrement = jest.fn();
    let res = render(<Example value={2} onIncrement={onIncrement} />);
    let el = res.getByTestId('test');
    fireEvent.keyDown(el, {key: 'ArrowUp'});
    expect(onIncrement).toHaveBeenCalledTimes(1);
  });

  it('should trigger onDecrement on arrow down', function () {
    let onDecrement = jest.fn();
    let res = render(<Example value={2} onDecrement={onDecrement} />);
    let el = res.getByTestId('test');
    fireEvent.keyDown(el, {key: 'ArrowDown'});
    expect(onDecrement).toHaveBeenCalledTimes(1);
  });

  it('should trigger onIncrementPage on page up', function () {
    let onIncrementPage = jest.fn();
    let res = render(<Example value={2} onIncrementPage={onIncrementPage} />);
    let el = res.getByTestId('test');
    fireEvent.keyDown(el, {key: 'PageUp'});
    expect(onIncrementPage).toHaveBeenCalledTimes(1);
  });

  it('should fall back to onIncrement on page up if onIncrementPage is not available', function () {
    let onIncrement = jest.fn();
    let res = render(<Example value={2} onIncrement={onIncrement} />);
    let el = res.getByTestId('test');
    fireEvent.keyDown(el, {key: 'PageUp'});
    expect(onIncrement).toHaveBeenCalledTimes(1);
  });

  it('should trigger onDecrementPage on page up', function () {
    let onDecrementPage = jest.fn();
    let res = render(<Example value={2} onDecrementPage={onDecrementPage} />);
    let el = res.getByTestId('test');
    fireEvent.keyDown(el, {key: 'PageDown'});
    expect(onDecrementPage).toHaveBeenCalledTimes(1);
  });

  it('should fall back to onDecrement on page up if onDecrementPage is not available', function () {
    let onDecrement = jest.fn();
    let res = render(<Example value={2} onDecrement={onDecrement} />);
    let el = res.getByTestId('test');
    fireEvent.keyDown(el, {key: 'PageDown'});
    expect(onDecrement).toHaveBeenCalledTimes(1);
  });

  it('should trigger onDecrementToMin on home key', function () {
    let onDecrementToMin = jest.fn();
    let res = render(<Example value={2} onDecrementToMin={onDecrementToMin} minValue={1} />);
    let el = res.getByTestId('test');
    fireEvent.keyDown(el, {key: 'Home'});
    expect(onDecrementToMin).toHaveBeenCalledTimes(1);
  });

  it('should trigger onIncrementToMax on end key', function () {
    let onIncrementToMax = jest.fn();
    let res = render(<Example value={2} onIncrementToMax={onIncrementToMax} maxValue={1} />);
    let el = res.getByTestId('test');
    fireEvent.keyDown(el, {key: 'End'});
    expect(onIncrementToMax).toHaveBeenCalledTimes(1);
  });

  it('should announce on value change while focused', function () {
    let res = render(<Example value={2} />);
    let el = res.getByTestId('test');
    el.focus();

    res.rerender(<Example value={3} />);
    expect(announce).toHaveBeenCalledTimes(1);
    expect(announce).toHaveBeenCalledWith('3');

    el.blur();

    res.rerender(<Example value={4} />);
    expect(announce).toHaveBeenCalledTimes(1);
  });

  it('should announce on textValue change while focused', function () {
    let res = render(<Example value={2} textValue="2 items" />);
    let el = res.getByTestId('test');
    el.focus();

    res.rerender(<Example value={3} textValue="3 items" />);
    expect(announce).toHaveBeenCalledTimes(1);
    expect(announce).toHaveBeenCalledWith('3 items');
  });
});
