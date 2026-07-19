'use client';
import {mergeProps} from 'react-aria/mergeProps';
import {
  useTable,
  useTableCell,
  useTableColumnHeader,
  useTableHeaderRow,
  useTableRow,
  useTableRowGroup,
  type AriaTableProps
} from 'react-aria/useTable';
import {useFocusRing} from 'react-aria/useFocusRing';
import {
  useTableState,
  Cell,
  Column,
  Row,
  TableBody,
  TableHeader,
  type TableState,
  type TableStateProps
} from 'react-stately/useTableState';
import type {Node} from '@react-types/shared';
import {useRef} from 'react';
import type {ReactNode} from 'react';
import './Table.css';

export {Cell, Column, Row, TableBody, TableHeader};

export function Table(props: TableStateProps<object> & AriaTableProps & {children?: ReactNode}) {
  let state = useTableState({...props, showSelectionCheckboxes: false});
  let ref = useRef<HTMLTableElement>(null);
  let {collection} = state;
  let {gridProps} = useTable(props, state, ref);

  return (
    <table {...gridProps} ref={ref} className="react-aria-Table">
      <TableRowGroup type="thead">
        {collection.headerRows.map(headerRow => (
          <TableHeaderRow key={headerRow.key} item={headerRow} state={state}>
            {[...headerRow.childNodes].map(column => (
              <TableColumnHeader key={column.key} column={column} state={state} />
            ))}
          </TableHeaderRow>
        ))}
      </TableRowGroup>
      <TableRowGroup type="tbody">
        {[...collection.body.childNodes].map(row => (
          <TableRow key={row.key} item={row} state={state}>
            {[...row.childNodes].map(cell => (
              <TableCell key={cell.key} cell={cell} state={state} />
            ))}
          </TableRow>
        ))}
      </TableRowGroup>
    </table>
  );
}

function TableRowGroup({type: Element, children}: {type: 'thead' | 'tbody'; children: ReactNode}) {
  let {rowGroupProps} = useTableRowGroup();
  return (
    <Element
      {...rowGroupProps}
      className={Element === 'thead' ? 'react-aria-TableHeader' : 'react-aria-TableBody'}>
      {children}
    </Element>
  );
}

function TableHeaderRow({
  item,
  state,
  children
}: {
  item: Node<object>;
  state: TableState<object>;
  children: ReactNode;
}) {
  let ref = useRef<HTMLTableRowElement>(null);
  /*- begin highlight -*/
  let {rowProps} = useTableHeaderRow({node: item}, state, ref);
  /*- end highlight -*/
  return (
    <tr {...rowProps} ref={ref}>
      {children}
    </tr>
  );
}

function TableColumnHeader({column, state}: {column: Node<object>; state: TableState<object>}) {
  let ref = useRef<HTMLTableCellElement>(null);
  let {columnHeaderProps} = useTableColumnHeader({node: column}, state, ref);
  let {isFocusVisible, focusProps} = useFocusRing();
  return (
    <th
      {...mergeProps(columnHeaderProps, focusProps)}
      ref={ref}
      className="react-aria-Column"
      data-focus-visible={isFocusVisible || undefined}>
      {column.rendered}
    </th>
  );
}

function TableRow({
  item,
  children,
  state
}: {
  item: Node<object>;
  children: ReactNode;
  state: TableState<object>;
}) {
  let ref = useRef<HTMLTableRowElement>(null);
  let {rowProps, isSelected, isDisabled, isPressed} = useTableRow({node: item}, state, ref);
  let {isFocusVisible, focusProps} = useFocusRing();
  return (
    <tr
      {...mergeProps(rowProps, focusProps)}
      ref={ref}
      className="react-aria-Row"
      data-selected={isSelected || undefined}
      data-disabled={isDisabled || undefined}
      data-pressed={isPressed || undefined}
      data-focus-visible={isFocusVisible || undefined}>
      {children}
    </tr>
  );
}

function TableCell({cell, state}: {cell: Node<object>; state: TableState<object>}) {
  let ref = useRef<HTMLTableCellElement>(null);
  let {gridCellProps} = useTableCell({node: cell}, state, ref);
  let {isFocusVisible, focusProps} = useFocusRing();
  return (
    <td
      {...mergeProps(gridCellProps, focusProps)}
      ref={ref}
      className="react-aria-Cell"
      data-focus-visible={isFocusVisible || undefined}>
      {cell.rendered}
    </td>
  );
}
