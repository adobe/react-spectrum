/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Key} from '@react-types/shared';
import {useControlledState} from '@react-stately/utils';
import {useEffect, useMemo} from 'react';

export interface DisclosureGroupProps {
  /** Whether multiple items can be expanded at the same time. */
  allowsMultipleExpanded?: boolean,
  /** Whether all items are disabled. */
  isDisabled?: boolean,
  /** The currently expanded keys in the group (controlled). */
  expandedKeys?: Iterable<Key>,
  /** The initial expanded keys in the group (uncontrolled). */
  defaultExpandedKeys?: Iterable<Key>,
  /** Handler that is called when items are expanded or collapsed. */
  onExpandedChange?: (keys: Set<Key>) => any
}

export interface DisclosureGroupState {
  /** Whether multiple items can be expanded at the same time. */
  readonly allowsMultipleExpanded: boolean,

  /** Whether all items are disabled. */
  readonly isDisabled: boolean,

  /** A set of keys for items that are expanded. */
  readonly expandedKeys: Set<Key>,

  /** Toggles the expanded state for an item by its key. */
  toggleKey(key: Key): void,

  /** Replaces the set of expanded keys. */
  setExpandedKeys(keys: Set<Key>): void
}

/**
 * Manages state for a group of disclosures, e.g. an accordion.
 * It supports both single and multiple expanded items.
 */
export function useDisclosureGroupState(props: DisclosureGroupProps): DisclosureGroupState {
  let {allowsMultipleExpanded = false, isDisabled = false} = props;
  let [expandedKeys, setExpandedKeys] = useControlledState(
    useMemo(() => props.expandedKeys ? new Set(props.expandedKeys) : undefined, [props.expandedKeys]),
    useMemo(() => props.defaultExpandedKeys ? new Set(props.defaultExpandedKeys) : new Set(), [props.defaultExpandedKeys]),
    props.onExpandedChange
  );

  useEffect(() => {
    // Ensure only one item is expanded if allowsMultipleExpanded is false.
    if (!allowsMultipleExpanded && expandedKeys.size > 1) {
      let firstKey = expandedKeys.values().next().value;
      if (firstKey != null) {
        setExpandedKeys(new Set([firstKey]));
      }
    }
  });

  return {
    allowsMultipleExpanded,
    isDisabled,
    expandedKeys,
    setExpandedKeys,
    toggleKey(key) {
      let keys: Set<Key>;
      if (allowsMultipleExpanded) {
        keys = new Set(expandedKeys);
        if (keys.has(key)) {
          keys.delete(key);
        } else {
          keys.add(key);
        }
      } else {
        keys = new Set(expandedKeys.has(key) ? [] : [key]);
      }

      setExpandedKeys(keys);
    }
  };
}
