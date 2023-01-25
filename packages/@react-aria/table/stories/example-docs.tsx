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

// TODO: don't need this, replace with styles
import {classNames} from '@react-spectrum/utils';
import {FocusRing, useFocusRing} from '@react-aria/focus';
import {mergeProps, useLayoutEffect, useResizeObserver} from '@react-aria/utils';
import React, {useCallback, useState} from 'react';
import styles from '@adobe/spectrum-css-temp/components/table/vars.css';
import {useCheckbox} from '@react-aria/checkbox';
import {useRef} from 'react';
import {useTable, useTableCell, useTableColumnHeader, useTableColumnResize, useTableHeaderRow, useTableRow, useTableRowGroup, useTableSelectAllCheckbox, useTableSelectionCheckbox} from '@react-aria/table';
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
  // If the selection behavior changes in state, we need to update showSelectionCheckboxes here due to the circular dependency...
  let shouldShowCheckboxes = state.selectionManager.selectionBehavior !== 'replace';
  if (shouldShowCheckboxes !== showSelectionCheckboxes) {
    setShowSelectionCheckboxes(shouldShowCheckboxes);
  }
  let ref = useRef(null);
  let bodyRef = useRef(null);
  let {collection} = state;
  let {gridProps} = useTable(
    {
      ...props,
      onRowAction: props.onAction,
      // Table itself is made scrollable instead of the body so that the
      // column header and row scroll positions are the same
      scrollRef: ref
    },
    state,
    ref
  );

  // TODO: look at the CSS for the resizing example, replace classnames with style

  // Table column resizing stuff
  let [tableWidth, setTableWidth] = useState(0);
  let getDefaultWidth = useCallback((node) => {
    // selection cell column should always take up a specific width, doesn't need to be resizable
    if (node.props.isSelectionCell) {
      return 20;
    }
    return;
  }, []);
  let getDefaultMinWidth = useCallback((node) => {
     // selection cell column should always take up a specific width, doesn't need to be resizable
    if (node.props.isSelectionCell) {
      return 20;
    }
    return 75;
  }, []);
  let layoutState = useTableColumnResizeState({
    getDefaultWidth,
    getDefaultMinWidth,
    tableWidth
  }, state);
  let {widths} = layoutState;


  // TODO: not sure why we need the below, is it if width isn't provided?
  // Asked Rob, it is if the Table's width is changed by a resize event (e.g. width is a percentage of the page), doesn't apply for the
  // static width case
  // Remove for final doc example cuz it is probably too
  useLayoutEffect(() => {
    if (bodyRef && bodyRef.current) {
      setTableWidth(bodyRef.current.clientWidth);
    }
  }, []);
  useResizeObserver({ref, onResize: () => setTableWidth(bodyRef.current.clientWidth)});
  console.log('table width', tableWidth, widths)

  // TODO: move certain stylings into the components themselves
  return (
    // TODO: just take props for styles (width, height)
    <table
      {...gridProps}
      ref={ref}
      style={{
        borderCollapse: 'collapse',
        // TODO: get rid of width and stuff in favor of style provided by user
        width: '800px',
        height: '300px',
        // makes the table actually size itself, removing them makes it grow continuously on render
        display: 'block',
        position: 'relative',
        // Make the table overflow so that columns are included in the scrolling. TableView makes the body scrollable
        overflow: 'auto'
      }}>
      <TableRowGroup
        type="thead"
        style={{
          borderBottom: '2px solid var(--spectrum-global-color-gray-800)',
          // Override the default display: table-row/table-cell stuff since those will prevent the column widths from extending past the overall table width
          // aka 2000px applied on a column will only render as wide as the parent table width allows for
          // Also need it so it won't continually grow on render, this means I'll have to move the border rendering and row background
          // rendering into the cell/table header cell itself

          display: 'block',
          // Needs the sticky cuz the table itself is scrollable, not the body
          position: 'sticky',
          top: 0,
          background: 'var(--spectrum-gray-100)'
        }}>
        {collection.headerRows.map(headerRow => (
          <TableHeaderRow
            // Need to override default table display styles
            style={{
              display: 'flex',
              boxSizing: 'border-box'
            }}
            key={headerRow.key}
            item={headerRow}
            state={state}>
            {[...headerRow.childNodes].map(column =>
              column.props.isSelectionCell
                ? <TableSelectAllCell key={column.key} column={column} state={state} widths={widths} />
                // TODO include the resize stuff? for controlled?
                : <TableColumnHeader key={column.key} column={column} state={state} widths={widths} layoutState={layoutState} onResizeStart={props.onResizeStart} onResize={props.onResize} onResizeEnd={props.onResizeEnd} />
            )}
          </TableHeaderRow>
        ))}
      </TableRowGroup>
      <TableRowGroup
        ref={bodyRef}
        // TODO need this?
        style={{
          display: 'block',
          maxHeight: '200px'
        }}
        type="tbody">
        {[...collection.body.childNodes].map(row => (
          <TableRow
            // TODO: need this?
            style={{
              display: 'flex'
            }}
            key={row.key}
            item={row}
            state={state}>
            {[...row.childNodes].map(cell =>
              cell.props.isSelectionCell
                ? <TableCheckboxCell key={cell.key} cell={cell} state={state} widths={widths} />
                : <TableCell key={cell.key} cell={cell} state={state} widths={widths}  />
            )}
          </TableRow>
        ))}
      </TableRowGroup>
    </table>
  );
}

