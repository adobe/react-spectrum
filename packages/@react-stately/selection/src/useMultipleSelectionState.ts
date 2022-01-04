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

import {Key, useMemo, useRef, useState} from 'react';
import {MultipleSelection, SelectionBehavior, SelectionMode} from '@react-types/shared';
import {MultipleSelectionState} from './types';
import {Selection} from './Selection';
import {useControlledState} from '@react-stately/utils';

function equalSets(setA, setB) {
  if (setA.size !== setB.size) {
    return false;
  }

  for (let item of setA) {
    if (!setB.has(item)) {
      return false;
    }
  }

  return true;
}

export interface MultipleSelectionStateProps extends MultipleSelection {
  /** How multiple selection should behave in the collection. */
  selectionBehavior?: SelectionBehavior,
  /** Whether onSelectionChange should fire even if the new set of keys is the same as the last. */
  allowDuplicateSelectionEvents?: boolean
}

/**
 * Manages state for multiple selection and focus in a collection.
 */
export function useMultipleSelectionState(props: MultipleSelectionStateProps): MultipleSelectionState {
  let {
    selectionMode = 'none' as SelectionMode,
    disallowEmptySelection,
    allowDuplicateSelectionEvents
  } = props;

  // We want synchronous updates to `isFocused` and `focusedKey` after their setters are called.
  // But we also need to trigger a react re-render. So, we have both a ref (sync) and state (async).
  let isFocusedRef = useRef(false);
  let [, setFocused] = useState(false);
  let focusedKeyRef = useRef(null);
  let childFocusStrategyRef = useRef(null);
  let [, setFocusedKey] = useState(null);
  let selectedKeysProp = useMemo(() => convertSelection(props.selectedKeys), [props.selectedKeys]);
  let defaultSelectedKeys = useMemo(() => convertSelection(props.defaultSelectedKeys, new Selection()), [props.defaultSelectedKeys]);
  let [selectedKeys, setSelectedKeys] = useControlledState(
    selectedKeysProp,
    defaultSelectedKeys,
    props.onSelectionChange
  );
  let disabledKeysProp = useMemo(() =>
    props.disabledKeys ? new Set(props.disabledKeys) : new Set<Key>()
  , [props.disabledKeys]);
  let [selectionBehavior, setSelectionBehavior] = useState(props.selectionBehavior || 'toggle');

  // If the selectionBehavior prop is set to replace, but the current state is toggle (e.g. due to long press
  // to enter selection mode on touch), and the selection becomes empty, reset the selection behavior.
  if (props.selectionBehavior === 'replace' && selectionBehavior === 'toggle' && typeof selectedKeys === 'object' && selectedKeys.size === 0) {
    setSelectionBehavior('replace');
  }

  return {
    selectionMode,
    disallowEmptySelection,
    selectionBehavior,
    setSelectionBehavior,
    get isFocused() {
      return isFocusedRef.current;
    },
    setFocused(f) {
      isFocusedRef.current = f;
      setFocused(f);
    },
    get focusedKey() {
      return focusedKeyRef.current;
    },
    get childFocusStrategy() {
      return childFocusStrategyRef.current;
    },
    setFocusedKey(k, childFocusStrategy = 'first') {
      focusedKeyRef.current = k;
      childFocusStrategyRef.current = childFocusStrategy;
      setFocusedKey(k);
    },
    selectedKeys,
    setSelectedKeys(keys) {
      if (allowDuplicateSelectionEvents || !equalSets(keys, selectedKeys)) {
        setSelectedKeys(keys);
      }
    },
    disabledKeys: disabledKeysProp
  };
}

function convertSelection(selection: 'all' | Iterable<Key>, defaultValue?: Selection): 'all' | Selection {
  if (!selection) {
    return defaultValue;
  }

  return selection === 'all'
    ? 'all'
    : new Selection(selection);
}
