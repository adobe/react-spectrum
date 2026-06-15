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

import {Chat, Thread, ThreadItem} from '../src/Chat';
import {describe, expect, it} from 'vitest';
import React from 'react';
import {render} from 'vitest-browser-react';
import {userEvent} from 'vitest/browser';

interface Message {
  id: string;
  text: string;
}

const describeOrSkip = parseInt(React.version, 10) < 19 ? describe.skip : describe;
describeOrSkip('Chat browser', () => {
  describe('spatial navigation', () => {
    // This test is flaky in Firefox. Skipping for now.
    it.skip('navigates between items in spatial order via arrow keys', async () => {
      let messages: Message[] = [
        {id: '1', text: 'First message'},
        {id: '2', text: 'Second message'},
        {id: '3', text: 'Third message'}
      ];

      let {container} = await render(
        <Chat>
          <Thread UNSTABLE_focusOnEntry="first" items={[...messages].reverse()} aria-label="Chat">
            {(item: Message) => <ThreadItem textValue={item.text}>{item.text}</ThreadItem>}
          </Thread>
        </Chat>
      );

      let gridlist = container.querySelector('[role=grid]') as HTMLElement;
      let rows = gridlist.querySelectorAll('[role="row"]');

      await userEvent.click(rows[0]);
      expect(rows[0]).toHaveFocus();
      expect(rows[0]).toHaveTextContent('Third message');

      await userEvent.keyboard('{ArrowUp}');
      expect(rows[1]).toHaveFocus();
      expect(rows[1]).toHaveTextContent('Second message');

      await userEvent.keyboard('{ArrowDown}');
      expect(rows[0]).toHaveFocus();
      expect(rows[0]).toHaveTextContent('Third message');
    });
  });
});
