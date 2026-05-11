import {
  AriaLabelingProps,
  GlobalDOMAttributes,
  HoverEvents,
  Key,
  LinkDOMProps,
  PressEvents,
  RefObject
} from '@react-types/shared';
import {
  BaseCollection,
  CollectionNode,
  FilterableNode,
  LoaderNode
} from 'react-aria/private/collections/BaseCollection';
import {buildHeaderRows} from 'react-stately/private/table/TableCollection';
import {ButtonContext} from './Button';
import {CheckboxContext, CheckboxFieldContext} from './Checkbox';
import {
  ClassNameOrFunction,
  ContextValue,
  DEFAULT_SLOT,
  dom,
  DOMProps,
  DOMRenderProps,
  Provider,
  RenderProps,
  SlotProps,
  StyleProps,
  StyleRenderProps,
  useContextProps,
  useRenderProps
} from './utils';
import {Collection} from 'react-aria/Collection';
import {
  CollectionBuilder,
  createBranchComponent,
  createLeafComponent
} from 'react-aria/CollectionBuilder';
import {
  CollectionProps,
  CollectionRendererContext,
  DefaultCollectionRenderer,
  ItemRenderProps
} from './Collection';
import {ColumnSize, ColumnStaticSize} from 'react-stately/useTableState';
import {
  DisabledBehavior,
  Node,
  SelectionBehavior,
  SelectionMode,
  SortDirection
} from '@react-types/shared';
import {
  DragAndDropContext,
  DropIndicatorContext,
  DropIndicatorProps,
  useDndPersistedKeys,
  useRenderDropIndicator
} from './DragAndDrop';
import {DragAndDropHooks} from './useDragAndDrop';
import {DraggableCollectionState} from 'react-stately/useDraggableCollectionState';
import {DraggableItemResult} from 'react-aria/useDraggableCollection';
import {DragPreviewRenderer} from '@react-types/shared';
import {DropIndicatorAria, DroppableCollectionResult} from 'react-aria/useDroppableCollection';
import {DroppableCollectionState} from 'react-stately/useDroppableCollectionState';
import {
  FieldInputContext,
  SelectableCollectionContext,
  SelectableCollectionContextValue
} from './Autocomplete';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {FocusScope} from 'react-aria/FocusScope';
import {GridNode} from 'react-stately/private/grid/GridCollection';
import {inertValue} from 'react-aria/private/utils/inertValue';
import intlMessages from '../intl/*.json';
import {isScrollable} from 'react-aria/private/utils/isScrollable';
import {ITableCollection} from 'react-stately/private/table/TableCollection';
import {ListKeyboardDelegate} from 'react-aria/ListKeyboardDelegate';
import {
  LoadMoreSentinelProps,
  useLoadMoreSentinel
} from 'react-aria/private/utils/useLoadMoreSentinel';
import {mergeProps} from 'react-aria/mergeProps';
import {mergeRefs} from 'react-aria/mergeRefs';
import {MultipleSelectionState} from 'react-stately/useMultipleSelectionState';
import React, {
  createContext,
  ForwardedRef,
  forwardRef,
  JSX,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import ReactDOM from 'react-dom';
import {SelectionIndicatorContext} from './SelectionIndicator';
import {SharedElementTransition} from './SharedElementTransition';
import {
  TableProps as SharedTableProps,
  TableState,
  UNSTABLE_useFilteredTableState,
  useTableColumnResizeState,
  useTableState
} from 'react-stately/useTableState';
import {TableColumnResizeState} from 'react-stately/useTableState';
import {TreeDropTargetDelegate} from './TreeDropTargetDelegate';
import {useCachedChildren} from 'react-aria/private/collections/useCachedChildren';
import {useControlledState} from 'react-stately/useControlledState';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useHover} from 'react-aria/useHover';
import {useLayoutEffect} from 'react-aria/private/utils/useLayoutEffect';
// @ts-ignore
import {useLocale} from 'react-aria/I18nProvider';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';
import {useMultipleSelectionState} from 'react-stately/useMultipleSelectionState';
import {useObjectRef} from 'react-aria/useObjectRef';
import {useResizeObserver} from 'react-aria/private/utils/useResizeObserver';
import {
  useTable,
  useTableCell,
  useTableColumnHeader,
  useTableColumnResize,
  useTableHeaderRow,
  useTableRow,
  useTableRowGroup,
  useTableSelectAllCheckbox,
  useTableSelectionCheckbox
} from 'react-aria/useTable';
import {useVisuallyHidden} from 'react-aria/VisuallyHidden';

class TableCollection<T> extends BaseCollection<T> implements ITableCollection<T> {
  headerRows: GridNode<T>[] = [];
  columns: GridNode<T>[] = [];
  rows: GridNode<T>[] = [];
  rowHeaderColumnKeys: Set<Key> = new Set();
  head = new TableHeaderNode<T>(-1);
  columnsDirty = true;
  expandedKeys: Set<Key> = new Set();

  withExpandedKeys(expandedKeys: Set<Key>) {
    let collection = this.clone();
    collection.expandedKeys = expandedKeys;
    collection.frozen = this.frozen;
    collection.rows = Array.from(collection.getRows());
    return collection;
  }

  addNode(node: CollectionNode<T>) {
    super.addNode(node);

    this.columnsDirty ||= node.type === 'column';
    if (node.type === 'tableheader') {
      this.head = node;
    }
  }

  private getRows(): GridNode<T>[] {
    let rows: GridNode<T>[] = [];
    for (let child of this) {
      if (child.type === 'tablebody' || child.type === 'tablefooter') {
        rows.push(...this.getChildren(child.key));
      }
    }
    return rows;
  }

  // backward compatibility
  get body() {
    for (let child of this) {
      if (child.type === 'tablebody') {
        return child;
      }
    }
    return new TableBodyNode<T>(-2);
  }

  commit(firstKey: Key, lastKey: Key, isSSR = false) {
    this.updateColumns(isSSR);

    this.firstKey = firstKey;
    this.lastKey = lastKey;
    this.rows = [];
    for (let row of this.getRows()) {
      let lastChildKey = (row as CollectionNode<T>).lastChildKey;
      if (lastChildKey != null) {
        let lastCell = this.getItem(lastChildKey) as GridNode<T> | null;
        while (lastCell && lastCell.type !== 'cell') {
          lastCell =
            lastCell.prevKey != null
              ? (this.getItem(lastCell.prevKey) as GridNode<T> | null)
              : null;
        }
        if (lastCell) {
          let numberOfCellsInRow = (lastCell.colIndex ?? lastCell.index) + (lastCell.colSpan ?? 1);
          if (numberOfCellsInRow !== this.columns.length && !isSSR) {
            throw new Error(
              `Cell count must match column count. Found ${numberOfCellsInRow} cells and ${this.columns.length} columns.`
            );
          }
        }
      }
      this.rows.push(row);
    }

    super.commit(firstKey, lastKey, isSSR);
  }

  private updateColumns(isSSR: boolean) {
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
    if (this.rowHeaderColumnKeys.size === 0 && this.columns.length > 0 && !isSSR) {
      throw new Error(
        'A table must have at least one Column with the isRowHeader prop set to true'
      );
    }
  }

  get columnCount() {
    return this.columns.length;
  }

  *[Symbol.iterator]() {
    let key = this.firstKey;
    while (key != null) {
      let node = this.getItem(key);
      if (node) {
        yield node;
      }
      key = node?.nextKey ?? null;
    }
  }

  getFirstKey() {
    for (let child of this) {
      if (child.type === 'tablebody') {
        return child.firstChildKey ?? null;
      }
    }
    return null;
  }

  getLastKey() {
    let key = this.lastKey;
    if (key == null) {
      return null;
    }

    let node = this.getItem(key) as CollectionNode<T>;

    while (
      node?.lastChildKey != null &&
      (node.type !== 'item' || this.expandedKeys.has(node.key))
    ) {
      node = this.getItem(node.lastChildKey) as CollectionNode<T>;
    }

    return node?.key;
  }

  getKeyAfter(key: Key) {
    let node = this.getItem(key) as CollectionNode<T>;
    if (node?.type === 'column') {
      return node.nextKey ?? null;
    }

    if (!node) {
      return null;
    }

    // If this is an expanded item, return the first child item if any.
    if (node.type === 'item' && node.firstChildKey != null && this.expandedKeys.has(node.key)) {
      let child = this.getItem(node.firstChildKey) as CollectionNode<T> | null;
      while (child) {
        if (child.type === 'item') {
          return child.key;
        }

        child = child.nextKey != null ? (this.getItem(child.nextKey) as CollectionNode<T>) : null;
      }
    }

    return super.getKeyAfter(key);
  }

