import {cleanup} from '@testing-library/react';
import React from 'react';
import {renderHook} from 'react-hooks-testing-library';
import {useSideNavItem} from '../';

describe('useSideNavItem', function () {
  afterEach(cleanup);

  let item = {
    key: '1'
  };
  let mockState = {
    selectionManager: {}
  };

  let renderSideNavItemHook = (menuProps) => {
    let {result} = renderHook(() => useSideNavItem({...menuProps, item}, mockState));
    return result.current;
  };

  it('returns default aria for navigation item', function () {
    let {listItemProps, listItemLinkProps} = renderSideNavItemHook({});
    expect(listItemProps).toBeDefined();
    expect(listItemProps.role).toBe('listitem');
    expect(listItemLinkProps).toBeDefined();
    expect(listItemLinkProps.role).toBe('link');
    expect(listItemLinkProps.target).toBe('_self');
    expect(typeof listItemLinkProps.onFocus).toBe('function');
  });
});
