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
import {act, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {announce} from '@react-aria/live-announcer';
import React from 'react';
import userEvent from '@testing-library/user-event';
import {useSpinButton} from '../';

function Example(props) {
  let {spinButtonProps} = useSpinButton(props);
  return <div {...spinButtonProps} tabIndex={-1} data-testid="test">{props.children}</div>;
}

describe('useSpinButton', function () {
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

  it('should trigger onIncrement on arrow up', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let onIncrement = jest.fn();
    let res = render(<Example value={2} onIncrement={onIncrement} />);
    act(() => res.getByTestId('test').focus());
    await user.keyboard('{ArrowUp}');
    expect(onIncrement).toHaveBeenCalledTimes(1);
  });

  it('should trigger onDecrement on arrow down', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let onDecrement = jest.fn();
    let res = render(<Example value={2} onDecrement={onDecrement} />);
    act(() => res.getByTestId('test').focus());
    await user.keyboard('{ArrowDown}');
    expect(onDecrement).toHaveBeenCalledTimes(1);
  });

  it('should trigger onIncrementPage on page up', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let onIncrementPage = jest.fn();
    let res = render(<Example value={2} onIncrementPage={onIncrementPage} />);
    act(() => res.getByTestId('test').focus());
    await user.keyboard('{PageUp}');
    expect(onIncrementPage).toHaveBeenCalledTimes(1);
  });

  it('should fall back to onIncrement on page up if onIncrementPage is not available', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let onIncrement = jest.fn();
    let res = render(<Example value={2} onIncrement={onIncrement} />);
    act(() => res.getByTestId('test').focus());
    await user.keyboard('{PageUp}');
    expect(onIncrement).toHaveBeenCalledTimes(1);
  });

  it('should trigger onDecrementPage on page up', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let onDecrementPage = jest.fn();
    let res = render(<Example value={2} onDecrementPage={onDecrementPage} />);
    act(() => res.getByTestId('test').focus());
    await user.keyboard('{PageDown}');
    expect(onDecrementPage).toHaveBeenCalledTimes(1);
  });

  it('should fall back to onDecrement on page up if onDecrementPage is not available', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let onDecrement = jest.fn();
    let res = render(<Example value={2} onDecrement={onDecrement} />);
    act(() => res.getByTestId('test').focus());
    await user.keyboard('{PageDown}');
    expect(onDecrement).toHaveBeenCalledTimes(1);
  });

  it('should trigger onDecrementToMin on home key', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let onDecrementToMin = jest.fn();
    let res = render(<Example value={2} onDecrementToMin={onDecrementToMin} minValue={1} />);
    act(() => res.getByTestId('test').focus());
    await user.keyboard('{Home}');
    expect(onDecrementToMin).toHaveBeenCalledTimes(1);
  });

  it('should trigger onIncrementToMax on end key', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let onIncrementToMax = jest.fn();
    let res = render(<Example value={2} onIncrementToMax={onIncrementToMax} maxValue={1} />);
    act(() => res.getByTestId('test').focus());
    await user.keyboard('{End}');
    expect(onIncrementToMax).toHaveBeenCalledTimes(1);
  });

  it('should announce on value change while focused', function () {
    let res = render(<Example value={2} />);
    let el = res.getByTestId('test');
    act(() => {el.focus();});

    res.rerender(<Example value={3} />);
    expect(announce).toHaveBeenCalledTimes(1);
    expect(announce).toHaveBeenCalledWith('3', 'assertive');

    act(() => {el.blur();});

    res.rerender(<Example value={4} />);
    expect(announce).toHaveBeenCalledTimes(1);
  });

  it('should announce on textValue change while focused', function () {
    let res = render(<Example value={2} textValue="2 items" />);
    let el = res.getByTestId('test');
    act(() => {el.focus();});

    res.rerender(<Example value={3} textValue="3 items" />);
    expect(announce).toHaveBeenCalledTimes(1);
    expect(announce).toHaveBeenCalledWith('3 items', 'assertive');
  });

  it('should substitute a minus sign for hyphen in the textValue for negative values', function () {
    let res = render(<Example value={-2} textValue="-2 items" />);
    let el = res.getByTestId('test');
    expect(el).toHaveAttribute('aria-valuenow', '-2');
    expect(el).toHaveAttribute('aria-valuetext', '−2 items');
    act(() => {el.focus();});

    res.rerender(<Example value={-3} textValue="-3 items" />);
    expect(announce).toHaveBeenCalledTimes(1);
    expect(announce).toHaveBeenCalledWith('−3 items', 'assertive');
    expect(el).toHaveAttribute('aria-valuenow', '-3');
    expect(el).toHaveAttribute('aria-valuetext', '−3 items');
  });
});
