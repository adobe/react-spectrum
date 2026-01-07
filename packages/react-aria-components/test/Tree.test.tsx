/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, fireEvent, mockClickDefault, pointerMap, render, setupIntersectionObserverMock, within} from '@react-spectrum/test-utils-internal';
import {AriaTreeTests} from './AriaTree.test-util';
import {Button, Checkbox, Collection, DropIndicator, ListLayout, Text, Tree, TreeItem, TreeItemContent, TreeLoadMoreItem, useDragAndDrop, Virtualizer} from '../';
import {composeStories} from '@storybook/react';
// @ts-ignore
import {DataTransfer, DragEvent} from '@react-aria/dnd/test/mocks';
import React from 'react';
import * as stories from '../stories/Tree.stories';
import {User} from '@react-aria/test-utils';
import userEvent from '@testing-library/user-event';
import {useTreeData} from 'react-stately';

let {
  EmptyTreeStaticStory: EmptyLoadingTree,
  LoadingStoryDepOnTopStory: LoadingMoreTree
} = composeStories(stories);

let onSelectionChange = jest.fn();
let onAction = jest.fn();
let onExpandedChange = jest.fn();

let StaticTreeItem = (props) => {
  return (
    <TreeItem {...props}>
      <TreeItemContent>
        {({isExpanded, hasChildItems, selectionMode, selectionBehavior}) => (
          <>
            {(selectionMode !== 'none' || props.href != null) && selectionBehavior === 'toggle' && (
              <Checkbox slot="selection" />
            )}
            {hasChildItems && <Button slot="chevron">{isExpanded ? '⏷' : '⏵'}</Button>}
            <Text>{props.title || props.children}</Text>
            <Button aria-label="Info">ⓘ</Button>
            <Button aria-label="Menu">☰</Button>
          </>
        )}
      </TreeItemContent>
      {props.title && props.children}
    </TreeItem>
  );
};

let StaticTree = ({treeProps = {}, rowProps = {}}) => (
  <Tree defaultExpandedKeys={new Set(['projects', 'projects-1'])} disabledBehavior="selection" aria-label="test tree" onExpandedChange={onExpandedChange} onSelectionChange={onSelectionChange} {...treeProps}>
    <StaticTreeItem id="Photos" textValue="Photos" {...rowProps}>Photos</StaticTreeItem>
    <StaticTreeItem id="projects" textValue="Projects" title="Projects" {...rowProps}>
      <StaticTreeItem id="projects-1" textValue="Projects-1" title="Projects-1" {...rowProps}>
        <StaticTreeItem id="projects-1A" textValue="Projects-1A" {...rowProps}>
          Projects-1A
        </StaticTreeItem>
      </StaticTreeItem>
      <StaticTreeItem id="projects-2" textValue="Projects-2" {...rowProps}>
        Projects-2
      </StaticTreeItem>
      <StaticTreeItem id="projects-3" textValue="Projects-3" {...rowProps}>
        Projects-3
      </StaticTreeItem>
    </StaticTreeItem>
  </Tree>
);

let rows = [
  {id: 'projects', name: 'Projects', childItems: [
    {id: 'project-1', name: 'Project 1'},
    {id: 'project-2', name: 'Project 2', childItems: [
      {id: 'project-2A', name: 'Project 2A'},
      {id: 'project-2B', name: 'Project 2B'},
      {id: 'project-2C', name: 'Project 2C'}
    ]},
    {id: 'project-3', name: 'Project 3'},
    {id: 'project-4', name: 'Project 4'},
    {id: 'project-5', name: 'Project 5', childItems: [
      {id: 'project-5A', name: 'Project 5A'},
      {id: 'project-5B', name: 'Project 5B'},
      {id: 'project-5C', name: 'Project 5C'}
    ]}
  ]},
  {id: 'reports', name: 'Reports', childItems: [
    {id: 'reports-1', name: 'Reports 1', childItems: [
      {id: 'reports-1A', name: 'Reports 1A', childItems: [
        {id: 'reports-1AB', name: 'Reports 1AB', childItems: [
          {id: 'reports-1ABC', name: 'Reports 1ABC'}
        ]}
      ]},
      {id: 'reports-1B', name: 'Reports 1B'},
      {id: 'reports-1C', name: 'Reports 1C'}
    ]},
    {id: 'reports-2', name: 'Reports 2'}
  ]}
];

let DynamicTreeItem = (props) => {
  return (
    <TreeItem {...props}>
      <TreeItemContent>
        {({isExpanded, hasChildItems, selectionMode, selectionBehavior, allowsDragging}) => (
          <>
            {(selectionMode !== 'none' || props.href != null) && selectionBehavior === 'toggle' && (
              <Checkbox slot="selection" />
            )}
            {allowsDragging && (
              <Button slot="drag">≡</Button>
            )}
            {hasChildItems && <Button slot="chevron">{isExpanded ? '⏷' : '⏵'}</Button>}
            {props.supportsDragging && <Button slot="drag">≡</Button>}
            <Text>{props.title || props.children}</Text>
            <Button aria-label="Info">ⓘ</Button>
            <Button aria-label="Menu">☰</Button>
          </>
        )}
      </TreeItemContent>
      <Collection items={props.childItems}>
        {(item: any) => (
          <DynamicTreeItem supportsDragging={props.supportsDragging} childItems={item.childItems} textValue={item.name} href={props.href}>
            {item.name}
          </DynamicTreeItem>
        )}
      </Collection>
    </TreeItem>
  );
};

let DynamicTree = ({treeProps = {}, rowProps = {}}) => (
  <Tree defaultExpandedKeys={new Set(['projects', 'project-2', 'project-5', 'reports', 'reports-1', 'reports-1A', 'reports-1AB'])} aria-label="test dynamic tree" items={rows} onExpandedChange={onExpandedChange} onSelectionChange={onSelectionChange} {...treeProps}>
    {(item: any) => (
      <DynamicTreeItem childItems={item.childItems} textValue={item.name} {...rowProps}>
        {item.name}
      </DynamicTreeItem>
    )}
  </Tree>
);

let DraggableTree = (props) => {
  let {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys) => [...keys].map((key) => ({'text/plain': key})),
    ...props
  });

  return <DynamicTree treeProps={{dragAndDropHooks}} />;
};

let DraggableTreeWithSelection = (props) => {
  let {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys) => [...keys].map((key) => ({'text/plain': key})),
    ...props
  });

  return <DynamicTree treeProps={{dragAndDropHooks, selectionMode: 'multiple'}} />;
};

