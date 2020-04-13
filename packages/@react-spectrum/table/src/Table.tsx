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

import {Checkbox} from '@react-spectrum/checkbox';
import {classNames, filterDOMProps, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import {GridState, useGridState} from '@react-stately/grid';
import React, {useContext, useRef} from 'react';
import {SpectrumTableProps} from '@react-types/table';
import styles from '@adobe/spectrum-css-temp/components/table/vars.css';
import {useColumnHeader, useGrid, useGridCell, useRow, useRowGroup, useRowHeader, useSelectAllCheckbox, useSelectionCheckbox} from '@react-aria/grid';
import {useProviderProps} from '@react-spectrum/provider';

const TableContext = React.createContext<GridState<unknown>>(null);
function useTableContext() {
  return useContext(TableContext);
}

function Table<T>(props: SpectrumTableProps<T>, ref: DOMRef<HTMLTableElement>) {
  props = useProviderProps(props);
  let {styleProps} = useStyleProps(props);
  let state = useGridState({...props, showSelectionCheckboxes: true});
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
        <TableHeader />
        <TableRowGroup items={state.collection.body} />
      </TableContext.Provider>
    </table>
  );
}

function TableHeader() {
  let {rowGroupProps} = useRowGroup();
  let state = useTableContext();

  return (
    <thead {...rowGroupProps} className={classNames(styles, 'spectrum-Table-head')}>
      {state.collection.headerRows.map(columns => (
        <tr>
          {columns.map(column =>
            column.type === 'placeholder'
              ? <th colSpan={column.colspan} />
              : <TableColumnHeader key={column.key} column={column} />
          )}
        </tr>
      ))}
    </thead>
  );
}

function TableColumnHeader({column}) {
  let ref = useRef();
  let state = useTableContext();
  let {columnHeaderProps} = useColumnHeader({
    key: column.key,
    ref,
    colspan: column.colspan
  }, state);

  let isCheckboxCell = state.selectionManager.selectionMode !== 'none' && column.index === 0;
  let {checkboxProps} = useSelectAllCheckbox(state);

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <th 
        {...columnHeaderProps}
        ref={ref}
        className={classNames(styles, 'spectrum-Table-headCell', {'spectrum-Table-checkboxCell': isCheckboxCell})}
        colSpan={column.colspan}
        style={{textAlign: column.colspan > 1 ? 'center' : 'left', verticalAlign: 'bottom'}}>
        {column.rendered}
        {isCheckboxCell &&
          <Checkbox
            {...checkboxProps}
            UNSAFE_className={classNames(styles, 'spectrum-Table-checkbox')} />
        }
      </th>
    </FocusRing>
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
          cell.type === 'rowheader'
            ? <TableRowHeader key={cell.key} rowHeader={cell} />
            : <TableCell key={cell.key} cell={cell} />
        )}
      </tr>
    </FocusRing>
  );
}

function TableRowHeader({rowHeader}) {
  let ref = useRef();
  let state = useTableContext();
  let {rowHeaderProps} = useRowHeader({
    ref,
    key: rowHeader.key
  }, state);

  let {checkboxProps} = useSelectionCheckbox(
    {key: rowHeader.parentKey},
    state
  );

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <th {...rowHeaderProps} ref={ref} className={classNames(styles, 'spectrum-Table-cell', 'spectrum-Table-checkboxCell')}>
        {rowHeader.rendered}
        {state.selectionManager.selectionMode !== 'none' &&
          <Checkbox
            {...checkboxProps}
            UNSAFE_className={classNames(styles, 'spectrum-Table-checkbox')} />
        }
      </th>
    </FocusRing>
  );
}

function TableCell({cell}) {
  let ref = useRef();
  let state = useTableContext();
  let {gridCellProps} = useGridCell({
    ref,
    key: cell.key
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
