/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Button, Dialog, DialogTrigger, Heading, Modal, ModalOverlay, OverlayArrow, Popover} from '../';
import {pointerMap, render, within} from '@react-spectrum/test-utils';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('Dialog', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('works with modal', async () => {
    let {getByRole} = render(
      <DialogTrigger>
        <Button>Delete…</Button>
        <Modal data-test="modal">
          <Dialog role="alertdialog" data-test="dialog">
            {({close}) => (
              <>
                <Heading slot="title">Alert</Heading>
                <Button onPress={close}>Close</Button>
              </>
            )}
          </Dialog>
        </Modal>
      </DialogTrigger>
    );

    let button = getByRole('button');
    await user.click(button);

    let dialog = getByRole('alertdialog');
    let heading = getByRole('heading');
    expect(dialog).toHaveAttribute('aria-labelledby', heading.id);
    expect(dialog).toHaveAttribute('data-test', 'dialog');

    expect(dialog.closest('.react-aria-Modal')).toHaveAttribute('data-test', 'modal');
    expect(dialog.closest('.react-aria-ModalOverlay')).toBeInTheDocument();

    let close = within(dialog).getByRole('button');
    await user.click(close);

    expect(dialog).not.toBeInTheDocument();
  });

  it('works with modal and custom underlay', async () => {
    let {getByRole} = render(
      <DialogTrigger>
        <Button>Delete…</Button>
        <ModalOverlay className="underlay" data-test="underlay">
          <Modal className="modal" data-test="modal">
            <Dialog role="alertdialog" data-test="dialog">
              {({close}) => (
                <>
                  <Heading slot="title">Alert</Heading>
                  <Button onPress={close}>Close</Button>
                </>
              )}
            </Dialog>
          </Modal>
        </ModalOverlay>
      </DialogTrigger>
    );

    let button = getByRole('button');
    await user.click(button);

    let dialog = getByRole('alertdialog');
    let heading = getByRole('heading');
    expect(dialog).toHaveAttribute('aria-labelledby', heading.id);
    expect(dialog).toHaveAttribute('data-test', 'dialog');

    expect(dialog.closest('.modal')).toHaveAttribute('data-test', 'modal');
    expect(dialog.closest('.underlay')).toHaveAttribute('data-test', 'underlay');

    let close = within(dialog).getByRole('button');
    await user.click(close);

    expect(dialog).not.toBeInTheDocument();
  });

  it('has dismiss button when isDismissable', async () => {
    let {getByRole, getByLabelText} = render(
      <DialogTrigger>
        <Button>Delete…</Button>
        <Modal data-test="modal" isDismissable>
          <Dialog role="alertdialog" data-test="dialog">
            {({close}) => (
              <>
                <Heading slot="title">Alert</Heading>
                <Button onPress={close}>Close</Button>
              </>
            )}
          </Dialog>
        </Modal>
      </DialogTrigger>
    );

    let button = getByRole('button');
    await user.click(button);

    let dialog = getByRole('alertdialog');

    let dismiss = getByLabelText('Dismiss');
    await user.click(dismiss);

    expect(dialog).not.toBeInTheDocument();
  });

  it('works with popover', async () => {
    let {getByRole} = render(
      <DialogTrigger>
        <Button aria-label="Help">?⃝</Button>
        <Popover data-test="popover">
          <OverlayArrow data-test="arrow">
            <svg width={12} height={12}><path d="M0 0,L6 6,L12 0" /></svg>
          </OverlayArrow>
          <Dialog data-test="dialog">
            <Heading slot="title">Help</Heading>
            <p>For help accessing your account, please contact support.</p>
          </Dialog>
        </Popover>
      </DialogTrigger>
    );

    let button = getByRole('button');
    expect(button).not.toHaveAttribute('data-pressed');

    await user.click(button);

    expect(button).toHaveAttribute('data-pressed');

    let dialog = getByRole('dialog');
    let heading = getByRole('heading');
    expect(dialog).toHaveAttribute('aria-labelledby', heading.id);
    expect(dialog).toHaveAttribute('data-test', 'dialog');

    let popover = dialog.closest('.react-aria-Popover');
    expect(popover).toHaveStyle('position: absolute');
    expect(popover).toHaveAttribute('data-test', 'popover');

    let arrow = popover.querySelector('.react-aria-OverlayArrow');
    expect(arrow).toHaveStyle('position: absolute');
    expect(arrow).toHaveAttribute('data-test', 'arrow');

    await user.click(document.body);

    expect(dialog).not.toBeInTheDocument();
  });

  it('should get default aria label from trigger', async () => {
    let {getByRole} = render(
      <DialogTrigger>
        <Button>Settings</Button>
        <Popover>
          <Dialog>Test</Dialog>
        </Popover>
      </DialogTrigger>
    );

    let button = getByRole('button');
    await user.click(button);

    let dialog = getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', button.id);

    await user.click(document.body);
    expect(dialog).not.toBeInTheDocument();
  });

  it('should support render props', async () => {
    let {getByRole} = render(
      <DialogTrigger>
        <Button aria-label="Help">?⃝</Button>
        <Popover>
          <Dialog>
            {({close}) => (
              <>
                <Heading slot="title">Help</Heading>
                <p>For help accessing your account, please contact support.</p>
                <Button onPress={() => close()}>Dismiss</Button>
              </>
            )}
          </Dialog>
        </Popover>
      </DialogTrigger>
    );

    let button = getByRole('button');

    await user.click(button);

    let dialog = getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    let dismiss = within(dialog).getByRole('button');

    await user.click(dismiss);

    expect(dialog).not.toBeInTheDocument();
  });

  it('should support Modal being used standalone', async () => {
    let onOpenChange = jest.fn();
    let {getByRole} = render(
      <Modal isDismissable isOpen onOpenChange={onOpenChange}>
        <Dialog aria-label="Modal">A modal</Dialog>
      </Modal>
    );

    let dialog = getByRole('dialog');
    expect(dialog).toHaveTextContent('A modal');

    await user.click(document.body);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('isOpen and defaultOpen should override state from context', async () => {
    let onOpenChange = jest.fn();
    let {getByRole} = render(<>
      <DialogTrigger>
        <Button />
        <Modal isDismissable isOpen onOpenChange={onOpenChange}>
          <Dialog aria-label="Modal">A modal</Dialog>
        </Modal>
      </DialogTrigger>
    </>);

    let dialog = getByRole('dialog');
    expect(dialog).toHaveTextContent('A modal');

    await user.click(document.body);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
