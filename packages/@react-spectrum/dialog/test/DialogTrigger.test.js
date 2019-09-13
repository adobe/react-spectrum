import {ActionButton} from '@react-spectrum/button';
import {cleanup, fireEvent, render, waitForDomChange} from '@testing-library/react';
import {Dialog, DialogTrigger} from '../';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';
import {triggerPress} from '@react-spectrum/button/test/utils';

let theme = {
  light: themeLight,
  medium: scaleMedium
};

describe('DialogTrigger', function () {
  afterEach(cleanup);

  beforeEach(() => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());
  });
  
  afterEach(() => {
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

    let dialog = getByRole('dialog');
    expect(dialog).toBeVisible();

    let popover = getByTestId('popover');
    expect(popover).toBeVisible();
    expect(popover).toHaveAttribute('style');
  });

  it('should trigger a modal instead of a popover on mobile', function () {
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn()
    }));

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

    let dialog = getByRole('dialog');
    expect(dialog).toBeVisible();

    let modal = getByTestId('modal');
    expect(modal).toBeVisible();
  });

  it('should trigger a tray instead of a popover on mobile if mobileType="tray"', function () {
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn()
    }));

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
    triggerPress(button);

    let dialog = getByRole('dialog');
    await waitForDomChange(); // wait for animation
    expect(document.activeElement).toBe(dialog);

    fireEvent.keyDown(dialog, {key: 'Escape'});
    await waitForDomChange(); // wait for animation
    expect(dialog).not.toBeInTheDocument();
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

    expect(rootProviderRef.current).not.toHaveAttribute('aria-hidden');

    let button = getByRole('button');
    triggerPress(button);
    await waitForDomChange(); // wait for animation

    expect(rootProviderRef.current).toHaveAttribute('aria-hidden', 'true');

    let dialog = getByRole('dialog');
    fireEvent.keyDown(dialog, {key: 'Escape'});
    await waitForDomChange(); // wait for animation

    expect(rootProviderRef.current).not.toHaveAttribute('aria-hidden');
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

    expect(() => {
      getByRole('dialog');
    }).toThrow();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(true);

    rerender(<Test isOpen onOpenChange={onOpenChange} />);

    let dialog = getByRole('dialog');
    expect(dialog).toBeVisible();
    await waitForDomChange(); // wait for animation

    fireEvent.keyDown(dialog, {key: 'Escape'});
    expect(dialog).toBeVisible();
    expect(onOpenChange).toHaveBeenCalledTimes(2);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    rerender(<Test isOpen={false} onOpenChange={onOpenChange} />);
    await waitForDomChange(); // wait for animation

    expect(() => {
      getByRole('dialog');
    }).toThrow();
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

    let dialog = getByRole('dialog');
    expect(dialog).toBeVisible();
    await waitForDomChange(); // wait for animation

    fireEvent.keyDown(dialog, {key: 'Escape'});
    expect(dialog).toBeVisible();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    await waitForDomChange(); // wait for animation

    expect(() => {
      getByRole('dialog');
    }).toThrow();
  });
});
