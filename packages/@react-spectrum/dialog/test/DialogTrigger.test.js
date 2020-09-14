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

import {act, fireEvent, render, waitFor, within} from '@testing-library/react';
import {ActionButton, Button} from '@react-spectrum/button';
import {ButtonGroup} from '@react-spectrum/buttongroup';
import {Content} from '@react-spectrum/view';
import {Dialog, DialogTrigger} from '../';
import MatchMediaMock from 'jest-matchmedia-mock';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {TextField} from '@react-spectrum/textfield';
import {theme} from '@react-spectrum/theme-default';
import {triggerPress} from '@react-spectrum/test-utils';
import userEvent from '@testing-library/user-event';


describe('DialogTrigger', function () {
  let matchMedia;
  beforeAll(() => {
    jest.useFakeTimers();
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    matchMedia = new MatchMediaMock();
    // this needs to be a setTimeout so that the dialog can be removed from the dom before the callback is invoked
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => setTimeout(() => cb(), 0));
  });

  afterEach(() => {
    jest.runAllTimers();
    matchMedia.clear();
    window.requestAnimationFrame.mockRestore();
  });

  it('should trigger a modal by default', function () {
    let {getByRole, getByTestId} = render(
      <Provider theme={theme}>
        <DialogTrigger>
          <ActionButton>Trigger</ActionButton>
          <Dialog>contents</Dialog>
        </DialogTrigger>
      </Provider>
    );

    expect(() => {
      getByRole('dialog');
    }).toThrow();

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
    let {getByRole, getByTestId} = render(
      <Provider theme={theme}>
        <DialogTrigger type="tray">
          <ActionButton>Trigger</ActionButton>
          <Dialog>contents</Dialog>
        </DialogTrigger>
      </Provider>
    );

    expect(() => {
      getByRole('dialog');
    }).toThrow();

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
    let {getByRole, getByTestId} = render(
      <Provider theme={theme}>
        <DialogTrigger type="popover">
          <ActionButton>Trigger</ActionButton>
          <Dialog>contents</Dialog>
        </DialogTrigger>
      </Provider>
    );

    expect(() => {
      getByRole('dialog');
    }).toThrow();

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
    matchMedia.useMediaQuery('(max-width: 700px)');
    let {getByRole, getByTestId} = render(
      <Provider theme={theme}>
        <DialogTrigger type="popover">
          <ActionButton>Trigger</ActionButton>
          <Dialog>contents</Dialog>
        </DialogTrigger>
      </Provider>
    );

    expect(() => {
      getByRole('dialog');
    }).toThrow();

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
    matchMedia.useMediaQuery('(max-width: 700px)');
    let {getByRole, getByTestId} = render(
      <Provider theme={theme}>
        <DialogTrigger type="popover" mobileType="tray">
          <ActionButton>Trigger</ActionButton>
          <Dialog>contents</Dialog>
        </DialogTrigger>
      </Provider>
    );

    expect(() => {
      getByRole('dialog');
    }).toThrow();

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
    act(() => {userEvent.click(button);});

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
    let {getByRole} = render(
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

    let dismiss = within(dialog).getByRole('button');
    triggerPress(dismiss);

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(dialog).not.toBeInTheDocument();
    }); // wait for animation

    expect(document.activeElement).toBe(button);
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

    expect(rootProviderRef.current.UNSAFE_getDOMNode()).not.toHaveAttribute('aria-hidden');

    let button = getByRole('button');
    triggerPress(button);

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(getByRole('dialog')).toBeVisible();
    }); // wait for animation

    expect(rootProviderRef.current.UNSAFE_getDOMNode()).toHaveAttribute('aria-hidden', 'true');

    let dialog = getByRole('dialog');
    fireEvent.keyDown(dialog, {key: 'Escape'});
    fireEvent.keyUp(dialog, {key: 'Escape'});

    act(() => {
      jest.runAllTimers();
    });
    await waitFor(() => {
      expect(dialog).not.toBeInTheDocument();
    }); // wait for animation

    expect(rootProviderRef.current.UNSAFE_getDOMNode()).not.toHaveAttribute('aria-hidden');
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
    let {getByRole, rerender} = render(<Test isOpen={false} onOpenChange={onOpenChange} />);

    expect(() => {
      getByRole('dialog');
    }).toThrow();

    let button = getByRole('button');
    triggerPress(button);

    act(() => {
      jest.runAllTimers();
    });

    expect(() => {
      getByRole('dialog');
    }).toThrow();
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
    matchMedia.useMediaQuery('(max-width: 700px)');
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
    let {getByRole} = render(
      <Provider theme={theme}>
        <DialogTrigger isKeyboardDismissDisabled>
          <ActionButton>Trigger</ActionButton>
          <Dialog>Content body</Dialog>
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
  });

  it('should not try to restore focus to the outer dialog when the inner dialog opens', async () => {
    let {getByRole} = render(
      <Provider theme={theme}>
        <TextField id="document-input" aria-label="document input" />
        <DialogTrigger>
          <ActionButton id="outer-trigger">Trigger</ActionButton>
          <Dialog id='outer-dialog'>
            <Content>
              <TextField id="outer-input" aria-label="outer input" autoFocus />
              <DialogTrigger>
                <ActionButton id="inner-trigger">Trigger</ActionButton>
                <Dialog id='inner-dialog'>
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

    act(() => {userEvent.click(document.body);});

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
});
