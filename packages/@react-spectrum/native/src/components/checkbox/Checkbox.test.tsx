import React from 'react';
import {fireEvent, renderWithProvider} from '../../test-utils/renderWithProvider';
import {Checkbox} from './Checkbox';
import {CheckboxGroup} from './CheckboxGroup';

function findCheckbox(root: any, testID = 'cb') {
  return root.findAll(
    (n: any) =>
      typeof n.type === 'string' && n.props && n.props.testID === testID
  )[0];
}

describe('Checkbox', () => {
  it('toggles uncontrolled selection on press', () => {
    let onChange = jest.fn();
    let {root} = renderWithProvider(
      <Checkbox onChange={onChange} testID="cb">
        Subscribe
      </Checkbox>
    );
    fireEvent.press(findCheckbox(root));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('reports indeterminate via accessibilityState.checked = "mixed"', () => {
    let {root} = renderWithProvider(
      <Checkbox isIndeterminate testID="cb">
        Subscribe
      </Checkbox>
    );
    expect(findCheckbox(root).props.accessibilityState.checked).toBe('mixed');
  });

  it('does not toggle when readOnly', () => {
    let onChange = jest.fn();
    let {root} = renderWithProvider(
      <Checkbox isReadOnly onChange={onChange} testID="cb">
        Subscribe
      </Checkbox>
    );
    fireEvent.press(findCheckbox(root));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('CheckboxGroup', () => {
  it('updates group value when child checkbox is pressed', () => {
    let onChange = jest.fn();
    let {root} = renderWithProvider(
      <CheckboxGroup label="Pick" onChange={onChange}>
        <Checkbox testID="a" value="a">
          A
        </Checkbox>
        <Checkbox testID="b" value="b">
          B
        </Checkbox>
      </CheckboxGroup>
    );
    fireEvent.press(findCheckbox(root, 'a'));
    expect(onChange).toHaveBeenCalledWith(['a']);
  });
});
