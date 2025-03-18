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
import {useLink} from '../';

describe('useLink', function () {
  let renderLinkHook = (props) => {
    let {result} = renderHook(() => useLink(props));
    return result.current;
  };

  it('handles defaults', function () {
    let {linkProps} = renderLinkHook({children: 'Test Link'});
    expect(linkProps.role).toBeUndefined();
    expect(linkProps.tabIndex).toBe(0);
    expect(typeof linkProps.onKeyDown).toBe('function');
  });

  it('handles custom element type', function () {
    let {linkProps} = renderLinkHook({children: <div>Test Link</div>, elementType: 'div'});
    expect(linkProps.role).toBe('link');
    expect(linkProps.tabIndex).toBe(0);
  });

  it('handles isDisabled', function () {
    let {linkProps} = renderLinkHook({children: 'Test Link', elementType: 'span', isDisabled: true});
    expect(linkProps.role).toBe('link');
    expect(linkProps['aria-disabled']).toBe(true);
    expect(linkProps.tabIndex).toBeUndefined();
    expect(typeof linkProps.onKeyDown).toBe('function');
  });

  it('handles onClick warning', function () {
    let spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    let {linkProps} = renderLinkHook({children: 'Test Link', onClick: () => {}});
    linkProps.onClick();
    expect(spyWarn).toHaveBeenCalledWith('onClick is deprecated, please use onPress');
  });
});
