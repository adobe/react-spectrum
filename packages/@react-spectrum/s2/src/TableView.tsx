/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ActionButton, ActionButtonContext} from './ActionButton';
import {baseColor, colorMix, focusRing, fontRelative, lightDark, space, style} from '../style' with {type: 'macro'};
import {
  Button,
  ButtonContext,
  CellRenderProps,
  Collection,
  ColumnRenderProps,
  ColumnResizer,
  ContextValue,
  DEFAULT_SLOT,
  Form,
  Key,
  OverlayTriggerStateContext,
  Provider,
  Cell as RACCell,
  CellProps as RACCellProps,
  CheckboxContext as RACCheckboxContext,
  Column as RACColumn,
  ColumnProps as RACColumnProps,
  Popover as RACPopover,
  Row as RACRow,
  RowProps as RACRowProps,
  Table as RACTable,
  TableBody as RACTableBody,
  TableBodyProps as RACTableBodyProps,
  TableHeader as RACTableHeader,
  TableHeaderProps as RACTableHeaderProps,
  TableProps as RACTableProps,
  Rect,
  ResizableTableContainer,
  RowRenderProps,
  TableBodyRenderProps,
  TableLayout,
  TableLoadMoreItem,
  TableRenderProps,
  useSlottedContext,
  useTableOptions,
  Virtualizer
} from 'react-aria-components';
import {ButtonGroup} from './ButtonGroup';
import {centerPadding, colorScheme, controlFont, getAllowedOverrides, StylesPropWithHeight, UnsafeStyles} from './style-utils' with {type: 'macro'};
import {Checkbox} from './Checkbox';
import Checkmark from '../s2wf-icons/S2_Icon_Checkmark_20_N.svg';
import Chevron from '../ui-icons/Chevron';
import Close from '../s2wf-icons/S2_Icon_Close_20_N.svg';
import {ColumnSize} from '@react-types/table';
import {CustomDialog, DialogContainer} from '..';
import {DOMProps, DOMRef, DOMRefValue, forwardRefType, GlobalDOMAttributes, LinkDOMProps, LoadingState, Node} from '@react-types/shared';
import {getActiveElement, getOwnerDocument, useLayoutEffect, useObjectRef} from '@react-aria/utils';
import {GridNode} from '@react-types/grid';
import {IconContext} from './Icon';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {LayoutNode} from '@react-stately/layout';
import {Menu, MenuItem, MenuSection, MenuTrigger} from './Menu';
import Nubbin from '../ui-icons/S2_MoveHorizontalTableWidget.svg';
import {ProgressCircle} from './ProgressCircle';
import {raw} from '../style/style-macro' with {type: 'macro'};
import React, {createContext, CSSProperties, FormEvent, FormHTMLAttributes, ForwardedRef, forwardRef, ReactElement, ReactNode, RefObject, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import SortDownArrow from '../s2wf-icons/S2_Icon_SortDown_20_N.svg';
import SortUpArrow from '../s2wf-icons/S2_Icon_SortUp_20_N.svg';
import {Button as SpectrumButton} from './Button';
import {useActionBarContainer} from './ActionBar';
import {useDOMRef, useMediaQuery} from '@react-spectrum/utils';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useScale} from './utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';
import {VisuallyHidden} from 'react-aria';

interface S2TableProps {
  /** Whether the Table should be displayed with a quiet style. */
  isQuiet?: boolean,
  /**
   * Sets the amount of vertical padding within each cell.
   * @default 'regular'
   */
  density?: 'compact' | 'spacious' | 'regular',
  /**
   * Sets the overflow behavior for the cell contents.
   * @default 'truncate'
   */
  overflowMode?: 'wrap' | 'truncate',
  // TODO: will we contine with onAction or rename to onRowAction like it is in RAC?
  /** Handler that is called when a user performs an action on a row. */
  onAction?: (key: Key) => void,
  /**
   * Handler that is called when a user starts a column resize.
   */
  onResizeStart?: (widths: Map<Key, ColumnSize>) => void,
  /**
   * Handler that is called when a user performs a column resize.
   * Can be used with the width property on columns to put the column widths into
   * a controlled state.
   */
  onResize?: (widths: Map<Key, ColumnSize>) => void,
  /**
   * Handler that is called after a user performs a column resize.
   * Can be used to store the widths of columns for another future session.
   */
  onResizeEnd?: (widths: Map<Key, ColumnSize>) => void,
  /** The current loading state of the table. */
  loadingState?: LoadingState,
  /** Handler that is called when more items should be loaded, e.g. while scrolling near the bottom. */
  onLoadMore?: () => any,
  /** Provides the ActionBar to display when rows are selected in the TableView. */
  renderActionBar?: (selectedKeys: 'all' | Set<Key>) => ReactElement
}

// TODO: Note that loadMore and loadingState are now on the Table instead of on the TableBody
export interface TableViewProps extends Omit<RACTableProps, 'style' | 'className' | 'onRowAction' | 'selectionBehavior' | 'onScroll' | 'onCellAction' | 'dragAndDropHooks' | keyof GlobalDOMAttributes>, DOMProps, UnsafeStyles, S2TableProps {
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight
}

let InternalTableContext = createContext<TableViewProps & {layout?: S2TableLayout<unknown>, setIsInResizeMode?:(val: boolean) => void, isInResizeMode?: boolean, selectionMode?: 'none' | 'single' | 'multiple'}>({});

const tableWrapper = style({
  minHeight: 0,
  minWidth: 0,
  display: 'flex',
  isolation: 'isolate',
  disableTapHighlight: true,
  position: 'relative',
  // Clip ActionBar animation.
  overflow: 'clip'
}, getAllowedOverrides({height: true}));

