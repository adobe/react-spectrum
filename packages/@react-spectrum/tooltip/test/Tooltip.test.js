import {cleanup, render} from '@testing-library/react';
import React from 'react';
import {Tooltip} from '../';
import V2Tooltip from '@react/react-spectrum/Tooltip';

describe('Tooltip', function () {
  afterEach(() => {
    cleanup();
  });

  it.each`
    Name           | Component
    ${'Tooltip'}   | ${Tooltip}
    ${'V2Tooltip'} | ${V2Tooltip}
  `('$Name supports children', ({Component}) => {
    let {getByText} = render(<Component>This is a tooltip</Component>);
    expect(getByText('This is a tooltip')).toBeTruthy();
  });
});
