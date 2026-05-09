import React from 'react';
import {act} from 'react-test-renderer';
import {Item} from 'react-stately/Item';
import {renderWithProvider} from '../../test-utils/renderWithProvider';
import {Text} from '../../primitives';
import {Tabs} from './Tabs';

function findTab(root: any, key: string) {
  return root.findAll(
    (n: any) => typeof n.type === 'string' && n.props && n.props.testID === `tab-${key}`
  )[0];
}

function findPanel(root: any) {
  return root.findAll(
    (n: any) =>
      typeof n.type === 'string' && n.props && n.props.accessibilityRole === 'tabpanel'
  )[0];
}

describe('Tabs', () => {
  it('renders tabs with correct textValue labels', () => {
    let {root} = renderWithProvider(
      <Tabs defaultSelectedKey="a">
        <Item key="a" textValue="Alpha"><Text>Panel A</Text></Item>
        <Item key="b" textValue="Beta"><Text>Panel B</Text></Item>
      </Tabs>
    );
    expect(findTab(root, 'a')).toBeDefined();
    expect(findTab(root, 'b')).toBeDefined();
  });

  it('marks selected tab via accessibilityState', () => {
    let {root} = renderWithProvider(
      <Tabs defaultSelectedKey="a">
        <Item key="a" textValue="Alpha"><Text>Panel A</Text></Item>
        <Item key="b" textValue="Beta"><Text>Panel B</Text></Item>
      </Tabs>
    );
    expect(findTab(root, 'a').props.accessibilityState.selected).toBe(true);
    expect(findTab(root, 'b').props.accessibilityState.selected).toBeUndefined();
  });

  it('switches selected tab on press', () => {
    let onSelectionChange = jest.fn();
    let {root} = renderWithProvider(
      <Tabs defaultSelectedKey="a" onSelectionChange={onSelectionChange}>
        <Item key="a" textValue="Alpha"><Text>Panel A</Text></Item>
        <Item key="b" textValue="Beta"><Text>Panel B</Text></Item>
      </Tabs>
    );
    act(() => { findTab(root, 'b').props.onPress(); });
    expect(onSelectionChange).toHaveBeenCalledWith('b');
    expect(findTab(root, 'b').props.accessibilityState.selected).toBe(true);
  });

  it('renders panel content for selected tab', () => {
    let {root} = renderWithProvider(
      <Tabs defaultSelectedKey="b">
        <Item key="a" textValue="Alpha"><Text testID="panel-a">Panel A</Text></Item>
        <Item key="b" textValue="Beta"><Text testID="panel-b">Panel B</Text></Item>
      </Tabs>
    );
    let panel = findPanel(root);
    let panelB = root.findAll(
      (n: any) => typeof n.type === 'string' && n.props && n.props.testID === 'panel-b'
    )[0];
    expect(panel).toBeDefined();
    expect(panelB).toBeDefined();
  });
});
