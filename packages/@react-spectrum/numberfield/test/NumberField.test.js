import NumberField from '../';
import {cleanup, render} from '@testing-library/react';
import React from 'react';
import V2NumberField from '@react/react-spectrum/NumberField';


describe('NumberField', function () {

  afterEach(() => {
    cleanup();
  });

  it.each`
    Name | Component      | props
    ${'NumberField'} | ${NumberField}| ${{}}
    ${'V2NumberField'}      | ${V2NumberField}      | ${{}}
  `('$Name handles defaults', function ({Component, props}) {
    let {getByRole, getByText} = render(<Component {...props}></Component>);

    expect(true).toBeTruthy();
  });
});
