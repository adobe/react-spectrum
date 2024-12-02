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

import ariaStyles from './resizing.css';
import {
  AriaTableColumnResizeProps,
  useTable,
  useTableCell,
  useTableColumnHeader,
  useTableColumnResize,
  useTableHeaderRow,
  useTableRow,
  useTableRowGroup,
  useTableSelectAllCheckbox,
  useTableSelectionCheckbox
} from '@react-aria/table';
import {classNames} from '@react-spectrum/utils';
import {FocusRing, useFocusRing} from '@react-aria/focus';
import {mergeProps, useLayoutEffect, useResizeObserver} from '@react-aria/utils';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import styles from '@adobe/spectrum-css-temp/components/table/vars.css';
import {useCheckbox} from '@react-aria/checkbox';
import {useTableColumnResizeState, useTableState} from '@react-stately/table';
import {useToggleState} from '@react-stately/toggle';
import {VisuallyHidden} from '@react-aria/visually-hidden';

export function Table(props) {
  let [showSelectionCheckboxes, setShowSelectionCheckboxes] = useState(props.selectionStyle !== 'highlight');
  let state = useTableState({
    ...props,
    showSelectionCheckboxes,
    selectionBehavior: props.selectionStyle === 'highlight' ? 'replace' : 'toggle'
  });

  let [tableWidth, setTableWidth] = useState(0);
  let getDefaultWidth = useCallback(() => undefined, []);
  let getDefaultMinWidth = useCallback(() => 75, []);
  let layoutState = useTableColumnResizeState({
    getDefaultWidth,
    getDefaultMinWidth,
    tableWidth
  }, state);

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
      scrollRef: bodyRef,
      'aria-label': 'example table'
    },
    state,
    ref
  );
  let layout = useMemo(() => ({...layoutState, tableState: state}), [layoutState, state]);

  useLayoutEffect(() => {
    if (bodyRef && bodyRef.current) {
      setTableWidth(bodyRef.current.clientWidth);
    }
  }, []);
  useResizeObserver({ref, onResize: () => setTableWidth(bodyRef.current!.clientWidth)});

  return (
    <table {...gridProps} ref={ref} className={classNames(ariaStyles, 'aria-table')}>
      <TableRowGroup type="thead" className={classNames(ariaStyles, 'aria-table-rowGroup', 'aria-table-rowGroupHeader')}>
        {collection.headerRows.map(headerRow => (
          <TableHeaderRow key={headerRow.key} item={headerRow} state={state} className={classNames(ariaStyles, 'aria-table-row', 'aria-table-headerRow')}>
            {[...state.collection.getChildren!(headerRow.key)].map(column =>
              column.props.isSelectionCell
                ? <TableSelectAllCell key={column.key} column={column} state={state} layout={layout} />
                : <TableColumnHeader key={column.key} column={column} state={state} layout={layout} onResizeStart={props.onResizeStart} onResize={props.onResize} onResizeEnd={props.onResizeEnd} />
            )}
          </TableHeaderRow>
        ))}
      </TableRowGroup>
      <TableRowGroup type="tbody" ref={bodyRef} className={classNames(ariaStyles, 'aria-table-rowGroup')}>
        {[...collection].map(row => (
          <TableRow key={row.key} item={row} state={state} className={classNames(ariaStyles, 'aria-table-row')}>
            {[...state.collection.getChildren!(row.key)].map(cell =>
              cell.props.isSelectionCell
                ? <TableCheckboxCell key={cell.key} cell={cell} state={state} layout={layout} />
                : <TableCell key={cell.key} cell={cell} state={state} layout={layout} />
            )}
          </TableRow>
        ))}
      </TableRowGroup>
    </table>
  );
}

export const TableRowGroup = React.forwardRef((props: any, ref) => {
  let {type: Element, style, children, className} = props;
  let {rowGroupProps} = useTableRowGroup();
  return (
    <Element ref={ref} {...rowGroupProps} style={style} className={className}>
      {children}
    </Element>
  );
});

