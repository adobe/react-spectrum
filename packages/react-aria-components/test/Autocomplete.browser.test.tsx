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

import {Autocomplete} from '../src/Autocomplete';
import {expect, it} from 'vitest';
import {Header} from '../src/Header';
import {Input} from '../src/Input';
import {Label} from '../src/Label';
import {ListBox, ListBoxItem, ListBoxSection} from '../src/ListBox';
import {ListLayout} from 'react-stately/useVirtualizerState';
import React from 'react';
import {render} from 'vitest-browser-react';
import {SearchField} from '../src/SearchField';
import {useFilter} from 'react-aria/useFilter';
import {userEvent} from 'vitest/browser';
import {Virtualizer} from '../src/Virtualizer';

it('updates virtualized option positions when filtering and clearing the search', async () => {
  let items = Array.from({length: 15}, (_, index) => ({
    id: index,
    name: index < 13 ? `Model ${index}` : `Mistral ${index}`
  }));
  function Example() {
    let {contains} = useFilter({sensitivity: 'base'});
    return (
      <Autocomplete filter={contains}>
        <SearchField>
          <Label>Search models</Label>
          <Input />
        </SearchField>
        <Virtualizer layout={ListLayout} layoutOptions={{rowHeight: 30}}>
          <ListBox aria-label="Models" items={items} style={{height: 200, width: 300}}>
            {item => <ListBoxItem id={item.id}>{item.name}</ListBoxItem>}
          </ListBox>
        </Virtualizer>
      </Autocomplete>
    );
  }
  let result = await render(<Example />);
  let search = result.getByRole('searchbox');
  let positions = () =>
    [...result.container.querySelectorAll('[role="option"]')].map(option => [
      option.textContent,
      option.getAttribute('aria-posinset'),
      option.getAttribute('aria-setsize')
    ]);
  await search.fill('Mistral');
  await expect.poll(positions).toEqual([
    ['Mistral 13', '1', '2'],
    ['Mistral 14', '2', '2']
  ]);
  await userEvent.keyboard('{ArrowDown}{ArrowDown}');
  let activeId = result.container.querySelector('input')!.getAttribute('aria-activedescendant');
  expect(document.getElementById(activeId!)?.textContent).toBe('Mistral 14');
  await search.fill('Mistral 14');
  await expect.poll(positions).toEqual([['Mistral 14', '1', '1']]);
  await search.fill('missing');
  await expect.poll(positions).toEqual([]);
  await search.fill('');
  await expect.poll(() => positions()[0]).toEqual(['Model 0', '1', '15']);
  await search.fill('Mistral');
  await expect.poll(positions).toEqual([
    ['Mistral 13', '1', '2'],
    ['Mistral 14', '2', '2']
  ]);
});

it('counts filtered options across sections without counting their headings', async () => {
  function Example() {
    let {contains} = useFilter({sensitivity: 'base'});
    return (
      <Autocomplete filter={contains}>
        <SearchField>
          <Label>Search grouped models</Label>
          <Input />
        </SearchField>
        <Virtualizer layout={ListLayout} layoutOptions={{rowHeight: 30, headingHeight: 20}}>
          <ListBox aria-label="Models" style={{height: 300, width: 300}}>
            <ListBoxSection id="archived">
              <Header>Archived</Header>
              <ListBoxItem id="alpha">Alpha</ListBoxItem>
            </ListBoxSection>
            <ListBoxSection id="current">
              <Header>Current</Header>
              <ListBoxItem id="beta">Beta</ListBoxItem>
              <ListBoxItem id="small">Mistral Small</ListBoxItem>
            </ListBoxSection>
            <ListBoxSection id="recent">
              <Header>Recent</Header>
              <ListBoxItem id="gamma">Gamma</ListBoxItem>
              <ListBoxItem id="large">Mistral Large</ListBoxItem>
            </ListBoxSection>
          </ListBox>
        </Virtualizer>
      </Autocomplete>
    );
  }
  let result = await render(<Example />);
  let search = result.getByRole('searchbox');
  let positions = () =>
    [...result.container.querySelectorAll('[role="option"]')].map(option => [
      option.textContent,
      option.getAttribute('aria-posinset'),
      option.getAttribute('aria-setsize')
    ]);
  await search.fill('Mistral');
  await expect.poll(positions).toEqual([
    ['Mistral Small', '1', '2'],
    ['Mistral Large', '2', '2']
  ]);
  await search.fill('Mistral Large');
  await expect.poll(positions).toEqual([['Mistral Large', '1', '1']]);
  await search.fill('');
  await expect.poll(() => positions().map(option => option[1])).toEqual(['1', '2', '3', '4', '5']);
});
