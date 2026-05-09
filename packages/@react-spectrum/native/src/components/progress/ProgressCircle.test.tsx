import React from 'react';
import {renderWithProvider} from '../../test-utils/renderWithProvider';
import {ProgressCircle} from './ProgressCircle';

describe('ProgressCircle', () => {
  it('renders progressbar role', () => {
    let {root} = renderWithProvider(
      <ProgressCircle label="Loading" maxValue={100} minValue={0} value={50} />
    );
    let host = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).accessibilityRole === 'progressbar'
    )[0];
    expect(host).toBeDefined();
  });

  it('accepts isIndeterminate', () => {
    let {root} = renderWithProvider(<ProgressCircle isIndeterminate aria-label="Loading" />);
    let host = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).accessibilityRole === 'progressbar'
    )[0];
    expect(host).toBeDefined();
  });
});
