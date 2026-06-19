/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, fireEvent, installPointerEvent, render} from '@react-spectrum/test-utils-internal';
import React from 'react';
import {useContextMenu} from '../../src/interactions/useContextMenu';

function Example(props) {
  let {contextMenuProps} = useContextMenu(props);
  return (
    <div {...contextMenuProps} tabIndex={0} style={{width: 100, height: 50}}>
      test
    </div>
  );
}

describe('useContextMenu', function () {
  let onContextMenu = jest.fn();

  afterEach(() => {
    onContextMenu.mockClear();
  });

  describe('mouse / right-click (contextmenu event)', function () {
    it('calls onContextMenu on right click', function () {
      let {getByText} = render(<Example onContextMenu={onContextMenu} />);
      let el = getByText('test');
      jest.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        top: 20,
        left: 10,
        right: 110,
        bottom: 70
      } as DOMRect);

      fireEvent.contextMenu(el, {clientX: 30, clientY: 40});

      expect(onContextMenu).toHaveBeenCalledTimes(1);
      expect(onContextMenu).toHaveBeenCalledWith({
        target: el,
        x: 20, // clientX - rect.x
        y: 20 // clientY - rect.y
      });
    });

    it('prevents default and stops propagation on contextmenu event', function () {
      let {getByText} = render(<Example onContextMenu={onContextMenu} />);
      let el = getByText('test');
      let event = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: 0,
        clientY: 0
      });
      let stopPropagation = jest.spyOn(event, 'stopPropagation');
      let preventDefault = jest.spyOn(event, 'preventDefault');

      el.dispatchEvent(event);

      expect(stopPropagation).toHaveBeenCalled();
      expect(preventDefault).toHaveBeenCalled();
    });

    it('does not call onContextMenu when prop is not provided', function () {
      let {getByText} = render(<Example />);
      let el = getByText('test');
      // Should not throw
      fireEvent.contextMenu(el, {clientX: 30, clientY: 40});
      expect(onContextMenu).not.toHaveBeenCalled();
    });
  });

  describe('macOS keyboard shortcut (Ctrl + Enter)', function () {
    let platformGetter;

    beforeAll(() => {
      jest.useFakeTimers();
      platformGetter = jest.spyOn(window.navigator, 'platform', 'get');
    });

    afterAll(() => {
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    beforeEach(() => {
      platformGetter.mockReturnValue('MacIntel');
    });

    it('triggers onContextMenu via Ctrl+Enter on macOS when no contextmenu event fires', function () {
      let {getByText} = render(<Example onContextMenu={onContextMenu} />);
      let el = getByText('test');
      jest.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        top: 0,
        left: 0,
        right: 100,
        bottom: 50
      } as DOMRect);

      fireEvent.keyDown(el, {key: 'Enter', ctrlKey: true});

      // Fires after a short timeout when no contextmenu event follows
      expect(onContextMenu).not.toHaveBeenCalled();
      act(() => jest.advanceTimersByTime(10));

      expect(onContextMenu).toHaveBeenCalledTimes(1);
      expect(onContextMenu).toHaveBeenCalledWith({
        target: el,
        x: 50, // rect.width / 2
        y: 25 // rect.height / 2
      });
    });

    it('does not double-fire when Ctrl+Enter also triggers a contextmenu event', function () {
      let {getByText} = render(<Example onContextMenu={onContextMenu} />);
      let el = getByText('test');

      fireEvent.keyDown(el, {key: 'Enter', ctrlKey: true});
      // Browser also fires contextmenu event
      fireEvent.contextMenu(el, {clientX: 0, clientY: 0});

      act(() => jest.advanceTimersByTime(10));

      expect(onContextMenu).toHaveBeenCalledTimes(1);
    });

    it('does not trigger on Ctrl+Enter on non-macOS', function () {
      platformGetter.mockReturnValue('Win32');
      let {getByText} = render(<Example onContextMenu={onContextMenu} />);
      let el = getByText('test');

      fireEvent.keyDown(el, {key: 'Enter', ctrlKey: true});
      act(() => jest.advanceTimersByTime(10));

      expect(onContextMenu).not.toHaveBeenCalled();
    });

    it('does not trigger on Enter without Ctrl on macOS', function () {
      let {getByText} = render(<Example onContextMenu={onContextMenu} />);
      let el = getByText('test');

      fireEvent.keyDown(el, {key: 'Enter', ctrlKey: false});
      act(() => jest.advanceTimersByTime(10));

      expect(onContextMenu).not.toHaveBeenCalled();
    });
  });

  describe('iOS long press', function () {
    installPointerEvent();

    let platformGetter;

    beforeAll(() => {
      jest.useFakeTimers();
      platformGetter = jest.spyOn(window.navigator, 'platform', 'get');
    });

    afterAll(() => {
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    beforeEach(() => {
      platformGetter.mockReturnValue('iPhone');
    });

    it('triggers onContextMenu via long press on iOS', function () {
      let {getByText} = render(<Example onContextMenu={onContextMenu} />);
      let el = getByText('test');

      fireEvent.pointerDown(el, {pointerType: 'touch', clientX: 10, clientY: 20});
      act(() => jest.advanceTimersByTime(500));
      fireEvent.pointerUp(el, {pointerType: 'touch', clientX: 10, clientY: 20});

      expect(onContextMenu).toHaveBeenCalledTimes(1);
      expect(onContextMenu).toHaveBeenCalledWith(
        expect.objectContaining({
          target: el
        })
      );
    });

    it('does not trigger if the press is cancelled before the long press threshold', function () {
      let {getByText} = render(<Example onContextMenu={onContextMenu} />);
      let el = getByText('test');

      fireEvent.pointerDown(el, {pointerType: 'touch', clientX: 10, clientY: 20});
      act(() => jest.advanceTimersByTime(200));
      fireEvent.pointerCancel(el, {pointerType: 'touch'});
      act(() => jest.advanceTimersByTime(400));

      expect(onContextMenu).not.toHaveBeenCalled();
    });

    it('does not double-fire when long press and contextmenu event both occur (Android)', function () {
      platformGetter.mockReturnValue('Android');
      let {getByText} = render(<Example onContextMenu={onContextMenu} />);
      let el = getByText('test');

      fireEvent.pointerDown(el, {pointerType: 'touch', clientX: 10, clientY: 20});
      act(() => jest.advanceTimersByTime(500));
      // Browser fires contextmenu event during long press
      fireEvent.contextMenu(el, {clientX: 10, clientY: 20});
      fireEvent.pointerUp(el, {pointerType: 'touch', clientX: 10, clientY: 20});

      expect(onContextMenu).toHaveBeenCalledTimes(1);
    });
  });
});
