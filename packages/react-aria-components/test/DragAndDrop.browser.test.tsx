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

import {Button} from '../src/Button';
import {Cell, Column, Row, Table, TableBody, TableHeader} from '../src/Table';
import {expect, it, vi} from 'vitest';
import {GridList, GridListItem} from '../src/GridList';
import {page, server, userEvent} from 'vitest/browser';
import React from 'react';
import {render} from 'vitest-browser-react';
import {Tree, TreeItem, TreeItemContent} from '../src/Tree';
import {useDragAndDrop} from '../src/useDragAndDrop';
// Include the starter styles to exercise native dragging with their CSS reset.
import '../../../starters/docs/src/GridList.css';
import '../../../starters/docs/src/Table.css';
import '../../../starters/docs/src/Tree.css';

it.each(['GridList', 'Table', 'Tree'])('should drag from styled %s handles', async component => {
  let onDragStart = vi.fn();
  let onDragEnd = vi.fn();
  let onRootDrop = vi.fn();
  let onDropEnter = vi.fn();
  function Example() {
    let {dragAndDropHooks} = useDragAndDrop({
      pointerDragSource: 'dragButton',
      getItems: keys => [...keys].map(key => ({'text/plain': String(key)})),
      getAllowedDropOperations: () => ['copy'],
      onDragStart,
      onDragEnd
    });
    let {dragAndDropHooks: dropHooks} = useDragAndDrop({onRootDrop, onDropEnter});
    let dragButton = (
      <Button slot="drag" className={component === 'Table' ? 'drag-button' : undefined}>
        ≡
      </Button>
    );
    let source;
    if (component === 'GridList') {
      source = (
        <GridList aria-label="Source" layout="grid" dragAndDropHooks={dragAndDropHooks}>
          <GridListItem id="cat" textValue="Cat">
            {dragButton}
            Cat
          </GridListItem>
        </GridList>
      );
    } else if (component === 'Table') {
      source = (
        <Table aria-label="Source" dragAndDropHooks={dragAndDropHooks}>
          <TableHeader>
            <Column />
            <Column isRowHeader>Name</Column>
          </TableHeader>
          <TableBody>
            <Row id="cat" textValue="Cat">
              <Cell>{dragButton}</Cell>
              <Cell>Cat</Cell>
            </Row>
          </TableBody>
        </Table>
      );
    } else {
      source = (
        <Tree aria-label="Source" dragAndDropHooks={dragAndDropHooks}>
          <TreeItem id="cat" textValue="Cat">
            <TreeItemContent>
              {dragButton}
              Cat
            </TreeItemContent>
          </TreeItem>
        </Tree>
      );
    }
    return (
      <div style={{width: 400}}>
        {source}
        <GridList
          aria-label="Target"
          dragAndDropHooks={dropHooks}
          renderEmptyState={() => 'Drop here'}
          style={{marginTop: 40}}>
          {[]}
        </GridList>
      </div>
    );
  }

  await render(<Example />);
  let button = page.getByRole('button', {name: /^Drag /});
  expect(getComputedStyle(button.element()).cursor).toBe('grab');

  await server.commands.mouseDownOnElement('button[slot="drag"]');
  try {
    await expect.element(button).toHaveAttribute('data-pressed');
    expect(getComputedStyle(button.element()).cursor).toBe('grabbing');
  } finally {
    await server.commands.mouseUp();
  }
  await expect.element(button).not.toHaveAttribute('data-pressed');
  expect(getComputedStyle(button.element()).cursor).toBe('grab');
  expect(onDragStart).not.toHaveBeenCalled();

  onDropEnter.mockImplementation(() => ({
    cursor: getComputedStyle(button.element()).cursor,
    isPressed: button.element().hasAttribute('data-pressed')
  }));
  await userEvent.dragAndDrop(button, page.getByRole('grid', {name: 'Target'}));
  // Reset WebKit's pointer state after the native drag before the next test.
  await server.commands.mouseUp();
  expect(onDragStart).toHaveBeenCalledTimes(1);
  expect(onDragStart).toHaveBeenCalledWith(expect.objectContaining({keys: new Set(['cat'])}));
  await expect.poll(() => onRootDrop).toHaveBeenCalledTimes(1);
  expect(onDropEnter).toHaveReturnedWith({cursor: 'grabbing', isPressed: false});
  expect(await onRootDrop.mock.calls[0][0].items[0].getText('text/plain')).toBe('cat');
  await expect.poll(() => onDragEnd).toHaveBeenCalledTimes(1);
  expect(onDragEnd).toHaveBeenCalledWith(expect.objectContaining({dropOperation: 'copy'}));
  expect(getComputedStyle(button.element()).cursor).toBe('grab');
});