  getKeyBefore(key: Key) {
    let node = this.getItem(key) as CollectionNode<T>;
    if (node?.type === 'column') {
      return node.prevKey ?? null;
    }

    if (!node) {
      return null;
    }

    let k: Key | null = null;
    if (node.prevKey != null) {
      node = this.getItem(node.prevKey) as CollectionNode<T>;

      // Traverse to the deepest expanded child.
      while (
        node &&
        (node.type !== 'item' || this.expandedKeys.has(node.key)) &&
        node.lastChildKey != null
      ) {
        node = this.getItem(node.lastChildKey) as CollectionNode<T>;
      }

      k = node?.key ?? null;
    }

    if (k == null) {
      k = node.parentKey;
    }

    if (k != null && this.getItem(k)?.type === 'tableheader') {
      return null;
    }

    return k;
  }

  getChildren(key: Key): Iterable<Node<T>> {
    let item = this.getItem(key);
    if (!item) {
      for (let row of this.headerRows) {
        if (row.key === key) {
          return row.childNodes;
        }
      }
    }

    // Flatten all rows into the body.
    let self = this;
    if (item?.type === 'tablebody' || item?.type === 'tablefooter') {
      return {
        *[Symbol.iterator]() {
          let firstKey = item.firstChildKey;
          let node: Node<T> | null = firstKey != null ? self.getItem(firstKey) : null;

          while (node) {
            yield node as Node<T>;
            let key = self.getKeyAfter(node.key);
            node = key != null ? self.getItem(key) : null;
            if (node && node.parentKey === item.parentKey) {
              break;
            }
          }
        }
      };
    }

    return {
      *[Symbol.iterator]() {
        let parent = self.getItem(key) as CollectionNode<T> | null;
        let node =
          parent?.firstChildKey != null
            ? (self.getItem(parent.firstChildKey) as CollectionNode<T> | null)
            : null;
        while (node) {
          yield node as Node<T>;
          node =
            node.nextKey != null ? (self.getItem(node.nextKey) as CollectionNode<T> | null) : null;

          // Return only cells as children of rows (nested rows are flattened into the body).
          if (parent?.type === 'item' && node?.type !== 'cell') {
            break;
          }
        }
      }
    };
  }

  clone() {
    let collection = super.clone();
    collection.headerRows = this.headerRows;
    collection.columns = this.columns;
    collection.rows = this.rows;
    collection.rowHeaderColumnKeys = this.rowHeaderColumnKeys;
    collection.head = this.head;
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

interface ResizableTableContainerContextValue {
  tableWidth: number;
  tableRef: RefObject<HTMLTableElement | null>;
  scrollRef: RefObject<HTMLElement | null>;
  // Dependency inject useTableColumnResizeState so it doesn't affect bundle size unless you're using ResizableTableContainer.
  useTableColumnResizeState: typeof useTableColumnResizeState;
  onResizeStart?: (widths: Map<Key, ColumnSize>) => void;
  onResize?: (widths: Map<Key, ColumnSize>) => void;
  onResizeEnd?: (widths: Map<Key, ColumnSize>) => void;
}

const ResizableTableContainerContext = createContext<ResizableTableContainerContextValue | null>(
  null
);

export interface ResizableTableContainerProps
  extends DOMProps, DOMRenderProps<'div', undefined>, GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element.
   * @default 'react-aria-ResizableTableContainer'
   */
  className?: string;
  /**
   * Handler that is called when a user starts a column resize.
   */
  onResizeStart?: (widths: Map<Key, ColumnSize>) => void;
  /**
   * Handler that is called when a user performs a column resize.
   * Can be used with the width property on columns to put the column widths into
   * a controlled state.
   */
  onResize?: (widths: Map<Key, ColumnSize>) => void;
  /**
   * Handler that is called after a user performs a column resize.
   * Can be used to store the widths of columns for another future session.
   */
  onResizeEnd?: (widths: Map<Key, ColumnSize>) => void;
}

export const ResizableTableContainer = forwardRef(function ResizableTableContainer(
  props: ResizableTableContainerProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  let containerRef = useObjectRef(ref);
  let tableRef = useRef<HTMLTableElement>(null);
  let scrollRef = useRef<HTMLElement | null>(null);
  let [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    // Walk up the DOM from the Table to the ResizableTableContainer and stop
    // when we reach the first scrollable element. This is what we'll measure
    // to determine column widths (important due to width of scrollbars).
    // This will usually be the ResizableTableContainer for native tables, and
    // the Table itself for virtualized tables.
    let table = tableRef.current as HTMLElement | null;
    while (table && table !== containerRef.current && !isScrollable(table)) {
      table = table.parentElement;
    }
    scrollRef.current = table;
  }, [containerRef]);

  useResizeObserver({
    ref: scrollRef,
    box: 'border-box',
    onResize() {
      setWidth(scrollRef.current?.clientWidth ?? 0);
    }
  });

  useLayoutEffect(() => {
    setWidth(scrollRef.current?.clientWidth ?? 0);
  }, []);

  let ctx = useMemo(
    () => ({
      tableRef,
      scrollRef,
      tableWidth: width,
      useTableColumnResizeState,
      onResizeStart: props.onResizeStart,
      onResize: props.onResize,
      onResizeEnd: props.onResizeEnd
    }),
    [tableRef, width, props.onResizeStart, props.onResize, props.onResizeEnd]
  );

  return (
    <dom.div
      render={props.render}
      {...filterDOMProps(props, {global: true})}
      ref={containerRef}
      className={props.className || 'react-aria-ResizableTableContainer'}
      style={props.style}
      onScroll={props.onScroll}>
      <ResizableTableContainerContext.Provider value={ctx}>
        {props.children}
      </ResizableTableContainerContext.Provider>
    </dom.div>
  );
});

export const TableContext =
  createContext<ContextValue<TableProps, HTMLTableElement | HTMLDivElement>>(null);
export const TableStateContext = createContext<TableState<any> | null>(null);
export const TableColumnResizeStateContext = createContext<TableColumnResizeState<unknown> | null>(
  null
);

export interface TableRenderProps {
  /**
   * Whether the table is currently focused.
   * @selector [data-focused]
   */
  isFocused: boolean;
  /**
   * Whether the table is currently keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean;
  /**
   * Whether the table is currently the active drop target.
   * @selector [data-drop-target]
   */
  isDropTarget: boolean;
  /**
   * State of the table.
   */
  state: TableState<unknown>;
}

export interface TableProps
  extends
    Omit<SharedTableProps<any>, 'children'>,
    StyleRenderProps<TableRenderProps, 'table' | 'div'>,
    SlotProps,
    AriaLabelingProps,
    GlobalDOMAttributes<HTMLTableElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state.
   * @default 'react-aria-Table'
   */
  className?: ClassNameOrFunction<TableRenderProps>;
  /** The elements that make up the table. Includes the TableHeader, TableBody, Columns, and Rows. */
  children?: ReactNode;
  /**
   * How multiple selection should behave in the collection.
   * @default "toggle"
   */
  selectionBehavior?: SelectionBehavior;
  /**
   * Whether `disabledKeys` applies to all interactions, or only selection.
   * @default "all"
   */
  disabledBehavior?: DisabledBehavior;
  /** Handler that is called when a user performs an action on the row. */
  onRowAction?: (key: Key) => void;
  /** The drag and drop hooks returned by `useDragAndDrop` used to enable drag and drop behavior for the Table. */
  dragAndDropHooks?: DragAndDropHooks;
}

/**
 * A table displays data in rows and columns and enables a user to navigate its contents via directional navigation keys,
 * and optionally supports row selection and sorting.
 */
export const Table = forwardRef(function Table(
  props: TableProps,
  ref: ForwardedRef<HTMLTableElement | HTMLDivElement>
) {
  [props, ref] = useContextProps(props, ref, TableContext);

  // Separate selection state so we have access to it from collection components via useTableOptions.
  let selectionState = useMultipleSelectionState(props);
  let {selectionBehavior, selectionMode, disallowEmptySelection} = selectionState;
  let hasDragHooks = !!props.dragAndDropHooks?.useDraggableCollectionState;
  let ctx = useMemo(
    () => ({
      selectionBehavior: selectionMode === 'none' ? null : selectionBehavior,
      selectionMode,
      disallowEmptySelection,
      allowsDragging: hasDragHooks
    }),
    [selectionBehavior, selectionMode, disallowEmptySelection, hasDragHooks]
  );

  let content = (
    <TableOptionsContext.Provider value={ctx}>
      <Collection {...props} />
    </TableOptionsContext.Provider>
  );

  return (
    <CollectionBuilder content={content} createCollection={() => new TableCollection<any>()}>
      {collection => (
        <TableInner
          props={props}
          forwardedRef={ref as any}
          selectionState={selectionState}
          collection={collection}
        />
      )}
    </CollectionBuilder>
  );
});

