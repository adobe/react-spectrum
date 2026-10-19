/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import type {
  DragAndDrop,
  DragAndDropOptions as RACDragAndDropOptions
} from 'react-aria-components/useDragAndDrop';
import {useMediaQuery} from './useMediaQuery';
import {useMemo} from 'react';
import {useDragAndDrop as useRACDragAndDrop} from 'react-aria-components/useDragAndDrop';

export type {DragAndDrop};

export interface DragAndDropOptions<T = object> extends Omit<
  RACDragAndDropOptions<T>,
  'renderDropIndicator'
> {
  /**
   * Whether mouse dragging can start from the entire item or only from its drag handle.
   * On touch devices, dragging can always start from the entire item.
   *
   * @default 'item'
   */
  pointerDragSource?: 'item' | 'handle';
}

/**
 * Provides the hooks required to enable drag and drop behavior for a drag and drop compatible
 * collection component.
 */
export function useDragAndDrop<T = object>(options: DragAndDropOptions<T>): DragAndDrop<T> {
  let isTouchDevice = useMediaQuery('not ((hover: hover) and (pointer: fine))');
  let racOptions = useMemo(
    () => ({
      ...options,
      pointerDragSource: isTouchDevice ? 'item' : options.pointerDragSource
    }),
    [options, isTouchDevice]
  );
  return useRACDragAndDrop(racOptions);
}
