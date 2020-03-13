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
import {renderHook} from 'react-hooks-testing-library';
import {useActionGroup} from '../';

describe('useButton tests', function () {
  let state = {};
  let renderActionGroupHook = (props) => {
    let {result} = renderHook(() => useActionGroup(props, state));
    return result.current;
  };

  it('handles defaults', function () {
    let {actionGroupProps, buttonProps} = renderActionGroupHook({});
    expect(actionGroupProps.role).toBe('radiogroup');
    expect(actionGroupProps['aria-orientation']).toBe('horizontal');
    expect(actionGroupProps.id).toBeDefined();
    expect(buttonProps.role).toBe('radio');
  });

  it('handles vertical orientation', function () {
    let {actionGroupProps} = renderActionGroupHook({orientation: 'vertical'});
    expect(actionGroupProps['aria-orientation']).toBe('vertical');
  });

  it('handles selection mode none', function () {
    let {actionGroupProps, buttonProps} = renderActionGroupHook({selectionMode: 'none'});
    expect(actionGroupProps.role).toBe('toolbar');
    expect(actionGroupProps.id).toBeDefined();
    expect(buttonProps.role).toBeNull();
  });

  it('handles selection mode single', function () {
    let {actionGroupProps, buttonProps} = renderActionGroupHook({selectionMode: 'single'});
    expect(actionGroupProps.role).toBe('radiogroup');
    expect(actionGroupProps.id).toBeDefined();
    expect(buttonProps.role).toBe('radio');
  });

  it('handles selection mode multiple', function () {
    let {actionGroupProps, buttonProps} = renderActionGroupHook({selectionMode: 'multiple'});
    expect(actionGroupProps.role).toBe('toolbar');
    expect(actionGroupProps.id).toBeDefined();
    expect(buttonProps.role).toBe('checkbox');
  });

  it('handles custom role', function () {
    let {actionGroupProps, buttonProps} = renderActionGroupHook({role: 'group', selectionMode: 'multiple'});
    expect(actionGroupProps.role).toBe('group');
    expect(actionGroupProps.id).toBeDefined();
    expect(buttonProps.role).toBe('checkbox');
  });

  it('handles isDisabled', function () {
    let {actionGroupProps} = renderActionGroupHook({isDisabled: true});
    expect(actionGroupProps['aria-disabled']).toBeTruthy();
  });
});
