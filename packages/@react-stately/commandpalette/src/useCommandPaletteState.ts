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

import {Collection, FocusStrategy, Node} from '@react-types/shared';
import {CommandPaletteProps} from '@react-types/commandpalette';
import {Key, useEffect, useMemo, useState} from 'react';
import {ListCollection, useSingleSelectListState} from '@react-stately/list';
import {SelectState} from '@react-stately/select';
import {useControlledState} from '@react-stately/utils';
import {useMenuTriggerState} from '@react-stately/menu';

export interface CommandPaletteState<T> extends SelectState<T> {
  /** The current value of the command palette input. */
  inputValue: string,
  /** Sets the value of the command palette input. */
  setInputValue(value: string): void,
  /** Opens the menu. */
  open(focusStrategy?: FocusStrategy | null): void,
  /** Toggles the menu. */
  toggle(focusStrategy?: FocusStrategy | null): void
}

type FilterFn = (textValue: string, inputValue: string) => boolean;

export interface CommandPaletteStateOptions<T> extends CommandPaletteProps<T> {
  /** The filter function used to determine if a option should be included in the command palette list. */
  defaultFilter?: FilterFn
}

/**
 * Provides state management for a command palette component. Handles building a collection
 * of items from props and manages the option selection state of the command palette. In addition, it tracks the input value,
 * focus state, and other properties of the command palette.
 */
export function useCommandPaletteState<T extends object>(props: CommandPaletteStateOptions<T>): CommandPaletteState<T> {
  let {
    defaultFilter,
  } = props;
  let [isFocused, setFocusedState] = useState(false);
  let [inputValue, setInputValue] = useControlledState(
    props.inputValue,
    props.defaultInputValue ?? '',
    props.onInputChange
  );

  let onSelectionChange = (key: Key) => {
    if (props.onAction) {
      props.onAction(key);
    }

    // Since selection occurred, reset input and close
    resetInputValue();
    triggerState.close();
  };

  let {collection, selectionManager, selectedKey, setSelectedKey, selectedItem, disabledKeys} = useSingleSelectListState({
    ...props,
    onSelectionChange,
    items: props.items ?? props.defaultItems
  });

  let filteredCollection = useMemo(() => (
    // No default filter if items are controlled.
    props.items != null || !defaultFilter
      ? collection
      : filterCollection(collection, inputValue, defaultFilter)
  ), [collection, inputValue, defaultFilter, props.items]);

  let onOpenChange = (open: boolean) => {
    if (props.onOpenChange) {
      props.onOpenChange(open);
    }
  };

  let triggerState = useMenuTriggerState({...props, onOpenChange, defaultOpen: undefined});
  let open = (focusStrategy?: FocusStrategy) => {
    triggerState.open(focusStrategy);
  };

  let toggle = (focusStrategy?: FocusStrategy) => {
    triggerState.toggle(focusStrategy);
  };

  let resetInputValue = () => {
    setInputValue('');
  };

  useEffect(() => {
    // Reset focused key when the menu closes
    if (!triggerState.isOpen) {
      selectionManager.setFocusedKey(null);
    }
  }, [triggerState.isOpen, selectionManager]);

  useEffect(() => {
    // TODO: Clear selected key immediately
    selectionManager.clearSelection();
    console.log('clear');
  }, [selectedKey]);

  let setFocused = (isFocused: boolean) => {
    setFocusedState(isFocused);
  };

  let close = () => {
    resetInputValue();
    triggerState.close();
  };

  return {
    ...triggerState,
    toggle,
    open,
    close,
    selectionManager,
    selectedKey,
    setSelectedKey,
    disabledKeys,
    isFocused,
    setFocused,
    selectedItem,
    collection: filteredCollection,
    inputValue,
    setInputValue
  };
}

function filterCollection<T extends object>(collection: Collection<Node<T>>, inputValue: string, filter: FilterFn): Collection<Node<T>> {
  return new ListCollection(filterNodes(collection, inputValue, filter));
}

function filterNodes<T>(nodes: Iterable<Node<T>>, inputValue: string, filter: FilterFn): Iterable<Node<T>> {
  let filteredNode = [];
  for (let node of nodes) {
    if (node.type === 'section' && node.hasChildNodes) {
      let filtered = filterNodes(node.childNodes, inputValue, filter);
      if ([...filtered].length > 0) {
        filteredNode.push({...node, childNodes: filtered});
      }
    } else if (node.type !== 'section' && filter(node.textValue, inputValue)) {
      filteredNode.push({...node});
    }
  }
  return filteredNode;
}
