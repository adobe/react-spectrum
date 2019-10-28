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
    let {linkProps} = renderLinkHook({children: 'Test Link'});
    expect(linkProps.role).toBe('link');
    expect(linkProps.tabIndex).toBe(0);
    expect(linkProps.id).toBeDefined();
    expect(typeof linkProps.onKeyDown).toBe('function');
    expect(typeof linkProps.onKeyUp).toBe('function');
  });

  it('handles custom children', function () {
    let {linkProps} = renderLinkHook({children: <div>Test Link</div>});
    expect(linkProps.role).toBeUndefined();
    expect(linkProps.tabIndex).toBeUndefined();
    expect(linkProps.id).toBeDefined();
  });

  it('handles href warning', function () {
    let spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    renderLinkHook({children: 'Test Link', href: '#'});
    expect(spyWarn).toHaveBeenCalledWith('href is deprecated, please use an anchor element as children');
  });

  it('handles onClick warning', function () {
    let spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    let {linkProps} = renderLinkHook({children: 'Test Link', onClick: () => {}});
    linkProps.onClick();
    expect(spyWarn).toHaveBeenCalledWith('onClick is deprecated, please use onPress');
  });
});
