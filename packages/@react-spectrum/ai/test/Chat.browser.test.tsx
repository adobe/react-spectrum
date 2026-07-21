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

import {Button, Collection} from 'react-aria-components';
import {Chat, Thread, ThreadItem, ThreadLoadMoreItem, ThreadScrollButton} from '../src/Chat';
import {describe, expect, it, vi} from 'vitest';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {render} from 'vitest-browser-react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {userEvent} from 'vitest/browser';
import {UserMessage} from '../src/UserMessage';

// Applied to Thread when it needs its own scroll viewport.
let scrollThreadStyles = style({
  flexGrow: 1,
  overflowX: 'hidden',
  overflowY: 'auto',
  padding: 8,
  scrollPadding: 8,
  rowGap: 16
});

// Applied to Chat when it must be the flex container for ScrollButton + Thread.
let chatFlexStyles = style({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
  overflow: 'hidden'
});

// Message type for async loading tests — includes role for realistic rendering.
interface Message {
  id: string;
  content: string;
  role?: 'user' | 'assistant';
}

// Realistic conversation fixture ordered oldest → newest (24 messages).
// The first 4 serve as "older history" loaded on demand; the last 20 are the initial page
// for scroll-anchoring tests. For basic async tests, use CONVERSATION.slice(0, 6).
const CONVERSATION: Message[] = [
  {id: '1', role: 'user', content: 'Hey, can you tell me about cats?'},
  {
    id: '2',
    role: 'assistant',
    content:
      'Of course! Cats are curious, intelligent mammals that have lived alongside humans for thousands of years. They are known for their agility, independence, and playful personalities.'
  },
  {id: '3', role: 'user', content: 'Do cats see well in the dark?'},
  {
    id: '4',
    role: 'assistant',
    content:
      'Yes! Cats have excellent night vision. Their eyes are adapted to low-light conditions, allowing them to see much better than humans at dusk and dawn.'
  },
  {id: '5', role: 'user', content: 'Why do cats purr?'},
  {
    id: '6',
    role: 'assistant',
    content:
      'Cats often purr when they are relaxed and happy, but they may also purr to comfort themselves when stressed or recovering from an injury.'
  },
  {id: '7', role: 'user', content: 'What should I feed a cat?'},
  {
    id: '8',
    role: 'assistant',
    content:
      'Cats are obligate carnivores, so they need a diet rich in animal protein. A complete, balanced commercial cat food is usually the best choice.'
  },
  {id: '9', role: 'user', content: 'Why do cats knead blankets?'},
  {
    id: '10',
    role: 'assistant',
    content:
      'Kneading is a behavior kittens use while nursing, and many adult cats continue doing it because it is comforting and helps them relax.'
  },
  {id: '11', role: 'user', content: 'Why do cats sleep so much?'},
  {
    id: '12',
    role: 'assistant',
    content:
      'Cats typically sleep 12–16 hours a day. As natural predators, they conserve energy between bursts of activity.'
  },
  {id: '13', role: 'user', content: 'Can cats learn tricks?'},
  {
    id: '14',
    role: 'assistant',
    content:
      'Absolutely! With patience and positive reinforcement, many cats can learn tricks like sit, high five, come when called, and even walk on a harness.'
  },
  {id: '15', role: 'user', content: 'Why do cats bring me toys?'},
  {
    id: '16',
    role: 'assistant',
    content:
      'Many cats bring toys to their owners as a form of play, attention-seeking, or because they are expressing natural hunting instincts.'
  },
  {id: '17', role: 'user', content: 'Why do cats flick their tails?'},
  {
    id: '18',
    role: 'assistant',
    content:
      'A cat’s tail can reveal its mood. Slow swishing may show curiosity, rapid flicking can indicate irritation, and an upright tail often signals confidence or friendliness.'
  },
  {id: '19', role: 'user', content: 'What are some popular cat breeds?'},
  {
    id: '20',
    role: 'assistant',
    content:
      'Popular breeds include the Maine Coon, Siamese, Ragdoll, Bengal, British Shorthair, Persian, and Sphynx. Each has its own unique appearance and personality.'
  },
  {id: '21', role: 'user', content: 'Do cats like climbing?'},
  {
    id: '22',
    role: 'assistant',
    content:
      'Yes! Most cats love climbing because it gives them a safe vantage point to observe their surroundings. Cat trees and shelves are great enrichment.'
  },
  {id: '23', role: 'user', content: 'How can I keep my cat entertained?'},
  {
    id: '24',
    role: 'assistant',
    content:
      'Interactive toys, puzzle feeders, scratching posts, climbing structures, and short daily play sessions with wand toys are excellent ways to keep cats mentally and physically stimulated.'
  }
];

