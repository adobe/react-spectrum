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

import {
  Dispatch,
  MutableRefObject,
  ReactElement,
  SetStateAction
} from 'react';
import {Orientation} from './orientation';

export interface SplitViewStatelyProps {
  allowsCollapsing?: boolean,
  onResize?: (primarySize: number) => void,
  onResizeEnd?: (primarySize: number) => void,
  primarySize?: number,
  defaultPrimarySize?: number
}

export interface SplitViewHandleState {
  offset: number,
  dragging: boolean,
  hovered: boolean,
  setOffset: (value: number) => void,
  setDragging: (value: boolean) => void,
  setHover: (value: boolean) => void,
  increment: () => void,
  decrement: () => void,
  incrementToMax: () => void,
  decrementToMin: () => void,
  collapseToggle: () => void
}

export interface SplitViewContainerState {
  minPos: number,
  maxPos: number,
  setMinPos: Dispatch<SetStateAction<number>>,
  setMaxPos: Dispatch<SetStateAction<number>>
}

export interface SplitViewState {
  handleState: SplitViewHandleState,
  containerState: SplitViewContainerState
}

export interface SplitViewAriaProps {
  id?: string,
  allowsResizing?: boolean,
  orientation?: Orientation,
  primaryPane?: 0 | 1,
  primaryMinSize?: number,
  primaryMaxSize?: number,
  secondaryMinSize?: number,
  secondaryMaxSize?: number,
  'aria-label'?: string,
  'aria-labelledby'?: string,
  containerRef?: MutableRefObject<HTMLDivElement>
}

export interface SplitViewProps {
  children: [ReactElement, ReactElement],
  orientation?: Orientation,
  allowsResizing?: boolean,
  allowsCollapsing?: boolean,
  onResize?: (primarySize: number) => void,
  onResizeEnd?: (primarySize: number) => void,
  primaryPane?: 0 | 1,
  primarySize?: number,
  defaultPrimarySize?: number,
  primaryMinSize?: number,
  primaryMaxSize?: number,
  secondaryMinSize?: number,
  secondaryMaxSize?: number
}
