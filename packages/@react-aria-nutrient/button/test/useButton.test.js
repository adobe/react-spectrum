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
import {useButton} from '../';

describe('useButton tests', function () {
  it('handles defaults', function () {
    let props = {};
    let {result} = renderHook(() => useButton(props));
    expect(typeof result.current.buttonProps.onClick).toBe('function');
  });
  it('handles elements other than button', function () {
    let props = {elementType: 'a'};
    let {result} = renderHook(() => useButton(props));
    expect(result.current.buttonProps.role).toBe('button');
    expect(result.current.buttonProps.tabIndex).toBe(0);
    expect(result.current.buttonProps['aria-disabled']).toBeUndefined();
    expect(result.current.buttonProps.href).toBeUndefined();
    expect(typeof result.current.buttonProps.onKeyDown).toBe('function');
    expect(result.current.buttonProps.rel).toBeUndefined();
  });
  it('handles elements other than button disabled', function () {
    let props = {elementType: 'a', isDisabled: true};
    let {result} = renderHook(() => useButton(props));
    expect(result.current.buttonProps.role).toBe('button');
    expect(result.current.buttonProps.tabIndex).toBeUndefined();
    expect(result.current.buttonProps['aria-disabled']).toBeTruthy();
    expect(result.current.buttonProps.href).toBeUndefined();
    expect(typeof result.current.buttonProps.onKeyDown).toBe('function');
    expect(result.current.buttonProps.rel).toBeUndefined();
  });
  it('handles the rel attribute on anchors', function () {
    let props = {elementType: 'a', rel: 'noopener noreferrer'};
    let {result} = renderHook(() => useButton(props));
    expect(result.current.buttonProps.rel).toBe('noopener noreferrer');
  });
  it('handles the rel attribute as a string on anchors', function () {
    let props = {elementType: 'a', rel: 'search'};
    let {result} = renderHook(() => useButton(props));
    expect(result.current.buttonProps.rel).toBe('search');
  });
  it('handles input elements', function () {
    let props = {elementType: 'input', isDisabled: true};
    let {result} = renderHook(() => useButton(props));
    expect(result.current.buttonProps.role).toBe('button');
    expect(result.current.buttonProps.tabIndex).toBeUndefined();
    expect(result.current.buttonProps['aria-disabled']).toBeUndefined();
    expect(result.current.buttonProps.disabled).toBeTruthy();
    expect(result.current.buttonProps.href).toBeUndefined();
    expect(typeof result.current.buttonProps.onKeyDown).toBe('function');
    expect(result.current.buttonProps.rel).toBeUndefined();
  });
});