interface TableInnerProps {
  props: TableProps & SelectableCollectionContextValue<unknown>;
  forwardedRef: ForwardedRef<HTMLElement>;
  selectionState: MultipleSelectionState;
  collection: TableCollection<Node<object>>;
}

let TableElementType = forwardRef(function TableElementType(
  props: any,
  ref: ForwardedRef<Element>
) {
  let {isVirtualized} = useContext(CollectionRendererContext);
  if (isVirtualized) {
    return <dom.div {...props} ref={ref} />;
  }
  return <dom.table {...props} ref={ref} />;
});

const EXPANSION_KEYS = {
  expand: {
    ltr: 'ArrowRight',
    rtl: 'ArrowLeft'
  },
  collapse: {
    ltr: 'ArrowLeft',
    rtl: 'ArrowRight'
  }
};

function TableInner({props, forwardedRef: ref, selectionState, collection}: TableInnerProps) {
  [props, ref] = useContextProps(props, ref, SelectableCollectionContext);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let {shouldUseVirtualFocus, disallowTypeAhead, filter, ...DOMCollectionProps} = props;
  let tableContainerContext = useContext(ResizableTableContainerContext);
  ref = useObjectRef(
    useMemo(
      () => mergeRefs(ref, tableContainerContext?.tableRef),
      [ref, tableContainerContext?.tableRef]
    )
  );
  let [expandedKeys, setExpandedKeys] = useControlledState(
    props.expandedKeys ? new Set(props.expandedKeys) : undefined,
    props.defaultExpandedKeys ? new Set(props.defaultExpandedKeys) : new Set(),
    props.onExpandedChange
  );
  collection = useMemo(() => collection.withExpandedKeys(expandedKeys), [collection, expandedKeys]);

  let tableState = useTableState({
    ...DOMCollectionProps,
    collection,
    children: undefined,
    UNSAFE_selectionState: selectionState,
    expandedKeys,
    onExpandedChange: setExpandedKeys
  });

  let filteredState = UNSTABLE_useFilteredTableState(tableState, filter);
  let {
    isVirtualized,
    layoutDelegate,
    dropTargetDelegate: ctxDropTargetDelegate,
    CollectionRoot
  } = useContext(CollectionRendererContext);
  let {dragAndDropHooks} = props;
  let {gridProps} = useTable(
    {
      ...DOMCollectionProps,
      layoutDelegate,
      isVirtualized
    },
    filteredState,
    ref
  );
  let selectionManager = filteredState.selectionManager;
  let hasDragHooks = !!dragAndDropHooks?.useDraggableCollectionState;
  let hasDropHooks = !!dragAndDropHooks?.useDroppableCollectionState;
  let dragHooksProvided = useRef(hasDragHooks);
  let dropHooksProvided = useRef(hasDropHooks);
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    if (dragHooksProvided.current !== hasDragHooks) {
      console.warn(
        'Drag hooks were provided during one render, but not another. This should be avoided as it may produce unexpected behavior.'
      );
    }
    if (dropHooksProvided.current !== hasDropHooks) {
      console.warn(
        'Drop hooks were provided during one render, but not another. This should be avoided as it may produce unexpected behavior.'
      );
    }
  }, [hasDragHooks, hasDropHooks]);

  let dragState: DraggableCollectionState | undefined = undefined;
  let dropState: DroppableCollectionState | undefined = undefined;
  let droppableCollection: DroppableCollectionResult | undefined = undefined;
  let isRootDropTarget = false;
  let dragPreview: JSX.Element | null = null;
  let preview = useRef<DragPreviewRenderer>(null);
  let {direction} = useLocale();
  let [treeDropTargetDelegate] = useState(() => new TreeDropTargetDelegate());

  if (hasDragHooks && dragAndDropHooks) {
    dragState = dragAndDropHooks.useDraggableCollectionState!({
      collection: filteredState.collection,
      selectionManager,
      preview: dragAndDropHooks.renderDragPreview ? preview : undefined
    });
    dragAndDropHooks.useDraggableCollection!({}, dragState, ref);

    let DragPreview = dragAndDropHooks.DragPreview!;
    dragPreview = dragAndDropHooks.renderDragPreview ? (
      <DragPreview ref={preview}>{dragAndDropHooks.renderDragPreview}</DragPreview>
    ) : null;
  }

  if (hasDropHooks && dragAndDropHooks) {
    dropState = dragAndDropHooks.useDroppableCollectionState!({
      collection: filteredState.collection,
      selectionManager
    });

    let keyboardDelegate = new ListKeyboardDelegate({
      collection: filteredState.collection,
      disabledKeys: selectionManager.disabledKeys,
      disabledBehavior: selectionManager.disabledBehavior,
      ref,
      layoutDelegate
    });
    let dropTargetDelegate =
      dragAndDropHooks.dropTargetDelegate ||
      ctxDropTargetDelegate ||
      new dragAndDropHooks.ListDropTargetDelegate(collection.rows, ref);
    treeDropTargetDelegate.setup(dropTargetDelegate, tableState, direction);
    droppableCollection = dragAndDropHooks.useDroppableCollection!(
      {
        keyboardDelegate,
        dropTargetDelegate: treeDropTargetDelegate,
        onDropActivate: e => {
          // Expand collapsed item when dragging over. For keyboard, allow collapsing.
          if (e.target.type === 'item') {
            let key = e.target.key;
            let item = tableState.collection.getItem(key);
            let isExpanded = expandedKeys.has(key);
            if (
              item &&
              item.hasChildNodes &&
              (!isExpanded || dragAndDropHooks?.isVirtualDragging?.())
            ) {
              tableState.toggleKey(key);
            }
          }
        },
        onKeyDown: e => {
          let target = dropState?.target;
          if (target && target.type === 'item' && target.dropPosition === 'on') {
            let item = tableState.collection.getItem(target.key);
            if (
              e.key === EXPANSION_KEYS['expand'][direction] &&
              item?.hasChildNodes &&
              !tableState.expandedKeys.has(target.key)
            ) {
              tableState.toggleKey(target.key);
            } else if (
              e.key === EXPANSION_KEYS['collapse'][direction] &&
              item?.hasChildNodes &&
              tableState.expandedKeys.has(target.key)
            ) {
              tableState.toggleKey(target.key);
            }
          }
        }
      },
      dropState,
      ref
    );

    isRootDropTarget = dropState.isDropTarget({type: 'root'});
  }

  let {focusProps, isFocused, isFocusVisible} = useFocusRing();
  let renderProps = useRenderProps({
    ...props,
    children: undefined,
    defaultClassName: 'react-aria-Table',
    values: {
      isDropTarget: isRootDropTarget,
      isFocused,
      isFocusVisible,
      state: filteredState
    }
  });

  let isListDraggable = !!(hasDragHooks && !dragState?.isDisabled);

  let style = renderProps.style;
  let layoutState: TableColumnResizeState<unknown> | null = null;
  if (tableContainerContext) {
    layoutState = tableContainerContext.useTableColumnResizeState(
      {
        tableWidth: tableContainerContext.tableWidth
      },
      filteredState
    );
    if (!isVirtualized) {
      style = {
        ...style,
        tableLayout: 'fixed',
        // due to https://bugzilla.mozilla.org/show_bug.cgi?id=1959353, we can't use "fit-content".
        // Causes the table columns to grow to fill the available space in Firefox, ignoring user set column widths
        width: 'min-content'
      };
    }
  }

  let DOMProps = filterDOMProps(props, {global: true});

  return (
    <Provider
      values={[
        [TableStateContext, filteredState],
        [TableColumnResizeStateContext, layoutState],
        [DragAndDropContext, {dragAndDropHooks, dragState, dropState}],
        [DropIndicatorContext, {render: TableDropIndicatorWrapper}],
        [SelectableCollectionContext, null],
        [FieldInputContext, null]
      ]}>
      <FocusScope>
        <TableElementType
          {...mergeProps(
            DOMProps,
            renderProps,
            gridProps,
            focusProps,
            droppableCollection?.collectionProps
          )}
          style={style}
          ref={ref as RefObject<HTMLTableElement>}
          slot={props.slot || undefined}
          onScroll={props.onScroll}
          data-allows-dragging={isListDraggable || undefined}
          data-drop-target={isRootDropTarget || undefined}
          data-focused={isFocused || undefined}
          data-focus-visible={isFocusVisible || undefined}>
          <SharedElementTransition>
            <CollectionRoot
              collection={filteredState.collection}
              scrollRef={tableContainerContext?.scrollRef ?? ref}
              persistedKeys={useDndPersistedKeys(selectionManager, dragAndDropHooks, dropState)}
            />
          </SharedElementTransition>
        </TableElementType>
      </FocusScope>
      {dragPreview}
    </Provider>
  );
}

