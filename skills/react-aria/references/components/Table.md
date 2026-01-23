# Table

A table displays data in rows and columns and enables a user to navigate its contents via directional navigation keys,
and optionally supports row selection and sorting.

## Vanilla 

CSS example

```tsx
import {Table, TableHeader, Column, Row, TableBody, Cell} from 'vanilla-starter/Table';

<Table>
  <TableHeader>
    <Column isRowHeader>Name</Column>
    <Column>Type</Column>
    <Column>Date Modified</Column>
  </TableHeader>
  <TableBody>
    <Row id="row-1">
      <Cell>Games</Cell>
      <Cell>File folder</Cell>
      <Cell>6/7/2020</Cell>
    </Row>
    <Row id="row-2">
      <Cell>Program Files</Cell>
      <Cell>File folder</Cell>
      <Cell>4/7/2021</Cell>
    </Row>
    <Row id="row-3">
      <Cell>bootmgr</Cell>
      <Cell>System file</Cell>
      <Cell>11/20/2010</Cell>
    </Row>
    <Row id="row-4">
      <Cell>log.txt</Cell>
      <Cell>Text Document</Cell>
      <Cell>1/18/2016</Cell>
    </Row>
  </TableBody>
</Table>
```

### Table.tsx

```tsx
'use client';
import {
  Button,
  Collection,
  Column as AriaColumn,
  ColumnProps as AriaColumnProps,
  Row as AriaRow,
  RowProps,
  Table as AriaTable,
  TableHeader as AriaTableHeader,
  TableHeaderProps,
  TableProps,
  useTableOptions,
  TableBodyProps,
  TableBody as AriaTableBody,
  CellProps,
  Cell as AriaCell,
  ColumnResizer,
  Group,
  TableLoadMoreItem as AriaTableLoadMoreItem,
  TableLoadMoreItemProps
} from 'react-aria-components';
import {Checkbox} from './Checkbox';
import {ProgressCircle} from './ProgressCircle';
import {ChevronUp, ChevronDown, GripVertical} from 'lucide-react';
import './Table.css';

export function Table(props: TableProps) {
  return <AriaTable {...props} />;
}

interface ColumnProps extends AriaColumnProps {
  allowsResizing?: boolean
}

export function Column(
  props: Omit<ColumnProps, 'children'> & { children?: React.ReactNode }
) {
  return (
    <AriaColumn {...props} className="react-aria-Column button-base">
      {({ allowsSorting, sortDirection }) => (
        <div className="column-header">
          <Group
            role="presentation"
            tabIndex={-1}
            className="column-name">
            {props.children}
          </Group>
          {allowsSorting && (
            <span aria-hidden="true" className="sort-indicator">
              {sortDirection === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          )}
          {props.allowsResizing && <ColumnResizer />}
        </div>
      )}
    </AriaColumn>
  );
}

export function TableHeader<T extends object>(
  { columns, children, ...otherProps }: TableHeaderProps<T>
) {
  let { selectionBehavior, selectionMode, allowsDragging } = useTableOptions();

  return (
    (
      <AriaTableHeader {...otherProps}>
        {/* Add extra columns for drag and drop and selection. */}
        {allowsDragging && <AriaColumn width={20} minWidth={20} style={{width: 20}} className="react-aria-Column button-base" />}
        {selectionBehavior === 'toggle' && (
          <AriaColumn width={32} minWidth={32} style={{width: 32}} className="react-aria-Column button-base">
            {selectionMode === 'multiple' && <Checkbox slot="selection" />}
          </AriaColumn>
        )}
        <Collection items={columns}>
          {children}
        </Collection>
      </AriaTableHeader>
    )
  );
}

export function Row<T extends object>(
  { id, columns, children, ...otherProps }: RowProps<T>
) {
  let { selectionBehavior, allowsDragging } = useTableOptions();

  return (
    (
      <AriaRow id={id} {...otherProps}>
        {allowsDragging && (
          <Cell>
            <Button slot="drag" className="drag-button"><GripVertical /></Button>
          </Cell>
        )}
        {selectionBehavior === 'toggle' && (
          <Cell>
            <Checkbox slot="selection" />
          </Cell>
        )}
        <Collection items={columns}>
          {children}
        </Collection>
      </AriaRow>
    )
  );
}

export function TableBody<T extends object>(props: TableBodyProps<T>) {
  return <AriaTableBody {...props} />;
}

export function Cell(props: CellProps) {
  return <AriaCell {...props} />;
}

export function TableLoadMoreItem(props: TableLoadMoreItemProps) {
  return (
    <AriaTableLoadMoreItem {...props}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <ProgressCircle isIndeterminate aria-label="Loading more..." />
      </div>
    </AriaTableLoadMoreItem>
  );
}

```

### Table.css

