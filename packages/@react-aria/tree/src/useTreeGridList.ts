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

import {AriaGridListOptions, AriaGridListProps, GridListProps, useGridList} from '@react-aria/gridlist';
import {
  DOMAttributes,
  KeyboardDelegate
} from '@react-types/shared';
import {RefObject} from 'react';
import {TreeState} from '@react-stately/tree';

export interface TreeGridListProps<T> extends GridListProps<T> {}

export interface AriaTreeGridListProps<T> extends AriaGridListProps<T> {}
export interface AriaTreeGridListOptions<T> extends Omit<AriaGridListOptions<T>, 'children' | 'isVirtualized' | 'shouldFocusWrap'> {
  /**
   * An optional keyboard delegate implementation for type to select,
   * to override the default.
   */
  keyboardDelegate?: KeyboardDelegate
}

export interface TreeGridListAria {
  /** Props for the treegrid element. */
  gridProps: DOMAttributes
}

/**
 * Provides the behavior and accessibility implementation for a single column treegrid component with interactive children.
 * A tree grid provides users with a way to navigate nested hierarchical information.
 * @param props - Props for the treegrid.
 * @param state - State for the treegrid, as returned by `useTreeState`.
 * @param ref - The ref attached to the treegrid element.
 */
export function useTreeGridList<T>(props: AriaTreeGridListOptions<T>, state: TreeState<T>, ref: RefObject<HTMLElement>): TreeGridListAria {
  let {gridProps} = useGridList(props, state, ref);
  gridProps.role = 'treegrid';

  return {
    gridProps
  };
}