const table = style<TableRenderProps & S2TableProps & {isCheckboxSelection?: boolean}>({
  width: 'full',
  height: 'full',
  boxSizing: 'border-box',
  userSelect: 'none',
  minHeight: 0,
  minWidth: 0,
  fontFamily: 'sans',
  fontWeight: 'normal',
  overflow: 'auto',
  backgroundColor: {
    default: 'gray-25',
    isQuiet: 'transparent',
    forcedColors: 'Background'
  },
  borderColor: 'gray-300',
  borderStyle: 'solid',
  borderWidth: {
    default: 1,
    isQuiet: 0
  },
  ...focusRing(),
  outlineOffset: -1, // Cover the border
  borderRadius: {
    default: '[6px]',
    isQuiet: 'none'
  },
  // Multiple browser bugs from scrollIntoView and scrollPadding:
  // Bug: Table doesn't scroll items into view perfectly in Chrome
  // https://issues.chromium.org/issues/365913982
  // Bug: Table scrolls to the left when navigating up/down through the checkboxes when body is scrolled to the right.
  // https://issues.chromium.org/issues/40067778
  // https://bugs.webkit.org/show_bug.cgi?id=272799
  // Base reproduction: https://codepen.io/lfdanlu/pen/zYVVGPW
  scrollPaddingTop: 32,
  scrollPaddingStart: {
    isCheckboxSelection: 40
  }
});

// component-height-100
const DEFAULT_HEADER_HEIGHT = {
  medium: 32,
  large: 40
};

const ROW_HEIGHTS = {
  compact: {
    medium: 32, // table-row-height-medium-compact (aka component-height-100)
    large: 40
  },
  regular: {
    medium: 40, // table-row-height-medium-regular
    large: 50
  },
  spacious: {
    medium: 48, // table-row-height-medium-spacious
    large: 60
  }
};

export class S2TableLayout<T> extends TableLayout<T> {
  protected isStickyColumn(node: GridNode<T>): boolean {
    return node.props.isSticky;
  }

  protected buildCollection(): LayoutNode[] {
    let [header, body] = super.buildCollection();
    if (!header) {
      return [];
    }
    let {layoutInfo} = body;
    // TableLayout's buildCollection always sets the body width to the max width between the header width, but
    // we want the body to be sticky and only as wide as the table so it is always in view if loading/empty
    let isEmptyOrLoading = this.virtualizer?.collection.size === 0;
    if (isEmptyOrLoading) {
      layoutInfo.rect.width = this.virtualizer!.visibleRect.width - 80;
    }

    return [
      header,
      body
    ];
  }

  protected buildLoader(node: Node<T>, x: number, y: number): LayoutNode {
    let layoutNode = super.buildLoader(node, x, y);
    let {layoutInfo} = layoutNode;
    layoutInfo.allowOverflow = true;
    layoutInfo.rect.width = this.virtualizer!.visibleRect.width;
    // If performing first load or empty, the body will be sticky so we don't want to apply sticky to the loader, otherwise it will
    // affect the positioning of the empty state renderer
    let collection = this.virtualizer!.collection;
    let isEmptyOrLoading = collection?.size === 0;
    layoutInfo.isSticky = !isEmptyOrLoading;
    return layoutNode;
  }

  // y is the height of the headers
  protected buildBody(y: number): LayoutNode {
    let layoutNode = super.buildBody(y);
    let {layoutInfo} = layoutNode;
    // Needs overflow for sticky loader
    layoutInfo.allowOverflow = true;
    // If loading or empty, we'll want the body to be sticky and centered
    let isEmptyOrLoading = this.virtualizer?.collection.size === 0;
    if (isEmptyOrLoading) {
      layoutInfo.rect = new Rect(40, 40, this.virtualizer!.visibleRect.width - 80, this.virtualizer!.visibleRect.height - 80);
      layoutInfo.isSticky = true;
    }

    return {...layoutNode, layoutInfo};
  }

  protected buildRow(node: GridNode<T>, x: number, y: number): LayoutNode {
    let layoutNode = super.buildRow(node, x, y);
    layoutNode.layoutInfo.allowOverflow = true;
    // Needs overflow for sticky selection/drag cells
    return layoutNode;
  }

  protected buildTableHeader(): LayoutNode {
    let layoutNode = super.buildTableHeader();
    // Needs overflow for sticky selection/drag column
    layoutNode.layoutInfo.allowOverflow = true;
    return layoutNode;
  }

  protected buildColumn(node: GridNode<T>, x: number, y: number): LayoutNode {
    let layoutNode = super.buildColumn(node, x, y);
    // Needs overflow for the resize handle
    layoutNode.layoutInfo.allowOverflow = true;
    return layoutNode;
  }
}

export const TableContext = createContext<ContextValue<Partial<TableViewProps>, DOMRefValue<HTMLDivElement>>>(null);

/**
 * Tables are containers for displaying information. They allow users to quickly scan, sort, compare, and take action on large amounts of data.
 */
