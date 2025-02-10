/*
 * Copyright 2020 Adobe. All rights reserved.
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
import {act, fireEvent, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {announce} from '@react-aria/live-announcer';
import {CUSTOM_DRAG_TYPE} from '../src/constants';
import {DataTransfer, DataTransferItem, DragEvent, FileSystemDirectoryEntry, FileSystemFileEntry} from './mocks';
import {Draggable, Droppable} from './examples';
import {DragTypes} from '../src/utils';
import React from 'react';
import userEvent from '@testing-library/user-event';

function pointerEvent(type, opts) {
  let evt = new Event(type, {bubbles: true, cancelable: true});
  Object.assign(evt, {
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    altKey: false,
    button: opts.button || 0,
    width: 1,
    height: 1
  }, opts);
  return evt;
}

describe('useDrag and useDrop', function () {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  beforeEach(() => {
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({
      left: 0,
      top: 0,
      x: 0,
      y: 0,
      width: 100,
      height: 50
    }));

    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => jest.runAllTimers());
  });

  describe('native drag and drop', () => {
    it('should perform basic drag and drop', async () => {
      let onDragStart = jest.fn();
      let onDragMove = jest.fn();
      let onDragEnd = jest.fn();
      let onDropEnter = jest.fn();
      let onDropMove = jest.fn();
      let onDrop = jest.fn();
      let tree = render(<>
        <Draggable onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd} />
        <Droppable onDropEnter={onDropEnter} onDropMove={onDropMove} onDrop={onDrop} />
      </>);

      let draggable = tree.getByText('Drag me');
      let droppable = tree.getByText('Drop here');

      expect(draggable).toHaveAttribute('data-dragging', 'false');
      expect(droppable).toHaveAttribute('data-droptarget', 'false');

      let dataTransfer = new DataTransfer();
      fireEvent(draggable, new DragEvent('dragstart', {dataTransfer, clientX: 0, clientY: 0}));
      expect(dataTransfer.dropEffect).toBe('none');
      expect(dataTransfer.effectAllowed).toBe('all');
      expect([...dataTransfer.items]).toEqual([new DataTransferItem('text/plain', 'hello world')]);
      expect(dataTransfer._dragImage).toBeUndefined();

      act(() => jest.runAllTimers());
      expect(draggable).toHaveAttribute('data-dragging', 'true');

      expect(onDragStart).toHaveBeenCalledTimes(1);
      expect(onDragStart).toHaveBeenCalledWith({
        type: 'dragstart',
        x: 0,
        y: 0
      });

      fireEvent(draggable, new DragEvent('drag', {dataTransfer, clientX: 1, clientY: 1}));
      expect(onDragMove).toHaveBeenCalledTimes(1);
      expect(onDragMove).toHaveBeenCalledWith({
        type: 'dragmove',
        x: 1,
        y: 1
      });

      fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
      expect(onDropEnter).toHaveBeenCalledTimes(1);
      expect(onDropEnter).toHaveBeenCalledWith({
        type: 'dropenter',
        x: 1,
        y: 1
      });

      expect(dataTransfer.dropEffect).toBe('move');
      expect(droppable).toHaveAttribute('data-droptarget', 'true');

      fireEvent(droppable, new DragEvent('dragover', {dataTransfer, clientX: 2, clientY: 2}));
      expect(onDropMove).toHaveBeenCalledTimes(1);
      expect(onDropMove).toHaveBeenCalledWith({
        type: 'dropmove',
        x: 2,
        y: 2
      });

      expect(dataTransfer.dropEffect).toBe('move');
      expect(droppable).toHaveAttribute('data-droptarget', 'true');

      fireEvent(droppable, new DragEvent('drop', {dataTransfer, clientX: 2, clientY: 2}));
      act(() => jest.runAllTimers());
      expect(onDrop).toHaveBeenCalledTimes(1);
      expect(onDrop).toHaveBeenCalledWith({
        type: 'drop',
        x: 2,
        y: 2,
        dropOperation: 'move',
        items: [
          {
            kind: 'text',
            types: new Set(['text/plain']),
            getText: expect.any(Function)
          }
        ]
      });

      expect(await onDrop.mock.calls[0][0].items[0].getText('text/plain')).toBe('hello world');

      fireEvent(draggable, new DragEvent('dragend', {dataTransfer, clientX: 2, clientY: 2}));
      expect(onDragEnd).toHaveBeenCalledTimes(1);
      expect(onDragEnd).toHaveBeenCalledWith({
        type: 'dragend',
        x: 2,
        y: 2,
        dropOperation: 'move'
      });
    });

    it('useDrag should support isDisabled', async () => {
      let onDragStart = jest.fn();
      let onDragMove = jest.fn();
      let onDragEnd = jest.fn();
      let onDropEnter = jest.fn();
      let onDropMove = jest.fn();
      let onDrop = jest.fn();
      let tree = render(<>
        <Draggable isDisabled onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd} />
        <Droppable onDropEnter={onDropEnter} onDropMove={onDropMove} onDrop={onDrop} />
      </>);
      let draggable = tree.getByText('Drag me');
      let droppable = tree.getByText('Drop here');
      expect(draggable).toHaveAttribute('draggable', 'false');

      let dataTransfer = new DataTransfer();
      fireEvent(draggable, new DragEvent('dragstart', {dataTransfer, clientX: 0, clientY: 0}));
      act(() => jest.runAllTimers());
      expect(draggable).toHaveAttribute('data-dragging', 'false');
      expect(droppable).toHaveAttribute('data-droptarget', 'false');

      expect(onDragStart).not.toHaveBeenCalled();
      expect(onDragMove).not.toHaveBeenCalled();
      expect(onDragEnd).not.toHaveBeenCalled();
      expect(onDropEnter).not.toHaveBeenCalled();
      expect(onDropMove).not.toHaveBeenCalled();
      expect(onDrop).not.toHaveBeenCalled();
    });

    it('useDrop should support isDisabled', async () => {
      let onDragStart = jest.fn();
      let onDragMove = jest.fn();
      let onDragEnd = jest.fn();
      let onDropEnter = jest.fn();
      let onDropMove = jest.fn();
      let onDrop = jest.fn();
      let tree = render(<>
        <Draggable onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd} />
        <Droppable isDisabled onDropEnter={onDropEnter} onDropMove={onDropMove} onDrop={onDrop} />
      </>);
      let draggable = tree.getByText('Drag me');
      let droppable = tree.getByText('Drop here');
      expect(droppable).toHaveAttribute('data-droptarget', 'false');
      
      let dataTransfer = new DataTransfer();
      fireEvent(draggable, new DragEvent('dragstart', {dataTransfer, clientX: 0, clientY: 0}));
      act(() => jest.runAllTimers());
      expect(draggable).toHaveAttribute('data-dragging', 'true');
      expect(droppable).toHaveAttribute('data-droptarget', 'false');
      
      expect(onDragStart).toHaveBeenCalledTimes(1);
      expect(onDragMove).not.toHaveBeenCalled();
      expect(onDragEnd).not.toHaveBeenCalled();
      expect(onDropEnter).not.toHaveBeenCalled();
      expect(onDropMove).not.toHaveBeenCalled();
      expect(onDrop).not.toHaveBeenCalled();
    });

    describe('events', () => {
      it('fires onDragMove only when the drag actually moves', () => {
        let onDragStart = jest.fn();
        let onDragMove = jest.fn();
        let tree = render(<Draggable onDragStart={onDragStart} onDragMove={onDragMove} />);

        let draggable = tree.getByText('Drag me');

        let dataTransfer = new DataTransfer();
        fireEvent(draggable, new DragEvent('dragstart', {dataTransfer, clientX: 0, clientY: 0}));
        expect(onDragStart).toHaveBeenCalledTimes(1);
        expect(onDragMove).not.toHaveBeenCalled();

        fireEvent(draggable, new DragEvent('drag', {dataTransfer, clientX: 0, clientY: 0}));
        expect(onDragMove).not.toHaveBeenCalled();

        fireEvent(draggable, new DragEvent('drag', {dataTransfer, clientX: 1, clientY: 1}));
        expect(onDragMove).toHaveBeenCalledTimes(1);
        expect(onDragMove).toHaveBeenCalledWith({
          type: 'dragmove',
          x: 1,
          y: 1
        });

        fireEvent(draggable, new DragEvent('drag', {dataTransfer, clientX: 1, clientY: 1}));
        expect(onDragMove).toHaveBeenCalledTimes(1);
      });

      it('fires onDropMove only when the drag actually moves', () => {
        let onDropEnter = jest.fn();
        let onDropMove = jest.fn();
        let tree = render(<Droppable onDropEnter={onDropEnter} onDropMove={onDropMove} />);

        let droppable = tree.getByText('Drop here');

        let dataTransfer = new DataTransfer();
        fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
        expect(onDropEnter).toHaveBeenCalledTimes(1);
        expect(onDropMove).not.toHaveBeenCalled();

        fireEvent(droppable, new DragEvent('dragover', {dataTransfer, clientX: 1, clientY: 1}));
        expect(onDropMove).not.toHaveBeenCalled();

        fireEvent(droppable, new DragEvent('dragover', {dataTransfer, clientX: 2, clientY: 2}));
        expect(onDropMove).toHaveBeenCalledTimes(1);
        expect(onDropMove).toHaveBeenCalledWith({
          type: 'dropmove',
          x: 2,
          y: 2
        });

        fireEvent(droppable, new DragEvent('dragover', {dataTransfer, clientX: 2, clientY: 2}));
        expect(onDropMove).toHaveBeenCalledTimes(1);
      });

      it('fires onDropExit when moving off a drop target', () => {
        let onDropEnter = jest.fn();
        let onDropExit = jest.fn();
        let tree = render(<Droppable onDropEnter={onDropEnter} onDropExit={onDropExit} />);

        let droppable = tree.getByText('Drop here');

        let dataTransfer = new DataTransfer();
        fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
        expect(onDropEnter).toHaveBeenCalledTimes(1);
        expect(onDropExit).not.toHaveBeenCalled();

        fireEvent(droppable, new DragEvent('dragover', {dataTransfer, clientX: 2, clientY: 2}));
        expect(onDropExit).not.toHaveBeenCalled();

        fireEvent(droppable, new DragEvent('dragleave', {dataTransfer, clientX: 2, clientY: 2}));
        expect(onDropExit).toHaveBeenCalledTimes(1);
        expect(onDropExit).toHaveBeenCalledWith({
          type: 'dropexit',
          x: 2,
          y: 2
        });
      });

      it('fires onDropExit on drop', () => {
        let onDropEnter = jest.fn();
        let onDropExit = jest.fn();
        let tree = render(<Droppable onDropEnter={onDropEnter} onDropExit={onDropExit} />);

        let droppable = tree.getByText('Drop here');

        let dataTransfer = new DataTransfer();
        fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
        expect(onDropEnter).toHaveBeenCalledTimes(1);
        expect(onDropExit).not.toHaveBeenCalled();

        fireEvent(droppable, new DragEvent('dragover', {dataTransfer, clientX: 2, clientY: 2}));
        expect(onDropExit).not.toHaveBeenCalled();

        fireEvent(droppable, new DragEvent('drop', {dataTransfer, clientX: 2, clientY: 2}));
        expect(onDropExit).toHaveBeenCalledTimes(1);
        expect(onDropExit).toHaveBeenCalledWith({
          type: 'dropexit',
          x: 2,
          y: 2
        });
      });

      it('fires onDropActivate when a drag is held over the target', () => {
        let onDropEnter = jest.fn();
        let onDropActivate = jest.fn();
        let tree = render(<Droppable onDropEnter={onDropEnter} onDropActivate={onDropActivate} />);

        let droppable = tree.getByText('Drop here');

        let dataTransfer = new DataTransfer();
        fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
        expect(onDropEnter).toHaveBeenCalledTimes(1);
        expect(onDropActivate).not.toHaveBeenCalled();

        fireEvent(droppable, new DragEvent('dragover', {dataTransfer, clientX: 2, clientY: 2}));
        expect(onDropActivate).not.toHaveBeenCalled();

        act(() => jest.advanceTimersByTime(500));
        expect(onDropActivate).not.toHaveBeenCalled();

        act(() => jest.advanceTimersByTime(500));
        expect(onDropActivate).toHaveBeenCalledTimes(1);
        expect(onDropActivate).toHaveBeenCalledWith({
          type: 'dropactivate',
          x: 2,
          y: 2
        });
      });

      it('does not fire onDropActivate if the drag leaves the target before the timer fires', () => {
        let onDropEnter = jest.fn();
        let onDropActivate = jest.fn();
        let onDropExit = jest.fn();
        let tree = render(<Droppable onDropEnter={onDropEnter} onDropActivate={onDropActivate} onDropExit={onDropExit} />);

        let droppable = tree.getByText('Drop here');

        let dataTransfer = new DataTransfer();
        fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
        expect(onDropEnter).toHaveBeenCalledTimes(1);
        expect(onDropActivate).not.toHaveBeenCalled();

        fireEvent(droppable, new DragEvent('dragover', {dataTransfer, clientX: 2, clientY: 2}));
        expect(onDropActivate).not.toHaveBeenCalled();

        act(() => jest.advanceTimersByTime(500));
        expect(onDropActivate).not.toHaveBeenCalled();

        fireEvent(droppable, new DragEvent('dragleave', {dataTransfer, clientX: 2, clientY: 2}));
        expect(onDropExit).toHaveBeenCalledTimes(1);
        expect(onDropActivate).not.toHaveBeenCalled();

        act(() => jest.advanceTimersByTime(500));
        expect(onDropActivate).not.toHaveBeenCalled();
      });

      it('does not fire onDropEnter and onDropExit for nested elements', () => {
        let onDropEnter = jest.fn();
        let onDropExit = jest.fn();
        let tree = render(
          <Droppable onDropEnter={onDropEnter} onDropExit={onDropExit}>
            <div>Test</div>
          </Droppable>
        );

        let droppable = tree.getByRole('button');
        let child = droppable.firstChild;

        let dataTransfer = new DataTransfer();
        fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
        expect(onDropEnter).toHaveBeenCalledTimes(1);
        expect(onDropExit).not.toHaveBeenCalled();

        fireEvent(child, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1, relatedTarget: droppable}));
        expect(onDropEnter).toHaveBeenCalledTimes(1);
        expect(onDropExit).not.toHaveBeenCalled();

        fireEvent(child, new DragEvent('dragleave', {dataTransfer, clientX: 1, clientY: 1, relatedTarget: droppable}));
        expect(onDropEnter).toHaveBeenCalledTimes(1);
        expect(onDropExit).not.toHaveBeenCalled();

        fireEvent(droppable, new DragEvent('dragleave', {dataTransfer, clientX: 1, clientY: 1}));
        expect(onDropEnter).toHaveBeenCalledTimes(1);
        expect(onDropExit).toHaveBeenCalledTimes(1);
      });

      describe('nested drag targets', () => {
        let onDragStartParent = jest.fn();
        let onDragMoveParent = jest.fn();
        let onDragEndParent = jest.fn();
        let onDragStartChild = jest.fn();
        let onDragMoveChild = jest.fn();
        let onDragEndChild = jest.fn();

        function renderNestedDrag() {
          return render(
            <Draggable onDragStart={onDragStartParent} onDragMove={onDragMoveParent} onDragEnd={onDragEndParent}>
              <Draggable onDragStart={onDragStartChild} onDragMove={onDragMoveChild} onDragEnd={onDragEndChild}>
                Drag me child
              </Draggable>
            </Draggable>
          );
        }

        it('does not trigger parent drag when dragging child', () => {
          let tree = renderNestedDrag();
          let draggableChild = tree.getByText('Drag me child');

          let dataTransfer = new DataTransfer();
          fireEvent(draggableChild, new DragEvent('drag', {dataTransfer, clientX: 1, clientY: 1}));
          expect(onDragMoveParent).not.toHaveBeenCalled();
          expect(onDragMoveChild).toHaveBeenCalledTimes(1);
          expect(onDragMoveChild).toHaveBeenCalledWith({
            type: 'dragmove',
            x: 1,
            y: 1
          });
        });
      });

      describe('nested drop targets', () => {
        let onDropParent = jest.fn();
        let onDropEnterParent = jest.fn();
        let onDropExitParent = jest.fn();
        let onDropActivateParent = jest.fn();
        let onDropMoveParent = jest.fn();

        let onDropChild = jest.fn();
        let onDropEnterChild = jest.fn();
        let onDropExitChild = jest.fn();
        let onDropActivateChild = jest.fn();
        let onDropMoveChild = jest.fn();

        function renderNestedDrop() {
          return render(
            <Droppable onDrop={onDropParent} onDropExit={onDropExitParent} onDropEnter={onDropEnterParent} onDropActivate={onDropActivateParent} onDropMove={onDropMoveParent}>
              <Droppable onDrop={onDropChild} onDropExit={onDropExitChild} onDropEnter={onDropEnterChild} onDropActivate={onDropActivateChild} onDropMove={onDropMoveChild} />
            </Droppable>
          );
        }

        afterEach(() => {
          jest.clearAllMocks();
          act(() => jest.runAllTimers());
        });

        it('does not trigger parent onDrop and onDropExit when dropping on child', () => {
          let tree = renderNestedDrop();
          let droppableParent = tree.getAllByRole('button')[0];
          let droppableChild = droppableParent.firstChild;

          let dataTransfer = new DataTransfer();
          fireEvent(droppableChild, new DragEvent('drop', {dataTransfer, clientX: 1, clientY: 1}));
          act(() => jest.runAllTimers());
          expect(onDropChild).toHaveBeenCalledTimes(1);
          expect(onDropExitChild).toHaveBeenCalledTimes(1);
          expect(onDropParent).not.toHaveBeenCalled();
          expect(onDropExitParent).not.toHaveBeenCalled();
        });

        it('does not trigger parent onDropEnter when entering drop child', () => {
          let tree = renderNestedDrop();
          let droppableParent = tree.getAllByRole('button')[0];
          let droppableChild = droppableParent.firstChild;

          let dataTransfer = new DataTransfer();
          fireEvent(droppableChild, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
          expect(onDropEnterChild).toHaveBeenCalledTimes(1);
          expect(onDropEnterParent).not.toHaveBeenCalled();
        });

        it('does not trigger parent onDropExit when exiting child', () => {
          let tree = renderNestedDrop();
          let droppableParent = tree.getAllByRole('button')[0];
          let droppableChild = droppableParent.firstChild;

          let dataTransfer = new DataTransfer();
          fireEvent(droppableChild, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
          fireEvent(droppableChild, new DragEvent('dragleave', {dataTransfer, clientX: 1, clientY: 1}));
          expect(onDropExitChild).toHaveBeenCalledTimes(1);
          expect(onDropExitParent).not.toHaveBeenCalled();
        });

        it('does not trigger parent onDropActivate when hovering on drop child', () => {
          let tree = renderNestedDrop();
          let droppableParent = tree.getAllByRole('button')[0];
          let droppableChild = droppableParent.firstChild;

          let dataTransfer = new DataTransfer();
          fireEvent(droppableChild, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
          fireEvent(droppableChild, new DragEvent('dragover', {dataTransfer, clientX: 2, clientY: 2}));
          expect(onDropActivateChild).not.toHaveBeenCalled();
          expect(onDropActivateParent).not.toHaveBeenCalled();

          act(() => jest.advanceTimersByTime(500));
          expect(onDropActivateChild).not.toHaveBeenCalled();
          expect(onDropActivateParent).not.toHaveBeenCalled();

          act(() => jest.advanceTimersByTime(500));
          expect(onDropActivateChild).toHaveBeenCalledTimes(1);
          expect(onDropActivateChild).toHaveBeenCalledWith({
            type: 'dropactivate',
            x: 2,
            y: 2
          });
          expect(onDropActivateParent).not.toHaveBeenCalled();
        });

        it('does not trigger parent onDropMove when moving on drop child', () => {
          let tree = renderNestedDrop();
          let droppableParent = tree.getAllByRole('button')[0];
          let droppableChild = droppableParent.firstChild;

          let dataTransfer = new DataTransfer();
          fireEvent(droppableChild, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
          fireEvent(droppableChild, new DragEvent('dragover', {dataTransfer, clientX: 2, clientY: 2}));
          expect(onDropMoveChild).toHaveBeenCalledTimes(1);
          expect(onDropMoveChild).toHaveBeenCalledWith({
            type: 'dropmove',
            x: 2,
            y: 2
          });
          expect(onDropMoveParent).not.toHaveBeenCalled();
        });
      });
    });

    describe('drag data', () => {
      it('should work with custom data types', async () => {
        let getItems = () => [{
          test: 'test data'
        }];

        let onDrop = jest.fn();
        let tree = render(<>
          <Draggable getItems={getItems} />
          <Droppable onDrop={onDrop} />
        </>);

        let draggable = tree.getByText('Drag me');
        let droppable = tree.getByText('Drop here');

        let dataTransfer = new DataTransfer();
        fireEvent(draggable, new DragEvent('dragstart', {dataTransfer, clientX: 0, clientY: 0}));
        expect([...dataTransfer.items]).toEqual([new DataTransferItem('test', 'test data')]);

        fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
        fireEvent(droppable, new DragEvent('drop', {dataTransfer, clientX: 2, clientY: 2}));
        act(() => jest.runAllTimers());
        expect(onDrop).toHaveBeenCalledTimes(1);
        expect(onDrop).toHaveBeenCalledWith({
          type: 'drop',
          x: 2,
          y: 2,
          dropOperation: 'move',
          items: [
            {
              kind: 'text',
              types: new Set(['test']),
              getText: expect.any(Function)
            }
          ]
        });

        expect(await onDrop.mock.calls[0][0].items[0].getText('test')).toBe('test data');
      });

      it('should work with multiple items of the same custom type', async () => {
        let getItems = () => [{
          test: 'item 1'
        }, {
          test: 'item 2'
        }];

        let onDrop = jest.fn();
        let tree = render(<>
          <Draggable getItems={getItems} />
          <Droppable onDrop={onDrop} />
        </>);

        let draggable = tree.getByText('Drag me');
        let droppable = tree.getByText('Drop here');

        let dataTransfer = new DataTransfer();
        fireEvent(draggable, new DragEvent('dragstart', {dataTransfer, clientX: 0, clientY: 0}));
        expect([...dataTransfer.items]).toEqual([
          new DataTransferItem('test', 'item 1'),
          new DataTransferItem(
            CUSTOM_DRAG_TYPE,
            JSON.stringify([{test: 'item 1'}, {test: 'item 2'}]
          ))
        ]);

        fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
        fireEvent(droppable, new DragEvent('drop', {dataTransfer, clientX: 2, clientY: 2}));
        act(() => jest.runAllTimers());
        expect(onDrop).toHaveBeenCalledTimes(1);
        expect(onDrop).toHaveBeenCalledWith({
          type: 'drop',
          x: 2,
          y: 2,
          dropOperation: 'move',
          items: [
            {
              kind: 'text',
              types: new Set(['test']),
              getText: expect.any(Function)
            },
            {
              kind: 'text',
              types: new Set(['test']),
              getText: expect.any(Function)
            }
          ]
        });

        expect(await onDrop.mock.calls[0][0].items[0].getText('test')).toBe('item 1');
        expect(await onDrop.mock.calls[0][0].items[1].getText('test')).toBe('item 2');
      });

      it('should work with items of multiple types', async () => {
        let getItems = () => [{
          test: 'test data',
          'text/plain': 'test data'
        }];

        let onDrop = jest.fn();
        let tree = render(<>
          <Draggable getItems={getItems} />
          <Droppable onDrop={onDrop} />
        </>);

        let draggable = tree.getByText('Drag me');
        let droppable = tree.getByText('Drop here');

        let dataTransfer = new DataTransfer();
        fireEvent(draggable, new DragEvent('dragstart', {dataTransfer, clientX: 0, clientY: 0}));
        expect([...dataTransfer.items]).toEqual([
          new DataTransferItem('test', 'test data'),
          new DataTransferItem('text/plain', 'test data'),
          new DataTransferItem(
            CUSTOM_DRAG_TYPE,
            JSON.stringify([{test: 'test data', 'text/plain': 'test data'}]
          ))
        ]);

        fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
        fireEvent(droppable, new DragEvent('drop', {dataTransfer, clientX: 2, clientY: 2}));
        act(() => jest.runAllTimers());
        expect(onDrop).toHaveBeenCalledTimes(1);
        expect(onDrop).toHaveBeenCalledWith({
          type: 'drop',
          x: 2,
          y: 2,
          dropOperation: 'move',
          items: [
            {
              kind: 'text',
              types: new Set(['test', 'text/plain']),
              getText: expect.any(Function)
            }
          ]
        });

        expect(await onDrop.mock.calls[0][0].items[0].getText('test')).toBe('test data');
        expect(await onDrop.mock.calls[0][0].items[0].getText('text/plain')).toBe('test data');
      });

      it('should work with multiple items of multiple types', async () => {
        let getItems = () => [{
          test: 'item 1',
          'text/plain': 'item 1'
        }, {
          test: 'item 2',
          'text/plain': 'item 2'
        }];

        let onDrop = jest.fn();
        let tree = render(<>
          <Draggable getItems={getItems} />
          <Droppable onDrop={onDrop} />
        </>);

        let draggable = tree.getByText('Drag me');
        let droppable = tree.getByText('Drop here');

        let dataTransfer = new DataTransfer();
        fireEvent(draggable, new DragEvent('dragstart', {dataTransfer, clientX: 0, clientY: 0}));
        expect([...dataTransfer.items]).toEqual([
          new DataTransferItem('test', 'item 1'),
          new DataTransferItem('text/plain', 'item 1\nitem 2'),
          new DataTransferItem(
            CUSTOM_DRAG_TYPE,
            JSON.stringify([
              {test: 'item 1', 'text/plain': 'item 1'},
              {test: 'item 2', 'text/plain': 'item 2'}
            ]
          ))
        ]);

        fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
        fireEvent(droppable, new DragEvent('drop', {dataTransfer, clientX: 2, clientY: 2}));
        act(() => jest.runAllTimers());
        expect(onDrop).toHaveBeenCalledTimes(1);
        expect(onDrop).toHaveBeenCalledWith({
          type: 'drop',
          x: 2,
          y: 2,
          dropOperation: 'move',
          items: [
            {
              kind: 'text',
              types: new Set(['test', 'text/plain']),
              getText: expect.any(Function)
            },
            {
              kind: 'text',
              types: new Set(['test', 'text/plain']),
              getText: expect.any(Function)
            }
          ]
        });

        expect(await onDrop.mock.calls[0][0].items[0].getText('test')).toBe('item 1');
        expect(await onDrop.mock.calls[0][0].items[0].getText('text/plain')).toBe('item 1');
        expect(await onDrop.mock.calls[0][0].items[1].getText('test')).toBe('item 2');
        expect(await onDrop.mock.calls[0][0].items[1].getText('text/plain')).toBe('item 2');
      });

      it('should support dropping multiple native types', async () => {
        let onDrop = jest.fn();
        let tree = render(<Droppable onDrop={onDrop} />);
        let droppable = tree.getByText('Drop here');

        let dataTransfer = new DataTransfer();
        dataTransfer.items.add('hello world', 'text/plain');
        dataTransfer.items.add('<p>hello world</p>', 'text/html');

        fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
        fireEvent(droppable, new DragEvent('drop', {dataTransfer, clientX: 2, clientY: 2}));
        act(() => jest.runAllTimers());
        expect(onDrop).toHaveBeenCalledTimes(1);
        expect(onDrop).toHaveBeenCalledWith({
          type: 'drop',
          x: 2,
          y: 2,
          dropOperation: 'move',
          items: [
            {
              kind: 'text',
              types: new Set(['text/plain', 'text/html']),
              getText: expect.any(Function)
            }
          ]
        });

        expect(await onDrop.mock.calls[0][0].items[0].getText('text/plain')).toBe('hello world');
        expect(await onDrop.mock.calls[0][0].items[0].getText('text/html')).toBe('<p>hello world</p>');
      });

      describe('files', () => {
        it('should support dropping files', async () => {
          let onDrop = jest.fn();
          let tree = render(<Droppable onDrop={onDrop} />);
          let droppable = tree.getByText('Drop here');

          let dataTransfer = new DataTransfer();
          let file = new File(['hello world'], 'test.txt', {type: 'text/plain'});
          dataTransfer.items.add(file);

          fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
          fireEvent(droppable, new DragEvent('drop', {dataTransfer, clientX: 2, clientY: 2}));
          act(() => jest.runAllTimers());
          expect(onDrop).toHaveBeenCalledTimes(1);
          expect(onDrop).toHaveBeenCalledWith({
            type: 'drop',
            x: 2,
            y: 2,
            dropOperation: 'move',
            items: [
              {
                kind: 'file',
                type: 'text/plain',
                name: 'test.txt',
                getText: expect.any(Function),
                getFile: expect.any(Function)
              }
            ]
          });

          expect(await onDrop.mock.calls[0][0].items[0].getText()).toBe('hello world');
          expect(await onDrop.mock.calls[0][0].items[0].getFile()).toBe(file);
        });

        it('should support dropping multiple files', async () => {
          let onDrop = jest.fn();
          let tree = render(<Droppable onDrop={onDrop} />);
          let droppable = tree.getByText('Drop here');

          let dataTransfer = new DataTransfer();
          let file1 = new File(['hello world'], 'test.txt', {type: 'text/plain'});
          let file2 = new File(['<p>hello world</p>'], 'test.html', {type: 'text/html'});
          dataTransfer.items.add(file1);
          dataTransfer.items.add(file2);

          fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
          fireEvent(droppable, new DragEvent('drop', {dataTransfer, clientX: 2, clientY: 2}));
          act(() => jest.runAllTimers());
          expect(onDrop).toHaveBeenCalledTimes(1);
          expect(onDrop).toHaveBeenCalledWith({
            type: 'drop',
            x: 2,
            y: 2,
            dropOperation: 'move',
            items: [
              {
                kind: 'file',
                type: 'text/plain',
                name: 'test.txt',
                getText: expect.any(Function),
                getFile: expect.any(Function)
              },
              {
                kind: 'file',
                type: 'text/html',
                name: 'test.html',
                getText: expect.any(Function),
                getFile: expect.any(Function)
              }
            ]
          });

          expect(await onDrop.mock.calls[0][0].items[0].getText()).toBe('hello world');
          expect(await onDrop.mock.calls[0][0].items[0].getFile()).toBe(file1);
          expect(await onDrop.mock.calls[0][0].items[1].getText()).toBe('<p>hello world</p>');
          expect(await onDrop.mock.calls[0][0].items[1].getFile()).toBe(file2);
        });

        it('should support dropping both text and files', async () => {
          let onDrop = jest.fn();
          let tree = render(<Droppable onDrop={onDrop} />);
          let droppable = tree.getByText('Drop here');

          let dataTransfer = new DataTransfer();
          let file = new File(['hello world'], 'test.txt', {type: 'text/plain'});
          dataTransfer.items.add(file);
          dataTransfer.items.add('<p>hello world</p>', 'text/html');

          fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
          fireEvent(droppable, new DragEvent('drop', {dataTransfer, clientX: 2, clientY: 2}));
          act(() => jest.runAllTimers());
          expect(onDrop).toHaveBeenCalledTimes(1);
          expect(onDrop).toHaveBeenCalledWith({
            type: 'drop',
            x: 2,
            y: 2,
            dropOperation: 'move',
            items: [
              {
                kind: 'file',
                type: 'text/plain',
                name: 'test.txt',
                getText: expect.any(Function),
                getFile: expect.any(Function)
              },
              {
                kind: 'text',
                types: new Set(['text/html']),
                getText: expect.any(Function)
              }
            ]
          });

          expect(await onDrop.mock.calls[0][0].items[0].getText()).toBe('hello world');
          expect(await onDrop.mock.calls[0][0].items[0].getFile()).toBe(file);
          expect(await onDrop.mock.calls[0][0].items[1].getText('text/html')).toBe('<p>hello world</p>');
        });

        it('should support dropping directories', async () => {
          let onDrop = jest.fn();
          let tree = render(<Droppable onDrop={onDrop} />);
          let droppable = tree.getByText('Drop here');

          let dataTransfer = new DataTransfer();
          let dir = new FileSystemDirectoryEntry('test', [
            new FileSystemFileEntry(new File(['hello world'], 'test.txt', {type: 'text/plain'})),
            new FileSystemDirectoryEntry('nested', [
              new FileSystemFileEntry(new File(['<p>foo</p>'], 'foo.html', {type: 'text/html'}))
            ])
          ]);
          dataTransfer.items.add(dir);

          fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
          fireEvent(droppable, new DragEvent('drop', {dataTransfer, clientX: 2, clientY: 2}));
          act(() => jest.runAllTimers());
          expect(onDrop).toHaveBeenCalledTimes(1);
          expect(onDrop).toHaveBeenCalledWith({
            type: 'drop',
            x: 2,
            y: 2,
            dropOperation: 'move',
            items: [
              {
                kind: 'directory',
                name: 'test',
                getEntries: expect.any(Function)
              }
            ]
          });

          let collect = async (dir) => {
            let entries = [];
            for await (let entry of dir.getEntries()) {
              entries.push(entry);
            }
            return entries;
          };

          let entries = await collect(onDrop.mock.calls[0][0].items[0]);
          expect(entries).toEqual([
            {
              kind: 'file',
              type: 'text/plain',
              name: 'test.txt',
              getText: expect.any(Function),
              getFile: expect.any(Function)
            },
            {
              kind: 'directory',
              name: 'nested',
              getEntries: expect.any(Function)
            }
          ]);

          expect(await entries[0].getText()).toBe('hello world');
          expect(await collect(entries[1])).toEqual([
            {
              kind: 'file',
              type: 'text/html',
              name: 'foo.html',
              getText: expect.any(Function),
              getFile: expect.any(Function)
            }
          ]);
        });

        it('should handle unknown file types using a generic mime type', async () => {
          let onDrop = jest.fn();
          let tree = render(<Droppable onDrop={onDrop} />);
          let droppable = tree.getByText('Drop here');

          let dataTransfer = new DataTransfer();
          let file = new File(['hello world'], 'test.abc', {type: ''});
          dataTransfer.items.add(file);

          fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
          fireEvent(droppable, new DragEvent('drop', {dataTransfer, clientX: 2, clientY: 2}));
          act(() => jest.runAllTimers());
          expect(onDrop).toHaveBeenCalledTimes(1);
          expect(onDrop).toHaveBeenCalledWith({
            type: 'drop',
            x: 2,
            y: 2,
            dropOperation: 'move',
            items: [
              {
                kind: 'file',
                type: 'application/octet-stream',
                name: 'test.abc',
                getText: expect.any(Function),
                getFile: expect.any(Function)
              }
            ]
          });

          expect(await onDrop.mock.calls[0][0].items[0].getText()).toBe('hello world');
          expect(await onDrop.mock.calls[0][0].items[0].getFile()).toBe(file);
        });
      });
    });

    describe('drop operations', () => {
      it('should support getDropOperation to override the default operation', () => {
        let onDragEnd = jest.fn();
        let onDrop = jest.fn();
        let getDropOperation = jest.fn().mockImplementation(() => 'copy');
        let tree = render(<>
          <Draggable onDragEnd={onDragEnd} />
          <Droppable getDropOperation={getDropOperation} onDrop={onDrop} />
        </>);

        let draggable = tree.getByText('Drag me');
        let droppable = tree.getByText('Drop here');

        let dataTransfer = new DataTransfer();
        fireEvent(draggable, new DragEvent('dragstart', {dataTransfer, clientX: 0, clientY: 0}));
        expect(dataTransfer.dropEffect).toBe('none');

        fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 0, clientY: 0}));
        expect(getDropOperation).toHaveBeenCalledWith(new DragTypes(dataTransfer), ['move', 'copy', 'link']);
        expect(dataTransfer.dropEffect).toBe('copy');
        expect(droppable).toHaveAttribute('data-droptarget', 'true');

        fireEvent(droppable, new DragEvent('drop', {dataTransfer, clientX: 0, clientY: 0}));
        act(() => jest.runAllTimers());
        expect(onDrop).toHaveBeenCalledWith({
          type: 'drop',
          x: 0,
          y: 0,
          dropOperation: 'copy',
          items: [
            {
              kind: 'text',
              types: new Set(['text/plain']),
              getText: expect.any(Function)
            }
          ]
        });

        fireEvent(draggable, new DragEvent('dragend', {dataTransfer, clientX: 2, clientY: 2}));
        expect(onDragEnd).toHaveBeenCalledTimes(1);
        expect(onDragEnd).toHaveBeenCalledWith({
          type: 'dragend',
          x: 2,
          y: 2,
          dropOperation: 'copy'
        });
      });

      it('should support getAllowedDropOperations to limit allowed operations', () => {
        let onDragEnd = jest.fn();
        let onDrop = jest.fn();
        let getDropOperation = jest.fn().mockImplementation(() => 'copy');
        let getAllowedDropOperations = jest.fn().mockImplementation(() => ['copy']);
        let tree = render(<>
          <Draggable getAllowedDropOperations={getAllowedDropOperations} onDragEnd={onDragEnd} />
          <Droppable onDrop={onDrop} getDropOperation={getDropOperation} />
        </>);

        let draggable = tree.getByText('Drag me');
        let droppable = tree.getByText('Drop here');

        let dataTransfer = new DataTransfer();
        fireEvent(draggable, new DragEvent('dragstart', {dataTransfer, clientX: 0, clientY: 0}));
        expect(getAllowedDropOperations).toHaveBeenCalledTimes(1);
        expect(dataTransfer.dropEffect).toBe('none');

        fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 0, clientY: 0}));
        expect(getDropOperation).toHaveBeenCalledWith(new DragTypes(dataTransfer), ['copy']);
        expect(dataTransfer.dropEffect).toBe('copy');
        expect(droppable).toHaveAttribute('data-droptarget', 'true');

        fireEvent(droppable, new DragEvent('drop', {dataTransfer, clientX: 0, clientY: 0}));
        act(() => jest.runAllTimers());
        expect(onDrop).toHaveBeenCalledWith({
          type: 'drop',
          x: 0,
          y: 0,
          dropOperation: 'copy',
          items: [
            {
              kind: 'text',
              types: new Set(['text/plain']),
              getText: expect.any(Function)
            }
          ]
        });

        fireEvent(draggable, new DragEvent('dragend', {dataTransfer, clientX: 2, clientY: 2}));
        expect(onDragEnd).toHaveBeenCalledTimes(1);
        expect(onDragEnd).toHaveBeenCalledWith({
          type: 'dragend',
          x: 2,
          y: 2,
          dropOperation: 'copy'
        });
      });

      it('should support canceling drops with getDropOperation', () => {
        let onDropEnter = jest.fn();
        let onDragEnd = jest.fn();
        let onDrop = jest.fn();
        let getDropOperation = jest.fn().mockImplementation(() => 'cancel');
        let tree = render(<>
          <Draggable onDragEnd={onDragEnd} />
          <Droppable getDropOperation={getDropOperation} onDropEnter={onDropEnter} onDrop={onDrop} />
        </>);

        let draggable = tree.getByText('Drag me');
        let droppable = tree.getByText('Drop here');

        let dataTransfer = new DataTransfer();
        fireEvent(draggable, new DragEvent('dragstart', {dataTransfer, clientX: 0, clientY: 0}));
        expect(dataTransfer.dropEffect).toBe('none');

        fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 0, clientY: 0}));
        expect(dataTransfer.dropEffect).toBe('none');
        expect(droppable).toHaveAttribute('data-droptarget', 'false');
        expect(onDropEnter).not.toHaveBeenCalled();
      });

      it('should update drop operation if modifier key is pressed', () => {
        let onDropEnter = jest.fn();
        let onDropExit = jest.fn();
        let onDragEnd = jest.fn();
        let onDrop = jest.fn();
        let tree = render(<>
          <Draggable onDragEnd={onDragEnd} />
          <Droppable onDropEnter={onDropEnter} onDropExit={onDropExit} onDrop={onDrop} />
        </>);

        let draggable = tree.getByText('Drag me');
        let droppable = tree.getByText('Drop here');

        let dataTransfer = new DataTransfer();
        fireEvent(draggable, new DragEvent('dragstart', {dataTransfer, clientX: 0, clientY: 0}));
        expect(dataTransfer.dropEffect).toBe('none');

        fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 0, clientY: 0}));
        expect(dataTransfer.dropEffect).toBe('move');
        expect(droppable).toHaveAttribute('data-droptarget', 'true');
        expect(onDropEnter).toHaveBeenCalledTimes(1);

        // Simulate user pressing a modifier key. This changes effectAllowed passed by the browser.
        // This should result in the dropEffect changing.
        dataTransfer.effectAllowed = 'copy';
        fireEvent(droppable, new DragEvent('dragover', {dataTransfer, clientX: 0, clientY: 0}));
        expect(dataTransfer.dropEffect).toBe('copy');
        expect(droppable).toHaveAttribute('data-droptarget', 'true');
        expect(onDropExit).not.toHaveBeenCalled();
        expect(onDropEnter).toHaveBeenCalledTimes(1);
      });

      it('should update drop operation to cancel if modifier key is pressed that is not allowed', () => {
        let onDropEnter = jest.fn();
        let onDropExit = jest.fn();
        let onDragEnd = jest.fn();
        let onDrop = jest.fn();
        let getDropOperation = jest.fn().mockImplementation(() => 'move');
        let tree = render(<>
          <Draggable onDragEnd={onDragEnd} />
          <Droppable getDropOperation={getDropOperation} onDropEnter={onDropEnter} onDropExit={onDropExit} onDrop={onDrop} />
        </>);

        let draggable = tree.getByText('Drag me');
        let droppable = tree.getByText('Drop here');

        let dataTransfer = new DataTransfer();
        fireEvent(draggable, new DragEvent('dragstart', {dataTransfer, clientX: 0, clientY: 0}));
        expect(dataTransfer.dropEffect).toBe('none');

        fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 0, clientY: 0}));
        expect(dataTransfer.dropEffect).toBe('move');
        expect(droppable).toHaveAttribute('data-droptarget', 'true');
        expect(onDropEnter).toHaveBeenCalledTimes(1);

        // Simulate user pressing a modifier key. This changes effectAllowed passed by the browser.
        // getDropOperation only allows move not copy, so drop effect should change to none and onDropExit should be called.
        dataTransfer.effectAllowed = 'copy';
        fireEvent(droppable, new DragEvent('dragover', {dataTransfer, clientX: 0, clientY: 0}));
        expect(dataTransfer.dropEffect).toBe('none');
        expect(droppable).toHaveAttribute('data-droptarget', 'false');
        expect(onDropExit).toHaveBeenCalledTimes(1);
      });

      it('should update drop operation if modifier key is pressed and browser does not update effectAllowed', () => {
        let onDropEnter = jest.fn();
        let onDropExit = jest.fn();
        let onDragEnd = jest.fn();
        let onDrop = jest.fn();
        let tree = render(<>
          <Draggable onDragEnd={onDragEnd} />
          <Droppable onDropEnter={onDropEnter} onDropExit={onDropExit} onDrop={onDrop} />
        </>);

        let draggable = tree.getByText('Drag me');
        let droppable = tree.getByText('Drop here');

        let dataTransfer = new DataTransfer();
        fireEvent(draggable, new DragEvent('dragstart', {dataTransfer, clientX: 0, clientY: 0}));
        expect(dataTransfer.dropEffect).toBe('none');

        fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 0, clientY: 0}));
        expect(dataTransfer.dropEffect).toBe('move');
        expect(droppable).toHaveAttribute('data-droptarget', 'true');
        expect(onDropEnter).toHaveBeenCalledTimes(1);

        fireEvent(droppable, new DragEvent('dragover', {dataTransfer, clientX: 0, clientY: 0, altKey: true}));
        expect(dataTransfer.dropEffect).toBe('link');
        expect(droppable).toHaveAttribute('data-droptarget', 'true');
        expect(onDropExit).not.toHaveBeenCalled();
        expect(onDropEnter).toHaveBeenCalledTimes(1);
      });

      it('should handle when browser does not set effectAllowed properly', () => {
        let onDropEnter = jest.fn();
        let onDropExit = jest.fn();
        let onDragEnd = jest.fn();
        let onDrop = jest.fn();
        let getAllowedDropOperations = jest.fn().mockImplementation(() => ['copy']);
        let tree = render(<>
          <Draggable onDragEnd={onDragEnd} getAllowedDropOperations={getAllowedDropOperations} />
          <Droppable onDropEnter={onDropEnter} onDropExit={onDropExit} onDrop={onDrop} />
        </>);

        let draggable = tree.getByText('Drag me');
        let droppable = tree.getByText('Drop here');

        let dataTransfer = new DataTransfer();
        fireEvent(draggable, new DragEvent('dragstart', {dataTransfer, clientX: 0, clientY: 0}));
        expect(dataTransfer.effectAllowed).toBe('copy');

        // Simulate WebKit bug.
        dataTransfer.effectAllowed = 'copyMove';
        fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 0, clientY: 0}));
        expect(dataTransfer.dropEffect).toBe('copy');
        expect(droppable).toHaveAttribute('data-droptarget', 'true');
        expect(onDropEnter).toHaveBeenCalledTimes(1);

        dataTransfer.effectAllowed = 'copyMove';
        fireEvent(droppable, new DragEvent('dragover', {dataTransfer, clientX: 0, clientY: 0, altKey: true}));
        expect(dataTransfer.dropEffect).toBe('none');
        expect(droppable).toHaveAttribute('data-droptarget', 'false');
        expect(onDropExit).toHaveBeenCalledTimes(1);
      });

      it('should pass file types to getDropOperation', async () => {
        let getDropOperation = jest.fn().mockImplementation(() => 'move');
        let tree = render(<Droppable getDropOperation={getDropOperation} />);
        let droppable = tree.getByText('Drop here');

        let dataTransfer = new DataTransfer();
        let file = new File(['hello world'], 'test.txt', {type: 'text/plain'});
        dataTransfer.items.add(file);

        fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
        expect(getDropOperation).toHaveBeenCalledTimes(1);
        expect(getDropOperation.mock.calls[0][0].has('text/plain'));
        expect(!getDropOperation.mock.calls[0][0].has('text/html'));
      });

      it('should handle unknown file types using a generic mime type', async () => {
        let getDropOperation = jest.fn().mockImplementation(() => 'move');
        let tree = render(<Droppable getDropOperation={getDropOperation} />);
        let droppable = tree.getByText('Drop here');

        let dataTransfer = new DataTransfer();
        let file = new File(['hello world'], 'test.abc', {type: ''});
        dataTransfer.items.add(file);

        fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
        expect(getDropOperation).toHaveBeenCalledTimes(1);
        expect(getDropOperation.mock.calls[0][0].has('application/octet-stream'));
        expect(!getDropOperation.mock.calls[0][0].has('text/plain'));
      });

      it('should handle when no file types are available', async () => {
        let getDropOperation = jest.fn().mockImplementation(() => 'move');
        let tree = render(<Droppable getDropOperation={getDropOperation} />);
        let droppable = tree.getByText('Drop here');

        // In Safari, the DataTransferItem objects aren't available until drop,
        // so we have to assume that all possible file types are available.
        let dataTransfer = new DataTransfer();
        dataTransfer.items.add('', 'Files');

        fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
        expect(getDropOperation).toHaveBeenCalledTimes(1);
        expect(getDropOperation.mock.calls[0][0].has('text/plain'));
        expect(getDropOperation.mock.calls[0][0].has('image/jpeg'));
      });

      it('should not include react-aria custom type in list of types passed to getDropOperation', async () => {
        let getDropOperation = jest.fn().mockImplementation(() => 'move');
        let getItems = () => [{
          test: 'item 1'
        }, {
          test: 'item 2'
        }];
        let tree = render(<>
          <Draggable getItems={getItems} />
          <Droppable getDropOperation={getDropOperation} />
        </>);

        let draggable = tree.getByText('Drag me');
        let droppable = tree.getByText('Drop here');

        let dataTransfer = new DataTransfer();
        fireEvent(draggable, new DragEvent('dragstart', {dataTransfer, clientX: 0, clientY: 0}));
        expect(dataTransfer.types).toEqual(['test', CUSTOM_DRAG_TYPE]);

        fireEvent(droppable, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
        expect(getDropOperation).toHaveBeenCalledTimes(1);
        expect(getDropOperation.mock.calls[0][0].has('test'));
        expect(!getDropOperation.mock.calls[0][0].has(CUSTOM_DRAG_TYPE));
      });
    });

    describe('drag preview', () => {
      it('should support rendering a custom drag preview', () => {
        let renderPreview = jest.fn().mockImplementation(() => <div>Drag preview</div>);
        let tree = render(<Draggable renderPreview={renderPreview} />);

        let draggable = tree.getByText('Drag me');

        let dataTransfer = new DataTransfer();
        fireEvent(draggable, new DragEvent('dragstart', {dataTransfer, clientX: 5, clientY: 5}));

        expect(dataTransfer._dragImage.node.tagName).toBe('DIV');
        expect(dataTransfer._dragImage.node.textContent).toBe('Drag preview');
        expect(dataTransfer._dragImage.x).toBe(5);
        expect(dataTransfer._dragImage.y).toBe(5);
      });

      it('should center the drag image under the mouse if the size is smaller than the original target', () => {
        let renderPreview = jest.fn().mockImplementation(() => <div>Drag preview</div>);
        let tree = render(<Draggable renderPreview={renderPreview} />);

        let draggable = tree.getByText('Drag me');

        jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
          return {
            left: 0,
            top: 0,
            x: 0,
            y: 0,
            width: this.style.position === 'absolute' ? 20 : 100,
            height: this.style.position === 'absolute' ? 20 : 50
          };
        });

        let dataTransfer = new DataTransfer();
        fireEvent(draggable, new DragEvent('dragstart', {dataTransfer, clientX: 30, clientY: 30}));

        expect(dataTransfer._dragImage.node.tagName).toBe('DIV');
        expect(dataTransfer._dragImage.node.textContent).toBe('Drag preview');
        expect(dataTransfer._dragImage.x).toBe(10);
        expect(dataTransfer._dragImage.y).toBe(10);
      });
    });
  });

  describe('keyboard', () => {
    afterEach(async () => {
      await user.keyboard('{Escape}');
      act(() => jest.runAllTimers());
    });

    it('should perform basic drag and drop', async () => {
      let onDragStart = jest.fn();
      let onDragMove = jest.fn();
      let onDragEnd = jest.fn();
      let onDropEnter = jest.fn();
      let onDropMove = jest.fn();
      let onDropExit = jest.fn();
      let onDrop = jest.fn();
      let onDropEnter2 = jest.fn();
      let onDropMove2 = jest.fn();
      let onDropExit2 = jest.fn();
      let onDrop2 = jest.fn();
      let tree = render(<>
        <Draggable onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd} />
        <Droppable onDropEnter={onDropEnter} onDropMove={onDropMove} onDrop={onDrop} onDropExit={onDropExit} />
        <Droppable onDropEnter={onDropEnter2} onDropMove={onDropMove2} onDrop={onDrop2} onDropExit={onDropExit2}>Drop here 2</Droppable>
      </>);

      let draggable = tree.getByText('Drag me');
      let droppable = tree.getByText('Drop here');
      let droppable2 = tree.getByText('Drop here 2');

      expect(draggable).toHaveAttribute('data-dragging', 'false');
      expect(droppable).toHaveAttribute('data-droptarget', 'false');
      expect(droppable2).toHaveAttribute('data-droptarget', 'false');

      await user.tab();

      expect(document.activeElement).toBe(draggable);
      expect(draggable).toHaveAttribute('aria-describedby');
      expect(document.getElementById(draggable.getAttribute('aria-describedby'))).toHaveTextContent('Press Enter to start dragging');

      await user.keyboard('{Enter}');

      expect(draggable).toHaveAttribute('data-dragging', 'true');
      expect(onDragStart).toHaveBeenCalledTimes(1);
      expect(onDragStart).toHaveBeenCalledWith({
        type: 'dragstart',
        x: 50,
        y: 25
      });

      act(() => jest.runAllTimers());
      expect(document.activeElement).toBe(droppable);
      expect(droppable).toHaveAttribute('aria-describedby');
      expect(document.getElementById(droppable.getAttribute('aria-describedby'))).toHaveTextContent('Press Enter to drop');
      expect(announce).toHaveBeenCalledWith('Started dragging. Press Tab to navigate to a drop target, then press Enter to drop, or press Escape to cancel.');

      expect(onDropEnter).toHaveBeenCalledTimes(1);
      expect(onDropEnter2).toHaveBeenCalledTimes(0);
      expect(onDropEnter).toHaveBeenCalledWith({
        type: 'dropenter',
        x: 50,
        y: 25
      });

      expect(draggable).toHaveAttribute('data-dragging', 'true');
      expect(droppable).toHaveAttribute('data-droptarget', 'true');
      expect(droppable2).toHaveAttribute('data-droptarget', 'false');

      await user.tab();

      expect(document.activeElement).toBe(droppable2);
      expect(droppable2).toHaveAttribute('aria-describedby');
      expect(document.getElementById(droppable2.getAttribute('aria-describedby'))).toHaveTextContent('Press Enter to drop');

      expect(onDropExit).toHaveBeenCalledTimes(1);
      expect(onDropExit2).not.toHaveBeenCalled();
      expect(onDropExit).toHaveBeenCalledWith({
        type: 'dropexit',
        x: 50,
        y: 25
      });

      expect(onDropEnter).toHaveBeenCalledTimes(1);
      expect(onDropEnter2).toHaveBeenCalledTimes(1);
      expect(onDropEnter2).toHaveBeenCalledWith({
        type: 'dropenter',
        x: 50,
        y: 25
      });

      expect(draggable).toHaveAttribute('data-dragging', 'true');
      expect(droppable).toHaveAttribute('data-droptarget', 'false');
      expect(droppable2).toHaveAttribute('data-droptarget', 'true');

      await user.keyboard('{Enter}');

      expect(document.activeElement).toBe(droppable2);
      expect(droppable).not.toHaveAttribute('aria-describedby');
      expect(droppable2).not.toHaveAttribute('aria-describedby');

      expect(onDrop).not.toHaveBeenCalled();
      expect(onDrop2).toHaveBeenCalledTimes(1);
      expect(onDrop2).toHaveBeenCalledWith({
        type: 'drop',
        x: 50,
        y: 25,
        dropOperation: 'move',
        items: [
          {
            kind: 'text',
            types: new Set(['text/plain']),
            getText: expect.any(Function)
          }
        ]
      });

      expect(await onDrop2.mock.calls[0][0].items[0].getText('text/plain')).toBe('hello world');
      expect(announce).toHaveBeenCalledWith('Drop complete.');

      expect(onDropExit).toHaveBeenCalledTimes(1);
      expect(onDropExit2).toHaveBeenCalledTimes(1);
      expect(onDropExit2).toHaveBeenCalledWith({
        type: 'dropexit',
        x: 50,
        y: 25
      });

      expect(onDragEnd).toHaveBeenCalledTimes(1);
      expect(onDragEnd).toHaveBeenCalledWith({
        type: 'dragend',
        x: 50,
        y: 25,
        dropOperation: 'move'
      });

      expect(draggable).toHaveAttribute('data-dragging', 'false');
      expect(droppable).toHaveAttribute('data-droptarget', 'false');
      expect(droppable2).toHaveAttribute('data-droptarget', 'false');
    });

    it('useDrag should support isDisabled', async () => {
      let onDragStart = jest.fn();
      let onDragMove = jest.fn();
      let onDragEnd = jest.fn();
      let onDropEnter = jest.fn();
      let onDropMove = jest.fn();
      let onDropExit = jest.fn();
      let onDrop = jest.fn();
      let tree = render(<>
        <Draggable isDisabled onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd} />
        <Droppable onDropEnter={onDropEnter} onDropMove={onDropMove} onDrop={onDrop} onDropExit={onDropExit} />
      </>);
      let draggable = tree.getByText('Drag me');
      let droppable = tree.getByText('Drop here');
      expect(draggable).toHaveAttribute('draggable', 'false');
      expect(draggable).toHaveAttribute('data-dragging', 'false');

      await user.tab();
      expect(document.activeElement).toBe(draggable);
      expect(draggable).not.toHaveAttribute('aria-describedby');

      await user.keyboard('{Enter}');
      act(() => jest.runAllTimers());

      expect(document.activeElement).toBe(draggable);
      expect(draggable).toHaveAttribute('data-dragging', 'false');
      expect(droppable).toHaveAttribute('data-droptarget', 'false');
      expect(onDragStart).not.toHaveBeenCalled();
      expect(onDragMove).not.toHaveBeenCalled();
      expect(onDragEnd).not.toHaveBeenCalled();
      expect(onDropEnter).not.toHaveBeenCalled();
      expect(onDropMove).not.toHaveBeenCalled();
      expect(onDropExit).not.toHaveBeenCalled();
      expect(onDrop).not.toHaveBeenCalled();
    });

    it('useDrop should support isDisabled', async () => {
      let onDragStart = jest.fn();
      let onDragMove = jest.fn();
      let onDragEnd = jest.fn();
      let onDropEnter = jest.fn();
      let onDropMove = jest.fn();
      let onDropExit = jest.fn();
      let onDrop = jest.fn();
      let tree = render(<>
        <Draggable onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd} />
        <Droppable isDisabled onDropEnter={onDropEnter} onDropMove={onDropMove} onDrop={onDrop} onDropExit={onDropExit} />
      </>);
      let draggable = tree.getByText('Drag me');
      let droppable = tree.getByText('Drop here');
      expect(droppable).toHaveAttribute('data-droptarget', 'false');

      await user.tab();
      expect(document.activeElement).toBe(draggable);

      await user.keyboard('{Enter}');
      act(() => jest.runAllTimers());

      expect(document.activeElement).toBe(draggable);
      expect(droppable).toHaveAttribute('data-droptarget', 'false');

      expect(onDragStart).toHaveBeenCalledTimes(1);
      expect(onDragMove).not.toHaveBeenCalled();
      expect(onDragEnd).not.toHaveBeenCalled();
      expect(onDropEnter).not.toHaveBeenCalled();
      expect(onDropMove).not.toHaveBeenCalled();
      expect(onDropExit).not.toHaveBeenCalled();
      expect(onDrop).not.toHaveBeenCalled();
    });

    describe('keyboard navigation', () => {
      it('should Tab forward and skip non drop target elements', async () => {
        let tree = render(<>
          <Draggable />
          <input />
          <Droppable />
          <input />
          <Droppable>Drop here 2</Droppable>
          <input />
        </>);

        let draggable = tree.getByText('Drag me');
        let droppable = tree.getByText('Drop here');
        let droppable2 = tree.getByText('Drop here 2');

        await user.tab();
        expect(document.activeElement).toBe(draggable);

        await user.keyboard('{Enter}');
        act(() => jest.runAllTimers());
        expect(document.activeElement).toBe(droppable);

        await user.tab();
        expect(document.activeElement).toBe(droppable2);

        await user.tab();
        expect(document.activeElement).toBe(draggable);
      });

      it('should Tab backward and skip non drop target elements', async () => {
        let tree = render(<>
          <Draggable />
          <input />
          <Droppable />
          <input />
          <Droppable>Drop here 2</Droppable>
          <input />
        </>);

        let draggable = tree.getByText('Drag me');
        let droppable = tree.getByText('Drop here');
        let droppable2 = tree.getByText('Drop here 2');

        await user.tab();
        expect(document.activeElement).toBe(draggable);

        await user.keyboard('{Enter}');
        act(() => jest.runAllTimers());
        expect(document.activeElement).toBe(droppable);

        await user.tab({shift: true});
        expect(document.activeElement).toBe(draggable);

        await user.tab({shift: true});
        expect(document.activeElement).toBe(droppable2);

        await user.tab({shift: true});
        expect(document.activeElement).toBe(droppable);
      });

      it('should cancel the drag when pressing the escape key', async () => {
        let tree = render(<>
          <Draggable />
          <Droppable />
        </>);

        let draggable = tree.getByText('Drag me');
        let droppable = tree.getByText('Drop here');

        await user.tab();
        expect(document.activeElement).toBe(draggable);

        await user.keyboard('{Enter}');
        act(() => jest.runAllTimers());
        expect(document.activeElement).toBe(droppable);

        await user.keyboard('{Escape}');
        expect(document.activeElement).toBe(draggable);

        expect(announce).toHaveBeenCalledWith('Drop canceled.');
      });

      it('should cancel the drag when pressing Enter on the original drag target', async () => {
        let onDragStart = jest.fn();
        let onDragEnd = jest.fn();
        let tree = render(<>
          <Draggable onDragStart={onDragStart} onDragEnd={onDragEnd} />
          <Droppable />
        </>);

        let draggable = tree.getByText('Drag me');
        let droppable = tree.getByText('Drop here');

        await user.tab();
        expect(document.activeElement).toBe(draggable);

        await user.keyboard('{Enter}');
        act(() => jest.runAllTimers());
        expect(document.activeElement).toBe(droppable);
        expect(onDragStart).toHaveBeenCalledTimes(1);

        await user.tab();
        expect(document.activeElement).toBe(draggable);

        await user.keyboard('{Enter}');
        act(() => jest.runAllTimers());
        expect(document.activeElement).toBe(draggable);

        expect(onDragEnd).toHaveBeenCalledTimes(1);
        expect(onDragStart).toHaveBeenCalledTimes(1);
      });

      it('should handle when a drop target is removed', async () => {
        let tree = render(<>
          <Draggable />
          <Droppable />
          <Droppable>Drop here 2</Droppable>
        </>);

        let draggable = tree.getByText('Drag me');
        let droppable = tree.getByText('Drop here');

        await user.tab();
        expect(document.activeElement).toBe(draggable);

        await user.keyboard('{Enter}');
        act(() => jest.runAllTimers());
        expect(document.activeElement).toBe(droppable);

        tree.rerender(<>
          <Draggable />
          <Droppable>Drop here 2</Droppable>
        </>);

        expect(document.activeElement).toBe(tree.getByText('Drop here 2'));
      });

      it('should ignore drop targets in aria-hidden trees', async () => {
        let tree = render(<>
          <Draggable />
          <div aria-hidden="true">
            <Droppable />
          </div>
          <Droppable>Drop here 2</Droppable>
        </>);

        let draggable = tree.getByText('Drag me');
        let droppable2 = tree.getByText('Drop here 2');

        await user.tab();
        expect(document.activeElement).toBe(draggable);

        await user.keyboard('{Enter}');
        act(() => {jest.runAllTimers();});
        expect(document.activeElement).toBe(droppable2);
      });

      it('should handle when a drop target is hidden with aria-hidden', async () => {
        let Test = (props) => (
          <>
            <Draggable />
            <Droppable />
            <div aria-hidden={!props.showTarget || undefined}>
              <Droppable>Drop here 2</Droppable>
            </div>
          </>
        );

        let tree = render(<Test showTarget />);

        let draggable = tree.getByText('Drag me');
        let droppable = tree.getByText('Drop here');
        let droppable2 = tree.getByText('Drop here 2');

        await user.tab();
        expect(document.activeElement).toBe(draggable);

        await user.keyboard('{Enter}');
        act(() => jest.runAllTimers());
        expect(document.activeElement).toBe(droppable);

        await user.tab();
        expect(document.activeElement).toBe(droppable2);
        // wait for the mutation observer I believe
        await act(async () =>
          tree.rerender(<Test />)
        );
        expect(tree.getAllByRole('button')).toHaveLength(2);
        expect(document.activeElement).toBe(droppable);

        await user.tab();
        expect(document.activeElement).toBe(draggable);
      });

      it('should not tab to the original draggable element if it is in an aria-hidden tree', async () => {
        let Test = () => {
          let [hidden, setHidden] = React.useState(false);
          return (<>
            <div aria-hidden={hidden}>
              <Draggable onDragStart={() => setHidden(true)} />
            </div>
            <Droppable />
            <Droppable>Drop here 2</Droppable>
          </>);
        };

        let tree = render(<Test />);

        let draggable = tree.getByText('Drag me');
        let droppable = tree.getByText('Drop here');
        let droppable2 = tree.getByText('Drop here 2');

        await user.tab();
        expect(document.activeElement).toBe(draggable);

        await user.keyboard('{Enter}');
        act(() => jest.runAllTimers());
        expect(document.activeElement).toBe(droppable);

        await user.tab();
        expect(document.activeElement).toBe(droppable2);

        await user.tab();
        expect(document.activeElement).toBe(droppable);

        await user.tab({shift: true});
        expect(document.activeElement).toBe(droppable2);

        await user.tab({shift: true});
        expect(document.activeElement).toBe(droppable);
      });

      it('should not restore focus to the original draggable element on Escape if it is in an aria-hidden tree', async () => {
        let Test = () => {
          let [hidden, setHidden] = React.useState(false);
          return (<>
            <div aria-hidden={hidden}>
              <Draggable onDragStart={() => setHidden(true)} />
            </div>
            <Droppable />
          </>);
        };

        let tree = render(<Test />);

        let draggable = tree.getByText('Drag me');
        let droppable = tree.getByText('Drop here');

        await user.tab();
        expect(document.activeElement).toBe(draggable);

        await user.keyboard('{Enter}');
        act(() => jest.runAllTimers());
        expect(document.activeElement).toBe(droppable);
        expect(droppable).toHaveAttribute('data-droptarget', 'true');

        await user.keyboard('{Escape}');
        expect(droppable).toHaveAttribute('data-droptarget', 'false');
        expect(document.activeElement).toBe(droppable);
      });
    });

    describe('drag data', () => {
      it('should work with custom data types', async () => {
        let getItems = () => [{
          'test': 'test data'
        }];

        let onDrop = jest.fn();
        let tree = render(<>
          <Draggable getItems={getItems} />
          <Droppable onDrop={onDrop} />
        </>);

        let draggable = tree.getByText('Drag me');
        let droppable = tree.getByText('Drop here');

        await user.tab();
        expect(document.activeElement).toBe(draggable);

        await user.keyboard('{Enter}');
        act(() => jest.runAllTimers());
        expect(document.activeElement).toBe(droppable);

        await user.keyboard('{Enter}');
        expect(onDrop).toHaveBeenCalledTimes(1);
        expect(onDrop).toHaveBeenCalledWith({
          type: 'drop',
          x: 50,
          y: 25,
          dropOperation: 'move',
          items: [
            {
              kind: 'text',
              types: new Set(['test']),
              getText: expect.any(Function)
            }
          ]
        });

        expect(await onDrop.mock.calls[0][0].items[0].getText('test')).toBe('test data');
      });

      it('should work with multiple items of the same custom type', async () => {
        let getItems = () => [{
          test: 'item 1'
        }, {
          test: 'item 2'
        }];

        let onDrop = jest.fn();
        let tree = render(<>
          <Draggable getItems={getItems} />
          <Droppable onDrop={onDrop} />
        </>);

        let draggable = tree.getByText('Drag me');
        let droppable = tree.getByText('Drop here');

        await user.tab();
        expect(document.activeElement).toBe(draggable);

        await user.keyboard('{Enter}');
        act(() => jest.runAllTimers());
        expect(document.activeElement).toBe(droppable);

        await user.keyboard('{Enter}');
        expect(onDrop).toHaveBeenCalledTimes(1);
        expect(onDrop).toHaveBeenCalledWith({
          type: 'drop',
          x: 50,
          y: 25,
          dropOperation: 'move',
          items: [
            {
              kind: 'text',
              types: new Set(['test']),
              getText: expect.any(Function)
            },
            {
              kind: 'text',
              types: new Set(['test']),
              getText: expect.any(Function)
            }
          ]
        });

        expect(await onDrop.mock.calls[0][0].items[0].getText('test')).toBe('item 1');
        expect(await onDrop.mock.calls[0][0].items[1].getText('test')).toBe('item 2');
      });

      it('should work with items of multiple types', async () => {
        let getItems = () => [{
          test: 'test data',
          'text/plain': 'test data'
        }];

        let onDrop = jest.fn();
        let tree = render(<>
          <Draggable getItems={getItems} />
          <Droppable onDrop={onDrop} />
        </>);

        let draggable = tree.getByText('Drag me');
        let droppable = tree.getByText('Drop here');

        await user.tab();
        expect(document.activeElement).toBe(draggable);

        await user.keyboard('{Enter}');
        act(() => jest.runAllTimers());
        expect(document.activeElement).toBe(droppable);

        await user.keyboard('{Enter}');
        expect(onDrop).toHaveBeenCalledTimes(1);
        expect(onDrop).toHaveBeenCalledWith({
          type: 'drop',
          x: 50,
          y: 25,
          dropOperation: 'move',
          items: [
            {
              kind: 'text',
              types: new Set(['test', 'text/plain']),
              getText: expect.any(Function)
            }
          ]
        });

        expect(await onDrop.mock.calls[0][0].items[0].getText('test')).toBe('test data');
        expect(await onDrop.mock.calls[0][0].items[0].getText('text/plain')).toBe('test data');
      });

      it('should work with multiple items of multiple types', async () => {
        let getItems = () => [{
          test: 'item 1',
          'text/plain': 'item 1'
        }, {
          test: 'item 2',
          'text/plain': 'item 2'
        }];

        let onDrop = jest.fn();
        let tree = render(<>
          <Draggable getItems={getItems} />
          <Droppable onDrop={onDrop} />
        </>);

        let draggable = tree.getByText('Drag me');
        let droppable = tree.getByText('Drop here');

        await user.tab();
        expect(document.activeElement).toBe(draggable);

        await user.keyboard('{Enter}');
        act(() => jest.runAllTimers());
        expect(document.activeElement).toBe(droppable);

        await user.keyboard('{Enter}');
        expect(onDrop).toHaveBeenCalledTimes(1);
        expect(onDrop).toHaveBeenCalledWith({
          type: 'drop',
          x: 50,
          y: 25,
          dropOperation: 'move',
          items: [
            {
              kind: 'text',
              types: new Set(['test', 'text/plain']),
              getText: expect.any(Function)
            },
            {
              kind: 'text',
              types: new Set(['test', 'text/plain']),
              getText: expect.any(Function)
            }
          ]
        });

        expect(await onDrop.mock.calls[0][0].items[0].getText('test')).toBe('item 1');
        expect(await onDrop.mock.calls[0][0].items[0].getText('text/plain')).toBe('item 1');
        expect(await onDrop.mock.calls[0][0].items[1].getText('test')).toBe('item 2');
        expect(await onDrop.mock.calls[0][0].items[1].getText('text/plain')).toBe('item 2');
      });
    });

    describe('drop operations', () => {
      it('should support getDropOperation to override the default operation', async () => {
        let onDragEnd = jest.fn();
        let onDrop = jest.fn();
        let getDropOperation = jest.fn().mockImplementation(() => 'copy');
        let tree = render(<>
          <Draggable onDragEnd={onDragEnd} />
          <Droppable getDropOperation={getDropOperation} onDrop={onDrop} />
        </>);

        let draggable = tree.getByText('Drag me');
        let droppable = tree.getByText('Drop here');

        await user.tab();
        expect(document.activeElement).toBe(draggable);

        await user.keyboard('{Enter}');
        act(() => jest.runAllTimers());
        expect(document.activeElement).toBe(droppable);

        expect(getDropOperation).toHaveBeenCalledWith(new Set(['text/plain']), ['move', 'copy', 'link']);
        expect(droppable).toHaveAttribute('data-droptarget', 'true');

        await user.keyboard('{Enter}');
        expect(onDrop).toHaveBeenCalledWith({
          type: 'drop',
          x: 50,
          y: 25,
          dropOperation: 'copy',
          items: [
            {
              kind: 'text',
              types: new Set(['text/plain']),
              getText: expect.any(Function)
            }
          ]
        });

        expect(onDragEnd).toHaveBeenCalledTimes(1);
        expect(onDragEnd).toHaveBeenCalledWith({
          type: 'dragend',
          x: 50,
          y: 25,
          dropOperation: 'copy'
        });
      });

      it('should support getAllowedDropOperations to limit allowed operations', async () => {
        let onDragEnd = jest.fn();
        let onDrop = jest.fn();
        let getDropOperation = jest.fn().mockImplementation(() => 'copy');
        let getAllowedDropOperations = jest.fn().mockImplementation(() => ['copy']);
        let tree = render(<>
          <Draggable getAllowedDropOperations={getAllowedDropOperations} onDragEnd={onDragEnd} />
          <Droppable onDrop={onDrop} getDropOperation={getDropOperation} />
        </>);

        let draggable = tree.getByText('Drag me');
        let droppable = tree.getByText('Drop here');

        await user.tab();
        expect(document.activeElement).toBe(draggable);

        await user.keyboard('{Enter}');
        act(() => jest.runAllTimers());
        expect(document.activeElement).toBe(droppable);

        expect(getDropOperation).toHaveBeenCalledWith(new Set(['text/plain']), ['copy']);
        expect(droppable).toHaveAttribute('data-droptarget', 'true');

        await user.keyboard('{Enter}');
        expect(onDrop).toHaveBeenCalledWith({
          type: 'drop',
          x: 50,
          y: 25,
          dropOperation: 'copy',
          items: [
            {
              kind: 'text',
              types: new Set(['text/plain']),
              getText: expect.any(Function)
            }
          ]
        });

        expect(onDragEnd).toHaveBeenCalledTimes(1);
        expect(onDragEnd).toHaveBeenCalledWith({
          type: 'dragend',
          x: 50,
          y: 25,
          dropOperation: 'copy'
        });
      });

      it('should hide drop targets where getDropOperation returns "cancel"', async () => {
        let onDropEnter = jest.fn();
        let onDragEnd = jest.fn();
        let onDropEnter2 = jest.fn();
        let getDropOperation = jest.fn().mockImplementation(() => 'cancel');
        let tree = render(<>
          <Draggable onDragEnd={onDragEnd} />
          <Droppable getDropOperation={getDropOperation} onDropEnter={onDropEnter} />
          <Droppable onDropEnter={onDropEnter2}>Drop here 2</Droppable>
        </>);

        let draggable = tree.getByText('Drag me');
        let droppable = tree.getByText('Drop here');
        let droppable2 = tree.getByText('Drop here 2');

        await user.tab();
        expect(document.activeElement).toBe(draggable);

        await user.keyboard('{Enter}');
        act(() => jest.runAllTimers());
        expect(document.activeElement).toBe(droppable2);

        expect(droppable).toHaveAttribute('aria-hidden', 'true');

        expect(droppable).toHaveAttribute('data-droptarget', 'false');
        expect(droppable2).toHaveAttribute('data-droptarget', 'true');
        expect(onDropEnter).not.toHaveBeenCalled();
        expect(onDropEnter2).toHaveBeenCalledTimes(1);
      });
    });

    it('should support nested drop targets', async () => {
      let onDragStart = jest.fn();
      let onDragMove = jest.fn();
      let onDragEnd = jest.fn();
      let onDropEnter = jest.fn();
      let onDropMove = jest.fn();
      let onDropExit = jest.fn();
      let onDrop = jest.fn();
      let onDropEnter2 = jest.fn();
      let onDropMove2 = jest.fn();
      let onDropExit2 = jest.fn();
      let onDrop2 = jest.fn();
      let tree = render(<>
        <Draggable onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd} />
        <Droppable onDropEnter={onDropEnter} onDropMove={onDropMove} onDrop={onDrop} onDropExit={onDropExit}>
          Drop here 1
          <Droppable onDropEnter={onDropEnter2} onDropMove={onDropMove2} onDrop={onDrop2} onDropExit={onDropExit2}>Drop here 2</Droppable>
        </Droppable>
      </>);

      let buttons = tree.getAllByRole('button');
      let draggable = buttons[0];
      let droppable = buttons[1];
      let droppable2 = buttons[2];

      expect(draggable).toHaveAttribute('data-dragging', 'false');
      expect(droppable).toHaveAttribute('data-droptarget', 'false');
      expect(droppable2).toHaveAttribute('data-droptarget', 'false');

      await user.tab();

      expect(document.activeElement).toBe(draggable);
      expect(draggable).toHaveAttribute('aria-describedby');
      expect(document.getElementById(draggable.getAttribute('aria-describedby'))).toHaveTextContent('Press Enter to start dragging');

      await user.keyboard('{Enter}');

      expect(draggable).toHaveAttribute('data-dragging', 'true');
      expect(onDragStart).toHaveBeenCalledTimes(1);
      expect(onDragStart).toHaveBeenCalledWith({
        type: 'dragstart',
        x: 50,
        y: 25
      });

      act(() => jest.runAllTimers());
      expect(document.activeElement).toBe(droppable2);
      expect(droppable2).toHaveAttribute('aria-describedby');
      expect(document.getElementById(droppable2.getAttribute('aria-describedby'))).toHaveTextContent('Press Enter to drop');
      expect(announce).toHaveBeenCalledWith('Started dragging. Press Tab to navigate to a drop target, then press Enter to drop, or press Escape to cancel.');

      expect(onDropEnter2).toHaveBeenCalledTimes(1);
      expect(onDropEnter).toHaveBeenCalledTimes(0);
      expect(onDropEnter2).toHaveBeenCalledWith({
        type: 'dropenter',
        x: 50,
        y: 25
      });

      expect(draggable).toHaveAttribute('data-dragging', 'true');
      expect(droppable).toHaveAttribute('data-droptarget', 'false');
      expect(droppable2).toHaveAttribute('data-droptarget', 'true');

      await user.tab();

      expect(document.activeElement).toBe(droppable);
      expect(droppable).toHaveAttribute('aria-describedby');
      expect(document.getElementById(droppable.getAttribute('aria-describedby'))).toHaveTextContent('Press Enter to drop');

      expect(onDropExit2).toHaveBeenCalledTimes(1);
      expect(onDropExit).not.toHaveBeenCalled();
      expect(onDropExit2).toHaveBeenCalledWith({
        type: 'dropexit',
        x: 50,
        y: 25
      });

      expect(onDropEnter).toHaveBeenCalledTimes(1);
      expect(onDropEnter2).toHaveBeenCalledTimes(1);
      expect(onDropEnter).toHaveBeenCalledWith({
        type: 'dropenter',
        x: 50,
        y: 25
      });

      expect(draggable).toHaveAttribute('data-dragging', 'true');
      expect(droppable).toHaveAttribute('data-droptarget', 'true');
      expect(droppable2).toHaveAttribute('data-droptarget', 'false');

      await user.keyboard('{Enter}');

      expect(document.activeElement).toBe(droppable);
      expect(droppable).not.toHaveAttribute('aria-describedby');
      expect(droppable2).not.toHaveAttribute('aria-describedby');

      expect(onDrop2).not.toHaveBeenCalled();
      expect(onDrop).toHaveBeenCalledTimes(1);
      expect(onDrop).toHaveBeenCalledWith({
        type: 'drop',
        x: 50,
        y: 25,
        dropOperation: 'move',
        items: [
          {
            kind: 'text',
            types: new Set(['text/plain']),
            getText: expect.any(Function)
          }
        ]
      });

      expect(await onDrop.mock.calls[0][0].items[0].getText('text/plain')).toBe('hello world');
      expect(announce).toHaveBeenCalledWith('Drop complete.');

      expect(onDropExit).toHaveBeenCalledTimes(1);
      expect(onDropExit2).toHaveBeenCalledTimes(1);
      expect(onDropExit).toHaveBeenCalledWith({
        type: 'dropexit',
        x: 50,
        y: 25
      });

      expect(onDragEnd).toHaveBeenCalledTimes(1);
      expect(onDragEnd).toHaveBeenCalledWith({
        type: 'dragend',
        x: 50,
        y: 25,
        dropOperation: 'move'
      });

      expect(draggable).toHaveAttribute('data-dragging', 'false');
      expect(droppable).toHaveAttribute('data-droptarget', 'false');
      expect(droppable2).toHaveAttribute('data-droptarget', 'false');
    });
  });

  describe('screen reader', () => {
    beforeEach(() => {
      // reset focus visible state
      fireEvent.focus(document.body);
    });

    afterEach(async () => {
      await user.keyboard('{Escape}');
    });

    it('should allow navigating with only focus events', async () => {
      let onDragStart = jest.fn();
      let onDragMove = jest.fn();
      let onDragEnd = jest.fn();
      let onDropEnter = jest.fn();
      let onDropMove = jest.fn();
      let onDropExit = jest.fn();
      let onDrop = jest.fn();
      let onDropEnter2 = jest.fn();
      let onDropMove2 = jest.fn();
      let onDropExit2 = jest.fn();
      let onDrop2 = jest.fn();
      let tree = render(<>
        <Draggable onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd} />
        <Droppable onDropEnter={onDropEnter} onDropMove={onDropMove} onDrop={onDrop} onDropExit={onDropExit} />
        <Droppable onDropEnter={onDropEnter2} onDropMove={onDropMove2} onDrop={onDrop2} onDropExit={onDropExit2}>Drop here 2</Droppable>
      </>);

      let draggable = tree.getByText('Drag me');
      let droppable = tree.getByText('Drop here');
      let droppable2 = tree.getByText('Drop here 2');

      act(() => draggable.focus());
      fireEvent.focus(draggable);
      expect(draggable).toHaveAttribute('aria-describedby');
      expect(document.getElementById(draggable.getAttribute('aria-describedby'))).toHaveTextContent('Click to start dragging');
      expect(draggable).toHaveAttribute('data-dragging', 'false');

      await user.pointer({target: draggable, keys: '[MouseLeft]', coords: {width: 0, height: 0}});
      act(() => jest.runAllTimers());
      expect(document.activeElement).toBe(draggable);
      expect(draggable).toHaveAttribute('aria-describedby');
      expect(document.getElementById(draggable.getAttribute('aria-describedby'))).toHaveTextContent('Dragging. Click to cancel drag.');

      expect(draggable).toHaveAttribute('data-dragging', 'true');
      expect(droppable).toHaveAttribute('data-droptarget', 'false');
      expect(droppable2).toHaveAttribute('data-droptarget', 'false');

      expect(onDragStart).toHaveBeenCalledTimes(1);
      expect(onDragStart).toHaveBeenCalledWith({
        type: 'dragstart',
        x: 50,
        y: 25
      });

      expect(announce).toHaveBeenCalledWith('Started dragging. Navigate to a drop target, then click or press Enter to drop.');

      act(() => droppable.focus());
      expect(document.activeElement).toBe(droppable);
      expect(droppable).toHaveAttribute('aria-describedby');
      expect(document.getElementById(droppable.getAttribute('aria-describedby'))).toHaveTextContent('Click to drop.');
      expect(onDropEnter).toHaveBeenCalledTimes(1);
      expect(onDropEnter2).toHaveBeenCalledTimes(0);
      expect(onDropEnter).toHaveBeenCalledWith({
        type: 'dropenter',
        x: 50,
        y: 25
      });

      act(() => droppable2.focus());
      expect(document.activeElement).toBe(droppable2);
      expect(droppable2).toHaveAttribute('aria-describedby');
      expect(document.getElementById(droppable2.getAttribute('aria-describedby'))).toHaveTextContent('Click to drop.');

      expect(onDropExit).toHaveBeenCalledTimes(1);
      expect(onDropExit2).not.toHaveBeenCalled();
      expect(onDropExit).toHaveBeenCalledWith({
        type: 'dropexit',
        x: 50,
        y: 25
      });

      expect(onDropEnter).toHaveBeenCalledTimes(1);
      expect(onDropEnter2).toHaveBeenCalledTimes(1);
      expect(onDropEnter2).toHaveBeenCalledWith({
        type: 'dropenter',
        x: 50,
        y: 25
      });

      expect(draggable).toHaveAttribute('data-dragging', 'true');
      expect(droppable).toHaveAttribute('data-droptarget', 'false');
      expect(droppable2).toHaveAttribute('data-droptarget', 'true');

      fireEvent.click(droppable2);

      expect(document.activeElement).toBe(droppable2);
      expect(droppable).not.toHaveAttribute('aria-describedby');
      expect(droppable2).not.toHaveAttribute('aria-describedby');

      expect(onDrop).not.toHaveBeenCalled();
      expect(onDrop2).toHaveBeenCalledTimes(1);
      expect(onDrop2).toHaveBeenCalledWith({
        type: 'drop',
        x: 50,
        y: 25,
        dropOperation: 'move',
        items: [
          {
            kind: 'text',
            types: new Set(['text/plain']),
            getText: expect.any(Function)
          }
        ]
      });

      expect(await onDrop2.mock.calls[0][0].items[0].getText('text/plain')).toBe('hello world');
      expect(announce).toHaveBeenCalledWith('Drop complete.');

      expect(onDropExit).toHaveBeenCalledTimes(1);
      expect(onDropExit2).toHaveBeenCalledTimes(1);
      expect(onDropExit2).toHaveBeenCalledWith({
        type: 'dropexit',
        x: 50,
        y: 25
      });

      expect(onDragEnd).toHaveBeenCalledTimes(1);
      expect(onDragEnd).toHaveBeenCalledWith({
        type: 'dragend',
        x: 50,
        y: 25,
        dropOperation: 'move'
      });

      expect(draggable).toHaveAttribute('data-dragging', 'false');
      expect(droppable).toHaveAttribute('data-droptarget', 'false');
      expect(droppable2).toHaveAttribute('data-droptarget', 'false');
    });

    it('should hide all non drop target elements from screen readers while dragging', async () => {
      let tree = render(<>
        <Draggable />
        <input />
        <Droppable />
        <button>Test</button>
        <Droppable>Drop here 2</Droppable>
        <span>Text</span>
      </>);

      let draggable = tree.getByText('Drag me');
      let droppable = tree.getByText('Drop here');
      let droppable2 = tree.getByText('Drop here 2');

      let buttons = tree.getAllByRole('button');
      expect(buttons).toHaveLength(4);

      await user.pointer({target: draggable, keys: '[MouseLeft]', coords: {width: 0, height: 0}});
      act(() => jest.runAllTimers());

      buttons = tree.getAllByRole('button');
      expect(buttons).toEqual([draggable, droppable, droppable2]);

      expect(tree.queryByRole('textbox')).toBeNull();
      expect(tree.getByText('Text')).toHaveAttribute('aria-hidden', 'true');
    });

    it('should support clicking the original drag target to cancel drag', async () => {
      let tree = render(<>
        <Draggable />
        <Droppable />
      </>);

      let draggable = tree.getByText('Drag me');

      fireEvent.focus(draggable);
      fireEvent.click(draggable);
      act(() => jest.runAllTimers());
      expect(draggable).toHaveAttribute('data-dragging', 'true');
      expect(draggable).toHaveAttribute('aria-describedby');
      expect(document.getElementById(draggable.getAttribute('aria-describedby'))).toHaveTextContent('Dragging. Click to cancel drag.');

      fireEvent.click(draggable);
      expect(draggable).toHaveAttribute('data-dragging', 'false');
      expect(draggable).toHaveAttribute('aria-describedby');
      expect(document.getElementById(draggable.getAttribute('aria-describedby'))).toHaveTextContent('Click to start dragging');

      expect(announce).toHaveBeenCalledWith('Drop canceled.');
    });

    it('should support clicking the original drag target to cancel drag (virtual pointer event)', async () => {
      let tree = render(<>
        <Draggable />
        <Droppable />
      </>);

      let draggable = tree.getByText('Drag me');

      act(() => draggable.focus());
      fireEvent(draggable, pointerEvent('pointerdown', {pointerId: 1, width: 1, height: 1, pressure: 0, detail: 0}));
      fireEvent(draggable, pointerEvent('pointerup', {pointerId: 1, width: 1, height: 1, pressure: 0, detail: 0}));
      await user.pointer({target: draggable, keys: '[MouseLeft]', coords: {width: 0, height: 0}});
      act(() => jest.runAllTimers());
      expect(draggable).toHaveAttribute('data-dragging', 'true');
      expect(draggable).toHaveAttribute('aria-describedby');
      expect(document.getElementById(draggable.getAttribute('aria-describedby'))).toHaveTextContent('Dragging. Click to cancel drag.');

      // Android Talkback fires with click event of detail = 1, test that our onPointerDown listener detects that it is a virtual click
      fireEvent(draggable, pointerEvent('pointerdown', {pointerId: 1, width: 1, height: 1, pressure: 0, detail: 0, pointerType: 'mouse'}));
      fireEvent(draggable, pointerEvent('pointerup', {pointerId: 1, width: 1, height: 1, pressure: 0, detail: 0, pointerType: 'mouse'}));
      fireEvent.click(draggable, {detail: 1});
      expect(draggable).toHaveAttribute('data-dragging', 'false');
      expect(draggable).toHaveAttribute('aria-describedby');
      expect(document.getElementById(draggable.getAttribute('aria-describedby'))).toHaveTextContent('Click to start dragging');

      expect(announce).toHaveBeenCalledWith('Drop canceled.');
    });

    it('should support double tapping the drop target to complete drag (virtual pointer event)', async () => {
      let onDrop = jest.fn();
      let tree = render(<>
        <Draggable />
        <Droppable onDrop={onDrop} />
      </>);

      let draggable = tree.getByText('Drag me');
      let droppable = tree.getByText('Drop here');

      act(() => draggable.focus());
      fireEvent(draggable, pointerEvent('pointerdown', {pointerId: 1, width: 1, height: 1, pressure: 0, detail: 0}));
      fireEvent(draggable, pointerEvent('pointerup', {pointerId: 1, width: 1, height: 1, pressure: 0, detail: 0}));
      await user.pointer({target: draggable, keys: '[MouseLeft]', coords: {width: 0, height: 0}});
      act(() => jest.runAllTimers());
      expect(draggable).toHaveAttribute('data-dragging', 'true');


      // Android Talkback fires with click event of detail = 1, test that our onPointerDown listener detects that it is a virtual click
      act(() => droppable.focus());
      fireEvent(droppable, pointerEvent('pointerdown', {pointerId: 1, width: 1, height: 1, pressure: 0, detail: 0, pointerType: 'mouse'}));
      fireEvent(droppable, pointerEvent('pointerup', {pointerId: 1, width: 1, height: 1, pressure: 0, detail: 0, pointerType: 'mouse'}));
      fireEvent.click(droppable, {detail: 1});
      expect(draggable).toHaveAttribute('data-dragging', 'false');
      expect(draggable).toHaveAttribute('aria-describedby');
      expect(document.getElementById(draggable.getAttribute('aria-describedby'))).toHaveTextContent('Click to start dragging');

      expect(announce).toHaveBeenCalledWith('Drop complete.');
      expect(onDrop).toHaveBeenCalledTimes(1);
    });

    it('should handle when a drop target is added', async () => {
      let setShowTarget2;
      let Test = () => {
        let [showTarget2, _setShowTarget2] = React.useState(false);
        setShowTarget2 = _setShowTarget2;
        return (<>
          <Draggable />
          <Droppable />
          {showTarget2 &&
            <Droppable>Drop here 2</Droppable>
          }
        </>);
      };

      let tree = render(<Test />);

      let draggable = tree.getByText('Drag me');

      act(() => draggable.focus());
      await user.pointer({target: draggable, keys: '[MouseLeft]', coords: {width: 0, height: 0}});
      act(() => jest.runAllTimers());

      expect(tree.getAllByRole('button')).toHaveLength(2);

      act(() => setShowTarget2(true));
      expect(tree.getAllByRole('button')).toHaveLength(3);
    });

    it('should handle when a non drop target element is added', async () => {
      let Test = (props) => (
        <>
          <Draggable />
          <input />
          <Droppable />
          {props.showInput2 &&
            <input />
          }
        </>
      );

      let tree = render(<Test />);

      let draggable = tree.getByText('Drag me');

      expect(tree.getAllByRole('textbox')).toHaveLength(1);

      act(() => draggable.focus());
      fireEvent.click(draggable);
      act(() => jest.runAllTimers());

      expect(() => tree.getAllByRole('textbox')).toThrow();

      await act(async () => {
        await tree.rerender(<Test showInput2 />);
      });
      expect(() => tree.getAllByRole('textbox')).toThrow();

      fireEvent.click(draggable);
      expect(tree.getAllByRole('textbox')).toHaveLength(2);
    });

    it('should handle when a drop target is removed', async () => {
      let setShowTarget2;
      let Test = () => {
        let [showTarget2, _setShowTarget2] = React.useState(true);
        setShowTarget2 = _setShowTarget2;
        return (<>
          <Draggable />
          <Droppable />
          {showTarget2 &&
            <Droppable>Drop here 2</Droppable>
          }
        </>);
      };

      let tree = render(<Test />);

      let draggable = tree.getByText('Drag me');

      act(() => draggable.focus());
      await user.pointer({target: draggable, keys: '[MouseLeft]', coords: {width: 0, height: 0}});
      act(() => jest.runAllTimers());

      expect(tree.getAllByRole('button')).toHaveLength(3);

      act(() => setShowTarget2(false));
      expect(tree.getAllByRole('button')).toHaveLength(2);
    });

    it('should handle when a drop target is hidden with aria-hidden', async () => {
      let Test = (props) => (
        <>
          <Draggable />
          <Droppable />
          <div aria-hidden={!props.showTarget2 || undefined}>
            <Droppable>Drop here 2</Droppable>
          </div>
        </>
      );

      let tree = render(<Test showTarget2 />);

      let draggable = tree.getByText('Drag me');

      act(() => draggable.focus());
      await user.pointer({target: draggable, keys: '[MouseLeft]', coords: {width: 0, height: 0}});
      act(() => jest.runAllTimers());

      expect(tree.getAllByRole('button')).toHaveLength(3);

      await act(async () => {
        await tree.rerender(<Test />);
      });
      expect(tree.getAllByRole('button')).toHaveLength(2);
    });

    it('should restore focus to the current drop target when focusing a non drop target element', async () => {
      let tree = render(<>
        <Draggable />
        <input />
        <Droppable />
      </>);

      let draggable = tree.getByText('Drag me');
      let droppable = tree.getByText('Drop here');
      let input = tree.getByRole('textbox');

      act(() => draggable.focus());
      await user.pointer({target: draggable, keys: '[MouseLeft]', coords: {width: 0, height: 0}});
      act(() => jest.runAllTimers());

      act(() => droppable.focus());

      act(() => input.focus());
      expect(document.activeElement).toBe(droppable);
    });

    it('should restore focus to the drag target when focusing a non drop target element and there is no current drop target', async () => {
      let tree = render(<>
        <Draggable />
        <input />
        <Droppable />
      </>);

      let draggable = tree.getByText('Drag me');
      let input = tree.getByRole('textbox');

      act(() => draggable.focus());
      await user.pointer({target: draggable, keys: '[MouseLeft]', coords: {width: 0, height: 0}});
      act(() => jest.runAllTimers());

      act(() => input.focus());
      expect(document.activeElement).toBe(draggable);
    });

    it('should restore focus to the current drop target when blurring all elements', async () => {
      let tree = render(<>
        <Draggable />
        <Droppable />
      </>);

      let draggable = tree.getByText('Drag me');
      let droppable = tree.getByText('Drop here');

      act(() => draggable.focus());
      await user.pointer({target: draggable, keys: '[MouseLeft]', coords: {width: 0, height: 0}});
      act(() => jest.runAllTimers());

      act(() => droppable.focus());

      act(() => droppable.blur());
      expect(document.activeElement).toBe(droppable);
    });

    it('should restore focus to the drag target when blurring all elements and there is no current drop target', async () => {
      let tree = render(<>
        <Draggable />
        <Droppable />
      </>);

      let draggable = tree.getByText('Drag me');

      act(() => draggable.focus());
      await user.pointer({target: draggable, keys: '[MouseLeft]', coords: {width: 0, height: 0}});
      act(() => jest.runAllTimers());

      act(() => draggable.blur());
      expect(document.activeElement).toBe(draggable);
    });

    it('should ignore clicks not from screen readers to start dragging', () => {
      let tree = render(<>
        <Draggable />
        <Droppable />
      </>);

      let draggable = tree.getByText('Drag me');

      act(() => draggable.focus());
      fireEvent.click(draggable, {detail: 1});
      act(() => jest.runAllTimers());

      expect(draggable).toHaveAttribute('data-dragging', 'false');
    });

    it('should ignore clicks not from screen readers during dragging', async () => {
      let tree = render(<>
        <Draggable />
        <Droppable />
      </>);

      let draggable = tree.getByText('Drag me');
      let droppable = tree.getByText('Drop here');

      act(() => draggable.focus());
      await user.pointer({target: draggable, keys: '[MouseLeft]', coords: {width: 0, height: 0}});
      act(() => jest.runAllTimers());
      expect(draggable).toHaveAttribute('data-dragging', 'true');

      fireEvent.focus(droppable);
      fireEvent.click(droppable, {detail: 1});
      expect(draggable).toHaveAttribute('data-dragging', 'true');
    });

    it('should use touch specific aria descriptions when available', async () => {
      window.ontouchstart = () => {};

      let tree = render(<>
        <Draggable />
        <Droppable />
      </>);

      let draggable = tree.getByText('Drag me');
      let droppable = tree.getByText('Drop here');

      act(() => draggable.focus());
      fireEvent.focus(draggable);
      expect(draggable).toHaveAttribute('aria-describedby');
      expect(document.getElementById(draggable.getAttribute('aria-describedby'))).toHaveTextContent('Double tap to start dragging');

      await user.pointer({target: draggable, keys: '[MouseLeft]', coords: {width: 0, height: 0}});
      act(() => jest.runAllTimers());
      expect(document.activeElement).toBe(draggable);
      expect(draggable).toHaveAttribute('aria-describedby');
      expect(document.getElementById(draggable.getAttribute('aria-describedby'))).toHaveTextContent('Dragging. Double tap to cancel drag.');
      expect(announce).toHaveBeenCalledWith('Started dragging. Navigate to a drop target, then double tap to drop.');

      expect(droppable).toHaveAttribute('aria-describedby');
      expect(document.getElementById(droppable.getAttribute('aria-describedby'))).toHaveTextContent('Double tap to drop.');

      delete window.ontouchstart;
    });
  });
});
