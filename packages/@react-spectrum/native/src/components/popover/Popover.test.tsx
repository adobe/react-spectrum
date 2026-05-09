import React from 'react';
import {fireEvent, renderWithProvider} from '../../test-utils/renderWithProvider';
import {Popover} from './Popover';

function findModal(root: any, id: string) {
  return root.findAll(
    (n: any) => typeof n.type === 'string' && n.props && n.props.testID === id
  )[0];
}

describe('Popover', () => {
  it('is hidden when closed', () => {
    let {root} = renderWithProvider(
      <Popover isOpen={false} onOpenChange={() => {}} testID="p">
        <></>
      </Popover>
    );
    expect(findModal(root, 'p').props.visible).toBe(false);
  });

  it('positions content based on anchor + bottom placement', () => {
    let {root} = renderWithProvider(
      <Popover
        anchorRect={{height: 24, width: 100, x: 50, y: 200}}
        isOpen
        offset={4}
        onOpenChange={() => {}}
        placement="bottom"
        testID="p">
        <></>
      </Popover>
    );
    let dialog = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).accessibilityRole === 'dialog'
    )[0];
    let collected: Record<string, unknown> = {};
    let walk = (s: unknown) => {
      if (s == null) {
        return;
      }
      if (Array.isArray(s)) {
        s.forEach(walk);
      } else if (typeof s === 'object') {
        Object.assign(collected, s);
      }
    };
    walk(dialog.props.style);
    expect(collected.top).toBe(228);
    expect(collected.left).toBe(50);
  });

  it('closes on hardware back', () => {
    let onOpenChange = jest.fn();
    let {root} = renderWithProvider(
      <Popover isOpen onOpenChange={onOpenChange} testID="p">
        <></>
      </Popover>
    );
    fireEvent(findModal(root, 'p'), 'onRequestClose');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
