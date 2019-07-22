import {DropOperation} from '../DropOperation';
import {invert} from '../utils';
import { View } from '../View';
import {DragHandlerView} from '../types';

// Map strings used by the HTML5 DnD API to our DropOperation constants.
const DROP_OPERATION = {
  none: DropOperation.NONE,
  move: DropOperation.MOVE,
  copy: DropOperation.COPY,
  link: DropOperation.LINK
};

// See https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/effectAllowed
const DROP_OPERATION_ALLOWED = Object.assign({}, DROP_OPERATION, {
  copyMove: DropOperation.COPY | DropOperation.MOVE,
  copyLink: DropOperation.COPY | DropOperation.LINK,
  linkMove: DropOperation.LINK | DropOperation.MOVE,
  all: DropOperation.ALL,
  uninitialized: DropOperation.ALL
});

const DROP_EFFECT = invert(DROP_OPERATION);
const EFFECT_ALLOWED = invert(DROP_OPERATION_ALLOWED);

class DragHandler {
  private views: Set<DragHandlerView>;
  private dragView: DragHandlerView | null;
  private dragX: number;
  private dragY: number;
  private dropEffect: string;
  private dragOverView: DragHandlerView | null;
  private dragOverElements: Set<Element>;
  private hasSetupEvents: boolean;
  private bodyIsDraggable: boolean;
  private dragEnteredEffect: string;

  constructor() {
    this.mouseDown = this.mouseDown.bind(this);
    this.dragStart = this.dragStart.bind(this);
    this.dragOver = this.dragOver.bind(this);
    this.dragEnter = this.dragEnter.bind(this);
    this.dragLeave = this.dragLeave.bind(this);
    this.dragEnd = this.dragEnd.bind(this);
    this.drop = this.drop.bind(this);

    this.views = new Set();
    this.dragView = null;
    this.dragX = 0;
    this.dragY = 0;
    this.dropEffect = 'none';
    this.dragEnteredEffect = 'none';
    this.dragOverView = null;
    this.dragOverElements = new Set();
    this.hasSetupEvents = false;
    this.bodyIsDraggable = false;
  }

  setupEvents() {
    if (this.hasSetupEvents || typeof document === 'undefined') {
      return;
    }

    document.addEventListener('mousedown', this.mouseDown, false);
    document.addEventListener('dragstart', this.dragStart, false);
    document.addEventListener('dragover', this.dragOver, false);
    document.addEventListener('dragenter', this.dragEnter, false);
    document.addEventListener('dragleave', this.dragLeave, false);
    document.addEventListener('dragend', this.dragEnd, false);
    document.addEventListener('drop', this.drop, false);

    this.hasSetupEvents = true;
  }

  teardownEvents() {
    if (!this.hasSetupEvents || typeof document === 'undefined') {
      return;
    }

    document.removeEventListener('mousedown', this.mouseDown, false);
    document.removeEventListener('dragstart', this.dragStart, false);
    document.removeEventListener('dragover', this.dragOver, false);
    document.removeEventListener('dragenter', this.dragEnter, false);
    document.removeEventListener('dragleave', this.dragLeave, false);
    document.removeEventListener('dragend', this.dragEnd, false);
    document.removeEventListener('drop', this.drop, false);

    this.bodyIsDraggable = false;
    this.hasSetupEvents = false;
  }

  registerView(view: DragHandlerView) {
    this.setupEvents();
    this.views.add(view);
  }

  unregisterView(view: DragHandlerView) {
    this.views.delete(view);
    if (this.views.size === 0) {
      this.teardownEvents();
    }
  }

  private containsPoint(view: View, event: DragEvent) {
    let rect = view.getRect();
    return event.clientX >= rect.x && event.clientX <= rect.maxX
      && event.clientY >= rect.y && event.clientY <= rect.maxY;
  }

  private hitTest(event: DragEvent): DragHandlerView | null {
    let possibleViews: DragHandlerView[] = [];
    for (let view of this.views) {
      if (this.containsPoint(view, event)) {
        possibleViews.push(view);
      }
    }

    if (possibleViews.length > 1) {
      let innerView: DragHandlerView | null = null;

      for (let view of possibleViews) {
        if (innerView) {
          if (innerView.getDOMNode().contains(view.getDOMNode())) {
            innerView = view;
          }
        } else if (view.getDOMNode().contains(event.target as HTMLElement)) {
          innerView = view;
        }
      }

      return innerView;
    } else {
      return possibleViews[0] || null;
    }
  }

  private _isElementChildOfCollectionView(element) {
    for (let view of this.views) {
      if (view.getDOMNode().contains(element)) {
        return true;
      }
    }

    return false;
  }

