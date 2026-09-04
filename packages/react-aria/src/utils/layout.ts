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

import {addEvent, getOwnerDocument, getOwnerWindow} from './domHelpers';
import {BoundingNode, BoundingOptions, BoxModel} from '@react-types/shared';
import {getOverflowingElement, getStylingElement, getVisualViewport} from './layoutHelpers';
import {getPropagationTargets, nodeContains} from './shadowdom/DOMFunctions';
import {isChrome, isIOS, isWebKit} from './platform';
import {isDocument, isHTMLElement} from './typeHelpers';
import {SyntheticEventTarget} from './events';

/**
 * https://github.com/orgs/adobe/projects/19/views/30?filterQuery=overlay&pane=issue&itemId=5247317.
 *
 * Disclaimer: "DOMResizableBox" and "DOMBoxAnchor" are experimental preview to understand the
 * context of why this has been built using OOP. Only "DOMBox" is required for scroll utilities!
 *
 * This file aims to provide the primitives for a smaller, more accurate and faster alternative
 * to @floating-ui/dom, based on native CSS anchor positioning and CSS transitions.
 *
 * Unlike floating-ui, this implementation offers a synchronous, event-based API, which, coupled
 * with #10102s work on interactive widgets, is able to directly plug into the existing codebase and
 * fix most open issues attributed to useResizeObserver, useViewportSize and useOverlayPosition.
 *
 * Here is an outline over "DOMBox", "DOMResizableBox" and "DOMBoxAnchor":
 *
 * 1. A "DOMBox" is built via two bounding box implementations to cover either viewport or element
 *    bounding targets. Due to issues in Chrome, these currently vary enough to warrant an internal
 *    strategy pattern, but we can consider consolidation once the issue resolves.
 * 2. On top, a "DOMResizableBox" implements an event emitter, which fires on resize. All box models
 *    may be supported through a ResizeObserver and a set of inline CSS transitions. This basically
 *    notifies us of changes in either size or box style (e.g. padding, scroll-padding).
 * 3. A "DOMBoxAnchor" extends "DOMResizableBox" by position tracking. This is done through a hidden,
 *    non-layout-thrashing fixpos sentinel, which is positioned at the ICB origin and anchored to
 *    the target so its width & height correspond to the top & left coordinates. Position changes
 *    done in composite, e.g. transforms or scroll, are listened to or already followed natively.
 *
 * Hint: "DOMBoxAnchor" has only recently been enabled by CSS anchor positioning entering baseline,
 * which coincides with RSPs required browser support range (last 2 majors).
 *
 * Fixes: Issue#7142, Issue#10036, Issue#10131, PR#9318 and more.
 */

const BOX_SYMBOL = Symbol.for('react-aria-box');

const BOX_OPTIONS = Object.freeze<Required<BoxOptions<BoundingNode>>>({
  model: 'border-box',
  precision: 'sub-pixel',
  transform: true
});

interface DOMBoxStrategy<T extends BoundingNode> {
  model: NonNullable<BoxOptions<T>['model']>;
  precision: NonNullable<BoxOptions<T>['precision']>;
  transform: NonNullable<BoxOptions<T>['transform']>;
  initialRect: DOMRect;
  visibleRect: DOMRect;
  boundingRect: DOMRect;
  target: T;
}

interface ElementBoxOptions extends BoundingOptions {
  model?: BoxModel;
}

interface DocumentBoxOptions extends BoundingOptions {
  model?: Extract<BoxModel, 'border-box' | 'padding-box' | `scroll-padding-box`>;
}

type BoxOptions<T extends BoundingNode> = Document extends T
  ? DocumentBoxOptions
  : ElementBoxOptions;

class ElementBox<T extends Element> implements DOMBoxStrategy<T> {
  public readonly model: NonNullable<BoxOptions<T>['model']>;
  public readonly precision: NonNullable<BoxOptions<T>['precision']>;
  public readonly transform: NonNullable<BoxOptions<T>['transform']>;

  public readonly target: T;

  constructor(target: T, options?: BoxOptions<T>) {
    let {model, precision, transform} = {...BOX_OPTIONS, ...options};

    this.model = model;
    this.precision = precision;
    this.transform = transform;

    this.target = target;
  }

