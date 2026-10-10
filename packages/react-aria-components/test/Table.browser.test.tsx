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

import {Cell, Column, Row, Table, TableBody, TableHeader} from '../src/Table';
import {expect, it} from 'vitest';
import React, {useState} from 'react';
import {render} from 'vitest-browser-react';
import {TableLayout} from '../src/TableLayout';
import {Virtualizer} from '../src/Virtualizer';

// Changes height on its own, like an auto-growing text area, without the collection changing.
function GrowingNote() {
  let [isTall, setTall] = useState(false);
  return (
    <button
      data-testid="note"
      onClick={() => setTall(tall => !tall)}
      style={{display: 'block', height: isTall ? 120 : 20, padding: 0, border: 0}}>
      {isTall ? 'Long note' : 'Note'}
    </button>
  );
}

function GrowingCellTable() {
  let rows = Array.from({length: 20}, (_, i) => ({id: i, name: `Item ${i}`}));
  return (
    <Virtualizer
      layout={TableLayout}
      layoutOptions={{estimatedRowHeight: 32}}
      shouldObserveItemSize>
      <Table aria-label="Growing cell" style={{height: 500, width: 600, overflow: 'auto'}}>
        <TableHeader>
          <Column isRowHeader>Name</Column>
          <Column>Notes</Column>
        </TableHeader>
        <TableBody items={rows}>
          {row => (
            <Row>
              <Cell>{row.name}</Cell>
              <Cell>{row.id === 0 ? <GrowingNote /> : 'Note'}</Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </Virtualizer>
  );
}

it('grows and shrinks a row with the content of its cells', async () => {
  let {container} = await render(<GrowingCellTable />);
  let firstRowHeight = () =>
    (container.querySelector('[role=row][aria-rowindex="2"]')?.parentElement as HTMLElement | null)
      ?.style.height;
  let note = container.querySelector('[data-testid=note]') as HTMLElement;

  await expect.poll(firstRowHeight).toBe('20px');

  note.click();
  await expect.poll(firstRowHeight).toBe('120px');

  note.click();
  await expect.poll(firstRowHeight).toBe('20px');
});