// Needs to be forward ref for bodyRef
export const TableRowGroup = React.forwardRef((props, ref) => {
  let {type: Element, style, children} = props;
  let {rowGroupProps} = useTableRowGroup();
  return (
    <Element ref={ref} {...rowGroupProps} style={style}>
      {children}
    </Element>
  );
});


function TableHeaderRow({item, state, children, style = {}}) {
  let ref = useRef();
  let {rowProps} = useTableHeaderRow({node: item}, state, ref);

  return (
    <tr {...rowProps} ref={ref} style={style}>
      {children}
    </tr>
  );
}

function Resizer({column, state, layoutState, onResizeStart, onResize, onResizeEnd}) {
  let ref = useRef(null);
  let {resizerProps, inputProps} = useTableColumnResize({
    column,
    label: 'Resizer',
    onResizeStart,
    onResize,
    onResizeEnd,
    tableState: state
  }, layoutState, ref);

  return (
    <>
      <FocusRing within focusRingClass={classNames(styles, 'focus-ring')}>
        <div
          role="presentation"
          style={{
            cursor: undefined,
            width: '20px',
            height: '20px',
            border: '1px solid red',
            touchAction: 'none',
            flex: '0 0 auto'
          }}
          {...resizerProps}>
          <VisuallyHidden>
            <input
              ref={ref}
              type="range"
              {...inputProps} />
          </VisuallyHidden>
        </div>
      </FocusRing>
    </>
  );
}

export function TableColumnHeader({column, state, widths, layoutState, onResizeStart, onResize, onResizeEnd}) {
  let ref = useRef();
  let {columnHeaderProps} = useTableColumnHeader({node: column}, state, ref);
  let {isFocusVisible, focusProps} = useFocusRing();
  let arrowIcon = state.sortDescriptor?.direction === 'ascending' ? '▲' : '▼';
// TODO: figure out why the resizer is being focused, how is TableView omitting it from being one of the children that
// useGridCell would try to focus
  return (
    <th
      {...mergeProps(columnHeaderProps, focusProps)}
      colSpan={column.colspan}
      style={{
        textAlign: column.colspan > 1 ? 'center' : 'left',
        padding: '5px 10px',
        // TODO switch to box shadow?
        outline: isFocusVisible ? '2px solid orange' : 'none',
        cursor: 'default',
        // New stuff
        width: widths.get(column.key),
        display: 'block',
        flex: '0 0 auto',
        boxSizing: 'border-box'
      }}
      ref={ref}>
      {/* TODO: make resizer triggerable via keyboard, maybe make a menutrigger for hitting enter on the tablecolumn header */}
      <div style={{display: 'flex', position: 'relative'}}>
        <div
          style={{
            flex: '1 1 auto',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis'
          }}>
          {column.rendered}
          {column.props.allowsSorting &&
            <span aria-hidden="true" style={{padding: '0 2px', visibility: state.sortDescriptor?.column === column.key ? 'visible' : 'hidden'}}>
              {arrowIcon}
            </span>
          }
        </div>
        {
          column.props.allowsResizing &&
          <Resizer column={column} state={state} layoutState={layoutState} onResizeStart={onResizeStart} onResize={onResize} onResizeEnd={onResizeEnd} />
        }
      </div>
    </th>
  );
}

