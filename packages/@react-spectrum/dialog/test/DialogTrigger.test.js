/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, fireEvent, render, triggerPress, waitFor, within} from '@react-spectrum/test-utils';
import {ActionButton, Button} from '@react-spectrum/button';
import {ButtonGroup} from '@react-spectrum/buttongroup';
import {Content} from '@react-spectrum/view';
import {Dialog, DialogTrigger} from '../';
import {Heading} from '@react-spectrum/text';
import {Item, Menu, MenuTrigger} from '@react-spectrum/menu';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {TextField} from '@react-spectrum/textfield';
import {theme} from '@react-spectrum/theme-default';
import userEvent from '@testing-library/user-event';


describe('DialogTrigger', function () {
  let warnMock;
  let windowSpy;
  beforeAll(() => {
    jest.useFakeTimers();
  });
  afterAll(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    windowSpy = jest.spyOn(window.screen, 'width', 'get').mockImplementation(() => 1024);
    if (process.env.STRICT_MODE) {
      warnMock = jest.spyOn(global.console, 'warn').mockImplementation();
    }
  });

  afterEach(() => {
    // Ensure we close any dialogs before unmounting to avoid warning.
    let dialog = document.querySelector('[role="dialog"]');
    if (dialog) {
      fireEvent.keyDown(dialog, {key: 'Escape'});
      fireEvent.keyUp(dialog, {key: 'Escape'});
      act(() => {
        jest.runAllTimers();
      });
    }

    if (process.env.STRICT_MODE && warnMock.mock.calls.length > 0) {
      expect(warnMock).toHaveBeenCalledTimes(1);
      expect(warnMock).toHaveBeenCalledWith('A DialogTrigger unmounted while open. This is likely due to being placed within a trigger that unmounts or inside a conditional. Consider using a DialogContainer instead.');
      warnMock.mockRestore();
    }
  });

  it('should trigger a modal by default', function () {
    let {queryByRole, getByRole, getByTestId} = render(
      <Provider theme={theme}>
        <DialogTrigger>
          <ActionButton>Trigger</ActionButton>
          <Dialog>contents</Dialog>
        </DialogTrigger>
      </Provider>
    );

    expect(queryByRole('dialog')).toBeNull();

    let button = getByRole('button');
    triggerPress(button);

    act(() => {
      jest.runAllTimers();
    });

    let dialog = getByRole('dialog');
    expect(dialog).toBeVisible();

    let modal = getByTestId('modal');
    expect(modal).toBeVisible();
  });

  it('should trigger a tray', function () {
    let {getByRole, queryByRole, getByTestId} = render(
      <Provider theme={theme}>
        <DialogTrigger type="tray">
          <ActionButton>Trigger</ActionButton>
          <Dialog>contents</Dialog>
        </DialogTrigger>
      </Provider>
    );

    expect(queryByRole('dialog')).toBeNull();

    let button = getByRole('button');
    triggerPress(button);

    act(() => {
      jest.runAllTimers();
    });

    let dialog = getByRole('dialog');
    expect(dialog).toBeVisible();

    let tray = getByTestId('tray');
    expect(tray).toBeVisible();
  });

  it('should trigger a popover', function () {
    let {getByRole, queryByRole, getByTestId} = render(
      <Provider theme={theme}>
        <DialogTrigger type="popover">
          <ActionButton>Trigger</ActionButton>
          <Dialog>contents</Dialog>
        </DialogTrigger>
      </Provider>
    );

    expect(queryByRole('dialog')).toBeNull();

    let button = getByRole('button');
    triggerPress(button);

    act(() => {
      jest.runAllTimers();
    });

    let dialog = getByRole('dialog');
    expect(dialog).toBeVisible();

    let popover = getByTestId('popover');
    expect(popover).toBeVisible();
    expect(popover).toHaveAttribute('style');
  });

  it('popovers should be closeable', function () {
    let {getByRole, getByText, queryByRole} = render(
      <Provider theme={theme}>
        <DialogTrigger type="popover">
          <ActionButton>Trigger</ActionButton>
          {(close) => (
            <Dialog>
              contents
              <ButtonGroup>
                <Button variant="secondary" onPress={close}>
                  Cancel
                </Button>
              </ButtonGroup>
            </Dialog>
          )}
        </DialogTrigger>
      </Provider>
    );

    let triggerButton = getByRole('button');
    triggerPress(triggerButton);

    act(() => {
      jest.runAllTimers();
    });

    let dialog = getByRole('dialog');
    expect(dialog).toBeVisible();

    let cancelButton = getByText('Cancel');
    triggerPress(cancelButton);

    act(() => {
      jest.runAllTimers();
    });

    dialog = queryByRole('dialog');
    expect(dialog).toBeNull();
  });

  it('should trigger a modal instead of a popover on mobile', function () {
    windowSpy.mockImplementation(() => 700);
    let {getByRole, queryByRole, getByTestId} = render(
      <Provider theme={theme}>
        <DialogTrigger type="popover">
          <ActionButton>Trigger</ActionButton>
          <Dialog>contents</Dialog>
        </DialogTrigger>
      </Provider>
    );

    expect(queryByRole('dialog')).toBeNull();

    let button = getByRole('button');
    triggerPress(button);

    act(() => {
      jest.runAllTimers();
    });

    let dialog = getByRole('dialog');
    expect(dialog).toBeVisible();

    let modal = getByTestId('modal');
    expect(modal).toBeVisible();
  });

  it('should trigger a tray instead of a popover on mobile if mobileType="tray"', function () {
    windowSpy.mockImplementation(() => 700);
    let {getByRole, queryByRole, getByTestId} = render(
      <Provider theme={theme}>
        <DialogTrigger type="popover" mobileType="tray">
          <ActionButton>Trigger</ActionButton>
          <Dialog>contents</Dialog>
        </DialogTrigger>
      </Provider>
    );

    expect(queryByRole('dialog')).toBeNull();

    let button = getByRole('button');
    triggerPress(button);

    act(() => {
      jest.runAllTimers();
    });

    let dialog = getByRole('dialog');
    expect(dialog).toBeVisible();

    let tray = getByTestId('tray');
    expect(tray).toBeVisible();
  });

  it.each(['modal', 'popover', 'tray'])('contains focus within the dialog when rendered as a %s', function (type) {
    let {getByRole, getByTestId} = render(
      <Provider theme={theme}>
        <DialogTrigger type={type}>
          <ActionButton>Trigger</ActionButton>
          <Dialog>
            <input data-testid="input1" />
            <input data-testid="input2" />
          </Dialog>
        </DialogTrigger>
      </Provider>
    );

    let button = getByRole('button');
    triggerPress(button);

    act(() => {
      jest.runAllTimers();
    });

    let dialog = getByRole('dialog');
    let input1 = getByTestId('input1');
    let input2 = getByTestId('input2');
    expect(document.activeElement).toBe(dialog);

    fireEvent.keyDown(document.activeElement, {key: 'Tab'});
    expect(document.activeElement).toBe(input1);

    fireEvent.keyDown(document.activeElement, {key: 'Tab'});
    expect(document.activeElement).toBe(input2);

    fireEvent.keyDown(document.activeElement, {key: 'Tab'});
    expect(document.activeElement).toBe(input1);
  });

  it('should restore focus to the trigger when the dialog is closed', async function () {
    let {getByRole} = render(
      <Provider theme={theme}>
        <DialogTrigger>
          <ActionButton>Trigger</ActionButton>
          <Dialog>contents</Dialog>
        </DialogTrigger>
      </Provider>
    );

    let button = getByRole('button');
    act(() => {button.focus();});
    fireEvent.focusIn(button);
    userEvent.click(button);

    act(() => {
      jest.runAllTimers();
    });

    let dialog = getByRole('dialog');

    await waitFor(() => {
      expect(dialog).toBeVisible();
    }); // wait for animation

    expect(document.activeElement).toBe(dialog);

    fireEvent.keyDown(dialog, {key: 'Escape'});
    fireEvent.keyUp(dialog, {key: 'Escape'});

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(dialog).not.toBeInTheDocument();
    }); // wait for animation

    // now that it's been unmounted, run the raf callback
    act(() => {
      jest.runAllTimers();
    });

    expect(document.activeElement).toBe(button);
  });

  it('should restore focus to the trigger when the dialog is closed from a hidden dismiss button', async function () {
    let {getByRole, getAllByRole} = render(
      <Provider theme={theme}>
        <DialogTrigger type="popover">
          <ActionButton>Trigger</ActionButton>
          <Dialog>contents</Dialog>
        </DialogTrigger>
      </Provider>
    );

    let button = getByRole('button');
    triggerPress(button);

    act(() => {
      jest.runAllTimers();
    });

    let dialog = getByRole('dialog');

    await waitFor(() => {
      expect(dialog).toBeVisible();
    }); // wait for animation

    expect(document.activeElement).toBe(dialog);

    let dismiss = getAllByRole('button')[0];
    triggerPress(dismiss);

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(dialog).not.toBeInTheDocument();
    }); // wait for animation

    // now that it's been unmounted, run the raf callback
    act(() => {
      jest.runAllTimers();
    });

    expect(document.activeElement).toBe(button);
  });

  it('popovers should be closeable by clicking their trigger while they are open', async function () {
    let onOpenChange = jest.fn();
    let {getByRole} = render(
      <Provider theme={theme}>
        <DialogTrigger onOpenChange={onOpenChange} type="popover">
          <ActionButton>Trigger</ActionButton>
          <Dialog>contents</Dialog>
        </DialogTrigger>
      </Provider>
    );

    let button = getByRole('button');
    triggerPress(button);

    act(() => {
      jest.runAllTimers();
    });

    let dialog = getByRole('dialog');

    await waitFor(() => {
      expect(dialog).toBeVisible();
    }); // wait for animation

    expect(document.activeElement).toBe(dialog);
    expect(onOpenChange).toHaveBeenCalledTimes(1);

    triggerPress(button);

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(dialog).not.toBeInTheDocument();
    }); // wait for animation

    // now that it's been unmounted, run the raf callback
    act(() => {
      jest.runAllTimers();
    });

    expect(document.activeElement).toBe(button);
    expect(onOpenChange).toHaveBeenCalledTimes(2);
  });

  it('should set aria-hidden on parent providers on mount and remove on unmount', async function () {
    let rootProviderRef = React.createRef();
    let {getByRole} = render(
      <Provider theme={theme} ref={rootProviderRef}>
        <DialogTrigger>
          <ActionButton>Trigger</ActionButton>
          <Dialog>contents</Dialog>
        </DialogTrigger>
      </Provider>
    );

    expect(rootProviderRef.current.UNSAFE_getDOMNode().closest('[aria-hidden=true]')).not.toBeInTheDocument();

    let button = getByRole('button');
    triggerPress(button);

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(getByRole('dialog')).toBeVisible();
    }); // wait for animation

    expect(rootProviderRef.current.UNSAFE_getDOMNode().closest('[aria-hidden=true]')).toBeInTheDocument();

    let dialog = getByRole('dialog');
    fireEvent.keyDown(dialog, {key: 'Escape'});
    fireEvent.keyUp(dialog, {key: 'Escape'});

    act(() => {
      jest.runAllTimers();
    });
    await waitFor(() => {
      expect(dialog).not.toBeInTheDocument();
    }); // wait for animation

    expect(rootProviderRef.current.UNSAFE_getDOMNode().closest('[aria-hidden=true]')).not.toBeInTheDocument();
  });

  it('can be controlled', async function () {
    function Test({isOpen, onOpenChange}) {
      return (
        <Provider theme={theme}>
          <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
            <ActionButton>Trigger</ActionButton>
            <Dialog>contents</Dialog>
          </DialogTrigger>
        </Provider>
      );
    }

    let onOpenChange = jest.fn();
    let {getByRole, queryByRole, rerender} = render(<Test isOpen={false} onOpenChange={onOpenChange} />);

    expect(queryByRole('dialog')).toBeNull();

    let button = getByRole('button');
    triggerPress(button);

    act(() => {
      jest.runAllTimers();
    });

    expect(queryByRole('dialog')).toBeNull();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(true);

    rerender(<Test isOpen onOpenChange={onOpenChange} />);

    act(() => {
      jest.runAllTimers();
    });
    let dialog = getByRole('dialog');
    await waitFor(() => {
      expect(dialog).toBeVisible();
    }); // wait for animation

    fireEvent.keyDown(dialog, {key: 'Escape'});
    fireEvent.keyUp(dialog, {key: 'Escape'});

    act(() => {
      jest.runAllTimers();
    });
    expect(dialog).toBeVisible();
    expect(onOpenChange).toHaveBeenCalledTimes(2);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    rerender(<Test isOpen={false} onOpenChange={onOpenChange} />);

    act(() => {
      jest.runAllTimers();
    });
    await waitFor(() => {
      expect(dialog).not.toBeInTheDocument();
    }); // wait for animation
  });

  it('can be uncontrolled with defaultOpen', async function () {
    function Test({defaultOpen, onOpenChange}) {
      return (
        <Provider theme={theme}>
          <DialogTrigger defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
            <ActionButton>Trigger</ActionButton>
            <Dialog>contents</Dialog>
          </DialogTrigger>
        </Provider>
      );
    }

    let onOpenChange = jest.fn();
    let {getByRole} = render(<Test defaultOpen onOpenChange={onOpenChange} />);

    act(() => {
      jest.runAllTimers();
    });

    let dialog = getByRole('dialog');
    await waitFor(() => {
      expect(dialog).toBeVisible();
    }); // wait for animation

    fireEvent.keyDown(dialog, {key: 'Escape'});
    fireEvent.keyUp(dialog, {key: 'Escape'});

    act(() => {
      jest.runAllTimers();
    });
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    await waitFor(() => {
      expect(dialog).not.toBeInTheDocument();
    }); // wait for animation
  });

  it('can be closed by buttons the user adds', async function () {
    function Test({defaultOpen, onOpenChange}) {
      return (
        <Provider theme={theme}>
          <DialogTrigger defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
            <ActionButton>Trigger</ActionButton>
            {(close) => <Dialog>contents<Button variant="primary" data-testid="closebtn" onPress={close}>Close</Button></Dialog>}
          </DialogTrigger>
        </Provider>
      );
    }

    let onOpenChange = jest.fn();
    let {getByRole, getByTestId} = render(<Test defaultOpen onOpenChange={onOpenChange} />);

    act(() => {
      jest.runAllTimers();
    });

    let dialog = getByRole('dialog');
    let closeBtn = getByTestId('closebtn');
    await waitFor(() => {
      expect(dialog).toBeVisible();
    }); // wait for animation

    triggerPress(closeBtn);
    expect(dialog).toBeVisible();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(dialog).not.toBeInTheDocument();
    }); // wait for animation
  });

  it('can be closed by dismiss button in dialog', async function () {
    function Test({defaultOpen, onOpenChange}) {
      return (
        <Provider theme={theme}>
          <DialogTrigger isDismissable defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
            <ActionButton>Trigger</ActionButton>
            <Dialog>contents</Dialog>
          </DialogTrigger>
        </Provider>
      );
    }

    let onOpenChange = jest.fn();
    let {getByRole, getByLabelText} = render(<Test defaultOpen onOpenChange={onOpenChange} />);

    act(() => {
      jest.runAllTimers();
    });

    let dialog = getByRole('dialog');
    await waitFor(() => {
      expect(dialog).toBeVisible();
    }); // wait for animation

    let closeButton = getByLabelText('Dismiss');
    triggerPress(closeButton);
    expect(dialog).toBeVisible();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(dialog).not.toBeInTheDocument();
    }); // wait for animation
  });

  it('dismissable modals can be closed by clicking outside the dialog', async function () {
    function Test({defaultOpen, onOpenChange}) {
      return (
        <Provider theme={theme}>
          <DialogTrigger type="modal" isDismissable defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
            <ActionButton>Trigger</ActionButton>
            <Dialog>contents</Dialog>
          </DialogTrigger>
        </Provider>
      );
    }

    let onOpenChange = jest.fn();
    let {getByRole} = render(<Test defaultOpen onOpenChange={onOpenChange} />);

    act(() => {
      jest.runAllTimers();
    });

    let dialog = getByRole('dialog');
    await waitFor(() => {
      expect(dialog).toBeVisible();
    }); // wait for animation

    triggerPress(document.body);
    expect(dialog).toBeVisible();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(dialog).not.toBeInTheDocument();
    }); // wait for animation
  });

  it('non dismissable modals cannot be closed by clicking outside the dialog', async function () {
    function Test({defaultOpen, onOpenChange}) {
      return (
        <Provider theme={theme}>
          <DialogTrigger type="modal" defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
            <ActionButton>Trigger</ActionButton>
            <Dialog>contents</Dialog>
          </DialogTrigger>
        </Provider>
      );
    }

    let onOpenChange = jest.fn();
    let {getByRole} = render(<Test defaultOpen onOpenChange={onOpenChange} />);

    act(() => {
      jest.runAllTimers();
    });

    let dialog = getByRole('dialog');
    await waitFor(() => {
      expect(dialog).toBeVisible();
    }); // wait for animation

    triggerPress(document.body);
    act(() => {
      jest.runAllTimers();
    });
    expect(dialog).toBeVisible();
    expect(onOpenChange).toHaveBeenCalledTimes(0);
  });

  it('mobile type modals should be closable by clicking outside the modal', async function () {
    windowSpy.mockImplementation(() => 700);
    function Test({defaultOpen, onOpenChange}) {
      return (
        <Provider theme={theme}>
          <DialogTrigger type="popover" mobileType="modal" defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
            <ActionButton>Trigger</ActionButton>
            <Dialog>contents</Dialog>
          </DialogTrigger>
        </Provider>
      );
    }

    let onOpenChange = jest.fn();
    let {getByTestId} = render(<Test defaultOpen onOpenChange={onOpenChange} />);

    act(() => {
      jest.runAllTimers();
    });

    let modal = getByTestId('modal');
    await waitFor(() => {
      expect(modal).toBeVisible();
    }); // wait for animation

    triggerPress(document.body);
    expect(modal).toBeVisible();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(modal).not.toBeInTheDocument();
    }); // wait for animation
  });

  it('non-modals can be closed by clicking outside the dialog regardless of isDismissable', async function () {
    function Test({defaultOpen, onOpenChange}) {
      return (
        <Provider theme={theme}>
          <DialogTrigger type="popover" defaultOpen={defaultOpen} onOpenChange={onOpenChange} isDismissable={false}>
            <ActionButton>Trigger</ActionButton>
            <Dialog>contents</Dialog>
          </DialogTrigger>
        </Provider>
      );
    }

    let onOpenChange = jest.fn();
    let {getByRole} = render(<Test defaultOpen onOpenChange={onOpenChange} />);

    act(() => {
      jest.runAllTimers();
    });

    let dialog = getByRole('dialog');
    expect(dialog).toBeVisible();
    await waitFor(() => {
      expect(dialog).toBeVisible();
    }); // wait for animation
    triggerPress(document.body);
    expect(dialog).toBeVisible();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(dialog).not.toBeInTheDocument();
    }); // wait for animation
  });

  it('disable closing dialog via escape key', async function () {
    let {queryByRole, getByRole} = render(
      <Provider theme={theme}>
        <DialogTrigger isKeyboardDismissDisabled>
          <ActionButton>Trigger</ActionButton>
          {close => <Dialog><ActionButton onPress={close}>Close</ActionButton></Dialog>}
        </DialogTrigger>
      </Provider>
    );

    let button = getByRole('button');
    triggerPress(button);

    act(() => {
      jest.runAllTimers();
    });

    let dialog = getByRole('dialog');

    await waitFor(() => {
      expect(dialog).toBeVisible();
    }); // wait for animation

    expect(document.activeElement).toBe(dialog);

    fireEvent.keyDown(dialog, {key: 'Escape'});
    fireEvent.keyUp(dialog, {key: 'Escape'});

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(dialog).toBeInTheDocument();
    }); // wait for animation

    expect(document.activeElement).toBe(dialog);

    // Close the dialog by clicking the button inside
    button = within(dialog).getByRole('button');
    triggerPress(button);
    act(() => {
      jest.runAllTimers();
    });

    expect(queryByRole('dialog')).toBeNull();
  });

  it('should warn when unmounting a dialog trigger while a modal is open', function () {
    let warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    let {getByRole, queryByRole} = render(
      <Provider theme={theme}>
        <MenuTrigger>
          <ActionButton>Trigger</ActionButton>
          <Menu>
            <DialogTrigger isKeyboardDismissDisabled>
              <Item>Open menu</Item>
              <Dialog>Content body</Dialog>
            </DialogTrigger>
          </Menu>
        </MenuTrigger>
      </Provider>
    );

    let button = getByRole('button');

    triggerPress(button);
    act(() => {
      jest.runAllTimers();
    });

    let menu = getByRole('menu');
    let menuitem = within(menu).getByRole('menuitem');

    triggerPress(menuitem);
    act(() => {
      jest.runAllTimers();
    });

    expect(queryByRole('menu')).toBeNull();
    expect(queryByRole('menuitem')).toBeNull();
    expect(queryByRole('dialog')).toBeNull();

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith('A DialogTrigger unmounted while open. This is likely due to being placed within a trigger that unmounts or inside a conditional. Consider using a DialogContainer instead.');
  });

  it('should not try to restore focus to the outer dialog when the inner dialog opens', async () => {
    let {getByRole} = render(
      <Provider theme={theme}>
        <TextField id="document-input" aria-label="document input" />
        <DialogTrigger>
          <ActionButton id="outer-trigger">Trigger</ActionButton>
          <Dialog id="outer-dialog">
            <Content>
              <TextField id="outer-input" aria-label="outer input" autoFocus />
              <DialogTrigger>
                <ActionButton id="inner-trigger">Trigger</ActionButton>
                <Dialog id="inner-dialog">
                  <Content>
                    <TextField id="inner-input" aria-label="outer input" autoFocus />
                  </Content>
                </Dialog>
              </DialogTrigger>
            </Content>
          </Dialog>
        </DialogTrigger>
      </Provider>
    );
    let button = getByRole('button');
    triggerPress(button);

    act(() => {
      jest.runAllTimers();
    });

    let outerDialog = getByRole('dialog');

    await waitFor(() => {
      expect(outerDialog).toBeVisible();
    }); // wait for animation
    let outerButton = getByRole('button');
    let outerInput = getByRole('textbox');

    expect(document.activeElement).toBe(outerInput);
    triggerPress(outerButton);

    act(() => {
      jest.runAllTimers();
    });

    let innerDialog = getByRole('dialog');

    await waitFor(() => {
      expect(innerDialog).toBeVisible();
    }); // wait for animation

    let innerInput = getByRole('textbox');

    expect(document.activeElement).toBe(innerInput);

    userEvent.click(document.body);

    act(() => {
      jest.runAllTimers();
    });

    expect(document.activeElement).toBe(innerInput);

    let outsideInput = document.getElementById('document-input');
    act(() => {outsideInput.focus();});
    act(() => {
      jest.runAllTimers();
    });
    expect(document.activeElement).toBe(innerInput);
  });

  it('input in nested popover should be interactive with a click', async () => {
    let {getByRole, getByText, getByLabelText} = render(
      <Provider theme={theme}>
        <TextField id="document-input" aria-label="document input" />
        <DialogTrigger type="popover">
          <ActionButton id="outer-trigger">Trigger1</ActionButton>
          <Dialog id="outer-dialog">
            <Content>
              <TextField id="outer-input" aria-label="outer input" />
              <DialogTrigger type="popover">
                <ActionButton id="inner-trigger">Trigger2</ActionButton>
                <Dialog id="inner-dialog">
                  <Content>
                    <TextField id="inner-input" label="inner input" />
                  </Content>
                </Dialog>
              </DialogTrigger>
            </Content>
          </Dialog>
        </DialogTrigger>
      </Provider>
    );
    let button = getByRole('button');
    triggerPress(button);

    act(() => {
      jest.runAllTimers();
    });

    let outerDialog = getByRole('dialog');

    await waitFor(() => {
      expect(outerDialog).toBeVisible();
    }); // wait for animation
    let outerButton = getByText('Trigger2');


    triggerPress(outerButton);

    act(() => {
      jest.runAllTimers();
    });

    let innerDialog = getByRole('dialog');

    await waitFor(() => {
      expect(innerDialog).toBeVisible();
    }); // wait for animation

    let innerInput = getByLabelText('inner input');
    expect(getByLabelText('inner input')).toBeVisible();
    userEvent.click(innerInput);

    expect(document.activeElement).toBe(innerInput);
  });

  it('will not lose focus to body', async () => {
    let {getByRole, getByTestId} = render(
      <Provider theme={theme}>
        <DialogTrigger type="popover">
          <ActionButton>Trigger</ActionButton>
          <Dialog>
            <Heading>The Heading</Heading>
            <Content>
              <MenuTrigger>
                <ActionButton data-testid="innerButton">Test</ActionButton>
                <Menu autoFocus="first">
                  <Item>Item 1</Item>
                  <Item>Item 2</Item>
                  <Item>Item 3</Item>
                </Menu>
              </MenuTrigger>
            </Content>
          </Dialog>
        </DialogTrigger>
      </Provider>
    );
    let button = getByRole('button');
    triggerPress(button);

    act(() => {
      jest.runAllTimers();
    });

    let outerDialog = getByRole('dialog');

    await waitFor(() => {
      expect(outerDialog).toBeVisible();
    }); // wait for animation
    let innerButton = getByTestId('innerButton');
    // Focus manually - userEvent.tab is buggy when starting from an element with tabIndex="-1"
    act(() => innerButton.focus());
    fireEvent.keyDown(document.activeElement, {key: 'Enter'});
    fireEvent.keyUp(document.activeElement, {key: 'Enter'});

    act(() => {
      jest.runAllTimers();
    });
    userEvent.tab();
    act(() => {
      jest.runAllTimers();
    });

    expect(document.activeElement).toBe(innerButton);
  });

});
