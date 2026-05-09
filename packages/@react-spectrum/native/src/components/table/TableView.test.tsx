import React from 'react';
import {act} from 'react-test-renderer';
import {renderWithProvider} from '../../test-utils/renderWithProvider';
import {TableView} from './TableView';

const COLUMNS = [
  {key: 'name', label: 'Name'},
  {key: 'role', label: 'Role'}
];

const ITEMS = [
  {id: 'u1', name: 'Alice', role: 'Admin'},
  {id: 'u2', name: 'Bob', role: 'Editor'},
  {id: 'u3', name: 'Carol', role: 'Viewer'}
];

describe('TableView', () => {
  it('renders column headers', () => {
    let {root} = renderWithProvider(
      <TableView columns={COLUMNS} items={ITEMS} testID="tv" />
    );
    let nameCol = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'tv-col-name'
    )[0];
    expect(nameCol).toBeDefined();
    let roleCol = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'tv-col-role'
    )[0];
    expect(roleCol).toBeDefined();
  });

  it('renders data rows', () => {
    let {root} = renderWithProvider(
      <TableView columns={COLUMNS} items={ITEMS} testID="tv" />
    );
    let row1 = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'tableview-row-u1'
    )[0];
    expect(row1).toBeDefined();
    let row2 = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'tableview-row-u2'
    )[0];
    expect(row2).toBeDefined();
  });

  it('renders cell content', () => {
    let {root} = renderWithProvider(
      <TableView columns={COLUMNS} items={ITEMS} testID="tv" />
    );
    let cell = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'tableview-cell-u1-name'
    )[0];
    expect(cell).toBeDefined();
    let textNode = cell.findAll(
      n => typeof n.type === 'string' && n.type === 'Text'
    )[0];
    expect(textNode.props.children).toBe('Alice');
  });

  it('calls onSelectionChange when a row is pressed in single mode', () => {
    let onSelectionChange = jest.fn();
    let {root} = renderWithProvider(
      <TableView
        columns={COLUMNS}
        items={ITEMS}
        onSelectionChange={onSelectionChange}
        selectionMode="single"
        testID="tv"
      />
    );
    let row = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'tableview-row-u1'
    )[0];
    act(() => {
      row.props.onPress();
    });
    expect(onSelectionChange).toHaveBeenCalled();
    let arg = onSelectionChange.mock.calls[0][0] as Set<string>;
    expect(arg.has('u1')).toBe(true);
  });

  it('calls onAction when a row is pressed', () => {
    let onAction = jest.fn();
    let {root} = renderWithProvider(
      <TableView
        columns={COLUMNS}
        items={ITEMS}
        onAction={onAction}
        testID="tv"
      />
    );
    let row = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'tableview-row-u2'
    )[0];
    act(() => {
      row.props.onPress();
    });
    expect(onAction).toHaveBeenCalledWith('u2');
  });

  it('calls onSortChange when a column header is pressed', () => {
    let onSortChange = jest.fn();
    let {root} = renderWithProvider(
      <TableView
        columns={COLUMNS}
        items={ITEMS}
        onSortChange={onSortChange}
        testID="tv"
      />
    );
    let nameCol = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'tv-col-name'
    )[0];
    act(() => {
      nameCol.props.onPress();
    });
    expect(onSortChange).toHaveBeenCalledWith({
      column: 'name',
      direction: 'ascending'
    });
  });

  it('toggles sort direction on second press of same column', () => {
    let onSortChange = jest.fn();
    let {root} = renderWithProvider(
      <TableView
        columns={COLUMNS}
        items={ITEMS}
        onSortChange={onSortChange}
        testID="tv"
      />
    );
    let nameCol = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'tv-col-name'
    )[0];
    act(() => {
      nameCol.props.onPress();
    });
    act(() => {
      nameCol.props.onPress();
    });
    expect(onSortChange).toHaveBeenNthCalledWith(2, {
      column: 'name',
      direction: 'descending'
    });
  });

  it('marks disabled rows with accessibilityState.disabled', () => {
    let {root} = renderWithProvider(
      <TableView
        columns={COLUMNS}
        disabledKeys={['u2']}
        items={ITEMS}
        testID="tv"
      />
    );
    let row = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'tableview-row-u2'
    )[0];
    expect(row.props.accessibilityState.disabled).toBe(true);
  });

  it('shows selected row with accessibilityState.selected', () => {
    let {root} = renderWithProvider(
      <TableView
        columns={COLUMNS}
        items={ITEMS}
        selectedKeys={['u3']}
        selectionMode="single"
        testID="tv"
      />
    );
    let row = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'tableview-row-u3'
    )[0];
    expect(row.props.accessibilityState.selected).toBe(true);
  });
});
