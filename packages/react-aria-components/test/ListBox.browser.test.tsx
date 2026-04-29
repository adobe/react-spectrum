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
import {ListBox, ListBoxItem} from '../src/ListBox';
import React from 'react';
import {render} from 'vitest-browser-react';
import {User} from '@react-aria/test-utils';

it('can do grid navigation in browser test', async () => {
  let testUtilUser = new User({interactionType: 'keyboard'});

  let {container} = await render(
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

  let listbox = container.querySelector('[role=listbox]') as HTMLElement;
  let tester = testUtilUser.createTester('ListBox', {root: listbox, interactionType: 'keyboard', layout: 'grid'});

  let options = tester.options();
  expect(options).toHaveLength(9);

  await tester.toggleOptionSelection({option: options[5]});
  expect(options[5].getAttribute('aria-selected')).toBe('true');
  expect(document.activeElement).toBe(options[5]);

  await tester.toggleOptionSelection({option: options[0]});
  expect(options[0].getAttribute('aria-selected')).toBe('true');
  expect(document.activeElement).toBe(options[0]);

  await tester.toggleOptionSelection({option: options[8]});
  expect(options[8].getAttribute('aria-selected')).toBe('true');
  expect(document.activeElement).toBe(options[8]);
});
