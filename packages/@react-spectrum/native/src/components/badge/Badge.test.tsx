import React from 'react';
import {renderWithProvider} from '../../test-utils/renderWithProvider';
import {Badge} from './Badge';

describe('Badge', () => {
  it('applies variant class for accent', () => {
    let {root} = renderWithProvider(<Badge variant="accent">New</Badge>);
    let hosts = root.findAll(
      n => typeof n.type === 'string' && typeof (n.props as any).className === 'string'
    );
    let outer = hosts.find(n => (n.props as any).className.includes('rounded-sm'))!;
    expect(outer.props.className).toContain('bg-accent');
  });

  it('renders text children inside Text element', () => {
    let {root} = renderWithProvider(<Badge variant="positive">Live</Badge>);
    let textNode = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).children === 'Live'
    )[0];
    expect(textNode).toBeDefined();
  });
});