export interface TableOptionsContextValue {
  /** The type of selection that is allowed in the table. */
  selectionMode: SelectionMode;
  /** The selection behavior for the table. If selectionMode is `"none"`, this will be `null`. */
  selectionBehavior: SelectionBehavior | null;
  /** Whether the table allows empty selection. */
  disallowEmptySelection: boolean;
  /** Whether the table allows rows to be dragged. */
  allowsDragging: boolean;
}

const TableOptionsContext = createContext<TableOptionsContextValue | null>(null);

/**
 * Returns options from the parent `<Table>` component.
 */
export function useTableOptions(): TableOptionsContextValue {
  return useContext(TableOptionsContext)!;
}

export interface TableHeaderRenderProps {
  /**
   * Whether the table header is currently hovered with a mouse.
   * @selector [data-hovered]
   */
  isHovered: boolean;
}

export interface TableHeaderProps<T>
  extends
    StyleRenderProps<TableHeaderRenderProps, 'thead' | 'div'>,
    HoverEvents,
    GlobalDOMAttributes<HTMLTableSectionElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state.
   * @default 'react-aria-TableHeader'
   */
  className?: ClassNameOrFunction<TableHeaderRenderProps>;
  /** A list of table columns. */
  columns?: Iterable<T>;
  /** A list of `Column(s)` or a function. If the latter, a list of columns must be provided using the `columns` prop. */
  children?: ReactNode | ((item: T) => ReactElement);
  /** Values that should invalidate the column cache when using dynamic collections. */
  dependencies?: ReadonlyArray<any>;
}

class TableHeaderNode<T> extends CollectionNode<T> {
  static readonly type = 'tableheader';
}

let THeadElementType = forwardRef(function THeadElementType(
  props: any,
  ref: ForwardedRef<Element>
) {
  let {isVirtualized} = useContext(CollectionRendererContext);
  if (isVirtualized) {
    return <dom.div {...props} ref={ref} />;
  }
  return <dom.thead {...props} ref={ref} />;
});

/**
 * A header within a `<Table>`, containing the table columns.
 */
export const TableHeader = /*#__PURE__*/ createBranchComponent(
  TableHeaderNode,
  <T extends object>(
    props: TableHeaderProps<T>,
    ref: ForwardedRef<HTMLTableSectionElement | HTMLDivElement>
  ) => {
    let collection = useContext(TableStateContext)!.collection as TableCollection<unknown>;
    let headerRows = useCachedChildren({
      items: collection.headerRows,
      children: useCallback((item: Node<unknown>) => {
        switch (item.type) {
          case 'headerrow':
            return <TableHeaderRow item={item} />;
          default:
            throw new Error('Unsupported node type in TableHeader: ' + item.type);
        }
      }, [])
    });

    let {rowGroupProps} = useTableRowGroup();
    let {hoverProps, isHovered} = useHover({
      onHoverStart: props.onHoverStart,
      onHoverChange: props.onHoverChange,
      onHoverEnd: props.onHoverEnd
    });

    let renderProps = useRenderProps({
      ...props,
      children: undefined,
      defaultClassName: 'react-aria-TableHeader',
      values: {
        isHovered
      }
    });

    return (
      <THeadElementType
        {...mergeProps(filterDOMProps(props, {global: true}), rowGroupProps, hoverProps)}
        {...renderProps}
        ref={ref as any}
        data-hovered={isHovered || undefined}>
        {headerRows}
      </THeadElementType>
    );
  },
  props => (
    <Collection dependencies={props.dependencies} items={props.columns}>
      {props.children}
    </Collection>
  )
);

let TableHeaderRowElementType = forwardRef(function TableHeaderRowElementType(
  props: any,
  ref: ForwardedRef<Element>
) {
  let {isVirtualized} = useContext(CollectionRendererContext);
  if (isVirtualized) {
    return <div {...props} ref={ref} />;
  }
  return <tr {...props} ref={ref} />;
});

function TableHeaderRow({item}: {item: GridNode<any>}) {
  let ref = useRef<HTMLTableRowElement>(null);
  let state = useContext(TableStateContext)!;
  let {isVirtualized, CollectionBranch} = useContext(CollectionRendererContext);
  let {rowProps} = useTableHeaderRow({node: item, isVirtualized}, state, ref);
  let {checkboxProps} = useTableSelectAllCheckbox(state);

  return (
    <TableHeaderRowElementType {...rowProps} ref={ref}>
      <Provider
        values={[
          [
            CheckboxContext,
            {
              slots: {
                selection: checkboxProps
              }
            }
          ],
          [
            CheckboxFieldContext,
            {
              slots: {
                selection: checkboxProps
              }
            }
          ]
        ]}>
        <CollectionBranch collection={state.collection} parent={item} />
      </Provider>
    </TableHeaderRowElementType>
  );
}

export interface ColumnRenderProps {
  /**
   * Whether the column is currently hovered with a mouse.
   * @selector [data-hovered]
   */
  isHovered: boolean;
  /**
   * Whether the column is currently in a pressed state.
   * @selector [data-pressed]
   */
  isPressed: boolean;
  /**
   * Whether the column is currently focused.
   * @selector [data-focused]
   */
  isFocused: boolean;
  /**
   * Whether the column is currently keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean;
  /**
   * Whether the column allows sorting.
   * @selector [data-allows-sorting]
   */
  allowsSorting: boolean;
  /**
   * The current sort direction.
   * @selector [data-sort-direction="ascending | descending"]
   */
  sortDirection: SortDirection | undefined;
  /**
   * Whether the column is currently being resized.
   * @selector [data-resizing]
   */
  isResizing: boolean;
  /**
   * Triggers sorting for this column in the given direction.
   */
  sort(direction: SortDirection): void;
  /**
   * Starts column resizing if the table is contained in a `<ResizableTableContainer>` element.
   */
  startResize(): void;
}

export interface ColumnProps
  extends
    RenderProps<ColumnRenderProps, 'th' | 'div'>,
    GlobalDOMAttributes<HTMLTableHeaderCellElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state.
   * @default 'react-aria-Column'
   */
  className?: ClassNameOrFunction<ColumnRenderProps>;
  /** The unique id of the column. */
  id?: Key;
  /** Whether the column allows sorting. */
  allowsSorting?: boolean;
  /** Whether a column is a [row header](https://www.w3.org/TR/wai-aria-1.1/#rowheader) and should be announced by assistive technology during row navigation. */
  isRowHeader?: boolean;
  /** A string representation of the column's contents, used for accessibility announcements. */
  textValue?: string;
  /** The width of the column. This prop only applies when the `<Table>` is wrapped in a `<ResizableTableContainer>`. */
  width?: ColumnSize | null;
  /** The default width of the column. This prop only applies when the `<Table>` is wrapped in a `<ResizableTableContainer>`. */
  defaultWidth?: ColumnSize | null;
  /** The minimum width of the column. This prop only applies when the `<Table>` is wrapped in a `<ResizableTableContainer>`. */
  minWidth?: ColumnStaticSize | null;
  /** The maximum width of the column. This prop only applies when the `<Table>` is wrapped in a `<ResizableTableContainer>`. */
  maxWidth?: ColumnStaticSize | null;
}

class TableColumnNode extends CollectionNode<unknown> {
  static readonly type = 'column';
}

let ColumnElementType = forwardRef(function ColumnElementType(
  props: any,
  ref: ForwardedRef<Element>
) {
  let {isVirtualized} = useContext(CollectionRendererContext);
  if (isVirtualized) {
    return <dom.div {...props} ref={ref} />;
  }
  return <dom.th {...props} ref={ref} />;
});

/**
 * A column within a `<Table>`.
 */