  private mouseDown(event: MouseEvent) {
    // Firefox has problems focusing text fields if there are any draggable superviews
    let element = event.target as HTMLElement;
    let isTextInput = element.tagName === 'INPUT'
      || element.tagName === 'TEXTAREA'
      || element.isContentEditable;

    for (let view of this.views) {
      if (view.getDOMNode().contains(element)) {
        if (isTextInput) {
          view.removeAttribute('draggable');
        } else {
          view.setAttribute('draggable', 'true');
        }
      }
    }
  }

  private dragStart(event: DragEvent) {
    if (!this._isElementChildOfCollectionView(event.target)) {
      return;
    }

    let view = this.hitTest(event);
    if (!view) {
      event.preventDefault();
      return;
    }

    let allowedDropOperations = view.dragStart(event);
    if (!allowedDropOperations) {
      event.preventDefault();
      return;
    }

    this.dragView = view;
    event.dataTransfer.effectAllowed = EFFECT_ALLOWED[allowedDropOperations];
  }

  setDragImage(event: DragEvent, view: View) {
    if (!this._isElementChildOfCollectionView(event.target)) {
      return;
    }

    // Edge and IE Specific. Since, setDragImage function is not exposed in both.
    if (!event.dataTransfer.setDragImage) {
      return;
    }

    // In Firefox, the drag view must be within the viewport
    let mustBeInViewport = 'MozAppearance' in document.documentElement.style;

    let node = view.getDOMNode().cloneNode(true) as HTMLElement;
    node.classList.add('dragging');
    node.style.zIndex = '-100';
    node.style.position = 'absolute';
    node.style.top = '0';
    node.style.left = mustBeInViewport ? '0' : '-100000px';
    node.style.padding = '10px';
    document.body.appendChild(node);

    let size = node.getBoundingClientRect();
    event.dataTransfer.setDragImage(node, size.width / 2, size.height / 2);

    setTimeout(() => {
      document.body.removeChild(node);
    }, 0);
  }

  private dragOver(event: DragEvent) {
    if (!this._isElementChildOfCollectionView(event.target)) {
      return;
    }

    event.preventDefault();

    if (event.clientX === this.dragX && event.clientY === this.dragY) {
      event.dataTransfer.dropEffect = this.dropEffect;
      return;
    }

    let allowedOperations = DROP_OPERATION_ALLOWED[event.dataTransfer.effectAllowed];

    let target = this.hitTest(event);
    if (target !== this.dragOverView) {
      if (this.dragOverView) {
        this.dragOverView.dragExited(event);
        this.dropEffect = 'none';
      }

      if (target) {
        let dropEffect = target.dragEntered(event, allowedOperations);
        this.dropEffect = DROP_EFFECT[dropEffect] || 'none';
        this.dragEnteredEffect = this.dropEffect;
      }

      this.dragOverView = target;
    }

    if (target && this.dragEnteredEffect !== 'none') {
      let dropEffect = target.dragMoved(event, allowedOperations);
      if (dropEffect != null) {
        this.dropEffect = DROP_EFFECT[dropEffect] || 'none';
      }
    }

    event.dataTransfer.dropEffect = this.dropEffect;
    this.dragX = event.clientX;
    this.dragY = event.clientY;
  }

  private dragEnter(event: DragEvent) {
    this.dragOverElements.add(event.target as HTMLElement);
  }

  private dragLeave(event: DragEvent) {
    this.dragOverElements.delete(event.target as HTMLElement);
    if (this.dragOverElements.size === 0) {
      this.dragEnd(event);
    }
  }

  // dragEnd always gets called to remove drag animations
  // Does not require check to see if it's a collection-view as users can't drag more than one thing at a time
  // and probably wanna cancel their drag if they go outside the drag area anyways...
  private dragEnd(event: DragEvent) {
    if (this.dragView) {
      this.dragView.dragEnd(event, DROP_OPERATION[event.dataTransfer.dropEffect]);
      this.dragView = null;
    }

    if (this.dragOverView) {
      this.dragOverView.dragExited(event);
      this.dragOverView = null;
    }

    this.dragX = 0;
    this.dragY = 0;
    this.dropEffect = 'none';
  }

  private drop(event: DragEvent) {
    if (!this._isElementChildOfCollectionView(event.target)) {
      return;
    }

    event.preventDefault();

    let target = this.dragOverView;
    if (!target) {
      target = this.hitTest(event);
    }

    if (!target) {
      return;
    }

    target.drop(event, DROP_OPERATION[this.dropEffect]);
    target.dragExited(event);

    this.dragOverView = null;
  }
}

export default new DragHandler;
