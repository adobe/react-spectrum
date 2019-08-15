import {cleanup, fireEvent, render} from '@testing-library/react';
import React from 'react';
import {usePress} from '../';

function Example(props) {
  let {pressProps} = usePress(props);
  return <div {...pressProps}>test</div>;
}

function pointerEvent(type, opts) {
  let evt = new Event(type, {bubbles: true, cancelable: true});
  Object.assign(evt, opts);
  return evt;
}

describe('usePress', function () {
  afterEach(cleanup);

  // TODO: JSDOM doesn't yet support pointer events. Once they do, convert these tests.
  // https://github.com/jsdom/jsdom/issues/2527
  describe('pointer events', function () {
    beforeEach(() => {
      global.PointerEvent = {};
    });

    afterEach(() => {
      delete global.PointerEvent;
    });

    it('should fire press events based on pointer events', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example 
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent(el, pointerEvent('pointerdown', {pointerId: 1}));
      fireEvent(el, pointerEvent('pointerup', {pointerId: 1}));
      
      // How else to get the DOM node it renders the hook to?
      // let el = events[0].target;
      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'press',
          target: el
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
          onPress={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent(el, pointerEvent('pointerdown', {pointerId: 1}));
      // react listens for pointerout instead of pointerleave...
      fireEvent(el, pointerEvent('pointerout', {pointerId: 1}));
      fireEvent(document, pointerEvent('pointerup', {pointerId: 1}));
      fireEvent(el, pointerEvent('pointerenter', {pointerId: 1}));

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el
        },
        {
          type: 'presschange',
          pressed: false
        }
      ]);

      events = [];
      fireEvent(el, pointerEvent('pointerdown', {pointerId: 1}));
        // react listens for pointerout and pointerover instead of pointerleave and pointerenter...
      fireEvent(el, pointerEvent('pointerout', {pointerId: 1}));
      fireEvent(el, pointerEvent('pointerover', {pointerId: 1}));
      fireEvent(el, pointerEvent('pointerup', {pointerId: 1}));

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'pressstart',
          target: el
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'press',
          target: el
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
          onPress={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent(el, pointerEvent('pointerdown', {pointerId: 1}));
      fireEvent(document.body, pointerEvent('pointercancel', {pointerId: 1}));

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el
        },
        {
          type: 'presschange',
          pressed: false
        }
      ]);
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
          onPress={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent.mouseDown(el);
      fireEvent.mouseUp(el);
      fireEvent.click(el);

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'press',
          target: el
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
          onPress={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent.mouseDown(el);
      fireEvent.mouseLeave(el);
      fireEvent.mouseUp(document.body);
      fireEvent.mouseEnter(el);

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el
        },
        {
          type: 'presschange',
          pressed: false
        }
      ]);

      events = [];
      fireEvent.mouseDown(el);
      fireEvent.mouseLeave(el);
      fireEvent.mouseEnter(el);
      fireEvent.mouseUp(el);
      fireEvent.click(el);

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'pressstart',
          target: el
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'press',
          target: el
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
          onPress={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent.touchStart(el, {targetTouches: [{identifier: 1}]});
      fireEvent.touchEnd(el, {changedTouches: [{identifier: 1, clientX: 0, clientY: 0}]});

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'press',
          target: el
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
          onPress={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent.touchStart(el, {targetTouches: [{identifier: 1}]});
      fireEvent.touchMove(el, {changedTouches: [{identifier: 1, clientX: 100, clientY: 100}]});
      fireEvent.touchEnd(el, {changedTouches: [{identifier: 1, clientX: 100, clientY: 100}]});

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el
        },
        {
          type: 'presschange',
          pressed: false
        }
      ]);

      events = [];
      fireEvent.touchStart(el, {targetTouches: [{identifier: 1}]});
      fireEvent.touchMove(el, {changedTouches: [{identifier: 1, clientX: 100, clientY: 100}]});
      fireEvent.touchMove(el, {changedTouches: [{identifier: 1, clientX: 0, clientY: 0}]});
      fireEvent.touchEnd(el, {changedTouches: [{identifier: 1, clientX: 0, clientY: 0}]});

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'pressstart',
          target: el
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'press',
          target: el
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
          onPress={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent.touchStart(el, {targetTouches: [{identifier: 1}]});
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
          target: el
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'pressstart',
          target: el
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'press',
          target: el
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
          onPress={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent.touchStart(el, {targetTouches: [{identifier: 1}]});
      fireEvent.touchCancel(el);

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el
        },
        {
          type: 'presschange',
          pressed: false
        }
      ]);
    });
  });

  describe('keyboard events', function () {
    it('should fire press events based on keyboard events', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example 
          onPressStart={addEvent}
          onPressEnd={addEvent}
          onPressChange={pressed => addEvent({type: 'presschange', pressed})}
          onPress={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent.keyDown(el, {key: ' '});
      fireEvent.keyUp(el, {key: ' '});

      expect(events).toEqual([
        {
          type: 'pressstart',
          target: el
        },
        {
          type: 'presschange',
          pressed: true
        },
        {
          type: 'pressend',
          target: el
        },
        {
          type: 'presschange',
          pressed: false
        },
        {
          type: 'press',
          target: el
        }
      ]);
    });
  });
});
