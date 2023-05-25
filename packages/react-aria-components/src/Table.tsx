import {AriaLabelingProps} from '@react-types/shared';
import {BaseCollection, CollectionContext, CollectionProps, CollectionRendererContext, ItemRenderProps, NodeValue, useCachedChildren, useCollection, useCollectionChildren, useCollectionItemRef} from './Collection';
import {buildHeaderRows} from '@react-stately/table';
import {ButtonContext} from './Button';
import {CheckboxContext} from './Checkbox';
import {ContextValue, defaultSlot, forwardRefType, Provider, RenderProps, SlotProps, StyleProps, StyleRenderProps, useContextProps, useRenderProps} from './utils';
import {DisabledBehavior, DraggableCollectionState, DroppableCollectionState, Node, SelectionBehavior, SelectionMode, SortDirection, TableState, useTableState} from 'react-stately';
import {DragAndDropHooks, DropIndicator, DropIndicatorContext, DropIndicatorProps} from './useDragAndDrop';
import {DraggableItemResult, DragPreviewRenderer, DropIndicatorAria, DroppableCollectionResult, FocusScope, ListKeyboardDelegate, mergeProps, useFocusRing, useHover, useTable, useTableCell, useTableColumnHeader, useTableHeaderRow, useTableRow, useTableRowGroup, useTableSelectAllCheckbox, useTableSelectionCheckbox, useVisuallyHidden} from 'react-aria';
import {filterDOMProps, useObjectRef} from '@react-aria/utils';
import {GridNode} from '@react-types/grid';
import {TableCollection as ITableCollection, TableProps as SharedTableProps} from '@react-types/table';
import React, {createContext, ForwardedRef, forwardRef, Key, ReactElement, ReactNode, RefObject, useCallback, useContext, useEffect, useMemo, useRef} from 'react';

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
      return node.nextKey ?? null;
    }

    return super.getKeyAfter(key);
  }

  getKeyBefore(key: Key) {
    let node = this.getItem(key);
    if (node?.type === 'column') {
      return node.prevKey ?? null;
    }

    let k = super.getKeyBefore(key);
    if (k != null && this.getItem(k)?.type === 'tablebody') {
      return null;
    }

    return k;
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

  getTextValue(key: Key): string {
    let row = this.getItem(key);
    if (!row) {
      return '';
    }

    // If the row has a textValue, use that.
    if (row.textValue) {
      return row.textValue;
    }

    // Otherwise combine the text of each of the row header columns.
    let rowHeaderColumnKeys = this.rowHeaderColumnKeys;
    let text: string[] = [];
    for (let cell of this.getChildren(key)) {
      let column = this.columns[cell.index!];
      if (rowHeaderColumnKeys.has(column.key) && cell.textValue) {
        text.push(cell.textValue);
      }

      if (text.length === rowHeaderColumnKeys.size) {
        break;
      }
    }

    return text.join(' ');
  }
}

interface InternalTableContextValue {
  state: TableState<unknown>,
  dragAndDropHooks?: DragAndDropHooks,
  dragState?: DraggableCollectionState,
  dropState?: DroppableCollectionState
}

export const TableContext = createContext<ContextValue<TableProps, HTMLTableElement>>(null);
const InternalTableContext = createContext<InternalTableContextValue | null>(null);

export interface TableRenderProps {
  /**
   * Whether the table is currently focused.
   * @selector [data-focused]
   */
  isFocused: boolean,
  /**
   * Whether the table is currently keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean,
  /**
   * Whether the table is currently the active drop target.
   * @selector [data-drop-target]
   */
  isDropTarget: boolean
}

export interface TableProps extends Omit<SharedTableProps<any>, 'children'>, StyleRenderProps<TableRenderProps>, SlotProps, AriaLabelingProps {
  /** The elements that make up the table. Includes the TableHeader, TableBody, Columns, and Rows. */
  children?: ReactNode,
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
  onCellAction?: (key: Key) => void,
  /** The drag and drop hooks returned by `useDragAndDrop` used to enable drag and drop behavior for the Table. */
  dragAndDropHooks?: DragAndDropHooks
}

