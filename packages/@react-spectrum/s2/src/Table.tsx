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


export function Table(props: TableProps) {
  return <AriaTable {...props} />;
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
  {id, columns, children, ...otherProps}: RowProps<T>
) {
  let {selectionBehavior, allowsDragging} = useTableOptions();

  return (
    <AriaRow id={id} {...otherProps}>
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
