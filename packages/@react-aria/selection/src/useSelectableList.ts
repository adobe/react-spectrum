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
import {FocusStrategy} from '@react-types/menu';
import {HTMLAttributes, RefObject, useEffect, useMemo} from 'react';
import {KeyboardDelegate} from '@react-types/shared';
import {ListKeyboardDelegate} from './ListKeyboardDelegate';
import {MultipleSelectionManager} from '@react-stately/selection';
import {useCollator} from '@react-aria/i18n';
import {useSelectableCollection} from './useSelectableCollection';

interface SelectableListOptions {
  selectionManager: MultipleSelectionManager,
  collection: Collection<Node<unknown>>,
  ref?: RefObject<HTMLElement>,
  keyboardDelegate?: KeyboardDelegate,
  autoFocus?: boolean,
  focusStrategy?: FocusStrategy,
  wrapAround?: boolean,
  isVirtualized?: boolean,
  escapeClearsSelection?: boolean
}

interface SelectableListAria {
  listProps: HTMLAttributes<HTMLElement>
}

export function useSelectableList(props: SelectableListOptions): SelectableListAria {
  let {
    selectionManager,
    collection,
    ref,
    keyboardDelegate,
    autoFocus,
    focusStrategy,
    wrapAround,
    isVirtualized,
    escapeClearsSelection = false
  } = props;

  // By default, a KeyboardDelegate is provided which uses the DOM to query layout information (e.g. for page up/page down).
  // When virtualized, the layout object will be passed in as a prop and override this.
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let delegate = useMemo(() => keyboardDelegate || new ListKeyboardDelegate(collection, ref, collator), [keyboardDelegate, collection, ref, collator]);

  // If not virtualized, scroll the focused element into view when the focusedKey changes.
  // When virtualized, CollectionView handles this internally.
  useEffect(() => {
    if (!isVirtualized && selectionManager.focusedKey) {
      let element = ref.current.querySelector(`[data-key="${selectionManager.focusedKey}"]`);
      if (element) {
        element.scrollIntoView({block: 'nearest'});
      }
    }
  }, [isVirtualized, ref, selectionManager.focusedKey]);

  let {collectionProps} = useSelectableCollection({
    selectionManager,
    keyboardDelegate: delegate,
    autoFocus,
    focusStrategy,
    wrapAround,
    escapeClearsSelection
  });

  return {
    listProps: collectionProps
  };
}
