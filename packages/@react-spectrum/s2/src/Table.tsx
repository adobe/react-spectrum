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

import {
  Button,
  CellRenderProps,
  Collection,
  ColumnRenderProps,
  ColumnResizer,
  Key,
  Provider,
  Cell as RACCell,
  CellProps as RACCellProps,
  Column as RACColumn,
  ColumnProps as RACColumnProps,
  Row as RACRow,
  RowProps as RACRowProps,
  Table as RACTable,
  TableBody as RACTableBody,
  TableBodyProps as RACTableBodyProps,
  TableHeader as RACTableHeader,
  TableProps as RACTableProps,
  ResizableTableContainer,
  ResizableTableContainerContext,
  RowRenderProps,
  TableBodyRenderProps,
  TableHeaderProps,
  TableRenderProps,
  UNSTABLE_TableLayout,
  UNSTABLE_TableLoadingIndicator,
  UNSTABLE_Virtualizer,
  useTableOptions
} from 'react-aria-components';
import {Checkbox} from './Checkbox';
import Chevron from '../ui-icons/Chevron';
import {ColumnSize} from '@react-types/table';
import {fontRelative, lightDark, size, style} from '../style/spectrum-theme' with {type: 'macro'};
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {GridNode} from '@react-types/grid';
import {IconContext} from './Icon';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {LayoutNode} from '@react-stately/layout';
import {LoadingState, Node} from '@react-types/shared';
import {Menu, MenuItem, MenuTrigger} from './Menu';
import {mergeStyles} from '../style/runtime';
import {ProgressCircle} from './ProgressCircle';
import {raw} from '../style/style-macro' with {type: 'macro'};
import React, {createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState} from 'react';
import {Rect} from '@react-stately/virtualizer';
import SortDownArrow from '../s2wf-icons/S2_Icon_SortDown_20_N.svg';
import SortUpArrow from '../s2wf-icons/S2_Icon_SortUp_20_N.svg';
import {useIsMobileDevice} from './utils';
import {useLoadMore} from '@react-aria/utils';
import {useLocalizedStringFormatter} from '@react-aria/i18n';

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
  /** How selection should be displayed. */
  selectionStyle?: 'checkbox' | 'highlight',
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
  onLoadMore?: () => any
}

// TODO: Note that loadMore and loadingState are now on the Table instead of on the TableBody
export interface TableProps extends Omit<RACTableProps, 'style' | 'disabledBehavior' | 'className' | 'onRowAction' | 'selectionBehavior' | 'onScroll' | 'onCellAction' | 'dragAndDropHooks'>, StyleProps, S2TableProps {
}

let InternalTableContext = createContext<TableProps & {scale?: Scale, layout?: S2TableLayout<unknown>, setIsInResizeMode?:(val: boolean) => void, isInResizeMode?: boolean}>({});

const tableWrapper = style({
  width: 'full'
});

const table = style<TableRenderProps & S2TableProps>({
  height: 'full',
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
  outlineColor: {
    default: 'gray-300',
    isFocusVisible: 'focus-ring',
    forcedColors: 'ButtonBorder'
  },
  outlineWidth: {
    default: 1,
    isQuiet: 0,
    isFocusVisible: 2
  },
  outlineStyle: 'solid',
  borderRadius: {
    default: size(6),
    isQuiet: 'none'
  }
}, getAllowedOverrides({height: true}));

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

type Scale = 'large' | 'medium';

export class S2TableLayout<T> extends UNSTABLE_TableLayout<T> {
  protected isStickyColumn(node: GridNode<T>): boolean {
    return node.props.isSticky;
  }

