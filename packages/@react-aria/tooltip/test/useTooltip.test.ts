import React from 'react';
import {cleanup, render} from '@testing-library/react';
import {renderHook} from 'react-hooks-testing-library';
import {useTooltip} from '../';

describe('useTooltip', function () {
  afterEach(cleanup);

  it('exists', function () {
    expect(true).toBeTruthy();
  });
});
