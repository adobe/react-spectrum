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
import {DragEndEvent, DragItem, DropActivateEvent, DropEnterEvent, DropEvent, DropExitEvent, DropOperation, DropTarget as DroppableCollectionTarget} from '@react-types/shared';
import {getInteractionModality} from '@react-aria/interactions';
import {useEffect, useState} from 'react';

let dropTargets = new Map<Element, DropTarget>();
let dropItems = new Map<Element, DroppableItem>();
let dragSession: DragSession = null;
let subscriptions = new Set<() => void>();

interface DropTarget {
  element: HTMLElement,
  getDropOperation?: (types: string[], allowedOperations: DropOperation[]) => DropOperation,
  onDropEnter?: (e: DropEnterEvent, dragTarget: DragTarget, target?: DroppableCollectionTarget) => void,
  onDropExit?: (e: DropExitEvent, target?: DroppableCollectionTarget) => void,
  onDropActivate?: (e: DropActivateEvent, target?: DroppableCollectionTarget) => void,
  onDrop?: (e: DropEvent, target?: DroppableCollectionTarget) => void,
  onKeyDown?: (e: KeyboardEvent, dragTarget: DragTarget) => void
}

export function registerDropTarget(target: DropTarget) {
  dropTargets.set(target.element, target);
  dragSession?.updateValidDropTargets();
  return () => {
    dropTargets.delete(target.element);
    dragSession?.updateValidDropTargets();
  };
}

interface DroppableItem {
  element: HTMLElement,
  target: DroppableCollectionTarget,
  getDropOperation?: (types: string[], allowedOperations: DropOperation[]) => DropOperation
}

export function registerDropItem(item: DroppableItem) {
  dropItems.set(item.element, item);
  return () => {
    dropItems.delete(item.element);
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

    if (getInteractionModality() === 'keyboard') {
      dragSession.next();
    }
  });

  for (let cb of subscriptions) {
    cb();
  }
}

export function useDragSession() {
  let [session, setSession] = useState(dragSession);

  useEffect(() => {
    let cb = () => setSession(dragSession);
    subscriptions.add(cb);
    return () => {
      subscriptions.delete(cb);
    };
  }, []);

  return session;
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
  currentDropItem: DroppableItem;
  dropOperation: DropOperation;
  mutationObserver: MutationObserver;
  restoreAriaHidden: () => void;

  constructor(target: DragTarget) {
    this.dragTarget = target;

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onClick = this.onClick.bind(this);
    this.cancelEvent = this.cancelEvent.bind(this);
  }

  setup() {
    document.addEventListener('keydown', this.onKeyDown, true);
    window.addEventListener('focus', this.onFocus, true);
    window.addEventListener('blur', this.onBlur, true);
    document.addEventListener('click', this.onClick, true);

    for (let event of CANCELED_EVENTS) {
      document.addEventListener(event, this.cancelEvent, true);
    }

    this.mutationObserver = new MutationObserver(() => this.updateValidDropTargets());
    this.updateValidDropTargets();

    announce(MESSAGES[getInteractionModality()].start);
  }

  teardown() {
    document.removeEventListener('keydown', this.onKeyDown, true);
    window.removeEventListener('focus', this.onFocus, true);
    window.removeEventListener('blur', this.onBlur, true);
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
      this.currentDropTarget.onKeyDown(e, this.dragTarget);
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

    let item = dropItems.get(e.target as HTMLElement);
    this.setCurrentDropTarget(dropTarget, item);
  }

  onBlur(e: FocusEvent) {
    this.cancelEvent(e);

    if (!e.relatedTarget) {
      this.currentDropTarget?.element.focus();
    }
  }

  onClick(e: MouseEvent) {
    this.cancelEvent(e);

    if (e.detail !== 0) {
      return;
    }

    if (e.target === this.dragTarget.element) {
      this.cancel();
      return;
    }

    let dropTarget = this.validDropTargets.find(target => target.element.contains(e.target as HTMLElement));
    if (dropTarget) {
      let item = dropItems.get(e.target as HTMLElement);
      this.setCurrentDropTarget(dropTarget, item);
      this.drop(item);
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
    if (!this.mutationObserver) {
      return;
    }

    this.mutationObserver.disconnect();
    if (this.restoreAriaHidden) {
      this.restoreAriaHidden();
    }

    this.validDropTargets = findValidDropTargets(this.dragTarget);
    if (this.currentDropTarget && !this.validDropTargets.includes(this.currentDropTarget)) {
      this.setCurrentDropTarget(this.validDropTargets[0]);
    }

    // Find valid drop items within collections
    let types = this.dragTarget.items.map(item => item.type);
    let validDropItems = [...dropItems.values()].filter(item => {
      if (typeof item.getDropOperation === 'function') {
        return item.getDropOperation(types, this.dragTarget.allowedDropOperations) !== 'cancel';
      }

      return true;
    });

    // Filter out drop targets that contain valid items. We don't want to stop hiding elements
    // other than the drop items that exist inside the collection.
    let visibleDropTargets = this.validDropTargets.filter(target =>
      !validDropItems.some(item => target.element.contains(item.element))
    );

    this.restoreAriaHidden = ariaHideOutside([
      this.dragTarget.element,
      ...validDropItems.map(item => item.element),
      ...visibleDropTargets.map(target => target.element)
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

  setCurrentDropTarget(dropTarget: DropTarget, item?: DroppableItem) {
    if (dropTarget === this.currentDropTarget && item === this.currentDropItem) {
      return;
    }

    if (this.currentDropTarget && typeof this.currentDropTarget.onDropExit === 'function') {
      let rect = this.currentDropTarget.element.getBoundingClientRect();
      this.currentDropTarget.onDropExit({
        type: 'dropexit',
        x: rect.left + (rect.width / 2),
        y: rect.top + (rect.height / 2)
      }, this.currentDropItem?.target);
    }

    if (dropTarget) {
      if (typeof dropTarget.onDropEnter === 'function') {
        let rect = dropTarget.element.getBoundingClientRect();
        dropTarget.onDropEnter({
          type: 'dropenter',
          x: rect.left + (rect.width / 2),
          y: rect.top + (rect.height / 2)
        }, this.dragTarget, item?.target);
      }

      if (dropTarget !== this.currentDropTarget) {
        dropTarget.element.focus();
      }
    }

    this.currentDropTarget = dropTarget;
    this.currentDropItem = item;
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

  drop(item?: DroppableItem) {
    if (!this.currentDropTarget) {
      this.cancel();
      return;
    }

    if (typeof item?.getDropOperation === 'function') {
      let types = this.dragTarget.items.map(item => item.type);
      this.dropOperation = item.getDropOperation(types, this.dragTarget.allowedDropOperations);
    } else if (typeof this.currentDropTarget.getDropOperation === 'function') {
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
        dropOperation: this.dropOperation
      }, item?.target);
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
