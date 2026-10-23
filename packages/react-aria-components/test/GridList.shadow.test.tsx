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

import {Button} from '../src/Button';
// @ts-ignore
import {DataTransfer, DragEvent} from 'react-aria/test/dnd/mocks';
import {enableShadowDOM} from 'react-stately/private/flags/flags';
import {fireEvent, render} from '@react-spectrum/test-utils-internal';
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

function DraggableGridList({onDragStart}: {onDragStart: () => void}) {
  let {dragAndDropHooks} = useDragAndDrop({
    pointerDragSource: 'handle',
    getItems: keys => [...keys].map(key => ({'text/plain': String(key)})),
    onDragStart
  });
  return (
    <GridList aria-label="Test" selectionMode="multiple" dragAndDropHooks={dragAndDropHooks}>
      <GridListItem id="cat" textValue="Cat">
        <Button slot="drag">≡</Button>
        <ShadowText text="Cat" />
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
});