  /**
   * Returns the initial bounding rectangle of this target in frame coordinate space.
   * Similar to `element.getBoundingClientRect()`, but only when rendered.
   */
  public get initialRect(): DOMRect {
    let rect = this.target.getBoundingClientRect();

    if (rect.width > 0 && rect.height > 0) {
      return new DOMRect(rect.x, rect.y, rect.width, rect.height);
    } else {
      return new DOMRect();
    }
  }

  /**
   * Returns the visible bounding rectangle of this target in frame coordinate space.
   * Similar to `element.getBoundingClientRect()`, but intersected with all ancestors.
   */
  public get visibleRect(): DOMRect {
    throw new Error('Not implemented yet.');
  }

  /**
   * Returns the bounding rectangle of this target in frame coordinate space.
   * Similar to `element.getBoundingClientRect()`, but normalized across engines.
   */
  public get boundingRect(): DOMRect {
    let rect = this.initialRect;

    let ownerWindow = getOwnerWindow(this.target);
    let ownerDocument = getOwnerDocument(this.target);

    let stylingElement = getStylingElement(this.target);
    let style = ownerWindow.getComputedStyle(stylingElement);

    // If disabled, strip 2D transforms while attempting to preserve subpixel precision.
    // This can be useful when positioning a bounding target relative to an animated anchor.
    if (!this.transform && isHTMLElement(this.target)) {
      if (style.transform !== 'none' && typeof ownerWindow.DOMMatrix !== 'undefined') {
        let matrix = new DOMMatrix(style.transform);

        if (matrix && matrix.is2D) {
          rect.width /= Math.hypot(matrix.a, matrix.b) || 1;
          rect.height /= Math.hypot(matrix.c, matrix.d) || 1;
        }
      }

      if (Math.abs(rect.width - this.target.offsetWidth) >= 1) {
        rect.width = this.target.offsetWidth;
      }

      if (Math.abs(rect.height - this.target.offsetHeight) >= 1) {
        rect.height = this.target.offsetHeight;
      }
    }

    if (rect.width <= 0 || rect.height <= 0) {
      return new DOMRect();
    }

    if (this.model === 'scroll-margin-box') {
      rect.y -= parseFloat(style.scrollMarginTop) || 0;
      rect.height += parseFloat(style.scrollMarginTop) || 0;
      rect.height += parseFloat(style.scrollMarginBottom) || 0;
      rect.x -= parseFloat(style.scrollMarginLeft) || 0;
      rect.width += parseFloat(style.scrollMarginLeft) || 0;
      rect.width += parseFloat(style.scrollMarginRight) || 0;
    } else if (this.model === 'margin-box') {
      rect.y -= parseFloat(style.marginTop) || 0;
      rect.height += parseFloat(style.marginTop) || 0;
      rect.height += parseFloat(style.marginBottom) || 0;
      rect.x -= parseFloat(style.marginLeft) || 0;
      rect.width += parseFloat(style.marginLeft) || 0;
      rect.width += parseFloat(style.marginRight) || 0;
    }

    if (this.model.endsWith('padding-box') || this.model.endsWith('content-box')) {
      let clientTop = parseFloat(style.borderTopWidth) || 0;
      let clientLeft = parseFloat(style.borderLeftWidth) || 0;
      let clientBottom = parseFloat(style.borderBottomWidth) || 0;
      let clientRight = parseFloat(style.borderRightWidth) || 0;

      // A node containing the root overflowing element shall assert as its document.
      if (!nodeContains(this.target, getOverflowingElement(ownerDocument))) {
        let gutterAlign = style.direction === 'rtl' ? 'left' : 'right';

        let innerWidth = Math.max(0, rect.width - clientLeft - clientRight);
        let innerHeight = Math.max(0, rect.height - clientTop - clientBottom);

        let gutterWidth = Math.max(0, innerWidth - this.target.clientWidth);
        let gutterHeight = Math.max(0, innerHeight - this.target.clientHeight);

        // https://bugs.webkit.org/show_bug.cgi?id=318043
        if (/both-edges/.test(style.scrollbarGutter) && isWebKit()) gutterWidth *= 2;
        if (/both-edges/.test(style.scrollbarGutter)) gutterAlign = 'both-edges';

        // WebKit on IOS always positions the scrollbar on the right.
        if (isIOS() && isWebKit()) gutterAlign = 'right';

        if (gutterAlign === 'left') {
          rect.x += gutterWidth;
          rect.width -= gutterWidth;
          rect.height -= gutterHeight;
        } else if (gutterAlign === 'right') {
          rect.width -= gutterWidth;
          rect.height -= gutterHeight;
        } else if (gutterAlign === 'both-edges') {
          rect.x += gutterWidth / 2;
          rect.width -= gutterWidth;
          rect.height -= gutterHeight;
        }
      }

      rect.y += clientTop;
      rect.height -= clientTop;
      rect.height -= clientBottom;
      rect.x += clientLeft;
      rect.width -= clientLeft;
      rect.width -= clientRight;
    }

    if (this.model === 'scroll-padding-box') {
      rect.y += parseFloat(style.scrollPaddingTop) || 0;
      rect.height -= parseFloat(style.scrollPaddingTop) || 0;
      rect.height -= parseFloat(style.scrollPaddingBottom) || 0;
      rect.x += parseFloat(style.scrollPaddingLeft) || 0;
      rect.width -= parseFloat(style.scrollPaddingLeft) || 0;
      rect.width -= parseFloat(style.scrollPaddingRight) || 0;
    }

    if (this.model === 'content-box') {
      rect.y += parseFloat(style.paddingTop) || 0;
      rect.height -= parseFloat(style.paddingTop) || 0;
      rect.height -= parseFloat(style.paddingBottom) || 0;
      rect.x += parseFloat(style.paddingLeft) || 0;
      rect.width -= parseFloat(style.paddingLeft) || 0;
      rect.width -= parseFloat(style.paddingRight) || 0;
    }

    if (rect.width > 0 && rect.height > 0) {
      return new DOMRect(rect.x, rect.y, rect.width, rect.height);
    } else {
      return new DOMRect();
    }
  }
}

