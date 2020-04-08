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

import {cleanup, render} from '@testing-library/react';
import React from 'react';
import {Toast} from '../';
import {triggerPress} from '@react-spectrum/test-utils';
import {Toast as V2Toast} from '@react/react-spectrum/Toast';

let testId = 'test-id';

function renderComponent(Component, props, message) {
  return render(<Component {...props} data-testid={testId}>{message}</Component>);
}

describe('Toast', function () {
  let onClose = jest.fn();
  let onAction = jest.fn();
  let onRemove = jest.fn();

  afterEach(() => {
    onClose.mockClear();
    onAction.mockClear();
    cleanup();
  });

  it.each`
    name           | Component    | props  | message
    ${'Toast'}     | ${Toast}     | ${{}}  | ${'Toast time!'}
    ${'V2Toast'}   | ${V2Toast}   | ${{}}  | ${'Toast time!'}
  `('$name handles defaults', function ({name, Component, props, message}) {
    let {getAllByRole, getByRole, getByText} = renderComponent(Component, props, message);

    expect(getByRole('alert')).toBeTruthy();
    expect(getByText(message)).toBeTruthy();
    if (name === 'Toast') {
      expect(getAllByRole('img').length).toBe(1);
    }
  });

  it.each`
    Name           | Component    | props                             | message
    ${'Toast'}     | ${Toast}     | ${{UNSAFE_className: 'myClass'}}  | ${'Toast time!'}
    ${'V2Toast'}   | ${V2Toast}   | ${{className: 'myClass'}}         | ${'Toast time!'}
  `('$Name supports UNSAFE_className', function ({Component, props, message}) {
    let {getByTestId} = renderComponent(Component, props, message);
    let className = getByTestId(testId).className;

    expect(className.includes('myClass')).toBeTruthy();
  });

  it.each`
    Name           | Component    | props                 | message
    ${'Toast'}     | ${Toast}     | ${{variant: 'info'}}  | ${'Toast time!'}
  `('$Name supports variant info', function ({Component, props, message}) {
    let {getAllByRole} = renderComponent(Component, props, message);

    expect(getAllByRole('img').length).toBe(2);
  });

  it.each`
    Name           | Component    | props                                    | message
    ${'Toast'}     | ${Toast}     | ${{actionLabel: 'Undo', onRemove}}       | ${'Toast time!'}
    ${'V2Toast'}   | ${V2Toast}   | ${{actionLabel: 'Undo', closable: true}} | ${'Toast time!'}
  `('$Name handles action and close button clicks', function ({Component, props, message}) {
    let {getAllByRole, getByText} = renderComponent(Component, {onClose, onAction, ...props}, message);
    let button = getAllByRole('button');

    // action button
    triggerPress(button[0]);
    expect(onClose).toHaveBeenCalledTimes(0);
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledTimes(0);
    expect(getByText(props.actionLabel)).toBeTruthy();

    // close button
    triggerPress(button[1]);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledTimes(1);
    if (name === 'Toast') {
      expect(onRemove).toHaveBeenCalledTimes(0);
    }
  });

  it.each`
    Name           | Component    | props                                                          | message
    ${'Toast'}     | ${Toast}     | ${{actionLabel: 'Undo', shouldCloseOnAction: true, onRemove}}  | ${'Toast time!'}
    ${'V2Toast'}   | ${V2Toast}   | ${{actionLabel: 'Undo', closable: true, closeOnAction: true}}  | ${'Toast time!'}
  `('$Name handles action and close button clicks when action closes', function ({Component, props, message}) {
    let {getAllByRole, getByText} = renderComponent(Component, {onClose, onAction, ...props}, message);
    let button = getAllByRole('button');

    // action button
    triggerPress(button[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledTimes(1);
    if (name === 'Toast') {
      expect(onRemove).toHaveBeenCalledTimes(1);
    }
    expect(getByText(props.actionLabel)).toBeTruthy();

    // close button
    triggerPress(button[1]);
    expect(onClose).toHaveBeenCalledTimes(2);
    expect(onAction).toHaveBeenCalledTimes(1);
    if (name === 'Toast') {
      expect(onRemove).toHaveBeenCalledTimes(2);
    }
  });

  it.each`
    Name           | Component    | props                                                          | message
    ${'Toast'}     | ${Toast}     | ${{actionLabel: 'Undo', shouldCloseOnAction: true, onRemove}}  | ${'Toast time!'}
    ${'V2Toast'}   | ${V2Toast}   | ${{actionLabel: 'Undo', closable: true, closeOnAction: true}}  | ${'Toast time!'}
  `('$Name action button and close button are focusable', function ({Component, props, message}) {
    let {getAllByRole} = renderComponent(Component, {onClose, onAction, ...props}, message);
    let button = getAllByRole('button');

    // action button
    button[0].focus();
    triggerPress(document.activeElement);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledTimes(1);
    if (name === 'Toast') {
      expect(onRemove).toHaveBeenCalledTimes(1);
    }

    // close button
    button[1].focus();
    triggerPress(document.activeElement);
    expect(onClose).toHaveBeenCalledTimes(2);
    expect(onAction).toHaveBeenCalledTimes(1);
    if (name === 'Toast') {
      expect(onRemove).toHaveBeenCalledTimes(2);
    }
  });

  // New v3 functionality, omitting v2 components
  it.each`
    Name           | Component
    ${'Toast'}     | ${Toast}
  `('$Name will attach a ref to the toast', ({Component}) => {
    let ref = React.createRef();
    let toast = renderComponent(Component, {ref});
    let input = toast.getByTestId(testId);

    expect(ref.current.UNSAFE_getDOMNode()).toEqual(input);
  });
});
