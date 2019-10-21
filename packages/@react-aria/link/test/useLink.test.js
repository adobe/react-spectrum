import {cleanup} from '@testing-library/react';
import React from 'react';
import {renderHook} from 'react-hooks-testing-library';
import {useLink} from '../';

describe('useLink', function () {
  afterEach(cleanup);

  let renderLinkHook = (props) => {
    let {result} = renderHook(() => useLink(props));
    return result.current;
  };

  it('handles defaults', function () {
    let {linkProps} = renderLinkHook({});
    expect(linkProps.role).toBe('link');
    expect(linkProps.tabIndex).toBe(0);
    expect(linkProps.id).toBeDefined();
    expect(typeof linkProps.onClick).toBe('function');
    expect(typeof linkProps.onKeyDown).toBe('function');
  });
});
