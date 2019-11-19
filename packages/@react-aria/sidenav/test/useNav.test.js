import {cleanup} from '@testing-library/react';
import React from 'react';
import {renderHook} from 'react-hooks-testing-library';
import {useNav} from '../';

describe('useNav', function () {
  afterEach(cleanup);

  it('returns right aria for navigation', function () {
    let {result} = renderHook(() => useNav({}));
    expect(result.current.navProps).toBeDefined();
    expect(result.current.listProps).toBeDefined();
    expect(result.current.listItemProps).toBeDefined();
  });
});
