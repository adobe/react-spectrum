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

import {act, render, within} from '@react-spectrum/test-utils-internal';
import {ListView, ListViewItem} from '../src/ListView';
import React from 'react';
import {useDragAndDrop} from '../src/useDragAndDrop';

describe('ListView', () => {
  let offsetWidth, offsetHeight;

  beforeAll(function () {
    offsetWidth = jest
      .spyOn(window.HTMLElement.prototype, 'clientWidth', 'get')
      .mockImplementation(() => 400);
    offsetHeight = jest
      .spyOn(window.HTMLElement.prototype, 'clientHeight', 'get')
      .mockImplementation(() => 400);
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runAllTimers();
    });
  });

  afterAll(function () {
    offsetWidth.mockReset();
    offsetHeight.mockReset();
  });

  describe('pointerDragSource', () => {
    function DraggableListView(props: {pointerDragSource?: 'item' | 'dragButton'}) {
      let {dragAndDropHooks} = useDragAndDrop({
        getItems: keys => [...keys].map(key => ({'text/plain': `${key}`})),
        pointerDragSource: props.pointerDragSource
      });
      return (
        <ListView aria-label="Draggable list" dragAndDropHooks={dragAndDropHooks}>
          <ListViewItem id="1">Item 1</ListViewItem>
          <ListViewItem id="2">Item 2</ListViewItem>
        </ListView>
      );
    }

    it('should make the row draggable and visually hide the drag button by default', () => {
      let {getAllByRole} = render(<DraggableListView />);
      let row = getAllByRole('row')[0];
      let dragButton = within(row).getByRole('button');
      expect(row).toHaveAttribute('draggable', 'true');
      expect(dragButton).not.toHaveAttribute('draggable');
      expect(dragButton.style.position).toBe('absolute');
    });

    it('should make only the drag button draggable and always show it when pointerDragSource is dragButton', () => {
      let {getAllByRole} = render(<DraggableListView pointerDragSource="dragButton" />);
      let row = getAllByRole('row')[0];
      let dragButton = within(row).getByRole('button');
      expect(row).not.toHaveAttribute('draggable');
      expect(dragButton).toHaveAttribute('draggable', 'true');
      expect(dragButton.style.position).not.toBe('absolute');
      expect(dragButton.style.pointerEvents).not.toBe('none');
    });
  });
});
