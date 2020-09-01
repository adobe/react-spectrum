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

import {act, fireEvent, render, waitFor} from '@testing-library/react';
import {Dialog} from '@react-spectrum/dialog';
import {Popover} from '../';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';
import userEvent from '@testing-library/user-event';
import V2Popover from '@react/react-spectrum/Popover';

function PopoverWithDialog({children}) {
  return (
    <Popover isOpen>
      <Dialog>{children}</Dialog>
    </Popover>
  );
}

describe('Popover', function () {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());
    jest.spyOn(window, 'getComputedStyle').mockImplementation(() => ({
      getPropertyValue: () => '20'
    }));
  });

  afterEach(() => {
    act(() => {
      jest.runAllTimers();
    });
    window.requestAnimationFrame.mockRestore();
    window.getComputedStyle.mockRestore();
  });

  describe('parity', function () {
    it.each`
      Name      | Component            | props                | expectedTabIndex
      ${'v3'}   | ${PopoverWithDialog} | ${{}}                | ${'-1'}
      ${'v2'}   | ${V2Popover}         | ${{role: 'dialog'}}  | ${'1'}
    `('$Name has a tabIndex set', async function ({Name, Component, props, expectedTabIndex}) {
      let {getByRole} = render(
        <Provider theme={theme}>
          <Component {...props} />
        </Provider>
      );

      let dialog = getByRole('dialog');
      act(() => {
        jest.runAllTimers();
      });
      if (Name === 'v3') {
        // wait for animation
        await waitFor(() => {
          expect(getByRole('dialog')).toBeVisible();
        });
        act(() => {
          jest.runAllTimers();
        });
      }
      expect(dialog).toHaveAttribute('tabIndex', expectedTabIndex);
    });

    it.each`
      Name      | Component            | props
      ${'v3'}   | ${PopoverWithDialog} | ${{}}
      ${'v2'}   | ${V2Popover}         | ${{role: 'dialog'}}
    `('$Name auto focuses the first tabbable element by default', async function ({Name, Component, props}) {
      let {getByRole, getByTestId} = render(
        <Provider theme={theme}>
          <Component {...props}>
            <input data-testid="input1" />
            <input data-testid="input2" />
          </Component>
        </Provider>
      );

      act(() => {
        jest.runAllTimers();
      });
      if (Name === 'v2') {
        let input1 = getByTestId('input1');
        expect(document.activeElement).toBe(input1);
      } else {
        let dialog = getByRole('dialog');
        // wait for animation
        await waitFor(() => {
          expect(dialog).toBeVisible();
        });
        act(() => {
          jest.runAllTimers();
        });
        expect(document.activeElement).toBe(dialog);
      }
    });

    it.each`
      Name      | Component            | props
      ${'v3'}   | ${PopoverWithDialog} | ${{isOpen: true}}
      ${'v2'}   | ${V2Popover}         | ${{role: 'dialog'}}
    `('$Name auto focuses the dialog itself if there is no focusable child', async function ({Name, Component, props}) {
      let {getByRole} = render(
        <Provider theme={theme}>
          <Component {...props} />
        </Provider>
      );
      act(() => {
        jest.runAllTimers();
      });

      let dialog = getByRole('dialog');

      if (Name === 'v3') {
        // wait for animation
        await waitFor(() => {
          expect(getByRole('dialog')).toBeVisible();
        });
        act(() => {
          jest.runAllTimers();
        });
      }

      expect(document.activeElement).toBe(dialog);
    });

    it.each`
      Name      | Component            | props
      ${'v3'}   | ${PopoverWithDialog} | ${{}}
      ${'v2'}   | ${V2Popover}         | ${{role: 'dialog'}}
    `('$Name allows autofocus prop on a child element to work as expected', async function ({Name, Component, props}) {
      let {getByRole, getByTestId} = render(
        <Provider theme={theme}>
          <Component {...props}>
            <input data-testid="input1" />
            <input data-testid="input2" autoFocus />
          </Component>
        </Provider>
      );
      act(() => {
        jest.runAllTimers();
      });

      if (Name === 'v3') {
        // wait for animation
        await waitFor(() => {
          expect(getByRole('dialog')).toBeVisible();
        });
        act(() => {
          jest.runAllTimers();
        });
      }

      let input2 = getByTestId('input2');
      expect(document.activeElement).toBe(input2);
    });

    it.each`
      Name      | Component            | props
      ${'v3'}   | ${PopoverWithDialog} | ${{}}
    `('$Name contains focus within the popover', async function ({Name, Component, props}) {
      let {getByRole, getByTestId} = render(
        <Provider theme={theme}>
          <Component {...props}>
            <input data-testid="input1" />
            <input data-testid="input2" />
          </Component>
        </Provider>
      );
      act(() => {
        jest.runAllTimers();
      });

      let dialog = getByRole('dialog');

      if (Name === 'v3') {
        // wait for animation
        await waitFor(() => {
          expect(dialog).toBeVisible();
        });
        act(() => {
          jest.runAllTimers();
        });
      }

      let input1 = getByTestId('input1');
      let input2 = getByTestId('input2');
      expect(document.activeElement).toBe(dialog);

      act(() => {
        userEvent.tab();
      });
      expect(document.activeElement).toBe(input1);

      act(() => {
        userEvent.tab();
      });
      expect(document.activeElement).toBe(input2);

      act(() => {
        userEvent.tab();
      });
      expect(document.activeElement).toBe(input1);
    });
  });

  describe('v3', function () {
    it('hides the popover when pressing the escape key', async function () {
      let onClose = jest.fn();
      let {getByTestId} = render(
        <Provider theme={theme}>
          <Popover isOpen onClose={onClose} />
        </Provider>
      );
      act(() => {
        jest.runAllTimers();
      });

      let popover = getByTestId('popover');
      // wait for animation
      await waitFor(() => {
        expect(popover).toBeVisible();
      });
      act(() => {
        jest.runAllTimers();
      });

      act(() => {
        fireEvent.keyDown(popover, {key: 'Escape'});
        fireEvent.keyUp(popover, {key: 'Escape'});
      });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('hides the popover when clicking outside', async function () {
      let onClose = jest.fn();
      let {getByTestId} = render(
        <Provider theme={theme}>
          <Popover isOpen onClose={onClose} />
        </Provider>
      );
      act(() => {
        jest.runAllTimers();
      });

      // wait for animation
      await waitFor(() => {
        expect(getByTestId('popover')).toBeVisible();
      });
      act(() => {
        jest.runAllTimers();
      });

      act(() => {
        userEvent.click(document.body);
      });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('hides the popover on blur when shouldCloseOnBlur is true', async function () {
      // can't use Dialog in this one because Dialog does not work with shouldCloseOnBlur
      let onClose = jest.fn();
      let {getByRole, getByTestId} = render(
        <Provider theme={theme}>
          <Popover isOpen onClose={onClose} shouldCloseOnBlur>
            <button autoFocus>Focus me</button>
          </Popover>
        </Provider>
      );

      act(() => {
        jest.runAllTimers();
      });
      let button = getByRole('button');
      let popover = getByTestId('popover');
      expect(document.activeElement).toBe(button);

      // wait for animation
      await waitFor(() => {
        expect(popover).toBeVisible();
      });
      act(() => {
        jest.runAllTimers();
      });

      act(() => {
        button.blur();
      });
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
