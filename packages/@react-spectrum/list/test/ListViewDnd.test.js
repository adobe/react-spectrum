/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

jest.mock('@react-aria/live-announcer');
import {act, fireEvent, render as renderComponent, waitFor, within} from '@testing-library/react';
import {CUSTOM_DRAG_TYPE} from '@react-aria/dnd/src/constants';
import {DataTransfer, DataTransferItem, DragEvent} from '@react-aria/dnd/test/mocks';
import {DragBetweenListsRootOnlyExample, DragExample, DragIntoItemExample, ReorderExample} from '../stories/ListView.stories';
import {Droppable} from '@react-aria/dnd/test/examples';
import {installPointerEvent} from '@react-spectrum/test-utils';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';
import userEvent from '@testing-library/user-event';


describe('ListView', function () {
  let offsetWidth, offsetHeight, scrollHeight;
  let onSelectionChange = jest.fn();
  let onDragStart = jest.fn();
  let onDragMove = jest.fn();
  let onDragEnd = jest.fn();
  let onDrop = jest.fn();
  let checkSelection = (onSelectionChange, selectedKeys) => {
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(new Set(onSelectionChange.mock.calls[0][0])).toEqual(new Set(selectedKeys));
  };

  beforeAll(function () {
    offsetWidth = jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 1000);
    offsetHeight = jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 1000);
    scrollHeight = jest.spyOn(window.HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(() => 40);
    jest.useFakeTimers();
  });

  afterEach(function () {
    fireEvent.keyDown(document.activeElement, {key: 'Escape'});
    fireEvent.keyUp(document.activeElement, {key: 'Escape'});
    jest.clearAllMocks();
  });

  afterAll(function () {
    offsetWidth.mockReset();
    offsetHeight.mockReset();
    scrollHeight.mockReset();
  });

  let render = (children, locale = 'en-US', scale = 'medium') => {
    let tree = renderComponent(
      <Provider theme={theme} scale={scale} locale={locale}>
        {children}
      </Provider>
  );
    // Allow for Virtualizer layout to update
    act(() => {jest.runAllTimers();});
    return tree;
  };

  let moveFocus = (key, opts = {}) => {
    fireEvent.keyDown(document.activeElement, {key, ...opts});
    fireEvent.keyUp(document.activeElement, {key, ...opts});
  };

  describe('drag and drop', function () {
    installPointerEvent();

    function DraggableListView(props) {
      let {dragHookOptions, listViewProps} = props;
      return (
        <>
          <Droppable onDrop={onDrop} />
          <DragExample dragHookOptions={{onDragStart, onDragMove, onDragEnd, ...dragHookOptions}} listViewProps={{onSelectionChange, ...listViewProps}} />
        </>
      );
    }

    function Reorderable(props) {
      return (
        <ReorderExample onDrop={jest.fn()} onDragStart={onDragStart} onDragEnd={onDragEnd} {...props} />
      );
    }
    beforeEach(() => {
      jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({
        left: 0,
        top: 0,
        x: 0,
        y: 0,
        width: 100,
        height: 50
      }));
    });

    afterEach(() => {
      act(() => {jest.runAllTimers();});
      jest.clearAllMocks();
    });

    describe('via mouse', function () {
      it('should show a default drag preview on drag', function () {
        let {getAllByRole, getAllByText} = render(
          <DraggableListView />
        );

        let row = getAllByRole('row')[0];
        let cell = within(row).getByRole('gridcell');
        let cellText = getAllByText(cell.textContent);
        expect(cellText).toHaveLength(1);

        let dataTransfer = new DataTransfer();

        fireEvent.pointerDown(cell, {pointerType: 'mouse', button: 0, pointerId: 1, clientX: 5, clientY: 5});
        // TODO: fireEvent.dragStart(cell, {dataTransfer, clientX: 5, clientY: 5}) doesn't propagate the clientX and Y values,
        // test if upgrading testing library/jsdom fixes issue
        fireEvent(cell, new DragEvent('dragstart', {dataTransfer, clientX: 5, clientY: 5}));
        expect(dataTransfer._dragImage.x).toBe(5);
        expect(dataTransfer._dragImage.y).toBe(5);

        cellText = getAllByText(cell.textContent);
        expect(cellText).toHaveLength(2);
        fireEvent.pointerUp(cell, {button: 0, pointerId: 1, clientX: 5, clientY: 5});
        fireEvent(cell, new DragEvent('dragend', {dataTransfer, clientX: 5, clientY: 5}));

        act(() => {jest.runAllTimers();});
        cellText = getAllByText(cell.textContent);
        expect(cellText).toHaveLength(1);
      });

      it('should allow drag and drop of a single row', async function () {
        let {getAllByRole, getByText} = render(
          <DraggableListView />
        );

        let droppable = getByText('Drop here');
        let row = getAllByRole('row')[0];
        expect(row).toHaveAttribute('draggable', 'true');
        let cell = within(row).getByRole('gridcell');
        expect(cell).toHaveTextContent('Adobe Photoshop');

        let dataTransfer = new DataTransfer();
        fireEvent.pointerDown(cell, {pointerType: 'mouse', button: 0, pointerId: 1, clientX: 0, clientY: 0});
        fireEvent(cell, new DragEvent('dragstart', {dataTransfer, clientX: 0, clientY: 0}));
        expect([...dataTransfer.items]).toEqual([new DataTransferItem('text/plain', 'Adobe Photoshop')]);

        act(() => jest.runAllTimers());

        expect(onDragStart).toHaveBeenCalledTimes(1);
        expect(onDragStart).toHaveBeenCalledWith({
          type: 'dragstart',
          keys: new Set('a'),
          x: 0,
          y: 0
        });

        fireEvent.pointerMove(cell, {pointerType: 'mouse', button: 0, pointerId: 1, clientX: 1, clientY: 1});
        fireEvent(cell, new DragEvent('drag', {dataTransfer, clientX: 1, clientY: 1}));
        expect(onDragMove).toHaveBeenCalledTimes(1);
        expect(onDragMove).toHaveBeenCalledWith({
          type: 'dragmove',
          keys: new Set('a'),
          x: 1,
          y: 1
        });

        fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
        fireEvent(droppable, new DragEvent('drop', {dataTransfer, clientX: 1, clientY: 1}));
        act(() => jest.runAllTimers());
        expect(onDrop).toHaveBeenCalledTimes(1);
        expect(onDrop).toHaveBeenCalledWith({
          type: 'drop',
          x: 1,
          y: 1,
          dropOperation: 'move',
          items: [
            {
              kind: 'text',
              types: new Set(['text/plain']),
              getText: expect.any(Function)
            }
          ]
        });

        expect(await onDrop.mock.calls[0][0].items[0].getText('text/plain')).toBe('Adobe Photoshop');

        fireEvent.pointerUp(cell, {pointerType: 'mouse', button: 0, pointerId: 1, clientX: 1, clientY: 1});
        fireEvent(cell, new DragEvent('dragend', {dataTransfer, clientX: 1, clientY: 1}));
        expect(onDragEnd).toHaveBeenCalledTimes(1);
        expect(onDragEnd).toHaveBeenCalledWith({
          type: 'dragend',
          keys: new Set('a'),
          x: 1,
          y: 1,
          dropOperation: 'move'
        });
      });

      it('should allow drag and drop of multiple rows', async function () {
        let {getAllByRole, getByText} = render(
          <DraggableListView />
        );

        let droppable = getByText('Drop here');
        let rows = getAllByRole('row');
        act(() => userEvent.click(within(rows[0]).getByRole('checkbox')));
        act(() => userEvent.click(within(rows[1]).getByRole('checkbox')));
        act(() => userEvent.click(within(rows[2]).getByRole('checkbox')));
        act(() => userEvent.click(within(rows[3]).getByRole('checkbox')));

        expect(new Set(onSelectionChange.mock.calls[3][0])).toEqual(new Set(['a', 'b', 'c', 'd']));

        let cellA = within(rows[0]).getByRole('gridcell');
        expect(cellA).toHaveTextContent('Adobe Photoshop');
        expect(rows[0]).toHaveAttribute('draggable', 'true');

        let cellB = within(rows[1]).getByRole('gridcell');
        expect(cellB).toHaveTextContent('Adobe XD');
        expect(rows[1]).toHaveAttribute('draggable', 'true');

        let cellC = within(rows[2]).getByRole('gridcell');
        expect(cellC).toHaveTextContent('Documents');
        expect(rows[2]).toHaveAttribute('draggable', 'true');

        let cellD = within(rows[3]).getByRole('gridcell');
        expect(cellD).toHaveTextContent('Adobe InDesign');
        expect(rows[3]).toHaveAttribute('draggable', 'true');

        let dataTransfer = new DataTransfer();
        fireEvent.pointerDown(cellA, {pointerType: 'mouse', button: 0, pointerId: 1, clientX: 0, clientY: 0});
        fireEvent(cellA, new DragEvent('dragstart', {dataTransfer, clientX: 0, clientY: 0}));
        expect([...dataTransfer.items]).toEqual([
          new DataTransferItem('text/plain', 'Adobe Photoshop\nAdobe XD\nDocuments\nAdobe InDesign'),
          new DataTransferItem(
            CUSTOM_DRAG_TYPE,
            JSON.stringify([{'text/plain': 'Adobe Photoshop'}, {'text/plain': 'Adobe XD'}, {'text/plain': 'Documents'}, {'text/plain': 'Adobe InDesign'}]
            ))
        ]);

        act(() => jest.runAllTimers());

        expect(onDragStart).toHaveBeenCalledTimes(1);
        expect(onDragStart).toHaveBeenCalledWith({
          type: 'dragstart',
          keys: new Set(['a', 'b', 'c', 'd']),
          x: 0,
          y: 0
        });

        fireEvent.pointerMove(cellA, {pointerType: 'mouse', button: 0, pointerId: 1, clientX: 1, clientY: 1});
        fireEvent(cellA, new DragEvent('drag', {dataTransfer, clientX: 1, clientY: 1}));
        expect(onDragMove).toHaveBeenCalledTimes(1);
        expect(onDragMove).toHaveBeenCalledWith({
          type: 'dragmove',
          keys: new Set(['a', 'b', 'c', 'd']),
          x: 1,
          y: 1
        });

        fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
        fireEvent(droppable, new DragEvent('drop', {dataTransfer, clientX: 1, clientY: 1}));
        act(() => jest.runAllTimers());
        expect(onDrop).toHaveBeenCalledTimes(1);

        expect(await onDrop.mock.calls[0][0].items).toHaveLength(4);
        expect(await onDrop.mock.calls[0][0].items[0].getText('text/plain')).toBe('Adobe Photoshop');
        expect(await onDrop.mock.calls[0][0].items[1].getText('text/plain')).toBe('Adobe XD');
        expect(await onDrop.mock.calls[0][0].items[2].getText('text/plain')).toBe('Documents');
        expect(await onDrop.mock.calls[0][0].items[3].getText('text/plain')).toBe('Adobe InDesign');

        fireEvent.pointerUp(cellA, {pointerType: 'mouse', button: 0, pointerId: 1, clientX: 1, clientY: 1});
        fireEvent(cellA, new DragEvent('dragend', {dataTransfer, clientX: 1, clientY: 1}));
        expect(onDragEnd).toHaveBeenCalledTimes(1);
        expect(onDragEnd).toHaveBeenCalledWith({
          type: 'dragend',
          keys: new Set(['a', 'b', 'c', 'd']),
          x: 1,
          y: 1,
          dropOperation: 'move'
        });
      });

      it('should not allow drag operations on a disabled row', function () {
        let {getAllByRole} = render(
          <DraggableListView listViewProps={{disabledKeys: ['a']}} />
      );

        let row = getAllByRole('row')[0];
        let cell = within(row).getByRole('gridcell');
        expect(cell).toHaveTextContent('Adobe Photoshop');
        expect(row).not.toHaveAttribute('draggable', 'true');

        let dataTransfer = new DataTransfer();
        fireEvent.pointerDown(cell, {pointerType: 'mouse', button: 0, pointerId: 1, clientX: 0, clientY: 0});
        fireEvent(cell, new DragEvent('dragstart', {dataTransfer, clientX: 0, clientY: 0}));
        expect(onDragStart).toHaveBeenCalledTimes(0);
      });

      it('should allow drag operations on a disabled row with disabledBehavior="selection"', function () {
        let {getAllByRole} = render(
          <DraggableListView listViewProps={{disabledKeys: ['a'], disabledBehavior: 'selection'}} />
      );

        let row = getAllByRole('row')[0];
        let cell = within(row).getByRole('gridcell');
        expect(cell).toHaveTextContent('Adobe Photoshop');
        expect(row).toHaveAttribute('draggable', 'true');

        let dataTransfer = new DataTransfer();
        fireEvent.pointerDown(cell, {pointerType: 'mouse', button: 0, pointerId: 1, clientX: 0, clientY: 0});
        fireEvent(cell, new DragEvent('dragstart', {dataTransfer, clientX: 0, clientY: 0}));
        expect([...dataTransfer.items]).toEqual([new DataTransferItem('text/plain', 'Adobe Photoshop')]);
        expect(onDragStart).toHaveBeenCalledTimes(1);
      });

      it('should not allow dragging when not selected when it conflicts with onAction', function () {
        let onAction = jest.fn();
        let {getAllByRole} = render(
          <DraggableListView listViewProps={{onAction}} />
      );

        let rows = getAllByRole('row');
        let cell = within(rows[2]).getByRole('gridcell');
        let dataTransfer = new DataTransfer();
        let event = new DragEvent('dragstart', {dataTransfer, clientX: 5, clientY: 5});

        fireEvent.pointerDown(cell, {pointerType: 'touch', button: 0, pointerId: 1, clientX: 5, clientY: 5});
        fireEvent(cell, event);

        expect(event.defaultPrevented).toBe(true);
        expect(dataTransfer.items._items).toHaveLength(0);
      });
    });

    describe('via keyboard', function () {
      afterEach(() => {
        fireEvent.keyDown(document.body, {key: 'Escape'});
        fireEvent.keyUp(document.body, {key: 'Escape'});
      });

      it('should allow drag and drop of a single row', async function () {
        let {getAllByRole, getByText} = render(
          <DraggableListView />
        );

        let droppable = getByText('Drop here');
        let row = getAllByRole('row')[0];
        let cell = within(row).getByRole('gridcell');
        expect(cell).toHaveTextContent('Adobe Photoshop');
        expect(row).toHaveAttribute('draggable', 'true');

        userEvent.tab();
        let draghandle = within(cell).getAllByRole('button')[0];
        expect(draghandle).toBeTruthy();
        expect(draghandle).toHaveAttribute('draggable', 'true');

        fireEvent.keyDown(draghandle, {key: 'Enter'});
        fireEvent.keyUp(draghandle, {key: 'Enter'});

        expect(onDragStart).toHaveBeenCalledTimes(1);
        expect(onDragStart).toHaveBeenCalledWith({
          type: 'dragstart',
          keys: new Set('a'),
          x: 50,
          y: 25
        });

        act(() => jest.runAllTimers());
        expect(document.activeElement).toBe(droppable);
        fireEvent.keyDown(droppable, {key: 'Enter'});
        fireEvent.keyUp(droppable, {key: 'Enter'});

        expect(onDrop).toHaveBeenCalledTimes(1);
        expect(await onDrop.mock.calls[0][0].items[0].getText('text/plain')).toBe('Adobe Photoshop');

        expect(onDragEnd).toHaveBeenCalledTimes(1);
        expect(onDragEnd).toHaveBeenCalledWith({
          type: 'dragend',
          keys: new Set('a'),
          x: 50,
          y: 25,
          dropOperation: 'move'
        });
      });

      it('should allow drag and drop of multiple rows', async function () {
        let {getAllByRole, getByText} = render(
          <DraggableListView listViewProps={{selectedKeys: ['a', 'b', 'c', 'd']}} />
      );

        let droppable = getByText('Drop here');
        let rows = getAllByRole('row');

        let cellA = within(rows[0]).getByRole('gridcell');
        expect(cellA).toHaveTextContent('Adobe Photoshop');
        expect(rows[0]).toHaveAttribute('draggable', 'true');

        let cellB = within(rows[1]).getByRole('gridcell');
        expect(cellB).toHaveTextContent('Adobe XD');
        expect(rows[1]).toHaveAttribute('draggable', 'true');

        let cellC = within(rows[2]).getByRole('gridcell');
        expect(cellC).toHaveTextContent('Documents');
        expect(rows[2]).toHaveAttribute('draggable', 'true');

        let cellD = within(rows[3]).getByRole('gridcell');
        expect(cellD).toHaveTextContent('Adobe InDesign');
        expect(rows[3]).toHaveAttribute('draggable', 'true');

        userEvent.tab();
        let draghandle = within(cellA).getAllByRole('button')[0];
        expect(draghandle).toBeTruthy();

        fireEvent.keyDown(draghandle, {key: 'Enter'});
        fireEvent.keyUp(draghandle, {key: 'Enter'});

        expect(onDragStart).toHaveBeenCalledTimes(1);
        expect(onDragStart).toHaveBeenCalledWith({
          type: 'dragstart',
          keys: new Set(['a', 'b', 'c', 'd']),
          x: 50,
          y: 25
        });

        act(() => jest.runAllTimers());
        expect(document.activeElement).toBe(droppable);
        fireEvent.keyDown(droppable, {key: 'Enter'});
        fireEvent.keyUp(droppable, {key: 'Enter'});

        expect(onDrop).toHaveBeenCalledTimes(1);

        expect(await onDrop.mock.calls[0][0].items).toHaveLength(4);
        expect(await onDrop.mock.calls[0][0].items[0].getText('text/plain')).toBe('Adobe Photoshop');
        expect(await onDrop.mock.calls[0][0].items[1].getText('text/plain')).toBe('Adobe XD');
        expect(await onDrop.mock.calls[0][0].items[2].getText('text/plain')).toBe('Documents');
        expect(await onDrop.mock.calls[0][0].items[3].getText('text/plain')).toBe('Adobe InDesign');

        expect(onDragEnd).toHaveBeenCalledTimes(1);
        expect(onDragEnd).toHaveBeenCalledWith({
          type: 'dragend',
          keys: new Set(['a', 'b', 'c', 'd']),
          x: 50,
          y: 25,
          dropOperation: 'move'
        });
      });
    });

    it('should make row selection happen on pressUp if list is draggable', function () {
      let {getAllByRole} = render(
        <DraggableListView />
      );

      let rows = getAllByRole('row');
      let draggableRow = rows[0];
      expect(draggableRow).toHaveAttribute('aria-selected', 'false');
      fireEvent.pointerDown(draggableRow, {pointerType: 'mouse'});
      expect(draggableRow).toHaveAttribute('aria-selected', 'false');
      expect(onSelectionChange).toHaveBeenCalledTimes(0);
      fireEvent.pointerUp(draggableRow, {pointerType: 'mouse'});
      expect(draggableRow).toHaveAttribute('aria-selected', 'true');
      checkSelection(onSelectionChange, ['a']);
    });

    it('should toggle selection upon clicking the row checkbox', function () {
      let {getAllByRole} = render(
        <DraggableListView />
      );

      let row = getAllByRole('row')[0];
      expect(row).toHaveAttribute('aria-selected', 'false');
      expect(row).toHaveAttribute('draggable', 'true');
      act(() => userEvent.click(within(row).getByRole('checkbox')));
      expect(row).toHaveAttribute('aria-selected', 'true');
      expect(onDragStart).toHaveBeenCalledTimes(0);
      checkSelection(onSelectionChange, ['a']);
    });

    it('should only display the drag handle on keyboard focus for dragggable items', function () {
      let {getAllByRole} = render(
        <DraggableListView listViewProps={{selectionMode: 'single'}} />
    );

      let rows = getAllByRole('row');
      let cellA = within(rows[0]).getByRole('gridcell');
      userEvent.click(cellA, {pointerType: 'mouse'});
      expect(document.activeElement).toBe(rows[0]);
      let dragHandle = within(cellA).getAllByRole('button')[0];
      // If the dragHandle has a style applied, it is visually hidden
      expect(dragHandle.style).toBeTruthy();
      expect(dragHandle.style.position).toBe('absolute');

      fireEvent.pointerDown(rows[0], {pointerType: 'mouse', button: 0, pointerId: 1});
      dragHandle = within(cellA).getAllByRole('button')[0];
      expect(dragHandle.style).toBeTruthy();
      expect(dragHandle.style.position).toBe('absolute');
      fireEvent.pointerUp(rows[0], {button: 0, pointerId: 1});

      fireEvent.pointerEnter(rows[0], {pointerType: 'mouse'});
      dragHandle = within(cellA).getAllByRole('button')[0];
      expect(dragHandle.style).toBeTruthy();
      expect(dragHandle.style.position).toBe('absolute');

      // If dragHandle doesn't have a position applied, it isn't visually hidden
      fireEvent.keyDown(rows[0], {key: 'Enter'});
      fireEvent.keyUp(rows[0], {key: 'Enter'});
      dragHandle = within(cellA).getAllByRole('button')[0];
      expect(dragHandle.style.position).toBe('');
    });

    it('should not display the drag handle on hover, press, or keyboard focus for disabled/non dragggable items', function () {
      function hasDragHandle(el) {
        let buttons = within(el).getAllByRole('button');
        return buttons[0].getAttribute('draggable');
      }

      let {getAllByRole} = render(
        <DraggableListView listViewProps={{disabledKeys: ['a']}} />
    );

      let rows = getAllByRole('row');
      let cellA = within(rows[0]).getByRole('gridcell');
      let cellB = within(rows[1]).getByRole('gridcell');

      userEvent.tab();
      expect(hasDragHandle(cellA)).toBeFalsy();
      moveFocus('ArrowDown');
      expect(hasDragHandle(cellB)).toBeTruthy();

      fireEvent.pointerDown(cellA, {button: 0, pointerId: 1});
      expect(hasDragHandle(cellA)).toBeFalsy();
      fireEvent.pointerUp(cellA, {button: 0, pointerId: 1});

      fireEvent.pointerDown(cellB, {button: 0, pointerId: 1});
      expect(hasDragHandle(cellB)).toBeTruthy();
      fireEvent.pointerUp(cellB, {button: 0, pointerId: 1});

      fireEvent.pointerEnter(cellA);
      expect(hasDragHandle(cellA)).toBeFalsy();
      fireEvent.pointerEnter(cellB);
      expect(hasDragHandle(cellB)).toBeTruthy();
    });

    it('should display the drag handle on hover, press, or keyboard focus for disabled/non dragggable items with disabledBehavior="selection"', function () {
      function hasDragHandle(el) {
        let buttons = within(el).getAllByRole('button');
        return buttons[0].getAttribute('draggable');
      }

      let {getAllByRole} = render(
        <DraggableListView listViewProps={{disabledKeys: ['a'], disabledBehavior: 'selection'}} />
    );

      let rows = getAllByRole('row');
      let cellA = within(rows[0]).getByRole('gridcell');
      let cellB = within(rows[1]).getByRole('gridcell');

      userEvent.tab();
      expect(hasDragHandle(cellA)).toBeTruthy();
      moveFocus('ArrowDown');
      expect(hasDragHandle(cellB)).toBeTruthy();

      fireEvent.pointerDown(cellA, {button: 0, pointerId: 1});
      expect(hasDragHandle(cellA)).toBeTruthy();
      fireEvent.pointerUp(cellA, {button: 0, pointerId: 1});

      fireEvent.pointerDown(cellB, {button: 0, pointerId: 1});
      expect(hasDragHandle(cellB)).toBeTruthy();
      fireEvent.pointerUp(cellB, {button: 0, pointerId: 1});

      fireEvent.pointerEnter(cellA);
      expect(hasDragHandle(cellA)).toBeTruthy();
      fireEvent.pointerEnter(cellB);
      expect(hasDragHandle(cellB)).toBeTruthy();
    });

    it('should open a menu upon click', function () {
      let {getAllByRole, getByRole} = render(
        <DraggableListView />
      );

      let row = getAllByRole('row')[0];
      expect(row).toHaveAttribute('aria-selected', 'false');
      expect(row).toHaveAttribute('draggable', 'true');

      let menuButton = within(row).getAllByRole('button')[1];
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');

      userEvent.click(menuButton, {pointerType: 'mouse'});
      act(() => {jest.runAllTimers();});

      let menu = getByRole('menu');
      expect(menu).toBeTruthy();
      expect(menuButton).toHaveAttribute('aria-expanded', 'true');
      expect(row).toHaveAttribute('aria-selected', 'false');
      expect(onDragStart).toHaveBeenCalledTimes(0);
      expect(onSelectionChange).toHaveBeenCalledTimes(0);
    });

    // disabledKeys 1 means we actually start on item 2 and drag that, so everything is offset by 1 and it wraps one early
    it.each`
    disabledKeys | itemLabels
    ${['1']}     | ${['Two', 'Three', 'Four', 'Five', 'Six', 'before', 'One', 'Two']}
    ${['2']}     | ${['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'before']}
    ${['3']}     | ${['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'before']}
    ${['4']}     | ${['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'before']}
    ${['5']}     | ${['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'before']}
    ${['6']}     | ${['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'before']}
    `('should be able to insert next to a disabled key, disabled key is $disabledKeys', async function ({disabledKeys, itemLabels}) {
      render(
        <Reorderable disabledKeys={disabledKeys} />
      );

      userEvent.tab();

      fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
      fireEvent.keyUp(document.activeElement, {key: 'ArrowRight'});

      fireEvent.keyDown(document.activeElement, {key: 'Enter'});
      fireEvent.keyUp(document.activeElement, {key: 'Enter'});

      expect(onDragStart).toHaveBeenCalledTimes(1);
      act(() => jest.runAllTimers());

      for (let i = 0; i <= 6; i++) {
        if (itemLabels[i] === 'Six') {
          expect(document.activeElement).toHaveAttribute('aria-label', 'Insert after Item Six');
        } else if (itemLabels[i] === 'before') {
          expect(document.activeElement).toHaveAttribute('aria-label', 'Insert before Item One');
        } else {
          expect(document.activeElement).toHaveAttribute('aria-label', `Insert between Item ${itemLabels[i]} and Item ${itemLabels[i + 1]}`);
        }
        fireEvent.keyDown(document.activeElement, {key: 'ArrowDown'});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowDown'});
      }

      fireEvent.keyDown(document.activeElement, {key: 'Escape'});
      fireEvent.keyUp(document.activeElement, {key: 'Escape'});

      expect(onDragEnd).toHaveBeenCalledTimes(1);
    });

    it('should only count the selected keys that exist in the collection when dragging and dropping', async function () {
      let {getAllByRole} = render(
        <DragIntoItemExample dragHookOptions={{onDragStart, onDragEnd}} listViewProps={{onSelectionChange, disabledKeys: []}} dropHookOptions={{onDrop}} />
      );

      userEvent.tab();
      let rows = getAllByRole('row');
      expect(rows).toHaveLength(9);
      let droppable = rows[8];
      moveFocus('ArrowDown');
      fireEvent.keyDown(document.activeElement, {key: 'Enter'});
      fireEvent.keyUp(document.activeElement, {key: 'Enter'});
      moveFocus('ArrowDown');
      fireEvent.keyDown(document.activeElement, {key: 'Enter'});
      fireEvent.keyUp(document.activeElement, {key: 'Enter'});
      moveFocus('ArrowDown');
      fireEvent.keyDown(document.activeElement, {key: 'Enter'});
      fireEvent.keyUp(document.activeElement, {key: 'Enter'});

      expect(new Set(onSelectionChange.mock.calls[2][0])).toEqual(new Set(['1', '2', '3']));
      let draghandle = within(rows[3]).getAllByRole('button')[0];
      expect(draghandle).toBeTruthy();
      expect(draghandle).toHaveAttribute('draggable', 'true');

      moveFocus('ArrowRight');
      fireEvent.keyDown(draghandle, {key: 'Enter'});
      fireEvent.keyUp(draghandle, {key: 'Enter'});

      expect(onDragStart).toHaveBeenCalledTimes(1);
      expect(onDragStart).toHaveBeenCalledWith({
        type: 'dragstart',
        keys: new Set(['1', '2', '3']),
        x: 50,
        y: 25
      });

      act(() => jest.runAllTimers());
      let droppableButton = await within(droppable).findByLabelText('Drop on Folder 2', {hidden: true});
      expect(document.activeElement).toBe(droppableButton);
      fireEvent.keyDown(droppableButton, {key: 'Enter'});
      fireEvent.keyUp(droppableButton, {key: 'Enter'});
      await act(async () => Promise.resolve());
      act(() => jest.runAllTimers());

      expect(onDrop).toHaveBeenCalledTimes(1);
      expect(await onDrop.mock.calls[0][0].items).toHaveLength(3);
      expect(onDragEnd).toHaveBeenCalledTimes(1);
      expect(onDragEnd).toHaveBeenCalledWith({
        type: 'dragend',
        keys: new Set(['1', '2', '3']),
        x: 50,
        y: 25,
        dropOperation: 'move'
      });
      onSelectionChange.mockClear();
      onDragStart.mockClear();

      rows = getAllByRole('row');
      expect(rows).toHaveLength(6);

      // Select the folder and perform a drag. Drag start shouldn't include the previously selected items
      moveFocus('ArrowDown');
      fireEvent.keyDown(droppable, {key: 'Enter'});
      fireEvent.keyUp(droppable, {key: 'Enter'});
      // Selection change event still has all keys
      expect(new Set(onSelectionChange.mock.calls[0][0])).toEqual(new Set(['1', '2', '3', '8']));

      draghandle = within(rows[0]).getAllByRole('button')[0];
      expect(draghandle).toBeTruthy();
      expect(draghandle).toHaveAttribute('draggable', 'true');
      moveFocus('ArrowRight');
      fireEvent.keyDown(draghandle, {key: 'Enter'});
      fireEvent.keyUp(draghandle, {key: 'Enter'});
      act(() => jest.runAllTimers());

      expect(onDragStart).toHaveBeenCalledTimes(1);
      expect(onDragStart).toHaveBeenCalledWith({
        type: 'dragstart',
        keys: new Set(['0']),
        x: 50,
        y: 25
      });

      fireEvent.keyDown(document.body, {key: 'Escape'});
      fireEvent.keyUp(document.body, {key: 'Escape'});
    });

    it('should automatically focus the newly added dropped item', async function () {
      let {getAllByRole} = render(
        <DragBetweenListsRootOnlyExample dragHookOptions={{onDragStart, onDragEnd}} listViewProps={{onSelectionChange, disabledKeys: []}} dropHookOptions={{onDrop}} />
      );

      let grids = getAllByRole('grid');
      expect(grids).toHaveLength(2);
      let firstListRows = within(grids[0]).getAllByRole('row');
      let draggedCell = within(firstListRows[0]).getByRole('gridcell');
      let secondListRows = within(grids[1]).getAllByRole('row');
      expect(firstListRows).toHaveLength(6);
      expect(secondListRows).toHaveLength(6);

      let dataTransfer = new DataTransfer();
      fireEvent.pointerDown(draggedCell, {pointerType: 'mouse', button: 0, pointerId: 1, clientX: 0, clientY: 0});
      fireEvent(draggedCell, new DragEvent('dragstart', {dataTransfer, clientX: 0, clientY: 0}));

      act(() => jest.runAllTimers());
      expect(onDragStart).toHaveBeenCalledTimes(1);
      fireEvent.pointerMove(draggedCell, {pointerType: 'mouse', button: 0, pointerId: 1, clientX: 1, clientY: 1});
      fireEvent(draggedCell, new DragEvent('drag', {dataTransfer, clientX: 1, clientY: 1}));
      fireEvent(grids[1], new DragEvent('dragover', {dataTransfer, clientX: 1, clientY: 1}));
      fireEvent.pointerUp(draggedCell, {pointerType: 'mouse', button: 0, pointerId: 1, clientX: 1, clientY: 1});
      fireEvent(draggedCell, new DragEvent('dragend', {dataTransfer, clientX: 1, clientY: 1}));
      expect(onDragEnd).toHaveBeenCalledTimes(1);
      fireEvent(grids[1], new DragEvent('drop', {dataTransfer, clientX: 1, clientY: 1}));

      await waitFor(() => expect(within(grids[1]).getAllByRole('row')).toHaveLength(7), {interval: 10});
      expect(onDrop).toHaveBeenCalledTimes(1);

      grids = getAllByRole('grid');
      firstListRows = within(grids[0]).getAllByRole('row');
      secondListRows = within(grids[1]).getAllByRole('row');
      expect(firstListRows).toHaveLength(5);
      expect(secondListRows).toHaveLength(7);

      // The newly added row in the second list should be the active element
      expect(secondListRows[6]).toBe(document.activeElement);
      expect(secondListRows[6]).toHaveTextContent('Item One');

      for (let [index, row] of secondListRows.entries()) {
        if (index !== 6) {
          expect(row).toHaveAttribute('tabIndex', '-1');
        } else {
          expect(row).toHaveAttribute('tabIndex', '0');
        }
      }

      draggedCell = firstListRows[3];
      dataTransfer = new DataTransfer();
      fireEvent.pointerDown(draggedCell, {pointerType: 'mouse', button: 0, pointerId: 1, clientX: 0, clientY: 0});
      fireEvent(draggedCell, new DragEvent('dragstart', {dataTransfer, clientX: 0, clientY: 0}));

      act(() => jest.runAllTimers());
      expect(onDragStart).toHaveBeenCalledTimes(2);
      fireEvent.pointerMove(draggedCell, {pointerType: 'mouse', button: 0, pointerId: 1, clientX: 1, clientY: 1});
      fireEvent(draggedCell, new DragEvent('drag', {dataTransfer, clientX: 1, clientY: 1}));
      fireEvent(grids[1], new DragEvent('dragover', {dataTransfer, clientX: 1, clientY: 2}));
      fireEvent.pointerUp(draggedCell, {pointerType: 'mouse', button: 0, pointerId: 1, clientX: 1, clientY: 1});
      fireEvent(draggedCell, new DragEvent('dragend', {dataTransfer, clientX: 1, clientY: 1}));
      expect(onDragEnd).toHaveBeenCalledTimes(2);
      fireEvent(grids[1], new DragEvent('drop', {dataTransfer, clientX: 1, clientY: 1}));

      await waitFor(() => expect(within(grids[1]).getAllByRole('row')).toHaveLength(8), {interval: 10});
      expect(onDrop).toHaveBeenCalledTimes(2);

      grids = getAllByRole('grid');
      firstListRows = within(grids[0]).getAllByRole('row');
      secondListRows = within(grids[1]).getAllByRole('row');
      expect(firstListRows).toHaveLength(4);
      expect(secondListRows).toHaveLength(8);

      // The 2nd newly added row in the second list should still be the active element
      expect(secondListRows[7]).toBe(document.activeElement);
      expect(secondListRows[7]).toHaveTextContent('Item Five');

      for (let [index, row] of secondListRows.entries()) {
        if (index !== 7) {
          expect(row).toHaveAttribute('tabIndex', '-1');
        } else {
          expect(row).toHaveAttribute('tabIndex', '0');
        }
      }
    });

    describe('accessibility', function () {
      it('drag handle should reflect the correct number of draggable rows',  function () {

        let {getAllByRole} = render(
          <DraggableListView listViewProps={{defaultSelectedKeys: ['a', 'b', 'c']}} />
        );

        let rows = getAllByRole('row');
        expect(rows[0]).toHaveAttribute('draggable', 'true');
        let cellA = within(rows[0]).getByRole('gridcell');
        let dragButtonA = within(cellA).getAllByRole('button')[0];
        expect(dragButtonA).toHaveAttribute('aria-label', 'Drag 3 selected items');

        expect(rows[1]).toHaveAttribute('draggable', 'true');
        let cellB = within(rows[1]).getByRole('gridcell');
        let dragButtonB = within(cellB).getAllByRole('button')[0];
        expect(dragButtonB).toHaveAttribute('aria-label', 'Drag 3 selected items');

        expect(rows[2]).toHaveAttribute('draggable');

        expect(rows[3]).toHaveAttribute('draggable', 'true');
        let cellD = within(rows[3]).getByRole('gridcell');
        let dragButtonD = within(cellD).getAllByRole('button')[0];
        expect(dragButtonD).toHaveAttribute('aria-label', 'Drag Adobe InDesign');

        // After selecting row 4, the aria-label should reflect 4 selected items rather than just "Drag Adobe InDesign"
        act(() => userEvent.click(within(rows[3]).getByRole('checkbox')));
        expect(dragButtonA).toHaveAttribute('aria-label', 'Drag 4 selected items');
        expect(dragButtonB).toHaveAttribute('aria-label', 'Drag 4 selected items');
        expect(dragButtonD).toHaveAttribute('aria-label', 'Drag 4 selected items');

        act(() => userEvent.click(within(rows[0]).getByRole('checkbox')));
        expect(dragButtonA).toHaveAttribute('aria-label', 'Drag Adobe Photoshop');
        expect(dragButtonB).toHaveAttribute('aria-label', 'Drag 3 selected items');
        expect(dragButtonD).toHaveAttribute('aria-label', 'Drag 3 selected items');
      });

      it('disabled rows and invalid drop targets should become aria-hidden when keyboard drag session starts', function () {
        let {getAllByRole} = render(
          <ReorderExample listViewProps={{disabledKeys: ['2']}} />
        );

        let rows = getAllByRole('row');
        for (let row of rows) {
          expect(row).not.toHaveAttribute('aria-hidden');
        }

        let row = rows[0];
        let cell = within(row).getByRole('gridcell');
        let draghandle = within(cell).getAllByRole('button')[0];
        expect(row).toHaveAttribute('draggable', 'true');
        fireEvent.keyDown(draghandle, {key: 'Enter'});
        fireEvent.keyUp(draghandle, {key: 'Enter'});

        for (let row of rows) {
          expect(row).toHaveAttribute('aria-hidden', 'true');
        }

        fireEvent.keyDown(document.body, {key: 'Escape'});
        fireEvent.keyUp(document.body, {key: 'Escape'});
      });
    });
  });
});
