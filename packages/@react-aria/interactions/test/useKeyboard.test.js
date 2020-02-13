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
import {cleanup, fireEvent, render} from '@testing-library/react';
import React from 'react';
import {useKeyboard} from '../';

function Example(props) {
  let {keyboardProps} = useKeyboard(props);
  return <div tabIndex={-1} {...keyboardProps} data-testid="example">{props.children}</div>;
}

describe('useKeyboard', function () {
  afterEach(cleanup);

  it('should handle keyboard events', function () {
    let events = [];
    let addEvent = (e) => events.push({type: e.type, target: e.target});
    let tree = render(
      <Example
        onKeyDown={addEvent}
        onKeyUp={addEvent} />
    );

    let el = tree.getByTestId('example');
    fireEvent.keyDown(el, {key: 'A'});
    fireEvent.keyUp(el, {key: 'A'});

    expect(events).toEqual([
      {type: 'keydown', target: el},
      {type: 'keyup', target: el}
    ]);
  });

  it('should not handle events when disabled', function () {
    let events = [];
    let addEvent = (e) => events.push({type: e.type, target: e.target});
    let tree = render(
      <Example
        isDisabled
        onKeyDown={addEvent}
        onKeyUp={addEvent} />
    );

    let el = tree.getByTestId('example');
    fireEvent.keyDown(el, {key: 'A'});
    fireEvent.keyUp(el, {key: 'A'});

    expect(events).toEqual([]);
  });

  it('events do not bubble by default', function () {
    let onWrapperKeyDown = jest.fn();
    let onWrapperKeyUp = jest.fn();
    let onInnerKeyDown = jest.fn();
    let onInnerKeyUp = jest.fn();
    let tree = render(
      <button onKeyDown={onWrapperKeyDown} onKeyUp={onWrapperKeyUp}>
        <Example
          onKeyDown={onInnerKeyDown}
          onKeyUp={onInnerKeyUp} />
      </button>
    );

    let el = tree.getByTestId('example');
    fireEvent.keyDown(el, {key: 'A'});
    fireEvent.keyUp(el, {key: 'A'});

    expect(onInnerKeyDown).toHaveBeenCalledTimes(1);
    expect(onInnerKeyUp).toHaveBeenCalledTimes(1);
    expect(onWrapperKeyDown).not.toHaveBeenCalled();
    expect(onWrapperKeyUp).not.toHaveBeenCalled();
  });

  it('events bubble when continuePropagation is called', function () {
    let onWrapperKeyDown = jest.fn();
    let onWrapperKeyUp = jest.fn();
    let onInnerKeyDown = jest.fn(e => e.continuePropagation());
    let onInnerKeyUp = jest.fn(e => e.continuePropagation());
    let tree = render(
      <button onKeyDown={onWrapperKeyDown} onKeyUp={onWrapperKeyUp}>
        <Example
          onKeyDown={onInnerKeyDown}
          onKeyUp={onInnerKeyUp} />
      </button>
    );

    let el = tree.getByTestId('example');
    fireEvent.keyDown(el, {key: 'A'});
    fireEvent.keyUp(el, {key: 'A'});

    expect(onInnerKeyDown).toHaveBeenCalledTimes(1);
    expect(onInnerKeyUp).toHaveBeenCalledTimes(1);
    expect(onWrapperKeyDown).toHaveBeenCalledTimes(1);
    expect(onWrapperKeyUp).toHaveBeenCalledTimes(1);
  });
});
