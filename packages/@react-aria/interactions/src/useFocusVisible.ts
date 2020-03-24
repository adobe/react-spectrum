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

import {useEffect, useState} from 'react';

type Modality = 'keyboard' | 'pointer';
type HandlerEvent = PointerEvent | MouseEvent | KeyboardEvent | FocusEvent;
type Handler = (modality: Modality, e: HandlerEvent) => void;
interface FocusVisibleProps {
  isTextInput?: boolean,
  autoFocus?: boolean
}

interface FocusVisibleResult {
  isFocusVisible: boolean
}

let isGlobalFocusVisible = true;
let changeHandlers = new Set<Handler>();
let hasSetupGlobalListeners = false;
let hasEventBeforeFocus = false;

const isMac =
  typeof window !== 'undefined' && window.navigator != null
    ? /^Mac/.test(window.navigator.platform)
    : false;

// Only Tab or Esc keys will make focus visible on text input elements
const FOCUS_VISIBLE_INPUT_KEYS = {
  Tab: true,
  Escape: true
};

function triggerChangeHandlers(modality: Modality, e: HandlerEvent) {
  for (let handler of changeHandlers) {
    handler(modality, e);
  }
}

// Helper function to determine if a KeyboardEvent is unmodified and could make keyboard focus styles visible
function isValidKey(e: KeyboardEvent) {
  return !(e.metaKey || (!isMac && e.altKey) || e.ctrlKey);
}

function handleKeyboardEvent(e: KeyboardEvent) {
  hasEventBeforeFocus = true;
  if (isValidKey(e)) {
    isGlobalFocusVisible = true;
    triggerChangeHandlers('keyboard', e);
  }
}

function handlePointerEvent(e: PointerEvent | MouseEvent) {
  isGlobalFocusVisible = false;
  if (e.type === 'mousedown' || e.type === 'pointerdown') {
    hasEventBeforeFocus = true;
    triggerChangeHandlers('pointer', e);
  }
}

function handleFocusEvent(e: FocusEvent) {
  // If a focus event occurs without a preceding keyboard or pointer event, switch to keyboard modality.
  // This occurs, for example, when navigating a form with the next/previous buttons on iOS.
  if (!hasEventBeforeFocus) {
    isGlobalFocusVisible = true;
    triggerChangeHandlers('keyboard', e);
  }

  hasEventBeforeFocus = false;
}

// Setup global event listeners to control when keyboard focus style should be visible
function setupGlobalFocusEvents() {
  if (hasSetupGlobalListeners) {
    return;
  }

  document.addEventListener('keydown', handleKeyboardEvent, true);
  document.addEventListener('keyup', handleKeyboardEvent, true);

  if (typeof PointerEvent !== 'undefined') {
    document.addEventListener('pointerdown', handlePointerEvent, true);
    document.addEventListener('pointermove', handlePointerEvent, true);
    document.addEventListener('pointerup', handlePointerEvent, true);
  } else {
    document.addEventListener('mousedown', handlePointerEvent, true);
    document.addEventListener('mousemove', handlePointerEvent, true);
    document.addEventListener('mouseup', handlePointerEvent, true);
  }

  document.addEventListener('focusin', handleFocusEvent, false);

  hasSetupGlobalListeners = true;
}

/**
 * Manages global focus visible state, and subscribes individual components for updates
 */
export function useFocusVisible(props: FocusVisibleProps): FocusVisibleResult {
  setupGlobalFocusEvents();

  let {isTextInput, autoFocus} = props;
  let [isFocusVisible, setFocusVisible] = useState(autoFocus || isGlobalFocusVisible);
  useEffect(() => {
    let handler = (modality, e) => {
      // If this is a text input component, don't update the focus visible style when 
      // typing except for when the Tab and Escape keys are pressed.
      if (isTextInput && modality === 'keyboard' && !FOCUS_VISIBLE_INPUT_KEYS[e.key]) {
        return;
      }

      setFocusVisible(isGlobalFocusVisible);
    };
  
    changeHandlers.add(handler);
    return () => {
      changeHandlers.delete(handler);
    };
  }, [isTextInput]);

  return {isFocusVisible};
}
