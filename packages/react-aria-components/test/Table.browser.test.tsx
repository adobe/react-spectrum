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

import {
  Cell,
  Column,
  ColumnResizer,
  ResizableTableContainer,
  Row,
  Table,
  TableBody,
  TableHeader
} from '../src/Table';
import {ColumnSize} from 'react-stately/useTableState';
import {expect, it} from 'vitest';
import {I18nProvider} from 'react-aria';
import {Key} from '@react-types/shared';
import React from 'react';
import {render} from 'vitest-browser-react';
import {userEvent} from 'vitest/browser';

it.each([
  {name: 'collapsed borders', tableStyle: {borderCollapse: 'collapse' as const}},
  {name: 'separate borders', tableStyle: {borderCollapse: 'separate' as const}},
  {
    name: 'custom spacing and table padding',
    tableStyle: {
      borderCollapse: 'separate' as const,
      borderSpacing: '4.5px 3px',
      padding: 8,
      border: '2px solid black'
    }
  },
  {
    name: 'collapsed table borders',
    tableStyle: {borderCollapse: 'collapse' as const, border: '4px solid black'}
  },
  {
    name: 'collapsed cell borders',
    tableStyle: {borderCollapse: 'collapse' as const},
    cellStyle: {border: '4px solid black'}
  },
  {name: 'table margins', tableStyle: {borderCollapse: 'collapse' as const, marginInline: 8}},
  {
    name: 'container padding',
    tableStyle: {borderCollapse: 'collapse' as const},
    containerStyle: {padding: 8}
  }
])(
  'keeps resizable table width stable inside nested flex containers with $name',
  async ({tableStyle, containerStyle, cellStyle}) => {
    let {container} = await render(
      <div style={{display: 'flex', width: 600}}>
        <div style={{display: 'flex', flex: 1}}>
          <ResizableTableContainer style={{flex: 1, ...containerStyle}}>
            <Table aria-label="Files" style={tableStyle}>
              <TableHeader>
                <Column isRowHeader style={{padding: 8, ...cellStyle}}>
                  Name
                </Column>
                <Column style={{padding: 8, ...cellStyle}}>Type</Column>
                <Column style={{padding: 8, ...cellStyle}}>Date</Column>
              </TableHeader>
              <TableBody>
                <Row id="files">
                  <Cell style={{padding: 8, ...cellStyle}}>Documents</Cell>
                  <Cell style={{padding: 8, ...cellStyle}}>Folder</Cell>
                  <Cell style={{padding: 8, ...cellStyle}}>January 1</Cell>
                </Row>
              </TableBody>
            </Table>
          </ResizableTableContainer>
        </div>
      </div>
    );
    let table = container.querySelector('table')!;
    let widths: number[] = [];
    for (let i = 0; i < 20; i++) {
      await new Promise(requestAnimationFrame);
      widths.push(table.getBoundingClientRect().width);
    }
    expect(Math.max(...widths.slice(-5)) - Math.min(...widths.slice(-5))).toBeLessThan(1);
    expect(table.getBoundingClientRect().width).toBeLessThanOrEqual(600);
  }
);

it.each(['ltr', 'rtl'] as const)(
  'preserves column constraints and keyboard resizing in %s flex layouts',
  async direction => {
    function Example({width}: {width: number}) {
      let [widths, setWidths] = React.useState(new Map<Key, ColumnSize>([['name', 200]]));
      return (
        <I18nProvider locale={direction === 'rtl' ? 'ar-AE' : 'en-US'}>
          <div style={{display: 'flex', width}} dir={direction}>
            <div style={{display: 'flex', flex: 1, minWidth: 0}}>
              <ResizableTableContainer
                style={{flex: 1, minWidth: 0, overflow: 'auto'}}
                onResize={setWidths}>
                <Table aria-label="Files" style={{borderSpacing: '4px'}}>
                  <TableHeader>
                    <Column
                      id="name"
                      isRowHeader
                      width={widths.get('name')}
                      minWidth={150}
                      maxWidth={250}
                      style={{padding: 8}}>
                      {({startResize}) => (
                        <>
                          <button onClick={startResize}>Resize Name</button>
                          <ColumnResizer aria-label="Resize Name" />
                        </>
                      )}
                    </Column>
                    <Column id="type" style={{padding: 8}}>
                      Type
                    </Column>
                  </TableHeader>
                  <TableBody>
                    <Row id="files">
                      <Cell>Documents</Cell>
                      <Cell>Folder</Cell>
                    </Row>
                  </TableBody>
                </Table>
              </ResizableTableContainer>
            </div>
          </div>
        </I18nProvider>
      );
    }
    let screen = await render(<Example width={600} />);
    let table = screen.container.querySelector('table')!;
    let header = table.querySelector('th')!;
    await expect.poll(() => header.getBoundingClientRect().width).toBe(200);
    await screen.getByRole('button', {name: 'Resize Name'}).click();
    await expect.element(screen.getByRole('slider', {name: 'Resize Name'})).toHaveFocus();
    await userEvent.keyboard(direction === 'rtl' ? '{ArrowLeft}' : '{ArrowRight}');
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => header.getBoundingClientRect().width).toBeGreaterThan(200);
    expect(header.getBoundingClientRect().width).toBeLessThanOrEqual(250);
    let resizedWidth = header.getBoundingClientRect().width;
    for (let width of [800, 500]) {
      await screen.rerender(<Example width={width} />);
      await expect.poll(() => table.getBoundingClientRect().width).toBe(width);
      expect(header.getBoundingClientRect().width).toBe(resizedWidth);
    }
  }
);
