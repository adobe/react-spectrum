import {cleanup} from '@testing-library/react';
import Grid from '../';
import React from 'react';

// TODO: testing :)
describe('Grid', function () {

  afterEach(() => {
    cleanup();
  });

  it.each`
    Name      | Component  | props
    ${'Grid'} | ${Grid}    | ${{}}
  `('$Name handles defaults', function ({Component, props}) {
    expect(true).toBeTruthy();
  });
});
