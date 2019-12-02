import {cleanup, render} from '@testing-library/react';
import React from 'react';
import {View} from '../';

describe('View', function () {
  afterEach(() => {
    cleanup();
  });

  it('renders', function () {
    render(<View />);
    expect(true).toBeTruthy();
  });
});
