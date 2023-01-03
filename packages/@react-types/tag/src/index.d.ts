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

import {AriaLabelingProps, CollectionBase, DOMProps, ItemProps, Node, StyleProps} from '@react-types/shared';
import {Key, RefObject} from 'react';

export interface TagGroupProps<T> extends Omit<CollectionBase<T>, 'disabledKeys'> {
  /** Whether the TagGroup allows removal of tags. */
  allowsRemoving?: boolean,
  /** Called when the user removes a tag.  */
  onRemove?: (key: Key) => void
}

export interface AriaTagGroupProps<T> extends TagGroupProps<T>, DOMProps, AriaLabelingProps {}

export interface SpectrumTagGroupProps<T> extends AriaTagGroupProps<T>, StyleProps {}

export interface TagProps<T> extends ItemProps<any> {
  isFocused: boolean,
  allowsRemoving?: boolean,
  item: Node<T>,
  onRemove?: (key: Key) => void,
  tagRowRef: RefObject<HTMLElement>
}
