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

describe('ListBox SSR', function () {
  it('should render without errors', async function () {
    await testSSR(__filename, `
      import {ListBox, Item} from '../';
      import {Provider} from '@react-spectrum/provider';
      import {theme} from '@react-spectrum/theme-default';

      <Provider theme={theme}>
        <ListBox aria-label="Listbox">
          <Item>Left</Item>
          <Item>Middle</Item>
          <Item>Right</Item>
        </ListBox>
      </Provider>
    `);
  });
});
