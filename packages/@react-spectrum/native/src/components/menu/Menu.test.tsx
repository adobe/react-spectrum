import React from 'react';
import {act} from 'react-test-renderer';
import {Item} from 'react-stately/Item';
import {fireEvent, renderWithProvider} from '../../test-utils/renderWithProvider';
import {ActionButton} from '../button/ActionButton';
import {ActionMenu, Menu, MenuItem, MenuTrigger} from './Menu';

function findModal(root: any) {
  return root.findAll(
    (n: any) => typeof n.type === 'string' && n.props && n.props.animationType === 'slide'
  )[0];
}

describe('MenuItem', () => {
  it('fires onAction on press', () => {
    let onAction = jest.fn();
    let {root} = renderWithProvider(
      <MenuItem onAction={onAction} testID="mi">
        Edit
      </MenuItem>
    );
    let host = root.findAll(
      (n: any) => typeof n.type === 'string' && n.props && n.props.testID === 'mi'
    )[0];
    fireEvent.press(host);
    expect(onAction).toHaveBeenCalled();
  });

  it('marks disabled accessibilityState', () => {
    let {root} = renderWithProvider(
      <MenuItem isDisabled testID="mi">
        Edit
      </MenuItem>
    );
    let host = root.findAll(
      (n: any) => typeof n.type === 'string' && n.props && n.props.testID === 'mi'
    )[0];
    expect(host.props.accessibilityState.disabled).toBe(true);
  });
});

describe('MenuTrigger', () => {
  it('opens tray on trigger press and renders items', () => {
    let {root} = renderWithProvider(
      <MenuTrigger menuChildren={[
        <Item key="edit">Edit</Item>,
        <Item key="delete">Delete</Item>
      ]}>
        <ActionButton testID="trigger">Open</ActionButton>
      </MenuTrigger>
    );
    let trigger = root.findAll(
      (n: any) => typeof n.type === 'string' && n.props && n.props.testID === 'trigger'
    )[0];
    act(() => { trigger.props.onPress(); });
    expect(findModal(root).props.visible).toBe(true);
    let editItem = root.findAll(
      (n: any) =>
        typeof n.type === 'string' && n.props && n.props.testID === 'menu-item-edit'
    )[0];
    expect(editItem).toBeDefined();
  });

  it('fires onAction and closes tray', () => {
    let onAction = jest.fn();
    let {root} = renderWithProvider(
      <MenuTrigger menuChildren={[<Item key="copy">Copy</Item>]} onAction={onAction}>
        <ActionButton testID="trigger">Open</ActionButton>
      </MenuTrigger>
    );
    act(() => {
      root.findAll(
        (n: any) => typeof n.type === 'string' && n.props && n.props.testID === 'trigger'
      )[0].props.onPress();
    });
    let copyItem = root.findAll(
      (n: any) =>
        typeof n.type === 'string' && n.props && n.props.testID === 'menu-item-copy'
    )[0];
    act(() => { copyItem.props.onPress(); });
    expect(onAction).toHaveBeenCalledWith('copy');
    expect(findModal(root).props.visible).toBe(false);
  });
});

describe('ActionMenu', () => {
  it('renders ActionButton trigger with default label', () => {
    let {root} = renderWithProvider(
      <ActionMenu menuChildren={[<Item key="a">A</Item>]} testID="am" />
    );
    let btn = root.findAll(
      (n: any) => typeof n.type === 'string' && n.props && n.props.testID === 'am'
    )[0];
    expect(btn).toBeDefined();
  });

  it('opens on press', () => {
    let {root} = renderWithProvider(
      <ActionMenu menuChildren={[<Item key="a">A</Item>]} testID="am" />
    );
    let btn = root.findAll(
      (n: any) => typeof n.type === 'string' && n.props && n.props.testID === 'am'
    )[0];
    act(() => { btn.props.onPress(); });
    expect(findModal(root).props.visible).toBe(true);
  });
});
