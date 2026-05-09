import React from 'react';
import {fireEvent, renderWithProvider} from '../../test-utils/renderWithProvider';
import {SearchField, TextArea, TextField} from './TextField';

function findInput(root: any) {
  return root.findAll(
    (n: any) => typeof n.type === 'string' && n.props && n.props.accessibilityRole === 'text'
  )[0];
}

describe('TextField', () => {
  it('renders TextInput with provided value', () => {
    let {root} = renderWithProvider(<TextField label="Name" value="Alice" />);
    expect(findInput(root).props.value).toBe('Alice');
  });

  it('updates uncontrolled value via onChangeText', () => {
    let onChange = jest.fn();
    let {root} = renderWithProvider(<TextField label="Name" onChange={onChange} />);
    let input = findInput(root);
    fireEvent(input, 'onChangeText', 'hello');
    expect(onChange).toHaveBeenCalledWith('hello');
  });

  it('marks editable false when disabled', () => {
    let {root} = renderWithProvider(<TextField isDisabled label="Name" />);
    expect(findInput(root).props.editable).toBe(false);
  });

  it('marks editable false when readOnly', () => {
    let {root} = renderWithProvider(<TextField isReadOnly label="Name" />);
    expect(findInput(root).props.editable).toBe(false);
  });
});

describe('TextArea', () => {
  it('sets multiline=true', () => {
    let {root} = renderWithProvider(<TextArea label="Bio" />);
    expect(findInput(root).props.multiline).toBe(true);
  });
});

describe('SearchField', () => {
  it('uses search returnKeyType', () => {
    let {root} = renderWithProvider(<SearchField label="Search" />);
    expect(findInput(root).props.returnKeyType).toBe('search');
  });
});