describe('Tree', () => {
  let user;
  let testUtilUser = new User();

  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    act(() => {jest.runAllTimers();});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should render a Tree with default classes', () => {
    let {getByRole, getAllByRole} = render(<StaticTree />);
    let tree = getByRole('treegrid');
    expect(tree).toHaveAttribute('class', 'react-aria-Tree');

    for (let row of getAllByRole('row')) {
      expect(row).toHaveAttribute('class', 'react-aria-TreeItem');
    }
  });

  it('should render a Tree with custom classes', () => {
    let {getByRole, getAllByRole} = render(<StaticTree treeProps={{className: 'test-tree'}} rowProps={{className: 'test-row'}} />);
    let tree = getByRole('treegrid');
    expect(tree).toHaveAttribute('class', 'test-tree');

    for (let row of getAllByRole('row')) {
      expect(row).toHaveAttribute('class', 'test-row');
    }
  });

  it('should support DOM props', () => {
    let {getByRole, getAllByRole} = render(<StaticTree treeProps={{'data-testid': 'test-tree'}} rowProps={{'data-testid': 'test-row'}} />);
    let tree = getByRole('treegrid');
    expect(tree).toHaveAttribute('data-testid', 'test-tree');

    for (let row of getAllByRole('row')) {
      expect(row).toHaveAttribute('data-testid', 'test-row');
    }
  });

  it('should support style', () => {
    let {getByRole} = render(<StaticTree treeProps={{style: {width: 200}}} />);

    let tree = getByRole('treegrid');
    expect(tree).toHaveAttribute('style', expect.stringContaining('width: 200px'));
  });

  it('should have the base set of data attributes', () => {
    let {getByRole, getAllByRole} = render(<StaticTree treeProps={{defaultExpandedKeys: 'none'}} />);
    let tree = getByRole('treegrid');
    expect(tree).toHaveAttribute('data-rac');
    expect(tree).not.toHaveAttribute('data-empty');
    expect(tree).not.toHaveAttribute('data-focused');
    expect(tree).not.toHaveAttribute('data-focus-visible');

    for (let row of getAllByRole('row')) {
      expect(row).toHaveAttribute('data-rac');
      expect(row).not.toHaveAttribute('data-selected');
      expect(row).not.toHaveAttribute('data-disabled');
      expect(row).not.toHaveAttribute('data-hovered');
      expect(row).not.toHaveAttribute('data-focused');
      expect(row).not.toHaveAttribute('data-focus-visible');
      expect(row).not.toHaveAttribute('data-pressed');
      expect(row).not.toHaveAttribute('data-selection-mode');
    }
  });

  it('should have the expected attributes on the rows', () => {
    let {getAllByRole} = render(<StaticTree />);

    let rows = getAllByRole('row');
    let rowNoChild = rows[0];
    expect(rowNoChild).toHaveAttribute('aria-label', 'Photos');
    expect(rowNoChild).not.toHaveAttribute('aria-expanded');
    expect(rowNoChild).not.toHaveAttribute('data-expanded');
    expect(rowNoChild).toHaveAttribute('data-level', '1');
    expect(rowNoChild).not.toHaveAttribute('data-has-child-items');
    expect(rowNoChild).toHaveAttribute('data-rac');

    let rowWithChildren = rows[1];
    // Row has action since it is expandable but not selectable.
    expect(rowWithChildren).toHaveAttribute('aria-label', 'Projects');
    expect(rowWithChildren).toHaveAttribute('data-expanded', 'true');
    expect(rowWithChildren).toHaveAttribute('data-level', '1');
    expect(rowWithChildren).toHaveAttribute('data-has-child-items', 'true');
    expect(rowWithChildren).toHaveAttribute('data-rac');

    let level2ChildRow = rows[2];
    expect(level2ChildRow).toHaveAttribute('aria-label', 'Projects-1');
    expect(level2ChildRow).toHaveAttribute('data-expanded', 'true');
    expect(level2ChildRow).toHaveAttribute('data-level', '2');
    expect(level2ChildRow).toHaveAttribute('data-has-child-items', 'true');
    expect(level2ChildRow).toHaveAttribute('data-rac');

    let level3ChildRow = rows[3];
    expect(level3ChildRow).toHaveAttribute('aria-label', 'Projects-1A');
    expect(level3ChildRow).not.toHaveAttribute('data-expanded');
    expect(level3ChildRow).toHaveAttribute('data-level', '3');
    expect(level3ChildRow).not.toHaveAttribute('data-has-child-items');
    expect(level3ChildRow).toHaveAttribute('data-rac');

    let level2ChildRow2 = rows[4];
    expect(level2ChildRow2).toHaveAttribute('aria-label', 'Projects-2');
    expect(level2ChildRow2).not.toHaveAttribute('data-expanded');
    expect(level2ChildRow2).toHaveAttribute('data-level', '2');
    expect(level2ChildRow2).not.toHaveAttribute('data-has-child-items');
    expect(level2ChildRow2).toHaveAttribute('data-rac');

    let level2ChildRow3 = rows[5];
    expect(level2ChildRow3).toHaveAttribute('aria-label', 'Projects-3');
    expect(level2ChildRow3).not.toHaveAttribute('data-expanded');
    expect(level2ChildRow3).toHaveAttribute('data-level', '2');
    expect(level2ChildRow3).not.toHaveAttribute('data-has-child-items');
    expect(level2ChildRow3).toHaveAttribute('data-rac');
  });

  it('should include the row as part of the expand/collapse button accessible label', () => {
    let {getAllByRole} = render(<StaticTree />);
    let rows = getAllByRole('row');
    for (let row of rows) {
      if (row.hasAttribute('data-has-child-items')) {
        let expandButton = within(row).getAllByRole('button')[0];
        expect(expandButton).toHaveAttribute('aria-labelledby', `${expandButton.id} ${row.id}`);
      }
    }
  });

  it('should not label an expandable row as having an action if it supports selection', () => {
    let {getAllByRole} = render(<StaticTree treeProps={{selectionMode: 'single'}} />);

    let rows = getAllByRole('row');
    expect(rows[1]).toHaveAttribute('data-has-child-items', 'true');
  });

  it('should support dynamic trees', () => {
    let {getByRole, getAllByRole} = render(<DynamicTree />);
    let tree = getByRole('treegrid');
    expect(tree).toHaveAttribute('class', 'react-aria-Tree');

    let rows = getAllByRole('row');
    expect(rows).toHaveLength(20);

    // Check the rough structure to make sure dynamic rows are rendering as expected (just checks the expandable rows and their attributes)
    expect(rows[0]).toHaveAttribute('aria-label', 'Projects');
    expect(rows[0]).toHaveAttribute('aria-expanded', 'true');
    expect(rows[0]).toHaveAttribute('aria-level', '1');
    expect(rows[0]).toHaveAttribute('aria-posinset', '1');
    expect(rows[0]).toHaveAttribute('aria-setsize', '2');
    expect(rows[0]).toHaveAttribute('data-has-child-items', 'true');

    expect(rows[2]).toHaveAttribute('aria-label', 'Project 2');
    expect(rows[2]).toHaveAttribute('aria-expanded', 'true');
    expect(rows[2]).toHaveAttribute('aria-level', '2');
    expect(rows[2]).toHaveAttribute('aria-posinset', '2');
    expect(rows[2]).toHaveAttribute('aria-setsize', '5');
    expect(rows[2]).toHaveAttribute('data-has-child-items', 'true');

    expect(rows[8]).toHaveAttribute('aria-label', 'Project 5');
    expect(rows[8]).toHaveAttribute('aria-expanded', 'true');
    expect(rows[8]).toHaveAttribute('aria-level', '2');
    expect(rows[8]).toHaveAttribute('aria-posinset', '5');
    expect(rows[8]).toHaveAttribute('aria-setsize', '5');
    expect(rows[8]).toHaveAttribute('data-has-child-items', 'true');

    expect(rows[12]).toHaveAttribute('aria-label', 'Reports');
    expect(rows[12]).toHaveAttribute('aria-expanded', 'true');
    expect(rows[12]).toHaveAttribute('aria-level', '1');
    expect(rows[12]).toHaveAttribute('aria-posinset', '2');
    expect(rows[12]).toHaveAttribute('aria-setsize', '2');
    expect(rows[12]).toHaveAttribute('data-has-child-items', 'true');

    expect(rows[16]).toHaveAttribute('aria-label', 'Reports 1ABC');
    expect(rows[16]).toHaveAttribute('aria-level', '5');
    expect(rows[16]).toHaveAttribute('aria-posinset', '1');
    expect(rows[16]).toHaveAttribute('aria-setsize', '1');
  });

  it('should render checkboxes for selection', async () => {
    let {getByRole, getAllByRole} = render(<StaticTree treeProps={{selectionMode: 'single'}} rowProps={{href: 'https://google.com'}} />);
    let tree = getByRole('treegrid');
    expect(tree).not.toHaveAttribute('aria-multiselectable');

    for (let row of getAllByRole('row')) {
      let checkbox = within(row).getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
      expect(checkbox).toHaveAttribute('aria-label', 'Select');
      expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${row.id}`);
      expect(row).toHaveAttribute('aria-selected', 'false');
      expect(row).not.toHaveAttribute('data-selected');
      expect(row).toHaveAttribute('data-selection-mode', 'single');
    }

    let row = getAllByRole('row')[2];
    let checkbox = within(row).getByRole('checkbox');
    await user.click(checkbox);
    expect(row).toHaveAttribute('aria-selected', 'true');
    expect(row).toHaveAttribute('data-selected', 'true');
    expect(checkbox).toBeChecked();
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(new Set(onSelectionChange.mock.calls[0][0])).toEqual(new Set(['projects-1']));
  });

  it('should not render checkboxes for selection with selectionBehavior=replace ', async () => {
    let {getByRole, getAllByRole} = render(<StaticTree treeProps={{selectionMode: 'multiple', selectionBehavior: 'replace'}} />);
    let tree = getByRole('treegrid');
    expect(tree).toHaveAttribute('aria-multiselectable', 'true');

    for (let row of getAllByRole('row')) {
      let checkbox = within(row).queryByRole('checkbox');
      expect(checkbox).toBeNull();
      expect(row).toHaveAttribute('aria-selected', 'false');
      expect(row).not.toHaveAttribute('data-selected');
      expect(row).toHaveAttribute('data-selection-mode', 'multiple');
    }

    let row2 = getAllByRole('row')[2];
    await user.click(row2);
    expect(row2).toHaveAttribute('aria-selected', 'true');
    expect(row2).toHaveAttribute('data-selected', 'true');
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(new Set(onSelectionChange.mock.calls[0][0])).toEqual(new Set(['projects-1']));

    let row1 = getAllByRole('row')[1];
    await user.click(row1);
    expect(row1).toHaveAttribute('aria-selected', 'true');
    expect(row1).toHaveAttribute('data-selected', 'true');
    expect(row2).toHaveAttribute('aria-selected', 'false');
    expect(row2).not.toHaveAttribute('data-selected');
    expect(onSelectionChange).toHaveBeenCalledTimes(2);
    expect(new Set(onSelectionChange.mock.calls[1][0])).toEqual(new Set(['projects']));
  });

  it('should support virtualizer', async () => {
    jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 100);
    jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 100);

    let {getByRole, getAllByRole} = render(
      <Virtualizer layout={ListLayout} layoutOptions={{rowHeight: 25}}>
        <DynamicTree />
      </Virtualizer>
    );

    let rows = getAllByRole('row');
    expect(rows).toHaveLength(7);
    expect(rows.map(r => r.querySelector('span')!.textContent)).toEqual(['Projects', 'Project 1', 'Project 2', 'Project 2A', 'Project 2B', 'Project 2C', 'Project 3']);

    let tree = getByRole('treegrid');
    tree.scrollTop = 200;
    fireEvent.scroll(tree);

    rows = getAllByRole('row');
    expect(rows).toHaveLength(8);
    expect(rows.map(r => r.querySelector('span')!.textContent)).toEqual(['Project 4', 'Project 5', 'Project 5A', 'Project 5B', 'Project 5C', 'Reports', 'Reports 1', 'Reports 1A']);

    await user.tab();
    await user.keyboard('{End}');

    rows = getAllByRole('row');
    expect(rows).toHaveLength(9);
    expect(rows.map(r => r.querySelector('span')!.textContent)).toEqual(['Project 4', 'Project 5', 'Project 5A', 'Project 5B', 'Project 5C', 'Reports', 'Reports 1', 'Reports 1A', 'Reports 2']);
  });

  describe('general interactions', () => {
    it('should support hover on rows', async () => {
      let onHoverStart = jest.fn();
      let onHoverChange = jest.fn();
      let onHoverEnd = jest.fn();
      let {getAllByRole, rerender} = render(<StaticTree treeProps={{selectionMode: 'multiple'}} rowProps={{className: ({isHovered}) => isHovered ? 'hover' : '', onHoverStart, onHoverChange, onHoverEnd}} />);

      let row = getAllByRole('row')[0];
      expect(row).not.toHaveAttribute('data-hovered');
      expect(row).not.toHaveClass('hover');

      await user.hover(row);
      expect(row).toHaveAttribute('data-hovered', 'true');
      expect(row).toHaveClass('hover');
      expect(onHoverStart).toHaveBeenCalledTimes(1);
      expect(onHoverChange).toHaveBeenCalledTimes(1);

      await user.unhover(row);
      expect(row).not.toHaveAttribute('data-hovered');
      expect(row).not.toHaveClass('hover');
      expect(onHoverEnd).toHaveBeenCalledTimes(1);
      expect(onHoverChange).toHaveBeenCalledTimes(2);

      rerender(<StaticTree treeProps={{selectionMode: 'none', onAction: jest.fn()}} rowProps={{className: ({isHovered}) => isHovered ? 'hover' : ''}} />);
      row = getAllByRole('row')[0];
      expect(row).not.toHaveAttribute('data-hovered');
      expect(row).not.toHaveClass('hover');

      await user.hover(row);
      expect(row).toHaveAttribute('data-hovered', 'true');
      expect(row).toHaveClass('hover');

      await user.unhover(row);
      expect(row).not.toHaveAttribute('data-hovered');
      expect(row).not.toHaveClass('hover');
    });

    it('should not update the hover state if the row is not interactive', async () => {
      let onHoverStart = jest.fn();
      let onHoverChange = jest.fn();
      let onHoverEnd = jest.fn();
      let {getAllByRole, rerender} = render(<StaticTree treeProps={{selectionMode: 'none'}} rowProps={{className: ({isHovered}) => isHovered ? 'hover' : '', onHoverStart, onHoverChange, onHoverEnd}} />);

      let row = getAllByRole('row')[0];
      expect(row).not.toHaveAttribute('data-hovered');
      expect(row).not.toHaveClass('hover');
      expect(onHoverStart).toHaveBeenCalledTimes(0);
      expect(onHoverChange).toHaveBeenCalledTimes(0);
      expect(onHoverEnd).toHaveBeenCalledTimes(0);

      await user.hover(row);
      expect(row).not.toHaveAttribute('data-hovered');
      expect(row).not.toHaveClass('hover');
      expect(onHoverStart).toHaveBeenCalledTimes(0);
      expect(onHoverChange).toHaveBeenCalledTimes(0);
      expect(onHoverEnd).toHaveBeenCalledTimes(0);

      let expandableRow = getAllByRole('row')[1];
      expect(expandableRow).not.toHaveAttribute('data-hovered');
      expect(expandableRow).not.toHaveClass('hover');

      await user.hover(expandableRow);
      expect(expandableRow).toHaveAttribute('data-hovered', 'true');
      expect(expandableRow).toHaveClass('hover');
      expect(onHoverStart).toHaveBeenCalledTimes(1);
      expect(onHoverChange).toHaveBeenCalledTimes(1);
      expect(onHoverEnd).toHaveBeenCalledTimes(0);

      await user.unhover(expandableRow);
      expect(expandableRow).not.toHaveAttribute('data-hovered');
      expect(expandableRow).not.toHaveClass('hover');
      expect(onHoverEnd).toHaveBeenCalledTimes(1);
      expect(onHoverChange).toHaveBeenCalledTimes(2);

      // Test a completely inert expandable row
      // Note the disabledBehavior setting here, by default we make disableKey keys NOT restrict expandablity of the row. Similar pattern to Table
      let inertOnHoverStart = jest.fn();
      let inertOnHoverChange = jest.fn();
      let inertOnHoverEnd = jest.fn();
      rerender(<StaticTree treeProps={{selectionMode: 'none', disabledBehavior: 'all', disabledKeys: ['projects']}} rowProps={{className: ({isHovered}) => isHovered ? 'hover' : '', onHoverStart: inertOnHoverStart, onHoverChange: inertOnHoverChange, onHoverEnd: inertOnHoverEnd}} />);

      expandableRow = getAllByRole('row')[1];
      expect(expandableRow).toHaveAttribute('data-disabled', 'true');
      expect(expandableRow).not.toHaveAttribute('data-hovered');
      expect(expandableRow).not.toHaveClass('hover');

      await user.hover(expandableRow);
      expect(expandableRow).not.toHaveAttribute('data-hovered');
      expect(expandableRow).not.toHaveClass('hover');
      expect(inertOnHoverStart).toHaveBeenCalledTimes(0);
      expect(inertOnHoverChange).toHaveBeenCalledTimes(0);
      expect(inertOnHoverEnd).toHaveBeenCalledTimes(0);
    });

    it('should support press on rows', async () => {
      let {getAllByRole, rerender} = render(<StaticTree treeProps={{selectionMode: 'multiple'}} rowProps={{className: ({isPressed}) => isPressed ? 'pressed' : ''}} />);

      let row = getAllByRole('row')[0];
      expect(row).not.toHaveAttribute('data-pressed');
      expect(row).not.toHaveClass('pressed');

      await user.pointer({target: row, keys: '[MouseLeft>]'});
      expect(row).toHaveAttribute('data-pressed', 'true');
      expect(row).toHaveClass('pressed');

      await user.pointer({target: row, keys: '[/MouseLeft]'});
      expect(row).not.toHaveAttribute('data-pressed');
      expect(row).not.toHaveClass('pressed');

      rerender(<StaticTree treeProps={{selectionMode: 'none', onAction: jest.fn()}} rowProps={{className: ({isPressed}) => isPressed ? 'pressed' : ''}} />);
      row = getAllByRole('row')[0];
      expect(row).not.toHaveAttribute('data-pressed');
      expect(row).not.toHaveClass('pressed');

      await user.pointer({target: row, keys: '[MouseLeft>]'});
      expect(row).toHaveAttribute('data-pressed', 'true');
      expect(row).toHaveClass('pressed');

      await user.pointer({target: row, keys: '[/MouseLeft]'});
      expect(row).not.toHaveAttribute('data-pressed');
      expect(row).not.toHaveClass('pressed');
    });

    it('should not update the press state if the row is not interactive', async () => {
      let {getAllByRole, rerender} = render(<StaticTree treeProps={{selectionMode: 'none', disabledBehavior: 'selection'}} rowProps={{className: ({isPressed}) => isPressed ? 'pressed' : ''}} />);

      let row = getAllByRole('row')[0];
      expect(row).not.toHaveAttribute('data-pressed');
      expect(row).not.toHaveClass('pressed');

      await user.pointer({target: row, keys: '[MouseLeft>]'});
      expect(row).not.toHaveAttribute('data-pressed');
      expect(row).not.toHaveClass('pressed');
      await user.pointer({target: row, keys: '[/MouseLeft]'});

      let expandableRow = getAllByRole('row')[1];
      expect(expandableRow).not.toHaveAttribute('data-pressed');
      expect(expandableRow).not.toHaveClass('pressed');

      await user.pointer({target: expandableRow, keys: '[MouseLeft>]'});
      expect(expandableRow).toHaveAttribute('data-pressed', 'true');
      expect(expandableRow).toHaveClass('pressed');

      await user.pointer({target: expandableRow, keys: '[/MouseLeft]'});
      expect(expandableRow).not.toHaveAttribute('data-pressed');
      expect(expandableRow).not.toHaveClass('pressed');

      // Test a completely inert expandable row
      rerender(<StaticTree treeProps={{selectionMode: 'none', disabledBehavior: 'all',  disabledKeys: ['projects']}} rowProps={{className: ({isPressed}) => isPressed ? 'pressed' : ''}} />);
      expandableRow = getAllByRole('row')[1];
      expect(expandableRow).toHaveAttribute('data-disabled', 'true');
      expect(expandableRow).not.toHaveAttribute('data-pressed');
      expect(expandableRow).not.toHaveClass('pressed');

      await user.pointer({target: expandableRow, keys: '[MouseLeft>]'});
      expect(expandableRow).not.toHaveAttribute('data-pressed');
      expect(expandableRow).not.toHaveClass('pressed');
      await user.pointer({target: expandableRow, keys: '[/MouseLeft]'});
    });

    it('should support focus', async () => {
      let {getAllByRole, rerender} = render(<StaticTree treeProps={{selectionMode: 'multiple', disabledKeys: ['projects'], disabledBehavior: 'selection'}} rowProps={{className: ({isFocused}) => isFocused ? 'focus' : ''}} />);

      let row = getAllByRole('row')[0];
      expect(row).not.toHaveAttribute('data-focused');
      expect(row).not.toHaveClass('focus');

      await user.click(row);
      expect(row).toHaveAttribute('data-focused');
      expect(row).toHaveClass('focus');

      rerender(<StaticTree treeProps={{selectionMode: 'multiple', disabledKeys: ['projects'], disabledBehavior: 'selection'}} rowProps={{className: ({isFocusVisible}) => isFocusVisible ? 'focus-visible' : ''}} />);
      row = getAllByRole('row')[0];
      expect(row).not.toHaveAttribute('data-focus-visible');
      expect(row).not.toHaveClass('focus-visible');

      await user.click(row);
      expect(row).not.toHaveAttribute('data-focus-visible');
      expect(row).not.toHaveClass('focus-visible');

      await user.keyboard('{Enter}');
      expect(row).toHaveAttribute('data-focus-visible', 'true');
      expect(row).toHaveClass('focus-visible');

      let disabledRow = getAllByRole('row')[1];
      expect(disabledRow).not.toHaveAttribute('data-disabled', 'true');
      expect(disabledRow).not.toHaveAttribute('data-focus-visible');
      expect(disabledRow).not.toHaveClass('focus-visible');

      await user.keyboard('{ArrowDown}');
      disabledRow = getAllByRole('row')[1];
      // Note that the row is able to be focused because default disabledBehavior is 'selection'
      expect(disabledRow).toHaveAttribute('data-focus-visible', 'true');
      expect(disabledRow).toHaveClass('focus-visible');
      expect(row).not.toHaveAttribute('data-focus-visible');
      expect(row).not.toHaveClass('focus-visible');
    });

    it('should support actions on rows', async () => {
      let {getAllByRole} = render(<StaticTree treeProps={{selectionMode: 'multiple', disabledBehavior: 'all', onAction, disabledKeys: ['projects']}}  />);

      let row = getAllByRole('row')[0];
      await user.click(row);
      expect(onAction).toHaveBeenCalledTimes(1);
      expect(onAction).toHaveBeenLastCalledWith('Photos');
      expect(onSelectionChange).toHaveBeenCalledTimes(0);

      // Due to disabledBehavior being set to 'all' this expandable row has its action disabled
      let disabledRow = getAllByRole('row')[1];
      expect(disabledRow).toHaveAttribute('data-disabled', 'true');
      await user.click(disabledRow);
      expect(onAction).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenCalledTimes(0);

      let expandableRow = getAllByRole('row')[2];
      await user.click(expandableRow);
      expect(onAction).toHaveBeenCalledTimes(2);
      expect(onAction).toHaveBeenLastCalledWith('projects-1');
      expect(onSelectionChange).toHaveBeenCalledTimes(0);

      await user.keyboard('{Enter}');
      expect(onAction).toHaveBeenCalledTimes(3);
      expect(onAction).toHaveBeenLastCalledWith('projects-1');
      expect(onSelectionChange).toHaveBeenCalledTimes(0);
    });

    it('should prevent Esc from clearing selection if escapeKeyBehavior is "none"', async () => {
      let {getAllByRole} = render(<StaticTree treeProps={{selectionMode: 'multiple', escapeKeyBehavior: 'none'}}  />);

      let rows = getAllByRole('row');
      await user.click(rows[0]);
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(new Set(onSelectionChange.mock.calls[0][0])).toEqual(new Set(['Photos']));

      await user.click(rows[1]);
      expect(onSelectionChange).toHaveBeenCalledTimes(2);
      expect(new Set(onSelectionChange.mock.calls[1][0])).toEqual(new Set(['Photos', 'projects']));

      await user.keyboard('{Escape}');
      expect(onSelectionChange).toHaveBeenCalledTimes(2);
      expect(rows[0]).toHaveAttribute('data-selected');
      expect(rows[1]).toHaveAttribute('data-selected');
    });

    it('should support onScroll', () => {
      let onScroll = jest.fn();
      let {getByRole} = render(<StaticTree treeProps={{onScroll}} />);
      let tree = getByRole('treegrid');
      fireEvent.scroll(tree);
      expect(onScroll).toHaveBeenCalled();
    });

    describe('links', function () {
      describe.each(['mouse', 'keyboard'])('%s', (type) => {
        let trigger = async (item, key = 'Enter') => {
          if (type === 'mouse') {
            await user.click(item);
          } else {
            await user.keyboard(`{${key}}`);
          }
        };

        it('should support links with selectionMode="none"', async () => {
          let {getAllByRole} = render(<StaticTree treeProps={{selectionMode: 'none'}} rowProps={{href: 'https://google.com/'}} />);
          let items = getAllByRole('row');
          for (let item of items) {
            expect(item.tagName).not.toBe('A');
            expect(item).toHaveAttribute('data-href');
          }

          if (type === 'keyboard') {
            await user.tab();
          }

          let onClick = mockClickDefault();
          await trigger(items[0]);
          expect(onClick).toHaveBeenCalledTimes(1);
          expect(onClick.mock.calls[0][0].target).toBeInstanceOf(HTMLAnchorElement);
          expect(onClick.mock.calls[0][0].target.href).toBe('https://google.com/');
        });

        it.each(['single', 'multiple'])('should support links with selectionBehavior="toggle" selectionMode="%s"', async (selectionMode) => {
          let {getAllByRole} = render(<StaticTree treeProps={{selectionMode}} rowProps={{href: 'https://google.com/'}} />);
          let items = getAllByRole('row');
          for (let item of items) {
            expect(item.tagName).not.toBe('A');
            expect(item).toHaveAttribute('data-href');
          }

          if (type === 'keyboard') {
            await user.tab();
          }

          let onClick = mockClickDefault();
          await trigger(items[0]);
          expect(onClick).toHaveBeenCalledTimes(1);
          expect(onClick.mock.calls[0][0].target).toBeInstanceOf(HTMLAnchorElement);
          expect(onClick.mock.calls[0][0].target.href).toBe('https://google.com/');

          await user.click(within(items[0]).getByRole('checkbox'));
          expect(items[0]).toHaveAttribute('aria-selected', 'true');

          if (type === 'keyboard') {
            await user.keyboard('{ArrowLeft}');
            await user.keyboard('{ArrowDown}');
          }
          await trigger(items[1], ' ');
          expect(onClick).toHaveBeenCalledTimes(1);
          expect(items[1]).toHaveAttribute('aria-selected', 'true');
        });

        it.each(['single', 'multiple'])('should support links with selectionBehavior="replace" selectionMode="%s"', async (selectionMode) => {
          let {getAllByRole} = render(<StaticTree treeProps={{selectionMode, selectionBehavior: 'replace'}} rowProps={{href: 'https://google.com/'}} />);

          let items = getAllByRole('row');
          for (let item of items) {
            expect(item.tagName).not.toBe('A');
            expect(item).toHaveAttribute('data-href');
          }

          let onClick = mockClickDefault();
          if (type === 'mouse') {
            await user.click(items[0]);
          } else {
            await user.tab();
            await user.keyboard('{Space}');
          }
          expect(onClick).not.toHaveBeenCalled();
          expect(items[0]).toHaveAttribute('aria-selected', 'true');

          if (type === 'mouse') {
            await user.dblClick(items[0], {pointerType: 'mouse'});
          } else {
            await user.keyboard('{Enter}');
          }
          expect(onClick).toHaveBeenCalledTimes(1);
          expect(onClick.mock.calls[0][0].target).toBeInstanceOf(HTMLAnchorElement);
          expect(onClick.mock.calls[0][0].target.href).toBe('https://google.com/');
        });
      });
    });

    describe('keyboard interactions', () => {
      it('left and right arrows should navigate between interactive elements in the row', async () => {
        let {getAllByRole} = render(<DynamicTree treeProps={{selectionMode: 'multiple'}} />);
        let expandableRow = getAllByRole('row')[0];
        let buttons = within(expandableRow).getAllByRole('button');
        let checkbox = within(expandableRow).getByRole('checkbox');

        await user.tab();
        expect(expandableRow).toHaveAttribute('aria-expanded', 'true');
        expect(document.activeElement).toBe(expandableRow);
        await user.keyboard('{ArrowRight}');
        expect(document.activeElement).toBe(checkbox);
        await user.keyboard('{ArrowRight}');
        expect(document.activeElement).toBe(buttons[1]);
        await user.keyboard('{ArrowRight}');
        expect(document.activeElement).toBe(buttons[2]);
        await user.keyboard('{ArrowRight}');
        expect(document.activeElement).toBe(expandableRow);

        // Test that if focus is on the row that right/left will expand/collapse if it isn't already
        await user.keyboard('{ArrowLeft}');
        expect(document.activeElement).toBe(expandableRow);
        expect(expandableRow).toHaveAttribute('aria-expanded', 'false');

        await user.keyboard('{ArrowRight}');
        expect(document.activeElement).toBe(expandableRow);
        expect(expandableRow).toHaveAttribute('aria-expanded', 'true');

        // Resume testing navigation to interacive elements
        await user.keyboard('{ArrowLeft}');
        await user.keyboard('{ArrowLeft}');
        expect(document.activeElement).toBe(buttons[2]);
        await user.keyboard('{ArrowLeft}');
        expect(document.activeElement).toBe(buttons[1]);
        await user.keyboard('{ArrowLeft}');
        expect(document.activeElement).toBe(checkbox);
      });

      it('should support type ahead', async () => {
        let {getAllByRole, queryByText} = render(<DynamicTree />);
        await user.tab();
        let rows = getAllByRole('row');
        expect(document.activeElement).toBe(rows[0]);
        await user.keyboard('Reports 1ABC');
        expect(document.activeElement).toBe(rows[16]);

        act(() => {jest.runAllTimers();});
        await user.keyboard('Pro');
        expect(document.activeElement).toBe(rows[0]);

        // Test typeahead doesn't match against hidden rows
        await user.click(rows[12]);
        expect(queryByText('Reports 1ABC')).toBeFalsy();
        await user.keyboard('Reports 1ABC');
        expect(document.activeElement).toBe(rows[12]);
        expect(rows[12]).toHaveAttribute('aria-label', 'Reports');
      });

      it('should navigate between visible rows when using Arrow Up/Down', async () => {
        let {getAllByRole} = render(<DynamicTree />);
        await user.tab();
        let rows = getAllByRole('row');
        expect(rows).toHaveLength(20);
        expect(document.activeElement).toBe(rows[0]);
        await user.keyboard('{ArrowDown}');
        expect(document.activeElement).toBe(rows[1]);
        expect(rows[1]).toHaveAttribute('aria-label', 'Project 1');
        await user.keyboard('{ArrowUp}');

        // Collapse parent row and try arrow navigation again
        await user.keyboard('{ArrowLeft}');
        rows = getAllByRole('row');
        expect(rows).toHaveLength(9);
        await user.keyboard('{ArrowDown}');
        expect(document.activeElement).toBe(rows[1]);
        expect(rows[1]).toHaveAttribute('aria-label', 'Reports');
        await user.keyboard('{ArrowUp}');
        expect(document.activeElement).toBe(rows[0]);
        expect(rows[0]).toHaveAttribute('aria-label', 'Projects');
      });

      it('should navigate between visible rows when using Home/End', async () => {
        let {getAllByRole} = render(<DynamicTree />);
        await user.tab();
        let rows = getAllByRole('row');
        expect(rows).toHaveLength(20);
        expect(document.activeElement).toBe(rows[0]);
        await user.keyboard('{End}');
        expect(document.activeElement).toBe(rows[19]);
        expect(rows[19]).toHaveAttribute('aria-label', 'Reports 2');
        await user.keyboard('{Home}');
        expect(document.activeElement).toBe(rows[0]);

        // Collapse the 2nd top level row and try End/Home again
        await user.click(rows[12]);
        rows = getAllByRole('row');
        expect(rows).toHaveLength(13);
        await user.keyboard('{Home}');
        await user.keyboard('{End}');
        expect(document.activeElement).toBe(rows[12]);
        expect(rows[12]).toHaveAttribute('aria-label', 'Reports');
      });
    });
  });

  describe('expanding and collapsing', () => {
    describe.each(['mouse', 'keyboard'])('%s', (type) => {
      let trigger = async (item, key = 'ArrowRight') => {
        if (type === 'mouse') {
          await user.click(item);
        } else {
          await user.keyboard(`{${key}}`);
        }
      };

      it('should expand/collapse a row when clicking/using Enter on the row itself and there arent any other primary actions', async () => {
        let {getAllByRole} = render(<DynamicTree />);
        let rows = getAllByRole('row');
        expect(rows).toHaveLength(20);

        await user.tab();
        expect(document.activeElement).toBe(rows[0]);
        expect(rows[0]).toHaveAttribute('data-expanded', 'true');
        expect(rows[0]).toHaveAttribute('data-has-child-items', 'true');
        expect(onExpandedChange).toHaveBeenCalledTimes(0);

        // Check we can open/close a top level row
        await trigger(rows[0], 'Enter');
        expect(document.activeElement).toBe(rows[0]);
        expect(rows[0]).not.toHaveAttribute('data-expanded');
        expect(rows[0]).toHaveAttribute('data-has-child-items', 'true');
        expect(onExpandedChange).toHaveBeenCalledTimes(1);
        // Note that the children of the parent row will still be in the "expanded" array
        expect(new Set(onExpandedChange.mock.calls[0][0])).toEqual(new Set(['project-2', 'project-5', 'reports', 'reports-1', 'reports-1A', 'reports-1AB']));
        rows = getAllByRole('row');
        expect(rows).toHaveLength(9);

        await trigger(rows[0], 'Enter');
        expect(document.activeElement).toBe(rows[0]);
        expect(rows[0]).toHaveAttribute('data-expanded', 'true');
        expect(rows[0]).toHaveAttribute('data-has-child-items', 'true');
        expect(onExpandedChange).toHaveBeenCalledTimes(2);
        expect(new Set(onExpandedChange.mock.calls[1][0])).toEqual(new Set(['projects', 'project-2', 'project-5', 'reports', 'reports-1', 'reports-1A', 'reports-1AB']));
        rows = getAllByRole('row');
        expect(rows).toHaveLength(20);

        await user.keyboard('{ArrowDown}');
        await user.keyboard('{ArrowDown}');
        expect(document.activeElement).toBe(rows[2]);
        expect(rows[2]).toHaveAttribute('data-expanded', 'true');
        expect(rows[2]).toHaveAttribute('data-has-child-items', 'true');

        // Check we can close a nested row and it doesn't affect the parent
        await trigger(rows[2], 'ArrowLeft');
        expect(document.activeElement).toBe(rows[2]);
        expect(rows[2]).not.toHaveAttribute('data-expanded');
        expect(rows[2]).toHaveAttribute('data-has-child-items', 'true');
        expect(rows[0]).toHaveAttribute('data-expanded', 'true');
        expect(rows[0]).toHaveAttribute('data-has-child-items', 'true');
        expect(onExpandedChange).toHaveBeenCalledTimes(3);
        expect(new Set(onExpandedChange.mock.calls[2][0])).toEqual(new Set(['projects', 'project-5', 'reports', 'reports-1', 'reports-1A', 'reports-1AB']));
        rows = getAllByRole('row');
        expect(rows).toHaveLength(17);

        // Check behavior of onExpandedChange when a nested row is already closed and the parent is collapsed
        await user.keyboard('{ArrowUp}');
        await user.keyboard('{ArrowUp}');
        await trigger(rows[0], 'ArrowLeft');
        expect(document.activeElement).toBe(rows[0]);
        expect(onExpandedChange).toHaveBeenCalledTimes(4);
        expect(new Set(onExpandedChange.mock.calls[3][0])).toEqual(new Set(['project-5', 'reports', 'reports-1', 'reports-1A', 'reports-1AB']));
        rows = getAllByRole('row');
        expect(rows).toHaveLength(9);

        // Check that the nested collapsed row is still closed when the parent is reexpanded
        await trigger(rows[0], 'ArrowRight');
        expect(document.activeElement).toBe(rows[0]);
        expect(onExpandedChange).toHaveBeenCalledTimes(5);
        expect(new Set(onExpandedChange.mock.calls[4][0])).toEqual(new Set(['projects', 'project-5', 'reports', 'reports-1', 'reports-1A', 'reports-1AB']));
        rows = getAllByRole('row');
        expect(rows).toHaveLength(17);
      });

      it('should not expand when clicking/using Enter on the row if the row is selectable', async () => {
        let {getAllByRole} = render(<DynamicTree treeProps={{selectionMode: 'multiple'}} />);
        let rows = getAllByRole('row');

        await user.tab();
        expect(document.activeElement).toBe(rows[0]);
        expect(rows[0]).toHaveAttribute('aria-expanded', 'true');
        expect(rows[0]).toHaveAttribute('data-expanded', 'true');
        expect(onExpandedChange).toHaveBeenCalledTimes(0);
        expect(onSelectionChange).toHaveBeenCalledTimes(0);

        await trigger(rows[0], 'Enter');
        expect(document.activeElement).toBe(rows[0]);
        expect(rows[0]).toHaveAttribute('aria-expanded', 'true');
        expect(rows[0]).toHaveAttribute('data-expanded', 'true');
        expect(onExpandedChange).toHaveBeenCalledTimes(0);
        expect(onSelectionChange).toHaveBeenCalledTimes(1);
        expect(new Set(onSelectionChange.mock.calls[0][0])).toEqual(new Set(['projects']));

        await trigger(rows[0], 'Enter');
        expect(rows[0]).toHaveAttribute('aria-expanded', 'true');
        expect(rows[0]).toHaveAttribute('data-expanded', 'true');
        expect(onExpandedChange).toHaveBeenCalledTimes(0);
        expect(onSelectionChange).toHaveBeenCalledTimes(2);
        expect(new Set(onSelectionChange.mock.calls[1][0])).toEqual(new Set([]));

        let chevron = within(rows[0]).getAllByRole('button')[0];
        await trigger(chevron, 'ArrowLeft');
        expect(rows[0]).toHaveAttribute('aria-expanded', 'false');
        expect(rows[0]).not.toHaveAttribute('data-expanded');
        expect(onExpandedChange).toHaveBeenCalledTimes(1);
        expect(new Set(onExpandedChange.mock.calls[0][0])).toEqual(new Set(['project-2', 'project-5', 'reports', 'reports-1', 'reports-1A', 'reports-1AB']));
        expect(onSelectionChange).toHaveBeenCalledTimes(2);
      });

      it('should not expand when clicking/using Enter on the row if the row has an action', async () => {
        let {getAllByRole} = render(<DynamicTree treeProps={{onAction}} />);
        let rows = getAllByRole('row');

        await user.tab();
        expect(document.activeElement).toBe(rows[0]);
        expect(rows[0]).toHaveAttribute('aria-expanded', 'true');
        expect(rows[0]).toHaveAttribute('data-expanded', 'true');
        expect(onExpandedChange).toHaveBeenCalledTimes(0);
        expect(onAction).toHaveBeenCalledTimes(0);

        await trigger(rows[0], 'Enter');
        expect(document.activeElement).toBe(rows[0]);
        expect(rows[0]).toHaveAttribute('aria-expanded', 'true');
        expect(rows[0]).toHaveAttribute('data-expanded', 'true');
        expect(onExpandedChange).toHaveBeenCalledTimes(0);
        expect(onAction).toHaveBeenCalledTimes(1);
        expect(onAction).toHaveBeenLastCalledWith('projects');

        let chevron = within(rows[0]).getAllByRole('button')[0];
        await trigger(chevron, 'ArrowLeft');
        expect(rows[0]).toHaveAttribute('aria-expanded', 'false');
        expect(rows[0]).not.toHaveAttribute('data-expanded');
        expect(onExpandedChange).toHaveBeenCalledTimes(1);
        expect(new Set(onExpandedChange.mock.calls[0][0])).toEqual(new Set(['project-2', 'project-5', 'reports', 'reports-1', 'reports-1A', 'reports-1AB']));
        expect(onAction).toHaveBeenCalledTimes(1);
      });

      it('should not expand when clicking/using Enter on the row if the row has a link', async () => {
        let {getAllByRole} = render(<DynamicTree rowProps={{href: 'https://google.com'}} />);
        let rows = getAllByRole('row');
        expect(rows[0]).toHaveAttribute('data-href');

        await user.tab();
        expect(document.activeElement).toBe(rows[0]);
        expect(rows[0]).toHaveAttribute('aria-expanded', 'true');
        expect(rows[0]).toHaveAttribute('data-expanded', 'true');
        expect(onExpandedChange).toHaveBeenCalledTimes(0);

        let onClick = mockClickDefault();
        await trigger(rows[0], 'Enter');
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(onClick.mock.calls[0][0].target).toBeInstanceOf(HTMLAnchorElement);
        expect(onClick.mock.calls[0][0].target.href).toBe('https://google.com/');
        expect(rows[0]).toHaveAttribute('aria-expanded', 'true');
        expect(rows[0]).toHaveAttribute('data-expanded', 'true');
        expect(onExpandedChange).toHaveBeenCalledTimes(0);
        expect(document.activeElement).toBe(document.body);

        await user.tab();
        let chevron = within(rows[0]).getAllByRole('button')[0];
        await trigger(chevron, 'ArrowLeft');
        expect(rows[0]).toHaveAttribute('aria-expanded', 'false');
        expect(rows[0]).not.toHaveAttribute('data-expanded');
        expect(onExpandedChange).toHaveBeenCalledTimes(1);
        expect(new Set(onExpandedChange.mock.calls[0][0])).toEqual(new Set(['project-2', 'project-5', 'reports', 'reports-1', 'reports-1A', 'reports-1AB']));
      });
    });

    it('should apply the proper attributes to the chevron', async () => {
      let {getAllByRole} = render(<DynamicTree />);
      let rows = getAllByRole('row');
      let chevron = within(rows[0]).getAllByRole('button')[0];

      await user.tab();
      expect(rows[0]).toHaveAttribute('aria-expanded', 'true');
      expect(chevron).toHaveAttribute('aria-label', 'Collapse');
      expect(chevron).toHaveAttribute('slot', 'chevron');

      await user.click(rows[0]);
      expect(rows[0]).toHaveAttribute('aria-expanded', 'false');
      expect(chevron).toHaveAttribute('aria-label', 'Expand');
    });
  });

  describe('empty state', () => {
    it('should allow the user to tab to the empty tree', async () => {
      let {getAllByRole, getByRole} = render(
        <Tree
          className={({isFocused, isFocusVisible}) => `isFocused: ${isFocused}, isFocusVisible: ${isFocusVisible}`}
          aria-label="test empty tree"
          items={[]}
          renderEmptyState={({isFocused, isFocusVisible}) => <span>{`Nothing in tree, isFocused: ${isFocused}, isFocusVisible: ${isFocusVisible}`}</span>}>
          {() => (
            <TreeItem textValue="dummy value">
              <TreeItemContent>
                Dummy Value
              </TreeItemContent>
            </TreeItem>
          )}
        </Tree>
      );

      let tree = getByRole('treegrid');
      expect(tree).toHaveAttribute('data-empty', 'true');
      expect(tree).not.toHaveAttribute('data-focused');
      expect(tree).not.toHaveAttribute('data-focus-visible');
      expect(tree).toHaveClass('isFocused: false, isFocusVisible: false');

      let row = getAllByRole('row')[0];
      expect(row).toHaveAttribute('aria-level', '1');
      expect(row).not.toHaveAttribute('aria-posinset');
      expect(row).not.toHaveAttribute('aria-setsize');
      let gridCell = within(row).getByRole('gridcell');
      expect(gridCell).toHaveTextContent('Nothing in tree, isFocused: false, isFocusVisible: false');

      await user.tab();
      expect(document.activeElement).toBe(tree);
      expect(tree).toHaveAttribute('data-empty', 'true');
      expect(tree).toHaveAttribute('data-focused', 'true');
      expect(tree).toHaveAttribute('data-focus-visible', 'true');
      expect(tree).toHaveClass('isFocused: true, isFocusVisible: true');
      expect(gridCell).toHaveTextContent('Nothing in tree, isFocused: true, isFocusVisible: true');

      await user.tab();
      expect(tree).toHaveAttribute('data-empty', 'true');
      expect(tree).not.toHaveAttribute('data-focused');
      expect(tree).not.toHaveAttribute('data-focus-visible');
      expect(tree).toHaveClass('isFocused: false, isFocusVisible: false');
      expect(row).toHaveAttribute('aria-level', '1');
      expect(row).not.toHaveAttribute('aria-posinset');
      expect(row).not.toHaveAttribute('aria-setsize');
      expect(gridCell).toHaveTextContent('Nothing in tree, isFocused: false, isFocusVisible: false');
    });
  });

  describe('load more', () => {
    let offsetHeight, scrollHeight;
    beforeAll(function () {
      scrollHeight = jest.spyOn(window.HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(() => 880);
      offsetHeight = jest.spyOn(window.HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute('role') === 'treegrid') {
          return 880;
        }

        return 40;
      });
    });

    afterAll(function () {
      offsetHeight.mockReset();
      scrollHeight.mockReset();
    });

    it('should render the load more element with the expected attributes', () => {
      let {getAllByRole} = render(<LoadingMoreTree isLoading />);

      let rows = getAllByRole('row');
      expect(rows).toHaveLength(22);
      let subRowLoader = rows[6];
      expect(subRowLoader).toHaveAttribute('data-level', '3');
      expect(subRowLoader).toHaveTextContent('Level 3 loading spinner');

      let rootLoader = rows[21];
      expect(rootLoader).toHaveAttribute('data-level', '1');
      expect(rootLoader).toHaveTextContent('Load more spinner');

      let cell = within(rootLoader).getByRole('gridcell');
      expect(cell).toHaveAttribute('aria-colindex', '1');
    });

    it('should not focus the load more row when using ArrowDown/ArrowUp', async () => {
      let {getAllByRole} = render(<LoadingMoreTree isLoading />);

      let rows = getAllByRole('row');
      let loader = rows[6];
      expect(loader).toHaveTextContent('Level 3 loading spinner');

      await user.tab();
      expect(document.activeElement).toBe(rows[0]);
      for (let i = 0; i < 5; i++) {
        await user.keyboard('{ArrowDown}');
      }
      expect(document.activeElement).toBe(rows[5]);

      await user.keyboard('{ArrowDown}');
      expect(document.activeElement).toBe(rows[7]);

      await user.keyboard('{ArrowUp}');
      expect(document.activeElement).toBe(rows[5]);
    });

    it('should not focus the load more row when using End', async () => {
      let {getAllByRole} = render(<LoadingMoreTree isLoading />);

      let rows = getAllByRole('row');
      let loader = rows[21];
      expect(loader).toHaveTextContent('Load more spinner');

      await user.tab();
      expect(document.activeElement).toBe(rows[0]);
      await user.keyboard('{End}');
      expect(document.activeElement).toBe(rows[20]);

      // Check that it didn't shift the focusedkey to the loader key even if DOM focus didn't shift to the loader
      await user.keyboard('{ArrowUp}');
      expect(document.activeElement).toBe(rows[19]);
    });

    it('should not focus the load more row when using PageDown', async () => {
      let {getAllByRole} = render(<LoadingMoreTree isLoading />);

      let rows = getAllByRole('row');
      let loader = rows[21];
      expect(loader).toHaveTextContent('Load more spinner');

      await user.tab();
      expect(document.activeElement).toBe(rows[0]);
      await user.keyboard('{PageDown}');
      expect(document.activeElement).toBe(rows[20]);

      // Check that it didn't shift the focusedkey to the loader key even if DOM focus didn't shift to the loader
      await user.keyboard('{ArrowUp}');
      expect(document.activeElement).toBe(rows[19]);
    });

    it('should not render no results state and the loader at the same time', () => {
      let {getByRole, getAllByRole, rerender} = render(<EmptyLoadingTree isLoading />);

      let rows = getAllByRole('row');
      let loader = rows[0];
      let body = getByRole('treegrid');

      expect(rows).toHaveLength(1);
      expect(body).toHaveAttribute('data-empty', 'true');
      expect(loader).toHaveTextContent('Root level loading spinner');

      rerender(<EmptyLoadingTree />);

      rows = getAllByRole('row');
      expect(rows).toHaveLength(1);
      expect(body).toHaveAttribute('data-empty', 'true');
      expect(rows[0]).toHaveTextContent('Nothing in tree');
    });
  });

  describe('loading sentinels', () => {
    let LoadingSentinelTree = (props) => {
      let {isLoading, onLoadMore, ...treeProps} = props;

      return (
        <Tree aria-label="test tree" {...treeProps}>
          <StaticTreeItem id="Photos" textValue="Photos">Photos</StaticTreeItem>
          <StaticTreeItem id="projects" textValue="Projects" title="Projects">
            <StaticTreeItem id="projects-1" textValue="Projects-1" title="Projects-1">
              <StaticTreeItem id="projects-1A" textValue="Projects-1A">
                Projects-1A
              </StaticTreeItem>
              <TreeLoadMoreItem isLoading={isLoading} onLoadMore={onLoadMore}>
                Loading...
              </TreeLoadMoreItem>
            </StaticTreeItem>
            <StaticTreeItem id="projects-2" textValue="Projects-2">
              Projects-2
            </StaticTreeItem>
            <StaticTreeItem id="projects-3" textValue="Projects-3">
              Projects-3
            </StaticTreeItem>
          </StaticTreeItem>
          <TreeLoadMoreItem isLoading={isLoading} onLoadMore={onLoadMore}>
            Loading...
          </TreeLoadMoreItem>
        </Tree>
      );
    };

    let onLoadMore = jest.fn();
    let observe = jest.fn();
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should render the loading elements when loading', async () => {
      let tree = render(<LoadingSentinelTree isLoading expandedKeys={[]} />);

      let treeTester = testUtilUser.createTester('Tree', {root: tree.getByRole('treegrid')});
      let rows = treeTester.rows;
      expect(rows).toHaveLength(3);
      let loaderRow = rows[2];
      expect(loaderRow).toHaveTextContent('Loading...');

      let sentinel = tree.getByTestId('loadMoreSentinel');
      expect(sentinel.closest('[inert]')).toBeTruthy;

      // Should render the second sentinel if the row is expanded
      tree.rerender(<LoadingSentinelTree expandedKeys={new Set(['projects', 'projects-1'])} isLoading />);
      rows = treeTester.rows;
      expect(rows).toHaveLength(8);
      let newLoaderRow = rows[4];
      expect(newLoaderRow).toHaveTextContent('Loading...');

      loaderRow = rows[7];
      expect(loaderRow).toHaveTextContent('Loading...');
      let sentinels = tree.queryAllByTestId('loadMoreSentinel');
      expect(sentinels).toHaveLength(2);
    });

    it('should render the sentinel but not the loading indicator when not loading', async () => {
      let tree = render(<LoadingSentinelTree />);

      let treeTester = testUtilUser.createTester('Tree', {root: tree.getByRole('treegrid')});
      let rows = treeTester.rows;
      expect(rows).toHaveLength(2);
      expect(tree.queryByText('Loading...')).toBeFalsy();
      expect(tree.getByTestId('loadMoreSentinel')).toBeInTheDocument();
    });

    it('should only fire loadMore when intersection is detected regardless of loading state', async () => {
      let observer = setupIntersectionObserverMock({
        observe
      });

      let tree = render(<LoadingSentinelTree onLoadMore={onLoadMore} isLoading />);
      let sentinel = tree.getByTestId('loadMoreSentinel');
      expect(observe).toHaveBeenLastCalledWith(sentinel);
      expect(onLoadMore).toHaveBeenCalledTimes(0);

      act(() => {observer.instance.triggerCallback([{isIntersecting: true}]);});
      expect(onLoadMore).toHaveBeenCalledTimes(1);
      observe.mockClear();

      tree.rerender(<LoadingSentinelTree onLoadMore={onLoadMore} />);
      expect(observe).toHaveBeenLastCalledWith(sentinel);
      expect(onLoadMore).toHaveBeenCalledTimes(1);

      act(() => {observer.instance.triggerCallback([{isIntersecting: true}]);});
      expect(onLoadMore).toHaveBeenCalledTimes(2);
    });

    describe('virtualized', () => {
      let projects: {id: string, value: string}[] = [];
      let projectsLevel3: {id: string, value: string}[] = [];
      let documents: {id: string, value: string}[] = [];
      for (let i = 0; i < 10; i++) {
        projects.push({id: `projects-${i}`, value: `Projects-${i}`});
        projectsLevel3.push({id: `project-1-${i}`, value: `Projects-1-${i}`});
        documents.push({id: `document-${i}`, value: `Document-${i}`});
      }
      let root = [
        {id: 'photos-1', value: 'Photos 1'},
        {id: 'photos-2', value: 'Photos 2'},
        {id: 'projects', value: 'Projects'},
        {id: 'photos-3', value: 'Photos 3'},
        {id: 'photos-4', value: 'Photos 4'},
        {id: 'documents', value: 'Documents'},
        {id: 'photos-5', value: 'Photos 5'},
        {id: 'photos-6', value: 'Photos 6'}
      ];
      let clientWidth, clientHeight;

      beforeAll(() => {
        clientWidth = jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 100);
        clientHeight = jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 100);
      });

      afterAll(function () {
        clientWidth.mockReset();
        clientHeight.mockReset();
      });

      let VirtualizedLoadingSentinelTree = (props) => {
        let {
          rootData = root,
          rootIsLoading,
          projectsData = projects,
          projectsIsLoading,
          projects3Data = projectsLevel3,
          projects3IsLoading,
          documentData = documents,
          documentsIsLoading,
          ...treeProps
        } = props;
        return (
          <Virtualizer layout={ListLayout} layoutOptions={{rowHeight: 25, loaderHeight: 30}}>
            <Tree
              {...treeProps}
              aria-label="multi loader tree">
              <Collection items={rootData} dependencies={[projectsIsLoading, documentsIsLoading]}>
                {(item: any) => {
                  if (item.id === 'projects') {
                    return (
                      <StaticTreeItem id="projects" textValue="Projects" title="Projects">
                        <Collection items={projectsData} dependencies={[projects3IsLoading]}>
                          {(item: any) => {
                            return item.id !== 'projects-1' ?
                              (
                                <StaticTreeItem id={item.id} textValue={item.value}>
                                  {item.value}
                                </StaticTreeItem>
                              ) : (
                                <StaticTreeItem id="projects-1" textValue="Projects-1" title="Projects-1">
                                  <Collection items={projects3Data}>
                                    {(item: any) => (
                                      <StaticTreeItem id={item.id} textValue={item.value}>
                                        {item.value}
                                      </StaticTreeItem>
                                    )}
                                  </Collection>
                                  <TreeLoadMoreItem isLoading={projects3IsLoading}>
                                    Loading...
                                  </TreeLoadMoreItem>
                                </StaticTreeItem>
                              );
                          }
                        }
                        </Collection>
                        <TreeLoadMoreItem isLoading={projectsIsLoading}>
                          Loading...
                        </TreeLoadMoreItem>
                      </StaticTreeItem>
                    );
                  } else if (item.id === 'documents') {
                    return (
                      <StaticTreeItem id="documents" textValue="Documents" title="Documents">
                        <Collection items={documentData}>
                          {(item: any) => (
                            <StaticTreeItem id={item.id} textValue={item.value}>
                              {item.value}
                            </StaticTreeItem>
                          )}
                        </Collection>
                        <TreeLoadMoreItem isLoading={documentsIsLoading}>
                          Loading...
                        </TreeLoadMoreItem>
                      </StaticTreeItem>
                    );
                  } else {
                    return (
                      <StaticTreeItem id={item.id} textValue={item.value}>{item.value}</StaticTreeItem>
                    );
                  }
                }}
              </Collection>
              <TreeLoadMoreItem isLoading={rootIsLoading}>
                Loading...
              </TreeLoadMoreItem>
            </Tree>
          </Virtualizer>
        );
      };

      it('should always render the sentinel even when virtualized', async () => {
        let tree = render(
          <VirtualizedLoadingSentinelTree
            expandedKeys={[]}
            rootIsLoading
            projectsIsLoading
            projects3IsLoading
            documentsIsLoading />
        );
        let treeTester = testUtilUser.createTester('Tree', {root: tree.getByRole('treegrid')});
        let rows = treeTester.rows;
        expect(rows).toHaveLength(8);
        let rootLoaderRow = rows[7];
        expect(rootLoaderRow).toHaveTextContent('Loading...');
        expect(rootLoaderRow).not.toHaveAttribute('aria-posinset');
        expect(rootLoaderRow).not.toHaveAttribute('aria-setsize');
        let rootLoaderParentStyles = rootLoaderRow.parentElement!.style;
        // 8 items * 25px
        expect(rootLoaderParentStyles.top).toBe('200px');
        expect(rootLoaderParentStyles.height).toBe('30px');
        let sentinel = tree.getByTestId('loadMoreSentinel');
        expect(sentinel.closest('[inert]')).toBeTruthy;
        let sentinels = tree.queryAllByTestId('loadMoreSentinel');
        expect(sentinels).toHaveLength(1);

        // Expand projects, adding 10 rows to the tree
        tree.rerender(
          <VirtualizedLoadingSentinelTree
            expandedKeys={['projects']}
            rootIsLoading
            projectsIsLoading
            projects3IsLoading
            documentsIsLoading />
        );

        rows = treeTester.rows;
        expect(rows).toHaveLength(9);
        rootLoaderRow = rows[8];
        rootLoaderParentStyles = rootLoaderRow.parentElement!.style;
        // 18 items * 25px + intermediate loader * 30px
        expect(rootLoaderParentStyles.top).toBe('480px');
        expect(rootLoaderParentStyles.height).toBe('30px');
        let projectsLoader = rows[7];
        expect(projectsLoader).not.toHaveAttribute('aria-posinset');
        expect(projectsLoader).not.toHaveAttribute('aria-setsize');
        let projectsLoaderParentStyles = projectsLoader.parentElement!.style;
        // 13 items * 25px
        expect(projectsLoaderParentStyles.top).toBe('325px');
        expect(projectsLoaderParentStyles.height).toBe('30px');
        sentinels = tree.queryAllByTestId('loadMoreSentinel');
        expect(sentinels).toHaveLength(2);
        for (let sentinel of sentinels) {
          expect(sentinel.closest('[inert]')).toBeTruthy;
        }

        // Expand projects-1, adding 10 rows to the tree
        tree.rerender(
          <VirtualizedLoadingSentinelTree
            expandedKeys={['projects', 'projects-1']}
            rootIsLoading
            projectsIsLoading
            projects3IsLoading
            documentsIsLoading />
        );

        rows = treeTester.rows;
        expect(rows).toHaveLength(10);
        rootLoaderRow = rows[9];
        rootLoaderParentStyles = rootLoaderRow.parentElement!.style;
        // 28 items * 25px + 2 intermediate loaders * 30px
        expect(rootLoaderParentStyles.top).toBe('760px');
        expect(rootLoaderParentStyles.height).toBe('30px');
        // Project loader is still the 2nd to last item that is preserved since the projects-1 is a child folder
        projectsLoader = rows[8];
        projectsLoaderParentStyles = projectsLoader.parentElement!.style;
        // 23 items * 25px + 1 intermediate loaders * 30px
        expect(projectsLoaderParentStyles.top).toBe('605px');
        expect(projectsLoaderParentStyles.height).toBe('30px');
        // Project-1 loader is 3rd to last item that is preserved since it is in the child folder of projects
        let projects1Loader = rows[7];
        expect(projects1Loader).not.toHaveAttribute('aria-posinset');
        expect(projects1Loader).not.toHaveAttribute('aria-setsize');
        let projectsLoader1ParentStyles = projects1Loader.parentElement!.style;
        // 15 items * 25px aka photos-1 -> 2 + projects + projects-0 -> 1 +  10 items in the folder
        expect(projectsLoader1ParentStyles.top).toBe('375px');
        expect(projectsLoader1ParentStyles.height).toBe('30px');
        sentinels = tree.queryAllByTestId('loadMoreSentinel');
        expect(sentinels).toHaveLength(3);
        for (let sentinel of sentinels) {
          expect(sentinel.closest('[inert]')).toBeTruthy;
        }

        // Expand projects-1, adding 10 rows to the tree
        tree.rerender(
          <VirtualizedLoadingSentinelTree
            expandedKeys={['projects', 'projects-1', 'documents']}
            rootIsLoading
            projectsIsLoading
            projects3IsLoading
            documentsIsLoading />
        );

        rows = treeTester.rows;
        expect(rows).toHaveLength(11);
        rootLoaderRow = rows[10];
        rootLoaderParentStyles = rootLoaderRow.parentElement!.style;
        // 38 items * 25px + 3 intermediate loaders * 30px
        expect(rootLoaderParentStyles.top).toBe('1040px');
        expect(rootLoaderParentStyles.height).toBe('30px');
        // Project loader is now the 3nd to last item since document's loader is after it
        projectsLoader = rows[8];
        projectsLoaderParentStyles = projectsLoader.parentElement!.style;
        // 23 items * 25px + 1 intermediate loaders * 30px
        expect(projectsLoaderParentStyles.top).toBe('605px');
        expect(projectsLoaderParentStyles.height).toBe('30px');
        // Project-1 loader is 4th to last item
        projects1Loader = rows[7];
        projectsLoader1ParentStyles = projects1Loader.parentElement!.style;
        // 15 items * 25px aka photos-1 -> 2 + projects + projects-0 -> 1 +  10 items in the folder
        expect(projectsLoader1ParentStyles.top).toBe('375px');
        expect(projectsLoader1ParentStyles.height).toBe('30px');
        // Document loader is 2nd to last item
        let documentLoader = rows[9];
        expect(documentLoader).not.toHaveAttribute('aria-posinset');
        expect(documentLoader).not.toHaveAttribute('aria-setsize');
        let documentLoader1ParentStyles = documentLoader.parentElement!.style;
        // 36 items * 25px + 2 intermediate loaders * 30px
        expect(documentLoader1ParentStyles.top).toBe('960px');
        expect(documentLoader1ParentStyles.height).toBe('30px');

        sentinels = tree.queryAllByTestId('loadMoreSentinel');
        expect(sentinels).toHaveLength(4);
        for (let sentinel of sentinels) {
          expect(sentinel.closest('[inert]')).toBeTruthy;
        }
      });

      it('should not reserve room for the loader if isLoading is false', async () => {
        let tree = render(
          <VirtualizedLoadingSentinelTree
            expandedKeys={['projects', 'projects-1', 'documents']}
            rootIsLoading
            documentsIsLoading />
        );

        let treeTester = testUtilUser.createTester('Tree', {root: tree.getByRole('treegrid')});
        let rows = treeTester.rows;
        expect(rows).toHaveLength(9);
        let rootLoaderRow = rows[8];
        let rootLoaderParentStyles = rootLoaderRow.parentElement!.style;
        // 38 items * 25px + 1 intermediate loaders * 30px
        expect(rootLoaderParentStyles.top).toBe('980px');
        expect(rootLoaderParentStyles.height).toBe('30px');

        // Sentinels that aren't in a loading state don't have a "row" rendered but still have a virtualizer node
        let sentinels = tree.queryAllByTestId('loadMoreSentinel');
        expect(sentinels).toHaveLength(4);
        let projectsLoader = sentinels[1].closest('[inert]')!;
        let projectsLoaderParentStyles = projectsLoader.parentElement!.style;
        // 23 items * 25px
        expect(projectsLoaderParentStyles.top).toBe('575px');
        expect(projectsLoaderParentStyles.height).toBe('0px');

        let projects1Loader = sentinels[0].closest('[inert]')!;
        let projectsLoader1ParentStyles = projects1Loader.parentElement!.style;
        // 15 items * 25px aka photos-1 -> 2 + projects + projects-0 -> 1 +  10 items in the folder
        expect(projectsLoader1ParentStyles.top).toBe('375px');
        expect(projectsLoader1ParentStyles.height).toBe('0px');

        let documentLoader = rows[7];
        let documentLoader1ParentStyles = documentLoader.parentElement!.style;
        // 36 items * 25px
        expect(documentLoader1ParentStyles.top).toBe('900px');
        expect(documentLoader1ParentStyles.height).toBe('30px');
      });

      // TODO: bring this back when we enable keyboard focus on tree loaders again
      it.skip('should restore focus to the tree if the loader is keyboard focused when loading finishes', async () => {
        let tree = render(
          <VirtualizedLoadingSentinelTree rootIsLoading />
        );
        let treeTester = testUtilUser.createTester('Tree', {root: tree.getByRole('treegrid')});
        let rows = treeTester.rows;
        expect(rows).toHaveLength(8);
        let rootLoaderRow = rows[7];
        expect(rootLoaderRow).toHaveTextContent('Loading...');

        await user.tab();
        await user.keyboard('{End}');
        expect(document.activeElement).toBe(rootLoaderRow);

        tree.rerender(
          <VirtualizedLoadingSentinelTree />
        );

        expect(document.activeElement).toBe(treeTester.tree);
      });
    });
  });

  describe('shouldSelectOnPressUp', () => {
    it('should select an item on pressing down when shouldSelectOnPressUp is not provided', async () => {
      let onSelectionChange = jest.fn();
      let {getAllByRole} = render(<StaticTree treeProps={{selectionMode: 'single', onSelectionChange}} />);
      let items = getAllByRole('row');

      await user.pointer({target: items[0], keys: '[MouseLeft>]'});
      expect(onSelectionChange).toBeCalledTimes(1);

      await user.pointer({target: items[0], keys: '[/MouseLeft]'});
      expect(onSelectionChange).toBeCalledTimes(1);
    });

    it('should select an item on pressing down when shouldSelectOnPressUp is false', async () => {
      let onSelectionChange = jest.fn();
      let {getAllByRole} =  render(<StaticTree treeProps={{selectionMode: 'single', onSelectionChange, shouldSelectOnPressUp: false}} />);
      let items = getAllByRole('row');

      await user.pointer({target: items[0], keys: '[MouseLeft>]'});
      expect(onSelectionChange).toBeCalledTimes(1);

      await user.pointer({target: items[0], keys: '[/MouseLeft]'});
      expect(onSelectionChange).toBeCalledTimes(1);
    });

    it('should select an item on pressing up when shouldSelectOnPressUp is true', async () => {
      let onSelectionChange = jest.fn();
      let {getAllByRole} = render(<StaticTree treeProps={{selectionMode: 'single', onSelectionChange, shouldSelectOnPressUp: true}} />);
      let items = getAllByRole('row');

      await user.pointer({target: items[0], keys: '[MouseLeft>]'});
      expect(onSelectionChange).toBeCalledTimes(0);

      await user.pointer({target: items[0], keys: '[/MouseLeft]'});
      expect(onSelectionChange).toBeCalledTimes(1);
    });
  });

  describe('drag and drop', () => {
    let getItems = jest.fn();
    function DnDTree(props) {
      let treeData = useTreeData<any>({
        initialItems: rows,
        getKey: item => item.id,
        getChildren: item => item.childItems
      });

      let {dragAndDropHooks} = useDragAndDrop({
        getItems: (keys) => {
          getItems(keys);
          return [...keys].map((key) => ({
            'text/plain': treeData.getItem(key)?.value.name
          }));
        },
        getAllowedDropOperations: () => ['move']
      });

      return (
        <Tree dragAndDropHooks={dragAndDropHooks} aria-label="Tree with drag and drop" items={treeData.items} {...props}>
          {(item: any) => (
            <DynamicTreeItem id={item.key} childItems={item.children ?? []} textValue={item.value.name} supportsDragging>
              {item.value.name}
            </DynamicTreeItem>
          )}
        </Tree>
      );
    }

    afterEach(() => {
      act(() => {jest.runAllTimers();});
      jest.clearAllMocks();
    });

    it('should support drag button slot', () => {
      let {getAllByRole} = render(<DraggableTree />);
      let button = getAllByRole('button')[0];
      expect(button).toHaveAttribute('aria-label', 'Drag Projects');
    });

    it('should render drop indicators', async () => {
      let onReorder = jest.fn();
      let {getAllByRole} = render(<DraggableTree onReorder={onReorder} renderDropIndicator={(target) => <DropIndicator target={target}>Test</DropIndicator>} />);
      await user.tab();
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{Enter}');
      act(() => jest.runAllTimers());

      let rows = getAllByRole('row');
      expect(rows).toHaveLength(4);
      expect(rows[0]).toHaveAttribute('class', 'react-aria-DropIndicator');
      expect(rows[0]).not.toHaveAttribute('data-drop-target', 'true');
      expect(rows[0]).toHaveTextContent('Test');
      expect(within(rows[0]).getByRole('button')).toHaveAttribute('aria-label', 'Insert before Projects');
      expect(rows[2]).toHaveAttribute('class', 'react-aria-DropIndicator');
      expect(rows[2]).toHaveAttribute('data-drop-target');
      expect(within(rows[2]).getByRole('button')).toHaveAttribute('aria-label', 'Insert between Projects and Reports');
      expect(rows[3]).toHaveAttribute('class', 'react-aria-DropIndicator');
      expect(rows[3]).not.toHaveAttribute('data-drop-target');
      expect(within(rows[3]).getByRole('button')).toHaveAttribute('aria-label', 'Insert after Reports');

      await user.keyboard('{ArrowDown}');

      expect(document.activeElement).toHaveAttribute('aria-label', 'Insert after Reports');
      expect(rows[0]).not.toHaveAttribute('data-drop-target', 'true');
      expect(rows[2]).not.toHaveAttribute('data-drop-target', 'true');
      expect(rows[3]).toHaveAttribute('data-drop-target', 'true');

      await user.keyboard('{Enter}');
      act(() => jest.runAllTimers());

      expect(onReorder).toHaveBeenCalledTimes(1);
    });

    it('should support dropping on items', async () => {
      let onItemDrop = jest.fn();
      let {getAllByRole} = render(<>
        <DraggableTree />
        <DraggableTree onItemDrop={onItemDrop} />
      </>);

      await user.tab();
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{Enter}');
      act(() => jest.runAllTimers());

      let tree = getAllByRole('treegrid')[1];
      let rows = within(tree).getAllByRole('row');
      expect(rows).toHaveLength(20);
      expect(within(rows[0]).getAllByRole('button')[0]).toHaveAttribute('aria-label', 'Drop on Projects');
      expect(rows[0].nextElementSibling).toHaveAttribute('data-drop-target', 'true');
      expect(within(rows[1]).getAllByRole('button')[0]).toHaveAttribute('aria-label', 'Drop on Project 1');
      expect(rows[1].nextElementSibling).not.toHaveAttribute('data-drop-target');
      expect(within(rows[2]).getAllByRole('button')[0]).toHaveAttribute('aria-label', 'Drop on Project 2');
      expect(rows[2].nextElementSibling).not.toHaveAttribute('data-drop-target');

      expect(document.activeElement).toBe(within(rows[0]).getAllByRole('button')[0]);

      await user.keyboard('{Enter}');
      act(() => jest.runAllTimers());

      expect(onItemDrop).toHaveBeenCalledTimes(1);
    });

    it('should support dropping on the root', async () => {
      let onRootDrop = jest.fn();
      let {getAllByRole} = render(<>
        <DraggableTree />
        <DraggableTree onRootDrop={onRootDrop} />
      </>);

      await user.tab();
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{Enter}');
      act(() => jest.runAllTimers());

      let tree = getAllByRole('treegrid')[1];
      let rows = within(tree).getAllByRole('row');
      expect(rows).toHaveLength(1);
      expect(within(rows[0]).getAllByRole('button')[0]).toHaveAttribute('aria-label', 'Drop on');
      expect(document.activeElement).toBe(within(rows[0]).getAllByRole('button')[0]);
      expect(tree).toHaveAttribute('data-drop-target', 'true');

      await user.keyboard('{Enter}');
      act(() => jest.runAllTimers());

      expect(onRootDrop).toHaveBeenCalledTimes(1);
    });

    it('should support disabled drag and drop', async () => {
      let {getByRole, queryAllByRole} = render(
        <DraggableTree isDisabled />
      );

      let dragButtons = queryAllByRole('button').filter(button => button.getAttribute('slot') === 'drag');
      dragButtons.forEach(button => {
        expect(button).toBeDisabled();
      });

      let tree = getByRole('treegrid');
      expect(tree).not.toHaveAttribute('data-allows-dragging', 'true');
      expect(tree).not.toHaveAttribute('draggable', 'true');

      let rows = within(tree).getAllByRole('row');
      rows.forEach(row => {
        expect(row).not.toHaveAttribute('draggable', 'true');
      });
    });

    it('should allow selection even when drag and drop is disabled', async () => {
      let {getByRole, getAllByRole} = render(
        <DraggableTreeWithSelection isDisabled />
    );

      for (let row of getAllByRole('row')) {
        let checkbox = within(row).getByRole('checkbox');
        expect(checkbox).not.toBeChecked();
      }

      let checkbox = getAllByRole('checkbox')[0];
      expect(checkbox).toHaveAttribute('aria-label', 'Select');

      await user.click(checkbox);

      let tree = getByRole('treegrid');
      let rows = within(tree).getAllByRole('row');
      expect(rows[0]).toHaveAttribute('data-selected', 'true');
      expect(checkbox).toBeChecked();
    });

    it('should filter out selected child keys in getItems if a parent is also selected', async () => {
      let {getAllByRole} = render(
        <DnDTree selectionMode="multiple" selectedKeys={new Set(['projects', 'project-1', 'reports', 'reports-1AB', 'reports-2'])} />
      );

      let rows = getAllByRole('row');
      let projectsRow = rows[0];
      expect(projectsRow).toHaveAttribute('aria-selected', 'true');

      let dataTransfer = new DataTransfer();

      fireEvent.pointerDown(projectsRow, {pointerType: 'mouse', button: 0, pointerId: 1, clientX: 5, clientY: 5});
      fireEvent(projectsRow, new DragEvent('dragstart', {dataTransfer, clientX: 5, clientY: 5}));
      fireEvent.pointerUp(projectsRow, {button: 0, pointerId: 1, clientX: 5, clientY: 5});
      fireEvent(projectsRow, new DragEvent('dragend', {dataTransfer, clientX: 5, clientY: 5}));
      expect(getItems).toHaveBeenCalledTimes(1);
      expect(getItems).toHaveBeenCalledWith(new Set(['projects', 'reports']));
    });
  });

  describe('press events', () => {
    it.each`
      interactionType
      ${'mouse'}
      ${'keyboard'}
    `('should support press events on items when using $interactionType', async function ({interactionType}) {
      let onAction = jest.fn();
      let onPressStart = jest.fn();
      let onPressEnd = jest.fn();
      let onPress = jest.fn();
      let onClick = jest.fn();
      let {getByRole} = render(<StaticTree rowProps={{onAction, onPressStart, onPressEnd, onPress, onClick}} />);
      let gridListTester = testUtilUser.createTester('GridList', {root: getByRole('treegrid')});
      await gridListTester.triggerRowAction({row: 1, interactionType});
  
      expect(onAction).toHaveBeenCalledTimes(1);
      expect(onPressStart).toHaveBeenCalledTimes(1);
      expect(onPressEnd).toHaveBeenCalledTimes(1);
      expect(onPress).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});

AriaTreeTests({
  prefix: 'rac-static',
  renderers: {
    standard: () => render(
      <Tree aria-label="test tree">
        <StaticTreeItem id="Photos" textValue="Photos">Photos</StaticTreeItem>
        <StaticTreeItem id="projects" textValue="Projects" title="Projects">
          <StaticTreeItem id="projects-1" textValue="Projects-1" title="Projects-1">
            <StaticTreeItem id="projects-1A" textValue="Projects-1A">
              Projects-1A
            </StaticTreeItem>
          </StaticTreeItem>
          <StaticTreeItem id="projects-2" textValue="Projects-2">
            Projects-2
          </StaticTreeItem>
          <StaticTreeItem id="projects-3" textValue="Projects-3">
            Projects-3
          </StaticTreeItem>
        </StaticTreeItem>
        <StaticTreeItem id="school" textValue="School" title="School">
          <StaticTreeItem id="homework-1" textValue="Homework-1" title="Homework-1">
            <StaticTreeItem id="homework-1A" textValue="Homework-1A">
              Homework-1A
            </StaticTreeItem>
          </StaticTreeItem>
          <StaticTreeItem id="homework-2" textValue="Homework-2">
            Homework-2
          </StaticTreeItem>
          <StaticTreeItem id="homework-3" textValue="Homework-3">
            Homework-3
          </StaticTreeItem>
        </StaticTreeItem>
      </Tree>
    ),
    singleSelection: () => render(
      <Tree aria-label="test tree" selectionMode="single" disabledKeys={['school']} disabledBehavior="selection">
        <StaticTreeItem id="Photos" textValue="Photos">Photos</StaticTreeItem>
        <StaticTreeItem id="projects" textValue="Projects" title="Projects">
          <StaticTreeItem id="projects-1" textValue="Projects-1" title="Projects-1">
            <StaticTreeItem id="projects-1A" textValue="Projects-1A">
              Projects-1A
            </StaticTreeItem>
          </StaticTreeItem>
          <StaticTreeItem id="projects-2" textValue="Projects-2">
            Projects-2
          </StaticTreeItem>
          <StaticTreeItem id="projects-3" textValue="Projects-3">
            Projects-3
          </StaticTreeItem>
        </StaticTreeItem>
        <StaticTreeItem id="school" textValue="School" title="School">
          <StaticTreeItem id="homework-1" textValue="Homework-1" title="Homework-1">
            <StaticTreeItem id="homework-1A" textValue="Homework-1A">
              Homework-1A
            </StaticTreeItem>
          </StaticTreeItem>
          <StaticTreeItem id="homework-2" textValue="Homework-2">
            Homework-2
          </StaticTreeItem>
          <StaticTreeItem id="homework-3" textValue="Homework-3">
            Homework-3
          </StaticTreeItem>
        </StaticTreeItem>
      </Tree>
    ),
    allInteractionsDisabled: () => render(
      <Tree aria-label="test tree" selectionMode="single" disabledKeys={['school']} disabledBehavior="all">
        <StaticTreeItem id="Photos" textValue="Photos">Photos</StaticTreeItem>
        <StaticTreeItem id="projects" textValue="Projects" title="Projects">
          <StaticTreeItem id="projects-1" textValue="Projects-1" title="Projects-1">
            <StaticTreeItem id="projects-1A" textValue="Projects-1A">
              Projects-1A
            </StaticTreeItem>
          </StaticTreeItem>
          <StaticTreeItem id="projects-2" textValue="Projects-2">
            Projects-2
          </StaticTreeItem>
          <StaticTreeItem id="projects-3" textValue="Projects-3">
            Projects-3
          </StaticTreeItem>
        </StaticTreeItem>
        <StaticTreeItem id="school" textValue="School" title="School">
          <StaticTreeItem id="homework-1" textValue="Homework-1" title="Homework-1">
            <StaticTreeItem id="homework-1A" textValue="Homework-1A">
              Homework-1A
            </StaticTreeItem>
          </StaticTreeItem>
          <StaticTreeItem id="homework-2" textValue="Homework-2">
            Homework-2
          </StaticTreeItem>
          <StaticTreeItem id="homework-3" textValue="Homework-3">
            Homework-3
          </StaticTreeItem>
        </StaticTreeItem>
      </Tree>
    )
  }
});

let controlledRows = [
  {id: 'photos', name: 'Photos 1'},
  {id: 'projects', name: 'Projects', childItems: [
    {id: 'project-1', name: 'Project 1', childItems: [
      {id: 'project-1A', name: 'Project 1A'}
    ]},
    {id: 'project-2', name: 'Project 2'},
    {id: 'project-3', name: 'Project 3'}
  ]},
  {id: 'reports', name: 'Reports', childItems: [
    {id: 'reports-1', name: 'Reports 1', childItems: [
      {id: 'reports-1A', name: 'Reports 1A'}
    ]},
    {id: 'reports-2', name: 'Reports 2'},
    {id: 'reports-3', name: 'Reports 3'}
  ]}
];

let ControlledDynamicTreeItem = (props) => {
  return (
    <TreeItem {...props}>
      <TreeItemContent>
        {({isExpanded, hasChildItems, selectionMode, selectionBehavior}) => (
          <>
            {(selectionMode !== 'none' || props.href != null) && selectionBehavior === 'toggle' && (
              <Checkbox slot="selection" />
            )}
            {hasChildItems && <Button slot="chevron">{isExpanded ? '⏷' : '⏵'}</Button>}
            <Text>{props.title || props.children}</Text>
            <Button aria-label="Info">ⓘ</Button>
            <Button aria-label="Menu">☰</Button>
          </>
        )}
      </TreeItemContent>
      <Collection items={props.childItems}>
        {(item: any) => (
          <ControlledDynamicTreeItem childItems={item.childItems} textValue={item.name} href={props.href}>
            {item.name}
          </ControlledDynamicTreeItem>
        )}
      </Collection>
    </TreeItem>
  );
};

function ControlledDynamicTree(props) {
  let [expanded, setExpanded] = React.useState(new Set([]));

  return (
    <Tree {...props} items={controlledRows} aria-label="example dynamic tree" expandedKeys={expanded} onExpandedChange={setExpanded}>
      {(item: any) => (
        <ControlledDynamicTreeItem childItems={item.childItems} textValue={item.name}>
          {item.name}
        </ControlledDynamicTreeItem>
    )}
    </Tree>
  );
}

AriaTreeTests({
  prefix: 'rac-controlled-dynamic',
  renderers: {
    standard: () => render(
      <ControlledDynamicTree />
    ),
    singleSelection: () => render(
      <ControlledDynamicTree disabledKeys={['reports']} selectionMode="single" disabledBehavior="selection" />
    ),
    allInteractionsDisabled: () => render(
      <ControlledDynamicTree disabledKeys={['reports']} selectionMode="single"  />
    )
  }
});
