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

import {act, renderHook} from 'react-hooks-testing-library';
import {Item} from '@react-stately/collections';
import React from 'react';
import {useComboBoxState} from '../';

describe('useComboBoxState tests', function () {

  it('should be closed by default', function () {
    let props = {items: [{id: 1, name: 'one'}], children: (props) => <Item>{props.name}</Item>};
    const {result} = renderHook(() => useComboBoxState(props));
    expect(result.current.isOpen).toBe(false);

    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it('should be set open by default', function () {
    let props = {items: [{id: 1, name: 'one'}], children: (props) => <Item>{props.name}</Item>, defaultOpen: true};
    const {result} = renderHook(() => useComboBoxState(props));
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it('open should be a controllable value', function () {
    let props = {items: [{id: 1, name: 'one'}], children: (props) => <Item>{props.name}</Item>, isOpen: true};
    const {result} = renderHook(() => useComboBoxState(props));
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.close());
    expect(result.current.isOpen).toBe(true);
  });

});
