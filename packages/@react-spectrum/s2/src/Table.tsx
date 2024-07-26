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
// Hide header support

// loading more when items already exist (needs ability to append extra row with progress circle)
// column dividers and text align (needs more info from rac so cells know if its parent column has showDivider)
// drop indicators in DnD + drag button styling (needs designs, but I can put in interim styling)

// resizing (roughly implemented, but will probably change a bit with virtualization. Right now with wrapping)
// overflow wrap (deferred till virtualization)
// table scrolling/height/width (deferred till virtualization. Kinda works with the resizerable table container)
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

let InternalTableContext = createContext<TableProps & {columnsResizable?: boolean, scale?: Scale}>({});

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
  outlineColor: 'gray-300',
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

    return layoutNode;
  }

  protected buildTableHeader(): LayoutNode {
    let layoutNode = super.buildTableHeader();
    layoutNode.layoutInfo.allowOverflow = true;
    return layoutNode;
  }
}

// TODO: v3 had min widths for hide header columns, but RAC table's useTableColumnResizeState
// call that happens internally doesn't accept options for that.
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

  let columnsResizable = !!(onResize || onResizeEnd || onResizeStart);
  // TODO: perhaps just make a useScale
  let scale = (useIsMobileDevice() ? 'large' : 'medium') as Scale;
  let context = useMemo(() => ({
    isQuiet,
    density,
    overflowMode,
    selectionStyle,
    loadingState,
    columnsResizable,
    scale
  }), [isQuiet, density, overflowMode, selectionStyle, loadingState, columnsResizable, scale]);

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
    isColumResizable: 0
  },
  // TODO: need to support text align and that would need to apply to all cells in the column, need to figure out how
  textAlign: 'start',
  outlineStyle: 'none',
  position: 'relative',
  fontSize: 'control',
  fontFamily: 'sans',
  fontWeight: 'bold',
  display: 'flex',
  // TODO: this border isn't perfect because it is flush with the first row's blue selected outline and the text is 17.5px instead of 18px
  borderColor: 'gray-300',
  borderXWidth: 0,
  borderTopWidth: 0,
  borderBottomWidth: 1,
  borderStyle: 'solid'
});

export interface ColumnProps extends RACColumnProps {
  // TODO: still need to figure out a way to do this, perhaps if I get the resize indicator to span the table then we can do something similar here
  showDivider?: boolean,
  isResizable?: boolean,
  children?: ReactNode
}

export function Column(props: ColumnProps) {
  let {isQuiet, columnsResizable} = useContext(InternalTableContext);
  let {isHeaderRowHovered} = useContext(InternalTableHeaderContext);
  let {isResizable, children} = props;
  let isColumResizable = columnsResizable && isResizable;

  return (
    <RACColumn {...props} className={renderProps => columnStyles({...renderProps, isQuiet, isColumResizable})}>
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

const columnContent = style({
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
    <div className={columnContent}>
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
      <span className={style({truncate: true})}>
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
  height: 'full',
  width: size(2),
  position: 'absolute',
  left: size(5)
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

// TODOS for resizing still
// need a blue line rendered for the column all the way down the body (need info in the cells of the column's resizing state)

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
              <div className={resizerHandle({isFocusVisible, isHovered, isResizing})} />
              {isFocusVisible && isResizing && <div className={nubbin}><Nubbin /></div>}
            </>
        )}
        </ColumnResizer>
      </div>
    </>
  );
}

const tableHeader = style({
  height: 'full',
  width: 'full',
  backgroundColor: 'base'
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
  borderStyle: 'solid'
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
  display: 'flex'
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
  }
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
  children: ReactNode
}

