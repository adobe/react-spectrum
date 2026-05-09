import React from 'react';
import {renderWithProvider} from '../../test-utils/renderWithProvider';
import {InlineAlert} from './InlineAlert';

describe('InlineAlert', () => {
  it('renders with alert accessibility role', () => {
    let {root} = renderWithProvider(
      <InlineAlert heading="Saved" variant="positive">
        Your changes are saved
      </InlineAlert>
    );
    let host = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).accessibilityRole === 'alert'
    )[0];
    expect(host).toBeDefined();
  });

  it('applies variant border class', () => {
    let {root} = renderWithProvider(
      <InlineAlert variant="negative">Error</InlineAlert>
    );
    let host = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).accessibilityRole === 'alert'
    )[0];
    expect(host.props.className).toContain('border-negative');
  });
});
