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

import {chain, useEffectEvent} from '@react-aria/utils';
import {DOMAttributes, DragItem, DropItem} from '@react-types/shared';
import {readFromDataTransfer, writeToDataTransfer} from './utils';
import {useEffect, useRef} from 'react';
import {useFocus} from '@react-aria/interactions';

export interface ClipboardProps {
  /** A function that returns the items to copy. */
  getItems?: () => DragItem[],
  /** Handler that is called when the user triggers a copy interaction. */
  onCopy?: () => void,
  /** Handler that is called when the user triggers a cut interaction. */
  onCut?: () => void,
  /** Handler that is called when the user triggers a paste interaction. */
  onPaste?: (items: DropItem[]) => void,
  /** Whether the clipboard is disabled. */
  isDisabled?: boolean
}

export interface ClipboardResult {
  /** Props for the element that will handle clipboard events. */
  clipboardProps: DOMAttributes
}

const globalEvents = new Map();
function addGlobalEventListener(event, fn) {
  let eventData = globalEvents.get(event);
  if (!eventData) {
    let handlers = new Set<(e: Event) => void>();
    let listener = (e) => {
      for (let handler of handlers) {
        handler(e);
      }
    };

    eventData = {listener, handlers};
    globalEvents.set(event, eventData);

    document.addEventListener(event, listener);
  }

  eventData.handlers.add(fn);
  return () => {
    eventData.handlers.delete(fn);
    if (eventData.handlers.size === 0) {
      document.removeEventListener(event, eventData.listener);
      globalEvents.delete(event);
    }
  };
}

/**
 * Handles clipboard interactions for a focusable element. Supports items of multiple
 * data types, and integrates with the operating system native clipboard.
 */
export function useClipboard(options: ClipboardProps): ClipboardResult {
  let {isDisabled} = options;
  let isFocusedRef = useRef(false);
  let {focusProps} = useFocus({
    onFocusChange: (isFocused) => {
      isFocusedRef.current = isFocused;
    }
  });

  let onBeforeCopy = useEffectEvent((e: ClipboardEvent) => {
    // Enable the "Copy" menu item in Safari if this element is focused and copying is supported.
    if (isFocusedRef.current && options.getItems) {
      e.preventDefault();
    }
  });

  let onCopy = useEffectEvent((e: ClipboardEvent) => {
    if (!isFocusedRef.current || !options.getItems) {
      return;
    }

    e.preventDefault();
    writeToDataTransfer(e.clipboardData, options.getItems());
    options.onCopy?.();
  });

  let onBeforeCut = useEffectEvent((e: ClipboardEvent) => {
    if (isFocusedRef.current && options.onCut && options.getItems) {
      e.preventDefault();
    }
  });

  let onCut = useEffectEvent((e: ClipboardEvent) => {
    if (!isFocusedRef.current || !options.onCut || !options.getItems) {
      return;
    }

    e.preventDefault();
    writeToDataTransfer(e.clipboardData, options.getItems());
    options.onCut();
  });

  let onBeforePaste = useEffectEvent((e: ClipboardEvent) => {
    // Unfortunately, e.clipboardData.types is not available in this event so we always
    // have to enable the Paste menu item even if the type of data is unsupported.
    if (isFocusedRef.current && options.onPaste) {
      e.preventDefault();
    }
  });

  let onPaste = useEffectEvent((e: ClipboardEvent) => {
    if (!isFocusedRef.current || !options.onPaste) {
      return;
    }

    e.preventDefault();
    let items = readFromDataTransfer(e.clipboardData);
    options.onPaste(items);
  });

  useEffect(() => {
    if (isDisabled) {
      return;
    }
    return chain(
      addGlobalEventListener('beforecopy', onBeforeCopy),
      addGlobalEventListener('copy', onCopy),
      addGlobalEventListener('beforecut', onBeforeCut),
      addGlobalEventListener('cut', onCut),
      addGlobalEventListener('beforepaste', onBeforePaste),
      addGlobalEventListener('paste', onPaste)
    );
  }, [isDisabled, onBeforeCopy, onCopy, onBeforeCut, onCut, onBeforePaste, onPaste]);

  return {
    clipboardProps: focusProps
  };
}
