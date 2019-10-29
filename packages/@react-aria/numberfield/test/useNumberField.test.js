import {cleanup} from '@testing-library/react';
import React from 'react';
import {renderHook} from 'react-hooks-testing-library';
import {useNumberField} from '../';

describe('useNumberField', function () {
  afterEach(cleanup);

  it('returns props for field, increment and decrement button separately', function () {
    const {result} = renderHook(() => useNumberField({}));
    const {numberFieldProps, decrementButtonProps, incrementButtonProps} = result.current;

    expect(numberFieldProps).toBeDefined();
    expect(incrementButtonProps).toBeDefined();
    expect(decrementButtonProps).toBeDefined();
  });
});
