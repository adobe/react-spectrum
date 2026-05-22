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

import type {DragAndDropOptions as RACDragAndDropOptions} from 'react-aria-components/useDragAndDrop';
import {useDragAndDrop as useRACDragAndDrop} from 'react-aria-components/useDragAndDrop';

export type DragAndDropOptions<T = object> = Omit<RACDragAndDropOptions<T>, 'renderDropIndicator'>;

export function useDragAndDrop<T = object>(
  options: DragAndDropOptions<T>
): ReturnType<typeof useRACDragAndDrop<T>> {
  return useRACDragAndDrop(options);
}
