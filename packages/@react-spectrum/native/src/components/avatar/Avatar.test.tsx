import React from 'react';
import {StyleSheet} from 'react-native';
import {renderWithProvider} from '../../test-utils/renderWithProvider';
import {Avatar} from './Avatar';

// Helper to flatten RN style (handles arrays like View primitive produces)
function flatStyle(node: any): Record<string, any> {
  return StyleSheet.flatten(node.props.style) ?? {};
}

// Find the outermost node that carries the avatar size/bg styles.
// For src-less Avatar it is the View primitive host; for src Avatar it is Image.
function findAvatarHost(root: any) {
  return root.findAll(
    (n: any) =>
      typeof n.type === 'string' &&
      typeof n.props.style !== 'undefined' &&
      n.props.accessibilityRole === 'image'
  )[0];
}

describe('Avatar', () => {
  it('renders without crashing', () => {
    let {root} = renderWithProvider(<Avatar />);
    expect(root).toBeDefined();
  });

  it('renders initials when no src provided', () => {
    let {root} = renderWithProvider(<Avatar name="Alice Smith" />);
    // Should show 'A' (first letter of first name)
    let initialsNode = root.findAll(
      (n: any) => typeof n.type === 'string' && n.props.children === 'A'
    )[0];
    expect(initialsNode).toBeDefined();
  });

  it('renders "?" when no src and no name', () => {
    let {root} = renderWithProvider(<Avatar />);
    let initialsNode = root.findAll(
      (n: any) => typeof n.type === 'string' && n.props.children === '?'
    )[0];
    expect(initialsNode).toBeDefined();
  });

  it('renders Image when src is provided', () => {
    let {root} = renderWithProvider(<Avatar src="https://example.com/avatar.jpg" name="Bob" />);
    let imageNode = root.findAll((n: any) => n.type === 'Image')[0];
    expect(imageNode).toBeDefined();
    expect(imageNode.props.source).toEqual({uri: 'https://example.com/avatar.jpg'});
  });

  it('applies accessibilityRole image', () => {
    let {root} = renderWithProvider(<Avatar name="Carol" />);
    let node = root.findAll(
      (n: any) => typeof n.type === 'string' && n.props.accessibilityRole === 'image'
    )[0];
    expect(node).toBeDefined();
  });

  it('uses name as accessibilityLabel', () => {
    let {root} = renderWithProvider(<Avatar name="Dave" />);
    let node = root.findAll(
      (n: any) => typeof n.type === 'string' && n.props.accessibilityLabel === 'Dave'
    )[0];
    expect(node).toBeDefined();
  });

  it('applies XS size (24px)', () => {
    let {root} = renderWithProvider(<Avatar name="Eve" size="XS" testID="av" />);
    let node = findAvatarHost(root);
    let s = flatStyle(node);
    expect(s.width).toBe(24);
    expect(s.height).toBe(24);
  });

  it('applies M size (40px) by default', () => {
    let {root} = renderWithProvider(<Avatar name="Frank" testID="av" />);
    let node = findAvatarHost(root);
    let s = flatStyle(node);
    expect(s.width).toBe(40);
  });

  it('applies XL size (64px)', () => {
    let {root} = renderWithProvider(<Avatar name="Grace" size="XL" testID="av" />);
    let node = findAvatarHost(root);
    let s = flatStyle(node);
    expect(s.width).toBe(64);
  });

  it('applies circular borderRadius equal to half of size', () => {
    let {root} = renderWithProvider(<Avatar name="Hank" size="M" testID="av" />);
    // M = 40, so borderRadius = 20
    let node = findAvatarHost(root);
    let s = flatStyle(node);
    expect(s.borderRadius).toBe(20);
  });

  it('applies testID', () => {
    let {getByTestId} = renderWithProvider(<Avatar name="Ivy" testID="avatar-test" />);
    expect(getByTestId('avatar-test')).toBeDefined();
  });

  it('same name always yields same background color', () => {
    let {root: root1} = renderWithProvider(<Avatar name="Judy" testID="av" />);
    let {root: root2} = renderWithProvider(<Avatar name="Judy" testID="av" />);
    let node1 = findAvatarHost(root1);
    let node2 = findAvatarHost(root2);
    expect(flatStyle(node1).backgroundColor).toBe(flatStyle(node2).backgroundColor);
  });
});
