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

import {act, fireEvent, mockClickDefault, pointerMap, render, setupIntersectionObserverMock, within} from '@react-spectrum/test-utils-internal';
import {
  Button,
  Checkbox,
  Collection,
  Dialog,
  DialogTrigger,
  DropIndicator,
  GridList,
  GridListContext,
  GridListHeader,
  GridListItem,
  GridListSection,
  Label,
  ListLayout,
  Modal,
  RouterProvider,
  Tag,
  TagGroup,
  TagList,
  useDragAndDrop,
  Virtualizer
} from '../';
import {getFocusableTreeWalker} from '@react-aria/focus';
import {GridListLoadMoreItem} from '../src/GridList';
import {installPointerEvent, User} from '@react-aria/test-utils';
import React from 'react';
import userEvent from '@testing-library/user-event';

let TestGridList = ({listBoxProps, itemProps}) => (
  <GridList aria-label="Test" {...listBoxProps}>
    <GridListItem {...itemProps} id="cat" textValue="Cat"><Checkbox slot="selection" /> Cat</GridListItem>
    <GridListItem {...itemProps} id="dog" textValue="Dog"><Checkbox slot="selection" /> Dog</GridListItem>
    <GridListItem {...itemProps} id="kangaroo" textValue="Kangaroo"><Checkbox slot="selection" /> Kangaroo</GridListItem>
  </GridList>
);

let TestGridListSections = ({listBoxProps, itemProps}) => (
  <GridList aria-label="Test" {...listBoxProps}>
    <GridListSection>
      <GridListHeader>Favorite Animal</GridListHeader>
      <GridListItem {...itemProps} id="cat" textValue="Cat"><Checkbox slot="selection" /> Cat</GridListItem>
      <GridListItem {...itemProps} id="dog" textValue="Dog"><Checkbox slot="selection" /> Dog</GridListItem>
      <GridListItem {...itemProps} id="kangaroo" textValue="Kangaroo"><Checkbox slot="selection" /> Kangaroo</GridListItem>
    </GridListSection>
    <GridListSection aria-label="Favorite Ice Cream">
      <GridListItem {...itemProps} id="cat" textValue="Vanilla"><Checkbox slot="selection" />Vanilla</GridListItem>
      <GridListItem {...itemProps} id="dog" textValue="Chocolate"><Checkbox slot="selection" />Chocolate</GridListItem>
      <GridListItem {...itemProps} id="kangaroo" textValue="Strawberry"><Checkbox slot="selection" />Strawberry</GridListItem>
    </GridListSection>
  </GridList>
);


let DraggableGridList = (props) => {
  let {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys) => [...keys].map((key) => ({'text/plain': key})),
    ...props
  });

  return (
    <GridList aria-label="Test" dragAndDropHooks={dragAndDropHooks}>
      <GridListItem id="cat" textValue="Cat"><Button slot="drag">≡</Button><Checkbox slot="selection" /> Cat</GridListItem>
      <GridListItem id="dog" textValue="Dog"><Button slot="drag">≡</Button><Checkbox slot="selection" /> Dog</GridListItem>
      <GridListItem id="kangaroo" textValue="Kangaroo"><Button slot="drag">≡</Button><Checkbox slot="selection" /> Kangaroo</GridListItem>
    </GridList>
  );
};

let renderGridList = (listBoxProps, itemProps) => render(<TestGridList {...{listBoxProps, itemProps}} />);

