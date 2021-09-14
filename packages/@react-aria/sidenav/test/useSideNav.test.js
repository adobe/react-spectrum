/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ListLayout} from '@react-stately/layout';
import React from 'react';
import {renderHook} from '@testing-library/react-hooks';
import {useSideNav} from '../';

describe('useSideNav', function () {
  let mockState = {selectionManager: {}};
  let mockLayout = new ListLayout({
    rowHeight: 40
  });

  let renderSideNavHook = (menuProps) => {
    let {result} = renderHook(() => useSideNav({...menuProps, layout: mockLayout}, mockState));
    return result.current;
  };

  it('returns default aria for navigation', function () {
    let {navProps, listProps} = renderSideNavHook({});
    expect(navProps).toBeDefined();
    expect(navProps.id).toBeDefined();
    expect(navProps.role).toBe('navigation');
    expect(listProps).toBeDefined();
    expect(listProps.role).toBe('list');
    expect(typeof listProps.onKeyDownCapture).toBe('function');
    expect(typeof listProps.onFocus).toBe('function');
    expect(typeof listProps.onBlur).toBe('function');
  });

  it('handles aria props', function () {
    let props = {
      'aria-label': 'test-aria-label',
      'aria-labelledby': 'test-aria-labelledby',
      id: 'test-id'
    };

    let {navProps, listProps} = renderSideNavHook(props);
    expect(navProps).toBeDefined();
    expect(navProps.id).toBe('test-id');
    expect(navProps.role).toBe('navigation');
    expect(navProps.role).toBe('navigation');
    expect(navProps['aria-label']).toBe('test-aria-label');
    expect(navProps['aria-labelledby']).toBe('test-aria-labelledby');
    expect(listProps).toBeDefined();
    expect(listProps.role).toBe('list');
    expect(listProps['aria-labelledby']).toBe('test-aria-labelledby');
    expect(typeof listProps.onKeyDownCapture).toBe('function');
    expect(typeof listProps.onFocus).toBe('function');
    expect(typeof listProps.onBlur).toBe('function');
  });
});
