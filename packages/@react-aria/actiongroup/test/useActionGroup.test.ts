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

import {createRef} from 'react';
import {FocusableElement} from '@react-types/shared';
import {renderHook} from '@react-spectrum/test-utils-internal';
import {useActionGroup} from '../';
import {useListState} from '@react-stately/list';

describe('useActionGroup', function () {
  let renderActionGroupHook = (props) => {
    let ref = createRef<FocusableElement>();
    let {result} = renderHook(() => useActionGroup(props, useListState(props), ref));
    return result.current;
  };

  it('handles defaults', function () {
    let {actionGroupProps} = renderActionGroupHook({});
    expect(actionGroupProps.role).toBe('toolbar');
  });

  it('handles vertical orientation', function () {
    let {actionGroupProps} = renderActionGroupHook({orientation: 'vertical'});
    expect(actionGroupProps['aria-orientation']).toBe('vertical');
  });

  it('handles selection mode none', function () {
    let {actionGroupProps} = renderActionGroupHook({selectionMode: 'none'});
    expect(actionGroupProps.role).toBe('toolbar');
    expect(actionGroupProps['aria-orientation']).toBe('horizontal');
  });

  it('handles selection mode single', function () {
    let {actionGroupProps} = renderActionGroupHook({selectionMode: 'single'});
    expect(actionGroupProps.role).toBe('radiogroup');
  });

  it('handles selection mode multiple', function () {
    let {actionGroupProps} = renderActionGroupHook({selectionMode: 'multiple'});
    expect(actionGroupProps.role).toBe('toolbar');
    expect(actionGroupProps['aria-orientation']).toBe('horizontal');
  });

  it('handles isDisabled', function () {
    let {actionGroupProps} = renderActionGroupHook({isDisabled: true});
    expect(actionGroupProps['aria-disabled']).toBeTruthy();
  });
});
