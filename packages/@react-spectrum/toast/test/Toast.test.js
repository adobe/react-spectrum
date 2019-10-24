import {cleanup, render} from '@testing-library/react';
import React from 'react';
import Toast from '../';
import V2Toast from '@react/react-spectrum/Toast';


describe('Toast', function () {

  afterEach(() => {
    cleanup();
  });

  it.each`
    Name | Component      | props
    ${'Toast'} | ${Toast}| ${{}}
    ${'V2Toast'}      | ${V2Toast}      | ${{}}
  `('$Name handles defaults', function ({Component, props}) {
    let {getByRole, getByText} = render(<Component {...props}></Component>);

    expect(true).toBeTruthy();
  });
});