function renderAsyncMessage(msg: Message) {
  if (msg.role === 'user') {
    return (
      <ThreadItem textValue={msg.content} styles={style({display: 'flex', justifyContent: 'end'})}>
        <UserMessage>{msg.content}</UserMessage>
      </ThreadItem>
    );
  }
  return (
    <ThreadItem textValue={msg.content} styles={style({font: 'body'})}>
      {msg.content}
    </ThreadItem>
  );
}

// Async virtualized thread that starts with the most recent `pageSize` messages and
// prepends older batches on demand. Pass `delay` to slow down loads in tests that
// need to observe the in-flight loading state.
function AsyncVirtualizedThread({
  messages,
  pageSize = 5,
  delay = 20
}: {
  messages: Message[];
  pageSize?: number;
  delay?: number;
}) {
  let [visible, setVisible] = useState(() => messages.slice(-pageSize));
  let [isLoading, setIsLoading] = useState(false);
  let [hasMore, setHasMore] = useState(messages.length > pageSize);
  let isLoadingRef = useRef(false);
  let cursorRef = useRef(messages.length - pageSize);

  let handleLoadMore = useCallback(async () => {
    if (isLoadingRef.current || cursorRef.current <= 0) {
      return;
    }
    isLoadingRef.current = true;
    setIsLoading(true);
    await new Promise<void>(r => setTimeout(r, delay));
    let nextCursor = Math.max(0, cursorRef.current - pageSize);
    let batch = messages.slice(nextCursor, cursorRef.current);
    cursorRef.current = nextCursor;
    setHasMore(nextCursor > 0);
    setVisible(prev => [...batch, ...prev]);
    setIsLoading(false);
    isLoadingRef.current = false;
  }, [messages, pageSize, delay]);

  return (
    <div>
      <Chat>
        <Thread anchorTo="end" aria-label="Chat">
          <ThreadLoadMoreItem
            isLoading={isLoading}
            onLoadMore={hasMore ? handleLoadMore : undefined}>
            <span aria-label="Loading older messages">Loading…</span>
          </ThreadLoadMoreItem>
          <Collection items={visible}>
            {item => <ThreadItem textValue={item.content}>{item.content}</ThreadItem>}
          </Collection>
        </Thread>
      </Chat>
    </div>
  );
}

