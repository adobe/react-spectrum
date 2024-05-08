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
  Column as AriaColumn,
  Row as AriaRow,
  Table as AriaTable,
  TableHeader as AriaTableHeader,
  Button,
  Cell as AriaCell,
  Collection,
  ColumnProps,
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
  RowRenderProps
} from 'react-aria-components';
import {Checkbox} from './Checkbox';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {centerPadding, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {createContext, useContext} from 'react';

// TODO: things that are in the design for s2
// Density: spacious/compact/regular (for rows and columns)
// Curved corners for table
// Blue line at edge for row focus?
// All kinds of row content: avatars, links, statuslight, Date, etc
// empty state
// Quiet vs standard (quiet not curved)
// column dividers
// summary row

// TODO: things to support
// HCM


// TODO: questions
// has highlight selection changed in the design? Does it exist?


// TODO: audit the props and get omit stuff we don't want from the RAC props


// TODO: figure out what table styles we actually need
const table = style<TableRenderProps>({
  userSelect: 'none',
  minHeight: 0,
  minWidth: 0,
  borderSpacing: 0,
  fontFamily: 'sans'
}, getAllowedOverrides());

// TODO will need spectrum props that get propagated down like isQuiet, maybe just grab from spectrum props? For now just add these
// TODO: prop descriptions
interface TableStyleProps {
  isQuiet?: boolean,
  density?: 'compact' | 'spacious' | 'regular',
  overflowMode?: 'wrap' | 'truncate',
  selectionStyle?: 'checkbox' | 'highlight'
}

export interface TableProps extends Omit<RACTableProps, 'style'>, StyleProps, TableStyleProps {
}

let InternalTableContext = createContext<TableStyleProps>({});

export function Table(props: TableProps) {
  let {
    UNSAFE_style,
    UNSAFE_className,
    isQuiet = false,
    density = 'regular',
    overflowMode = 'truncate',
    selectionStyle = 'checkbox',
    styles,
    ...otherProps
  } = props;

  return (
    <InternalTableContext.Provider value={{isQuiet, density, overflowMode, selectionStyle}}>
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
const tablebody = style<TableBodyRenderProps & TableStyleProps>({
  backgroundColor: {
    default: 'gray-25',
    isQuiet: 'transparent'
  },
  outlineColor: 'gray-200',
  outlineWidth: {
    default: 1,
    isQuiet: 0
  },
  outlineStyle: {
    default: 'solid',
    isQuiet: 'none'
  },
  // TODO: closest one is "default" which is 8px
  borderRadius: {
    default: '[7px]',
    isQuiet: '[0px]'
  }
});


// TODO: get rid of depenedencies from the props?
export interface TableBodyProps<T> extends Omit<RACTableBodyProps<T>, 'style'> {}

export function TableBody<T extends object>(props: TableBodyProps<T>) {
  let tableVisualOptions = useContext(InternalTableContext);

  return (
    <AriaTableBody
      className={renderProps => tablebody({
        ...renderProps,
        ...tableVisualOptions
      })}
      {...props} />
  );
}

// TODO: what should the focus ring for the column look like? flush with the top row's outline? Right now it overlaps the body's border. I think I'll add some padding to the bottom to account for this
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
  zIndex: 1,
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
  fontSize: 'control'
});

export function Column(props: ColumnProps) {
  return (
    <AriaColumn {...props} className={columnStyles}>
      {({allowsSorting, sortDirection, isFocusVisible}) => (
        <>
          <CellFocusRing isFocusVisible={isFocusVisible} />
          {props.children}
          {allowsSorting && (
            <span aria-hidden="true" className="sort-indicator">
              {sortDirection === 'ascending' ? '▲' : '▼'}
            </span>
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
    // TODO: double check if nested columns work with this implementation
    <AriaTableHeader>
      {/* Add extra columns for drag and drop and selection. */}
      {allowsDragging && <AriaColumn />}
      {selectionBehavior === 'toggle' && (
        <AriaColumn className={selectAllCheckboxColumn}>
          {({isFocusVisible}) => (
            <>
              <CellFocusRing isFocusVisible={isFocusVisible} />
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
const row = style<RowRenderProps & TableStyleProps>({
  position: 'relative',
  boxSizing: 'border-box',
  backgroundColor: {
    default: 'gray-25',
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
  }
  // outlineStyle: 'none'
  // TODO Disabled styles

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
        <Cell>
          {/* TODO: will need to support renderProps function for TableRow so that I can render the span only when the row is focused and isFocusVisible */}
          {/* <span className={rowFocus} /> */}
          <Button slot="drag">≡</Button>
        </Cell>
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
  borderColor: 'gray-300',
  borderBottomWidth: 1,
  borderTopWidth: 0,
  borderXWidth: 0,
  borderStyle: 'solid',
  position: 'relative'
} as const;

const cell = style<CellRenderProps & TableStyleProps>({
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
  // TODO: will also need to make the first and last curved? Save this for later when we do virtualization?
  borderColor: 'gray-300',
  borderBottomWidth: 1,
  borderTopWidth: 0,
  borderXWidth: 0,
  borderStyle: 'solid',
  color: 'gray-800',
  outlineStyle: 'none'
  // TODO the focus ring isn't rounded because applying a border radius will break the gray bottom border provided by the cell
  // Alternative approach is to perhaps have the row render the gray bottom via box shadow maybe
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
  // TODO: will need to handle disabling this
  // let tableVisualOptions = useContext(InternalTableContext);
  return (
    <AriaCell
      className={checkboxCellStyle}
      {...props} />
  );
}