export function TableRow({item, children, state, style}) {
  let ref = useRef();
  let isSelected = state.selectionManager.isSelected(item.key);
  let {rowProps, isPressed} = useTableRow({
    node: item
  }, state, ref);
  let {isFocusVisible, focusProps} = useFocusRing();

  return (
    <tr
      style={{
        background: isSelected
          ? 'blueviolet'
          : isPressed
            ? 'var(--spectrum-global-color-gray-400)'
            : item.index % 2
              ? 'var(--spectrum-alias-highlight-hover)'
              : 'none',
        color: isSelected ? 'white' : null,
        // TODO: Switch to box shadow
        outline: isFocusVisible ? '2px solid orange' : 'none',
        ...style
      }}
      {...mergeProps(rowProps, focusProps)}
      ref={ref}>
      {children}
    </tr>
  );
}

export function TableCell({cell, state, widths}) {
  let ref = useRef();
  let {gridCellProps} = useTableCell({node: cell}, state, ref);
  let {isFocusVisible, focusProps} = useFocusRing();
  let column = cell.column;
  // TODO: why is this isSelected a thing
  // This is here since the table is now a fixed width with overflow, so it is relying on
  let isSelected = state.selectionManager.isSelected(cell.parentKey);

  return (
    <td
      {...mergeProps(gridCellProps, focusProps)}
      style={{
        padding: '5px 10px',
        outline: isFocusVisible ? '2px solid orange' : 'none',
        cursor: 'default',
        width: widths.get(column.key),
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        display: 'block',
        flex: '0 0 auto',
        boxSizing: 'border-box'
      }}
      ref={ref}>
      {cell.rendered}
    </td>
  );
}

function TableCheckboxCell({cell, state, widths}) {
  let ref = useRef();
  let {gridCellProps} = useTableCell({node: cell}, state, ref);
  let {checkboxProps} = useTableSelectionCheckbox({key: cell.parentKey}, state);
  let column = cell.column;

  return (
    <td
      {...gridCellProps}
      style={{
        width: widths.get(column.key),
        // center the checkbox
        display: 'flex',
        boxSizing: 'border-box'
      }}
      ref={ref}>
      <Checkbox {...checkboxProps} />
    </td>
  );
}

function TableSelectAllCell({column, state, widths}) {
  let ref = useRef();
  let {columnHeaderProps} = useTableColumnHeader({node: column}, state, ref);
  let {checkboxProps} = useTableSelectAllCheckbox(state);

  return (
    <th
      {...columnHeaderProps}
      style={{
        width: widths.get(column.key)
      }}
      ref={ref}>
      {state.selectionManager.selectionMode === 'single'
        ? <VisuallyHidden>{checkboxProps['aria-label']}</VisuallyHidden>
        : <Checkbox {...checkboxProps} />
      }
    </th>
  );
}

function Checkbox(props) {
  let ref = React.useRef();
  let state = useToggleState(props);
  let {inputProps} = useCheckbox(props, state, ref);
  return <input style={{height: 'fit-content', marginTop: 'auto', marginBottom: 'auto'}} {...inputProps} ref={ref} />;
}


// // TODO add menu button
