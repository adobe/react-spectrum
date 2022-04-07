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
import clsx from 'clsx';
import {mergeIds} from './useId';

interface Props {
  [key: string]: any
}

// taken from: https://stackoverflow.com/questions/51603250/typescript-3-parameter-list-intersection-type/51604379#51604379
type TupleTypes<T> = { [P in keyof T]: T[P] } extends { [key: number]: infer V } ? V : never;
// eslint-disable-next-line no-undef, @typescript-eslint/no-unused-vars
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

/**
 * Merges multiple props objects together. Event handlers are chained,
 * classNames are combined, and ids are deduplicated - different ids
 * will trigger a side-effect and re-render components hooked up with `useId`.
 * For all other props, the last prop object overrides all previous ones.
 * @param args - Multiple sets of props to merge together.
 */
export function mergeProps<T extends Props[]>(...args: T): UnionToIntersection<TupleTypes<T>> {
  // Start with a base clone of the first argument. This is a lot faster than starting
  // with an empty object and adding properties as we go.
  let result: Props = {...args[0]};
  for (let i = 1; i < args.length; i++) {
    let props = args[i];
    for (let key in props) {
      let a = result[key];
      let b = props[key];

      // Chain events
      if (
        typeof a === 'function' &&
        typeof b === 'function' &&
        // This is a lot faster than a regex.
        key[0] === 'o' &&
        key[1] === 'n' &&
        key.charCodeAt(2) >= /* 'A' */ 65 &&
        key.charCodeAt(2) <= /* 'Z' */ 90
      ) {
        result[key] = chain(a, b);

        // Merge classnames, sometimes classNames are empty string which eval to false, so we just need to do a type check
      } else if (
        (key === 'className' || key === 'UNSAFE_className') &&
        typeof a === 'string' &&
        typeof b === 'string'
      ) {
        result[key] = clsx(a, b);
      } else if (key === 'id' && a && b) {
        result.id = mergeIds(a, b);
        // Override others
      } else {
        result[key] = b !== undefined ? b : a;
      }
    }
  }

  return result as UnionToIntersection<TupleTypes<T>>;
}
