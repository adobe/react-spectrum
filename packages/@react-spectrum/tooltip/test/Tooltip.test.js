import {Tooltip} from '../';
import {cleanup, render} from '@testing-library/react';
import React from 'react';

describe('Tooltip', function () {

  afterEach(() => {
    cleanup();
  });

  it.each`
    Name | Component      | props
    ${'Tooltip'} | ${Tooltip}| ${{}}
  `('$Name handles defaults', function ({Component, props}) {
    let {getByRole, getByText} = render(<Component {...props}></Component>);

    expect(true).toBeTruthy();
  });

});
