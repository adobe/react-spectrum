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
import React from 'react';
import {render} from './utils/render';
import {Tag, TagGroup} from '../src/TagGroup';

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
