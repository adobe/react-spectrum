import React from 'react';
import {act} from 'react-test-renderer';
import {Item} from 'react-stately/Item';
import {fireEvent, renderWithProvider} from '../../test-utils/renderWithProvider';
import {ListBox} from './ListBox';

describe('ListBox', () => {
  it('renders items from static children', () => {
    let {root} = renderWithProvider(
      <ListBox aria-label="Fruits" testID="lb">
        <Item key="apple">Apple</Item>
        <Item key="banana">Banana</Item>
      </ListBox>
    );
    let appleItem = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).testID === 'listbox-item-apple'
    )[0];
    expect(appleItem).toBeDefined();
    let bananaItem = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).testID === 'listbox-item-banana'
    )[0];
    expect(bananaItem).toBeDefined();
  });

  it('calls onSelectionChange on item press', () => {
    let onSelectionChange = jest.fn();
    let {root} = renderWithProvider(
      <ListBox aria-label="Fruits" onSelectionChange={onSelectionChange} selectionMode="single">
        <Item key="apple">Apple</Item>
        <Item key="banana">Banana</Item>
      </ListBox>
    );
    let appleItem = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).testID === 'listbox-item-apple'
    )[0];
    act(() => { appleItem.props.onPress(); });
    expect(onSelectionChange).toHaveBeenCalled();
    let arg = onSelectionChange.mock.calls[0][0] as Set<string>;
    expect(arg.has('apple')).toBe(true);
  });

  it('marks disabled items with accessibilityState.disabled', () => {
    let {root} = renderWithProvider(
      <ListBox aria-label="Fruits" disabledKeys={['banana']} selectionMode="single">
        <Item key="apple">Apple</Item>
        <Item key="banana">Banana</Item>
      </ListBox>
    );
    let bananaItem = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).testID === 'listbox-item-banana'
    )[0];
    expect(bananaItem.props.accessibilityState.disabled).toBe(true);
  });

  it('shows selected item with accessibilityState.selected', () => {
    let {root} = renderWithProvider(
      <ListBox aria-label="Fruits" selectedKeys={['apple']} selectionMode="single">
        <Item key="apple">Apple</Item>
        <Item key="banana">Banana</Item>
      </ListBox>
    );
    let appleItem = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).testID === 'listbox-item-apple'
    )[0];
    expect(appleItem.props.accessibilityState.selected).toBe(true);
  });
});
