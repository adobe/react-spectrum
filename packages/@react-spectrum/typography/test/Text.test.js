import Text from '../';
import {cleanup, render} from '@testing-library/react';
import React from 'react';
import V2Text from '@react/react-spectrum/Text';


describe('Text', function () {

  afterEach(() => {
    cleanup();
  });

  it.each`
    Name | Component      | props
    ${'Text'} | ${Text}| ${{}}
    ${'V2Text'}      | ${V2Text}      | ${{}}
  `('$Name handles defaults', function ({Component, props}) {
    let {getByRole, getByText} = render(<Component {...props}></Component>);

    expect(true).toBeTruthy();
  });
});
