import {cleanup} from '@testing-library/react';
import React from 'react';
import {renderHook} from 'react-hooks-testing-library';
import {useBreadcrumbItem} from '../';

describe('useBreadcrumbItem', function () {
  afterEach(cleanup);

  let renderLinkHook = (props) => {
    let {result} = renderHook(() => useBreadcrumbItem(props));
    return result.current;
  };

  it('handles defaults', function () {
    let {breadcrumbItemProps} = renderLinkHook({});
    expect(breadcrumbItemProps.id).toBeDefined();
    expect(breadcrumbItemProps.tabIndex).toBe(0);
    expect(typeof breadcrumbItemProps.onKeyDown).toBe('function');
    expect(typeof breadcrumbItemProps.onKeyUp).toBe('function');
  });

  it('handles isCurrent', function () {
    let {breadcrumbItemProps} = renderLinkHook({isCurrent: true});
    expect(breadcrumbItemProps.id).toBeDefined();
    expect(breadcrumbItemProps.tabIndex).toBe(-1);
    expect(breadcrumbItemProps['aria-current']).toBe('page');
    expect(breadcrumbItemProps.onKeyDown).toBeUndefined();
    expect(breadcrumbItemProps.onKeyUp).toBeUndefined();
  });
});
