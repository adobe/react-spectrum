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

import {Collection} from 'react-aria/Collection';
import {expect, it, vi} from 'vitest';
import {ListBox, ListBoxItem, ListBoxLoadMoreItem} from '../src/ListBox';
import {ListLayout} from 'react-stately/useVirtualizerState';
import React, {act} from 'react';
import {render} from 'vitest-browser-react';
import {useAsyncList} from 'react-stately/useAsyncList';
import {User} from '@react-aria/test-utils';
import {userEvent} from 'vitest/browser';
import {Virtualizer} from '../src/Virtualizer';

function GridListBox() {
  return (
    <ListBox
      layout="grid"
      aria-label="Test"
      selectionMode="single"
      style={{display: 'grid', gridTemplateColumns: 'repeat(3, 100px)', gridAutoRows: '40px'}}>
      <ListBoxItem>0,0</ListBoxItem>
      <ListBoxItem>0,1</ListBoxItem>
      <ListBoxItem>0,2</ListBoxItem>
      <ListBoxItem>1,0</ListBoxItem>
      <ListBoxItem>1,1</ListBoxItem>
      <ListBoxItem>1,2</ListBoxItem>
      <ListBoxItem>2,0</ListBoxItem>
      <ListBoxItem>2,1</ListBoxItem>
      <ListBoxItem>2,2</ListBoxItem>
    </ListBox>
  );
}

interface AsyncVirtualizedItem {
  id: number;
  name: string;
}

let asyncVirtualizedItems: AsyncVirtualizedItem[] = Array.from({length: 300}, (_, index) => ({
  id: index,
  name: `Item ${index}`
}));

function AsyncVirtualizedListBox() {
  let list = useAsyncList<AsyncVirtualizedItem>({
    async load({cursor}) {
      let page = cursor ? Number(cursor) : 0;
      let pageSize = 25;
      let pageCount = 12;
      let start = page * pageSize;

      await new Promise(resolve => setTimeout(resolve, 50));

      return {
        items: asyncVirtualizedItems.slice(start, start + pageSize),
        cursor: page < pageCount - 1 ? String(page + 1) : undefined
      };
    }
  });

  return (
    <Virtualizer
      layout={ListLayout}
      layoutOptions={{
        rowHeight: 50,
        padding: 4,
        loaderHeight: 30
      }}>
      <ListBox
        aria-label="async virtualized end key issue listbox"
        style={{
          height: 400,
          width: 160,
          border: '1px solid gray',
          background: 'lightgray',
          overflow: 'auto',
          padding: 'unset',
          display: 'flex'
        }}>
        <Collection items={list.items}>
          {item => (
            <ListBoxItem
              id={item.id}
              style={{
                backgroundColor: 'lightgrey',
                border: '1px solid black',
                boxSizing: 'border-box',
                height: '100%',
                width: '100%'
              }}>
              {item.name}
            </ListBoxItem>
          )}
        </Collection>
        <ListBoxLoadMoreItem isLoading={list.loadingState === 'loadingMore'} onLoadMore={list.loadMore}>
          Loading...
        </ListBoxLoadMoreItem>
      </ListBox>
    </Virtualizer>
  );
}

function expectFocusedOptionInView(listbox: HTMLElement, text?: string) {
  let activeElement = document.activeElement as HTMLElement;
  if (text != null) {
    expect(activeElement.textContent).toBe(text);
  } else {
    expect(activeElement.textContent).toMatch(/^Item /);
  }

  let listboxRect = listbox.getBoundingClientRect();
  let activeRect = activeElement.getBoundingClientRect();
  expect(activeRect.top).toBeGreaterThanOrEqual(listboxRect.top);
  expect(activeRect.bottom).toBeLessThanOrEqual(listboxRect.bottom);
}

it.each`
  interactionType
  ${'mouse'}
  ${'keyboard'}
`(
  'selects an option via $interactionType in real browser grid layout',
  async ({interactionType}) => {
    let testUtilUser = new User();
    let {container} = await render(<GridListBox />);

    let listbox = container.querySelector('[role=listbox]') as HTMLElement;
    let tester = testUtilUser.createTester('ListBox', {
      root: listbox,
      layout: 'grid',
      interactionType
    });

    let options = tester.getOptions();
    await tester.toggleOptionSelection({option: options[5]});
    expect(options[5].getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(options[5]);

    await tester.toggleOptionSelection({option: options[0]});
    expect(options[0].getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(options[0]);

    await tester.toggleOptionSelection({option: options[8]});
    expect(options[8].getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(options[8]);
  }
);

it('moves focus and scrolls to the last loaded item with End in a virtualized async listbox', async () => {
  let {container} = await render(<AsyncVirtualizedListBox />);
  let listbox = container.querySelector('[role=listbox]') as HTMLElement;

  await vi.waitFor(() => {
    expect(listbox.querySelector('[role=option]')?.textContent).toBe('Item 0');
  });
  act(() => listbox.focus());

  for (let page = 1; page <= 6; page++) {
    await userEvent.keyboard('{End}');
    await new Promise(resolve => setTimeout(resolve, 100));

    let lastItem = `Item ${page * 25 - 1}`;
    await vi.waitFor(() => expectFocusedOptionInView(listbox, lastItem));
  }
});

it('keeps the focused item visible while paging through a virtualized async listbox', async () => {
  let {container} = await render(<AsyncVirtualizedListBox />);
  let listbox = container.querySelector('[role=listbox]') as HTMLElement;

  await vi.waitFor(() => {
    expect(listbox.querySelector('[role=option]')?.textContent).toBe('Item 0');
  });
  act(() => listbox.focus());

  for (let i = 0; i < 40; i++) {
    await userEvent.keyboard('{PageDown}');
    await new Promise(resolve => setTimeout(resolve, 100));

    await vi.waitFor(() => expectFocusedOptionInView(listbox));
  }
});
