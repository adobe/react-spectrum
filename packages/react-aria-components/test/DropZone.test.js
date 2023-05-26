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

import {act, fireEvent, render} from '@react-spectrum/test-utils';
import {Button, DropZone, DropZoneContext, Input, Link, Text} from '../';
import {ClipboardEvent, DataTransfer, DataTransferItem, DragEvent} from '@react-aria/dnd/test/mocks';
import {Draggable} from '@react-aria/dnd/test/examples';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('DropZone', () => {
  it('should render a dropzone', () => {
    let {getByTestId} = render(
      <DropZone data-testid="foo">
        <Text slot="heading">
          Test
        </Text>
      </DropZone>
    );
    let dropzone = getByTestId('foo');
    expect(dropzone).toHaveAttribute('class', 'react-aria-DropZone');
  });

  it('should render a button with custom class', () => {
    let {getByTestId} = render(
      <DropZone data-testid="foo" className="test">
        <Text slot="heading">
          Test
        </Text>
      </DropZone>);
    let dropzone = getByTestId('foo');
    expect(dropzone).toHaveAttribute('class', 'test');
  });

  it('should support DOM props', () => {
    let {getByTestId} = render(
      <DropZone data-testid="foo" data-foo="bar">
        <Text slot="heading">
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

  it('should support hover', () => {
    let {getByText} = render(<DropZone className={({isHovered}) => isHovered ? 'hover' : ''}>Test</DropZone>);
    let dropzone = getByText('Test');

    expect(dropzone).not.toHaveAttribute('data-hovered');
    expect(dropzone).not.toHaveClass('hover');

    userEvent.hover(dropzone);
    expect(dropzone).toHaveAttribute('data-hovered', 'true');
    expect(dropzone).toHaveClass('hover');

    userEvent.unhover(dropzone);
    expect(dropzone).not.toHaveAttribute('data-hovered');
    expect(dropzone).not.toHaveClass('hover');
  });

  it('should support focus ring with no file input', () => {
    let {getByTestId, getByRole} = render(
      <DropZone data-testid="foo" className={({isFocusVisible}) => isFocusVisible ? 'focus' : ''}>
        <Text slot="heading">
          Test
        </Text>
      </DropZone>);
    let dropzone = getByTestId('foo');
    let button = getByRole('button');
    
    expect(dropzone).not.toHaveAttribute('data-focus-visible');
    expect(dropzone).not.toHaveClass('focus');

    userEvent.tab();
    expect(document.activeElement).toBe(button);
    expect(dropzone).toHaveAttribute('data-focus-visible', 'true');
    expect(dropzone).toHaveClass('focus');

    userEvent.tab();
    expect(dropzone).not.toHaveAttribute('data-focus-visible');
    expect(dropzone).not.toHaveClass('focus');
  });

  it('should apply correct aria-labelledby with no input, button, or link', () => {
    let {getByRole, getByText} = render(
      <DropZone className="test">
        <Text slot="heading">
          Test
        </Text>
      </DropZone>);
    let text = getByText('Test');
    let button = getByRole('button');
    expect(button).toHaveAttribute('aria-labelledby', `${text.id}`);
  });

  it('should have correct aria-label with input', () => {
    let {getByRole} = render(
      <DropZone>
        <Input />
        <Text slot="heading">
          Test
        </Text>
      </DropZone>);
    let button = getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Open file system');
  });

  it('should not have a visible input', () => {
    let {getByTestId} = render(
      <DropZone>
        <Input data-testid="foo" />
        <Text slot="heading">
          Test
        </Text>
      </DropZone>);
    let input = getByTestId('foo');
    expect(input).not.toBeVisible();
    expect(input).toHaveStyle('display: none');
  });

  it('should support render props', () => {
    let {getByTestId} = render(
      <DropZone data-testid="foo">
        {({isFocused}) => isFocused ? 'Focused' : 'Not Focused'}
      </DropZone>
    );
    let dropzone = getByTestId('foo');
    
    expect(dropzone).toHaveTextContent('Not Focused');
    
    userEvent.tab();
    expect(dropzone).toHaveTextContent('Focused');
  });

  it('should support focus ring around visible button', () => {
    let {getByTestId, getByRole} = render(
      <DropZone data-testid="foo">
        <Button slot="file">Upload</Button>
        <Input />
      </DropZone>);

    let dropzone = getByTestId('foo');
    let button = getByRole('button');
    expect(button).toHaveAttribute('class', 'react-aria-Button');
    expect(dropzone).not.toHaveAttribute('data-focus-visible');

    userEvent.tab();
    expect(document.activeElement).toBe(button);
    expect(dropzone).toHaveAttribute('data-focus-visible');
    expect(button).toHaveAttribute('data-focus-visible', 'true');

    userEvent.tab();
    expect(button).not.toHaveAttribute('data-focus-visible');
  });

  it('should support focus ring around visible link', () => {
    let {getByTestId, getByRole} = render(
      <DropZone data-testid="foo">
        <Link slot="file">Upload</Link>
        <Input />
      </DropZone>);

    let dropzone = getByTestId('foo');
    let link = getByRole('link');
    expect(link).toHaveAttribute('class', 'react-aria-Link');
    expect(dropzone).not.toHaveAttribute('data-focus-visible');

    userEvent.tab();
    expect(document.activeElement).toBe(link);
    expect(dropzone).toHaveAttribute('data-focus-visible');
    expect(link).toHaveAttribute('data-focus-visible', 'true');

    userEvent.tab();
    expect(link).not.toHaveAttribute('data-focus-visible');
  });  

  it('should support press state', () => {
    let onPress = jest.fn();
    let {getByTestId} = render(
      <DropZone onPress={onPress} data-testid="foo">
        <Text slot="heading">
          Test
        </Text>
      </DropZone>);
    let dropzone = getByTestId('foo');
    expect(dropzone).not.toHaveAttribute('data-pressed');

    fireEvent.mouseDown(dropzone);
    expect(dropzone).toHaveAttribute('data-pressed', 'true');

    fireEvent.mouseUp(dropzone);
    expect(dropzone).not.toHaveAttribute('data-pressed');

    expect(onPress).toHaveBeenCalledTimes(1);
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
              <Text slot="heading">
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
              <Text slot="heading">
                Test
              </Text>
            </DropZone>
          </>
        );

        let dropzone = tree.getByTestId('foo');
        let draggable = tree.getByText('Drag me');
        
        expect(dropzone).toHaveClass('react-aria-DropZone');       
        expect(draggable).toHaveAttribute('draggable', 'true');

        userEvent.tab();
        fireEvent.keyDown(draggable, {key: 'Enter'});
        fireEvent.keyUp(draggable, {key: 'Enter'});

        expect(onDragStart).toHaveBeenCalledTimes(1);
        expect(onDragStart).toHaveBeenCalledWith({
          type: 'dragstart',
          x: 50,
          y: 25
        });

        act(() => jest.runAllTimers());
        expect(document.activeElement).toBe(dropzone);
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
    });
  });

  describe('useClipboard', () => {
    it('should be able to paste items into the dropzone', async () => {
      let onDrop = jest.fn();

      let tree = render(
        <>
          <DropZone onDrop={onDrop}>
            <Text slot="heading">
              Test
            </Text>
          </DropZone >
        </>
      );
      let button = tree.getByRole('button');
  
      let clipboardData = new DataTransfer();
      userEvent.tab();
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

  it('should upload a file with input', () => {
    let file = new File(['hello'], 'hello.png', {type: 'image/png'});
    let {getByRole} = render(
      <DropZone>
        <Input />
        <Text slot="heading">
          Test
        </Text>
      </DropZone>
    );
    let button = getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Open file system');
    
    userEvent.upload(button, file);
    expect(button.files[0]).toStrictEqual(file);
    expect(button.files.item(0)).toStrictEqual(file);
    expect(button.files).toHaveLength(1);
  });
});