class DocumentBox<T extends Document> implements DOMBoxStrategy<T> {
  private static sentinels: WeakMap<Document, HTMLElement> = new WeakMap();

  private hiddenBox: DOMBox<HTMLElement>;

  public readonly model: NonNullable<BoxOptions<T>['model']>;
  public readonly precision: NonNullable<BoxOptions<T>['precision']>;
  public readonly transform: NonNullable<BoxOptions<T>['transform']>;

  public readonly target: T;

  constructor(target: T, options?: BoxOptions<T>) {
    let {model, precision, transform} = {...BOX_OPTIONS, ...options};

    // Yield a hidden fixpos sentinel in the top-layer to measure the ICB.
    // This is necessary due to issues with stable scrollbar gutters in Chrome.
    // An id is provided so ResizableBox can attach its ResizeObserver.
    // https://issues.chromium.org/issues/503187943
    let sentinel = DocumentBox.sentinels.get(target);

    if (sentinel == null) {
      sentinel ??= target.createElement('div');
      sentinel.id = 'react-aria-icb-sentinel';
      sentinel.popover = 'manual';
      sentinel.style.all = 'initial';
      sentinel.style.display = 'block';
      sentinel.style.position = 'fixed';
      sentinel.style.visibility = 'hidden';
      sentinel.style.pointerEvents = 'none';
      sentinel.style.inset = '0';
    }

    // An ICB sentinel connects at construction and is never disconnected.
    if (!sentinel.isConnected && typeof sentinel.showPopover === 'function') {
      target.documentElement.appendChild(sentinel);
      sentinel.showPopover();
    } else if (!sentinel.isConnected) {
      target.documentElement.appendChild(sentinel);
    }

    DocumentBox.sentinels.set(target, sentinel);

    this.hiddenBox = new DOMBox(sentinel);

    this.model = model;
    this.precision = precision;
    this.transform = transform;

    this.target = target;
  }