```css
@import "./theme.css";
@import "./utilities.css";

.react-aria-Table {
  border: 0.5px solid var(--border-color);
  border-radius: var(--radius);
  background: var(--overlay-background);
  overflow: clip;
  outline: none;
  border-spacing: 0;
  align-self: start;
  width: 100%;
  word-break: break-word;
  forced-color-adjust: none;
  font: var(--font-size) system-ui;

  &div {
    padding: 0;
  }

  &[data-focus-visible] {
    outline: 2px solid var(--focus-ring-color);
  }

  &[data-drop-target] {
    outline: 2px solid var(--highlight-background);
    background: var(--highlight-overlay)
  }

  &:has(.react-aria-TableBody[data-empty]) {
    height: 100%;
    min-height: 100px;
  }

  .react-aria-TableHeader {
    color: var(--text-color);
  }

  .react-aria-TableBody {
    padding: var(--spacing-1);

    &[data-empty] {
      text-align: center;
      font-style: italic;
    }
  }
}

.react-aria-Row {
  outline: none;
  cursor: default;
  color: var(--text-color);
  position: relative;
  transform: scale(1);
  transition-property: background, color;
  transition-duration: 200ms;
  -webkit-tap-highlight-color: transparent;

  &tr:last-child {
    border-radius: 0 0 var(--radius) var(--radius);
  }

  &[data-focus-visible] {
    outline: 2px solid var(--focus-ring-color);
    outline-offset: -2px;
  }

  &[data-pressed] {
    background: var(--gray-100);
  }

  &:nth-child(2n) {
    background: var(--gray-100);
    &[data-pressed] {
      background: var(--gray-200);
    }
  }

  &[data-selected] {
    background: var(--highlight-background);
    color: var(--highlight-foreground);
    --focus-ring-color: var(--highlight-foreground);

    &[data-focus-visible],
    .react-aria-Cell[data-focus-visible] {
      outline-offset: -4px;
    }

    &[data-pressed] {
      background: var(--highlight-background-pressed);
    }
  }

  &[data-disabled] {
    color: var(--text-color-disabled);
  }

  &[data-href] {
    cursor: pointer;
  }

  &[data-dragging] {
    opacity: 0.6;
    transform: translateZ(0);
  }

  &[data-drop-target] {
    outline: 2px solid var(--highlight-background);
    background: var(--highlight-overlay);
    z-index: 4;
  }

  .drag-button {
    all: unset;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 15px;
    text-align: center;

    svg {
      width: var(--spacing-4);
      height: var(--spacing-4);
    }

    &[data-focus-visible] {
      border-radius: 4px;
      outline: 2px solid var(--focus-ring-color);
    }
  }

  .react-aria-DropIndicator[data-drop-target] {
    outline: 1px solid var(--highlight-background);
    transform: translateZ(0);
  }
}

.react-aria-Cell,
.react-aria-Column {
  padding: var(--spacing-2);
  text-align: left;
  outline: none;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;

  &div {
    display: flex;
    align-items: center;
    height: 100%;
  }

  &:is(.react-aria-Row:last-child > :first-child) {
    border-end-start-radius: var(--radius);
  }

  &:is(.react-aria-Row:last-child > :last-child) {
    border-end-end-radius: var(--radius);
  }

  &[data-focus-visible] {
    outline: 2px solid var(--focus-ring-color);
    outline-offset: -2px;
  }
}

.react-aria-Column {
  --button-color: var(--gray);
  --button-border: transparent;
  --button-shadow: transparent;
  --button-border-size: 0px;
  cursor: default;
  border-bottom: 0.5px solid var(--border-color);
  border-inline-end: 0.5px solid var(--border-color);
  position: relative;
  z-index: calc(sibling-count() - sibling-index());

  &:last-child {
    border-inline-end: none;
  }

  &[data-pressed] {
    background: var(--gray-200);
  }

  &[data-sort-direction] {
    --button-color: var(--tint);

    &[data-pressed] {
      background: var(--tint-200);
    }
  }

  .column-header {
    display: flex;
    align-items: center;
    font-weight: 600;
  }

  .column-name {
    flex: 1;
    font: inherit;
    text-align: start;
    color: inherit;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border-color: transparent;
    border-radius: var(--radius-sm);

    &[data-focus-visible] {
      outline: 2px solid var(--focus-ring-color);
      outline-offset: 2px;
    }
  }

  .sort-indicator {
    padding: 0 2px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &:not([data-sort-direction]) .sort-indicator {
    visibility: hidden;
  }
}

.react-aria-ColumnResizer {
  width: 1px;
  border-radius: var(--radius-sm);
  background-color: var(--gray-500);
  padding: 0 var(--spacing-2);
  translate: var(--spacing-4) 0;
  height: 32px;
  margin: -16px 0;
  flex: 0 0 auto;
  touch-action: none;
  box-sizing: content-box;
  background-clip: content-box;

  &[data-resizable-direction=both] {
    cursor: ew-resize;
  }

  &[data-resizable-direction=left] {
    cursor: e-resize;
  }

  &[data-resizable-direction=right] {
    cursor: w-resize;
  }

  &[data-focus-visible] {
    background-color: var(--focus-ring-color);
    outline: 2px solid var(--focus-ring-color);
    outline-offset: -2px;
  }

  &[data-resizing] {
    width: 2px;
    background-color: var(--highlight-background);
  }
}

.react-aria-Cell {
  transform: translateZ(0);
  --border-color: var(--gray-300);
  tr:not(:last-child) & {
    border-bottom: 0.5px solid var(--border-color);
  }

  [data-selected]:has(+ [data-selected]) & {
    --border-color: rgb(255 255 255 / 0.3);
  }

  @media (forced-colors: active) {
    --border-color: ButtonBorder;
  }
}

.react-aria-DropIndicator[data-drop-target] {
  outline: 1px solid var(--highlight-background);
  transform: translateZ(0);
}

:where(.react-aria-Row) .react-aria-Checkbox {
  --checkmark-color: var(--highlight-background);
  &[data-selected] .indicator {
    --indicator-color: var(--highlight-foreground);
    --indicator-shadow: transparent;
  }
}

.react-aria-ResizableTableContainer {
  width: 100%;
  overflow: auto;
  position: relative;
  border: 0.5px solid var(--border-color);
  border-radius: var(--radius);
  background: var(--overlay-background);

  .react-aria-Table {
    border: none;
    border-radius: 0;

    &:has(.react-aria-TableBody[data-empty]) {
      height: 100%;
    }
  }

  .react-aria-TableHeader {
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .react-aria-Cell {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.react-aria-Cell img {
  height: 30px;
  width: 30px;
  object-fit: cover;
  display: block;
}

.react-aria-TableLoadingIndicator {
  height: 32px;
  position: relative;
}

```

## Tailwind example

```tsx
import {Table, TableHeader, TableBody, Column, Row, Cell} from 'tailwind-starter/Table';

<Table>
  <TableHeader>
    <Column isRowHeader>Name</Column>
    <Column>Type</Column>
    <Column>Date Modified</Column>
  </TableHeader>
  <TableBody>
    <Row id="row-1">
      <Cell>Games</Cell>
      <Cell>File folder</Cell>
      <Cell>6/7/2020</Cell>
    </Row>
    <Row id="row-2">
      <Cell>Program Files</Cell>
      <Cell>File folder</Cell>
      <Cell>4/7/2021</Cell>
    </Row>
    <Row id="row-3">
      <Cell>bootmgr</Cell>
      <Cell>System file</Cell>
      <Cell>11/20/2010</Cell>
    </Row>
    <Row id="row-4">
      <Cell>log.txt</Cell>
      <Cell>Text Document</Cell>
      <Cell>1/18/2016</Cell>
    </Row>
  </TableBody>
</Table>
```

### Table.tsx

