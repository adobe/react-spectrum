import React from 'react';
import {act} from 'react-test-renderer';
import {renderWithProvider} from '../../test-utils/renderWithProvider';
import {Tag, TagGroup} from './TagGroup';

describe('Tag', () => {
  it('renders without crashing', () => {
    let {root} = renderWithProvider(<Tag>React</Tag>);
    expect(root).toBeDefined();
  });

  it('renders children text', () => {
    let {root} = renderWithProvider(<Tag>TypeScript</Tag>);
    let textNode = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).children === 'TypeScript'
    )[0];
    expect(textNode).toBeDefined();
  });

  it('applies selected styles when isSelected', () => {
    let {root} = renderWithProvider(<Tag isSelected>Active</Tag>);
    let selectedNode = root.findAll(
      n =>
        typeof n.type === 'string' &&
        typeof (n.props as any).className === 'string' &&
        (n.props as any).className.includes('bg-accentSubtle')
    )[0];
    expect(selectedNode).toBeDefined();
  });

  it('applies disabled opacity when isDisabled', () => {
    let {root} = renderWithProvider(<Tag isDisabled>Disabled</Tag>);
    let disabledNode = root.findAll(
      n =>
        typeof n.type === 'string' &&
        typeof (n.props as any).className === 'string' &&
        (n.props as any).className.includes('opacity-disabled')
    )[0];
    expect(disabledNode).toBeDefined();
  });

  it('renders remove button when isRemovable and onRemove provided', () => {
    let onRemove = jest.fn();
    let {root} = renderWithProvider(
      <Tag isRemovable onRemove={onRemove}>
        Removable
      </Tag>
    );
    let removeBtn = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).accessibilityLabel === 'Remove'
    )[0];
    expect(removeBtn).toBeDefined();
  });

  it('calls onRemove when remove button pressed', () => {
    let onRemove = jest.fn();
    let {root} = renderWithProvider(
      <Tag isRemovable onRemove={onRemove}>
        Removable
      </Tag>
    );
    let removeBtn = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).accessibilityLabel === 'Remove'
    )[0];
    act(() => {
      (removeBtn.props as any).onPress({target: {}});
    });
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('calls onPress when tag label area pressed', () => {
    let onPress = jest.fn();
    let {root} = renderWithProvider(<Tag onPress={onPress}>Pressable</Tag>);
    // The Pressable wrapping the label is role="button"
    let btn = root.findAll(
      n =>
        n.type === 'Pressable' &&
        (n.props as any).accessibilityRole === 'button' &&
        (n.props as any).accessibilityLabel !== 'Remove'
    )[0];
    act(() => {
      (btn.props as any).onPress({target: {}});
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not render remove button when isRemovable but no onRemove', () => {
    let {root} = renderWithProvider(<Tag isRemovable>No Remove</Tag>);
    let removeBtn = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).accessibilityLabel === 'Remove'
    )[0];
    expect(removeBtn).toBeUndefined();
  });

  it('applies pill shape classes', () => {
    let {root} = renderWithProvider(<Tag>Pill</Tag>);
    let pillNode = root.findAll(
      n =>
        typeof n.type === 'string' &&
        typeof (n.props as any).className === 'string' &&
        (n.props as any).className.includes('rounded-full')
    )[0];
    expect(pillNode).toBeDefined();
  });

  it('applies testID', () => {
    let {getByTestId} = renderWithProvider(<Tag testID="tag-1">Test</Tag>);
    expect(getByTestId('tag-1')).toBeDefined();
  });
});

describe('TagGroup', () => {
  it('renders without crashing', () => {
    let {root} = renderWithProvider(
      <TagGroup>
        <Tag>One</Tag>
      </TagGroup>
    );
    expect(root).toBeDefined();
  });

  it('renders label when provided', () => {
    let {root} = renderWithProvider(
      <TagGroup label="Filters">
        <Tag>All</Tag>
      </TagGroup>
    );
    let labelNode = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).children === 'Filters'
    )[0];
    expect(labelNode).toBeDefined();
  });

  it('renders all child tags', () => {
    let {root} = renderWithProvider(
      <TagGroup>
        <Tag testID="tag-a">Alpha</Tag>
        <Tag testID="tag-b">Beta</Tag>
        <Tag testID="tag-c">Gamma</Tag>
      </TagGroup>
    );
    let alphaNode = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).children === 'Alpha'
    )[0];
    let betaNode = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).children === 'Beta'
    )[0];
    expect(alphaNode).toBeDefined();
    expect(betaNode).toBeDefined();
  });

  it('applies testID to the group wrapper', () => {
    let {getByTestId} = renderWithProvider(
      <TagGroup testID="tag-group">
        <Tag>Item</Tag>
      </TagGroup>
    );
    expect(getByTestId('tag-group')).toBeDefined();
  });
});
