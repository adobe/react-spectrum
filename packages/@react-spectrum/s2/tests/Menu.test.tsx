/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, fireEvent, mockClickDefault, pointerMap, render, within} from '@react-spectrum/test-utils-internal';
import {Button, Header, Keyboard, Menu, MenuContext, MenuItem, MenuTrigger, SubmenuTrigger, Text} from '../src';
import React from 'react';
import {User} from '@react-aria/test-utils';
import userEvent from '@testing-library/user-event';
import { AriaMenuTests } from '../../../react-aria-components/test/AriaMenu.test-util';

// better to accept items from the test? or just have the test have a requirement that you render a certain-ish structure?
// what about the button label?
// where and how can i define the requirements/assumptions for setup for the test?
let withSection = [
  {name: 'Heading 1', children: [
    {name: 'Foo'},
    {name: 'Bar'},
    {name: 'Baz'}
  ]}
];

AriaMenuTests({
  render: ({name}) => {
    switch (name) {
      case 'AriaMenuTrigger Menu has default behavior (button renders, menu is closed)':
        return render(
          <MenuTrigger>
            <Button variant="primary">Menu Button</Button>
            <Menu aria-label="Test" items={withSection}>
              {(item) => <MenuItem id={item.name}>{item.name}</MenuItem>}
            </Menu>
          </MenuTrigger>
        );
      default:
        return render(
          <MenuTrigger>
            <Button variant="primary">Menu Button</Button>
            <Menu aria-label="Test" items={withSection}>
              {(item) => <MenuItem id={item.name}>{item.name}</MenuItem>}
            </Menu>
          </MenuTrigger>
        );
    }
  }
});