export const Column = /*#__PURE__*/ createLeafComponent(
  TableColumnNode,
  (
    props: ColumnProps,
    forwardedRef: ForwardedRef<HTMLTableCellElement | HTMLDivElement>,
    column: GridNode<unknown>
  ) => {
    let ref = useObjectRef<HTMLTableCellElement | HTMLDivElement>(forwardedRef);
    let state = useContext(TableStateContext)!;
    let {isVirtualized} = useContext(CollectionRendererContext);
    let {columnHeaderProps, isPressed} = useTableColumnHeader(
      {node: column, isVirtualized},
      state,
      ref
    );
    let {isFocused, isFocusVisible, focusProps} = useFocusRing();

    let layoutState = useContext(TableColumnResizeStateContext);
    let isResizing = false;
    if (layoutState) {
      isResizing = layoutState.resizingColumn === column.key;
    } else if (process.env.NODE_ENV !== 'production') {
      for (let prop in ['width', 'defaultWidth', 'minWidth', 'maxWidth']) {
        if (prop in column.props) {
          console.warn(
            `The ${prop} prop on a <Column> only applies when a <Table> is wrapped in a <ResizableTableContainer>. If you aren't using column resizing, you can set the width of a column with CSS.`
          );
        }
      }
    }

    let {hoverProps, isHovered} = useHover({isDisabled: !props.allowsSorting});
    let renderProps = useRenderProps({
      ...props,
      id: undefined,
      children: column.rendered,
      defaultClassName: 'react-aria-Column',
      values: {
        isHovered,
        isPressed,
        isFocused,
        isFocusVisible,
        allowsSorting: column.props.allowsSorting,
        sortDirection:
          state.sortDescriptor?.column === column.key ? state.sortDescriptor.direction : undefined,
        isResizing,
        startResize: () => {
          if (layoutState) {
            layoutState.startResize(column.key);
            state.setKeyboardNavigationDisabled(true);
          } else {
            throw new Error(
              'Wrap your <Table> in a <ResizableTableContainer> to enable column resizing'
            );
          }
        },
        sort: direction => {
          state.sort(column.key, direction);
        }
      }
    });

    let style = renderProps.style;
    if (layoutState) {
      style = {...style, width: layoutState.getColumnWidth(column.key)};
    }

    let DOMProps = filterDOMProps(props as any, {global: true});
    delete DOMProps.id;

    return (
      <ColumnElementType
        {...mergeProps(DOMProps, columnHeaderProps, focusProps, hoverProps)}
        {...renderProps}
        style={style}
        ref={ref as any}
        data-hovered={isHovered || undefined}
        data-pressed={isPressed || undefined}
        data-focused={isFocused || undefined}
        data-focus-visible={isFocusVisible || undefined}
        data-resizing={isResizing || undefined}
        data-allows-sorting={column.props.allowsSorting || undefined}
        data-sort-direction={
          state.sortDescriptor?.column === column.key ? state.sortDescriptor.direction : undefined
        }>
        <Provider
          values={[
            [ColumnResizerContext, {column, triggerRef: ref}],
            [CollectionRendererContext, DefaultCollectionRenderer]
          ]}>
          {renderProps.children}
        </Provider>
      </ColumnElementType>
    );
  }
);

export interface ColumnResizerRenderProps {
  /**
   * Whether the resizer is currently hovered with a mouse.
   * @selector [data-hovered]
   */
  isHovered: boolean;
  /**
   * Whether the resizer is currently focused.
   * @selector [data-focused]
   */
  isFocused: boolean;
  /**
   * Whether the resizer is currently keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean;
  /**
   * Whether the resizer is currently being resized.
   * @selector [data-resizing]
   */
  isResizing: boolean;
  /**
   * The direction that the column is currently resizable.
   * @selector [data-resizable-direction="right | left | both"]
   */
  resizableDirection: 'right' | 'left' | 'both';
}

export interface ColumnResizerProps
  extends HoverEvents, RenderProps<ColumnResizerRenderProps>, GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state.
   * @default 'react-aria-ColumnResizer'
   */
  className?: ClassNameOrFunction<ColumnResizerRenderProps>;
  /** A custom accessibility label for the resizer. */
  'aria-label'?: string;
}

interface ColumnResizerContextValue {
  column: GridNode<unknown>;
  triggerRef: RefObject<HTMLDivElement | null>;
}

const ColumnResizerContext = createContext<ColumnResizerContextValue | null>(null);

export const ColumnResizer = forwardRef(function ColumnResizer(
  props: ColumnResizerProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  let layoutState = useContext(TableColumnResizeStateContext);
  if (!layoutState) {
    throw new Error('Wrap your <Table> in a <ResizableTableContainer> to enable column resizing');
  }
  let stringFormatter = useLocalizedStringFormatter(intlMessages, 'react-aria-components');

  let {onResizeStart, onResize, onResizeEnd} = useContext(ResizableTableContainerContext)!;
  let {column, triggerRef} = useContext(ColumnResizerContext)!;
  let inputRef = useRef<HTMLInputElement>(null);
  let {resizerProps, inputProps, isResizing} = useTableColumnResize(
    {
      column,
      'aria-label': props['aria-label'] || stringFormatter.format('tableResizer'),
      onResizeStart,
      onResize,
      onResizeEnd,
      triggerRef
    },
    layoutState,
    inputRef
  );
  let {focusProps, isFocused, isFocusVisible} = useFocusRing();
  let {hoverProps, isHovered} = useHover(props);

  let isEResizable =
    layoutState.getColumnMinWidth(column.key) >= layoutState.getColumnWidth(column.key);
  let isWResizable =
    layoutState.getColumnMaxWidth(column.key) <= layoutState.getColumnWidth(column.key);
  let {direction} = useLocale();
  let resizableDirection: ColumnResizerRenderProps['resizableDirection'] = 'both';
  if (isEResizable) {
    resizableDirection = direction === 'rtl' ? 'right' : 'left';
  } else if (isWResizable) {
    resizableDirection = direction === 'rtl' ? 'left' : 'right';
  } else {
    resizableDirection = 'both';
  }

  let objectRef = useObjectRef(ref);
  let [cursor, setCursor] = useState('');
  useEffect(() => {
    if (!objectRef.current) {
      return;
    }
    let style = window.getComputedStyle(objectRef.current);
    setCursor(style.cursor);
  }, [objectRef, resizableDirection]);

  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-ColumnResizer',
    values: {
      isFocused,
      isFocusVisible,
      isResizing,
      isHovered,
      resizableDirection
    }
  });

  let [isMouseDown, setMouseDown] = useState(false);
  let onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') {
      setMouseDown(true);
    }
  };

  if (!isResizing && isMouseDown) {
    setMouseDown(false);
  }

  let DOMProps = filterDOMProps(props, {global: true});

  return (
    <dom.div
      ref={objectRef}
      role="presentation"
      {...mergeProps(DOMProps, renderProps, resizerProps, {onPointerDown}, hoverProps)}
      data-hovered={isHovered || undefined}
      data-focused={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-resizing={isResizing || undefined}
      data-resizable-direction={resizableDirection}>
      {renderProps.children}
      <input ref={inputRef} {...mergeProps(inputProps, focusProps)} />
      {isResizing &&
        isMouseDown &&
        ReactDOM.createPortal(
          <div style={{position: 'fixed', top: 0, left: 0, bottom: 0, right: 0, cursor}} />,
          document.body
        )}
    </dom.div>
  );
});

export interface TableBodyRenderProps {
  /**
   * Whether the table body has no rows and should display its empty state.
   * @selector [data-empty]
   */
  isEmpty: boolean;
  /**
   * Whether the Table is currently the active drop target.
   * @selector [data-drop-target]
   */
  isDropTarget: boolean;
}

export interface TableBodyProps<T>
  extends
    Omit<CollectionProps<T>, 'disabledKeys'>,
    StyleRenderProps<TableBodyRenderProps, 'tbody' | 'div'>,
    GlobalDOMAttributes<HTMLTableSectionElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state.
   * @default 'react-aria-TableBody'
   */
  className?: ClassNameOrFunction<TableBodyRenderProps>;
  /** Provides content to display when there are no rows in the table. */
  renderEmptyState?: (props: TableBodyRenderProps) => ReactNode;
}

class TableBodyNode<T> extends FilterableNode<T> {
  static readonly type = 'tablebody';
}

let TableBodyElementType = forwardRef(function TableBodyElementType(
  props: any,
  ref: ForwardedRef<Element>
) {
  let {isVirtualized} = useContext(CollectionRendererContext);
  if (isVirtualized) {
    return <dom.div {...props} ref={ref} />;
  }
  return <dom.tbody {...props} ref={ref} />;
});

/**
 * The body of a `<Table>`, containing the table rows.
 */
