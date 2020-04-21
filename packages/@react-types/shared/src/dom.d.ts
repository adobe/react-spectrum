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

import {ClipboardEventHandler, CompositionEventHandler, FormEventHandler, ReactEventHandler} from 'react';

// A set of common DOM props that are allowed on any component
// Ensure this is synced with DOMPropNames in filterDOMProps
export interface DOMProps {
  id?: string,
  tabIndex?: number,
  role?: string,

  /**
   * Defines a string value that labels the current element.
   * @see aria-labelledby.
   */
  'aria-label'?: string,

  /**
   * Identifies the element (or elements) that labels the current element.
   * @see aria-describedby.
   */
  'aria-labelledby'?: string,

  /**
   * Identifies the element (or elements) that describes the object.
   * @see aria-labelledby
   */
  'aria-describedby'?: string,

  /**
   * Identifies the element (or elements) whose contents or presence are controlled by the current element.
   * @see aria-owns.
   */
  'aria-controls'?: string,

  /**
   * Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship
   * between DOM elements where the DOM hierarchy cannot be used to represent the relationship.
   * @see aria-controls.
   */
  'aria-owns'?: string,

  /**
   * Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable.
   */
  'aria-hidden'?: boolean | 'false' | 'true'
}

// DOM props that apply to all text inputs
// Ensure this is synced with useTextField
export interface TextInputDOMProps extends DOMProps {
  autoComplete?: string,
  maxLength?: number,
  minLength?: number,
  name?: string,
  pattern?: string,
  placeholder?: string,
  type?: 'text' | 'search' | 'url' | 'tel' | 'email' | 'password' | string,

  /**
   * Hints at the type of data that might be entered by the user while editing the element or its contents
   * @see https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute
   */
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search',

  // Clipboard events
  onCopy?: ClipboardEventHandler<HTMLInputElement>,
  onCut?: ClipboardEventHandler<HTMLInputElement>,
  onPaste?: ClipboardEventHandler<HTMLInputElement>,

  // Composition events
  onCompositionEnd?: CompositionEventHandler<HTMLInputElement>,
  onCompositionStart?: CompositionEventHandler<HTMLInputElement>,
  onCompositionUpdate?: CompositionEventHandler<HTMLInputElement>,

  // Selection events
  onSelect?: ReactEventHandler<HTMLInputElement>,

  // Input events
  onBeforeInput?: FormEventHandler<HTMLInputElement>,
  onInput?: FormEventHandler<HTMLInputElement>
}