export const TableView = forwardRef(function TableView(props: TableViewProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, TableContext);
  let {
    UNSAFE_style,
    UNSAFE_className,
    isQuiet = false,
    density = 'regular',
    overflowMode = 'truncate',
    styles,
    loadingState,
    onResize: propsOnResize,
    onResizeStart: propsOnResizeStart,
    onResizeEnd: propsOnResizeEnd,
    onAction,
    onLoadMore,
    selectionMode = 'none',
    ...otherProps
  } = props;

  let domRef = useDOMRef(ref);
  let scale = useScale();

  // Starts when the user selects resize from the menu, ends when resizing ends
  // used to control the visibility of the resizer Nubbin
  let [isInResizeMode, setIsInResizeMode] = useState(false);
  let onResizeStart = useCallback((widths) => {
    propsOnResizeStart?.(widths);
  }, [propsOnResizeStart]);
  let onResizeEnd = useCallback((widths) => {
    setIsInResizeMode(false);
    propsOnResizeEnd?.(widths);
  }, [propsOnResizeEnd, setIsInResizeMode]);

  let context = useMemo(() => ({
    isQuiet,
    density,
    overflowMode,
    loadingState,
    onLoadMore,
    isInResizeMode,
    setIsInResizeMode,
    selectionMode
  }), [isQuiet, density, overflowMode, loadingState, onLoadMore, isInResizeMode, setIsInResizeMode, selectionMode]);

  let scrollRef = useRef<HTMLElement | null>(null);
  let isCheckboxSelection = selectionMode === 'multiple' || selectionMode === 'single';

  let {selectedKeys, onSelectionChange, actionBar, actionBarHeight} = useActionBarContainer({...props, scrollRef});

  return (
    <ResizableTableContainer
      // TODO: perhaps this ref should be attached to the RACTable but it expects a table type ref which isn't true in the virtualized case
      ref={domRef}
      onResize={propsOnResize}
      onResizeEnd={onResizeEnd}
      onResizeStart={onResizeStart}
      className={(UNSAFE_className || '') + tableWrapper(null, styles)}
      style={UNSAFE_style}>
      <Virtualizer
        layout={S2TableLayout}
        layoutOptions={{
          rowHeight: overflowMode === 'wrap'
            ? undefined
            : ROW_HEIGHTS[density][scale],
          estimatedRowHeight: overflowMode === 'wrap'
          ? ROW_HEIGHTS[density][scale]
          : undefined,
          // No need for estimated headingHeight since the headers aren't affected by overflow mode: wrap
          headingHeight: DEFAULT_HEADER_HEIGHT[scale],
          loaderHeight: 60
        }}>
        <InternalTableContext.Provider value={context}>
          <RACTable
            ref={scrollRef as any}
            style={{
              // Fix webkit bug where scrollbars appear above the checkboxes/other table elements
              WebkitTransform: 'translateZ(0)',
              // Add padding at the bottom when the action bar is visible so users can scroll to the last items.
              // Also add scroll padding so navigating with the keyboard doesn't go behind the action bar.
              paddingBottom: actionBarHeight > 0 ? actionBarHeight + 8 : 0,
              scrollPaddingBottom: actionBarHeight > 0 ? actionBarHeight + 8 : 0
            }}
            className={renderProps => table({
              ...renderProps,
              isCheckboxSelection,
              isQuiet
            })}
            selectionBehavior="toggle"
            selectionMode={selectionMode}
            onRowAction={onAction}
            {...otherProps}
            selectedKeys={selectedKeys}
            defaultSelectedKeys={undefined}
            onSelectionChange={onSelectionChange} />
        </InternalTableContext.Provider>
      </Virtualizer>
      {actionBar}
    </ResizableTableContainer>
  );
});

const centeredWrapper = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'full',
  height: 'full'
});

export interface TableBodyProps<T> extends Omit<RACTableBodyProps<T>, 'style' | 'className' | keyof GlobalDOMAttributes> {}

/**
 * The body of a `<Table>`, containing the table rows.
 */
export const TableBody = /*#__PURE__*/ (forwardRef as forwardRefType)(function TableBody<T extends object>(props: TableBodyProps<T>, ref: DOMRef<HTMLDivElement>) {
  let {items, renderEmptyState, children, dependencies = []} = props;
  let domRef = useDOMRef(ref);
  let {loadingState, onLoadMore} = useContext(InternalTableContext);
  let isLoading = loadingState === 'loading' || loadingState === 'loadingMore';
  let emptyRender;
  let renderer = children;
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');
  // TODO: still is offset strangely if loadingMore when there aren't any items in the table, see http://localhost:6006/?path=/story/tableview--empty-state&args=loadingState:loadingMore
  // This is because we don't distinguish between loadingMore and loading in the layout, resulting in a different rect being used to build the body. Perhaps can be considered as a user error
  // if they pass loadingMore without having any other items in the table. Alternatively, could update the layout so it knows the current loading state.
  let loadMoreSpinner = (
    <TableLoadMoreItem isLoading={loadingState === 'loadingMore'} onLoadMore={onLoadMore} className={style({height: 'full', width: 'full'})}>
      <div className={centeredWrapper}>
        <ProgressCircle
          isIndeterminate
          aria-label={stringFormatter.format('table.loadingMore')} />
      </div>
    </TableLoadMoreItem>
  );

  // If the user is rendering their rows in dynamic fashion, wrap their render function in Collection so we can inject
  // the loader. Otherwise it is a static renderer and thus we can simply add the table loader after
  // TODO: this assumes that the user isn't providing their children in some wrapper though and/or isn't doing a map of children
  // (though I guess they wouldn't provide items then so the check for this is still valid in the latter case)...
  if (typeof children === 'function' && items) {
    renderer = (
      <>
        <Collection items={items} dependencies={dependencies}>
          {children}
        </Collection>
        {loadMoreSpinner}
      </>
    );
  } else {
    renderer = (
      <>
        {children}
        {loadMoreSpinner}
      </>
    );
  }

  if (renderEmptyState != null && !isLoading) {
    emptyRender = (props: TableBodyRenderProps) => (
      <div className={centeredWrapper}>
        {renderEmptyState(props)}
      </div>
    );
  } else if (loadingState === 'loading') {
    emptyRender = () => (
      <div className={centeredWrapper}>
        <ProgressCircle
          isIndeterminate
          aria-label={stringFormatter.format('table.loading')} />
      </div>
    );
  }

  return (
    <RACTableBody
      // @ts-ignore
      ref={domRef}
      className={style({height: 'full'})}
      {...props}
      renderEmptyState={emptyRender}
      dependencies={[loadingState]}>
      {renderer}
    </RACTableBody>
  );
});

const cellFocus = {
  outlineStyle: {
    default: 'none',
    isFocusVisible: 'solid'
  },
  outlineOffset: -2,
  outlineWidth: 2,
  outlineColor: 'focus-ring',
  borderRadius: '[6px]'
} as const;

function CellFocusRing() {
  return <div role="presentation" className={style({...cellFocus, position: 'absolute', inset: 0, pointerEvents: 'none'})({isFocusVisible: true})} />;
}

const columnStyles = style({
  height: 'inherit',
  boxSizing: 'border-box',
  color: {
    default: baseColor('neutral'),
    forcedColors: 'ButtonText'
  },
  paddingX: {
    default: 16,
    isMenu: 0
  },
  textAlign: {
    align: {
      start: 'start',
      center: 'center',
      end: 'end'
    }
  },
  outlineStyle: 'none',
  position: 'relative',
  fontSize: controlFont(),
  fontFamily: 'sans',
  fontWeight: 'bold',
  display: 'flex',
  borderColor: {
    default: 'gray-300',
    forcedColors: 'ButtonBorder'
  },
  borderTopWidth: {
    default: 0,
    isQuiet: 1
  },
  borderBottomWidth: 1,
  borderStartWidth: 0,
  borderEndWidth: {
    default: 0,
    isMenu: 1
  },
  borderStyle: 'solid',
  forcedColorAdjust: 'none'
});

