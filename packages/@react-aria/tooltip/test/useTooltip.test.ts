import {cleanup, render} from '@testing-library/react';
import {renderHook} from 'react-hooks-testing-library';
import React, {useRef} from 'react';
import {useTooltip} from '../';

describe('useTooltip', function () {
  afterEach(cleanup);

  it('fill me in', function () {
    expect(true).toBeTruthy();
  });
});
