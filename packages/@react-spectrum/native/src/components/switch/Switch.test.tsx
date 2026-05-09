import React from 'react';
import {fireEvent, renderWithProvider} from '../../test-utils/renderWithProvider';
import {Switch} from './Switch';

function findSwitch(root: any) {
  return root.findAll(
    (n: any) =>
      typeof n.type === 'string' && n.props && n.props.testID === 'sw'
  )[0];
}

describe('Switch', () => {
  it('toggles uncontrolled selection', () => {
    let onChange = jest.fn();
    let {root} = renderWithProvider(
      <Switch onChange={onChange} testID="sw">
        Notify
      </Switch>
    );
    fireEvent.press(findSwitch(root));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('reflects checked accessibilityState', () => {
    let {root} = renderWithProvider(
      <Switch isSelected testID="sw">
        Notify
      </Switch>
    );
    expect(findSwitch(root).props.accessibilityState.checked).toBe(true);
  });

  it('does not toggle when disabled', () => {
    let onChange = jest.fn();
    let {root} = renderWithProvider(
      <Switch isDisabled onChange={onChange} testID="sw">
        Notify
      </Switch>
    );
    fireEvent.press(findSwitch(root));
    expect(onChange).not.toHaveBeenCalled();
  });
});