export interface ColumnProps extends Omit<RACColumnProps, 'style' | 'className' | keyof GlobalDOMAttributes> {
  /** Whether the column should render a divider between it and the next column. */
  showDivider?: boolean,
  /** Whether the column allows resizing. */
  allowsResizing?: boolean,
  /**
   * The alignment of the column's contents relative to its allotted width.
   * @default 'start'
   */
  align?: 'start' | 'center' | 'end',
  /** The content to render as the column header. */
  children: ReactNode,
  /** Menu fragment to be rendered inside the column header's menu. */
  menuItems?: ReactNode
}

/**
 * A column within a `<Table>`.
 */
export const Column = forwardRef(function Column(props: ColumnProps, ref: DOMRef<HTMLDivElement>) {
  let {isQuiet} = useContext(InternalTableContext);
  let {allowsResizing, children, align = 'start'} = props;
  let domRef = useDOMRef(ref);
  let isMenu = allowsResizing || !!props.menuItems;


  return (
    <RACColumn {...props} ref={domRef} style={{borderInlineEndColor: 'transparent'}} className={renderProps => columnStyles({...renderProps, isMenu, align, isQuiet})}>
      {({allowsSorting, sortDirection, isFocusVisible, sort, startResize}) => (
        <>
          {/* Note this is mainly for column's without a dropdown menu. If there is a dropdown menu, the button is styled to have a focus ring for simplicity
          (no need to juggle showing this focus ring if focus is on the menu button and not if it is on the resizer) */}
          {/* Separate absolutely positioned element because appyling the ring on the column directly via outline means the ring's required borderRadius will cause the bottom gray border to curve as well */}
          {isFocusVisible && <CellFocusRing />}
          {isMenu ?
            (
              <ColumnWithMenu isColumnResizable={allowsResizing} menuItems={props.menuItems} allowsSorting={allowsSorting} sortDirection={sortDirection} sort={sort} startResize={startResize} align={align}>
                {children}
              </ColumnWithMenu>
            ) : (
              <ColumnContents align={align} allowsSorting={allowsSorting} sortDirection={sortDirection}>
                {children}
              </ColumnContents>
            )
          }
        </>
      )}
    </RACColumn>
  );
});

const columnContentWrapper = style({
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  width: 'full',
  justifyContent: {
    align: {
      default: 'start',
      center: 'center',
      end: 'end'
    }
  }
});

const sortIcon = style({
  size: fontRelative(16),
  flexShrink: 0,
  marginEnd: {
    default: 8,
    isButton: 'text-to-visual'
  },
  verticalAlign: 'bottom',
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
});

interface ColumnContentProps extends Pick<ColumnRenderProps, 'allowsSorting' | 'sortDirection'>, Pick<ColumnProps, 'align' | 'children'> {}

function ColumnContents(props: ColumnContentProps) {
  let {align, allowsSorting, sortDirection, children} = props;

  return (
    <div className={columnContentWrapper({align})}>
      {allowsSorting && (
        <Provider
          values={[
            [IconContext, {
              styles: sortIcon({})
            }]
          ]}>
          {sortDirection != null && (
            sortDirection === 'ascending' ? <SortUpArrow /> : <SortDownArrow />
          )}
        </Provider>
      )}
      <span className={columnHeaderText}>
        {children}
      </span>
    </div>
  );
}

const resizableMenuButtonWrapper = style({
  ...cellFocus,
  color: 'gray-800', // body-color
  width: 'full',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: {
    align: {
      default: 'start',
      center: 'center',
      end: 'end'
    }
  },
  // TODO: when align: end, the dropdown arrow is misaligned with the text, not sure how best to make the svg be flush with the end of the button other than modifying the
  // paddingEnd
  paddingX: 16,
  backgroundColor: 'transparent',
  borderStyle: 'none',
  fontSize: controlFont(),
  fontFamily: 'sans',
  fontWeight: 'bold'
});

const resizerHandleContainer = style({
  display: {
    default: '--resizerDisplay',
    isResizing: 'block',
    isInResizeMode: 'block'
  },
  width: 12,
  height: 'full',
  position: 'absolute',
  top: 0,
  insetEnd: space(-6),
  cursor: {
    default: 'none',
    resizableDirection: {
      'left': 'e-resize',
      'right': 'w-resize',
      'both': 'ew-resize'
    }
  }
});

const resizerHandle = style<{isFocusVisible: boolean, isResizing: boolean}>({
  backgroundColor: {
    default: 'gray-300',
    isFocusVisible: lightDark('informative-900', 'informative-700'), // --spectrum-informative-background-color-default, can't use `informative` because that will use the focusVisible version
    isResizing: lightDark('informative-900', 'informative-700'),
    forcedColors: {
      default: 'Background',
      isFocusVisible: 'Highlight',
      isResizing: 'Highlight'
    }
  },
  height: {
    default: 'full',
    isResizing: 'screen'
  },
  width: {
    default: 1,
    isResizing: 2
  },
  position: 'absolute',
  insetStart: space(6)
});

const columnHeaderText = style({
  truncate: true,
  // Make it so the text doesn't completely disappear when column is resized to smallest width + both sort and chevron icon is rendered
  minWidth: fontRelative(16),
  flexGrow: 0,
  flexShrink: 1,
  flexBasis: 'auto'
});

const chevronIcon = style({
  rotate: 90,
  marginStart: 'text-to-visual',
  minWidth: fontRelative(16),
  flexShrink: 0,
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
});

const nubbin = style({
  position: 'absolute',
  top: 0,
  insetStart: space(-1),
  size: fontRelative(16),
  fill: {
    default: lightDark('informative-900', 'informative-700'), // --spectrum-informative-background-color-default, can't use `informative` because that won't be the background color value
    forcedColors: 'Highlight'
  },
  '--iconPrimary': {
    type: 'fill',
    value: {
      default: 'white',
      forcedColors: 'HighlightText'
    }
  }
});

