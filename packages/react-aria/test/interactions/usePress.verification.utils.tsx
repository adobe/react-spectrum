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

import {flushSync} from 'react-dom';
import React from 'react';
import {usePress} from '../../src/interactions/usePress';
import {vi} from 'vitest';

export type LoggedEvent = {type: string; pointerType?: string};

export function Example({
  events,
  isDisabled = false
}: {
  events: LoggedEvent[];
  isDisabled?: boolean;
}) {
  let record = (event: {type: string; pointerType: string}) =>
    events.push({type: event.type, pointerType: event.pointerType});
  let {pressProps, isPressed} = usePress({
    isDisabled,
    onPressStart: record,
    onPressEnd: record,
    onPress: record
  });
  return (
    <div {...pressProps} role="button" tabIndex={0} data-pressed={isPressed}>
      Press
    </div>
  );
}

export async function pointer(target: EventTarget, type: string, pointerId = 1) {
  flushSync(() => {
    target.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        composed: true,
        pointerId,
        pointerType: 'touch',
        button: 0,
        buttons: type === 'pointerdown' ? 1 : 0,
        width: 10,
        height: 10,
        isPrimary: pointerId === 1
      })
    );
  });
}

export async function click(target: EventTarget) {
  flushSync(() => {
    target.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, detail: 1}));
  });
}

export async function timeout() {
  flushSync(() => {
    vi.advanceTimersByTime(100);
  });
}
