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
import {TableLayout} from '../src/TableLayout';
import userEvent from '@testing-library/user-event';
import {Virtualizer} from '../src/Virtualizer';

it('keeps changing column collections within a fixed viewport', async () => {
  function Example({count}: {count: number}) {
    let columns = ['Name', 'Type', 'Date', 'Owner'].slice(0, count);
    return (
      <ResizableTableContainer style={{width: 600, height: 120, overflow: 'auto'}}>
        <Table aria-label="Files">
          <TableHeader>
            {columns.map(name => (
              <Column key={name} id={name} isRowHeader={name === 'Name'} style={{padding: 8}}>
                {name}
              </Column>
            ))}
          </TableHeader>
          <TableBody>
            <Row id="files">
              {columns.map(name => (
                <Cell key={name} style={{padding: 8}}>
                  {name}
                </Cell>
              ))}
            </Row>
          </TableBody>
        </Table>
      </ResizableTableContainer>
    );
  }

  let screen = await render(<Example count={2} />);
  let table = screen.container.querySelector('table')!;
  await expect.poll(() => table.offsetWidth).toBe(600);
  for (let count of [3, 4, 2]) {
    await screen.rerender(<Example count={count} />);
    await expect.poll(() => table.offsetWidth).toBe(600);
  }
});

it.each([false, true])(
  'preserves intrinsic width for fixed columns with an empty body: %s',
  async empty => {
    let {container} = await render(
      <ResizableTableContainer style={{display: 'inline-block'}}>
        <Table aria-label="Files" style={{borderCollapse: 'collapse'}}>
          <TableHeader>
            <Column isRowHeader width={200} style={{padding: 8}}>
              Name
            </Column>
            <Column width={150} style={{padding: 8}}>
              Type
            </Column>
          </TableHeader>
          <TableBody renderEmptyState={() => 'No files'}>
            {empty ? null : (
              <Row id="files">
                <Cell>Documents</Cell>
                <Cell>Folder</Cell>
              </Row>
            )}
          </TableBody>
        </Table>
      </ResizableTableContainer>
    );
    let table = container.querySelector('table')!;
    await expect.poll(() => table.offsetWidth).toBe(382);
    expect(table.parentElement!.offsetWidth).toBe(382);
  }
);

it('preserves fixed and percentage column constraints as the viewport changes', async () => {
  function Example({width}: {width: number}) {
    return (
      <ResizableTableContainer style={{width, height: 120, overflow: 'auto'}}>
        <Table aria-label="Files" style={{borderCollapse: 'collapse'}}>
          <TableHeader>
            <Column isRowHeader width={200} style={{padding: 0}}>
              Fixed
            </Column>
            <Column width="25%" minWidth={75} maxWidth={200} style={{padding: 0}}>
              Share
            </Column>
            <Column style={{padding: 0}}>Flexible</Column>
          </TableHeader>
          <TableBody>
            <Row id="files">
              <Cell style={{padding: 0}}>One</Cell>
              <Cell style={{padding: 0}}>Two</Cell>
              <Cell style={{padding: 0}}>Three</Cell>
            </Row>
          </TableBody>
        </Table>
      </ResizableTableContainer>
    );
  }

  let screen = await render(<Example width={600} />);
  let table = screen.container.querySelector('table')!;
  let fixed = table.tHead!.rows[0].cells[0];
  let share = table.tHead!.rows[0].cells[1];
  await expect.poll(() => share.offsetWidth).toBe(150);
  for (let [width, shareWidth] of [
    [400, 100],
    [800, 200],
    [1000, 200],
    [280, 75]
  ]) {
    await screen.rerender(<Example width={width} />);
    await expect.poll(() => table.offsetWidth).toBe(Math.max(width, 350));
    expect(share.offsetWidth).toBe(shareWidth);
    expect(fixed.offsetWidth).toBe(200);
  }
});

