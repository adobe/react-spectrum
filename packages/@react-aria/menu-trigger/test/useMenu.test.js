import {ListLayout} from '@react-stately/collections';
import React from 'react';
import {renderHook} from 'react-hooks-testing-library';
import {useMenu} from '../';

describe('useMenu', function () {
  let mockState = {};
  let mockLayout = new ListLayout({
    rowHeight: 32,
    headingHeight: 26
  });

  beforeEach(() => {
    jest.mock('@react-stately/selection');
  
  });

  afterEach(() => {
    jest.unmock('@react-stately/selection');
  });

  let renderMenuHook = (menuProps) => {
    let {result} = renderHook(() => useMenu(menuProps, mockState, mockLayout));
    return result.current;
  };

  it('should return default props for a menu', function () {
    let {menuProps} = renderMenuHook({});
    expect(menuProps['aria-orientation']).toBe('vertical');
    expect(menuProps.role).toBe('menu');
    expect(menuProps.id).toBeTruthy();
    expect(menuProps.onKeyDown).toBeTruthy();
    expect(menuProps.onFocus).toBeTruthy();
    expect(menuProps.onBlur).toBeTruthy();
  });

  it('should accomadate user defined aria attributes', function () {
    let props = {
      'aria-label': 'blah',
      'aria-labelledby': 'heh',
      role: 'menubar',
      'aria-orientation': 'horizontal'
    };

    let {menuProps} = renderMenuHook(props);
    expect(menuProps['aria-orientation']).toBe('horizontal');
    expect(menuProps['aria-label']).toBe('blah');
    expect(menuProps['aria-labelledby']).toBe(`heh ${menuProps.id}`);
    expect(menuProps.role).toBe('menubar');
    expect(menuProps.id).toBeTruthy();
    expect(menuProps.onKeyDown).toBeTruthy();
    expect(menuProps.onFocus).toBeTruthy();
    expect(menuProps.onBlur).toBeTruthy();
  });
});
