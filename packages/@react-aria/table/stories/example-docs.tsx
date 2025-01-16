/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import ariaStyles from './docs-example.css';
import {classNames} from '@react-spectrum/utils';
import {mergeProps} from '@react-aria/utils';
import React, {useCallback, useRef} from 'react';
import {useButton} from 'react-aria';
import {useFocusRing} from '@react-aria/focus';
import {useTable, useTableCell, useTableColumnHeader, useTableColumnResize, useTableHeaderRow, useTableRow, useTableRowGroup} from '@react-aria/table';
import {useTableColumnResizeState, useTableState} from '@react-stately/table';

export function Table(props) {
  let {
    onResizeStart,
    onResize,
    onResizeEnd
  } = props;

  let state = useTableState(props);
  let ref = useRef<HTMLTableElement | null>(null);
  let {collection} = state;
  let {gridProps} = useTable(
    {
      ...props,
      // The table itself is scrollable rather than just the body
      scrollRef: ref
    },
    state,
    ref
  );

  let getDefaultMinWidth = useCallback(() => {
    return 40;
  }, []);

  let layoutState = useTableColumnResizeState({
    // Matches the width of the table itself
    tableWidth: 300,
    getDefaultMinWidth
  }, state);

  return (
    <table
      {...gridProps}
      ref={ref}
      className={classNames(ariaStyles, 'aria-table')}>
      <ResizableTableRowGroup
        type="thead"
        className={classNames(ariaStyles, 'aria-table-rowGroupHeader')}>
        {collection.headerRows.map(headerRow => (
          <ResizableTableHeaderRow key={headerRow.key} item={headerRow} state={state}>
            {[...headerRow.childNodes].map(column => (
              <ResizableTableColumnHeader
                key={column.key}
                column={column}
                state={state}
                layoutState={layoutState}
                onResizeStart={onResizeStart}
                onResize={onResize}
                onResizeEnd={onResizeEnd} />
            ))}
          </ResizableTableHeaderRow>
        ))}
      </ResizableTableRowGroup>
      <ResizableTableRowGroup
        className={classNames(ariaStyles, 'aria-table-rowGroupBody')}
        type="tbody">
        {[...collection.body.childNodes].map(row => (
          <ResizableTableRow key={row.key} item={row} state={state}>
            {[...row.childNodes].map(cell => (
              <ResizableTableCell
                key={cell.key}
                cell={cell}
                state={state}
                layoutState={layoutState} />
            ))}
          </ResizableTableRow>
        ))}
      </ResizableTableRowGroup>
    </table>
  );
}

function ResizableTableRowGroup({type: Element, children, className}) {
  let {rowGroupProps} = useTableRowGroup();
  return (
    <Element
      {...rowGroupProps}
      className={classNames(ariaStyles, 'aria-table-rowGroup', className)}>
      {children}
    </Element>
  );
}

function ResizableTableHeaderRow({item, state, children}) {
  let ref = useRef<HTMLTableRowElement | null>(null);
  let {rowProps} = useTableHeaderRow({node: item}, state, ref);

  return (
    <tr
      {...rowProps}
      ref={ref}
      className={classNames(ariaStyles, 'aria-table-row')}>
      {children}
    </tr>
  );
}

function ResizableTableColumnHeader({column, state, layoutState, onResizeStart, onResize, onResizeEnd}) {
  let ref = useRef<HTMLTableHeaderCellElement | null>(null);
  let {columnHeaderProps} = useTableColumnHeader({node: column}, state, ref);
  let allowsResizing = column.props.allowsResizing;

  return (
    <th
      {...mergeProps(columnHeaderProps)}
      className={classNames(ariaStyles, 'aria-table-headerCell')}
      style={{
        width: layoutState.getColumnWidth(column.key)
      }}
      ref={ref}>
      <div style={{display: 'flex', position: 'relative'}}>
        <Button
          className={classNames(ariaStyles, 'aria-table-headerTitle')}>
          {column.rendered}
        </Button>
        {allowsResizing &&
          <Resizer column={column} layoutState={layoutState} onResizeStart={onResizeStart} onResize={onResize} onResizeEnd={onResizeEnd} />
        }
      </div>
    </th>
  );
}

function Button(props) {
  let ref = props.buttonRef;
  let {focusProps, isFocusVisible} = useFocusRing();
  let {buttonProps} = useButton(props, ref);
  return <button {...mergeProps(buttonProps, focusProps)} ref={ref} className={classNames(ariaStyles, props.className, {'focus': isFocusVisible})}>{props.children}</button>;
}

function Resizer(props) {
  let {column, layoutState, onResizeStart, onResize, onResizeEnd} = props;
  let ref = useRef<HTMLInputElement | null>(null);
  let {resizerProps, inputProps, isResizing} = useTableColumnResize({
    column,
    'aria-label': 'Resizer',
    onResizeStart,
    onResize,
    onResizeEnd
  }, layoutState, ref);
  let {focusProps, isFocusVisible} = useFocusRing();

  return (
    <div
      role="presentation"
      className={classNames(ariaStyles, 'aria-table-resizer', {'focus': isFocusVisible, 'resizing': isResizing})}
      {...resizerProps}>
      <input
        ref={ref}
        {...mergeProps(inputProps, focusProps)} />
    </div>
  );
}

function ResizableTableRow({item, children, state}) {
  let ref = useRef<HTMLTableRowElement | null>(null);
  let isSelected = state.selectionManager.isSelected(item.key);
  let {rowProps, isPressed} = useTableRow({
    node: item
  }, state, ref);
  let {isFocusVisible, focusProps} = useFocusRing();

  return (
    <tr
      className={classNames(ariaStyles, 'aria-table-row')}
      style={{
        // eslint-disable-next-line no-nested-ternary
        background: isSelected
          ? 'blueviolet'
          // eslint-disable-next-line no-nested-ternary
          : isPressed
            ? 'var(--spectrum-global-color-gray-400)'
            : item.index % 2
              ? 'var(--spectrum-alias-highlight-hover)'
              : 'none',
        color: isSelected ? 'white' : undefined,
        outline: 'none',
        boxShadow: isFocusVisible ? 'inset 0 0 0 2px orange' : 'none'
      }}
      {...mergeProps(rowProps, focusProps)}
      ref={ref}>
      {children}
    </tr>
  );
}

function ResizableTableCell({cell, state, layoutState}) {
  let ref = useRef<HTMLTableCellElement | null>(null);
  let {gridCellProps} = useTableCell({node: cell}, state, ref);
  let {isFocusVisible, focusProps} = useFocusRing();
  let column = cell.column;

  return (
    <td
      {...mergeProps(gridCellProps, focusProps)}
      className={classNames(ariaStyles, 'aria-table-cell', {'focus': isFocusVisible})}
      style={{width: layoutState.getColumnWidth(column.key)}}
      ref={ref}>
      {cell.rendered}
    </td>
  );
}