export const TableBody = /*#__PURE__*/ createBranchComponent(
  TableBodyNode,
  <T extends object>(
    props: TableBodyProps<T>,
    ref: ForwardedRef<HTMLTableSectionElement | HTMLDivElement>,
    node: Node<T>
  ) => {
    let state = useContext(TableStateContext)!;
    let {isVirtualized} = useContext(CollectionRendererContext);
    let collection = state.collection;
    let {CollectionBranch} = useContext(CollectionRendererContext);
    let {dragAndDropHooks, dropState} = useContext(DragAndDropContext);
    let isDroppable = !!dragAndDropHooks?.useDroppableCollectionState && !dropState?.isDisabled;
    let isRootDropTarget =
      isDroppable && !!dropState && (dropState.isDropTarget({type: 'root'}) ?? false);

    let isEmpty = collection.size === 0;
    let renderValues = {
      isDropTarget: isRootDropTarget,
      isEmpty
    };
    let renderProps = useRenderProps({
      ...props,
      id: undefined,
      children: undefined,
      defaultClassName: 'react-aria-TableBody',
      values: renderValues
    });

    let emptyState;
    let numColumns = collection.columnCount;

    if (isEmpty && props.renderEmptyState && state) {
      let rowProps = {};
      let rowHeaderProps = {};
      let style = {};
      if (isVirtualized) {
        rowHeaderProps['aria-colspan'] = numColumns;
        style = {display: 'contents'};
      } else {
        rowHeaderProps['colSpan'] = numColumns;
      }

      emptyState = (
        <TableRowElementType role="row" {...rowProps} style={style}>
          <TableCellElementType role="rowheader" {...rowHeaderProps} style={style}>
            {props.renderEmptyState(renderValues)}
          </TableCellElementType>
        </TableRowElementType>
      );
    }

    let {rowGroupProps} = useTableRowGroup();

    let DOMProps = filterDOMProps(props, {global: true});

    // TODO: TableBody doesn't support being the scrollable body of the table yet, to revisit if needed. Would need to
    // call useLoadMore here and walk up the DOM to the nearest scrollable element to set scrollRef
    return (
      <TableBodyElementType
        {...mergeProps(DOMProps, renderProps, rowGroupProps)}
        ref={ref as any}
        data-empty={isEmpty || undefined}>
        {isDroppable && <RootDropIndicator />}
        <CollectionBranch
          collection={collection}
          parent={node}
          renderDropIndicator={useRenderDropIndicator(dragAndDropHooks, dropState)}
        />
        {emptyState}
      </TableBodyElementType>
    );
  }
);

class TableFooterNode<T> extends FilterableNode<T> {
  static readonly type = 'tablefooter';
}

export interface TableFooterProps<T>
  extends
    Omit<CollectionProps<T>, 'disabledKeys'>,
    StyleProps,
    GlobalDOMAttributes<HTMLTableSectionElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element.
   * @default 'react-aria-TableFooter'
   */
  className?: string;
}

let TableFooterElementType = forwardRef(function TableFooterElementType(
  props: any,
  ref: ForwardedRef<Element>
) {
  let {isVirtualized} = useContext(CollectionRendererContext);
  if (isVirtualized) {
    return <dom.div {...props} ref={ref} />;
  }
  return <dom.tfoot {...props} ref={ref} />;
});

/**
 * The footer of a `<Table>`, containing table rows.
 */
export const TableFooter = /*#__PURE__*/ createBranchComponent(
  TableFooterNode,
  <T extends object>(
    props: TableFooterProps<T>,
    ref: ForwardedRef<HTMLTableSectionElement | HTMLDivElement>,
    node: Node<T>
  ) => {
    let state = useContext(TableStateContext)!;
    let collection = state.collection as TableCollection<T>;
    let {CollectionBranch} = useContext(CollectionRendererContext);
    let {dragAndDropHooks, dropState} = useContext(DragAndDropContext);

    let {rowGroupProps} = useTableRowGroup();
    let DOMProps = filterDOMProps(props, {global: true});
    let renderProps = useRenderProps({
      style: props.style,
      className: props.className,
      defaultClassName: 'react-aria-TableFooter',
      values: {}
    });

    return (
      <TableFooterElementType
        {...mergeProps(DOMProps, renderProps, rowGroupProps)}
        ref={ref as any}>
        <CollectionBranch
          collection={collection}
          parent={node}
          renderDropIndicator={useRenderDropIndicator(dragAndDropHooks, dropState)}
        />
      </TableFooterElementType>
    );
  }
);

export interface RowRenderProps extends ItemRenderProps {
  /** Whether the row's children have keyboard focus. */
  isFocusVisibleWithin: boolean;
  /** The unique id of the row. */
  id?: Key;
  /**
   * Whether the row is expanded.
   * @selector [data-expanded]
   */
  isExpanded: boolean;
  /**
   * Whether the row has child rows.
   * @selector [data-has-child-items]
   */
  hasChildItems: boolean;
  /**
   * What level the row has within the table.
   * @selector [data-level]
   */
  level: number;
}

export interface RowProps<T>
  extends
    StyleRenderProps<RowRenderProps, 'tr' | 'div'>,
    LinkDOMProps,
    HoverEvents,
    PressEvents,
    Omit<GlobalDOMAttributes<HTMLTableRowElement>, 'onClick'> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state.
   * @default 'react-aria-Row'
   */
  className?: ClassNameOrFunction<RowRenderProps>;
  /** A list of columns used when dynamically rendering cells. */
  columns?: Iterable<T>;
  /** The cells within the row. Supports static items or a function for dynamic rendering. */
  children?: ReactNode | ((item: T) => ReactElement);
  /** The object value that this row represents. When using dynamic collections, this is set automatically. */
  value?: T;
  /** Values that should invalidate the cell cache when using dynamic collections. */
  dependencies?: ReadonlyArray<any>;
  /** A string representation of the row's contents, used for features like typeahead. */
  textValue?: string;
  /** Whether the row is disabled. */
  isDisabled?: boolean;
  /** Whether `disabledKeys` applies to all interactions, or only selection. */
  disabledBehavior?: DisabledBehavior;
  /**
   * Handler that is called when a user performs an action on the row. The exact user event depends on
   * the collection's `selectionBehavior` prop and the interaction modality.
   */
  onAction?: () => void;
  /** The unique id of the row. */
  id?: Key;
  /** Whether this row has children, even if not loaded yet. */
  hasChildItems?: boolean;
}

class TableRowNode<T> extends CollectionNode<T> {
  static readonly type = 'item';

  filter(
    collection: BaseCollection<T>,
    newCollection: BaseCollection<T>,
    filterFn: (textValue: string, node: Node<T>) => boolean
  ): TableRowNode<T> | null {
    let cells = collection.getChildren(this.key);
    for (let cell of cells) {
      if (filterFn(cell.textValue, cell)) {
        let clone = this.clone();
        newCollection.addDescendants(clone, collection);
        return clone;
      }
    }

    return null;
  }
}

let TableRowElementType = forwardRef(function TableRowElementType(
  props: any,
  ref: ForwardedRef<Element>
) {
  let {isVirtualized} = useContext(CollectionRendererContext);
  if (isVirtualized) {
    return <dom.div {...props} ref={ref} />;
  }
  return <dom.tr {...props} ref={ref} />;
});

/**
 * A row within a `<Table>`.
 */
