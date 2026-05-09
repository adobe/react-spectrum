import React from 'react';
import {fireEvent, renderWithProvider} from '../../test-utils/renderWithProvider';
import {ActionButton} from './ActionButton';

describe('ActionButton', () => {
  it('renders with button role', () => {
    let {getByTestId} = renderWithProvider(
      <ActionButton testID="ab">Add</ActionButton>
    );
    expect(getByTestId('ab').props.accessibilityRole).toBe('button');
  });

  it('fires onPress', () => {
    let onPress = jest.fn();
    let {getByTestId} = renderWithProvider(
      <ActionButton onPress={onPress} testID="ab">
        Add
      </ActionButton>
    );
    fireEvent.press(getByTestId('ab'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('respects isDisabled', () => {
    let onPress = jest.fn();
    let {getByTestId} = renderWithProvider(
      <ActionButton isDisabled onPress={onPress} testID="ab">
        Add
      </ActionButton>
    );
    fireEvent.press(getByTestId('ab'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