interface ColumnWithMenuProps extends Pick<ColumnRenderProps, 'allowsSorting' | 'sort' | 'sortDirection' | 'startResize'>, Pick<ColumnProps, 'align' | 'children'> {
  isColumnResizable?: boolean,
  menuItems?: ReactNode
}

function ColumnWithMenu(props: ColumnWithMenuProps) {
  let {allowsSorting, sortDirection, sort, startResize, children, align, isColumnResizable, menuItems} = props;
  let {setIsInResizeMode, isInResizeMode} = useContext(InternalTableContext);
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');
  const onMenuSelect = (key) => {
    switch (key) {
      case 'sort-asc':
        sort('ascending');
        break;
      case 'sort-desc':
        sort('descending');
        break;
      case 'resize':
        setIsInResizeMode?.(true);
        startResize();
        break;
    }
  };

  let items = useMemo(() => {
    let options: Array<{label: string, id: string}> = [];
    if (isColumnResizable) {
      options = [{
        label: stringFormatter.format('table.resizeColumn'),
        id: 'resize'
      }];
    }
    if (allowsSorting) {
      options = [
        {
          label: stringFormatter.format('table.sortAscending'),
          id: 'sort-asc'
        },
        {
          label: stringFormatter.format('table.sortDescending'),
          id: 'sort-desc'
        },
        ...options
      ];
    }
    return options;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowsSorting, isColumnResizable]);

  let buttonAlignment = 'start';
  let menuAlign = 'start' as 'start' | 'end';
  if (align === 'center') {
    buttonAlignment = 'center';
  } else if (align === 'end') {
    buttonAlignment = 'end';
    menuAlign = 'end';
  }

  return (
    <>
      <MenuTrigger align={menuAlign}>
        <Button className={(renderProps) => resizableMenuButtonWrapper({...renderProps, align: buttonAlignment})}>
          {allowsSorting && (
            <Provider
              values={[
                [IconContext, {
                  styles: sortIcon({isButton: true})
                }]
              ]}>
              {sortDirection != null && (
                sortDirection === 'ascending' ? <SortUpArrow /> : <SortDownArrow />
              )}
            </Provider>
          )}
          <div className={columnHeaderText}>
            {children}
          </div>
          <Chevron size="M" className={chevronIcon} />
        </Button>
        <Menu onAction={onMenuSelect} styles={style({minWidth: 128})}>
          {items.length > 0 && (
            <MenuSection>
              <Collection items={items}>
                {(item) => <MenuItem>{item?.label}</MenuItem>}
              </Collection>
            </MenuSection>
          )}
          {menuItems}
        </Menu>
      </MenuTrigger>
      {isColumnResizable && (
        <div data-react-aria-prevent-focus="true">
          <ColumnResizer data-react-aria-prevent-focus="true" className={({resizableDirection, isResizing}) => resizerHandleContainer({resizableDirection, isResizing, isInResizeMode})}>
            {({isFocusVisible, isResizing}) => (
              <>
                <ResizerIndicator isFocusVisible={isFocusVisible} isResizing={isResizing} />
                {(isFocusVisible || isInResizeMode) && isResizing && <div className={nubbin}><Nubbin /></div>}
              </>
          )}
          </ColumnResizer>
        </div>
      )}
    </>
  );
}

function ResizerIndicator({isFocusVisible, isResizing}) {
  return (
    <div className={resizerHandle({isFocusVisible, isResizing})} />
  );
}

const tableHeader = style({
  height: 'full',
  width: 'full',
  backgroundColor: 'gray-75',
  // Attempt to prevent 1px area where you can see scrolled cell content between the table outline and the table header
  marginTop: '[-1px]',
  '--resizerDisplay': {
    type: 'display',
    value: {
      default: 'none',
      isHovered: 'block'
    }
  }
});

const selectAllCheckbox = style({
  marginStart: 16 // table-edge-to-content, same between mobile and desktop
});

const selectAllCheckboxColumn = style({
  padding: 0,
  height: 'full',
  boxSizing: 'border-box',
  outlineStyle: 'none',
  position: 'relative',
  alignContent: 'center',
  borderColor: {
    default: 'gray-300',
    forcedColors: 'ButtonBorder'
  },
  borderXWidth: 0,
  borderTopWidth: {
    default: 0,
    isQuiet: 1
  },
  borderBottomWidth: 1,
  borderStyle: 'solid',
  backgroundColor: 'gray-75'
});

export interface TableHeaderProps<T> extends Omit<RACTableHeaderProps<T>, 'style' | 'className' | 'onHoverChange' | 'onHoverStart' | 'onHoverEnd' | keyof GlobalDOMAttributes> {}

/**
 * A header within a `<Table>`, containing the table columns.
 */
export const TableHeader = /*#__PURE__*/ (forwardRef as forwardRefType)(function TableHeader<T extends object>({columns, dependencies, children}: TableHeaderProps<T>, ref: DOMRef<HTMLDivElement>) {
  let scale = useScale();
  let {selectionBehavior, selectionMode} = useTableOptions();
  let {isQuiet} = useContext(InternalTableContext);
  let domRef = useDOMRef(ref);

  return (
    <RACTableHeader
      // @ts-ignore
      ref={domRef}
      className={tableHeader}>
      {/* Add extra columns for selection. */}
      {selectionBehavior === 'toggle' && (
        // Also isSticky prop is applied just for the layout, will decide what the RAC api should be later
        // @ts-ignore
        <RACColumn isSticky width={scale === 'medium' ? 40 : 52} minWidth={scale === 'medium' ? 40 : 52} className={selectAllCheckboxColumn({isQuiet})}>
          {({isFocusVisible}) => (
            <>
              {selectionMode === 'single' &&
                <>
                  {isFocusVisible && <CellFocusRing />}
                  <VisuallyHiddenSelectAllLabel />
                </>
              }
              {selectionMode === 'multiple' &&
                <Checkbox styles={selectAllCheckbox} slot="selection" />
              }
            </>
          )}
        </RACColumn>
      )}
      <Collection items={columns} dependencies={dependencies}>
        {children}
      </Collection>
    </RACTableHeader>
  );
});

