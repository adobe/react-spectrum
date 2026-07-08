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
import {useEvent} from 'react-aria/private/utils/useEvent';

export interface TokenProps {}

export interface TokenAria {
  tokenProps: HTMLAttributes<HTMLSpanElement>;
  isSelected: boolean;
}

export function useToken(
  // Unused but matches the normal signature.
  _props: TokenProps,
  _state: any,
  ref: RefObject<HTMLSpanElement | null>
): TokenAria {
  let [isSelected, setSelected] = useState(false);

  useEvent(useRef(document), 'selectionchange', () => {
    let selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !ref.current) {
      return;
    }

    let range = selection.getRangeAt(0);
    if (!range.collapsed && range.intersectsNode(ref.current)) {
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
        WebkitUserSelect: 'all'
      }
    },
    isSelected
  };
}
