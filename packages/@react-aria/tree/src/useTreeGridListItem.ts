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

import {AriaButtonProps} from '@react-types/button';
import {AriaGridListItemOptions, GridListItemAria, useGridListItem} from '@react-aria/gridlist';
import {DOMAttributes, FocusableElement, Node} from '@react-types/shared';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {isAndroid} from '@react-aria/utils';
import {RefObject} from 'react';
import {TreeState} from '@react-stately/tree';
import {useLocalizedStringFormatter} from '@react-aria/i18n';

export interface AriaTreeGridListItemOptions extends Omit<AriaGridListItemOptions, 'isVirtualized'> {
  /** An object representing the treegrid item. Contains all the relevant information that makes up the treegrid row. */
  node: Node<unknown>
}

export interface TreeGridListItemAria extends GridListItemAria {
  /** Props for the tree grid row element. */
  rowProps: DOMAttributes,
  /** Props for the tree grid cell element within the tree grid list row. */
  gridCellProps: DOMAttributes,
  /** Props for the tree grid row description element, if any. */
  descriptionProps: DOMAttributes,
  /** Props for the tree grid row expand button. */
  expandButtonProps: AriaButtonProps
}

/**
 * Provides the behavior and accessibility implementation for a row in a tree grid list.
 * @param props - Props for the row.
 * @param state - State of the parent list, as returned by `useTreeState`.
 * @param ref - The ref attached to the row element.
 */
export function useTreeGridListItem<T>(props: AriaTreeGridListItemOptions, state: TreeState<T>, ref: RefObject<FocusableElement>): TreeGridListItemAria {
  let {node} = props;
  let gridListAria = useGridListItem(props, state, ref);
  let isExpanded = gridListAria.rowProps['aria-expanded'] === true;
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-aria/tree');

  let expandButtonProps = {
    onPress: () => {
      if (!gridListAria.isDisabled) {
        state.toggleKey(node.key);
        state.selectionManager.setFocused(true);
        state.selectionManager.setFocusedKey(node.key);
      }
    },
    'aria-label': isExpanded ? stringFormatter.format('collapse') : stringFormatter.format('expand'),
    tabIndex: isAndroid() ? -1 : null,
    'data-react-aria-prevent-focus': true
  };

  // TODO: should it return a state specifically for isExpanded? Or is aria attribute sufficient?
  return {
    ...gridListAria,
    expandButtonProps
  };
}
