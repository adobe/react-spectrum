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

import {fireEvent, render} from '@testing-library/react';
import React from 'react';
import {useMove} from '../';

const EXAMPLE_ELEMENT_TESTID = 'example';

function Example(props) {
  let moveProps = useMove(props);
  return <div tabIndex={-1} {...moveProps} data-testid={EXAMPLE_ELEMENT_TESTID}>{props.children}</div>;
}

describe('useMove', function () {
  // TODO test: end event has different target than start

  describe('mouse events', function () {
    beforeAll(() => {
      let oldMouseEvent = MouseEvent;
      global.MouseEvent = class FakeMouseEvent extends MouseEvent {
        constructor(name, init) {
          super(name, init);
          this._init = init;
        }
        get pageX() {
          return this._init.pageX;
        }
        get pageY() {
          return this._init.pageY;
        }
      };
      global.MouseEvent.oldMouseEvent = oldMouseEvent;
    });
    afterAll(() => {
      global.MouseEvent = global.MouseEvent.oldMouseEvent;
    });

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

      fireEvent.mouseDown(el, {pageX: 1, pageY: 30});
      expect(events).toStrictEqual([]);
      fireEvent.mouseMove(el, {pageX: 10, pageY: 25});
      expect(events).toStrictEqual([{type: 'movestart', pointerType: 'mouse'}, {type: 'move', pointerType: 'mouse', deltaX: 9, deltaY: -5}]);
      fireEvent.mouseUp(el);
      expect(events).toStrictEqual([{type: 'movestart', pointerType: 'mouse'}, {type: 'move', pointerType: 'mouse', deltaX: 9, deltaY: -5}, {type: 'moveend', pointerType: 'mouse'}]);
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

      fireEvent.mouseDown(el, {pageX: 1, pageY: 30});
      fireEvent.mouseUp(el);
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

      fireEvent.touchStart(el, {targetTouches: [{pageX: 1, pageY: 30}]});
      expect(events).toStrictEqual([]);
      fireEvent.touchMove(el, {targetTouches: [{pageX: 10, pageY: 25}]});
      expect(events).toStrictEqual([{type: 'movestart', pointerType: 'touch'}, {type: 'move', pointerType: 'touch', deltaX: 9, deltaY: -5}]);
      fireEvent.touchEnd(el);
      expect(events).toStrictEqual([{type: 'movestart', pointerType: 'touch'}, {type: 'move', pointerType: 'touch', deltaX: 9, deltaY: -5}, {type: 'moveend', pointerType: 'touch'}]);
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

      fireEvent.touchStart(el, {targetTouches: [{pageX: 1, pageY: 30}]});
      expect(events).toStrictEqual([]);
      fireEvent.touchMove(el, {targetTouches: [{pageX: 10, pageY: 25}]});
      expect(events).toStrictEqual([{type: 'movestart', pointerType: 'touch'}, {type: 'move', pointerType: 'touch', deltaX: 9, deltaY: -5}]);
      fireEvent.touchCancel(el);
      expect(events).toStrictEqual([{type: 'movestart', pointerType: 'touch'}, {type: 'move', pointerType: 'touch', deltaX: 9, deltaY: -5}, {type: 'moveend', pointerType: 'touch'}]);
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

      fireEvent.touchStart(el, {targetTouches: [{pageX: 1, pageY: 30}]});
      fireEvent.touchEnd(el);
      expect(events).toStrictEqual([]);
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

    fireEvent.touchStart(el, {targetTouches: [{pageX: 1, pageY: 30}]});
    expect(eventsChild).toStrictEqual([]);
    fireEvent.touchMove(el, {targetTouches: [{pageX: 10, pageY: 25}]});
    expect(eventsChild).toStrictEqual([{type: 'movestart', pointerType: 'touch'}, {type: 'move', pointerType: 'touch', deltaX: 9, deltaY: -5}]);
    fireEvent.touchEnd(el);
    expect(eventsChild).toStrictEqual([{type: 'movestart', pointerType: 'touch'}, {type: 'move', pointerType: 'touch', deltaX: 9, deltaY: -5}, {type: 'moveend', pointerType: 'touch'}]);
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
      expect(events).toStrictEqual([{type: 'movestart', pointerType: 'keyboard'}, {type: 'move', pointerType: 'keyboard', ...Result}, {type: 'moveend', pointerType: 'keyboard'}]);
    });

    // TODO should the arrow keys bubble through? should useMove call e.preventDefault()?

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
    beforeAll(() => {
      global.PointerEvent = class FakePointerEvent extends MouseEvent {
        constructor(name, init) {
          super(name, init);
          this._init = init;
        }
        get pointerType() {
          return this._init.pointerType;
        }
        get pageX() {
          return this._init.pageX;
        }
        get pageY() {
          return this._init.pageY;
        }
      };
    });
    afterAll(() => {
      delete global.PointerEvent;
    });

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

      fireEvent.pointerDown(el, {pointerType: 'pen', pageX: 1, pageY: 30});
      expect(events).toStrictEqual([]);
      fireEvent.pointerMove(el, {pointerType: 'pen', pageX: 10, pageY: 25});
      expect(events).toStrictEqual([{type: 'movestart', pointerType: 'pen'}, {type: 'move', pointerType: 'pen', deltaX: 9, deltaY: -5}]);
      fireEvent.pointerUp(el, {pointerType: 'pen'});
      expect(events).toStrictEqual([{type: 'movestart', pointerType: 'pen'}, {type: 'move', pointerType: 'pen', deltaX: 9, deltaY: -5}, {type: 'moveend', pointerType: 'pen'}]);
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

      fireEvent.pointerDown(el, {pointerType: 'pen', pageX: 1, pageY: 30});
      expect(events).toStrictEqual([]);
      fireEvent.pointerMove(el, {pointerType: 'pen', pageX: 10, pageY: 25});
      expect(events).toStrictEqual([{type: 'movestart', pointerType: 'pen'}, {type: 'move', pointerType: 'pen', deltaX: 9, deltaY: -5}]);
      fireEvent.pointerCancel(el, {pointerType: 'pen'});
      expect(events).toStrictEqual([{type: 'movestart', pointerType: 'pen'}, {type: 'move', pointerType: 'pen', deltaX: 9, deltaY: -5}, {type: 'moveend', pointerType: 'pen'}]);
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

      fireEvent.pointerDown(el, {pointerType: 'pen', pageX: 1, pageY: 30});
      fireEvent.pointerUp(el, {pointerType: 'pen'});
      expect(events).toStrictEqual([]);
    });
  });
});
