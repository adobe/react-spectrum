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

import {AllHTMLAttributes, Key, ReactElement, RefObject} from 'react';
import {CollectionBase, DOMProps, Expandable, MultipleSelection, Orientation, StyleProps} from '@react-types/shared';
import {Node} from '@react-stately/collections';
import {TreeState} from '@react-stately/tree';

export type FocusStrategy = 'first' | 'last';

export interface MenuTriggerState {
  isOpen: boolean,
  setOpen: (value: boolean) => void,
  focusStrategy: FocusStrategy,
  setFocusStrategy: (value: FocusStrategy) => void
}

export interface MenuTriggerProps {
  ref?: RefObject<HTMLElement | null>,
  type?: 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid',
  isDisabled?: boolean
} 

export interface SpectrumMenuTriggerProps extends MenuTriggerProps {
  children: ReactElement[],
  trigger?: 'press' | 'longPress',
  align?: 'start' | 'end',
  direction?: 'bottom' | 'top', // left right?
  isOpen?: boolean,
  defaultOpen?: boolean,
  onOpenChange?: (isOpen: boolean) => void,
  shouldFlip?: boolean,
  closeOnSelect?: boolean
}

export interface MenuProps<T> extends CollectionBase<T>, Expandable, MultipleSelection {
  autoFocus?: boolean,
  focusStrategy?: FocusStrategy,
  wrapAround?: boolean
}

export interface SpectrumMenuProps<T> extends MenuProps<T>, DOMProps, StyleProps {
}

export interface SpectrumMenuHeadingProps<T> {
  item: Node<T>
}
