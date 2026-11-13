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

import {act, fireEvent, render} from '@react-spectrum/test-utils-internal';
import {Button} from '../src/Button';
import {createPortal} from 'react-dom';
// @ts-ignore
import {DataTransfer, DragEvent} from 'react-aria/test/dnd/mocks';
import {enableShadowDOM} from 'react-stately/private/flags/flags';
import {GridList, GridListItem} from '../src/GridList';
import React from 'react';
import {useDragAndDrop} from '../src/useDragAndDrop';

function ShadowText({text}: {text: string}) {
  let ref = (host: HTMLElement | null) => {
    if (host && !host.shadowRoot) {
      host.attachShadow({mode: 'open'}).textContent = text;
    }
  };
  return <span data-testid="shadow-host" ref={ref} />;
}

function ShadowPortal({children, ...props}: {children: React.ReactNode; 'data-testid'?: string}) {
  let [shadowHost] = React.useState(() => {
    let el = document.createElement('span');
    el.attachShadow({mode: 'open'});
    return el;
  });
  let ref = React.useCallback(
    (wrapper: HTMLSpanElement | null) => {
      if (wrapper && shadowHost.parentNode !== wrapper) {
        wrapper.appendChild(shadowHost);
      }
    },
    [shadowHost]
  );
  return (
    <span {...props} ref={ref}>
      {createPortal(children, shadowHost.shadowRoot!)}
    </span>
  );
}

function DraggableGridList({
  onDragStart,
  children
}: {
  onDragStart: () => void;
  children?: React.ReactNode;
}) {
  let {dragAndDropHooks} = useDragAndDrop({
    pointerDragSource: 'handle',
    getItems: keys => [...keys].map(key => ({'text/plain': String(key)})),
    onDragStart
  });
  return (
    <GridList aria-label="Test" selectionMode="multiple" dragAndDropHooks={dragAndDropHooks}>
      <GridListItem id="cat" textValue="Cat">
        {children ?? (
          <>
            <Button slot="drag">≡</Button>
            <ShadowText text="Cat" />
          </>
        )}
      </GridListItem>
    </GridList>
  );
}

// React 16 is not supported with shadow DOM.
const describeOrSkip = parseInt(React.version, 10) < 17 ? describe.skip : describe;

describeOrSkip('GridList shadow DOM', () => {
  beforeAll(() => {
    enableShadowDOM();
  });

  // Dragging selected text inside a shadow root dispatches dragstart with a Text node
  // as composedPath()[0], so getEventTarget(e) returns a Text node rather than an Element.
  it('should not throw when a text selection inside a shadow root is dragged', () => {
    let onDragStart = jest.fn();
    let errors: unknown[] = [];
    let onError = (e: ErrorEvent) => {
      errors.push(e.error);
      e.preventDefault();
    };
    window.addEventListener('error', onError);

    let {getByTestId} = render(<DraggableGridList onDragStart={onDragStart} />);
    let textNode = getByTestId('shadow-host').shadowRoot!.firstChild!;
    expect(textNode.nodeType).toBe(Node.TEXT_NODE);

    let dataTransfer = new DataTransfer();
    let event = new DragEvent('dragstart', {dataTransfer, clientX: 0, clientY: 0});
    fireEvent(textNode, event);

    window.removeEventListener('error', onError);
    expect(errors).toEqual([]);
    expect(onDragStart).not.toHaveBeenCalled();
  });

  it('should start dragging when the drag button is inside a shadow root', () => {
    jest.useFakeTimers();
    try {
      let onDragStart = jest.fn();
      let {getByRole, getByTestId} = render(
        <DraggableGridList onDragStart={onDragStart}>
          <ShadowPortal data-testid="shadow-drag">
            <Button slot="drag">≡</Button>
          </ShadowPortal>
          Cat
        </DraggableGridList>
      );
      let row = getByRole('row');
      let shadowRoot = getByTestId('shadow-drag').firstElementChild!.shadowRoot!;
      let dragButton = shadowRoot.querySelector('button')!;
      expect(dragButton).toHaveAttribute('draggable', 'true');

      let dataTransfer = new DataTransfer();
      fireEvent(dragButton, new DragEvent('dragstart', {dataTransfer, clientX: 0, clientY: 0}));
      act(() => jest.runAllTimers());
      expect(onDragStart).toHaveBeenCalledTimes(1);
      expect(row).toHaveAttribute('data-dragging', 'true');

      fireEvent(dragButton, new DragEvent('dragend', {dataTransfer, clientX: 0, clientY: 0}));
      act(() => jest.runAllTimers());
      expect(row).not.toHaveAttribute('data-dragging');
    } finally {
      jest.useRealTimers();
    }
  });

  it('should start dragging when dragstart originates inside a shadow root within the drag button', () => {
    jest.useFakeTimers();
    try {
      let onDragStart = jest.fn();
      let {getByRole, getByTestId} = render(
        <DraggableGridList onDragStart={onDragStart}>
          <Button slot="drag">
            <ShadowText text="≡" />
          </Button>
          Cat
        </DraggableGridList>
      );
      let row = getByRole('row');
      let iconNode = getByTestId('shadow-host').shadowRoot!.firstChild!;

      let dataTransfer = new DataTransfer();
      fireEvent(iconNode, new DragEvent('dragstart', {dataTransfer, clientX: 0, clientY: 0}));
      act(() => jest.runAllTimers());
      expect(onDragStart).toHaveBeenCalledTimes(1);
      expect(row).toHaveAttribute('data-dragging', 'true');

      fireEvent(iconNode, new DragEvent('dragend', {dataTransfer, clientX: 0, clientY: 0}));
      act(() => jest.runAllTimers());
      expect(row).not.toHaveAttribute('data-dragging');
    } finally {
      jest.useRealTimers();
    }
  });

  it('should ignore drags from a non-handle button inside a shadow root', () => {
    let onCollectionDragStart = jest.fn();
    let onButtonDragStart = jest.fn();
    let {getByRole, getByTestId} = render(
      <DraggableGridList onDragStart={onCollectionDragStart}>
        <Button slot="drag">≡</Button>
        <ShadowPortal data-testid="shadow-other">
          <Button draggable onDragStart={onButtonDragStart}>
            Action
          </Button>
        </ShadowPortal>
        Cat
      </DraggableGridList>
    );
    let row = getByRole('row');
    let shadowRoot = getByTestId('shadow-other').firstElementChild!.shadowRoot!;
    let otherButton = shadowRoot.querySelector('button')!;

    let dataTransfer = new DataTransfer();
    fireEvent(otherButton, new DragEvent('dragstart', {dataTransfer, clientX: 0, clientY: 0}));
    expect(onButtonDragStart).toHaveBeenCalledTimes(1);
    expect(onCollectionDragStart).not.toHaveBeenCalled();
    expect(row).not.toHaveAttribute('data-dragging');
  });
});
