import React from 'react';
import {renderWithProvider} from '../../test-utils/renderWithProvider';
import {ColorSwatch} from './ColorSwatch';

describe('ColorSwatch', () => {
  it('renders without crashing', () => {
    let {root} = renderWithProvider(<ColorSwatch color="#ff0000" testID="swatch" />);
    expect(root).toBeDefined();
  });

  it('finds node by testID', () => {
    let {getByTestId} = renderWithProvider(<ColorSwatch color="#ff0000" testID="swatch" />);
    let node = getByTestId('swatch');
    expect(node).toBeDefined();
  });

  it('applies backgroundColor from color prop', () => {
    let {root} = renderWithProvider(<ColorSwatch color="#3366cc" testID="swatch" />);
    let colorNode = root.findAll(
      n =>
        typeof n.type === 'string' &&
        typeof (n.props as any).style === 'object' &&
        (n.props as any).style?.backgroundColor === '#3366cc'
    )[0];
    expect(colorNode).toBeDefined();
    expect((colorNode.props as any).style.backgroundColor).toBe('#3366cc');
  });

  it('sets accessibilityRole to image', () => {
    let {root} = renderWithProvider(<ColorSwatch color="#ff0000" />);
    let imageNode = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).accessibilityRole === 'image'
    )[0];
    expect(imageNode).toBeDefined();
  });

  it('uses color as default accessibilityLabel', () => {
    let {root} = renderWithProvider(<ColorSwatch color="#abcdef" />);
    let imageNode = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).accessibilityRole === 'image'
    )[0];
    expect((imageNode.props as any).accessibilityLabel).toBe('#abcdef');
  });

  it('uses label prop as accessibilityLabel when provided', () => {
    let {root} = renderWithProvider(<ColorSwatch color="#ff0000" label="Red" />);
    let imageNode = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).accessibilityRole === 'image'
    )[0];
    expect((imageNode.props as any).accessibilityLabel).toBe('Red');
  });

  it('renders label text when provided', () => {
    let {root} = renderWithProvider(<ColorSwatch color="#ff0000" label="Red" />);
    let labelNode = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).children === 'Red'
    )[0];
    expect(labelNode).toBeDefined();
  });

  it('applies S size (20px)', () => {
    let {root} = renderWithProvider(<ColorSwatch color="#ff0000" size="S" />);
    let node = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).style?.width === 20
    )[0];
    expect(node).toBeDefined();
    expect((node.props as any).style.height).toBe(20);
  });

  it('applies L size (48px)', () => {
    let {root} = renderWithProvider(<ColorSwatch color="#ff0000" size="L" />);
    let node = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).style?.width === 48
    )[0];
    expect(node).toBeDefined();
  });

  it('applies round borderRadius when isRound=true', () => {
    let {root} = renderWithProvider(<ColorSwatch color="#ff0000" size="M" isRound />);
    // M = 32px, round => borderRadius = 16
    let node = root.findAll(
      n =>
        typeof n.type === 'string' &&
        (n.props as any).style?.borderRadius === 16
    )[0];
    expect(node).toBeDefined();
  });
});
