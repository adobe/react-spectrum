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
  Cell as AriaCell,
  Collection,
  Column as AriaColumn,
  ColumnProps as RACColumnProps,
  Row as AriaRow,
  RowProps,
  TableHeaderProps,
  TableProps as RACTableProps,
  TableBody as AriaTableBody,
  TableBodyProps as RACTableBodyProps,
  useTableOptions,
  TableRenderProps,
  CellProps,
  CellRenderProps,
  TableBodyRenderProps,
  RowRenderProps,
  Provider,
  Key,
  ResizableTableContainer,
  ColumnResizer,
  ColumnRenderProps,
  useDragAndDrop as useAriaDragAndDrop,
  DragAndDropOptions as AriaDragAndDropOptions,
  DropIndicator,
  DropTarget,
  UNSTABLE_TableLoader
} from 'react-aria-components';
import {Checkbox} from './Checkbox';
import {lightDark, style} from '../style/spectrum-theme' with {type: 'macro'};
import {centerPadding, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import React, {createContext, ReactNode, useContext, useMemo} from 'react';
import {ProgressCircle} from './ProgressCircle';
import SortDownArrow from '../s2wf-icons/assets/svg/S2_Icon_SortDown_20_N.svg';
import SortUpArrow from '../s2wf-icons/assets/svg/S2_Icon_SortUp_20_N.svg';
import Chevron from '../ui-icons/Chevron';
import {IconContext} from './Icon';
import {ColumnSize} from '@react-types/table';
import {Menu, MenuItem, MenuTrigger} from './Menu';

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
  /**
   * Sets the overflow behavior for the cell contents.
   * @default 'truncate'
   */
  overflowMode?: 'wrap' | 'truncate',
  /** How selection should be displayed. */
  selectionStyle?: 'checkbox' | 'highlight',
  /** Whether the items are currently loading. */
  isLoading?: boolean,

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
  onResizeEnd?: (widths: Map<Key, ColumnSize>) => void
}

// TODO: audit the props and get omit stuff we don't want from the RAC props
export interface TableProps extends Omit<RACTableProps, 'style' | 'disabledBehavior' | 'className' | 'onRowAction' | 'selectionBehavior' | 'onScroll' | 'onCellAction'>, StyleProps, S2TableProps {
}

let InternalTableContext = createContext<TableProps & {columnsResizable?: boolean}>({});

const tableWrapper = style({
  overflow: 'auto',
  width: '[300px]'
});

