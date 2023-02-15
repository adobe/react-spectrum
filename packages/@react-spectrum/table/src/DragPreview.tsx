/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {classNames} from '@react-spectrum/utils';
import {Direction} from '@react-types/shared';
import {GridNode} from '@react-types/grid';
import React from 'react';
import {SpectrumTableProps} from '@react-types/table';
import styles from '@adobe/spectrum-css-temp/components/table/vars.css';
import stylesOverrides from './table.css';
import type {TableLayout} from '@react-stately/layout';

interface DragPreviewProps<T> {
  item: GridNode<any>,
  itemCount: number,
  density: SpectrumTableProps<T>['density'],
  layout: TableLayout<T>,
  direction: Direction
}

interface TableCellPreviewProps {
  cell: GridNode<any>,
  layout: TableLayout<any>,
  selectionCellWidth: number,
  dragButtonCellWidth: number,
  direction: Direction
}

export function TableCellPreview(props: TableCellPreviewProps) {
  let {cell, layout, selectionCellWidth, dragButtonCellWidth, direction} = props;
  let {align} = cell.column.props;
  let {x: left, height, width} = layout.getLayoutInfo(cell.key).rect;
  if (cell.props.isSelectionCell) {
    return null;
  }
  // Move cell over since we aren't showing selection or drag cells in preview.
  left = left - selectionCellWidth - dragButtonCellWidth;
  let right: number;
  if (direction === 'rtl') {
    right = left;
    left = undefined;
  }
  return (
    <div
      style={{left, right, height, width, position: 'absolute'}}
      className={
          classNames(
            styles,
            'spectrum-Table-cell',
            classNames(
              stylesOverrides,
              'react-spectrum-Table-cell',
              {
                'react-spectrum-Table-cell--alignStart': align === 'start',
                'react-spectrum-Table-cell--alignCenter': align === 'center',
                'react-spectrum-Table-cell--alignEnd': align === 'end'
              }
            )
          )
        }>
      <span
        className={
            classNames(
              styles,
              'spectrum-Table-cellContents'
            )
        }>
        {cell.rendered}
      </span>
    </div>
  );
}

export function DragPreview(props: DragPreviewProps<unknown>) {
  let {
    item,
    itemCount,
    density,
    layout,
    direction
  } = props;
  let {height, width} = layout.getLayoutInfo(item.key).rect;

  let isDraggingMultiple = itemCount > 1;

  let cells = [...item.childNodes];
  let dragButtonCellWidth = layout.getLayoutInfo(cells[0].key).rect.width;
  let selectionCellWidth = cells[1].props.isSelectionCell ? layout.getLayoutInfo(cells[1].key).rect.width : 0;

  width = width - selectionCellWidth - dragButtonCellWidth;
  // TODO: get correct width needed for badge
  // TODO: vertically center badge for spacious/compact
  // TODO: RTL support
  width = isDraggingMultiple ? width + 8 : width;
  return (
    <div
      style={{height, width}}
      className={
        classNames(
          styles,
          'spectrum-Table-row',
          classNames(
            stylesOverrides,
            'react-spectrum-Table-row-dragPreview',
            {'react-spectrum-Table-row-dragPreview--multiple': isDraggingMultiple},
            `react-spectrum-Table-row-dragPreview--${density}`
          )
        )
      }>
      {cells.map((cell) => (
        <TableCellPreview
          key={cell.key}
          cell={cell}
          layout={layout}
          selectionCellWidth={selectionCellWidth}
          dragButtonCellWidth={dragButtonCellWidth}
          direction={direction} />
      ))}
      {isDraggingMultiple &&
        <div className={classNames(stylesOverrides, 'react-spectrum-Table-row-badge')}>{itemCount}</div>
      }
    </div>
  );
}
