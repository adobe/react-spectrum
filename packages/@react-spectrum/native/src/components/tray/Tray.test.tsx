import React from 'react';
import {fireEvent, renderWithProvider} from '../../test-utils/renderWithProvider';
import {Tray} from './Tray';

describe('Tray', () => {
  it('uses slide animation', () => {
    let {root} = renderWithProvider(
      <Tray isOpen onOpenChange={() => {}} testID="t">
        <></>
      </Tray>
    );
    let host = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).testID === 't'
    )[0];
    expect(host.props.animationType).toBe('slide');
  });

  it('closes on hardware back', () => {
    let onOpenChange = jest.fn();
    let {root} = renderWithProvider(
      <Tray isOpen onOpenChange={onOpenChange} testID="t">
        <></>
      </Tray>
    );
    let host = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).testID === 't'
    )[0];
    fireEvent(host, 'onRequestClose');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders dialog role on inner content', () => {
    let {root} = renderWithProvider(
      <Tray isOpen onOpenChange={() => {}} testID="t">
        <></>
      </Tray>
    );
    let dialog = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).accessibilityRole === 'dialog'
    )[0];
    expect(dialog).toBeDefined();
  });
});
