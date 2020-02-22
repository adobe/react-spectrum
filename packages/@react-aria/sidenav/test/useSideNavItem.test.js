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

import {cleanup} from '@testing-library/react';
import React from 'react';
import {renderHook} from 'react-hooks-testing-library';
import {useSideNavItem} from '../';

describe('useSideNavItem', function () {
  afterEach(cleanup);

  let mockState = {
    selectionManager: {}
  };

  let renderSideNavItemHook = (menuProps, itemProps = {}) => {
    let item = {
      key: '1',
      ...itemProps
    };
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
    expect(listItemLinkProps['aria-current']).toBeUndefined();
  });

  it('returns aria for selected item', function () {
    let {listItemProps, listItemLinkProps} = renderSideNavItemHook({}, {isSelected: true});
    expect(listItemProps).toBeDefined();
    expect(listItemProps.role).toBe('listitem');
    expect(listItemLinkProps).toBeDefined();
    expect(listItemLinkProps.role).toBe('link');
    expect(listItemLinkProps.target).toBe('_self');
    expect(typeof listItemLinkProps.onFocus).toBe('function');
    expect(listItemLinkProps['aria-current']).toBe('page');
  });
});