const table = style<TableRenderProps>({
  userSelect: 'none',
  minHeight: 0,
  minWidth: 0,
  borderSpacing: 0,
  fontFamily: 'sans'
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
    default: '[11px]', // table-row-top-to-text-medium-regular
    density: {
      spacious: '[15px]', // table-row-top-to-text-medium-spacious
      compact: '[6px]' // table-row-top-to-text-medium-compact
    }
  },
  paddingBottom: {
    default: '[12px]', // table-row-bottom-to-text-medium-spacious
    density: {
      spacious: '[16px]', // table-row-bottom-to-text-medium-spacious
      compact: '[9px]' // table-row-bottom-to-text-medium-compact
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

export function Table(props: TableProps) {
  let {
    UNSAFE_style,
    UNSAFE_className,
    isQuiet = false,
    density = 'regular',
    overflowMode = 'truncate',
    selectionStyle = 'checkbox',
    styles,
    isLoading,
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
  let context = useMemo(() => ({isQuiet, density, overflowMode, selectionStyle, isLoading, columnsResizable}), [isQuiet, density, overflowMode, selectionStyle, isLoading, columnsResizable]);
  // TODO: memo the values provided to the context
  let baseTable = (
    <InternalTableContext.Provider value={context}>
      <AriaTable
        style={UNSAFE_style}
        className={renderProps => (UNSAFE_className || '') + table({
          ...renderProps
        }, styles)}
        selectionBehavior={selectionStyle === 'highlight' ? 'replace' : 'toggle'}
        dragAndDropHooks={dragAndDropHooks}
        {...otherProps} />
    </InternalTableContext.Provider>
  );

  if (columnsResizable) {
    baseTable = (
      // TODO: should the styles the user provides go right on this container instead of on the Table itself? Is there anyway we could split these out?
      // Right now I've just hard coded the width
      // TODO: also the current styling cuts off the table body border/outline. Even with additional padding to compensate for this, the rest of the body is still
      // out of view since the container itself is the scrollable region instead of the body itself. Not sure how to actually style it so that we get the
      // body outline visible at all times (can't make the container have the outline since that goes around the columns too)
      <ResizableTableContainer onResize={onResize} onResizeEnd={onResizeEnd} onResizeStart={onResizeStart} className={tableWrapper}>
        {baseTable}
      </ResizableTableContainer>
    );
  }

  return baseTable;
}

// TODO: will need focus styles for when it is focused due to empty state
// styles for root drop target
const tableBody = style<TableBodyRenderProps & S2TableProps>({
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
    default: 'default',
    isQuiet: 'none'
  }
});

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
  let emptyRender;
  let renderer = children;
  let loader = (
    <UNSTABLE_TableLoader>
      {/* @ts-ignore need to update type in RAC */}
      {({isTableEmpty}) => (
        <div className={centeredWrapper}>
          <ProgressCircle
            isIndeterminate
            // TODO: needs intl translation
            aria-label={isTableEmpty ? 'loading' : 'loading more'} />
        </div>
      )}
    </UNSTABLE_TableLoader>
  );
  // If the user is rendering their rows in dynamic fashion, wrap their render function in Collection so we can inject
  // the loader. Otherwise it is a static renderer and thus we can simply add the table loader after
  if (typeof children === 'function' && items) {
    renderer = (
      <>
        <Collection items={items}>
          {children}
        </Collection>
        {tableVisualOptions.isLoading && loader}
      </>
    );
  } else {
    renderer = (
      <>
        {children}
        {tableVisualOptions.isLoading && loader}
      </>
    );
  }

  if (renderEmptyState != null) {
    emptyRender = (props: TableBodyRenderProps) => (
      <div className={centeredWrapper}>
        {/* @ts-ignore TODO figure out why it is complaining tahat this is possibly undefined */}
        {renderEmptyState(props)}
      </div>
    );
  }

  return (
    <AriaTableBody
      className={renderProps => tableBody({
        ...renderProps,
        ...tableVisualOptions
      })}
      {...props}
      renderEmptyState={emptyRender}
      dependencies={[tableVisualOptions.isLoading]}>
      {renderer}
    </AriaTableBody>
  );
}

// TODO: what should the focus ring for the column look like? flush with the top row's outline? Right now it overlaps the body's border.
// Additionally, the cell specific styles in the design show that the focus ring sits on top of the 1px gray row bottom border (same with the blue left hand indicator)
// but the table playground design example shows that the blue selection box takes over .5px of that border?
// TODO: The border radius on this focus ring doesn't match with the 7px border radius of the table body, meaning it won't be flush when the user is keyboard focused on
// a cell at the end of the table. Clarify with Spectrum design
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
  outlineOffset: '[-2px]', // Maybe can use space?
  outlineWidth: 2,
  outlineColor: 'focus-ring',
  borderRadius: 'sm'
});

function CellFocusRing(props: {isFocusVisible: boolean}) {
  let {isFocusVisible} = props;
  return <span className={cellFocus({isFocusVisible})} />;
}

const columnStyles = style({
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
  // TODO: would be nice to not have to hard code these
  paddingTop: {
    default: '[7px]',  // table-column-header-row-top-to-text-medium
    isColumResizable: 0
  },
  paddingBottom: {
    default: '[8px]', // table-column-header-row-top-to-text-medium
    isColumResizable: 0
  },
  textAlign: 'start',
  outlineStyle: 'none',
  position: 'relative',
  fontSize: 'control',
  fontFamily: 'sans',
  fontWeight: 'bold'
  // TODO: right now in quiet, we are missing the top horizontal line separator between the columns and the first row
  // I could add this via border but that would introduce a shift in positioning and unfortunately can't use a negative margin on a th element
  // borderColor: 'gray-200',
  // borderXWidth: 0,
  // borderTopWidth: 0,
  // borderBottomWidth: {
  //   isQuiet: 1
  // },
  // borderStyle: {
  //   isQuiet: 'solid'
  // }
});

export interface ColumnProps extends RACColumnProps {
  showDivider?: boolean,
  isResizable?: boolean,
  children?: ReactNode
}

