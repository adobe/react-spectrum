/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {createEventHandler} from '../../src/interactions/createEventHandler';

describe('createEventHandler', () => {
  it('exposes the fields of native events', () => {
    // Native events (e.g. from Preact) define their fields as prototype getters, not own properties.
    let target = document.createElement('div');
    let received;
    let handler = createEventHandler(e => {
      received = {
        key: e.key,
        shiftKey: e.shiftKey,
        target: e.target,
        hasKey: 'key' in e,
        shift: e.getModifierState('Shift')
      };
    });
    target.addEventListener('keydown', handler);

    let event = new KeyboardEvent('keydown', {key: 'ArrowDown', shiftKey: true, bubbles: true});
    let stopPropagation = jest.spyOn(event, 'stopPropagation');
    target.dispatchEvent(event);

    expect(received).toEqual({
      key: 'ArrowDown',
      shiftKey: true,
      target,
      hasKey: true,
      shift: true
    });
    expect(stopPropagation).toHaveBeenCalledTimes(1);
  });

  it('continues propagation of native events on request', () => {
    let target = document.createElement('div');
    let handler = createEventHandler(e => e.continuePropagation());
    target.addEventListener('keydown', handler);

    let event = new KeyboardEvent('keydown', {key: 'Enter'});
    let stopPropagation = jest.spyOn(event, 'stopPropagation');
    target.dispatchEvent(event);

    expect(stopPropagation).not.toHaveBeenCalled();
  });

  it('keeps a snapshot of the own fields of synthetic events', () => {
    let currentTarget = document.createElement('div');
    let syntheticEvent = {
      key: 'Enter',
      currentTarget,
      preventDefault: jest.fn(),
      isDefaultPrevented: () => false,
      stopPropagation: jest.fn(),
      isPropagationStopped: () => false
    };
    let received;
    createEventHandler(e => {
      received = e;
      e.preventDefault();
    })(syntheticEvent);

    // React resets currentTarget once the event has been dispatched.
    syntheticEvent.currentTarget = null;

    expect(received.key).toBe('Enter');
    expect(received.currentTarget).toBe(currentTarget);
    expect(syntheticEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(syntheticEvent.stopPropagation).toHaveBeenCalledTimes(1);
  });
});
