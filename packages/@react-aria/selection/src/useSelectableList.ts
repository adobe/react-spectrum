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

import {AriaSelectableCollectionOptions, useSelectableCollection} from './useSelectableCollection';
import {Collection, DOMAttributes, Key, KeyboardDelegate, LayoutDelegate, Node} from '@react-types/shared';
import {ListKeyboardDelegate} from './ListKeyboardDelegate';
import {useCollator} from '@react-aria/i18n';
import {useMemo} from 'react';

export interface AriaSelectableListOptions extends Omit<AriaSelectableCollectionOptions, 'keyboardDelegate'> {
  /**
   * State of the collection.
   */
  collection: Collection<Node<unknown>>,
  /**
   * A delegate object that implements behavior for keyboard focus movement.
   */
  keyboardDelegate?: KeyboardDelegate,
  /**
   * A delegate object that provides layout information for items in the collection.
   * By default this uses the DOM, but this can be overridden to implement things like
   * virtualized scrolling.
   */
  layoutDelegate?: LayoutDelegate,
  /**
   * The item keys that are disabled. These items cannot be selected, focused, or otherwise interacted with.
   */
  disabledKeys: Set<Key>
}

export interface SelectableListAria {
  /**
   * Props for the option element.
   */
  listProps: DOMAttributes
}

/**
 * Handles interactions with a selectable list.
 */
export function useSelectableList(props: AriaSelectableListOptions): SelectableListAria {
  let {
    selectionManager,
    collection,
    disabledKeys,
    ref,
    keyboardDelegate,
    layoutDelegate
  } = props;

  // By default, a KeyboardDelegate is provided which uses the DOM to query layout information (e.g. for page up/page down).
  // When virtualized, the layout object will be passed in as a prop and override this.
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let disabledBehavior = selectionManager.disabledBehavior;
  let delegate = useMemo(() => (
    keyboardDelegate || new ListKeyboardDelegate({
      collection,
      disabledKeys,
      disabledBehavior,
      ref,
      collator,
      layoutDelegate
    })
  ), [keyboardDelegate, layoutDelegate, collection, disabledKeys, ref, collator, disabledBehavior]);

  let {collectionProps} = useSelectableCollection({
    ...props,
    ref,
    selectionManager,
    keyboardDelegate: delegate
  });

  return {
    listProps: collectionProps
  };
}