function VisuallyHiddenSelectAllLabel() {
  let checkboxProps = useSlottedContext(RACCheckboxContext, 'selection');

  return (
    <VisuallyHidden>{checkboxProps?.['aria-label']}</VisuallyHidden>
  );
}

const commonCellStyles = {
  borderColor: 'transparent',
  borderBottomWidth: 1,
  borderTopWidth: 0,
  borderXWidth: 0,
  borderStyle: 'solid',
  position: 'relative',
  color: {
    default: 'gray-800',
    forcedColors: 'ButtonText'
  },
  outlineStyle: 'none',
  paddingX: 16 // table-edge-to-content
} as const;

const cell = style<CellRenderProps & S2TableProps & {isDivider: boolean}>({
  ...commonCellStyles,
  color: {
    default: baseColor('neutral-subdued'),
    isSelected: baseColor('neutral')
  },
  paddingY: centerPadding(),
  minHeight: {
    default: 40,
    density: {
      compact: 32,
      spacious: 48
    }
  },
  boxSizing: 'border-box',
  height: 'full',
  width: 'full',
  fontSize: controlFont(),
  alignItems: 'center',
  display: 'flex',
  borderStyle: {
    default: 'none',
    isDivider: 'solid'
  },
  borderEndWidth: {
    default: 0,
    isDivider: 1
  },
  borderColor: {
    default: 'gray-300',
    forcedColors: 'ButtonBorder'
  }
});

const stickyCell = {
  backgroundColor: 'gray-25'
} as const;

const checkboxCellStyle = style({
  ...commonCellStyles,
  ...stickyCell,
  paddingStart: 16,
  alignContent: 'center',
  height: 'calc(100% - 1px)',
  borderBottomWidth: 0,
  backgroundColor: '--rowBackgroundColor'
});

const cellContent = style({
  truncate: true,
  whiteSpace: {
    default: 'nowrap',
    overflowMode: {
      wrap: 'normal'
    }
  },
  textAlign: {
    align: {
      start: 'start',
      center: 'center',
      end: 'end'
    }
  },
  width: 'full',
  isolation: 'isolate',
  padding: {
    default: 4,
    isSticky: 0
  },
  margin: {
    default: -4,
    isSticky: 0
  },
  backgroundColor: {
    default: 'transparent',
    isSticky: '--rowBackgroundColor'
  }
});

export interface CellProps extends Omit<RACCellProps, 'style' | 'className' | keyof GlobalDOMAttributes>, Pick<ColumnProps, 'align' | 'showDivider'> {
  /** @private */
  isSticky?: boolean,
  /** The content to render as the cell children. */
  children: ReactNode
}

/**
 * A cell within a table row.
 */
export const Cell = forwardRef(function Cell(props: CellProps, ref: DOMRef<HTMLDivElement>) {
  let {children, isSticky, showDivider = false, align, textValue, ...otherProps} = props;
  let domRef = useDOMRef(ref);
  let tableVisualOptions = useContext(InternalTableContext);
  textValue ||= typeof children === 'string' ? children : undefined;

  return (
    <RACCell
      ref={domRef}
      // Also isSticky prop is applied just for the layout, will decide what the RAC api should be later
      // @ts-ignore
      isSticky={isSticky}
      className={renderProps => cell({
        ...renderProps,
        ...tableVisualOptions,
        isDivider: showDivider
      })}
      textValue={textValue}
      {...otherProps}>
      {({isFocusVisible}) => (
        <>
          <span className={cellContent({...tableVisualOptions, isSticky, align: align || 'start'})}>{children}</span>
          {isFocusVisible && <CellFocusRing />}
        </>
      )}
    </RACCell>
  );
});


const editableCell = style<CellRenderProps & S2TableProps & {isDivider: boolean, selectionMode?: 'none' | 'single' | 'multiple', isSaving?: boolean}>({
  ...commonCellStyles,
  color: {
    default: baseColor('neutral'),
    isSaving: baseColor('neutral-subdued')
  },
  paddingY: centerPadding(),
  boxSizing: 'border-box',
  height: 'calc(100% - 1px)', // so we don't overlap the border of the next cell
  width: 'full',
  fontSize: controlFont(),
  alignItems: 'center',
  display: 'flex',
  borderStyle: {
    default: 'none',
    isDivider: 'solid'
  },
  borderEndWidth: {
    default: 0,
    isDivider: 1
  },
  borderColor: {
    default: 'gray-300',
    forcedColors: 'ButtonBorder'
  }
});

let editPopover = style({
  ...colorScheme(),
  '--s2-container-bg': {
    type: 'backgroundColor',
    value: 'layer-2'
  },
  backgroundColor: '--s2-container-bg',
  borderBottomRadius: 'default',
  // Use box-shadow instead of filter when an arrow is not shown.
  // This fixes the shadow stacking problem with submenus.
  boxShadow: 'elevated',
  borderStyle: 'solid',
  borderWidth: 1,
  borderColor: {
    default: 'gray-200',
    forcedColors: 'ButtonBorder'
  },
  boxSizing: 'content-box',
  isolation: 'isolate',
  pointerEvents: {
    isExiting: 'none'
  },
  outlineStyle: 'none',
  minWidth: '--trigger-width',
  padding: 8,
  display: 'flex',
  alignItems: 'center'
}, getAllowedOverrides());

interface EditableCellProps extends Omit<CellProps, 'isSticky'> {
  /** The component which will handle editing the cell. For example, a `TextField` or a `Picker`. */
  renderEditing: () => ReactNode,
  /** Whether the cell is currently being saved. */
  isSaving?: boolean,
  /** Handler that is called when the value has been changed and is ready to be saved. */
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void,
  /** Handler that is called when the user cancels the edit. */
  onCancel?: () => void,
  /** The action to submit the form to. Only available in React 19+. */
  action?: string | FormHTMLAttributes<HTMLFormElement>['action']
}

/**
 * An editable cell within a table row.
 */
