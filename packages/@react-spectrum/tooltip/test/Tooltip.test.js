import {cleanup, render} from '@testing-library/react';
import React from 'react';
import {Tooltip} from '../';
import {triggerPress} from '@react-spectrum/test-utils';
import {Tooltip as V2Tooltip} from '@react/react-spectrum/Tooltip';

let testId = 'test-id';

describe('Tooltip', function () {

  afterEach(() => {
    cleanup();
  });

  it.each`
    Name           | Component    | props
    ${'Tooltip'}     | ${Tooltip}     | ${{className: 'foo'}}
    ${'V2Tooltip'}   | ${V2Tooltip}   | ${{className: 'foo'}}
  `('$Name supports additional classNames', function ({Component, props}) {
    let {getByTestId} = render(<Component {...props}>My Tooltip</Component>);
    let className = getByTestId(testId).className;
    expect(className.includes('spectrum-Tooltip')).toBeTruthy();
    expect(className.includes('foo')).toBeTruthy();
  });

  it.each`
    Name      | Component
    ${'Tooltip'}   | ${Tooltip}
    ${'Tooltip'}   | ${V2Tooltip}
  `('$Name supports children', ({Component}) => {
    let {getByText} = render(<Component>I am a Tooltip</Component>);
    expect(getByText('I am a Tooltip')).toBeTruthy();
  });

  it.each`
    Name           | Component    | props
    ${'Tooltip'}     | ${Tooltip}     | ${{placement: 'top'}}
    ${'V2Tooltip'}   | ${V2Tooltip}   | ${{placement: 'top'}}
  `('$Name supports different placements', function ({Component, props}) {
    let {getByTestId} = render(<Component {...props}>My Tooltip</Component>);
    let className = getByTestId(testId).className;
    expect(className.includes('spectrum-Tooltip--top')).toBeTruthy();
  });

  it.each`
    Name           | Component    | props
    ${'Tooltip'}     | ${Tooltip}     | ${{variant: 'info'}}
    ${'V2Tooltip'}   | ${V2Tooltip}   | ${{variant: 'info'}}
  `('$Name supports different variants', function ({Component, props}) {
    let {getByTestId} = render(<Component {...props}>My Tooltip</Component>);
    let className = getByTestId(testId).className;
    expect(className.includes('spectrum-Tooltip--info')).toBeTruthy();
  });

});
