import React from 'react';
import {renderWithProvider} from '../../test-utils/renderWithProvider';
import {Divider} from './Divider';

describe('Divider', () => {
  it('renders horizontal by default with height: 1', () => {
    let {root} = renderWithProvider(<Divider />);
    let host = root.findAll(n => typeof n.type === 'string' && (n.props as any).accessibilityRole === 'none')[0];
    let style = (host.props as any).style;
    let flat = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;
    expect(flat.height).toBe(1);
  });

  it('renders vertical with width: 1', () => {
    let {root} = renderWithProvider(<Divider orientation="vertical" />);
    let host = root.findAll(n => typeof n.type === 'string' && (n.props as any).accessibilityRole === 'none')[0];
    let style = (host.props as any).style;
    let flat = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;
    expect(flat.width).toBe(1);
  });
});