  /**
   * Returns the initial bounding rectangle of this target in frame coordinate space.
   * Similar to `documentElement.clientWidth/clientHeight`, but only when rendered.
   */
  public get initialRect(): DOMRect {
    let ownerWindow = getOwnerWindow(this.target);
    let ownerDocument = getOwnerDocument(this.target);

    let rect = this.hiddenBox.boundingRect;

    // Fallback to the window if the sentinel isnt rendered, e.g. in JSDOM.
    if (rect.width === 0 || rect.height === 0) {
      rect.height ||= ownerDocument.documentElement.clientHeight;
      rect.height ||= ownerWindow.innerHeight || 0;
      rect.width ||= ownerDocument.documentElement.clientWidth;
      rect.width ||= ownerWindow.innerWidth || 0;
    }

    if (rect.width > 0 && rect.height > 0) {
      return new DOMRect(rect.x, rect.y, rect.width, rect.height);
    } else {
      return new DOMRect();
    }
  }

  /**
   * Returns the visible bounding rectangle of this target in frame coordinate space.
   * Similar to `window.visualViewport.width/height`, but normalized across engines.
   */
  public get visibleRect(): DOMRect {
    let rect = this.initialRect;

    let ownerWindow = getOwnerWindow(this.target);
    let visualViewport = getVisualViewport(this.target);

    // Chrome positions fixpos elements in visual coordinate space.
    // https://issues.chromium.org/issues/40916847
    rect.x = Math.max(0, isChrome() && !isWebKit() ? 0 : rect.x);
    rect.y = Math.max(0, isChrome() && !isWebKit() ? 0 : rect.y);

    if (visualViewport == null) return rect;

    // WebKit misreports offset values during pans so calculate from the page instead.
    // https://bugs.webkit.org/show_bug.cgi?id=170981
    let offsetLeft = Math.max(0, visualViewport.pageLeft - ownerWindow.scrollX);
    let offsetRight = Math.max(0, rect.right - offsetLeft - visualViewport.width);
    let offsetTop = Math.max(0, visualViewport.pageTop - ownerWindow.scrollY);
    let offsetBottom = Math.max(0, rect.bottom - offsetTop - visualViewport.height);

    rect.y += offsetTop;
    rect.height -= offsetTop;
    rect.height -= offsetBottom;
    rect.x += offsetLeft;
    rect.width -= offsetLeft;
    rect.width -= offsetRight;

    if (rect.width > 0 && rect.height > 0) {
      return new DOMRect(rect.x, rect.y, rect.width, rect.height);
    } else {
      return new DOMRect();
    }
  }

  /**
   * Returns the bounding rectangle of this target in frame coordinate space.
   * Similar to `documentElement.clientWidth/clientHeight`, but normalized across engines.
   */
  public get boundingRect(): DOMRect {
    let rect = this.initialRect;

    let ownerWindow = getOwnerWindow(this.target);

    let stylingElement = getStylingElement(this.target);
    let style = ownerWindow.getComputedStyle(stylingElement);

    if (this.model === 'scroll-padding-box') {
      rect.y += parseFloat(style.scrollPaddingTop) || 0;
      rect.height -= parseFloat(style.scrollPaddingTop) || 0;
      rect.height -= parseFloat(style.scrollPaddingBottom) || 0;
      rect.x += parseFloat(style.scrollPaddingLeft) || 0;
      rect.width -= parseFloat(style.scrollPaddingLeft) || 0;
      rect.width -= parseFloat(style.scrollPaddingRight) || 0;
    }

    // https://www.w3.org/TR/css-scroll-snap-1/#optimal-viewing-region.
    if (this.model === 'padding-box' || this.model === 'scroll-padding-box') {
      let visibleRect = this.visibleRect;

      let left = Math.max(rect.x, visibleRect.x);
      let right = Math.min(rect.right, visibleRect.right);
      let top = Math.max(rect.y, visibleRect.y);
      let bottom = Math.min(rect.bottom, visibleRect.bottom);

      rect.y = top;
      rect.height = bottom - top;
      rect.x = left;
      rect.width = right - left;
    }

    if (rect.width > 0 && rect.height > 0) {
      return new DOMRect(rect.x, rect.y, rect.width, rect.height);
    } else {
      return new DOMRect();
    }
  }
}

/**
 * Represents a bounding box in a document layout.
 */
