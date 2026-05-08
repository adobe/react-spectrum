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
import {Picker, PickerItem} from '../src/Picker';
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

function PickerExample() {
  return (
    <Picker label="Test picker" items={items}>
      {(item: (typeof items)[number]) => <PickerItem id={item.id}>{item.name}</PickerItem>}
    </Picker>
  );
}

it.each`
  interactionType
  ${'mouse'}
  ${'keyboard'}
`('selects an option via $interactionType', async ({interactionType}) => {
  let testUtilUser = new User();
  let {container} = await render(<PickerExample />);

  let tester = testUtilUser.createTester('Select', {root: container, interactionType});
  await tester.toggleOptionSelection({option: 2});
  expect(tester.trigger()).toHaveTextContent('Dog');
});