export const Row = /*#__PURE__*/ createBranchComponent(
  TableRowNode,
  <T extends object>(
    props: RowProps<T>,
    forwardedRef: ForwardedRef<HTMLTableRowElement | HTMLDivElement>,
    item: GridNode<T>
  ) => {
    let ref = useObjectRef<HTMLTableRowElement | HTMLDivElement>(forwardedRef);
    let state = useContext(TableStateContext)!;
    let {dragAndDropHooks, dragState, dropState} = useContext(DragAndDropContext);
    let {isVirtualized, CollectionBranch} = useContext(CollectionRendererContext);
    let {rowProps, expandButtonProps, ...states} = useTableRow(
      {
        node: item,
        shouldSelectOnPressUp: !!dragState,
        isVirtualized
      },
      state,
      ref
    );
    let {isFocused, isFocusVisible, focusProps} = useFocusRing();
    let {isFocusVisible: isFocusVisibleWithin, focusProps: focusWithinProps} = useFocusRing({
      within: true
    });
    let {hoverProps, isHovered} = useHover({
      isDisabled: !states.allowsSelection && !states.hasAction,
      onHoverStart: props.onHoverStart,
      onHoverChange: props.onHoverChange,
      onHoverEnd: props.onHoverEnd
    });

    let {checkboxProps} = useTableSelectionCheckbox({key: item.key}, state);

    let draggableItem: DraggableItemResult | undefined = undefined;
    if (dragState && dragAndDropHooks) {
      draggableItem = dragAndDropHooks.useDraggableItem!(
        {key: item.key, hasDragButton: true},
        dragState
      );
    }

    let dropIndicator: DropIndicatorAria | undefined = undefined;
    let dropIndicatorRef = useRef<HTMLDivElement>(null);
    let {visuallyHiddenProps} = useVisuallyHidden();
    if (dropState && dragAndDropHooks) {
      dropIndicator = dragAndDropHooks.useDropIndicator!(
        {
          target: {type: 'item', key: item.key, dropPosition: 'on'}
        },
        dropState,
        dropIndicatorRef
      );
    }

    let dragButtonRef = useRef<HTMLButtonElement>(null);
    useEffect(() => {
      if (dragState && !dragButtonRef.current && process.env.NODE_ENV !== 'production') {
        console.warn(
          'Draggable items in a Table must contain a <Button slot="drag"> element so that keyboard and screen reader users can drag them.'
        );
      }
      // eslint-disable-next-line
    }, []);

    let isDragging = dragState && dragState.isDragging(item.key);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let {children: _, ...restProps} = props;
    let hasChildItems =
      props.hasChildItems || state.collection.getItem(item.lastChildKey!)?.type !== 'cell';
    let isExpanded = hasChildItems && state.expandedKeys.has(item.key);
    let renderProps = useRenderProps({
      ...restProps,
      id: undefined,
      defaultClassName: 'react-aria-Row',
      defaultStyle: {
        // @ts-ignore
        '--table-row-level': item.level + 1
      },
      values: {
        ...states,
        isHovered,
        isFocused,
        isFocusVisible,
        selectionMode: state.selectionManager.selectionMode,
        selectionBehavior: state.selectionManager.selectionBehavior,
        isDragging,
        isDropTarget: dropIndicator?.isDropTarget,
        isFocusVisibleWithin,
        id: item.key,
        hasChildItems,
        isExpanded,
        level: item.level + 1
      }
    });

    let DOMProps = filterDOMProps(props as any, {global: true});
    delete DOMProps.id;
    delete DOMProps.onClick;

    return (
      <>
        {dropIndicator && !dropIndicator.isHidden && (
          <TableRowElementType role="row" style={{height: 0}}>
            <TableCellElementType
              role="gridcell"
              colSpan={state.collection.columnCount}
              style={{padding: 0}}>
              <div
                role="button"
                {...visuallyHiddenProps}
                {...dropIndicator.dropIndicatorProps}
                ref={dropIndicatorRef}
              />
            </TableCellElementType>
          </TableRowElementType>
        )}
        <TableRowElementType
          {...mergeProps(
            DOMProps,
            renderProps,
            rowProps,
            focusProps,
            hoverProps,
            draggableItem?.dragProps,
            focusWithinProps
          )}
          ref={ref as any}
          data-disabled={states.isDisabled || undefined}
          data-selected={states.isSelected || undefined}
          data-hovered={isHovered || undefined}
          data-focused={states.isFocused || undefined}
          data-focus-visible={isFocusVisible || undefined}
          data-pressed={states.isPressed || undefined}
          data-dragging={isDragging || undefined}
          data-drop-target={dropIndicator?.isDropTarget || undefined}
          data-selection-mode={
            state.selectionManager.selectionMode === 'none'
              ? undefined
              : state.selectionManager.selectionMode
          }
          data-focus-visible-within={isFocusVisibleWithin || undefined}
          data-expanded={isExpanded || undefined}
          data-has-child-items={hasChildItems || undefined}
          data-level={item.level + 1}>
          <Provider
            values={[
              [
                CheckboxContext,
                {
                  slots: {
                    [DEFAULT_SLOT]: {},
                    selection: checkboxProps
                  }
                }
              ],
              [
                CheckboxFieldContext,
                {
                  slots: {
                    [DEFAULT_SLOT]: {},
                    selection: checkboxProps
                  }
                }
              ],
              [
                ButtonContext,
                {
                  slots: {
                    [DEFAULT_SLOT]: {},
                    chevron: expandButtonProps,
                    drag: {
                      ...draggableItem?.dragButtonProps,
                      ref: dragButtonRef,
                      style: {
                        pointerEvents: 'none'
                      }
                    }
                  }
                }
              ],
              [SelectionIndicatorContext, {isSelected: states.isSelected}]
            ]}>
            <CollectionBranch collection={state.collection} parent={item} />
          </Provider>
        </TableRowElementType>
      </>
    );
  },
  props => {
    if (props.id == null && typeof props.children === 'function') {
      throw new Error(
        'No id detected for the Row element. The Row element requires a id to be provided to it when the cells are rendered dynamically.'
      );
    }

    let dependencies = [props.value].concat(props.dependencies);
    return (
      <Collection dependencies={dependencies} items={props.columns} idScope={props.id}>
        {props.children}
      </Collection>
    );
  }
);

export interface CellRenderProps {
  /**
   * Whether the cell is currently in a pressed state.
   * @selector [data-pressed]
   */
  isPressed: boolean;
  /**
   * Whether the cell is currently focused.
   * @selector [data-focused]
   */
  isFocused: boolean;
  /**
   * Whether the cell is currently keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean;
  /**
   * Whether the cell is currently hovered with a mouse.
   * @selector [data-hovered]
   */
  isHovered: boolean;
  /**
   * Whether the parent row is currently selected.
   * @selector [data-selected]
   */
  isSelected: boolean;
  /**
   * Whether the parent row is non-interactive, i.e. both selection and actions are disabled and the item may
   * not be focused. Dependent on `disabledKeys` and `disabledBehavior`.
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * The unique id of the cell.
   **/
  id?: Key;
  /**
   * The index of the column that this cell belongs to. Respects col spanning.
   */
  columnIndex?: number | null;
  /**
   * Whether the column displays hierarchical data.
   * @selector [data-tree-column]
   */
  isTreeColumn: boolean;
  /**
   * Whether the parent row is expanded.
   * @selector [data-expanded]
   */
  isExpanded: boolean;
  /**
   * Whether the parent row has child rows.
   * @selector [data-has-child-items]
   */
  hasChildItems: boolean;
  /**
   * What level the parent row has within the table.
   * @selector [data-level]
   */
  level: number;
}

export interface CellProps
  extends RenderProps<CellRenderProps, 'td' | 'div'>, GlobalDOMAttributes<HTMLTableCellElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state.
   * @default 'react-aria-Cell'
   */
  className?: ClassNameOrFunction<CellRenderProps>;
  /** The unique id of the cell. */
  id?: Key;
  /** A string representation of the cell's contents, used for features like typeahead. */
  textValue?: string;
  /** Indicates how many columns the data cell spans. */
  colSpan?: number;
}

class TableCellNode extends CollectionNode<unknown> {
  static readonly type = 'cell';
}

let TableCellElementType = forwardRef(function TableCellElementType(
  props: any,
  ref: ForwardedRef<Element>
) {
  let {isVirtualized} = useContext(CollectionRendererContext);
  if (isVirtualized) {
    return <dom.div {...props} ref={ref} />;
  }
  return <dom.td {...props} ref={ref} />;
});

/**
 * A cell within a table row.
 */
export const Cell = /*#__PURE__*/ createLeafComponent(
  TableCellNode,
  (
    props: CellProps,
    forwardedRef: ForwardedRef<HTMLTableCellElement | HTMLDivElement>,
    cell: GridNode<unknown>
  ) => {
    let ref = useObjectRef<HTMLTableCellElement | HTMLDivElement>(forwardedRef);
    let state = useContext(TableStateContext)!;
    let {dragState} = useContext(DragAndDropContext);
    let {isVirtualized} = useContext(CollectionRendererContext);

    cell.column = state.collection.columns[cell.index];

    let {gridCellProps, isPressed} = useTableCell(
      {
        node: cell,
        shouldSelectOnPressUp: !!dragState,
        isVirtualized
      },
      state,
      ref
    );
    let {isFocused, isFocusVisible, focusProps} = useFocusRing();
    let {hoverProps, isHovered} = useHover({});
    let isSelected =
      cell.parentKey != null ? state.selectionManager.isSelected(cell.parentKey) : false;
    // colIndex is null, when there is so span, falling back to using the index
    let columnIndex = cell.colIndex || cell.index;

    let row = state.collection.getItem(cell.parentKey!)!;
    let hasChildItems =
      row.props.hasChildItems || state.collection.getItem(row.lastChildKey!)?.type !== 'cell';
    let isExpanded = hasChildItems && state.expandedKeys.has(cell.parentKey!);
    let isDisabled = state.selectionManager.isDisabled(cell.parentKey!);
    let renderProps = useRenderProps({
      ...props,
      id: undefined,
      defaultClassName: 'react-aria-Cell',
      values: {
        isFocused,
        isFocusVisible,
        isPressed,
        isHovered,
        isSelected,
        id: cell.key,
        columnIndex,
        hasChildItems,
        isExpanded,
        isDisabled,
        level: row.level + 1,
        isTreeColumn: cell.column.key === state.treeColumn
      }
    });

    let DOMProps = filterDOMProps(props as any, {global: true});
    delete DOMProps.id;

    return (
      <TableCellElementType
        {...mergeProps(DOMProps, renderProps, gridCellProps, focusProps, hoverProps)}
        ref={ref as any}
        data-focused={isFocused || undefined}
        data-focus-visible={isFocusVisible || undefined}
        data-pressed={isPressed || undefined}
        data-selected={isSelected || undefined}
        data-column-index={columnIndex}
        data-expanded={isExpanded || undefined}
        data-has-child-items={hasChildItems || undefined}
        data-level={row.level + 1}
        data-tree-column={cell.column.key === state.treeColumn || undefined}
        data-disabled={isDisabled || undefined}>
        <CollectionRendererContext.Provider value={DefaultCollectionRenderer}>
          {renderProps.children}
        </CollectionRendererContext.Provider>
      </TableCellElementType>
    );
  }
);

