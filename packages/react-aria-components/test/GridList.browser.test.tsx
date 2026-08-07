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

import {expect, it} from 'vitest';
import {GridLayout} from '../src/GridLayout';
import {GridList, GridListItem} from '../src/GridList';
import React, {useState} from 'react';
import {render} from 'vitest-browser-react';
import {Size} from 'react-stately/useVirtualizerState';
import {User} from '@react-aria/test-utils';
import {Virtualizer} from '../src/Virtualizer';

function Grid() {
  return (
    <GridList
      layout="grid"
      aria-label="Test"
      selectionMode="single"
      style={{display: 'grid', gridTemplateColumns: 'repeat(3, 100px)', gridAutoRows: '40px'}}>
      <GridListItem>0,0</GridListItem>
      <GridListItem>0,1</GridListItem>
      <GridListItem>0,2</GridListItem>
      <GridListItem>1,0</GridListItem>
      <GridListItem>1,1</GridListItem>
      <GridListItem>1,2</GridListItem>
      <GridListItem>2,0</GridListItem>
      <GridListItem>2,1</GridListItem>
      <GridListItem>2,2</GridListItem>
    </GridList>
  );
}

function VirtualizedDisplayNone() {
  let [visible, setVisible] = useState(true);
  let items = Array.from({length: 100}, (_, i) => ({id: i, name: `Item ${i}`}));
  return (
    <div>
      <button data-testid="toggle" onClick={() => setVisible(v => !v)}>
        Toggle
      </button>
      <div style={{display: visible ? undefined : 'none'}}>
        <Virtualizer
          layout={GridLayout}
          layoutOptions={{
            minItemSize: new Size(80, 40),
            maxItemSize: new Size(200, 40),
            minSpace: new Size(8, 8)
          }}>
          <GridList
            layout="grid"
            aria-label="virtualized list"
            style={{height: 200, width: 400}}
            items={items}>
            {(item: {id: number; name: string}) => (
              <GridListItem id={item.id}>{item.name}</GridListItem>
            )}
          </GridList>
        </Virtualizer>
      </div>
    </div>
  );
}

it.each`
  interactionType
  ${'mouse'}
  ${'keyboard'}
`('selects a row via $interactionType in real browser grid layout', async ({interactionType}) => {
  let testUtilUser = new User();
  let {container} = await render(<Grid />);

  let gridlist = container.querySelector('[role=grid]') as HTMLElement;
  let tester = testUtilUser.createTester('GridList', {
    root: gridlist,
    layout: 'grid',
    interactionType
  });

  let rows = tester.getRows();
  await tester.toggleRowSelection({row: rows[5]});
  expect(rows[5].getAttribute('aria-selected')).toBe('true');
  expect(document.activeElement).toBe(rows[5]);

  await tester.toggleRowSelection({row: rows[0]});
  expect(rows[0].getAttribute('aria-selected')).toBe('true');
  expect(document.activeElement).toBe(rows[0]);

  await tester.toggleRowSelection({row: rows[8]});
  expect(rows[8].getAttribute('aria-selected')).toBe('true');
  expect(document.activeElement).toBe(rows[8]);
});

it('virtualizer renders items after toggling display:none', async () => {
  let testUtilUser = new User();
  let {container} = await render(<VirtualizedDisplayNone />);

  let gridlist = container.querySelector('[role=grid]') as HTMLElement;
  let tester = testUtilUser.createTester('GridList', {
    root: gridlist,
    layout: 'grid'
  });

  await expect(tester.getRows().length).toBeGreaterThan(0);
  let button = container.querySelector('[data-testid=toggle]') as HTMLElement;

  await button.click();
  await button.click();
  await expect(tester.getRows().length).toBeGreaterThan(0);

  await button.click();
  await button.click();
  await expect(tester.getRows().length).toBeGreaterThan(0);
});
