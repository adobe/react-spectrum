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

// Runs in a real browser because React's development build only logs component
// renders (and diffs their props) when console.timeStamp and performance.measure exist.

import {Button} from '../src/Button';
import {Collection} from 'react-aria/Collection';
import {ComboBox} from '../src/ComboBox';
import {expect, it} from 'vitest';
import {Header} from '../src/Header';
import {Input} from '../src/Input';
import {Label} from '../src/Label';
import {ListBox, ListBoxItem, ListBoxSection} from '../src/ListBox';
import {page, userEvent} from 'vitest/browser';
import {Popover} from '../src/Popover';
import React from 'react';
import {render} from 'vitest-browser-react';

interface Option {
  name: string;
  children?: Option[];
}

let options: Option[] = [
  {name: 'Fruit', children: [{name: 'Apple'}, {name: 'Banana'}, {name: 'Orange'}]},
  {name: 'Vegetable', children: [{name: 'Carrot'}, {name: 'Spinach'}]}
];

it('filters dynamic sections after the menu opens with all items', async () => {
  await render(
    <ComboBox defaultItems={options}>
      <Label>Preferred fruit or vegetable</Label>
      <Input />
      <Button>▼</Button>
      <Popover>
        <ListBox>
          {(section: Option) => (
            <ListBoxSection id={section.name}>
              <Header>{section.name}</Header>
              <Collection items={section.children}>
                {item => <ListBoxItem id={item.name}>{item.name}</ListBoxItem>}
              </Collection>
            </ListBoxSection>
          )}
        </ListBox>
      </Popover>
    </ComboBox>
  );

  await userEvent.click(page.getByRole('combobox'));
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(page.getByRole('listbox')).toBeInTheDocument();
  expect(page.getByRole('group').elements()).toHaveLength(2);

  await userEvent.keyboard('p');
  await expect.element(page.getByRole('option', {name: 'Banana'})).not.toBeInTheDocument();

  let groups = page.getByRole('group');
  expect(groups.elements()).toHaveLength(2);
  expect(
    groups
      .nth(0)
      .getByRole('option')
      .elements()
      .map(o => o.textContent)
  ).toEqual(['Apple']);
  expect(
    groups
      .nth(1)
      .getByRole('option')
      .elements()
      .map(o => o.textContent)
  ).toEqual(['Spinach']);
});
