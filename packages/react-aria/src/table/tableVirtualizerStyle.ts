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

import {CSSProperties} from 'react';
import {Direction} from '@react-types/shared';
import {getColumnHorizontalStyle} from 'react-stately/useTableState';
import {LayoutInfo} from 'react-stately/useVirtualizerState';
import {layoutInfoToStyle} from '../virtualizer/VirtualizerItem';

/**
 * Returns styles for a table column or cell virtualizer wrapper that reads
 * horizontal positioning from CSS custom properties on an ancestor.
 */
export function getTableVirtualizerItemStyle(
  layoutInfo: LayoutInfo,
  direction: Direction,
  parent: LayoutInfo | null | undefined,
  columnIndex?: number,
  colSpan: number = 1
): CSSProperties {
  let usesColumnCSSVars = layoutInfo.type === 'column' || layoutInfo.type === 'cell';

  if (!usesColumnCSSVars || columnIndex == null) {
    return layoutInfoToStyle(layoutInfo, direction, parent);
  }

  let baseStyle = layoutInfoToStyle(layoutInfo, direction, parent);
  let xProperty = direction === 'rtl' ? 'right' : 'left';
  let columnStyle = getColumnHorizontalStyle(columnIndex, colSpan);

  return {
    ...baseStyle,
    ...columnStyle,
    [xProperty]: undefined,
    width: columnStyle.width,
    contain: 'layout style'
  };
}
