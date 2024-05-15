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
  Key
} from 'react-aria-components';
import {Checkbox} from './Checkbox';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {centerPadding, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {createContext, useContext} from 'react';
import {ProgressCircle} from './ProgressCircle';
import SortDownArrow from '../s2wf-icons/assets/svg/S2_Icon_SortDown_20_N.svg';
import SortUpArrow from '../s2wf-icons/assets/svg/S2_Icon_SortUp_20_N.svg';
import {IconContext} from './Icon';
import {ColumnSize} from '@react-types/table';

// TODO: things that still need to be handled
// styling polish (outlines are overlapping/not being cut by table body/need blue outline for row selection)

// Blue line at edge for row focus (needs more info from rac, namely when a row is focus visible but we don't have render prosp)
// loading more when items already exist (needs ability to append extra row with progress circle)
// column dividers (needs more info from rac so cells know if its parent column has showDivider)
// drop indicators in DnD + drag button styling (needs more info from rac aka ability to style the drop indicators directly and designs)

// resizing (deferred till virtualization)
// overflow wrap (deferred till virtualization)
// table scrolling/height/width (deferred till virtualization)
// summary row (to discuss, is this a separate row? What accessibility goes into this)

// nested column support (RAC limitation? I remember talking about this when we explored moving TableView to new collections api)

const table = style<TableRenderProps>({
  userSelect: 'none',
  minHeight: 0,
  minWidth: 0,
  borderSpacing: 0,
  fontFamily: 'sans'
}, getAllowedOverrides({height: true}));

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

let InternalTableContext = createContext<TableProps>({});

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
    ...otherProps
  } = props;

  return (
    <InternalTableContext.Provider value={{isQuiet, density, overflowMode, selectionStyle, isLoading}}>
      <AriaTable
        style={UNSAFE_style}
        className={renderProps => (UNSAFE_className || '') + table({
          ...renderProps
        }, styles)}
        selectionBehavior={selectionStyle === 'highlight' ? 'replace' : 'toggle'}
        {...otherProps} />
    </InternalTableContext.Provider>
  );
}

