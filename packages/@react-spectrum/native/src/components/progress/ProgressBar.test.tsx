import React from 'react';
import {renderWithProvider} from '../../test-utils/renderWithProvider';
import {ProgressBar} from './ProgressBar';

function findRoot(root: any) {
  return root.findAll(
    (n: any) =>
      typeof n.type === 'string' && n.props && n.props.accessibilityRole === 'progressbar'
  )[0];
}

describe('ProgressBar', () => {
  it('exposes progressbar role and accessibilityValue', () => {
    let {root} = renderWithProvider(
      <ProgressBar label="Loading" maxValue={100} minValue={0} value={42} />
    );
    let host = findRoot(root);
    expect(host.props.accessibilityRole).toBe('progressbar');
    expect(host.props.accessibilityValue).toBeDefined();
    expect(host.props.accessibilityValue.now).toBe(42);
  });

  it('accepts indeterminate', () => {
    let {root} = renderWithProvider(<ProgressBar isIndeterminate label="Loading" />);
    let host = findRoot(root);
    expect(host.props.accessibilityRole).toBe('progressbar');
  });
});
