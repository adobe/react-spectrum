import {BaseCollection, CollectionContext, CollectionProps, CollectionRendererContext, ItemRenderProps, NodeValue, useCachedChildren, useCollection} from './Collection';
import {buildHeaderRows} from '@react-stately/table';
import {CheckboxContext} from './Checkbox';
import {ContextValue, forwardRefType, Provider, RenderProps, SlotProps, StyleProps, useContextProps, useRenderProps} from './utils';
import {DisabledBehavior, Node, SelectionBehavior, SelectionMode, SortDirection, TableState, useTableState} from 'react-stately';
import {filterDOMProps} from '@react-aria/utils';
import {GridNode} from '@react-types/grid';
import {TableCollection as ITableCollection, TableProps as SharedTableProps} from '@react-types/table';
import {mergeProps, useFocusRing, useHover, useTable, useTableCell, useTableColumnHeader, useTableHeaderRow, useTableRow, useTableRowGroup, useTableSelectAllCheckbox, useTableSelectionCheckbox} from 'react-aria';
import React, {createContext, ForwardedRef, forwardRef, Key, ReactElement, ReactNode, useCallback, useContext, useMemo, useRef} from 'react';

class TableCollection<T> extends BaseCollection<T> implements ITableCollection<T> {
  headerRows: GridNode<T>[] = [];
  columns: GridNode<T>[] = [];
  rowHeaderColumnKeys: Set<Key> = new Set();
  head: NodeValue<T> = new NodeValue('tableheader', -1);
  body: NodeValue<T> = new NodeValue('tablebody', -2);
  columnsDirty = true;

  addNode(node: NodeValue<T>) {
    super.addNode(node);

    this.columnsDirty ||= node.type === 'column';
    if (node.type === 'tableheader') {
      this.head = node;
    }

    if (node.type === 'tablebody') {
      this.body = node;
    }
  }

  commit(firstKey: Key, lastKey: Key) {
    this.updateColumns();
    super.commit(firstKey, lastKey);
  }

  private updateColumns() {
    if (!this.columnsDirty) {
      return;
    }

    this.rowHeaderColumnKeys = new Set();
    this.columns = [];

    let columnKeyMap = new Map();
    let visit = (node: Node<T>) => {
      switch (node.type) {
        case 'column':
          columnKeyMap.set(node.key, node);
          if (!node.hasChildNodes) {
            node.index = this.columns.length;
            this.columns.push(node);

            if (node.props.isRowHeader) {
              this.rowHeaderColumnKeys.add(node.key);
            }
          }
          break;
      }
      for (let child of this.getChildren(node.key)) {
        visit(child);
      }
    };

    for (let node of this.getChildren(this.head.key)) {
      visit(node);
    }

    this.headerRows = buildHeaderRows(columnKeyMap, this.columns);
    this.columnsDirty = false;
    if (this.rowHeaderColumnKeys.size === 0 && this.columns.length > 0) {
      throw new Error('A table must have at least one Column with the isRowHeader prop set to true');
    }
  }

  get columnCount() {
    return this.columns.length;
  }

  get rows() {
    return [...this.getChildren(this.body.key)];
  }

  *[Symbol.iterator]() {
    yield* this.getChildren(this.body.key);
  }

  get size() {
    return [...this.getChildren(this.body.key)].length;
  }

  getFirstKey() {
    return [...this.getChildren(this.body.key)][0]?.key;
  }

  getLastKey() {
    let rows = [...this.getChildren(this.body.key)];
    return rows[rows.length - 1]?.key;
  }

  getKeyAfter(key: Key) {
    let node = this.getItem(key);
    if (node?.type === 'column') {
      return node.nextKey;
    }

    return super.getKeyAfter(key);
  }

  getKeyBefore(key: Key) {
    let node = this.getItem(key);
    if (node?.type === 'column') {
      return node.prevKey;
    }

    key = super.getKeyBefore(key);
    if (this.getItem(key)?.type === 'tablebody') {
      return null;
    }

    return key;
  }

  getChildren(key: Key): Iterable<Node<T>> {
    if (!this.getItem(key)) {
      for (let row of this.headerRows) {
        if (row.key === key) {
          return row.childNodes;
        }
      }
    }

    return super.getChildren(key);
  }

