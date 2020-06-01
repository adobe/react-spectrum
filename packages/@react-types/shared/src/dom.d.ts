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

export interface AriaLabelingProps {
  /**
   * Defines a string value that labels the current element.
   */
  'aria-label'?: string,

  /**
   * Identifies the element (or elements) that labels the current element.
   */
  'aria-labelledby'?: string,

  /**
   * Identifies the element (or elements) that describes the object.
   */
  'aria-describedby'?: string,

  /**
   * Identifies the element (or elements) that provide a detailed, extended description for the object.
   */
  'aria-details'?: string
}

export interface AriaValidationProps {
  // https://www.w3.org/TR/wai-aria-1.2/#aria-errormessage
  /**
   * Identifies the element that provides an error message for the object.
   */
  'aria-errormessage'?: string
}

// A set of common DOM props that are allowed on any component
// Ensure this is synced with DOMPropNames in filterDOMProps
export interface DOMProps {
  /**
   * The element's unique identifier.
   */
  id?: string
}

export interface FocusableDOMProps extends DOMProps {
  /**
   * Indicates whether an element is focusable, allows or prevents them from being sequentially focusable, 
   * and determines their relative ordering for sequential focus navigation.
   */
  tabIndex?: number
}

// DOM props that apply to all text inputs
// Ensure this is synced with useTextField
export interface TextInputDOMProps extends DOMProps {
  /**
   * Describes the type of autocomplete functionality the input should provide if any.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefautocomplete
   */
  autoComplete?: string,

  /**
   * The maximum number of characters supported by the input.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefmaxlength
   */
  maxLength?: number,

  /**
   * The minimum number of characters required by the input.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefminlength
   */
  minLength?: number,

  /**
   * Name of the input control.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname
   */
  name?: string,

  /**
   * Regex pattern that the value of the input must match to be valid.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefpattern
   */
  pattern?: string,

  /**
   * Content that appears in the input when the input is empty.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefplaceholder
   */
  placeholder?: string,

  /**
   * The type of input control to render.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdeftype
   */
  type?: 'text' | 'search' | 'url' | 'tel' | 'email' | 'password' | string,
  
  /**
   * Hints at the type of data that might be entered by the user while editing the element or its contents
   * @see https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute
   */
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search',

  // Clipboard events
  /**
   * Handler that is called when the user attempts to copy text.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/oncopy
   */
  onCopy?: ClipboardEventHandler<HTMLInputElement>,

  /**
   * Handler that is called when the user attempts to cut text.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/oncut
   */
  onCut?: ClipboardEventHandler<HTMLInputElement>,

  /**
   * Handler that is called when the user attempts to paste text.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/onpaste
   */
  onPaste?: ClipboardEventHandler<HTMLInputElement>,

  // Composition events
  /**
   * Handler that is called when a text composition system starts a new text composition session.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/compositionend_event
   */
  onCompositionEnd?: CompositionEventHandler<HTMLInputElement>,

  /**
   * Handler that is called when a text composition system completes or cancels the current text composition session.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/compositionstart_event
   */
  onCompositionStart?: CompositionEventHandler<HTMLInputElement>,

  /**
   * Handler that is called when a new character is received in the current text composition session.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/compositionupdate_event
   */
  onCompositionUpdate?: CompositionEventHandler<HTMLInputElement>,

  // Selection events
  /**
   * Handler that fires when some text in the input has been selected.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/select_event
   */
  onSelect?: ReactEventHandler<HTMLInputElement>,

  // Input events
  /**
   * Handler that fires when the input value is about to be modified.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/beforeinput_event
   */
  onBeforeInput?: FormEventHandler<HTMLInputElement>,
  /**
   * Handler that fires when the input value is modified.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/input_event
   */
  onInput?: FormEventHandler<HTMLInputElement>
}
