/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing
 */

import {HTMLAttributes, RefObject, useRef, useState} from 'react';
import {isVirtualClick} from '../utils/isVirtualEvent';
import {useEvent} from '../utils/useEvent';

export interface TokenProps {}

export interface TokenAria {
  /** Props for the token element. */
  tokenProps: HTMLAttributes<HTMLSpanElement>;
  /** Whether the token is currently selected. */
  isSelected: boolean;
}

/**
 * Provides the behavior and accessibility implementation for a token within a token field.
 * A token field allows users to enter text with inline tokens.
 */
export function useToken(
  // Unused but matches the normal signature.
  _props: TokenProps,
  _state: any,
  ref: RefObject<HTMLSpanElement | null>
): TokenAria {
  let [isSelected, setSelected] = useState(false);

  useEvent(useRef(typeof document !== 'undefined' ? document : null), 'selectionchange', () => {
    let selection = window.getSelection();
    if (!selection || !ref.current) {
      return;
    }

    let range = selection.rangeCount === 0 ? null : selection.getRangeAt(0);
    if (!range?.collapsed && range?.intersectsNode(ref.current)) {
      setSelected(true);
    } else {
      setSelected(false);
    }
  });

  return {
    tokenProps: {
      contentEditable: false,
      suppressContentEditableWarning: true,
      style: {
        userSelect: 'all',
        WebkitUserSelect: 'all',
        WebkitTapHighlightColor: 'transparent'
      },
      onClick(e) {
        // Select the token when a screen reader clicks on it.
        if (isSelected || !isVirtualClick(e.nativeEvent)) {
          return;
        }
        let selection = window.getSelection();
        let wrapper = ref.current?.parentElement;
        if (!selection || !wrapper) {
          return;
        }
        let range = document.createRange();
        range.setStartBefore(wrapper);
        range.setEndAfter(wrapper);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    },
    isSelected
  };
}
