import {cleanup, render} from '@testing-library/react';
import {renderHook} from 'react-hooks-testing-library';
import React, {useRef} from 'react';
import {useNumberField} from '../';

describe('useNumberField', function () {
  afterEach(cleanup);

  it('fill me in', function () {
    expect(true).toBeTruthy();
  });
});
