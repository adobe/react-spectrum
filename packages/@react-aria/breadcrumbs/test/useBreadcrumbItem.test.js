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
    expect(breadcrumbItemProps.role).toBe('link');
    expect(breadcrumbItemProps['aria-disabled']).toBeUndefined();
    expect(typeof breadcrumbItemProps.onKeyDown).toBe('function');
  });

  it('handles isCurrent', function () {
    let {breadcrumbItemProps} = renderLinkHook({isCurrent: true});
    expect(breadcrumbItemProps.id).toBeDefined();
    expect(breadcrumbItemProps.tabIndex).toBeUndefined();
    expect(breadcrumbItemProps.role).toBe('link');
    expect(breadcrumbItemProps['aria-current']).toBe('page');
    expect(breadcrumbItemProps.onKeyDown).toBeUndefined();
    expect(breadcrumbItemProps.onKeyUp).toBeUndefined();
  });

  it('handles isDisabled', function () {
    let {breadcrumbItemProps} = renderLinkHook({isDisabled: true});
    expect(breadcrumbItemProps.id).toBeDefined();
    expect(breadcrumbItemProps.tabIndex).toBeUndefined();
    expect(breadcrumbItemProps.role).toBe('link');
    expect(breadcrumbItemProps['aria-disabled']).toBe(true);
  });

  it('handles href warning', function () {
    let spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    renderLinkHook({href: '#'});
    expect(spyWarn).toHaveBeenCalledWith('href is deprecated, please use an anchor element as children');
  });

  it('handles descendant link with href', function () {
    let {breadcrumbItemProps} = renderLinkHook({children: <a href="https://example.com">Breadcrumb Item</a>});
    expect(breadcrumbItemProps.id).toBeDefined();
    expect(breadcrumbItemProps.tabIndex).toBeUndefined();
    expect(breadcrumbItemProps.role).toBeUndefined();
    expect(breadcrumbItemProps['aria-disabled']).toBeUndefined();
    expect(typeof breadcrumbItemProps.onKeyDown).toBe('function');
  });
});
