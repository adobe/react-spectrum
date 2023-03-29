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
import {Direction, Node} from '@react-types/shared';
import {Flex} from '@react-spectrum/layout';
import {GridNode} from '@react-types/grid';
import React from 'react';
import type {SpectrumTableProps} from './TableView';
import styles from '@adobe/spectrum-css-temp/components/table/vars.css';
import stylesOverrides from './table.css';
import type {TableLayout} from '@react-stately/layout';

interface DragPreviewProps<T> {
  item:  Node<T>,
  children: Iterable<Node<T>>,
  itemCount: number,
  density: SpectrumTableProps<T>['density'],
  layout: TableLayout<T>,
  direction: Direction,
  maxWidth: number,
  rowHeaderColumnKeys: Set<React.Key>
}

interface TableCellPreviewProps {
  cell: GridNode<any>
}

export function TableCellPreview(props: TableCellPreviewProps) {
  let {cell} = props;

  return (
    <div
      className={
          classNames(
            styles,
            'spectrum-Table-cell',
            classNames(
              stylesOverrides,
              'react-spectrum-Table-cell'
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
    children,
    itemCount,
    density,
    layout,
    maxWidth,
    rowHeaderColumnKeys
  } = props;
  let {height} = layout.getLayoutInfo(item.key).rect;
  let isDraggingMultiple = itemCount > 1;
  // @ts-ignore
  let cells = [...children].filter(cell => rowHeaderColumnKeys.has(cell.column.key));

  return (
    <Flex
      justifyContent="space-between"
      UNSAFE_style={{height, maxWidth}}
      UNSAFE_className={
        classNames(
          styles,
          'spectrum-Table-row',
          classNames(
            stylesOverrides,
            'react-spectrum-Table-row',
            'react-spectrum-Table-row-dragPreview',
            {'react-spectrum-Table-row-dragPreview--multiple': isDraggingMultiple},
            `react-spectrum-Table-row-dragPreview--${density}`
          )
        )
      }>
      <div>
        {cells.map((cell) => (
          <TableCellPreview
            key={cell.key}
            cell={cell} />
        ))}
      </div>
      {isDraggingMultiple &&
        <div className={classNames(stylesOverrides, 'react-spectrum-Table-row-badge')}>{itemCount}</div>
      }
    </Flex>
  );
}
