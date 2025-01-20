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
import {ColumnSize} from '@react-types/table';
import {ControllingResize} from '../stories/ControllingResize';
import {fireEvent, installPointerEvent, pointerMap, simulateDesktop, triggerTouch} from '@react-spectrum/test-utils-internal';
import {HidingColumns} from '../stories/HidingColumns';
import {Key} from '@react-types/shared';
import {Provider} from '@react-spectrum/provider';
import React, {useRef} from 'react';
import {resizingTests} from '@react-aria/table/test/tableResizingTests';
import {Scale} from '@react-types/provider';
import {setInteractionModality} from '@react-aria/interactions';
import {theme} from '@react-spectrum/theme-default';
import {UNSTABLE_PortalProvider} from '@react-aria/overlays';
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


let manyItems: {id: number, foo: string, bar: string, baz: string}[] = [];
for (let i = 1; i <= 100; i++) {
  manyItems.push({id: i, foo: 'Foo ' + i, bar: 'Bar ' + i, baz: 'Baz ' + i});
}

let render = (children, scale: Scale = 'medium') => {
  let tree = renderComponent(
    <Provider theme={theme} scale={scale}>
      {children}
    </Provider>
  );
  // account for table column resizing to do initial pass due to relayout from useTableColumnResizeState render
  act(() => {jest.runAllTimers();});
  return tree;
};