function Table(props: TableProps, ref: ForwardedRef<HTMLTableElement>) {
  [props, ref] = useContextProps(props, ref, TableContext);
  let initialCollection = useMemo(() => new TableCollection<any>(), []);
  let {portal, collection} = useCollection(props, initialCollection);
  let state = useTableState({
    ...props,
    collection,
    children: undefined
  });

  let {gridProps} = useTable(props, state, ref);

  let {dragAndDropHooks} = props;
  let selectionManager = state.selectionManager;
  let isListDraggable = !!dragAndDropHooks?.useDraggableCollectionState;
  let isListDroppable = !!dragAndDropHooks?.useDroppableCollectionState;
  let dragHooksProvided = useRef(isListDraggable);
  let dropHooksProvided = useRef(isListDroppable);
  if (dragHooksProvided.current !== isListDraggable) {
    console.warn('Drag hooks were provided during one render, but not another. This should be avoided as it may produce unexpected behavior.');
  }
  if (dropHooksProvided.current !== isListDroppable) {
    console.warn('Drop hooks were provided during one render, but not another. This should be avoided as it may produce unexpected behavior.');
  }

  let dragState: DraggableCollectionState | undefined = undefined;
  let dropState: DroppableCollectionState | undefined = undefined;
  let droppableCollection: DroppableCollectionResult | undefined = undefined;
  let isRootDropTarget = false;
  let dragPreview: JSX.Element | null = null;
  let preview = useRef<DragPreviewRenderer>(null);

  if (isListDraggable && dragAndDropHooks) {
    dragState = dragAndDropHooks.useDraggableCollectionState!({
      collection,
      selectionManager,
      preview: dragAndDropHooks.renderDragPreview ? preview : undefined
    });
    dragAndDropHooks.useDraggableCollection!({}, dragState, ref);

    let DragPreview = dragAndDropHooks.DragPreview!;
    dragPreview = dragAndDropHooks.renderDragPreview
      ? <DragPreview ref={preview}>{dragAndDropHooks.renderDragPreview}</DragPreview>
      : null;
  }

  if (isListDroppable && dragAndDropHooks) {
    dropState = dragAndDropHooks.useDroppableCollectionState!({
      collection,
      selectionManager
    });

    let keyboardDelegate = new ListKeyboardDelegate(
      collection,
      selectionManager.disabledBehavior === 'selection' ? new Set() : selectionManager.disabledKeys,
      ref
    );
    let dropTargetDelegate = dragAndDropHooks.dropTargetDelegate || new dragAndDropHooks.ListDropTargetDelegate(collection, ref);
    droppableCollection = dragAndDropHooks.useDroppableCollection!({
      keyboardDelegate,
      dropTargetDelegate
    }, dropState, ref);

    isRootDropTarget = dropState.isDropTarget({type: 'root'});
  }

  let {focusProps, isFocused, isFocusVisible} = useFocusRing();
  let renderProps = useRenderProps({
    className: props.className,
    style: props.style,
    defaultClassName: 'react-aria-Table',
    values: {
      isDropTarget: isRootDropTarget,
      isFocused,
      isFocusVisible
    }
  });

  let {selectionBehavior, selectionMode, disallowEmptySelection} = state.selectionManager;
  let ctx = useMemo(() => ({
    selectionBehavior: selectionMode === 'none' ? null : selectionBehavior,
    selectionMode,
    disallowEmptySelection,
    allowsDragging: isListDraggable
  }), [selectionBehavior, selectionMode, disallowEmptySelection, isListDraggable]);

  return (
    <>
      <Provider
        values={[
          [InternalTableContext, {state, dragAndDropHooks, dragState, dropState}],
          [DropIndicatorContext, {render: TableDropIndicatorWrapper}]
        ]}>
        <FocusScope>
          <table
            {...filterDOMProps(props)}
            {...renderProps}
            {...mergeProps(gridProps, focusProps, droppableCollection?.collectionProps)}
            ref={ref}
            slot={props.slot}
            data-drop-target={isRootDropTarget || undefined}
            data-focused={isFocused || undefined}
            data-focus-visible={isFocusVisible || undefined}>
            <TableHeaderRowGroup collection={collection} />
            <TableBodyRowGroup collection={collection} isDroppable={isListDroppable} />
          </table>
        </FocusScope>
        {dragPreview}
      </Provider>
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
const _Table = forwardRef(Table);
export {_Table as Table};

export interface TableOptionsContextValue {
  /** The type of selection that is allowed in the table. */
  selectionMode: SelectionMode,
  /** The selection behavior for the table. If selectionMode is `"none"`, this will be `null`. */
  selectionBehavior: SelectionBehavior | null,
  /** Whether the table allows empty selection. */
  disallowEmptySelection: boolean,
  /** Whether the table allows rows to be dragged. */
  allowsDragging: boolean
}

const TableOptionsContext = createContext<TableOptionsContextValue | null>(null);

/**
 * Returns options from the parent `<Table>` component.
 */
export function useTableOptions(): TableOptionsContextValue {
  return useContext(TableOptionsContext)!;
}

export interface TableHeaderProps<T> extends StyleProps {
  /** A list of table columns. */
  columns?: T[],
  /** A list of `Column(s)` or a function. If the latter, a list of columns must be provided using the `columns` prop. */
  children?: ReactNode | ((item: T) => ReactElement)
}

function TableHeader<T extends object>(props: TableHeaderProps<T>, ref: ForwardedRef<HTMLTableSectionElement>) {
  let children = useCollectionChildren({
    children: props.children,
    items: props.columns
  });

  let renderer = typeof props.children === 'function' ? props.children : null;
  return (
    <CollectionRendererContext.Provider value={renderer}>
      {/* @ts-ignore */}
      <tableheader ref={useCollectionItemRef(props, ref)}>{children}</tableheader>
    </CollectionRendererContext.Provider>
  );
}

/**
 * A header within a `<Table>`, containing the table columns.
 */
const _TableHeader = /*#__PURE__*/ (forwardRef as forwardRefType)(TableHeader);
export {_TableHeader as TableHeader};

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
  sortDirection?: SortDirection
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

function Column<T extends object>(props: ColumnProps<T>, ref: ForwardedRef<HTMLTableCellElement>): JSX.Element {
  let render = useContext(CollectionRendererContext);
  let childColumns = typeof render === 'function' ? render : props.children;
  let children = useCollectionChildren({
    children: (props.title || props.childColumns) ? childColumns : null,
    items: props.childColumns
  });

  // @ts-ignore
  return <column ref={useCollectionItemRef(props, ref, props.title ?? props.children)}>{children}</column>;
}

/**
 * A column within a `<Table>`.
 */
const _Column = /*#__PURE__*/ (forwardRef as forwardRefType)(Column);
export {_Column as Column};

export interface TableBodyRenderProps {
  /**
   * Whether the table body has no rows and should display its empty state.
   * @selector [data-empty]
   */
  isEmpty: boolean
}

export interface TableBodyProps<T> extends CollectionProps<T>, StyleRenderProps<TableBodyRenderProps> {
  /** Provides content to display when there are no rows in the table. */
  renderEmptyState?: () => ReactNode
}

function TableBody<T extends object>(props: TableBodyProps<T>, ref: ForwardedRef<HTMLTableSectionElement>) {
  let children = useCollectionChildren(props);

  // @ts-ignore
  return <tablebody ref={useCollectionItemRef(props, ref)}>{children}</tablebody>;
}

/**
 * The body of a `<Table>`, containing the table rows.
 */
const _TableBody = /*#__PURE__*/ (forwardRef as forwardRefType)(TableBody);
export {_TableBody as TableBody};

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

function Row<T extends object>(props: RowProps<T>, ref: ForwardedRef<HTMLTableRowElement>) {
  let children = useCollectionChildren({
    children: props.children,
    items: props.columns,
    idScope: props.id
  });

  let ctx = useMemo(() => ({idScope: props.id}), [props.id]);

  return (
    // @ts-ignore
    <item ref={useCollectionItemRef(props, ref)}>
      <CollectionContext.Provider value={ctx}>
        {children}
      </CollectionContext.Provider>
      {/* @ts-ignore */}
    </item>
  );
}

/**
 * A row within a `<Table>`.
 */
const _Row = /*#__PURE__*/ (forwardRef as forwardRefType)(Row);
export {_Row as Row};

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

function Cell(props: CellProps, ref: ForwardedRef<HTMLTableCellElement>): JSX.Element {
  // @ts-ignore
  return <cell ref={useCollectionItemRef(props, ref, props.children)} />;
}

/**
 * A cell within a table row.
 */
const _Cell = forwardRef(Cell);
export {_Cell as Cell};

function TableHeaderRowGroup<T>({collection}: {collection: TableCollection<T>}) {
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

  let {rowGroupProps} = useTableRowGroup();
  return (
    <thead
      {...filterDOMProps(collection.head.props)}
      {...rowGroupProps}
      ref={collection.head.props.ref}
      className={collection.head.props.className ?? 'react-aria-TableHeader'}
      style={collection.head.props.style}>
      {headerRows}
    </thead>
  );
}

function TableBodyRowGroup<T>({collection, isDroppable}: {collection: TableCollection<T>, isDroppable: boolean}) {
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

  let props: TableBodyProps<T> = collection.body.props;
  let renderProps = useRenderProps({
    ...props,
    id: undefined,
    children: undefined,
    defaultClassName: 'react-aria-TableBody',
    values: {
      isEmpty: collection.size === 0
    }
  });

  let emptyState;
  if (collection.size === 0 && props.renderEmptyState) {
    emptyState = (
      <tr role="row">
        <td role="gridcell" colSpan={collection.columnCount}>
          {props.renderEmptyState()}
        </td>
      </tr>
    );
  }

  let {rowGroupProps} = useTableRowGroup();
  return (
    <tbody
      {...mergeProps(filterDOMProps(props as any), rowGroupProps)}
      {...renderProps}
      ref={collection.body.props.ref}
      data-empty={collection.size === 0 || undefined}>
      {isDroppable && <RootDropIndicator />}
      {bodyRows}
      {emptyState}
    </tbody>
  );
}

function TableHeaderRow<T>({item}: {item: GridNode<T>}) {
  let ref = useRef<HTMLTableRowElement>(null);
  let {state} = useContext(InternalTableContext)!;
  let {rowProps} = useTableHeaderRow({node: item}, state, ref);
  let {checkboxProps} = useTableSelectAllCheckbox(state);

  let cells = useCachedChildren({
    items: state.collection.getChildren!(item.key),
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
  let ref = useObjectRef<HTMLTableHeaderCellElement>(column.props.ref);
  let {state} = useContext(InternalTableContext)!;
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
        ? state.sortDescriptor.direction
        : undefined
    }
  });

  return (
    <th
      {...mergeProps(filterDOMProps(props as any), columnHeaderProps, focusProps)}
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
  let ref = useObjectRef<HTMLTableRowElement>(item.props.ref);
  let {state, dragAndDropHooks, dragState, dropState} = useContext(InternalTableContext)!;
  let {rowProps, ...states} = useTableRow(
    {
      node: item,
      shouldSelectOnPressUp: !!dragState
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

  let draggableItem: DraggableItemResult | undefined = undefined;
  if (dragState && dragAndDropHooks) {
    draggableItem = dragAndDropHooks.useDraggableItem!({key: item.key, hasDragButton: true}, dragState);
  }

  let dropIndicator: DropIndicatorAria | undefined = undefined;
  let dropIndicatorRef = useRef<HTMLDivElement>(null);
  let {visuallyHiddenProps} = useVisuallyHidden();
  if (dropState && dragAndDropHooks) {
    dropIndicator = dragAndDropHooks.useDropIndicator!({
      target: {type: 'item', key: item.key, dropPosition: 'on'}
    }, dropState, dropIndicatorRef);
  }

  let renderDropIndicator = dragAndDropHooks?.renderDropIndicator || (target => <DropIndicator target={target} />);
  let dragButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (dragState && !dragButtonRef.current) {
      console.warn('Draggable items in a Table must contain a <Button slot="drag"> element so that keyboard and screen reader users can drag them.');
    }
  // eslint-disable-next-line
  }, []);

  let props = item.props as RowProps<unknown>;
  let isDragging = dragState && dragState.isDragging(item.key);
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
      selectionBehavior: state.selectionManager.selectionBehavior,
      isDragging,
      isDropTarget: dropIndicator?.isDropTarget
    }
  });

  let cells = useCachedChildren({
    items: state.collection.getChildren!(item.key),
    children: (item: Node<unknown>) => {
      switch (item.type) {
        case 'cell':
          return <TableCell cell={item} />;
        default:
          throw new Error('Unsupported node type in Row: ' + item.type);
      }
    }
  });

  return (
    <>
      {dragAndDropHooks?.useDropIndicator &&
        renderDropIndicator({type: 'item', key: item.key, dropPosition: 'before'})
      }
      {dropIndicator && !dropIndicator.isHidden && (
        <tr role="row" style={{height: 0}}>
          <td role="gridcell" colSpan={state.collection.columnCount} style={{padding: 0}}>
            <div role="button" {...visuallyHiddenProps} {...dropIndicator.dropIndicatorProps} ref={dropIndicatorRef} />
          </td>
        </tr>
      )}
      <tr
        {...mergeProps(filterDOMProps(props as any), rowProps, focusProps, hoverProps, draggableItem?.dragProps)}
        {...renderProps}
        ref={ref}
        data-hovered={isHovered || undefined}
        data-focused={states.isFocused || undefined}
        data-focus-visible={isFocusVisible || undefined}
        data-pressed={states.isPressed || undefined}
        data-dragging={isDragging || undefined}
        data-drop-target={dropIndicator?.isDropTarget || undefined}>
        <Provider
          values={[
            [CheckboxContext, {
              slots: {
                selection: checkboxProps
              }
            }],
            [ButtonContext, {
              slots: {
                [defaultSlot]: {},
                drag: {
                  ...draggableItem?.dragButtonProps,
                  ref: dragButtonRef,
                  style: {
                    pointerEvents: 'none'
                  }
                }
              }
            }]
          ]}>
          {cells}
        </Provider>
      </tr>
      {dragAndDropHooks?.useDropIndicator && state.collection.getKeyAfter(item.key) == null &&
        renderDropIndicator({type: 'item', key: item.key, dropPosition: 'after'})
      }
    </>
  );
}

