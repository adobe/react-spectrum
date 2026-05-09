import React from 'react';
import {fireEvent, renderWithProvider} from '../../test-utils/renderWithProvider';
import {ToggleButton} from './ToggleButton';

describe('ToggleButton', () => {
  it('toggles selection on press (uncontrolled)', () => {
    let onChange = jest.fn();
    let {getByTestId} = renderWithProvider(
      <ToggleButton onChange={onChange} testID="tb">
        Bold
      </ToggleButton>
    );
    fireEvent.press(getByTestId('tb'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('marks accessibilityState.selected when isSelected', () => {
    let {getByTestId} = renderWithProvider(
      <ToggleButton isSelected testID="tb">
        Bold
      </ToggleButton>
    );
    expect(getByTestId('tb').props.accessibilityState.selected).toBe(true);
  });

  it('does not toggle when isReadOnly', () => {
    let onChange = jest.fn();
    let {getByTestId} = renderWithProvider(
      <ToggleButton isReadOnly onChange={onChange} testID="tb">
        Bold
      </ToggleButton>
    );
    fireEvent.press(getByTestId('tb'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
