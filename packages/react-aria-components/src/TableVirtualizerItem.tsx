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

import {getTableVirtualizerItemStyle} from 'react-aria/private/table/tableVirtualizerStyle';
import {GridNode} from 'react-stately/private/grid/GridCollection';
import React, {JSX} from 'react';
import {useLocale} from 'react-aria/I18nProvider';
import {VirtualizerItem} from 'react-aria/private/virtualizer/VirtualizerItem';
import {VirtualizerItemRenderProps} from './Virtualizer';

/**
 * A virtualizer item renderer for tables that reads column widths from CSS custom
 * properties on an ancestor. Use as the `renderItem` prop on `Virtualizer` when
 * rendering a resizable virtualized table.
 */
export function TableVirtualizerItem(props: VirtualizerItemRenderProps): JSX.Element {
  let {viewKey, layoutInfo, virtualizer, parent, children, content} = props;
  let {direction} = useLocale();

  let gridNode = content as GridNode<unknown> | null | undefined;
  let columnIndex = gridNode != null ? (gridNode.colIndex ?? gridNode.index) : undefined;
  let colSpan = gridNode?.colSpan ?? 1;
  let usesColumnCSSVariables = layoutInfo.type === 'column' || layoutInfo.type === 'cell';
  let style =
    usesColumnCSSVariables && columnIndex != null
      ? getTableVirtualizerItemStyle(layoutInfo, direction, parent, columnIndex, colSpan)
      : undefined;

  return (
    <VirtualizerItem
      key={viewKey}
      layoutInfo={layoutInfo}
      virtualizer={virtualizer}
      parent={parent}
      style={style}
      nativeProps={columnIndex != null ? {'data-column-index': columnIndex} : undefined}>
      {children}
    </VirtualizerItem>
  );
}

export function renderTableVirtualizerItem(props: VirtualizerItemRenderProps): JSX.Element {
  return <TableVirtualizerItem key={props.viewKey} {...props} />;
}
