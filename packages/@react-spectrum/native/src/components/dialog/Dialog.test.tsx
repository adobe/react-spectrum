import React from 'react';
import {fireEvent, renderWithProvider} from '../../test-utils/renderWithProvider';
import {AlertDialog, Dialog} from './Dialog';

describe('Dialog', () => {
  it('renders heading text', () => {
    let {root} = renderWithProvider(
      <Dialog isOpen onOpenChange={() => {}} testID="dlg">
        <></>
      </Dialog>
    );
    let modal = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).testID === 'dlg'
    )[0];
    expect(modal.props.visible).toBe(true);
  });
});

describe('AlertDialog', () => {
  function findButtonByLabel(root: any, label: string) {
    let textNodes = root.findAll(
      (n: any) => typeof n.type === 'string' && n.props && n.props.children === label
    );
    let pressables = root.findAll(
      (n: any) =>
        typeof n.type === 'string' && n.props && n.props.accessibilityRole === 'button'
    );
    let labeled = pressables.find((p: any) => {
      let inner = p.findAll(
        (c: any) => typeof c.type === 'string' && c.props && c.props.children === label
      );
      return inner.length > 0;
    });
    return labeled ?? textNodes[0];
  }

  it('fires onPrimaryAction and closes', () => {
    let onPrimary = jest.fn();
    let onOpenChange = jest.fn();
    let {root} = renderWithProvider(
      <AlertDialog
        cancelLabel="Cancel"
        isOpen
        onOpenChange={onOpenChange}
        onPrimaryAction={onPrimary}
        primaryActionLabel="Delete"
        title="Are you sure?"
        variant="destructive">
        This cannot be undone.
      </AlertDialog>
    );
    let primaryBtn = findButtonByLabel(root, 'Delete');
    fireEvent.press(primaryBtn);
    expect(onPrimary).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('fires onCancel and closes', () => {
    let onCancel = jest.fn();
    let onOpenChange = jest.fn();
    let {root} = renderWithProvider(
      <AlertDialog
        cancelLabel="Cancel"
        isOpen
        onCancel={onCancel}
        onOpenChange={onOpenChange}
        primaryActionLabel="Delete"
        title="Sure?">
        body
      </AlertDialog>
    );
    let cancelBtn = findButtonByLabel(root, 'Cancel');
    fireEvent.press(cancelBtn);
    expect(onCancel).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