  clone() {
    let collection = super.clone();
    collection.headerRows = this.headerRows;
    collection.columns = this.columns;
    collection.rowHeaderColumnKeys = this.rowHeaderColumnKeys;
    collection.head = this.head;
    collection.body = this.body;
    return collection;
  }
}

export const TableContext = createContext<ContextValue<TableProps<any>, HTMLTableElement>>(null);
const InternalTableContext = createContext<TableState<unknown>>(null);

export interface TableProps<T> extends Omit<SharedTableProps<T>, 'children'>, CollectionProps<T>, StyleProps, SlotProps {
  /**
   * How multiple selection should behave in the collection.
   * @default "toggle"
   */
  selectionBehavior?: SelectionBehavior,
  /**
   * Whether `disabledKeys` applies to all interactions, or only selection.
   * @default "selection"
   */
  disabledBehavior?: DisabledBehavior,
  /** Handler that is called when a user performs an action on the row. */
  onRowAction?: (key: Key) => void,
  /** Handler that is called when a user performs an action on the cell. */
  onCellAction?: (key: Key) => void
}

function Table<T extends object>(props: TableProps<T>, ref: ForwardedRef<HTMLTableElement>) {
  [props, ref] = useContextProps(props, ref, TableContext);
  let initialCollection = useMemo(() => new TableCollection<T>(), []);
  let {portal, collection} = useCollection(props, initialCollection);
  let state = useTableState({
    ...props,
    collection,
    children: null
  });

  let {gridProps} = useTable(props, state, ref);

  let headerRows = useCachedChildren({
    items: collection.headerRows,
    children: useCallback((item: Node<T>) => {
      switch (item.type) {
        case 'headerrow':
          return <TableHeaderRow item={item} />;
        default:
          throw new Error('Unsupported node type in TableHeader: ' + item.type);
      }
    }, [])
  });

  let bodyRows = useCachedChildren({
    items: collection.rows,
    children: useCallback((item: Node<T>) => {
      switch (item.type) {
        case 'item':
          return <TableRow item={item} />;
        default:
          throw new Error('Unsupported node type in TableBody: ' + item.type);
      }
    }, [])
  });

  let {selectionBehavior, selectionMode, disallowEmptySelection} = state.selectionManager;
  let ctx = useMemo(() => ({
    selectionBehavior: selectionMode === 'none' ? null : selectionBehavior,
    selectionMode,
    disallowEmptySelection
  }), [selectionBehavior, selectionMode, disallowEmptySelection]);

  return (
    <>
      <InternalTableContext.Provider value={state}>
        <table {...gridProps} ref={ref} className={props.className ?? 'react-aria-Table'} style={props.style}>
          <TableRowGroup
            type="thead"
            {...filterDOMProps(collection.head.props)}
            className={collection.head.props.className ?? 'react-aria-TableHeader'}
            style={collection.head.props.style}>
            {headerRows}
          </TableRowGroup>
          <TableRowGroup
            type="tbody"
            {...filterDOMProps(collection.body.props)}
            className={collection.body.props.className ?? 'react-aria-TableBody'}
            style={collection.body.props.style}>
            {bodyRows}
          </TableRowGroup>
        </table>
      </InternalTableContext.Provider>
      <TableOptionsContext.Provider value={ctx}>
        {portal}
      </TableOptionsContext.Provider>
    </>
  );
}

/**
 * A table displays data in rows and columns and enables a user to navigate its contents via directional navigation keys,
 * and optionally supports row selection and sorting.
 */
const _Table = (forwardRef as forwardRefType)(Table);
export {_Table as Table};

export interface TableOptionsContextValue {
  /** The type of selection that is allowed in the collection. */
  selectionMode: SelectionMode,
  /** The selection behavior for the collection. If selectionMode is `"none"`, this will be `null`. */
  selectionBehavior: SelectionBehavior | null,
  /** Whether the collection allows empty selection. */
  disallowEmptySelection: boolean
}

const TableOptionsContext = createContext<TableOptionsContextValue>(null);

/**
 * Returns options from the parent `<Table>` component.
 */
export function useTableOptions(): TableOptionsContextValue {
  return useContext(TableOptionsContext);
}

export interface TableHeaderProps<T> {
  /** A list of table columns. */
  columns?: T[],
  /** A list of `Column(s)` or a function. If the latter, a list of columns must be provided using the `columns` prop. */
  children?: ReactNode | ((item: T) => ReactElement)
}