function TableCell<T>({cell}: {cell: GridNode<T>}) {
  let ref = useObjectRef<HTMLTableCellElement>(cell.props.ref);
  let {state, dragState} = useContext(InternalTableContext)!;

  // @ts-ignore
  cell.column = state.collection.columns[cell.index];

  let {gridCellProps, isPressed} = useTableCell({
    node: cell,
    shouldSelectOnPressUp: !!dragState
  }, state, ref);
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
      {...mergeProps(filterDOMProps(props as any), gridCellProps, focusProps)}
      {...renderProps}
      ref={ref}
      data-focused={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-pressed={isPressed || undefined}>
      {renderProps.children}
    </td>
  );
}

function TableDropIndicatorWrapper(props: DropIndicatorProps, ref: ForwardedRef<HTMLElement>) {
  ref = useObjectRef(ref);
  let {dragAndDropHooks, dropState} = useContext(InternalTableContext)!;
  let buttonRef = useRef<HTMLDivElement>(null);
  let {dropIndicatorProps, isHidden, isDropTarget} = dragAndDropHooks!.useDropIndicator!(
    props,
    dropState!,
    buttonRef
  );

  if (isHidden) {
    return null;
  }

  return (
    <TableDropIndicatorForwardRef {...props} dropIndicatorProps={dropIndicatorProps} isDropTarget={isDropTarget} buttonRef={buttonRef} ref={ref} />
  );
}

