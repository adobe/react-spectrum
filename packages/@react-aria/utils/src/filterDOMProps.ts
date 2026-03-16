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

import {AriaLabelingProps, DOMProps, GlobalDOMAttributes, LinkDOMProps} from '@react-types/shared';

const DOMPropNames = new Set([
  'id'
]);

const labelablePropNames = new Set([
  'aria-label',
  'aria-labelledby',
  'aria-describedby',
  'aria-details'
]);

// See LinkDOMProps in dom.d.ts.
const linkPropNames = new Set([
  'href',
  'hrefLang',
  'target',
  'rel',
  'download',
  'ping',
  'referrerPolicy'
]);

const globalAttrs = new Set([
  'dir',
  'lang',
  'hidden',
  'inert',
  'translate'
]);

const globalEvents = new Set([
  'onClick',
  'onAuxClick',
  'onContextMenu',
  'onDoubleClick',
  'onMouseDown',
  'onMouseEnter',
  'onMouseLeave',
  'onMouseMove',
  'onMouseOut',
  'onMouseOver',
  'onMouseUp',
  'onTouchCancel',
  'onTouchEnd',
  'onTouchMove',
  'onTouchStart',
  'onPointerDown',
  'onPointerMove',
  'onPointerUp',
  'onPointerCancel',
  'onPointerEnter',
  'onPointerLeave',
  'onPointerOver',
  'onPointerOut',
  'onGotPointerCapture',
  'onLostPointerCapture',
  'onScroll',
  'onWheel',
  'onAnimationStart',
  'onAnimationEnd',
  'onAnimationIteration',
  'onTransitionCancel',
  'onTransitionEnd',
  'onTransitionRun',
  'onTransitionStart'
]);

interface Options {
  /**
   * If labelling associated aria properties should be included in the filter.
   */
  labelable?: boolean,
  /** Whether the element is a link and should include DOM props for <a> elements. */
  isLink?: boolean,
  /** Whether to include global DOM attributes. */
  global?: boolean,
  /** Whether to include DOM events. */
  events?: boolean,
  /**
   * A Set of other property names that should be included in the filter.
   */
  propNames?: Set<string>
}

const propRe = /^(data-.*)$/;

/**
 * Filters out all props that aren't valid DOM props or defined via override prop obj.
 * @param props - The component props to be filtered.
 * @param opts - Props to override.
 */
export function filterDOMProps(props: DOMProps & AriaLabelingProps & LinkDOMProps & GlobalDOMAttributes, opts: Options = {}): DOMProps & AriaLabelingProps & GlobalDOMAttributes {
  let {labelable, isLink, global, events = global, propNames} = opts;
  let filteredProps = {};

  for (const prop in props) {
    if (
      Object.prototype.hasOwnProperty.call(props, prop) && (
        DOMPropNames.has(prop) ||
        (labelable && labelablePropNames.has(prop)) ||
        (isLink && linkPropNames.has(prop)) ||
        (global && globalAttrs.has(prop)) ||
        (events && (globalEvents.has(prop) || (prop.endsWith('Capture') && globalEvents.has(prop.slice(0, -7))))) ||
        propNames?.has(prop) ||
        propRe.test(prop)
      )
    ) {
      filteredProps[prop] = props[prop];
    }
  }

  return filteredProps;
}
