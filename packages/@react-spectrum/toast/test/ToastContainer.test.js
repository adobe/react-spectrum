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

import {act, fireEvent, installPointerEvent, pointerMap, render, within} from '@react-spectrum/test-utils-internal';
import {Button} from '@react-spectrum/button';
import {clearToastQueue, ToastContainer, ToastQueue} from '../src/ToastContainer';
import {defaultTheme} from '@adobe/react-spectrum';
import {Provider} from '@react-spectrum/provider';
import React, {useState} from 'react';
import userEvent from '@testing-library/user-event';

function pointerEvent(type, opts) {
  let evt = new Event(type, {bubbles: true, cancelable: true});
  Object.assign(evt, {
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    button: opts.button || 0
  }, opts);
  return evt;
}

function RenderToastButton(props = {}) {
  return (
    <div>
      <Button
        onPress={() => ToastQueue[props.variant || 'neutral']('Toast is default', props)}
        variant="primary">
        Show Default Toast
      </Button>
    </div>
  );
}

function renderComponent(contents) {
  return render(
    <Provider theme={defaultTheme}>
      <ToastContainer />
      {contents}
    </Provider>
  );
}

describe('Toast Provider and Container', function () {
  installPointerEvent();

  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  beforeEach(() => {
    jest.useFakeTimers();
    clearToastQueue();
  });

  afterEach(() => {
    act(() => jest.runAllTimers());
  });

  it('renders a button that triggers a toast', async () => {
    let {getByRole, queryByRole} = renderComponent(<RenderToastButton />);
    let button = getByRole('button');

    expect(queryByRole('alertdialog')).toBeNull();
    expect(queryByRole('alert')).toBeNull();
    await user.click(button);

    act(() => jest.advanceTimersByTime(100));

    let region = getByRole('region');
    expect(region).toHaveAttribute('aria-label', '1 notification.');

    let toast = getByRole('alertdialog');
    let alert = within(toast).getByRole('alert');
    expect(toast).toBeVisible();
    expect(alert).toBeVisible();

    button = within(toast).getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Close');
    await user.click(button);

    expect(queryByRole('alertdialog')).toBeNull();
    expect(queryByRole('alert')).toBeNull();
  });

  it('supports testid prop', async () => {
    const testid = 'toast-container';
    const domProps = {
      'data-testid': testid
    };
    let {getByRole, queryByTestId, getByTestId, queryByText} = renderComponent(<RenderToastButton {...domProps} />);
    let button = getByRole('button');

    expect(queryByTestId(testid)).toBeNull();
    await user.click(button);
    expect(getByTestId(testid)).not.toBeNull();
    expect(queryByText(/Show Default Toast/)).not.toBeNull();
  });

  it('should label icon by variant', async () => {
    let {getByRole} = renderComponent(<RenderToastButton variant="positive" />);
    let button = getByRole('button');
    await user.click(button);

    act(() => jest.advanceTimersByTime(100));
    let toast = getByRole('alertdialog');
    let alert = within(toast).getByRole('alert');
    let icon = within(alert).getByRole('img');
    expect(icon).toHaveAttribute('aria-label', 'Success');
    let title = within(alert).getByText('Toast is default');
    expect(toast).toHaveAttribute('aria-labelledby', `${title.id}`);
  });

  it('removes a toast via timeout', async () => {
    let {getByRole, queryByRole} = renderComponent(<RenderToastButton timeout={5000} />);
    let button = getByRole('button');

    await user.click(button);

    let toast = getByRole('alertdialog');
    expect(toast).toBeVisible();

    act(() => jest.advanceTimersByTime(1000));

    act(() => jest.advanceTimersByTime(5000));

    expect(queryByRole('alertdialog')).toBeNull();
  });

  it('pauses timers when hovering', async () => {
    let {getByRole, queryByRole} = renderComponent(<RenderToastButton timeout={5000} />);
    let button = getByRole('button');

    await user.click(button);

    let toast = getByRole('alertdialog');
    expect(toast).toBeVisible();

    act(() => jest.advanceTimersByTime(1000));
    await user.hover(toast);

    act(() => jest.advanceTimersByTime(7000));

    await user.unhover(toast);

    act(() => jest.advanceTimersByTime(4000));

    expect(queryByRole('alertdialog')).toBeNull();
  });

  it('pauses timers when focusing', async () => {
    let {getByRole, queryByRole} = renderComponent(<RenderToastButton timeout={5000} />);
    let button = getByRole('button');

    await user.click(button);

    let toast = getByRole('alertdialog');
    expect(toast).toBeVisible();

    act(() => jest.advanceTimersByTime(1000));
    act(() => within(toast).getByRole('button').focus());

    act(() => jest.advanceTimersByTime(7000));

    act(() => within(toast).getByRole('button').blur());

    act(() => jest.advanceTimersByTime(4000));

    expect(queryByRole('alertdialog')).toBeNull();
  });

  it('renders a toast with an action', async () => {
    let onAction = jest.fn();
    let onClose = jest.fn();
    let {getByRole, queryByRole} = renderComponent(<RenderToastButton actionLabel="Action" onAction={onAction} onClose={onClose} />);
    let button = getByRole('button');

    expect(queryByRole('alertdialog')).toBeNull();
    await user.click(button);

    act(() => jest.advanceTimersByTime(100));
    let toast = getByRole('alertdialog');
    let alert = within(toast).getByRole('alert');
    expect(toast).toBeVisible();
    expect(alert).toBeVisible();

    let buttons = within(toast).getAllByRole('button');
    expect(buttons[0]).toHaveTextContent('Action');
    await user.click(buttons[0]);

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes toast on action', async () => {
    let onAction = jest.fn();
    let onClose = jest.fn();
    let {getByRole, queryByRole} = renderComponent(<RenderToastButton actionLabel="Action" onAction={onAction} onClose={onClose} shouldCloseOnAction />);
    let button = getByRole('button');

    expect(queryByRole('alertdialog')).toBeNull();
    await user.click(button);

    act(() => jest.advanceTimersByTime(100));
    let toast = getByRole('alertdialog');
    let alert = within(toast).getByRole('alert');
    expect(toast).toBeVisible();
    expect(alert).toBeVisible();

    let buttons = within(toast).getAllByRole('button');
    expect(buttons[0]).toHaveTextContent('Action');
    await user.click(buttons[0]);

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);

    expect(queryByRole('alertdialog')).toBeNull();
  });

  it('can focus toast region using F6', async () => {
    let {getByRole} = renderComponent(<RenderToastButton timeout={5000} />);
    let button = getByRole('button');

    await user.click(button);

    let toast = getByRole('alertdialog');
    expect(toast).toBeVisible();

    expect(document.activeElement).toBe(button);
    fireEvent.keyDown(button, {key: 'F6'});
    fireEvent.keyUp(button, {key: 'F6'});

    let region = getByRole('region');
    expect(document.activeElement).toBe(region);
  });

  it('should restore focus when a toast exits', async () => {
    let {getByRole, queryByRole} = renderComponent(<RenderToastButton />);
    let button = getByRole('button');

    await user.click(button);

    let toast = getByRole('alertdialog');
    let closeButton = within(toast).getByRole('button');

    await user.click(closeButton);
    expect(queryByRole('alertdialog')).toBeNull();
    expect(button).toHaveFocus();
  });

  it('should move focus to remaining toast when a toast exits and there are more', async () => {
    let {getAllByRole, getByRole, queryByRole} = renderComponent(<RenderToastButton />);
    let button = getByRole('button');

    await user.click(button);
    await user.click(button);

    let toast = getAllByRole('alertdialog')[0];
    let closeButton = within(toast).getByRole('button');
    await user.click(closeButton);

    toast = getByRole('alertdialog');
    expect(document.activeElement).toBe(toast);

    closeButton = within(toast).getByRole('button');
    await user.click(closeButton);

    expect(queryByRole('alertdialog')).toBeNull();
    expect(document.activeElement).toBe(button);
  });

  it('should move focus from the last toast to remaining toast when a the last toast is closed', async () => {
    let {getAllByRole, getByRole, queryByRole} = renderComponent(<RenderToastButton />);
    let button = getByRole('button');

    await user.click(button);
    await user.click(button);

    let toast = getAllByRole('alertdialog')[1];
    let closeButton = within(toast).getByRole('button');
    await user.click(closeButton);

    toast = getByRole('alertdialog');
    expect(document.activeElement).toBe(toast);

    closeButton = within(toast).getByRole('button');
    await user.click(closeButton);

    expect(queryByRole('alertdialog')).toBeNull();
    expect(document.activeElement).toBe(button);
  });

  it('should support programmatically closing toasts', async () => {
    function ToastToggle() {
      let [close, setClose] = useState(null);

      return (
        <Button
          onPress={() => {
            if (close) {
              setClose(close());
            } else {
              let close = ToastQueue.positive('Toast is done!');
              setClose(() => close);
            }
          }}
          variant="primary">
          {close ? 'Hide' : 'Show'} Toast
        </Button>
      );
    }

    let {getByRole, queryByRole} = renderComponent(<ToastToggle />);
    let button = getByRole('button');

    await user.click(button);

    act(() => jest.advanceTimersByTime(100));
    let toast = getByRole('alertdialog');
    let alert = within(toast).getByRole('alert');
    expect(toast).toBeVisible();
    expect(alert).toBeVisible();

    await user.click(button);
    expect(queryByRole('alertdialog')).toBeNull();
    expect(queryByRole('alert')).toBeNull();
  });

  it('should only render one ToastContainer', async () => {
    let {getByRole, getAllByRole, rerender} = render(
      <Provider theme={defaultTheme}>
        <ToastContainer key="first" />
        <ToastContainer key="second" />
        <RenderToastButton />
      </Provider>
    );

    let button = getByRole('button');
    await user.click(button);

    act(() => jest.advanceTimersByTime(100));
    expect(getAllByRole('region')).toHaveLength(1);
    expect(getAllByRole('alert')).toHaveLength(1);

    rerender(
      <Provider theme={defaultTheme}>
        <ToastContainer key="second" />
        <RenderToastButton />
      </Provider>
    );

    act(() => jest.advanceTimersByTime(100));
    expect(getAllByRole('region')).toHaveLength(1);
    expect(getAllByRole('alert')).toHaveLength(1);

    rerender(
      <Provider theme={defaultTheme}>
        <ToastContainer key="first" />
        <RenderToastButton />
      </Provider>
    );

    act(() => jest.advanceTimersByTime(100));
    expect(getAllByRole('region')).toHaveLength(1);
    expect(getAllByRole('alert')).toHaveLength(1);

    rerender(
      <Provider theme={defaultTheme}>
        <ToastContainer key="first" />
        <ToastContainer key="second" />
        <RenderToastButton />
      </Provider>
    );

    act(() => jest.advanceTimersByTime(100));
    expect(getAllByRole('region')).toHaveLength(1);
    expect(getAllByRole('alert')).toHaveLength(1);
  });

  it('should support custom toast events', async () => {
    let {getByRole, queryByRole} = renderComponent(<RenderToastButton />);

    let onToast = jest.fn().mockImplementation(e => e.preventDefault());
    window.addEventListener('react-spectrum-toast', onToast);

    let button = getByRole('button');
    await user.click(button);

    expect(queryByRole('alert')).toBeNull();
    expect(onToast).toHaveBeenCalledTimes(1);
    expect(onToast.mock.calls[0][0].detail).toEqual({
      children: 'Toast is default',
      variant: 'neutral',
      options: {}
    });

    window.removeEventListener('react-spectrum-toast', onToast);
  });

  it('should support custom aria-label', async () => {
    let {getByRole} = render(
      <Provider theme={defaultTheme}>
        <ToastContainer aria-label="Toasts" />
        <RenderToastButton />
      </Provider>
    );

    let button = getByRole('button');
    await user.click(button);

    let region = getByRole('region');
    expect(region).toHaveAttribute('aria-label', 'Toasts');
  });

  // TODO
  it.skip('resumes timers if user closes the top toast while hovered and pointer ends up outside region', async () => {
    // Mock getBoundingClientRect so we can simulate the toast region shrinking
    let boundingRect = {
      left: 0, top: 0, width: 300, height: 300,
      right: 300, bottom: 300, x: 0, y: 0,
      toJSON() {}
    };
    let rectSpy = jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(() => boundingRect);

    let {getAllByRole, getByRole} = render(
      <Provider theme={defaultTheme}>
        <ToastContainer />
        <Button onPress={() => ToastQueue.neutral('Test toast', {timeout: 5000})}>
          Show Toast
        </Button>
      </Provider>
    );

    let button = getByRole('button');

    await user.click(button);
    await user.click(button);

    let toasts = getAllByRole('alertdialog');
    expect(toasts).toHaveLength(2);

    // Advance timeout by 1s
    act(() => jest.advanceTimersByTime(1000));

    // Simulate hover over the toast region (causing timers to pause)
    let region = getByRole('region');
    fireEvent(region, pointerEvent('pointerenter', {pointerType: 'mouse'}));
    fireEvent(region, pointerEvent('pointermove', {pointerType: 'mouse'}));

    // Timeout shouldn't expire since we're paused
    act(() => jest.advanceTimersByTime(6000));
    expect(toasts).toHaveLength(2);

    // Close the top toast
    let closeButton = within(toasts[0]).getByRole('button');
    await user.click(closeButton);
    fireAnimationEnd(toasts[0]);

    // Simulate the toast region shrinking so that the pointer is outside
    boundingRect = {
      left: 0, top: 0, width: 100, height: 100,
      right: 100, bottom: 100, x: 0, y: 0,
      toJSON() {}
    };

    expect(getAllByRole('alertdialog')).toHaveLength(1);

    // Let the timeout expire
    act(() => jest.advanceTimersByTime(5000));
    fireAnimationEnd(toasts[0]);

    expect(getAllByRole('alertdialog')).toHaveLength(0);

    rectSpy.mockRestore();
  });

  // TODO
  it.skip('resumes timers if a toast is closed after no pointermove event (i.e. touch) ', async () => {
    let {getAllByRole, getByRole} = render(
      <Provider theme={defaultTheme}>
        <ToastContainer />
        <Button onPress={() => ToastQueue.info('Another toast', {timeout: 5000})}>
          Show Toast
        </Button>
      </Provider>
    );

    let button = getByRole('button');

    await user.click(button);
    await user.click(button);
    let toasts = getAllByRole('alertdialog');
    expect(toasts).toHaveLength(2);

    // Advance timeout by 1s
    act(() => jest.advanceTimersByTime(1000));

    let closeButton = within(toasts[0]).getByRole('button');
    await user.click(closeButton);
    fireAnimationEnd(toasts[0]);

    expect(getAllByRole('alertdialog')).toHaveLength(1);

    // Advance timer so the second toast times out.
    act(() => jest.advanceTimersByTime(6000));
    fireAnimationEnd(toasts[0]);

    toasts = getAllByRole('alertdialog');
    expect(toasts).toHaveLength(1);

    expect(getAllByRole('alertdialog')).toHaveLength(0);
  });
});
