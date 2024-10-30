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

import React from 'react';
import {renderHook} from '@react-spectrum/test-utils-internal';
import {useBreadcrumbs} from '../';

describe('useBreadcrumbs', function () {
  let renderLinkHook = (props) => {
    let {result} = renderHook(() => useBreadcrumbs(props));
    return result.current;
  };

  it('handles defaults', function () {
    let {navProps} = renderLinkHook({});
    expect(navProps['aria-label']).toBe('Breadcrumbs');
  });

  it('handles custom aria label', function () {
    let {navProps} = renderLinkHook({'aria-label': 'test-label'});
    expect(navProps['aria-label']).toBe('test-label');
  });

});
