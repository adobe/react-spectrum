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

jest.mock('@react-aria/live-announcer');
import {act, render as renderComponent, within} from '@testing-library/react';
import {ActionButton} from '@react-spectrum/button';
import Add from '@spectrum-icons/workflow/Add';
import {Cell, Column, Row, TableBody, TableHeader, TableView} from '../';
import {fireEvent, installPointerEvent} from '@react-spectrum/test-utils';
import {HidingColumns} from '../stories/HidingColumns';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';
import userEvent from '@testing-library/user-event';

let columns = [
  {name: 'Foo', key: 'foo'},
  {name: 'Bar', key: 'bar'},
  {name: 'Baz', key: 'baz'}
];

let nestedColumns = [
  {name: 'Test', key: 'test'},
  {name: 'Tiered One Header', key: 'tier1', children: [
    {name: 'Tier Two Header A', key: 'tier2a', children: [
      {name: 'Foo', key: 'foo'},
      {name: 'Bar', key: 'bar'}
    ]},
    {name: 'Yay', key: 'yay'},
    {name: 'Tier Two Header B', key: 'tier2b', children: [
      {name: 'Baz', key: 'baz'}
    ]}
  ]}
];

let items = [
  {test: 'Test 1', foo: 'Foo 1', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {test: 'Test 2', foo: 'Foo 2', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'}
];


let manyItems = [];
for (let i = 1; i <= 100; i++) {
  manyItems.push({id: i, foo: 'Foo ' + i, bar: 'Bar ' + i, baz: 'Baz ' + i});
}

describe('TableViewSizing', function () {
  let offsetWidth, offsetHeight;

  beforeAll(function () {
    offsetWidth = jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 1000);
    offsetHeight = jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 1000);
    jest.useFakeTimers();
  });

  afterAll(function () {
    offsetWidth.mockReset();
    offsetHeight.mockReset();
  });

  afterEach(() => {
    act(() => {jest.runAllTimers();});
  });

  let render = (children, scale = 'medium') => renderComponent(
    <Provider theme={theme} scale={scale}>
      {children}
    </Provider>
  );

  let rerender = (tree, children, scale = 'medium') => tree.rerender(
    <Provider theme={theme} scale={scale}>
      {children}
    </Provider>
  );

  describe('layout', function () {
    describe('row heights', function () {
      let renderTable = (props, scale) => render(
        <TableView aria-label="Table" {...props}>
          <TableHeader columns={columns}>
            {column => <Column>{column.name}</Column>}
          </TableHeader>
          <TableBody items={items}>
            {item =>
              (<Row key={item.foo}>
                {key => <Cell>{item[key]}</Cell>}
              </Row>)
            }
          </TableBody>
        </TableView>
        , scale);

      it('should layout rows with default height', function () {
        let tree = renderTable();
        let rows = tree.getAllByRole('row');
        expect(rows).toHaveLength(3);

        expect(rows[0].style.top).toBe('0px');
        expect(rows[0].style.height).toBe('34px');
        expect(rows[1].style.top).toBe('0px');
        expect(rows[1].style.height).toBe('41px');
        expect(rows[2].style.top).toBe('41px');
        expect(rows[2].style.height).toBe('41px');

        for (let cell of [...rows[1].childNodes, ...rows[2].childNodes]) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('40px');
        }
      });

      it('should layout rows with default height in large scale', function () {
        let tree = renderTable({}, 'large');
        let rows = tree.getAllByRole('row');
        expect(rows).toHaveLength(3);

        expect(rows[0].style.top).toBe('0px');
        expect(rows[0].style.height).toBe('40px');
        expect(rows[1].style.top).toBe('0px');
        expect(rows[1].style.height).toBe('51px');
        expect(rows[2].style.top).toBe('51px');
        expect(rows[2].style.height).toBe('51px');

        for (let cell of [...rows[1].childNodes, ...rows[2].childNodes]) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('50px');
        }
      });

      it('should layout rows with density="compact"', function () {
        let tree = renderTable({density: 'compact'});
        let rows = tree.getAllByRole('row');
        expect(rows).toHaveLength(3);

        expect(rows[0].style.top).toBe('0px');
        expect(rows[0].style.height).toBe('34px');
        expect(rows[1].style.top).toBe('0px');
        expect(rows[1].style.height).toBe('33px');
        expect(rows[2].style.top).toBe('33px');
        expect(rows[2].style.height).toBe('33px');

        for (let cell of [...rows[1].childNodes, ...rows[2].childNodes]) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('32px');
        }
      });

      it('should layout rows with density="compact" in large scale', function () {
        let tree = renderTable({density: 'compact'}, 'large');
        let rows = tree.getAllByRole('row');
        expect(rows).toHaveLength(3);

        expect(rows[0].style.top).toBe('0px');
        expect(rows[0].style.height).toBe('40px');
        expect(rows[1].style.top).toBe('0px');
        expect(rows[1].style.height).toBe('41px');
        expect(rows[2].style.top).toBe('41px');
        expect(rows[2].style.height).toBe('41px');

        for (let cell of [...rows[1].childNodes, ...rows[2].childNodes]) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('40px');
        }
      });

      it('should layout rows with density="spacious"', function () {
        let tree = renderTable({density: 'spacious'});
        let rows = tree.getAllByRole('row');
        expect(rows).toHaveLength(3);

        expect(rows[0].style.top).toBe('0px');
        expect(rows[0].style.height).toBe('34px');
        expect(rows[1].style.top).toBe('0px');
        expect(rows[1].style.height).toBe('49px');
        expect(rows[2].style.top).toBe('49px');
        expect(rows[2].style.height).toBe('49px');

        for (let cell of [...rows[1].childNodes, ...rows[2].childNodes]) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('48px');
        }
      });

      it('should layout rows with density="spacious" in large scale', function () {
        let tree = renderTable({density: 'spacious'}, 'large');
        let rows = tree.getAllByRole('row');
        expect(rows).toHaveLength(3);

        expect(rows[0].style.top).toBe('0px');
        expect(rows[0].style.height).toBe('40px');
        expect(rows[1].style.top).toBe('0px');
        expect(rows[1].style.height).toBe('61px');
        expect(rows[2].style.top).toBe('61px');
        expect(rows[2].style.height).toBe('61px');

        for (let cell of [...rows[1].childNodes, ...rows[2].childNodes]) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('60px');
        }
      });

      it('should support variable row heights with overflowMode="wrap"', function () {
        let scrollHeight = jest.spyOn(window.HTMLElement.prototype, 'scrollHeight', 'get')
          .mockImplementation(function () {
            return this.textContent === 'Foo 1' ? 64 : 48;
          });

        let tree = renderTable({overflowMode: 'wrap'});
        act(() => {jest.runAllTimers();});
        let rows = tree.getAllByRole('row');
        expect(rows).toHaveLength(3);

        expect(rows[1].style.top).toBe('0px');
        expect(rows[1].style.height).toBe('65px');
        expect(rows[2].style.top).toBe('65px');
        expect(rows[2].style.height).toBe('49px');

        for (let cell of rows[1].childNodes) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('64px');
        }

        for (let cell of rows[2].childNodes) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('48px');
        }

        scrollHeight.mockRestore();
      });

      it('should support variable column header heights with overflowMode="wrap"', function () {
        let scrollHeight = jest.spyOn(window.HTMLElement.prototype, 'scrollHeight', 'get')
          .mockImplementation(function () {
            return this.textContent === 'Tier Two Header B' ? 48 : 34;
          });

        let tree = render(
          <TableView aria-label="Table" overflowMode="wrap">
            <TableHeader columns={nestedColumns}>
              {column => <Column childColumns={column.children}>{column.name}</Column>}
            </TableHeader>
            <TableBody items={items}>
              {item =>
                (<Row key={item.foo}>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </TableView>
        );
        act(() => {jest.runAllTimers();});
        let rows = tree.getAllByRole('row');
        expect(rows).toHaveLength(5);

        expect(rows[0].style.top).toBe('0px');
        expect(rows[0].style.height).toBe('34px');
        expect(rows[1].style.top).toBe('34px');
        expect(rows[1].style.height).toBe('48px');
        expect(rows[2].style.top).toBe('82px');
        expect(rows[2].style.height).toBe('34px');

        for (let cell of rows[0].childNodes) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('34px');
        }

        for (let cell of rows[1].childNodes) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('48px');
        }

        for (let cell of rows[2].childNodes) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('34px');
        }

        scrollHeight.mockRestore();
      });

      // To test https://github.com/adobe/react-spectrum/issues/1885
      it('should not throw error if selection mode changes with overflowMode="wrap" and selection was controlled', function () {
        function ControlledSelection(props) {
          let [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
          return (
            <TableView aria-label="Table" overflowMode="wrap" selectionMode={props.selectionMode} selectedKeys={selectedKeys} onSelectionChange={setSelectedKeys}>
              <TableHeader columns={columns}>
                {column => <Column>{column.name}</Column>}
              </TableHeader>
              <TableBody items={items}>
                {item =>
                  (<Row key={item.foo}>
                    {key => <Cell>{item[key]}</Cell>}
                  </Row>)
                }
              </TableBody>
            </TableView>
          );
        }

        let tree = render(<ControlledSelection selectionMode="multiple" />);
        act(() => {jest.runAllTimers();});
        let row = tree.getAllByRole('row')[2];
        expect(row).toHaveAttribute('aria-selected', 'false');
        userEvent.click(within(row).getByRole('checkbox'));
        act(() => {jest.runAllTimers();});
        expect(row).toHaveAttribute('aria-selected', 'true');

        // Without ListLayout fix, throws here with "TypeError: Cannot set property 'estimatedSize' of undefined"
        rerender(tree, <ControlledSelection selectionMode="none" />);
        act(() => {jest.runAllTimers();});
        expect(tree.queryByRole('checkbox')).toBeNull();
      });

      it('should return the proper cell z-indexes for overflowMode="wrap"', function () {
        let tree = renderTable({overflowMode: 'wrap', selectionMode: 'multiple'});
        let rows = tree.getAllByRole('row');
        expect(rows).toHaveLength(3);

        for (let row of rows) {
          for (let [index, cell] of row.childNodes.entries()) {
            if (index === 0) {
              expect(cell.style.zIndex).toBe('2');
            } else {
              expect(cell.style.zIndex).toBe('1');
            }
          }
        }
      });
    });

    describe('column widths', function () {
      it('should divide the available width by default if no defaultWidth is provided', function () {
        let tree = render(
          <TableView aria-label="Table" selectionMode="multiple">
            <TableHeader columns={columns}>
              {column => <Column>{column.name}</Column>}
            </TableHeader>
            <TableBody items={items}>
              {item =>
                (<Row key={item.foo}>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </TableView>
        );

        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('38px');
          expect(row.childNodes[1].style.width).toBe('320px');
          expect(row.childNodes[2].style.width).toBe('321px');
          expect(row.childNodes[3].style.width).toBe('321px');
        }
      });

      it('should divide the available width by default in large scale', function () {
        let tree = render((
          <TableView aria-label="Table" selectionMode="multiple">
            <TableHeader columns={columns}>
              {column => <Column>{column.name}</Column>}
            </TableHeader>
            <TableBody items={items}>
              {item =>
                (<Row key={item.foo}>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </TableView>
        ), 'large');

        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('48px');
          expect(row.childNodes[1].style.width).toBe('317px');
          expect(row.childNodes[2].style.width).toBe('317px');
          expect(row.childNodes[3].style.width).toBe('318px');
        }
      });

      it('should support explicitly sized columns', function () {
        let tree = render(
          <TableView aria-label="Table">
            <TableHeader>
              <Column key="foo" width={200}>Foo</Column>
              <Column key="bar" width={500}>Bar</Column>
              <Column key="baz" width={300}>Baz</Column>
            </TableHeader>
            <TableBody items={items}>
              {item =>
                (<Row key={item.foo}>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </TableView>
        );

        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('200px');
          expect(row.childNodes[1].style.width).toBe('500px');
          expect(row.childNodes[2].style.width).toBe('300px');
        }
      });

      it('should divide remaining width among remaining columns', function () {
        let tree = render(
          <TableView aria-label="Table" selectionMode="multiple">
            <TableHeader>
              <Column key="foo" width={200}>Foo</Column>
              <Column key="bar">Bar</Column>
              <Column key="baz">Baz</Column>
            </TableHeader>
            <TableBody items={items}>
              {item =>
                (<Row key={item.foo}>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </TableView>
        );

        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('38px');
          expect(row.childNodes[1].style.width).toBe('200px');
          expect(row.childNodes[2].style.width).toBe('381px');
          expect(row.childNodes[3].style.width).toBe('381px');
        }
      });

      it('should support percentage widths', function () {
        let tree = render(
          <TableView aria-label="Table">
            <TableHeader>
              <Column key="foo" width="10%">Foo</Column>
              <Column key="bar" width={500}>Bar</Column>
              <Column key="baz">Baz</Column>
            </TableHeader>
            <TableBody items={items}>
              {item =>
                (<Row key={item.foo}>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </TableView>
        );

        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('100px');
          expect(row.childNodes[1].style.width).toBe('500px');
          expect(row.childNodes[2].style.width).toBe('400px');
        }
      });

      it('should support minWidth', function () {
        let tree = render(
          <TableView aria-label="Table" selectionMode="multiple">
            <TableHeader>
              <Column key="foo" width={200}>Foo</Column>
              <Column key="bar" minWidth={500}>Bar</Column>
              <Column key="baz">Baz</Column>
            </TableHeader>
            <TableBody items={items}>
              {item =>
                (<Row key={item.foo}>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </TableView>
        );

        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('38px');
          expect(row.childNodes[1].style.width).toBe('200px');
          expect(row.childNodes[2].style.width).toBe('500px');
          expect(row.childNodes[3].style.width).toBe('262px');
        }
      });

      it('should support maxWidth', function () {
        let tree = render(
          <TableView aria-label="Table">
            <TableHeader>
              <Column key="foo" width={200}>Foo</Column>
              <Column key="bar" maxWidth={300}>Bar</Column>
              <Column key="baz">Baz</Column>
            </TableHeader>
            <TableBody items={items}>
              {item =>
                (<Row key={item.foo}>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </TableView>
        );

        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('200px');
          expect(row.childNodes[1].style.width).toBe('300px');
          expect(row.childNodes[2].style.width).toBe('500px');
        }
      });

      describe('bounded constraint on columns where dynamic columns exist before the bounded columns', () => {
        it('should fulfill the constraints of the static columns and give remaining width to previously defined dynamic columns', () => {
          let tree = render(
            <TableView aria-label="Table">
              <TableHeader>
                <Column allowsResizing key="foo">Foo</Column>
                <Column key="bar" maxWidth={200}>Bar</Column>
                <Column key="baz" maxWidth={200}>Baz</Column>
              </TableHeader>
              <TableBody items={items}>
                {item =>
                  (<Row key={item.foo}>
                    {key => <Cell>{item[key]}</Cell>}
                  </Row>)
                }
              </TableBody>
            </TableView>
          );

          let rows = tree.getAllByRole('row');

          for (let row of rows) {
            expect(row.childNodes[0].style.width).toBe('600px');
            expect(row.childNodes[1].style.width).toBe('200px');
            expect(row.childNodes[2].style.width).toBe('200px');
          }
        });
      });

      describe("mutiple columns are bounded but earlier columns are 'less bounded' than future columns", () => {
        it("should satisfy the conditions of all columns but also allocate remaining space to the 'less bounded' previous columns", () => {
          let tree = render(
            <TableView aria-label="Table">
              <TableHeader>
                <Column allowsResizing key="foo" minWidth={100}>Foo</Column>
                <Column key="bar" minWidth={500}>Bar</Column>
                <Column key="baz" maxWidth={200}>Baz</Column>
              </TableHeader>
              <TableBody items={items}>
                {item =>
                  (<Row key={item.foo}>
                    {key => <Cell>{item[key]}</Cell>}
                  </Row>)
                }
              </TableBody>
            </TableView>
          );

          let rows = tree.getAllByRole('row');

          for (let row of rows) {
            expect(row.childNodes[0].style.width).toBe('300px');
            expect(row.childNodes[1].style.width).toBe('500px');
            expect(row.childNodes[2].style.width).toBe('200px');
          }
        });
      });

      it('should compute the correct widths for tiered headings with selection', function () {
        let tree = render(
          <TableView aria-label="Table" selectionMode="multiple">
            <TableHeader columns={nestedColumns}>
              {column => <Column childColumns={column.children}>{column.name}</Column>}
            </TableHeader>
            <TableBody items={items}>
              {item =>
                (<Row key={item.foo}>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </TableView>
        );

        let rows = tree.getAllByRole('row');

        expect(rows[0].childNodes[0].style.width).toBe('230px');
        expect(rows[0].childNodes[1].style.width).toBe('770px');

        expect(rows[1].childNodes[0].style.width).toBe('230px');
        expect(rows[1].childNodes[1].style.width).toBe('384px');
        expect(rows[1].childNodes[2].style.width).toBe('193px');
        expect(rows[1].childNodes[3].style.width).toBe('193px');

        for (let row of rows.slice(2)) {
          expect(row.childNodes[0].style.width).toBe('38px');
          expect(row.childNodes[1].style.width).toBe('192px');
          expect(row.childNodes[2].style.width).toBe('192px');
          expect(row.childNodes[3].style.width).toBe('192px');
          expect(row.childNodes[4].style.width).toBe('193px');
          expect(row.childNodes[5].style.width).toBe('193px');
        }
      });
    });
  });

  describe('resizing columns', function () {
    describe('pointer', () => {
      installPointerEvent();

      it('dragging the resizer works - desktop', () => {
        jest.spyOn(window.screen, 'width', 'get').mockImplementation(() => 1024);
        let tree = render(
          <TableView aria-label="Table">
            <TableHeader>
              <Column allowsResizing key="foo">Foo</Column>
              <Column key="bar" maxWidth={200}>Bar</Column>
              <Column key="baz" maxWidth={200}>Baz</Column>
            </TableHeader>
            <TableBody items={items}>
              {item =>
                (<Row key={item.foo}>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </TableView>
        );

        // trigger pointer modality
        fireEvent.pointerMove(tree.container);
        expect(tree.queryByRole('separator')).toBeNull();

        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('600px');
          expect(row.childNodes[1].style.width).toBe('200px');
          expect(row.childNodes[2].style.width).toBe('200px');
        }

        let resizableHeader = tree.getAllByRole('columnheader')[0];

        fireEvent.pointerEnter(resizableHeader);
        expect(tree.getByRole('separator')).toBeVisible();
        let resizer = tree.getByRole('separator');

        fireEvent.pointerEnter(resizer);

        // actual locations do not matter, the delta matters between events for the calculation of useMove
        fireEvent.pointerDown(resizer, {pointerType: 'mouse', pointerId: 1, pageX: 600, pageY: 30});
        fireEvent.pointerMove(resizer, {pointerType: 'mouse', pointerId: 1, pageX: 595, pageY: 25});
        fireEvent.pointerUp(resizer, {pointerType: 'mouse', pointerId: 1});


        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('595px');
          expect(row.childNodes[1].style.width).toBe('200px');
          expect(row.childNodes[2].style.width).toBe('200px');
        }

        // actual locations do not matter, the delta matters between events for the calculation of useMove
        fireEvent.pointerDown(resizer, {pointerType: 'mouse', pointerId: 1, pageX: 595, pageY: 30});
        fireEvent.pointerMove(resizer, {pointerType: 'mouse', pointerId: 1, pageX: 620, pageY: 25});
        fireEvent.pointerUp(resizer, {pointerType: 'mouse', pointerId: 1});


        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('620px');
          expect(row.childNodes[1].style.width).toBe('190px');
          expect(row.childNodes[2].style.width).toBe('190px');
        }

        fireEvent.pointerLeave(resizer, {pointerType: 'mouse', pointerId: 1});
        fireEvent.pointerLeave(resizableHeader, {pointerType: 'mouse', pointerId: 1});

        expect(tree.queryByRole('separator')).toBeNull();
      });

      it('dragging the resizer works - mobile', () => {
        let tree = render(
          <TableView aria-label="Table">
            <TableHeader>
              <Column allowsResizing key="foo">Foo</Column>
              <Column key="bar" maxWidth={200}>Bar</Column>
              <Column key="baz" maxWidth={200}>Baz</Column>
            </TableHeader>
            <TableBody items={items}>
              {item =>
                (<Row key={item.foo}>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </TableView>
        );

        // trigger pointer modality
        fireEvent.pointerMove(tree.container);
        expect(tree.queryByRole('separator')).toBeNull();

        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('600px');
          expect(row.childNodes[1].style.width).toBe('200px');
          expect(row.childNodes[2].style.width).toBe('200px');
        }

        let resizableHeader = tree.getAllByRole('columnheader')[0];

        fireEvent.pointerEnter(resizableHeader);
        expect(tree.getByRole('separator')).toBeVisible();
        let resizer = tree.getByRole('separator');

        fireEvent.pointerEnter(resizer);

        // actual locations do not matter, the delta matters between events for the calculation of useMove
        fireEvent.pointerDown(resizer, {pointerType: 'mouse', pointerId: 1, pageX: 600, pageY: 30});
        fireEvent.pointerMove(resizer, {pointerType: 'mouse', pointerId: 1, pageX: 595, pageY: 25});
        fireEvent.pointerUp(resizer, {pointerType: 'mouse', pointerId: 1});


        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('595px');
          expect(row.childNodes[1].style.width).toBe('200px');
          expect(row.childNodes[2].style.width).toBe('200px');
        }

        // actual locations do not matter, the delta matters between events for the calculation of useMove
        fireEvent.pointerDown(resizer, {pointerType: 'mouse', pointerId: 1, pageX: 595, pageY: 30});
        fireEvent.pointerMove(resizer, {pointerType: 'mouse', pointerId: 1, pageX: 620, pageY: 25});
        fireEvent.pointerUp(resizer, {pointerType: 'mouse', pointerId: 1});


        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('620px');
          expect(row.childNodes[1].style.width).toBe('190px');
          expect(row.childNodes[2].style.width).toBe('190px');
        }

        fireEvent.pointerLeave(resizer, {pointerType: 'mouse', pointerId: 1});
        fireEvent.pointerLeave(resizableHeader, {pointerType: 'mouse', pointerId: 1});

        expect(tree.queryByRole('separator')).toBeNull();
      });
    });

    describe('touch', () => {
      installPointerEvent();

      it('dragging the resizer works - desktop', () => {
        jest.spyOn(window.screen, 'width', 'get').mockImplementation(() => 1024);
        let tree = render(
          <TableView aria-label="Table">
            <TableHeader>
              <Column allowsResizing key="foo">Foo</Column>
              <Column key="bar" maxWidth={200}>Bar</Column>
              <Column key="baz" maxWidth={200}>Baz</Column>
            </TableHeader>
            <TableBody items={items}>
              {item =>
                (<Row key={item.foo}>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </TableView>
        );

        fireEvent.pointerDown(document.body, {pointerType: 'touch', pointerId: 1});
        fireEvent.pointerUp(document.body, {pointerType: 'touch', pointerId: 1});
        act(() => {jest.runAllTimers();});

        expect(tree.queryByRole('separator')).toBeNull();

        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('600px');
          expect(row.childNodes[1].style.width).toBe('200px');
          expect(row.childNodes[2].style.width).toBe('200px');
        }

        let resizableHeader = tree.getAllByRole('columnheader')[0];

        fireEvent.pointerDown(resizableHeader, {pointerType: 'touch', pointerId: 1});
        fireEvent.pointerUp(resizableHeader, {pointerType: 'touch', pointerId: 1});
        act(() => {jest.runAllTimers();});

        let resizeMenuItem = tree.getAllByRole('menuitem')[0];

        fireEvent.pointerDown(resizeMenuItem, {pointerType: 'touch', pointerId: 1});
        fireEvent.pointerUp(resizeMenuItem, {pointerType: 'touch', pointerId: 1});
        act(() => {jest.runAllTimers();});

        expect(tree.getByRole('separator')).toBeVisible();
        let resizer = tree.getByRole('separator');

        // actual locations do not matter, the delta matters between events for the calculation of useMove
        fireEvent.pointerDown(resizer, {pointerType: 'touch', pointerId: 1, pageX: 600, pageY: 30});
        fireEvent.pointerMove(resizer, {pointerType: 'touch', pointerId: 1, pageX: 595, pageY: 25});
        fireEvent.pointerUp(resizer, {pointerType: 'touch', pointerId: 1});


        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('595px');
          expect(row.childNodes[1].style.width).toBe('200px');
          expect(row.childNodes[2].style.width).toBe('200px');
        }

        // actual locations do not matter, the delta matters between events for the calculation of useMove
        fireEvent.pointerDown(resizer, {pointerType: 'touch', pointerId: 1, pageX: 595, pageY: 30});
        fireEvent.pointerMove(resizer, {pointerType: 'touch', pointerId: 1, pageX: 620, pageY: 25});
        fireEvent.pointerUp(resizer, {pointerType: 'touch', pointerId: 1});


        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('620px');
          expect(row.childNodes[1].style.width).toBe('190px');
          expect(row.childNodes[2].style.width).toBe('190px');
        }

        // tapping on the document.body doesn't cause a blur because the body isn't focusable, so just call blur
        act(() => resizer.blur());
        act(() => {jest.runAllTimers();});

        expect(tree.queryByRole('separator')).toBeNull();
      });

      it('dragging the resizer works - mobile', () => {
        let tree = render(
          <TableView aria-label="Table">
            <TableHeader>
              <Column allowsResizing key="foo">Foo</Column>
              <Column key="bar" maxWidth={200}>Bar</Column>
              <Column key="baz" maxWidth={200}>Baz</Column>
            </TableHeader>
            <TableBody items={items}>
              {item =>
                (<Row key={item.foo}>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </TableView>
        );

        fireEvent.pointerDown(document.body, {pointerType: 'touch', pointerId: 1});
        fireEvent.pointerUp(document.body, {pointerType: 'touch', pointerId: 1});
        act(() => {jest.runAllTimers();});

        expect(tree.queryByRole('separator')).toBeNull();

        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('600px');
          expect(row.childNodes[1].style.width).toBe('200px');
          expect(row.childNodes[2].style.width).toBe('200px');
        }

        let resizableHeader = tree.getAllByRole('columnheader')[0];

        fireEvent.pointerDown(resizableHeader, {pointerType: 'touch', pointerId: 1});
        fireEvent.pointerUp(resizableHeader, {pointerType: 'touch', pointerId: 1});
        act(() => {jest.runAllTimers();});

        let resizeMenuItem = tree.getAllByRole('menuitem')[0];

        fireEvent.pointerDown(resizeMenuItem, {pointerType: 'touch', pointerId: 1});
        fireEvent.pointerUp(resizeMenuItem, {pointerType: 'touch', pointerId: 1});
        act(() => {jest.runAllTimers();});

        let resizer = tree.getByRole('separator');
        expect(resizer).toBeVisible();
        expect(document.activeElement).toBe(resizer);

        // actual locations do not matter, the delta matters between events for the calculation of useMove
        fireEvent.pointerDown(resizer, {pointerType: 'touch', pointerId: 1, pageX: 600, pageY: 30});
        fireEvent.pointerMove(resizer, {pointerType: 'touch', pointerId: 1, pageX: 595, pageY: 25});
        fireEvent.pointerUp(resizer, {pointerType: 'touch', pointerId: 1});


        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('595px');
          expect(row.childNodes[1].style.width).toBe('200px');
          expect(row.childNodes[2].style.width).toBe('200px');
        }

        // actual locations do not matter, the delta matters between events for the calculation of useMove
        fireEvent.pointerDown(resizer, {pointerType: 'touch', pointerId: 1, pageX: 595, pageY: 30});
        fireEvent.pointerMove(resizer, {pointerType: 'touch', pointerId: 1, pageX: 620, pageY: 25});
        fireEvent.pointerUp(resizer, {pointerType: 'touch', pointerId: 1});


        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('620px');
          expect(row.childNodes[1].style.width).toBe('190px');
          expect(row.childNodes[2].style.width).toBe('190px');
        }

        // tapping on the document.body doesn't cause a blur because the body isn't focusable, so just call blur
        act(() => resizer.blur());
        act(() => {jest.runAllTimers();});

        expect(tree.queryByRole('separator')).toBeNull();
      });
    });

    describe('keyboard', () => {
      it('arrow keys the resizer works - desktop', async () => {
        jest.spyOn(window.screen, 'width', 'get').mockImplementation(() => 1024);
        let tree = render(
          <TableView aria-label="Table">
            <TableHeader>
              <Column allowsResizing key="foo">Foo</Column>
              <Column key="bar" maxWidth={200}>Bar</Column>
              <Column key="baz" maxWidth={200}>Baz</Column>
            </TableHeader>
            <TableBody items={items}>
              {item =>
                (<Row key={item.foo}>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </TableView>
        );

        userEvent.tab();
        fireEvent.keyDown(document.activeElement, {key: 'ArrowUp'});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowUp'});

        let resizableHeader = tree.getAllByRole('columnheader')[0];
        expect(document.activeElement).toBe(resizableHeader);
        expect(tree.queryByRole('separator')).toBeNull();

        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('600px');
          expect(row.childNodes[1].style.width).toBe('200px');
          expect(row.childNodes[2].style.width).toBe('200px');
        }

        fireEvent.keyDown(document.activeElement, {key: 'Enter'});
        fireEvent.keyUp(document.activeElement, {key: 'Enter'});

        fireEvent.keyDown(document.activeElement, {key: 'Enter'});
        fireEvent.keyUp(document.activeElement, {key: 'Enter'});
        act(() => {jest.runAllTimers();});
        act(() => {jest.runAllTimers();});

        let resizer = tree.getByRole('separator');

        expect(document.activeElement).toBe(resizer);

        fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowRight'});
        fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowRight'});


        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('620px');
          expect(row.childNodes[1].style.width).toBe('190px');
          expect(row.childNodes[2].style.width).toBe('190px');
        }

        fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft'});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowLeft'});
        fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft'});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowLeft'});


        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('600px');
          expect(row.childNodes[1].style.width).toBe('200px');
          expect(row.childNodes[2].style.width).toBe('200px');
        }

        fireEvent.keyDown(document.activeElement, {key: 'Escape'});
        fireEvent.keyUp(document.activeElement, {key: 'Escape'});

        expect(document.activeElement).toBe(resizableHeader);

        expect(tree.queryByRole('separator')).toBeNull();
      });
      it('arrow keys the resizer works - mobile', async () => {
        let tree = render(
          <TableView aria-label="Table">
            <TableHeader>
              <Column allowsResizing key="foo">Foo</Column>
              <Column key="bar" maxWidth={200}>Bar</Column>
              <Column key="baz" maxWidth={200}>Baz</Column>
            </TableHeader>
            <TableBody items={items}>
              {item =>
                (<Row key={item.foo}>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </TableView>
        );

        userEvent.tab();
        fireEvent.keyDown(document.activeElement, {key: 'ArrowUp'});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowUp'});

        let resizableHeader = tree.getAllByRole('columnheader')[0];
        expect(document.activeElement).toBe(resizableHeader);
        expect(tree.queryByRole('separator')).toBeNull();

        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('600px');
          expect(row.childNodes[1].style.width).toBe('200px');
          expect(row.childNodes[2].style.width).toBe('200px');
        }

        fireEvent.keyDown(document.activeElement, {key: 'Enter'});
        fireEvent.keyUp(document.activeElement, {key: 'Enter'});

        fireEvent.keyDown(document.activeElement, {key: 'Enter'});
        fireEvent.keyUp(document.activeElement, {key: 'Enter'});
        act(() => {jest.runAllTimers();});
        act(() => {jest.runAllTimers();});

        let resizer = tree.getByRole('separator');

        expect(document.activeElement).toBe(resizer);

        fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowRight'});
        fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowRight'});


        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('620px');
          expect(row.childNodes[1].style.width).toBe('190px');
          expect(row.childNodes[2].style.width).toBe('190px');
        }

        fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft'});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowLeft'});
        fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft'});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowLeft'});


        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('600px');
          expect(row.childNodes[1].style.width).toBe('200px');
          expect(row.childNodes[2].style.width).toBe('200px');
        }

        fireEvent.keyDown(document.activeElement, {key: 'Escape'});
        fireEvent.keyUp(document.activeElement, {key: 'Escape'});

        expect(document.activeElement).toBe(resizableHeader);

        expect(tree.queryByRole('separator')).toBeNull();
      });
      it('can exit resize via Enter', async () => {
        jest.spyOn(window.screen, 'width', 'get').mockImplementation(() => 1024);
        let tree = render(
          <TableView aria-label="Table">
            <TableHeader>
              <Column allowsResizing key="foo">Foo</Column>
              <Column key="bar" maxWidth={200}>Bar</Column>
              <Column key="baz" maxWidth={200}>Baz</Column>
            </TableHeader>
            <TableBody items={items}>
              {item =>
                (<Row key={item.foo}>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </TableView>
        );

        userEvent.tab();
        fireEvent.keyDown(document.activeElement, {key: 'ArrowUp'});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowUp'});

        let resizableHeader = tree.getAllByRole('columnheader')[0];
        expect(document.activeElement).toBe(resizableHeader);
        expect(tree.queryByRole('separator')).toBeNull();


        fireEvent.keyDown(document.activeElement, {key: 'Enter'});
        fireEvent.keyUp(document.activeElement, {key: 'Enter'});

        fireEvent.keyDown(document.activeElement, {key: 'Enter'});
        fireEvent.keyUp(document.activeElement, {key: 'Enter'});
        act(() => {jest.runAllTimers();});
        act(() => {jest.runAllTimers();});

        let resizer = tree.getByRole('separator');

        expect(document.activeElement).toBe(resizer);

        fireEvent.keyDown(document.activeElement, {key: 'Enter'});
        fireEvent.keyUp(document.activeElement, {key: 'Enter'});

        expect(document.activeElement).toBe(resizableHeader);

        expect(tree.queryByRole('separator')).toBeNull();
      });
      it('can exit resize via Tab', async () => {
        jest.spyOn(window.screen, 'width', 'get').mockImplementation(() => 1024);
        let tree = render(
          <TableView aria-label="Table">
            <TableHeader>
              <Column allowsResizing key="foo">Foo</Column>
              <Column key="bar" maxWidth={200}>Bar</Column>
              <Column key="baz" maxWidth={200}>Baz</Column>
            </TableHeader>
            <TableBody items={items}>
              {item =>
                (<Row key={item.foo}>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </TableView>
        );

        userEvent.tab();
        fireEvent.keyDown(document.activeElement, {key: 'ArrowUp'});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowUp'});

        let resizableHeader = tree.getAllByRole('columnheader')[0];
        expect(document.activeElement).toBe(resizableHeader);
        expect(tree.queryByRole('separator')).toBeNull();


        fireEvent.keyDown(document.activeElement, {key: 'Enter'});
        fireEvent.keyUp(document.activeElement, {key: 'Enter'});

        fireEvent.keyDown(document.activeElement, {key: 'Enter'});
        fireEvent.keyUp(document.activeElement, {key: 'Enter'});
        act(() => {jest.runAllTimers();});
        act(() => {jest.runAllTimers();});

        let resizer = tree.getByRole('separator');

        expect(document.activeElement).toBe(resizer);

        userEvent.tab();

        expect(document.activeElement).toBe(resizableHeader);

        expect(tree.queryByRole('separator')).toBeNull();
      });
      it('can exit resize via shift Tab', async () => {
        jest.spyOn(window.screen, 'width', 'get').mockImplementation(() => 1024);
        let tree = render(
          <TableView aria-label="Table">
            <TableHeader>
              <Column allowsResizing key="foo">Foo</Column>
              <Column key="bar" maxWidth={200}>Bar</Column>
              <Column key="baz" maxWidth={200}>Baz</Column>
            </TableHeader>
            <TableBody items={items}>
              {item =>
                (<Row key={item.foo}>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </TableView>
        );

        userEvent.tab();
        fireEvent.keyDown(document.activeElement, {key: 'ArrowUp'});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowUp'});

        let resizableHeader = tree.getAllByRole('columnheader')[0];
        expect(document.activeElement).toBe(resizableHeader);
        expect(tree.queryByRole('separator')).toBeNull();


        fireEvent.keyDown(document.activeElement, {key: 'Enter'});
        fireEvent.keyUp(document.activeElement, {key: 'Enter'});

        fireEvent.keyDown(document.activeElement, {key: 'Enter'});
        fireEvent.keyUp(document.activeElement, {key: 'Enter'});
        act(() => {jest.runAllTimers();});
        act(() => {jest.runAllTimers();});

        let resizer = tree.getByRole('separator');

        expect(document.activeElement).toBe(resizer);

        userEvent.tab({shift: true});

        expect(document.activeElement).toBe(resizableHeader);

        expect(tree.queryByRole('separator')).toBeNull();
      });
    });
  });

  describe('updating columns', function () {
    it('should support removing columns', function () {
      let tree = render(<HidingColumns />);

      let checkbox = tree.getByLabelText('Net Budget');
      expect(checkbox.checked).toBe(true);

      let table = tree.getByRole('grid');
      let columns = within(table).getAllByRole('columnheader');
      expect(columns).toHaveLength(6);
      expect(columns[1]).toHaveTextContent('Plan Name');
      expect(columns[2]).toHaveTextContent('Audience Type');
      expect(columns[3]).toHaveTextContent('Net Budget');
      expect(columns[4]).toHaveTextContent('Target OTP');
      expect(columns[5]).toHaveTextContent('Reach');

      for (let row of within(table).getAllByRole('row').slice(1)) {
        expect(within(row).getAllByRole('rowheader')).toHaveLength(1);
        expect(within(row).getAllByRole('gridcell')).toHaveLength(5);
      }

      userEvent.click(checkbox);
      expect(checkbox.checked).toBe(false);

      act(() => jest.runAllTimers());

      columns = within(table).getAllByRole('columnheader');
      expect(columns).toHaveLength(5);
      expect(columns[1]).toHaveTextContent('Plan Name');
      expect(columns[2]).toHaveTextContent('Audience Type');
      expect(columns[3]).toHaveTextContent('Target OTP');
      expect(columns[4]).toHaveTextContent('Reach');

      for (let row of within(table).getAllByRole('row').slice(1)) {
        expect(within(row).getAllByRole('rowheader')).toHaveLength(1);
        expect(within(row).getAllByRole('gridcell')).toHaveLength(4);
      }
    });

    it('should support adding columns', function () {
      let tree = render(<HidingColumns />);

      let checkbox = tree.getByLabelText('Net Budget');
      expect(checkbox.checked).toBe(true);

      userEvent.click(checkbox);
      expect(checkbox.checked).toBe(false);

      act(() => jest.runAllTimers());

      let table = tree.getByRole('grid');
      let columns = within(table).getAllByRole('columnheader');
      expect(columns).toHaveLength(5);

      userEvent.click(checkbox);
      expect(checkbox.checked).toBe(true);

      act(() => jest.runAllTimers());

      columns = within(table).getAllByRole('columnheader');
      expect(columns).toHaveLength(6);
      expect(columns[1]).toHaveTextContent('Plan Name');
      expect(columns[2]).toHaveTextContent('Audience Type');
      expect(columns[3]).toHaveTextContent('Net Budget');
      expect(columns[4]).toHaveTextContent('Target OTP');
      expect(columns[5]).toHaveTextContent('Reach');

      for (let row of within(table).getAllByRole('row').slice(1)) {
        expect(within(row).getAllByRole('rowheader')).toHaveLength(1);
        expect(within(row).getAllByRole('gridcell')).toHaveLength(5);
      }
    });

    it('should update the row widths when removing and adding columns', function () {
      function compareWidths(row, b) {
        let newWidth = row.childNodes[1].style.width;
        expect(parseInt(newWidth, 10)).toBeGreaterThan(parseInt(b, 10));
        return newWidth;
      }

      let tree = render(<HidingColumns />);
      act(() => jest.runAllTimers());
      let table = tree.getByRole('grid');
      let columns = within(table).getAllByRole('columnheader');
      expect(columns).toHaveLength(6);

      let rows = tree.getAllByRole('row');
      let oldWidth = rows[1].childNodes[1].style.width;

      let audienceCheckbox = tree.getByLabelText('Audience Type');
      let budgetCheckbox = tree.getByLabelText('Net Budget');
      let targetCheckbox = tree.getByLabelText('Target OTP');
      let reachCheckbox = tree.getByLabelText('Reach');

      userEvent.click(audienceCheckbox);
      expect(audienceCheckbox.checked).toBe(false);
      act(() => jest.runAllTimers());
      oldWidth = compareWidths(rows[1], oldWidth);

      userEvent.click(budgetCheckbox);
      expect(budgetCheckbox.checked).toBe(false);
      act(() => jest.runAllTimers());
      oldWidth = compareWidths(rows[1], oldWidth);

      userEvent.click(targetCheckbox);
      expect(targetCheckbox.checked).toBe(false);
      act(() => jest.runAllTimers());
      oldWidth = compareWidths(rows[1], oldWidth);

      // This previously failed, the first column wouldn't update its width
      // when the 2nd to last column was removed
      userEvent.click(reachCheckbox);
      expect(reachCheckbox.checked).toBe(false);
      act(() => jest.runAllTimers());
      oldWidth = compareWidths(rows[1], oldWidth);
      columns = within(table).getAllByRole('columnheader');
      expect(columns).toHaveLength(2);

      // Re-add the column and check that the width decreases
      userEvent.click(audienceCheckbox);
      expect(audienceCheckbox.checked).toBe(true);
      act(() => jest.runAllTimers());
      expect(parseInt(rows[1].childNodes[1].style.width, 10)).toBeLessThan(parseInt(oldWidth, 10));
    });
  });

  describe('headerless columns', function () {

    let renderTable = (props, scale, showDivider = false) => render(
      <TableView aria-label="Table" data-testid="test" {...props}>
        <TableHeader>
          <Column key="foo">Foo</Column>
          <Column key="addAction" hideHeader showDivider={showDivider}>
            Add Item
          </Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>Foo 1</Cell>
            <Cell>
              <ActionButton isQuiet>
                <Add />
              </ActionButton>
            </Cell>
          </Row>
        </TableBody>
      </TableView>
      , scale);

    it('renders  table with headerless column with default scale', function () {
      let {getByRole} = renderTable();
      let grid = getByRole('grid');
      expect(grid).toBeVisible();
      expect(grid).toHaveAttribute('aria-label', 'Table');
      expect(grid).toHaveAttribute('data-testid', 'test');

      expect(grid).toHaveAttribute('aria-rowcount', '2');
      expect(grid).toHaveAttribute('aria-colcount', '2');
      let rowgroups = within(grid).getAllByRole('rowgroup');
      expect(rowgroups).toHaveLength(2);

      let headerRows = within(rowgroups[0]).getAllByRole('row');
      expect(headerRows).toHaveLength(1);
      expect(headerRows[0]).toHaveAttribute('aria-rowindex', '1');

      let headers = within(grid).getAllByRole('columnheader');
      expect(headers).toHaveLength(2);
      let className = headers[1].className;
      expect(className.includes('spectrum-Table-cell--hideHeader')).toBeTruthy();
      expect(headers[0]).toHaveTextContent('Foo');
      // visually hidden syle
      expect(headers[1].childNodes[0].style.clipPath).toBe('inset(50%)');
      expect(headers[1].childNodes[0].style.width).toBe('1px');
      expect(headers[1].childNodes[0].style.height).toBe('1px');
      expect(headers[1]).not.toBeEmptyDOMElement();


      let rows = within(rowgroups[1]).getAllByRole('row');
      expect(rows).toHaveLength(1);
      // The width of headerless column
      expect(rows[0].childNodes[1].style.width).toBe('36px');
      let rowheader = within(rows[0]).getByRole('rowheader');
      expect(rowheader).toHaveTextContent('Foo 1');
      let actionCell = within(rows[0]).getAllByRole('gridcell');
      expect(actionCell).toHaveLength(1);
      let buttons = within(actionCell[0]).getAllByRole('button');
      expect(buttons).toHaveLength(1);
      className = actionCell[0].className;
      expect(className.includes('spectrum-Table-cell--hideHeader')).toBeTruthy();
    });

    it('renders table with headerless column with large scale', function () {
      let {getByRole} = renderTable({}, 'large');
      let grid = getByRole('grid');
      expect(grid).toBeVisible();
      expect(grid).toHaveAttribute('aria-label', 'Table');
      expect(grid).toHaveAttribute('data-testid', 'test');
      let rowgroups = within(grid).getAllByRole('rowgroup');
      let rows = within(rowgroups[1]).getAllByRole('row');
      expect(rows).toHaveLength(1);
      // The width of headerless column
      expect(rows[0].childNodes[1].style.width).toBe('44px');
    });

    it('renders table with headerless column and divider', function () {
      let {getByRole} = renderTable({}, undefined, true);
      let grid = getByRole('grid');
      expect(grid).toBeVisible();
      let rowgroups = within(grid).getAllByRole('rowgroup');
      expect(rowgroups).toHaveLength(2);
      let rows = within(rowgroups[1]).getAllByRole('row');
      expect(rows).toHaveLength(1);
      // The width of headerless column with divider
      expect(rows[0].childNodes[1].style.width).toBe('37px');
    });

    it('renders table with headerless column with tooltip', function () {
      let {getByRole} = renderTable({}, 'large');
      let grid = getByRole('grid');
      expect(grid).toBeVisible();
      expect(grid).toHaveAttribute('aria-label', 'Table');
      expect(grid).toHaveAttribute('data-testid', 'test');
      let headers = within(grid).getAllByRole('columnheader');
      let headerlessColumn = headers[1];
      act(() => {
        headerlessColumn.focus();
      });
      let tooltip = getByRole('tooltip');
      expect(tooltip).toBeVisible();
    });

  });
});
