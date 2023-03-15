/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, fireEvent, render, within} from '@react-spectrum/test-utils';
import {Cell, Checkbox, Collection, Column, Row, Table, TableBody, TableHeader, useTableOptions} from '../';
import React from 'react';
import userEvent from '@testing-library/user-event';

function MyColumn(props) {
  return (
    <Column {...props}>
      {({allowsSorting, sortDirection}) => (<>
        {props.children}
        {allowsSorting && (
          <span aria-hidden="true" className="sort-indicator">
            {sortDirection === 'ascending' ? '▲' : '▼'}
          </span>
        )}
      </>)}
    </Column>
  );
}

function MyTableHeader({columns, children, ...otherProps}) {
  let {selectionBehavior, selectionMode} = useTableOptions();

  return (
    <TableHeader {...otherProps}>
      {selectionBehavior === 'toggle' && (
        <Column>{selectionMode === 'multiple' && <MyCheckbox />}</Column>
      )}
      <Collection items={columns}>
        {children}
      </Collection>
    </TableHeader>
  );
}

function MyRow({id, columns, children, ...otherProps}) {
  let {selectionBehavior} = useTableOptions();

  return (
    <Row id={id} {...otherProps}>
      {selectionBehavior === 'toggle' && (
        <Cell>
          <MyCheckbox />
        </Cell>
      )}
      <Collection items={columns}>
        {children}
      </Collection>
    </Row>
  );
}

function MyCheckbox() {
  return (
    <Checkbox slot="selection">
      {({isIndeterminate}) => (
        <div className="checkbox">
          <svg viewBox="0 0 18 18">
            {isIndeterminate
              ? <rect x={1} y={7.5} width={15} height={3} />
              : <polyline points="1 9 7 14 15 4" />}
          </svg>
        </div>
      )}
    </Checkbox>
  );
}

let TestTable = ({tableProps, tableHeaderProps, columnProps, tableBodyProps, rowProps, cellProps}) => (
  <Table aria-label="Files" {...tableProps}>
    <MyTableHeader {...tableHeaderProps}>
      <MyColumn id="name" isRowHeader {...columnProps}>Name</MyColumn>
      <MyColumn {...columnProps}>Type</MyColumn>
      <MyColumn {...columnProps}>Date Modified</MyColumn>
    </MyTableHeader>
    <TableBody {...tableBodyProps}>
      <MyRow id="1" {...rowProps}>
        <Cell {...cellProps}>Games</Cell>
        <Cell {...cellProps}>File folder</Cell>
        <Cell {...cellProps}>6/7/2020</Cell>
      </MyRow>
      <MyRow id="2" {...rowProps}>
        <Cell {...cellProps}>Program Files</Cell>
        <Cell {...cellProps}>File folder</Cell>
        <Cell {...cellProps}>4/7/2021</Cell>
      </MyRow>
      <MyRow id="3" {...rowProps}>
        <Cell {...cellProps}>bootmgr</Cell>
        <Cell {...cellProps}>System file</Cell>
        <Cell {...cellProps}>11/20/2010</Cell>
      </MyRow>
    </TableBody>
  </Table>
);

let columns = [
  {name: 'Name', key: 'name', isRowHeader: true},
  {name: 'Type', key: 'type'},
  {name: 'Date Modified', key: 'date'}
];

let rows = [
  {id: 1, name: 'Games', date: '6/7/2020', type: 'File folder'},
  {id: 2, name: 'Program Files', date: '4/7/2021', type: 'File folder'},
  {id: 3, name: 'bootmgr', date: '11/20/2010', type: 'System file'},
  {id: 4, name: 'log.txt', date: '1/18/2016', type: 'Text Document'}
];

let DynamicTable = ({tableProps, tableHeaderProps, tableBodyProps, rowProps}) => (
  <Table aria-label="Files" {...tableProps}>
    <MyTableHeader columns={columns} {...tableHeaderProps}>
      {column => (
        <MyColumn isRowHeader={column.isRowHeader} childColumns={column.children}>
          {column.name}
        </MyColumn>
      )}
    </MyTableHeader>
    <TableBody items={rows} {...tableBodyProps}>
      {item => (
        <MyRow columns={columns} {...rowProps}>
          {column => <Cell>{item[column.key]}</Cell>}
        </MyRow>
      )}
    </TableBody>
  </Table>
);

let renderTable = (props) => render(<TestTable {...props} />);

