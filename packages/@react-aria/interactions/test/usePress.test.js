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

import {act, fireEvent, render} from '@testing-library/react';
import {ActionButton} from '@react-spectrum/button';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {installMouseEvent, installPointerEvent} from '@react-spectrum/test-utils';
import MatchMediaMock from 'jest-matchmedia-mock';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';
import {usePress} from '../';

function Example(props) {
  let {elementType: ElementType = 'div', ...otherProps} = props;
  let {pressProps} = usePress(otherProps);
  return <ElementType {...pressProps} tabIndex="0">test</ElementType>;
}

function pointerEvent(type, opts) {
  let evt = new Event(type, {bubbles: true, cancelable: true});
  Object.assign(evt, {
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    altKey: false,
    button: opts.button || 0,
    width: 1,
    height: 1
  }, opts);
  return evt;
}

describe('usePress', function () {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());
  });

  afterAll(() => {
    jest.useRealTimers();
    window.requestAnimationFrame.mockRestore();
  });

  afterEach(() => {
    jest.runAllTimers();
  });

  // TODO: JSDOM doesn't yet support pointer events. Once they do, convert these tests.
  // https://github.com/jsdom/jsdom/issues/2527
  describe('pointer events', function () {
    installPointerEvent();

    it('should fire press events based on pointer events', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent}
          onPressUp={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent(el, pointerEvent('pointerdown', {pointerId: 1, pointerType: 'mouse'}));
      fireEvent(el, pointerEvent('pointerup', {pointerId: 1, pointerType: 'mouse', clientX: 0, clientY: 0}));

      // How else to get the DOM node it renders the hook to?
      // let el = events[0].target;
      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressup',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'press',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        }
      ]);
    });

    it('should fire press change events when moving pointer outside target', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent}
          onPressUp={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent(el, pointerEvent('pointerdown', {pointerId: 1, pointerType: 'mouse'}));
      fireEvent(el, pointerEvent('pointermove', {pointerId: 1, pointerType: 'mouse', clientX: 100, clientY: 100}));
      fireEvent(el, pointerEvent('pointerup', {pointerId: 1, pointerType: 'mouse', clientX: 100, clientY: 100}));
      fireEvent(el, pointerEvent('pointermove', {pointerId: 1, pointerType: 'mouse', clientX: 0, clientY: 0}));

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        }
      ]);

      events = [];
      fireEvent(el, pointerEvent('pointerdown', {pointerId: 1, pointerType: 'mouse'}));
      fireEvent(el, pointerEvent('pointermove', {pointerId: 1, pointerType: 'mouse', clientX: 100, clientY: 100}));
      fireEvent(el, pointerEvent('pointermove', {pointerId: 1, pointerType: 'mouse', clientX: 0, clientY: 0}));
      fireEvent(el, pointerEvent('pointerup', {pointerId: 1, pointerType: 'mouse', clientX: 0, clientY: 0}));

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'pressstart',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressup',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'press',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        }
      ]);
    });

    it('should handle pointer cancel events', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent}
          onPressUp={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent(el, pointerEvent('pointerdown', {pointerId: 1, pointerType: 'mouse'}));
      fireEvent(el, pointerEvent('pointercancel', {pointerId: 1, pointerType: 'mouse'}));

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        }
      ]);
    });

    it('should cancel press on dragstart', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent}
          onPressUp={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent(el, pointerEvent('pointerdown', {pointerId: 1, pointerType: 'mouse'}));
      fireEvent(el, new MouseEvent('dragstart', {bubbles: true, cancelable: true, composed: true}));

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        }
      ]);
    });

    it('should cancel press when moving outside and the shouldCancelOnPointerExit option is set', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          shouldCancelOnPointerExit
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent}
          onPressUp={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent(el, pointerEvent('pointerdown', {pointerId: 1, pointerType: 'mouse'}));
      fireEvent(el, pointerEvent('pointermove', {pointerId: 1, pointerType: 'mouse', clientX: 100, clientY: 100}));
      fireEvent(el, pointerEvent('pointermove', {pointerId: 1, pointerType: 'mouse', clientX: 0, clientY: 0}));

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        }
      ]);
    });

    it('should handle modifier keys', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent}
          onPressUp={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent(el, pointerEvent('pointerdown', {pointerId: 1, pointerType: 'mouse', shiftKey: true}));
      fireEvent(el, pointerEvent('pointerup', {pointerId: 1, pointerType: 'mouse', ctrlKey: true, clientX: 0, clientY: 0}));

      // How else to get the DOM node it renders the hook to?
      // let el = events[0].target;
      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: true,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressup',
          target: el,
          pointerType: 'mouse',
          ctrlKey: true,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'mouse',
          ctrlKey: true,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'press',
          target: el,
          pointerType: 'mouse',
          ctrlKey: true,
          metaKey: false,
          shiftKey: false,
          altKey: false
        }
      ]);
    });

    it('should only handle left clicks', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent}
          onPressUp={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent(el, pointerEvent('pointerdown', {pointerId: 1, pointerType: 'mouse', button: 1}));
      fireEvent(el, pointerEvent('pointerup', {pointerId: 1, pointerType: 'mouse', button: 1, clientX: 0, clientY: 0}));
      expect(events).toEqual([]);
    });

    it('should not focus the target on click if preventFocusOnPress is true', function () {
      let res = render(
        <Example preventFocusOnPress />
      );

      let el = res.getByText('test');
      fireEvent(el, pointerEvent('pointerdown', {pointerId: 1, pointerType: 'mouse'}));
      fireEvent(el, pointerEvent('pointerup', {pointerId: 1, pointerType: 'mouse', clientX: 0, clientY: 0}));
      expect(document.activeElement).not.toBe(el);
    });

    it('should focus the target on click by default', function () {
      let res = render(
        <Example />
      );

      let el = res.getByText('test');
      fireEvent(el, pointerEvent('pointerdown', {pointerId: 1, pointerType: 'mouse'}));
      fireEvent(el, pointerEvent('pointerup', {pointerId: 1, pointerType: 'mouse', clientX: 0, clientY: 0}));
      expect(document.activeElement).toBe(el);
    });

    it('should prevent default on pointerdown and mousedown by default', function () {
      let res = render(
        <Example />
      );

      let el = res.getByText('test');
      let allowDefault = fireEvent(el, pointerEvent('pointerdown', {pointerId: 1, pointerType: 'mouse'}));
      expect(allowDefault).toBe(false);

      allowDefault = fireEvent.mouseDown(el);
      expect(allowDefault).toBe(false);
    });

    it('should not prevent default when in a draggable container', function () {
      let res = render(
        <div draggable="true">
          <Example />
        </div>
      );

      let el = res.getByText('test');
      let allowDefault = fireEvent(el, pointerEvent('pointerdown', {pointerId: 1, pointerType: 'mouse'}));
      expect(allowDefault).toBe(true);

      allowDefault = fireEvent.mouseDown(el);
      expect(allowDefault).toBe(true);
    });

    it('should ignore virtual pointer events', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPress={addEvent}
          onPressUp={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent(el, pointerEvent('pointerdown', {pointerId: 1, pointerType: 'mouse', width: 0, height: 0}));
      fireEvent(el, pointerEvent('pointerup', {pointerId: 1, pointerType: 'mouse', width: 0, height: 0, clientX: 0, clientY: 0}));

      expect(events).toEqual([]);

      fireEvent.click(el);
      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el,
          pointerType: 'virtual',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'pressup',
          target: el,
          pointerType: 'virtual',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'virtual',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'press',
          target: el,
          pointerType: 'virtual',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        }
      ]);
    });

    it('should not fire press events for disabled elements', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          isDisabled
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent}
          onPressUp={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent(el, pointerEvent('pointerdown', {pointerId: 1, pointerType: 'mouse'}));
      fireEvent(el, pointerEvent('pointerup', {pointerId: 1, pointerType: 'mouse', clientX: 0, clientY: 0}));

      expect(events).toEqual([]);
    });

    it('should fire press event when pointerup close to the target', function () {
      let spy = jest.fn();
      let res = render(<Example onPress={spy} />);

      let el = res.getByText('test');
      fireEvent(el, pointerEvent('pointerdown', {pointerId: 1, pointerType: 'mouse', clientX: 0, clientY: 0, width: 20, height: 20}));
      fireEvent(el, pointerEvent('pointermove', {pointerId: 1, pointerType: 'mouse', clientX: 10, clientY: 10, width: 20, height: 20}));
      fireEvent(el, pointerEvent('pointerup', {pointerId: 1, pointerType: 'mouse', clientX: 10, clientY: 10, width: 20, height: 20}));

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('mouse events', function () {
    it('should fire press events based on mouse events', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent}
          onPressUp={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent.mouseDown(el, {detail: 1});
      fireEvent.mouseUp(el, {detail: 1});
      fireEvent.click(el, {detail: 1});

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressup',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'press',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        }
      ]);
    });

    it('should fire press change events when moving mouse outside target', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent}
          onPressUp={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent.mouseDown(el, {detail: 1});
      fireEvent.mouseLeave(el);
      fireEvent.mouseUp(document.body, {detail: 1, clientX: 100, clientY: 100});
      fireEvent.mouseEnter(el);

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        }
      ]);

      events = [];
      fireEvent.mouseDown(el, {detail: 1});
      fireEvent.mouseLeave(el);
      fireEvent.mouseEnter(el);
      fireEvent.mouseUp(el, {detail: 1});
      fireEvent.click(el, {detail: 1});

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'pressstart',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressup',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'press',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        }
      ]);
    });

    it('should cancel press when moving outside and the shouldCancelOnPointerExit option is set', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          shouldCancelOnPointerExit
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent}
          onPressUp={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent.mouseDown(el, {detail: 1});
      fireEvent.mouseLeave(el);
      fireEvent.mouseEnter(el);

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        }
      ]);
    });

    it('should handle modifier keys', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent}
          onPressUp={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent.mouseDown(el, {detail: 1, metaKey: true});
      fireEvent.mouseUp(el, {detail: 1, shiftKey: true});
      fireEvent.click(el, {detail: 1});

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: true,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressup',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: true,
          altKey: false
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: true,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'press',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: true,
          altKey: false
        }
      ]);
    });

    it('should only handle left clicks', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent}
          onPressUp={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent.mouseDown(el, {detail: 1, button: 1});
      fireEvent.mouseUp(el, {detail: 1, button: 1});
      fireEvent.click(el, {detail: 1, button: 1});

      expect(events).toEqual([]);
    });

    it('should not focus the element on click if preventFocusOnPress is true', function () {
      let res = render(
        <Example preventFocusOnPress />
      );

      let el = res.getByText('test');
      fireEvent.mouseDown(el);
      fireEvent.mouseUp(el);
      fireEvent.click(el);

      expect(document.activeElement).not.toBe(el);
    });

    it('should focus the element on click by default', function () {
      let res = render(
        <Example />
      );

      let el = res.getByText('test');
      fireEvent.mouseDown(el);
      fireEvent.mouseUp(el);
      fireEvent.click(el);

      expect(document.activeElement).toBe(el);
    });

    it('should prevent default on mousedown by default', function () {
      let res = render(
        <Example />
      );

      let el = res.getByText('test');
      let allowDefault = fireEvent.mouseDown(el);
      expect(allowDefault).toBe(false);
    });

    it('should not prevent default when in a draggable container', function () {
      let res = render(
        <div draggable="true">
          <Example />
        </div>
      );

      let el = res.getByText('test');
      let allowDefault = fireEvent.mouseDown(el);
      expect(allowDefault).toBe(true);
    });

    it('should cancel press on dragstart', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent}
          onPressUp={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent.mouseDown(el, {detail: 1});
      fireEvent(el, new MouseEvent('dragstart', {bubbles: true, cancelable: true, composed: true}));

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'mouse',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        }
      ]);
    });
  });

  describe('touch events', function () {
    it('should fire press events based on touch events', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent}
          onPressUp={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent.touchStart(el, {targetTouches: [{identifier: 1, clientX: 0, clientY: 0}]});
      fireEvent.touchEnd(el, {changedTouches: [{identifier: 1, clientX: 0, clientY: 0}]});

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el,
          pointerType: 'touch',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressup',
          target: el,
          pointerType: 'touch',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'touch',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'press',
          target: el,
          pointerType: 'touch',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        }
      ]);
    });

    it('should fire press change events when moving touch outside target', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent}
          onPressUp={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent.touchStart(el, {targetTouches: [{identifier: 1, clientX: 0, clientY: 0}]});
      fireEvent.touchMove(el, {changedTouches: [{identifier: 1, clientX: 100, clientY: 100}]});
      fireEvent.touchEnd(el, {changedTouches: [{identifier: 1, clientX: 100, clientY: 100}]});

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el,
          pointerType: 'touch',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'touch',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        }
      ]);

      events = [];
      fireEvent.touchStart(el, {targetTouches: [{identifier: 1, clientX: 0, clientY: 0}]});
      fireEvent.touchMove(el, {changedTouches: [{identifier: 1, clientX: 100, clientY: 100}]});
      fireEvent.touchMove(el, {changedTouches: [{identifier: 1, clientX: 0, clientY: 0}]});
      fireEvent.touchEnd(el, {changedTouches: [{identifier: 1, clientX: 0, clientY: 0}]});

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el,
          pointerType: 'touch',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'touch',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'pressstart',
          target: el,
          pointerType: 'touch',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressup',
          target: el,
          pointerType: 'touch',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'touch',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'press',
          target: el,
          pointerType: 'touch',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        }
      ]);
    });

    it('should cancel press when moving outside and the shouldCancelOnPointerExit option is set', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          shouldCancelOnPointerExit
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent}
          onPressUp={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent.touchStart(el, {targetTouches: [{identifier: 1, clientX: 0, clientY: 0}]});
      fireEvent.touchMove(el, {changedTouches: [{identifier: 1, clientX: 100, clientY: 100}]});
      fireEvent.touchMove(el, {changedTouches: [{identifier: 1, clientX: 0, clientY: 0}]});

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el,
          pointerType: 'touch',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'touch',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        }
      ]);
    });

    it('should ignore emulated mouse events', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent}
          onPressUp={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent.touchStart(el, {targetTouches: [{identifier: 1, clientX: 0, clientY: 0}]});
      fireEvent.mouseDown(el);
      fireEvent.touchMove(el, {changedTouches: [{identifier: 1, clientX: 100, clientY: 100}]});
      fireEvent.mouseLeave(el);
      fireEvent.touchMove(el, {changedTouches: [{identifier: 1, clientX: 0, clientY: 0}]});
      fireEvent.mouseEnter(el);
      fireEvent.touchEnd(el, {changedTouches: [{identifier: 1, clientX: 0, clientY: 0}]});
      fireEvent.mouseUp(el);
      fireEvent.click(el);

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el,
          pointerType: 'touch',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'touch',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'pressstart',
          target: el,
          pointerType: 'touch',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressup',
          target: el,
          pointerType: 'touch',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'touch',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'press',
          target: el,
          pointerType: 'touch',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        }
      ]);
    });

    it('should handle touch cancel events', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent}
          onPressUp={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent.touchStart(el, {targetTouches: [{identifier: 1, clientX: 0, clientY: 0}]});
      fireEvent.touchCancel(el);
      fireEvent.touchEnd(el, {changedTouches: [{identifier: 1, clientX: 0, clientY: 0}]});

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el,
          pointerType: 'touch',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'touch',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        }
      ]);
    });

    it('should cancel press after scroll events', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent}
          onPressUp={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent.touchStart(el, {targetTouches: [{identifier: 1, clientX: 0, clientY: 0}]});
      fireEvent.scroll(document.body);
      fireEvent.touchEnd(el, {changedTouches: [{identifier: 1, clientX: 0, clientY: 0}]});

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el,
          pointerType: 'touch',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'touch',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        }
      ]);
    });

    it('should not cancel press after scroll events in unrelated scrollable regions', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <>
          <Example
            onPressStart={addEvent}
            onPressEnd={addEvent}
            onPressChange={pressed => addEvent({type: 'presschange', pressed})}
            onPress={addEvent}
            onPressUp={addEvent} />
          <div data-testid="scrollable" />
        </>
      );

      let el = res.getByText('test');
      fireEvent.touchStart(el, {targetTouches: [{identifier: 1, clientX: 0, clientY: 0}]});

      let scrollable = res.getByTestId('scrollable');
      fireEvent.scroll(scrollable);

      fireEvent.touchEnd(el, {changedTouches: [{identifier: 1, clientX: 0, clientY: 0}]});

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el,
          pointerType: 'touch',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressup',
          target: el,
          pointerType: 'touch',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'touch',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'press',
          target: el,
          pointerType: 'touch',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        }
      ]);
    });

    it('should cancel press on dragstart', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent}
          onPressUp={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent.touchStart(el, {targetTouches: [{identifier: 1, clientX: 0, clientY: 0}]});
      fireEvent(el, new MouseEvent('dragstart', {bubbles: true, cancelable: true, composed: true}));

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el,
          pointerType: 'touch',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'touch',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        }
      ]);
    });

    it('should not focus the target if preventFocusOnPress is true', function () {
      let res = render(
        <Example preventFocusOnPress />
      );

      let el = res.getByText('test');
      fireEvent.touchStart(el, {targetTouches: [{identifier: 1, clientX: 0, clientY: 0}]});
      fireEvent.touchEnd(el, {changedTouches: [{identifier: 1, clientX: 0, clientY: 0}]});

      expect(document.activeElement).not.toBe(el);
    });

    it('should focus the target on touch by default', function () {
      let res = render(
        <Example />
      );

      let el = res.getByText('test');
      fireEvent.touchStart(el, {targetTouches: [{identifier: 1, clientX: 0, clientY: 0}]});
      fireEvent.touchEnd(el, {changedTouches: [{identifier: 1, clientX: 0, clientY: 0}]});

      expect(document.activeElement).toBe(el);
    });

    it('should fire press event when touchup close to the target', function () {
      let spy = jest.fn();
      let res = render(<Example onPress={spy} />);

      let el = res.getByText('test');
      fireEvent.touchStart(el, {targetTouches: [{identifier: 1, clientX: 0, clientY: 0, radiusX: 15, radiusY: 15}]});
      fireEvent.touchMove(el, {changedTouches: [{identifier: 1, clientX: 10, clientY: 10, radiusX: 15, radiusY: 15}]});
      fireEvent.touchEnd(el, {changedTouches: [{identifier: 1, clientX: 10, clientY: 10, radiusX: 15, radiusY: 15}]});

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('keyboard events', function () {
    it('should fire press events when the element is not a link', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let {getByText} = render(
        <Example
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent}
          onPressUp={addEvent} />
      );

      let el = getByText('test');
      fireEvent.keyDown(el, {key: ' '});
      fireEvent.keyUp(el, {key: ' '});

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el,
          pointerType: 'keyboard',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressup',
          target: el,
          pointerType: 'keyboard',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'keyboard',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'press',
          target: el,
          pointerType: 'keyboard',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        }
      ]);
    });

    it('should fire press events when the element is a link', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let {getByText} = render(
        <Example
          elementType="a"
          href="#"
          onClick={e => {e.preventDefault(); addEvent({type: 'click'});}}
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent}
          onPressUp={addEvent} />
      );

      let el = getByText('test');
      fireEvent.keyDown(el, {key: ' '});
      fireEvent.keyUp(el, {key: ' '});

      // Space key handled should do nothing on a link
      expect(events).toEqual([]);

      fireEvent.keyDown(el, {key: 'Enter'});
      fireEvent.keyUp(el, {key: 'Enter'});

      // Enter key should handled natively
      expect(events).toEqual([]);

      fireEvent.click(el);

      // Click event, which is called when Enter key on a link is handled natively, should trigger a click.
      expect(events).toEqual([
        {
          type: 'click'
        },
        {
          type: 'pressstart',
          target: el,
          pointerType: 'virtual',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressup',
          target: el,
          pointerType: 'virtual',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'virtual',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'press',
          target: el,
          pointerType: 'virtual',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        }
      ]);
    });

    it('should fire press events on Enter when the element role is link', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let {getByText} = render(
        <Example
          role="link"
          onClick={e => {e.preventDefault(); addEvent({type: 'click'});}}
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent}
          onPressUp={addEvent} />
      );

      let el = getByText('test');
      fireEvent.keyDown(el, {key: ' '});
      fireEvent.keyUp(el, {key: ' '});

      // Space key should do nothing on an element with role="link"
      expect(events).toEqual([]);

      fireEvent.keyDown(el, {key: 'Enter'});
      fireEvent.keyUp(el, {key: 'Enter'});

      // Enter key should trigger press events on element with role="link"
      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el,
          pointerType: 'keyboard',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressup',
          target: el,
          pointerType: 'keyboard',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'keyboard',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'press',
          target: el,
          pointerType: 'keyboard',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'click'
        }
      ]);
    });

    it('should explicitly call click method, but not fire press events, when Space key is triggered on a link with href and role="button"', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let {getByText} = render(
        <Example
          elementType="a"
          role="button"
          href="#"
          onClick={e => {e.preventDefault(); addEvent({type: 'click'});}}
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent}
          onPressUp={addEvent} />
      );

      let el = getByText('test');

      // Enter key should handled natively
      fireEvent.keyDown(el, {key: 'Enter'});
      fireEvent.keyUp(el, {key: 'Enter'});

      expect(events).toEqual([]);

      // Space key handled by explicitly calling click
      fireEvent.keyDown(el, {key: ' '});
      fireEvent.keyUp(el, {key: ' '});

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el,
          pointerType: 'keyboard',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressup',
          target: el,
          pointerType: 'keyboard',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'keyboard',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'press',
          target: el,
          pointerType: 'keyboard',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'click'
        }
      ]);
    });

    it('should handle modifier keys', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent}
          onPressUp={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent.keyDown(el, {key: ' ', shiftKey: true});
      fireEvent.keyUp(el, {key: ' ', ctrlKey: true});

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el,
          pointerType: 'keyboard',
          ctrlKey: false,
          metaKey: false,
          shiftKey: true,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressup',
          target: el,
          pointerType: 'keyboard',
          ctrlKey: true,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'keyboard',
          ctrlKey: true,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'press',
          target: el,
          pointerType: 'keyboard',
          ctrlKey: true,
          metaKey: false,
          shiftKey: false,
          altKey: false
        }
      ]);
    });

    it('should handle when focus moves between keydown and keyup', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let {getByText} = render(
        <Example
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent}
          onPressUp={addEvent} />
      );

      let el = getByText('test');
      fireEvent.keyDown(el, {key: ' '});
      fireEvent.keyUp(document.body, {key: ' '});

      fireEvent.keyDown(el, {key: ' '});
      fireEvent.keyUp(el, {key: ' '});

      expect(events).toEqual([
        // First sequence. Ensure the key up on the body causes a press end.
        {
          type: 'pressstart',
          target: el,
          pointerType: 'keyboard',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'keyboard',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        },

        // Second sequence. Ensure `isPressed` is reset to false on key up.
        {
          type: 'pressstart',
          target: el,
          pointerType: 'keyboard',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressup',
          target: el,
          pointerType: 'keyboard',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'keyboard',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'press',
          target: el,
          pointerType: 'keyboard',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        }
      ]);
    });

    it('should ignore repeating keyboard events', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let {getByText} = render(
        <Example
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent}
          onPressUp={addEvent} />
      );

      let el = getByText('test');
      fireEvent.keyDown(el, {key: ' ', repeat: true});
      fireEvent.keyUp(document.body, {key: ' '});

      expect(events).toEqual([]);
    });
  });

  describe('virtual click events', function () {
    it('should fire press events events for virtual click events from screen readers', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let {getByText} = render(
        <Example
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent}
          onPressUp={addEvent} />
      );

      let el = getByText('test');
      fireEvent.click(el);

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el,
          pointerType: 'virtual',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressup',
          target: el,
          pointerType: 'virtual',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'pressend',
          target: el,
          pointerType: 'virtual',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'press',
          target: el,
          pointerType: 'virtual',
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          altKey: false
        }
      ]);
    });
  });

  it('should not focus the target if preventFocusOnPress is true', function () {
    let {getByText} = render(
      <Example preventFocusOnPress />
    );

    let el = getByText('test');
    fireEvent.click(el);

    expect(document.activeElement).not.toBe(el);
  });

  it('should focus the target on virtual click by default', function () {
    let {getByText} = render(
      <Example />
    );

    let el = getByText('test');
    fireEvent.click(el);

    expect(document.activeElement).toBe(el);
  });

  describe('disable text-selection when pressed', function () {
    let handler = jest.fn();
    let mockUserSelect = 'contain';
    let oldUserSelect = document.documentElement.style.webkitUserSelect;
    let platformGetter;

    beforeAll(() => {
      platformGetter = jest.spyOn(window.navigator, 'platform', 'get');
    });

    afterAll(() => {
      handler.mockClear();
      jest.restoreAllMocks();
    });

    beforeEach(() => {
      document.documentElement.style.webkitUserSelect = mockUserSelect;
      platformGetter.mockReturnValue('iPhone');
    });
    afterEach(() => {
      document.documentElement.style.webkitUserSelect = oldUserSelect;
    });

    it('should add user-select: none to html element when press start (iOS)', function () {
      let {getByText} = render(
        <Example
          onPressStart={handler}
          onPressEnd={handler}
          onPressChange={handler}
          onPress={handler}
          onPressUp={handler} />
      );

      let el = getByText('test');
      fireEvent.touchStart(el, {targetTouches: [{identifier: 1}]});
      expect(document.documentElement.style.webkitUserSelect).toBe('none');
    });

    it('should not add user-select: none to html element when press start (non-iOS)', function () {
      platformGetter.mockReturnValue('Android');
      let {getByText} = render(
        <Example
          onPressStart={handler}
          onPressEnd={handler}
          onPressChange={handler}
          onPress={handler}
          onPressUp={handler} />
      );

      let el = getByText('test');
      fireEvent.touchStart(el, {targetTouches: [{identifier: 1}]});
      expect(document.documentElement.style.webkitUserSelect).toBe(mockUserSelect);
    });

    it('should remove user-select: none to html element when press end (iOS)', function () {
      let {getByText} = render(
        <Example
          onPressStart={handler}
          onPressEnd={handler}
          onPressChange={handler}
          onPress={handler}
          onPressUp={handler} />
      );

      let el = getByText('test');

      fireEvent.touchStart(el, {targetTouches: [{identifier: 1}]});
      fireEvent.touchEnd(el, {changedTouches: [{identifier: 1}]});

      act(() => {jest.advanceTimersByTime(300);});
      expect(document.documentElement.style.webkitUserSelect).toBe(mockUserSelect);

      // Checkbox doesn't remove `user-select: none;` style from HTML Element issue
      // see https://github.com/adobe/react-spectrum/issues/862
      fireEvent.touchStart(el, {targetTouches: [{identifier: 1}]});
      fireEvent.touchEnd(el, {changedTouches: [{identifier: 1}]});
      fireEvent.touchStart(el, {targetTouches: [{identifier: 1}]});
      fireEvent.touchMove(el, {changedTouches: [{identifier: 1, clientX: 100, clientY: 100}]});
      act(() => {jest.advanceTimersByTime(300);});
      fireEvent.touchEnd(el, {changedTouches: [{identifier: 1, clientX: 100, clientY: 100}]});
      act(() => {jest.advanceTimersByTime(300);});

      expect(document.documentElement.style.webkitUserSelect).toBe(mockUserSelect);
    });

    it('should not remove user-select: none when pressing two different elements quickly (iOS)', function () {
      let {getAllByText} = render(
        <>
          <Example
            onPressStart={handler}
            onPressEnd={handler}
            onPressChange={handler}
            onPress={handler}
            onPressUp={handler} />
          <Example
            onPressStart={handler}
            onPressEnd={handler}
            onPressChange={handler}
            onPress={handler}
            onPressUp={handler} />
        </>
      );

      let els = getAllByText('test');

      fireEvent.touchStart(els[0], {targetTouches: [{identifier: 1}]});
      fireEvent.touchEnd(els[0], {changedTouches: [{identifier: 1}]});

      expect(document.documentElement.style.webkitUserSelect).toBe('none');

      fireEvent.touchStart(els[1], {targetTouches: [{identifier: 1}]});

      act(() => {jest.advanceTimersByTime(300);});
      expect(document.documentElement.style.webkitUserSelect).toBe('none');

      fireEvent.touchEnd(els[1], {changedTouches: [{identifier: 1}]});

      act(() => {jest.advanceTimersByTime(300);});
      expect(document.documentElement.style.webkitUserSelect).toBe(mockUserSelect);
    });

    it('should remove user-select: none from html element if pressable component unmounts (iOS)', function () {
      let {getByText, unmount} = render(
        <Example
          onPressStart={handler}
          onPressEnd={handler}
          onPressChange={handler}
          onPress={handler}
          onPressUp={handler} />
      );

      let el = getByText('test');
      fireEvent.touchStart(el, {targetTouches: [{identifier: 1}]});
      expect(document.documentElement.style.webkitUserSelect).toBe('none');

      unmount();
      act(() => {jest.advanceTimersByTime(300);});
      expect(document.documentElement.style.webkitUserSelect).toBe(mockUserSelect);
    });
  });

  describe('portal event bubbling', () => {
    function PortalExample(props) {
      let {elementType: ElementType = 'div', ...otherProps} = props;
      let {pressProps} = usePress(otherProps);
      return (
        <Provider theme={theme}>
          <ElementType {...pressProps} tabIndex="0">
            <DialogTrigger>
              <ActionButton>open</ActionButton>
              <Dialog>
                test
              </Dialog>
            </DialogTrigger>
          </ElementType>
        </Provider>
      );
    }

    beforeAll(() => {
      jest.useFakeTimers();
    });
    afterAll(() => {
      jest.useRealTimers();
    });

    let matchMedia;
    beforeEach(() => {
      matchMedia = new MatchMediaMock();
      // this needs to be a setTimeout so that the dialog can be removed from the dom before the callback is invoked
      jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => setTimeout(() => cb(), 0));
    });

    afterEach(() => {
      // Ensure we close any dialogs before unmounting to avoid warning.
      let dialog = document.querySelector('[role="dialog"]');
      if (dialog) {
        act(() => {
          fireEvent.keyDown(dialog, {key: 'Escape'});
          fireEvent.keyUp(dialog, {key: 'Escape'});
          jest.runAllTimers();
        });
      }

      matchMedia.clear();
      window.requestAnimationFrame.mockRestore();
    });

    describe.each`
      type                | prepare               | actions
      ${'Mouse Events'}   | ${installMouseEvent}  | ${[
        (el) => fireEvent.mouseDown(el, {button: 0}),
        (el) => fireEvent.mouseUp(el, {button: 0})
      ]}
      ${'Pointer Events'} | ${installPointerEvent}| ${[
        (el) => fireEvent.pointerDown(el, {button: 0, pointerId: 1}),
        (el) => fireEvent.pointerUp(el, {button: 0, pointerId: 1})
      ]}
      ${'Touch Events'}   | ${() => {}}           | ${[
        (el) => fireEvent.touchStart(el, {changedTouches: [{identifier: 1}]}),
        (el) => fireEvent.touchEnd(el, {changedTouches: [{identifier: 1}]})
      ]}
    `('$type', ({actions: [start, end], prepare}) => {
      prepare();

      it('stop event bubbling through portal', () => {
        const pressMock = jest.fn();
        let res = render(
          <PortalExample
            onPressStart={pressMock}
            onPressEnd={pressMock}
            onPressChange={pressMock}
            onPress={pressMock}
            onPressUp={pressMock} />
        );

        fireEvent.click(res.getByText('open'));

        act(() => {
          jest.runAllTimers();
        });

        let el = res.getByText('test');
        start(el);
        end(el);
        expect(pressMock.mock.calls).toHaveLength(0);
      });
    });
  });
});