export const EditableCell = forwardRef(function EditableCell(props: EditableCellProps, ref: ForwardedRef<HTMLDivElement>) {
  let {children, showDivider = false, textValue, isSaving, ...otherProps} = props;
  let tableVisualOptions = useContext(InternalTableContext);
  let domRef = useObjectRef(ref);
  textValue ||= typeof children === 'string' ? children : undefined;

  return (
    <RACCell
      ref={domRef}
      className={renderProps => editableCell({
        ...renderProps,
        ...tableVisualOptions,
        isDivider: showDivider,
        isSaving
      })}
      textValue={textValue}
      {...otherProps}>
      {({isFocusVisible}) => (
        <EditableCellInner {...props} isFocusVisible={isFocusVisible} cellRef={domRef as RefObject<HTMLDivElement>} />
      )}
    </RACCell>
  );
});

const nonTextInputTypes = new Set([
  'checkbox',
  'radio',
  'range',
  'color',
  'file',
  'image',
  'button',
  'submit',
  'reset'
]);

function EditableCellInner(props: EditableCellProps & {isFocusVisible: boolean, cellRef: RefObject<HTMLDivElement>}) {
  let {children, align, renderEditing, isSaving, onSubmit, isFocusVisible, cellRef, action, onCancel} = props;
  let [isOpen, setIsOpen] = useState(false);
  let popoverRef = useRef<HTMLDivElement>(null);
  let formRef = useRef<HTMLFormElement>(null);
  let [triggerWidth, setTriggerWidth] = useState(0);
  let [tableWidth, setTableWidth] = useState(0);
  let [verticalOffset, setVerticalOffset] = useState(0);
  let tableVisualOptions = useContext(InternalTableContext);
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');
  let dialogRef = useRef<DOMRefValue<HTMLElement>>(null);

  let {density} = useContext(InternalTableContext);
  let size: 'XS' | 'S' | 'M' | 'L' | 'XL' | undefined = 'M';
  if (density === 'compact') {
    size = 'S';
  } else if (density === 'spacious') {
    size = 'L';
  }

  // Popover positioning
  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }
    let width = cellRef.current?.clientWidth || 0;
    let cell = cellRef.current;
    let boundingRect = cell?.parentElement?.getBoundingClientRect();
    let verticalOffset = (boundingRect?.top ?? 0) - (boundingRect?.bottom ?? 0);

    let tableWidth = cellRef.current?.closest('[role="grid"]')?.clientWidth || 0;
    setTriggerWidth(width);
    setVerticalOffset(verticalOffset);
    setTableWidth(tableWidth);
  }, [cellRef, density, isOpen]);

  // Auto select the entire text range of the autofocused input on overlay opening
  // Maybe replace with FocusScope or one of those utilities
  useEffect(() => {
    if (isOpen) {
      let activeElement = getActiveElement(getOwnerDocument(formRef.current));
      if (activeElement
        && formRef.current?.contains(activeElement)
        // not going to handle contenteditable https://stackoverflow.com/questions/6139107/programmatically-select-text-in-a-contenteditable-html-element
        // seems like an edge case anyways
        && (
          (activeElement instanceof HTMLInputElement && !nonTextInputTypes.has(activeElement.type))
          || activeElement instanceof HTMLTextAreaElement)
        && typeof activeElement.select === 'function') {
        activeElement.select();
      }
    }
  }, [isOpen]);

  let cancel = useCallback(() => {
    setIsOpen(false);
    onCancel?.();
  }, [onCancel]);

  let isMobile = !useMediaQuery('(hover: hover) and (pointer: fine)');
  // Can't differentiate between Dialog click outside dismissal and Escape key dismissal
  let prevIsOpen = useRef(isOpen);
  useEffect(() => {
    let dialog = dialogRef.current?.UNSAFE_getDOMNode();
    if (isOpen && dialog && !prevIsOpen.current) {
      let handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          cancel();
          e.stopPropagation();
          e.preventDefault();
        }
      };
      dialog.addEventListener('keydown', handler);
      prevIsOpen.current = isOpen;
      return () => {
        dialog.removeEventListener('keydown', handler);
      };
    }
    prevIsOpen.current = isOpen;
  }, [isOpen, cancel]);

  return (
    <Provider
      values={[
        [ButtonContext, null],
        [ActionButtonContext, {
          slots: {
            [DEFAULT_SLOT]: {},
            edit: {
              onPress: () => setIsOpen(true),
              isPending: isSaving,
              isQuiet: !isSaving,
              size,
              excludeFromTabOrder: true,
              styles: style({
                // TODO: really need access to display here instead, but not possible right now
                // will be addressable with displayOuter
                // Could use `hidden` attribute instead of css, but I don't have access to much of this state at the moment
                visibility: {
                  default: 'hidden',
                  isForcedVisible: 'visible',
                  ':is([role="row"]:hover *)': 'visible',
                  ':is([role="row"][data-focus-visible-within] *)': 'visible',
                  '@media not ((hover: hover) and (pointer: fine))': 'visible'
                }
              })({isForcedVisible: isOpen || !!isSaving})
            }
          }
        }]
      ]}>
      <span className={cellContent({...tableVisualOptions, align: align || 'start'})}>{children}</span>
      {isFocusVisible && <CellFocusRing />}

      <Provider
        values={[
          [ActionButtonContext, null]
        ]}>
        {!isMobile && (
          <RACPopover
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            ref={popoverRef}
            shouldCloseOnInteractOutside={() => {
              if (!popoverRef.current?.contains(document.activeElement)) {
                return false;
              }
              formRef.current?.requestSubmit();
              return false;
            }}
            triggerRef={cellRef}
            aria-label={props['aria-label'] ?? stringFormatter.format('table.editCell')}
            offset={verticalOffset}
            placement="bottom start"
            style={{
              minWidth: `min(${triggerWidth}px, ${tableWidth}px)`,
              maxWidth: `${tableWidth}px`,
              // Override default z-index from useOverlayPosition. We use isolation: isolate instead.
              zIndex: undefined
            }}
            className={editPopover}>
            <Provider
              values={[
                [OverlayTriggerStateContext, null]
              ]}>
              <Form
                ref={formRef}
                action={action}
                onSubmit={(e) => {
                  onSubmit?.(e);
                  setIsOpen(false);
                }}
                className={style({width: 'full', display: 'flex', alignItems: 'start', gap: 16})}
                style={{'--input-width': `calc(${triggerWidth}px - 32px)`} as CSSProperties}>
                {renderEditing()}
                <div className={style({display: 'flex', flexDirection: 'row', alignItems: 'baseline', flexShrink: 0, flexGrow: 0})}>
                  <ActionButton isQuiet onPress={cancel} aria-label={stringFormatter.format('table.cancel')}><Close /></ActionButton>
                  <ActionButton isQuiet type="submit" aria-label={stringFormatter.format('table.save')}><Checkmark /></ActionButton>
                </div>
              </Form>
            </Provider>
          </RACPopover>
        )}
        {isMobile && (
          <DialogContainer onDismiss={() => formRef.current?.requestSubmit()}>
            {isOpen && (
              <CustomDialog
                ref={dialogRef}
                isDismissible
                isKeyboardDismissDisabled
                aria-label={props['aria-label'] ?? stringFormatter.format('table.editCell')}>
                <Form
                  ref={formRef}
                  action={action}
                  onSubmit={(e) => {
                    onSubmit?.(e);
                    setIsOpen(false);
                  }}
                  className={style({width: 'full', display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 16})}>
                  {renderEditing()}
                  <ButtonGroup align="end" styles={style({alignSelf: 'end'})}>
                    <SpectrumButton onPress={cancel} variant="secondary" fillStyle="outline">Cancel</SpectrumButton>
                    <SpectrumButton type="submit" variant="accent">Save</SpectrumButton>
                  </ButtonGroup>
                </Form>
              </CustomDialog>
            )}
          </DialogContainer>
        )}
      </Provider>
    </Provider>
  );
};

