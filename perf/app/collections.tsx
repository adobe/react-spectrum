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
  Dialog,
  DialogTrigger,
  Heading,
  Input,
  Key,
  Label,
  ListBox,
  ListBoxItem,
  ListLayout,
  Menu,
  MenuItem,
  MenuTrigger,
  Modal,
  ModalOverlay,
  Popover,
  Row,
  Select,
  SelectValue,
  SortDescriptor,
  Table,
  TableBody,
  TableHeader,
  Text,
  TextField,
  Virtualizer
} from 'react-aria-components';
import React, {ReactNode, useMemo, useState} from 'react';

interface RecordItem {
  id: string;
  index: number;
  name: string;
  owner: string;
  status: string;
  amount: string;
  date: string;
  category: string;
}

export function OptionContent({item}: {item: RecordItem}) {
  return (
    <div className="option-content">
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M3 4h7l2 3h9v13H3z" />
      </svg>
      <div>
        <Text slot="label">{item.name}</Text>
        <Text slot="description">
          {item.owner} · {item.status}
        </Text>
      </div>
    </div>
  );
}

// Large option lists are virtualized with fixed-height rows, as applications would.
export function OptionList({virtualized, children}: {virtualized: boolean; children: ReactNode}) {
  return virtualized ? (
    <Virtualizer layout={ListLayout} layoutOptions={{rowHeight: 52}}>
      {children}
    </Virtualizer>
  ) : (
    children
  );
}

export function SelectFixture({
  items,
  virtualized = false
}: {
  items: RecordItem[];
  virtualized?: boolean;
}) {
  // Controlled, as an application form would be, so choosing re-renders the owner.
  let [value, setValue] = useState<Key | null>(null);
  return (
    <Select placeholder="Choose a record" value={value} onChange={setValue}>
      <Label>Choose a record</Label>
      <Button id="select-open">
        <SelectValue />
      </Button>
      <output id="select-value">{value}</output>
      <Popover className="combo-popover">
        <OptionList virtualized={virtualized}>
          <ListBox aria-label="Available records" className="list" items={items}>
            {item => (
              <ListBoxItem id={item.id} data-record={item.id} textValue={item.name}>
                <OptionContent item={item} />
              </ListBoxItem>
            )}
          </ListBox>
        </OptionList>
      </Popover>
    </Select>
  );
}

export function DataTableFixture({items}: {items: RecordItem[]}) {
  let [query, setQuery] = useState('');
  let [sort, setSort] = useState<SortDescriptor>({column: 'name', direction: 'ascending'});
  // Sorting and filtering preserve record identities, as a local data view would.
  let rows = useMemo(
    () =>
      items
        .filter(item => item.name.includes(query))
        .sort((a, b) => (a.index - b.index) * (sort.direction === 'ascending' ? 1 : -1)),
    [items, query, sort]
  );
  return (
    <>
      <TextField value={query} onChange={setQuery}>
        <Label>Filter records</Label>
        <Input id="table-filter" />
      </TextField>
      <div className="data-table-container">
        <Table
          aria-label="Sortable records"
          className="data-table"
          sortDescriptor={sort}
          onSortChange={setSort}>
          <TableHeader>
            <Column id="name" isRowHeader allowsSorting data-bench="sort-name">
              {({sortDirection}) => <>Name {sortDirection === 'ascending' ? '↑' : '↓'}</>}
            </Column>
            <Column>Team</Column>
            <Column>Status</Column>
            <Column>Amount</Column>
            <Column>Updated</Column>
            <Column>Category</Column>
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
      </div>
    </>
  );
}

export function CellTableFixture({items}: {items: RecordItem[]}) {
  return (
    <div className="data-table-container">
      <Table aria-label="Interactive records" className="data-table" selectionMode="multiple">
        <TableHeader>
          <Column>
            <Checkbox slot="selection" aria-label="Select all records">
              <span className="check" />
            </Checkbox>
          </Column>
          <Column isRowHeader>Name</Column>
          <Column>Team</Column>
          <Column>Status</Column>
          <Column>Actions</Column>
          <Column>Review</Column>
        </TableHeader>
        <TableBody items={items}>
          {row => (
            <Row id={row.id} data-record={row.id}>
              <Cell>
                <Checkbox slot="selection" aria-label={`Select ${row.name}`}>
                  <span className="check" />
                </Checkbox>
              </Cell>
              <Cell>{row.name}</Cell>
              <Cell>{row.owner}</Cell>
              <Cell>{row.status}</Cell>
              <Cell>
                <MenuTrigger>
                  <Button id={`menu-${row.id}`} aria-label={`Actions for ${row.name}`}>
                    Actions
                  </Button>
                  <Popover className="action-popover">
                    <Menu aria-label={`Actions for ${row.name}`} autoFocus="first">
                      <MenuItem id="edit" data-action="edit">
                        Edit record
                      </MenuItem>
                      <MenuItem id="archive">Archive record</MenuItem>
                    </Menu>
                  </Popover>
                </MenuTrigger>
              </Cell>
              <Cell>
                <DialogTrigger>
                  <Button id={`dialog-${row.id}`} aria-label={`Review ${row.name}`}>
                    Review
                  </Button>
                  <ModalOverlay>
                    <Modal>
                      <Dialog>
                        <Heading slot="title">Review {row.name}</Heading>
                        <TextField autoFocus>
                          <Label>Review note</Label>
                          <Input id={`note-${row.id}`} />
                        </TextField>
                        <Button slot="close" id={`close-${row.id}`}>
                          Close
                        </Button>
                      </Dialog>
                    </Modal>
                  </ModalOverlay>
                </DialogTrigger>
              </Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
