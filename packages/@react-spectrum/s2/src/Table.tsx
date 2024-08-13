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
  DragAndDropOptions as AriaDragAndDropOptions,
  Button,
  CellRenderProps,
  Collection,
  ColumnRenderProps,
  ColumnResizer,
  DropIndicator,
  DropTarget,
  Key,
  Provider,
  Cell as RACCell,
  CellProps as RACCellProps,
  Column as RACColumn,
  ColumnProps as RACColumnProps,
  Row as RACRow,
  Table as RACTable,
  TableBody as RACTableBody,
  TableBodyProps as RACTableBodyProps,
  TableHeader as RACTableHeader,
  TableProps as RACTableProps,
  ResizableTableContainer,
  ResizableTableContainerContext,
  RowProps,
  RowRenderProps,
  TableBodyRenderProps,
  TableHeaderProps,
  TableRenderProps,
  UNSTABLE_TableLayout,
  UNSTABLE_TableLoadingIndicator,
  UNSTABLE_Virtualizer,
  useDragAndDrop as useAriaDragAndDrop,
  useTableOptions
} from 'react-aria-components';
import {Checkbox} from './Checkbox';
import Chevron from '../ui-icons/Chevron';
import {ColumnSize} from '@react-types/table';
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {GridNode} from '@react-types/grid';
import {IconContext} from './Icon';
import {LayoutNode} from '@react-stately/layout';
import {lightDark, size, style} from '../style/spectrum-theme' with {type: 'macro'};
import {LoadingState, Node} from '@react-types/shared';
import {Menu, MenuItem, MenuTrigger} from './Menu';
import {mergeStyles} from '../style/runtime';
import {ProgressCircle} from './ProgressCircle';
import React, {createContext, ReactNode, useContext, useMemo, useRef, useState} from 'react';
import {Rect} from '@react-stately/virtualizer';
import SortDownArrow from '../s2wf-icons/S2_Icon_SortDown_20_N.svg';
import SortUpArrow from '../s2wf-icons/S2_Icon_SortUp_20_N.svg';
import {useIsMobileDevice} from './utils';
import {useLoadMore} from '@react-aria/utils';

// TODO: things that still need to be handled
// styling polish (outlines are overlapping/not being cut by table body/need blue outline for row selection)
// adding the types to the various style macros
// Add a complex table example with buttons and various icons,links,

// drop indicators in DnD + drag button styling (needs designs, but I can put in interim styling)

