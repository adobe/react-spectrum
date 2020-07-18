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
import {useHover} from '../';

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
    beforeEach(() => {
      global.PointerEvent = {};
    });

    afterEach(() => {
      delete global.PointerEvent;
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
      fireEvent(el, pointerEvent('pointerover', {pointerType: 'mouse'}));
      fireEvent(el, pointerEvent('pointerout', {pointerType: 'mouse'}));

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
      fireEvent(el, pointerEvent('pointerover', {pointerType: 'touch'}));
      fireEvent(el, pointerEvent('pointerout', {pointerType: 'touch'}));

      expect(events).toEqual([]);
    });

    it('should visually change component with pointer events', function () {
      let res = render(
        <Example />
      );
      let el = res.getByText('test');

      fireEvent(el, pointerEvent('pointerover', {pointerType: 'mouse'}));
      expect(el.textContent).toBe('test-hovered');

      fireEvent(el, pointerEvent('pointerout', {pointerType: 'mouse'}));
      expect(el.textContent).toBe('test');
    });

    it('should not visually change component when pointerType is touch', function () {
      let res = render(
        <Example />
      );
      let el = res.getByText('test');

      fireEvent(el, pointerEvent('pointerover', {pointerType: 'touch'}));
      expect(el.textContent).toBe('test');

      fireEvent(el, pointerEvent('pointerout', {pointerType: 'touch'}));
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
