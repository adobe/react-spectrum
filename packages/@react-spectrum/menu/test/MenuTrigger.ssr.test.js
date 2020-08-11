/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {testSSR} from '@react-spectrum/test-utils';

describe('MenuTrigger SSR', function () {
  it('should render without errors', async function () {
    await testSSR(__filename, `
      import {MenuTrigger, Menu, Item} from '../';
      import {ActionButton} from '@react-spectrum/button';
      <MenuTrigger>
        <ActionButton>Edit</ActionButton>
        <Menu>
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </Menu>
    </MenuTrigger>
    `);
  });
});