// overflow wrap
// - added, but I noticed some odd behavior if a cell with very long contents isn't rendered at first: When it gets scrolled into view
// it then can change the row's height drastically
// summary row (to discuss, is this a separate row? What accessibility goes into this)
// nested column support (RAC limitation? I remember talking about this when we explored moving TableView to new collections api)
// Expandable rows support, will need to add this to RAC table
interface S2TableProps {
  /** Whether the Table should be displayed with a quiet style. */
  isQuiet?: boolean,
  /**
   * Sets the amount of vertical padding within each cell.
   * @default 'regular'
   */
  density?: 'compact' | 'spacious' | 'regular',
  // TODO: update with virtualizer where wrap changes the layout to estimated
  /**
   * Sets the overflow behavior for the cell contents.
   * @default 'truncate'
   */
  overflowMode?: 'wrap' | 'truncate',
  /** How selection should be displayed. */
  selectionStyle?: 'checkbox' | 'highlight',
  // TODO: the below are copied from Spectrum Table props.
  // TODO: will we contine with onAction or rename to onRowAction like it is in RAC?
  /** Handler that is called when a user performs an action on a row. */
  onAction?: (key: Key) => void,
  // TODO: the below will depend on how we handle resizing in S2. In RAC these went on the ResizableTableContainer wrapper instead
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

// TODO: audit the props and get omit stuff we don't want from the RAC props
// TODO: loadMore and loadingState are now on the Table instead of on the TableBody, do we
export interface TableProps extends Omit<RACTableProps, 'style' | 'disabledBehavior' | 'className' | 'onRowAction' | 'selectionBehavior' | 'onScroll' | 'onCellAction'>, StyleProps, S2TableProps {
}

let InternalTableContext = createContext<TableProps & {columnsResizable?: boolean, scale?: Scale, layout?: S2TableLayout<unknown>}>({});

const tableWrapper = style({
  width: 'full'
});

// TODO: will need focus styles and stuff which will use the TableRenderProps here
const table = style<TableRenderProps & S2TableProps>({
  height: 'full',
  userSelect: 'none',
  minHeight: 0,
  minWidth: 0,
  fontFamily: 'sans',
  overflow: 'auto',
  backgroundColor: {
    default: 'gray-25',
    isQuiet: 'transparent'
  },
  outlineColor: {
    default: 'gray-300',
    forcedColors: 'ButtonBorder'
  },
  outlineWidth: {
    default: 1,
    isQuiet: 0
  },
  outlineStyle: 'solid',
  borderRadius: {
    default: size(6),
    isQuiet: 'none'
  }
}, getAllowedOverrides({height: true}));


// TODO: will need to get the row height and other table styling props for the drag preview, but this hook is external to the table...
// Perhaps we move it to Table and set to our default one dragAndDropHooks.DragPreview
// The below is just temporary, will need to update to match v3 more closely if need be (at least adding the stacking effect)
// Will wait for designs first
let dragRowPreview = style({
  height: {
    default: 40,
    density: {
      spacious: 48,
      compact: 32
    }
  },
  width: 144,
  boxShadow: '[inset 0 0 0 2px blue]',
  borderRadius: 'default',
  paddingStart: 16, // table-edge-to-content
  paddingEnd: 8,
  display: 'flex',
  justifyContent: 'space-between',
  backgroundColor: 'gray-25'
});

// TODO: same style as from cell, combine later
let dragCellPreview = style({
  paddingTop: {
    default: size(11), // table-row-top-to-text-medium-regular
    density: {
      spacious: size(15), // table-row-top-to-text-medium-spacious
      compact: size(6) // table-row-top-to-text-medium-compact
    }
  },
  paddingBottom: {
    default: size(12), // table-row-bottom-to-text-medium-spacious
    density: {
      spacious: size(15), // table-row-bottom-to-text-medium-spacious
      compact: size(8) // table-row-bottom-to-text-medium-compact
    }
  },
  // TODO: fontSize control doesn't work here for some reason
  fontSize: '[14px]',
  fontFamily: 'sans'
});

let dragBadge = style({
  display: 'flex',
  backgroundColor: 'focus-ring',
  color: 'gray-25',
  paddingY: 0,
  paddingX: 8,
  borderRadius: 'sm',
  marginY: 'auto',
  fontSize: '[14px]',
  fontFamily: 'sans'
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
    medium: 48,  // table-row-height-medium-spacious
    large: 60
  }
};

type Scale = 'large' | 'medium';

export class S2TableLayout<T> extends UNSTABLE_TableLayout<T> {
  protected isStickyColumn(node: GridNode<T>): boolean {
    if (node.props.isSticky) {
      return true;
    }

    return false;
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
    // TODO: I'm not quite sure why the visible rect in the load more story stays as 320px instead of
    // becomeing 305px when the scrollbar shows up... This doesn't seem to happen in the "loading state, has item" story,
    // that one properly goes from 320px to 305px when the scrollbar renders
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
    onResize,
    onResizeEnd,
    onResizeStart,
    dragAndDropHooks,
    ...otherProps
  } = props;

  let isTableDraggable = !!dragAndDropHooks?.useDraggableCollectionState;
  if (dragAndDropHooks && isTableDraggable && !dragAndDropHooks?.renderDragPreview) {
    dragAndDropHooks.renderDragPreview = (items) => {
      return (
        <div className={dragRowPreview({density})}>
          <div className={dragCellPreview({density})}>
            {items[0]['text/plain']}
          </div>
          <span className={dragBadge}>{items.length}</span>
        </div>
      );
    };
  }
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

  let columnsResizable = !!(onResize || onResizeEnd || onResizeStart);
  let context = useMemo(() => ({
    isQuiet,
    density,
    overflowMode,
    selectionStyle,
    loadingState,
    columnsResizable,
    scale,
    layout
  }), [isQuiet, density, overflowMode, selectionStyle, loadingState, columnsResizable, scale, layout]);

  let isLoading = loadingState === 'loading' || loadingState === 'loadingMore';
  let scrollRef = useRef(null);
  let memoedLoadMoreProps = useMemo(() => ({
    isLoading: isLoading,
    onLoadMore
  }), [isLoading, onLoadMore]);
  useLoadMore(memoedLoadMoreProps, scrollRef);