// Non-virtualized equivalent — uses column-reverse layout. Items are reversed so the
// newest is first in the DOM (visible at scrollTop=0). ThreadLoadMoreItem goes after
// Collection so it lands at the visual top (DOM end in column-reverse).
function AsyncNonVirtualizedThread({
  messages,
  pageSize = 5,
  delay = 20
}: {
  messages: Message[];
  pageSize?: number;
  delay?: number;
}) {
  let [visible, setVisible] = useState(() => messages.slice(-pageSize));
  let [loaded, setLoaded] = useState(pageSize);
  let [isLoading, setIsLoading] = useState(false);
  let reversed = useMemo(() => [...visible].reverse(), [visible]);
  let hasMore = loaded < messages.length;

  let handleLoadMore = useCallback(async () => {
    setIsLoading(true);
    await new Promise<void>(r => setTimeout(r, delay));
    let start = Math.max(0, messages.length - loaded - pageSize);
    let end = messages.length - loaded;
    let batch = messages.slice(start, end);
    setVisible(prev => [...batch, ...prev]);
    setLoaded(prev => Math.min(prev + pageSize, messages.length));
    setIsLoading(false);
  }, [messages, pageSize, loaded, delay]);

  return (
    <div
      style={{
        width: 600,
        height: 400,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
      <Chat>
        <Thread aria-label="Chat" styles={scrollThreadStyles}>
          <Collection items={reversed}>{renderAsyncMessage}</Collection>
          <ThreadLoadMoreItem
            isLoading={isLoading}
            onLoadMore={hasMore && !isLoading ? handleLoadMore : undefined}>
            <span aria-label="Loading older messages">Loading…</span>
          </ThreadLoadMoreItem>
        </Thread>
      </Chat>
    </div>
  );
}

const describeOrSkip = parseInt(React.version, 10) < 19 ? describe.skip : describe;
describeOrSkip('Chat browser', () => {
  describe('spatial navigation', () => {
    // This test is flaky in Firefox. Skipping for now.
    it.skip('navigates between items in spatial order via arrow keys', async () => {
      let messages: Message[] = [
        {id: '1', content: 'First message'},
        {id: '2', content: 'Second message'},
        {id: '3', content: 'Third message'}
      ];

      let {container} = await render(
        <Chat>
          <Thread aria-label="Chat" items={messages}>
            {(item: Message) => <ThreadItem textValue={item.content}>{item.content}</ThreadItem>}
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

  describe('virtualized Thread – focus behavior', () => {
    it('focuses the newest (last) item when tabbing in', async () => {
      let {container} = await render(
        <div>
          <input type="text" id="before" />
          <Chat>
            <Thread
              anchorTo="end"
              items={
                [
                  {id: '1', content: 'Hello', role: 'user'},
                  {id: '2', content: 'World', role: 'system'}
                ] as Message[]
              }
              aria-label="Chat">
              {(item: Message) => {
                return <ThreadItem textValue={item.content}>{item.content}</ThreadItem>;
              }}
            </Thread>
          </Chat>
        </div>
      );

      let gridlist = container.querySelector('[role="grid"]') as HTMLElement;

      // Wait for virtualizer to render rows before tabbing.
      await vi.waitFor(
        () => {
          expect(gridlist.querySelectorAll('[role="row"]').length).toBeGreaterThan(0);
        },
        {timeout: 2000}
      );

      // Click the button first so focus has a starting point, then tab into the grid.
      // Without an initial focused element, userEvent.tab() may not move focus reliably.
      let input = container.querySelector('input') as HTMLElement;
      await userEvent.click(input);
      expect(input).toHaveFocus();
      await userEvent.tab();

      let rows = gridlist.querySelectorAll('[role="row"]');
      await vi.waitFor(
        () => {
          // rows[0] = World (newest) — DOM-first in the reversed virtualizer layout.
          expect(rows[0]).toHaveFocus();
        },
        {timeout: 2000}
      );
      expect(rows[0]).toHaveTextContent('World');
    });

    // Flaky in Firefox. Skip for now.
    it.skip('navigates between items with arrow keys', async () => {
      let {container} = await render(
        <div>
          <input type="text" id="before" />
          <Chat>
            <Thread
              anchorTo="end"
              items={
                [
                  {id: '1', content: 'Hello'},
                  {id: '2', content: 'World'}
                ] as Message[]
              }
              aria-label="Chat">
              {(item: Message) => <ThreadItem textValue={item.content}>{item.content}</ThreadItem>}
            </Thread>
          </Chat>
          <button>After</button>
        </div>
      );

      let gridlist = container.querySelector('[role="grid"]') as HTMLElement;

      await vi.waitFor(
        () => {
          expect(gridlist.querySelectorAll('[role="row"]').length).toBeGreaterThan(0);
        },
        {timeout: 2000}
      );

      // Click the button first so focus has a starting point, then tab into the grid.
      // Without an initial focused element, userEvent.tab() may not move focus reliably.
      let input = container.querySelector('input') as HTMLElement;
      await userEvent.click(input);
      expect(input).toHaveFocus();
      await userEvent.tab();

      let rows = gridlist.querySelectorAll('[role="row"]');
      await vi.waitFor(() => expect(rows[0]).toHaveFocus(), {timeout: 2000});

      // ArrowUp from World (visual bottom) → Hello (visual top) = rows[1] in DOM.
      await userEvent.keyboard('{ArrowUp}');
      await vi.waitFor(() => expect(rows[1]).toHaveFocus(), {timeout: 1000});
      expect(rows[1]).toHaveTextContent('Hello');

      // ArrowDown from Hello → World = rows[0].
      await userEvent.keyboard('{ArrowDown}');
      await vi.waitFor(() => expect(rows[0]).toHaveFocus(), {timeout: 1000});
      expect(rows[0]).toHaveTextContent('World');
    });

    // Flaky in Firefox. Skip for now.
    // We might change this behavior in the future so that it doesn't always re-focus the newest item when re-tabbing in. Instead, it will focus the previous focused item (if there was one).
    it.skip('always re-focuses the newest item when re-tabbing in', async () => {
      let {container} = await render(
        <div>
          <input type="text" id="before" />
          <Chat>
            <Thread
              anchorTo="end"
              items={
                [
                  {id: '1', content: 'Hello'},
                  {id: '2', content: 'World'}
                ] as Message[]
              }
              aria-label="Chat">
              {(item: Message) => <ThreadItem textValue={item.content}>{item.content}</ThreadItem>}
            </Thread>
          </Chat>
          <input type="text" id="after" />
        </div>
      );

      let gridlist = container.querySelector('[role="grid"]') as HTMLElement;

      await vi.waitFor(
        () => {
          expect(gridlist.querySelectorAll('[role="row"]').length).toBeGreaterThan(0);
        },
        {timeout: 2000}
      );

      // Click the button first so focus has a starting point, then tab into the grid.
      // Without an initial focused element, userEvent.tab() may not move focus reliably.
      let beforeInput = container.querySelectorAll('input')[0] as HTMLElement;
      await userEvent.click(beforeInput);
      expect(beforeInput).toHaveFocus();
      await userEvent.tab();

      let rows = gridlist.querySelectorAll('[role="row"]');
      await vi.waitFor(() => expect(rows[0]).toHaveFocus(), {timeout: 2000});

      // Navigate to Hello (rows[1]).
      await userEvent.keyboard('{ArrowUp}');
      await vi.waitFor(() => expect(rows[1]).toHaveFocus(), {timeout: 1000});

      // Click the After button to move focus outside the grid.
      let afterInput = container.querySelectorAll('input')[1] as HTMLElement;
      await userEvent.click(afterInput);
      expect(afterInput).toHaveFocus();

      // Shift-Tab to re-enter the grid → focusOnEntry fires again → World (rows[0]).
      await userEvent.tab({shift: true});
      await vi.waitFor(() => expect(rows[0]).toHaveFocus(), {timeout: 2000});
      expect(rows[0]).toHaveTextContent('World');
    });
  });

  describe('virtualized Thread – scroll button', () => {
    it('appears when scrolled away from the bottom', async () => {
      // 20 messages with long enough text to overflow the 400px container.
      let messages: Message[] = Array.from({length: 20}, (_, i) => ({
        id: String(i + 1),
        content: `Message number ${i + 1} in the chat thread`
      }));

      let {container} = await render(
        <div
          style={{
            width: 600,
            height: 400,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
          <Chat styles={chatFlexStyles}>
            <ThreadScrollButton>
              <Button slot="scroll" data-testid="scroll-btn">
                Scroll to bottom
              </Button>
            </ThreadScrollButton>
            <Thread anchorTo="end" items={messages} aria-label="Chat" styles={scrollThreadStyles}>
              {(item: Message) => <ThreadItem textValue={item.content}>{item.content}</ThreadItem>}
            </Thread>
          </Chat>
        </div>
      );

      let grid = container.querySelector('[role="grid"]') as HTMLElement;

      // Wait for layout to stabilize — anchorTo="end" snaps scrollTop to the bottom.
      await vi.waitFor(
        () => {
          expect(grid.scrollTop).toBeGreaterThan(0);
        },
        {timeout: 3000}
      );

      // Initially at the bottom — scroll button should be hidden.
      expect(container.querySelector('[data-testid="scroll-btn"]')).not.toBeInTheDocument();

      // Scroll to top (away from newest messages at bottom).
      grid.scrollTop = 0;
      grid.dispatchEvent(new Event('scroll', {bubbles: true}));

      // Scroll button should now appear.
      await vi.waitFor(
        () => {
          expect(container.querySelector('[data-testid="scroll-btn"]')).toBeInTheDocument();
        },
        {timeout: 2000}
      );
    });

    it('stays hidden when near the bottom', async () => {
      let messages: Message[] = Array.from({length: 20}, (_, i) => ({
        id: String(i + 1),
        content: `Message number ${i + 1} in the chat thread`
      }));

      let {container} = await render(
        <div
          style={{
            width: 600,
            height: 400,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
          <Chat styles={chatFlexStyles}>
            <ThreadScrollButton>
              <Button slot="scroll" data-testid="scroll-btn">
                Scroll to bottom
              </Button>
            </ThreadScrollButton>
            <Thread anchorTo="end" items={messages} aria-label="Chat" styles={scrollThreadStyles}>
              {(item: Message) => <ThreadItem textValue={item.content}>{item.content}</ThreadItem>}
            </Thread>
          </Chat>
        </div>
      );

      let grid = container.querySelector('[role="grid"]') as HTMLElement;

      // Wait for layout to stabilize at the bottom.
      await vi.waitFor(
        () => {
          expect(grid.scrollTop).toBeGreaterThan(0);
        },
        {timeout: 3000}
      );

      // No manual scroll — still near bottom. Button should stay hidden.
      expect(container.querySelector('[data-testid="scroll-btn"]')).not.toBeInTheDocument();
    });

    it('scrolls back to the bottom when clicked', async () => {
      let messages: Message[] = Array.from({length: 20}, (_, i) => ({
        id: String(i + 1),
        content: `Message number ${i + 1} in the chat thread`
      }));

      let {container} = await render(
        <div
          style={{
            width: 600,
            height: 400,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
          <Chat styles={chatFlexStyles}>
            <ThreadScrollButton>
              <Button slot="scroll" data-testid="scroll-btn">
                Scroll to bottom
              </Button>
            </ThreadScrollButton>
            <Thread anchorTo="end" items={messages} aria-label="Chat" styles={scrollThreadStyles}>
              {(item: Message) => <ThreadItem textValue={item.content}>{item.content}</ThreadItem>}
            </Thread>
          </Chat>
        </div>
      );

      let grid = container.querySelector('[role="grid"]') as HTMLElement;

      // Wait for layout at the bottom.
      await vi.waitFor(
        () => {
          expect(grid.scrollTop).toBeGreaterThan(0);
        },
        {timeout: 3000}
      );

      // Scroll to top to reveal the scroll button.
      grid.scrollTop = 0;
      grid.dispatchEvent(new Event('scroll', {bubbles: true}));

      await vi.waitFor(
        () => {
          expect(container.querySelector('[data-testid="scroll-btn"]')).toBeInTheDocument();
        },
        {timeout: 2000}
      );

      // Click → scrolls back to bottom → button disappears.
      await userEvent.click(container.querySelector('[data-testid="scroll-btn"]') as HTMLElement);

      await vi.waitFor(
        () => {
          expect(container.querySelector('[data-testid="scroll-btn"]')).not.toBeInTheDocument();
        },
        {timeout: 3000}
      );
    });
  });

  describe('async loading – virtualized (anchorTo="end")', () => {
    it('shows loading indicator while onLoadMore is in-flight', async () => {
      let {container} = await render(
        <AsyncVirtualizedThread messages={CONVERSATION.slice(0, 6)} pageSize={3} delay={500} />
      );

      await vi.waitFor(
        () => {
          expect(
            container.querySelector('[aria-label="Loading older messages"]')
          ).toBeInTheDocument();
        },
        {timeout: 3000}
      );
    });

    it('fires onLoadMore when sentinel is visible and prepends older items', async () => {
      // Start with the 3 newest messages; older 3 load automatically when sentinel is visible.
      let {container} = await render(
        <AsyncVirtualizedThread messages={CONVERSATION.slice(0, 6)} pageSize={3} />
      );

      // Wait for all 6 rows to appear.
      await vi.waitFor(
        () => {
          let rows = container.querySelectorAll('[role="row"]');
          expect(rows.length).toBe(6);
        },
        {timeout: 3000}
      );

      // In the virtualizer, buildReversedCollection puts the NEWEST item first in the DOM.
      // After prepend: chronological order is CONVERSATION[0..5].
      // DOM order: newest (CONVERSATION[5]) = rows[0], oldest (CONVERSATION[0]) = rows[5].
      let rows = container.querySelectorAll('[role="row"]');
      expect(rows[0]).toHaveTextContent(CONVERSATION[5].content);
      expect(rows[rows.length - 1]).toHaveTextContent(CONVERSATION[0].content);
    });

    it('hides loading indicator after load completes', async () => {
      let {container} = await render(
        <AsyncVirtualizedThread messages={CONVERSATION.slice(0, 6)} pageSize={3} />
      );

      // Wait until BOTH all 6 rows are visible AND the indicator is gone.
      await vi.waitFor(
        () => {
          let rows = container.querySelectorAll('[role="row"]');
          expect(rows.length).toBe(6);
          expect(
            container.querySelector('[aria-label="Loading older messages"]')
          ).not.toBeInTheDocument();
        },
        {timeout: 3000}
      );
    });

    it('does not call onLoadMore when onLoadMore is undefined', async () => {
      // pageSize equals messages.length → hasMore=false → onLoadMore=undefined from the start.
      let {container} = await render(
        <AsyncVirtualizedThread messages={CONVERSATION.slice(-3)} pageSize={3} />
      );

      // Wait a moment to confirm no extra rows are added.
      await new Promise(r => setTimeout(r, 200));
      let rows = container.querySelectorAll('[role="row"]');
      expect(rows.length).toBe(3);
    });
  });

  describe('async loading – non-virtualized', () => {
    it('shows loading indicator while onLoadMore is in-flight', async () => {
      // 3 of 6 messages fit in the 400px container → sentinel visible → load starts.
      let {container} = await render(
        <AsyncNonVirtualizedThread messages={CONVERSATION.slice(0, 6)} pageSize={3} delay={5000} />
      );

      await vi.waitFor(
        () => {
          expect(
            container.querySelector('[aria-label="Loading older messages"]')
          ).toBeInTheDocument();
        },
        {timeout: 3000}
      );
    });

    it('fires onLoadMore when sentinel is visible and prepends older items', async () => {
      let {container} = await render(
        <AsyncNonVirtualizedThread messages={CONVERSATION.slice(0, 6)} pageSize={3} />
      );

      // Wait for all 6 rows to appear.
      await vi.waitFor(
        () => {
          let rows = container.querySelectorAll('[role="row"]');
          expect(rows.length).toBe(6);
        },
        {timeout: 3000}
      );
    });

    it('hides loading indicator after load completes', async () => {
      let {container} = await render(
        <AsyncNonVirtualizedThread messages={CONVERSATION.slice(0, 6)} pageSize={3} />
      );

      await vi.waitFor(
        () => {
          let rows = container.querySelectorAll('[role="row"]');
          expect(rows.length).toBe(6);
          expect(
            container.querySelector('[aria-label="Loading older messages"]')
          ).not.toBeInTheDocument();
        },
        {timeout: 3000}
      );
    });
  });
});
