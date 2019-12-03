import {cleanup, render} from '@testing-library/react';
import React from 'react';
import {Tooltip} from '../';
// no brackets for v2 of tooltip

let testId = 'test-id';

function renderComponent(Component, props, message) {
  return render(<Component {...props} data-testid={testId}>{message}</Component>);
}

describe('Tooltip', function () {

  afterEach(() => {
    cleanup();
  });

  it.each`
    Name           | Component
    ${'Tooltip'}   | ${Tooltip}
  `('$Name supports children', ({Component}) => {
    let {getByText} = render(<Component>This is a tooltip</Component>);
    expect(getByText('This is a tooltip')).toBeTruthy();
  });

});