  let baseTable = (
    <UNSTABLE_Virtualizer layout={layout}>
      <InternalTableContext.Provider value={context}>
        <RACTable
          ref={scrollRef}
          style={UNSAFE_style}
          className={renderProps => (UNSAFE_className || '') + table({
            ...renderProps,
            isQuiet
          }, styles)}
          selectionBehavior={selectionStyle === 'highlight' ? 'replace' : 'toggle'}
          dragAndDropHooks={dragAndDropHooks}
          {...otherProps} />
      </InternalTableContext.Provider>
    </UNSTABLE_Virtualizer>
  );

  // TODO: for the resizer line indicator, can't do it at this level with the ResizableTableContainerContext because
  // that just gives the actual useTableColumnResizeState hook but I need the actual caluclated layout state
  if (columnsResizable) {
    baseTable = (
      <ResizableTableContainer
        ref={scrollRef}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        onResizeStart={onResizeStart}
        className={(UNSAFE_className || '') + mergeStyles(tableWrapper, styles)}
        style={UNSAFE_style}>
        <UNSTABLE_Virtualizer layout={layout}>
          <InternalTableContext.Provider value={context}>
            <RACTable
              className={renderProps => table({
                ...renderProps,
                isQuiet
              })}
              selectionBehavior={selectionStyle === 'highlight' ? 'replace' : 'toggle'}
              dragAndDropHooks={dragAndDropHooks}
              {...otherProps} />
          </InternalTableContext.Provider>
        </UNSTABLE_Virtualizer>
      </ResizableTableContainer>
    );
  }

