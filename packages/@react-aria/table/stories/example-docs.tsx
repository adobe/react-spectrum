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
import {DismissButton, Overlay, usePopover} from '@react-aria/overlays';
import {getInteractionModality, useHover} from '@react-aria/interactions';
import {FocusRing, useFocusRing} from '@react-aria/focus';
import {Item} from '@react-stately/collections';
import {mergeProps, useLayoutEffect, useResizeObserver} from '@react-aria/utils';
import React, {useCallback, useState} from 'react';
import styles from '@adobe/spectrum-css-temp/components/table/vars.css';
import {useButton} from '@react-aria/button';
import {useCheckbox} from '@react-aria/checkbox';
import {useMemo, useRef} from 'react';
import {useMenu} from '@react-aria/menu';
import {useMenuItem} from '@react-aria/menu';
import {useMenuTrigger} from '@react-aria/menu';
import {useMenuTriggerState} from '@react-stately/menu';
import {useTable, useTableCell, useTableColumnHeader, useTableColumnResize, useTableHeaderRow, useTableRow, useTableRowGroup, useTableSelectAllCheckbox, useTableSelectionCheckbox} from '@react-aria/table';
import {useTableColumnResizeState, useTableState} from '@react-stately/table';
import {useToggleState} from '@react-stately/toggle';
import {useTreeState} from '@react-stately/tree';
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
      // Not great still because the column headers are position sticky and thus throw off the scrolling items into view when going upwards
      // Perhaps just put the table into a container that has overflow hidden?
      scrollRef: ref
    },
    state,
    ref
  );

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
  // Remove for final doc example cuz it is probably too complicated, TODO test it?
  useLayoutEffect(() => {
    if (bodyRef && bodyRef.current) {
      setTableWidth(bodyRef.current.clientWidth);
    }
  }, []);
  useResizeObserver({ref, onResize: () => setTableWidth(bodyRef.current.clientWidth)});
  // console.log('table width', tableWidth, widths)

  // TODO: move certain stylings into the components themselves
  return (
    // TODO: just take props for styles (width, height)
    <table
      {...gridProps}
      ref={ref}
      style={{
        borderCollapse: 'collapse',
        // TODO: get rid of width and stuff in favor of style provided by user?
        width: '800px',
        height: '300px',
        // makes the table actually size itself, removing them makes it grow continuously on render
        display: 'block',
        position: 'relative',
        // Make the table overflow so that columns are included in the scrolling. TableView makes the body scrollable via
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
          background: 'var(--spectrum-gray-100)',
          // make border extend to the full table contents width
          width: 'fit-content'
        }}>
        {collection.headerRows.map(headerRow => (
          <TableHeaderRow
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
        style={{
          maxHeight: '200px'
        }}
        type="tbody">
        {[...collection.body.childNodes].map(row => (
          <TableRow
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

// done
// Needs to be forward ref for bodyRef
const TableRowGroup = React.forwardRef((props, ref) => {
  let {type: Element, style, children} = props;
  let {rowGroupProps} = useTableRowGroup();
  return (
    <Element
      {...rowGroupProps}
      style={{
        display: 'block',
        ...style
      }}
      ref={ref}>
      {children}
    </Element>
  );
});


// done
function TableHeaderRow({item, state, children}) {
  let ref = useRef();
  let {rowProps} = useTableHeaderRow({node: item}, state, ref);
  return (
    // Override default tr display
    <tr {...rowProps} ref={ref} style={{display: 'flex'}}>
      {children}
    </tr>
  );
}


const Resizer = React.forwardRef((props, ref) => {
  let {column, layoutState, onResizeStart, onResize, onResizeEnd, triggerRef, showResizer} = props;
  let {resizerProps, inputProps} = useTableColumnResize({
    column,
    label: 'Resizer',
    onResizeStart,
    onResize,
    onResizeEnd,
    triggerRef
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
            flex: '0 0 auto',
            boxSizing: 'border-box',
            visibility: showResizer ? 'visible' : 'hidden'
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
});

// TODO: fix keyboard navigation between columns.
// right now arrow right will move from a column menu button to the resizer because the resizer is focusable and usegridCell will think it should be the next child to be focused
// second issue is that I can't go from column to column via left arrow
export function TableColumnHeader({column, state, widths, layoutState, onResizeStart, onResize, onResizeEnd}) {
  let ref = useRef(null);
  let resizerRef = useRef(null);
  let triggerRef = useRef(null);
  let {columnHeaderProps} = useTableColumnHeader({node: column}, state, ref);
  let {isFocusVisible, focusProps} = useFocusRing();
  let {hoverProps, isHovered} = useHover({});
  let showResizer = isHovered || layoutState.resizingColumn === column.key;
  // TODO test if sorting still works
  let arrowIcon = state.sortDescriptor?.direction === 'ascending' ? '▲' : '▼';

  // TODO: ask if I should even accomadate sorting in this example
  let allowsSorting = column.props?.allowsSorting;
  let allowsResizing = column.props.allowsResizing;

  const onMenuSelect = (key) => {
    switch (key) {
      case 'sort-asc':
        state.sort(column.key, 'ascending');
        break;
      case 'sort-desc':
        state.sort(column.key, 'descending');
        break;
      case 'resize':
        layoutState.onColumnResizeStart(column.key);
        if (resizerRef) {
          setTimeout(() => resizerRef.current.focus(), 0);
        }
        break;
    }
  };

  let items = useMemo(() => {
    let options = [
      allowsSorting ? {
        label: 'Sort ascending',
        id: 'sort-asc'
      } : undefined,
      allowsSorting ? {
        label: 'Sort descending',
        id: 'sort-desc'
      } : undefined,
      {
        label: 'Resize column',
        id: 'resize'
      }
    ];
    return options;
  }, [allowsSorting]);

  let contents = allowsResizing ? (
    <>
      <MenuButton
        style={{
          width: '100%',
          textAlign: 'left',
          border: 'none',
          background: 'transparent',
          flex: '1 1 auto',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis'
        }}
        label={column.rendered}
        onAction={onMenuSelect}
        items={items}
        ref={triggerRef}>
        {(item) => (
          <Item>
            {item.label}
          </Item>
        )}
      </MenuButton>
      {column.props.allowsSorting &&
        <span aria-hidden="true" style={{padding: '0 2px', visibility: state.sortDescriptor?.column === column.key ? 'visible' : 'hidden'}}>
          {arrowIcon}
        </span>
      }
      <Resizer showResizer={showResizer} ref={resizerRef} triggerRef={triggerRef} column={column} layoutState={layoutState} onResizeStart={onResizeStart} onResize={onResize} onResizeEnd={onResizeEnd} />
    </>
  ) :
  (
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
  );


  return (
    <th
      {...mergeProps(columnHeaderProps, focusProps, hoverProps)}
      colSpan={column.colspan}
      style={{
        textAlign: column.colspan > 1 ? 'center' : 'left',
        padding: '5px 10px',
        // TODO switch to box shadow?
        // outline: isFocusVisible ? '2px solid orange' : 'none',
        outline: 'none',
        boxShadow: isFocusVisible ? 'inset 0 0 0 2px orange' : 'none',
        cursor: 'default',
        // New stuff
        width: widths.get(column.key),
        display: 'block',
        flex: '0 0 auto',
        boxSizing: 'border-box'
      }}
      ref={ref}>
      <div style={{display: 'flex', position: 'relative'}}>
        {contents}
      </div>
    </th>
  );
}

// done
export function TableRow({item, children, state}) {
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
        // TODO: Switch to box shadow, new stuff
        // outline: isFocusVisible ? '2px solid orange' : 'none',
        outline: 'none',
        boxShadow: isFocusVisible ? 'inset 0 0 0 2px orange' : 'none',
        display: 'flex',
        // Make the row extend pass the table width so the background is consistent
        width: 'fit-content'
      }}
      {...mergeProps(rowProps, focusProps)}
      ref={ref}>
      {children}
    </tr>
  );
}

// done
export function TableCell({cell, state, widths}) {
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
        // New stuff (modified replacement for boxShadow)
        // outline: isFocusVisible ? '2px solid orange' : 'none',
        outline: 'none',
        boxShadow: isFocusVisible ? 'inset 0 0 0 2px orange' : 'none',
        // New stuff
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

// done
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

// done
function TableSelectAllCell({column, state, widths}) {
  let ref = useRef();
  let {columnHeaderProps} = useTableColumnHeader({node: column}, state, ref);
  let {checkboxProps} = useTableSelectAllCheckbox(state);

  return (
    <th
      {...columnHeaderProps}
      style={{
        width: widths.get(column.key),
        boxSizing: 'border-box',
        margin: 'auto'
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

const MenuButton = React.forwardRef((props, ref) => {
  // Create state based on the incoming props
  let state = useMenuTriggerState(props);

  // Get props for the button and menu elements
  let {menuTriggerProps, menuProps} = useMenuTrigger({}, state, ref);

  return (
    <>
      <Button
        {...menuTriggerProps}
        buttonRef={ref}
        style={{height: 30, fontSize: 14, ...props.style}}>
        {props.label}
      </Button>
      {state.isOpen &&
        <Popover state={state} triggerRef={ref} placement="bottom start">
          <Menu
            {...props}
            {...menuProps} />
        </Popover>
      }
    </>
  );
});


function Menu(props) {
  // Create menu state based on the incoming props
  let state = useTreeState(props);

  // Get props for the menu element
  let ref = React.useRef();
  let {menuProps} = useMenu(props, state, ref);

  return (
    <ul
      {...menuProps}
      ref={ref}
      style={{
        margin: 0,
        padding: 0,
        listStyle: 'none',
        width: 150
      }}>
      {[...state.collection].map(item => (
        item.type === 'section'
          ? <MenuSection key={item.key} section={item} state={state} />
          : <MenuItem key={item.key} item={item} state={state} />
      ))}
    </ul>
  );
}

function MenuItem({item, state}) {
  // Get props for the menu item element
  let ref = React.useRef();
  let {menuItemProps, isFocused, isSelected, isDisabled} = useMenuItem({key: item.key}, state, ref);

  return (
    <li
      {...menuItemProps}
      ref={ref}
      style={{
        background: isFocused ? 'gray' : 'transparent',
        color: isDisabled ? 'gray' : isFocused ? 'white' : 'black',
        padding: '2px 5px',
        outline: 'none',
        cursor: 'default',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
      {item.rendered}
      {isSelected && <span aria-hidden="true">✅</span>}
    </li>
  );
}

function Popover({children, state, ...props}) {
  let ref = React.useRef();
  let {popoverRef = ref, triggerRef} = props;
  let {popoverProps, underlayProps} = usePopover({
    ...props,
    popoverRef,
    triggerRef
  }, state);

  return (
    <Overlay>
      <div {...underlayProps} style={{position: 'fixed', inset: 0}} />
      <div
        {...popoverProps}
        ref={popoverRef}
        style={{
          ...popoverProps.style,
          background: 'lightgray',
          border: '1px solid gray'
        }}>
        <DismissButton onDismiss={state.close} />
        {children}
        <DismissButton onDismiss={state.close} />
      </div>
    </Overlay>
  );
}

function Button(props) {
  let ref = props.buttonRef;
  let {buttonProps} = useButton(props, ref);
  return <button {...buttonProps} ref={ref} style={props.style}>{props.children}</button>;
}
