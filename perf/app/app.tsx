/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import {
  Button,
  Cell,
  Checkbox,
  Column,
  ComboBox,
  Dialog,
  DialogTrigger,
  Heading,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Modal,
  ModalOverlay,
  Popover,
  ResizableTableContainer,
  Row,
  Switch,
  Table,
  TableBody,
  TableHeader,
  TableLayout,
  TextField,
  Virtualizer
} from 'react-aria-components';
import {createRoot} from 'react-dom/client';
import {measurement} from './measure';
import React, {useState} from 'react';
import {sizes} from '../scenarios.mjs';
import './styles.css';

const params = new URLSearchParams(location.search);
const fixture = params.get('fixture') ?? 'listbox';
const size = Number(params.get('size') ?? sizes[fixture]);
const delay = Number(params.get('delay') ?? 0);
const delayMode = params.get('delayMode') ?? 'sync';
const items = Array.from({length: size}, (_, i) => ({
  id: `item-${i}`,
  name: `Record ${i}`,
  owner: `Team ${i % 12}`,
  status: i % 3 === 0 ? 'Review' : 'Active',
  amount: `$${100 + i}`,
  date: 'Oct 14, 2026',
  category: `Category ${i % 8}`
}));

function withCalibration(update: () => void) {
  if (delayMode === 'deferred' && delay > 0) {
    setTimeout(update, delay);
    return;
  }
  let end = performance.now() + delay;
  let probe: HTMLDivElement | undefined;
  if (delayMode === 'layout' && delay) {
    probe = document.createElement('div');
    probe.className = 'layout-probe';
    document.body.append(probe);
  }
  let n = 0;
  while (performance.now() < end) {
    if (probe) {
      probe.style.width = `${100 + (n++ % 100)}px`;
      probe.getBoundingClientRect();
    }
  }
  probe?.remove();
  update();
}

function ListFixture() {
  let [revision, setRevision] = useState(0);
  return (
    <>
      <Button id="parent-update" onPress={() => setRevision(n => n + 1)}>
        Refresh status
      </Button>
      <output id="revision">{revision}</output>
      <ListBox aria-label="Records" items={items} selectionMode="multiple" className="list">
        {item => (
          <ListBoxItem id={item.id} data-record={item.id} textValue={item.name}>
            <strong>{item.name}</strong>
            <span>
              {item.owner} · {item.status}
            </span>
          </ListBoxItem>
        )}
      </ListBox>
    </>
  );
}

function ComboFixture() {
  let [query, setQuery] = useState('');
  let filtered = items.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <ComboBox inputValue={query} onInputChange={setQuery} items={filtered} menuTrigger="manual">
      <Label>Find a record</Label>
      <div className="combo-input">
        <Input id="combo-input" />
        <Button id="combo-open">Show records</Button>
      </div>
      <output id="query">{query}</output>
      <Popover className="combo-popover">
        <ListBox aria-label="Matching records" className="list">
          {(item: (typeof items)[number]) => (
            <ListBoxItem id={item.id} textValue={item.name}>
              {item.name}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </ComboBox>
  );
}

function TableFixture() {
  let [rows, setRows] = useState(items);
  return (
    <>
      <Button
        id="edit-record"
        onPress={() =>
          setRows(rows => rows.map((row, i) => (i === 2 ? {...row, name: 'Updated record'} : row)))
        }>
        Update third record
      </Button>
      <Virtualizer layout={TableLayout} layoutOptions={{rowHeight: 40, headingHeight: 40}}>
        <Table
          aria-label="Records"
          className="table"
          selectionMode="multiple"
          data-bench="records-table">
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
          <TableBody items={rows}>
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
          </TableBody>
        </Table>
      </Virtualizer>
    </>
  );
}

function FormFixture() {
  let [name, setName] = useState('');
  return (
    <>
      <div className="form-grid">
        {items.map((item, i) =>
          i % 3 === 0 ? (
            <TextField
              key={item.id}
              value={i === 0 ? name : undefined}
              onChange={i === 0 ? setName : undefined}>
              <Label>{i === 0 ? 'Project name' : `Project field ${i}`}</Label>
              <Input id={i === 0 ? 'project-name' : undefined} />
            </TextField>
          ) : i % 3 === 1 ? (
            <Checkbox key={item.id}>
              <span className="check" />
              Include team {i}
            </Checkbox>
          ) : (
            <Switch key={item.id}>
              <span className="check" />
              Notify team {i}
            </Switch>
          )
        )}
      </div>
      <output id="project-value">{name}</output>
      <DialogTrigger>
        <Button id="dialog-open">Review project</Button>
        <ModalOverlay>
          <Modal>
            <Dialog>
              <Heading slot="title">Review project</Heading>
              <p>Confirm the project settings before continuing.</p>
              <TextField autoFocus>
                <Label>Review note</Label>
                <Input id="review-note" />
              </TextField>
              <Button slot="close">Close</Button>
            </Dialog>
          </Modal>
        </ModalOverlay>
      </DialogTrigger>
    </>
  );
}

// Keep the table element stable so resizing exercises the container's ResizeObserver
// and context updates, without also replacing the table's children from its parent.
const resizableTable = (
  <Table aria-label="Resizable records" className="resizable-table" selectionMode="multiple">
    <TableHeader>
      {['name', 'owner', 'status', 'amount', 'date', 'category'].map(key => (
        <Column key={key} id={key} isRowHeader={key === 'name'} width="1fr" minWidth={0}>
          {key}
        </Column>
      ))}
    </TableHeader>
    <TableBody items={items}>
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
    </TableBody>
  </Table>
);

function ResizeFixture() {
  let [narrow, setNarrow] = useState(false);
  return (
    <>
      <Button id="resize-container" onPress={() => setNarrow(true)}>
        Open side panel
      </Button>
      <ResizableTableContainer className="resize-container" style={{width: narrow ? 660 : 960}}>
        {resizableTable}
      </ResizableTableContainer>
    </>
  );
}

function App() {
  let [mounted, setMounted] = useState(false);
  return (
    <main>
      <header>
        <p>React Aria · production benchmark</p>
        <h1>{fixture}</h1>
        <Button
          id="mount"
          onPress={() => withCalibration(() => setMounted(true))}
          isDisabled={mounted}>
          Show fixture
        </Button>
      </header>
      <section id="fixture" data-mounted={mounted}>
        {mounted &&
          (fixture === 'listbox' ? (
            <ListFixture />
          ) : fixture === 'combobox' ? (
            <ComboFixture />
          ) : fixture === 'table' ? (
            <TableFixture />
          ) : fixture === 'resize' ? (
            <ResizeFixture />
          ) : (
            <FormFixture />
          ))}
      </section>
    </main>
  );
}

let root = createRoot(document.getElementById('root')!);
let revision = 0;
const bench = {
  ...measurement,
  info: {production: process.env.NODE_ENV === 'production', react: React.version, fixture, size},
  async reset() {
    measurement.clear();
    root.render(<App key={++revision} />);
    await new Promise<void>(resolve =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );
  }
};

declare global {
  interface Window {
    __bench: typeof bench;
  }
}
window.__bench = bench;
bench.reset();
