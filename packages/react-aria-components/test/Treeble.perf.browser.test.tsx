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
import {Collection} from 'react-aria/Collection';
import {createRoot, Root} from 'react-dom/client';
import {describe, expect, it} from 'vitest';
import {flushSync} from 'react-dom';
import {Key} from '@react-types/shared';
import React, {Profiler, useState} from 'react';
import {useLayoutEffect} from 'react-aria/private/utils/useLayoutEffect';

// A tree table shaped like a CI dashboard: 50 workflows with 5 jobs each (300 rows when expanded).
interface Item {
  id: string;
  name: string;
  children?: Item[];
}

const PARENTS = 50;
const CHILDREN = 5;

function makeItems(): Item[] {
  return Array.from({length: PARENTS}, (_, p) => ({
    id: `w${p}`,
    name: `Workflow ${p}`,
    children: Array.from({length: CHILDREN}, (_, c) => ({id: `w${p}-j${c}`, name: `Job ${p}.${c}`}))
  }));
}

let counts = {row: 0, cell: 0, commits: 0};
function resetCounts() {
  counts = {row: 0, cell: 0, commits: 0};
}

// Lets the tests update the table's state from outside React.
let controls: {
  setItems: (fn: (items: Item[]) => Item[]) => void;
  setExpandedKeys: (keys: Set<Key>) => void;
};

function TreeTable({initialExpanded}: {initialExpanded: Set<Key>}) {
  let [items, setItems] = useState(makeItems);
  let [expandedKeys, setExpandedKeys] = useState<Set<Key>>(initialExpanded);
  useLayoutEffect(() => {
    controls = {setItems, setExpandedKeys};
  }, []);
  let renderRow = (item: Item) => (
    <Row
      id={item.id}
      className={() => {
        counts.row++;
        return 'row';
      }}>
      <Cell
        className={() => {
          counts.cell++;
          return 'cell';
        }}>
        {item.name}
      </Cell>
      <Cell
        className={() => {
          counts.cell++;
          return 'cell';
        }}>
        Running
      </Cell>
      <Cell
        className={() => {
          counts.cell++;
          return 'cell';
        }}>
        1m 2s
      </Cell>
      {item.children && <Collection items={item.children}>{renderRow}</Collection>}
    </Row>
  );

  return (
    <Profiler id="table" onRender={() => counts.commits++}>
      <Table
        aria-label="Pipelines"
        treeColumn="name"
        selectionMode="multiple"
        expandedKeys={expandedKeys}
        onExpandedChange={setExpandedKeys}>
        <TableHeader>
          <Column id="name" isRowHeader>
            Name
          </Column>
          <Column id="status">Status</Column>
          <Column id="duration">Duration</Column>
        </TableHeader>
        <TableBody items={items}>{renderRow}</TableBody>
      </Table>
    </Profiler>
  );
}

function mount(initialExpanded: Set<Key>): {root: Root; container: HTMLElement} {
  let container = document.createElement('div');
  document.body.appendChild(container);
  let root = createRoot(container);
  flushSync(() => root.render(<TreeTable initialExpanded={initialExpanded} />));
  // Warm up the JIT so the first measurement is comparable with the rest.
  for (let i = 0; i < 5; i++) {
    flushSync(() => controls.setItems(items => [...items]));
  }
  return {root, container};
}

function measure(fn: () => void) {
  resetCounts();
  let start = performance.now();
  flushSync(fn);
  let time = performance.now() - start;
  return {time, ...counts};
}

function median(values: number[]) {
  let sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

const allExpanded = () => new Set<Key>(Array.from({length: PARENTS}, (_, p) => `w${p}`));

function addChildren(parent: string, count: number, round: number) {
  controls.setItems(items =>
    items.map(item =>
      item.id === parent
        ? {
            ...item,
            children: [
              ...item.children!,
              ...Array.from({length: count}, (_, i) => ({
                id: `${parent}-extra${round}-${i}`,
                name: `Extra ${round}.${i}`
              }))
            ]
          }
        : item
    )
  );
}

describe('Tree Table render cost', () => {
  it('only re-renders the changed rows when one row gains child rows', async () => {
    let {root, container} = mount(allExpanded());
    expect(container.querySelectorAll('[role="row"]').length).toBe(1 + PARENTS * (CHILDREN + 1));

    let run = (rounds: number, fn: (round: number) => void) => {
      let times: number[] = [];
      let result;
      for (let round = 0; round < rounds; round++) {
        result = measure(() => fn(round));
        times.push(result.time);
      }
      return {...result, median: median(times)};
    };

    let addOne = run(7, round => addChildren('w10', 1, round));
    console.log('[bench] add 1 child row:', JSON.stringify(addOne));
    let noChange = run(7, () => controls.setItems(items => [...items]));
    console.log('[bench] re-render, no changes:', JSON.stringify(noChange));
    let addSixty = run(5, round => addChildren('w20', 60, round));
    console.log('[bench] add 60 child rows:', JSON.stringify(addSixty));

    expect(container.querySelectorAll('[role="row"]').length).toBe(
      1 + PARENTS * (CHILDREN + 1) + 7 + 300
    );
    // The parent, its previous last child, the new row, and its siblings (whose aria-setsize changes).
    expect(addOne.row).toBeLessThanOrEqual(CHILDREN + 7 + 1);
    expect(noChange.row).toBe(0);
    expect(noChange.cell).toBe(0);

    root.unmount();
    container.remove();
  });

  it('only re-renders the toggled row and its children when expanding a row', async () => {
    let collapsed = allExpanded();
    collapsed.delete('w30');
    let {root, container} = mount(collapsed);

    let times: number[] = [];
    let expand;
    let collapse;
    for (let round = 0; round < 7; round++) {
      expand = measure(() => controls.setExpandedKeys(allExpanded()));
      collapse = measure(() => controls.setExpandedKeys(collapsed));
      times.push(expand.time);
    }
    console.log('[bench] expand one row:', JSON.stringify({median: median(times), ...expand}));
    console.log('[bench] collapse one row:', JSON.stringify(collapse));
    expect(container.querySelectorAll('[role="row"]').length).toBe(
      1 + PARENTS * (CHILDREN + 1) - CHILDREN
    );
    expect(expand.row).toBeLessThanOrEqual(CHILDREN + 2);

    root.unmount();
    container.remove();
  });
});