it('preserves column widths when body cells span columns', async () => {
  let {container} = await render(
    <ResizableTableContainer style={{width: 600, height: 120, overflow: 'auto'}}>
      <Table aria-label="Files">
        <TableHeader>
          <Column isRowHeader style={{padding: 8}}>
            Name
          </Column>
          <Column style={{padding: 8}}>Type</Column>
          <Column style={{padding: 8}}>Date</Column>
        </TableHeader>
        <TableBody>
          <Row id="files">
            <Cell colSpan={2}>Documents folder</Cell>
            <Cell>January 1</Cell>
          </Row>
        </TableBody>
      </Table>
    </ResizableTableContainer>
  );
  let table = container.querySelector('table')!;
  await expect.poll(() => table.offsetWidth).toBe(600);
  expect(table.tBodies[0].rows[0].cells[0].colSpan).toBe(2);
});

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
  {
    name: 'fractional border spacing',
    tableStyle: {borderCollapse: 'separate' as const, borderSpacing: '4.3px'}
  },
  {
    name: 'scaled ancestor',
    tableStyle: {borderCollapse: 'collapse' as const},
    containerStyle: {transform: 'scale(0.5)', transformOrigin: 'top left'}
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
    expect(table.offsetWidth).toBeLessThanOrEqual(600);
    expect(table.getBoundingClientRect().width).toBeLessThanOrEqual(600);
  }
);

it.each(
  ['ltr', 'rtl'].flatMap(direction => [
    {direction, boxSizing: 'content-box' as const},
    {direction, boxSizing: 'border-box' as const}
  ])
)(
  'preserves column sizing and keyboard resizing in $direction flex layouts with $boxSizing',
  async ({direction, boxSizing}) => {
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
                      style={{padding: 8, ...(boxSizing === 'border-box' ? {boxSizing} : {})}}>
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
    let extraWidth = boxSizing === 'content-box' ? 16 : 0;
    await expect.poll(() => getComputedStyle(header).boxSizing).toBe(boxSizing);
    await expect.poll(() => header.getBoundingClientRect().width).toBe(200 + extraWidth);
    // Keep keyboard actions within this document when browser tests run in parallel.
    let user = userEvent.setup({delay: null});
    await user.click(screen.getByRole('button', {name: 'Resize Name'}).element());
    await expect.element(screen.getByRole('slider', {name: 'Resize Name'})).toHaveFocus();
    await user.keyboard(direction === 'rtl' ? '{ArrowLeft}' : '{ArrowRight}');
    await expect.poll(() => header.getBoundingClientRect().width).toBe(210 + extraWidth);
    await user.keyboard('{Enter}');
    await expect.poll(() => header.hasAttribute('data-resizing')).toBe(false);
    expect(header.getBoundingClientRect().width).toBe(210 + extraWidth);
    expect(header.getBoundingClientRect().width).toBeLessThanOrEqual(250 + extraWidth);
    let resizedWidth = header.getBoundingClientRect().width;
    for (let width of [800, 500]) {
      await screen.rerender(<Example width={width} />);
      await expect.poll(() => table.getBoundingClientRect().width).toBe(width);
      expect(header.getBoundingClientRect().width).toBe(resizedWidth);
    }
  }
);

it.each(['block', 'table', 'inline-table'] as const)(
  'preserves virtualized div table widths with display: %s',
  async display => {
    let {container} = await render(
      <ResizableTableContainer style={{width: 600}}>
        <Virtualizer layout={TableLayout} layoutOptions={{rowHeight: 30, headingHeight: 30}}>
          <Table aria-label="Files" style={{display, width: 600, height: 120, overflow: 'auto'}}>
            <TableHeader>
              <Column isRowHeader>Name</Column>
              <Column>Type</Column>
            </TableHeader>
            <TableBody>
              <Row id="files">
                <Cell>Documents</Cell>
                <Cell>Folder</Cell>
              </Row>
            </TableBody>
          </Table>
        </Virtualizer>
      </ResizableTableContainer>
    );
    let table = container.querySelector<HTMLElement>('[role="grid"]')!;
    expect(table.tagName).toBe('DIV');
    await expect
      .poll(() =>
        Array.from(table.querySelectorAll<HTMLElement>('[role="columnheader"]')).map(
          column => column.style.width
        )
      )
      .toEqual(['300px', '300px']);
    expect(table.offsetWidth).toBe(600);
  }
);