  return baseTable;
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
  let loadMoreSpinner = (
    <UNSTABLE_TableLoadingIndicator className={style({height: 'full', width: 'full'})}>
      <div className={centeredWrapper}>
        <ProgressCircle
          isIndeterminate
          // TODO: needs intl translation
          aria-label="loading more" />
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
        {loadingState === 'loadingMore' && loadMoreSpinner}
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
        {/* @ts-ignore TODO figure out why it is complaining tahat this is possibly undefined */}
        {renderEmptyState(props)}
      </div>
    );
  } else if (loadingState === 'loading') {
    emptyRender = () => (
      <div className={centeredWrapper}>
        <ProgressCircle
          isIndeterminate
          // TODO: needs intl translation
          aria-label="loading" />
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
  // TODO: need to support text align and that would need to apply to all cells in the column, need to figure out how
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
  // TODO: this border isn't perfect because it is flush with the first row's blue selected outline and the text is 17.5px instead of 18px
  borderColor: 'gray-300',
  borderTopWidth: 0,
  borderBottomWidth: 1,
  borderStartWidth: 0,
  borderEndWidth: {
    default: 0,
    isColumnResizable: 1
  },
  borderStyle: 'solid'
});

export interface ColumnProps extends RACColumnProps {
  // TODO: still need to figure out a way to do this, perhaps if I get the resize indicator to span the table then we can do something similar here
  showDivider?: boolean,
  isResizable?: boolean,
  align?: 'start' | 'center' | 'end',
  children?: ReactNode
}

export function Column(props: ColumnProps) {
  let {isQuiet, columnsResizable} = useContext(InternalTableContext);
  let {isHeaderRowHovered} = useContext(InternalTableHeaderContext);
  let {isResizable, children, align = 'start'} = props;
  let isColumnResizable = columnsResizable && isResizable;

  return (
    <RACColumn {...props} style={{borderInlineEndColor: 'transparent'}} className={renderProps => columnStyles({...renderProps, isQuiet, isColumnResizable, align})}>
      {({allowsSorting, sortDirection, isFocusVisible, sort, startResize, isHovered}) => (
        <>
          {/* Note this is mainly for column's without a dropdown menu. If there is a dropdown menu, the button is styled to have a focus ring for simplicity
          (no need to juggle showing this focus ring if focus is on the menu button and not if it is on the resizer) */}
          <CellFocusRing isFocusVisible={isFocusVisible} />
          {columnsResizable && isResizable ?
            (
              <ResizableColumnContents allowsSorting={allowsSorting} sortDirection={sortDirection} sort={sort} startResize={startResize} isHovered={isHeaderRowHovered || isHovered}>
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

// TODO combine the ColumnContents and the ResizableColumnContents further so they share the same sort stuff
interface ColumnContentProps extends Pick<ColumnRenderProps, 'allowsSorting' | 'sortDirection'>, Pick<ColumnProps, 'children'> {}

function ColumnContents(props: ColumnContentProps) {
  let {allowsSorting, sortDirection, children} = props;

  return (
    <div className={columnContentWrapper}>
      {allowsSorting && (
        <Provider
          values={[
            [IconContext, {
              styles: style({
                height: 16,
                width: 16,
                marginEnd: 8,
                verticalAlign: 'bottom'
              })
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
  // TODO: same styles from columnStyles, consolidate later
  paddingX: 16,
  backgroundColor: 'transparent',
  borderStyle: 'none',
  fontSize: 'control',
  fontFamily: 'sans',
  fontWeight: 'bold',
  // TODO: Same styles from cellFocus, consolidate later
  outlineStyle: {
    default: 'none',
    isFocusVisible: 'solid'
  },
  outlineOffset: -2,
  outlineWidth: 2,
  outlineColor: 'focus-ring',
  borderRadius: 'sm'
});

const resizerHandleContainer = style({
  width: 12,
  height: 'full',
  position: 'absolute',
  top: 0,
  right: size(-6),
  cursor: {
    default: 'none',
    resizableDirection: {
      'left': 'e-resize',
      'right': 'w-resize',
      'both': 'ew-resize'
    }
  },
  // So that the user can still hover + drag the resizer even though it's hit area is partially in the adjacent column's space
  zIndex: 1000
});

const resizerHandle = style({
  backgroundColor: {
    default: 'transparent',
    isHovered: 'gray-300',
    isFocusVisible: 'focus-ring',
    isResizing: 'focus-ring'
  },
  width: size(1),
  position: 'absolute',
  left: size(6)
});

const sortIcon = style({
  height: 16,
  width: 16,
  marginEnd: 'text-to-visual',
  minWidth: 16
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
  minWidth: 16
});

const nubbin = style({
  position: 'absolute',
  top: 0,
  left: size(-2),
  width: 16,
  height: 16
});

interface ResizableColumnContentProps extends Pick<ColumnRenderProps, 'allowsSorting' | 'sort' | 'sortDirection' | 'startResize' | 'isHovered'> {
  children: ReactNode
}

// TODO: placeholder, just copied over from v3. Will need to be adjusted to having the same kind of fill that the s2 icons use
function Nubbin() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
      <g fill="var(--spectrum-global-color-blue-600)" stroke="var(--spectrum-global-color-blue-600)" strokeWidth="2">
        <circle cx="8" cy="8" r="8" stroke="none" />
        <circle cx="8" cy="8" r="7" fill="none" />
      </g>
      <path d="M-2106-7380.263v5l2.5-2.551Z" transform="translate(2116 7385.763)" fill="#fff" stroke="#fff" strokeLinejoin="round" strokeWidth="2" />
      <path d="M-2106-7380.263v5l2.5-2.551Z" transform="translate(-2100 -7369.763) rotate(180)" fill="#fff" stroke="#fff" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function ResizableColumnContents(props: ResizableColumnContentProps) {
  let {allowsSorting, sortDirection, sort, startResize, children, isHovered} = props;

  return (
    <>
      <MenuTrigger>
        <Button className={(renderProps) => resizableMenuButtonWrapper(renderProps)}>
          {allowsSorting && (
            <Provider
              values={[
                [IconContext, {
                  styles: sortIcon
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
        <Menu
          onAction={(action) => {
            if (action === 'sortAscending') {
              sort('ascending');
            } else if (action === 'sortDescending') {
              sort('descending');
            } else if (action === 'resize') {
              startResize();
            }
          }}>
          <MenuItem id="sortAscending">Sort Ascending</MenuItem>
          <MenuItem id="sortDescending">Sort Descending</MenuItem>
          <MenuItem id="resize">Resize</MenuItem>
        </Menu>
      </MenuTrigger>
      <div data-react-aria-prevent-focus="true">
        <ColumnResizer data-react-aria-prevent-focus="true" className={({resizableDirection}) => resizerHandleContainer({resizableDirection})}>
          {({isFocusVisible, isResizing}) => (
            <>
              <ResizerIndicator isFocusVisible={isFocusVisible} isHovered={isHovered} isResizing={isResizing} />
              {isFocusVisible && isResizing && <div className={nubbin}><Nubbin /></div>}
            </>
        )}
        </ColumnResizer>
      </div>
    </>
  );
}

function ResizerIndicator({isFocusVisible, isHovered, isResizing}) {
  let state = useContext(ResizableTableContainerContext);
  return (
    <div style={{height: isResizing ? state.tableHeight : '100%'}} className={resizerHandle({isFocusVisible, isHovered, isResizing})} />
  );
}

const tableHeader = style({
  height: 'full',
  width: 'full',
  backgroundColor: 'gray-100'
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

const stickyCell = {
  backgroundColor: 'gray-25'
} as const;

const selectAllCheckboxColumn = style({
  ...stickyCell,
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
  backgroundColor: 'gray-100'
});

let InternalTableHeaderContext = createContext<{isHeaderRowHovered?: boolean}>({isHeaderRowHovered: false});

export function TableHeader<T extends object>(
  {columns, children}: TableHeaderProps<T>
) {
  let {scale} = useContext(InternalTableContext);
  let {selectionBehavior, selectionMode, allowsDragging} = useTableOptions();
  let [isHeaderRowHovered, setHeaderRowHovered] = useState(false);

  return (
    <InternalTableHeaderContext.Provider value={{isHeaderRowHovered}}>
      <RACTableHeader onHoverChange={setHeaderRowHovered} className={tableHeader}>
        {/* Add extra columns for drag and drop and selection. */}
        {allowsDragging && (
          // TODO: width for this column is taken from v3, designs don't have DnD specified yet
          // Also isSticky prop is applied just for the layout, will decide what the RAC api should be later
          // @ts-ignore
          <RACColumn isSticky width={scale === 'medium' ? 16 : 20} minWidth={scale === 'medium' ? 16 : 20} className={selectAllCheckboxColumn}>
            {({isFocusVisible}) => <CellFocusRing isFocusVisible={isFocusVisible} />}
          </RACColumn>
        )}
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
    value: 'gray-300'
  }
  // outlineStyle: {
  //   default: 'none',
  //   isFocusVisible: 'solid'
  // },
  // outlineOffset: -2,
  // outlineWidth: 2,
  // outlineColor: 'focus-ring',
  // borderRadius: size(6)
});

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
  // TODO: Figure out better way to make the background not cover the border of the row itself
  height: '[calc(100% - 1px)]',
  borderBottomWidth: 0
  // TODO: problem with having the checkbox cell itself use the row background color directly instead
  // of having a separate white rectangle div base below a div with the row background color set above it as a mask
  // is that it doesn't come out as the same color as the other cells because the base below the sticky cell will be the blue of the
  // other cells, not the same white base. If I could convert informative-900/10 (and the rest of the rowBackgroundColors) to an equivalent without any opacity
  // then this would be possible
  // backgroundColor: '--rowBackgroundColor'
});

// TODO: placeholder styles until we confirm the design
const dragButtonCellStyle = style({
  ...commonCellStyles,
  ...stickyCell,
  paddingX: 4,
  alignContent: 'center',
  // TODO: Figure out better way to make the background not cover the border of the row itself
  height: '[calc(100% - 1px)]',
  borderBottomWidth: 0
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

export interface CellProps extends RACCellProps {
  /** @private */
  isSticky?: boolean,
  showDivider?: boolean,
  align?: 'start' | 'middle' | 'end',
  children: ReactNode
}

export function Cell(props: CellProps) {
  let {children, isSticky, showDivider, align, ...otherProps} = props;
  let tableVisualOptions = useContext(InternalTableContext);

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

const rowBackgroundColor = {
  default: 'gray-25',
  isFocusVisibleWithin: 'gray-900/7', // table-row-hover-color
  isHovered: 'gray-900/7', // table-row-hover-color
  isPressed: 'gray-900/10', // table-row-hover-color
  isSelected: {
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
    default: 'transparent'
  }
} as const;

const row = style<RowRenderProps & S2TableProps>({
  height: 'full',
  position: 'relative',
  boxSizing: 'border-box',
  backgroundImage: {
    // TODO: will need the proper blue from tokens
    // TODO: will need to move to a different element because it is covered by the sticky column masking element
    isFocusVisible: 'linear-gradient(to right, blue 0 3px, transparent 3px)'
  },
  backgroundColor: rowBackgroundColor,
  '--rowBackgroundColor': {
    type: 'backgroundColor',
    value: rowBackgroundColor
  },
  // TODO: outline here is to emulate v3 forcedColors experience but runs into the same problem where the sticky column covers the outline
  outlineWidth: {
    forcedColors: {
      isFocusVisible: 2
    }
  },
  outlineOffset: {
    forcedColors: {
      isFocusVisible: -1
    }
  },
  outlineColor: {
    forcedColors: {
      isFocusVisible: 'ButtonBorder'
    }
  },
  outlineStyle: {
    default: 'none',
    forcedColors: {
      isFocusVisible: 'solid'
    }
  },
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

// TODO: temp styles, roughly mimics v3
const dragButton = style({
  width: size(13),
  height: size(20),
  padding: 0,
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'transparent',
  borderStyle: 'none',
  outlineStyle: {
    default: 'none',
    isFocusVisible: 'solid'
  },
  outlineOffset: -2,
  outlineWidth: 2,
  outlineColor: 'focus-ring',
  borderRadius: 'sm'
});

export function Row<T extends object>(
  {id, columns, children, ...otherProps}: RowProps<T>
) {
  let {selectionBehavior, allowsDragging, selectionMode} = useTableOptions();
  let tableVisualOptions = useContext(InternalTableContext);
  // TODO: something like the below we could do in the className where we could perhaps modify the color and inset-block-start 50 be gray and 0 vs -1px respectively depending on the renderProps for isSelected.
  // However would need to be able to use the color variables for the proper coloring
  // + ' ' + raw('&:after { content: ""; display: block; position: absolute; inset-inline-start: 0;  inset-inline-end: 0;  inset-block-end: 0; inset-block-start: -1px; z-index: 3; box-shadow: inset 1px 0 0 0 blue, inset -1px 0 0 0 blue, inset 0 -1px 0 0 blue, inset 0 1px 0 0 blue')
  return (
    <RACRow
      id={id}
      className={renderProps => row({
        ...renderProps,
        ...tableVisualOptions
      })}
      // })  + ' ' + raw('&:after { content: ""; display: block; position: absolute; inset-inline-start: 0;  inset-inline-end: 0;  inset-block-end: 0; inset-block-start: -1px; z-index: 3; box-shadow: inset 1px 0 0 0 blue, inset -1px 0 0 0 blue, inset 0 -1px 0 0 blue, inset 0 1px 0 0 blue')}
      {...otherProps}>
      {allowsDragging && (
        <Cell isSticky className={dragButtonCellStyle}>
          {/* TODO: listgripper is from react-spectrum-ui? what do? */}
          <Button className={({isFocusVisible}) => dragButton({isFocusVisible})} slot="drag">≡</Button>
        </Cell>
      )}
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


let rowDropIndicator = style({
  // borderBottomWidth: 2,
  // borderColor: {
  //   default: 'transparent',
  //   isDropTarget: 'focus-ring'
  // },
  // borderStyle: 'solid',
  // forcedColorAdjust: 'none',
  // width: 240,
  // position: 'absolute',
  // TODO: Follow the same strategy as in the RAC docs for table, this way has the width automatically determined. With
  // absolute positioning it isn't as easy unless we get the caluclated width from somewhere (save for virtualization)
  outlineWidth: 1,
  outlineColor: 'focus-ring',
  outlineStyle: {
    default: 'none',
    isDropTarget: 'solid'
  },
  transform: 'translateZ(0)',
  position: 'relative',
  zIndex: 1000
});

interface DragandDropOptions extends Omit<AriaDragAndDropOptions, 'renderDropIndicator'> {}

// TODO:
// root drop indicator
// on row drop indicator

// TODO: the prop names and api here differ a bit from v3 (e.g. renderDragPreview(items) vs renderPreview(key, draggedKey))
// will need to vet the differences
export function useDragAndDrop(options: DragandDropOptions) {
  let renderDropIndicator = (target: DropTarget) => {
    return (
      <DropIndicator
        target={target}
        className={({isDropTarget}) => rowDropIndicator({isDropTarget})} />
    );
  };

  return useAriaDragAndDrop({...options, renderDropIndicator});
}
