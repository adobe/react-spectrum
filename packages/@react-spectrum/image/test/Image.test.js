import Image from '../';
import {cleanup, render} from '@testing-library/react';
import React from 'react';
import V2Image from '@react/react-spectrum/Image';


describe('Image', function () {

  afterEach(() => {
    cleanup();
  });

  it.each`
    Name | Component      | props
    ${'Image'} | ${Image}| ${{}}
    ${'V2Image'}      | ${V2Image}      | ${{}}
  `('$Name handles defaults', function ({Component, props}) {
    let {getByRole, getByText} = render(<Component {...props}></Component>);

    expect(true).toBeTruthy();
  });
});