export function TableHeaderRow({item, state, children, className}) {
  let ref = useRef<HTMLTableRowElement | null>(null);
  let {rowProps} = useTableHeaderRow({node: item}, state, ref);

  return (
    <tr {...rowProps} ref={ref} className={className}>
      {children}
    </tr>
  );
}
function Resizer({column, layout, onResizeStart, onResize, onResizeEnd}) {
  let ref = useRef(null);
  let {resizerProps, inputProps} = useTableColumnResize({
    column,
    'aria-label': 'Resizer',
    onResizeStart,
    onResize,
    onResizeEnd
  } as AriaTableColumnResizeProps<any>, layout, ref);

  return (
    <>
      <FocusRing within focusRingClass={classNames(styles, 'focus-ring')}>
        <div
          role="presentation"
          style={{
            cursor: undefined,
            alignSelf: 'stretch',
            width: '20px',
            border: '1px solid red',
            touchAction: 'none',
            flex: '0 0 auto',
            position: 'absolute',
            insetInlineEnd: 0,
            height: '100%'
          }}
          {...resizerProps}>
          <VisuallyHidden>
            <input
              ref={ref}
              {...inputProps} />
          </VisuallyHidden>
        </div>
      </FocusRing>
    </>
  );
}
export function TableColumnHeader({column, state, layout, onResizeStart, onResize, onResizeEnd}) {
  let ref = useRef<HTMLTableHeaderCellElement | null>(null);
  let {columnHeaderProps} = useTableColumnHeader({node: column}, state, ref);
  let {isFocusVisible, focusProps} = useFocusRing();
  let arrowIcon = state.sortDescriptor?.direction === 'ascending' ? '▲' : '▼';

  return (
    <th
      {...mergeProps(columnHeaderProps, focusProps)}
      colSpan={column.colspan}
      style={{
        width: layout.getColumnWidth(column.key),
        textAlign: column.colspan > 1 ? 'center' : 'left',
        padding: '5px 10px',
        outline: isFocusVisible ? '2px solid orange' : 'none',
        cursor: 'default',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        display: 'block',
        flex: '0 0 auto'
      }}
      ref={ref}>
      <div style={{display: 'flex', position: 'relative'}}>
        <div style={{flex: '1 1 auto'}}>
          {column.rendered}
          {column.props.allowsSorting &&
            <span aria-hidden="true" style={{padding: '0 2px', visibility: state.sortDescriptor?.column === column.key ? 'visible' : 'hidden'}}>
              {arrowIcon}
            </span>
          }
        </div>
        {
          column.props.allowsResizing &&
          <Resizer column={column} layout={layout} onResizeStart={onResizeStart} onResize={onResize} onResizeEnd={onResizeEnd} />
        }
      </div>
    </th>
  );
}

export function TableRow({item, children, state, className}) {
  let ref = useRef<HTMLTableRowElement | null>(null);
  let isSelected = state.selectionManager.isSelected(item.key);
  let {rowProps} = useTableRow({node: item}, state, ref);
  let {isFocusVisible, focusProps} = useFocusRing();

  return (
    <tr
      style={{
        color: isSelected ? 'white' : undefined,
        outline: isFocusVisible ? '2px solid orange' : 'none'
      }}
      className={className}
      {...mergeProps(rowProps, focusProps)}
      ref={ref}>
      {children}
    </tr>
  );
}

export function TableCell({cell, state, layout}) {
  let ref = useRef<HTMLTableCellElement | null>(null);
  let {gridCellProps} = useTableCell({node: cell}, state, ref);
  let {isFocusVisible, focusProps} = useFocusRing();
  let column = cell.column;
  let isSelected = state.selectionManager.isSelected(cell.parentKey);

  return (
    <td
      {...mergeProps(gridCellProps, focusProps)}
      style={{
        width: layout.getColumnWidth(column.key),
        padding: '5px 10px',
        outline: isFocusVisible ? '2px solid orange inset' : 'none',
        cursor: 'default',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        display: 'block',
        flex: '0 0 auto',
        // eslint-disable-next-line no-nested-ternary
        background: isSelected
          ? 'blueviolet'
          : cell.parentKey % 2
            ? 'var(--spectrum-gray-75)'
            : 'var(--spectrum-gray-100)'
      }}
      ref={ref}>
      {cell.rendered}
    </td>
  );
}

export function TableCheckboxCell({cell, state, layout}) {
  let ref = useRef<HTMLTableCellElement | null>(null);
  let {gridCellProps} = useTableCell({node: cell}, state, ref);
  let {checkboxProps} = useTableSelectionCheckbox({key: cell.parentKey}, state);

  let inputRef = useRef(null);
  let {inputProps} = useCheckbox(checkboxProps, useToggleState(checkboxProps), inputRef);
  let column = cell.column;

  return (
    <td
      {...gridCellProps}
      style={{
        width: layout.getColumnWidth(column.key)
      }}
      ref={ref}>
      <input {...inputProps} />
    </td>
  );
}

export function TableSelectAllCell({column, state, layout}) {
  let ref = useRef<HTMLTableCellElement | null>(null);
  let isSingleSelectionMode = state.selectionManager.selectionMode === 'single';
  let {columnHeaderProps} = useTableColumnHeader({node: column}, state, ref);

  let {checkboxProps} = useTableSelectAllCheckbox(state);
  let inputRef = useRef(null);
  let {inputProps} = useCheckbox(checkboxProps, useToggleState(checkboxProps), inputRef);

  return (
    <th
      {...columnHeaderProps}
      style={{
        width: layout.getColumnWidth(column.key)
      }}
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
