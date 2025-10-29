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
import {DragEndEvent, DragItem, DropActivateEvent, DropEnterEvent, DropEvent, DropExitEvent, DropItem, DropOperation, DropTarget as DroppableCollectionTarget, FocusableElement} from '@react-types/shared';
import {getDragModality, getTypes} from './utils';
import {isVirtualClick, isVirtualPointerEvent} from '@react-aria/utils';
import type {LocalizedStringFormatter} from '@internationalized/string';
import {RefObject, useEffect, useState} from 'react';

let dropTargets = new Map<Element, DropTarget>();
let dropItems = new Map<Element, DroppableItem>();
let dragSession: DragSession | null = null;
let subscriptions = new Set<() => void>();

interface DropTarget {
  element: FocusableElement,
  preventFocusOnDrop?: boolean,
  getDropOperation?: (types: Set<string>, allowedOperations: DropOperation[]) => DropOperation,
  onDropEnter?: (e: DropEnterEvent, dragTarget: DragTarget) => void,
  onDropExit?: (e: DropExitEvent) => void,
  onDropTargetEnter?: (target: DroppableCollectionTarget | null) => void,
  onDropActivate?: (e: DropActivateEvent, target: DroppableCollectionTarget | null) => void,
  onDrop?: (e: DropEvent, target: DroppableCollectionTarget | null) => void,
  onKeyDown?: (e: KeyboardEvent, dragTarget: DragTarget) => void,
  activateButtonRef?: RefObject<FocusableElement | null>
}

export function registerDropTarget(target: DropTarget) {
  dropTargets.set(target.element, target);
  dragSession?.updateValidDropTargets();
  return (): void => {
    dropTargets.delete(target.element);
    dragSession?.updateValidDropTargets();
  };
}

interface DroppableItem {
  element: FocusableElement,
  target: DroppableCollectionTarget,
  getDropOperation?: (types: Set<string>, allowedOperations: DropOperation[]) => DropOperation,
  activateButtonRef?: RefObject<FocusableElement | null>
}

export function registerDropItem(item: DroppableItem) {
  dropItems.set(item.element, item);
  return (): void => {
    dropItems.delete(item.element);
  };
}

interface DragTarget {
  element: FocusableElement,
  items: DragItem[],
  allowedDropOperations: DropOperation[],
  onDragEnd?: (e: DragEndEvent) => void
}

export function beginDragging(target: DragTarget, stringFormatter: LocalizedStringFormatter): void {
  if (dragSession) {
    throw new Error('Cannot begin dragging while already dragging');
  }

  dragSession = new DragSession(target, stringFormatter);
  requestAnimationFrame(() => {
    if (dragSession) {
      dragSession.setup();
      if (getDragModality() === 'keyboard') {
        dragSession.next();
      }
    }
  });

  for (let cb of subscriptions) {
    cb();
  }
}

