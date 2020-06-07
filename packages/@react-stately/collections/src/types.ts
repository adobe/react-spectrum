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

import {ItemRenderer} from '@react-types/shared';
import {Key, ReactElement, ReactNode} from 'react';

export interface Node<T> {
  /** The type of item this node represents. */
  type: string,
  /** A unique key for the node. */
  key: Key,
  /** The object value the node was created from. */
  value: T,
  /** The level of depth this node is at in the heirarchy. */
  level: number,
  /** Whether this item has children, even if not loaded yet. */
  hasChildNodes: boolean,
  /** The loaded children of this node. */
  childNodes: Iterable<Node<T>>,
  /** The rendered contents of this node (e.g. JSX). */
  rendered: ReactNode,
  /** A string value for this node, used for features like typeahead. */
  textValue: string,
  /** An accessibility label for this node. */
  'aria-label'?: string,
  /** The index of this node within its parent. */
  index?: number,
  /** A function that should be called to wrap the rendered node. */
  wrapper?: (element: ReactElement) => ReactElement,
  /** The key of the parent node. */
  parentKey?: Key,
  /** The key of the node before this node. */
  prevKey?: Key,
  /** The key of the node after this node. */
  nextKey?: Key,
  /** Additional properties specific to a particular node type. */
  props?: any,
  /** @private */
  shouldInvalidate?: (context: unknown) => boolean
}

export interface PartialNode<T> {
  type?: string,
  key?: Key,
  value?: T,
  element?: ReactElement,
  wrapper?: (element: ReactElement) => ReactElement,
  rendered?: ReactNode,
  textValue?: string,
  'aria-label'?: string,
  index?: number,
  renderer?: ItemRenderer<T>,
  hasChildNodes?: boolean,
  childNodes?: () => IterableIterator<PartialNode<T>>,
  props?: any,
  shouldInvalidate?: (context: unknown) => boolean
}
