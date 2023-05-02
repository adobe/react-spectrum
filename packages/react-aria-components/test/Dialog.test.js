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
import React from 'react';
import {render, within} from '@react-spectrum/test-utils';
import userEvent from '@testing-library/user-event';

describe('Dialog', () => {
  it('works with modal', () => {
    let {getByRole} = render(
      <DialogTrigger>
        <Button>Delete…</Button>
        <Modal data-test="modal">
          <Dialog role="alertdialog" data-test="dialog">
            {({close}) => (
              <>
                <Heading>Alert</Heading>
                <Button onPress={close}>Close</Button>
              </>
            )}
          </Dialog>
        </Modal>
      </DialogTrigger>
    );

    let button = getByRole('button');
    userEvent.click(button);

    let dialog = getByRole('alertdialog');
    let heading = getByRole('heading');
    expect(dialog).toHaveAttribute('aria-labelledby', heading.id);
    expect(dialog).toHaveAttribute('data-test', 'dialog');

    expect(dialog.closest('.react-aria-Modal')).toHaveAttribute('data-test', 'modal');
    expect(dialog.closest('.react-aria-ModalOverlay')).toBeInTheDocument();

    let close = within(dialog).getByRole('button');
    userEvent.click(close);

    expect(dialog).not.toBeInTheDocument();
  });

  it('works with modal and custom underlay', () => {
    let {getByRole} = render(
      <DialogTrigger>
        <Button>Delete…</Button>
        <ModalOverlay className="underlay" data-test="underlay">
          <Modal className="modal" data-test="modal">
            <Dialog role="alertdialog" data-test="dialog">
              {({close}) => (
                <>
                  <Heading>Alert</Heading>
                  <Button onPress={close}>Close</Button>
                </>
              )}
            </Dialog>
          </Modal>
        </ModalOverlay>
      </DialogTrigger>
    );

    let button = getByRole('button');
    userEvent.click(button);

    let dialog = getByRole('alertdialog');
    let heading = getByRole('heading');
    expect(dialog).toHaveAttribute('aria-labelledby', heading.id);
    expect(dialog).toHaveAttribute('data-test', 'dialog');

    expect(dialog.closest('.modal')).toHaveAttribute('data-test', 'modal');
    expect(dialog.closest('.underlay')).toHaveAttribute('data-test', 'underlay');

    let close = within(dialog).getByRole('button');
    userEvent.click(close);

    expect(dialog).not.toBeInTheDocument();
  });

  it('has dismiss button when isDismissable', () => {
    let {getByRole, getByLabelText} = render(
      <DialogTrigger>
        <Button>Delete…</Button>
        <Modal data-test="modal" isDismissable>
          <Dialog role="alertdialog" data-test="dialog">
            {({close}) => (
              <>
                <Heading>Alert</Heading>
                <Button onPress={close}>Close</Button>
              </>
            )}
          </Dialog>
        </Modal>
      </DialogTrigger>
    );

    let button = getByRole('button');
    userEvent.click(button);

    let dialog = getByRole('alertdialog');

    let dismiss = getByLabelText('Dismiss');
    userEvent.click(dismiss);

    expect(dialog).not.toBeInTheDocument();
  });

  it('works with popover', () => {
    let {getByRole} = render(
      <DialogTrigger>
        <Button aria-label="Help">?⃝</Button>
        <Popover data-test="popover">
          <OverlayArrow data-test="arrow">
            <svg width={12} height={12}><path d="M0 0,L6 6,L12 0" /></svg>
          </OverlayArrow>
          <Dialog data-test="dialog">
            <Heading>Help</Heading>
            <p>For help accessing your account, please contact support.</p>
          </Dialog>
        </Popover>
      </DialogTrigger>
    );

    let button = getByRole('button');
    expect(button).not.toHaveAttribute('data-pressed');

    userEvent.click(button);

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

    userEvent.click(document.body);

    expect(dialog).not.toBeInTheDocument();
  });

  it('should support render props', () => {
    let {getByRole} = render(
      <DialogTrigger>
        <Button aria-label="Help">?⃝</Button>
        <Popover>
          <Dialog>
            {({close}) => (
              <>
                <Heading>Help</Heading>
                <p>For help accessing your account, please contact support.</p>
                <Button onPress={() => close()}>Dismiss</Button>
              </>
            )}
          </Dialog>
        </Popover>
      </DialogTrigger>
    );

    let button = getByRole('button');

    userEvent.click(button);

    let dialog = getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    let dismiss = within(dialog).getByRole('button');

    userEvent.click(dismiss);

    expect(dialog).not.toBeInTheDocument();
  });
});
