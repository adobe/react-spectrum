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

  let renderSideNavHook = (menuProps) => {
    let {result} = renderHook(() => useSideNav(menuProps, mockState, mockLayout));
    return result.current;
  };

  it('returns default aria for navigation', function () {
    let {navProps, listProps} = renderSideNavHook({});
    expect(navProps).toBeDefined();
    expect(navProps.id).toBeDefined();
    expect(navProps.role).toBe('navigation');
    expect(listProps).toBeDefined();
    expect(listProps.id).toBeDefined();
    expect(listProps.role).toBe('list');
    expect(typeof listProps.onKeyDown).toBe('function');
    expect(typeof listProps.onFocus).toBe('function');
    expect(typeof listProps.onBlur).toBe('function');
  });
});