  protected buildCollection(): LayoutNode[] {
    let [header, body] = super.buildCollection();
    let {children, layoutInfo} = body;
    // TableLayout's buildCollection always sets the body width to the max width between the header width, but
    // we want the body to be sticky and only as wide as the table so it is always in view if loading/empty
    if (children?.length === 0) {
      layoutInfo.rect.width = this.virtualizer.visibleRect.width - 80;
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
    layoutInfo.rect.width = this.virtualizer.visibleRect.width;
    layoutInfo.isSticky = true;
    return layoutNode;
  }

  protected buildBody(y: number): LayoutNode {
    let layoutNode = super.buildBody(y);
    let {children, layoutInfo} = layoutNode;
    // Needs overflow for sticky loader
    layoutInfo.allowOverflow = true;
    // If loading or empty, we'll want the body to be sticky and centered
    if (children?.length === 0) {
      layoutInfo.rect = new Rect(40, 40, this.virtualizer.visibleRect.width - 80, this.virtualizer.visibleRect.height - 80);
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

export function Table(props: TableProps) {
  let {
    UNSAFE_style,
    UNSAFE_className,
    isQuiet = false,
    density = 'regular',
    overflowMode = 'truncate',
    selectionStyle = 'checkbox',
    styles,
    loadingState,
    onLoadMore,
    onResize: propsOnResize,
    onResizeStart: propsOnResizeStart,
    onResizeEnd: propsOnResizeEnd,
    onAction,
    ...otherProps
  } = props;

  // TODO: perhaps just make a useScale
  let scale = (useIsMobileDevice() ? 'large' : 'medium') as Scale;
  let layout = useMemo(() => {
    return new S2TableLayout({
      rowHeight: overflowMode === 'wrap'
        ? undefined
        : ROW_HEIGHTS[density][scale],
      estimatedRowHeight: overflowMode === 'wrap'
      ? ROW_HEIGHTS[density][scale]
      : undefined,
      // No need for estimated headingHeight since the headers aren't affected by overflow mode: wrap
      headingHeight: DEFAULT_HEADER_HEIGHT[scale]
    });
  }, [overflowMode, density, scale]);

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
    selectionStyle,
    loadingState,
    isInResizeMode,
    setIsInResizeMode,
    scale,
    layout
  }), [isQuiet, density, overflowMode, selectionStyle, loadingState, scale, layout, isInResizeMode, setIsInResizeMode]);

  let isLoading = loadingState === 'loading' || loadingState === 'loadingMore';
  let scrollRef = useRef(null);
  let memoedLoadMoreProps = useMemo(() => ({
    isLoading: isLoading,
    onLoadMore
  }), [isLoading, onLoadMore]);
  useLoadMore(memoedLoadMoreProps, scrollRef);

  return (
    <ResizableTableContainer
      onResize={propsOnResize}
      onResizeEnd={onResizeEnd}
      onResizeStart={onResizeStart}
      className={(UNSAFE_className || '') + mergeStyles(tableWrapper, styles)}
      style={UNSAFE_style}>
      <UNSTABLE_Virtualizer layout={layout}>
        <InternalTableContext.Provider value={context}>
          <RACTable
            ref={scrollRef}
            className={renderProps => table({
              ...renderProps,
              isQuiet
            })}
            selectionBehavior={selectionStyle === 'highlight' ? 'replace' : 'toggle'}
            onRowAction={onAction}
            {...otherProps} />
        </InternalTableContext.Provider>
      </UNSTABLE_Virtualizer>
    </ResizableTableContainer>
  );
}

const centeredWrapper = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'full',
  height: 'full'
});

export interface TableBodyProps<T> extends Omit<RACTableBodyProps<T>, 'style' | 'className' | 'dependencies'> {}

