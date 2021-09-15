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

import {Collection, FocusStrategy, KeyboardDelegate, Node} from '@react-types/shared';
import {HTMLAttributes, Key, RefObject, useMemo} from 'react';
import {ListKeyboardDelegate} from './ListKeyboardDelegate';
import {MultipleSelectionManager} from '@react-stately/selection';
import {useCollator} from '@react-aria/i18n';
import {useSelectableCollection} from './useSelectableCollection';

interface SelectableListOptions {
  /**
   * An interface for reading and updating multiple selection state.
   */
  selectionManager: MultipleSelectionManager,
  /**
   * State of the collection.
   */
  collection: Collection<Node<unknown>>,
  /**
   * The item keys that are disabled. These items cannot be selected, focused, or otherwise interacted with.
   */
  disabledKeys: Set<Key>,
  /**
   * A ref to the item.
   */
  ref?: RefObject<HTMLElement>,
  /**
   * A delegate that returns collection item keys with respect to visual layout.
   */
  keyboardDelegate?: KeyboardDelegate,
  /**
   * Whether the collection or one of its items should be automatically focused upon render.
   * @default false
   */
  autoFocus?: boolean | FocusStrategy,
  /**
   * Whether focus should wrap around when the end/start is reached.
   * @default false
   */
  shouldFocusWrap?: boolean,
  /**
   * Whether the option is contained in a virtual scroller.
   */
  isVirtualized?: boolean,
  /**
   * Whether the collection allows empty selection.
   * @default false
   */
  disallowEmptySelection?: boolean,
  /**
   * Whether selection should occur automatically on focus.
   * @default false
   */
  selectOnFocus?: boolean,
  /**
   * Whether typeahead is disabled.
   * @default false
   */
  disallowTypeAhead?: boolean,
  /**
   * Whether the collection items should use virtual focus instead of being focused directly.
   */
  shouldUseVirtualFocus?: boolean,
  /**
   * Whether navigation through tab key is enabled.
   */
  allowsTabNavigation?: boolean
}

interface SelectableListAria {
  /**
   * Props for the option element.
   */
  listProps: HTMLAttributes<HTMLElement>
}

/**
 * Handles interactions with a selectable list.
 */
export function useSelectableList(props: SelectableListOptions): SelectableListAria {
  let {
    selectionManager,
    collection,
    disabledKeys,
    ref,
    keyboardDelegate,
    autoFocus,
    shouldFocusWrap,
    isVirtualized,
    disallowEmptySelection,
    selectOnFocus = false,
    disallowTypeAhead,
    shouldUseVirtualFocus,
    allowsTabNavigation
  } = props;

  // By default, a KeyboardDelegate is provided which uses the DOM to query layout information (e.g. for page up/page down).
  // When virtualized, the layout object will be passed in as a prop and override this.
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let delegate = useMemo(() => keyboardDelegate || new ListKeyboardDelegate(collection, disabledKeys, ref, collator), [keyboardDelegate, collection, disabledKeys, ref, collator]);

  let {collectionProps} = useSelectableCollection({
    ref,
    selectionManager,
    keyboardDelegate: delegate,
    autoFocus,
    shouldFocusWrap,
    disallowEmptySelection,
    selectOnFocus,
    disallowTypeAhead,
    shouldUseVirtualFocus,
    allowsTabNavigation,
    isVirtualized,
    scrollRef: ref
  });

  return {
    listProps: collectionProps
  };
}
