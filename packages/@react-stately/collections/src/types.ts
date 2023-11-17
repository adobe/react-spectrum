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

import {Key} from '@react-types/shared';
import {ReactElement, ReactNode} from 'react';

export interface PartialNode<T> {
  type?: string,
  key?: Key,
  value?: T,
  element?: ReactElement,
  wrapper?: (element: ReactElement) => ReactElement,
  rendered?: ReactNode,
  textValue?: string,
  'aria-label'?: string,
  index?: number,
  renderer?: (item: T) => ReactElement,
  hasChildNodes?: boolean,
  childNodes?: () => IterableIterator<PartialNode<T>>,
  props?: any,
  shouldInvalidate?: (context: unknown) => boolean
}
