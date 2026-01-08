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
