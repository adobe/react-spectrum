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

import {Cell, Column, Row, TableBody, TableHeader, TableView} from '../src/TableView';
import {expect, it} from 'vitest';
import {ListView, ListViewItem} from '../src/ListView';
import {page, userEvent} from 'vitest/browser';
import React from 'react';
import {render} from './utils/render';
import {Text} from '../src/Content';
import {TreeView, TreeViewItem, TreeViewItemContent} from '../src/TreeView';
import {useDragAndDrop} from '../src/useDragAndDrop';

function Example({
  component,
  pointerDragSource,
  selectionMode = 'none'
}: {
  component: 'ListView' | 'TableView' | 'TreeView';
  pointerDragSource: 'item' | 'handle';
  selectionMode?: 'none' | 'multiple';
}) {
  let {dragAndDropHooks} = useDragAndDrop({
    pointerDragSource,
    getItems: keys => [...keys].map(key => ({'text/plain': String(key)}))
  });
  let content = <input aria-label="Notes" />;
  return (
    <div style={{width: 400}}>
      {component === 'ListView' && (
        <ListView
          aria-label="Source"
          dragAndDropHooks={dragAndDropHooks}
          selectionMode={selectionMode}>
          <ListViewItem id="cat" textValue="Cat">
            <Text>Cat {content}</Text>
          </ListViewItem>
        </ListView>
      )}
      {component === 'TreeView' && (
        <TreeView
          aria-label="Source"
          dragAndDropHooks={dragAndDropHooks}
          selectionMode={selectionMode}>
          <TreeViewItem id="cat" textValue="Cat">
            <TreeViewItemContent>
              <Text>Cat {content}</Text>
            </TreeViewItemContent>
          </TreeViewItem>
        </TreeView>
      )}
      {component === 'TableView' && (
        <TableView
          aria-label="Source"
          dragAndDropHooks={dragAndDropHooks}
          selectionMode={selectionMode}>
          <TableHeader>
            <Column isRowHeader>Name</Column>
            <Column>Notes</Column>
          </TableHeader>
          <TableBody>
            <Row id="cat" textValue="Cat">
              <Cell>Cat</Cell>
              <Cell>{content}</Cell>
            </Row>
          </TableBody>
        </TableView>
      )}
      <button>After</button>
    </div>
  );
}

it.each(['ListView', 'TableView', 'TreeView'] as const)(
  '%s reveals handle-only dragging on row hover and keyboard focus within editable content',
  async component => {
    await render(<Example component={component} pointerDragSource="handle" />);
    let handle = page.getByRole('button', {name: /^Drag /});
    let input = page.getByRole('textbox', {name: 'Notes'});
    let isHidden = () => getComputedStyle(handle.element()).opacity === '0';
    await userEvent.click(page.getByRole('button', {name: 'After'}));
    await expect.poll(isHidden).toBe(true);
    await userEvent.hover(input);
    await expect.poll(isHidden).toBe(false);
    await userEvent.hover(page.getByRole('button', {name: 'After'}));
    await expect.poll(isHidden).toBe(true);
    await userEvent.tab();
    input.element().focus();
    await expect.poll(isHidden).toBe(false);
    await userEvent.click(page.getByRole('button', {name: 'After'}));
    await expect.poll(isHidden).toBe(true);
  }
);

it.each(['ListView', 'TableView', 'TreeView'] as const)(
  '%s keeps the drag handle visible for selected items until deselected',
  async component => {
    await render(
      <Example component={component} pointerDragSource="handle" selectionMode="multiple" />
    );
    let row = page.getByRole('row').last();
    let checkbox = row.getByRole('checkbox');
    let handle = page.getByRole('button', {name: /^Drag /});
    let after = page.getByRole('button', {name: 'After'});
    let isHidden = () => getComputedStyle(handle.element()).opacity === '0';
    await userEvent.click(after);
    await expect.poll(isHidden).toBe(true);

    checkbox.element().focus();
    await userEvent.keyboard(' ');
    await expect.element(row).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(after);
    await expect.poll(isHidden).toBe(false);

    checkbox.element().focus();
    await userEvent.keyboard(' ');
    await expect.element(row).toHaveAttribute('aria-selected', 'false');
    await userEvent.click(after);
    await expect.poll(isHidden).toBe(true);
  }
);

it.each(['ListView', 'TableView', 'TreeView'] as const)(
  '%s keeps the handle hidden on hover and selection when dragging from the whole item',
  async component => {
    await render(
      <Example component={component} pointerDragSource="item" selectionMode="multiple" />
    );
    let row = page.getByRole('row').last();
    row.getByRole('checkbox').element().focus();
    await userEvent.keyboard(' ');
    await expect.element(row).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(page.getByRole('button', {name: 'After'}));
    await userEvent.hover(page.getByRole('textbox', {name: 'Notes'}));
    let handle = page.getByRole('button', {name: /^Drag /});
    await expect.poll(() => getComputedStyle(handle.element()).clipPath).not.toBe('none');
  }
);
