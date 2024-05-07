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
  borderSpacing: 0
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
  outlineWidth: 1,
  outlineStyle: 'solid',
  // TODO: closest one is default which is 8px
  borderRadius: '[7px]'
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

export function Column(props: ColumnProps) {
  return (
    <AriaColumn {...props}>
      {({allowsSorting, sortDirection}) => (
        <>
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

export function TableHeader<T extends object>(
  {columns, children}: TableHeaderProps<T>
) {
  let {selectionBehavior, selectionMode, allowsDragging} = useTableOptions();

  return (
    <AriaTableHeader>
      {/* Add extra columns for drag and drop and selection. */}
      {allowsDragging && <AriaColumn />}
      {selectionBehavior === 'toggle' && (
        <AriaColumn>
          {selectionMode === 'multiple' &&
            <Checkbox slot="selection" />
          }
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
  // ...focusRing(),
  boxSizing: 'border-box',
  backgroundColor: {
    default: 'gray-25',
    isHovered: 'gray-100',
    isPressed: 'gray-200',
    isSelected: {
      // TODO: these need to be updated
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
  // TODO: This is an alternative to having the tablebody + cells render an outline
  //  what to do here? should boxShadow be expanded? Or should I just get the raw rgba for gray-300 and do light-dark?
  // Right now it is also getting cut off by the row, will need to curve first and last cell of the row but only if it is flush?
  // See if I can stop the overflow
  // boxShadow: '[0 0 0 1px black]',
  // borderRadius: '[7px]',
  // TODO: update row focus ring, right now it is the native outline
  // outlineStyle: 'none'
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
        <Cell>
          <Button slot="drag">≡</Button>
        </Cell>
      )}
      {selectionMode !== 'none' && selectionBehavior === 'toggle' && (
        <CheckboxCell>
          <Checkbox slot="selection" />
        </CheckboxCell>
      )}
      <Collection items={columns}>
        {children}
      </Collection>
    </AriaRow>
  );
}

// TODO: handle focus ring style, will need to be rounded
const cell = style<CellRenderProps & TableStyleProps>({
  // ...focusRing(),
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
  // TODO: make table cell focus ring. It needs to flush with the bottom border outline, the default blue focus indicator alias, border radius 2px
  // the closest I can do when follwing the same approach as the current outline styling is with outline-offset: -3px, outline width 2px but this leaves some
  // extra space on top. Also I can't set a border radius since it would affect the cell. Perhaps use a psudoelement
  // outlineStyle: 'none'
  outlineStyle: {
    default: 'none',
    isFocusVisible: 'solid'
  },
  outlineOffset: '[-3px]',
  outlineWidth: 2,
  outlineColor: 'focus-ring'
});

export function Cell(props: CellProps) {
  let tableVisualOptions = useContext(InternalTableContext);
  return (
    <AriaCell
      className={renderProps => cell({
        ...renderProps,
        ...tableVisualOptions
      })}
      {...props} />
  );
}

// TODO: make common style for both cells
const checkboxCellStyle = style({
  paddingX: 16,
  paddingY: centerPadding(),
  borderColor: 'gray-300',
  borderBottomWidth: 1,
  borderTopWidth: 0,
  borderXWidth: 0,
  borderStyle: 'solid'
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