export function TableBody<T extends object>(props: TableBodyProps<T>) {
  let {items, renderEmptyState, children} = props;
  let tableVisualOptions = useContext(InternalTableContext);
  let {loadingState} = tableVisualOptions;
  let emptyRender;
  let renderer = children;
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');
  let loadMoreSpinner = (
    <UNSTABLE_TableLoadingIndicator className={style({height: 'full', width: 'full'})}>
      <div className={centeredWrapper}>
        <ProgressCircle
          isIndeterminate
          aria-label={stringFormatter.format('table.loadingMore')} />
      </div>
    </UNSTABLE_TableLoadingIndicator>
  );

  // If the user is rendering their rows in dynamic fashion, wrap their render function in Collection so we can inject
  // the loader. Otherwise it is a static renderer and thus we can simply add the table loader after
  // TODO: this assumes that the user isn't providing their children in some wrapper though and/or isn't doing a map of children
  // (though I guess they wouldn't provide items then so the check for this is still valid in the latter case)...
  if (typeof children === 'function' && items) {
    renderer = (
      <>
        <Collection items={items}>
          {children}
        </Collection>
        {loadingState === 'loadingMore' && [...items].length > 0 && loadMoreSpinner}
      </>
    );
  } else {
    renderer = (
      <>
        {children}
        {loadingState === 'loadingMore' && loadMoreSpinner}
      </>
    );
  }

  if (renderEmptyState != null && loadingState !== 'loading') {
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
      className={style({height: 'full'})}
      {...props}
      renderEmptyState={emptyRender}
      dependencies={[loadingState]}>
      {renderer}
    </RACTableBody>
  );
}

const cellFocus = style({
  position: 'absolute',
  top: 0,
  bottom: 0,
  right: 0,
  left: 0,
  outlineStyle: {
    default: 'none',
    isFocusVisible: 'solid'
  },
  outlineOffset: -2,
  outlineWidth: 2,
  outlineColor: 'focus-ring',
  borderRadius: size(6)
});

function CellFocusRing(props: {isFocusVisible: boolean}) {
  let {isFocusVisible} = props;
  return <div role="presentation" className={cellFocus({isFocusVisible})} />;
}

