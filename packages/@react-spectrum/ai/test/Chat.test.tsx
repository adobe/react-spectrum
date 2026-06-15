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

jest.mock('react-aria/src/live-announcer/LiveAnnouncer');

import {act, fireEvent, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {announce} from 'react-aria/private/live-announcer/LiveAnnouncer';
import {Button} from 'react-aria-components';
import {Chat, Thread, ThreadItem, ThreadScrollButton} from '../src/Chat';
import {PromptField, PromptTokenField} from '../src/PromptField';
import React from 'react';
import userEvent from '@testing-library/user-event';

interface Message {
  id: string;
  text: string;
  isStreaming?: boolean;
}

function TestThread({
  messages,
  UNSTABLE_focusOnEntry
}: {
  messages: Message[];
  UNSTABLE_focusOnEntry?: 'first' | 'last';
}) {
  return (
    <Chat>
      <ThreadScrollButton>
        <Button slot="scroll">Scroll to bottom</Button>
      </ThreadScrollButton>
      <Thread items={messages} aria-label="Chat" UNSTABLE_focusOnEntry={UNSTABLE_focusOnEntry}>
        {(item: Message) => (
          <ThreadItem textValue={item.text} isStreaming={item.isStreaming}>
            {item.text}
          </ThreadItem>
        )}
      </Thread>
      <PromptField>
        <PromptTokenField />
      </PromptField>
    </Chat>
  );
}

let mockAnnounce = announce as jest.MockedFunction<typeof announce>;
const describeOrSkip = parseInt(React.version, 10) < 19 ? describe.skip : describe;
describeOrSkip('Thread', () => {
  let user;

  beforeAll(() => {
    jest.useFakeTimers();
    user = userEvent.setup({delay: null, pointerMap});
  });

  afterEach(() => {
    jest.clearAllMocks();
    act(() => jest.runAllTimers());
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('announcements', () => {
    it('announces item text when prompt field is focused', async () => {
      let {rerender, getByRole} = render(<TestThread messages={[{id: '1', text: 'Hello'}]} />);
      act(() => jest.runAllTimers());
      mockAnnounce.mockClear();

      await user.click(getByRole('textbox'));
      rerender(
        <TestThread
          messages={[
            {id: '1', text: 'Hello'},
            {id: '2', text: 'World'}
          ]}
        />
      );

      expect(mockAnnounce).toHaveBeenCalledWith('World', 'polite');
    });

    it('does not announce when focus is outside the thread', () => {
      let {rerender} = render(<TestThread messages={[{id: '1', text: 'Hello'}]} />);
      act(() => jest.runAllTimers());
      mockAnnounce.mockClear();

      rerender(
        <TestThread
          messages={[
            {id: '1', text: 'Hello'},
            {id: '2', text: 'World'}
          ]}
        />
      );

      expect(mockAnnounce).not.toHaveBeenCalled();
    });

    it('announces "New message" when GridList is focused and a new message is added', async () => {
      let {rerender} = render(<TestThread messages={[{id: '1', text: 'Hello'}]} />);
      act(() => jest.runAllTimers());
      mockAnnounce.mockClear();

      await user.keyboard('{Tab}');
      rerender(
        <TestThread
          messages={[
            {id: '1', text: 'Hello'},
            {id: '2', text: 'World'}
          ]}
        />
      );

      expect(mockAnnounce).toHaveBeenCalledWith('New message', 'polite');
      expect(mockAnnounce).not.toHaveBeenCalledWith('World', 'polite');
    });

    it('debounces "New message" announcement within 5 seconds when GridList is focused', async () => {
      let {rerender} = render(<TestThread messages={[{id: '1', text: 'Hello'}]} />);
      act(() => jest.runAllTimers());
      mockAnnounce.mockClear();

      await user.keyboard('{Tab}');

      rerender(
        <TestThread
          messages={[
            {id: '1', text: 'Hello'},
            {id: '2', text: 'World'}
          ]}
        />
      );

      expect(mockAnnounce).toHaveBeenCalledTimes(1);
      expect(mockAnnounce).toHaveBeenCalledWith('New message', 'polite');
      rerender(
        <TestThread
          messages={[
            {id: '1', text: 'Hello'},
            {id: '2', text: 'World'},
            {id: '3', text: 'Again'}
          ]}
        />
      );

      expect(mockAnnounce).toHaveBeenCalledTimes(1);
      expect(mockAnnounce).toHaveBeenCalledWith('New message', 'polite');

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      rerender(
        <TestThread
          messages={[
            {id: '1', text: 'Hello'},
            {id: '2', text: 'World'},
            {id: '3', text: 'Again'},
            {id: '4', text: 'Again 2'}
          ]}
        />
      );

      expect(mockAnnounce).toHaveBeenCalledTimes(2);
      expect(mockAnnounce).toHaveBeenLastCalledWith('New message', 'polite');
    });

    it('announces text when streaming finishes and prompt is focused', async () => {
      let {rerender, getByRole} = render(
        <TestThread messages={[{id: '1', text: 'Hello', isStreaming: true}]} />
      );
      act(() => jest.runAllTimers());

      await user.click(getByRole('textbox'));
      mockAnnounce.mockClear();

      rerender(<TestThread messages={[{id: '1', text: 'Hello', isStreaming: false}]} />);

      expect(mockAnnounce).toHaveBeenCalledWith('Hello', 'polite');
    });

    it('does not announce when streaming finishes and focus is outside', () => {
      let {rerender} = render(
        <TestThread messages={[{id: '1', text: 'Hello', isStreaming: true}]} />
      );
      act(() => jest.runAllTimers());
      mockAnnounce.mockClear();

      rerender(<TestThread messages={[{id: '1', text: 'Hello', isStreaming: false}]} />);

      expect(mockAnnounce).not.toHaveBeenCalled();
    });
  });

  describe('scroll button', () => {
    it('appears when scrolled above the -100px threshold', async () => {
      let {queryByText, getByRole} = render(<TestThread messages={[{id: '1', text: 'Hello'}]} />);

      let grid = getByRole('grid');
      Object.defineProperty(grid, 'scrollTop', {value: -200, writable: true, configurable: true});
      await act(async () => {
        fireEvent.scroll(grid);
      });

      expect(queryByText('Scroll to bottom')).toBeInTheDocument();
    });

    it('stays hidden when scroll is within the -100px threshold', async () => {
      let {queryByText, getByRole} = render(<TestThread messages={[{id: '1', text: 'Hello'}]} />);

      let grid = getByRole('grid');
      Object.defineProperty(grid, 'scrollTop', {value: -50, writable: true, configurable: true});
      await act(async () => {
        fireEvent.scroll(grid);
      });

      expect(queryByText('Scroll to bottom')).not.toBeInTheDocument();
    });

    it('calls scrollTo on the list when clicked', async () => {
      let {getByText, getByRole} = render(<TestThread messages={[{id: '1', text: 'Hello'}]} />);

      let grid = getByRole('grid');
      let scrollTo = jest.fn();
      grid.scrollTo = scrollTo;

      Object.defineProperty(grid, 'scrollTop', {value: -200, writable: true, configurable: true});
      await act(async () => {
        fireEvent.scroll(grid);
      });

      await user.click(getByText('Scroll to bottom'));
      expect(scrollTo).toHaveBeenCalledWith({top: 0, behavior: 'smooth'});
    });
  });

  describe('focus behavior', () => {
    it('focuses the first item in the list when tabbing in if UNSTABLE_focusOnEntry="first"', async () => {
      let {getByRole} = render(
        <TestThread
          UNSTABLE_focusOnEntry="first"
          messages={[
            {id: '1', text: 'Hello'},
            {id: '2', text: 'World'}
          ]}
        />
      );

      let gridlist = getByRole('grid');
      let rows = gridlist.querySelectorAll('[role="row"]');
      await user.tab();
      expect(document.activeElement).toBe(rows[0]);
      expect(rows[0]).toHaveTextContent('Hello');

      await user.keyboard('{ArrowDown}');
      expect(document.activeElement).toBe(rows[1]);

      await user.tab();
      expect(document.activeElement).toBe(getByRole('textbox'));

      // should always move to first item when entering the thread via tab regardless of last focused row
      await user.tab({shift: true});
      expect(document.activeElement).toBe(rows[0]);
    });

    it('focuses the last item in the list when tabbing in if UNSTABLE_focusOnEntry="last"', async () => {
      let {getByRole} = render(
        <TestThread
          UNSTABLE_focusOnEntry="last"
          messages={[
            {id: '1', text: 'Hello'},
            {id: '2', text: 'World'}
          ]}
        />
      );

      let gridlist = getByRole('grid');
      let rows = gridlist.querySelectorAll('[role="row"]');
      await user.tab();
      expect(document.activeElement).toBe(rows[1]);
      expect(rows[1]).toHaveTextContent('World');

      await user.keyboard('{ArrowUp}');
      expect(document.activeElement).toBe(rows[0]);

      await user.tab();
      expect(document.activeElement).toBe(getByRole('textbox'));

      // should always move to last item when entering the thread via tab regardless of last focused row
      await user.tab({shift: true});
      expect(document.activeElement).toBe(rows[1]);
    });
  });
});
