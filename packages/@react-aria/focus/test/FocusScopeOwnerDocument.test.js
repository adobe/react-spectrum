/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, fireEvent, pointerMap, render, waitFor} from '@react-spectrum/test-utils-internal';
import {createPortal} from 'react-dom';
import {FocusScope, useFocusManager} from '../';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('FocusScope', function () {
  let iframe;
  let iframeRoot;

  let user;

  const IframeExample = ({children}) => {
    return createPortal(<>{children}</>, iframeRoot);
  };

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(async () => {
    // Iframe setup
    iframe = document.createElement('iframe');
    window.document.body.appendChild(iframe);
    const iframeDocument = iframe.contentWindow.document;
    iframeRoot = iframeDocument.createElement('div');
    iframeDocument.body.appendChild(iframeRoot);
  });

  afterEach(() => {
    // make sure to clean up any raf's that may be running to restore focus on unmount
    act(() => {jest.runAllTimers();});

    // Iframe teardown
    iframe.remove();
  });

  describe('focus containment', function () {
    it('should contain focus within the scope', async function () {
      render(
        <IframeExample>
          <FocusScope contain>
            <input data-testid="input1" />
            <input data-testid="input2" />
            <input data-testid="input3" />
          </FocusScope>
        </IframeExample>
      );

      await waitFor(() => {
        expect(document.querySelector('iframe').contentWindow.document.body.querySelector('input[data-testid="input1"]')).toBeTruthy();
      });

      const iframeDocument = iframe.contentWindow.document;
      user = userEvent.setup({delay: null, pointerMap, document: iframeDocument});
      const input1 = iframeDocument.querySelector('input[data-testid="input1"]');
      const input2 = iframeDocument.querySelector('input[data-testid="input2"]');
      const input3 = iframeDocument.querySelector('input[data-testid="input3"]');

      act(() => {input1.focus();});
      expect(iframeDocument.activeElement).toBe(input1);

      await user.tab();
      expect(iframeDocument.activeElement).toBe(input2);

      await user.tab();
      expect(iframeDocument.activeElement).toBe(input3);

      await user.tab();
      expect(iframeDocument.activeElement).toBe(input1);

      await user.tab({shift: true});
      expect(iframeDocument.activeElement).toBe(input3);

      await user.tab({shift: true});
      expect(iframeDocument.activeElement).toBe(input2);

      await user.tab({shift: true});
      expect(iframeDocument.activeElement).toBe(input1);
    });

    // This test setup is a bit contrived to just purely simulate the blur/focus events that would happen in a case like this
    it('focus properly moves into child iframe on click', async function () {
      render(
        <IframeExample>
          <FocusScope contain>
            <input data-testid="input1" />
            <input data-testid="input2" />
          </FocusScope>
        </IframeExample>
      );

      await waitFor(() => {
        expect(document.querySelector('iframe').contentWindow.document.body.querySelector('input[data-testid="input1"]')).toBeTruthy();
      });

      const iframeDocument = iframe.contentWindow.document;
      const input1 = iframeDocument.querySelector('input[data-testid="input1"]');
      const input2 = iframeDocument.querySelector('input[data-testid="input2"]');

      act(() => {input1.focus();});
      fireEvent.focusIn(input1); // jsdom doesn't fire this automatically
      expect(iframeDocument.activeElement).toBe(input1);

      act(() => {
        // set document.activeElement to input2
        input2.focus();
        // if onBlur didn't fallback to checking document.activeElement, this would reset focus to input1
        fireEvent.blur(input1, {relatedTarget: null});
      });

      expect(iframeDocument.activeElement).toBe(input2);
    });
  });

  describe('focus restoration', function () {
    it('should restore focus to the previously focused node on unmount', async function () {
      function Test({show}) {
        return (
          <div>
            <input data-testid="outside" />
            <IframeExample>
              {show &&
                <FocusScope restoreFocus autoFocus>
                  <input data-testid="input1" />
                  <input data-testid="input2" />
                  <input data-testid="input3" />
                </FocusScope>
              }
            </IframeExample>
          </div>
        );
      }

      let {getByTestId, rerender} = render(<Test />);

      let outside = getByTestId('outside');
      act(() => {outside.focus();});

      rerender(<Test show />);

      await waitFor(() => {
        expect(document.querySelector('iframe').contentWindow.document.body.querySelector('input[data-testid="input1"]')).toBeTruthy();
      });
      const iframeDocument = iframe.contentWindow.document;
      const input1 = iframeDocument.querySelector('input[data-testid="input1"]');
      expect(iframeDocument.activeElement).toBe(input1);

      rerender(<Test />);
      iframe.remove();

      act(() => {jest.runAllTimers();});

      expect(document.activeElement).toBe(outside);
    });

    describe('focusable first in scope', function () {
      it('should restore focus to the first focusable or tabbable element within the scope when focus is lost within the scope', async function () {
        render(
          <IframeExample>
            <FocusScope contain>
              <div role="dialog" data-testid="focusable" tabIndex={-1}>
                <Item data-testid="tabbable1" autoFocus tabIndex={null}>Remove me!</Item>
                <Item data-testid="item1" tabIndex={0}>Remove me, too!</Item>
                <Item data-testid="item2" tabIndex={-1}>Remove me, three!</Item>
              </div>
            </FocusScope>
          </IframeExample>
        );

        function Item(props) {
          let focusManager = useFocusManager();
          let onClick = e => {
            focusManager.focusNext();
            act(() => {
              // remove fails to fire blur event in jest-dom
              e.target.blur();
              e.target.remove();
              jest.runAllTimers();
            });
          };
          return <button tabIndex={-1} {...props} onClick={onClick} />;
        }

        await waitFor(() => {
          expect(document.querySelector('iframe').contentWindow.document.body.querySelector('div[data-testid="focusable"]')).toBeTruthy();
        });
        const iframeDocument = iframe.contentWindow.document;
        const focusable = iframeDocument.querySelector('div[data-testid="focusable"]');
        const tabbable1 = iframeDocument.querySelector('button[data-testid="tabbable1"]');
        const item1 = iframeDocument.querySelector('button[data-testid="item1"]');
        const item2 = iframeDocument.querySelector('button[data-testid="item2"]');

        expect(iframeDocument.activeElement).toBe(tabbable1);
        fireEvent.click(tabbable1);
        expect(iframeDocument.querySelector('button[data-testid="tabbable1"]')).toBeFalsy();
        await waitFor(() => expect(iframeDocument.activeElement).toBe(item1));
        fireEvent.click(item1);
        expect(iframeDocument.querySelector('button[data-testid="item1"]')).toBeFalsy();
        await waitFor(() => expect(iframeDocument.activeElement).toBe(item2));
        fireEvent.click(item2);
        expect(iframeDocument.querySelector('button[data-testid="item2"]')).toBeFalsy();
        await waitFor(() => expect(iframeDocument.activeElement).toBe(focusable));
      });
    });
  });

  describe('auto focus', function () {
    it('should auto focus the first tabbable element in the scope on mount', async function () {
      render(
        <IframeExample>
          <FocusScope autoFocus>
            <div />
            <input data-testid="input1" />
            <input data-testid="input2" />
            <input data-testid="input3" />
          </FocusScope>
        </IframeExample>
      );

      act(() => {jest.runAllTimers();});

      await waitFor(() => {
        expect(document.querySelector('iframe').contentWindow.document.body.querySelector('input[data-testid="input1"]')).toBeTruthy();
      });
      const iframeDocument = iframe.contentWindow.document;

      const input1 = iframeDocument.querySelector('input[data-testid="input1"]');
      expect(iframeDocument.activeElement).toBe(input1);
    });

    it('should do nothing if something is already focused in the scope', async function () {
      render(
        <IframeExample>
          <FocusScope autoFocus>
            <div />
            <input data-testid="input1" />
            <input data-testid="input2" autoFocus />
            <input data-testid="input3" />
          </FocusScope>
        </IframeExample>
      );

      await waitFor(() => {
        expect(document.querySelector('iframe').contentWindow.document.body.querySelector('input[data-testid="input2"]')).toBeTruthy();
      });
      const iframeDocument = iframe.contentWindow.document;

      const input2 = iframeDocument.querySelector('input[data-testid="input2"]');
      expect(iframeDocument.activeElement).toBe(input2);
    });
  });

  describe('focus manager', function () {
    it('should move focus forward', async function () {
      function Test() {
        return (
          <IframeExample>
            <FocusScope>
              <Item data-testid="item1" />
              <Item data-testid="item2" />
              <Item data-testid="item3" />
            </FocusScope>
          </IframeExample>
        );
      }

      function Item(props) {
        let focusManager = useFocusManager();
        let onClick = () => {
          focusManager.focusNext();
        };
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        return <div {...props} tabIndex={-1} role="button" onClick={onClick} />;
      }

      render(<Test />);

      await waitFor(() => {
        expect(document.querySelector('iframe').contentWindow.document.body.querySelector('div[data-testid="item1"]')).toBeTruthy();
      });
      const iframeDocument = iframe.contentWindow.document;
      const item1 = iframeDocument.querySelector('div[data-testid="item1"]');
      const item2 = iframeDocument.querySelector('div[data-testid="item2"]');
      const item3 = iframeDocument.querySelector('div[data-testid="item3"]');

      act(() => {item1.focus();});

      fireEvent.click(item1);
      expect(iframeDocument.activeElement).toBe(item2);

      fireEvent.click(item2);
      expect(iframeDocument.activeElement).toBe(item3);

      fireEvent.click(item3);
      expect(iframeDocument.activeElement).toBe(item3);
    });

    it('should move focus forward and wrap around', async function () {
      function Test() {
        return (
          <IframeExample>
            <FocusScope>
              <Item data-testid="item1" />
              <Item data-testid="item2" />
              <Item data-testid="item3" />
            </FocusScope>
          </IframeExample>
        );
      }

      function Item(props) {
        let focusManager = useFocusManager();
        let onClick = () => {
          focusManager.focusNext({wrap: true});
        };
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        return <div {...props} tabIndex={-1} role="button" onClick={onClick} />;
      }

      render(<Test />);

      await waitFor(() => {
        expect(document.querySelector('iframe').contentWindow.document.body.querySelector('div[data-testid="item1"]')).toBeTruthy();
      });
      const iframeDocument = iframe.contentWindow.document;
      const item1 = iframeDocument.querySelector('div[data-testid="item1"]');
      const item2 = iframeDocument.querySelector('div[data-testid="item2"]');
      const item3 = iframeDocument.querySelector('div[data-testid="item3"]');

      act(() => {item1.focus();});

      fireEvent.click(item1);
      expect(iframeDocument.activeElement).toBe(item2);

      fireEvent.click(item2);
      expect(iframeDocument.activeElement).toBe(item3);

      fireEvent.click(item3);
      expect(iframeDocument.activeElement).toBe(item1);
    });
  });
});
