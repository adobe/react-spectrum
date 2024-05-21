/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {fireEvent, screen, testSSR} from '@react-spectrum/test-utils-internal';

describe('Table SSR', function () {
  it('should render without errors', async function () {
    await testSSR(__filename, `
      import {Table, TableHeader, Column, TableBody, Row, Cell} from '../';

      function Test() {
        let [show, setShow] = React.useState(false);
        return (
          <>
            <button onClick={() => setShow(true)}>Show</button>
            <Table aria-label="Table">
              <TableHeader>
                <Column>Foo</Column>
                <Column isRowHeader>Bar</Column>
              </TableHeader>
              <TableBody>
                <Row id="1">
                  <Cell>Foo 1</Cell>
                  <Cell>Bar 1</Cell>
                </Row>
                <Row id="2">
                  <Cell>Foo 2</Cell>
                  <Cell>Bar 2</Cell>
                </Row>
                {show && <Row id="4">
                  <Cell>Foo 3</Cell>
                  <Cell>Bar 3</Cell>
                </Row>}
                <Row id="3">
                  <Cell>Foo 4</Cell>
                  <Cell>Bar 4</Cell>
                </Row>
              </TableBody>
            </Table>
          </>
        );
      }

      <React.StrictMode>
        <Test />
      </React.StrictMode>
    `, () => {
      // Assert that server rendered stuff into the HTML.
      let rows = screen.getAllByRole('row');
      expect(rows.map(o => o.textContent)).toEqual(['FooBar', 'Foo 1Bar 1', 'Foo 2Bar 2', 'Foo 4Bar 4']);
    });

    // Assert that hydrated UI matches what we expect.
    let button = screen.getByRole('button');
    let rows = screen.getAllByRole('row');
    expect(rows.map(o => o.textContent)).toEqual(['FooBar', 'Foo 1Bar 1', 'Foo 2Bar 2', 'Foo 4Bar 4']);

    // And that it updates correctly.
    fireEvent.click(button);
    rows = screen.getAllByRole('row');
    expect(rows.map(o => o.textContent)).toEqual(['FooBar', 'Foo 1Bar 1', 'Foo 2Bar 2', 'Foo 3Bar 3', 'Foo 4Bar 4']);
  });
});