describe('Table', () => {
  it('should render with default classes', () => {
    let {getByRole, getAllByRole} = renderTable();
    let table = getByRole('grid');
    expect(table).toHaveAttribute('class', 'react-aria-Table');

    for (let row of getAllByRole('row').slice(1)) {
      expect(row).toHaveAttribute('class', 'react-aria-Row');
    }

    let rowGroups = getAllByRole('rowgroup');
    expect(rowGroups).toHaveLength(2);
    expect(rowGroups[0]).toHaveAttribute('class', 'react-aria-TableHeader');
    expect(rowGroups[1]).toHaveAttribute('class', 'react-aria-TableBody');

    for (let cell of getAllByRole('columnheader')) {
      expect(cell).toHaveAttribute('class', 'react-aria-Column');
    }

    for (let cell of getAllByRole('rowheader')) {
      expect(cell).toHaveAttribute('class', 'react-aria-Cell');
    }

    for (let cell of getAllByRole('gridcell')) {
      expect(cell).toHaveAttribute('class', 'react-aria-Cell');
    }
  });

  it('should render with custom classes', () => {
    let {getByRole, getAllByRole} = renderTable({
      tableProps: {className: 'table'},
      tableHeaderProps: {className: 'table-header'},
      columnProps: {className: 'column'},
      tableBodyProps: {className: 'table-body'},
      rowProps: {className: 'row'},
      cellProps: {className: 'cell'}
    });
    let table = getByRole('grid');
    expect(table).toHaveAttribute('class', 'table');

    for (let row of getAllByRole('row').slice(1)) {
      expect(row).toHaveAttribute('class', 'row');
    }

    let rowGroups = getAllByRole('rowgroup');
    expect(rowGroups).toHaveLength(2);
    expect(rowGroups[0]).toHaveAttribute('class', 'table-header');
    expect(rowGroups[1]).toHaveAttribute('class', 'table-body');

    for (let cell of getAllByRole('columnheader')) {
      expect(cell).toHaveAttribute('class', 'column');
    }

    for (let cell of getAllByRole('rowheader')) {
      expect(cell).toHaveAttribute('class', 'cell');
    }

    for (let cell of getAllByRole('gridcell')) {
      expect(cell).toHaveAttribute('class', 'cell');
    }
  });

  it('should support DOM props', () => {
    let {getByRole, getAllByRole} = renderTable({
      tableProps: {'data-testid': 'table'},
      tableHeaderProps: {'data-testid': 'table-header'},
      columnProps: {'data-testid': 'column'},
      tableBodyProps: {'data-testid': 'table-body'},
      rowProps: {'data-testid': 'row'},
      cellProps: {'data-testid': 'cell'}
    });
    let table = getByRole('grid');
    expect(table).toHaveAttribute('data-testid', 'table');

    for (let row of getAllByRole('row').slice(1)) {
      expect(row).toHaveAttribute('data-testid', 'row');
    }

    let rowGroups = getAllByRole('rowgroup');
    expect(rowGroups).toHaveLength(2);
    expect(rowGroups[0]).toHaveAttribute('data-testid', 'table-header');
    expect(rowGroups[1]).toHaveAttribute('data-testid', 'table-body');

    for (let cell of getAllByRole('columnheader')) {
      expect(cell).toHaveAttribute('data-testid', 'column');
    }

    for (let cell of getAllByRole('rowheader')) {
      expect(cell).toHaveAttribute('data-testid', 'cell');
    }

    for (let cell of getAllByRole('gridcell')) {
      expect(cell).toHaveAttribute('data-testid', 'cell');
    }
  });

  it('should render checkboxes for selection', () => {
    let {getAllByRole} = renderTable({
      tableProps: {selectionMode: 'multiple'}
    });

    for (let row of getAllByRole('row')) {
      let checkbox = within(row).getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    }

    let checkbox = getAllByRole('checkbox')[0];
    expect(checkbox).toHaveAttribute('aria-label', 'Select All');

    userEvent.click(checkbox);

    for (let row of getAllByRole('row')) {
      let checkbox = within(row).getByRole('checkbox');
      expect(checkbox).toBeChecked();
    }
  });

  it('should not render checkboxes for selection with selectionBehavior=replace', () => {
    let {getAllByRole} = renderTable({
      tableProps: {
        selectionMode: 'multiple',
        selectionBehavior: 'replace'
      }
    });

    for (let row of getAllByRole('row')) {
      let checkbox = within(row).queryByRole('checkbox');
      expect(checkbox).toBeNull();
    }

    let row = getAllByRole('row')[1];
    expect(row).toHaveAttribute('aria-selected', 'false');
    userEvent.click(row);
    expect(row).toHaveAttribute('aria-selected', 'true');
  });

  it('should support dynamic collections', () => {
    let {getAllByRole} = render(<DynamicTable />);
    expect(getAllByRole('row')).toHaveLength(5);
  });

  it('should support hover', () => {
    let {getAllByRole} = renderTable({
      tableProps: {selectionMode: 'multiple'},
      rowProps: {className: ({isHovered}) => isHovered ? 'hover' : ''}
    });
    let row = getAllByRole('row')[1];

    expect(row).not.toHaveAttribute('data-hovered');
    expect(row).not.toHaveClass('hover');

    userEvent.hover(row);
    expect(row).toHaveAttribute('data-hovered', 'true');
    expect(row).toHaveClass('hover');

    userEvent.unhover(row);
    expect(row).not.toHaveAttribute('data-hovered');
    expect(row).not.toHaveClass('hover');
  });

  it('should not show hover state when item is not interactive', () => {
    let {getAllByRole} = renderTable({
      rowProps: {className: ({isHovered}) => isHovered ? 'hover' : ''}
    });
    let row = getAllByRole('row')[1];

    expect(row).not.toHaveAttribute('data-hovered');
    expect(row).not.toHaveClass('hover');

    userEvent.hover(row);
    expect(row).not.toHaveAttribute('data-hovered');
    expect(row).not.toHaveClass('hover');
  });

  it('should support focus ring', async () => {
    let {getAllByRole} = renderTable({
      rowProps: {className: ({isFocusVisible}) => isFocusVisible ? 'focus' : ''},
      cellProps: {className: ({isFocusVisible}) => isFocusVisible ? 'focus' : ''},
      columnProps: {className: ({isFocusVisible}) => isFocusVisible ? 'focus' : ''}
    });

    let row = getAllByRole('row')[1];
    let cell = within(row).getAllByRole('rowheader')[0];

    expect(row).not.toHaveAttribute('data-focus-visible');
    expect(row).not.toHaveClass('focus');

    act(() => userEvent.tab());
    expect(document.activeElement).toBe(row);
    expect(row).toHaveAttribute('data-focus-visible', 'true');
    expect(row).toHaveClass('focus');

    fireEvent.keyDown(row, {key: 'ArrowRight'});
    fireEvent.keyUp(row, {key: 'ArrowRight'});

    expect(document.activeElement).toBe(cell);
    expect(row).not.toHaveAttribute('data-focus-visible');
    expect(row).not.toHaveClass('focus');
    expect(cell).toHaveAttribute('data-focus-visible', 'true');
    expect(cell).toHaveClass('focus');

    fireEvent.keyDown(row, {key: 'ArrowUp'});
    fireEvent.keyUp(row, {key: 'ArrowUp'});

    let column = getAllByRole('columnheader')[0];
    expect(document.activeElement).toBe(column);
    expect(column).toHaveAttribute('data-focus-visible', 'true');
    expect(column).toHaveClass('focus');
  });

  it('should support press state', () => {
    let {getAllByRole} = renderTable({
      tableProps: {selectionMode: 'multiple'},
      rowProps: {className: ({isPressed}) => isPressed ? 'pressed' : ''}
    });

    let row = getAllByRole('row')[1];

    expect(row).not.toHaveAttribute('data-pressed');
    expect(row).not.toHaveClass('pressed');

    fireEvent.mouseDown(row);
    expect(row).toHaveAttribute('data-pressed', 'true');
    expect(row).toHaveClass('pressed');

    fireEvent.mouseUp(row);
    expect(row).not.toHaveAttribute('data-pressed');
    expect(row).not.toHaveClass('pressed');
  });

  it('should not show press state when not interactive', () => {
    let {getAllByRole} = renderTable({
      rowProps: {className: ({isPressed}) => isPressed ? 'pressed' : ''}
    });
    let row = getAllByRole('row')[0];

    expect(row).not.toHaveAttribute('data-pressed');
    expect(row).not.toHaveClass('pressed');

    fireEvent.mouseDown(row);
    expect(row).not.toHaveAttribute('data-pressed');
    expect(row).not.toHaveClass('pressed');

    fireEvent.mouseUp(row);
    expect(row).not.toHaveAttribute('data-pressed');
    expect(row).not.toHaveClass('pressed');
  });

  it('should support row actions', () => {
    let onRowAction = jest.fn();
    let {getAllByRole} = renderTable({
      tableProps: {onRowAction},
      rowProps: {className: ({isPressed}) => isPressed ? 'pressed' : ''}
    });

    let row = getAllByRole('row')[1];

    expect(row).not.toHaveAttribute('data-pressed');
    expect(row).not.toHaveClass('pressed');

    fireEvent.mouseDown(row);
    expect(row).toHaveAttribute('data-pressed', 'true');
    expect(row).toHaveClass('pressed');

    fireEvent.mouseUp(row);
    expect(row).not.toHaveAttribute('data-pressed');
    expect(row).not.toHaveClass('pressed');

    expect(onRowAction).toHaveBeenCalledTimes(1);
  });

  it('should support disabled state', () => {
    let {getAllByRole} = renderTable({
      tableProps: {selectionMode: 'multiple', disabledKeys: ['2'], disabledBehavior: 'all'},
      rowProps: {className: ({isDisabled}) => isDisabled ? 'disabled' : ''}
    });
    let rows = getAllByRole('row');
    let row = rows[2];

    expect(row).toHaveAttribute('aria-disabled', 'true');
    expect(row).toHaveClass('disabled');
    expect(within(row).getByRole('checkbox')).toBeDisabled();

    userEvent.tab();
    expect(document.activeElement).toBe(rows[1]);
    fireEvent.keyDown(document.activeElement, {key: 'ArrowDown'});
    fireEvent.keyUp(document.activeElement, {key: 'ArrowDown'});
    expect(document.activeElement).toBe(rows[3]);
  });

  it('should support sorting', () => {
    let {getAllByRole} = renderTable({
      tableProps: {sortDescriptor: {column: 'name', direction: 'ascending'}, onSortChange: jest.fn()},
      columnProps: {allowsSorting: true}
    });

    let columns = getAllByRole('columnheader');
    expect(columns[0]).toHaveAttribute('aria-sort', 'ascending');
    expect(columns[0]).toHaveTextContent('▲');
    expect(columns[1]).toHaveAttribute('aria-sort', 'none');
    expect(columns[1]).not.toHaveTextContent('▲');
    expect(columns[2]).toHaveAttribute('aria-sort', 'none');
    expect(columns[2]).not.toHaveTextContent('▲');
  });

  it('should support nested column headers', () => {
    let columns = [
      {name: 'Name', key: 'name', children: [
        {name: 'First Name', key: 'first', isRowHeader: true},
        {name: 'Last Name', key: 'last', isRowHeader: true}
      ]},
      {name: 'Information', key: 'info', children: [
        {name: 'Age', key: 'age'},
        {name: 'Birthday', key: 'birthday'}
      ]}
    ];

    let leafColumns = [{key: 'first'}, {key: 'last'}, {key: 'age'}, {key: 'birthday'}];

    let items = [
      {id: 1, first: 'Sam', last: 'Smith', age: 36, birthday: 'May 3'},
      {id: 2, first: 'Julia', last: 'Jones', age: 24, birthday: 'February 10'},
      {id: 3, first: 'Peter', last: 'Parker', age: 28, birthday: 'September 7'},
      {id: 4, first: 'Bruce', last: 'Wayne', age: 32, birthday: 'December 18'}
    ];

    let {getAllByRole} = render(
      <DynamicTable
        tableHeaderProps={{columns}}
        tableBodyProps={{items}}
        rowProps={{columns: leafColumns}} />
    );

    let header = getAllByRole('rowgroup')[0];
    let rows = within(header).getAllByRole('row');
    expect(rows).toHaveLength(2);

    let cells = within(rows[0]).getAllByRole('columnheader');
    expect(cells).toHaveLength(2);
    expect(cells[0]).toHaveAttribute('aria-colspan', '2');
    expect(cells[1]).toHaveAttribute('aria-colspan', '2');

    userEvent.tab();
    fireEvent.keyDown(document.activeElement, {key: 'ArrowUp'});
    fireEvent.keyUp(document.activeElement, {key: 'ArrowUp'});

    cells = within(rows[1]).getAllByRole('columnheader');
    expect(document.activeElement).toBe(cells[0]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
    fireEvent.keyUp(document.activeElement, {key: 'ArrowRight'});
    expect(document.activeElement).toBe(cells[1]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
    fireEvent.keyUp(document.activeElement, {key: 'ArrowRight'});
    expect(document.activeElement).toBe(cells[2]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
    fireEvent.keyUp(document.activeElement, {key: 'ArrowRight'});
    expect(document.activeElement).toBe(cells[3]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowUp'});
    fireEvent.keyUp(document.activeElement, {key: 'ArrowUp'});
    cells = within(rows[0]).getAllByRole('columnheader');
    expect(document.activeElement).toBe(cells[1]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft'});
    fireEvent.keyUp(document.activeElement, {key: 'ArrowLeft'});
    expect(document.activeElement).toBe(cells[0]);
  });
});
