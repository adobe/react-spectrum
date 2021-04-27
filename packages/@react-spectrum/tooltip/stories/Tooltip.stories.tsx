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

import {action} from '@storybook/addon-actions';
import React, {useContext, useRef} from 'react';
import {storiesOf} from '@storybook/react';
import {Tooltip} from '../src';
import {useTable, useTableCell, useTableColumnHeader, useTableRow, useTableRowGroup, useTableRowHeader, useTableSelectAllCheckbox, useTableSelectionCheckbox} from '@react-aria/table';
import {TableState, useTableState} from '@react-stately/table';
import { mergeProps } from '@react-aria/utils';

import {useCheckbox} from '@react-aria/checkbox';
import {useToggleState} from '@react-stately/toggle';
import {
  Cell,
  Column,
  Row,
  TableBody,
  TableHeader
} from '@react-stately/table';

let onSelectionChange = action('onSelectionChange');
let columns = [
  {name: 'Foo', key: 'foo'},
  {name: 'Bar', key: 'bar'},
  {name: 'Baz', key: 'baz'}
];
let items = [
  {test: 'Test 1', foo: 'Foo 1', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {test: 'Test 2', foo: 'Foo 2', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'},
  {test: 'Test 1', foo: 'Foo 3', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {test: 'Test 2', foo: 'Foo 4', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'},
  {test: 'Test 1', foo: 'Foo 5', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {test: 'Test 2', foo: 'Foo 6', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'},
  {test: 'Test 1', foo: 'Foo 7', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {test: 'Test 2', foo: 'Foo 8', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'}
];

storiesOf('Tooltip', module)
  .add(
    'default',
    () => render('This is a tooltip.')
  )
  .add(
    'placement: left',
    () => render('This is a tooltip.', {placement: 'left'})
  )
  .add(
    'placement: right',
    () => render('This is a tooltip.', {placement: 'right'})
  )
  .add(
    'placement: top',
    () => render('This is a tooltip.', {placement: 'top'})
  )
  .add(
    'placement: bottom',
    () => render('This is a tooltip.', {placement: 'bottom'})
  )
  .add(
    'variant: neutral',
    () => render('This is a tooltip.', {variant: 'neutral'})
  )
  .add(
    'variant: positive',
    () => render('This is a tooltip.', {variant: 'positive'})
  )
  .add(
    'variant: negative',
    () => render('This is a tooltip.', {variant: 'negative'})
  )
  .add(
    'variant: info',
    () => render('This is a tooltip.', {variant: 'info'})
  )
  .add(
    'variant: neutral, icon',
    () => render('This is a tooltip.', {variant: 'neutral', showIcon: true})
  )
  .add(
    'variant: positive, icon',
    () => render('This is a tooltip.', {variant: 'positive', showIcon: true})
  )
  .add(
    'variant: negative, icon',
    () => render('This is a tooltip.', {variant: 'negative', showIcon: true})
  )
  .add(
    'variant: info, icon',
    () => render('This is a tooltip.', {variant: 'info', showIcon: true})
  )
  .add(
    'long content',
    () => render(longMarkup)
  )
  .add(
    'dynamic',
    () => (
      // <Table aria-label="Table with dynamic contents" width={300} height={200}>
      <Table aria-label="Table with dynamic contents" style={{width: '300px', height: '200px'}}>
        <TableHeader columns={columns}>
          {column => <Column>{column.name}</Column>}
        </TableHeader>
        <TableBody items={items}>
          {item =>
            (<Row key={item.foo}>
              {key => <Cell>{item[key]}</Cell>}
            </Row>)
          }
        </TableBody>
      </Table>
    )
  )
  .add(
    'static',
    () => (
      // <Table aria-label="blah" selectionMode="multiple" width={500} height={200} isQuiet onSelectionChange={s => onSelectionChange([...s])}>
      <Table aria-label="blah" selectionMode="multiple" onSelectionChange={s => onSelectionChange([...s])} style={{width: '500px', height: '200px'}}>
        <TableHeader>
          <Column isRowHeader>First Name</Column>
          <Column isRowHeader>Last Name</Column>
          <Column>Birthday</Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>Sam</Cell>
            <Cell>Smith</Cell>
            <Cell>May 3</Cell>
          </Row>
          <Row>
            <Cell>Julia</Cell>
            <Cell>Jones</Cell>
            <Cell>February 10</Cell>
          </Row>
        </TableBody>
      </Table>
    )
  );

const longMarkup = (
  <div>
    Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor
    quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean
    ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra.
    Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt
    condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui.
  </div>
);

function render(content, props = {}) {
  return (
    <div style={{display: 'inline-block'}}>
      <Tooltip
        {...props}
        isOpen>
        {content}
      </Tooltip>
    </div>
  );
}


const TableContext = React.createContext(null);
function useTableContext() {
  return useContext(TableContext);
}

function Table(props) {
  // NEEDED?
  let {isQuiet} = props;
  let state = useTableState({...props, showSelectionCheckboxes: true});
  // NEEDED?
  let density = props.density || 'regular';
  let ref = useRef();
  // NEEDED? Maybe too much, just pass some basic values, no need for density and scale?
  // layout is technically optional
  // let layout = useMemo(() => new TableLayout({
  //   // If props.rowHeight is auto, then use estimated heights based on scale, otherwise use fixed heights.
  //   rowHeight: props.overflowMode === 'wrap'
  //     ? null
  //     : ROW_HEIGHTS[density][scale],
  //   estimatedRowHeight: props.overflowMode === 'wrap'
  //     ? ROW_HEIGHTS[density][scale]
  //     : null,
  //   headingHeight: props.overflowMode === 'wrap'
  //     ? null
  //     : DEFAULT_HEADER_HEIGHT[scale],
  //   estimatedHeadingHeight: props.overflowMode === 'wrap'
  //     ? DEFAULT_HEADER_HEIGHT[scale]
  //     : null,
  //   getDefaultWidth: ({hideHeader, isSelectionCell, showDivider}) => {
  //     if (hideHeader) {
  //       let width = DEFAULT_HIDE_HEADER_CELL_WIDTH[scale];
  //       return showDivider ? width + 1 : width;
  //     } else if (isSelectionCell) {
  //       return SELECTION_CELL_DEFAULT_WIDTH;
  //     }
  //   }
  // }), [props.overflowMode, scale, density]);

  let {gridProps} = useTable({
    ...props,
    // ref: domRef,
    ref: ref,
    // layout
  }, state);
  // console.log('state, state.collection', state, state.collection)
  let headerRows = state.collection.rows.filter(item => item.type === 'headerrow' && item);
  let rows = state.collection.rows.filter(item => item.type === 'item' && item);

  let renderColumnNode = (node) => {
    if (node.props.isSelectionCell) {
      return <TableSelectAllCell column={node} />
    }

    return <TableColumnHeader column={node} />
  };

  let renderRowNode = (node) => {
    if (node.props.isSelectionCell) {
      return <TableCheckboxCell cell={node} />;
    }

    if (state.collection.rowHeaderColumnKeys.has(node.column.key)) {
      return <TableRowHeader cell={node} />;
    }

    return <TableCell cell={node} />;
  };

  // TODO check the extra div styles
  return (
    <TableContext.Provider value={state}>
      <div {...gridProps} style={props.style} ref={ref}>
        <div style={{overflow: 'hidden'}}>
          <TableHeaderRENAME>
            {[...headerRows].map(headerRow => (
              <TableHeaderRow item={headerRow}>
                {[...headerRow.childNodes].map((column) => renderColumnNode(column))}
              </TableHeaderRow>
            ))}
          </TableHeaderRENAME>
        </div>
        <div style={{padding: '0px', flex: '1 1 0%', overflow: 'auto'}}>
          <div style={{overflow: 'visible'}}>
            <TableRowGroup>
              {[...rows].map(row => (
                <TableRow item={row}>
                  {[...row.childNodes].map((node) => renderRowNode(node))}
                </TableRow>
              ))}
            </TableRowGroup>
          </div>
        </div>
      </div>
    </TableContext.Provider>
  );
}


function TableHeaderRENAME({children, ...otherProps}) {
  let {rowGroupProps} = useTableRowGroup();

  return (
    <div {...rowGroupProps} {...otherProps}>
      {children}
    </div>
  );
}

function TableColumnHeader({column}) {
  let ref = useRef();
  let state = useTableContext();
  let {columnHeaderProps} = useTableColumnHeader({
    node: column,
    ref,
    colspan: column.colspan,
  }, state);

  let columnProps = column.props;
  // let {hoverProps, isHovered} = useHover({});

  return (
    <div
      // {...mergeProps(columnHeaderProps, hoverProps)}
      {...columnHeaderProps}
      ref={ref}>
      {column.rendered}
      {/* {columnProps.hideHeader ?
        <VisuallyHidden>{column.rendered}</VisuallyHidden> :
        column.rendered
      } */}
      {/* TODO: add style/element for sorting? ignore sorting? */}
      {/* {columnProps.allowsSorting &&
        <ArrowDownSmall UNSAFE_className={classNames(styles, 'spectrum-Table-sortedIcon')} />
      } */}
    </div>
  );
}

function TableSelectAllCell({column}) {
  let ref = useRef();
  let state = useTableContext();

  let isSingleSelectionMode = state.selectionManager.selectionMode === 'single';
  let {columnHeaderProps} = useTableColumnHeader({
    node: column,
    ref,
    colspan: column.colspan,
    isDisabled: isSingleSelectionMode
  }, state);

  let {checkboxProps} = useTableSelectAllCheckbox(state);
  // let {hoverProps, isHovered} = useHover({});
  // TODO
  let inputRef = useRef(null);
  let {inputProps} = useCheckbox(checkboxProps, useToggleState(checkboxProps), inputRef)
  return (
    <div
      // {...mergeProps(columnHeaderProps, hoverProps)}
      {...columnHeaderProps}
      aria-disabled={isSingleSelectionMode}
      ref={ref}>
      {/* <Checkbox
        {...checkboxProps}
        isDisabled={isSingleSelectionMode}
        isEmphasized
        UNSAFE_style={{visibility: isSingleSelectionMode ? 'hidden' : 'visible'}}
        UNSAFE_className={classNames(styles, 'spectrum-Table-checkbox')} /> */}
      <input
        // {...checkboxProps}
        {...inputProps}
        style={{visibility: isSingleSelectionMode ? 'hidden' : 'visible'}} />
    </div>
  );
}

function TableRowGroup({children, ...otherProps}) {
  let {rowGroupProps} = useTableRowGroup();

  return (
    <div {...rowGroupProps} {...otherProps}>
      {children}
    </div>
  );
}

function TableRow({item, children, ...otherProps}) {
  let ref = useRef();
  let state = useTableContext();
  let isDisabled = state.disabledKeys.has(item.key);
  let isSelected = state.selectionManager.isSelected(item.key) && !isDisabled;
  let {rowProps} = useTableRow({
    node: item,
    isSelected,
    ref,
    isDisabled
  }, state);

  // TODO: do we need the below for the aria example?
  // The row should show the focus background style when any cell inside it is focused.
  // If the row itself is focused, then it should have a blue focus indicator on the left.
  // let {
  //   isFocusVisible: isFocusVisibleWithin,
  //   focusProps: focusWithinProps
  // } = useFocusRing({within: true});
  // let {isFocusVisible, focusProps} = useFocusRing();
  // let {hoverProps, isHovered} = useHover({isDisabled});
  let props = mergeProps(
    rowProps,
    otherProps,
    // focusWithinProps,
    // focusProps,
    // hoverProps
  );

  return (
    <div
      style={{display: 'flex', flexDirection: 'row'}}
      {...props}
      ref={ref}>
      {/* // className={
      //   classNames(
      //     styles,
      //     'spectrum-Table-row',
      //     {
      //       'is-selected': isSelected,
      //       'is-focused': isFocusVisibleWithin,
      //       'focus-ring': isFocusVisible,
      //       'is-hovered': isHovered,
      //       'is-disabled': isDisabled
      //     }
      //   )
      // }> */}
      {children}
    </div>
  );
}

function TableHeaderRow({item, children, ...otherProps}) {
  return (
    <div role="row" aria-rowindex={item.index + 1} {...otherProps} style={{display: 'flex', flexDirection: 'row'}}>
      {children}
    </div>
  );
}

function TableCheckboxCell({cell}) {
  let ref = useRef();
  let state = useTableContext();
  let isDisabled = state.disabledKeys.has(cell.parentKey);
  let {gridCellProps} = useTableCell({
    node: cell,
    ref,
    isDisabled
  }, state);

  let {checkboxProps} = useTableSelectionCheckbox(
    {
      key: cell.parentKey,
      isDisabled
    },
    state
  );

  let inputRef = useRef(null);
  let {inputProps} = useCheckbox(checkboxProps, useToggleState(checkboxProps), inputRef)

  return (
    <div
      {...gridCellProps}
      ref={ref}>
      {state.selectionManager.selectionMode !== 'none' &&
        <input {...inputProps} />
      }
    </div>
  );
}

function TableCell({cell}) {
  let ref = useRef();
  let state = useTableContext();
  let isDisabled = state.disabledKeys.has(cell.parentKey);
  let {gridCellProps} = useTableCell({
    node: cell,
    ref,
    isDisabled
  }, state);

  return (
    <TableCellBase
      {...gridCellProps}
      cell={cell}
      cellRef={ref} />
  );
}

function TableRowHeader({cell}) {
  let ref = useRef();
  let state = useTableContext();
  let isDisabled = state.disabledKeys.has(cell.parentKey);
  let {rowHeaderProps} = useTableRowHeader({
    node: cell,
    ref,
    isDisabled
  }, state);

  return (
    <TableCellBase
      {...rowHeaderProps}
      cell={cell}
      cellRef={ref} />
  );
}

function TableCellBase({cell, cellRef, ...otherProps}) {
  let state = useTableContext();
  let columnProps = cell.column.props;
  let isDisabled = state.disabledKeys.has(cell.parentKey);

  return (
    <div
      {...otherProps}
      ref={cellRef}
      // className={
      //   classNames(
      //     styles,
      //     'spectrum-Table-cell',
      //     {
      //       'spectrum-Table-cell--divider': columnProps.showDivider,
      //       'spectrum-Table-cell--hideHeader': columnProps.hideHeader,
      //       'is-disabled': isDisabled
      //     },
      //     classNames(
      //       stylesOverrides,
      //       'react-spectrum-Table-cell',
      //       {
      //         'react-spectrum-Table-cell--alignCenter': columnProps.align === 'center',
      //         'react-spectrum-Table-cell--alignEnd': columnProps.align === 'end'
      //       }
      //     )
      //   )
      // }>
      >
      <span>
      {/* //   className={
      //     classNames(
      //       styles,
      //       'spectrum-Table-cellContents'
      //     )
      // }> */}
        {cell.rendered}
      </span>
    </div>
  );
}
