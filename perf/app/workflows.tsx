/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import {
  Button,
  Cell,
  Collection,
  Column,
  DropTarget,
  GridList,
  GridListItem,
  Key,
  Row,
  Table,
  TableBody,
  TableHeader,
  TableLayout,
  TableLoadMoreItem,
  Text,
  useDragAndDrop,
  Virtualizer
} from 'react-aria-components';
import React, {useMemo, useState} from 'react';

interface RecordItem {
  id: string;
  name: string;
  owner: string;
  status: string;
  amount: string;
  date: string;
  category: string;
}

// Pages are prepared before mounting and appended synchronously when the load-more
// sentinel approaches the viewport, so the measured cost is the application and
// collection work of each append, not network latency.
// Pages stay 50 rows as --scale grows, so a 4,000 px scroll always loads two pages.
const pageSize = 50;

export function InfiniteTableFixture({items}: {items: RecordItem[]}) {
  let [count, setCount] = useState(pageSize);
  let rows = useMemo(() => items.slice(0, count), [items, count]);
  return (
    <>
      <output id="loaded-count">{count}</output>
      <Virtualizer
        layout={TableLayout}
        layoutOptions={{rowHeight: 40, headingHeight: 40, loaderHeight: 40}}>
        <Table aria-label="Loaded records" className="table" data-bench="infinite-table">
          <TableHeader>
            <Column id="name" isRowHeader width={190}>
              Name
            </Column>
            <Column id="owner" width={120}>
              Owner
            </Column>
            <Column id="status" width={110}>
              Status
            </Column>
            <Column id="amount" width={100}>
              Amount
            </Column>
            <Column id="date" width={140}>
              Updated
            </Column>
            <Column id="category" width={140}>
              Category
            </Column>
          </TableHeader>
          <TableBody>
            <Collection items={rows}>
              {row => (
                <Row id={row.id} data-record={row.id}>
                  <Cell>{row.name}</Cell>
                  <Cell>{row.owner}</Cell>
                  <Cell>{row.status}</Cell>
                  <Cell>{row.amount}</Cell>
                  <Cell>{row.date}</Cell>
                  <Cell>{row.category}</Cell>
                </Row>
              )}
            </Collection>
            {count < items.length && (
              <TableLoadMoreItem
                onLoadMore={() => setCount(count => Math.min(count + pageSize, items.length))}>
                Loading more records
              </TableLoadMoreItem>
            )}
          </TableBody>
        </Table>
      </Virtualizer>
    </>
  );
}

function moveRecords(rows: RecordItem[], keys: Set<Key>, target: DropTarget) {
  if (target.type !== 'item') {
    return rows;
  }
  let moved = rows.filter(row => keys.has(row.id));
  let remaining = rows.filter(row => !keys.has(row.id));
  let index = remaining.findIndex(row => row.id === target.key);
  remaining.splice(target.dropPosition === 'after' ? index + 1 : index, 0, ...moved);
  return remaining;
}

export function ReorderFixture({items}: {items: RecordItem[]}) {
  let [rows, setRows] = useState(items);
  let {dragAndDropHooks} = useDragAndDrop({
    getItems: keys => [...keys].map(key => ({'text/plain': String(key)})),
    onReorder: ({keys, target}) => setRows(rows => moveRecords(rows, keys, target))
  });
  return (
    <GridList
      aria-label="Reorderable records"
      className="reorder-list"
      items={rows}
      dragAndDropHooks={dragAndDropHooks}>
      {item => (
        <GridListItem id={item.id} data-record={item.id} textValue={item.name}>
          <div className="reorder-content">
            <Button slot="drag" aria-label={`Drag ${item.name}`}>
              ≡
            </Button>
            <Text data-record-label>{item.name}</Text>
            <Text slot="description">
              {item.owner} · {item.status}
            </Text>
          </div>
        </GridListItem>
      )}
    </GridList>
  );
}