export class DOMBox<T extends BoundingNode> implements DOMBoxStrategy<T> {
  private strategy: DOMBoxStrategy<T>;

  public readonly model: NonNullable<BoxOptions<T>['model']>;
  public readonly precision: NonNullable<BoxOptions<T>['precision']>;
  public readonly transform: NonNullable<BoxOptions<T>['transform']>;

  public readonly target: T;

  constructor(target: T & Element, options?: BoxOptions<Element>);
  constructor(target: T & Document, options?: BoxOptions<Document>);
  constructor(target: T, options?: BoxOptions<Document>);
  constructor(target: T, options?: BoxOptions<T>) {
    if (typeof window === 'undefined' || window.navigator == null) {
      throw new Error(`${this.constructor.name} must be rendered client-only.`);
    }

    this.strategy = isDocument(target)
      ? new DocumentBox(target as T & Document, options as BoxOptions<T & Document>)
      : new ElementBox(target as T & Element, options as BoxOptions<T & Element>);

    this.model = this.strategy.model;
    this.precision = this.strategy.precision;
    this.transform = this.strategy.transform;

    this.target = target;
  }

  /**
   * Returns the initial bounding rectangle of this target in frame coordinate space.
   * Similar to `node.getBoundingClientRect()`, but only when rendered.
   */
  public get initialRect(): DOMRect {
    let rect = this.strategy.initialRect;

    let ownerWindow = getOwnerWindow(this.target);

    if (this.precision === 'pixel') {
      rect.x = Math.round(rect.x);
      rect.y = Math.round(rect.y);
      rect.width = Math.round(rect.width);
      rect.height = Math.round(rect.height);
    } else if (this.precision === 'device-pixel') {
      rect.x *= ownerWindow.devicePixelRatio || 1;
      rect.y *= ownerWindow.devicePixelRatio || 1;
      rect.width *= ownerWindow.devicePixelRatio || 1;
      rect.height *= ownerWindow.devicePixelRatio || 1;
    }

    return rect;
  }

  /**
   * Returns the visible bounding rectangle in frame coordinate space.
   * Similar to `node.getBoundingClientRect()`, but intersected with all ancestors.
   */
  public get visibleRect(): DOMRect {
    let rect = this.strategy.visibleRect;

    let ownerWindow = getOwnerWindow(this.target);

    if (this.precision === 'pixel') {
      rect.x = Math.round(rect.x);
      rect.y = Math.round(rect.y);
      rect.width = Math.round(rect.width);
      rect.height = Math.round(rect.height);
    } else if (this.precision === 'device-pixel') {
      rect.x *= ownerWindow.devicePixelRatio || 1;
      rect.y *= ownerWindow.devicePixelRatio || 1;
      rect.width *= ownerWindow.devicePixelRatio || 1;
      rect.height *= ownerWindow.devicePixelRatio || 1;
    }

    return rect;
  }

  /**
   * Returns the bounding rectangle of this target in frame coordinate space.
   * Similar to `node.getBoundingClientRect()`, but normalized across engines.
   */
  public get boundingRect(): DOMRect {
    let rect = this.strategy.boundingRect;

    let ownerWindow = getOwnerWindow(this.target);

    if (this.precision === 'pixel') {
      rect.x = Math.round(rect.x);
      rect.y = Math.round(rect.y);
      rect.width = Math.round(rect.width);
      rect.height = Math.round(rect.height);
    } else if (this.precision === 'device-pixel') {
      rect.x *= ownerWindow.devicePixelRatio || 1;
      rect.y *= ownerWindow.devicePixelRatio || 1;
      rect.width *= ownerWindow.devicePixelRatio || 1;
      rect.height *= ownerWindow.devicePixelRatio || 1;
    }

    return rect;
  }
}

/**
 * An event emitter for size changes of a bounding box inside a layout.
 * Similar to the `ResizeObserver`, but extended by size tracking of all box models.
 */
