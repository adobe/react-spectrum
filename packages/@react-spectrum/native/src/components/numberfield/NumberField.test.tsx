import React from 'react';
import {act} from 'react-test-renderer';
import {fireEvent, renderWithProvider} from '../../test-utils/renderWithProvider';
import {NumberField} from './NumberField';

function findInput(root: any) {
  return root.findAll(
    (n: any) =>
      typeof n.type === 'string' && n.props && n.props.accessibilityRole === 'text'
  )[0];
}

function findBtn(root: any, testID: string) {
  return root.findAll(
    (n: any) => typeof n.type === 'string' && n.props && n.props.testID === testID
  )[0];
}

describe('NumberField', () => {
  it('renders numeric input', () => {
    let {root} = renderWithProvider(
      <NumberField defaultValue={5} label="Qty" testID="nf" />
    );
    expect(findInput(root).props.keyboardType).toBe('numeric');
  });

  it('increments value on stepper press', () => {
    let onChange = jest.fn();
    let {root} = renderWithProvider(
      <NumberField
        defaultValue={5}
        label="Qty"
        onChange={onChange}
        step={1}
        testID="nf"
      />
    );
    act(() => { findBtn(root, 'nf-increment').props.onPress(); });
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it('decrements value on stepper press', () => {
    let onChange = jest.fn();
    let {root} = renderWithProvider(
      <NumberField
        defaultValue={5}
        label="Qty"
        onChange={onChange}
        step={1}
        testID="nf"
      />
    );
    act(() => { findBtn(root, 'nf-decrement').props.onPress(); });
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('clamps to max — increment from 9 → 10, then no-op', () => {
    let onChange = jest.fn();
    let {root} = renderWithProvider(
      <NumberField
        defaultValue={9}
        label="Qty"
        maxValue={10}
        onChange={onChange}
        step={1}
        testID="nf"
      />
    );
    act(() => { findBtn(root, 'nf-increment').props.onPress(); });
    expect(onChange).toHaveBeenCalledWith(10);
    onChange.mockClear();
    act(() => { findBtn(root, 'nf-increment').props.onPress(); });
    expect(onChange).not.toHaveBeenCalled();
  });
});
