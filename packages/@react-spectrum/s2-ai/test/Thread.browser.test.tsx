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

import {describe, expect, it} from 'vitest';
import React from 'react';
import {render} from 'vitest-browser-react';
import {Thread, ThreadItem, ThreadList} from '../src/Thread';
import {userEvent} from 'vitest/browser';

interface Message {
  id: string;
  text: string;
}

async function flushAnimationFrames() {
  await new Promise<void>(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function hasReversedColumnLayout(rows: NodeListOf<HTMLElement>) {
  let tops = [...rows].map(r => r.getBoundingClientRect().top);
  if (new Set(tops.map(t => Math.round(t))).size !== rows.length) {
    return false;
  }

  // column-reverse: earlier DOM rows appear lower on screen (larger top values).
  for (let i = 0; i < tops.length - 1; i++) {
    if (tops[i] <= tops[i + 1]) {
      return false;
    }
  }

  return true;
}

async function waitForReversedColumnLayout(rows: NodeListOf<HTMLElement>) {
  await expect.poll(() => hasReversedColumnLayout(rows)).toBe(true);
}

async function pressArrowKeyUntilFocused(
  key: 'ArrowUp' | 'ArrowDown',
  expected: HTMLElement,
  rows: NodeListOf<HTMLElement>
) {
  let deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    if (document.activeElement === expected) {
      return;
    }

    if (hasReversedColumnLayout(rows)) {
      await userEvent.keyboard(`{${key}}`);
    }

    await flushAnimationFrames();
  }

  expect(document.activeElement).toBe(expected);
}

describe('Thread browser', () => {
  describe('spatial navigation', () => {
    it('navigates between items in spatial order via arrow keys', async () => {
      let messages: Message[] = [
        {id: '1', text: 'First message'},
        {id: '2', text: 'Second message'},
        {id: '3', text: 'Third message'}
      ];

      let {container} = await render(
        <Thread style={{height: 200}}>
          <ThreadList focusOnEntry="first" items={[...messages].reverse()} aria-label="Chat">
            {(item: Message) => <ThreadItem textValue={item.text}>{item.text}</ThreadItem>}
          </ThreadList>
        </Thread>
      );

      await flushAnimationFrames();

      let gridlist = container.querySelector('[role=grid]') as HTMLElement;
      let rows = gridlist.querySelectorAll('[role="row"]') as NodeListOf<HTMLElement>;

      await waitForReversedColumnLayout(rows);

      rows[0].scrollIntoView();
      await userEvent.click(rows[0]);
      expect(document.activeElement).toBe(rows[0]);
      expect(rows[0]).toHaveTextContent('Third message');

      await pressArrowKeyUntilFocused('ArrowUp', rows[1], rows);
      expect(rows[1]).toHaveTextContent('Second message');

      await pressArrowKeyUntilFocused('ArrowDown', rows[0], rows);
      expect(rows[0]).toHaveTextContent('Third message');
    });
  });
});
