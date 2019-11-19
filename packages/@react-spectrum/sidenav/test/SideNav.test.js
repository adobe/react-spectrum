import {cleanup, render} from '@testing-library/react';
import React from 'react';
import {SideNav} from '../';
// import V2SideNav from '@react/react-spectrum/SideNav';

describe('SideNav', function () {

  afterEach(() => {
    cleanup();
  });

  it.each`
    Name | Component      | props
    ${'SideNav'} | ${SideNav}| ${{}}
  `('$Name handles defaults', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} />);

    let navigation = getByRole('navigation');

    expect(navigation).toBeDefined();
  });
});
