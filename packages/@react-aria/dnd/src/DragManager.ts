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

import {announce} from '@react-aria/live-announcer';
import {ariaHideOutside} from '@react-aria/overlays';
import {DragEndEvent, DragItem, DropActivateEvent, DropEnterEvent, DropEvent, DropExitEvent, DropItem, DropMoveEvent, DropOperation} from './types';
import {getInteractionModality} from '@react-aria/interactions';
import {useCallback, useEffect, useState} from 'react';

const dropTargets = new Map<Element, DropTarget>();
let dragSession: DragSession = null;
let subscriptions = new Set<() => void>();

interface DropTarget {
  element: HTMLElement,
  getDropOperation?: (types: string[], allowedOperations: DropOperation[]) => DropOperation,
  onDropEnter?: (e: DropEnterEvent) => void,
  onDropExit?: (e: DropExitEvent) => void,
  onDropActivate?: (e: DropActivateEvent) => void,
  onDrop?: (e: DropEvent) => void,
  onKeyDown?: (e: KeyboardEvent) => void
}

export function registerDropTarget(target: DropTarget) {
  dropTargets.set(target.element, target);
  dragSession?.updateValidDropTargets();
  return () => {
    dropTargets.delete(target.element);
    dragSession?.updateValidDropTargets();
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
  requestAnimationFrame(() => {
    dragSession.setup();
  });

  if (getInteractionModality() === 'keyboard') {
    dragSession.next();
  }

  for (let cb of subscriptions) {
    cb();
  }
}

export function useIsDragging() {
  let [isDragging, setDragging] = useState(!!dragSession);

  useEffect(() => {
    let cb = () => setDragging(!!dragSession);
    subscriptions.add(cb);
    return () => {
      subscriptions.delete(cb);
    };
  }, []);

  return isDragging;
}

function endDragging() {
  dragSession = null;
  for (let cb of subscriptions) {
    cb();
  }
}

const CANCELED_EVENTS = [
  'pointerdown',
  'pointermove',
  'pointerenter',
  'pointerleave',
  'pointerover',
  'pointerout',
  'pointerup',
  'mousedown',
  'mousemove',
  'mouseenter',
  'mouseleave',
  'mouseover',
  'mouseout',
  'mouseup',
  'touchstart',
  'touchmove',
  'touchend',
  'keyup'
];

const CLICK_EVENTS = [
  'pointerup',
  'mouseup',
  'touchend'
];

const MESSAGES = {
  keyboard: {
    start: 'Started dragging. Press Tab to navigate to a drop target, then press Enter to drop, or press Escape to cancel.'
  },
  virtual: {
    start: 'Started dragging. Navigate to a drop target, then click or press Enter to drop.'
  }
};

class DragSession {
  dragTarget: DragTarget;
  validDropTargets: DropTarget[];
  currentDropTarget: DropTarget;
  dropOperation: DropOperation;
  mutationObserver: MutationObserver;
  restoreAriaHidden: () => void;

  constructor(target: DragTarget) {
    this.dragTarget = target;
    this.validDropTargets = findValidDropTargets(target);

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onClick = this.onClick.bind(this);
    this.cancelEvent = this.cancelEvent.bind(this);
  }

  setup() {
    document.addEventListener('keydown', this.onKeyDown, true);
    document.addEventListener('focus', this.onFocus, true);
    document.addEventListener('blur', this.onBlur, true);
    document.addEventListener('click', this.onClick, true);

    for (let event of CANCELED_EVENTS) {
      document.addEventListener(event, this.cancelEvent, true);
    }

    this.restoreAriaHidden = ariaHideOutside([
      this.dragTarget.element,
      ...this.validDropTargets.map(target => target.element)
    ]);

    this.mutationObserver = new MutationObserver(() => this.updateValidDropTargets());
    this.mutationObserver.observe(document.body, {subtree: true, attributes: true, attributeFilter: ['aria-hidden']});

    announce(MESSAGES[getInteractionModality()].start);
  }

  teardown() {
    document.removeEventListener('keydown', this.onKeyDown, true);
    document.removeEventListener('focus', this.onFocus, true);
    document.removeEventListener('blur', this.onBlur, true);
    document.removeEventListener('click', this.onClick, true);

    for (let event of CANCELED_EVENTS) {
      document.removeEventListener(event, this.cancelEvent, true);
    }

    this.mutationObserver.disconnect();
    this.restoreAriaHidden();
  }

  onKeyDown(e: KeyboardEvent) {
    this.cancelEvent(e);

    if (e.key === 'Escape') {
      this.cancel();
      return;
    }

    if (e.key === 'Enter') {
      if (e.altKey) {
        this.activate();
      } else {
        this.drop();
      }
      return;
    }

    if (e.key === 'Tab' && !(e.metaKey || e.altKey || e.ctrlKey)) {
      if (e.shiftKey) {
        this.previous();
      } else {
        this.next();
      }
    }

    if (typeof this.currentDropTarget?.onKeyDown === 'function') {
      this.currentDropTarget.onKeyDown(e);
    }
  }

  onFocus(e: FocusEvent) {
    this.cancelEvent(e);

    if (e.target === this.dragTarget.element) {
      return;
    }

    let dropTarget = this.validDropTargets.find(target => target.element.contains(e.target as HTMLElement));
    if (!dropTarget) {
      this.currentDropTarget?.element.focus();
      return;
    }

    this.setCurrentDropTarget(dropTarget);
  }

  onBlur(e: FocusEvent) {
    this.cancelEvent(e);

    if (!e.relatedTarget) {
      this.currentDropTarget?.element.focus();
    }
  }

  onClick(e: MouseEvent) {
    this.cancelEvent(e);
    console.log(e);

    if (e.detail !== 0) {
      return;
    }

    if (e.target === this.dragTarget.element) {
      this.cancel();
      return;
    }

    let dropTarget = this.validDropTargets.find(target => target.element.contains(e.target as HTMLElement));
    console.log(dropTarget);
    if (dropTarget) {
      this.setCurrentDropTarget(dropTarget);
      this.drop();
    }
  }

  cancelEvent(e: Event) {
    // Allow default for events that might cancel a click event
    if (!CLICK_EVENTS.includes(e.type)) {
      e.preventDefault();
    }

    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  updateValidDropTargets() {
    this.mutationObserver.disconnect();
    if (this.restoreAriaHidden) {
      this.restoreAriaHidden();
    }

    this.validDropTargets = findValidDropTargets(this.dragTarget);
    if (this.currentDropTarget && !this.validDropTargets.includes(this.currentDropTarget)) {
      this.setCurrentDropTarget(this.validDropTargets[0]);
    }

    this.restoreAriaHidden = ariaHideOutside([
      this.dragTarget.element,
      ...this.validDropTargets.map(target => target.element)
    ]);

    this.mutationObserver.observe(document.body, {subtree: true, attributes: true, attributeFilter: ['aria-hidden']});
  }

  next() {
    if (!this.currentDropTarget) {
      this.setCurrentDropTarget(this.validDropTargets[0]);
      return;
    }

    let index = this.validDropTargets.indexOf(this.currentDropTarget);
    if (index < 0) {
      this.setCurrentDropTarget(this.validDropTargets[0]);
      return;
    }

    // If we've reached the end of the valid drop targets, cycle back to the original drag target.
    // This lets the user cancel the drag in case they don't have an Escape key (e.g. iPad keyboard case).
    if (index === this.validDropTargets.length - 1) {
      if (!this.dragTarget.element.closest('[aria-hidden="true"]')) {
        this.setCurrentDropTarget(null);
        this.dragTarget.element.focus();
      } else {
        this.setCurrentDropTarget(this.validDropTargets[0]);
      }
    } else {
      this.setCurrentDropTarget(this.validDropTargets[index + 1]);
    }
  }

  previous() {
    if (!this.currentDropTarget) {
      this.setCurrentDropTarget(this.validDropTargets[this.validDropTargets.length - 1]);
      return;
    }

    let index = this.validDropTargets.indexOf(this.currentDropTarget);
    if (index < 0) {
      this.setCurrentDropTarget(this.validDropTargets[this.validDropTargets.length - 1]);
      return;
    }

    // If we've reached the start of the valid drop targets, cycle back to the original drag target.
    // This lets the user cancel the drag in case they don't have an Escape key (e.g. iPad keyboard case).
    if (index === 0) {
      if (!this.dragTarget.element.closest('[aria-hidden="true"]')) {
        this.setCurrentDropTarget(null);
        this.dragTarget.element.focus();
      } else {
        this.setCurrentDropTarget(this.validDropTargets[this.validDropTargets.length - 1]);
      }
    } else {
      this.setCurrentDropTarget(this.validDropTargets[index - 1]);
    }
  }

  setCurrentDropTarget(dropTarget: DropTarget) {
    if (dropTarget === this.currentDropTarget) {
      return;
    }

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
    endDragging();
  }

  cancel() {
    this.end();
    if (!this.dragTarget.element.closest('[aria-hidden="true"]')) {
      this.dragTarget.element.focus();
    }

    announce('Drop canceled.');
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
    announce('Drop complete.');
  }

  activate() {
    if (this.currentDropTarget && typeof this.currentDropTarget.onDropActivate === 'function') {
      let rect = this.currentDropTarget.element.getBoundingClientRect();
      this.currentDropTarget.onDropActivate({
        type: 'dropactivate',
        x: rect.left + (rect.width / 2),
        y: rect.top + (rect.height / 2)
      });
    }
  }
}

function findValidDropTargets(options: DragTarget) {
  let types = options.items.map(item => item.type);
  return [...dropTargets.values()].filter(target => {
    if (target.element.closest('[aria-hidden="true"]')) {
      return false;
    }

    if (typeof target.getDropOperation === 'function') {
      return target.getDropOperation(types, options.allowedDropOperations) !== 'cancel';
    }

    return true;
  });
}