export class DOMResizableBox<T extends BoundingNode>
  extends SyntheticEventTarget<BoxChangeEvent>
  implements DOMBoxStrategy<T>
{
  private boundingBox: DOMBox<T>;

  protected head: DOMRect;
  protected last: DOMRect;
  protected observer: ResizeObserver;

  protected changedAt: number = 0;

  public readonly model: NonNullable<BoxOptions<T>['model']>;
  public readonly precision: NonNullable<BoxOptions<T>['precision']>;
  public readonly transform: NonNullable<BoxOptions<T>['transform']>;

  public readonly target: T;

  constructor(target: T & Element, options?: BoxOptions<Element>);
  constructor(target: T & Document, options?: BoxOptions<Document>);
  constructor(target: T, options?: BoxOptions<Document>);
  constructor(target: T, options?: BoxOptions<T>) {
    super();

    this.update = this.update.bind(this);

    this.observer = new ResizeObserver(this.update);
    this.boundingBox = new DOMBox(target, options as BoxOptions<Document>);

    this.head = this.last = this.boundingBox.boundingRect;

    this.model = this.boundingBox.model;
    this.precision = this.boundingBox.precision;
    this.transform = this.boundingBox.transform;

    this.target = target;
  }

  /**
   * Returns the initial bounding rectangle of this target in frame coordinate space.
   * Similar to `node.getBoundingClientRect()`, but only when rendered.
   */
  public get initialRect(): DOMRect {
    return this.boundingBox.initialRect;
  }

  /**
   * Returns the visible bounding rectangle in frame coordinate space.
   * Similar to `node.getBoundingClientRect()`, but intersected with all ancestors.
   */
  public get visibleRect(): DOMRect {
    return this.boundingBox.visibleRect;
  }

  /**
   * Returns the bounding rectangle of this target in frame coordinate space.
   * Similar to `node.getBoundingClientRect()`, but normalized across engines.
   */
  public get boundingRect(): DOMRect {
    return this.boundingBox.boundingRect;
  }

  protected connect(): void {
    let model: BoxModel = this.model;

    let resizeTarget: Element | null = isDocument(this.target)
      ? this.target.getElementById('react-aria-icb-sentinel')
      : this.target;

    // Constrained to "border-box" and "content-box" models until we actually need more.
    // Support for remaining box models can be added through (discrete) CSS transitions.
    // https://github.com/LeaVerou/style-observer/blob/main/src/element-style-observer.js
    if (model !== 'border-box' && model !== 'content-box') {
      throw new Error(`${this.constructor.name} does not support "${model}" yet.`);
    }

    if (resizeTarget == null) {
      throw new Error(`${this.constructor.name} could not find its target.`);
    }

    this.observer.observe(resizeTarget, {box: model});
    this.connections.add(() => this.observer.unobserve(resizeTarget));
  }

  protected disconnect(): void {
    this.connections.forEach(fn => fn());
    this.connections.clear();
    this.changedAt = 0;
  }

  protected update(): void {
    let prev = this.head;
    let next = this.boundingRect;

    if (next.width !== prev.width || next.height !== prev.height) {
      let event = new BoxChangeEvent({
        boundingRect: next,
        model: this.model,
        precision: this.precision,
        transform: this.transform
      });

      this.head = next;
      this.last = prev;

      this.changedAt = event.timeStamp;

      this.dispatchEvent(event);
    }
  }
}

/**
 * An event emitter for position or size changes of a bounding box inside a layout.
 * Similar to the `ResizeObserver`, but extended by position tracking of all box models.
 */
export class DOMBoxAnchor<T extends HTMLElement> extends DOMResizableBox<T> {
  private static sentinels: WeakMap<HTMLElement, HTMLElement> = new WeakMap();

  protected animationFrame: number = 0;

  constructor(target: T, options?: BoxOptions<T>) {
    super(target, options);

    // Yield a hidden sentinel in the top-layer to anchor to this target. This effectively
    // converts offsets, e.g. top/left, into resize observable values, e.g. width/height.
    let sentinel = DOMBoxAnchor.sentinels.get(target);

    if (sentinel == null) {
      sentinel = target.ownerDocument.createElement('div');
      sentinel.id = `react-aria-anchor-${crypto.randomUUID()}`;
      sentinel.popover = 'manual';
      sentinel.style.all = 'initial';
      sentinel.style.display = 'block';
      sentinel.style.position = 'fixed';
      sentinel.style.visibility = 'hidden';
      sentinel.style.pointerEvents = 'none';
      sentinel.style.right = `anchor(--${sentinel.id} left)`;
      sentinel.style.bottom = `anchor(--${sentinel.id} top)`;
      sentinel.style.top = '0';
      sentinel.style.left = '0';
      sentinel[BOX_SYMBOL] = 0;
    }

    DOMBoxAnchor.sentinels.set(target, sentinel);
  }

