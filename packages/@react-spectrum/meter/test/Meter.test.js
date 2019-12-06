import {cleanup, render} from '@testing-library/react';
import {Meter} from '../';
import React from 'react';

describe('Meter', function () {

  afterEach(() => {
    cleanup();
  });

  it.each`
    Name          | Component | props
    ${'Meter'}    | ${Meter}  | ${{}}
  `('$Name handles defaults', function ({Component, props}) {
    render(<Component {...props} />);

    expect(true).toBeTruthy();
  });
});
