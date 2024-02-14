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

import {act, fireEvent, pointerMap, render, within} from '@react-spectrum/test-utils';
import {Button, Checkbox, Text, Tree, TreeItem, TreeItemContent} from '../';
import React from 'react';
import userEvent from '@testing-library/user-event';

let StaticTreeItem = (props) => {
  return (
    <TreeItem {...props}>
      <TreeItemContent>
        {({isExpanded, hasChildRows, selectionMode, selectionBehavior}) => (
          <>
            {(selectionMode === 'multiple' || props.href != null) && selectionBehavior === 'toggle' && (
              <Checkbox slot="selection" />
            )}
            {hasChildRows && <Button slot="chevron">{isExpanded ? '⏷' : '⏵'}</Button>}
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

let StaticTree = ({treeProps, rowProps}) => (
  <Tree defaultExpandedKeys="all" aria-label="test tree" {...treeProps}>
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

// let DynamicTree = () => {

// };


let onSelectionChange = jest.fn();
let onAction = jest.fn();

describe('Tree', () => {
  let user;

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

  it('should have the base set of aria and data attributes', () => {
    let {getByRole, getAllByRole} = render(<StaticTree treeProps={{defaultExpandedKeys: 'none'}} />);
    let tree = getByRole('treegrid');
    expect(tree).toHaveAttribute('data-rac');
    expect(tree).not.toHaveAttribute('data-empty');
    expect(tree).not.toHaveAttribute('data-focused');
    expect(tree).not.toHaveAttribute('data-focus-visible');

    for (let row of getAllByRole('row')) {
      expect(row).toHaveAttribute('data-expanded', 'false');
      expect(row).toHaveAttribute('aria-level');
      expect(row).toHaveAttribute('data-level');
      expect(row).toHaveAttribute('aria-posinset');
      expect(row).toHaveAttribute('aria-setsize');
      expect(row).toHaveAttribute('data-has-child-rows');
      expect(row).toHaveAttribute('data-rac');
           // tested
      expect(row).not.toHaveAttribute('data-selected');
            // tested
      expect(row).not.toHaveAttribute('data-disabled');
      // tested
      expect(row).not.toHaveAttribute('data-hovered');
         // tested
      expect(row).not.toHaveAttribute('data-focused');
           // tested
      expect(row).not.toHaveAttribute('data-focus-visible');
           // tested
      expect(row).not.toHaveAttribute('data-pressed');
           // tested
      expect(row).not.toHaveAttribute('data-selection-mode');
    }
  });

  it('should render checkboxes for selection', async () => {
    let {getByRole, getAllByRole} = render(<StaticTree treeProps={{selectionMode: 'single', onSelectionChange}} rowProps={{href: 'https://google.com'}} />);
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
    let {getByRole, getAllByRole} = render(<StaticTree treeProps={{selectionMode: 'multiple', selectionBehavior: 'replace', onSelectionChange}} />);
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

  describe('general interactions', () => {
    it('should support hover on rows', async () => {
      let {getAllByRole, rerender} = render(<StaticTree treeProps={{selectionMode: 'multiple'}} rowProps={{className: ({isHovered}) => isHovered ? 'hover' : ''}} />);

      let row = getAllByRole('row')[0];
      expect(row).not.toHaveAttribute('data-hovered');
      expect(row).not.toHaveClass('hover');

      await user.hover(row);
      expect(row).toHaveAttribute('data-hovered', 'true');
      expect(row).toHaveClass('hover');

      await user.unhover(row);
      expect(row).not.toHaveAttribute('data-hovered');
      expect(row).not.toHaveClass('hover');

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
      let {getAllByRole, rerender} = render(<StaticTree treeProps={{selectionMode: 'none'}} rowProps={{className: ({isHovered}) => isHovered ? 'hover' : ''}} />);

      let row = getAllByRole('row')[0];
      expect(row).not.toHaveAttribute('data-hovered');
      expect(row).not.toHaveClass('hover');

      await user.hover(row);
      expect(row).not.toHaveAttribute('data-hovered');
      expect(row).not.toHaveClass('hover');

      let expandableRow = getAllByRole('row')[1];
      expect(expandableRow).not.toHaveAttribute('data-hovered');
      expect(expandableRow).not.toHaveClass('hover');

      await user.hover(expandableRow);
      expect(expandableRow).toHaveAttribute('data-hovered', 'true');
      expect(expandableRow).toHaveClass('hover');

      await user.unhover(expandableRow);
      expect(expandableRow).not.toHaveAttribute('data-hovered');
      expect(expandableRow).not.toHaveClass('hover');

      // Test a completely inert expandable row
      // Note the disabledBehavior setting here, by default we make disableKey keys NOT restrict expandablity of the row. Similar pattern to Table
      rerender(<StaticTree treeProps={{selectionMode: 'none', disabledBehavior: 'all', disabledKeys: ['projects']}} rowProps={{className: ({isHovered}) => isHovered ? 'hover' : ''}} />);

      expandableRow = getAllByRole('row')[1];
      expect(expandableRow).toHaveAttribute('data-disabled', 'true');
      expect(expandableRow).not.toHaveAttribute('data-hovered');
      expect(expandableRow).not.toHaveClass('hover');

      await user.hover(expandableRow);
      expect(expandableRow).not.toHaveAttribute('data-hovered');
      expect(expandableRow).not.toHaveClass('hover');
    });

    it('should support press on rows', async () => {
      let {getAllByRole, rerender} = render(<StaticTree treeProps={{selectionMode: 'multiple'}} rowProps={{className: ({isPressed}) => isPressed ? 'pressed' : ''}} />);

      let row = getAllByRole('row')[0];
      expect(row).not.toHaveAttribute('data-pressed');
      expect(row).not.toHaveClass('pressed');

      fireEvent.mouseDown(row);
      expect(row).toHaveAttribute('data-pressed', 'true');
      expect(row).toHaveClass('pressed');

      fireEvent.mouseUp(row);
      expect(row).not.toHaveAttribute('data-pressed');
      expect(row).not.toHaveClass('pressed');

      rerender(<StaticTree treeProps={{selectionMode: 'none', onAction: jest.fn()}} rowProps={{className: ({isPressed}) => isPressed ? 'pressed' : ''}} />);
      row = getAllByRole('row')[0];
      expect(row).not.toHaveAttribute('data-pressed');
      expect(row).not.toHaveClass('pressed');

      fireEvent.mouseDown(row);
      expect(row).toHaveAttribute('data-pressed', 'true');
      expect(row).toHaveClass('pressed');

      fireEvent.mouseUp(row);
      expect(row).not.toHaveAttribute('data-pressed');
      expect(row).not.toHaveClass('pressed');
    });

    it('should not update the hover state if the row is not interactive', () => {
      let {getAllByRole, rerender} = render(<StaticTree treeProps={{selectionMode: 'none'}} rowProps={{className: ({isPressed}) => isPressed ? 'pressed' : ''}} />);

      let row = getAllByRole('row')[0];
      expect(row).not.toHaveAttribute('data-pressed');
      expect(row).not.toHaveClass('pressed');

      fireEvent.mouseDown(row);
      expect(row).not.toHaveAttribute('data-pressed');
      expect(row).not.toHaveClass('pressed');
      fireEvent.mouseUp(row);

      let expandableRow = getAllByRole('row')[1];
      expect(expandableRow).not.toHaveAttribute('data-pressed');
      expect(expandableRow).not.toHaveClass('pressed');

      fireEvent.mouseDown(expandableRow);
      expect(expandableRow).toHaveAttribute('data-pressed', 'true');
      expect(expandableRow).toHaveClass('pressed');

      fireEvent.mouseUp(expandableRow);
      expect(expandableRow).not.toHaveAttribute('data-pressed');
      expect(expandableRow).not.toHaveClass('pressed');

      // Test a completely inert expandable row
      rerender(<StaticTree treeProps={{selectionMode: 'none', disabledBehavior: 'all',  disabledKeys: ['projects']}} rowProps={{className: ({isPressed}) => isPressed ? 'pressed' : ''}} />);
      expandableRow = getAllByRole('row')[1];
      expect(expandableRow).toHaveAttribute('data-disabled', 'true');
      expect(expandableRow).not.toHaveAttribute('data-pressed');
      expect(expandableRow).not.toHaveClass('pressed');

      fireEvent.mouseDown(expandableRow);
      expect(expandableRow).not.toHaveAttribute('data-pressed');
      expect(expandableRow).not.toHaveClass('pressed');
      fireEvent.mouseUp(expandableRow);
    });

    it('should support focus', async () => {
      let {getAllByRole, rerender} = render(<StaticTree treeProps={{selectionMode: 'multiple', disabledKeys: ['projects']}} rowProps={{className: ({isFocused}) => isFocused ? 'focus' : ''}} />);

      let row = getAllByRole('row')[0];
      expect(row).not.toHaveAttribute('data-focused');
      expect(row).not.toHaveClass('focus');

      await user.click(row);
      expect(row).toHaveAttribute('data-focused');
      expect(row).toHaveClass('focus');

      rerender(<StaticTree treeProps={{selectionMode: 'multiple', disabledKeys: ['projects']}} rowProps={{className: ({isFocusVisible}) => isFocusVisible ? 'focus-visible' : ''}} />);
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
      let {getAllByRole} = render(<StaticTree treeProps={{selectionMode: 'multiple', disabledBehavior: 'all', onAction, onSelectionChange, disabledKeys: ['projects']}}  />);

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
    });

    describe('links', function () {
      describe.each(['mouse', 'keyboard'])('%s', (type) => {
        let trigger = async (item, key = 'Enter') => {
          if (type === 'mouse') {
            await user.click(item);
          } else {
            fireEvent.keyDown(item, {key});
            fireEvent.keyUp(item, {key});
          }
        };

        it('should support links with selectionMode="none"', async function () {
          let {getAllByRole} = render(<StaticTree treeProps={{selectionMode: 'none'}} rowProps={{href: 'https://google.com/'}} />);
          let items = getAllByRole('row');
          for (let item of items) {
            expect(item.tagName).not.toBe('A');
            expect(item).toHaveAttribute('data-href');
          }

          let onClick = jest.fn().mockImplementation(e => e.preventDefault());
          window.addEventListener('click', onClick, {once: true});
          await trigger(items[0]);
          expect(onClick).toHaveBeenCalledTimes(1);
          expect(onClick.mock.calls[0][0].target).toBeInstanceOf(HTMLAnchorElement);
          expect(onClick.mock.calls[0][0].target.href).toBe('https://google.com/');
        });

        it.each(['single', 'multiple'])('should support links with selectionBehavior="toggle" selectionMode="%s"', async function (selectionMode) {
          let {getAllByRole} = render(<StaticTree treeProps={{selectionMode}} rowProps={{href: 'https://google.com/'}} />);
          let items = getAllByRole('row');
          for (let item of items) {
            expect(item.tagName).not.toBe('A');
            expect(item).toHaveAttribute('data-href');
          }

          let onClick = jest.fn().mockImplementation(e => e.preventDefault());
          window.addEventListener('click', onClick, {once: true});
          await trigger(items[0]);
          expect(onClick).toHaveBeenCalledTimes(1);
          expect(onClick.mock.calls[0][0].target).toBeInstanceOf(HTMLAnchorElement);
          expect(onClick.mock.calls[0][0].target.href).toBe('https://google.com/');

          await user.click(within(items[0]).getByRole('checkbox'));
          expect(items[0]).toHaveAttribute('aria-selected', 'true');

          onClick = jest.fn().mockImplementation(e => e.preventDefault());
          window.addEventListener('click', onClick, {once: true});
          await trigger(items[1], ' ');
          expect(onClick).not.toHaveBeenCalled();
          expect(items[1]).toHaveAttribute('aria-selected', 'true');
        });

        it.each(['single', 'multiple'])('should support links with selectionBehavior="replace" selectionMode="%s"', async function (selectionMode) {
          let {getAllByRole} = render(<StaticTree treeProps={{selectionMode, selectionBehavior: 'replace'}} rowProps={{href: 'https://google.com/'}} />);

          let items = getAllByRole('row');
          for (let item of items) {
            expect(item.tagName).not.toBe('A');
            expect(item).toHaveAttribute('data-href');
          }

          let onClick = jest.fn().mockImplementation(e => e.preventDefault());
          window.addEventListener('click', onClick, {once: true});
          if (type === 'mouse') {
            await user.click(items[0]);
          } else {
            fireEvent.keyDown(items[0], {key: ' '});
            fireEvent.keyUp(items[0], {key: ' '});
          }
          // expect(onClick).not.toHaveBeenCalled();
          expect(items[0]).toHaveAttribute('aria-selected', 'true');

          onClick = jest.fn().mockImplementation(e => e.preventDefault());
          window.addEventListener('click', onClick, {once: true});
          if (type === 'mouse') {
            await user.dblClick(items[0], {pointerType: 'mouse'});
          } else {
            fireEvent.keyDown(items[0], {key: 'Enter'});
            fireEvent.keyUp(items[0], {key: 'Enter'});
          }
          expect(onClick).toHaveBeenCalledTimes(1);
          expect(onClick.mock.calls[0][0].target).toBeInstanceOf(HTMLAnchorElement);
          expect(onClick.mock.calls[0][0].target.href).toBe('https://google.com/');
        });
      });
    });
  });



  // TODO: check data attributes for the tree and the tree rows

  describe('expanding and collapsing', () => {
    // TODO check the various grid aria/data attributes here
    // check attribtues for the chevron here and other tree grid related properties
    // TODO: test disabledBehavior and ex
  });


  describe('pointer interactions', () => {
    // test expand and collapse
    // test actions and links and stuff
  });

  describe('keyboard interactions', () => {
    // TODO test navigation between the interactive elements in the tree
    // test expand and collapse
  });

  // TODO check empty state and the properties it has
  // TODO check dynamic state
  // DOuble check that style props go through as well

});
