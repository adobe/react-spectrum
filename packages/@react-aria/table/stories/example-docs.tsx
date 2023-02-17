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
import React, {RefObject} from 'react';
import {useButton} from 'react-aria';
import {useFocusRing} from '@react-aria/focus';
import {useRef} from 'react';
import {useTable, useTableCell, useTableColumnHeader, useTableColumnResize, useTableHeaderRow, useTableRow, useTableRowGroup} from '@react-aria/table';
import {useTableColumnResizeState, useTableState} from '@react-stately/table';
import {VisuallyHidden} from '@react-aria/visually-hidden';

export function Table(props) {
  let {
    onResizeStart,
    onResize,
    onResizeEnd
  } = props;

  let state = useTableState(props);
  let ref = useRef();
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

  let layoutState = useTableColumnResizeState({
    // Matches the width of the table itself
    tableWidth: 300
  }, state);
  let {widths} = layoutState;

  return (
    <table
      {...gridProps}
      ref={ref}
      style={{
        borderCollapse: 'collapse',
        width: '300px',
        height: '200px',
        display: 'block',
        position: 'relative',
        overflow: 'auto'
      }}>
      <ResizableTableRowGroup
        type="thead"
        style={{
          borderBottom: '2px solid var(--spectrum-global-color-gray-800)',
          display: 'block',
          position: 'sticky',
          top: 0,
          background: 'var(--spectrum-gray-100)',
          width: 'fit-content'
        }}>
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
        style={{
          maxHeight: '200px'
        }}
        type="tbody">
        {[...collection.body.childNodes].map(row => (
          <ResizableTableRow key={row.key} item={row} state={state}>
            {[...row.childNodes].map(cell => (
              <ResizableTableCell
                key={cell.key}
                cell={cell}
                state={state}
                widths={widths} />
            ))}
          </ResizableTableRow>
        ))}
      </ResizableTableRowGroup>
    </table>
  );
}

function ResizableTableRowGroup({type: Element, style, children}) {
  let {rowGroupProps} = useTableRowGroup();
  return (
    <Element
      {...rowGroupProps}
      style={{
        display: 'block',
        ...style
      }}>
      {children}
    </Element>
  );
}

function ResizableTableHeaderRow({item, state, children}) {
  let ref = useRef();
  let {rowProps} = useTableHeaderRow({node: item}, state, ref);

  return (
    <tr
      {...rowProps}
      ref={ref}
      style={{display: 'flex'}}>
      {children}
    </tr>
  );
}

function ResizableTableColumnHeader({column, state, layoutState, onResizeStart, onResize, onResizeEnd}) {
  let {widths} = layoutState;
  let ref = useRef(null);
  let resizerRef = useRef(null);
  let {columnHeaderProps} = useTableColumnHeader({node: column}, state, ref);
  let {isFocusVisible, focusProps} = useFocusRing();
  let allowsResizing = column.props.allowsResizing;

  return (
    <th
      {...mergeProps(columnHeaderProps, focusProps)}
      colSpan={column.colspan}
      style={{
        textAlign: column.colspan > 1 ? 'center' : 'left',
        padding: '5px 10px',
        outline: 'none',
        boxShadow: isFocusVisible ? 'inset 0 0 0 2px orange' : 'none',
        cursor: 'default',
        width: widths.get(column.key),
        display: 'block',
        flex: '0 0 auto',
        boxSizing: 'border-box'
      }}
      ref={ref}>
      <div style={{display: 'flex', position: 'relative'}}>
        <Button
          style={{
            width: '100%',
            textAlign: 'left',
            border: 'none',
            background: 'transparent',
            flex: '1 1 auto',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            marginInlineStart: '-6px'
          }}>
          {column.rendered}
        </Button>
        {allowsResizing &&
          <Resizer ref={resizerRef} triggerRef={ref} column={column} layoutState={layoutState} onResizeStart={onResizeStart} onResize={onResize} onResizeEnd={onResizeEnd} />
        }
      </div>
    </th>
  );
}

function Button(props) {
  let ref = props.buttonRef;
  let {focusProps, isFocusVisible} = useFocusRing();
  let outline = isFocusVisible
    ? '2px solid orange'
    : 'none';
  let {buttonProps} = useButton(props, ref);
  return <button {...mergeProps(buttonProps, focusProps)} ref={ref} style={{...props.style, outline: outline}}>{props.children}</button>;
}

const Resizer = React.forwardRef((props: any, ref: RefObject<HTMLInputElement>) => {
  let {column, layoutState, onResizeStart, onResize, onResizeEnd, triggerRef} = props;
  let {resizerProps, inputProps} = useTableColumnResize({
    column,
    label: 'Resizer',
    onResizeStart,
    onResize,
    onResizeEnd,
    triggerRef
  }, layoutState, ref);
  let {focusProps, isFocusVisible} = useFocusRing();

  return (
    <div
      role="presentation"
      style={{
        cursor: 'col-resize',
        width: '6px',
        height: 'auto',
        border: '2px',
        borderStyle: 'none solid',
        borderColor: layoutState.resizingColumn === column.key || isFocusVisible ? 'orange' : 'grey',
        touchAction: 'none',
        flex: '0 0 auto',
        boxSizing: 'border-box',
        marginLeft: '4px'
      }}
      {...resizerProps}>
      <VisuallyHidden>
        <input
          ref={ref}
          {...mergeProps(inputProps, focusProps)} />
      </VisuallyHidden>
    </div>
  );
});

function ResizableTableRow({item, children, state}) {
  let ref = useRef();
  let isSelected = state.selectionManager.isSelected(item.key);
  let {rowProps, isPressed} = useTableRow({
    node: item
  }, state, ref);
  let {isFocusVisible, focusProps} = useFocusRing();

  return (
    <tr
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
        color: isSelected ? 'white' : null,
        outline: 'none',
        boxShadow: isFocusVisible ? 'inset 0 0 0 2px orange' : 'none',
        display: 'flex',
        width: 'fit-content'
      }}
      {...mergeProps(rowProps, focusProps)}
      ref={ref}>
      {children}
    </tr>
  );
}

function ResizableTableCell({cell, state, widths}) {
  let ref = useRef();
  let {gridCellProps} = useTableCell({node: cell}, state, ref);
  let {isFocusVisible, focusProps} = useFocusRing();
  let column = cell.column;

  return (
    <td
      {...mergeProps(gridCellProps, focusProps)}
      style={{
        padding: '5px 10px',
        cursor: 'default',
        outline: 'none',
        boxShadow: isFocusVisible ? 'inset 0 0 0 2px orange' : 'none',
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
