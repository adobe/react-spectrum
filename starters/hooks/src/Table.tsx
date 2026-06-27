'use client';
import {mergeProps} from 'react-aria/mergeProps';
import {
  useTable,
  useTableCell,
  useTableColumnHeader,
  useTableHeaderRow,
  useTableRow,
  useTableRowGroup
} from 'react-aria/useTable';
import {useFocusRing} from 'react-aria/useFocusRing';
import {
  useTableState,
  Cell,
  Column,
  Row,
  TableBody,
  TableHeader
} from 'react-stately/useTableState';
import type {Node} from '@react-types/shared';
import {useRef} from 'react';
import type {ReactNode} from 'react';
import './Table.css';

export {Cell, Column, Row, TableBody, TableHeader};

export function Table(
  props: Parameters<typeof useTableState>[0] &
    Parameters<typeof useTable>[0] & {children?: ReactNode}
) {
  let state = useTableState({...props, showSelectionCheckboxes: false});
  let ref = useRef<HTMLTableElement>(null);
  let {collection} = state;
  let {gridProps} = useTable(props, state, ref);

  return (
    <table
      {...gridProps}
      ref={ref}
      style={{borderCollapse: 'collapse', color: 'var(--text-color)'}}>
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
      style={Element === 'thead' ? {borderBottom: '2px solid var(--gray-300)'} : undefined}>
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
  state: ReturnType<typeof useTableState>;
  children: ReactNode;
}) {
  let ref = useRef<HTMLTableRowElement>(null);
  let {rowProps} = useTableHeaderRow({node: item}, state, ref);
  return (
    <tr {...rowProps} ref={ref}>
      {children}
    </tr>
  );
}

function TableColumnHeader({
  column,
  state
}: {
  column: Node<object>;
  state: ReturnType<typeof useTableState>;
}) {
  let ref = useRef<HTMLTableCellElement>(null);
  let {columnHeaderProps} = useTableColumnHeader({node: column}, state, ref);
  let {isFocusVisible, focusProps} = useFocusRing();
  return (
    <th
      {...mergeProps(columnHeaderProps, focusProps)}
      ref={ref}
      style={{
        textAlign: 'start',
        padding: '6px 12px',
        cursor: 'default',
        outline: isFocusVisible ? '2px solid var(--focus-ring-color)' : 'none',
        outlineOffset: -2
      }}>
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
  state: ReturnType<typeof useTableState>;
}) {
  let ref = useRef<HTMLTableRowElement>(null);
  let isSelected = state.selectionManager.isSelected(item.key);
  let {rowProps} = useTableRow({node: item}, state, ref);
  let {isFocusVisible, focusProps} = useFocusRing();
  return (
    <tr
      {...mergeProps(rowProps, focusProps)}
      ref={ref}
      style={{
        cursor: 'default',
        background: isSelected ? 'var(--highlight-background)' : 'transparent',
        color: isSelected ? 'var(--highlight-foreground)' : 'var(--text-color)',
        outline: isFocusVisible ? '2px solid var(--focus-ring-color)' : 'none',
        outlineOffset: -2
      }}>
      {children}
    </tr>
  );
}

function TableCell({cell, state}: {cell: Node<object>; state: ReturnType<typeof useTableState>}) {
  let ref = useRef<HTMLTableCellElement>(null);
  let {gridCellProps} = useTableCell({node: cell}, state, ref);
  let {isFocusVisible, focusProps} = useFocusRing();
  return (
    <td
      {...mergeProps(gridCellProps, focusProps)}
      ref={ref}
      style={{
        padding: '6px 12px',
        outline: isFocusVisible ? '2px solid var(--focus-ring-color)' : 'none',
        outlineOffset: -2
      }}>
      {cell.rendered}
    </td>
  );
}
