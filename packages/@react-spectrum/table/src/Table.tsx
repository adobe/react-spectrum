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

import {classNames, DOMRef, filterDOMProps, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {mergeProps} from '@react-aria/utils';
// import {TableProps} from '@react-types/g';
import React, { useRef, useContext } from 'react';
import styles from '@adobe/spectrum-css-temp/components/table/vars.css';
import {useGrid, useRow, useRowGroup, useColumnHeader, useGridCell} from '@react-aria/grid';
import {useGridState} from '@react-stately/grid';
import {useProviderProps} from '@react-spectrum/provider';
import { FocusRing } from '@react-aria/focus';

const TableContext = React.createContext();
function useTableContext() {
  return useContext(TableContext);
}

function Table(props: TableProps, ref: DOMRef) {
  props = useProviderProps(props);
  let {styleProps} = useStyleProps(props);
  let state = useGridState(props);
  console.log(state)
  let domRef = useDOMRef(ref);
  let {gridProps} = useGrid({
    ...props,
    ref: domRef
  }, state);

  return (
    <table
      {...filterDOMProps(props)}
      {...gridProps}
      {...styleProps}
      ref={domRef}
      className={classNames(styles, 'spectrum-Table', styleProps.className)}>
      <TableContext.Provider value={state}>
        <TableHeader columns={props.columns} />
        <TableRowGroup items={[...state.collection]} />
      </TableContext.Provider>
    </table>
  );
}

function TableHeader({columns}) {
  let {rowGroupProps} = useRowGroup();

  return (
    <thead {...rowGroupProps} className={classNames(styles, 'spectrum-Table-head')}>
      <tr>
        {columns.map(column => 
         <TableColumnHeader key={column.name} column={column} />
        )}
      </tr>
    </thead>
  );
}

function TableColumnHeader({column}) {
  let {columnHeaderProps} = useColumnHeader();

  return (
    <th 
      {...columnHeaderProps}
      className={classNames(styles, 'spectrum-Table-headCell')}>
      {column.name}
    </th>
  );
}

function TableRowGroup({items}) {
  let {rowGroupProps} = useRowGroup();

  return (
    <tbody {...rowGroupProps} className={classNames(styles, 'spectrum-Table-body')}>
      {items.map(item =>
        <TableRow key={item.key} item={item} />
      )}
    </tbody>
  );
}

function TableRow({item}) {
  let ref = useRef();
  let state = useTableContext();
  let {rowProps} = useRow({
    key: item.key,
    isSelected: item.isSelected,
    ref
  }, state);

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <tr {...rowProps} ref={ref} className={classNames(styles, 'spectrum-Table-row', {'is-selected': item.isSelected})}>
        {[...item.childNodes].map(cell =>
          <TableCell key={cell.key} cell={cell} />
        )}
      </tr>
    </FocusRing>
  );
}

function TableCell({cell}) {
  let ref = useRef();
  let state = useTableContext();
  let {gridCellProps} = useGridCell({
    ref,
    key: cell.key,
  }, state);

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <td {...gridCellProps} ref={ref} className={classNames(styles, 'spectrum-Table-cell')}>
        {cell.rendered}
      </td>
    </FocusRing>
  );
}

const _Table = React.forwardRef(Table);
export {_Table as Table};
