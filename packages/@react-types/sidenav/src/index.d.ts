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

import {AriaLabelingProps, CollectionBase, DOMProps, Expandable, MultipleSelection, Node, StyleProps} from '@react-types/shared';
import {HTMLAttributes, ReactNode} from 'react';
import {ReusableView} from '@react-stately/virtualizer';

export interface SideNavProps<T> extends CollectionBase<T>, Expandable, MultipleSelection {
  shouldFocusWrap?: boolean
}

export interface AriaSideNavProps<T> extends SideNavProps<T>, DOMProps, AriaLabelingProps {}

export interface SpectrumSideNavProps<T> extends AriaSideNavProps<T>, StyleProps {
}

export interface SpectrumSideNavItemProps<T> extends HTMLAttributes<HTMLElement>{
  item: Node<T>
}

export interface SideNavSectionProps<T> {
  reusableView: ReusableView<Node<T>, unknown>,
  header: ReusableView<Node<T>, unknown>,
  children?: ReactNode
}
