import {
  Button,
  Cell as AriaCell,
  Collection,
  Column as AriaColumn,
  ColumnProps,
  Row as AriaRow,
  RowProps,
  Table as AriaTable,
  TableHeader as AriaTableHeader,
  TableHeaderProps,
  TableProps,
  ResizableTableContainer,
  useTableOptions,
  ColumnResizer,
  Group
} from 'react-aria-components';
import {Checkbox} from './Checkbox';
import {ArrowUp} from 'lucide-react';

export function Table(props: TableProps) {
  return (
    <ResizableTableContainer className="max-h-[280px] w-[550px] overflow-auto relative border rounded-lg">
      <AriaTable {...props} className="border-separate border-spacing-0" />
    </ResizableTableContainer>
  );
}

export function Column<T extends object>(props: ColumnProps<T>) {
  return (
    <AriaColumn {...props} className="[&:hover]:z-20 [&:focus-within]:z-20 text-start text-sm font-semibold text-gray-700 cursor-default outline-none focus-visible:outline-blue-600 -outline-offset-2">
      {({ allowsSorting, sortDirection }) => (
        <div className="flex items-center">
          <Group
            role="presentation"
            tabIndex={-1}
            className="px-2 h-5 flex-1 flex gap-1 items-center overflow-hidden outline-none rounded focus-visible:outline-blue-600"
          >
            <span className="truncate">{props.children}</span>
            {allowsSorting && (
              <span
                className={`w-4 h-4 flex items-center justify-center transition ${
                  sortDirection === 'descending' ? 'rotate-180' : ''
                }`}
              >
                {sortDirection && <ArrowUp className="w-4 h-4 text-gray-500" />}
              </span>
            )}
          </Group>
          {!props.width && <ColumnResizer className="w-px px-[8px] translate-x-[8px] box-content py-1 h-5 bg-clip-content bg-gray-400 cursor-col-resize rounded resizing:bg-blue-600 resizing:w-[2px] resizing:pl-[7px] focus-visible:outline outline-2 outline-blue-600 -outline-offset-2" />}
        </div>
      )}
    </AriaColumn>
  );
}

export function TableHeader<T extends object>(
  { columns, children }: TableHeaderProps<T>
) {
  let { selectionBehavior, selectionMode, allowsDragging } = useTableOptions();

  return (
    <AriaTableHeader className="sticky top-0 z-10 bg-gray-100/60 backdrop-blur-md supports-[-moz-appearance:none]:bg-gray-100 rounded-t-lg border-b">
      {/* Add extra columns for drag and drop and selection. */}
      {allowsDragging && <Column />}
      {selectionBehavior === 'toggle' && (
        <AriaColumn width={36} minWidth={36} className="text-start text-sm font-semibold cursor-default p-2 outline-none focus-visible:outline-blue-600 -outline-offset-2">
          {selectionMode === 'multiple' && <Checkbox slot="selection" />}
        </AriaColumn>
      )}
      <Collection items={columns}>
        {children}
      </Collection>
    </AriaTableHeader>
  );
}

export function Row<T extends object>(
  { id, columns, children, ...otherProps }: RowProps<T>
) {
  let { selectionBehavior, allowsDragging } = useTableOptions();

  return (
    <AriaRow id={id} {...otherProps} className="group/row relative cursor-default select-none text-gray-900 disabled:text-gray-300 text-sm hover:bg-gray-100 selected:bg-blue-100 selected:hover:bg-blue-200 outline-none focus-visible:outline-blue-600 -outline-offset-2">
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

export function Cell(props: CellProps) {
  return (
    <AriaCell {...props} className="border-b group-last/row:border-b-0 group-selected/row:border-blue-200 [:has(+[data-selected])_&]:border-blue-200 p-2 truncate outline-none focus-visible:outline-blue-600 -outline-offset-2" />
  )
}
