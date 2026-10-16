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

import {
  act,
  installPointerEvent,
  pointerMap,
  render,
  within
} from '@react-spectrum/test-utils-internal';
import {Button} from '../src/Button';
import React, {useRef} from 'react';

import {Text} from '../src/Text';

import {
  UNSTABLE_Toast as Toast,
  UNSTABLE_ToastContent as ToastContent,
  UNSTABLE_ToastRegion as ToastRegion
} from '../src/Toast';
import {ToastQueue} from 'react-stately/useToastState';
import {UNSAFE_PortalProvider} from 'react-aria/PortalProvider';
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
      <Button onPress={() => queue.add({title: 'Toast', description: 'Description'}, options)}>
        Toast
      </Button>
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
    expect(document.getElementById(toast.getAttribute('aria-labelledby'))).toHaveTextContent(
      'Toast'
    );
    expect(toast).toHaveAttribute('aria-describedby');
    expect(document.getElementById(toast.getAttribute('aria-describedby'))).toHaveTextContent(
      'Description'
    );
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

  it('should restore focus when removing with the mouse', async () => {
    let {getAllByRole, getByRole, queryByRole} = render(<Example />);
    let button = getByRole('button');

    await user.click(button);
    await user.click(button);

    let toast = getAllByRole('alertdialog')[0];
    let closeButton = within(toast).getByRole('button');
    await user.click(closeButton);

    expect(document.activeElement).toBe(button);

    toast = getAllByRole('alertdialog')[0];
    closeButton = within(toast).getByRole('button');
    await user.click(closeButton);

    expect(queryByRole('alertdialog')).toBeNull();
    expect(document.activeElement).toBe(button);
  });

  it('should move focus to remaining toast when a toast exits and there are more', async () => {
    let {getAllByRole, getByRole, queryByRole} = render(<Example />);
    let button = getByRole('button');

    await user.tab();
    await user.keyboard('{Enter}');
    await user.keyboard('{Enter}');

    let toast = getAllByRole('alertdialog')[0];
    let closeButton = within(toast).getByRole('button');
    await user.keyboard('{F6}');
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(closeButton);
    await user.keyboard('{Enter}');

    toast = getByRole('alertdialog');
    expect(document.activeElement).toBe(toast);

    closeButton = within(toast).getByRole('button');
    await user.tab();
    expect(document.activeElement).toBe(closeButton);
    await user.keyboard('{Enter}');

    expect(queryByRole('alertdialog')).toBeNull();
    expect(document.activeElement).toBe(button);
  });

  it('should move focus from the last toast to remaining toast when a the last toast is closed', async () => {
    let {getAllByRole, getByRole, queryByRole} = render(<Example />);
    let button = getByRole('button');

    await user.tab();
    await user.keyboard('{Enter}');
    await user.keyboard('{Enter}');

    let toast = getAllByRole('alertdialog')[0];
    let closeButton = within(toast).getByRole('button');
    await user.keyboard('{F6}');
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(closeButton);
    await user.keyboard('{Enter}');

    toast = getByRole('alertdialog');
    expect(document.activeElement).toBe(toast);
    expect(toast).toHaveAttribute('data-focused', 'true');

    closeButton = within(toast).getByRole('button');
    await user.tab();
    expect(document.activeElement).toBe(closeButton);
    await user.keyboard('{Enter}');

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

  it('should render the toast region in the portal container provided by PortalProvider', async () => {
    let queue = new ToastQueue();

    function LocalToast() {
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

          <Button onPress={() => queue.add('Toast')}>Add toast</Button>
        </>
      );
    }
    function App() {
      let container = useRef(null);
      return (
        <>
          <UNSAFE_PortalProvider getContainer={() => container.current}>
            <LocalToast container={container} />
          </UNSAFE_PortalProvider>
          <div ref={container} data-testid="custom-container" />
        </>
      );
    }

    let {getByRole, getByTestId} = render(<App />);

    let button = getByRole('button');
    await user.click(button);

    expect(within(getByTestId('custom-container')).getByRole('alertdialog')).toBeInTheDocument();
  });

  describe('supports pausing a toast whose timeout is due', () => {
    it('should time out the toast once the pointer leaves', async () => {
      let {getByRole, queryByRole} = render(<Example timeout={5000} />);
      await user.click(getByRole('button'));
      let toast = getByRole('alertdialog');

      jest.setSystemTime(Date.now() + 5000);
      await user.hover(toast);
      await user.unhover(toast);
      act(() => jest.advanceTimersByTime(1000));

      expect(queryByRole('alertdialog')).toBeNull();
    });
  });

  describe('supports resuming the queue when adding a toast', () => {
    it('should not time out a hovered toast that was resumed before it rendered', async () => {
      let queue = new ToastQueue();
      let {getByRole} = render(
        <ToastRegion queue={queue}>
          {({toast}) => (
            <Toast toast={toast}>
              <ToastContent>
                <Text slot="title">{toast.content}</Text>
              </ToastContent>
            </Toast>
          )}
        </ToastRegion>
      );

      act(() => {
        queue.add('Saved', {timeout: 5000});
        queue.resumeAll();
      });
      await user.hover(getByRole('region'));
      act(() => jest.advanceTimersByTime(6000));

      expect(getByRole('alertdialog')).toBeInTheDocument();
    });
  });

  describe('supports pausing the queue', () => {
    it('should not time out a toast added while the queue is paused', () => {
      let queue = new ToastQueue();
      let {getByRole} = render(
        <ToastRegion queue={queue}>
          {({toast}) => (
            <Toast toast={toast}>
              <ToastContent>
                <Text slot="title">{toast.content}</Text>
              </ToastContent>
            </Toast>
          )}
        </ToastRegion>
      );

      act(() => queue.pauseAll());
      act(() => {
        queue.add('Saved', {timeout: 5000});
      });
      act(() => jest.advanceTimersByTime(6000));

      expect(getByRole('alertdialog')).toBeInTheDocument();
    });

    it('should pause a toast that is still shown while the queue update is pending', () => {
      // When wrapUpdate defers an update (e.g. into a view transition), the queue changes before
      // the update renders, so pausing in between can miss the toast it replaces, which is still
      // shown. That scheduling is hard to simulate, since jsdom has no view transitions.
      // Collecting the updates and flushing them manually holds the render back, so pausing
      // before the flush lands in the same window.
      let updates = [];
      let queue = new ToastQueue({maxVisibleToasts: 1, wrapUpdate: fn => updates.push(fn)});
      let flush = () => act(() => updates.splice(0).forEach(fn => fn()));
      let {getByRole} = render(
        <ToastRegion queue={queue}>
          {({toast}) => (
            <Toast toast={toast}>
              <ToastContent>
                <Text slot="title">{toast.content}</Text>
              </ToastContent>
            </Toast>
          )}
        </ToastRegion>
      );

      act(() => {
        queue.add('Saved', {timeout: 5000});
      });
      flush();
      let archived;
      act(() => {
        archived = queue.add('Archived', {timeout: 5000});
      });
      act(() => queue.pauseAll());
      act(() => queue.close(archived));
      flush();
      act(() => jest.advanceTimersByTime(6000));
      flush();

      expect(getByRole('alertdialog')).toHaveTextContent('Saved');
    });
  });

  describe('supports showing a toast again', () => {
    it('should restart the timer of a toast that is shown again', () => {
      let queue = new ToastQueue({maxVisibleToasts: 1});
      let {getByRole} = render(
        <ToastRegion queue={queue}>
          {({toast}) => (
            <Toast toast={toast}>
              <ToastContent>
                <Text slot="title">{toast.content}</Text>
              </ToastContent>
            </Toast>
          )}
        </ToastRegion>
      );

      act(() => {
        queue.add('Saved', {timeout: 5000});
      });
      act(() => jest.advanceTimersByTime(3000));
      let archived;
      act(() => {
        archived = queue.add('Archived', {timeout: 5000});
      });
      act(() => queue.close(archived));
      act(() => jest.advanceTimersByTime(3000));

      expect(getByRole('alertdialog')).toHaveTextContent('Saved');
    });
  });

  describe('supports closing the focused toast', () => {
    it('should move focus to the next toast after focus left the region and came back', async () => {
      let queue = new ToastQueue();
      let {getByRole} = render(
        <>
          <Button>Outside</Button>
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
        </>
      );

      act(() => {
        queue.add('Saved');
      });
      await user.tab();
      await user.tab();
      await user.tab({shift: true});
      act(() => {
        queue.add('Archived');
      });
      await user.tab();
      await user.tab();
      await user.keyboard('{Enter}');

      expect(document.activeElement).toBe(getByRole('alertdialog', {name: 'Saved'}));
    });

    it('should move focus to the next toast after a toast was added in front of it', async () => {
      let queue = new ToastQueue();
      let {getByRole} = render(
        <>
          <Button>Outside</Button>
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
        </>
      );

      act(() => {
        queue.add('Saved');
      });
      await user.tab();
      await user.tab();
      await user.tab();
      act(() => {
        queue.add('Archived');
      });
      await user.keyboard('{Enter}');

      expect(document.activeElement).toBe(getByRole('alertdialog', {name: 'Archived'}));
    });

    it('should time out the next toast after the last toast closed with focus in it', async () => {
      let queue = new ToastQueue();
      let {queryByRole} = render(
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
      );

      act(() => {
        queue.add('Saved');
      });
      await user.tab();
      await user.tab();
      await user.keyboard('{Enter}');
      act(() => {
        queue.add('Archived', {timeout: 5000});
      });
      act(() => jest.advanceTimersByTime(6000));

      expect(queryByRole('alertdialog')).toBeNull();
    });

    it('should not move focus back into the region when a toast it left is hidden again', async () => {
      let queue = new ToastQueue({maxVisibleToasts: 1});
      let {getByRole} = render(
        <>
          <Button>Outside</Button>
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
        </>
      );

      act(() => {
        queue.add('Saved');
      });
      await user.click(getByRole('button', {name: 'Outside'}));
      await user.click(getByRole('alertdialog'));
      let archived;
      act(() => {
        archived = queue.add('Archived');
      });
      act(() => queue.close(archived));
      expect(document.activeElement).toBe(getByRole('button', {name: 'Outside'}));
      await user.keyboard('{Shift}');
      act(() => {
        queue.add('Deleted');
      });

      expect(document.activeElement).toBe(getByRole('button', {name: 'Outside'}));
    });
  });
});