```tsx
'use client';
import { ArrowUp } from 'lucide-react';
import React from 'react';
import {
  Cell as AriaCell,
  Column as AriaColumn,
  Row as AriaRow,
  Table as AriaTable,
  TableHeader as AriaTableHeader,
  TableBody as AriaTableBody,
  Button,
  CellProps,
  Collection,
  ColumnProps,
  ColumnResizer,
  Group,
  ResizableTableContainer,
  RowProps,
  TableHeaderProps,
  TableProps as AriaTableProps,
  composeRenderProps,
  useTableOptions,
  TableBodyProps
} from 'react-aria-components';
import { twMerge } from 'tailwind-merge';
import { tv } from 'tailwind-variants';
import { Checkbox } from './Checkbox';
import { composeTailwindRenderProps, focusRing } from './utils';

interface TableProps extends Omit<AriaTableProps, 'className'> {
  className?: string
}

export function Table(props: TableProps) {
  return (
    <ResizableTableContainer onScroll={props.onScroll} className={twMerge('w-full max-h-[320px] overflow-auto scroll-pt-[2.281rem] relative bg-white dark:bg-neutral-900 box-border border border-neutral-300 dark:border-neutral-700 rounded-lg font-sans', props.className)}>
      <AriaTable {...props} className="border-separate border-spacing-0 box-border overflow-hidden has-[>[data-empty]]:h-full" />
    </ResizableTableContainer>
  );
}

const columnStyles = tv({
  extend: focusRing,
  base: 'px-2 h-5 box-border flex-1 flex gap-1 items-center overflow-hidden'
});

const resizerStyles = tv({
  extend: focusRing,
  base: 'w-px px-[8px] translate-x-[8px] box-content py-1 h-5 bg-clip-content bg-neutral-400 dark:bg-neutral-500 forced-colors:bg-[ButtonBorder] cursor-col-resize rounded-xs resizing:bg-blue-600 forced-colors:resizing:bg-[Highlight] resizing:w-[2px] resizing:pl-[7px] -outline-offset-2'
});

export function Column(props: ColumnProps) {
  return (
    <AriaColumn {...props} className={composeTailwindRenderProps(props.className, 'box-border h-1 [&:hover]:z-20 focus-within:z-20 text-start text-sm font-semibold text-neutral-700 dark:text-neutral-300 cursor-default')}>
      {composeRenderProps(props.children, (children, { allowsSorting, sortDirection }) => (
        <div className="flex items-center">
          <Group
            role="presentation"
            tabIndex={-1}
            className={columnStyles}
          >
            <span className="truncate">{children}</span>
            {allowsSorting && (
              <span
                className={`w-4 h-4 flex items-center justify-center transition ${
                  sortDirection === 'descending' ? 'rotate-180' : ''
                }`}
              >
                {sortDirection && <ArrowUp aria-hidden className="w-4 h-4 text-neutral-500 dark:text-neutral-400 forced-colors:text-[ButtonText]" />}
              </span>
            )}
          </Group>
          {!props.width && <ColumnResizer className={resizerStyles} />}
        </div>
      ))}
    </AriaColumn>
  );
}

export function TableHeader<T extends object>(props: TableHeaderProps<T>) {
  let { selectionBehavior, selectionMode, allowsDragging } = useTableOptions();

  return (
    <AriaTableHeader {...props} className={composeTailwindRenderProps(props.className, 'sticky top-0 z-10 bg-neutral-100/60 dark:bg-neutral-700/60 backdrop-blur-md supports-[-moz-appearance:none]:bg-neutral-100 dark:supports-[-moz-appearance:none]:bg-neutral-700 forced-colors:bg-[Canvas] rounded-t-lg border-b border-b-neutral-200 dark:border-b-neutral-700')}>
      {/* Add extra columns for drag and drop and selection. */}
      {allowsDragging && <Column />}
      {selectionBehavior === 'toggle' && (
        <AriaColumn width={36} minWidth={36} className="box-border p-2 text-sm font-semibold cursor-default text-start">
          {selectionMode === 'multiple' && <Checkbox slot="selection" />}
        </AriaColumn>
      )}
      <Collection items={props.columns}>
        {props.children}
      </Collection>
    </AriaTableHeader>
  );
}

export function TableBody<T extends object>(props: TableBodyProps<T>) {
  return (
    <AriaTableBody
      {...props}
      className="empty:italic empty:text-center empty:text-sm" />
  );
}

const rowStyles = tv({
  extend: focusRing,
  base: 'group/row relative cursor-default select-none -outline-offset-2 text-neutral-900 disabled:text-neutral-300 dark:text-neutral-200 dark:disabled:text-neutral-600 text-sm hover:bg-neutral-100 pressed:bg-neutral-100 dark:hover:bg-neutral-800 dark:pressed:bg-neutral-800 selected:bg-blue-100 selected:hover:bg-blue-200 selected:pressed:bg-blue-200 dark:selected:bg-blue-700/30 dark:selected:hover:bg-blue-700/40 dark:selected:pressed:bg-blue-700/40 last:rounded-b-lg'
});

export function Row<T extends object>(
  { id, columns, children, ...otherProps }: RowProps<T>
) {
  let { selectionBehavior, allowsDragging } = useTableOptions();

  return (
    <AriaRow id={id} {...otherProps} className={rowStyles}>
      {allowsDragging && (
        <Cell>
          <Button slot="drag">≡</Button>
        </Cell>
      )}
      {selectionBehavior === 'toggle' && (
        <Cell>
          <Checkbox slot="selection" />
        </Cell>
      )}
      <Collection items={columns}>
        {children}
      </Collection>
    </AriaRow>
  );
}

const cellStyles = tv({
  extend: focusRing,
  base: 'box-border [-webkit-tap-highlight-color:transparent] border-b border-b-neutral-200 dark:border-b-neutral-700 group-last/row:border-b-0 [--selected-border:var(--color-blue-200)] dark:[--selected-border:var(--color-blue-900)] group-selected/row:border-(--selected-border) [:is(:has(+[data-selected])_*)]:border-(--selected-border) p-2 truncate -outline-offset-2 group-last/row:first:rounded-bl-lg group-last/row:last:rounded-br-lg'
});

export function Cell(props: CellProps) {
  return (
    <AriaCell {...props} className={cellStyles} />
  );
}

```

## Content

`Table` follows the [Collection Components API](collections.md?component=Table), accepting both static and dynamic collections.
In this example, both the columns and the rows are provided to the table via a render function, enabling the user to hide and show columns and add additional rows.

```tsx
import {Table, TableHeader, Column, Row, TableBody, Cell} from 'vanilla-starter/Table';
import {CheckboxGroup} from 'vanilla-starter/CheckboxGroup';
import {Checkbox} from 'vanilla-starter/Checkbox';
import {Button} from 'vanilla-starter/Button';
import {useState} from 'react';

const columns = [
  {name: 'Name', id: 'name', isRowHeader: true},
  {name: 'Type', id: 'type'},
  {name: 'Date Modified', id: 'date'}
];

const initialRows = [
  {id: 1, name: 'Games', date: '6/7/2020', type: 'File folder'},
  {id: 2, name: 'Program Files', date: '4/7/2021', type: 'File folder'},
  {id: 3, name: 'bootmgr', date: '11/20/2010', type: 'System file'},
  {id: 4, name: 'log.txt', date: '1/18/2016', type: 'Text Document'}
];

function FileTable() {
  let [showColumns, setShowColumns] = useState(['name', 'type', 'date']);
  let visibleColumns = columns.filter(column => showColumns.includes(column.id));

  let [rows, setRows] = useState(initialRows);
  let addRow = () => {
    let date = new Date().toLocaleDateString();
    setRows(rows => [
      ...rows,
      {id: rows.length + 1, name: 'file.txt', date, type: 'Text Document'}
    ]);
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'start', width: '100%'}}>
      <CheckboxGroup aria-label="Show columns" value={showColumns} onChange={setShowColumns} orientation="horizontal">
        <Checkbox value="type">Type</Checkbox>
        <Checkbox value="date">Date Modified</Checkbox>
      </CheckboxGroup>
      <Table aria-label="Files" style={{width: '100%'}}>
        <TableHeader columns={visibleColumns}>
          {column => (
            <Column isRowHeader={column.isRowHeader}>
              {column.name}
            </Column>
          )}
        </TableHeader>
        {/*- begin highlight -*/}
        <TableBody items={rows} dependencies={[visibleColumns]}>
          {item => (
            /*- end highlight -*/
            <Row columns={visibleColumns}>
              {column => <Cell>{item[column.id]}</Cell>}
            </Row>
          )}
        </TableBody>
      </Table>
      <Button onPress={addRow}>Add row</Button>
    </div>
  );
}
```

