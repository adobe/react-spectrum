import React from 'react';
import {fireEvent, renderWithProvider} from '../../test-utils/renderWithProvider';
import {Modal} from './Modal';

describe('Modal', () => {
  it('renders children when open', () => {
    let {root} = renderWithProvider(
      <Modal isOpen onOpenChange={() => {}} testID="m">
        <></>
      </Modal>
    );
    let host = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).testID === 'm'
    )[0];
    expect(host).toBeDefined();
    expect(host.props.visible).toBe(true);
  });

  it('does not render visible when closed', () => {
    let {root} = renderWithProvider(
      <Modal isOpen={false} onOpenChange={() => {}} testID="m">
        <></>
      </Modal>
    );
    let host = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).testID === 'm'
    )[0];
    expect(host.props.visible).toBe(false);
  });

  it('calls onOpenChange(false) on hardware back / onRequestClose', () => {
    let onOpenChange = jest.fn();
    let {root} = renderWithProvider(
      <Modal isOpen onOpenChange={onOpenChange} testID="m">
        <></>
      </Modal>
    );
    let host = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).testID === 'm'
    )[0];
    fireEvent(host, 'onRequestClose');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders dialog role on inner content', () => {
    let {root} = renderWithProvider(
      <Modal isOpen onOpenChange={() => {}} testID="m">
        <></>
      </Modal>
    );
    let dialog = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).accessibilityRole === 'dialog'
    )[0];
    expect(dialog).toBeDefined();
  });
});