// TODO: will need focus styles for when it is focused due to empty state
// styles for root drop target
const tableBody = style<TableBodyRenderProps & S2TableProps>({
  backgroundColor: {
    default: 'gray-25',
    isQuiet: 'transparent'
  },
  outlineColor: 'gray-200',
  outlineWidth: {
    default: 1,
    isQuiet: 0
  },
  outlineStyle: 'solid',
  // TODO: closest one is "default" which is 8px
  borderRadius: {
    default: '[7px]',
    isQuiet: '[0px]'
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
  let {items, renderEmptyState} = props;
  let tableVisualOptions = useContext(InternalTableContext);
  let emptyRender;

  if (items && [...items].length === 0 && tableVisualOptions.isLoading) {
    emptyRender = () => (
      <div className={centeredWrapper}>
        <ProgressCircle
          isIndeterminate
          // TODO: needs intl translation
          aria-label="loading" />
      </div>
    );
  } else if (renderEmptyState != null) {
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
      renderEmptyState={emptyRender} />
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
  borderRadius: '[2px]'
});

function CellFocusRing(props: {isFocusVisible: boolean}) {
  let {isFocusVisible} = props;
  return <span className={cellFocus({isFocusVisible})} />;
}

const columnStyles = style({
  paddingX: 16,
  // TODO: would be nice to not have to hard code these
  paddingTop: '[7px]',
  paddingBottom: '[8px]',
  textAlign: 'start',
  color: 'gray-800',
  outlineStyle: 'none',
  position: 'relative',
  fontSize: 'control',
  cursor: {
    allowsSorting: 'pointer'
  }
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

const sort = style({
  visibility: {
    default: 'hidden',
    isVisible: 'visible'
  },
  verticalAlign: 'baseline',
  paddingStart: 'text-to-visual'
});

export interface ColumnProps extends RACColumnProps {
  showDivider?: boolean
}

export function Column(props: ColumnProps) {
  let {isQuiet} = useContext(InternalTableContext);

  return (
    <AriaColumn {...props} className={renderProps => columnStyles({...renderProps, isQuiet})}>
      {({allowsSorting, sortDirection, isFocusVisible}) => (
        <>
          <CellFocusRing isFocusVisible={isFocusVisible} />
          {/* TODO How to place the sort icon in front of the text like it shows in the designs?
            Since we need to reserve room for the icon to prevent header shifting, placing it in front of the text will offset the text with the
            row value. Additionally, if we don't reserve room for the icon, then the width of the table column changes, causing a shift in layout  */}
          {props.children}
          {allowsSorting && (
            <Provider
              values={[
                // TODO: fix vertical centering. Could center it with a margin-top if the table header was a display inline-flex instead of a table cell but that messes up the columns lining up with the row cell content
                [IconContext, {
                  styles: style({
                    height: 16,
                    width: 16
                  })
                }]
              ]}>
              <span aria-hidden="true" className={sort({isVisible: sortDirection != null})}>
                {sortDirection === 'ascending' ? <SortUpArrow /> : <SortDownArrow />}
              </span>
            </Provider>
          )}
        </>
      )}
    </AriaColumn>
  );
}

const selectAllCheckbox = style({
  marginX: 16,
  marginY: centerPadding()
});

const selectAllCheckboxColumn = style({
  padding: 0,
  height: 32,
  borderRadius: '[2px]',
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
      {allowsDragging && <AriaColumn />}
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

// TODO: might need this to communicate stuff to the cells within
// let InternalRowContext = createContext<{isQuiet?: boolean}>({});

// TODO: figure out these colors for quiet vs not quiet. Figma shows gray-25 for non quiet but that matches background?
// is keyboard focus on a non selected row supposed to only show a focus ring withou any changes to the background?
// Bit confusing since some of the non-quiet tables are on a  248,248,248 background and thus have 255,255,255 background color
// but then the cell background color show 248,248,248 as their back ground color
// Also ask if the Figma can be updated to reflect the actual token values, I'm not seeing them for the most part it feels

// TODO: will also need to curve the first and last row, how to do this?
// ideally i'd be able to determine it from the collection which I could do by grabbing the tablestate context perhaps?
const row = style<RowRenderProps & S2TableProps>({
  position: 'relative',
  boxSizing: 'border-box',
  backgroundColor: {
    default: 'gray-25',
    // TODO: don't forget to change this to isFocusVisibleWithin so that it applies when the cell in the row is keyboard focused
    isFocusVisible: 'gray-100',
    isHovered: 'gray-100',
    isPressed: 'gray-200',
    isSelected: {
      // TODO: these need to be updated, the figma has this as informative/default but that color doesn't seem to match with the actual light blue?
      // The below are my best guess but look odd in dark mode
      default: 'informative-200',
      isFocusVisible: 'informative-300',
      isHovered: 'informative-300',
      isPressed: 'informative-300'
    },
    isQuiet: {
      // TODO: there aren't designs for quiet + selected? For now I've made it the same as non-quiet
      default: 'transparent',
      isFocusVisible: 'gray-100',
      isHovered: 'gray-100',
      isPressed: 'gray-200',
      isSelected: {
        default: 'informative-200',
        isFocusVisible: 'informative-300',
        isHovered: 'informative-300',
        isPressed: 'informative-300'
      }
    },
    forcedColors: {
      default: 'transparent'
    }
  },
  // TODO: will need to handle overflow mode wrap
  height: {
    default: 40,
    density: {
      spacious: 48,
      compact: 32
    }
  },
  // TODO will get rid of outlineStyle in general but keeping it for non forced colors until I figure out a good way to render the row's
  // focus ring
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

// TODO: bring this back when I add renderProps support to table
// const rowFocus = style({
//   display: 'inline-block',
//   position: 'absolute',
//   width: 4,
//   height: 'full',
//   insetStart: 0,
//   top: 0,
//   marginEnd: '[-4px]',
//   zIndex: 4,
//   backgroundColor: 'focus-ring'
// });

const dragButton = style({
  color: {
    isFocusVisible: '[red]'
  }
});

// TODO: How to style the drop indicators? We can't target them without using the selectors
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
        <DragButtonCell>
          {/* TODO: will need to support renderProps function for TableRow so that I can render the span only when the row is focused and isFocusVisible */}
          {/* <span className={rowFocus} /> */}
          <Button className={({isFocusVisible}) => dragButton({isFocusVisible})} slot="drag">≡</Button>
        </DragButtonCell>
      )}
      {selectionMode !== 'none' && selectionBehavior === 'toggle' && (
        <CheckboxCell>
          {/* TODO: uncomment when I add renderProps support for TableRow */}
          {/* {!allowsDragging && <span className={rowFocus} />} */}
          <Checkbox isEmphasized slot="selection" />
        </CheckboxCell>
      )}
      <Collection items={columns}>
        {children}
      </Collection>
    </AriaRow>
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
  }
} as const;

const cell = style<CellRenderProps & S2TableProps>({
  ...commonCellStyles,
  paddingX: 16,
  // TODO: figure out if there is a better way then this cuz these are hardcoded and won't change with scale
  // when they probably should
  paddingTop: {
    default: '[10px]',
    density: {
      spacious: '[15px]',
      compact: '[6px]'
    }
  },
  paddingBottom: {
    default: '[13px]',
    density: {
      spacious: '[16px]',
      compact: '[9px]'
    }
  },
  fontSize: 'control',
  outlineStyle: 'none'
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

const checkboxCellStyle = style({
  ...commonCellStyles,
  paddingX: 16,
  paddingY: centerPadding()
});

function CheckboxCell(props: CellProps) {
  return (
    <AriaCell
      className={checkboxCellStyle}
      {...props} />
  );
}

// TODO: placeholder styles until we confirm the design
const dragButtonCell = style({
  ...commonCellStyles,
  paddingX: 4,
  paddingY: centerPadding()
});

function DragButtonCell(props: CellProps) {
  return (
    <AriaCell
      className={dragButtonCell}
      {...props} />
  );
}
