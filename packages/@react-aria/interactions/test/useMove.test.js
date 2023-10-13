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

import {act, fireEvent, installMouseEvent, installPointerEvent, render} from '@react-spectrum/test-utils';
import React from 'react';
import {useMove} from '../';

const EXAMPLE_ELEMENT_TESTID = 'example';

function Example(props) {
  let {moveProps} = useMove(props);
  return <div tabIndex={-1} {...moveProps} data-testid={EXAMPLE_ELEMENT_TESTID}>{props.children}</div>;
}

describe('useMove', function () {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    // for restoreTextSelection
    jest.runAllTimers();
  });
  let altKey = false;
  let ctrlKey = false;
  let metaKey = false;
  let shiftKey = false;
  let defaultModifiers = {altKey, ctrlKey, metaKey, shiftKey};

  describe('mouse events', function () {
    installMouseEvent();

    it('responds to mouse events', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let tree = render(
        <Example
          onMoveStart={addEvent}
          onMove={addEvent}
          onMoveEnd={addEvent} />
      );

      let el = tree.getByTestId(EXAMPLE_ELEMENT_TESTID);

      fireEvent.mouseDown(el, {button: 0, pageX: 1, pageY: 30});
      expect(events).toStrictEqual([]);
      fireEvent.mouseMove(el, {button: 0, pageX: 10, pageY: 25});
      expect(events).toStrictEqual([{type: 'movestart', pointerType: 'mouse', ...defaultModifiers}, {type: 'move', pointerType: 'mouse', deltaX: 9, deltaY: -5, ...defaultModifiers}]);
      fireEvent.mouseUp(el);
      expect(events).toStrictEqual([{type: 'movestart', pointerType: 'mouse', ...defaultModifiers}, {type: 'move', pointerType: 'mouse', deltaX: 9, deltaY: -5, ...defaultModifiers}, {type: 'moveend', pointerType: 'mouse', ...defaultModifiers}]);
    });

    it('doesn\'t respond to right click', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let tree = render(
        <Example
          onMoveStart={addEvent}
          onMove={addEvent}
          onMoveEnd={addEvent} />
      );

      let el = tree.getByTestId(EXAMPLE_ELEMENT_TESTID);

      fireEvent.mouseDown(el, {button: 2, pageX: 1, pageY: 30});
      expect(events).toStrictEqual([]);
      fireEvent.mouseMove(el, {button: 2, pageX: 10, pageY: 25});
      expect(events).toStrictEqual([]);
      fireEvent.mouseUp(el, {button: 2, pageX: 10, pageY: 25});
      expect(events).toStrictEqual([]);
    });

    it('doesn\'t fire anything when clicking', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let tree = render(
        <Example
          onMoveStart={addEvent}
          onMove={addEvent}
          onMoveEnd={addEvent} />
      );

      let el = tree.getByTestId(EXAMPLE_ELEMENT_TESTID);

      fireEvent.mouseDown(el, {button: 0, pageX: 1, pageY: 30});
      fireEvent.mouseUp(el, {button: 0, pageX: 1, pageY: 30});
      expect(events).toStrictEqual([]);
    });
  });

  describe('touch events', function () {
    it('responds to touch events', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let tree = render(
        <Example
          onMoveStart={addEvent}
          onMove={addEvent}
          onMoveEnd={addEvent} />
      );

      let el = tree.getByTestId(EXAMPLE_ELEMENT_TESTID);

      fireEvent.touchStart(el, {changedTouches: [{identifier: 1, pageX: 1, pageY: 30}]});
      expect(events).toStrictEqual([]);
      fireEvent.touchMove(el, {changedTouches: [{identifier: 1, pageX: 10, pageY: 25}]});
      expect(events).toStrictEqual([{type: 'movestart', pointerType: 'touch', ...defaultModifiers}, {type: 'move', pointerType: 'touch', deltaX: 9, deltaY: -5, ...defaultModifiers}]);
      fireEvent.touchEnd(el, {changedTouches: [{identifier: 1, pageX: 10, pageY: 25}]});
      expect(events).toStrictEqual([{type: 'movestart', pointerType: 'touch', ...defaultModifiers}, {type: 'move', pointerType: 'touch', deltaX: 9, deltaY: -5, ...defaultModifiers}, {type: 'moveend', pointerType: 'touch', ...defaultModifiers}]);
    });

    it('ends with touchcancel', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let tree = render(
        <Example
          onMoveStart={addEvent}
          onMove={addEvent}
          onMoveEnd={addEvent} />
      );

      let el = tree.getByTestId(EXAMPLE_ELEMENT_TESTID);

      fireEvent.touchStart(el, {changedTouches: [{identifier: 1, pageX: 1, pageY: 30}]});
      expect(events).toStrictEqual([]);
      fireEvent.touchMove(el, {changedTouches: [{identifier: 1, pageX: 10, pageY: 25}]});
      expect(events).toStrictEqual([{type: 'movestart', pointerType: 'touch', ...defaultModifiers}, {type: 'move', pointerType: 'touch', deltaX: 9, deltaY: -5, ...defaultModifiers}]);
      fireEvent.touchCancel(el, {changedTouches: [{identifier: 1, pageX: 10, pageY: 25}]});
      expect(events).toStrictEqual([{type: 'movestart', pointerType: 'touch', ...defaultModifiers}, {type: 'move', pointerType: 'touch', deltaX: 9, deltaY: -5, ...defaultModifiers}, {type: 'moveend', pointerType: 'touch', ...defaultModifiers}]);
    });

    it('doesn\'t fire anything when tapping', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let tree = render(
        <Example
          onMoveStart={addEvent}
          onMove={addEvent}
          onMoveEnd={addEvent} />
      );

      let el = tree.getByTestId(EXAMPLE_ELEMENT_TESTID);

      fireEvent.touchStart(el, {changedTouches: [{identifier: 1, pageX: 1, pageY: 30}]});
      fireEvent.touchEnd(el, {changedTouches: [{identifier: 1, pageX: 1, pageY: 30}]});
      expect(events).toStrictEqual([]);
    });

    it('ignores additional touches', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let tree = render(
        <Example
          onMoveStart={addEvent}
          onMove={addEvent}
          onMoveEnd={addEvent} />
      );

      let el = tree.getByTestId(EXAMPLE_ELEMENT_TESTID);

      fireEvent.touchStart(el, {changedTouches: [{identifier: 1, pageX: 1, pageY: 30}]});
      fireEvent.touchStart(el, {changedTouches: [{identifier: 2, pageX: 1, pageY: 30}]});
      fireEvent.touchMove(el, {changedTouches: [{identifier: 2, pageX: 10, pageY: 40}]});
      fireEvent.touchEnd(el, {changedTouches: [{identifier: 2, pageX: 10, pageY: 40}]});
      expect(events).toStrictEqual([]);
      fireEvent.touchMove(el, {changedTouches: [{identifier: 1, pageX: 10, pageY: 25}]});
      expect(events).toStrictEqual([{type: 'movestart', pointerType: 'touch', ...defaultModifiers}, {type: 'move', pointerType: 'touch', deltaX: 9, deltaY: -5, ...defaultModifiers}]);
      fireEvent.touchEnd(el, {changedTouches: [{identifier: 1, pageX: 10, pageY: 25}]});
      expect(events).toStrictEqual([{type: 'movestart', pointerType: 'touch', ...defaultModifiers}, {type: 'move', pointerType: 'touch', deltaX: 9, deltaY: -5, ...defaultModifiers}, {type: 'moveend', pointerType: 'touch', ...defaultModifiers}]);
    });
  });

  describe('user-select: none', () => {
    let mockUserSelect = 'contain';
    let oldUserSelect = document.documentElement.style.webkitUserSelect;
    let platformGetter;

    beforeAll(() => {
      platformGetter = jest.spyOn(window.navigator, 'platform', 'get');
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    beforeEach(() => {
      document.documentElement.style.webkitUserSelect = mockUserSelect;
      platformGetter.mockReturnValue('iPhone');
    });
    afterEach(() => {
      document.documentElement.style.webkitUserSelect = oldUserSelect;
    });

    it('adds and removes user-select: none to the body (iOS)', function () {
      let tree = render(
        <Example
          onMoveStart={() => {}}
          onMove={() => {}}
          onMoveEnd={() => {}} />
      );

      let el = tree.getByTestId(EXAMPLE_ELEMENT_TESTID);

      expect(document.documentElement.style.webkitUserSelect).toBe(mockUserSelect);
      fireEvent.touchStart(el, {changedTouches: [{identifier: 1, pageX: 1, pageY: 30}]});
      expect(document.documentElement.style.webkitUserSelect).toBe('none');
      fireEvent.touchMove(el, {changedTouches: [{identifier: 1, pageX: 10, pageY: 25}]});
      expect(document.documentElement.style.webkitUserSelect).toBe('none');
      fireEvent.touchEnd(el, {changedTouches: [{identifier: 1, pageX: 10, pageY: 25}]});
      expect(document.documentElement.style.webkitUserSelect).toBe('none');
      act(() => {jest.advanceTimersByTime(316);});
      expect(document.documentElement.style.webkitUserSelect).toBe(mockUserSelect);
    });

    it('doesn\'t add user-select: none to the body (non-iOS)', function () {
      platformGetter.mockReturnValue('Android');
      let tree = render(
        <Example
          onMoveStart={() => {}}
          onMove={() => {}}
          onMoveEnd={() => {}} />
      );

      let el = tree.getByTestId(EXAMPLE_ELEMENT_TESTID);

      expect(document.documentElement.style.webkitUserSelect).toBe(mockUserSelect);
      fireEvent.touchStart(el, {changedTouches: [{identifier: 1, pageX: 1, pageY: 30}]});
      expect(document.documentElement.style.webkitUserSelect).toBe(mockUserSelect);
      fireEvent.touchMove(el, {changedTouches: [{identifier: 1, pageX: 10, pageY: 25}]});
      expect(document.documentElement.style.webkitUserSelect).toBe(mockUserSelect);
      fireEvent.touchEnd(el, {changedTouches: [{identifier: 1, pageX: 10, pageY: 25}]});
      expect(document.documentElement.style.webkitUserSelect).toBe(mockUserSelect);
    });
  });

  it('doesn\'t bubble to useMove on parent elements', function () {
    let eventsChild = [];
    let eventsParent = [];
    let addEventChild = (e) => eventsChild.push(e);
    let addEventParent = (e) => eventsParent.push(e);
    let tree = render(
      <Example
        onMoveStart={addEventParent}
        onMove={addEventParent}
        onMoveEnd={addEventParent} >
        <Example
          onMoveStart={addEventChild}
          onMove={addEventChild}
          onMoveEnd={addEventChild} />
      </Example>
    );

    let [, el] = tree.getAllByTestId(EXAMPLE_ELEMENT_TESTID);

    fireEvent.touchStart(el, {changedTouches: [{identifier: 1, pageX: 1, pageY: 30}]});
    expect(eventsChild).toStrictEqual([]);
    fireEvent.touchMove(el, {changedTouches: [{identifier: 1, pageX: 10, pageY: 25}]});
    expect(eventsChild).toStrictEqual([{type: 'movestart', pointerType: 'touch', ...defaultModifiers}, {type: 'move', pointerType: 'touch', deltaX: 9, deltaY: -5, ...defaultModifiers}]);
    fireEvent.touchEnd(el, {changedTouches: [{identifier: 1, pageX: 10, pageY: 25}]});
    expect(eventsChild).toStrictEqual([{type: 'movestart', pointerType: 'touch', ...defaultModifiers}, {type: 'move', pointerType: 'touch', deltaX: 9, deltaY: -5, ...defaultModifiers}, {type: 'moveend', pointerType: 'touch', ...defaultModifiers}]);
    expect(eventsParent).toStrictEqual([]);

  });

  describe('keypresses', function () {
    it.each`
      Key              | Result
      ${'ArrowUp'}     | ${{deltaX: 0, deltaY: -1}}
      ${'ArrowDown'}   | ${{deltaX: 0, deltaY: 1}}
      ${'ArrowLeft'}   | ${{deltaX: -1, deltaY: 0}}
      ${'ArrowRight'}  | ${{deltaX: 1, deltaY: 0}}
    `('responds to keypresses: $Key', function ({Key, Result}) {
      let events = [];
      let addEvent = (e) => events.push(e);
      let tree = render(
        <Example
          onMoveStart={addEvent}
          onMove={addEvent}
          onMoveEnd={addEvent} />
      );

      let el = tree.getByTestId(EXAMPLE_ELEMENT_TESTID);

      fireEvent.keyDown(el, {key: Key});
      expect(events).toStrictEqual([{type: 'movestart', pointerType: 'keyboard', ...defaultModifiers}, {type: 'move', pointerType: 'keyboard', ...defaultModifiers, ...Result}, {type: 'moveend', pointerType: 'keyboard', ...defaultModifiers}]);
    });

    it('allows handling other key events', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let tree = render(
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div onKeyDown={e => addEvent({type: e.type, key: e.key})}>
          <Example
            onMoveStart={addEvent}
            onMove={addEvent}
            onMoveEnd={addEvent} />
        </div>
      );

      let el = tree.getByTestId(EXAMPLE_ELEMENT_TESTID);

      fireEvent.keyDown(el, {key: 'PageUp'});
      expect(events).toStrictEqual([{type: 'keydown', key: 'PageUp'}]);
    });
  });

  describe('pointer events', function () {
    installPointerEvent();

    it('responds to pointer events', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let tree = render(
        <Example
          onMoveStart={addEvent}
          onMove={addEvent}
          onMoveEnd={addEvent} />
      );

      let el = tree.getByTestId(EXAMPLE_ELEMENT_TESTID);

      fireEvent.pointerDown(el, {pointerType: 'pen', pointerId: 1, pageX: 1, pageY: 30});
      expect(events).toStrictEqual([]);
      fireEvent.pointerMove(el, {pointerType: 'pen', pointerId: 1, pageX: 10, pageY: 25});
      expect(events).toStrictEqual([{type: 'movestart', pointerType: 'pen', ...defaultModifiers}, {type: 'move', pointerType: 'pen', deltaX: 9, deltaY: -5, ...defaultModifiers}]);
      fireEvent.pointerUp(el, {pointerType: 'pen', pointerId: 1});
      expect(events).toStrictEqual([{type: 'movestart', pointerType: 'pen', ...defaultModifiers}, {type: 'move', pointerType: 'pen', deltaX: 9, deltaY: -5, ...defaultModifiers}, {type: 'moveend', pointerType: 'pen', ...defaultModifiers}]);
    });

    it('doesn\'t respond to right click', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let tree = render(
        <Example
          onMoveStart={addEvent}
          onMove={addEvent}
          onMoveEnd={addEvent} />
      );

      let el = tree.getByTestId(EXAMPLE_ELEMENT_TESTID);

      fireEvent.pointerDown(el, {pointerType: 'pen', pointerId: 1, pageX: 1, pageY: 30, button: 2});
      expect(events).toStrictEqual([]);
      fireEvent.pointerMove(el, {pointerType: 'pen', pointerId: 1, pageX: 10, pageY: 25, button: 2});
      expect(events).toStrictEqual([]);
      fireEvent.pointerUp(el, {pointerType: 'pen', pointerId: 1, pageX: 10, pageY: 25, button: 2});
      expect(events).toStrictEqual([]);
    });

    it('ends with pointercancel', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let tree = render(
        <Example
          onMoveStart={addEvent}
          onMove={addEvent}
          onMoveEnd={addEvent} />
      );

      let el = tree.getByTestId(EXAMPLE_ELEMENT_TESTID);

      fireEvent.pointerDown(el, {pointerType: 'pen', pointerId: 1, pageX: 1, pageY: 30});
      expect(events).toStrictEqual([]);
      fireEvent.pointerMove(el, {pointerType: 'pen', pointerId: 1, pageX: 10, pageY: 25});
      expect(events).toStrictEqual([{type: 'movestart', pointerType: 'pen', ...defaultModifiers}, {type: 'move', pointerType: 'pen', deltaX: 9, deltaY: -5, ...defaultModifiers}]);
      fireEvent.pointerCancel(el, {pointerType: 'pen', pointerId: 1});
      expect(events).toStrictEqual([{type: 'movestart', pointerType: 'pen', ...defaultModifiers}, {type: 'move', pointerType: 'pen', deltaX: 9, deltaY: -5, ...defaultModifiers}, {type: 'moveend', pointerType: 'pen', ...defaultModifiers}]);
    });

    it('doesn\'t fire anything when tapping', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let tree = render(
        <Example
          onMoveStart={addEvent}
          onMove={addEvent}
          onMoveEnd={addEvent} />
      );

      let el = tree.getByTestId(EXAMPLE_ELEMENT_TESTID);

      fireEvent.pointerDown(el, {pointerType: 'pen', pointerId: 1, pageX: 1, pageY: 30});
      fireEvent.pointerUp(el, {pointerType: 'pen', pointerId: 1, pageX: 1, pageY: 30});
      expect(events).toStrictEqual([]);
    });

    it('ignores any additional pointers', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let tree = render(
        <Example
          onMoveStart={addEvent}
          onMove={addEvent}
          onMoveEnd={addEvent} />
      );

      let el = tree.getByTestId(EXAMPLE_ELEMENT_TESTID);

      fireEvent.pointerDown(el, {pointerType: 'pen', pointerId: 1, pageX: 1, pageY: 30});

      fireEvent.pointerDown(el, {pointerType: 'pen', pointerId: 3, pageX: 1, pageY: 30});
      fireEvent.pointerMove(el, {pointerType: 'pen', pointerId: 3, pageX: 1, pageY: 40});
      fireEvent.pointerUp(el, {pointerType: 'pen', pointerId: 3, pageX: 1, pageY: 40});

      expect(events).toStrictEqual([]);
      fireEvent.pointerMove(el, {pointerType: 'pen', pointerId: 1, pageX: 10, pageY: 25});
      expect(events).toStrictEqual([{type: 'movestart', pointerType: 'pen', ...defaultModifiers}, {type: 'move', pointerType: 'pen', deltaX: 9, deltaY: -5, ...defaultModifiers}]);
      fireEvent.pointerUp(el, {pointerType: 'pen', pointerId: 1});
      expect(events).toStrictEqual([{type: 'movestart', pointerType: 'pen', ...defaultModifiers}, {type: 'move', pointerType: 'pen', deltaX: 9, deltaY: -5, ...defaultModifiers}, {type: 'moveend', pointerType: 'pen', ...defaultModifiers}]);
    });
  });
});