const columnStyles = style({
  height: '[inherit]',
  boxSizing: 'border-box',
  color: {
    default: 'gray-800', // neutral-content-color-default
    isHovered: 'gray-900', // neutral-content-color-hover
    isPressed: 'gray-900', // neutral-content-color-down
    isFocusVisible: 'gray-900' // neutral-content-color-key-focus
  },
  paddingX: {
    default: 16,
    isColumnResizable: 0
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
  fontSize: 'control',
  fontFamily: 'sans',
  fontWeight: 'bold',
  display: 'flex',
  borderColor: {
    default: 'gray-300',
    forcedColors: 'ButtonBorder'
  },
  borderTopWidth: 0,
  borderBottomWidth: 1,
  borderStartWidth: 0,
  borderEndWidth: {
    default: 0,
    isColumnResizable: 1
  },
  borderStyle: 'solid',
  forcedColorAdjust: 'none'
});

export interface ColumnProps extends RACColumnProps {
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
  children?: ReactNode
}

export function Column(props: ColumnProps) {
  let {isQuiet} = useContext(InternalTableContext);
  let {isHeaderRowHovered} = useContext(InternalTableHeaderContext);
  let {allowsResizing, children, align = 'start'} = props;
  let isColumnResizable = allowsResizing;

  return (
    <RACColumn {...props} style={{borderInlineEndColor: 'transparent'}} className={renderProps => columnStyles({...renderProps, isQuiet, isColumnResizable, align})}>
      {({allowsSorting, sortDirection, isFocusVisible, sort, startResize, isHovered}) => (
        <>
          {/* Note this is mainly for column's without a dropdown menu. If there is a dropdown menu, the button is styled to have a focus ring for simplicity
          (no need to juggle showing this focus ring if focus is on the menu button and not if it is on the resizer) */}
          {/* Separate absolutely positioned element because appyling the ring on the column directly via outline means the ring's required borderRadius will cause the bottom gray border to curve as well */}
          <CellFocusRing isFocusVisible={isFocusVisible} />
          {isColumnResizable ?
            (
              <ResizableColumnContents allowsSorting={allowsSorting} sortDirection={sortDirection} sort={sort} startResize={startResize} isHovered={isHeaderRowHovered || isHovered} align={align}>
                {children}
              </ResizableColumnContents>
            ) : (
              <ColumnContents allowsSorting={allowsSorting} sortDirection={sortDirection}>
                {children}
              </ColumnContents>
            )
          }
        </>
      )}
    </RACColumn>
  );
}

const columnContentWrapper = style({
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  width: 'full'
});

const sortIcon = style({
  size: fontRelative(16),
  flexShrink: 0,
  marginEnd: {
    default: 8,
    isButton: 'text-to-visual'
  },
  verticalAlign: {
    default: 'bottom',
    isButton: 0
  }
});

interface ColumnContentProps extends Pick<ColumnRenderProps, 'allowsSorting' | 'sortDirection'>, Pick<ColumnProps, 'children'> {}

function ColumnContents(props: ColumnContentProps) {
  let {allowsSorting, sortDirection, children} = props;

  return (
    <div className={columnContentWrapper}>
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
      <span className={style({truncate: true, width: 'full'})}>
        {children}
      </span>
    </div>
  );
}

const resizableMenuButtonWrapper = style({
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
  fontSize: 'control',
  fontFamily: 'sans',
  fontWeight: 'bold',
  // TODO: Same styles from cellFocus, consolidate later. Right now the design differ slightly on the border radius (4 on focus ring but 6 on the table's corner radius)
  outlineStyle: {
    default: 'none',
    isFocusVisible: 'solid'
  },
  outlineOffset: -2,
  outlineWidth: 2,
  outlineColor: 'focus-ring',
  borderRadius: size(6)
});

const resizerHandleContainer = style({
  display: {
    default: 'none',
    isResizing: 'block',
    isHovered: 'block'
  },
  width: 12,
  height: 'full',
  position: 'absolute',
  top: 0,
  insetEnd: size(-6),
  cursor: {
    default: 'none',
    resizableDirection: {
      'left': 'e-resize',
      'right': 'w-resize',
      'both': 'ew-resize'
    }
  },
  // So that the user can still hover + drag the resizer even though it's hit area is partially in the adjacent column's space
  zIndex: 1000,
  '--focus-ring-color': {
    type: 'outlineColor',
    value: 'focus-ring'
  }
});

const resizerHandle = style({
  backgroundColor: {
    default: 'transparent',
    isHovered: 'gray-300',
    isFocusVisible: '--focus-ring-color',
    isResizing: '--focus-ring-color',
    forcedColors: {
      default: 'Background',
      isHovered: 'Highlight',
      isFocusVisible: 'Highlight',
      isResizing: 'Highlight'
    }
  },
  width: size(1),
  position: 'absolute',
  insetStart: size(6)
});

const columnHeaderText = style({
  truncate: true,
  // Make it so the text doesn't completely disappear when column is resized to smallest width + both sort and chevron icon is rendered
  minWidth: 8,
  flexGrow: 0,
  flexShrink: 1,
  flexBasis: 'auto'
});

const chevronIcon = style({
  rotate: 90,
  marginStart: 'text-to-visual',
  minWidth: fontRelative(16),
  flexShrink: 0
});

const nubbin = style({
  position: 'absolute',
  top: 0,
  insetStart: size(-2),
  size: fontRelative(16)
});

interface ResizableColumnContentProps extends Pick<ColumnRenderProps, 'allowsSorting' | 'sort' | 'sortDirection' | 'startResize' | 'isHovered'>, Pick<ColumnProps, 'align' | 'children'> {}

// TODO: placeholder, just copied over from v3. Request filed in airtable for the actual nubbin
function Nubbin() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
      <g fill="var(--focus-ring-color)" stroke="var(--focus-ring-color)" strokeWidth="2">
        <circle cx="8" cy="8" r="8" stroke="none" />
        <circle cx="8" cy="8" r="7" fill="none" />
      </g>
      <path d="M-2106-7380.263v5l2.5-2.551Z" transform="translate(2116 7385.763)" fill="#fff" stroke="#fff" strokeLinejoin="round" strokeWidth="2" />
      <path d="M-2106-7380.263v5l2.5-2.551Z" transform="translate(-2100 -7369.763) rotate(180)" fill="#fff" stroke="#fff" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}


