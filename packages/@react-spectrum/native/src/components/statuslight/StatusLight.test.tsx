import React from 'react';
import {renderWithProvider} from '../../test-utils/renderWithProvider';
import {StatusLight} from './StatusLight';

describe('StatusLight', () => {
  it('renders indicator dot with variant background', () => {
    let {root} = renderWithProvider(<StatusLight variant="positive">Online</StatusLight>);
    let hosts = root.findAll(
      n => typeof n.type === 'string' && typeof (n.props as any).className === 'string'
    );
    let dot = hosts.find(n => (n.props as any).className.includes('rounded-full'))!;
    expect(dot.props.className).toContain('bg-positive');
  });

  it('renders text children', () => {
    let {root} = renderWithProvider(<StatusLight>Idle</StatusLight>);
    let labelNode = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).children === 'Idle'
    )[0];
    expect(labelNode).toBeDefined();
  });
});
