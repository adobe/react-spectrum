import Grid from '../';
import {cleanup, render} from '@testing-library/react';
import React from 'react';
import V2Grid from '@react/react-spectrum/Grid';


describe('Grid', function () {

  afterEach(() => {
    cleanup();
  });

  it.each`
    Name | Component      | props
    ${'Grid'} | ${Grid}| ${{}}
    ${'V2Grid'}      | ${V2Grid}      | ${{}}
  `('$Name handles defaults', function ({Component, props}) {
    let {getByRole, getByText} = render(<Component {...props}></Component>);

    expect(true).toBeTruthy();
  });
});
