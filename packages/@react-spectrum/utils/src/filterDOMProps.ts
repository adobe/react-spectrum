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

import {DOMProps} from '@react-types/shared';

// IMPORTANT: this needs to be synced with the TypeScript definition of DOMProps
const DOMPropNames = {
  id: 1,
  tabIndex: 1,
  role: 1,
  'aria-label': 1,
  'aria-labelledby': 1,
  'aria-describedby': 1,
  'aria-controls': 1,
  'aria-owns': 1,
  'aria-hidden': 1
};

// Sync with TypeScript definition of TextInputDOMProps
export const TextInputDOMPropNames = {
  autoComplete: 1,
  maxLength: 1,
  minLength: 1,
  name: 1,
  pattern: 1,
  placeholder: 1,
  type: 1,
  inputMode: 1,

  // Clipboard events
  onCopy: 1,
  onCut: 1,
  onPaste: 1,

  // Composition events
  onCompositionEnd: 1,
  onCompositionStart: 1,
  onCompositionUpdate: 1,

  // Selection events
  onSelect: 1,

  // Input events
  onBeforeInput: 1,
  onInput: 1
};

// Based on DOMAttributes from react types
export const DOMEventPropNames = {  
  // Focus events
  onFocus: 1,
  onBlur: 1,

  // Keyboard events
  onKeyDown: 1,
  onKeyPress: 1,
  onKeyUp: 1,

  // Mouse events
  onAuxClick: 1,
  onClick: 1,
  onContextMenu: 1,
  onDoubleClick: 1,
  onDrag: 1,
  onDragEnd: 1,
  onDragEnter: 1,
  onDragExit: 1,
  onDragLeave: 1,
  onDragOver: 1,
  onDragStart: 1,
  onDrop: 1,
  onMouseDown: 1,
  onMouseEnter: 1,
  onMouseLeave: 1,
  onMouseMove: 1,
  onMouseOut: 1,
  onMouseOver: 1,
  onMouseUp: 1,

  // Touch events
  onTouchCancel: 1,
  onTouchEnd: 1,
  onTouchMove: 1,
  onTouchStart: 1,

  // Pointer events
  onPointerDown: 1,
  onPointerMove: 1,
  onPointerUp: 1,
  onPointerCancel: 1,
  onPointerEnter: 1,
  onPointerLeave: 1,
  onPointerOver: 1,
  onPointerOut: 1,
  onGotPointerCapture: 1,
  onLostPointerCapture: 1,

  // UI events
  onScroll: 1,

  // Wheel events
  onWheel: 1
};

/**
 * Checking for data-* props
 */
const propRe = /^(data-.*)$/;

// Filters out all props that aren't valid DOM props or are user defined via override prop obj.
export function filterDOMProps(props, override = {}): DOMProps {
  const filterProps = {};
  const propFilter = {...DOMPropNames, ...override};

  for (const prop in props) {
    if (Object.prototype.hasOwnProperty.call(props, prop) && (propFilter[prop] || propRe.test(prop))) {
      filterProps[prop] = props[prop];
    }
  }

  return filterProps;
}
