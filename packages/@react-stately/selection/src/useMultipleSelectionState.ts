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

import {MultipleSelection} from '@react-types/shared';
import {MultipleSelectionState} from './types';
import {Selection} from './Selection';
import {useControlledState} from '@react-stately/utils';
import {useMemo, useRef, useState} from 'react';

export function useMultipleSelectionState(props: MultipleSelection): MultipleSelectionState  {
  let isFocused = useRef(false);
  let [focusedKey, setFocusedKey] = useState(null);
  let selectedKeysProp = useMemo(() => props.selectedKeys ? new Selection(props.selectedKeys) : undefined, [props.selectedKeys]);
  let defaultSelectedKeys = useMemo(() => props.defaultSelectedKeys ? new Selection(props.defaultSelectedKeys) : new Selection(), [props.defaultSelectedKeys]);
  let [selectedKeys, setSelectedKeys] = useControlledState(
    selectedKeysProp,
    defaultSelectedKeys,
    props.onSelectionChange
  );

  return {
    selectionMode: props.selectionMode || 'multiple',
    get isFocused() {
      return isFocused.current;
    },
    setFocused(f) {
      isFocused.current = f;
    },
    focusedKey,
    setFocusedKey,
    selectedKeys,
    setSelectedKeys
  };
}
