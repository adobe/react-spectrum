import React from 'react';
import {renderWithProvider} from '../test-utils/renderWithProvider';
import {Text} from './Text';

describe('Text primitive', () => {
  it('renders text content', () => {
    let {getByTestId} = renderWithProvider(<Text testID="text">Hello</Text>);
    expect(getByTestId('text').props.children).toBe('Hello');
  });

  it('forwards user className', () => {
    let {getByTestId} = renderWithProvider(
      <Text className="font-bold" testID="text">
        Hi
      </Text>
    );
    expect(getByTestId('text').props.className).toContain('font-bold');
  });
});
