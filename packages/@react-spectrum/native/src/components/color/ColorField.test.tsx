import React from 'react';
import {act} from 'react-test-renderer';
import {fireEvent, renderWithProvider} from '../../test-utils/renderWithProvider';
import {ColorField} from './ColorField';

describe('ColorField', () => {
  it('renders without crashing', () => {
    let {root} = renderWithProvider(<ColorField />);
    expect(root).toBeDefined();
  });

  it('renders a TextInput', () => {
    let {root} = renderWithProvider(<ColorField defaultValue="#ff0000" />);
    let input = root.findAll(n => n.type === 'TextInput')[0];
    expect(input).toBeDefined();
  });

  it('displays the defaultValue in input', () => {
    let {root} = renderWithProvider(<ColorField defaultValue="#aabbcc" />);
    let input = root.findAll(n => n.type === 'TextInput')[0];
    expect((input.props as any).value).toBe('#aabbcc');
  });

  it('renders a color swatch alongside the input', () => {
    let {root} = renderWithProvider(<ColorField defaultValue="#ff0000" />);
    // Swatch renders an RNView with backgroundColor in style
    let swatchNode = root.findAll(
      n =>
        typeof n.type === 'string' &&
        typeof (n.props as any).style === 'object' &&
        (n.props as any).style?.backgroundColor === '#ff0000'
    )[0];
    expect(swatchNode).toBeDefined();
  });

  it('renders the label when provided', () => {
    let {root} = renderWithProvider(<ColorField label="Brand Color" />);
    let labelNode = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).children === 'Brand Color'
    )[0];
    expect(labelNode).toBeDefined();
  });

  it('calls onChange when text changes', () => {
    let onChange = jest.fn();
    let {root} = renderWithProvider(<ColorField onChange={onChange} />);
    let input = root.findAll(n => n.type === 'TextInput')[0];
    act(() => {
      (input.props as any).onChangeText('#123456');
    });
    expect(onChange).toHaveBeenCalledWith('#123456');
  });

  it('updates uncontrolled inputValue on text change', () => {
    let {root} = renderWithProvider(<ColorField defaultValue="" />);
    let input = root.findAll(n => n.type === 'TextInput')[0];
    act(() => {
      (input.props as any).onChangeText('#abcdef');
    });
    // Re-query after state update
    let updatedInput = root.findAll(n => n.type === 'TextInput')[0];
    expect((updatedInput.props as any).value).toBe('#abcdef');
  });

  it('is not editable when isDisabled', () => {
    let {root} = renderWithProvider(<ColorField isDisabled />);
    let input = root.findAll(n => n.type === 'TextInput')[0];
    expect((input.props as any).editable).toBe(false);
  });

  it('uses testID on the wrapper', () => {
    let {getByTestId} = renderWithProvider(<ColorField testID="color-field" />);
    expect(getByTestId('color-field')).toBeDefined();
  });

  it('applies invalid border class when isInvalid', () => {
    let {root} = renderWithProvider(<ColorField isInvalid />);
    let invalidNode = root.findAll(
      n =>
        typeof n.type === 'string' &&
        typeof (n.props as any).className === 'string' &&
        (n.props as any).className.includes('border-negative')
    )[0];
    expect(invalidNode).toBeDefined();
  });
});
