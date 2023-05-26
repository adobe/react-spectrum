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

import {act, fireEvent, render, waitFor} from '@react-spectrum/test-utils';
import {defaultTheme} from '@adobe/react-spectrum';
import {DialogContainer} from '@react-spectrum/dialog';
import {FocusScope, useFocusManager} from '../';
import {focusScopeTree} from '../src/FocusScope';
import {Provider} from '@react-spectrum/provider';
import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import {Example as StorybookExample} from '../stories/FocusScope.stories';
import userEvent from '@testing-library/user-event';


describe('FocusScope', function () {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    // make sure to clean up any raf's that may be running to restore focus on unmount
    act(() => {jest.runAllTimers();});
  });

  describe('focus containment', function () {
    it('should contain focus within the scope', function () {
      let {getByTestId} = render(
        <FocusScope contain>
          <input data-testid="input1" />
          <input data-testid="input2" />
          <input data-testid="input3" />
        </FocusScope>
      );

      let input1 = getByTestId('input1');
      let input2 = getByTestId('input2');
      let input3 = getByTestId('input3');

      act(() => {input1.focus();});
      expect(document.activeElement).toBe(input1);

      userEvent.tab();
      expect(document.activeElement).toBe(input2);

      userEvent.tab();
      expect(document.activeElement).toBe(input3);

      userEvent.tab();
      expect(document.activeElement).toBe(input1);

      userEvent.tab({shift: true});
      expect(document.activeElement).toBe(input3);

      userEvent.tab({shift: true});
      expect(document.activeElement).toBe(input2);

      userEvent.tab({shift: true});
      expect(document.activeElement).toBe(input1);
    });

    it('should work with nested elements', function () {
      let {getByTestId} = render(
        <FocusScope contain>
          <input data-testid="input1" />
          <div>
            <input data-testid="input2" />
            <div>
              <input data-testid="input3" />
            </div>
          </div>
        </FocusScope>
      );

      let input1 = getByTestId('input1');
      let input2 = getByTestId('input2');
      let input3 = getByTestId('input3');

      act(() => {input1.focus();});
      expect(document.activeElement).toBe(input1);

      userEvent.tab();
      expect(document.activeElement).toBe(input2);

      userEvent.tab();
      expect(document.activeElement).toBe(input3);

      userEvent.tab();
      expect(document.activeElement).toBe(input1);

      userEvent.tab({shift: true});
      expect(document.activeElement).toBe(input3);

      userEvent.tab({shift: true});
      expect(document.activeElement).toBe(input2);

      userEvent.tab({shift: true});
      expect(document.activeElement).toBe(input1);
    });

    it('should skip non-tabbable elements', function () {
      let {getByTestId} = render(
        <FocusScope contain>
          <input data-testid="input1" />
          <div />
          <input data-testid="input2" />
          <input data-testid="hiddenInput1" hidden />
          <input style={{display: 'none'}} />
          <input style={{visibility: 'hidden'}} />
          <input style={{visibility: 'collapse'}} />
          <div tabIndex={-1} />
          <input disabled tabIndex={0} />
          <input data-testid="input3" />
        </FocusScope>
      );

      let input1 = getByTestId('input1');
      let input2 = getByTestId('input2');
      let input3 = getByTestId('input3');

      act(() => {input1.focus();});
      expect(document.activeElement).toBe(input1);

      userEvent.tab();
      expect(document.activeElement).toBe(input2);

      userEvent.tab();
      expect(document.activeElement).toBe(input3);

      userEvent.tab();
      expect(document.activeElement).toBe(input1);

      userEvent.tab({shift: true});
      expect(document.activeElement).toBe(input3);

      userEvent.tab({shift: true});
      expect(document.activeElement).toBe(input2);

      userEvent.tab({shift: true});
      expect(document.activeElement).toBe(input1);
    });

    it('should do nothing if a modifier key is pressed', function () {
      let {getByTestId} = render(
        <FocusScope contain>
          <input data-testid="input1" />
          <input data-testid="input2" />
          <input data-testid="input3" />
        </FocusScope>
      );

      let input1 = getByTestId('input1');

      act(() => {input1.focus();});
      expect(document.activeElement).toBe(input1);

      fireEvent.keyDown(document.activeElement, {key: 'Tab', altKey: true});
      expect(document.activeElement).toBe(input1);
    });

    it('should work with multiple focus scopes', function () {
      let {getByTestId} = render(
        <div>
          <FocusScope contain>
            <input data-testid="input1" />
            <input data-testid="input2" />
            <input style={{display: 'none'}} />
            <input style={{visibility: 'hidden'}} />
            <input style={{visibility: 'collapse'}} />
            <input data-testid="input3" />
          </FocusScope>
          <FocusScope contain>
            <input data-testid="input4" />
            <input data-testid="input5" />
            <input style={{display: 'none'}} />
            <input style={{visibility: 'hidden'}} />
            <input style={{visibility: 'collapse'}} />
            <input data-testid="input6" />
          </FocusScope>
        </div>
      );

      let input1 = getByTestId('input1');
      let input2 = getByTestId('input2');
      let input3 = getByTestId('input3');
      let input4 = getByTestId('input4');

      act(() => {input1.focus();});
      expect(document.activeElement).toBe(input1);

      userEvent.tab();
      expect(document.activeElement).toBe(input2);

      userEvent.tab();
      expect(document.activeElement).toBe(input3);

      userEvent.tab();
      expect(document.activeElement).toBe(input1);

      userEvent.tab({shift: true});
      expect(document.activeElement).toBe(input3);

      userEvent.tab({shift: true});
      expect(document.activeElement).toBe(input2);

      userEvent.tab({shift: true});
      expect(document.activeElement).toBe(input1);

      act(() => {input4.focus();});
      expect(document.activeElement).toBe(input1);
    });

    it('should restore focus to the last focused element in the scope when re-entering the browser', function () {
      let {getByTestId} = render(
        <div>
          <input data-testid="outside" />
          <FocusScope contain>
            <input data-testid="input1" />
            <input data-testid="input2" />
            <input data-testid="input3" />
          </FocusScope>
        </div>
      );

      let input1 = getByTestId('input1');
      let input2 = getByTestId('input2');
      let outside = getByTestId('outside');

      act(() => {input1.focus();});
      fireEvent.focusIn(input1); // jsdom doesn't fire this automatically
      expect(document.activeElement).toBe(input1);

      userEvent.tab();
      fireEvent.focusIn(input2);
      act(() => {jest.runAllTimers();});
      expect(document.activeElement).toBe(input2);

      act(() => {input2.blur();});
      act(() => {jest.runAllTimers();});
      expect(document.activeElement).toBe(input2);

      act(() => {outside.focus();});
      fireEvent.focusIn(outside);
      expect(document.activeElement).toBe(input2);
    });

    it('should restore focus to the last focused element in the scope on focus out', function () {
      let {getByTestId} = render(
        <div>
          <FocusScope contain>
            <input data-testid="input1" />
            <input data-testid="input2" />
          </FocusScope>
        </div>
      );

      let input1 = getByTestId('input1');
      let input2 = getByTestId('input2');

      act(() => {input1.focus();});
      fireEvent.focusIn(input1); // jsdom doesn't fire this automatically
      expect(document.activeElement).toBe(input1);

      userEvent.tab();
      fireEvent.focusIn(input2);
      act(() => {jest.runAllTimers();});
      expect(document.activeElement).toBe(input2);

      act(() => {input2.blur();});
      act(() => {jest.runAllTimers();});
      expect(document.activeElement).toBe(input2);
      fireEvent.focusOut(input2);
      expect(document.activeElement).toBe(input2);
    });

    it('uses document.activeElement instead of e.relatedTarget on blur to determine if focus is still in scope', function () {
      let {getByTestId} = render(
        <div>
          <FocusScope contain>
            <input data-testid="input1" />
            <input data-testid="input2" />
          </FocusScope>
        </div>
      );

      let input1 = getByTestId('input1');
      let input2 = getByTestId('input2');

      act(() => {input1.focus();});
      fireEvent.focusIn(input1); // jsdom doesn't fire this automatically
      expect(document.activeElement).toBe(input1);

      act(() => {
        // set document.activeElement to input2
        input2.focus();
        // if onBlur didn't fallback to checking document.activeElement, this would reset focus to input1
        fireEvent.blur(input1, {relatedTarget: null});
      });

      expect(document.activeElement).toBe(input2);
    });
  });

  describe('focus restoration', function () {
    it('should restore focus to the previously focused node on unmount', function () {
      function Test({show}) {
        return (
          <div>
            <input data-testid="outside" />
            {show &&
              <FocusScope restoreFocus autoFocus>
                <input data-testid="input1" />
                <input data-testid="input2" />
                <input data-testid="input3" />
              </FocusScope>
            }
          </div>
        );
      }

      let {getByTestId, rerender} = render(<Test />);

      let outside = getByTestId('outside');
      act(() => {outside.focus();});

      rerender(<Test show />);

      let input1 = getByTestId('input1');
      expect(document.activeElement).toBe(input1);

      rerender(<Test />);
      act(() => {jest.runAllTimers();});

      expect(document.activeElement).toBe(outside);
    });

    it('should restore focus to the previously focused node after a child with autoFocus unmounts', function () {
      function Test({show}) {
        return (
          <div>
            <input data-testid="outside" />
            {show &&
              <FocusScope restoreFocus>
                <input data-testid="input1" />
                <input data-testid="input2" autoFocus />
                <input data-testid="input3" />
              </FocusScope>
            }
          </div>
        );
      }

      let {getByTestId, rerender} = render(<Test />);

      let outside = getByTestId('outside');
      act(() => {outside.focus();});

      rerender(<Test show />);

      let input2 = getByTestId('input2');
      expect(document.activeElement).toBe(input2);

      rerender(<Test />);
      act(() => {jest.runAllTimers();});

      expect(document.activeElement).toBe(outside);
    });

    it('should move focus after the previously focused node when tabbing away from a scope with autoFocus', function () {
      function Test({show}) {
        return (
          <div>
            <input data-testid="before" />
            <input data-testid="outside" />
            <input data-testid="after" />
            {show &&
              <FocusScope restoreFocus>
                <input data-testid="input1" />
                <input data-testid="input2" />
                <input data-testid="input3" autoFocus />
              </FocusScope>
            }
          </div>
        );
      }

      let {getByTestId, rerender} = render(<Test />);

      let outside = getByTestId('outside');
      act(() => {outside.focus();});

      rerender(<Test show />);

      let input3 = getByTestId('input3');
      expect(document.activeElement).toBe(input3);

      userEvent.tab();
      expect(document.activeElement).toBe(getByTestId('after'));
    });

    it('should move focus before the previously focused node when tabbing away from a scope with Shift+Tab', function () {
      function Test({show}) {
        return (
          <div>
            <input data-testid="before" />
            <input data-testid="outside" />
            <input data-testid="after" />
            {show &&
              <FocusScope restoreFocus>
                <input data-testid="input1" autoFocus />
                <input data-testid="input2" />
                <input data-testid="input3" />
              </FocusScope>
            }
          </div>
        );
      }

      let {getByTestId, rerender} = render(<Test />);

      let outside = getByTestId('outside');
      act(() => {outside.focus();});

      rerender(<Test show />);

      let input1 = getByTestId('input1');
      expect(document.activeElement).toBe(input1);

      userEvent.tab({shift: true});
      expect(document.activeElement).toBe(getByTestId('before'));
    });

    it('should restore focus to the previously focused node after children change', function () {
      function Test({show, showChild}) {
        return (
          <div>
            <input data-testid="outside" />
            {show &&
              <FocusScope restoreFocus autoFocus>
                <input data-testid="input1" />
                {showChild && <input data-testid="dynamic" />}
              </FocusScope>
            }
          </div>
        );
      }

      let {getByTestId, rerender} = render(<Test />);

      let outside = getByTestId('outside');
      act(() => {outside.focus();});

      rerender(<Test show />);
      rerender(<Test show showChild />);

      let dynamic = getByTestId('dynamic');
      act(() => {dynamic.focus();});
      expect(document.activeElement).toBe(dynamic);

      rerender(<Test />);
      act(() => {jest.runAllTimers();});

      expect(document.activeElement).toBe(outside);
    });

    it('should move focus to the element after the previously focused node on Tab', function () {
      function Test({show}) {
        return (
          <div>
            <input data-testid="before" />
            <button data-testid="trigger" />
            <input data-testid="after" />
            {show &&
              <FocusScope restoreFocus autoFocus>
                <input data-testid="input1" />
                <input data-testid="input2" />
                <input data-testid="input3" />
              </FocusScope>
            }
          </div>
        );
      }

      let {getByTestId, rerender} = render(<Test />);

      let trigger = getByTestId('trigger');
      act(() => {trigger.focus();});

      rerender(<Test show />);

      let input1 = getByTestId('input1');
      expect(document.activeElement).toBe(input1);

      let input3 = getByTestId('input3');
      act(() => {input3.focus();});

      userEvent.tab();
      expect(document.activeElement).toBe(getByTestId('after'));
    });

    it('should move focus to the previous element after the previously focused node on Shift+Tab', function () {
      function Test({show}) {
        return (
          <div>
            <input data-testid="before" />
            <button data-testid="trigger" />
            <input data-testid="after" />
            {show &&
              <FocusScope restoreFocus autoFocus>
                <input data-testid="input1" />
                <input data-testid="input2" />
                <input data-testid="input3" />
              </FocusScope>
            }
          </div>
        );
      }

      let {getByTestId, rerender} = render(<Test />);

      let trigger = getByTestId('trigger');
      act(() => {trigger.focus();});

      rerender(<Test show />);

      let input1 = getByTestId('input1');
      expect(document.activeElement).toBe(input1);

      userEvent.tab({shift: true});
      expect(document.activeElement).toBe(getByTestId('before'));
    });

    it('should skip over elements within the scope when moving focus to the next element', function () {
      function Test({show}) {
        return (
          <div>
            <input data-testid="before" />
            <button data-testid="trigger" />
            {show &&
              <FocusScope restoreFocus autoFocus>
                <input data-testid="input1" />
                <input data-testid="input2" />
                <input data-testid="input3" />
              </FocusScope>
            }
            <input data-testid="after" />
          </div>
        );
      }

      let {getByTestId, rerender} = render(<Test />);

      let trigger = getByTestId('trigger');
      act(() => {trigger.focus();});

      rerender(<Test show />);

      let input1 = getByTestId('input1');
      expect(document.activeElement).toBe(input1);

      let input3 = getByTestId('input3');
      act(() => {input3.focus();});

      userEvent.tab();
      expect(document.activeElement).toBe(getByTestId('after'));
    });

    it('should not handle tabbing if the focus scope does not restore focus', function () {
      function Test({show}) {
        return (
          <div>
            <input data-testid="before" />
            <button data-testid="trigger" />
            <input data-testid="after-trigger" />
            {show &&
              <FocusScope autoFocus>
                <input data-testid="input1" />
                <input data-testid="input2" />
                <input data-testid="input3" />
              </FocusScope>
            }
            <input data-testid="after" />
          </div>
        );
      }

      let {getByTestId, rerender} = render(<Test />);

      let trigger = getByTestId('trigger');
      act(() => {trigger.focus();});

      rerender(<Test show />);

      let input1 = getByTestId('input1');
      expect(document.activeElement).toBe(input1);

      let input3 = getByTestId('input3');
      act(() => {input3.focus();});

      userEvent.tab();
      expect(document.activeElement).toBe(getByTestId('after'));
    });

    it.each`
      contain  | isPortaled
      ${false} | ${false}
      ${true}  | ${false}
      ${false} | ${true}
      ${true}  | ${true}
    `('contain=$contain, isPortaled=$isPortaled should restore focus to previous nodeToRestore when the nodeToRestore for the unmounting scope in no longer in the DOM',
    function ({contain, isPortaled}) {
      expect(focusScopeTree.size).toBe(1);
      let {getAllByText, getAllByRole} = render(<StorybookExample contain={contain} isPortaled={isPortaled} />);
      expect(focusScopeTree.size).toBe(1);
      act(() => {getAllByText('Open dialog')[0].focus();});
      fireEvent.click(document.activeElement);
      act(() => {jest.runAllTimers();});
      expect(document.activeElement).toBe(getAllByRole('textbox')[2]);
      act(() => {getAllByText('Open dialog')[1].focus();});
      fireEvent.click(document.activeElement);
      act(() => {jest.runAllTimers();});
      expect(document.activeElement).toBe(getAllByRole('textbox')[5]);
      act(() => {getAllByText('Open dialog')[2].focus();});
      fireEvent.click(document.activeElement);
      act(() => {jest.runAllTimers();});
      expect(document.activeElement).toBe(getAllByRole('textbox')[8]);
      expect(focusScopeTree.size).toBe(4);
      if (!contain) {
        act(() => {
          getAllByText('close')[1].focus();
        });
        fireEvent.click(document.activeElement);
      } else {
        fireEvent.click(getAllByText('close')[1]);
      }
      act(() => {jest.runAllTimers();});
      expect(document.activeElement).toBe(getAllByText('Open dialog')[1]);
      act(() => {getAllByText('close')[0].focus();});
      fireEvent.click(document.activeElement);
      act(() => {jest.runAllTimers();});
      expect(document.activeElement).toBe(getAllByText('Open dialog')[0]);
      expect(focusScopeTree.size).toBe(1);
    });

    describe('focusable first in scope', function () {
      it('should restore focus to the first focusable or tabbable element within the scope when focus is lost within the scope', async function () {
        let {getByTestId} = render(
          <div>
            <FocusScope contain>
              <div role="dialog" data-testid="focusable" tabIndex={-1}>
                <Item data-testid="tabbable1" autoFocus tabIndex={null}>Remove me!</Item>
                <Item data-testid="item1" tabIndex={0}>Remove me, too!</Item>
                <Item data-testid="item2" tabIndex={-1}>Remove me, three!</Item>
              </div>
            </FocusScope>
          </div>
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
        let focusable = getByTestId('focusable');
        let tabbable1 = getByTestId('tabbable1');
        let item1 = getByTestId('item1');
        let item2 = getByTestId('item2');
        expect(document.activeElement).toBe(tabbable1);
        fireEvent.click(tabbable1);
        expect(tabbable1).not.toBeInTheDocument();
        await waitFor(() => expect(document.activeElement).toBe(item1));
        fireEvent.click(item1);
        expect(item1).not.toBeInTheDocument();
        await waitFor(() => expect(document.activeElement).toBe(item2));
        fireEvent.click(item2);
        expect(item2).not.toBeInTheDocument();
        await waitFor(() => expect(document.activeElement).toBe(focusable));
      });
    });

    it('should not not restore focus when active element is outside the scope', function () {
      function Test() {
        const [display, setDisplay] = useState(false);
        useEffect(() => {
          let handleKeyDown = (e) => {
            if (e.key === 'Escape') {
              setDisplay(false);
            }
          };
          document.body.addEventListener('keyup', handleKeyDown);
          return () => {
            document.body.removeEventListener('keyup', handleKeyDown);
          };
        }, []);

        return (
          <div>
            <button
              data-testid="button1"
              type="button"
              onClick={() => setDisplay((state) => !state)}>
              {display ? 'Close dialog' : 'Open dialog'}
            </button>
            <button
              data-testid="button2"
              type="button"
              onClick={() => setDisplay((state) => !state)}>
              {display ? 'Close dialog' : 'Open dialog'}
            </button>{' '}
            {display && (
              <FocusScope restoreFocus>
                <input data-testid="input1" />
              </FocusScope>
            )}
          </div>
        );
      }

      let {getByTestId} = render(<Test />);
      let button1 = getByTestId('button1');
      let button2 = getByTestId('button2');
      userEvent.click(button1);
      act(() => {jest.runAllTimers();});
      expect(document.activeElement).toBe(button1);
      let input1 = getByTestId('input1');
      expect(input1).toBeVisible();

      userEvent.click(button2);
      act(() => {jest.runAllTimers();});
      expect(document.activeElement).toBe(button2);
      expect(input1).not.toBeInTheDocument();

      userEvent.click(button1);
      act(() => {jest.runAllTimers();});
      input1 = getByTestId('input1');
      expect(input1).toBeVisible();
      userEvent.tab();
      fireEvent.keyDown(document.activeElement, {key: 'Escape'});
      fireEvent.keyUp(document.activeElement, {key: 'Escape'});
      act(() => {jest.runAllTimers();});
      expect(document.activeElement).toBe(button2);
      expect(input1).not.toBeInTheDocument();
    });
  });

  describe('auto focus', function () {
    it('should auto focus the first tabbable element in the scope on mount', function () {
      let {getByTestId} = render(
        <FocusScope autoFocus>
          <div />
          <input data-testid="input1" />
          <input data-testid="input2" />
          <input data-testid="input3" />
        </FocusScope>
      );

      act(() => {jest.runAllTimers();});

      let input1 = getByTestId('input1');
      expect(document.activeElement).toBe(input1);
    });

    it('should do nothing if something is already focused in the scope', function () {
      let {getByTestId} = render(
        <FocusScope autoFocus>
          <div />
          <input data-testid="input1" />
          <input data-testid="input2" autoFocus />
          <input data-testid="input3" />
        </FocusScope>
      );

      let input2 = getByTestId('input2');
      expect(document.activeElement).toBe(input2);
    });
  });

  describe('focus manager', function () {
    it('should move focus forward', function () {
      function Test() {
        return (
          <FocusScope>
            <Item data-testid="item1" />
            <Item data-testid="item2" />
            <Item data-testid="item3" />
          </FocusScope>
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

      let {getByTestId} = render(<Test />);
      let item1 = getByTestId('item1');
      let item2 = getByTestId('item2');
      let item3 = getByTestId('item3');

      act(() => {item1.focus();});

      fireEvent.click(item1);
      expect(document.activeElement).toBe(item2);

      fireEvent.click(item2);
      expect(document.activeElement).toBe(item3);

      fireEvent.click(item3);
      expect(document.activeElement).toBe(item3);
    });

    it('should move focus forward and wrap around', function () {
      function Test() {
        return (
          <FocusScope>
            <Item data-testid="item1" />
            <Item data-testid="item2" />
            <Item data-testid="item3" />
          </FocusScope>
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

      let {getByTestId} = render(<Test />);
      let item1 = getByTestId('item1');
      let item2 = getByTestId('item2');
      let item3 = getByTestId('item3');

      act(() => {item1.focus();});

      fireEvent.click(item1);
      expect(document.activeElement).toBe(item2);

      fireEvent.click(item2);
      expect(document.activeElement).toBe(item3);

      fireEvent.click(item3);
      expect(document.activeElement).toBe(item1);
    });

    it('should move focus forward but only to tabbable elements', function () {
      function Test() {
        return (
          <FocusScope>
            <Item data-testid="item1" tabIndex={0} />
            <Item data-testid="item2" tabIndex={-1} />
            <Item style={{display: 'none'}} />
            <Item style={{visibility: 'hidden'}} />
            <Item style={{visibility: 'collapse'}} />
            <Item data-testid="item3" tabIndex={0} />
          </FocusScope>
        );
      }

      function Item(props) {
        let focusManager = useFocusManager();
        let onClick = () => {
          focusManager.focusNext({tabbable: true});
        };
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        return <div tabIndex={0} {...props} role="button" onClick={onClick} />;
      }

      let {getByTestId} = render(<Test />);
      let item1 = getByTestId('item1');
      let item3 = getByTestId('item3');

      act(() => {item1.focus();});

      fireEvent.click(item1);
      expect(document.activeElement).toBe(item3);
    });

    it('should move focus forward but only to tabbable elements while accounting for container elements within the scope', function () {
      function Test() {
        return (
          <FocusScope>
            <Group data-testid="group1">
              <Item data-testid="item1" tabIndex={-1} />
              <Item data-testid="item2" tabIndex={0} />
              <Item style={{display: 'none'}} />
            </Group>
            <Group data-testid="group2">
              <Item style={{visibility: 'hidden'}} />
              <Item style={{visibility: 'collapse'}} />
              <Item data-testid="item3" tabIndex={0} />
            </Group>
          </FocusScope>
        );
      }

      function Item(props) {
        return <div {...props} role="button" />;
      }

      function Group(props) {
        let focusManager = useFocusManager();
        let onMouseDown = e => {
          focusManager.focusNext({from: e.target, tabbable: true});
        };
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        return <div {...props} role="group" onMouseDown={onMouseDown} />;
      }

      let {getByTestId} = render(<Test />);
      let group1 = getByTestId('group1');
      let group2 = getByTestId('group2');
      let item2 = getByTestId('item2');
      let item3 = getByTestId('item3');

      fireEvent.mouseDown(group2);
      expect(document.activeElement).toBe(item3);

      fireEvent.mouseDown(group1);
      expect(document.activeElement).toBe(item2);
    });

    it('should move focus forward and allow users to skip certain elements', function () {
      function Test() {
        return (
          <FocusScope>
            <Item data-testid="item1" />
            <Item data-testid="item2" data-skip />
            <Item data-testid="item3" />
          </FocusScope>
        );
      }

      function Item(props) {
        let focusManager = useFocusManager();
        let onClick = () => {
          focusManager.focusNext({
            wrap: true,
            accept: (e) => !e.getAttribute('data-skip')
          });
        };
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        return <div {...props} tabIndex={-1} role="button" onClick={onClick} />;
      }

      let {getByTestId} = render(<Test />);
      let item1 = getByTestId('item1');
      let item3 = getByTestId('item3');

      act(() => {item1.focus();});

      fireEvent.click(item1);
      expect(document.activeElement).toBe(item3);

      fireEvent.click(item3);
      expect(document.activeElement).toBe(item1);
    });

    it('should move focus backward', function () {
      function Test() {
        return (
          <FocusScope>
            <Item data-testid="item1" />
            <Item data-testid="item2" />
            <Item data-testid="item3" />
          </FocusScope>
        );
      }

      function Item(props) {
        let focusManager = useFocusManager();
        let onClick = () => {
          focusManager.focusPrevious();
        };
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        return <div {...props} tabIndex={-1} role="button" onClick={onClick} />;
      }

      let {getByTestId} = render(<Test />);
      let item1 = getByTestId('item1');
      let item2 = getByTestId('item2');
      let item3 = getByTestId('item3');

      act(() => {item3.focus();});

      fireEvent.click(item3);
      expect(document.activeElement).toBe(item2);

      fireEvent.click(item2);
      expect(document.activeElement).toBe(item1);

      fireEvent.click(item1);
      expect(document.activeElement).toBe(item1);
    });

    it('should move focus backward and wrap around', function () {
      function Test() {
        return (
          <FocusScope>
            <Item data-testid="item1" />
            <Item data-testid="item2" />
            <Item data-testid="item3" />
          </FocusScope>
        );
      }

      function Item(props) {
        let focusManager = useFocusManager();
        let onClick = () => {
          focusManager.focusPrevious({wrap: true});
        };
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        return <div {...props} tabIndex={-1} role="button" onClick={onClick} />;
      }

      let {getByTestId} = render(<Test />);
      let item1 = getByTestId('item1');
      let item2 = getByTestId('item2');
      let item3 = getByTestId('item3');

      act(() => {item3.focus();});

      fireEvent.click(item3);
      expect(document.activeElement).toBe(item2);

      fireEvent.click(item2);
      expect(document.activeElement).toBe(item1);

      fireEvent.click(item1);
      expect(document.activeElement).toBe(item3);
    });

    it('should move focus backward but only to tabbable elements', function () {
      function Test() {
        return (
          <FocusScope>
            <Item data-testid="item1" tabIndex={0} />
            <Item data-testid="item2" tabIndex={-1} />
            <Item style={{display: 'none'}} />
            <Item style={{visibility: 'hidden'}} />
            <Item style={{visibility: 'collapse'}} />
            <Item data-testid="item3" tabIndex={0} />
          </FocusScope>
        );
      }

      function Item(props) {
        let focusManager = useFocusManager();
        let onClick = () => {
          focusManager.focusPrevious({tabbable: true});
        };
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        return <div tabIndex={0} {...props} role="button" onClick={onClick} />;
      }

      let {getByTestId} = render(<Test />);
      let item1 = getByTestId('item1');
      let item3 = getByTestId('item3');

      act(() => {item3.focus();});

      fireEvent.click(item3);
      expect(document.activeElement).toBe(item1);
    });

    it('should move focus backward but only to tabbable elements while accounting for container elements within the scope', function () {
      function Test() {
        return (
          <FocusScope>
            <Group data-testid="group1">
              <Item data-testid="item1" tabIndex={0} />
              <Item data-testid="item2" tabIndex={-1} />
              <Item style={{display: 'none'}} />
            </Group>
            <Group data-testid="group2">
              <Item style={{visibility: 'hidden'}} />
              <Item style={{visibility: 'collapse'}} />
              <Item data-testid="item3" tabIndex={0} />
            </Group>
          </FocusScope>
        );
      }

      function Item(props) {
        return <div {...props} role="button" />;
      }

      function Group(props) {
        let focusManager = useFocusManager();
        let onMouseDown = e => {
          focusManager.focusPrevious({from: e.target, tabbable: true});
        };
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        return <div {...props} role="group" onMouseDown={onMouseDown} />;
      }

      let {getByTestId} = render(<Test />);
      let group1 = getByTestId('group1');
      let group2 = getByTestId('group2');
      let item1 = getByTestId('item1');

      fireEvent.mouseDown(group2);
      expect(document.activeElement).toBe(item1);

      fireEvent.mouseDown(group1);
      // focus should remain unchanged,
      // because there is no focusable element in scope before group1,
      // and wrap is false
      expect(document.activeElement).toBe(item1);
    });

    it('should move focus backward and allow users to skip certain elements', function () {
      function Test() {
        return (
          <FocusScope>
            <Item data-testid="item1" />
            <Item data-testid="item2" data-skip />
            <Item data-testid="item3" />
          </FocusScope>
        );
      }

      function Item(props) {
        let focusManager = useFocusManager();
        let onClick = () => {
          focusManager.focusPrevious({
            wrap: true,
            accept: (e) => !e.getAttribute('data-skip')
          });
        };
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        return <div {...props} tabIndex={-1} role="button" onClick={onClick} />;
      }

      let {getByTestId} = render(<Test />);
      let item1 = getByTestId('item1');
      let item3 = getByTestId('item3');

      act(() => {item1.focus();});

      fireEvent.click(item1);
      expect(document.activeElement).toBe(item3);

      fireEvent.click(item3);
      expect(document.activeElement).toBe(item1);
    });
  });

  describe('nested focus scopes', function () {
    it('should make child FocusScopes the active scope regardless of DOM structure', function () {
      function ChildComponent(props) {
        return ReactDOM.createPortal(props.children, document.body);
      }

      function Test({show}) {
        return (
          <div>
            <input data-testid="outside" />
            <FocusScope restoreFocus contain>
              <input data-testid="input1" />
              {show &&
                <ChildComponent>
                  <FocusScope restoreFocus contain>
                    <input data-testid="input3" />
                  </FocusScope>
                </ChildComponent>
              }
            </FocusScope>
          </div>
        );
      }

      let {getByTestId, rerender} = render(<Test />);
      // Set a focused node and make first FocusScope the active scope
      let input1 = getByTestId('input1');
      act(() => {input1.focus();});
      fireEvent.focusIn(input1);
      expect(document.activeElement).toBe(input1);

      rerender(<Test show />);
      expect(document.activeElement).toBe(input1);
      let input3 = getByTestId('input3');
      act(() => {input3.focus();});
      fireEvent.focusIn(input3);
      expect(document.activeElement).toBe(input3);
    });

    it('should lock tab navigation inside direct child focus scope', function () {
      function Test() {
        return (
          <div>
            <input data-testid="outside" />
            <FocusScope autoFocus restoreFocus contain>
              <input data-testid="parent1" />
              <input data-testid="parent2" />
              <input data-testid="parent3" />
              <FocusScope autoFocus restoreFocus contain>
                <input data-testid="child1" />
                <input data-testid="child2" />
                <input data-testid="child3" />
              </FocusScope>
            </FocusScope>
          </div>
        );
      }

      let {getByTestId} = render(<Test />);
      let child1 = getByTestId('child1');
      let child2 = getByTestId('child2');
      let child3 = getByTestId('child3');

      act(() => {jest.runAllTimers();});
      expect(document.activeElement).toBe(child1);
      userEvent.tab();
      act(() => {jest.runAllTimers();});
      expect(document.activeElement).toBe(child2);
      userEvent.tab();
      act(() => {jest.runAllTimers();});
      expect(document.activeElement).toBe(child3);
      userEvent.tab();
      act(() => {jest.runAllTimers();});
      expect(document.activeElement).toBe(child1);
      userEvent.tab({shift: true});
      act(() => {jest.runAllTimers();});
      expect(document.activeElement).toBe(child3);
    });

    it('should lock tab navigation inside nested child focus scope', function () {
      function Test() {
        return (
          <div>
            <input data-testid="outside" />
            <FocusScope autoFocus restoreFocus contain>
              <input data-testid="parent1" />
              <input data-testid="parent2" />
              <input data-testid="parent3" />
              <div>
                <div>
                  <FocusScope autoFocus restoreFocus contain>
                    <input data-testid="child1" />
                    <input data-testid="child2" />
                    <input data-testid="child3" />
                  </FocusScope>
                </div>
              </div>
            </FocusScope>
          </div>
        );
      }

      let {getByTestId} = render(<Test />);
      let child1 = getByTestId('child1');
      let child2 = getByTestId('child2');
      let child3 = getByTestId('child3');

      expect(document.activeElement).toBe(child1);
      userEvent.tab();
      expect(document.activeElement).toBe(child2);
      userEvent.tab();
      expect(document.activeElement).toBe(child3);
      userEvent.tab();
      expect(document.activeElement).toBe(child1);
      userEvent.tab({shift: true});
      expect(document.activeElement).toBe(child3);
    });

    it('should not lock tab navigation inside a nested focus scope without contain', function () {
      function Test() {
        return (
          <div>
            <input data-testid="outside" />
            <FocusScope autoFocus restoreFocus contain>
              <input data-testid="parent" />
              <div>
                <div>
                  <FocusScope>
                    <input data-testid="child1" />
                    <input data-testid="child2" />
                    <input data-testid="child3" />
                  </FocusScope>
                </div>
              </div>
            </FocusScope>
          </div>
        );
      }

      let {getByTestId} = render(<Test />);
      let parent = getByTestId('parent');
      let child1 = getByTestId('child1');
      let child2 = getByTestId('child2');
      let child3 = getByTestId('child3');

      expect(document.activeElement).toBe(parent);
      userEvent.tab();
      expect(document.activeElement).toBe(child1);
      userEvent.tab();
      expect(document.activeElement).toBe(child2);
      userEvent.tab();
      expect(document.activeElement).toBe(child3);
      userEvent.tab();
      expect(document.activeElement).toBe(parent);
      userEvent.tab({shift: true});
      expect(document.activeElement).toBe(child3);
    });

    it('should not lock tab navigation inside a nested focus scope with restore and not contain', function () {
      function Test() {
        return (
          <div>
            <input data-testid="outside" />
            <FocusScope autoFocus restoreFocus contain>
              <input data-testid="parent" />
              <div>
                <div>
                  <FocusScope restoreFocus>
                    <input data-testid="child1" />
                    <input data-testid="child2" />
                    <input data-testid="child3" />
                  </FocusScope>
                </div>
              </div>
            </FocusScope>
          </div>
        );
      }

      let {getByTestId} = render(<Test />);
      let parent = getByTestId('parent');
      let child1 = getByTestId('child1');
      let child2 = getByTestId('child2');
      let child3 = getByTestId('child3');

      expect(document.activeElement).toBe(parent);
      userEvent.tab();
      expect(document.activeElement).toBe(child1);
      userEvent.tab();
      expect(document.activeElement).toBe(child2);
      userEvent.tab();
      expect(document.activeElement).toBe(child3);
      userEvent.tab();
      expect(document.activeElement).toBe(parent);
      userEvent.tab({shift: true});
      expect(document.activeElement).toBe(child3);
    });

    it('should restore to the correct scope on unmount', function () {
      function Test({show1, show2, show3}) {
        return (
          <div>
            <input data-testid="outside" />
            <FocusScope autoFocus restoreFocus contain>
              <input data-testid="parent" />
              {show1 &&
                <FocusScope contain>
                  <input data-testid="child1" />
                  {show2 &&
                    <FocusScope contain>
                      <input data-testid="child2" />
                      {show3 &&
                        <FocusScope contain>
                          <input data-testid="child3" />
                        </FocusScope>
                      }
                    </FocusScope>
                  }
                </FocusScope>
              }
            </FocusScope>
          </div>
        );
      }

      let {rerender, getByTestId} = render(<Test />);
      let parent = getByTestId('parent');

      expect(document.activeElement).toBe(parent);

      act(() => rerender(<Test show1 />));
      expect(document.activeElement).toBe(parent);

      // Can move into a child, but not out.
      let child1 = getByTestId('child1');
      userEvent.tab();
      expect(document.activeElement).toBe(child1);

      act(() => parent.focus());
      expect(document.activeElement).toBe(child1);

      rerender(<Test show1 show2 />);
      expect(document.activeElement).toBe(child1);

      let child2 = getByTestId('child2');
      userEvent.tab();
      expect(document.activeElement).toBe(child2);

      act(() => child1.focus());
      expect(document.activeElement).toBe(child2);

      act(() => parent.focus());
      expect(document.activeElement).toBe(child2);

      rerender(<Test show1 show2 show3 />);

      let child3 = getByTestId('child3');
      userEvent.tab();
      expect(document.activeElement).toBe(child3);

      rerender(<Test show1 />);

      act(() => child1.focus());
      expect(document.activeElement).toBe(child1);

      act(() => parent.focus());
      expect(document.activeElement).toBe(child1);
    });

    it('should not lock focus inside a focus scope with a child scope in a portal', function () {
      function Portal(props) {
        return ReactDOM.createPortal(props.children, document.body);
      }

      function Test() {
        return (
          <div>
            <FocusScope autoFocus restoreFocus contain>
              <input data-testid="parent" />
              <div>
                <Portal>
                  <FocusScope>
                    <input data-testid="child" />
                  </FocusScope>
                </Portal>
              </div>
            </FocusScope>
          </div>
        );
      }

      let {getByTestId} = render(<Test />);
      let parent = getByTestId('parent');
      let child = getByTestId('child');

      expect(document.activeElement).toBe(parent);
      act(() => child.focus());
      expect(document.activeElement).toBe(child);
      act(() => parent.focus());
      expect(document.activeElement).toBe(parent);
    });

    it('should lock focus inside a child focus scope with contain in a portal', function () {
      function Portal(props) {
        return ReactDOM.createPortal(props.children, document.body);
      }

      function Test() {
        return (
          <div>
            <FocusScope autoFocus restoreFocus contain>
              <input data-testid="parent" />
              <div>
                <Portal>
                  <FocusScope contain>
                    <input data-testid="child" />
                  </FocusScope>
                </Portal>
              </div>
            </FocusScope>
          </div>
        );
      }

      let {getByTestId} = render(<Test />);
      let parent = getByTestId('parent');
      let child = getByTestId('child');

      expect(document.activeElement).toBe(parent);
      act(() => child.focus());
      expect(document.activeElement).toBe(child);
      act(() => parent.focus());
      expect(document.activeElement).toBe(child);
    });
  });

  describe('scope child of document.body', function () {
    it('should navigate in and out of scope in DOM order when the nodeToRestore is the document.body', function () {
      function Test() {
        return (
          <div>
            <input data-testid="beforeScope" />
            <FocusScope>
              <input data-testid="inScope" />
            </FocusScope>
            <input data-testid="afterScope" />
          </div>
        );
      }

      let {getByTestId} = render(<Test />);
      let beforeScope = getByTestId('beforeScope');
      let inScope = getByTestId('inScope');
      let afterScope = getByTestId('afterScope');

      act(() => {inScope.focus();});
      userEvent.tab();
      expect(document.activeElement).toBe(afterScope);
      act(() => {inScope.focus();});
      userEvent.tab({shift: true});
      expect(document.activeElement).toBe(beforeScope);
    });
  });
  describe('node to restore edge cases', () => {
    it('tracks node to restore if the node to restore was removed in another part of the tree', () => {
      function Test() {
        let [showMenu, setShowMenu] = useState(false);
        let [showDialog, setShowDialog] = useState(false);
        let onClick = () => {
          setShowMenu(false);
          setShowDialog(true);
        };
        return (
          <Provider theme={defaultTheme}>
            <label htmlFor="foo">Extra input to disambiguate focus</label>
            <input id="foo" />
            <FocusScope>
              <button onKeyDown={() => setShowMenu(true)}>Open Menu</button>
              <DialogContainer onDismiss={() => {}}>
                {showMenu && (
                  <FocusScope contain restoreFocus autoFocus>
                    <button onKeyDown={onClick}>Open Dialog</button>
                  </FocusScope>
                )}
              </DialogContainer>
            </FocusScope>
            <DialogContainer onDismiss={() => {}}>
              {showDialog && (
                <FocusScope contain restoreFocus autoFocus>
                  <button onKeyDown={() => setShowDialog(false)}>Close</button>
                </FocusScope>
              )}
            </DialogContainer>
          </Provider>
        );
      }

      render(<Test />);
      expect(document.activeElement).toBe(document.body);
      act(() => {
        jest.runAllTimers();
      });
      userEvent.tab();
      userEvent.tab();
      expect(document.activeElement.textContent).toBe('Open Menu');

      fireEvent.keyDown(document.activeElement, {key: 'Enter'});
      fireEvent.keyUp(document.activeElement, {key: 'Enter'});
      act(() => {
        jest.runAllTimers();
      });

      expect(document.activeElement.textContent).toBe('Open Dialog');

      fireEvent.keyDown(document.activeElement, {key: 'Enter'});
      fireEvent.keyUp(document.activeElement, {key: 'Enter'});

      // Needed for onBlur raf in useFocusContainment
      act(() => {
        jest.runAllTimers();
      });
      // Needed for useRestoreFocus layout cleanup raf
      act(() => {
        jest.runAllTimers();
      });

      expect(document.activeElement.textContent).toBe('Close');

      fireEvent.keyDown(document.activeElement, {key: 'Enter'});
      fireEvent.keyUp(document.activeElement, {key: 'Enter'});
      act(() => {
        jest.runAllTimers();
      });
      act(() => {
        jest.runAllTimers();
      });

      expect(document.activeElement).not.toBe(document.body);
      expect(document.activeElement.textContent).toBe('Open Menu');
    });
  });
});

describe('Unmounting cleanup', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  afterAll(() => {
    jest.runAllTimers();
  });

  // this test will fail in the 'afterAll' if there are any rafs left over
  it('should not leak request animation frames',  () => {
    let tree = render(
      <FocusScope restoreFocus contain>
        <button>Focus me</button>
        <button>Then Focus me</button>
      </FocusScope>
    );
    let buttons = tree.getAllByRole('button');
    act(() => buttons[0].focus());
    act(() => buttons[1].focus());
    act(() => buttons[1].blur());
  });
});
