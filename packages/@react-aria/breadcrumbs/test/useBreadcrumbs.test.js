import {cleanup} from '@testing-library/react';
import React from 'react';
import {renderHook} from 'react-hooks-testing-library';
import {useBreadcrumbs} from '../';

describe('useBreadcrumbs', function () {
  afterEach(cleanup);

  let renderLinkHook = (props) => {
    let {result} = renderHook(() => useBreadcrumbs(props));
    return result.current;
  };

  it('handles defaults', function () {
    let {breadcrumbProps} = renderLinkHook({});
    expect(breadcrumbProps['aria-label']).toBe('Breadcrumbs');
    expect(breadcrumbProps.id).toBeDefined();
  });
});
