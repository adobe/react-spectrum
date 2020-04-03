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

import {CollectionBase, DOMProps, Expandable, MultipleSelection, StyleProps} from '@react-types/shared';
import {HTMLAttributes, ReactNode} from 'react';
import {Node, ReusableView} from '@react-stately/collections';
import {TreeState} from '@react-stately/tree';

export interface SideNavProps<T> extends CollectionBase<T>, Expandable, MultipleSelection, DOMProps, StyleProps {
  wrapAround?: boolean
}

export interface SpectrumSideNavProps<T> extends SideNavProps<T> {
}

export interface SpectrumSideNavItemProps<T> extends HTMLAttributes<HTMLElement>{
  item: Node<T>,
  state: TreeState<T>
}

interface SideNavSectionProps<T> {
  reusableView: ReusableView<Node<T>, unknown>,
  header: ReusableView<Node<T>, unknown>,
  children?: ReactNode
}
