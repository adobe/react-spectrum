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
import {Button, Checkbox, GridList, GridListContext, Item, useDragAndDrop} from '../';
import React from 'react';
import userEvent from '@testing-library/user-event';

let TestGridList = ({listBoxProps, itemProps}) => (
  <GridList aria-label="Test" {...listBoxProps}>
    <Item {...itemProps} id="cat" textValue="Cat"><Checkbox slot="selection" /> Cat</Item>
    <Item {...itemProps} id="dog" textValue="Dog"><Checkbox slot="selection" /> Dog</Item>
    <Item {...itemProps} id="kangaroo" textValue="Kangaroo"><Checkbox slot="selection" /> Kangaroo</Item>
  </GridList>
);

let DraggableGridList = (props) => {
  let {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys) => [...keys].map((key) => ({'text/plain': key})),
    ...props
  });

  return (
    <GridList aria-label="Test" dragAndDropHooks={dragAndDropHooks}>
      <Item id="cat" textValue="Cat"><Button slot="drag">≡</Button><Checkbox slot="selection" /> Cat</Item>
      <Item id="dog" textValue="Dog"><Button slot="drag">≡</Button><Checkbox slot="selection" /> Dog</Item>
      <Item id="kangaroo" textValue="Kangaroo"><Button slot="drag">≡</Button><Checkbox slot="selection" /> Kangaroo</Item>
    </GridList>
  );
};

let renderGridList = (listBoxProps, itemProps) => render(<TestGridList {...{listBoxProps, itemProps}} />);

