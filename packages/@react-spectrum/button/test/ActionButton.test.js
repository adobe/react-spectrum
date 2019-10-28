import {ActionButton} from '../';
import {cleanup, render} from '@testing-library/react';
import React from 'react';
import {triggerPress} from '@react-spectrum/test-utils';
import V2Button from '@react/react-spectrum/Button';

describe('ActionButton', function () {
  let onPressSpy = jest.fn();

  afterEach(() => {
    cleanup();
    onPressSpy.mockClear();
  });
  it.each`
    Component        | props
    ${ActionButton}  | ${{onPress: onPressSpy}}
    ${V2Button}      | ${{variant: 'action', onClick: onPressSpy}}
  `('v2/3 parity handles defaults', function ({Component, props}) {
    let {getByRole} = render(<Component {...props}>Click Me</Component>);

    let button = getByRole('button');
    triggerPress(button);
    expect(onPressSpy).toHaveBeenCalledTimes(1);
  });

  it.each`
    Component        | props
    ${ActionButton}  | ${{}}
    ${V2Button}      | ${{variant: 'action'}}
  `('v2/3 parity allows custom props to be passed through to the button', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} data-foo="bar" aria-hidden name="s">Click Me</Component>);

    let button = getByRole('button');
    expect(button).toHaveAttribute('data-foo', 'bar');
    expect(button).toHaveAttribute('aria-hidden', 'true');
    expect(button).toHaveAttribute('name', 's');
  });

  it.each`
    Name          | Component        | props
    ${'Button'}   | ${ActionButton}  | ${{onPress: onPressSpy, holdAffordance: true}}
    ${'V2Button'} | ${V2Button}      | ${{variant: 'action', onClick: onPressSpy, holdAffordance: true}}
  `('$Name v2/3 parity hold affordance', function ({Component, props}) {
    let {getByRole} = render(<Component {...props}>Click Me</Component>);

    let button = getByRole('button');
    let holdAffordance = getByRole('presentation');
    expect(holdAffordance).not.toBeNull();
    triggerPress(button);
    expect(onPressSpy).toHaveBeenCalledTimes(1);
  });
});