export function Column(props: ColumnProps) {
  let {isQuiet, columnsResizable} = useContext(InternalTableContext);
  let {isResizable, children} = props;
  let isColumResizable = columnsResizable && isResizable;

  return (
    <AriaColumn {...props} className={renderProps => columnStyles({...renderProps, isQuiet, isColumResizable})}>
      {({allowsSorting, sortDirection, isFocusVisible, sort, startResize, isHovered}) => (
        <>
          {/* Note this is mainly for column's without a dropdown menu. If there is a dropdown menu, the button is styled to have a focus ring for simplicity
          (no need to juggle showing this focus ring if focus is on the menu button and not if it is on the resizer) */}
          <CellFocusRing isFocusVisible={isFocusVisible} />
          {columnsResizable && isResizable ?
            (
              <ResizableColumnContents allowsSorting={allowsSorting} sortDirection={sortDirection} sort={sort} startResize={startResize} isHovered={isHovered}>
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
    </AriaColumn>
  );
}

// TODO combine the ColumnContents and the ResizableColumnContents further so they share the same sort stuff
interface ColumnContentProps extends Pick<ColumnRenderProps, 'allowsSorting' | 'sortDirection'>, Pick<ColumnProps, 'children'> {}

function ColumnContents(props: ColumnContentProps) {
  let {allowsSorting, sortDirection, children} = props;

  return (
    <div className={style({display: 'flex', alignItems: 'center'})}>
      {allowsSorting && (
        <Provider
          values={[
            [IconContext, {
              styles: style({
                height: 16,
                width: 16,
                marginEnd: 8
              })
            }]
          ]}>
          {sortDirection != null && (
            sortDirection === 'ascending' ? <SortUpArrow /> : <SortDownArrow />
          )}
        </Provider>
      )}
      {/* TODO How to place the sort icon in front of the text like it shows in the designs?
        Since we need to reserve room for the icon to prevent header shifting, placing it in front of the text will offset the text with the
        row value. Additionally, if we don't reserve room for the icon, then the width of the table column changes, causing a shift in layout
        Should I just have the ResizeableTableWrapper always on?  */}
      {children}
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
  paddingTop: '[7px]', // table-column-header-row-top-to-text-medium
  paddingBottom: '[8px]', // table-column-header-row-top-to-text-medium
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
  outlineOffset: '[-2px]', // Maybe can use space?
  outlineWidth: 2,
  outlineColor: 'focus-ring',
  borderRadius: 'sm'
});

const resizerHandleContainer = style({
  width: 12,
  height: 'full',
  position: 'absolute',
  top: 0,
  right: '[-6px]',
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
  // TODO: seems to have problems moving focus to the resizer if we conditionally hide it. For now just skip over it in keyboard navigation with the data-attribute
  // Will need to update rac for this first
  // display: {
  //   default: 'none',
  //   isHovered: 'block',
  //   isFocusVisible: 'block',
  //   isResiziing: 'block',
  //   isFocused: 'block'
  // }
});

const resizerHandle = style({
  backgroundColor: {
    default: 'transparent',
    isHovered: 'gray-300',
    isFocusVisible: 'focus-ring',
    isResizing: 'focus-ring'
  },
  height: 'full',
  width: '[2px]',
  position: 'absolute',
  left: '[5px]'
});

const sortIcon = style({
  height: 16,
  width: 16,
  marginEnd: 'text-to-visual',
  minWidth: 16
});

const columnHeaderText = style({
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  // Make it so the text doesn't completely disappear when column is resized to smallest width + both sort and chevron icon is rendered
  minWidth: 8,
  overflow: 'hidden',
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
  left: '[-2px]',
  width: 16,
  height: 16
});

interface ResizableColumnContentProps extends Pick<ColumnRenderProps, 'allowsSorting' | 'sort' | 'sortDirection' | 'startResize' | 'isHovered'> {
  children: ReactNode
}

// TODOS for resizing still
// show all resizer handles on hover (need info from header row, but it doesn't have renderProp function support)
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

const selectAllCheckbox = style({
  marginX: 16, // table-edge-to-content
  marginY: centerPadding()
});

const selectAllCheckboxColumn = style({
  padding: 0,
  height: 32, // table-row-height-medium-compact
  borderRadius: 'sm',
  outlineStyle: 'none',
  position: 'relative'
});

export function TableHeader<T extends object>(
  {columns, children}: TableHeaderProps<T>
) {
  let {selectionBehavior, selectionMode, allowsDragging} = useTableOptions();

  return (
    <AriaTableHeader>
      {/* Add extra columns for drag and drop and selection. */}
      {allowsDragging && (
        <AriaColumn className={selectAllCheckboxColumn}>
          {({isFocusVisible}) => <CellFocusRing isFocusVisible={isFocusVisible} />}
        </AriaColumn>
      )}
      {selectionBehavior === 'toggle' && (
        <AriaColumn className={selectAllCheckboxColumn}>
          {({isFocusVisible}) => (
            <>
              {selectionMode === 'single' &&
                <CellFocusRing isFocusVisible={isFocusVisible} />
              }
              {selectionMode === 'multiple' &&
                <Checkbox isEmphasized styles={selectAllCheckbox} slot="selection" />
              }
            </>
          )}
        </AriaColumn>
      )}
      <Collection items={columns}>
        {children}
      </Collection>
    </AriaTableHeader>
  );
}

const commonCellStyles = {
  borderColor: 'transparent',
  // TODO: will also need to make the first and last curved? Save this for later when we do virtualization?
  // TODO Alternative approach is to perhaps have the row render the gray bottom via box shadow maybe
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
  // TODO: figure out if there is a better way then this cuz these are hardcoded and won't change with scale
  // when they probably should
  paddingTop: {
    default: '[11px]', // table-row-top-to-text-medium-regular
    density: {
      spacious: '[15px]', // table-row-top-to-text-medium-spacious
      compact: '[6px]' // table-row-top-to-text-medium-compact
    }
  },
  paddingBottom: {
    default: '[12px]', // table-row-bottom-to-text-medium-spacious
    density: {
      spacious: '[16px]', // table-row-bottom-to-text-medium-spacious
      compact: '[9px]' // table-row-bottom-to-text-medium-compact
    }
  },
  fontSize: 'control'
});

const checkboxCellStyle = style({
  ...commonCellStyles,
  paddingY: centerPadding()
});

// TODO: placeholder styles until we confirm the design
const dragButtonCellStyle = style({
  ...commonCellStyles,
  paddingX: 4,
  paddingY: centerPadding()
});

export function Cell(props: CellProps) {
  let {children, ...otherProps} = props;
  let tableVisualOptions = useContext(InternalTableContext);
  return (
    <AriaCell
      className={renderProps => cell({
        ...renderProps,
        ...tableVisualOptions
      })}
      {...otherProps}>
      {({isFocusVisible}) => (
        <>
          <CellFocusRing isFocusVisible={isFocusVisible} />
          {children}
        </>
      )}
    </AriaCell>
  );
}


// TODO: for the borders between the tables, try doing 4 box shadows, one for each side. For the top and bottom box shadows, make them thicker
// in such a way that they overlap with the next/prev row, then just make it so the z-index of the selected one is higher so that it appears above the other
// border

// TODO: will also need to curve the first and last row, how to do this?
// ideally i'd be able to determine it from the collection which I could do by grabbing the tablestate context perhaps?
const row = style<RowRenderProps & S2TableProps>({
  position: 'relative',
  boxSizing: 'border-box',
  backgroundImage: {
    // TODO: will need the proper blue from tokens
    isFocusVisible: 'linear-gradient(to right, blue 0 4px, transparent 4px)'
  },
  backgroundColor: {
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
  },
  // TODO: will need to handle overflow mode wrap
  height: {
    default: 40, // table-row-height-medium-regular
    density: {
      spacious: 48, // table-row-height-medium-spacious
      compact: 32 // table-row-height-medium-compact
    }
  },
  outlineStyle: 'none',
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
    isSelected: '[inset 0 0 0 2px blue]',
    forcedColors: {
      default: '[inset 0 -1px 0 0 black]',
      isSelected: '[inset 0 0 0 1px black, inset 0 -2px 0 0 black]',
      isFocusVisible: '[inset 0 0 0 2px black, inset 0 -3px 0 0 black]'
    }
  },
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
  width: '[13px]',
  height: '[20px]',
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
  outlineOffset: '[-2px]', // Maybe can use space?
  outlineWidth: 2,
  outlineColor: 'focus-ring',
  borderRadius: 'sm'
});

export function Row<T extends object>(
  {id, columns, children, ...otherProps}: RowProps<T>
) {
  let {selectionBehavior, allowsDragging, selectionMode} = useTableOptions();
  let tableVisualOptions = useContext(InternalTableContext);

  return (
    <AriaRow
      id={id}
      className={renderProps => row({
        ...renderProps,
        ...tableVisualOptions
      })}
      {...otherProps}>
      {allowsDragging && (
        <Cell className={dragButtonCellStyle}>
          {/* TODO: listgripper is from react-spectrum-ui? what do? */}
          <Button className={({isFocusVisible}) => dragButton({isFocusVisible})} slot="drag">≡</Button>
        </Cell>
      )}
      {selectionMode !== 'none' && selectionBehavior === 'toggle' && (
        <Cell className={checkboxCellStyle}>
          <Checkbox isEmphasized slot="selection" />
        </Cell>
      )}
      <Collection items={columns}>
        {children}
      </Collection>
    </AriaRow>
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