/**
 * A header within a `<Table>`, containing the table columns.
 */
export function TableHeader<T extends object>(props: TableHeaderProps<T>) {
  let children = useCachedChildren({
    children: props.children,
    items: props.columns
  });

  let renderer = typeof props.children === 'function' ? props.children : null;
  return (
    <CollectionRendererContext.Provider value={renderer}>
      {/* @ts-ignore */}
      <tableheader multiple={props}>{children}</tableheader>
    </CollectionRendererContext.Provider>
  );
}

export interface ColumnRenderProps {
  /**
   * Whether the item is currently focused.
   * @selector [data-focused]
   */
  isFocused: boolean,
  /**
   * Whether the item is currently keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean,
  /**
   * Whether the column allows sorting.
   * @selector [aria-sort]
   */
  allowsSorting: boolean,
  /**
   * The current sort direction.
   * @selector [aria-sort="ascending | descending"]
   */
  sortDirection: SortDirection | null
}

export interface ColumnProps<T = object> extends RenderProps<ColumnRenderProps> {
  id?: Key,
  /** Rendered contents of the column if `children` contains child columns. */
  title?: ReactNode,
  /** A list of child columns used when dynamically rendering nested child columns. */
  childColumns?: T[],
  /** Whether the column allows sorting. */
  allowsSorting?: boolean,
  /** Whether a column is a [row header](https://www.w3.org/TR/wai-aria-1.1/#rowheader) and should be announced by assistive technology during row navigation. */
  isRowHeader?: boolean,
  /** A string representation of the column's contents, used for accessibility announcements. */
  textValue?: string
}

/**
 * A column within a `<Table>`.
 */
export function Column<T extends object>(props: ColumnProps<T>): JSX.Element {
  let render = useContext(CollectionRendererContext);
  let childColumns = typeof render === 'function' ? render : props.children;
  let children = useCachedChildren({
    children: (props.title || props.childColumns) ? childColumns : null,
    items: props.childColumns
  });

  // @ts-ignore
  return <column multiple={{...props, rendered: props.title ?? props.children}}>{children}</column>;
}

export interface TableBodyProps<T> extends CollectionProps<T> {}

/**
 * The body of a `<Table>`, containing the table rows.
 */
export function TableBody<T extends object>(props: TableBodyProps<T>) {
  let children = useCachedChildren(props);

  // @ts-ignore
  return <tablebody multiple={props}>{children}</tablebody>;
}

export interface RowRenderProps extends ItemRenderProps {}

export interface RowProps<T> extends RenderProps<RowRenderProps> {
  id?: Key,
  /** A list of columns used when dynamically rendering cells. */
  columns?: Iterable<T>,
  /** The cells within the row. Supports static items or a function for dynamic rendering. */
  children?: ReactNode | ((item: T) => ReactElement),
  /** A string representation of the row's contents, used for features like typeahead. */
  textValue?: string
}

/**
 * A row within a `<Table>`.
 */
export function Row<T extends object>(props: RowProps<T>) {
  let children = useCachedChildren({
    children: props.children,
    items: props.columns,
    idScope: props.id
  });

  let ctx = useMemo(() => ({idScope: props.id}), [props.id]);

  return (
    // @ts-ignore
    <item multiple={props}>
      <CollectionContext.Provider value={ctx}>
        {children}
      </CollectionContext.Provider>
      {/* @ts-ignore */}
    </item>
  );
}

export interface CellRenderProps {
  /**
   * Whether the cell is currently in a pressed state.
   * @selector [data-pressed]
   */
  isPressed: boolean,
  /**
   * Whether the cell is currently focused.
   * @selector [data-focused]
   */
  isFocused: boolean,
  /**
   * Whether the cell is currently keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean
}

export interface CellProps extends RenderProps<CellRenderProps> {
  id?: Key,
  /** The contents of the cell. */
  children: ReactNode,
  /** A string representation of the cell's contents, used for features like typeahead. */
  textValue?: string
}

/**
 * A cell within a table row.
 */
export function Cell(props: CellProps): JSX.Element {
  // @ts-ignore
  return <cell multiple={{...props, rendered: props.children}} />;
}

function TableRowGroup({type: Element, children, ...otherProps}) {
  let {rowGroupProps} = useTableRowGroup();
  return (
    <Element {...otherProps} {...rowGroupProps}>
      {children}
    </Element>
  );
}

