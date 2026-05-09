import React from 'react';
import {act} from 'react-test-renderer';
import {Item} from 'react-stately/Item';
import {fireEvent, renderWithProvider} from '../../test-utils/renderWithProvider';
import {ComboBox} from './ComboBox';

function findInput(root: any) {
  return root.findAll(
    (n: any) =>
      typeof n.type === 'string' && n.props && n.props.accessibilityRole === 'combobox'
  )[0];
}

function findModal(root: any) {
  return root.findAll(
    (n: any) => typeof n.type === 'string' && n.props && n.props.animationType === 'slide'
  )[0];
}

describe('ComboBox', () => {
  it('renders text input with combobox role', () => {
    let {root} = renderWithProvider(
      <ComboBox label="Fruit" testID="cb">
        <Item key="apple">Apple</Item>
      </ComboBox>
    );
    expect(findInput(root).props.accessibilityRole).toBe('combobox');
  });

  it('opens tray on focus', () => {
    let {root} = renderWithProvider(
      <ComboBox label="Fruit">
        <Item key="apple">Apple</Item>
      </ComboBox>
    );
    act(() => { findInput(root).props.onFocus(); });
    expect(findModal(root).props.visible).toBe(true);
  });

  it('calls onInputChange on text change', () => {
    let onInputChange = jest.fn();
    let {root} = renderWithProvider(
      <ComboBox label="Fruit" onInputChange={onInputChange}>
        <Item key="apple">Apple</Item>
      </ComboBox>
    );
    fireEvent(findInput(root), 'onChangeText', 'app');
    expect(onInputChange).toHaveBeenCalledWith('app');
  });

  it('selects item from tray and updates input', () => {
    let onSelectionChange = jest.fn();
    let {root} = renderWithProvider(
      <ComboBox label="Fruit" onSelectionChange={onSelectionChange}>
        <Item key="apple" textValue="Apple">Apple</Item>
        <Item key="banana" textValue="Banana">Banana</Item>
      </ComboBox>
    );
    act(() => { findInput(root).props.onFocus(); });
    let appleItem = root.findAll(
      (n: any) =>
        typeof n.type === 'string' && n.props && n.props.testID === 'listbox-item-apple'
    )[0];
    act(() => { appleItem.props.onPress(); });
    expect(onSelectionChange).toHaveBeenCalledWith('apple');
    expect(findModal(root).props.visible).toBe(false);
  });
});
