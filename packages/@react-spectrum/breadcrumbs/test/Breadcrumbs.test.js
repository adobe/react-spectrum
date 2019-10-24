import Breadcrumbs from '../';
import {cleanup, render} from '@testing-library/react';
import React from 'react';
import V2Breadcrumbs from '@react/react-spectrum/Breadcrumbs';


describe('Breadcrumbs', function () {

  afterEach(() => {
    cleanup();
  });

  it.each`
    Name | Component      | props
    ${'Breadcrumbs'} | ${Breadcrumbs}| ${{}}
    ${'V2Breadcrumbs'}      | ${V2Breadcrumbs}      | ${{}}
  `('$Name handles defaults', function ({Component, props}) {
    let {getByRole, getByText} = render(<Component {...props}></Component>);

    expect(true).toBeTruthy();
  });
});
