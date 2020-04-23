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
import {Key, useEffect, useMemo, useRef} from 'react';
import {SelectState, useSelectState} from '@react-stately/select';
import {useControlledState} from '@react-stately/utils';

export interface ComboBoxState<T> extends SelectState<T> {
  value: string,
  setValue: (value: string) => void
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

function usePrevious(value) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef();

  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current;
}

export function useComboBoxState<T>(props: ComboBoxProps<T>): ComboBoxState<T> {
  let itemsControlled = !!props.onFilter;
  let trigger = props.menuTrigger || 'input';
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

  if (value !== '') {
    selectState.collection = new FilteredCollection(selectState.collection, (node) => node.textValue.startsWith(value));
  }
  if (selectState.isOpen && selectState.collection.size === 0) {
    selectState.close();
  }

  let open = () => {
    if (props.isFocused) {
      selectState.open();
    }
  };

  let toggle = (strategy, force) => {
    if (props.isFocused || force) {
      selectState.toggle(strategy);
    }
  };

  /**
   * open
   prop isOpen - unless collection size is 0
   prop defaultIsOpen - unless collection size is 0
   button clicked - unless collection size is 0
   arrow down/up - unless collection size is 0
   mode: input - input onChange - unless collection size is 0
   mode: focus - input onFocus - unless collection size is 0

   close
   prop isOpen removed
   button clicked
   input onBlur
   esc key
   collection size is 0
   onSelectionChange (edited)
   */

  // do i need a new selection manager?

  // For completionMode = complete
  // let [suggestionValue, setSuggestionValue] = useState('');


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
