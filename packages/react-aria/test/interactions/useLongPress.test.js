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

import {act, fireEvent, installPointerEvent, render} from '@react-spectrum/test-utils-internal';
import {mergeProps} from '../../src/utils/mergeProps';
import React from 'react';
import {useLayoutEffect} from '../../src/utils/useLayoutEffect';
import {useLongPress} from '../../src/interactions/useLongPress';
import {usePress} from '../../src/interactions/usePress';

function Example(props) {
  let {elementType: ElementType = 'div', ...otherProps} = props;
  let {longPressProps} = useLongPress(otherProps);
  return (
    <ElementType {...longPressProps} tabIndex="0">
      test
    </ElementType>
  );
}

function ExampleWithPress(props) {
  let {elementType: ElementType = 'div', onPress, onPressStart, onPressEnd, ...otherProps} = props;
  let {longPressProps} = useLongPress(otherProps);
  let {pressProps} = usePress({onPress, onPressStart, onPressEnd});
  return (
    <ElementType {...mergeProps(longPressProps, pressProps)} tabIndex="0">
      test
    </ElementType>
  );
}

describe('useLongPress', function () {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => jest.runAllTimers());
  });

  installPointerEvent();

  it('should perform a long press', function () {
    let events = [];
    let addEvent = e => events.push(e);
    let res = render(
      <Example onLongPressStart={addEvent} onLongPressEnd={addEvent} onLongPress={addEvent} />
    );

    let el = res.getByText('test');

    fireEvent.pointerDown(el, {pointerType: 'touch'});
    expect(events).toEqual([
      {
        type: 'longpressstart',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0
      }
    ]);

    act(() => jest.advanceTimersByTime(400));
    expect(events).toEqual([
      {
        type: 'longpressstart',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0
      }
    ]);

    act(() => jest.advanceTimersByTime(200));
    expect(events).toEqual([
      {
        type: 'longpressstart',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0
      },
      {
        type: 'longpressend',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0
      },
      {
        type: 'longpress',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0
      }
    ]);

    fireEvent.pointerUp(el, {pointerType: 'touch'});
    expect(events).toEqual([
      {
        type: 'longpressstart',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0
      },
      {
        type: 'longpressend',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0
      },
      {
        type: 'longpress',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0
      }
    ]);
  });

  it('should cancel if pointer ends before timeout', function () {
    let events = [];
    let addEvent = e => events.push(e);
    let res = render(
      <Example onLongPressStart={addEvent} onLongPressEnd={addEvent} onLongPress={addEvent} />
    );

    let el = res.getByText('test');

    fireEvent.pointerDown(el, {pointerType: 'touch'});
    act(() => jest.advanceTimersByTime(200));
    fireEvent.pointerUp(el, {pointerType: 'touch'});

    act(() => jest.advanceTimersByTime(800));
    expect(events).toEqual([
      {
        type: 'longpressstart',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0
      },
      {
        type: 'longpressend',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0
      }
    ]);
  });

  it('should cancel other press events', function () {
    let events = [];
    let addEvent = e => events.push(e);
    let res = render(
      <ExampleWithPress
        onLongPressStart={addEvent}
        onLongPressEnd={addEvent}
        onLongPress={addEvent}
        onPressStart={addEvent}
        onPressEnd={addEvent}
        onPress={addEvent}
      />
    );

    let el = res.getByText('test');

    fireEvent.pointerDown(el, {pointerType: 'touch'});
    act(() => jest.advanceTimersByTime(600));
    fireEvent.pointerUp(el, {pointerType: 'touch'});

    expect(events).toEqual([
      {
        type: 'longpressstart',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0
      },
      {
        type: 'pressstart',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0
      },
      {
        type: 'longpressend',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0
      },
      {
        type: 'pressend',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0
      },
      {
        type: 'longpress',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0
      }
    ]);
  });

  it('should not cancel press events if pointer ends before timer', function () {
    let events = [];
    let addEvent = e => events.push(e);
    let res = render(
      <ExampleWithPress
        onLongPressStart={addEvent}
        onLongPressEnd={addEvent}
        onLongPress={addEvent}
        onPressStart={addEvent}
        onPressEnd={addEvent}
        onPress={addEvent}
      />
    );

    let el = res.getByText('test');

    fireEvent.pointerDown(el, {pointerType: 'touch'});
    act(() => jest.advanceTimersByTime(300));
    fireEvent.pointerUp(el, {pointerType: 'touch'});
    fireEvent.click(el, {detail: 1});

    expect(events).toEqual([
      {
        type: 'longpressstart',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0
      },
      {
        type: 'pressstart',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0
      },
      {
        type: 'longpressend',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0
      },
      {
        type: 'pressend',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0
      },
      {
        type: 'press',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0
      }
    ]);
  });

  it('allows changing the threshold', function () {
    let events = [];
    let addEvent = e => events.push(e);
    let res = render(
      <Example
        onLongPressStart={addEvent}
        onLongPressEnd={addEvent}
        onLongPress={addEvent}
        threshold={800}
      />
    );

    let el = res.getByText('test');

    fireEvent.pointerDown(el, {pointerType: 'touch'});
    act(() => jest.advanceTimersByTime(600));
    expect(events).toEqual([
      {
        type: 'longpressstart',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0
      }
    ]);

    act(() => jest.advanceTimersByTime(800));
    expect(events).toEqual([
      {
        type: 'longpressstart',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0
      },
      {
        type: 'longpressend',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0
      },
      {
        type: 'longpress',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        x: 0,
        y: 0
      }
    ]);
  });

  it('supports accessibilityDescription', function () {
    let res = render(
      <Example accessibilityDescription="Long press to open menu" onLongPress={() => {}} />
    );

    let el = res.getByText('test');
    expect(el).toHaveAttribute('aria-describedby');

    let description = document.getElementById(el.getAttribute('aria-describedby'));
    expect(description).toHaveTextContent('Long press to open menu');
  });

  it('does not show accessibilityDescription if disabled', function () {
    let res = render(
      <Example
        accessibilityDescription="Long press to open menu"
        onLongPress={() => {}}
        isDisabled
      />
    );

    let el = res.getByText('test');
    expect(el).not.toHaveAttribute('aria-describedby');
  });

  it('does not show accessibilityDescription if no onLongPress handler', function () {
    let res = render(<Example accessibilityDescription="Long press to open menu" />);

    let el = res.getByText('test');
    expect(el).not.toHaveAttribute('aria-describedby');
  });

  it('prevents context menu events on touch', function () {
    let res = render(<Example onLongPress={() => {}} />);

    let el = res.getByText('test');
    fireEvent.pointerDown(el, {pointerType: 'touch'});
    act(() => jest.advanceTimersByTime(600));

    let performDefault = fireEvent.contextMenu(el);
    expect(performDefault).toBe(false);

    fireEvent.pointerUp(el, {pointerType: 'touch'});
  });

  it('should not fire any events for keyboard interactions', function () {
    let events = [];
    let addEvent = e => events.push(e);
    let res = render(
      <Example
        onLongPressStart={addEvent}
        onLongPressEnd={addEvent}
        onLongPress={addEvent}
        threshold={800}
      />
    );

    let el = res.getByText('test');
    fireEvent.keyDown(el, {key: ' '});
    act(() => jest.advanceTimersByTime(600));
    fireEvent.keyUp(el, {key: ' '});

    expect(events).toHaveLength(0);
  });

  describe('supports unmounting during a long press', function () {
    it('should not call onLongPress after the element unmounts', function () {
      let onLongPress = jest.fn();
      let res = render(<Example onLongPress={onLongPress} />);
      let el = res.getByText('test');

      fireEvent.pointerDown(el, {pointerType: 'touch'});
      res.unmount();
      act(() => jest.advanceTimersByTime(600));

      expect(onLongPress.mock.calls).toEqual([]);
    });
  });

  describe('supports disabling during a long press', function () {
    it('should not call onLongPress when the button is disabled before the timer fires', function () {
      // When a non-urgent update (e.g. a transition) disables the button, React commits it but
      // runs passive effects later, so the long press timer can fire before the effect that
      // cancels the press. That scheduling is hard to simulate, since act() flushes passive
      // effects before returning. A layout effect runs after the commit but before passive
      // effects, so advancing the timer from one lands it in the same window.
      function Button({isDisabled, onLongPress}) {
        let {longPressProps} = useLongPress({isDisabled, onLongPress});
        useLayoutEffect(() => {
          if (isDisabled) {
            // This already runs inside the rerender's act().
            // oxlint-disable-next-line rsp-rules/act-events-test
            jest.advanceTimersByTime(600);
          }
        }, [isDisabled]);
        return <button {...longPressProps}>Save</button>;
      }

      let onLongPress = jest.fn();
      let {getByRole, rerender} = render(<Button onLongPress={onLongPress} />);

      fireEvent.pointerDown(getByRole('button'), {pointerType: 'touch'});
      rerender(<Button onLongPress={onLongPress} isDisabled />);

      expect(onLongPress.mock.calls).toEqual([]);
    });
  });

  describe('supports multiple touches', function () {
    it('should not perform a long press when another touch starts', function () {
      let onLongPress = jest.fn();
      let res = render(<Example onLongPress={onLongPress} />);
      let el = res.getByText('test');

      fireEvent.pointerDown(el, {pointerType: 'touch', pointerId: 1});
      fireEvent.pointerDown(document.body, {pointerType: 'touch', pointerId: 2});
      act(() => jest.advanceTimersByTime(600));

      expect(onLongPress.mock.calls).toEqual([]);
    });

    it('should not perform a long press when another touch starts shortly after a previous press', function () {
      let onLongPress = jest.fn();
      let res = render(<Example onLongPress={onLongPress} />);
      let el = res.getByText('test');

      fireEvent.pointerDown(el, {pointerType: 'touch', pointerId: 1});
      fireEvent.pointerUp(document.body, {pointerType: 'touch', pointerId: 1});
      fireEvent.pointerDown(el, {pointerType: 'touch', pointerId: 2});
      act(() => jest.advanceTimersByTime(100));
      fireEvent.pointerDown(document.body, {pointerType: 'touch', pointerId: 3});
      act(() => jest.advanceTimersByTime(500));

      expect(onLongPress.mock.calls).toEqual([]);
    });
  });
});
