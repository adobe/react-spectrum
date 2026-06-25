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

import {DOMRef, DOMRefValue, RefObject} from '@react-types/shared';
import {useImperativeHandle, useRef} from 'react';

export function createDOMRef<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>
): DOMRefValue<T> {
  return {
    UNSAFE_getDOMNode() {
      return ref.current;
    }
  };
}

export function useDOMRef<T extends HTMLElement = HTMLElement>(
  ref: DOMRef<T>
): RefObject<T | null> {
  let domRef = useRef<T>(null);
  useImperativeHandle(ref, () => createDOMRef(domRef));
  return domRef;
}
