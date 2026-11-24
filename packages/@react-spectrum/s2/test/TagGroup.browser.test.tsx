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

import {describe, expect, it, vi} from 'vitest';
import React, {useState} from 'react';
import {render} from './utils/render';
import {Tag, TagGroup} from '../src/TagGroup';

const defaultItems = [
  {id: 'chocolate', name: 'Chocolate'},
  {id: 'mint', name: 'Mint'},
  {id: 'strawberry', name: 'Strawberry'},
  {id: 'vanilla', name: 'Vanilla'},
  {id: 'cookie-dough', name: 'Cookie dough'},
  {id: 'pistachio', name: 'Pistachio'},
  {id: 'caramel', name: 'Caramel'},
  {id: 'peanut-butter', name: 'Peanut butter'},
  {id: 'cinnamon', name: 'Cinnamon'},
  {id: 'marshmallow', name: 'Marshmallow'}
];

describe('TagGroup', () => {
  it('does not cause horizontal overflow in its container when a tag has long truncated text and maxRows is set', async () => {
    let items = [
      {id: '0', name: 'Item 1'},
      {
        id: '1',
        name: 'Item 2 with a very long name to test how the component handles text wrapping, truncation, and overflow when the available space is limited'
      },
      {id: '2', name: 'Item 3'},
      {id: '3', name: 'Item 4'}
    ];

    const {getByRole, getByTestId} = await render(
      <div
        data-testid="container"
        style={{
          width: 300,
          padding: 20,
          overflow: 'auto'
        }}>
        <TagGroup label="Ice cream flavors" items={items} maxRows={2} onRemove={() => {}}>
          {item => <Tag id={item.id}>{item.name}</Tag>}
        </TagGroup>
      </div>
    );

    await expect.element(getByRole('button', {name: /Show all/})).toBeVisible();

    let container = getByTestId('container').element();
    expect(container.scrollWidth).toBeLessThanOrEqual(container.clientWidth);
  });

  it('collapses and expands tags when maxRows is exceeded', async () => {
    const {getByRole} = await render(
      <div style={{width: 240}}>
        <TagGroup label="Ice cream flavors" items={defaultItems} maxRows={2}>
          {item => <Tag id={item.id}>{item.name}</Tag>}
        </TagGroup>
      </div>
    );

    let showAllButton = getByRole('button', {name: /Show all/});
    await expect.element(showAllButton).toBeVisible();

    let collapsedCount = getByRole('row').all().length;
    expect(collapsedCount).toBeGreaterThan(0);
    expect(collapsedCount).toBeLessThan(defaultItems.length);

    await showAllButton.click();

    let showLessButton = getByRole('button', {name: 'Show less'});
    await expect.element(showLessButton).toBeVisible();
    expect(getByRole('row').all()).toHaveLength(defaultItems.length);

    await showLessButton.click();

    await expect.element(showAllButton).toBeVisible();
    expect(getByRole('row').all().length).toBeGreaterThan(0);
    expect(getByRole('row').all().length).toBeLessThan(defaultItems.length);
  });

  it('does not show the collapse button when all tags fit within maxRows', async () => {
    let fewItems = defaultItems.slice(0, 3);
    const {getByRole} = await render(
      <div style={{width: 600}}>
        <TagGroup label="Ice cream flavors" items={fewItems} maxRows={2}>
          {item => <Tag id={item.id}>{item.name}</Tag>}
        </TagGroup>
      </div>
    );

    await expect.poll(() => getByRole('row').all()).toHaveLength(fewItems.length);
    await expect.element(getByRole('button', {name: /Show all/})).not.toBeInTheDocument();
  });

  it('recalculates visible tags when the container resizes', async () => {
    let fewItems = defaultItems.slice(0, 5);
    const {getByRole, getByTestId} = await render(
      <div data-testid="wrapper" style={{width: 700}}>
        <TagGroup label="Ice cream flavors" items={fewItems} maxRows={1}>
          {item => <Tag id={item.id}>{item.name}</Tag>}
        </TagGroup>
      </div>
    );

    await expect.poll(() => getByRole('row').all()).toHaveLength(fewItems.length);
    await expect.element(getByRole('button', {name: /Show all/})).not.toBeInTheDocument();

    let wrapper = getByTestId('wrapper').element() as HTMLElement;
    wrapper.style.width = '200px';

    await expect.element(getByRole('button', {name: /Show all/})).toBeVisible();
    expect(getByRole('row').all().length).toBeLessThan(fewItems.length);

    wrapper.style.width = '700px';

    await expect.element(getByRole('button', {name: /Show all/})).not.toBeInTheDocument();
    expect(getByRole('row').all()).toHaveLength(fewItems.length);
  });

  it('recalculates collapse state when tags are removed', async () => {
    function RemovableTagGroup() {
      let [items, setItems] = useState(defaultItems.slice(0, 6));
      return (
        <div style={{width: 260}}>
          <TagGroup
            label="Ice cream flavors"
            items={items}
            maxRows={2}
            onRemove={keys => setItems(prev => prev.filter(item => !keys.has(item.id)))}>
            {item => <Tag id={item.id}>{item.name}</Tag>}
          </TagGroup>
        </div>
      );
    }

    const {getByRole} = await render(<RemovableTagGroup />);

    await expect.element(getByRole('button', {name: /Show all/})).toBeVisible();

    // Remove visible tags one at a time until the remaining tags fit within maxRows
    for (let i = 0; i < 6; i++) {
      let showAll = getByRole('button', {name: /Show all/}).all();
      if (showAll.length === 0) {
        break;
      }
      let firstRow = getByRole('row').first();
      let firstRowText = firstRow.element().textContent;
      await firstRow.getByRole('button', {name: 'Remove'}).click();
      await expect
        .poll(() => getByRole('row').first().element().textContent)
        .not.toBe(firstRowText);
    }

    await expect.element(getByRole('button', {name: /Show all/})).not.toBeInTheDocument();
    expect(getByRole('row').all().length).toBeGreaterThan(0);
  });

  it('renders group action button alongside collapse button when maxRows is set', async () => {
    let onGroupAction = vi.fn();
    const {getByRole} = await render(
      <div style={{width: 260}}>
        <TagGroup
          label="Ice cream flavors"
          items={defaultItems}
          maxRows={2}
          groupActionLabel="Clear"
          onGroupAction={onGroupAction}>
          {item => <Tag id={item.id}>{item.name}</Tag>}
        </TagGroup>
      </div>
    );

    let showAllButton = getByRole('button', {name: /Show all/});
    let clearButton = getByRole('button', {name: 'Clear'});
    await expect.element(showAllButton).toBeVisible();
    await expect.element(clearButton).toBeVisible();

    await clearButton.click();
    expect(onGroupAction).toHaveBeenCalledTimes(1);
  });
});
