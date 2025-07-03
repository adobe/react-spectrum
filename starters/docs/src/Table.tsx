'use client';
import {
  Button,
  Cell,
  Collection,
  Column as AriaColumn,
  ColumnProps,
  Row as AriaRow,
  RowProps,
  Table as AriaTable,
  TableHeader as AriaTableHeader,
  TableHeaderProps,
  TableProps,
  useTableOptions
} from 'react-aria-components';
import {Checkbox} from './Checkbox';
import {ChevronUp, ChevronDown, GripVertical} from 'lucide-react';
import './Table.css';

export function Table(props: TableProps) {
  return <AriaTable {...props} />;
}

export function Column(
  props: Omit<ColumnProps, 'children'> & { children?: React.ReactNode }
) {
  return (
    (
      <AriaColumn {...props}>
        {({ allowsSorting, sortDirection }) => (
          <div className="column-header">
            {props.children}
            {allowsSorting && (
              <span aria-hidden="true" className="sort-indicator">
                {sortDirection === 'ascending' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </span>
            )}
          </div>
        )}
      </AriaColumn>
    )
  );
}

export function TableHeader<T extends object>(
  { columns, children }: TableHeaderProps<T>
) {
  let { selectionBehavior, selectionMode, allowsDragging } = useTableOptions();

  return (
    (
      <AriaTableHeader>
        {/* Add extra columns for drag and drop and selection. */}
        {allowsDragging && <AriaColumn />}
        {selectionBehavior === 'toggle' && (
          <AriaColumn>
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
            <Button slot="drag"><GripVertical size={16} /></Button>
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