// Use color-mix instead of transparency so sticky cells work correctly.
const selectedBackground = colorMix('gray-25', 'gray-900', 7);
const selectedActiveBackground = colorMix('gray-25', 'gray-900', 10);
const rowBackgroundColor = {
  default: {
    default: 'gray-25',
    isQuiet: '--s2-container-bg'
  },
  isFocusVisibleWithin: colorMix('gray-25', 'gray-900', 7), // table-row-hover-color
  isHovered: colorMix('gray-25', 'gray-900', 7), // table-row-hover-color
  isPressed: colorMix('gray-25', 'gray-900', 10), // table-row-hover-color
  isSelected: {
    default: selectedBackground, // table-selected-row-background-color, opacity /10
    isFocusVisibleWithin: selectedActiveBackground, // table-selected-row-background-color, opacity /15
    isHovered: selectedActiveBackground, // table-selected-row-background-color, opacity /15
    isPressed: selectedActiveBackground // table-selected-row-background-color, opacity /15
  },
  forcedColors: {
    default: 'Background'
  }
} as const;

const row = style<RowRenderProps & S2TableProps>({
  height: 'full',
  position: 'relative',
  boxSizing: 'border-box',
  backgroundColor: '--rowBackgroundColor',
  '--rowBackgroundColor': {
    type: 'backgroundColor',
    value: rowBackgroundColor
  },
  '--rowFocusIndicatorColor': {
    type: 'outlineColor',
    value: {
      default: 'focus-ring',
      forcedColors: 'Highlight'
    }
  },
  // TODO: outline here is to emulate v3 forcedColors experience but runs into the same problem where the sticky column covers the outline
  // This doesn't quite work because it gets cut off by the checkbox cell background masking element, figure out another way. Could shrink the checkbox cell's content even more
  // and offset it by margin top but that messes up the checkbox centering a bit
  // outlineWidth: {
  //   forcedColors: {
  //     isFocusVisible: 2
  //   }
  // },
  // outlineOffset: {
  //   forcedColors: {
  //     isFocusVisible: -1
  //   }
  // },
  // outlineColor: {
  //   forcedColors: {
  //     isFocusVisible: 'ButtonBorder'
  //   }
  // },
  // outlineStyle: {
  //   default: 'none',
  //   forcedColors: {
  //     isFocusVisible: 'solid'
  //   }
  // },
  outlineStyle: 'none',
  borderTopWidth: 0,
  borderBottomWidth: 1,
  borderStartWidth: 0,
  borderEndWidth: 0,
  borderStyle: 'solid',
  borderColor: {
    default: 'gray-300',
    forcedColors: 'ButtonBorder'
  },
  forcedColorAdjust: 'none'
});

export interface RowProps<T> extends Pick<RACRowProps<T>, 'id' | 'columns' | 'isDisabled' | 'onAction' | 'children' | 'textValue' | 'dependencies' | keyof GlobalDOMAttributes>, LinkDOMProps {}

/**
 * A row within a `<Table>`.
 */
export const Row = /*#__PURE__*/ (forwardRef as forwardRefType)(function Row<T extends object>({id, columns, children, dependencies = [], ...otherProps}: RowProps<T>, ref: DOMRef<HTMLDivElement>) {
  let {selectionBehavior, selectionMode} = useTableOptions();
  let tableVisualOptions = useContext(InternalTableContext);
  let domRef = useDOMRef(ref);

  return (
    <RACRow
      // @ts-ignore
      ref={domRef}
      id={id}
      dependencies={[...dependencies, columns]}
      className={renderProps => row({
        ...renderProps,
        ...tableVisualOptions
      }) + (renderProps.isFocusVisible && ' ' + raw('&:before { content: ""; display: inline-block; position: sticky; inset-inline-start: 0; width: 3px; height: 100%; margin-inline-end: -3px; margin-block-end: 1px;  z-index: 3; background-color: var(--rowFocusIndicatorColor)'))}
      {...otherProps}>
      {selectionMode !== 'none' && selectionBehavior === 'toggle' && (
        // Not sure what we want to do with this className, in Cell it currently overrides the className that would have been applied.
        // The `spread` otherProps must be after className in Cell.
        // @ts-ignore
        <Cell isSticky className={checkboxCellStyle}>
          <Checkbox slot="selection" />
        </Cell>
      )}
      <Collection items={columns} dependencies={[...dependencies, columns]}>
        {children}
      </Collection>
    </RACRow>
  );
});
