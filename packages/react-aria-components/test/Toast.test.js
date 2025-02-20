/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, installPointerEvent, pointerMap, render, within} from '@react-spectrum/test-utils-internal';
import {Button, Text, UNSTABLE_Toast as Toast, UNSTABLE_ToastContent as ToastContent, UNSTABLE_ToastQueue as ToastQueue, UNSTABLE_ToastRegion as ToastRegion} from 'react-aria-components';
import React from 'react';
import userEvent from '@testing-library/user-event';

function Example(options) {
  const queue = new ToastQueue();
  return (
    <>
      <ToastRegion queue={queue}>
        {({toast}) => (
          <Toast toast={toast}>
            <ToastContent>
              <Text slot="title">{toast.content.title}</Text>
              <Text slot="description">{toast.content.description}</Text>
            </ToastContent>
            <Button slot="close">x</Button>
          </Toast>
        )}
      </ToastRegion>
      <Button onPress={() => queue.add({title: 'Toast', description: 'Description'}, options)}>Toast</Button>
    </>
  );
}

describe('Toast', () => {
  installPointerEvent();

  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => jest.runAllTimers());
  });

  it('should trigger a toast', async () => {
    let {getByRole, queryByRole} = render(<Example />);

    let button = getByRole('button');

    expect(queryByRole('alertdialog')).toBeNull();
    expect(queryByRole('alert')).toBeNull();
    await user.click(button);

    act(() => jest.advanceTimersByTime(100));

    let region = getByRole('region');
    expect(region).toHaveAttribute('aria-label', '1 notification.');
    expect(region).toHaveAttribute('class', 'react-aria-ToastRegion');

    let toast = getByRole('alertdialog');
    expect(toast).toBeVisible();
    expect(toast).toHaveAttribute('class', 'react-aria-Toast');
    expect(toast).toHaveAttribute('aria-labelledby');
    expect(document.getElementById(toast.getAttribute('aria-labelledby'))).toHaveTextContent('Toast');
    expect(toast).toHaveAttribute('aria-describedby');
    expect(document.getElementById(toast.getAttribute('aria-describedby'))).toHaveTextContent('Description');
    expect(toast).toHaveAttribute('aria-modal', 'false');

    let alert = within(toast).getByRole('alert');
    expect(alert).toBeVisible();
    expect(alert).toHaveAttribute('class', 'react-aria-ToastContent');

    button = within(toast).getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Close');
    await user.click(button);

    expect(queryByRole('alertdialog')).toBeNull();
    expect(queryByRole('alert')).toBeNull();
  });

  it('removes a toast via timeout', async () => {
    let {getByRole, queryByRole} = render(<Example timeout={5000} />);
    let button = getByRole('button');

    await user.click(button);

    let toast = getByRole('alertdialog');
    expect(toast).toBeVisible();

    act(() => jest.advanceTimersByTime(1000));
    act(() => jest.advanceTimersByTime(5000));
    expect(queryByRole('alertdialog')).toBeNull();
  });

  it('pauses timers when hovering', async () => {
    let {getByRole, queryByRole} = render(<Example timeout={5000} />);
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
    let {getByRole, queryByRole} = render(<Example timeout={5000} />);
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

  it('can focus toast region using F6', async () => {
    let {getByRole} = render(<Example timeout={5000} />);
    let button = getByRole('button');

    await user.click(button);

    let toast = getByRole('alertdialog');
    expect(toast).toBeVisible();

    expect(document.activeElement).toBe(button);
    await user.keyboard('{F6}');

    let region = getByRole('region');
    expect(document.activeElement).toBe(region);
  });

  it('should restore focus when a toast exits', async () => {
    let {getByRole, queryByRole} = render(<Example />);
    let button = getByRole('button');

    await user.click(button);

    let toast = getByRole('alertdialog');
    let closeButton = within(toast).getByRole('button');

    await user.click(closeButton);
    expect(queryByRole('alertdialog')).toBeNull();
    expect(button).toHaveFocus();
  });

  it('should move focus to remaining toast when a toast exits and there are more', async () => {
    let {getAllByRole, getByRole, queryByRole} = render(<Example />);
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
    let {getAllByRole, getByRole, queryByRole} = render(<Example />);
    let button = getByRole('button');

    await user.click(button);
    await user.click(button);

    let toast = getAllByRole('alertdialog')[1];
    let closeButton = within(toast).getByRole('button');
    await user.click(closeButton);

    toast = getByRole('alertdialog');
    expect(document.activeElement).toBe(toast);
    expect(toast).toHaveAttribute('data-focused', 'true');

    closeButton = within(toast).getByRole('button');
    await user.click(closeButton);

    expect(queryByRole('alertdialog')).toBeNull();
    expect(document.activeElement).toBe(button);
  });

  it('should support programmatically closing toasts', async () => {
    const queue = new ToastQueue();
    function ToastToggle() {
      let [key, setKey] = React.useState(null);

      return (
        <>
          <ToastRegion queue={queue}>
            {({toast}) => (
              <Toast toast={toast}>
                <ToastContent>
                  <Text slot="title">{toast.content}</Text>
                </ToastContent>
                <Button slot="close">x</Button>
              </Toast>
            )}
          </ToastRegion>
          <Button
            onPress={() => {
              if (key) {
                setKey(null);
                queue.close(key);
              } else {
                let key = queue.add('Toast is done!');
                setKey(key);
              }
            }}>
            {close ? 'Hide' : 'Show'} Toast
          </Button>
        </>
      );
    }

    let {getByRole, queryByRole} = render(<ToastToggle />);
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

  it('should support custom aria-label', async () => {
    let queue = new ToastQueue();
    let {getByRole} = render(
      <>
        <ToastRegion queue={queue} aria-label="Toasts">
          {({toast}) => (
            <Toast toast={toast}>
              <ToastContent>
                <Text slot="title">{toast.content}</Text>
              </ToastContent>
              <Button slot="close">x</Button>
            </Toast>
          )}
        </ToastRegion>
        <Button onPress={() => queue.add('Toast')}>Toast</Button>
      </>
    );

    let button = getByRole('button');
    await user.click(button);

    let region = getByRole('region');
    expect(region).toHaveAttribute('aria-label', 'Toasts');
  });
});
