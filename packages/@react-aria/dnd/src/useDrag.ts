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

import {AriaButtonProps} from '@react-types/button';
import {DragEndEvent, DragItem, DragMoveEvent, DragStartEvent, DropOperation, PressEvent} from '@react-types/shared';
import {DragEvent, HTMLAttributes, useRef, useState} from 'react';
import * as DragManager from './DragManager';
import {DROP_EFFECT_TO_DROP_OPERATION, DROP_OPERATION, EFFECT_ALLOWED} from './constants';
// @ts-ignore
import intlMessages from '../intl/*.json';
import ReactDOM from 'react-dom';
import {useDescription} from '@react-aria/utils';
import {useDragModality} from './utils';
import {useMessageFormatter} from '@react-aria/i18n';
import {writeToDataTransfer} from './utils';

interface DragOptions {
  onDragStart?: (e: DragStartEvent) => void,
  onDragMove?: (e: DragMoveEvent) => void,
  onDragEnd?: (e: DragEndEvent) => void,
  getItems: () => DragItem[],
  renderPreview?: (items: DragItem[]) => JSX.Element,
  getAllowedDropOperations?: () => DropOperation[]
}

interface DragResult {
  dragProps: HTMLAttributes<HTMLElement>,
  dragButtonProps: AriaButtonProps,
  isDragging: boolean
}

const MESSAGES = {
  keyboard: {
    start: 'dragDescriptionKeyboard',
    end: 'endDragKeyboard'
  },
  touch: {
    start: 'dragDescriptionTouch',
    end: 'endDragTouch'
  },
  virtual: {
    start: 'dragDescriptionVirtual',
    end: 'endDragVirtual'
  }
};

export function useDrag(options: DragOptions): DragResult {
  let formatMessage = useMessageFormatter(intlMessages);
  let state = useRef({
    options,
    x: 0,
    y: 0
  }).current;
  state.options = options;
  let [isDragging, setDragging] = useState(false);

  let onDragStart = (e: DragEvent) => {
    let items = options.getItems();
    writeToDataTransfer(e.dataTransfer, items);

    if (typeof options.getAllowedDropOperations === 'function') {
      let allowedOperations = options.getAllowedDropOperations();
      let allowed = DROP_OPERATION.none;
      for (let operation of allowedOperations) {
        allowed |= DROP_OPERATION[operation] || DROP_OPERATION.none;
      }

      e.dataTransfer.effectAllowed = EFFECT_ALLOWED[allowed] || 'none';
    }

    // If there is a renderPreview function, use it to render a custom preview image that will
    // appear under the pointer while dragging. If not, the element itself is dragged by the browser.
    if (typeof options.renderPreview === 'function') {
      let preview = options.renderPreview(items);
      if (preview) {
        // Create an off-screen div to render the preview into.
        let node = document.createElement('div');
        node.style.zIndex = '-100';
        node.style.position = 'absolute';
        node.style.top = '0';
        node.style.left = '-100000px';
        document.body.appendChild(node);

        // Call renderPreview to get a JSX element, and render it into the div with React DOM.
        ReactDOM.render(preview, node);

        // Compute the offset that the preview will appear under the mouse.
        // If possible, this is based on the point the user clicked on the target.
        // If the preview is much smaller, then just use the center point of the preview.
        let size = node.getBoundingClientRect();
        let rect = e.currentTarget.getBoundingClientRect();
        let x = e.clientX - rect.x;
        let y = e.clientY - rect.y;
        if (x > size.width || y > size.height) {
          x = size.width / 2;
          y = size.height / 2;
        }

        e.dataTransfer.setDragImage(node, x, y);

        // Remove the preview from the DOM after a frame so the browser has time to paint.
        requestAnimationFrame(() => {
          document.body.removeChild(node);
        });
      }
    }

    if (typeof options.onDragStart === 'function') {
      options.onDragStart({
        type: 'dragstart',
        x: e.clientX,
        y: e.clientY
      });
    }

    state.x = e.clientX;
    state.y = e.clientY;

    // Wait a frame before we set dragging to true so that the browser has time to
    // render the preview image before we update the element that has been dragged.
    requestAnimationFrame(() => {
      setDragging(true);
    });
  };

  let onDrag = (e: DragEvent) => {
    if (e.clientX === state.x && e.clientY === state.y) {
      return;
    }

    if (typeof options.onDragMove === 'function') {
      options.onDragMove({
        type: 'dragmove',
        x: e.clientX,
        y: e.clientY
      });
    }

    state.x = e.clientX;
    state.y = e.clientY;
  };

  let onDragEnd = (e: DragEvent) => {
    if (typeof options.onDragEnd === 'function') {
      options.onDragEnd({
        type: 'dragend',
        x: e.clientX,
        y: e.clientY,
        dropOperation: DROP_EFFECT_TO_DROP_OPERATION[e.dataTransfer.dropEffect]
      });
    }

    setDragging(false);
  };

  let onPress = (e: PressEvent) => {
    if (e.pointerType !== 'keyboard' && e.pointerType !== 'virtual') {
      return;
    }

    if (typeof state.options.onDragStart === 'function') {
      let rect = (e.target as HTMLElement).getBoundingClientRect();
      state.options.onDragStart({
        type: 'dragstart',
        x: rect.x + (rect.width / 2),
        y: rect.y + (rect.height / 2)
      });
    }

    DragManager.beginDragging({
      element: e.target as HTMLElement,
      items: state.options.getItems(),
      allowedDropOperations: typeof state.options.getAllowedDropOperations === 'function'
        ? state.options.getAllowedDropOperations()
        : ['move', 'copy', 'link'],
      onDragEnd(e) {
        setDragging(false);
        if (typeof state.options.onDragEnd === 'function') {
          state.options.onDragEnd(e);
        }
      }
    }, formatMessage);

    setDragging(true);
  };

  let modality = useDragModality();
  let descriptionProps = useDescription(
    formatMessage(!isDragging ? MESSAGES[modality].start : MESSAGES[modality].end)
  );

  return {
    dragProps: {
      draggable: 'true',
      onDragStart,
      onDrag,
      onDragEnd
    },
    dragButtonProps: {
      ...descriptionProps,
      onPress
    },
    isDragging
  };
}