export function Cell(props: CellProps) {
  let {children, isSticky, ...otherProps} = props;
  let tableVisualOptions = useContext(InternalTableContext);

  return (
    <RACCell
      // Also isSticky prop is applied just for the layout, will decide what the RAC api should be later
      // @ts-ignore
      isSticky={isSticky}
      className={renderProps => cell({
        ...renderProps,
        ...tableVisualOptions
      })}
      {...otherProps}>
      {({isFocusVisible}) => (
        <>
          {/* Reason for doing it this way is because ideally I'd have a wrapper around the cell that is full width that serves as a background
            but can't have a div wrapping the cell here. I also want the padding applied on the RAC cell itself so a div wrapping the cell contents won't
            have the proper full height
          */}
          <div role="presentation" className={cellBackground({isSticky})} />
          <CellFocusRing isFocusVisible={isFocusVisible} />
          <span className={cellContent({...tableVisualOptions})}>{children}</span>
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


// TODO: for the borders between the tables, try doing 4 box shadows, one for each side. For the top and bottom box shadows, make them thicker
// in such a way that they overlap with the next/prev row, then just make it so the z-index of the selected one is higher so that it appears above the other
// border

// TODO: will also need to curve the first and last row, how to do this?
// ideally i'd be able to determine it from the collection which I could do by grabbing the tablestate context perhaps?
const row = style<RowRenderProps & S2TableProps>({
  height: 'full',
  position: 'relative',
  boxSizing: 'border-box',
  backgroundImage: {
    // TODO: will need the proper blue from tokens
    isFocusVisible: 'linear-gradient(to right, blue 0 3px, transparent 3px)'
  },
  backgroundColor: rowBackgroundColor,
  '--rowBackgroundColor': {
    type: 'backgroundColor',
    value: rowBackgroundColor
  },
  outlineStyle: 'none',
  // TODO: need to fix the row outlines
  // TODO: rough implementation for now, ideally this would just be the row outline or something.
  // will need to update the color to actually be a HCM style (Highlight)
  // TODO: for the overlapping issues, can do the same thing I did for ListView where I did 4 inset box shadows, one for each side
  // (here maybe just need to have one for sides)
  // TODO: I've replaced it with box shadow but still have the issue with the box shadow between two rows combining to make it thicker than
  // the lines on the side. Ideally, the box shadow could go on a element within the row and be absolutely positioned + offset via inset-block-start so that
  // it would overlap with other borders/box shadows and solve the problem of adjacent rows but to do that I would need to be able to know
  // if a row was next to a selected row or not
  // Also the current way will need proper colors and HCM colors
  boxShadow: {
    default: '[inset 0 -1px 0 0 gray]',
    // TODO: ideally 1px from the top and bottom of the selected row would be blue and then 1px from the adjacent above/below row would also be blue to form
    // this 2px selection outline. This however requires the rows to be able to know if an adjacent row is selected
    // isSelected: '[inset 0 0 0 1px blue]',
    isSelected: '[inset 1px 0 0 0 blue, inset -1px 0 0 0 blue, inset 0 -1px 0 0 blue, inset 0 1px 0 0 blue]',
    forcedColors: {
      default: '[inset 0 -1px 0 0 black]',
      isSelected: '[inset 0 0 0 1px black, inset 0 -2px 0 0 black]',
      isFocusVisible: '[inset 0 0 0 2px black, inset 0 -3px 0 0 black]'
    }
  },

  // outlineWidth: 1,
  // outlineOffset: -1,
  // outlineStyle: 'solid',
  // outlineColor: {
  //   isSelected: 'red-500',
  //   default: 'gray-300'
  // },


  // width: '[calc(100%-2px)]',
  // marginStart: '[1px]',
  // marginTop: '[-1px]',
  forcedColorAdjust: 'none'
  // TODO: This is an alternative to having the tablebody + cells render an outline
  //  what to do here? should boxShadow be expanded? Or should I just get the raw rgba for gray-300 and do light-dark?
  // Right now it is also getting cut off by the row, will need to curve first and last cell of the row but only if it is flush?
  // See if I can stop the overflow
  // boxShadow: '[0 0 0 1px black]',
  // borderRadius: '[7px]',
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