function ResizableColumnContents(props: ResizableColumnContentProps) {
  let {allowsSorting, sortDirection, sort, startResize, children, isHovered, align} = props;
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
        // TODO: Need to wait for the menu to fully transition out, otherwise mouse movements may hover the menu items and steal focus from the resizer,
        // causing resizing to end prematurely due to blur. Open to ideas for how to handle this since it affects RAC. Ideally we'd freeze
        // focus from being able to move if we are in resizing mode except if the user clicks away or moves focus with something other than hover
        setTimeout(() => startResize(), 200);
        break;
    }
  };

  let items = useMemo(() => {
    let options = [
      {
        label: stringFormatter.format('table.resizeColumn'),
        id: 'resize'
      }
    ];
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
  }, [allowsSorting]);


  let buttonAlignment = 'start';
  let menuAlign = 'start' as 'start' | 'end';
  // TODO: align center is quite strange, copied this from S1 but really there isn't a good place to put the menu when the column text is centered
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
        <Menu onAction={onMenuSelect} items={items}>
          {(item) => <MenuItem>{item?.label}</MenuItem>}
        </Menu>
      </MenuTrigger>
      <div data-react-aria-prevent-focus="true">
        <ColumnResizer data-react-aria-prevent-focus="true" className={({resizableDirection, isResizing}) => resizerHandleContainer({resizableDirection, isResizing, isHovered: isInResizeMode || isHovered})}>
          {({isFocusVisible, isResizing}) => (
            <>
              <ResizerIndicator isInResizeMode={isInResizeMode} isFocusVisible={isFocusVisible} isHovered={isHovered} isResizing={isResizing} />
              {(isFocusVisible || isInResizeMode) && isResizing && <div className={nubbin}><Nubbin /></div>}
            </>
        )}
        </ColumnResizer>
      </div>
    </>
  );
}

function ResizerIndicator({isFocusVisible, isHovered, isResizing, isInResizeMode}) {
  let state = useContext(ResizableTableContainerContext);

  return (
    <div style={{height: isResizing ? state?.tableHeight : '100%'}} className={resizerHandle({isFocusVisible, isHovered: isHovered || isInResizeMode, isResizing})} />
  );
}

const tableHeader = style({
  height: 'full',
  width: 'full',
  backgroundColor: 'gray-75'
});

const selectAllCheckbox = style({
  marginStart: 16, // table-edge-to-content, same between mobile and desktop
  marginEnd: {
    default: 8,
    scale: {
      large: 14
    }
  }
});

const selectAllCheckboxColumn = style({
  padding: 0,
  height: '[calc(100% - 1px)]',
  outlineStyle: 'none',
  position: 'relative',
  alignContent: 'center',
  borderColor: 'gray-300',
  borderXWidth: 0,
  borderTopWidth: 0,
  borderBottomWidth: 1,
  borderStyle: 'solid',
  backgroundColor: 'gray-75'
});

let InternalTableHeaderContext = createContext<{isHeaderRowHovered?: boolean}>({isHeaderRowHovered: false});

