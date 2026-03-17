/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, pointerMap, render, within} from '@react-spectrum/test-utils-internal';
import {Cell as AriaCell, Button, Collection, Column, composeRenderProps, Row, Table, TableBody, TableHeader, useDragAndDrop, useTreeData} from '../src';
import React from 'react';
import {User} from '@react-aria/test-utils';
import userEvent from '@testing-library/user-event';

export function Cell(props) {
  return (
    <AriaCell {...props}>
      {composeRenderProps(props.children, (children, {hasChildItems, isTreeColumn}) => (<>
        {isTreeColumn && hasChildItems &&
          <Button slot="chevron">&gt;</Button>
        }
        {children}
      </>))}
    </AriaCell>
  );
}

function Example(props) {
  return (
    <Table data-testid="treeble" aria-label="Files" treeColumn="name" {...props}>
      <TableHeader>
        <Column id="name" isRowHeader>Name</Column>
        <Column id="type">Type</Column>
        <Column id="date">Date Modified</Column>
      </TableHeader>
      <TableBody>
        <Row id="games">
          <Cell>Games</Cell>
          <Cell>Folder</Cell>
          <Cell>6/7/2023</Cell>
          <Row id="mario">
            <Cell>Mario Kart</Cell>
            <Cell>Game</Cell>
            <Cell>8/27/1992</Cell>
          </Row>
          <Row id="tetris">
            <Cell>Tetris</Cell>
            <Cell>Game</Cell>
            <Cell>1/27/1988</Cell>
          </Row>
          <Row id="pacman">
            <Cell>Pac-Man</Cell>
            <Cell>Game</Cell>
            <Cell>5/22/1980</Cell>
          </Row>
        </Row>
        <Row id="apps">
          <Cell>Applications</Cell>
          <Cell>Folder</Cell>
          <Cell>4/7/2025</Cell>
          <Row id="ps">
            <Cell>Photoshop</Cell>
            <Cell>Application</Cell>
            <Cell>2/19/1990</Cell>
          </Row>
          <Row id="premiere">
            <Cell>Premiere</Cell>
            <Cell>Application</Cell>
            <Cell>9/24/2003</Cell>
          </Row>
          <Row id="lightroom">
            <Cell>Lightroom</Cell>
            <Cell>Application</Cell>
            <Cell>10/18/2017</Cell>
          </Row>
        </Row>
        <Row id="report">
          <Cell>2024 Financial Report</Cell>
          <Cell>PDF Document</Cell>
          <Cell>12/30/2024</Cell>
        </Row>
        <Row id="job">
          <Cell>Job Posting</Cell>
          <Cell>Text Document</Cell>
          <Cell>1/18/2025</Cell>
        </Row>
      </TableBody>
    </Table>
  );
}

function ReorderableTreeble(props) {
  let tree = useTreeData({
    initialItems: [
      {id: '1', title: 'Documents', type: 'Directory', date: '10/20/2025', children: [
        {id: '2', title: 'Project', type: 'Directory', date: '8/2/2025', children: [
          {id: '3', title: 'Weekly Report', type: 'File', date: '7/10/2025', children: []},
          {id: '4', title: 'Budget', type: 'File', date: '8/20/2025', children: []}
        ]}
      ]},
      {id: '5', title: 'Photos', type: 'Directory', date: '2/3/2026', children: [
        {id: '6', title: 'Image 1', type: 'File', date: '1/23/2026', children: []},
        {id: '7', title: 'Image 2', type: 'File', date: '2/3/2026', children: []}
      ]}
    ]
  });

  let {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys, items) => items.map(item => ({'text/plain': item.value.title})),
    onMove(e) {
      if (e.target.dropPosition === 'before') {
        tree.moveBefore(e.target.key, e.keys);
      } else if (e.target.dropPosition === 'after') {
        tree.moveAfter(e.target.key, e.keys);
      } else if (e.target.dropPosition === 'on') {
        // Move items to become children of the target
        let targetNode = tree.getItem(e.target.key);
        if (targetNode) {
          let targetIndex = targetNode.children ? targetNode.children.length : 0;
          let keyArray = Array.from(e.keys);
          for (let i = 0; i < keyArray.length; i++) {
            tree.move(keyArray[i], e.target.key, targetIndex + i);
          }
        }
      }
    }
  });

  return (
    <Table
      aria-label="Files"
      selectionMode="multiple"
      treeColumn="name"
      defaultExpandedKeys={['5']}
      dragAndDropHooks={dragAndDropHooks}
      {...props}>
      <TableHeader>
        <Column />
        <Column id="name" isRowHeader>Name</Column>
        <Column id="type">Type</Column>
        <Column id="date">Date Modified</Column>
      </TableHeader>
      <TableBody items={tree.items}>
        {function renderItem(item) {
          return (
            <Row id={item.key} textValue={item.value.title}>
              <Cell><Button slot="drag" /></Cell>
              <Cell>{item.value.title}</Cell>
              <Cell>{item.value.type}</Cell>
              <Cell>{item.value.date}</Cell>
              {item.children && <Collection items={item.children}>
                {renderItem}
              </Collection>}
            </Row>
          );
        }}
      </TableBody>
    </Table>
  );
}

