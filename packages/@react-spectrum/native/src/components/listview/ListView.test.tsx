import React from 'react';
import {act} from 'react-test-renderer';
import {Item} from 'react-stately/Item';
import {renderWithProvider} from '../../test-utils/renderWithProvider';
import {ListView} from './ListView';

describe('ListView', () => {
  it('renders items from static children', () => {
    let {root} = renderWithProvider(
      <ListView aria-label="Files" testID="lv">
        <Item key="doc">Document</Item>
        <Item key="img">Image</Item>
      </ListView>
    );
    let docItem = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'listview-item-doc'
    )[0];
    expect(docItem).toBeDefined();
    let imgItem = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'listview-item-img'
    )[0];
    expect(imgItem).toBeDefined();
  });

  it('calls onSelectionChange when an item is pressed in single mode', () => {
    let onSelectionChange = jest.fn();
    let {root} = renderWithProvider(
      <ListView
        aria-label="Files"
        onSelectionChange={onSelectionChange}
        selectionMode="single">
        <Item key="doc">Document</Item>
        <Item key="img">Image</Item>
      </ListView>
    );
    let docItem = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'listview-item-doc'
    )[0];
    act(() => {
      docItem.props.onPress();
    });
    expect(onSelectionChange).toHaveBeenCalled();
    let arg = onSelectionChange.mock.calls[0][0] as Set<string>;
    expect(arg.has('doc')).toBe(true);
  });

  it('calls onAction when an item is pressed', () => {
    let onAction = jest.fn();
    let {root} = renderWithProvider(
      <ListView aria-label="Files" onAction={onAction}>
        <Item key="doc">Document</Item>
        <Item key="img">Image</Item>
      </ListView>
    );
    let docItem = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'listview-item-doc'
    )[0];
    act(() => {
      docItem.props.onPress();
    });
    expect(onAction).toHaveBeenCalledWith('doc');
  });

  it('marks disabled items with accessibilityState.disabled', () => {
    let {root} = renderWithProvider(
      <ListView
        aria-label="Files"
        disabledKeys={['img']}
        selectionMode="single">
        <Item key="doc">Document</Item>
        <Item key="img">Image</Item>
      </ListView>
    );
    let imgItem = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'listview-item-img'
    )[0];
    expect(imgItem.props.accessibilityState.disabled).toBe(true);
  });

  it('shows selected item with accessibilityState.selected', () => {
    let {root} = renderWithProvider(
      <ListView
        aria-label="Files"
        selectedKeys={['doc']}
        selectionMode="single">
        <Item key="doc">Document</Item>
        <Item key="img">Image</Item>
      </ListView>
    );
    let docItem = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'listview-item-doc'
    )[0];
    expect(docItem.props.accessibilityState.selected).toBe(true);
  });

  it('renders label when provided', () => {
    let {root} = renderWithProvider(
      <ListView aria-label="Files" label="My Files" testID="lv">
        <Item key="doc">Document</Item>
      </ListView>
    );
    let labelNodes = root.findAll(
      n =>
        typeof n.type === 'string' &&
        n.type === 'Text' &&
        (n.props as any).children === 'My Files'
    );
    expect(labelNodes.length).toBeGreaterThan(0);
  });
});
