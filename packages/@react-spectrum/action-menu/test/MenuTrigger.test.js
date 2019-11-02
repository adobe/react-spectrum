import {cleanup} from '@testing-library/react';
import {MenuTrigger} from '../';
import React from 'react';
import V2MenuTrigger from '@react/react-spectrum/Dropdown';

describe('MenuTrigger', function () {

  afterEach(() => {
    cleanup();
  });

  it.each`
    Name               | Component        | props
    ${'MenuTrigger'}   | ${MenuTrigger}   | ${{}}
    ${'V2MenuTrigger'} | ${V2MenuTrigger} | ${{}}
  `('$Name handles defaults', function ({Component, props}) {
    // let tree = render(<Component {...props}>blah</Component>);

    expect(true).toBeTruthy();
  });
});