describe('Treeble', () => {
  let utils = new User();
  let user;

  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
    jest.useFakeTimers();
  });

  it('renders a treegrid', () => {
    let tree = render(<Example />);
    let tester = utils.createTester('Table', {root: tree.getByTestId('treeble')});

    expect(tester.table).toHaveAttribute('role', 'treegrid');

    expect(tester.rows).toHaveLength(4);
    expect(tester.rows[0]).toHaveAttribute('aria-expanded', 'false');
    expect(tester.rows[0]).toHaveAttribute('aria-level', '1');
    expect(tester.rows[0]).toHaveAttribute('aria-posinset', '1');
    expect(tester.rows[0]).toHaveAttribute('aria-setsize', '4');
    expect(tester.rows[0]).not.toHaveAttribute('data-expanded');
    expect(tester.rows[0]).toHaveAttribute('data-has-child-items', 'true');
    expect(tester.rows[0]).toHaveAttribute('data-level', '1');
    expect(tester.rows[0]).toHaveAttribute('style', '--table-row-level: 1;');
    expect(tester.rowHeaders[0]).toHaveTextContent('Games');
    expect(tester.rowHeaders[0]).toHaveAttribute('data-tree-column');
    for (let cell of tester.cells()) {
      expect(cell).not.toHaveAttribute('data-tree-column');
    }
    for (let cell of tester.cells({element: tester.rows[0]})) {
      expect(cell).not.toHaveAttribute('data-expanded');
      expect(cell).toHaveAttribute('data-has-child-items', 'true');
      expect(cell).toHaveAttribute('data-level', '1');
    }

    let button = within(tester.rowHeaders[0]).getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Expand');
    expect(button).toHaveAttribute('aria-labelledby', `${button.id} ${tester.rowHeaders[0].id}`);
    expect(button).toHaveAttribute('tabindex', '-1');

    expect(tester.rows[1]).toHaveAttribute('aria-expanded', 'false');
    expect(tester.rows[1]).toHaveAttribute('aria-level', '1');
    expect(tester.rows[1]).toHaveAttribute('aria-posinset', '2');
    expect(tester.rows[1]).toHaveAttribute('aria-setsize', '4');
    expect(tester.rows[1]).not.toHaveAttribute('data-expanded');
    expect(tester.rows[1]).toHaveAttribute('data-has-child-items', 'true');
    expect(tester.rows[1]).toHaveAttribute('data-level', '1');
    expect(tester.rows[1]).toHaveAttribute('style', '--table-row-level: 1;');
    expect(tester.rowHeaders[1]).toHaveTextContent('Applications');

    expect(tester.rows[2]).not.toHaveAttribute('aria-expanded');
    expect(tester.rows[2]).toHaveAttribute('aria-level', '1');
    expect(tester.rows[2]).toHaveAttribute('aria-posinset', '3');
    expect(tester.rows[2]).toHaveAttribute('aria-setsize', '4');
    expect(tester.rows[2]).not.toHaveAttribute('data-expanded');
    expect(tester.rows[2]).not.toHaveAttribute('data-has-child-items');
    expect(tester.rows[2]).toHaveAttribute('data-level', '1');
    expect(tester.rows[2]).toHaveAttribute('style', '--table-row-level: 1;');
    expect(tester.rowHeaders[2]).toHaveTextContent('2024 Financial Report');

    expect(tester.rows[3]).not.toHaveAttribute('aria-expanded');
    expect(tester.rows[3]).toHaveAttribute('aria-level', '1');
    expect(tester.rows[3]).toHaveAttribute('aria-posinset', '4');
    expect(tester.rows[3]).toHaveAttribute('aria-setsize', '4');
    expect(tester.rows[3]).not.toHaveAttribute('data-expanded');
    expect(tester.rows[3]).not.toHaveAttribute('data-has-child-items');
    expect(tester.rows[3]).toHaveAttribute('data-level', '1');
    expect(tester.rows[3]).toHaveAttribute('style', '--table-row-level: 1;');
    expect(tester.rowHeaders[3]).toHaveTextContent('Job Posting');
  });

  it.each(['mouse', 'touch', 'keyboard'])('should expand a row with %s', async (interactionType) => {
    let tree = render(<Example />);
    let tester = utils.createTester('Table', {root: tree.getByTestId('treeble')});

    await tester.toggleRowExpansion({row: 0, interactionType});

    expect(tester.rows).toHaveLength(7);
    expect(tester.rows[0]).toHaveAttribute('aria-expanded', 'true');
    expect(tester.rows[0]).toHaveAttribute('aria-level', '1');
    expect(tester.rows[0]).toHaveAttribute('aria-posinset', '1');
    expect(tester.rows[0]).toHaveAttribute('aria-setsize', '4');
    expect(tester.rows[0]).toHaveAttribute('data-expanded', 'true');
    expect(tester.rows[0]).toHaveAttribute('data-has-child-items', 'true');
    expect(tester.rows[0]).toHaveAttribute('data-level', '1');
    expect(tester.rows[0]).toHaveAttribute('style', '--table-row-level: 1;');
    expect(tester.rowHeaders[0]).toHaveTextContent('Games');
    for (let cell of tester.cells({element: tester.rows[0]})) {
      expect(cell).toHaveAttribute('data-expanded');
      expect(cell).toHaveAttribute('data-has-child-items', 'true');
      expect(cell).toHaveAttribute('data-level', '1');
    }

    expect(tester.rows[1]).not.toHaveAttribute('aria-expanded');
    expect(tester.rows[1]).toHaveAttribute('aria-level', '2');
    expect(tester.rows[1]).toHaveAttribute('aria-posinset', '1');
    expect(tester.rows[1]).toHaveAttribute('aria-setsize', '3');
    expect(tester.rows[1]).toHaveAttribute('style', '--table-row-level: 2;');
    expect(tester.rowHeaders[1]).toHaveTextContent('Mario Kart');

    expect(tester.rows[2]).not.toHaveAttribute('aria-expanded');
    expect(tester.rows[2]).toHaveAttribute('aria-level', '2');
    expect(tester.rows[2]).toHaveAttribute('aria-posinset', '2');
    expect(tester.rows[2]).toHaveAttribute('aria-setsize', '3');
    expect(tester.rows[2]).toHaveAttribute('style', '--table-row-level: 2;');
    expect(tester.rowHeaders[2]).toHaveTextContent('Tetris');

    expect(tester.rows[3]).not.toHaveAttribute('aria-expanded');
    expect(tester.rows[3]).toHaveAttribute('aria-level', '2');
    expect(tester.rows[3]).toHaveAttribute('aria-posinset', '3');
    expect(tester.rows[3]).toHaveAttribute('aria-setsize', '3');
    expect(tester.rows[3]).toHaveAttribute('style', '--table-row-level: 2;');
    expect(tester.rowHeaders[3]).toHaveTextContent('Pac-Man');

    expect(tester.rows[4]).toHaveAttribute('aria-expanded', 'false');
    expect(tester.rows[4]).toHaveAttribute('aria-level', '1');
    expect(tester.rows[4]).toHaveAttribute('aria-posinset', '2');
    expect(tester.rows[4]).toHaveAttribute('aria-setsize', '4');
    expect(tester.rows[4]).toHaveAttribute('style', '--table-row-level: 1;');
    expect(tester.rowHeaders[4]).toHaveTextContent('Applications');

    expect(tester.rows[5]).not.toHaveAttribute('aria-expanded');
    expect(tester.rows[5]).toHaveAttribute('aria-level', '1');
    expect(tester.rows[5]).toHaveAttribute('aria-posinset', '3');
    expect(tester.rows[5]).toHaveAttribute('aria-setsize', '4');
    expect(tester.rows[5]).toHaveAttribute('style', '--table-row-level: 1;');
    expect(tester.rowHeaders[5]).toHaveTextContent('2024 Financial Report');

    await tester.toggleRowExpansion({row: 0, interactionType});
    expect(tester.rows).toHaveLength(4);
  });

  it('should support defaultExpandedKeys', async () => {
    let onExpandedChange = jest.fn();
    let tree = render(<Example defaultExpandedKeys={['games']} onExpandedChange={onExpandedChange} />);
    let tester = utils.createTester('Table', {root: tree.getByTestId('treeble')});

    expect(tester.rows).toHaveLength(7);
    expect(tester.rows[0]).toHaveAttribute('aria-expanded', 'true');
    expect(tester.rows[0]).toHaveAttribute('aria-level', '1');
    expect(tester.rows[0]).toHaveAttribute('aria-posinset', '1');
    expect(tester.rows[0]).toHaveAttribute('aria-setsize', '4');

    expect(tester.rowHeaders[0]).toHaveTextContent('Games');

    expect(tester.rows[1]).not.toHaveAttribute('aria-expanded');
    expect(tester.rows[1]).toHaveAttribute('aria-level', '2');
    expect(tester.rows[1]).toHaveAttribute('aria-posinset', '1');
    expect(tester.rows[1]).toHaveAttribute('aria-setsize', '3');
    expect(tester.rowHeaders[1]).toHaveTextContent('Mario Kart');

    expect(tester.rows[2]).not.toHaveAttribute('aria-expanded');
    expect(tester.rows[2]).toHaveAttribute('aria-level', '2');
    expect(tester.rows[2]).toHaveAttribute('aria-posinset', '2');
    expect(tester.rows[2]).toHaveAttribute('aria-setsize', '3');
    expect(tester.rowHeaders[2]).toHaveTextContent('Tetris');

    expect(tester.rows[3]).not.toHaveAttribute('aria-expanded');
    expect(tester.rows[3]).toHaveAttribute('aria-level', '2');
    expect(tester.rows[3]).toHaveAttribute('aria-posinset', '3');
    expect(tester.rows[3]).toHaveAttribute('aria-setsize', '3');
    expect(tester.rowHeaders[3]).toHaveTextContent('Pac-Man');

    expect(tester.rows[4]).toHaveAttribute('aria-expanded', 'false');
    expect(tester.rows[4]).toHaveAttribute('aria-level', '1');
    expect(tester.rows[4]).toHaveAttribute('aria-posinset', '2');
    expect(tester.rows[4]).toHaveAttribute('aria-setsize', '4');
    expect(tester.rowHeaders[4]).toHaveTextContent('Applications');

    expect(tester.rows[5]).not.toHaveAttribute('aria-expanded');
    expect(tester.rows[5]).toHaveAttribute('aria-level', '1');
    expect(tester.rows[5]).toHaveAttribute('aria-posinset', '3');
    expect(tester.rows[5]).toHaveAttribute('aria-setsize', '4');
    expect(tester.rowHeaders[5]).toHaveTextContent('2024 Financial Report');

    await tester.toggleRowExpansion({row: 4});

    expect(onExpandedChange).toHaveBeenCalledTimes(1);
    expect(onExpandedChange).toHaveBeenCalledWith(new Set(['games', 'apps']));

    expect(tester.rows).toHaveLength(10);
    expect(tester.rows[0]).toHaveAttribute('aria-expanded', 'true');
    expect(tester.rows[0]).toHaveAttribute('aria-level', '1');
    expect(tester.rows[0]).toHaveAttribute('aria-posinset', '1');
    expect(tester.rows[0]).toHaveAttribute('aria-setsize', '4');
    expect(tester.rows[0]).toHaveAttribute('data-expanded', 'true');
    expect(tester.rows[0]).toHaveAttribute('data-has-child-items', 'true');
    expect(tester.rows[0]).toHaveAttribute('data-level', '1');
    expect(tester.rowHeaders[0]).toHaveTextContent('Games');

    expect(tester.rows[1]).not.toHaveAttribute('aria-expanded');
    expect(tester.rows[1]).toHaveAttribute('aria-level', '2');
    expect(tester.rows[1]).toHaveAttribute('aria-posinset', '1');
    expect(tester.rows[1]).toHaveAttribute('aria-setsize', '3');
    expect(tester.rowHeaders[1]).toHaveTextContent('Mario Kart');

    expect(tester.rows[2]).not.toHaveAttribute('aria-expanded');
    expect(tester.rows[2]).toHaveAttribute('aria-level', '2');
    expect(tester.rows[2]).toHaveAttribute('aria-posinset', '2');
    expect(tester.rows[2]).toHaveAttribute('aria-setsize', '3');
    expect(tester.rowHeaders[2]).toHaveTextContent('Tetris');

    expect(tester.rows[3]).not.toHaveAttribute('aria-expanded');
    expect(tester.rows[3]).toHaveAttribute('aria-level', '2');
    expect(tester.rows[3]).toHaveAttribute('aria-posinset', '3');
    expect(tester.rows[3]).toHaveAttribute('aria-setsize', '3');
    expect(tester.rowHeaders[3]).toHaveTextContent('Pac-Man');

    expect(tester.rows[4]).toHaveAttribute('aria-expanded', 'true');
    expect(tester.rows[4]).toHaveAttribute('aria-level', '1');
    expect(tester.rows[4]).toHaveAttribute('aria-posinset', '2');
    expect(tester.rows[4]).toHaveAttribute('aria-setsize', '4');
    expect(tester.rowHeaders[4]).toHaveTextContent('Applications');

    expect(tester.rows[5]).not.toHaveAttribute('aria-expanded');
    expect(tester.rows[5]).toHaveAttribute('aria-level', '2');
    expect(tester.rows[5]).toHaveAttribute('aria-posinset', '1');
    expect(tester.rows[5]).toHaveAttribute('aria-setsize', '3');
    expect(tester.rowHeaders[5]).toHaveTextContent('Photoshop');

    expect(tester.rows[6]).not.toHaveAttribute('aria-expanded');
    expect(tester.rows[6]).toHaveAttribute('aria-level', '2');
    expect(tester.rows[6]).toHaveAttribute('aria-posinset', '2');
    expect(tester.rows[6]).toHaveAttribute('aria-setsize', '3');
    expect(tester.rowHeaders[6]).toHaveTextContent('Premiere');

    expect(tester.rows[7]).not.toHaveAttribute('aria-expanded');
    expect(tester.rows[7]).toHaveAttribute('aria-level', '2');
    expect(tester.rows[7]).toHaveAttribute('aria-posinset', '3');
    expect(tester.rows[7]).toHaveAttribute('aria-setsize', '3');
    expect(tester.rowHeaders[7]).toHaveTextContent('Lightroom');

    expect(tester.rows[8]).not.toHaveAttribute('aria-expanded');
    expect(tester.rows[8]).toHaveAttribute('aria-level', '1');
    expect(tester.rows[8]).toHaveAttribute('aria-posinset', '3');
    expect(tester.rows[8]).toHaveAttribute('aria-setsize', '4');
    expect(tester.rowHeaders[8]).toHaveTextContent('2024 Financial Report');

    await tester.toggleRowExpansion({row: 4});
    expect(tester.rows).toHaveLength(7);

    expect(onExpandedChange).toHaveBeenCalledTimes(2);
    expect(onExpandedChange).toHaveBeenLastCalledWith(new Set(['games']));
  });

  it('should support expandedKeys', async () => {
    let onExpandedChange = jest.fn();
    let tree = render(<Example expandedKeys={['games']} onExpandedChange={onExpandedChange} />);
    let tester = utils.createTester('Table', {root: tree.getByTestId('treeble')});

    expect(tester.rows).toHaveLength(7);
    expect(tester.rows[0]).toHaveAttribute('aria-expanded', 'true');
    expect(tester.rows[0]).toHaveAttribute('aria-level', '1');
    expect(tester.rows[0]).toHaveAttribute('aria-posinset', '1');
    expect(tester.rows[0]).toHaveAttribute('aria-setsize', '4');
    expect(tester.rowHeaders[0]).toHaveTextContent('Games');

    expect(tester.rows[1]).not.toHaveAttribute('aria-expanded');
    expect(tester.rows[1]).toHaveAttribute('aria-level', '2');
    expect(tester.rows[1]).toHaveAttribute('aria-posinset', '1');
    expect(tester.rows[1]).toHaveAttribute('aria-setsize', '3');
    expect(tester.rowHeaders[1]).toHaveTextContent('Mario Kart');

    expect(tester.rows[2]).not.toHaveAttribute('aria-expanded');
    expect(tester.rows[2]).toHaveAttribute('aria-level', '2');
    expect(tester.rows[2]).toHaveAttribute('aria-posinset', '2');
    expect(tester.rows[2]).toHaveAttribute('aria-setsize', '3');
    expect(tester.rowHeaders[2]).toHaveTextContent('Tetris');

    expect(tester.rows[3]).not.toHaveAttribute('aria-expanded');
    expect(tester.rows[3]).toHaveAttribute('aria-level', '2');
    expect(tester.rows[3]).toHaveAttribute('aria-posinset', '3');
    expect(tester.rows[3]).toHaveAttribute('aria-setsize', '3');
    expect(tester.rowHeaders[3]).toHaveTextContent('Pac-Man');

    expect(tester.rows[4]).toHaveAttribute('aria-expanded', 'false');
    expect(tester.rows[4]).toHaveAttribute('aria-level', '1');
    expect(tester.rows[4]).toHaveAttribute('aria-posinset', '2');
    expect(tester.rows[4]).toHaveAttribute('aria-setsize', '4');
    expect(tester.rowHeaders[4]).toHaveTextContent('Applications');

    expect(tester.rows[5]).not.toHaveAttribute('aria-expanded');
    expect(tester.rows[5]).toHaveAttribute('aria-level', '1');
    expect(tester.rows[5]).toHaveAttribute('aria-posinset', '3');
    expect(tester.rows[5]).toHaveAttribute('aria-setsize', '4');
    expect(tester.rowHeaders[5]).toHaveTextContent('2024 Financial Report');

    await tester.toggleRowExpansion({row: 4});

    expect(onExpandedChange).toHaveBeenCalledTimes(1);
    expect(onExpandedChange).toHaveBeenCalledWith(new Set(['games', 'apps']));

    expect(tester.rows).toHaveLength(7); // controlled
  });

  it('supports keyboard navigation of flattened rows', async () => {
    let tree = render(<Example defaultExpandedKeys={['games']} />);
    let tester = utils.createTester('Table', {root: tree.getByTestId('treeble')});

    await user.tab();

    for (let i = 0; i < tester.rows.length; i++) {
      expect(document.activeElement).toBe(tester.rows[i]);
      await user.keyboard('{ArrowDown}');
    }

    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(tester.rows[0]);

    await user.keyboard('{End}');
    expect(document.activeElement).toBe(tester.rows[tester.rows.length - 1]);
  });

  it('supports keyboard navigation of cells', async () => {
    let tree = render(<Example />);
    let tester = utils.createTester('Table', {root: tree.getByTestId('treeble')});

    await user.tab();
    expect(document.activeElement).toBe(tester.rows[0]);
    expect(tester.rows[0]).toHaveAttribute('aria-expanded', 'false');

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tester.rows[0]);
    expect(tester.rows[0]).toHaveAttribute('aria-expanded', 'true');

    let cells = [tester.rowHeaders[0], ...tester.cells({element: tester.rows[0]})];
    for (let cell of cells) {
      await user.keyboard('{ArrowRight}');
      expect(document.activeElement).toBe(cell);
    }

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tester.rows[0]);

    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tester.rows[0]);
    expect(tester.rows[0]).toHaveAttribute('aria-expanded', 'false');

    for (let cell of cells.reverse()) {
      await user.keyboard('{ArrowLeft}');
      expect(document.activeElement).toBe(cell);
    }

    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tester.rows[0]);
  });

  it('supports selection', async () => {
    let onSelectionChange = jest.fn();
    let tree = render(<Example defaultExpandedKeys={['games']} selectionMode="multiple" onSelectionChange={k => onSelectionChange(new Set(k))} />);
    let tester = utils.createTester('Table', {root: tree.getByTestId('treeble')});

    await tester.toggleRowSelection({row: 0});
    await user.keyboard('{Shift>}');
    await user.click(tester.rows[2]);
    await user.keyboard('{/Shift}');

    expect(onSelectionChange).toHaveBeenCalledTimes(2);
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(['games', 'mario', 'tetris']));
  });

  it('should support drag and drop', async () => {
    let tree = render(<ReorderableTreeble />);
    let tester = utils.createTester('Table', {root: tree.getByRole('treegrid')});

    await user.tab();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{Enter}');
    act(() => jest.runAllTimers());

    expect(tree.getAllByRole('button').map(r => r.getAttribute('aria-label'))).toEqual([
      'Insert before Documents',
      'Drop on Documents',
      'Insert between Documents and Photos',
      'Drop on Photos',
      'Insert before Image 1',
      'Drop on Image 1',
      'Insert between Image 1 and Image 2',
      'Drag Image 2',
      'Insert after Image 2',
      'Insert after Photos'
    ]);

    await user.keyboard('{ArrowUp}');
    await user.keyboard('{ArrowUp}');
    await user.keyboard('{ArrowUp}');
    await user.keyboard('{ArrowUp}');
    await user.keyboard('{ArrowUp}');
    await user.keyboard('{ArrowUp}');
    await user.keyboard('{ArrowRight}');

    expect(tree.getAllByRole('button').map(r => r.getAttribute('aria-label'))).toEqual([
      'Insert before Documents',
      'Drop on Documents',
      'Insert before Project',
      'Drop on Project',
      'Insert after Project',
      'Insert between Documents and Photos',
      'Drop on Photos',
      'Insert before Image 1',
      'Drop on Image 1',
      'Insert between Image 1 and Image 2',
      'Drag Image 2',
      'Insert after Image 2',
      'Insert after Photos'
    ]);

    await user.keyboard('{Enter}');
    act(() => jest.runAllTimers());

    expect(tester.rowHeaders.map(r => r.textContent)).toEqual([
      '>Documents',
      '>Project',
      'Image 2',
      '>Photos',
      'Image 1'
    ]);
  });

  it('should properly walk through nested levels of drop positioning', async () => {
    render(<ReorderableTreeble defaultExpandedKeys={['1', '2']} />);
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{Enter}');
    act(() => jest.runAllTimers());
    expect(document.activeElement).toHaveAttribute('aria-label', 'Insert after Budget');

    await user.keyboard('{ArrowDown}');
    act(() => jest.runAllTimers());
    expect(document.activeElement).toHaveAttribute('aria-label', 'Insert after Project');

    await user.keyboard('{ArrowDown}');
    act(() => jest.runAllTimers());
    expect(document.activeElement).toHaveAttribute('aria-label', 'Insert between Documents and Photos');

    await user.keyboard('{ArrowDown}');
    act(() => jest.runAllTimers());
    expect(document.activeElement).toHaveAttribute('aria-label', 'Drop on Photos');

    await user.keyboard('{ArrowUp}');
    act(() => jest.runAllTimers());
    expect(document.activeElement).toHaveAttribute('aria-label', 'Insert between Documents and Photos');

    await user.keyboard('{ArrowUp}');
    act(() => jest.runAllTimers());
    expect(document.activeElement).toHaveAttribute('aria-label', 'Insert after Project');

    await user.keyboard('{ArrowUp}');
    act(() => jest.runAllTimers());
    expect(document.activeElement).toHaveAttribute('aria-label', 'Insert after Budget');

    await user.keyboard('{ArrowUp}');
    act(() => jest.runAllTimers());
    expect(document.activeElement).toHaveAttribute('aria-label', 'Insert between Weekly Report and Budget');

    await user.keyboard('{ArrowUp}');
    act(() => jest.runAllTimers());
    expect(document.activeElement).toHaveAttribute('aria-label', 'Drop on Weekly Report');

    await user.keyboard('{ArrowUp}');
    act(() => jest.runAllTimers());
    expect(document.activeElement).toHaveAttribute('aria-label', 'Insert before Weekly Report');

    await user.keyboard('{ArrowUp}');
    act(() => jest.runAllTimers());
    expect(document.activeElement).toHaveAttribute('aria-label', 'Drop on Project');

    await user.keyboard('{ArrowUp}');
    act(() => jest.runAllTimers());
    expect(document.activeElement).toHaveAttribute('aria-label', 'Insert before Project');

    await user.keyboard('{ArrowUp}');
    act(() => jest.runAllTimers());
    expect(document.activeElement).toHaveAttribute('aria-label', 'Drop on Documents');

    await user.keyboard('{ArrowUp}');
    act(() => jest.runAllTimers());
    expect(document.activeElement).toHaveAttribute('aria-label', 'Insert before Documents');
  });
});
