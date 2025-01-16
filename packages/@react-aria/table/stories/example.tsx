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

import {mergeProps} from '@react-aria/utils';
import React, {useRef, useState} from 'react';
import {useCheckbox} from '@react-aria/checkbox';
import {useFocusRing} from '@react-aria/focus';
import {useTable, useTableCell, useTableColumnHeader, useTableHeaderRow, useTableRow, useTableRowGroup, useTableSelectAllCheckbox, useTableSelectionCheckbox} from '@react-aria/table';
import {useTableState} from '@react-stately/table';
import {useToggleState} from '@react-stately/toggle';
import {VisuallyHidden} from '@react-aria/visually-hidden';

export function Table(props) {
  let [showSelectionCheckboxes, setShowSelectionCheckboxes] = useState(props.selectionStyle !== 'highlight');
  let state = useTableState({
    ...props,
    showSelectionCheckboxes,
    selectionBehavior: props.selectionStyle === 'highlight' ? 'replace' : 'toggle'
  });
  // If the selection behavior changes in state, we need to update showSelectionCheckboxes here due to the circular dependency...
  let shouldShowCheckboxes = state.selectionManager.selectionBehavior !== 'replace';
  if (shouldShowCheckboxes !== showSelectionCheckboxes) {
    setShowSelectionCheckboxes(shouldShowCheckboxes);
  }
  let ref = useRef<HTMLTableElement | null>(null);
  let bodyRef = useRef<HTMLElement | null>(null);
  let {collection} = state;
  let {gridProps} = useTable(
    {
      ...props,
      onRowAction: props.onAction,
      scrollRef: bodyRef
    },
    state,
    ref
  );

  return (
    <table {...gridProps} ref={ref} style={{borderCollapse: 'collapse'}}>
      <TableRowGroup type="thead" style={{borderBottom: '2px solid gray', display: 'block'}}>
        {collection.headerRows.map(headerRow => (
          <TableHeaderRow key={headerRow.key} item={headerRow} state={state}>
            {[...state.collection.getChildren!(headerRow.key)].map(column =>
              column.props.isSelectionCell
                ? <TableSelectAllCell key={column.key} column={column} state={state} />
                : <TableColumnHeader key={column.key} column={column} state={state} />
            )}
          </TableHeaderRow>
        ))}
      </TableRowGroup>
      <TableRowGroup ref={bodyRef} type="tbody" style={{display: 'block', overflow: 'auto', maxHeight: '200px'}}>
        {[...collection].map(row => (
          <TableRow key={row.key} item={row} state={state}>
            {[...state.collection.getChildren!(row.key)].map(cell =>
              cell.props.isSelectionCell
                ? <TableCheckboxCell key={cell.key} cell={cell} state={state} />
                : <TableCell key={cell.key} cell={cell} state={state} />
            )}
          </TableRow>
        ))}
      </TableRowGroup>
    </table>
  );
}

export const TableRowGroup = React.forwardRef((props: any, ref) => {
  let {type: Element, style, children} = props;
  let {rowGroupProps} = useTableRowGroup();
  return (
    <Element ref={ref} {...rowGroupProps} style={style}>
      {children}
    </Element>
  );
});

export function TableHeaderRow({item, state, children}) {
  let ref = useRef<HTMLTableRowElement | null>(null);
  let {rowProps} = useTableHeaderRow({node: item}, state, ref);

  return (
    <tr {...rowProps} ref={ref}>
      {children}
    </tr>
  );
}

export function TableColumnHeader({column, state}) {
  let ref = useRef<HTMLTableCellElement | null>(null);
  let {columnHeaderProps} = useTableColumnHeader({node: column}, state, ref);
  let {isFocusVisible, focusProps} = useFocusRing();
  let arrowIcon = state.sortDescriptor?.direction === 'ascending' ? '▲' : '▼';

  return (
    <th
      {...mergeProps(columnHeaderProps, focusProps)}
      colSpan={column.colspan}
      style={{
        textAlign: column.colspan > 1 ? 'center' : 'left',
        padding: '5px 10px',
        outline: isFocusVisible ? '2px solid orange' : 'none',
        cursor: 'default'
      }}
      ref={ref}>
      {column.rendered}
      {column.props.allowsSorting &&
        <span aria-hidden="true" style={{padding: '0 2px', visibility: state.sortDescriptor?.column === column.key ? 'visible' : 'hidden'}}>
          {arrowIcon}
        </span>
      }
    </th>
  );
}

export function TableRow({item, children, state}) {
  let ref = useRef<HTMLTableRowElement | null>(null);
  let isSelected = state.selectionManager.isSelected(item.key);
  let {rowProps} = useTableRow({node: item}, state, ref);
  let {isFocusVisible, focusProps} = useFocusRing();

  return (
    <tr
      style={{
        // eslint-disable-next-line no-nested-ternary
        background: isSelected
          ? 'blueviolet'
          : item.index % 2
            ? 'lightgray'
            : 'none',
        color: isSelected ? 'white' : undefined,
        outline: isFocusVisible ? '2px solid orange' : 'none'
      }}
      {...mergeProps(rowProps, focusProps)}
      ref={ref}>
      {children}
    </tr>
  );
}

export function TableCell({cell, state}) {
  let ref = useRef<HTMLTableCellElement | null>(null);
  let {gridCellProps} = useTableCell({node: cell}, state, ref);
  let {isFocusVisible, focusProps} = useFocusRing();

  return (
    <td
      {...mergeProps(gridCellProps, focusProps)}
      style={{
        padding: '5px 10px',
        outline: isFocusVisible ? '2px solid orange' : 'none',
        cursor: 'default'
      }}
      ref={ref}>
      {cell.rendered}
    </td>
  );
}

export function TableCheckboxCell({cell, state}) {
  let ref = useRef<HTMLTableCellElement | null>(null);
  let {gridCellProps} = useTableCell({node: cell}, state, ref);
  let {checkboxProps} = useTableSelectionCheckbox({key: cell.parentKey}, state);

  let inputRef = useRef(null);
  let {inputProps} = useCheckbox(checkboxProps, useToggleState(checkboxProps), inputRef);

  return (
    <td
      {...gridCellProps}
      ref={ref}>
      <input {...inputProps} />
    </td>
  );
}

export function TableSelectAllCell({column, state}) {
  let ref = useRef<HTMLTableCellElement | null>(null);
  let isSingleSelectionMode = state.selectionManager.selectionMode === 'single';
  let {columnHeaderProps} = useTableColumnHeader({node: column}, state, ref);

  let {checkboxProps} = useTableSelectAllCheckbox(state);
  let inputRef = useRef(null);
  let {inputProps} = useCheckbox(checkboxProps, useToggleState(checkboxProps), inputRef);

  return (
    <th
      {...columnHeaderProps}
      ref={ref}>
      {
        /*
          In single selection mode, the checkbox will be hidden.
          So to avoid leaving a column header with no accessible content,
          use a VisuallyHidden component to include the aria-label from the checkbox,
          which for single selection will be "Select."
        */
        isSingleSelectionMode &&
        <VisuallyHidden>{inputProps['aria-label']}</VisuallyHidden>
      }
      <input
        {...inputProps}
        ref={inputRef}
        style={isSingleSelectionMode ? {visibility: 'hidden'} : undefined} />
    </th>
  );
}
