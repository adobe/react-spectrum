
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

import {ColumnProps} from '@react-stately/table';

export interface SpectrumColumnProps<T> extends ColumnProps<T> {
  /**
   * The alignment of the column's contents relative to its allotted width.
   * @default 'start'
   */
  align?: 'start' | 'center' | 'end',
  // /** Whether the column should stick to the viewport when scrolling. */
  // isSticky?: boolean, // shouldStick?? Not implemented yet?
  /** Whether the column should render a divider between it and the next column. */
  showDivider?: boolean,
  /**
   * Whether the column should hide its header text. A tooltip with the column's header text
   * will be displayed when the column header is focused instead. Note that this prop is specifically for columns
   * that contain ActionButtons in place of text content.
   */
  hideHeader?: boolean
}
