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

/* eslint-disable jsx-a11y/no-static-element-interactions */

import {act, pointerMap, render} from '@react-spectrum/test-utils-internal';
import React from 'react';
import {useKeyboard} from '../../src/interactions/useKeyboard';
import userEvent from '@testing-library/user-event';

function Example(props) {
  let {keyboardProps} = useKeyboard(props);
  return <div tabIndex={-1} {...keyboardProps} data-testid="example">{props.children}</div>;
}

describe('useKeyboard', function () {
  it('should handle keyboard events', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let events = [];
    let addEvent = (e) => events.push({type: e.type, target: e.target});
    let tree = render(
      <Example
        onKeyDown={addEvent}
        onKeyUp={addEvent} />
    );

    let el = tree.getByTestId('example');
    act(() => el.focus());
    await user.keyboard('A');

    expect(events).toEqual([
      {type: 'keydown', target: el},
      {type: 'keyup', target: el}
    ]);
  });

  it('should not handle events when disabled', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let events = [];
    let addEvent = (e) => events.push({type: e.type, target: e.target});
    let tree = render(
      <Example
        isDisabled
        onKeyDown={addEvent}
        onKeyUp={addEvent} />
    );

    let el = tree.getByTestId('example');
    act(() => el.focus());
    await user.keyboard('A');

    expect(events).toEqual([]);
  });

  it('events do not bubble by default', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
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
    act(() => el.focus());
    await user.keyboard('A');

    expect(onInnerKeyDown).toHaveBeenCalledTimes(1);
    expect(onInnerKeyUp).toHaveBeenCalledTimes(1);
    expect(onWrapperKeyDown).not.toHaveBeenCalled();
    expect(onWrapperKeyUp).not.toHaveBeenCalled();
  });

  it('events bubble when continuePropagation is called', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
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
    act(() => el.focus());
    await user.keyboard('A');

    expect(onInnerKeyDown).toHaveBeenCalledTimes(1);
    expect(onInnerKeyUp).toHaveBeenCalledTimes(1);
    expect(onWrapperKeyDown).toHaveBeenCalledTimes(1);
    expect(onWrapperKeyUp).toHaveBeenCalledTimes(1);
  });


  describe('shortcuts', () => {
    let platformMock;
    let user;
    beforeEach(() => {
      user = userEvent.setup({delay: null, pointerMap});
    });
    afterEach(() => {
      platformMock?.mockRestore();
    });
    let ExampleButton = (props) => {
      let {keyboardProps} = useKeyboard(props);
      return (
        <button {...keyboardProps}>Save</button>
      );
    };
    describe('Mac (Mod = Meta)', () => {
      beforeEach(() => {
        platformMock = jest.spyOn(navigator, 'platform', 'get').mockImplementation(() => 'MacIntel');
      });

      it('matches Mod+key with metaKey', async () => {
        let save = jest.fn(() => true);
        let onWrapperKeyDown = jest.fn();
        let onWrapperKeyUp = jest.fn();

        render(
          <div onKeyDown={onWrapperKeyDown} onKeyUp={onWrapperKeyUp}>
            <ExampleButton shortcuts={{'Mod+s': save}} />
          </div>
        );

        await user.tab();
        expect(onWrapperKeyUp).toHaveBeenCalledTimes(1);
        onWrapperKeyDown.mockClear();
        onWrapperKeyUp.mockClear();

        await user.keyboard('{Meta>}s{/Meta}');
        expect(save).toHaveBeenCalledTimes(1);
        expect(onWrapperKeyDown).toHaveBeenCalledTimes(1); // Meta keydown should be only one
        expect(onWrapperKeyUp).toHaveBeenCalledTimes(2); // both s keyup and meta keyup

        save.mockClear();
        onWrapperKeyDown.mockClear();
        onWrapperKeyUp.mockClear();

        // None of the below should trigger the preventDefault and stopPropagation because
        // we are not handling the event.
        await user.keyboard('{Control>}s{/Control}');
        expect(save).not.toHaveBeenCalled();

        await user.keyboard('s');
        expect(save).not.toHaveBeenCalled();

        expect(onWrapperKeyDown).toHaveBeenCalledTimes(3);
        expect(onWrapperKeyUp).toHaveBeenCalledTimes(3);
      });

      it('plain key ignores meta', async () => {
        let save = jest.fn(() => true);
        let onWrapperKeyDown = jest.fn();
        let onWrapperKeyUp = jest.fn();

        render(
          <div onKeyDown={onWrapperKeyDown} onKeyUp={onWrapperKeyUp}>
            <ExampleButton shortcuts={{'s': save}} />
          </div>
        );

        await user.tab();
        onWrapperKeyDown.mockClear();
        onWrapperKeyUp.mockClear();

        await user.keyboard('{Meta>}s{/Meta}');
        expect(save).not.toHaveBeenCalled();

        expect(onWrapperKeyDown).toHaveBeenCalledTimes(2);
        expect(onWrapperKeyUp).toHaveBeenCalledTimes(2);
      });

      it('Ctrl+Shift distinct from Mod+Shift', async () => {
        let modShift = jest.fn();
        let ctrlShift = jest.fn();
        let onWrapperKeyDown = jest.fn();
        let onWrapperKeyUp = jest.fn();
        render(
          <div onKeyDown={onWrapperKeyDown} onKeyUp={onWrapperKeyUp}>
            <ExampleButton shortcuts={{'Mod+Shift+a': modShift, 'Ctrl+Shift+a': ctrlShift}} />
          </div>
        );
        await user.tab();
        onWrapperKeyDown.mockClear();
        onWrapperKeyUp.mockClear();

        await user.keyboard('{Meta>}{Shift>}a{/Shift}{/Meta}');
        expect(modShift).toHaveBeenCalledTimes(1);
        expect(ctrlShift).not.toHaveBeenCalled();
        expect(onWrapperKeyDown).toHaveBeenCalledTimes(2);
        expect(onWrapperKeyUp).toHaveBeenCalledTimes(3);
        modShift.mockClear();
        ctrlShift.mockClear();
        onWrapperKeyDown.mockClear();
        onWrapperKeyUp.mockClear();

        await user.keyboard('{Control>}{Shift>}a{/Shift}{/Control}');
        expect(modShift).not.toHaveBeenCalled();
        expect(ctrlShift).toHaveBeenCalledTimes(1);
        expect(onWrapperKeyDown).toHaveBeenCalledTimes(2);
        expect(onWrapperKeyUp).toHaveBeenCalledTimes(3);
      });

      it('Meta+Ctrl+Alt combination', async () => {
        let fn = jest.fn();
        let onWrapperKeyDown = jest.fn();
        let onWrapperKeyUp = jest.fn();
        render(
          <div onKeyDown={onWrapperKeyDown} onKeyUp={onWrapperKeyUp}>
            <ExampleButton shortcuts={{'Meta+Ctrl+Alt+z': fn}} />
          </div>
        );
        await user.tab();
        onWrapperKeyDown.mockClear();
        onWrapperKeyUp.mockClear();

        await user.keyboard('{Meta>}{Control>}{Alt>}z{/Alt}{/Control}{/Meta}');
        expect(fn).toHaveBeenCalledTimes(1);
        expect(onWrapperKeyDown).toHaveBeenCalledTimes(3);
        expect(onWrapperKeyUp).toHaveBeenCalledTimes(4);
      });

      it('Shift+Alt and key aliases', async () => {
        let save = jest.fn(() => true);
        let onWrapperKeyDown = jest.fn();
        let onWrapperKeyUp = jest.fn();
  
        render(
          <div onKeyDown={onWrapperKeyDown} onKeyUp={onWrapperKeyUp}>
            <ExampleButton shortcuts={{'Shift+Alt+down': save}} />
          </div>
        );
  
        await user.tab();
        expect(onWrapperKeyUp).toHaveBeenCalledTimes(1);
        onWrapperKeyDown.mockClear();
        onWrapperKeyUp.mockClear();
  
        await user.keyboard('{Shift>}{Alt>}{ArrowDown}{/Alt}{/Shift}');
        expect(save).toHaveBeenCalledTimes(1);
        expect(onWrapperKeyDown).toHaveBeenCalledTimes(2);
        expect(onWrapperKeyUp).toHaveBeenCalledTimes(3);
      });

      it('Mod+Shift+a matches only that binding, not Mod+a', async () => {
        let modA = jest.fn(() => true);
        let modShiftA = jest.fn(() => true);
        let onWrapperKeyDown = jest.fn();
        let onWrapperKeyUp = jest.fn();
  
        render(
          <div onKeyDown={onWrapperKeyDown} onKeyUp={onWrapperKeyUp}>
            <ExampleButton shortcuts={{'Mod+a': modA, 'Mod+Shift+a': modShiftA}} />
          </div>
        );
  
        await user.tab();
        onWrapperKeyDown.mockClear();
        onWrapperKeyUp.mockClear();
  
        await user.keyboard('{Shift>}{Meta>}a{/Meta}{/Shift}');
        expect(modShiftA).toHaveBeenCalled();
        expect(modA).not.toHaveBeenCalled();
        expect(onWrapperKeyDown).toHaveBeenCalledTimes(2);
        expect(onWrapperKeyUp).toHaveBeenCalledTimes(3);
        modShiftA.mockClear();
        modA.mockClear();

        await user.keyboard('{Meta>}a{/Meta}');
        expect(modA).toHaveBeenCalled();
        expect(modShiftA).not.toHaveBeenCalled();
      });

      it('passes event to handler', async () => {
        let ev;
        let fn = jest.fn(e => ev = e);
        render(
          <ExampleButton shortcuts={{'Escape': fn}} />
        );
        await user.tab();
        await user.keyboard('{Escape}');
        expect(ev.key).toBe('Escape');
        expect(ev.isDefaultPrevented()).toBe(false);
        expect(ev.isPropagationStopped()).toBe(true);
      });

      it('continues propagation if the function did not handle the event', async () => {
        let ev;
        let fn = jest.fn((e) => {
          ev = e;
          return false;
        });
        let onWrapperKeyDown = jest.fn();
        let onWrapperKeyUp = jest.fn();
        render(
          <div onKeyDown={onWrapperKeyDown} onKeyUp={onWrapperKeyUp}>
            <ExampleButton shortcuts={{'Escape': fn}} />
          </div>
        );
        await user.tab();
        onWrapperKeyDown.mockClear();
        onWrapperKeyUp.mockClear();
        await user.keyboard('{Escape}');
        expect(fn).toHaveBeenCalledTimes(1);
        expect(ev.isDefaultPrevented()).toBe(false);
        expect(ev.isPropagationStopped()).toBe(false);
        expect(onWrapperKeyDown).toHaveBeenCalledTimes(1);
        expect(onWrapperKeyUp).toHaveBeenCalledTimes(1);
      });

      it('prevent default and stop propagation can both be finely controlled', async () => {
        let ev;
        let fn = jest.fn((e) => {
          ev = e;
          return {shouldPreventDefault: false, shouldContinuePropagation: true};
        });
        let onWrapperKeyDown = jest.fn();
        let onWrapperKeyUp = jest.fn();
        render(
          <div onKeyDown={onWrapperKeyDown} onKeyUp={onWrapperKeyUp}>
            <ExampleButton shortcuts={{'Escape': fn}} />
          </div>
        );
        await user.tab();
        onWrapperKeyDown.mockClear();
        onWrapperKeyUp.mockClear();
        await user.keyboard('{Escape}');
        expect(fn).toHaveBeenCalledTimes(1);
        expect(ev.isDefaultPrevented()).toBe(false);
        expect(ev.isPropagationStopped()).toBe(false);
      });
    });

    describe('Windows (Mod = Ctrl)', () => {
      beforeEach(() => {
        platformMock = jest.spyOn(navigator, 'platform', 'get').mockImplementation(() => 'Win32');
      });

      it('matches Mod+key with ctrlKey', async () => {
        let save = jest.fn(() => true);
        let onWrapperKeyDown = jest.fn();
        let onWrapperKeyUp = jest.fn();

        render(
          <div onKeyDown={onWrapperKeyDown} onKeyUp={onWrapperKeyUp}>
            <ExampleButton shortcuts={{'Mod+s': save}} />
          </div>
        );

        await user.tab();
        expect(onWrapperKeyUp).toHaveBeenCalledTimes(1);
        onWrapperKeyDown.mockClear();
        onWrapperKeyUp.mockClear();

        await user.keyboard('{Control>}s{/Control}');
        expect(save).toHaveBeenCalledTimes(1);
        expect(onWrapperKeyDown).toHaveBeenCalledTimes(1); // Meta keydown should be only one
        expect(onWrapperKeyUp).toHaveBeenCalledTimes(2); // both s keyup and meta keyup

        save.mockClear();
        onWrapperKeyDown.mockClear();
        onWrapperKeyUp.mockClear();

        // None of the below should trigger the preventDefault and stopPropagation because
        // we are not handling the event.
        await user.keyboard('{Meta>}s{/Meta}');
        expect(save).not.toHaveBeenCalled();

        await user.keyboard('s');
        expect(save).not.toHaveBeenCalled();

        expect(onWrapperKeyDown).toHaveBeenCalledTimes(3);
        expect(onWrapperKeyUp).toHaveBeenCalledTimes(3);
      });
    });
  });
});
