import React from 'react';
import {act} from 'react-test-renderer';
import {Item} from 'react-stately/Item';
import {fireEvent, renderWithProvider} from '../../test-utils/renderWithProvider';
import {Picker} from './Picker';

function findTrigger(root: any) {
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

describe('Picker', () => {
  it('renders trigger with combobox role', () => {
    let {root} = renderWithProvider(
      <Picker label="Fruit" testID="pk">
        <Item key="apple">Apple</Item>
      </Picker>
    );
    expect(findTrigger(root).props.accessibilityRole).toBe('combobox');
  });

  it('shows placeholder when no selection', () => {
    let {root} = renderWithProvider(
      <Picker label="Fruit" placeholder="Pick one">
        <Item key="apple">Apple</Item>
      </Picker>
    );
    let placeholder = root.findAll(
      (n: any) =>
        typeof n.type === 'string' && n.props && n.props.children === 'Pick one'
    )[0];
    expect(placeholder).toBeDefined();
  });

  it('opens tray on trigger press', () => {
    let {root} = renderWithProvider(
      <Picker label="Fruit">
        <Item key="apple">Apple</Item>
      </Picker>
    );
    let trigger = findTrigger(root);
    act(() => { trigger.props.onPress(); });
    let modal = findModal(root);
    expect(modal.props.visible).toBe(true);
  });

  it('fires onSelectionChange and closes tray', () => {
    let onSelectionChange = jest.fn();
    let {root} = renderWithProvider(
      <Picker label="Fruit" onSelectionChange={onSelectionChange}>
        <Item key="apple">Apple</Item>
        <Item key="banana">Banana</Item>
      </Picker>
    );
    act(() => { findTrigger(root).props.onPress(); });
    let appleItem = root.findAll(
      (n: any) =>
        typeof n.type === 'string' && n.props && n.props.testID === 'listbox-item-apple'
    )[0];
    act(() => { appleItem.props.onPress(); });
    expect(onSelectionChange).toHaveBeenCalledWith('apple');
    expect(findModal(root).props.visible).toBe(false);
  });

  it('does not open when disabled', () => {
    let {root} = renderWithProvider(
      <Picker isDisabled label="Fruit">
        <Item key="apple">Apple</Item>
      </Picker>
    );
    let trigger = findTrigger(root);
    act(() => { trigger.props.onPress?.(); });
    expect(findModal(root).props.visible).toBe(false);
  });
});
