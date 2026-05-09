import React from 'react';
import {act} from 'react-test-renderer';
import {Item} from 'react-stately/Item';
import {Section} from 'react-stately/Section';
import {renderWithProvider} from '../../test-utils/renderWithProvider';
import {TreeView} from './TreeView';

describe('TreeView', () => {
  it('renders top-level items', () => {
    let {root} = renderWithProvider(
      <TreeView aria-label="Files" testID="tv">
        <Item key="src">src</Item>
        <Item key="dist">dist</Item>
      </TreeView>
    );
    let srcNode = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'tv-item-src'
    )[0];
    expect(srcNode).toBeDefined();
    let distNode = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'tv-item-dist'
    )[0];
    expect(distNode).toBeDefined();
  });

  it('renders expand toggle for items with children', () => {
    let {root} = renderWithProvider(
      <TreeView
        aria-label="Files"
        defaultExpandedKeys={[]}
        testID="tv">
        <Item key="src" title="src">
          <Item key="index">index.ts</Item>
        </Item>
      </TreeView>
    );
    let toggle = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'tv-toggle-src'
    )[0];
    expect(toggle).toBeDefined();
  });

  it('shows children when item is expanded via defaultExpandedKeys', () => {
    let {root} = renderWithProvider(
      <TreeView
        aria-label="Files"
        defaultExpandedKeys={['src']}
        testID="tv">
        <Item key="src" title="src">
          <Item key="index">index.ts</Item>
        </Item>
      </TreeView>
    );
    let childNode = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'tv-item-index'
    )[0];
    expect(childNode).toBeDefined();
  });

  it('calls onAction when an item is pressed', () => {
    let onAction = jest.fn();
    let {root} = renderWithProvider(
      <TreeView aria-label="Files" onAction={onAction} testID="tv">
        <Item key="src">src</Item>
        <Item key="dist">dist</Item>
      </TreeView>
    );
    let srcNode = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'tv-item-src'
    )[0];
    act(() => {
      srcNode.props.onPress();
    });
    expect(onAction).toHaveBeenCalledWith('src');
  });

  it('calls onSelectionChange when item pressed in single mode', () => {
    let onSelectionChange = jest.fn();
    let {root} = renderWithProvider(
      <TreeView
        aria-label="Files"
        onSelectionChange={onSelectionChange}
        selectionMode="single"
        testID="tv">
        <Item key="src">src</Item>
        <Item key="dist">dist</Item>
      </TreeView>
    );
    let srcNode = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'tv-item-src'
    )[0];
    act(() => {
      srcNode.props.onPress();
    });
    expect(onSelectionChange).toHaveBeenCalled();
    let arg = onSelectionChange.mock.calls[0][0] as Set<string>;
    expect(arg.has('src')).toBe(true);
  });

  it('marks disabled items with accessibilityState.disabled', () => {
    let {root} = renderWithProvider(
      <TreeView
        aria-label="Files"
        disabledKeys={['dist']}
        selectionMode="single"
        testID="tv">
        <Item key="src">src</Item>
        <Item key="dist">dist</Item>
      </TreeView>
    );
    let distNode = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'tv-item-dist'
    )[0];
    expect(distNode.props.accessibilityState.disabled).toBe(true);
  });

  it('shows selected item with accessibilityState.selected', () => {
    let {root} = renderWithProvider(
      <TreeView
        aria-label="Files"
        selectedKeys={['src']}
        selectionMode="single"
        testID="tv">
        <Item key="src">src</Item>
        <Item key="dist">dist</Item>
      </TreeView>
    );
    let srcNode = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'tv-item-src'
    )[0];
    expect(srcNode.props.accessibilityState.selected).toBe(true);
  });

  it('toggles expansion when toggle button is pressed', () => {
    let {root} = renderWithProvider(
      <TreeView
        aria-label="Files"
        defaultExpandedKeys={[]}
        testID="tv">
        <Item key="src" title="src">
          <Item key="index">index.ts</Item>
        </Item>
      </TreeView>
    );

    // Child should not be visible before expansion
    let childBefore = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'tv-item-index'
    );
    expect(childBefore.length).toBe(0);

    // Press toggle to expand
    let toggle = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'tv-toggle-src'
    )[0];
    act(() => {
      toggle.props.onPress();
    });

    // Child should now be visible
    let childAfter = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'tv-item-index'
    );
    expect(childAfter.length).toBeGreaterThan(0);
  });

  it('renders sections with their items', () => {
    let {root} = renderWithProvider(
      <TreeView aria-label="Files" testID="tv">
        <Section key="code" title="Code">
          <Item key="src">src</Item>
        </Section>
        <Section key="build" title="Build">
          <Item key="dist">dist</Item>
        </Section>
      </TreeView>
    );
    let srcNode = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'tv-item-src'
    )[0];
    expect(srcNode).toBeDefined();
    let distNode = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).testID === 'tv-item-dist'
    )[0];
    expect(distNode).toBeDefined();
  });
});
