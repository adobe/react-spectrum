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

import {Cell, Column, Row, Table, TableBody, TableHeader, TableLoadMoreItem} from '../src/Table';
import {Collection} from 'react-aria/Collection';
import {describe, expect, it, vi} from 'vitest';
import React from 'react';
import {render} from 'vitest-browser-react';
import {TableLayout} from '../src/TableLayout';
import {Virtualizer} from '../src/Virtualizer';

let columns = Array.from({length: 12}, (_, i) => ({id: `c${i}`, name: `Column ${i}`}));
let rows = Array.from({length: 50}, (_, i) => ({id: i}));

function WideTable({onLoadMore, style}: {onLoadMore: () => void; style?: React.CSSProperties}) {
  return (
    <Table aria-label="Wide table" style={style}>
      <TableHeader columns={columns}>
        {column => (
          <Column id={column.id} isRowHeader={column.id === 'c0'} width={200}>
            {column.name}
          </Column>
        )}
      </TableHeader>
      <TableBody>
        <Collection items={rows}>
          {row => (
            <Row id={row.id} columns={columns}>
              {column => <Cell>{`${column.name}, row ${row.id + 1}`}</Cell>}
            </Row>
          )}
        </Collection>
        <TableLoadMoreItem onLoadMore={onLoadMore} />
      </TableBody>
    </Table>
  );
}

async function scrollRightThenDown(scroller: HTMLElement, onLoadMore: () => void) {
  scroller.scrollLeft = scroller.scrollWidth;
  // Make sure the table is scrolled by more than one container width.
  expect(scroller.scrollLeft).toBeGreaterThan(2 * scroller.clientWidth);
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  expect(onLoadMore).not.toHaveBeenCalled();

  scroller.scrollTop = scroller.scrollHeight;
  await vi.waitFor(() => expect(onLoadMore).toHaveBeenCalled(), {timeout: 2000});
}

describe('Table load more', () => {
  it('fires onLoadMore when a virtualized table is scrolled to the bottom after scrolling far to the right', async () => {
    let onLoadMore = vi.fn();
    let {container} = await render(
      <Virtualizer layout={TableLayout} layoutOptions={{rowHeight: 32, headingHeight: 32}}>
        <WideTable onLoadMore={onLoadMore} style={{width: 400, height: 300, overflow: 'auto'}} />
      </Virtualizer>
    );

    await scrollRightThenDown(container.querySelector('[role=grid]') as HTMLElement, onLoadMore);
  });

  it('fires onLoadMore when a non-virtualized table is scrolled to the bottom after scrolling far to the right', async () => {
    let onLoadMore = vi.fn();
    let {container} = await render(
      <div data-testid="scroller" style={{width: 400, height: 300, overflow: 'auto'}}>
        <WideTable onLoadMore={onLoadMore} style={{width: 2400, tableLayout: 'fixed'}} />
      </div>
    );

    await scrollRightThenDown(
      container.querySelector('[data-testid=scroller]') as HTMLElement,
      onLoadMore
    );
  });
});