export function TableHeader<T extends object>({columns, children}: TableHeaderProps<T>) {
  let {scale} = useContext(InternalTableContext);
  let {selectionBehavior, selectionMode} = useTableOptions();
  let [isHeaderRowHovered, setHeaderRowHovered] = useState(false);

  return (
    <InternalTableHeaderContext.Provider value={{isHeaderRowHovered}}>
      <RACTableHeader onHoverChange={setHeaderRowHovered} className={tableHeader}>
        {/* Add extra columns for selection. */}
        {selectionBehavior === 'toggle' && (
          // Also isSticky prop is applied just for the layout, will decide what the RAC api should be later
          // @ts-ignore
          <RACColumn isSticky width={scale === 'medium' ? 40 : 48} minWidth={40} className={selectAllCheckboxColumn}>
            {({isFocusVisible}) => (
              <>
                {selectionMode === 'single' &&
                  <CellFocusRing isFocusVisible={isFocusVisible} />
                }
                {selectionMode === 'multiple' &&
                  <Checkbox isEmphasized styles={selectAllCheckbox({scale})} slot="selection" />
                }
              </>
            )}
          </RACColumn>
        )}
        <Collection items={columns}>
          {children}
        </Collection>
      </RACTableHeader>
    </InternalTableHeaderContext.Provider>
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

const cell = style<CellRenderProps & S2TableProps>({
  ...commonCellStyles,
  color: {
    default: 'gray-800', // neutral-content-color-default
    isHovered: 'gray-900', // neutral-content-color-hover
    isPressed: 'gray-900', // neutral-content-color-down
    isFocusVisible: 'gray-900' // neutral-content-color-key-focus
  },
  // Still need this paddingTop/Bottom for overflow wrap
  paddingTop: {
    default: size(10), // table-row-top-to-text-medium-regular
    density: {
      spacious: size(15), // table-row-top-to-text-medium-spacious
      compact: size(6) // table-row-top-to-text-medium-compact
    }
  },
  paddingBottom: {
    default: 12, // table-row-bottom-to-text-medium-spacious
    density: {
      spacious: size(15), // table-row-bottom-to-text-medium-spacious
      compact: 8 // table-row-bottom-to-text-medium-compact
    }
  },
  boxSizing: 'border-box',
  height: 'full',
  width: 'full',
  fontSize: 'control',
  alignItems: 'center',
  display: 'flex',
  '--dividerColor': {
    type: 'borderColor',
    value: {
      default: 'gray-300',
      forcedColors: 'ButtonBorder'
    }
  }
});

const stickyCell = {
  backgroundColor: 'gray-25'
} as const;

const checkboxCellStyle = style({
  ...commonCellStyles,
  ...stickyCell,
  paddingStart: 16,
  paddingEnd: {
    default: 8,
    scale: {
      large: 14
    }
  },
  alignContent: 'center',
  height: '[calc(100% - 1px)]',
  borderBottomWidth: 0
  // TODO: problem with having the checkbox cell itself use the row background color directly instead
  // of having a separate white rectangle div base below a div with the row background color set above it as a mask
  // is that it doesn't come out as the same color as the other cells because the base below the sticky cell will be the blue of the
  // other cells, not the same white base. If I could convert informative-900/10 (and the rest of the rowBackgroundColors) to an equivalent without any opacity
  // then this would be possible. Currently waiting request for Spectrum to provide tokens for these equivalent values
  // backgroundColor: '--rowBackgroundColor'
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
  width: 'full'
});

const cellBackground = style({
  position: 'absolute',
  top: 0,
  bottom: 0,
  right: 0,
  left: 0,
  backgroundColor: {
    default: 'transparent',
    isSticky: '--rowBackgroundColor'
  }
});

export interface CellProps extends RACCellProps, Pick<ColumnProps, 'align' | 'showDivider'> {
  /** @private */
  isSticky?: boolean,
  /** The content to render as the cell children. */
  children?: ReactNode
}

export function Cell(props: CellProps) {
  let {children, isSticky, showDivider, align, textValue, ...otherProps} = props;
  let tableVisualOptions = useContext(InternalTableContext);
  textValue ||= typeof children === 'string' ? children : undefined;

  return (
    <RACCell
      // Also isSticky prop is applied just for the layout, will decide what the RAC api should be later
      // @ts-ignore
      isSticky={isSticky}
      // This is a inline style because it needs to set properties ONLY for the end border (don't want to set a color for the bottom border)
      style={{borderInlineEndColor: showDivider ? 'var(--dividerColor)' : 'none', borderInlineEndWidth: showDivider ? 1 : 0, borderRightStyle: showDivider ? 'solid' : 'none'}}
      className={renderProps => cell({
        ...renderProps,
        ...tableVisualOptions
      })}
      textValue={textValue}
      {...otherProps}>
      {({isFocusVisible}) => (
        <>
          {/*
            // TODO: problem with having the checkbox cell itself use the row background color directly instead
            of having a separate white rectangle div base below a div with the row background color set above it as a mask
            is that it doesn't come out as the same color as the other cells because the base below the sticky cell when other selected cells are scrolled below it will be the blue of the
            other cells, not the same white base. If I could convert informative-900/10 (and the rest of the rowBackgroundColors) to an equivalent without any opacity
            then I could do away with this styling. To reproduce this, comment out the stickyCell gray-25, get rid of the below div and apply backgroundColor: '--rowBackgroundColor' to checkboxCellStyle.
            Having the CellFocusRing here instead of applying a outline on the cell directly also makes it NOT overlap with the border (can be remedied with a -3px outline offset) and applying a border radius to get the curved outline focus ring messes
            with the divider rendered on the cell since those are also borders
          */}
          <div role="presentation" className={cellBackground({isSticky})} />
          <CellFocusRing isFocusVisible={isFocusVisible} />
          <span className={cellContent({...tableVisualOptions, align: align || 'start'})}>{children}</span>
        </>
      )}
    </RACCell>
  );
}

// TODO: reminder, these dark theme colors were grabbed from the spectrum tokens but they feel quite dark IMO. Will comment in design file
const rowBackgroundColor = {
  default: 'gray-25',
  isFocusVisibleWithin: 'gray-900/7', // table-row-hover-color
  isHovered: 'gray-900/7', // table-row-hover-color
  isPressed: 'gray-900/10', // table-row-hover-color
  isSelected: {
    // TODO: I've tried adding +50 to the dark color opacity and it doesn't look too bad
    default: lightDark('informative-900/10', 'informative-700/10'), // table-selected-row-background-color, opacity /10
    isFocusVisibleWithin: lightDark('informative-900/15', 'informative-700/15'), // table-selected-row-background-color, opacity /15
    isHovered: lightDark('informative-900/15', 'informative-700/15'), // table-selected-row-background-color, opacity /15
    isPressed: lightDark('informative-900/15', 'informative-700/15') // table-selected-row-background-color, opacity /15
  },
  isQuiet: {
    // TODO: there aren't designs for quiet + selected? For now I've made it the same as non-quiet
    default: 'transparent',
    isFocusVisibleWithin: 'gray-900/7', // table-row-hover-color
    isHovered: 'gray-900/7', // table-row-hover-color
    isPressed: 'gray-900/10', // table-row-hover-color
    isSelected: {
      default: lightDark('informative-900/10', 'informative-700/10'), // table-selected-row-background-color, opacity /10
      isFocusVisibleWithin: lightDark('informative-900/15', 'informative-700/15'), // table-selected-row-background-color, opacity /15
      isHovered: lightDark('informative-900/15', 'informative-700/15'), // table-selected-row-background-color, opacity /15
      isPressed: lightDark('informative-900/15', 'informative-700/15') // table-selected-row-background-color, opacity /15
    }
  },
  forcedColors: {
    default: 'Background'
  }
} as const;

const row = style<RowRenderProps & S2TableProps>({
  height: 'full',
  position: 'relative',
  boxSizing: 'border-box',
  backgroundColor: rowBackgroundColor,
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

export interface RowProps<T> extends Pick<RACRowProps<T>, 'id' | 'columns' | 'children' | 'textValue'>  {}

export function Row<T extends object>({id, columns, children, ...otherProps}: RowProps<T>) {
  let {selectionBehavior, selectionMode} = useTableOptions();
  let tableVisualOptions = useContext(InternalTableContext);

  return (
    <RACRow
      id={id}
      className={renderProps => row({
        ...renderProps,
        ...tableVisualOptions
      }) + (renderProps.isFocusVisible && ' ' + raw('&:before { content: ""; display: inline-block; position: sticky; inset-inline-start: 0; width: 3px; height: 100%; margin-inline-end: -3px; margin-block-end: 1px;  z-index: 3; background-color: var(--rowFocusIndicatorColor)'))}
      {...otherProps}>
      {selectionMode !== 'none' && selectionBehavior === 'toggle' && (
        <Cell isSticky className={checkboxCellStyle({scale: tableVisualOptions.scale})}>
          <Checkbox isEmphasized slot="selection" />
        </Cell>
      )}
      <Collection items={columns}>
        {children}
      </Collection>
    </RACRow>
  );
}
