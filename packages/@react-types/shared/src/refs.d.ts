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

import {ReactElement, Ref, RefAttributes} from 'react';

export interface DOMRefValue<T extends HTMLElement = HTMLElement> {
  UNSAFE_getDOMNode(): T | null
}

export interface FocusableRefValue<T extends HTMLElement = HTMLElement, D extends HTMLElement = T> extends DOMRefValue<D> {
  focus(): void
}

export type DOMRef<T extends HTMLElement = HTMLElement> = Ref<DOMRefValue<T>>;
export type FocusableRef<T extends HTMLElement = HTMLElement> = Ref<FocusableRefValue<T>>;

export interface RefObject<T> {
  current: T
}

// Override forwardRef types so generics work.
declare function forwardRef<T, P = {}>(
  render: (props: P, ref: Ref<T>) => ReactElement | null
): (props: P & RefAttributes<T>) => ReactElement | null;

export type forwardRefType = typeof forwardRef;
