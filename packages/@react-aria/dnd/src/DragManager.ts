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

import {DragEndEvent, DragItem, DropActivateEvent, DropEnterEvent, DropEvent, DropExitEvent, DropItem, DropMoveEvent, DropOperation} from './types';

const dropTargets = new Set<DropTarget>();
let dragSession: DragSession = null;

interface DropTarget {
  element: HTMLElement,
  getDropOperation?: (types: string[], allowedOperations: DropOperation[]) => DropOperation,
  onDropEnter?: (e: DropEnterEvent) => void,
  onDropExit?: (e: DropExitEvent) => void,
  onDrop?: (e: DropEvent) => void
}

export function registerDropTarget(target: DropTarget) {
  dropTargets.add(target);
  return () => {
    dropTargets.delete(target);
  };
}

interface DragTarget {
  element: HTMLElement,
  items: DragItem[],
  allowedDropOperations: DropOperation[],
  onDragEnd?: (e: DragEndEvent) => void
}

export function beginDragging(options: DragTarget) {
  if (dragSession) {
    throw new Error('Cannot begin dragging while already dragging');
  }

  dragSession = new DragSession(options);
  dragSession.next();
}

export function cancelDrag() {
  if (!dragSession) {
    throw new Error('Not currently dragging');
  }

  dragSession.cancel();
  dragSession = null;
}

export function drop() {
  dragSession.drop();
  dragSession = null;
}

class DragSession {
  dragTarget: DragTarget;
  validDropTargets: DropTarget[];
  currentDropTarget: DropTarget;
  dropOperation: DropOperation;

  constructor(target: DragTarget) {
    this.dragTarget = target;
    this.validDropTargets = findValidDropTargets(target);

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);

    this.setup();
  }

  setup() {
    document.addEventListener('keydown', this.onKeyDown, true);
    document.addEventListener('focus', this.onFocus, true);
    document.addEventListener('blur', this.onBlur, true);
  }

  teardown() {
    document.removeEventListener('keydown', this.onKeyDown, true);
    document.removeEventListener('focus', this.onFocus, true);
    document.removeEventListener('blur', this.onBlur, true);
  }

  onKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (e.key === 'Escape') {
      this.cancel();
      return;
    }

    if (e.key === 'Enter') {
      this.drop();
      return;
    }

    if (e.key !== 'Tab' || e.metaKey || e.altKey || e.ctrlKey) {
      return;
    }

    if (e.shiftKey) {
      this.previous();
    } else {
      this.next();
    }
  }

  onFocus(e: FocusEvent) {
    let dropTarget = this.validDropTargets.find(target => target.element === e.target);
    if (!dropTarget) {
      this.currentDropTarget?.element.focus();
      return;
    }

    this.setCurrentDropTarget(dropTarget);
  }

  onBlur(e: FocusEvent) {
    if (!e.relatedTarget) {
      this.currentDropTarget?.element.focus();
    }
  }

  next() {
    if (!this.currentDropTarget) {
      this.setCurrentDropTarget(this.validDropTargets[0]);
      return;
    }

    let index = this.validDropTargets.indexOf(this.currentDropTarget);
    if (index < 0) {
      this.setCurrentDropTarget(null);
      return;
    }

    if (index === this.validDropTargets.length - 1) {
      index = 0;
    } else {
      index++;
    }

    this.setCurrentDropTarget(this.validDropTargets[index]);
  }

  previous() {
    if (!this.currentDropTarget) {
      this.setCurrentDropTarget(this.validDropTargets[this.validDropTargets.length - 1]);
      return;
    }

    let index = this.validDropTargets.indexOf(this.currentDropTarget);
    if (index < 0) {
      this.setCurrentDropTarget(null);
      return;
    }

    if (index === 0) {
      index = this.validDropTargets.length - 1;
    } else {
      index--;
    }

    this.setCurrentDropTarget(this.validDropTargets[index]);
  }

  setCurrentDropTarget(dropTarget: DropTarget) {
    if (this.currentDropTarget && typeof this.currentDropTarget.onDropExit === 'function') {
      let rect = this.currentDropTarget.element.getBoundingClientRect();
      this.currentDropTarget.onDropExit({
        type: 'dropexit',
        x: rect.left + (rect.width / 2),
        y: rect.top + (rect.height / 2)
      });
    }

    if (dropTarget) {
      if (typeof dropTarget.onDropEnter === 'function') {
        let rect = dropTarget.element.getBoundingClientRect();
        dropTarget.onDropEnter({
          type: 'dropenter',
          x: rect.left + (rect.width / 2),
          y: rect.top + (rect.height / 2)
        });
      }

      dropTarget.element.focus();
    }

    this.currentDropTarget = dropTarget;
  }

  end() {
    this.teardown();

    if (typeof this.dragTarget.onDragEnd === 'function') {
      let target = this.currentDropTarget && this.dropOperation !== 'cancel' ? this.currentDropTarget : this.dragTarget;
      let rect = target.element.getBoundingClientRect();
      this.dragTarget.onDragEnd({
        type: 'dragend',
        x: rect.x + (rect.width / 2),
        y: rect.y + (rect.height / 2),
        dropOperation: this.dropOperation
      });
    }

    this.setCurrentDropTarget(null);
    dragSession = null;
  }

  cancel() {
    this.end();
    this.dragTarget.element.focus();
  }

  drop() {
    if (!this.currentDropTarget) {
      this.cancel();
      return;
    }

    if (typeof this.currentDropTarget.getDropOperation === 'function') {
      let types = this.dragTarget.items.map(item => item.type);
      this.dropOperation = this.currentDropTarget.getDropOperation(types, this.dragTarget.allowedDropOperations);
    } else {
      // TODO: show menu ??
      this.dropOperation = this.dragTarget.allowedDropOperations[0];
    }

    if (typeof this.currentDropTarget.onDrop === 'function') {
      let items = this.dragTarget.items.map(item => ({
        type: item.type,
        getData: () => Promise.resolve(item.data)
      }));

      let rect = this.currentDropTarget.element.getBoundingClientRect();
      this.currentDropTarget.onDrop({
        type: 'drop',
        x: rect.left + (rect.width / 2),
        y: rect.top + (rect.height / 2),
        items,
        dropOperation: this.dragTarget.allowedDropOperations[0] // TODO
      });
    }

    this.end();
  }
}

function findValidDropTargets(options: DragTarget) {
  let types = options.items.map(item => item.type);
  return [...dropTargets].filter(target => {
    if (target.element.closest('[aria-hidden="true"]')) {
      return false;
    }

    if (typeof target.getDropOperation === 'function') {
      return target.getDropOperation(types, options.allowedDropOperations) !== 'cancel';
    }

    return true;
  });
}