let rerender = (tree, children, scale: Scale = 'medium') => {
  let newTree = tree.rerender(
    <Provider theme={theme} scale={scale}>
      {children}
    </Provider>
  );
  act(() => {jest.runAllTimers();});
  return newTree;
};
describe('TableViewSizing', function () {
  let offsetWidth, offsetHeight;
  let user;

  beforeAll(function () {
    user = userEvent.setup({delay: null, pointerMap});
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

  describe('layout', function () {
    describe('row heights', function () {
      let renderTable = (props = {}, scale: Scale = 'medium') => render(
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

        for (let cell of ([...rows[1].childNodes, ...rows[2].childNodes] as HTMLElement[])) {
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

        for (let cell of ([...rows[1].childNodes, ...rows[2].childNodes] as HTMLElement[])) {
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

        for (let cell of ([...rows[1].childNodes, ...rows[2].childNodes] as HTMLElement[])) {
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

        for (let cell of ([...rows[1].childNodes, ...rows[2].childNodes] as HTMLElement[])) {
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

        for (let cell of ([...rows[1].childNodes, ...rows[2].childNodes] as HTMLElement[])) {
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

        for (let cell of ([...rows[1].childNodes, ...rows[2].childNodes] as HTMLElement[])) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('60px');
        }
      });

      it('should support variable row heights with overflowMode="wrap"', function () {
        let scrollHeight = jest.spyOn(window.HTMLElement.prototype, 'scrollHeight', 'get')
          .mockImplementation(function (this: HTMLElement) {
            let row = this.closest('[role=row]');
            return row && row.textContent?.includes('Foo 1') ? 64 : 48;
          });

        let tree = renderTable({overflowMode: 'wrap'});
        act(() => {jest.runAllTimers();});
        let rows = tree.getAllByRole('row');
        expect(rows).toHaveLength(3);

        expect(rows[1].style.top).toBe('0px');
        expect(rows[1].style.height).toBe('65px');
        expect(rows[2].style.top).toBe('65px');
        expect(rows[2].style.height).toBe('49px');

        for (let cell of ([...rows[1].childNodes] as HTMLElement[])) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('64px');
        }

        for (let cell of ([...rows[2].childNodes] as HTMLElement[])) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('48px');
        }

        scrollHeight.mockRestore();
      });

      it('should support variable column header heights with overflowMode="wrap"', function () {
        let scrollHeight = jest.spyOn(window.HTMLElement.prototype, 'scrollHeight', 'get')
          .mockImplementation(function (this: HTMLElement) {
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

        for (let cell of ([...rows[0].childNodes] as HTMLElement[])) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('34px');
        }

        for (let cell of ([...rows[1].childNodes] as HTMLElement[])) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('48px');
        }

        for (let cell of ([...rows[2].childNodes] as HTMLElement[])) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('34px');
        }

        scrollHeight.mockRestore();
      });

      // To test https://github.com/adobe/react-spectrum/issues/1885
      it('should not throw error if selection mode changes with overflowMode="wrap" and selection was controlled', async function () {
        function ControlledSelection(props) {
          let [selectedKeys, setSelectedKeys] = React.useState<Set<Key> | 'all'>(new Set([]));
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
        await user.click(within(row).getByRole('checkbox'));
        act(() => {jest.runAllTimers();});
        expect(row).toHaveAttribute('aria-selected', 'true');

        // Without ListLayout fix, throws here with "TypeError: Cannot set property 'estimatedSize' of undefined"
        rerender(tree, <ControlledSelection selectionMode="none" />);
        act(() => {jest.runAllTimers();});
        expect(tree.queryByRole('checkbox')).toBeNull();
      });

      it('should return the proper cell z-indexes for overflowMode="wrap"', function () {
        let tree = renderTable({overflowMode: 'wrap', selectionMode: 'multiple'});
        let [headerRow, ...bodyRows] = tree.getAllByRole('row');
        expect(bodyRows).toHaveLength(2);

        for (let [index, cell] of headerRow.childNodes.entries()) {
          // 4 because there is a checkbox column
          expect(Number((cell as HTMLElement).style.zIndex)).toBe(4 - index + 1);
        }

        for (let row of bodyRows) {
          for (let [index, cell] of row.childNodes.entries()) {
            if (index === 0) {
              expect((cell as HTMLElement).style.zIndex).toBe('2');
            } else {
              expect((cell as HTMLElement).style.zIndex).toBe('1');
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
          expect((row.childNodes[0] as HTMLElement).style.width).toBe('38px');
          expect((row.childNodes[1] as HTMLElement).style.width).toBe('321px');
          expect((row.childNodes[2] as HTMLElement).style.width).toBe('320px');
          expect((row.childNodes[3] as HTMLElement).style.width).toBe('321px');
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
          expect((row.childNodes[0] as HTMLElement).style.width).toBe('48px');
          expect((row.childNodes[1] as HTMLElement).style.width).toBe('317px');
          expect((row.childNodes[2] as HTMLElement).style.width).toBe('318px');
          expect((row.childNodes[3] as HTMLElement).style.width).toBe('317px');
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
          expect((row.childNodes[0] as HTMLElement).style.width).toBe('200px');
          expect((row.childNodes[1] as HTMLElement).style.width).toBe('500px');
          expect((row.childNodes[2] as HTMLElement).style.width).toBe('300px');
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
          expect((row.childNodes[0] as HTMLElement).style.width).toBe('38px');
          expect((row.childNodes[1] as HTMLElement).style.width).toBe('200px');
          expect((row.childNodes[2] as HTMLElement).style.width).toBe('381px');
          expect((row.childNodes[3] as HTMLElement).style.width).toBe('381px');
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
          expect((row.childNodes[0] as HTMLElement).style.width).toBe('100px');
          expect((row.childNodes[1] as HTMLElement).style.width).toBe('500px');
          expect((row.childNodes[2] as HTMLElement).style.width).toBe('400px');
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
          expect((row.childNodes[0] as HTMLElement).style.width).toBe('38px');
          expect((row.childNodes[1] as HTMLElement).style.width).toBe('200px');
          expect((row.childNodes[2] as HTMLElement).style.width).toBe('500px');
          expect((row.childNodes[3] as HTMLElement).style.width).toBe('262px');
        }
      });

      it('should support minWidth and width working together', function () {
        let tree = render(
          <TableView aria-label="Table" selectionMode="multiple">
            <TableHeader>
              <Column key="foo" minWidth={200} width={100}>Foo</Column>
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
          expect((row.childNodes[0] as HTMLElement).style.width).toBe('38px');
          expect((row.childNodes[1] as HTMLElement).style.width).toBe('200px');
          expect((row.childNodes[2] as HTMLElement).style.width).toBe('500px');
          expect((row.childNodes[3] as HTMLElement).style.width).toBe('262px');
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
          expect((row.childNodes[0] as HTMLElement).style.width).toBe('200px');
          expect((row.childNodes[1] as HTMLElement).style.width).toBe('300px');
          expect((row.childNodes[2] as HTMLElement).style.width).toBe('500px');
        }
      });

      it('should support maxWidth and width working together', function () {
        let tree = render(
          <TableView aria-label="Table">
            <TableHeader>
              <Column key="foo" maxWidth={500} width={200}>Foo</Column>
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
          expect((row.childNodes[0] as HTMLElement).style.width).toBe('200px');
          expect((row.childNodes[1] as HTMLElement).style.width).toBe('300px');
          expect((row.childNodes[2] as HTMLElement).style.width).toBe('500px');
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
            expect((row.childNodes[0] as HTMLElement).style.width).toBe('600px');
            expect((row.childNodes[1] as HTMLElement).style.width).toBe('200px');
            expect((row.childNodes[2] as HTMLElement).style.width).toBe('200px');
          }
        });
      });

      describe("multiple columns are bounded but earlier columns are 'less bounded' than future columns", () => {
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
            expect((row.childNodes[0] as HTMLElement).style.width).toBe('300px');
            expect((row.childNodes[1] as HTMLElement).style.width).toBe('500px');
            expect((row.childNodes[2] as HTMLElement).style.width).toBe('200px');
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

        expect((rows[0].childNodes[0] as HTMLElement).style.width).toBe('230px');
        expect((rows[0].childNodes[1] as HTMLElement).style.width).toBe('770px');

        expect((rows[1].childNodes[0] as HTMLElement).style.width).toBe('230px');
        expect((rows[1].childNodes[1] as HTMLElement).style.width).toBe('385px');
        expect((rows[1].childNodes[2] as HTMLElement).style.width).toBe('193px');
        expect((rows[1].childNodes[3] as HTMLElement).style.width).toBe('192px');

        for (let row of rows.slice(2)) {
          expect((row.childNodes[0] as HTMLElement).style.width).toBe('38px');
          expect((row.childNodes[1] as HTMLElement).style.width).toBe('192px');
          expect((row.childNodes[2] as HTMLElement).style.width).toBe('193px');
          expect((row.childNodes[3] as HTMLElement).style.width).toBe('192px');
          expect((row.childNodes[4] as HTMLElement).style.width).toBe('193px');
          expect((row.childNodes[5] as HTMLElement).style.width).toBe('192px');
        }
      });
    });
  });

  describe('resizing columns', function () {
    describe('pointer', () => {
      installPointerEvent();

      it('dragging the resizer works - desktop', () => {
        simulateDesktop();
        let onResizeEnd = jest.fn();
        let tree = render(
          <TableView aria-label="Table" onResizeEnd={onResizeEnd}>
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
        expect(tree.queryByRole('slider')).toBeNull();

        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect((row.childNodes[0] as HTMLElement).style.width).toBe('600px');
          expect((row.childNodes[1] as HTMLElement).style.width).toBe('200px');
          expect((row.childNodes[2] as HTMLElement).style.width).toBe('200px');
        }

        let resizableHeader = tree.getAllByRole('columnheader')[0];

        fireEvent.pointerEnter(resizableHeader);
        expect(tree.getByRole('slider')).toBeVisible();
        let resizer = tree.getByRole('slider');

        fireEvent.pointerEnter(resizer);

        // actual locations do not matter, the delta matters between events for the calculation of useMove
        fireEvent.pointerDown(resizer, {pointerType: 'mouse', pointerId: 1, pageX: 600, pageY: 30});
        fireEvent.pointerMove(resizer, {pointerType: 'mouse', pointerId: 1, pageX: 595, pageY: 25});
        fireEvent.pointerUp(resizer, {pointerType: 'mouse', pointerId: 1});

        expect(resizer).toHaveAttribute('value', '595');
        for (let row of rows) {
          expect((row.childNodes[0] as HTMLElement).style.width).toBe('595px');
          expect((row.childNodes[1] as HTMLElement).style.width).toBe('200px');
          expect((row.childNodes[2] as HTMLElement).style.width).toBe('200px');
        }
        expect(onResizeEnd).toHaveBeenCalledTimes(1);
        expect(onResizeEnd).toHaveBeenCalledWith(new Map<string, ColumnSize>([['foo', 595], ['bar', '1fr'], ['baz', '1fr']]));

        // actual locations do not matter, the delta matters between events for the calculation of useMove
        fireEvent.pointerDown(resizer, {pointerType: 'mouse', pointerId: 1, pageX: 595, pageY: 30});
        fireEvent.pointerMove(resizer, {pointerType: 'mouse', pointerId: 1, pageX: 620, pageY: 25});
        fireEvent.pointerUp(resizer, {pointerType: 'mouse', pointerId: 1});

        expect(resizer).toHaveAttribute('value', '620');
        for (let row of rows) {
          expect((row.childNodes[0] as HTMLElement).style.width).toBe('620px');
          expect((row.childNodes[1] as HTMLElement).style.width).toBe('190px');
          expect((row.childNodes[2] as HTMLElement).style.width).toBe('190px');
        }
        expect(onResizeEnd).toHaveBeenCalledTimes(2);
        expect(onResizeEnd).toHaveBeenCalledWith(new Map<string, ColumnSize>([['foo', 595], ['bar', '1fr'], ['baz', '1fr']]));

        fireEvent.pointerLeave(resizer, {pointerType: 'mouse', pointerId: 1});
        fireEvent.pointerLeave(resizableHeader, {pointerType: 'mouse', pointerId: 1});
        act(() => {jest.runAllTimers();});

        expect(tree.queryByRole('slider')).toBeNull();
      });

      it('dragging the resizer works - mobile', () => {
        let onResizeEnd = jest.fn();
        let tree = render(
          <TableView aria-label="Table" onResizeEnd={onResizeEnd}>
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
        expect(tree.queryByRole('slider')).toBeNull();

        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect((row.childNodes[0] as HTMLElement).style.width).toBe('600px');
          expect((row.childNodes[1] as HTMLElement).style.width).toBe('200px');
          expect((row.childNodes[2] as HTMLElement).style.width).toBe('200px');
        }

        let resizableHeader = tree.getAllByRole('columnheader')[0];

        fireEvent.pointerEnter(resizableHeader);
        expect(tree.getByRole('slider')).toBeVisible();
        let resizer = tree.getByRole('slider');

        fireEvent.pointerEnter(resizer);

        // actual locations do not matter, the delta matters between events for the calculation of useMove
        fireEvent.pointerDown(resizer, {pointerType: 'mouse', pointerId: 1, pageX: 600, pageY: 30});
        fireEvent.pointerMove(resizer, {pointerType: 'mouse', pointerId: 1, pageX: 595, pageY: 25});
        fireEvent.pointerUp(resizer, {pointerType: 'mouse', pointerId: 1});

        expect(resizer).toHaveAttribute('value', '595');
        for (let row of rows) {
          expect((row.childNodes[0] as HTMLElement).style.width).toBe('595px');
          expect((row.childNodes[1] as HTMLElement).style.width).toBe('200px');
          expect((row.childNodes[2] as HTMLElement).style.width).toBe('200px');
        }
        expect(onResizeEnd).toHaveBeenCalledTimes(1);
        expect(onResizeEnd).toHaveBeenCalledWith(new Map<string, ColumnSize>([['foo', 595], ['bar', '1fr'], ['baz', '1fr']]));

        // actual locations do not matter, the delta matters between events for the calculation of useMove
        fireEvent.pointerDown(resizer, {pointerType: 'mouse', pointerId: 1, pageX: 595, pageY: 30});
        fireEvent.pointerMove(resizer, {pointerType: 'mouse', pointerId: 1, pageX: 620, pageY: 25});
        fireEvent.pointerUp(resizer, {pointerType: 'mouse', pointerId: 1});

        expect(resizer).toHaveAttribute('value', '620');
        for (let row of rows) {
          expect((row.childNodes[0] as HTMLElement).style.width).toBe('620px');
          expect((row.childNodes[1] as HTMLElement).style.width).toBe('190px');
          expect((row.childNodes[2] as HTMLElement).style.width).toBe('190px');
        }
        expect(onResizeEnd).toHaveBeenCalledTimes(2);
        expect(onResizeEnd).toHaveBeenCalledWith(new Map<string, ColumnSize>([['foo', 595], ['bar', '1fr'], ['baz', '1fr']]));

        fireEvent.pointerLeave(resizer, {pointerType: 'mouse', pointerId: 1});
        fireEvent.pointerLeave(resizableHeader, {pointerType: 'mouse', pointerId: 1});
        act(() => {jest.runAllTimers();});

        expect(tree.queryByRole('slider')).toBeNull();
      });
    });

    describe('touch', () => {
      installPointerEvent();

      it('dragging the resizer works - desktop', async () => {
        setInteractionModality('pointer');
        simulateDesktop();
        let onResizeEnd = jest.fn();
        let tree = render(
          <TableView aria-label="Table" onResizeEnd={onResizeEnd}>
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

        await user.pointer({target: document.body, keys: '[TouchA]'});
        act(() => {jest.runAllTimers();});

        expect(tree.queryByRole('slider')).toBeNull();

        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect((row.childNodes[0] as HTMLElement).style.width).toBe('600px');
          expect((row.childNodes[1] as HTMLElement).style.width).toBe('200px');
          expect((row.childNodes[2] as HTMLElement).style.width).toBe('200px');
        }

        let header = tree.getAllByRole('columnheader')[0];
        let resizableHeader = within(header).getByRole('button');

        await user.pointer({target: resizableHeader, keys: '[TouchA]'});
        act(() => {jest.runAllTimers();});

        let resizeMenuItem = tree.getAllByRole('menuitem')[0];

        await user.pointer({target: resizeMenuItem, keys: '[TouchA]'});
        act(() => {jest.runAllTimers();});

        expect(tree.getByRole('slider')).toBeVisible();
        let resizer = tree.getByRole('slider');

        // actual locations do not matter, the delta matters between events for the calculation of useMove
        fireEvent.pointerDown(resizer, {pointerType: 'touch', pointerId: 1, pageX: 600, pageY: 30});
        fireEvent.pointerMove(resizer, {pointerType: 'touch', pointerId: 1, pageX: 595, pageY: 25});
        fireEvent.pointerUp(resizer, {pointerType: 'touch', pointerId: 1});

        expect(resizer).toHaveAttribute('value', '595');
        for (let row of rows) {
          expect((row.childNodes[0] as HTMLElement).style.width).toBe('595px');
          expect((row.childNodes[1] as HTMLElement).style.width).toBe('200px');
          expect((row.childNodes[2] as HTMLElement).style.width).toBe('200px');
        }

        // actual locations do not matter, the delta matters between events for the calculation of useMove
        fireEvent.pointerDown(resizer, {pointerType: 'touch', pointerId: 1, pageX: 595, pageY: 30});
        fireEvent.pointerMove(resizer, {pointerType: 'touch', pointerId: 1, pageX: 620, pageY: 25});
        fireEvent.pointerUp(resizer, {pointerType: 'touch', pointerId: 1});


        expect(resizer).toHaveAttribute('value', '620');
        for (let row of rows) {
          expect((row.childNodes[0] as HTMLElement).style.width).toBe('620px');
          expect((row.childNodes[1] as HTMLElement).style.width).toBe('190px');
          expect((row.childNodes[2] as HTMLElement).style.width).toBe('190px');
        }

        // tapping on the document.body doesn't cause a blur in jest because the body isn't focusable, so just call blur
        act(() => resizer.blur());
        act(() => {jest.runAllTimers();});

        expect(onResizeEnd).toHaveBeenCalledTimes(1);
        expect(onResizeEnd).toHaveBeenCalledWith(new Map<string, ColumnSize>([['foo', 620], ['bar', '1fr'], ['baz', '1fr']]));

        expect(tree.queryByRole('slider')).toBeNull();
      });

      it('dragging the resizer works - mobile', () => {
        setInteractionModality('pointer');
        let onResizeEnd = jest.fn();
        let tree = render(
          <TableView aria-label="Table" onResizeEnd={onResizeEnd}>
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

        expect(tree.queryByRole('slider')).toBeNull();

        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect((row.childNodes[0] as HTMLElement).style.width).toBe('600px');
          expect((row.childNodes[1] as HTMLElement).style.width).toBe('200px');
          expect((row.childNodes[2] as HTMLElement).style.width).toBe('200px');
        }

        let header = tree.getAllByRole('columnheader')[0];
        let resizableHeader = within(header).getByRole('button');

        triggerTouch(resizableHeader);
        act(() => {jest.runAllTimers();});

        let resizeMenuItem = tree.getAllByRole('menuitem')[0];

        triggerTouch(resizeMenuItem);
        act(() => {jest.runAllTimers();});

        let resizer = tree.getByRole('slider');
        expect(resizer).toBeVisible();
        expect(document.activeElement).toBe(resizer);

        // actual locations do not matter, the delta matters between events for the calculation of useMove
        fireEvent.pointerDown(resizer, {pointerType: 'touch', pointerId: 1, pageX: 600, pageY: 30});
        fireEvent.pointerMove(resizer, {pointerType: 'touch', pointerId: 1, pageX: 595, pageY: 25});
        fireEvent.pointerUp(resizer, {pointerType: 'touch', pointerId: 1});


        expect(resizer).toHaveAttribute('value', '595');
        for (let row of rows) {
          expect((row.childNodes[0] as HTMLElement).style.width).toBe('595px');
          expect((row.childNodes[1] as HTMLElement).style.width).toBe('200px');
          expect((row.childNodes[2] as HTMLElement).style.width).toBe('200px');
        }

        // actual locations do not matter, the delta matters between events for the calculation of useMove
        fireEvent.pointerDown(resizer, {pointerType: 'touch', pointerId: 1, pageX: 595, pageY: 30});
        fireEvent.pointerMove(resizer, {pointerType: 'touch', pointerId: 1, pageX: 620, pageY: 25});
        fireEvent.pointerUp(resizer, {pointerType: 'touch', pointerId: 1});


        expect(resizer).toHaveAttribute('value', '620');
        for (let row of rows) {
          expect((row.childNodes[0] as HTMLElement).style.width).toBe('620px');
          expect((row.childNodes[1] as HTMLElement).style.width).toBe('190px');
          expect((row.childNodes[2] as HTMLElement).style.width).toBe('190px');
        }

        // tapping on the document.body doesn't cause a blur in jest because the body isn't focusable, so just call blur
        act(() => resizer.blur());
        act(() => {jest.runAllTimers();});

        expect(onResizeEnd).toHaveBeenCalledTimes(1);
        expect(onResizeEnd).toHaveBeenCalledWith(new Map<string, ColumnSize>([['foo', 620], ['bar', '1fr'], ['baz', '1fr']]));

        expect(tree.queryByRole('slider')).toBeNull();
      });
    });

    describe('keyboard', () => {
      let plainRender = (props) => render(
        <TableView aria-label="Table" onResizeEnd={props.onResizeEnd}>
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
      let Example = (props) => {
        let container = useRef(null);
        return (
          <UNSTABLE_PortalProvider getContainer={() => container.current}>
            <TableView aria-label="Table" onResizeEnd={props.onResizeEnd}>
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
            <div id="custom-portal-container" ref={container} />
          </UNSTABLE_PortalProvider>
        );
      };
      let customPortalRender = (props) => render(<Example {...props} />);

      it.each`
        Name                         | renderer              | getContainer
        ${'default portal location'} | ${plainRender}        | ${'body'}
        ${'custom portal location'}  | ${customPortalRender} | ${'#custom-portal-container'}
      `('arrow keys the resizer works - desktop $Name', async ({renderer, getContainer}) => {
        jest.spyOn(window.screen, 'width', 'get').mockImplementation(() => 1024);
        simulateDesktop();
        let onResizeEnd = jest.fn();
        let tree = renderer({onResizeEnd});

        await user.tab();
        await user.keyboard('{ArrowUp}');

        let header = tree.getAllByRole('columnheader')[0];
        let resizableHeader = within(header).getByRole('button');
        expect(document.activeElement).toBe(resizableHeader);
        expect(tree.queryByRole('slider')).toBeNull();

        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect((row.childNodes[0] as HTMLElement).style.width).toBe('600px');
          expect((row.childNodes[1] as HTMLElement).style.width).toBe('200px');
          expect((row.childNodes[2] as HTMLElement).style.width).toBe('200px');
        }

        await user.keyboard('{Enter}');
        let menu = tree.getByRole('menu');
        expect(menu).toBeVisible();
        expect(menu.closest(getContainer)).not.toBeNull();

        await user.keyboard('{Enter}');
        act(() => {jest.runAllTimers();});
        act(() => {jest.runAllTimers();});
        expect(menu).not.toBeInTheDocument();

        let resizer = tree.getByRole('slider');

        expect(document.activeElement).toBe(resizer);

        await user.keyboard('{ArrowRight}');
        await user.keyboard('{ArrowRight}');

        expect(resizer).toHaveAttribute('value', '620');
        for (let row of rows) {
          expect((row.childNodes[0] as HTMLElement).style.width).toBe('620px');
          expect((row.childNodes[1] as HTMLElement).style.width).toBe('190px');
          expect((row.childNodes[2] as HTMLElement).style.width).toBe('190px');
        }
        await user.keyboard('{ArrowLeft}');
        await user.keyboard('{ArrowLeft}');


        expect(resizer).toHaveAttribute('value', '600');
        for (let row of rows) {
          expect((row.childNodes[0] as HTMLElement).style.width).toBe('600px');
          expect((row.childNodes[1] as HTMLElement).style.width).toBe('200px');
          expect((row.childNodes[2] as HTMLElement).style.width).toBe('200px');
        }
        await user.keyboard('{ArrowUp}');
        await user.keyboard('{ArrowUp}');

        expect(resizer).toHaveAttribute('value', '620');
        for (let row of rows) {
          expect((row.childNodes[0] as HTMLElement).style.width).toBe('620px');
          expect((row.childNodes[1] as HTMLElement).style.width).toBe('190px');
          expect((row.childNodes[2] as HTMLElement).style.width).toBe('190px');
        }

        await user.keyboard('{ArrowDown}');
        await user.keyboard('{ArrowDown}');

        expect(resizer).toHaveAttribute('value', '600');
        for (let row of rows) {
          expect((row.childNodes[0] as HTMLElement).style.width).toBe('600px');
          expect((row.childNodes[1] as HTMLElement).style.width).toBe('200px');
          expect((row.childNodes[2] as HTMLElement).style.width).toBe('200px');
        }

        await user.keyboard('{Escape}');
        expect(onResizeEnd).toHaveBeenCalledTimes(1);
        expect(onResizeEnd).toHaveBeenCalledWith(new Map<string, ColumnSize>([['foo', 600], ['bar', '1fr'], ['baz', '1fr']]));

        expect(document.activeElement).toBe(resizableHeader);

        expect(tree.queryByRole('slider')).toBeNull();
      });

      it('arrow keys the resizer works - mobile', async () => {
        let onResizeEnd = jest.fn();
        let tree = render(
          <TableView aria-label="Table" onResizeEnd={onResizeEnd}>
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

        await user.tab();
        fireEvent.keyDown(document.activeElement!, {key: 'ArrowUp'});
        fireEvent.keyUp(document.activeElement!, {key: 'ArrowUp'});

        let header = tree.getAllByRole('columnheader')[0];
        let resizableHeader = within(header).getByRole('button');
        expect(document.activeElement).toBe(resizableHeader);
        expect(tree.queryByRole('slider')).toBeNull();

        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect((row.childNodes[0] as HTMLElement).style.width).toBe('600px');
          expect((row.childNodes[1] as HTMLElement).style.width).toBe('200px');
          expect((row.childNodes[2] as HTMLElement).style.width).toBe('200px');
        }

        fireEvent.keyDown(document.activeElement!, {key: 'Enter'});
        fireEvent.keyUp(document.activeElement!, {key: 'Enter'});

        fireEvent.keyDown(document.activeElement!, {key: 'Enter'});
        fireEvent.keyUp(document.activeElement!, {key: 'Enter'});
        act(() => {jest.runAllTimers();});
        act(() => {jest.runAllTimers();});

        let resizer = tree.getByRole('slider');

        expect(document.activeElement).toBe(resizer);

        fireEvent.keyDown(document.activeElement!, {key: 'ArrowRight'});
        fireEvent.keyUp(document.activeElement!, {key: 'ArrowRight'});
        fireEvent.keyDown(document.activeElement!, {key: 'ArrowRight'});
        fireEvent.keyUp(document.activeElement!, {key: 'ArrowRight'});

        expect(resizer).toHaveAttribute('value', '620');
        for (let row of rows) {
          expect((row.childNodes[0] as HTMLElement).style.width).toBe('620px');
          expect((row.childNodes[1] as HTMLElement).style.width).toBe('190px');
          expect((row.childNodes[2] as HTMLElement).style.width).toBe('190px');
        }

        fireEvent.keyDown(document.activeElement!, {key: 'ArrowLeft'});
        fireEvent.keyUp(document.activeElement!, {key: 'ArrowLeft'});
        fireEvent.keyDown(document.activeElement!, {key: 'ArrowLeft'});
        fireEvent.keyUp(document.activeElement!, {key: 'ArrowLeft'});

        expect(resizer).toHaveAttribute('value', '600');
        for (let row of rows) {
          expect((row.childNodes[0] as HTMLElement).style.width).toBe('600px');
          expect((row.childNodes[1] as HTMLElement).style.width).toBe('200px');
          expect((row.childNodes[2] as HTMLElement).style.width).toBe('200px');
        }

        fireEvent.keyDown(document.activeElement!, {key: 'Escape'});
        fireEvent.keyUp(document.activeElement!, {key: 'Escape'});
        expect(onResizeEnd).toHaveBeenCalledTimes(1);
        expect(onResizeEnd).toHaveBeenCalledWith(new Map<string, ColumnSize>([['foo', 600], ['bar', '1fr'], ['baz', '1fr']]));

        expect(document.activeElement).toBe(resizableHeader);

        expect(tree.queryByRole('slider')).toBeNull();
      });
      it('can exit resize via Enter', async () => {
        simulateDesktop();
        let onResizeEnd = jest.fn();
        let tree = render(
          <TableView aria-label="Table" onResizeEnd={onResizeEnd}>
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

        await user.tab();
        fireEvent.keyDown(document.activeElement!, {key: 'ArrowUp'});
        fireEvent.keyUp(document.activeElement!, {key: 'ArrowUp'});

        let header = tree.getAllByRole('columnheader')[0];
        let resizableHeader = within(header).getByRole('button');
        expect(document.activeElement).toBe(resizableHeader);
        expect(tree.queryByRole('slider')).toBeNull();


        fireEvent.keyDown(document.activeElement!, {key: 'Enter'});
        fireEvent.keyUp(document.activeElement!, {key: 'Enter'});

        fireEvent.keyDown(document.activeElement!, {key: 'Enter'});
        fireEvent.keyUp(document.activeElement!, {key: 'Enter'});
        act(() => {jest.runAllTimers();});
        act(() => {jest.runAllTimers();});

        let resizer = tree.getByRole('slider');

        expect(document.activeElement).toBe(resizer);

        fireEvent.keyDown(document.activeElement!, {key: 'Enter'});
        fireEvent.keyUp(document.activeElement!, {key: 'Enter'});
        expect(onResizeEnd).toHaveBeenCalledTimes(1);
        expect(onResizeEnd).toHaveBeenCalledWith(new Map<string, ColumnSize>([['foo', 600], ['bar', '1fr'], ['baz', '1fr']]));
        expect(document.activeElement).toBe(resizableHeader);

        expect(tree.queryByRole('slider')).toBeNull();
      });
      it('can exit resize via Tab', async () => {
        simulateDesktop();
        let onResizeEnd = jest.fn();
        let tree = render(
          <TableView aria-label="Table" onResizeEnd={onResizeEnd}>
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

        await user.tab();
        fireEvent.keyDown(document.activeElement!, {key: 'ArrowUp'});
        fireEvent.keyUp(document.activeElement!, {key: 'ArrowUp'});

        let header = tree.getAllByRole('columnheader')[0];
        let resizableHeader = within(header).getByRole('button');
        expect(document.activeElement).toBe(resizableHeader);
        expect(tree.queryByRole('slider')).toBeNull();

        fireEvent.keyDown(document.activeElement!, {key: 'Enter'});
        fireEvent.keyUp(document.activeElement!, {key: 'Enter'});

        fireEvent.keyDown(document.activeElement!, {key: 'Enter'});
        fireEvent.keyUp(document.activeElement!, {key: 'Enter'});
        act(() => {jest.runAllTimers();});
        act(() => {jest.runAllTimers();});

        let resizer = tree.getByRole('slider');

        expect(document.activeElement).toBe(resizer);

        await user.tab();
        expect(onResizeEnd).toHaveBeenCalledTimes(1);
        // TODO: should call with null or the currently calculated widths?
        // might be hard to call with current values
        expect(onResizeEnd).toHaveBeenCalledWith(new Map<string, ColumnSize>([['foo', 600], ['bar', '1fr'], ['baz', '1fr']]));
        expect(document.activeElement).toBe(resizableHeader);

        expect(tree.queryByRole('slider')).toBeNull();
      });
      it('can exit resize via shift Tab', async () => {
        simulateDesktop();
        let onResizeEnd = jest.fn();
        let tree = render(
          <TableView aria-label="Table" onResizeEnd={onResizeEnd}>
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

        await user.tab();
        fireEvent.keyDown(document.activeElement!, {key: 'ArrowUp'});
        fireEvent.keyUp(document.activeElement!, {key: 'ArrowUp'});

        let header = tree.getAllByRole('columnheader')[0];
        let resizableHeader = within(header).getByRole('button');
        expect(document.activeElement).toBe(resizableHeader);
        expect(tree.queryByRole('slider')).toBeNull();


        fireEvent.keyDown(document.activeElement!, {key: 'Enter'});
        fireEvent.keyUp(document.activeElement!, {key: 'Enter'});

        fireEvent.keyDown(document.activeElement!, {key: 'Enter'});
        fireEvent.keyUp(document.activeElement!, {key: 'Enter'});
        act(() => {jest.runAllTimers();});
        act(() => {jest.runAllTimers();});

        let resizer = tree.getByRole('slider');
        expect(document.activeElement).toBe(resizer);

        await user.tab({shift: true});
        expect(onResizeEnd).toHaveBeenCalledTimes(1);
        expect(onResizeEnd).toHaveBeenCalledWith(new Map<string, ColumnSize>([['foo', 600], ['bar', '1fr'], ['baz', '1fr']]));
        expect(document.activeElement).toBe(resizableHeader);

        expect(tree.queryByRole('slider')).toBeNull();
      });
    });

    it('should prevent columns with child columns from being resizable', function () {
      let warn = jest.spyOn(global.console, 'warn').mockImplementation();
      let tree = render(
        <TableView aria-label="Table" selectionMode="multiple">
          <TableHeader columns={nestedColumns}>
            {column => <Column allowsResizing childColumns={column.children}>{column.name}</Column>}
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

      let headers = tree.getAllByRole('columnheader');
      for (let colheader of headers) {
        if (parseInt(colheader.getAttribute('aria-colspan')!, 10) > 1) {
          expect(within(colheader).queryByRole('button')).toBeFalsy();
        }
      }
      expect(warn).toHaveBeenCalledTimes(3);
      warn.mockRestore();
    });
  });

  describe('updating columns', function () {
    it('should support removing columns', async function () {
      let tree = render(<HidingColumns />);

      let checkbox = tree.getByLabelText('Net Budget') as HTMLInputElement;
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

      await user.click(checkbox);
      expect(checkbox.checked).toBe(false);

      act(() => {jest.runAllTimers();});

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

    it('should support adding columns', async function () {
      let tree = render(<HidingColumns />);

      let checkbox = tree.getByLabelText('Net Budget') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);

      await user.click(checkbox);
      expect(checkbox.checked).toBe(false);

      act(() => {jest.runAllTimers();});

      let table = tree.getByRole('grid');
      let columns = within(table).getAllByRole('columnheader');
      expect(columns).toHaveLength(5);

      await user.click(checkbox);
      expect(checkbox.checked).toBe(true);

      act(() => {jest.runAllTimers();});

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

    it('should update the row widths when removing and adding columns', async function () {
      function compareWidths(row, b) {
        let newWidth = row.childNodes[1].style.width;
        expect(parseInt(newWidth, 10)).toBeGreaterThan(parseInt(b, 10));
        return newWidth;
      }

      let tree = render(<HidingColumns />);
      act(() => {jest.runAllTimers();});
      let table = tree.getByRole('grid');
      let columns = within(table).getAllByRole('columnheader');
      expect(columns).toHaveLength(6);

      let rows = tree.getAllByRole('row');
      let oldWidth = (rows[1].childNodes[1] as HTMLElement).style.width;

      let audienceCheckbox = tree.getByLabelText('Audience Type') as HTMLInputElement;
      let budgetCheckbox = tree.getByLabelText('Net Budget') as HTMLInputElement;
      let targetCheckbox = tree.getByLabelText('Target OTP') as HTMLInputElement;
      let reachCheckbox = tree.getByLabelText('Reach') as HTMLInputElement;

      await user.click(audienceCheckbox);
      expect(audienceCheckbox.checked).toBe(false);
      act(() => {jest.runAllTimers();});
      oldWidth = compareWidths(rows[1], oldWidth);

      await user.click(budgetCheckbox);
      expect(budgetCheckbox.checked).toBe(false);
      act(() => {jest.runAllTimers();});
      oldWidth = compareWidths(rows[1], oldWidth);

      await user.click(targetCheckbox);
      expect(targetCheckbox.checked).toBe(false);
      act(() => {jest.runAllTimers();});
      oldWidth = compareWidths(rows[1], oldWidth);

      // This previously failed, the first column wouldn't update its width
      // when the 2nd to last column was removed
      await user.click(reachCheckbox);
      expect(reachCheckbox.checked).toBe(false);
      act(() => {jest.runAllTimers();});
      oldWidth = compareWidths(rows[1], oldWidth);
      columns = within(table).getAllByRole('columnheader');
      expect(columns).toHaveLength(2);

      // Re-add the column and check that the width decreases
      await user.click(audienceCheckbox);
      expect(audienceCheckbox.checked).toBe(true);
      act(() => {jest.runAllTimers();});
      expect(parseInt((rows[1].childNodes[1] as HTMLElement).style.width, 10)).toBeLessThan(parseInt(oldWidth, 10));
    });
  });

  describe('headerless columns', function () {

    let renderTable = (props = {}, scale: Scale = 'medium', showDivider = false) => render(
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
      expect((headers[1].childNodes[0] as HTMLElement).style.clipPath).toBe('inset(50%)');
      expect((headers[1].childNodes[0] as HTMLElement).style.width).toBe('1px');
      expect((headers[1].childNodes[0] as HTMLElement).style.height).toBe('1px');
      expect(headers[1]).not.toBeEmptyDOMElement();


      let rows = within(rowgroups[1]).getAllByRole('row');
      expect(rows).toHaveLength(1);
      // The width of headerless column
      expect((rows[0].childNodes[1] as HTMLElement).style.width).toBe('38px');
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
      expect((rows[0].childNodes[1] as HTMLElement).style.width).toBe('46px');
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
      expect((rows[0].childNodes[1] as HTMLElement).style.width).toBe('39px');
    });

    it('renders table with headerless column with tooltip', async function () {
      let {getByRole} = renderTable({}, 'large');
      let grid = getByRole('grid');
      expect(grid).toBeVisible();
      expect(grid).toHaveAttribute('aria-label', 'Table');
      expect(grid).toHaveAttribute('data-testid', 'test');
      await user.tab();
      await user.keyboard('{ArrowUp}{ArrowRight}');
      let tooltip = getByRole('tooltip');
      expect(tooltip).toBeVisible();
    });
  });
});


// I'd use tree.getByRole(role, {name: text}) here, but it's unbearably slow.
function getColumn(tree, name) {
  // Find by text, then go up to the element with the cell role.
  let el = tree.getByText(name);
  while (el && !/columnheader/.test(el.getAttribute('role'))) {
    el = el.parentElement;
  }

  return el;
}

function resizeCol(tree, col, delta) {
  let column = getColumn(tree, col);

  // trigger pointer modality
  act(() => {setInteractionModality('pointer');});
  fireEvent.pointerMove(tree.container);

  fireEvent.pointerEnter(column);
  let resizer = within(column).getByRole('slider');
  fireEvent.pointerEnter(resizer);

  // actual locations do not matter, the delta matters between events for the calculation of useMove
  fireEvent.pointerDown(resizer, {pointerType: 'mouse', pointerId: 1, pageX: 0, pageY: 30});
  act(() => {jest.runAllTimers();});
  fireEvent.pointerMove(resizer, {pointerType: 'mouse', pointerId: 1, pageX: delta, pageY: 25});
  act(() => {jest.runAllTimers();});
  fireEvent.pointerUp(resizer, {pointerType: 'mouse', pointerId: 1});
  act(() => {jest.runAllTimers();});
}


function resizeTable(clientWidth, newValue) {
  clientWidth.mockImplementation(() => newValue);
  fireEvent(window, new Event('resize'));
  act(() => {jest.runAllTimers();});
}

describe('RSP TableView', () => {
  resizingTests(render, rerender, ControllingResize, ControllingResize, resizeCol, resizeTable);
});
