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

import {CollectionBase, Node} from '@react-types/shared';
import {Key} from 'react';

export interface TagGroupProps<T> extends Omit<CollectionBase<T>, 'disabledKeys'> {
  /** Whether the TagGroup allows removal of tags. */
  allowsRemoving?: boolean,
  /** Called when the user removes a tag.  */
  onRemove?: (key: Key) => void,
  /** Limit the number of rows initially shown. This will render a button that allows the user to expand to show all tags. */
  maxRows?: number
}

export interface TagProps<T> {
  /** Whether the tag is removable. */
  allowsRemoving?: boolean,
  /** An object representing the tag. Contains all the relevant information that makes up the tag. */
  item: Node<T>,
  /** Handler that is called when the user triggers the tag's remove button. */
  onRemove?: (key: Key) => void
}
