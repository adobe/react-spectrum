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

import {Collection, Node} from '@react-stately/collections';
import {CollectionBase, SingleSelection} from '@react-types/shared';
import {FocusStrategy} from '@react-types/menu';
import {Key, useEffect, useMemo} from 'react';
import {ListState} from '@react-stately/list';
import {useCollator} from '@react-aria/i18n';
import {useControlledState} from '@react-stately/utils';
import {useSelectState} from '@react-stately/select';

// Can't extend SelectState because we modify toggle here, copied types for now
export interface ComboBoxState<T> extends ListState<T> {
  /** The key for the currently selected item. */
  selectedKey: Key,
  /** Sets the selected key. */
  setSelectedKey: (key: Key) => void,
  /** The value of the currently selected item. */
  selectedItem: Node<T>,
  /** Whether the select is currently focused. */
  isFocused: boolean,
  /** Sets whether the select is focused. */
  setFocused: (isFocused: boolean) => void,
  /** Whether the menu is currently open. */
  isOpen: boolean,
  /** Sets whether the menu is open. */
  setOpen(value: boolean): void,
  /** Controls which item will be auto focused when the menu opens. */
  focusStrategy: FocusStrategy,
  /** Sets which item will be auto focused when the menu opens. */
  setFocusStrategy(value: FocusStrategy): void,
  /** Opens the menu. */
  open(): void,
  /** Closes the menu. */
  close(): void,
  value: string,
  setValue: (value: string) => void,
  toggle: (strategy: FocusStrategy | null, force?: boolean) => void
}

interface ComboBoxProps<T> extends CollectionBase<T>, SingleSelection {
  isOpen?: boolean,
  defaultOpen?: boolean,
  onOpenChange?: (isOpen: boolean) => void,
  inputValue?: string,
  defaultInputValue?: string,
  onInputChange?: (value: string) => void,
  onFilter?: (value: string) => void,
  allowsCustomValue?: boolean,
  onCustomValue?: (value: string) => void,
  completionMode?: 'suggest' | 'complete',
  menuTrigger?: 'focus' | 'input' | 'manual',
  isFocused: boolean
}

function* filter<T>(nodes: Iterable<Node<T>>, filterFn: (node: Node<T>) => boolean) {
  for (let node of nodes) {
    if (filterFn(node)) {
      yield node;
    }
  }
}

class FilteredCollection<T> implements Collection<Node<T>> {
  private keyMap: Map<Key, Node<T>> = new Map();
  private iterable: Iterable<Node<T>>;
  private firstKey: Key;
  private lastKey: Key;
  private filterFn: (node: Node<T>) => boolean;

  constructor(nodes: Iterable<Node<T>>, filterFn: (node: Node<T>) => boolean) {
    this.filterFn = filterFn;
    this.iterable = nodes;

    let visit = (node: Node<T>) => {
      this.keyMap.set(node.key, node);

      if (node.childNodes && (node.type === 'section' || node.isExpanded)) {
        for (let child of node.childNodes) {
          visit(child);
        }
      }
    };

    for (let node of this) {
      visit(node);
    }

    let last: Node<T>;
    let index = 0;
    for (let [key, node] of this.keyMap) {
      if (last) {
        last.nextKey = key;
        node.prevKey = last.key;
      } else {
        this.firstKey = key;
      }

      if (node.type === 'item') {
        node.index = index++;
      }

      last = node;
    }

    this.lastKey = last ? last.key : ''; // what to do in empty collection??
  }

  *[Symbol.iterator]() {
    yield* filter(this.iterable, this.filterFn);
  }

  get size() {
    return this.keyMap.size;
  }

  getKeys() {
    return this.keyMap.keys();
  }

  getKeyBefore(key: Key) {
    let node = this.keyMap.get(key);
    return node ? node.prevKey : null;
  }

  getKeyAfter(key: Key) {
    let node = this.keyMap.get(key);
    return node ? node.nextKey : null;
  }

  getFirstKey() {
    return this.firstKey;
  }

  getLastKey() {
    return this.lastKey;
  }

  getItem(key: Key) {
    return this.keyMap.get(key);
  }
}

let whitespace = /\s/;

export function useComboBoxState<T>(props: ComboBoxProps<T>): ComboBoxState<T> {
  let itemsControlled = !!props.onFilter;
  let collator = useCollator({sensitivity: 'base'});
  /*
  let menuControlled = props.isOpen !== undefined;
  let valueControlled = props.inputValue !== undefined;
  let selectedControlled = !!props.selectedKey;
   */

  let selectState = useSelectState(props);

  let selectedKeyItem = props.selectedKey ? selectState.collection.getItem(props.selectedKey) : undefined;
  let selectedKeyText = selectedKeyItem ? selectedKeyItem.textValue || selectedKeyItem.rendered as string : undefined;
  // Maybe don't need to do for defaultSelectedKey? Need to do for selectedKey so that the textfield is properly controlled reflects selectedKey text
  let defaultSelectedKeyItem = props.defaultSelectedKey ? selectState.collection.getItem(props.defaultSelectedKey) : undefined;
  let defaultSelectedKeyText = defaultSelectedKeyItem ? defaultSelectedKeyItem.textValue || defaultSelectedKeyItem.rendered as string : undefined;
  // Double check if props.selectedKey should make textfield value controlled
  let [value, setValue] = useControlledState(toString(props.inputValue) || selectedKeyText, toString(props.defaultInputValue) || defaultSelectedKeyText || '', props.onInputChange);
  let lowercaseValue = value.toLowerCase();

  let defaultFilterFn = useMemo(() => (node: Node<T>) => {
    let scan = 0;
    let lowercaseNode = node.textValue.toLowerCase();
    for (let i in lowercaseValue) {
      if (whitespace.test(lowercaseValue[i])) {
        continue;
      }
      let match = false;
      for (; scan < lowercaseNode.length && !match; scan++) {
        if (!whitespace.test(lowercaseNode[scan])) { // if whitespace, move on to next character
          let compareVal = collator.compare(lowercaseValue[i], lowercaseNode[scan]);
          if (compareVal !== 0) { // if it didn't match, we can exit
            return false;
          } else { // we matched, move to next character in input for comparison
            match = true;
          }
        }
      }
    }
    return true;
  }, [value, collator]);

  selectState.collection = useMemo(() => {
    if (itemsControlled || value === '') {
      return selectState.collection;
    }
    // should value be textValue?
    return new FilteredCollection(selectState.collection, defaultFilterFn);
  }, [selectState.collection, value, itemsControlled, defaultFilterFn]);

  useEffect(() => {
    if (selectState.isOpen && selectState.collection.size === 0) {
      selectState.close();
    }
  }, [selectState.isOpen, selectState.collection, selectState]);


  let open = () => {
    if (props.isFocused) {
      selectState.open();
    }
  };

  let toggle = (strategy, force = false) => {
    if (props.isFocused || force) {
      selectState.toggle(strategy);
    }
  };

  return {
    ...selectState,
    open,
    toggle,
    value,
    setValue
  };
}

function toString(val) {
  if (val == null) {
    return;
  }

  return val.toString();
}
