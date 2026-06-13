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

import {Button} from '../src/Button';
import {expect, it, vi} from 'vitest';
import {Menu, MenuItem, MenuTrigger} from '../src/Menu';
import React from 'react';
import {render} from './utils/render';
import {User} from '@react-aria/test-utils';

let items = [
  {id: 1, name: 'Aardvark'},
  {id: 2, name: 'Cat'},
  {id: 3, name: 'Dog'},
  {id: 4, name: 'Kangaroo'},
  {id: 5, name: 'Koala'},
  {id: 6, name: 'Penguin'},
  {id: 7, name: 'Snake'},
  {id: 8, name: 'Turtle'},
  {id: 9, name: 'Wombat'}
];

function MenuExample({onAction}) {
  return (
    <MenuTrigger>
      <Button>Open</Button>
      <Menu aria-label="Test" items={items} onAction={onAction}>
        {item => <MenuItem id={item.id}>{item.name}</MenuItem>}
      </Menu>
    </MenuTrigger>
  );
}

it.each`
  interactionType
  ${'mouse'}
  ${'keyboard'}
`('triggers a menu item via $interactionType', async ({interactionType}) => {
  let onAction = vi.fn();
  let testUtilUser = new User();
  let {container} = await render(<MenuExample onAction={onAction} />);

  let tester = testUtilUser.createTester('Menu', {
    root: container.querySelector('button') as HTMLElement,
    interactionType
  });
  await tester.open();
  await tester.toggleOptionSelection({option: 2});
  expect(onAction).toHaveBeenCalledWith(3, {id: 3, name: 'Dog'});
});
