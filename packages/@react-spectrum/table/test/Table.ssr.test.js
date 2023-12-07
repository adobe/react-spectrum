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

import {testSSR} from '@react-spectrum/test-utils-internal';

describe('Table SSR', function () {
  it('should render without errors', async function () {
    await testSSR(__filename, `
      import {Provider} from '@react-spectrum/provider';
      import {theme} from '@react-spectrum/theme-default';
      import {Cell, Column, Row, TableBody, TableHeader, TableView} from '../';
      <Provider theme={theme}>
        <TableView aria-label="Table">
          <TableHeader>
            <Column>Foo</Column>
            <Column>Bar</Column>
            <Column>Baz</Column>
          </TableHeader>
          <TableBody>
            <Row>
              <Cell>Foo 1</Cell>
              <Cell>Bar 1</Cell>
              <Cell>Baz 1</Cell>
            </Row>
            <Row>
              <Cell>Foo 2</Cell>
              <Cell>Bar 2</Cell>
              <Cell>Baz 2</Cell>
            </Row>
          </TableBody>
        </TableView>
      </Provider>
    `);
  });
});