  protected override connect(): void {
    let anchorTarget = DOMBoxAnchor.sentinels.get(this.target);

    // Constrained to "border-box" model until we actually need more.
    // Support for remaining box models can be added through (discrete) CSS transitions.
    // https://github.com/LeaVerou/style-observer/blob/main/src/element-style-observer.js
    if (this.model !== 'border-box') {
      throw new Error(`${this.constructor.name} does not support "${this.model}" yet.`);
    }

    if (anchorTarget == null) {
      throw new Error(`${this.constructor.name} could not find its target.`);
    }

    if (!anchorTarget.isConnected && typeof anchorTarget.showPopover === 'function') {
      this.target.ownerDocument.documentElement.appendChild(anchorTarget);
      anchorTarget.showPopover();
    } else if (!anchorTarget.isConnected) {
      this.target.ownerDocument.documentElement.appendChild(anchorTarget);
    }

    if (anchorTarget[BOX_SYMBOL] === 0) {
      let anchorName = this.target.style.getPropertyValue('anchor-name');
      let anchorNames = anchorName.split(',').map(name => name.trim());

      let filtered = anchorNames.filter(name => name);

      this.target.style.setProperty(
        'anchor-name',
        filtered.concat(`--${anchorTarget.id}`).join(', ')
      );
    }

    this.observer.observe(anchorTarget, {box: 'border-box'});
    ++anchorTarget[BOX_SYMBOL];

    this.connections.add(() => {
      if (anchorTarget[BOX_SYMBOL] === 1) {
        let anchorName = this.target.style.getPropertyValue('anchor-name');
        let anchorNames = anchorName.split(',').map(name => name.trim());

        let filtered = anchorNames.filter(name => name && name !== `--${anchorTarget.id}`);

        if (filtered.length > 0) {
          this.target.style.setProperty('anchor-name', filtered.join(', '));
          anchorTarget.remove();
        } else {
          this.target.style.removeProperty('anchor-name');
          anchorTarget.remove();
        }
      }

      this.observer.unobserve(anchorTarget);
      --anchorTarget[BOX_SYMBOL];
    });

    this.connections.add(
      addEvent(getPropagationTargets(this.target), 'scroll', this.update, {
        capture: true,
        passive: true
      })
    );

    super.connect();
  }

  protected override disconnect(): void {
    window.cancelAnimationFrame(this.animationFrame);
    this.animationFrame = 0;

    super.disconnect();
  }

  protected override update(): void {
    let prev = this.head;
    let next = this.boundingRect;

    if (Object.keys(next.toJSON()).some(key => next[key] !== prev[key])) {
      let event = new BoxChangeEvent({
        boundingRect: next,
        model: this.model,
        precision: this.precision,
        transform: this.transform
      });

      this.head = next;
      this.last = prev;

      this.changedAt = event.timeStamp;

      super.dispatchEvent(event);
    }

    if (performance.now() - this.changedAt <= 150) {
      this.animationFrame ||= window.requestAnimationFrame(() => {
        this.animationFrame = 0;
        this.update();
      });

      super.disconnect();
    } else if (this.changedAt !== 0) {
      this.connect();
    }
  }
}

/**
 * An event for layout changes of a bounding box.
 */
export class BoxChangeEvent extends CustomEvent<Required<BoundingOptions>> {
  declare public readonly type: 'react-aria-boxchange';

  public readonly boundingRect: DOMRect;

  constructor(init?: Omit<BoundingOptions & BoxChangeEvent, keyof CustomEvent>) {
    let {model, precision, transform} = {...BOX_OPTIONS, ...init};

    super('react-aria-boxchange', {detail: {model, precision, transform}});

    this.boundingRect = DOMRect.fromRect(init?.boundingRect);
  }
}
