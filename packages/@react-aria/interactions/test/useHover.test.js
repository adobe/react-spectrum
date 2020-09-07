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

import {clearGlobalIgnoreEmulatedMouseEvents, useHover} from '../';
import {fireEvent, render} from '@testing-library/react';
import React from 'react';

function Example(props) {
  let {hoverProps, isHovered} = useHover(props);
  return <div {...hoverProps}>test{isHovered && '-hovered'}</div>;
}

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

describe('useHover', function () {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    clearGlobalIgnoreEmulatedMouseEvents();
  });

  it('does not handle hover events if disabled', function () {
    let events = [];
    let addEvent = (e) => events.push(e);
    let res = render(
      <Example
        isDisabled
        onHoverEnd={addEvent}
        onHoverChange={isHovering => addEvent({type: 'hoverchange', isHovering})}
        onHoverStart={addEvent} />
    );

    let el = res.getByText('test');
    fireEvent.mouseEnter(el);
    fireEvent.mouseLeave(el);

    expect(events).toEqual([]);
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
      };
      document.defaultView.Element.prototype.onpointercancel = null;
      document.defaultView.Element.prototype.onpointerdown = null;
      document.defaultView.Element.prototype.onpointerenter = null;
      document.defaultView.Element.prototype.onpointerleave = null;
      document.defaultView.Element.prototype.onpointermove = null;
      document.defaultView.Element.prototype.onpointerout = null;
      document.defaultView.Element.prototype.onpointerover = null;
      document.defaultView.Element.prototype.onpointerup = null;
    });

    afterAll(() => {
      delete global.PointerEvent;
      delete document.defaultView.Element.prototype.onpointercancel;
      delete document.defaultView.Element.prototype.onpointerdown;
      delete document.defaultView.Element.prototype.onpointerenter;
      delete document.defaultView.Element.prototype.onpointerleave;
      delete document.defaultView.Element.prototype.onpointermove;
      delete document.defaultView.Element.prototype.onpointerout;
      delete document.defaultView.Element.prototype.onpointerover;
      delete document.defaultView.Element.prototype.onpointerup;
    });

    it('should fire hover events based on pointer events', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          onHoverStart={addEvent}
          onHoverEnd={addEvent}
          onHoverChange={isHovering => addEvent({type: 'hoverchange', isHovering})} />
      );

      let el = res.getByText('test');
      // This is what userEvent.hover + unhover does, but without the mouse events
      fireEvent.pointerOver(el, {pointerType: 'mouse'});
      fireEvent.pointerEnter(el, {pointerType: 'mouse'});
      fireEvent.pointerMove(el, {pointerType: 'mouse'});
      fireEvent.pointerOut(el, {pointerType: 'mouse'});
      fireEvent.pointerLeave(el, {pointerType: 'mouse'});

      expect(events).toEqual([
        {
          type: 'hoverstart',
          target: el,
          pointerType: 'mouse'
        },
        {
          type: 'hoverchange',
          isHovering: true
        },
        {
          type: 'hoverend',
          target: el,
          pointerType: 'mouse'
        },
        {
          type: 'hoverchange',
          isHovering: false
        }
      ]);
    });

    it('should not fire hover events when pointerType is touch', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          onHoverStart={addEvent}
          onHoverEnd={addEvent}
          onHoverChange={isHovering => addEvent({type: 'hoverchange', isHovering})} />
      );

      let el = res.getByText('test');
      // This is what userEvent.hover + unhover does, but without the mouse events
      fireEvent.pointerOver(el, {pointerType: 'touch'});
      fireEvent.pointerEnter(el, {pointerType: 'touch'});
      fireEvent.pointerMove(el, {pointerType: 'touch'});
      fireEvent.pointerOut(el, {pointerType: 'touch'});
      fireEvent.pointerLeave(el, {pointerType: 'touch'});

      expect(events).toEqual([]);
    });

    it('ignores emulated mouse events following touch events', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          onHoverStart={addEvent}
          onHoverEnd={addEvent}
          onHoverChange={isHovering => addEvent({type: 'hoverchange', isHovering})} />
      );

      let el = res.getByText('test');
      fireEvent.pointerOver(el, {pointerType: 'touch'});
      fireEvent.pointerEnter(el, {pointerType: 'touch'});
      fireEvent.pointerDown(el, {pointerType: 'touch'});
      fireEvent.pointerMove(el, {pointerType: 'touch'});
      fireEvent.pointerUp(el, {pointerType: 'touch'});
      fireEvent.pointerOut(el, {pointerType: 'touch'});
      fireEvent.pointerLeave(el, {pointerType: 'touch'});

      // Safari on iOS has a bug that fires a pointer event with pointerType="mouse" on focus.
      // See https://bugs.webkit.org/show_bug.cgi?id=214609.

      // This is what userEvent.hover + unhover does, but without the mouse events
      fireEvent.pointerOver(el, {pointerType: 'mouse'});
      fireEvent.pointerEnter(el, {pointerType: 'mouse'});
      fireEvent.pointerMove(el, {pointerType: 'mouse'});
      fireEvent.pointerOut(el, {pointerType: 'mouse'});
      fireEvent.pointerLeave(el, {pointerType: 'mouse'});

      expect(events).toEqual([]);
    });

    it('ignores supports mouse events following touch events after a delay', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          onHoverStart={addEvent}
          onHoverEnd={addEvent}
          onHoverChange={isHovering => addEvent({type: 'hoverchange', isHovering})} />
      );

      let el = res.getByText('test');
      fireEvent.pointerOver(el, {pointerType: 'touch'});
      fireEvent.pointerEnter(el, {pointerType: 'touch'});
      fireEvent.pointerDown(el, {pointerType: 'touch'});
      fireEvent.pointerMove(el, {pointerType: 'touch'});
      fireEvent.pointerUp(el, {pointerType: 'touch'});
      fireEvent.pointerOut(el, {pointerType: 'touch'});
      fireEvent.pointerLeave(el, {pointerType: 'touch'});

      jest.advanceTimersByTime(100);

      // Safari on iOS has a bug that fires a pointer event with pointerType="mouse" on focus.
      // See https://bugs.webkit.org/show_bug.cgi?id=214609.

      // This is what userEvent.hover + unhover does, but without the mouse events
      fireEvent.pointerOver(el, {pointerType: 'mouse'});
      fireEvent.pointerEnter(el, {pointerType: 'mouse'});
      fireEvent.pointerMove(el, {pointerType: 'mouse'});
      fireEvent.pointerOut(el, {pointerType: 'mouse'});
      fireEvent.pointerLeave(el, {pointerType: 'mouse'});

      expect(events).toEqual([
        {
          type: 'hoverstart',
          target: el,
          pointerType: 'mouse'
        },
        {
          type: 'hoverchange',
          isHovering: true
        },
        {
          type: 'hoverend',
          target: el,
          pointerType: 'mouse'
        },
        {
          type: 'hoverchange',
          isHovering: false
        }
      ]);
    });

    it('should visually change component with pointer events', function () {
      let res = render(
        <Example />
      );
      let el = res.getByText('test');

      fireEvent.pointerOver(el, {pointerType: 'mouse'});
      fireEvent.pointerEnter(el, {pointerType: 'mouse'});
      fireEvent.pointerMove(el, {pointerType: 'mouse'});
      expect(el.textContent).toBe('test-hovered');

      fireEvent.pointerOut(el, {pointerType: 'mouse'});
      fireEvent.pointerLeave(el, {pointerType: 'mouse'});
      expect(el.textContent).toBe('test');
    });

    it('should not visually change component when pointerType is touch', function () {
      let res = render(
        <Example />
      );
      let el = res.getByText('test');

      fireEvent.pointerOver(el, {pointerType: 'touch'});
      fireEvent.pointerEnter(el, {pointerType: 'touch'});
      fireEvent.pointerMove(el, {pointerType: 'touch'});
      expect(el.textContent).toBe('test');

      fireEvent.pointerOut(el, {pointerType: 'touch'});
      fireEvent.pointerLeave(el, {pointerType: 'touch'});
      expect(el.textContent).toBe('test');
    });
  });

  describe('mouse events', function () {
    it('should fire hover events based on mouse events', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          onHoverEnd={addEvent}
          onHoverChange={isHovering => addEvent({type: 'hoverchange', isHovering})}
          onHoverStart={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent.mouseEnter(el);
      fireEvent.mouseLeave(el);

      expect(events).toEqual([
        {
          type: 'hoverstart',
          target: el,
          pointerType: 'mouse'
        },
        {
          type: 'hoverchange',
          isHovering: true
        },
        {
          type: 'hoverend',
          target: el,
          pointerType: 'mouse'
        },
        {
          type: 'hoverchange',
          isHovering: false
        }
      ]);
    });

    it('should visually change component with mouse events', function () {
      let res = render(
        <Example />
      );
      let el = res.getByText('test');

      fireEvent.mouseEnter(el);
      expect(el.textContent).toBe('test-hovered');

      fireEvent.mouseLeave(el);
      expect(el.textContent).toBe('test');
    });

    it('ignores emulated mouse events following touch events', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          onHoverStart={addEvent}
          onHoverEnd={addEvent}
          onHoverChange={isHovering => addEvent({type: 'hoverchange', isHovering})} />
      );

      let el = res.getByText('test');
      fireEvent.touchStart(el);
      fireEvent.mouseEnter(el);
      fireEvent.mouseLeave(el);
      fireEvent.touchEnd(el);

      // Safari on iOS has a bug that fires a mouse event on focus.
      // See https://bugs.webkit.org/show_bug.cgi?id=214609.
      fireEvent.mouseEnter(el);
      fireEvent.mouseLeave(el);

      expect(events).toEqual([]);
    });

    it('ignores supports mouse events following touch events after a delay', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          onHoverStart={addEvent}
          onHoverEnd={addEvent}
          onHoverChange={isHovering => addEvent({type: 'hoverchange', isHovering})} />
      );

      let el = res.getByText('test');
      fireEvent.touchStart(el);
      fireEvent.mouseEnter(el);
      fireEvent.mouseLeave(el);
      fireEvent.touchEnd(el);

      jest.advanceTimersByTime(100);

      // Safari on iOS has a bug that fires a mouse event on focus.
      // See https://bugs.webkit.org/show_bug.cgi?id=214609.
      fireEvent.mouseEnter(el);
      fireEvent.mouseLeave(el);

      expect(events).toEqual([
        {
          type: 'hoverstart',
          target: el,
          pointerType: 'mouse'
        },
        {
          type: 'hoverchange',
          isHovering: true
        },
        {
          type: 'hoverend',
          target: el,
          pointerType: 'mouse'
        },
        {
          type: 'hoverchange',
          isHovering: false
        }
      ]);
    });
  });

  describe('touch events', function () {
    it('should not fire hover events based on touch events', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          onHoverEnd={addEvent}
          onHoverChange={isHovering => addEvent({type: 'hoverchange', isHovering})}
          onHoverStart={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent.touchStart(el);
      fireEvent.touchMove(el);
      fireEvent.touchEnd(el);
      fireEvent.mouseEnter(el);
      fireEvent.mouseLeave(el);

      expect(events).toEqual([]);
    });

    it('should not visually change component with touch events', function () {
      let res = render(
        <Example />
      );
      let el = res.getByText('test');

      fireEvent.touchStart(el);
      expect(el.textContent).toBe('test');

      fireEvent.touchMove(el);
      expect(el.textContent).toBe('test');

      fireEvent.touchEnd(el);
      expect(el.textContent).toBe('test');

      fireEvent.mouseEnter(el);
      expect(el.textContent).toBe('test');

      fireEvent.mouseLeave(el);
      expect(el.textContent).toBe('test');
    });
  });
});
