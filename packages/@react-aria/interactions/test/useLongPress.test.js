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

import {act, fireEvent, installPointerEvent, render} from '@react-spectrum/test-utils';
import {mergeProps} from '@react-aria/utils';
import React from 'react';
import {useLongPress, usePress} from '../';

function Example(props) {
  let {elementType: ElementType = 'div', ...otherProps} = props;
  let {longPressProps} = useLongPress(otherProps);
  return <ElementType {...longPressProps} tabIndex="0">test</ElementType>;
}

function ExampleWithPress(props) {
  let {elementType: ElementType = 'div', onPress, onPressStart, onPressEnd, ...otherProps} = props;
  let {longPressProps} = useLongPress(otherProps);
  let {pressProps} = usePress({onPress, onPressStart, onPressEnd});
  return <ElementType {...mergeProps(longPressProps, pressProps)} tabIndex="0">test</ElementType>;
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
    let addEvent = (e) => events.push(e);
    let res = render(
      <Example
        onLongPressStart={addEvent}
        onLongPressEnd={addEvent}
        onLongPress={addEvent} />
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
        altKey: false
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
        altKey: false
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
        altKey: false
      },
      {
        type: 'longpressend',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false
      },
      {
        type: 'longpress',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false
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
        altKey: false
      },
      {
        type: 'longpressend',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false
      },
      {
        type: 'longpress',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false
      }
    ]);
  });

  it('should cancel if pointer ends before timeout', function () {
    let events = [];
    let addEvent = (e) => events.push(e);
    let res = render(
      <Example
        onLongPressStart={addEvent}
        onLongPressEnd={addEvent}
        onLongPress={addEvent} />
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
        altKey: false
      },
      {
        type: 'longpressend',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false
      }
    ]);
  });

  it('should cancel other press events', function () {
    let events = [];
    let addEvent = (e) => events.push(e);
    let res = render(
      <ExampleWithPress
        onLongPressStart={addEvent}
        onLongPressEnd={addEvent}
        onLongPress={addEvent}
        onPressStart={addEvent}
        onPressEnd={addEvent}
        onPress={addEvent} />
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
        altKey: false
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
        type: 'longpressend',
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
        type: 'longpress',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false
      }
    ]);
  });

  it('should not cancel press events if pointer ends before timer', function () {
    let events = [];
    let addEvent = (e) => events.push(e);
    let res = render(
      <ExampleWithPress
        onLongPressStart={addEvent}
        onLongPressEnd={addEvent}
        onLongPress={addEvent}
        onPressStart={addEvent}
        onPressEnd={addEvent}
        onPress={addEvent} />
    );

    let el = res.getByText('test');

    fireEvent.pointerDown(el, {pointerType: 'touch'});
    act(() => jest.advanceTimersByTime(300));
    fireEvent.pointerUp(el, {pointerType: 'touch'});

    expect(events).toEqual([
      {
        type: 'longpressstart',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false
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
        type: 'longpressend',
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

  it('allows changing the threshold', function () {
    let events = [];
    let addEvent = (e) => events.push(e);
    let res = render(
      <Example
        onLongPressStart={addEvent}
        onLongPressEnd={addEvent}
        onLongPress={addEvent}
        threshold={800} />
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
        altKey: false
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
        altKey: false
      },
      {
        type: 'longpressend',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false
      },
      {
        type: 'longpress',
        target: el,
        pointerType: 'touch',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false
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
      <Example accessibilityDescription="Long press to open menu" onLongPress={() => {}} isDisabled />
    );

    let el = res.getByText('test');
    expect(el).not.toHaveAttribute('aria-describedby');
  });

  it('does not show accessibilityDescription if no onLongPress handler', function () {
    let res = render(
      <Example accessibilityDescription="Long press to open menu" />
    );

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
    let addEvent = (e) => events.push(e);
    let res = render(
      <Example
        onLongPressStart={addEvent}
        onLongPressEnd={addEvent}
        onLongPress={addEvent}
        threshold={800} />
    );

    let el = res.getByText('test');
    fireEvent.keyDown(el, {key: ' '});
    act(() => jest.advanceTimersByTime(600));
    fireEvent.keyUp(el, {key: ' '});

    expect(events).toHaveLength(0);
  });
});
