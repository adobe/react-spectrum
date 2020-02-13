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
import {chain} from './chain';
import classNames from 'classnames';
import {mergeIds} from './useId';

interface Props {
  [key: string]: any
}

export function mergeProps<T extends Props, U extends Props>(a: T, b: U): T & U {
  let res: Props = {};
  for (let key in a) {
    // Chain events
    if (/^on[A-Z]/.test(key) && typeof a[key] === 'function' && typeof b[key] === 'function') {
      res[key] = chain(a[key], b[key]);

    // Merge classnames, sometimes classNames are empty string which eval to false, so we just need to do a type check
    } else if (key === 'className' && typeof a.className === 'string' && typeof b.className === 'string') {
      res[key] = classNames(a.className, b.className);

    } else if (key === 'id' && a.id && b.id) {
      res.id = mergeIds(a.id, b.id);

    // Override others
    } else {
      res[key] = b[key] !== undefined ? b[key] : a[key];
    }
  }

  // Add props from b that are not in a
  for (let key in b) {
    if (a[key] === undefined) {
      res[key] = b[key];
    }
  }

  return res as T & U;
}
