import React, {createRef} from 'react';
import {renderWithProvider} from '../test-utils/renderWithProvider';
import {View} from './View';

describe('View primitive', () => {
  it('renders children', () => {
    let {getByTestId, queryByTestId} = renderWithProvider(
      <View testID="root">
        <View testID="child" />
      </View>
    );
    expect(getByTestId('root')).toBeDefined();
    expect(queryByTestId('child')).not.toBeNull();
  });

  it('forwards ref', () => {
    let ref = createRef<unknown>();
    renderWithProvider(<View ref={ref as never} testID="root" />);
    expect(ref.current).not.toBeNull();
  });

  it('passes className through cn()', () => {
    let {getByTestId} = renderWithProvider(<View className="bg-surface" testID="root" />);
    expect(getByTestId('root').props.className).toContain('bg-surface');
  });
});