function TableDropIndicatorWrapper(props: DropIndicatorProps, ref: ForwardedRef<HTMLElement>) {
  ref = useObjectRef(ref);
  let {dragAndDropHooks, dropState} = useContext(DragAndDropContext)!;
  let buttonRef = useRef<HTMLDivElement>(null);
  let {dropIndicatorProps, isHidden, isDropTarget} = dragAndDropHooks!.useDropIndicator!(
    props,
    dropState!,
    buttonRef
  );

  if (isHidden) {
    return null;
  }

  let level =
    dropState && props.target.type === 'item'
      ? (dropState.collection.getItem(props.target.key)?.level || 0) + 1
      : 1;
  return (
    <TableDropIndicatorForwardRef
      {...props}
      dropIndicatorProps={dropIndicatorProps}
      isDropTarget={isDropTarget}
      buttonRef={buttonRef}
      level={level}
      ref={ref}
    />
  );
}

interface TableDropIndicatorProps
  extends DropIndicatorProps, GlobalDOMAttributes<HTMLTableRowElement> {
  dropIndicatorProps: React.HTMLAttributes<HTMLElement>;
  isDropTarget: boolean;
  buttonRef: RefObject<HTMLDivElement | null>;
  level: number;
}

let TableDropIndicatorRowElementType = forwardRef(function TableDropIndicatorRowElementType(
  props: any,
  ref: ForwardedRef<Element>
) {
  let {isVirtualized} = useContext(CollectionRendererContext);
  if (isVirtualized) {
    return <dom.div {...props} ref={ref} />;
  }
  return <dom.tr {...props} ref={ref} />;
});
let TableDropIndicatorTDElementType = forwardRef(function TableDropIndicatorTDElementType(
  props: any,
  ref: ForwardedRef<Element>
) {
  let {isVirtualized} = useContext(CollectionRendererContext);
  if (isVirtualized) {
    return <dom.div {...props} ref={ref} />;
  }
  return <dom.td {...props} ref={ref} />;
});

function TableDropIndicator(props: TableDropIndicatorProps, ref: ForwardedRef<HTMLElement>) {
  let {dropIndicatorProps, isDropTarget, buttonRef, level, ...otherProps} = props;

  let state = useContext(TableStateContext)!;
  let {visuallyHiddenProps} = useVisuallyHidden();
  let renderProps = useRenderProps({
    ...otherProps,
    defaultClassName: 'react-aria-DropIndicator',
    defaultStyle: {
      // @ts-ignore
      '--table-row-level': level + 1
    },
    values: {
      isDropTarget
    }
  });

  return (
    <TableDropIndicatorRowElementType
      {...filterDOMProps(props as any, {global: true})}
      {...renderProps}
      role="row"
      ref={ref as RefObject<HTMLTableRowElement | null>}
      data-drop-target={isDropTarget || undefined}
      aria-level={level}>
      <TableDropIndicatorTDElementType
        role="gridcell"
        colSpan={state.collection.columnCount}
        style={{padding: 0}}>
        <div {...visuallyHiddenProps} role="button" {...dropIndicatorProps} ref={buttonRef} />
        {renderProps.children}
      </TableDropIndicatorTDElementType>
    </TableDropIndicatorRowElementType>
  );
}

const TableDropIndicatorForwardRef = forwardRef(TableDropIndicator);

function RootDropIndicator() {
  let state = useContext(TableStateContext)!;
  let {dragAndDropHooks, dropState} = useContext(DragAndDropContext);
  let ref = useRef<HTMLDivElement>(null);
  let {dropIndicatorProps} = dragAndDropHooks!.useDropIndicator!(
    {
      target: {type: 'root'}
    },
    dropState!,
    ref
  );
  let isDropTarget = dropState!.isDropTarget({type: 'root'});
  let {visuallyHiddenProps} = useVisuallyHidden();

  if (!isDropTarget && dropIndicatorProps['aria-hidden']) {
    return null;
  }

  return (
    <TableRowElementType
      role="row"
      aria-hidden={dropIndicatorProps['aria-hidden']}
      style={{height: 0}}>
      <TableCellElementType
        role="gridcell"
        colSpan={state.collection.columnCount}
        style={{padding: 0}}>
        <div role="button" {...visuallyHiddenProps} {...dropIndicatorProps} ref={ref} />
      </TableCellElementType>
    </TableRowElementType>
  );
}

export interface TableLoadMoreItemProps
  extends
    Omit<LoadMoreSentinelProps, 'collection'>,
    StyleProps,
    DOMRenderProps<'tr' | 'div', undefined>,
    GlobalDOMAttributes<HTMLTableRowElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element.
   * @default 'react-aria-TableLoadMoreItem'
   */
  className?: string;
  /**
   * The load more spinner to render when loading additional items.
   */
  children?: ReactNode;
  /**
   * Whether or not the loading spinner should be rendered or not.
   */
  isLoading?: boolean;
}

export const TableLoadMoreItem = createLeafComponent(
  LoaderNode,
  function TableLoadingIndicator(
    props: TableLoadMoreItemProps,
    ref: ForwardedRef<HTMLTableRowElement>,
    item: Node<object>
  ) {
    let state = useContext(TableStateContext)!;
    let {isVirtualized} = useContext(CollectionRendererContext);
    let {isLoading, onLoadMore, scrollOffset, ...otherProps} = props;
    let numColumns = state.collection.columns.length;

    let sentinelRef = useRef(null);
    let memoedLoadMoreProps = useMemo(
      () => ({
        onLoadMore,
        collection: state?.collection,
        sentinelRef,
        scrollOffset
      }),
      [onLoadMore, scrollOffset, state?.collection]
    );
    useLoadMoreSentinel(memoedLoadMoreProps, sentinelRef);

    let renderProps = useRenderProps({
      ...otherProps,
      id: undefined,
      children: item.rendered,
      defaultClassName: 'react-aria-TableLoadingIndicator',
      defaultStyle: {
        // @ts-ignore
        '--table-row-level': item.level + 1
      },
      values: undefined
    });
    let rowProps = {};
    let rowHeaderProps = {};
    let style = {};

    if (isVirtualized) {
      // For now don't include aria-rowindex on loader since they aren't keyboard focusable
      // Arguably shouldn't include them ever since it might be confusing to the user to include the loaders as part of the
      // row count
      rowHeaderProps['aria-colspan'] = numColumns;
      style = {display: 'contents'};
    } else {
      rowHeaderProps['colSpan'] = numColumns;
    }

    return (
      <>
        {/* Alway render the sentinel. For now onus is on the user for styling when using flex + gap (this would introduce a gap even though it doesn't take room) */}
        {/* @ts-ignore - compatibility with React < 19 */}
        <TableRowElementType style={{height: 0}} inert={inertValue(true)}>
          <TableCellElementType style={{padding: 0, border: 0}}>
            <div
              data-testid="loadMoreSentinel"
              ref={sentinelRef}
              style={{position: 'relative', height: 1, width: 1}}
            />
          </TableCellElementType>
        </TableRowElementType>
        {isLoading && renderProps.children && (
          <TableRowElementType
            {...mergeProps(filterDOMProps(props, {global: true}), rowProps)}
            {...renderProps}
            role="row"
            ref={ref as ForwardedRef<HTMLTableRowElement>}
            aria-level={item.level + 1}
            data-level={item.level + 1}>
            <TableCellElementType role="rowheader" {...rowHeaderProps} style={style}>
              {renderProps.children}
            </TableCellElementType>
          </TableRowElementType>
        )}
      </>
    );
  }
);