export function useDragSession(): DragSession | null {
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

/** @private */
export function isVirtualDragging(): boolean {
  return !!dragSession;
}

function endDragging() {
  dragSession = null;
  for (let cb of subscriptions) {
    cb();
  }
}

export function isValidDropTarget(element: Element): boolean {
  for (let target of dropTargets.keys()) {
    if (target.contains(element)) {
      return true;
    }
  }

  return false;
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
  'focusin',
  'focusout'
];

const CLICK_EVENTS = [
  'pointerup',
  'mouseup',
  'touchend'
];

const MESSAGES = {
  keyboard: 'dragStartedKeyboard',
  touch: 'dragStartedTouch',
  virtual: 'dragStartedVirtual'
};

class DragSession {
  dragTarget: DragTarget;
  validDropTargets: DropTarget[] = [];
  currentDropTarget: DropTarget | null = null;
  currentDropItem: DroppableItem | null = null;
  dropOperation: DropOperation | null = null;
  private mutationObserver: MutationObserver | null = null;
  private restoreAriaHidden: (() => void) | null = null;
  private stringFormatter: LocalizedStringFormatter;
  private isVirtualClick: boolean = false;
  private initialFocused: boolean;

  constructor(target: DragTarget, stringFormatter: LocalizedStringFormatter) {
    this.dragTarget = target;
    this.stringFormatter = stringFormatter;

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.cancelEvent = this.cancelEvent.bind(this);
    this.initialFocused = false;
  }

  setup(): void {
    document.addEventListener('keydown', this.onKeyDown, true);
    document.addEventListener('keyup', this.onKeyUp, true);
    window.addEventListener('focus', this.onFocus, true);
    window.addEventListener('blur', this.onBlur, true);
    document.addEventListener('click', this.onClick, true);
    document.addEventListener('pointerdown', this.onPointerDown, true);

    for (let event of CANCELED_EVENTS) {
      document.addEventListener(event, this.cancelEvent, true);
    }

    this.mutationObserver = new MutationObserver(() =>
      this.updateValidDropTargets()
    );
    this.updateValidDropTargets();

    announce(this.stringFormatter.format(MESSAGES[getDragModality()]));
  }

  teardown(): void {
    document.removeEventListener('keydown', this.onKeyDown, true);
    document.removeEventListener('keyup', this.onKeyUp, true);
    window.removeEventListener('focus', this.onFocus, true);
    window.removeEventListener('blur', this.onBlur, true);
    document.removeEventListener('click', this.onClick, true);
    document.removeEventListener('pointerdown', this.onPointerDown, true);

    for (let event of CANCELED_EVENTS) {
      document.removeEventListener(event, this.cancelEvent, true);
    }

    this.mutationObserver?.disconnect();
    this.restoreAriaHidden?.();
  }

  onKeyDown(e: KeyboardEvent): void {
    this.cancelEvent(e);

    if (e.key === 'Escape') {
      this.cancel();
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

  onKeyUp(e: KeyboardEvent): void {
    this.cancelEvent(e);

    if (e.key === 'Enter') {
      if (e.altKey || this.getCurrentActivateButton()?.contains(e.target as Node)) {
        this.activate(this.currentDropTarget, this.currentDropItem);
      } else {
        this.drop();
      }
    }
  }

  getCurrentActivateButton(): FocusableElement | null {
    return this.currentDropItem?.activateButtonRef?.current ?? this.currentDropTarget?.activateButtonRef?.current ?? null;
  }

  onFocus(e: FocusEvent): void {
    let activateButton = this.getCurrentActivateButton();
    if (e.target === activateButton) {
      // TODO: canceling this breaks the focus ring. Revisit when we support tabbing.
      this.cancelEvent(e);
      return;
    }

    // Prevent focus events, except to the original drag target.
    if (e.target !== this.dragTarget.element) {
      this.cancelEvent(e);
    }

    // Ignore focus events on the window/document (JSDOM). Will be handled in onBlur, below.
    if (!(e.target instanceof HTMLElement) || e.target === this.dragTarget.element) {
      return;
    }

    let dropTarget =
      this.validDropTargets.find(target => target.element === e.target as HTMLElement) ||
      this.validDropTargets.find(target => target.element.contains(e.target as HTMLElement));

    if (!dropTarget) {
      // if (e.target === activateButton) {
      //   activateButton.focus();
      // }
      if (this.currentDropTarget) {
        this.currentDropTarget.element.focus();
      } else {
        this.dragTarget.element.focus();
      }
      return;
    }

    let item = dropItems.get(e.target as HTMLElement);
    if (dropTarget) {
      this.setCurrentDropTarget(dropTarget, item);
    }
  }

  onBlur(e: FocusEvent): void {
    let activateButton = this.getCurrentActivateButton();
    if (e.relatedTarget === activateButton) {
      this.cancelEvent(e);
      return;
    }

    if (e.target !== this.dragTarget.element) {
      this.cancelEvent(e);
    }

    // If nothing is gaining focus, or e.relatedTarget is the window/document (JSDOM),
    // restore focus back to the current drop target if any, or the original drag target.
    if (!e.relatedTarget || !(e.relatedTarget instanceof HTMLElement)) {
      if (this.currentDropTarget) {
        this.currentDropTarget.element.focus();
      } else {
        this.dragTarget.element.focus();
      }
    }
  }

  onClick(e: MouseEvent): void {
    this.cancelEvent(e);
    if (isVirtualClick(e) || this.isVirtualClick) {
      let dropElements = dropItems.values();
      let item = [...dropElements].find(item => item.element === e.target as HTMLElement || item.activateButtonRef?.current?.contains(e.target as HTMLElement));
      let dropTarget = this.validDropTargets.find(target => target.element.contains(e.target as HTMLElement));
      let activateButton = item?.activateButtonRef?.current ?? dropTarget?.activateButtonRef?.current;
      if (activateButton?.contains(e.target as HTMLElement) && dropTarget) {
        this.activate(dropTarget, item);
        return;
      }

      if (e.target === this.dragTarget.element) {
        this.cancel();
        return;
      }

      if (dropTarget) {
        this.setCurrentDropTarget(dropTarget, item);
        this.drop(item);
      }
    }
  }

  onPointerDown(e: PointerEvent): void {
    // Android Talkback double tap has e.detail = 1 for onClick. Detect the virtual click in onPointerDown before onClick fires
    // so we can properly perform cancel and drop operations.
    this.cancelEvent(e);
    this.isVirtualClick = isVirtualPointerEvent(e);
  }

  cancelEvent(e: Event): void {
    // Allow focusin and focusout on the drag target so focus ring works properly.
    if ((e.type === 'focusin' || e.type === 'focusout') && (e.target === this.dragTarget?.element || e.target === this.getCurrentActivateButton())) {
      return;
    }

    // Allow default for events that might cancel a click event
    if (!CLICK_EVENTS.includes(e.type)) {
      e.preventDefault();
    }

    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  updateValidDropTargets(): void {
    if (!this.mutationObserver) {
      return;
    }

    this.mutationObserver.disconnect();
    if (this.restoreAriaHidden) {
      this.restoreAriaHidden();
    }

    this.validDropTargets = findValidDropTargets(this.dragTarget);

    // Shuffle drop target order based on starting drag target.
    if (this.validDropTargets.length > 0) {
      let nearestIndex = this.findNearestDropTarget();
      this.validDropTargets = [
        ...this.validDropTargets.slice(nearestIndex),
        ...this.validDropTargets.slice(0, nearestIndex)
      ];
    }

    if (this.currentDropTarget && !this.validDropTargets.includes(this.currentDropTarget)) {
      this.setCurrentDropTarget(this.validDropTargets[0]);
    }

    // Find valid drop items within collections
    let types = getTypes(this.dragTarget.items);
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
      ...validDropItems.flatMap(item => item.activateButtonRef?.current ? [item.element, item.activateButtonRef?.current] : [item.element]),
      ...visibleDropTargets.flatMap(target => target.activateButtonRef?.current ? [target.element, target.activateButtonRef?.current] : [target.element])
    ], {shouldUseInert: true});

    this.mutationObserver.observe(document.body, {subtree: true, attributes: true, attributeFilter: ['aria-hidden', 'inert']});
  }

  next(): void {
    // TODO: Allow tabbing to the activate button. Revisit once we fix the focus ring.
    // For now, the activate button is reachable by screen readers and ArrowLeft/ArrowRight
    // is usable specifically by Tree. Will need tabbing for other components.
    // let activateButton = this.getCurrentActivateButton();
    // if (activateButton && document.activeElement !== activateButton) {
    //   activateButton.focus();
    //   return;
    // }

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
      if (!this.dragTarget.element.closest('[aria-hidden="true"], [inert]')) {
        this.setCurrentDropTarget(null);
        this.dragTarget.element.focus();
      } else {
        this.setCurrentDropTarget(this.validDropTargets[0]);
      }
    } else {
      this.setCurrentDropTarget(this.validDropTargets[index + 1]);
    }
  }

  previous(): void {
    // let activateButton = this.getCurrentActivateButton();
    // if (activateButton && document.activeElement === activateButton) {
    //   let target = this.currentDropItem ?? this.currentDropTarget;
    //   if (target) {
    //     target.element.focus();
    //     return;
    //   }
    // }

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
      if (!this.dragTarget.element.closest('[aria-hidden="true"], [inert]')) {
        this.setCurrentDropTarget(null);
        this.dragTarget.element.focus();
      } else {
        this.setCurrentDropTarget(this.validDropTargets[this.validDropTargets.length - 1]);
      }
    } else {
      this.setCurrentDropTarget(this.validDropTargets[index - 1]);
    }
  }

  findNearestDropTarget(): number {
    let dragTargetRect = this.dragTarget.element.getBoundingClientRect();

    let minDistance = Infinity;
    let nearest = -1;
    for (let i = 0; i < this.validDropTargets.length; i++) {
      let dropTarget = this.validDropTargets[i];
      let rect = dropTarget.element.getBoundingClientRect();
      let dx = rect.left - dragTargetRect.left;
      let dy = rect.top - dragTargetRect.top;
      let dist = (dx * dx) + (dy * dy);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = i;
      }
    }

    return nearest;
  }

  setCurrentDropTarget(dropTarget: DropTarget | null, item?: DroppableItem): void {
    if (dropTarget !== this.currentDropTarget) {
      if (this.currentDropTarget && typeof this.currentDropTarget.onDropExit === 'function') {
        let rect = this.currentDropTarget.element.getBoundingClientRect();
        this.currentDropTarget.onDropExit({
          type: 'dropexit',
          x: rect.left + (rect.width / 2),
          y: rect.top + (rect.height / 2)
        });
      }

      this.currentDropTarget = dropTarget;

      if (dropTarget) {
        if (typeof dropTarget.onDropEnter === 'function') {
          let rect = dropTarget.element.getBoundingClientRect();
          dropTarget.onDropEnter({
            type: 'dropenter',
            x: rect.left + (rect.width / 2),
            y: rect.top + (rect.height / 2)
          }, this.dragTarget);
        }

        if (!item) {
          dropTarget?.element.focus();
        }
      }
    }

    if (item != null && item !== this.currentDropItem) {
      if (this.currentDropTarget && typeof this.currentDropTarget.onDropTargetEnter === 'function') {
        this.currentDropTarget.onDropTargetEnter(item.target);
      }
      item.element.focus();
      this.currentDropItem = item;

      // Announce first drop target after drag start announcement finishes.
      // Otherwise, it will never get announced because drag start announcement is assertive.
      if (!this.initialFocused) {
        let label = item?.element.getAttribute('aria-label');
        if (label) {
          announce(label, 'polite');
        }
        this.initialFocused = true;
      }
    }
  }

  end(): void {
    this.teardown();
    endDragging();

    if (typeof this.dragTarget.onDragEnd === 'function') {
      let target = this.currentDropTarget && this.dropOperation !== 'cancel' ? this.currentDropTarget : this.dragTarget;
      let rect = target.element.getBoundingClientRect();
      this.dragTarget.onDragEnd({
        type: 'dragend',
        x: rect.x + (rect.width / 2),
        y: rect.y + (rect.height / 2),
        dropOperation: this.dropOperation || 'cancel'
      });
    }

    if (this.currentDropTarget && !this.currentDropTarget.preventFocusOnDrop) {
      // Re-trigger focus event on active element, since it will not have received it during dragging (see cancelEvent).
      // This corrects state such as whether focus ring should appear.
      // useDroppableCollection handles this itself, so this is only for standalone drop zones.
      document.activeElement?.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
    }

    this.setCurrentDropTarget(null);
  }

  cancel(): void {
    this.setCurrentDropTarget(null);
    this.end();
    if (!this.dragTarget.element.closest('[aria-hidden="true"], [inert]')) {
      this.dragTarget.element.focus();
    }

    announce(this.stringFormatter.format('dropCanceled'));
  }

  drop(item?: DroppableItem): void {
    if (!this.currentDropTarget) {
      this.cancel();
      return;
    }

    if (typeof item?.getDropOperation === 'function') {
      let types = getTypes(this.dragTarget.items);
      this.dropOperation = item.getDropOperation(types, this.dragTarget.allowedDropOperations);
    } else if (typeof this.currentDropTarget.getDropOperation === 'function') {
      let types = getTypes(this.dragTarget.items);
      this.dropOperation = this.currentDropTarget.getDropOperation(types, this.dragTarget.allowedDropOperations);
    } else {
      // TODO: show menu ??
      this.dropOperation = this.dragTarget.allowedDropOperations[0];
    }

    if (typeof this.currentDropTarget.onDrop === 'function') {
      let items: DropItem[] = this.dragTarget.items.map(item => ({
        kind: 'text',
        types: new Set(Object.keys(item)),
        getText: (type: string) => Promise.resolve(item[type])
      }));

      let rect = this.currentDropTarget.element.getBoundingClientRect();
      this.currentDropTarget.onDrop({
        type: 'drop',
        x: rect.left + (rect.width / 2),
        y: rect.top + (rect.height / 2),
        items,
        dropOperation: this.dropOperation
      }, item?.target ?? null);
    }

    this.end();
    announce(this.stringFormatter.format('dropComplete'));
  }

  activate(dropTarget: DropTarget | null, dropItem: DroppableItem | null | undefined): void {
    if (dropTarget && typeof dropTarget.onDropActivate === 'function') {
      let target = dropItem?.target ?? null;
      let rect = dropTarget.element.getBoundingClientRect();
      dropTarget.onDropActivate({
        type: 'dropactivate',
        x: rect.left + (rect.width / 2),
        y: rect.top + (rect.height / 2)
      }, target);
    }
  }
}

function findValidDropTargets(options: DragTarget) {
  let types = getTypes(options.items);
  return [...dropTargets.values()].filter(target => {
    if (target.element.closest('[aria-hidden="true"], [inert]')) {
      return false;
    }

    if (typeof target.getDropOperation === 'function') {
      return target.getDropOperation(types, options.allowedDropOperations) !== 'cancel';
    }

    return true;
  });
}