describe('GridList', () => {
  let user;
  let testUtilUser = new User();
  let onSelectionChange = jest.fn();

  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {jest.runAllTimers();});
    jest.clearAllMocks();
  });

  it('should render with default classes', () => {
    let {getByRole} = renderGridList();
    let gridListTester = testUtilUser.createTester('GridList', {root: getByRole('grid')});

    expect(gridListTester.gridlist).toHaveAttribute('class', 'react-aria-GridList');

    for (let row of gridListTester.rows) {
      expect(row).toHaveAttribute('class', 'react-aria-GridListItem');
    }
  });

  it('should render with custom classes', () => {
    let {getByRole, getAllByRole} = renderGridList({className: 'gridlist'}, {className: 'item'});
    let grid = getByRole('grid');
    expect(grid).toHaveAttribute('class', 'gridlist');

    for (let row of getAllByRole('row')) {
      expect(row).toHaveAttribute('class', 'item');
    }
  });

  it('should support DOM props', () => {
    let {getByRole, getAllByRole} = renderGridList({'data-foo': 'bar'}, {'data-bar': 'foo'});
    let grid = getByRole('grid');
    expect(grid).toHaveAttribute('data-foo', 'bar');

    for (let row of getAllByRole('row')) {
      expect(row).toHaveAttribute('data-bar', 'foo');
    }
  });

  it('should support slot', () => {
    let {getByRole} = render(
      <GridListContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <TestGridList listBoxProps={{slot: 'test', 'aria-label': undefined}} />
      </GridListContext.Provider>
    );

    let grid = getByRole('grid');
    expect(grid).toHaveAttribute('slot', 'test');
    expect(grid).toHaveAttribute('aria-label', 'test');
  });

  it('should support refs', () => {
    let listBoxRef = React.createRef();
    let itemRef = React.createRef();
    render(
      <GridList aria-label="Test" ref={listBoxRef}>
        <GridListItem ref={itemRef}>Cat</GridListItem>
      </GridList>
    );
    expect(listBoxRef.current).toBeInstanceOf(HTMLElement);
    expect(itemRef.current).toBeInstanceOf(HTMLElement);
  });

  it('should support autoFocus', () => {
    let {getByRole} = renderGridList({autoFocus: true});
    let gridList = getByRole('grid');

    expect(document.activeElement).toBe(gridList);
  });

  it('should support hover', async () => {
    let onHoverStart = jest.fn();
    let onHoverChange = jest.fn();
    let onHoverEnd = jest.fn();
    let {getAllByRole} = renderGridList({selectionMode: 'multiple'}, {className: ({isHovered}) => isHovered ? 'hover' : '', onHoverStart, onHoverChange, onHoverEnd});
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
  });

  it('should not show hover state when item is not interactive', async () => {
    let onHoverStart = jest.fn();
    let onHoverChange = jest.fn();
    let onHoverEnd = jest.fn();
    let {getAllByRole} = renderGridList({}, {className: ({isHovered}) => isHovered ? 'hover' : '', onHoverStart, onHoverChange, onHoverEnd});
    let row = getAllByRole('row')[0];

    expect(row).not.toHaveAttribute('data-hovered');
    expect(row).not.toHaveClass('hover');
    expect(onHoverStart).not.toHaveBeenCalled();
    expect(onHoverChange).not.toHaveBeenCalled();
    expect(onHoverEnd).not.toHaveBeenCalled();

    await user.hover(row);
    expect(row).not.toHaveAttribute('data-hovered');
    expect(row).not.toHaveClass('hover');
    expect(onHoverStart).not.toHaveBeenCalled();
    expect(onHoverChange).not.toHaveBeenCalled();
    expect(onHoverEnd).not.toHaveBeenCalled();
  });

  it('should support focus ring', async () => {
    let {getAllByRole} = renderGridList({selectionMode: 'multiple'}, {className: ({isFocusVisible}) => isFocusVisible ? 'focus' : ''});
    let row = getAllByRole('row')[0];

    expect(row).not.toHaveAttribute('data-focus-visible');
    expect(row).not.toHaveClass('focus');

    await user.tab();
    expect(document.activeElement).toBe(row);
    expect(row).toHaveAttribute('data-focus-visible', 'true');
    expect(row).toHaveClass('focus');

    await user.tab();
    expect(row).not.toHaveAttribute('data-focus-visible');
    expect(row).not.toHaveClass('focus');
  });

  it('should support press state', async () => {
    let {getAllByRole} = renderGridList({selectionMode: 'multiple'}, {className: ({isPressed}) => isPressed ? 'pressed' : ''});
    let row = getAllByRole('row')[0];

    expect(row).not.toHaveAttribute('data-pressed');
    expect(row).not.toHaveClass('pressed');

    await user.pointer({target: row, keys: '[MouseLeft>]'});
    expect(row).toHaveAttribute('data-pressed', 'true');
    expect(row).toHaveClass('pressed');

    await user.pointer({target: row, keys: '[/MouseLeft]'});
    expect(row).not.toHaveAttribute('data-pressed');
    expect(row).not.toHaveClass('pressed');
  });

  it('should not show press state when not interactive', async () => {
    let {getAllByRole} = renderGridList({}, {className: ({isPressed}) => isPressed ? 'pressed' : ''});
    let row = getAllByRole('row')[0];

    expect(row).not.toHaveAttribute('data-pressed');
    expect(row).not.toHaveClass('pressed');

    await user.pointer({target: row, keys: '[MouseLeft>]'});
    expect(row).not.toHaveAttribute('data-pressed');
    expect(row).not.toHaveClass('pressed');

    await user.pointer({target: row, keys: '[/MouseLeft]'});
    expect(row).not.toHaveAttribute('data-pressed');
    expect(row).not.toHaveClass('pressed');
  });

  it('should support selection state', async () => {
    let {getByRole} = renderGridList({selectionMode: 'multiple'}, {className: ({isSelected}) => isSelected ? 'selected' : ''});
    let gridListTester = testUtilUser.createTester('GridList', {root: getByRole('grid')});

    let row = gridListTester.rows[0];
    expect(row).not.toHaveAttribute('aria-selected', 'true');
    expect(row).not.toHaveClass('selected');
    expect(within(row).getByRole('checkbox')).not.toBeChecked();

    await gridListTester.toggleRowSelection({row: 0});
    expect(row).toHaveAttribute('aria-selected', 'true');
    expect(row).toHaveClass('selected');
    expect(within(row).getByRole('checkbox')).toBeChecked();

    await gridListTester.toggleRowSelection({row: 0});
    expect(row).not.toHaveAttribute('aria-selected', 'true');
    expect(row).not.toHaveClass('selected');
    expect(within(row).getByRole('checkbox')).not.toBeChecked();
  });

  it('should prevent Esc from clearing selection if escapeKeyBehavior is "none"', async () => {
    let {getByRole} = renderGridList({selectionMode: 'multiple', escapeKeyBehavior: 'none'});
    let gridListTester = testUtilUser.createTester('GridList', {root: getByRole('grid')});

    let row = gridListTester.rows[0];
    expect(within(row).getByRole('checkbox')).not.toBeChecked();

    await gridListTester.toggleRowSelection({row: 0});
    expect(gridListTester.selectedRows).toHaveLength(1);

    await gridListTester.toggleRowSelection({row: 1});
    expect(gridListTester.selectedRows).toHaveLength(2);

    await user.keyboard('{Escape}');
    expect(gridListTester.selectedRows).toHaveLength(2);
  });

  it('should support disabled state', () => {
    let {getAllByRole} = renderGridList({selectionMode: 'multiple', disabledKeys: ['cat']}, {className: ({isDisabled}) => isDisabled ? 'disabled' : ''});
    let row = getAllByRole('row')[0];

    expect(row).toHaveAttribute('aria-disabled', 'true');
    expect(row).toHaveClass('disabled');

    expect(within(row).getByRole('checkbox')).toBeDisabled();
  });

  it('should support isDisabled prop on items', async () => {
    let {getByRole} = render(
      <GridList aria-label="Test">
        <GridListItem id="cat">Cat</GridListItem>
        <GridListItem id="dog" textValue="Dog" isDisabled>Dog <Button aria-label="Info">ⓘ</Button></GridListItem>
        <GridListItem id="kangaroo">Kangaroo</GridListItem>
      </GridList>
    );

    let gridListTester = testUtilUser.createTester('GridList', {root: getByRole('grid')});
    let rows = gridListTester.rows;
    expect(rows[1]).toHaveAttribute('aria-disabled', 'true');
    expect(within(rows[1]).getByRole('button')).toBeDisabled();

    await user.tab();
    expect(document.activeElement).toBe(rows[0]);
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(rows[2]);
  });

  it('should support onAction on items', async () => {
    let onAction = jest.fn();
    let {getAllByRole} = render(
      <GridList aria-label="Test">
        <GridListItem id="cat" onAction={onAction}>Cat</GridListItem>
        <GridListItem id="dog">Dog</GridListItem>
        <GridListItem id="kangaroo">Kangaroo</GridListItem>
      </GridList>
    );
    let items = getAllByRole('row');
    await user.click(items[0]);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('should support onAction on list and list items', async () => {
    let onAction = jest.fn();
    let itemAction = jest.fn();
    let {getAllByRole} = render(
      <GridList aria-label="Test" onAction={onAction}>
        <GridListItem id="cat" onAction={itemAction}>Cat</GridListItem>
        <GridListItem id="dog">Dog</GridListItem>
        <GridListItem id="kangaroo">Kangaroo</GridListItem>
      </GridList>
    );
    let items = getAllByRole('row');
    await user.click(items[0]);
    expect(onAction).toHaveBeenCalledWith('cat');
    expect(itemAction).toHaveBeenCalledTimes(1);
  });

  it('should support empty state', () => {
    render(
      <GridList aria-label="Test" renderEmptyState={() => 'No results'}>
        {[]}
      </GridList>
    );
    // JSDOM seems to pretend to be WebKit so uses role="group" instead of role="grid".
    let gridList = document.querySelector('.react-aria-GridList');
    expect(gridList).toHaveAttribute('data-empty', 'true');
  });

  it('should support dynamic collections', () => {
    let items = [
      {id: 'cat', name: 'Cat'},
      {id: 'dog', name: 'Dog'}
    ];

    let {getByRole} = render(
      <GridList aria-label="Test" items={items}>
        {(item) => <GridListItem id={item.id}>{item.name}</GridListItem>}
      </GridList>
    );

    let gridList = getByRole('grid');
    expect(within(gridList).getAllByRole('row').map((r) => r.textContent)).toEqual(['Cat', 'Dog']);
  });

  it('should support onScroll', () => {
    let onScroll = jest.fn();
    let {getByRole} = renderGridList({onScroll});
    let grid = getByRole('grid');
    fireEvent.scroll(grid);
    expect(onScroll).toHaveBeenCalled();
  });

  it('should support grid layout', async () => {
    let buttonRef = React.createRef();
    let {getAllByRole} = render(
      <GridList aria-label="Test" layout="grid">
        <GridListItem id="cat">Cat</GridListItem>
        <GridListItem id="dog" textValue="Dog">Dog <Button aria-label="Info" ref={buttonRef}>ⓘ</Button></GridListItem>
        <GridListItem id="kangaroo">Kangaroo</GridListItem>
      </GridList>
    );

    let items = getAllByRole('row');

    await user.tab();
    expect(document.activeElement).toBe(items[0]);

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(items[1]);

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(items[2]);

    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(items[1]);

    await user.tab();
    expect(document.activeElement).toBe(buttonRef.current);

    await user.tab();
    expect(document.activeElement).toBe(document.body);
  });

  it('should support selectionMode="replace" with checkboxes', async () => {
    let {getAllByRole} = renderGridList({selectionMode: 'multiple', selectionBehavior: 'replace'});
    let items = getAllByRole('row');

    await user.click(items[0]);
    await user.click(items[1]);

    expect(items[0]).toHaveAttribute('aria-selected', 'false');
    expect(items[1]).toHaveAttribute('aria-selected', 'true');
    expect(items[2]).toHaveAttribute('aria-selected', 'false');

    await user.click(within(items[2]).getByRole('checkbox'));

    expect(items[0]).toHaveAttribute('aria-selected', 'false');
    expect(items[1]).toHaveAttribute('aria-selected', 'true');
    expect(items[2]).toHaveAttribute('aria-selected', 'true');
  });

  it('should support sections', () => {
    let {getAllByRole} = render(<TestGridListSections />);

    let groups = getAllByRole('rowgroup');
    expect(groups).toHaveLength(2);

    expect(groups[0]).toHaveClass('react-aria-GridListSection');
    expect(groups[1]).toHaveClass('react-aria-GridListSection');

    expect(groups[0]).toHaveAttribute('aria-labelledby');
    expect(document.getElementById(groups[0].getAttribute('aria-labelledby'))).toHaveTextContent('Favorite Animal');
    expect(groups[1].getAttribute('aria-label')).toEqual('Favorite Ice Cream');
  });

  it('should update collection when moving item to a different section', () => {
    let {getAllByRole, rerender} = render(
      <GridList aria-label="Test">
        <GridListSection id="veggies">
          <GridListHeader>Veggies</GridListHeader>
          <GridListItem key="lettuce" id="lettuce">Lettuce</GridListItem>
          <GridListItem key="tomato" id="tomato">Tomato</GridListItem>
          <GridListItem key="onion" id="onion">Onion</GridListItem>
        </GridListSection>
        <GridListSection id="meats">
          <GridListHeader>Meats</GridListHeader>
          <GridListItem key="ham" id="ham">Ham</GridListItem>
          <GridListItem key="tuna" id="tuna">Tuna</GridListItem>
          <GridListItem key="tofu" id="tofu">Tofu</GridListItem>
        </GridListSection>
      </GridList>
    );

    let sections = getAllByRole('rowgroup');
    let items = within(sections[0]).getAllByRole('gridcell');
    expect(items).toHaveLength(3);
    items = within(sections[1]).getAllByRole('gridcell');
    expect(items).toHaveLength(3);

    rerender(
      <GridList aria-label="Test">
        <GridListSection id="veggies">
          <GridListHeader>Veggies</GridListHeader>
          <GridListItem key="lettuce" id="lettuce">Lettuce</GridListItem>
          <GridListItem key="tomato" id="tomato">Tomato</GridListItem>
          <GridListItem key="onion" id="onion">Onion</GridListItem>
          <GridListItem key="ham" id="ham">Ham</GridListItem>
        </GridListSection>
        <GridListSection id="meats">
          <GridListHeader>Meats</GridListHeader>
          <GridListItem key="tuna" id="tuna">Tuna</GridListItem>
          <GridListItem key="tofu" id="tofu">Tofu</GridListItem>
        </GridListSection>
      </GridList>
    );

    sections = getAllByRole('rowgroup');
    items = within(sections[0]).getAllByRole('gridcell');
    expect(items).toHaveLength(4);
    items = within(sections[1]).getAllByRole('gridcell');
    expect(items).toHaveLength(2);
  });

  describe('selectionBehavior="replace"', () => {
    // Required for proper touch detection
    installPointerEvent();
    let GridListNoCheckboxes = ({listBoxProps, itemProps}) => (
      <GridList aria-label="Test" {...listBoxProps}>
        <GridListItem {...itemProps} id="cat" textValue="Cat">Cat</GridListItem>
        <GridListItem {...itemProps} id="dog" textValue="Dog">Dog</GridListItem>
        <GridListItem {...itemProps} id="kangaroo" textValue="Kangaroo">Kangaroo</GridListItem>
      </GridList>
    );

    describe.each(['mouse', 'keyboard', 'touch'])('%s', (type) => {
      it('should perform selection with single selection', async () => {
        let {getByRole} = render(<GridListNoCheckboxes listBoxProps={{selectionMode: 'single', selectionBehavior: 'replace', onSelectionChange}} />);
        let gridListTester = testUtilUser.createTester('GridList', {user, root: getByRole('grid'), interactionType: type});
        let rows = gridListTester.rows;

        for (let row of gridListTester.rows) {
          let checkbox = within(row).queryByRole('checkbox');
          expect(checkbox).toBeNull();
          expect(row).toHaveAttribute('aria-selected', 'false');
          expect(row).not.toHaveAttribute('data-selected');
          expect(row).toHaveAttribute('data-selection-mode', 'single');
        }

        let row2 = rows[2];
        expect(onSelectionChange).toHaveBeenCalledTimes(0);
        await gridListTester.toggleRowSelection({row: 'Kangaroo', selectionBehavior: 'replace'});
        expect(row2).toHaveAttribute('aria-selected', 'true');
        expect(row2).toHaveAttribute('data-selected', 'true');
        if (type === 'keyboard') {
          // Called twice because initial focus will select the first keyboard focused row
          expect(onSelectionChange).toHaveBeenCalledTimes(2);
        } else {
          expect(onSelectionChange).toHaveBeenCalledTimes(1);
        }
        expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set(['kangaroo']));
        expect(gridListTester.selectedRows).toHaveLength(1);
        expect(gridListTester.selectedRows[0]).toBe(row2);

        let row1 = rows[1];
        await gridListTester.toggleRowSelection({row: row1, selectionBehavior: 'replace'});
        expect(row1).toHaveAttribute('aria-selected', 'true');
        expect(row1).toHaveAttribute('data-selected', 'true');
        expect(row2).toHaveAttribute('aria-selected', 'false');
        expect(row2).not.toHaveAttribute('data-selected');
        if (type === 'keyboard') {
          expect(onSelectionChange).toHaveBeenCalledTimes(3);
        } else {
          expect(onSelectionChange).toHaveBeenCalledTimes(2);
        }
        expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set(['dog']));
        expect(gridListTester.selectedRows).toHaveLength(1);
        expect(gridListTester.selectedRows[0]).toBe(row1);

        await gridListTester.toggleRowSelection({row: row1, selectionBehavior: 'replace'});
        expect(row1).toHaveAttribute('aria-selected', 'false');
        expect(row1).not.toHaveAttribute('data-selected');
        expect(row2).toHaveAttribute('aria-selected', 'false');
        expect(row2).not.toHaveAttribute('data-selected');
        if (type === 'keyboard') {
          expect(onSelectionChange).toHaveBeenCalledTimes(4);
        } else {
          expect(onSelectionChange).toHaveBeenCalledTimes(3);
        }
        expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set([]));
        expect(gridListTester.selectedRows).toHaveLength(0);
      });

      it('should perform toggle selection in highlight mode when using modifier keys', async () => {
        let {getByRole} = render(<GridListNoCheckboxes listBoxProps={{selectionMode: 'multiple', selectionBehavior: 'replace', onSelectionChange}} />);
        let gridListTester = testUtilUser.createTester('GridList', {user, root: getByRole('grid'), interactionType: type});
        let rows = gridListTester.rows;

        for (let row of gridListTester.rows) {
          let checkbox = within(row).queryByRole('checkbox');
          expect(checkbox).toBeNull();
          expect(row).toHaveAttribute('aria-selected', 'false');
          expect(row).not.toHaveAttribute('data-selected');
          expect(row).toHaveAttribute('data-selection-mode', 'multiple');
        }

        let row2 = rows[2];
        await gridListTester.toggleRowSelection({row: 'Kangaroo', selectionBehavior: 'replace'});
        expect(row2).toHaveAttribute('aria-selected', 'true');
        expect(row2).toHaveAttribute('data-selected', 'true');
        if (type === 'keyboard') {
          // Called twice because initial focus will select the first keyboard focused row, meaning we have two items selected
          expect(onSelectionChange).toHaveBeenCalledTimes(2);
          expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set(['cat', 'kangaroo']));
          expect(gridListTester.selectedRows).toHaveLength(2);
          expect(gridListTester.selectedRows[1]).toBe(row2);
        } else {
          expect(onSelectionChange).toHaveBeenCalledTimes(1);
          expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set(['kangaroo']));
          expect(gridListTester.selectedRows).toHaveLength(1);
          expect(gridListTester.selectedRows[0]).toBe(row2);
        }

        let row1 = rows[1];
        await gridListTester.toggleRowSelection({row: row1, selectionBehavior: 'replace'});
        expect(row1).toHaveAttribute('aria-selected', 'true');
        expect(row1).toHaveAttribute('data-selected', 'true');
        expect(row2).toHaveAttribute('aria-selected', 'true');
        expect(row2).toHaveAttribute('data-selected', 'true');
        if (type === 'keyboard') {
          expect(onSelectionChange).toHaveBeenCalledTimes(3);
          expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set(['cat', 'dog', 'kangaroo']));
          expect(gridListTester.selectedRows).toHaveLength(3);
          expect(gridListTester.selectedRows[1]).toBe(row1);
          expect(gridListTester.selectedRows[2]).toBe(row2);
        } else {
          expect(onSelectionChange).toHaveBeenCalledTimes(2);
          expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set(['dog', 'kangaroo']));
          expect(gridListTester.selectedRows).toHaveLength(2);
          expect(gridListTester.selectedRows[0]).toBe(row1);
          expect(gridListTester.selectedRows[1]).toBe(row2);
        }

        // With modifier key, you should be able to deselect on press of the same row
        await gridListTester.toggleRowSelection({row: row1, selectionBehavior: 'replace'});
        expect(row1).toHaveAttribute('aria-selected', 'false');
        expect(row1).not.toHaveAttribute('data-selected');
        expect(row2).toHaveAttribute('aria-selected', 'true');
        expect(row2).toHaveAttribute('data-selected', 'true');
        if (type === 'keyboard') {
          expect(onSelectionChange).toHaveBeenCalledTimes(4);
          expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set(['cat', 'kangaroo']));
          expect(gridListTester.selectedRows).toHaveLength(2);
          expect(gridListTester.selectedRows[1]).toBe(row2);
        } else {
          expect(onSelectionChange).toHaveBeenCalledTimes(3);
          expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set(['kangaroo']));
          expect(gridListTester.selectedRows).toHaveLength(1);
          expect(gridListTester.selectedRows[0]).toBe(row2);
        }
      });

      it('should perform replace selection in highlight mode when not using modifier keys', async () => {
        let {getByRole} = render(<GridListNoCheckboxes listBoxProps={{selectionMode: 'multiple', selectionBehavior: 'replace', onSelectionChange}} />);
        let gridListTester = testUtilUser.createTester('GridList', {user, root: getByRole('grid'), interactionType: type});
        let rows = gridListTester.rows;

        for (let row of gridListTester.rows) {
          let checkbox = within(row).queryByRole('checkbox');
          expect(checkbox).toBeNull();
          expect(row).toHaveAttribute('aria-selected', 'false');
          expect(row).not.toHaveAttribute('data-selected');
          expect(row).toHaveAttribute('data-selection-mode', 'multiple');
        }

        let row2 = rows[2];
        await gridListTester.toggleRowSelection({row: 'Kangaroo'});
        expect(row2).toHaveAttribute('aria-selected', 'true');
        expect(row2).toHaveAttribute('data-selected', 'true');
        if (type === 'keyboard') {
          // Called multiple times since selection changes on option focus as we arrow down to the target option
          expect(onSelectionChange).toHaveBeenCalledTimes(3);
        } else {
          expect(onSelectionChange).toHaveBeenCalledTimes(1);
        }
        expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set(['kangaroo']));
        expect(gridListTester.selectedRows).toHaveLength(1);
        expect(gridListTester.selectedRows[0]).toBe(row2);

        let row1 = rows[1];
        await gridListTester.toggleRowSelection({row: row1});
        if (type !== 'touch') {
          expect(row1).toHaveAttribute('aria-selected', 'true');
          expect(row1).toHaveAttribute('data-selected', 'true');
          expect(row2).toHaveAttribute('aria-selected', 'false');
          expect(row2).not.toHaveAttribute('data-selected');
          if (type === 'keyboard') {
            expect(onSelectionChange).toHaveBeenCalledTimes(4);
          } else {
            expect(onSelectionChange).toHaveBeenCalledTimes(2);
          }
          expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set(['dog']));
          expect(gridListTester.selectedRows).toHaveLength(1);
          expect(gridListTester.selectedRows[0]).toBe(row1);

          // pressing without modifier keys won't deselect the row
          await gridListTester.toggleRowSelection({row: row1});
          expect(row1).toHaveAttribute('aria-selected', 'true');
          expect(row1).toHaveAttribute('data-selected', 'true');
          if (type === 'keyboard') {
            expect(onSelectionChange).toHaveBeenCalledTimes(4);
          } else {
            expect(onSelectionChange).toHaveBeenCalledTimes(2);
          }
          expect(gridListTester.selectedRows).toHaveLength(1);
        } else {
          // touch always behaves as toggle
          expect(row1).toHaveAttribute('aria-selected', 'true');
          expect(row1).toHaveAttribute('data-selected', 'true');
          expect(row2).toHaveAttribute('aria-selected', 'true');
          expect(row2).toHaveAttribute('data-selected', 'true');
          expect(onSelectionChange).toHaveBeenCalledTimes(2);
          expect(new Set(onSelectionChange.mock.calls[1][0])).toEqual(new Set(['dog', 'kangaroo']));
          expect(gridListTester.selectedRows).toHaveLength(2);
          expect(gridListTester.selectedRows[0]).toBe(row1);

          await gridListTester.toggleRowSelection({row: row1});
          expect(row1).toHaveAttribute('aria-selected', 'false');
          expect(row1).not.toHaveAttribute('data-selected');
          expect(onSelectionChange).toHaveBeenCalledTimes(3);
          expect(new Set(onSelectionChange.mock.calls[2][0])).toEqual(new Set(['kangaroo']));
          expect(gridListTester.selectedRows).toHaveLength(1);
          expect(gridListTester.selectedRows[0]).toBe(row2);
        }
      });
    });
  });

  it('should support virtualizer', async () => {
    let items = [];
    for (let i = 0; i < 50; i++) {
      items.push({id: i, name: 'Item ' + i});
    }

    jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 100);
    jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 100);

    let {getByRole, getAllByRole} = render(
      <Virtualizer layout={ListLayout} layoutOptions={{rowHeight: 25}}>
        <GridList aria-label="Test" items={items}>
          {item => <GridListItem>{item.name}</GridListItem>}
        </GridList>
      </Virtualizer>
    );

    let rows = getAllByRole('row');
    expect(rows).toHaveLength(7);
    expect(rows.map(r => r.textContent)).toEqual(['Item 0', 'Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6']);
    for (let row of rows) {
      expect(row).toHaveAttribute('aria-rowindex');
    }

    let grid = getByRole('grid');
    grid.scrollTop = 200;
    fireEvent.scroll(grid);

    rows = getAllByRole('row');
    expect(rows).toHaveLength(8);
    expect(rows.map(r => r.textContent)).toEqual(['Item 7', 'Item 8', 'Item 9', 'Item 10', 'Item 11', 'Item 12', 'Item 13', 'Item 14']);

    await user.tab();
    await user.keyboard('{End}');

    rows = getAllByRole('row');
    expect(rows).toHaveLength(9);
    expect(rows.map(r => r.textContent)).toEqual(['Item 7', 'Item 8', 'Item 9', 'Item 10', 'Item 11', 'Item 12', 'Item 13', 'Item 14', 'Item 49']);
  });

  it('should support rendering a TagGroup inside a GridListItem', async () => {
    let buttonRef = React.createRef();
    let {getAllByRole} = render(
      <GridList aria-label="Test">
        <GridListItem data-test-id="grid-list" id="tags" textValue="tags">
          <TagGroup aria-label="Tag group">
            <TagList>
              <Tag id="1">Tag 1</Tag>
              <Tag id="2">Tag 2</Tag>
              <Tag id="3">Tag 3</Tag>
            </TagList>
          </TagGroup>
        </GridListItem>
        <GridListItem id="dog" textValue="Dog">Dog <Button aria-label="Info" ref={buttonRef}>ⓘ</Button></GridListItem>
        <GridListItem id="kangaroo">Kangaroo</GridListItem>
      </GridList>
    );

    let items = getAllByRole('grid')[0].children;
    let tags = within(items[0]).getAllByRole('row');

    await user.tab();
    expect(document.activeElement).toBe(items[0]);

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tags[0]);

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tags[1]);

    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(items[1]);

    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it('should support rendering a TagGroup with tabbing navigation inside a GridListItem', async () => {
    let buttonRef = React.createRef();
    let onRemove = jest.fn();
    let {getAllByRole} = render(
      <GridList aria-label="Test" keyboardNavigationBehavior="tab">
        <GridListItem data-test-id="grid-list" id="tags" textValue="tags">
          <TagGroup aria-label="Tag group" onRemove={onRemove}>
            <TagList>
              <Tag id="1" textValue="Tag 1">Tag 1<Button slot="remove">X</Button></Tag>
              <Tag id="2" textValue="Tag 2">Tag 2<Button slot="remove">X</Button></Tag>
              <Tag id="3" textValue="Tag 3">Tag 3<Button slot="remove">X</Button></Tag>
            </TagList>
          </TagGroup>
        </GridListItem>
        <GridListItem id="dog" textValue="Dog">Dog <Button aria-label="Info" ref={buttonRef}>ⓘ</Button></GridListItem>
        <GridListItem id="kangaroo">Kangaroo</GridListItem>
      </GridList>
    );

    let items = getAllByRole('grid')[0].children;
    let tags = within(items[0]).getAllByRole('row');

    await user.tab();
    expect(document.activeElement).toBe(items[0]);

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(items[0]);

    await user.tab();
    expect(document.activeElement).toBe(tags[0]);

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tags[1]);

    await user.tab();
    expect(document.activeElement).toBe(within(tags[1]).getByRole('button'));

    await user.keyboard(' ');
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenLastCalledWith(new Set(['2']));

    await user.tab({shift: true});
    expect(document.activeElement).toBe(tags[1]);

    // For some reason "await user.tab({shift: true});"" doesn't seem to follow the correct behavior when coercing focus to the collection before
    // letting the browser handle the tab event so we simulate this
    fireEvent.keyDown(document.activeElement, {key: 'Tab', shiftKey: true});
    let walker = getFocusableTreeWalker(document.body, {tabbable: true});
    walker.currentNode = document.activeElement;
    act(() => {walker.previousNode().focus();});
    fireEvent.keyUp(document.activeElement, {key: 'Tab', shiftKey: true});
    expect(document.activeElement).toBe(items[0]);
  });

  it('should not propagate the checkbox context from selection into other cells', async () => {
    let tree = render(
      <GridList aria-label="Test" selectionMode="multiple">
        <GridListItem id="dialog" textValue="dialog">
          <DialogTrigger>
            <Button>Open</Button>
            <Modal>
              <Dialog>
                <Checkbox><Label>Agree</Label></Checkbox>
              </Dialog>
            </Modal>
          </DialogTrigger>
        </GridListItem>
        <GridListItem id="dog" textValue="Dog">Dog</GridListItem>
        <GridListItem id="kangaroo">Kangaroo</GridListItem>
      </GridList>
    );

    await user.click(tree.getByRole('button'));
    let checkbox = tree.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('should support nested collections with colliding keys', async () => {
    let {container} = render(
      <GridList aria-label="CardView" keyboardNavigationBehavior="Tab">
        <GridListItem id="1" textValue="Card">
          <GridList aria-label="Previews">
            <GridListItem id="1">Paco de Lucia</GridListItem>
          </GridList>
        </GridListItem>
      </GridList>
    );

    let itemMap = new Map();
    let items = container.querySelectorAll('[data-key]');

    for (let item of items) {
      if (item instanceof HTMLElement) {
        let key = item.dataset.collection + ':' + item.dataset.key;
        expect(itemMap.has(key)).toBe(false);
        itemMap.set(key, item);
      }
    }
  });

  describe('drag and drop', () => {
    it('should support drag button slot', () => {
      let {getAllByRole} = render(<DraggableGridList />);
      let button = getAllByRole('button')[0];
      expect(button).toHaveAttribute('aria-label', 'Drag Cat');
    });

    it('should render drop indicators', async () => {
      let onReorder = jest.fn();
      let {getAllByRole} = render(<DraggableGridList onReorder={onReorder} renderDropIndicator={(target) => <DropIndicator target={target}>Test</DropIndicator>} />);
      await user.tab();
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{Enter}');
      act(() => jest.runAllTimers());

      let rows = getAllByRole('row');
      expect(rows).toHaveLength(5);
      expect(rows[0]).toHaveAttribute('class', 'react-aria-DropIndicator');
      expect(rows[0]).not.toHaveAttribute('data-drop-target', 'true');
      expect(rows[0]).toHaveTextContent('Test');
      expect(within(rows[0]).getByRole('button')).toHaveAttribute('aria-label', 'Insert before Cat');
      expect(rows[2]).toHaveAttribute('class', 'react-aria-DropIndicator');
      expect(rows[2]).toHaveAttribute('data-drop-target');
      expect(within(rows[2]).getByRole('button')).toHaveAttribute('aria-label', 'Insert between Cat and Dog');
      expect(rows[3]).toHaveAttribute('class', 'react-aria-DropIndicator');
      expect(rows[3]).not.toHaveAttribute('data-drop-target');
      expect(within(rows[3]).getByRole('button')).toHaveAttribute('aria-label', 'Insert between Dog and Kangaroo');
      expect(rows[4]).toHaveAttribute('class', 'react-aria-DropIndicator');
      expect(rows[4]).not.toHaveAttribute('data-drop-target');
      expect(within(rows[4]).getByRole('button')).toHaveAttribute('aria-label', 'Insert after Kangaroo');

      await user.keyboard('{ArrowDown}');

      expect(document.activeElement).toHaveAttribute('aria-label', 'Insert between Dog and Kangaroo');
      expect(rows[0]).not.toHaveAttribute('data-drop-target', 'true');
      expect(rows[2]).not.toHaveAttribute('data-drop-target', 'true');
      expect(rows[3]).toHaveAttribute('data-drop-target', 'true');

      await user.keyboard('{Enter}');
      act(() => jest.runAllTimers());

      expect(onReorder).toHaveBeenCalledTimes(1);
    });

    it('should support dropping on rows', async () => {
      let onItemDrop = jest.fn();
      let {getAllByRole} = render(<>
        <DraggableGridList />
        <DraggableGridList onItemDrop={onItemDrop} />
      </>);

      await user.tab();
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{Enter}');
      act(() => jest.runAllTimers());

      let grids = getAllByRole('grid');
      let rows = within(grids[1]).getAllByRole('row');
      expect(rows).toHaveLength(3);
      expect(within(rows[0]).getByRole('button')).toHaveAttribute('aria-label', 'Drop on Cat');
      expect(rows[0].nextElementSibling).toHaveAttribute('data-drop-target', 'true');
      expect(within(rows[1]).getByRole('button')).toHaveAttribute('aria-label', 'Drop on Dog');
      expect(rows[1].nextElementSibling).not.toHaveAttribute('data-drop-target');
      expect(within(rows[2]).getByRole('button')).toHaveAttribute('aria-label', 'Drop on Kangaroo');
      expect(rows[2].nextElementSibling).not.toHaveAttribute('data-drop-target');

      expect(document.activeElement).toBe(within(rows[0]).getByRole('button'));

      await user.keyboard('{Enter}');
      act(() => jest.runAllTimers());

      expect(onItemDrop).toHaveBeenCalledTimes(1);
    });

    it('should support dropping on the root', async () => {
      let onRootDrop = jest.fn();
      let {getAllByRole} = render(<>
        <DraggableGridList />
        <DraggableGridList onRootDrop={onRootDrop} />
      </>);

      await user.tab();
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{Enter}');
      act(() => jest.runAllTimers());

      let grids = getAllByRole('grid');
      let rows = within(grids[1]).getAllByRole('row');
      expect(rows).toHaveLength(1);
      expect(within(rows[0]).getByRole('button')).toHaveAttribute('aria-label', 'Drop on');
      expect(document.activeElement).toBe(within(rows[0]).getByRole('button'));
      expect(grids[1]).toHaveAttribute('data-drop-target', 'true');

      await user.keyboard('{Enter}');
      act(() => jest.runAllTimers());

      expect(onRootDrop).toHaveBeenCalledTimes(1);
    });
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
        let {getAllByRole} = render(
          <GridList aria-label="listview">
            <GridListItem href="https://google.com">One</GridListItem>
            <GridListItem href="https://adobe.com">Two</GridListItem>
          </GridList>
        );

        let items = getAllByRole('row');
        for (let item of items) {
          expect(item.tagName).not.toBe('A');
          expect(item).toHaveAttribute('data-href');
        }

        let onClick = mockClickDefault();
        if (type === 'keyboard') {
          await user.tab();
        }
        await trigger(items[0]);
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(onClick.mock.calls[0][0].target).toBeInstanceOf(HTMLAnchorElement);
        expect(onClick.mock.calls[0][0].target.href).toBe('https://google.com/');
      });

      it.each(['single', 'multiple'])('should support links with selectionBehavior="toggle" selectionMode="%s"', async function (selectionMode) {
        let {getAllByRole} = render(
          <GridList aria-label="listview" selectionMode={selectionMode}>
            <GridListItem href="https://google.com" textValue="one"><Checkbox slot="selection" /> One</GridListItem>
            <GridListItem href="https://adobe.com" textValue="two"><Checkbox slot="selection" /> Two</GridListItem>
          </GridList>
        );

        let items = getAllByRole('row');
        for (let item of items) {
          expect(item.tagName).not.toBe('A');
          expect(item).toHaveAttribute('data-href');
        }

        let onClick = mockClickDefault();
        if (type === 'keyboard') {
          await user.tab();
        }
        await trigger(items[0]);
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(onClick.mock.calls[0][0].target).toBeInstanceOf(HTMLAnchorElement);
        expect(onClick.mock.calls[0][0].target.href).toBe('https://google.com/');

        await user.click(within(items[0]).getByRole('checkbox'));
        expect(items[0]).toHaveAttribute('aria-selected', 'true');


        if (type === 'keyboard') {
          await user.keyboard('{ArrowDown}');
        }
        await trigger(items[1], ' ');
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(items[1]).toHaveAttribute('aria-selected', 'true');
      });

      it.each(['single', 'multiple'])('should support links with selectionBehavior="replace" selectionMode="%s"', async function (selectionMode) {
        let {getAllByRole} = render(
          <GridList aria-label="listview" selectionMode={selectionMode} selectionBehavior="replace">
            <GridListItem href="https://google.com">One</GridListItem>
            <GridListItem href="https://adobe.com">Two</GridListItem>
          </GridList>
        );

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
          await user.keyboard(' ');
          if (selectionMode === 'single') {
            // single selection with replace will follow focus
            await user.keyboard(' ');
          }
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

      it('should work with RouterProvider', async () => {
        let navigate = jest.fn();
        let useHref = href => '/base' + href;
        let {getAllByRole} = render(
          <RouterProvider navigate={navigate} useHref={useHref}>
            <GridList aria-label="listview">
              <GridListItem href="/foo" routerOptions={{foo: 'bar'}}>One</GridListItem>
            </GridList>
          </RouterProvider>
        );

        let items = getAllByRole('row');
        expect(items[0]).toHaveAttribute('data-href', '/base/foo');

        if (type === 'keyboard') {
          await user.tab();
        }
        await trigger(items[0]);
        expect(navigate).toHaveBeenCalledWith('/foo', {foo: 'bar'});
      });
    });
  });

  describe('shouldSelectOnPressUp', () => {
    it('should select an item on pressing down when shouldSelectOnPressUp is not provided', async () => {
      let onSelectionChange = jest.fn();
      let {getAllByRole} = renderGridList({selectionMode: 'single', onSelectionChange});
      let items = getAllByRole('row');

      await user.pointer({target: items[0], keys: '[MouseLeft>]'});
      expect(onSelectionChange).toBeCalledTimes(1);

      await user.pointer({target: items[0], keys: '[/MouseLeft]'});
      expect(onSelectionChange).toBeCalledTimes(1);
    });

    it('should select an item on pressing down when shouldSelectOnPressUp is false', async () => {
      let onSelectionChange = jest.fn();
      let {getAllByRole} = renderGridList({selectionMode: 'single', onSelectionChange, shouldSelectOnPressUp: false});
      let items = getAllByRole('row');

      await user.pointer({target: items[0], keys: '[MouseLeft>]'});
      expect(onSelectionChange).toBeCalledTimes(1);

      await user.pointer({target: items[0], keys: '[/MouseLeft]'});
      expect(onSelectionChange).toBeCalledTimes(1);
    });

    it('should select an item on pressing up when shouldSelectOnPressUp is true', async () => {
      let onSelectionChange = jest.fn();
      let {getAllByRole} = renderGridList({selectionMode: 'single', onSelectionChange, shouldSelectOnPressUp: true});
      let items = getAllByRole('row');

      await user.pointer({target: items[0], keys: '[MouseLeft>]'});
      expect(onSelectionChange).toBeCalledTimes(0);

      await user.pointer({target: items[0], keys: '[/MouseLeft]'});
      expect(onSelectionChange).toBeCalledTimes(1);
    });
  });

  describe('async loading', () => {
    let items = [
      {name: 'Foo'},
      {name: 'Bar'},
      {name: 'Baz'}
    ];
    let renderEmptyState = (loadingState) => {
      return (
        loadingState === 'loading' ? <div>loading</div> : <div>empty state</div>
      );
    };
    let AsyncGridList = (props) => {
      let {items, isLoading, onLoadMore, ...listBoxProps} = props;
      return (
        <GridList
          {...listBoxProps}
          aria-label="async gridlist"
          renderEmptyState={() => renderEmptyState()}>
          <Collection items={items}>
            {(item) => (
              <GridListItem id={item.name}>{item.name}</GridListItem>
            )}
          </Collection>
          <GridListLoadMoreItem isLoading={isLoading} onLoadMore={onLoadMore}>
            Loading...
          </GridListLoadMoreItem>
        </GridList>
      );
    };

    let onLoadMore = jest.fn();
    let observe = jest.fn();
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should render the loading element when loading', async () => {
      let tree = render(<AsyncGridList isLoading items={items} />);

      let gridListTester = testUtilUser.createTester('GridList', {root: tree.getByRole('grid')});
      let rows = gridListTester.rows;
      expect(rows).toHaveLength(4);
      let loaderRow = rows[3];
      expect(loaderRow).toHaveTextContent('Loading...');

      let sentinel = tree.getByTestId('loadMoreSentinel');
      expect(sentinel.parentElement).toHaveAttribute('inert');
    });

    it('should render the sentinel but not the loading indicator when not loading', async () => {
      let tree = render(<AsyncGridList items={items} />);

      let gridListTester = testUtilUser.createTester('GridList', {root: tree.getByRole('grid')});
      let rows = gridListTester.rows;
      expect(rows).toHaveLength(3);
      expect(tree.queryByText('Loading...')).toBeFalsy();
      expect(tree.getByTestId('loadMoreSentinel')).toBeInTheDocument();
    });

    it('should properly render the renderEmptyState if gridlist is empty', async () => {
      let tree = render(<AsyncGridList items={[]} />);

      let gridListTester = testUtilUser.createTester('GridList', {root: tree.getByRole('grid')});
      let rows = gridListTester.rows;
      expect(rows).toHaveLength(1);
      expect(rows[0]).toHaveTextContent('empty state');
      expect(tree.queryByText('Loading...')).toBeFalsy();
      expect(tree.getByTestId('loadMoreSentinel')).toBeInTheDocument();

      // Even if the gridlist is empty, providing isLoading will render the loader
      tree.rerender(<AsyncGridList items={[]} isLoading />);
      rows = gridListTester.rows;
      expect(rows).toHaveLength(2);
      expect(rows[1]).toHaveTextContent('empty state');
      expect(tree.queryByText('Loading...')).toBeTruthy();
      expect(tree.getByTestId('loadMoreSentinel')).toBeInTheDocument();
    });

    it('should only fire loadMore when intersection is detected regardless of loading state', async () => {
      let observer = setupIntersectionObserverMock({
        observe
      });

      let tree = render(<AsyncGridList items={items} onLoadMore={onLoadMore} isLoading />);
      let sentinel = tree.getByTestId('loadMoreSentinel');
      expect(observe).toHaveBeenLastCalledWith(sentinel);
      expect(onLoadMore).toHaveBeenCalledTimes(0);

      act(() => {observer.instance.triggerCallback([{isIntersecting: true}]);});
      expect(onLoadMore).toHaveBeenCalledTimes(1);
      observe.mockClear();

      tree.rerender(<AsyncGridList items={items} onLoadMore={onLoadMore} />);
      expect(observe).toHaveBeenLastCalledWith(sentinel);
      expect(onLoadMore).toHaveBeenCalledTimes(1);

      act(() => {observer.instance.triggerCallback([{isIntersecting: true}]);});
      expect(onLoadMore).toHaveBeenCalledTimes(2);
    });

    describe('virtualized', () => {
      let items = [];
      for (let i = 0; i < 50; i++) {
        items.push({name: 'Foo' + i});
      }
      let clientWidth, clientHeight;

      beforeAll(() => {
        clientWidth = jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 100);
        clientHeight = jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 100);
      });

      afterAll(function () {
        clientWidth.mockReset();
        clientHeight.mockReset();
      });

      let VirtualizedAsyncGridList = (props) => {
        let {items, loadingState, onLoadMore, ...listBoxProps} = props;
        return (
          <Virtualizer
            layout={ListLayout}
            layoutOptions={{
              rowHeight: 25,
              loaderHeight: 30
            }}>
            <GridList
              {...listBoxProps}
              aria-label="async virtualized gridlist"
              renderEmptyState={() => renderEmptyState(loadingState)}>
              <Collection items={items}>
                {(item) => (
                  <GridListItem id={item.name}>{item.name}</GridListItem>
                )}
              </Collection>
              <GridListLoadMoreItem isLoading={loadingState === 'loadingMore'} onLoadMore={onLoadMore}>
                Loading...
              </GridListLoadMoreItem>
            </GridList>
          </Virtualizer>
        );
      };

      it('should always render the sentinel even when virtualized', async () => {
        let tree = render(<VirtualizedAsyncGridList loadingState="loadingMore" items={items} />);

        let gridListTester = testUtilUser.createTester('GridList', {root: tree.getByRole('grid')});
        let rows = gridListTester.rows;
        expect(rows).toHaveLength(8);
        let loaderRow = rows[7];
        expect(loaderRow).toHaveTextContent('Loading...');
        expect(loaderRow).not.toHaveAttribute('aria-rowindex');
        let loaderParentStyles = loaderRow.parentElement.style;

        // 50 items * 25px = 1250
        expect(loaderParentStyles.top).toBe('1250px');
        expect(loaderParentStyles.height).toBe('30px');

        let sentinel = within(loaderRow.parentElement).getByTestId('loadMoreSentinel');
        expect(sentinel.parentElement).toHaveAttribute('inert');
      });

      it('should not reserve room for the loader if isLoading is false', async () => {
        let tree = render(<VirtualizedAsyncGridList items={items} />);

        let gridListTester = testUtilUser.createTester('GridList', {root: tree.getByRole('grid')});
        let rows = gridListTester.rows;
        expect(rows).toHaveLength(7);
        expect(within(gridListTester.gridlist).queryByText('Loading...')).toBeFalsy();

        let sentinel = within(gridListTester.gridlist).getByTestId('loadMoreSentinel');
        let sentinelParentStyles = sentinel.parentElement.parentElement.style;
        expect(sentinelParentStyles.top).toBe('1250px');
        expect(sentinelParentStyles.height).toBe('0px');
        expect(sentinel.parentElement).toHaveAttribute('inert');

        tree.rerender(<VirtualizedAsyncGridList items={[]} />);
        rows = gridListTester.rows;
        expect(rows).toHaveLength(1);
        let emptyStateRow = rows[0];
        expect(emptyStateRow).toHaveTextContent('empty state');
        expect(within(gridListTester.gridlist).queryByText('Loading...')).toBeFalsy();

        sentinel = within(gridListTester.gridlist).getByTestId('loadMoreSentinel');
        sentinelParentStyles = sentinel.parentElement.parentElement.style;
        expect(sentinelParentStyles.top).toBe('0px');
        expect(sentinelParentStyles.height).toBe('0px');

        tree.rerender(<VirtualizedAsyncGridList items={[]} loadingState="loading" />);
        rows = gridListTester.rows;
        expect(rows).toHaveLength(1);
        emptyStateRow = rows[0];
        expect(emptyStateRow).toHaveTextContent('loading');

        sentinel = within(gridListTester.gridlist).getByTestId('loadMoreSentinel');
        sentinelParentStyles = sentinel.parentElement.parentElement.style;
        expect(sentinelParentStyles.top).toBe('0px');
        expect(sentinelParentStyles.height).toBe('0px');
      });

      it('should have the correct row indicies after loading more items', async () => {
        let tree = render(<VirtualizedAsyncGridList items={[]} loadingState="loading" />);

        let gridListTester = testUtilUser.createTester('GridList', {root: tree.getByRole('grid')});
        let rows = gridListTester.rows;
        expect(rows).toHaveLength(1);

        let loaderRow = rows[0];
        expect(loaderRow).toHaveAttribute('aria-rowindex', '1');
        expect(loaderRow).toHaveTextContent('loading');
        for (let [index, row] of rows.entries()) {
          expect(row).toHaveAttribute('aria-rowindex', `${index + 1}`);
        }

        tree.rerender(<VirtualizedAsyncGridList items={items} />);
        rows = gridListTester.rows;
        expect(rows).toHaveLength(7);
        expect(within(gridListTester.gridlist).queryByText('loading')).toBeFalsy();
        for (let [index, row] of rows.entries()) {
          expect(row).toHaveAttribute('aria-rowindex', `${index + 1}`);
        }

        tree.rerender(<VirtualizedAsyncGridList items={items} loadingState="loadingMore" />);
        rows = gridListTester.rows;
        expect(rows).toHaveLength(8);
        loaderRow = rows[7];
        expect(loaderRow).not.toHaveAttribute('aria-rowindex');
        for (let [index, row] of rows.entries()) {
          if (index === 7) {
            continue;
          } else {
            expect(row).toHaveAttribute('aria-rowindex', `${index + 1}`);
          }
        }
      });
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
      let {getByRole} = renderGridList({}, {onAction, onPressStart, onPressEnd, onPress, onClick});
      let gridListTester = testUtilUser.createTester('GridList', {root: getByRole('grid')});
      await gridListTester.triggerRowAction({row: 1, interactionType});
  
      expect(onAction).toHaveBeenCalledTimes(1);
      expect(onPressStart).toHaveBeenCalledTimes(1);
      expect(onPressEnd).toHaveBeenCalledTimes(1);
      expect(onPress).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});
