import {BaseCollection, ElementNode, useCachedChildren, useCollection} from './Collection';
import {buildHeaderRows} from '@react-stately/table/src/TableCollection';
import {CellProps, ColumnProps, TableCollection as ITableCollection, RowProps} from '@react-types/table';
import {CheckboxContext} from './Checkbox';
import {GridNode} from '@react-types/grid';
import {mergeProps, useFocusRing, useTable, useTableCell, useTableColumnHeader, useTableHeaderRow, useTableRow, useTableRowGroup, useTableSelectAllCheckbox, useTableSelectionCheckbox} from 'react-aria';
import {Node} from '@react-types/shared';
import {Provider, useRenderProps} from './utils';
import React, {createContext, Key, useCallback, useContext, useMemo, useRef} from 'react';
import {TableState, useTableState} from 'react-stately';

class TableCollection<T> extends BaseCollection<T> implements ITableCollection<T> {
  headerRows: GridNode<T>[] = [];
  columns: GridNode<T>[] = [];
  rowHeaderColumnKeys: Set<Key> = new Set();
  head: ElementNode<T> = new ElementNode('head', this);
  body: ElementNode<T> = new ElementNode('body', this);
  columnsDirty = true;

  queueUpdate(node: ElementNode<T>) {
    this.columnsDirty ||= node.type === 'column';

    if (node.type === 'head') {
      this.head = node;
    }

    if (node.type === 'body') {
      this.body = node;
    }

    super.queueUpdate(node);
  }

  updateColumns(showSelectionCheckboxes = false) {
    if (!this.columnsDirty) {
      return;
    }
    
    this.rowHeaderColumnKeys.clear();
    this.columns = [];

    let columnKeyMap = new Map();
    let visit = (node: ElementNode<T>) => {
      switch (node.type) {
        case 'column':
          columnKeyMap.set(node.key, node);
          if (!node.hasChildNodes) {
            this.columns.push({
              type: node.type,
              key: node.key,
              parentKey: node.parentKey,
              index: this.columns.length,
              value: node.value,
              rendered: node.rendered,
              level: node.level,
              hasChildNodes: node.hasChildNodes,
              childNodes: node.childNodes,
              textValue: node.textValue,
              props: node.props
            });

            if (node.props.isRowHeader) {
              this.rowHeaderColumnKeys.add(node.key);
            }
          }
          break;
      }
      for (let child of node.childNodes) {
        visit(child);
      }
    };

    let node = this.firstChild;
    while (node) {
      visit(node);
      node = node.nextSibling;
    }

    this.headerRows = buildHeaderRows(columnKeyMap, this.columns);
    this.columnsDirty = false;

    // Default row header column to the first one.
    if (this.rowHeaderColumnKeys.size === 0 && this.columns.length > 0) {
      this.rowHeaderColumnKeys.add(this.columns[showSelectionCheckboxes ? 1 : 0].key);
    }    
  }

  get columnCount() {
    return this.columns.length;
  }

  get rows() {
    return [...this.body.childNodes];
  }

  *[Symbol.iterator]() {
    yield* this.body.childNodes;
  }

  get size() {
    return [...this.body.childNodes].length;
  }

  getFirstKey() {
    return [...this.body.childNodes][0]?.key;
  }

  getLastKey() {
    let rows = [...this.body.childNodes];
    return rows[rows.length - 1]?.key;
  }

  getKeyBefore(key: Key) {
    key = super.getKeyBefore(key);
    if (this.getItem(key)?.type === 'body') {
      return null;
    }

    return key;
  }
}

const InternalTableContext = createContext<TableState<unknown>>(null);

export function Table<T>(props) {
  let {selectionMode, selectionBehavior} = props;
  let {portal, collection} = useCollection(props, TableCollection) as {portal: React.ReactPortal, collection: TableCollection<T>};
  collection.updateColumns(selectionMode !== 'none');
  let state = useTableState({
    ...props,
    showSelectionCheckboxes: selectionMode === 'multiple' && selectionBehavior !== 'replace',
    collection
  });

  let ref = useRef();
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

  return (
    <InternalTableContext.Provider value={state}>
      <table {...gridProps} ref={ref} className={props.className ?? 'react-aria-Table'} style={props.style}>
        <TableRowGroup
          type="thead"
          className={collection.head.props.className ?? 'react-aria-TableHeader'}
          style={collection.head.props.style}>
          {headerRows}
        </TableRowGroup>
        <TableRowGroup
          type="tbody"
          className={collection.body.props.className ?? 'react-aria-TableBody'}
          style={collection.body.props.style}>
          {bodyRows}
        </TableRowGroup>
        {portal}
      </table>
    </InternalTableContext.Provider>
  );
}

export function TableHeader(props) {
  let children = useCachedChildren({
    children: props.children,
    items: props.columns
  });

  // @ts-ignore
  return <node type="head" multiple={props}>{children}</node>;
}

export function Column(props) {
  let children = useCachedChildren({
    children: props.title || props.childColumns ? props.children : null,
    items: props.childColumns
  });

  // @ts-ignore
  return useMemo(() => <node type="column" multiple={{...props, rendered: props.title ?? props.children}}>{children}</node>, [props, children]);
}

export function SelectionColumn(props) {
  // @ts-ignore
  return useMemo(() => <node type="column" multiple={{...props, isSelectionCell: true, rendered: props.children}} />, [props]);
}

export function TableBody(props) {
  let children = useCachedChildren(props);

  // @ts-ignore
  return <node type="body" multiple={props}>{children}</node>;
}

export function Row(props) {
  // TODO: function child based on columns??
  let children = useCachedChildren({
    children: props.children,
    items: props.columns
  });

  // @ts-ignore
  return <node type="item" multiple={props}>{children}</node>;
}

export function Cell(props) {
  // @ts-ignore
  return useMemo(() => <node type="cell" multiple={{...props, rendered: props.children}} />, [props]);
}

function TableRowGroup({type: Element, className, style, children}) {
  let {rowGroupProps} = useTableRowGroup();
  return (
    <Element {...rowGroupProps} style={style} className={className}>
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
    items: item.childNodes,
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
  let {rowProps, isPressed} = useTableRow(
    {
      node: item
    },
    state,
    ref
  );
  let {isFocused, isFocusVisible, focusProps} = useFocusRing();

  let {checkboxProps} = useTableSelectionCheckbox(
    {key: item.key},
    state
  );

  let props: RowProps = item.props;
  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-Row',
    values: {
      isFocused,
      isFocusVisible,
      isPressed
    }
  });

  let cells = useCachedChildren({
    items: item.childNodes,
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
      {...mergeProps(rowProps, focusProps)}
      {...renderProps}
      ref={ref}
      data-focused={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-pressed={isPressed || undefined}>
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
