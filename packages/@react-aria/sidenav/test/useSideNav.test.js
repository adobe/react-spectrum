import {cleanup} from '@testing-library/react';
import {ListLayout} from '@react-stately/collections';
import React from 'react';
import {renderHook} from 'react-hooks-testing-library';
import {useSideNav} from '../';

describe('useSideNav', function () {
  afterEach(cleanup);

  let mockState = {};
  let mockLayout = new ListLayout({
    rowHeight: 40
  });

  it('returns right aria for navigation', function () {
    let {result} = renderHook(() => useSideNav({}, mockState, mockLayout));
    expect(result.current.navProps).toBeDefined();
    expect(result.current.listProps).toBeDefined();
  });
});
