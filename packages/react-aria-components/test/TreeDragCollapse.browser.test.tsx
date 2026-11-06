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

import {afterEach, expect, it, vi} from 'vitest';
import {Button} from '../src/Button';
import {Collection} from 'react-aria/Collection';
import {DraggableCollectionEndEvent} from '@react-types/shared';
import {page, userEvent} from 'vitest/browser';
import React, {StrictMode} from 'react';
import {render} from 'vitest-browser-react';
import {Text} from '../src/Text';
import {Tree, TreeItem, TreeItemContent} from '../src/Tree';
import {TreeData, useTreeData} from 'react-stately/useTreeData';
import {useDragAndDrop} from '../src/useDragAndDrop';

type Item = {id: string; name: string; childItems?: Item[]};

function renderItem(item: TreeData<Item>['items'][number]) {
  return (
    <TreeItem id={item.key} textValue={item.value.name}>
      <TreeItemContent>
        {({hasChildItems, isExpanded}) => (
          <>
            <Button slot="drag">≡</Button>
            {hasChildItems && <Button slot="chevron">{isExpanded ? '⏷' : '⏵'}</Button>}
            <Text>{item.value.name}</Text>
          </>
        )}
      </TreeItemContent>
      <Collection items={item.children ?? []}>{renderItem}</Collection>
    </TreeItem>
  );
}

function MovableTree({onDragEnd}: {onDragEnd: (event: DraggableCollectionEndEvent) => void}) {
  let tree = useTreeData<Item>({
    initialItems: [
      {id: 'projects', name: 'Projects', childItems: [{id: 'project-1', name: 'Project 1'}]},
      {id: 'reports', name: 'Reports'}
    ],
    getKey: item => item.id,
    getChildren: item => item.childItems ?? []
  });
  let {dragAndDropHooks} = useDragAndDrop({
    getItems: keys => [...keys].map(key => ({'text/plain': String(key)})),
    getAllowedDropOperations: () => ['move'],
    onDragEnd,
    onMove: event => {
      if (event.target.dropPosition === 'before') {
        tree.moveBefore(event.target.key, event.keys);
      } else if (event.target.dropPosition === 'after') {
        tree.moveAfter(event.target.key, event.keys);
      }
    }
  });
  return (
    <Tree
      aria-label="Movable tree"
      items={tree.items}
      defaultExpandedKeys={['projects']}
      dragAndDropHooks={dragAndDropHooks}>
      {renderItem}
    </Tree>
  );
}

afterEach(async () => {
  await userEvent.keyboard('{Escape}');
});

it.each(['Enter', 'Escape'])(
  'continues a drag after source collapse and ends once with %s',
  async key => {
    let onDragEnd = vi.fn();
    let {container} = await render(
      <StrictMode>
        <MovableTree onDragEnd={onDragEnd} />
      </StrictMode>
    );
    await userEvent.keyboard('{Tab}{ArrowDown}{ArrowRight}');
    await expect
      .element(page.getByRole('row', {name: 'Project 1', exact: true}).getByRole('button'))
      .toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect
      .poll(() => document.activeElement?.getAttribute('aria-roledescription'))
      .toBe('drop indicator');
    let projects = container.querySelector('[data-key="projects"]')!;
    for (let i = 0; i < 8 && !projects.hasAttribute('data-drop-target'); i++) {
      await userEvent.keyboard('{ArrowUp}');
    }
    await expect.poll(() => projects.hasAttribute('data-drop-target')).toBe(true);
    await userEvent.keyboard('{ArrowLeft}');
    await expect.poll(() => container.querySelector('[data-key="project-1"]')).toBeNull();
    expect(onDragEnd).not.toHaveBeenCalled();
    expect(projects).toHaveAttribute('data-drop-target');
    expect(document.activeElement).toHaveAttribute('aria-roledescription', 'drop indicator');
    await userEvent.keyboard('{ArrowDown}');
    await expect
      .poll(() =>
        container
          .querySelector('.react-aria-DropIndicator[data-drop-target]')
          ?.contains(document.activeElement)
      )
      .toBe(true);
    await userEvent.keyboard(`{${key}}`);
    await expect.poll(() => onDragEnd.mock.calls.length).toBe(1);
    expect(onDragEnd).toHaveBeenCalledWith(
      expect.objectContaining({
        keys: new Set(['project-1']),
        dropOperation: key === 'Enter' ? 'move' : 'cancel'
      })
    );
    await expect
      .poll(() => document.activeElement?.closest('[role="row"]')?.getAttribute('data-key'))
      .toBe(key === 'Enter' ? 'project-1' : 'projects');
    expect(
      [...container.querySelectorAll('[data-key]')].map(row => row.getAttribute('data-key'))
    ).toEqual(key === 'Enter' ? ['projects', 'project-1', 'reports'] : ['projects', 'reports']);
    let event = new KeyboardEvent('keydown', {key: 'a', bubbles: true, cancelable: true});
    document.activeElement?.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(container.querySelector('[inert]')).toBeNull();
  }
);