interface TableDropIndicatorProps extends DropIndicatorProps {
  dropIndicatorProps: React.HTMLAttributes<HTMLElement>,
  isDropTarget: boolean,
  buttonRef: RefObject<HTMLDivElement>
}

function TableDropIndicator(props: TableDropIndicatorProps, ref: ForwardedRef<HTMLElement>) {
  let {
    dropIndicatorProps,
    isDropTarget,
    buttonRef,
    ...otherProps
  } = props;

  let {state} = useContext(InternalTableContext)!;
  let {visuallyHiddenProps} = useVisuallyHidden();
  let renderProps = useRenderProps({
    ...otherProps,
    defaultClassName: 'react-aria-DropIndicator',
    values: {
      isDropTarget
    }
  });

  return (
    <tr
      {...filterDOMProps(props as any)}
      {...renderProps}
      role="row"
      ref={ref as RefObject<HTMLTableRowElement>}
      data-drop-target={isDropTarget || undefined}>
      <td
        role="gridcell"
        colSpan={state.collection.columnCount}
        style={{padding: 0}}>
        <div {...visuallyHiddenProps} role="button" {...dropIndicatorProps} ref={buttonRef} />
      </td>
    </tr>
  );
}

const TableDropIndicatorForwardRef = forwardRef(TableDropIndicator);

function RootDropIndicator() {
  let {state, dragAndDropHooks, dropState} = useContext(InternalTableContext)!;
  let ref = useRef<HTMLDivElement>(null);
  let {dropIndicatorProps} = dragAndDropHooks!.useDropIndicator!({
    target: {type: 'root'}
  }, dropState!, ref);
  let isDropTarget = dropState!.isDropTarget({type: 'root'});
  let {visuallyHiddenProps} = useVisuallyHidden();

  if (!isDropTarget && dropIndicatorProps['aria-hidden']) {
    return null;
  }

  return (
    <tr
      role="row"
      aria-hidden={dropIndicatorProps['aria-hidden']}
      style={{height: 0}}>
      <td
        role="gridcell"
        colSpan={state.collection.columnCount}
        style={{padding: 0}}>
        <div role="button" {...visuallyHiddenProps} {...dropIndicatorProps} ref={ref} />
      </td>
    </tr>
  );
}
