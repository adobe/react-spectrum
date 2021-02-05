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
  let result: Props = {};
  for (let props of args) {
    for (let key in result) {
      // Chain events
      if (
        /^on[A-Z]/.test(key) &&
        typeof result[key] === 'function' &&
        typeof props[key] === 'function'
      ) {
        result[key] = chain(result[key], props[key]);

        // Merge classnames, sometimes classNames are empty string which eval to false, so we just need to do a type check
      } else if (
        key === 'className' &&
        typeof result.className === 'string' &&
        typeof props.className === 'string'
      ) {
        result[key] = clsx(result.className, props.className);
      } else if (
        key === 'UNSAFE_className' &&
        typeof result.UNSAFE_className === 'string' &&
        typeof props.UNSAFE_className === 'string'
      ) {
        result[key] = clsx(result.UNSAFE_className, props.UNSAFE_className);
      } else if (key === 'id' && result.id && props.id) {
        result.id = mergeIds(result.id, props.id);
        // Override others
      } else {
        result[key] = props[key] !== undefined ? props[key] : result[key];
      }
    }

    // Add props from b that are not in a
    for (let key in props) {
      if (result[key] === undefined) {
        result[key] = props[key];
      }
    }
  }

  return result as UnionToIntersection<TupleTypes<T>>;
}
