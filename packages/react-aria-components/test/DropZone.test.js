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

import {act, fireEvent, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {Button, DropZone, DropZoneContext, FileTrigger, Link, Text} from '../';
import {ClipboardEvent, DataTransfer, DataTransferItem, DragEvent} from '@react-aria/dnd/test/mocks';
import {Draggable} from '@react-aria/dnd/test/examples';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('DropZone', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('should render a dropzone', () => {
    let {getByTestId} = render(
      <DropZone data-testid="foo">
        <Text slot="label">
          Test
        </Text>
      </DropZone>
    );
    let dropzone = getByTestId('foo');
    expect(dropzone).toHaveAttribute('class', 'react-aria-DropZone');
  });

  it('should render a dropzone with custom class', () => {
    let {getByTestId} = render(
      <DropZone data-testid="foo" className="test">
        <Text slot="label">
          Test
        </Text>
      </DropZone>);
    let dropzone = getByTestId('foo');
    expect(dropzone).toHaveAttribute('class', 'test');
  });

  it('should support DOM props', () => {
    let {getByTestId} = render(
      <DropZone data-testid="foo" data-foo="bar">
        <Text slot="label">
          Test
        </Text>
      </DropZone>);
    let dropzone = getByTestId('foo');
    expect(dropzone).toHaveAttribute('data-foo', 'bar');
  });

  it('should support slot', () => {
    let {getByTestId} = render(
      <DropZoneContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <DropZone data-testid="foo" slot="test" />
      </DropZoneContext.Provider>
    );

    let dropzone = getByTestId('foo');
    expect(dropzone).toHaveAttribute('class', 'react-aria-DropZone');
    expect(dropzone).toHaveAttribute('slot', 'test');
  });

  it('should support hover', async () => {
    let hoverStartSpy = jest.fn();
    let hoverChangeSpy = jest.fn();
    let hoverEndSpy = jest.fn();
    let {getByText} = render(<DropZone className={({isHovered}) => isHovered ? 'hover' : ''} onHoverStart={hoverStartSpy} onHoverChange={hoverChangeSpy} onHoverEnd={hoverEndSpy}>Test</DropZone>);
    let dropzone = getByText('Test');

    expect(dropzone).not.toHaveAttribute('data-hovered');
    expect(dropzone).not.toHaveClass('hover');

    await user.hover(dropzone);
    expect(dropzone).toHaveAttribute('data-hovered', 'true');
    expect(dropzone).toHaveClass('hover');
    expect(hoverStartSpy).toHaveBeenCalledTimes(1);
    expect(hoverChangeSpy).toHaveBeenCalledTimes(1);

    await user.unhover(dropzone);
    expect(dropzone).not.toHaveAttribute('data-hovered');
    expect(dropzone).not.toHaveClass('hover');
    expect(hoverEndSpy).toHaveBeenCalledTimes(1);
    expect(hoverChangeSpy).toHaveBeenCalledTimes(2);
  });

  it('should support focus ring', async () => {
    let {getByTestId, getByRole} = render(
      <DropZone data-testid="foo" className={({isFocusVisible}) => isFocusVisible ? 'focus' : ''}>
        <Text slot="label">
          Test
        </Text>
      </DropZone>);
    let dropzone = getByTestId('foo');
    let button = getByRole('button');

    expect(dropzone).not.toHaveAttribute('data-focus-visible');
    expect(dropzone).not.toHaveClass('focus');

    await user.tab();
    expect(document.activeElement).toBe(button);
    expect(dropzone).toHaveAttribute('data-focus-visible', 'true');
    expect(dropzone).toHaveClass('focus');

    await user.tab();
    expect(dropzone).not.toHaveAttribute('data-focus-visible');
    expect(dropzone).not.toHaveClass('focus');
  });

  it('should apply correct default aria-labelledby', () => {
    let {getByRole, getByText} = render(
      <DropZone className="test">
        <Text slot="label">
          Test
        </Text>
      </DropZone>);
    let text = getByText('Test');
    let button = getByRole('button');
    expect(button).toHaveAttribute('aria-labelledby', `${button.id} ${text.id}`);
  });

  it('should allow custom aria-label', () => {
    let {getByRole} = render(
      <DropZone
        data-testid="foo"
        aria-label="test aria-label">
        <FileTrigger>
          <Link>Upload</Link>
        </FileTrigger>
      </DropZone>);
    let button = getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'test aria-label');
  });

  it('should support render props', async () => {
    let {getByTestId} = render(
      <DropZone data-testid="foo">
        {({isFocused}) => isFocused ? 'Focused' : 'Not Focused'}
      </DropZone>
    );
    let dropzone = getByTestId('foo');

    expect(dropzone).toHaveTextContent('Not Focused');

    await user.tab();
    expect(dropzone).toHaveTextContent('Focused');
  });

  it('should render FileTrigger as a child', () => {
    let {getByTestId} = render(
      <DropZone>
        <FileTrigger>
          <Button data-testid="foo">Upload</Button>
        </FileTrigger>
      </DropZone>
    );

    let button = getByTestId('foo');
    expect(button).toHaveClass('react-aria-Button');
  });

  it('should attach a ref to the dropzone if provided as a prop', () => {
    let ref = React.createRef();
    let {getByTestId} = render(
      <DropZone data-testid="foo" ref={ref}>
        <FileTrigger>
          <Button>Upload</Button>
        </FileTrigger>
      </DropZone>
    );

    let dropzone = getByTestId('foo');
    expect(ref.current).toEqual(dropzone);
  });

  describe('drag and drop', function () {
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

    let onDragStart = jest.fn();
    let onDragMove = jest.fn();
    let onDragEnd = jest.fn();
    let onDropEnter = jest.fn();
    let onDropMove = jest.fn();
    let onDrop = jest.fn();

    describe('via mouse', function () {
      it('should support data attribute drop-target', async () => {
        let tree = render(
          <>
            <Draggable onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd} />
            <DropZone data-testid="foo" onDropEnter={onDropEnter} onDrop={onDrop} onDropMove={onDropMove} >
              <Text slot="label">
                Test
              </Text>
            </DropZone>
          </>
        );
        let dropzone = tree.getByTestId('foo');
        let draggable = tree.getByText('Drag me');
        expect(dropzone).toHaveClass('react-aria-DropZone');
        expect(draggable).toHaveAttribute('draggable', 'true');
        expect(draggable).toHaveAttribute('data-dragging', 'false');
        expect(dropzone).not.toHaveAttribute('data-drop-target');

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

        fireEvent(dropzone, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
        expect(onDropEnter).toHaveBeenCalledTimes(1);
        expect(onDropEnter).toHaveBeenCalledWith({
          type: 'dropenter',
          x: 1,
          y: 1
        });

        expect(dataTransfer.dropEffect).toBe('move');
        expect(dropzone).toHaveAttribute('data-drop-target', 'true');

        fireEvent(dropzone, new DragEvent('dragover', {dataTransfer, clientX: 2, clientY: 2}));
        expect(onDropMove).toHaveBeenCalledTimes(1);
        expect(onDropMove).toHaveBeenCalledWith({
          type: 'dropmove',
          x: 2,
          y: 2
        });

        expect(dataTransfer.dropEffect).toBe('move');
        expect(dropzone).toHaveAttribute('data-drop-target', 'true');

        fireEvent(dropzone, new DragEvent('drop', {dataTransfer, clientX: 2, clientY: 2}));
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

        expect(dropzone).not.toHaveAttribute('data-drop-target');

      });

      it('should not trigger drag events if disabled', async () => {
        let tree = render(
          <>
            <Draggable onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd} />
            <DropZone isDisabled data-testid="disabled" onDropEnter={onDropEnter} onDrop={onDrop} onDropMove={onDropMove}>
              <Text slot="label">
                Test
              </Text>
            </DropZone>
          </>
        );
        let dropzone = tree.getByTestId('disabled');
        expect(dropzone).toHaveAttribute('data-disabled', 'true');

        let draggable = tree.getByText('Drag me');
        expect(dropzone).toHaveClass('react-aria-DropZone');
        expect(draggable).toHaveAttribute('draggable', 'true');
        expect(draggable).toHaveAttribute('data-dragging', 'false');
        expect(dropzone).not.toHaveAttribute('data-drop-target');

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

        fireEvent(dropzone, new DragEvent('dragenter', {dataTransfer, clientX: 1, clientY: 1}));
        expect(onDropEnter).toHaveBeenCalledTimes(0);

        expect(dataTransfer.dropEffect).toBe('none');
        expect(dropzone).not.toHaveAttribute('data-drop-target');

        fireEvent(dropzone, new DragEvent('dragover', {dataTransfer, clientX: 2, clientY: 2}));
        expect(onDropMove).toHaveBeenCalledTimes(0);

        expect(dataTransfer.dropEffect).toBe('none');
        expect(dropzone).not.toHaveAttribute('data-drop-target');

        fireEvent(draggable, new DragEvent('dragend', {dataTransfer, clientX: 2, clientY: 2}));
        expect(onDragEnd).toHaveBeenCalledTimes(1);
        expect(onDragEnd).toHaveBeenCalledWith({
          type: 'dragend',
          x: 2,
          y: 2,
          dropOperation: 'cancel'
        });

        expect(dropzone).not.toHaveAttribute('data-drop-target');
      });

      it('should focus the dropzone visually hidden button if click happens on a non-focusable element', async () => {
        let {getByRole, getByTestId} = render(
          <DropZone data-testid="dropzone">
            <div data-testid="div">Test</div>
          </DropZone>
        );

        let hiddenButton = getByRole('button');
        await user.click(getByTestId('div'));
        expect(document.activeElement).toBe(hiddenButton);
        expect(getByTestId('dropzone')).toContainElement(document.activeElement);
      });

      it('when a focusable element in the drop zone is clicked, it should receive focus', async () => {
        let {getByTestId} = render(
          <DropZone data-testid="dropzone">
            <Button data-testid="button">Test</Button>
          </DropZone>
        );

        let button = getByTestId('button');
        await user.click(button);
        expect(document.activeElement).toBe(button);
      });
    });

    describe('via keyboard', function () {
      afterEach(() => {
        fireEvent.keyDown(document.body, {key: 'Escape'});
        fireEvent.keyUp(document.body, {key: 'Escape'});
      });

      it('should allow drag and drop', async function () {
        let tree = render(
          <>
            <Draggable onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd} />
            <DropZone data-testid="foo" onDropEnter={onDropEnter} onDrop={onDrop} onDropMove={onDropMove} >
              <Text slot="label">
                Test
              </Text>
            </DropZone>
          </>
        );

        let dropzone = tree.getByTestId('foo');
        let button = tree.getAllByRole('button')[1];
        let draggable = tree.getByText('Drag me');

        expect(dropzone).toHaveClass('react-aria-DropZone');
        expect(draggable).toHaveAttribute('draggable', 'true');

        await user.tab();
        fireEvent.keyDown(draggable, {key: 'Enter'});
        fireEvent.keyUp(draggable, {key: 'Enter'});

        expect(onDragStart).toHaveBeenCalledTimes(1);
        expect(onDragStart).toHaveBeenCalledWith({
          type: 'dragstart',
          x: 50,
          y: 25
        });

        act(() => jest.runAllTimers());
        expect(document.activeElement).toBe(button);
        fireEvent.keyDown(dropzone, {key: 'Enter'});
        fireEvent.keyUp(dropzone, {key: 'Enter'});

        expect(onDrop).toHaveBeenCalledTimes(1);
        expect(await onDrop.mock.calls[0][0].items[0].getText('text/plain')).toBe('hello world');

        expect(onDragEnd).toHaveBeenCalledTimes(1);
        expect(onDragEnd).toHaveBeenCalledWith({
          type: 'dragend',
          x: 50,
          y: 25,
          dropOperation: 'move'
        });

        expect(dropzone).not.toHaveAttribute('data-drop-target');
      });

      it('should not allow drag and drop if disabled', async () => {
        let tree = render(
          <>
            <Draggable onDragStart={onDragStart} onDragEnd={onDragEnd} />
            <DropZone isDisabled data-testid="disabled" onDropEnter={onDropEnter} onDrop={onDrop} onDropMove={onDropMove}>
              <Text slot="label">
                Test
              </Text>
            </DropZone>
          </>
        );

        let dropzone = tree.getByTestId('disabled');
        let draggable = tree.getByText('Drag me');

        expect(dropzone).toHaveClass('react-aria-DropZone');
        expect(draggable).toHaveAttribute('draggable', 'true');

        await user.tab();
        fireEvent.keyDown(draggable, {key: 'Enter'});
        fireEvent.keyUp(draggable, {key: 'Enter'});

        expect(onDragStart).toHaveBeenCalledTimes(1);
        expect(onDragStart).toHaveBeenCalledWith({
          type: 'dragstart',
          x: 50,
          y: 25
        });

        act(() => jest.runAllTimers());
        expect(document.activeElement).toBe(draggable);
        fireEvent.keyDown(dropzone, {key: 'Enter'});
        fireEvent.keyUp(dropzone, {key: 'Enter'});

        expect(onDrop).toHaveBeenCalledTimes(0);

        expect(onDragEnd).toHaveBeenCalledTimes(1);
        expect(onDragEnd).toHaveBeenCalledWith({
          type: 'dragend',
          x: 50,
          y: 25,
          dropOperation: 'cancel'
        });
      });
    });
  });
  describe('useClipboard', () => {
    let onDrop = jest.fn();
    it('should be able to paste items into the dropzone', async () => {

      let tree = render(
        <>
          <DropZone onDrop={onDrop}>
            <Text slot="label">
              Test
            </Text>
          </DropZone >
        </>
      );
      let button = tree.getByRole('button');

      let clipboardData = new DataTransfer();
      await user.tab();
      expect(document.activeElement).toBe(button);

      clipboardData.items.add('hello world', 'text/plain');

      let allowDefaultPaste = fireEvent(button, new ClipboardEvent('beforepaste', {clipboardData}));
      expect(allowDefaultPaste).toBe(false);

      fireEvent(button, new ClipboardEvent('paste', {clipboardData}));

      expect(onDrop).toHaveBeenCalledTimes(1);
      expect(onDrop).toHaveBeenCalledWith(
        {
          type: 'drop',
          x: 0,
          y: 0,
          dropOperation: 'copy',
          items: expect.any(Array)
        }
      );

      expect(await onDrop.mock.calls[0][0].items[0].getText('text/plain')).toBe('hello world');
    });

    it('should not allow paste into the dropzone if disabled', async () => {
      let {rerender, getByRole} = render(
        <>
          <DropZone isDisabled onDrop={onDrop}>
            <Text slot="label">
              Cannot paste here
            </Text>
          </DropZone>
        </>
      );

      let button = getByRole('button');
      await user.tab();
      expect(document.activeElement).not.toBe(button);

      rerender(
        <DropZone onDrop={onDrop}>
          <Text slot="label">
            Can paste here now
          </Text>
        </DropZone>
      );

      button = getByRole('button');

      let clipboardData = new DataTransfer();
      await user.tab();
      expect(document.activeElement).toBe(button);

      clipboardData.items.add('hello world', 'text/plain');

      let allowDefaultPaste = fireEvent(button, new ClipboardEvent('beforepaste', {clipboardData}));
      expect(allowDefaultPaste).toBe(false);

      fireEvent(button, new ClipboardEvent('paste', {clipboardData}));

      expect(onDrop).toHaveBeenCalledTimes(1);
      expect(onDrop).toHaveBeenCalledWith(
        {
          type: 'drop',
          x: 0,
          y: 0,
          dropOperation: 'copy',
          items: expect.any(Array)
        }
      );

      expect(await onDrop.mock.calls[0][0].items[0].getText('text/plain')).toBe('hello world');
    });
  });
});