function TableHeaderRow<T>({item}: {item: GridNode<T>}) {
  let ref = useRef();
  let state = useContext(InternalTableContext);
  let {rowProps} = useTableHeaderRow({node: item}, state, ref);
  let {checkboxProps} = useTableSelectAllCheckbox(state);

  let cells = useCachedChildren({
    items: state.collection.getChildren(item.key),
    children: (item) => {
      switch (item.type) {
        case 'column':
          return <TableColumnHeader column={item} />;
        default:
          throw new Error('Unsupported node type in Row: ' + item.type);
      }
    }
  });

  return (
    <tr {...rowProps} ref={ref}>
      <Provider
        values={[
          [CheckboxContext, {
            slots: {
              selection: checkboxProps
            }
          }]
        ]}>
        {cells}
      </Provider>
    </tr>
  );
}

function TableColumnHeader<T>({column}: {column: GridNode<T>}) {
  let ref = useRef();
  let state = useContext(InternalTableContext);
  let {columnHeaderProps} = useTableColumnHeader(
    {node: column},
    state,
    ref
  );
  let {isFocused, isFocusVisible, focusProps} = useFocusRing();

  let props: ColumnProps<unknown> = column.props;
  let renderProps = useRenderProps({
    ...props,
    id: undefined,
    children: column.rendered,
    defaultClassName: 'react-aria-Column',
    values: {
      isFocused,
      isFocusVisible,
      allowsSorting: column.props.allowsSorting,
      sortDirection: state.sortDescriptor?.column === column.key
        ? state.sortDescriptor?.direction
        : null
    }
  });

  return (
    <th
      {...mergeProps(columnHeaderProps, focusProps)}
      {...renderProps}
      colSpan={column.colspan}
      ref={ref}
      data-focused={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}>
      {renderProps.children}
    </th>
  );
}

function TableRow<T>({item}: {item: GridNode<T>}) {
  let ref = useRef();
  let state = useContext(InternalTableContext);
  let {rowProps, ...states} = useTableRow(
    {
      node: item
    },
    state,
    ref
  );
  let {isFocused, isFocusVisible, focusProps} = useFocusRing();
  let {hoverProps, isHovered} = useHover({
    isDisabled: !states.allowsSelection && !states.hasAction
  });

  let {checkboxProps} = useTableSelectionCheckbox(
    {key: item.key},
    state
  );

  let props = item.props as RowProps<unknown>;
  let renderProps = useRenderProps({
    ...props,
    id: undefined,
    defaultClassName: 'react-aria-Row',
    values: {
      ...states,
      isHovered,
      isFocused,
      isFocusVisible,
      selectionMode: state.selectionManager.selectionMode,
      selectionBehavior: state.selectionManager.selectionBehavior
    }
  });

  let cells = useCachedChildren({
    items: state.collection.getChildren(item.key),
    children: (item: Node<T>) => {
      switch (item.type) {
        case 'cell':
          return <TableCell cell={item} />;
        default:
          throw new Error('Unsupported node type in Row: ' + item.type);
      }
    }
  });

  return (
    <tr
      {...mergeProps(rowProps, focusProps, hoverProps)}
      {...renderProps}
      ref={ref}
      data-hovered={isHovered || undefined}
      data-focused={states.isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-pressed={states.isPressed || undefined}>
      <Provider
        values={[
          [CheckboxContext, {
            slots: {
              selection: checkboxProps
            }
          }]
        ]}>
        {cells}
      </Provider>
    </tr>
  );
}

function TableCell<T>({cell}: {cell: GridNode<T>}) {
  let ref = useRef();
  let state = useContext(InternalTableContext);

  // @ts-ignore
  cell.column = state.collection.columns[cell.index];

  let {gridCellProps, isPressed} = useTableCell({node: cell}, state, ref);
  let {isFocused, isFocusVisible, focusProps} = useFocusRing();

  let props: CellProps = cell.props;
  let renderProps = useRenderProps({
    ...props,
    id: undefined,
    defaultClassName: 'react-aria-Cell',
    values: {
      isFocused,
      isFocusVisible,
      isPressed
    }
  });

  return (
    <td
      {...mergeProps(gridCellProps, focusProps)}
      {...renderProps}
      ref={ref}
      data-focused={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-pressed={isPressed || undefined}>
      {cell.rendered}
    </td>
  );
}
