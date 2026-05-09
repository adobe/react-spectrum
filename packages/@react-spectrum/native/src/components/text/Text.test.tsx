import React from 'react';
import {renderWithProvider} from '../../test-utils/renderWithProvider';
import {SpectrumText} from './Text';

describe('SpectrumText', () => {
  it('renders children', () => {
    let {getByTestId} = renderWithProvider(<SpectrumText testID="t">Body</SpectrumText>);
    expect(getByTestId('t').props.children).toBe('Body');
  });

  it('forwards user className', () => {
    let {getByTestId} = renderWithProvider(
      <SpectrumText className="font-bold" testID="t">
        x
      </SpectrumText>
    );
    expect(getByTestId('t').props.className).toContain('font-bold');
  });
});