describe('GridList', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {jest.runAllTimers();});
  });

  it('should render with default classes', () => {
    let {getByRole, getAllByRole} = renderGridList();
    let grid = getByRole('grid');
    expect(grid).toHaveAttribute('class', 'react-aria-GridList');

    for (let row of getAllByRole('row')) {
      expect(row).toHaveAttribute('class', 'react-aria-Item');
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
        <Item ref={itemRef}>Cat</Item>
      </GridList>
    );
    expect(listBoxRef.current).toBeInstanceOf(HTMLElement);
    expect(itemRef.current).toBeInstanceOf(HTMLElement);
  });

  it('should support hover', async () => {
    let {getAllByRole} = renderGridList({selectionMode: 'multiple'}, {className: ({isHovered}) => isHovered ? 'hover' : ''});
    let row = getAllByRole('row')[0];

    expect(row).not.toHaveAttribute('data-hovered');
    expect(row).not.toHaveClass('hover');

    await user.hover(row);
    expect(row).toHaveAttribute('data-hovered', 'true');
    expect(row).toHaveClass('hover');

    await user.unhover(row);
    expect(row).not.toHaveAttribute('data-hovered');
    expect(row).not.toHaveClass('hover');
  });

  it('should not show hover state when item is not interactive', async () => {
    let {getAllByRole} = renderGridList({}, {className: ({isHovered}) => isHovered ? 'hover' : ''});
    let row = getAllByRole('row')[0];

    expect(row).not.toHaveAttribute('data-hovered');
    expect(row).not.toHaveClass('hover');

    await user.hover(row);
    expect(row).not.toHaveAttribute('data-hovered');
    expect(row).not.toHaveClass('hover');
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

  it('should support press state', () => {
    let {getAllByRole} = renderGridList({selectionMode: 'multiple'}, {className: ({isPressed}) => isPressed ? 'pressed' : ''});
    let row = getAllByRole('row')[0];

    expect(row).not.toHaveAttribute('data-pressed');
    expect(row).not.toHaveClass('pressed');

    fireEvent.mouseDown(row);
    expect(row).toHaveAttribute('data-pressed', 'true');
    expect(row).toHaveClass('pressed');

    fireEvent.mouseUp(row);
    expect(row).not.toHaveAttribute('data-pressed');
    expect(row).not.toHaveClass('pressed');
  });

  it('should not show press state when not interactive', () => {
    let {getAllByRole} = renderGridList({}, {className: ({isPressed}) => isPressed ? 'pressed' : ''});
    let row = getAllByRole('row')[0];

    expect(row).not.toHaveAttribute('data-pressed');
    expect(row).not.toHaveClass('pressed');

    fireEvent.mouseDown(row);
    expect(row).not.toHaveAttribute('data-pressed');
    expect(row).not.toHaveClass('pressed');

    fireEvent.mouseUp(row);
    expect(row).not.toHaveAttribute('data-pressed');
    expect(row).not.toHaveClass('pressed');
  });

  it('should support selection state', async () => {
    let {getAllByRole} = renderGridList({selectionMode: 'multiple'}, {className: ({isSelected}) => isSelected ? 'selected' : ''});
    let row = getAllByRole('row')[0];

    expect(row).not.toHaveAttribute('aria-selected', 'true');
    expect(row).not.toHaveClass('selected');
    expect(within(row).getByRole('checkbox')).not.toBeChecked();

    await user.click(row);
    expect(row).toHaveAttribute('aria-selected', 'true');
    expect(row).toHaveClass('selected');
    expect(within(row).getByRole('checkbox')).toBeChecked();

    await user.click(row);
    expect(row).not.toHaveAttribute('aria-selected', 'true');
    expect(row).not.toHaveClass('selected');
    expect(within(row).getByRole('checkbox')).not.toBeChecked();
  });

  it('should support disabled state', () => {
    let {getAllByRole} = renderGridList({selectionMode: 'multiple', disabledKeys: ['cat']}, {className: ({isDisabled}) => isDisabled ? 'disabled' : ''});
    let row = getAllByRole('row')[0];

    expect(row).toHaveAttribute('aria-disabled', 'true');
    expect(row).toHaveClass('disabled');

    expect(within(row).getByRole('checkbox')).toBeDisabled();
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
        {(item) => <Item id={item.id}>{item.name}</Item>}
      </GridList>
    );

    let gridList = getByRole('grid');
    expect(within(gridList).getAllByRole('row').map((r) => r.textContent)).toEqual(['Cat', 'Dog']);
  });

  describe('drag and drop', () => {
    it('should support drag button slot', () => {
      let {getAllByRole} = render(<DraggableGridList />);
      let button = getAllByRole('button')[0];
      expect(button).toHaveAttribute('aria-label', 'Drag Cat');
    });

    it('should render drop indicators', () => {
      let onReorder = jest.fn();
      let {getAllByRole} = render(<DraggableGridList onReorder={onReorder} />);
      let button = getAllByRole('button')[0];
      fireEvent.keyDown(button, {key: 'Enter'});
      fireEvent.keyUp(button, {key: 'Enter'});
      act(() => jest.runAllTimers());

      let rows = getAllByRole('row');
      expect(rows).toHaveLength(5);
      expect(rows[0]).toHaveAttribute('class', 'react-aria-DropIndicator');
      expect(rows[0]).toHaveAttribute('data-drop-target', 'true');
      expect(within(rows[0]).getByRole('button')).toHaveAttribute('aria-label', 'Insert before Cat');
      expect(rows[2]).toHaveAttribute('class', 'react-aria-DropIndicator');
      expect(rows[2]).not.toHaveAttribute('data-drop-target');
      expect(within(rows[2]).getByRole('button')).toHaveAttribute('aria-label', 'Insert between Cat and Dog');
      expect(rows[3]).toHaveAttribute('class', 'react-aria-DropIndicator');
      expect(rows[3]).not.toHaveAttribute('data-drop-target');
      expect(within(rows[3]).getByRole('button')).toHaveAttribute('aria-label', 'Insert between Dog and Kangaroo');
      expect(rows[4]).toHaveAttribute('class', 'react-aria-DropIndicator');
      expect(rows[4]).not.toHaveAttribute('data-drop-target');
      expect(within(rows[4]).getByRole('button')).toHaveAttribute('aria-label', 'Insert after Kangaroo');

      fireEvent.keyDown(document.activeElement, {key: 'ArrowDown'});
      fireEvent.keyUp(document.activeElement, {key: 'ArrowDown'});

      expect(document.activeElement).toHaveAttribute('aria-label', 'Insert between Cat and Dog');
      expect(rows[0]).not.toHaveAttribute('data-drop-target', 'true');
      expect(rows[2]).toHaveAttribute('data-drop-target', 'true');

      fireEvent.keyDown(document.activeElement, {key: 'Enter'});
      fireEvent.keyUp(document.activeElement, {key: 'Enter'});
      act(() => jest.runAllTimers());

      expect(onReorder).toHaveBeenCalledTimes(1);
    });

    it('should support dropping on rows', () => {
      let onItemDrop = jest.fn();
      let {getAllByRole} = render(<>
        <DraggableGridList />
        <DraggableGridList onItemDrop={onItemDrop} />
      </>);

      let button = getAllByRole('button')[0];
      fireEvent.keyDown(button, {key: 'Enter'});
      fireEvent.keyUp(button, {key: 'Enter'});
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

      fireEvent.keyDown(document.activeElement, {key: 'Enter'});
      fireEvent.keyUp(document.activeElement, {key: 'Enter'});
      act(() => jest.runAllTimers());

      expect(onItemDrop).toHaveBeenCalledTimes(1);
    });

    it('should support dropping on the root', () => {
      let onRootDrop = jest.fn();
      let {getAllByRole} = render(<>
        <DraggableGridList />
        <DraggableGridList onRootDrop={onRootDrop} />
      </>);

      let button = getAllByRole('button')[0];
      fireEvent.keyDown(button, {key: 'Enter'});
      fireEvent.keyUp(button, {key: 'Enter'});
      act(() => jest.runAllTimers());

      let grids = getAllByRole('grid');
      let rows = within(grids[1]).getAllByRole('row');
      expect(rows).toHaveLength(1);
      expect(within(rows[0]).getByRole('button')).toHaveAttribute('aria-label', 'Drop on');
      expect(document.activeElement).toBe(within(rows[0]).getByRole('button'));
      expect(grids[1]).toHaveAttribute('data-drop-target', 'true');

      fireEvent.keyDown(document.activeElement, {key: 'Enter'});
      fireEvent.keyUp(document.activeElement, {key: 'Enter'});
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
            <Item href="https://google.com">One</Item>
            <Item href="https://adobe.com">Two</Item>
          </GridList>
        );

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
        let {getAllByRole} = render(
          <GridList aria-label="listview" selectionMode={selectionMode}>
            <Item href="https://google.com" textValue="one"><Checkbox slot="selection" /> One</Item>
            <Item href="https://adobe.com" textValue="two"><Checkbox slot="selection" /> Two</Item>
          </GridList>
        );

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
        let {getAllByRole} = render(
          <GridList aria-label="listview" selectionMode={selectionMode} selectionBehavior="replace">
            <Item href="https://google.com">One</Item>
            <Item href="https://adobe.com">Two</Item>
          </GridList>
        );

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
        expect(onClick).not.toHaveBeenCalled();
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