<InlineAlert variant="notice">
  <Heading>Memoization</Heading>
  <Content>Dynamic collections are automatically memoized to improve performance. Use the `dependencies` prop to invalidate cached elements that depend
  on external state (e.g. `columns` in this example).</Content>
</InlineAlert>

### Asynchronous loading

Use [renderEmptyState](#empty-state) to display a spinner during initial load. To enable infinite scrolling, render a `<TableLoadMoreItem>` at the end of the list. Use whatever data fetching library you prefer – this example uses `useAsyncList` from `react-stately`.

```tsx
import {Collection, useAsyncList} from 'react-aria-components';
import {Table, TableHeader, Column, Row, TableBody, Cell, TableLoadMoreItem} from 'vanilla-starter/Table';
import {ProgressCircle} from 'vanilla-starter/ProgressCircle';

interface Character {
  name: string;
  height: number;
  mass: number;
  birth_year: number;
}

function AsyncSortTable() {
  let list = useAsyncList<Character>({
    async load({ signal, cursor }) {
      if (cursor) {
        cursor = cursor.replace(/^http:\/\//i, 'https://');
      }

      let res = await fetch(
        cursor || 'https://swapi.py4e.com/api/people/?search=',
        { signal }
      );
      let json = await res.json();

      return {
        items: json.results,
        cursor: json.next
      };
    }
  });

  return (
    <div
      style={{
        height: 150,
        overflow: 'auto',
        border: '0.5px solid var(--border-color)',
        borderRadius: 'var(--radius)'
      }}>
      <Table
        aria-label="Star Wars characters"
        style={{tableLayout: 'fixed', width: '100%', border: 0}}>
        <TableHeader
          style={{
            position: 'sticky',
            top: 0,
            background: 'var(--overlay-background)',
            zIndex: 1
          }}>
          <Column id="name" isRowHeader>Name</Column>
          <Column id="height">Height</Column>
          <Column id="mass">Mass</Column>
          <Column id="birth_year">Birth Year</Column>
        </TableHeader>
        <TableBody
          renderEmptyState={() => (
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <ProgressCircle isIndeterminate aria-label="Loading..." />
            </div>
          )}>
          <Collection items={list.items}>
            {(item) => (
              <Row id={item.name}>
                <Cell>{item.name}</Cell>
                <Cell>{item.height}</Cell>
                <Cell>{item.mass}</Cell>
                <Cell>{item.birth_year}</Cell>
              </Row>
            )}
          </Collection>
          {/*- begin highlight -*/}
          <TableLoadMoreItem
            onLoadMore={list.loadMore}
            isLoading={list.loadingState === 'loadingMore'} />
          {/*- end highlight -*/}
        </TableBody>
      </Table>
    </div>
  );
}
```

### Links

Use the `href` prop on a `<Row>` to create a link. See the [framework setup guide](frameworks.md) to learn how to integrate with your framework. Link interactions vary depending on the selection behavior. See the [selection guide](selection.md) for more details.

```tsx
import {Table, TableHeader, Column, Row, TableBody, Cell} from 'vanilla-starter/Table';

<Table>
  <TableHeader>
    <Column isRowHeader>Name</Column>
    <Column>URL</Column>
    <Column>Date added</Column>
  </TableHeader>
  <TableBody>
    {/*- begin highlight -*/}
    <Row id="row-1" href="https://adobe.com/" target="_blank">
      {/*- end highlight -*/}
      <Cell>Adobe</Cell>
      <Cell>https://adobe.com/</Cell>
      <Cell>January 28, 2023</Cell>
    </Row>
    <Row id="row-2" href="https://google.com/" target="_blank">
      <Cell>Google</Cell>
      <Cell>https://google.com/</Cell>
      <Cell>April 5, 2023</Cell>
    </Row>
    <Row id="row-3" href="https://nytimes.com/" target="_blank">
      <Cell>New York Times</Cell>
      <Cell>https://nytimes.com/</Cell>
      <Cell>July 12, 2023</Cell>
    </Row>
  </TableBody>
</Table>
```

### Empty state

```tsx
import {Table, TableHeader, Column, TableBody} from 'vanilla-starter/Table';

<Table aria-label="Search results">
  <TableHeader>
    <Column isRowHeader>Name</Column>
    <Column>Type</Column>
    <Column>Date Modified</Column>
  </TableHeader>
  {/*- begin highlight -*/}
  <TableBody renderEmptyState={() => 'No results found.'}>
  {/*- end highlight -*/}
    {[]}
  </TableBody>
</Table>
```

## Selection and actions

Use the `selectionMode` prop to enable single or multiple selection. The selected rows can be controlled via the `selectedKeys` prop, matching the `id` prop of the rows. The `onRowAction` event handles item actions. Rows can be disabled with the `isDisabled` prop. See the [selection guide](selection.md) for more details.

```tsx
import type {Selection} from 'react-aria-components';
import {Table, TableHeader, Column, Row, TableBody, Cell} from 'vanilla-starter/Table';
import {useState} from 'react';

function Example(props) {
  let [selected, setSelected] = useState<Selection>(new Set());

  return (
    <>
      <Table
        {...props}
        aria-label="Favorite pokemon"
        
        selectedKeys={selected}
        onSelectionChange={setSelected}
        onRowAction={key => alert(`Clicked ${key}`)}
      >
        <TableHeader>
          <Column isRowHeader>Name</Column>
          <Column>Type</Column>
          <Column>Level</Column>
        </TableHeader>
        <TableBody>
          <Row id="charizard">
            <Cell>Charizard</Cell>
            <Cell>Fire, Flying</Cell>
            <Cell>67</Cell>
          </Row>
          <Row id="blastoise">
            <Cell>Blastoise</Cell>
            <Cell>Water</Cell>
            <Cell>56</Cell>
          </Row>
          <Row id="venusaur" isDisabled>
            <Cell>Venusaur</Cell>
            <Cell>Grass, Poison</Cell>
            <Cell>83</Cell>
          </Row>
          <Row id="pikachu">
            <Cell>Pikachu</Cell>
            <Cell>Electric</Cell>
            <Cell>100</Cell>
          </Row>
        </TableBody>
      </Table>
      <p>Current selection: {selected === 'all' ? 'all' : [...selected].join(', ')}</p>
    </>
  );
}
```

## Sorting

Set the `allowsSorting` prop on a `<Column>` to make it sortable. When the column header is pressed, `onSortChange` is called with a `SortDescriptor` including the sorted column and direction (ascending or descending). Use this to sort the data accordingly, and pass the `sortDescriptor` prop to the `<Table>` to display the sorted column.

```tsx
import {type SortDescriptor} from 'react-aria-components';
import {Table, TableHeader, Column, TableBody, Row, Cell} from 'vanilla-starter/Table';
import {useState} from 'react';

const rows = [
  {id: 1, name: 'Charizard', type: 'Fire, Flying', level: 67},
  {id: 2, name: 'Blastoise', type: 'Water', level: 56},
  {id: 3, name: 'Venusaur', type: 'Grass, Poison', level: 83},
  {id: 4, name: 'Pikachu', type: 'Electric', level: 100}
];

function SortableTable() {
  let [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'name',
    direction: 'ascending'
  });

  let sortedRows = rows;
  if (sortDescriptor) {
    sortedRows = rows.toSorted((a, b) => {
      let first = a[sortDescriptor.column];
      let second = b[sortDescriptor.column];
      let cmp = first < second ? -1 : 1;
      if (sortDescriptor.direction === 'descending') {
        cmp = -cmp;
      }
      return cmp;
    });
  }

  return (
    <Table
      aria-label="Favorite pokemon"
      sortDescriptor={sortDescriptor}
      onSortChange={setSortDescriptor}
    >
      <TableHeader>
        <Column id="name" isRowHeader allowsSorting>Name</Column>
        <Column id="type" allowsSorting>Type</Column>
        <Column id="level" allowsSorting>Level</Column>
      </TableHeader>
      <TableBody items={sortedRows}>
        {item => (
          <Row>
            <Cell>{item.name}</Cell>
            <Cell>{item.type}</Cell>
            <Cell>{item.level}</Cell>
          </Row>
        )}
      </TableBody>
    </Table>
  );
}
```

## Column resizing

Wrap the `<Table>` with a `<ResizableTableContainer>`, and add a `<ColumnResizer>` to each column to make it resizable. Use the `defaultWidth`, `width`, `minWidth`, and `maxWidth` props on a `<Column>` to control resizing behavior. These accept pixels, percentages, or fractional values (the [fr](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout/Basic_Concepts_of_Grid_Layout#the_fr_unit) unit). The default column width is `1fr`.

```tsx
import {Table, TableHeader, Column, Row, TableBody, Cell} from 'vanilla-starter/Table';
import {ResizableTableContainer} from 'react-aria-components';

const rows = [
  {id: 1, name: '2022 Roadmap Proposal Revision 012822 Copy (2)', date: 'November 27, 2022 at 4:56PM', size: '214 KB'},
  {id: 2, name: 'Budget', date: 'January 27, 2021 at 1:56AM', size: '14 MB'},
  {id: 3, name: 'Welcome Email Template', date: 'July 24, 2022 at 2:48 PM', size: '20 KB'},
  {id: 4, name: 'Job Posting_8301', date: 'May 30, 2025', size: '139 KB'}
];

<ResizableTableContainer>
  <Table aria-label="Table with resizable columns">
    <TableHeader>
      {/*- begin highlight -*/}
      <Column id="file" isRowHeader allowsResizing maxWidth={500}>File Name</Column>
      <Column id="size" allowsResizing defaultWidth={80}>Size</Column>
      <Column id="date" minWidth={100}>Date Modified</Column>
      {/*- end highlight -*/}
    </TableHeader>
    <TableBody items={rows}>
      {item => (
        <Row>
          <Cell>{item.name}</Cell>
          <Cell>{item.size}</Cell>
          <Cell>{item.date}</Cell>
        </Row>
      )}
    </TableBody>
  </Table>
</ResizableTableContainer>
```

### Resize events

The ResizableTableContainer's `onResize` event is called when a column resizer is moved by the user. The `onResizeEnd` event is called when the user finishes resizing. These receive a `Map` containing the widths of all columns in the Table. This example persists the column widths in `localStorage`.

```tsx
import {Table, TableHeader, Column, Row, TableBody, Cell} from 'vanilla-starter/Table';
import {ResizableTableContainer} from 'react-aria-components';
import {useSyncExternalStore} from 'react';

const rows = [
  {id: 1, name: '2022 Roadmap Proposal Revision 012822 Copy (2)', date: 'November 27, 2022 at 4:56PM', size: '214 KB'},
  {id: 2, name: 'Budget', date: 'January 27, 2021 at 1:56AM', size: '14 MB'},
  {id: 3, name: 'Welcome Email Template', date: 'July 24, 2022 at 2:48 PM', size: '20 KB'},
  {id: 4, name: 'Job Posting_8301', date: 'May 30, 2025', size: '139 KB'}
];

const columns = [
  {id: 'file', name: 'File Name'},
  {id: 'size', name: 'Size'},
  {id: 'date', name: 'Date'}
];

const initialWidths = new Map<string, number | string>([
  ['file', '1fr'],
  ['size', 80],
  ['date', 100]
]);

export default function ResizableTable() {
  let columnWidths = useSyncExternalStore(subscribe, getColumnWidths, getInitialWidths);

  return (
    <ResizableTableContainer
      onResize={setColumnWidths}
    >
      <Table aria-label="Table with resizable columns">
        <TableHeader columns={columns} dependencies={[columnWidths]}>
          {column => (
            <Column
              isRowHeader={column.id === 'file'}
              allowsResizing
              width={columnWidths.get(column.id)}
            >
              {column.name}
            </Column>
          )}
        </TableHeader>
        <TableBody items={rows}>
          {item => (
            <Row>
              <Cell>{item.name}</Cell>
              <Cell>{item.size}</Cell>
              <Cell>{item.date}</Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </ResizableTableContainer>
  );
}

let parsedWidths;
function getColumnWidths() {
  // Parse column widths from localStorage.
  if (!parsedWidths) {
    let data = localStorage.getItem('table-widths');
    if (data) {
      parsedWidths = new Map(JSON.parse(data));
    }
  }
  return parsedWidths || initialWidths;
}

function setColumnWidths(widths) {
  // Store new widths in localStorage, and trigger subscriptions.
  localStorage.setItem('table-widths', JSON.stringify(Array.from(widths)));
  window.dispatchEvent(new Event('storage'));
}

function getInitialWidths() {
  return initialWidths;
}

function subscribe(fn) {
  let onStorage = () => {
    // Invalidate cache.
    parsedWidths = null;
    fn();
  };

  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}
```

## Drag and drop

Table supports drag and drop interactions when the `dragAndDropHooks` prop is provided using the `useDragAndDrop` hook. Users can drop data on the table as a whole, on individual rows, insert new rows between existing ones, or reorder rows. React Aria supports drag and drop via mouse, touch, keyboard, and screen reader interactions. See the [drag and drop guide](dnd.md?component=Table) to learn more.

```tsx
import {Table, TableHeader, TableBody, Column, Row, Cell} from 'vanilla-starter/Table';
import {useDragAndDrop, useListData} from 'react-aria-components';

function ReorderableTable() {
  let list = useListData({
    initialItems: [
      {id: 1, name: 'Games', date: '6/7/2020', type: 'File folder'},
      {id: 2, name: 'Program Files', date: '4/7/2021', type: 'File folder'},
      {id: 3, name: 'bootmgr', date: '11/20/2010', type: 'System file'},
      {id: 4, name: 'log.txt', date: '1/18/2016', type: 'Text Document'}
    ]
  });

  let {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys, items: typeof list.items) => items.map(item => ({
      'text/plain': item.name
    })),
    onReorder(e) {
      if (e.target.dropPosition === 'before') {
        list.moveBefore(e.target.key, e.keys);
      } else if (e.target.dropPosition === 'after') {
        list.moveAfter(e.target.key, e.keys);
      }
    }
  });

  return (
    <Table
      aria-label="Files"
      selectionMode="multiple"
      dragAndDropHooks={dragAndDropHooks}
    >
      <TableHeader>
        <Column isRowHeader>Name</Column>
        <Column>Type</Column>
        <Column>Date Modified</Column>
      </TableHeader>
      <TableBody items={list.items}>
        {item => (
          <Row>
            <Cell>{item.name}</Cell>
            <Cell>{item.type}</Cell>
            <Cell>{item.date}</Cell>
          </Row>
        )}
      </TableBody>
    </Table>
  );
}
```

## Examples

<ExampleList
  tag="table"
  pages={props.pages}
/>

## A

PI

```tsx
<ResizableTableContainer>
  <Table>
    <TableHeader>
      <Column />
      <Column><Checkbox slot="selection" /></Column>
      <Column><ColumnResizer /></Column>
      <Column />
    </TableHeader>
    <TableBody>
      <Row id="row-1">
        <Cell><Button slot="drag" /></Cell>
        <Cell>
          <Checkbox slot="selection" /> or <SelectionIndicator />
        </Cell>
        <Cell />
        <Cell />
      </Row>
      <TableLoadMoreItem />
    </TableBody>
  </Table>
</ResizableTableContainer>
```

### Table

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `children` | `React.ReactNode` | — | The elements that make up the table. Includes the TableHeader, TableBody, Columns, and Rows. |
| `className` | `ClassNameOrFunction<TableRenderProps> | undefined` | 'react-aria-Table' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `defaultSelectedKeys` | `Iterable<Key> | "all" | undefined` | — | The initial selected keys in the collection (uncontrolled). |
| `dir` | `string | undefined` | — |  |
| `disabledBehavior` | `DisabledBehavior | undefined` | "all" | Whether `disabledKeys` applies to all interactions, or only selection. |
| `disabledKeys` | `Iterable<Key> | undefined` | — | A list of row keys to disable. |
| `disallowEmptySelection` | `boolean | undefined` | — | Whether the collection allows empty selection. |
| `dragAndDropHooks` | `DragAndDropHooks | undefined` | — | The drag and drop hooks returned by `useDragAndDrop` used to enable drag and drop behavior for the Table. |
| `escapeKeyBehavior` | `"none" | "clearSelection" | undefined` | 'clearSelection' | Whether pressing the escape key should clear selection in the table or not. Most experiences should not modify this option as it eliminates a keyboard user's ability to easily clear selection. Only use if the escape key is being handled externally or should not trigger selection clearing contextually. |
| `hidden` | `boolean | undefined` | — |  |
| `inert` | `boolean | undefined` | — |  |
| `lang` | `string | undefined` | — |  |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLTableElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLTableElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLTableElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLTableElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLTableElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLTableElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLTableElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLTableElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<HTMLTableElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLTableElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLTableElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLTableElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLTableElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLTableElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLTableElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLTableElement> | undefined` | — |  |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLTableElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLTableElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLTableElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLTableElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLTableElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLTableElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLTableElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLTableElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLTableElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLTableElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLTableElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLTableElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLTableElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLTableElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLTableElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLTableElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLTableElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLTableElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLTableElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLTableElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLTableElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLTableElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLTableElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLTableElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLTableElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLTableElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLTableElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLTableElement> | undefined` | — |  |
| `onRowAction` | `((key: Key) => void) | undefined` | — | Handler that is called when a user performs an action on the row. |
| `onScroll` | `React.UIEventHandler<HTMLTableElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLTableElement> | undefined` | — |  |
| `onSelectionChange` | `((keys: Selection) => void) | undefined` | — | Handler that is called when the selection changes. |
| `onSortChange` | `((descriptor: SortDescriptor) => any) | undefined` | — | Handler that is called when the sorted column or direction changes. |
| `onTouchCancel` | `React.TouchEventHandler<HTMLTableElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLTableElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLTableElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLTableElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLTableElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLTableElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLTableElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLTableElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLTableElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLTableElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLTableElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLTableElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLTableElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLTableElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLTableElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLTableElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLTableElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLTableElement> | undefined` | — |  |
| `selectedKeys` | `Iterable<Key> | "all" | undefined` | — | The currently selected keys in the collection (controlled). |
| `selectionBehavior` | `SelectionBehavior | undefined` | "toggle" | How multiple selection should behave in the collection. |
| `selectionMode` | `SelectionMode | undefined` | — | The type of selection that is allowed in the collection. |
| `shouldSelectOnPressUp` | `boolean | undefined` | — | Whether selection should occur on press up instead of press down. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `sortDescriptor` | `SortDescriptor | undefined` | — | The current sorted column and direction. |
| `style` | `(React.CSSProperties | ((values: TableRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |

### Table

Header

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode | ((item: T) => ReactElement)` | — | A list of `Column(s)` or a function. If the latter, a list of columns must be provided using the `columns` prop. |
| `className` | `ClassNameOrFunction<TableHeaderRenderProps> | undefined` | 'react-aria-TableHeader' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `columns` | `Iterable<T> | undefined` | — | A list of table columns. |
| `dependencies` | `readonly any[] | undefined` | — | Values that should invalidate the column cache when using dynamic collections. |
| `dir` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `inert` | `boolean | undefined` | — |  |
| `lang` | `string | undefined` | — |  |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onHoverChange` | `((isHovering: boolean) => void) | undefined` | — | Handler that is called when the hover state changes. |
| `onHoverEnd` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction ends. |
| `onHoverStart` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction starts. |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onScroll` | `React.UIEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `style` | `(React.CSSProperties | ((values: TableHeaderRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |

### Column

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `allowsSorting` | `boolean | undefined` | — | Whether the column allows sorting. |
| `children` | `ChildrenOrFunction<ColumnRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<ColumnRenderProps> | undefined` | 'react-aria-Column' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `defaultWidth` | `ColumnSize | null | undefined` | — | The default width of the column. This prop only applies when the `<Table>` is wrapped in a `<ResizableTableContainer>`. |
| `dir` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `id` | `Key | undefined` | — | The unique id of the column. |
| `inert` | `boolean | undefined` | — |  |
| `isRowHeader` | `boolean | undefined` | — | Whether a column is a [row header](https://www.w3.org/TR/wai-aria-1.1/#rowheader) and should be announced by assistive technology during row navigation. |
| `lang` | `string | undefined` | — |  |
| `maxWidth` | `ColumnStaticSize | null | undefined` | — | The maximum width of the column. This prop only applies when the `<Table>` is wrapped in a `<ResizableTableContainer>`. |
| `minWidth` | `ColumnStaticSize | null | undefined` | — | The minimum width of the column. This prop only applies when the `<Table>` is wrapped in a `<ResizableTableContainer>`. |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onScroll` | `React.UIEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `style` | `(React.CSSProperties | ((values: ColumnRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `textValue` | `string | undefined` | — | A string representation of the column's contents, used for accessibility announcements. |
| `translate` | `"yes" | "no" | undefined` | — |  |
| `width` | `ColumnSize | null | undefined` | — | The width of the column. This prop only applies when the `<Table>` is wrapped in a `<ResizableTableContainer>`. |

### Table

Body

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode | ((item: T) => ReactNode)` | — | The contents of the collection. |
| `className` | `ClassNameOrFunction<TableBodyRenderProps> | undefined` | 'react-aria-TableBody' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `dependencies` | `readonly any[] | undefined` | — | Values that should invalidate the item cache when using dynamic collections. |
| `dir` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `inert` | `boolean | undefined` | — |  |
| `items` | `Iterable<T> | undefined` | — | Item objects in the collection. |
| `lang` | `string | undefined` | — |  |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onScroll` | `React.UIEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `renderEmptyState` | `((props: TableBodyRenderProps) => ReactNode) | undefined` | — | Provides content to display when there are no rows in the table. |
| `style` | `(React.CSSProperties | ((values: TableBodyRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |

### Row

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode | ((item: T) => ReactElement)` | — | The cells within the row. Supports static items or a function for dynamic rendering. |
| `className` | `ClassNameOrFunction<RowRenderProps> | undefined` | 'react-aria-Row' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `columns` | `Iterable<T> | undefined` | — | A list of columns used when dynamically rendering cells. |
| `dependencies` | `readonly any[] | undefined` | — | Values that should invalidate the cell cache when using dynamic collections. |
| `dir` | `string | undefined` | — |  |
| `download` | `string | boolean | undefined` | — | Causes the browser to download the linked URL. A string may be provided to suggest a file name. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#download). |
| `hidden` | `boolean | undefined` | — |  |
| `href` | `string | undefined` | — | A URL to link to. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#href). |
| `hrefLang` | `string | undefined` | — | Hints at the human language of the linked URL. See[MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#hreflang). |
| `id` | `Key | undefined` | — | The unique id of the row. |
| `inert` | `boolean | undefined` | — |  |
| `isDisabled` | `boolean | undefined` | — | Whether the row is disabled. |
| `lang` | `string | undefined` | — |  |
| `onAction` | `(() => void) | undefined` | — | Handler that is called when a user performs an action on the row. The exact user event depends on the collection's `selectionBehavior` prop and the interaction modality. |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onClick` | `((e: React.MouseEvent<FocusableElement>) => void) | undefined` | — | **Not recommended – use `onPress` instead.** `onClick` is an alias for `onPress` provided for compatibility with other libraries. `onPress` provides  additional event details for non-mouse interactions. |
| `onClickCapture` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onHoverChange` | `((isHovering: boolean) => void) | undefined` | — | Handler that is called when the hover state changes. |
| `onHoverEnd` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction ends. |
| `onHoverStart` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction starts. |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPress` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when the press is released over the target. |
| `onPressChange` | `((isPressed: boolean) => void) | undefined` | — | Handler that is called when the press state changes. |
| `onPressEnd` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press interaction ends, either over the target or when the pointer leaves the target. |
| `onPressStart` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press interaction starts. |
| `onPressUp` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press is released over the target, regardless of whether it started on the target or not. |
| `onScroll` | `React.UIEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `ping` | `string | undefined` | — | A space-separated list of URLs to ping when the link is followed. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#ping). |
| `referrerPolicy` | `React.HTMLAttributeReferrerPolicy | undefined` | — | How much of the referrer to send when following the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#referrerpolicy). |
| `rel` | `string | undefined` | — | The relationship between the linked resource and the current page. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel). |
| `routerOptions` | `undefined` | — | Options for the configured client side router. |
| `style` | `(React.CSSProperties | ((values: RowRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `target` | `React.HTMLAttributeAnchorTarget | undefined` | — | The target window for the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#target). |
| `textValue` | `string | undefined` | — | A string representation of the row's contents, used for features like typeahead. |
| `translate` | `"yes" | "no" | undefined` | — |  |
| `value` | `T | undefined` | — | The object value that this row represents. When using dynamic collections, this is set automatically. |

### Cell

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ChildrenOrFunction<CellRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<CellRenderProps> | undefined` | 'react-aria-Cell' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `colSpan` | `number | undefined` | — | Indicates how many columns the data cell spans. |
| `dir` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `id` | `Key | undefined` | — | The unique id of the cell. |
| `inert` | `boolean | undefined` | — |  |
| `lang` | `string | undefined` | — |  |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onScroll` | `React.UIEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `style` | `(React.CSSProperties | ((values: CellRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `textValue` | `string | undefined` | — | A string representation of the cell's contents, used for features like typeahead. |
| `translate` | `"yes" | "no" | undefined` | — |  |

### Resizable

TableContainer

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | — | The children of the component. |
| `className` | `string | undefined` | 'react-aria-ResizableTableContainer' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. |
| `dir` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `inert` | `boolean | undefined` | — |  |
| `lang` | `string | undefined` | — |  |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onResize` | `((widths: Map<Key, ColumnSize>) => void) | undefined` | — | Handler that is called when a user performs a column resize. Can be used with the width property on columns to put the column widths into a controlled state. |
| `onResizeEnd` | `((widths: Map<Key, ColumnSize>) => void) | undefined` | — | Handler that is called after a user performs a column resize. Can be used to store the widths of columns for another future session. |
| `onResizeStart` | `((widths: Map<Key, ColumnSize>) => void) | undefined` | — | Handler that is called when a user starts a column resize. |
| `onScroll` | `React.UIEventHandler<HTMLDivElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLDivElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLDivElement> | undefined` | — |  |
| `style` | `React.CSSProperties | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. |
| `translate` | `"yes" | "no" | undefined` | — |  |

### Column

Resizer

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-label` | `string | undefined` | — | A custom accessibility label for the resizer. |
| `children` | `ChildrenOrFunction<ColumnResizerRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<ColumnResizerRenderProps> | undefined` | 'react-aria-ColumnResizer' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `dir` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `inert` | `boolean | undefined` | — |  |
| `lang` | `string | undefined` | — |  |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onHoverChange` | `((isHovering: boolean) => void) | undefined` | — | Handler that is called when the hover state changes. |
| `onHoverEnd` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction ends. |
| `onHoverStart` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction starts. |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onScroll` | `React.UIEventHandler<HTMLDivElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLDivElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLDivElement> | undefined` | — |  |
| `style` | `(React.CSSProperties | ((values: ColumnResizerRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |

### Table

LoadMoreItem

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | — | The load more spinner to render when loading additional items. |
| `className` | `string | undefined` | 'react-aria-TableLoadMoreItem' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. |
| `dir` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `inert` | `boolean | undefined` | — |  |
| `isLoading` | `boolean | undefined` | — | Whether or not the loading spinner should be rendered or not. |
| `lang` | `string | undefined` | — |  |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onLoadMore` | `(() => any) | undefined` | — | Handler that is called when more items should be loaded, e.g. while scrolling near the bottom. |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onScroll` | `React.UIEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLTableRowElement> | undefined` | — |  |
| `scrollOffset` | `number | undefined` | 1 | The amount of offset from the bottom of your scrollable region that should trigger load more. Uses a percentage value relative to the scroll body's client height. Load more is then triggered when your current scroll position's distance from the bottom of the currently loaded list of items is less than or equal to the provided value. (e.g. 1 = 100% of the scroll region's height). |
| `style` | `React.CSSProperties | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. |
| `translate` | `"yes" | "no" | undefined` | — |  |

## Related 

Types

### Sort

Descriptor

| Name | Type | Description |
|------|------|-------------|
| `column` \* | `Key` | The key of the column to sort by. |
| `direction` \* | `SortDirection` | The direction to sort by. |

### use

DragAndDrop

`useDragAndDrop(options: DragAndDropOptions<T>): DragAndDrop<T>`

Provides the hooks required to enable drag and drop behavior for a drag and drop compatible collection component.

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `getItems` | `((keys: Set<Key>, items: T[]) => DragItem[]) | undefined` | () => \[] | A function that returns the items being dragged. If not specified, we assume that the collection is not draggable. |
| `renderDragPreview` | `((items: DragItem[]) => JSX.Element | { element: JSX.Element; x: number; y: number; }) | undefined` | — | A function that renders a drag preview, which is shown under the user's cursor while dragging. By default, a copy of the dragged element is rendered. |
| `renderDropIndicator` | `((target: DropTarget) => JSX.Element) | undefined` | — | A function that renders a drop indicator element between two items in a collection. This should render a `<DropIndicator>` element. If this function is not provided, a default DropIndicator is provided. |
| `dropTargetDelegate` | `DropTargetDelegate | undefined` | — | A custom delegate object that provides drop targets for pointer coordinates within the collection. |
| `isDisabled` | `boolean | undefined` | — | Whether the drag and drop events should be disabled. |
| `onDragStart` | `((e: DraggableCollectionStartEvent) => void) | undefined` | — | Handler that is called when a drag operation is started. |
| `onDragMove` | `((e: DraggableCollectionMoveEvent) => void) | undefined` | — | Handler that is called when the drag is moved. |
| `onDragEnd` | `((e: DraggableCollectionEndEvent) => void) | undefined` | — | Handler that is called when the drag operation is ended, either as a result of a drop or a cancellation. |
| `getAllowedDropOperations` | `(() => DropOperation[]) | undefined` | — | Function that returns the drop operations that are allowed for the dragged items. If not provided, all drop operations are allowed. |
| `acceptedDragTypes` | `"all" | (string | symbol)[] | undefined` | 'all' | The drag types that the droppable collection accepts. If the collection accepts directories, include `DIRECTORY_DRAG_TYPE` in your array of allowed types. |
| `onInsert` | `((e: DroppableCollectionInsertDropEvent) => void) | undefined` | — | Handler that is called when external items are dropped "between" items. |
| `onRootDrop` | `((e: DroppableCollectionRootDropEvent) => void) | undefined` | — | Handler that is called when external items are dropped on the droppable collection's root. |
| `onItemDrop` | `((e: DroppableCollectionOnItemDropEvent) => void) | undefined` | — | Handler that is called when items are dropped "on" an item. |
| `onReorder` | `((e: DroppableCollectionReorderEvent) => void) | undefined` | — | Handler that is called when items are reordered within the collection. This handler only allows dropping between items, not on items. It does not allow moving items to a different parent item within a tree. |
| `onMove` | `((e: DroppableCollectionReorderEvent) => void) | undefined` | — | Handler that is called when items are moved within the source collection. This handler allows dropping both on or between items, and items may be moved to a different parent item within a tree. |
| `shouldAcceptItemDrop` | `((target: ItemDropTarget, types: DragTypes) => boolean) | undefined` | — | A function returning whether a given target in the droppable collection is a valid "on" drop target for the current drag types. |
| `onDropEnter` | `((e: DroppableCollectionEnterEvent) => void) | undefined` | — | Handler that is called when a valid drag enters a drop target. |
| `onDropActivate` | `((e: DroppableCollectionActivateEvent) => void) | undefined` | — | Handler that is called after a valid drag is held over a drop target for a period of time. |
| `onDropExit` | `((e: DroppableCollectionExitEvent) => void) | undefined` | — | Handler that is called when a valid drag exits a drop target. |
| `onDrop` | `((e: DroppableCollectionDropEvent) => void) | undefined` | — | Handler that is called when a valid drag is dropped on a drop target. When defined, this overrides other drop handlers such as `onInsert`, and `onItemDrop`. |
| `getDropOperation` | `((target: DropTarget, types: DragTypes, allowedOperations: DropOperation[]) => DropOperation) | undefined` | — | A function returning the drop operation to be performed when items matching the given types are dropped on the drop target. |
