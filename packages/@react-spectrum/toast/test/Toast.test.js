import {cleanup, render} from '@testing-library/react';
import React from 'react';
import {Toast} from '../';
import {triggerPress} from '@react-spectrum/utils';
import {Toast as V2Toast} from '@react/react-spectrum/Toast';

let testId = 'test-id';

function renderComponent(Component, props, message) {
  return render(<Component {...props} data-testid={testId}>{message}</Component>);
}

describe('Toast', function () {
  let onClose = jest.fn();
  let onAction = jest.fn();

  afterEach(() => {
    onClose.mockClear();
    onAction.mockClear();
    cleanup();
  });

  it.each`
    Name           | Component    | props  | message
    ${'Toast'}     | ${Toast}     | ${{}}  | ${'Toast time!'}
    ${'V2Toast'}   | ${V2Toast}   | ${{}}  | ${'Toast time!'}
  `('$Name handles defaults', function ({Component, props, message}) {
    let {getByRole, getByText} = renderComponent(Component, props, message);

    expect(getByRole('alert')).toBeTruthy();
    expect(getByText(message)).toBeTruthy();
  });

  it.each`
    Name           | Component    | props                      | message
    ${'Toast'}     | ${Toast}     | ${{className: 'myClass'}}  | ${'Toast time!'}
    ${'V2Toast'}   | ${V2Toast}   | ${{className: 'myClass'}}  | ${'Toast time!'}
  `('$Name supports additional classNames', function ({Component, props, message}) {
    let {getByTestId} = renderComponent(Component, props, message);
    let className = getByTestId(testId).className;

    expect(className.includes('spectrum-Toast')).toBeTruthy();
    expect(className.includes('myClass')).toBeTruthy();
  });

  it.each`
    Name           | Component    | props                      | message
    ${'Toast'}     | ${Toast}     | ${{variant: 'info'}}  | ${'Toast time!'}
    ${'V2Toast'}   | ${V2Toast}   | ${{variant: 'info'}}  | ${'Toast time!'}
  `('$Name supports variant info', function ({Component, props, message}) {
    let {getByTestId} = renderComponent(Component, props, message);
    let className = getByTestId(testId).className;

    expect(className.includes('spectrum-Toast')).toBeTruthy();
    expect(className.includes('spectrum-Toast--info')).toBeTruthy();
  });

  it.each`
    Name           | Component    | props                     | message
    ${'Toast'}     | ${Toast}     | ${{actionLabel: 'Undo'}}  | ${'Toast time!'}
    ${'V2Toast'}   | ${V2Toast}   | ${{actionLabel: 'Undo', closable: true}}  | ${'Toast time!'}
  `('$Name handles action and close button clicks', function ({Component, props, message}) {
    let {getAllByRole, getByText} = renderComponent(Component, {onClose, onAction, ...props}, message);
    let button = getAllByRole('button');

    // action button
    triggerPress(button[0]);
    expect(onClose).toHaveBeenCalledTimes(0);
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(getByText(props.actionLabel)).toBeTruthy();

    // close button
    triggerPress(button[1]);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it.each`
    Name           | Component    | props                     | message
    ${'Toast'}     | ${Toast}     | ${{actionLabel: 'Undo', shouldCloseOnAction: true}}  | ${'Toast time!'}
    ${'V2Toast'}   | ${V2Toast}   | ${{actionLabel: 'Undo', closable: true, closeOnAction: true}}  | ${'Toast time!'}
  `('$Name handles action and close button clicks when action closes', function ({Component, props, message}) {
    let {getAllByRole, getByText} = renderComponent(Component, {onClose, onAction, ...props}, message);
    let button = getAllByRole('button');

    // action button
    triggerPress(button[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(getByText(props.actionLabel)).toBeTruthy();

    // close button
    triggerPress(button[1]);
    expect(onClose).toHaveBeenCalledTimes(2);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it.each`
    Name           | Component    | props                     | message
    ${'Toast'}     | ${Toast}     | ${{actionLabel: 'Undo', shouldCloseOnAction: true}}  | ${'Toast time!'}
    ${'V2Toast'}   | ${V2Toast}   | ${{actionLabel: 'Undo', closable: true, closeOnAction: true}}  | ${'Toast time!'}
  `('$Name action button and close button are focusable', function ({Component, props, message}) {
    let {getAllByRole} = renderComponent(Component, {onClose, onAction, ...props}, message);
    let button = getAllByRole('button');

    // action button
    button[0].focus();
    triggerPress(document.activeElement);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledTimes(1);

    // close button
    button[1].focus();
    triggerPress(document.activeElement);
    expect(onClose).toHaveBeenCalledTimes(2);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  // New v3 functionality, omitting v2 components
  it.each`
    Name           | Component
    ${'Toast'}     | ${Toast}
  `('$Name will attach a ref to the toast', ({Component}) => {
    let ref = React.createRef();
    let toast = renderComponent(Component, {ref});
    let input = toast.getByTestId(testId);

    expect(ref.current).toEqual(input);
  });
});
