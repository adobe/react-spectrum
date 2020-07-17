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

// taken from: https://stackoverflow.com/questions/51603250/typescript-3-parameter-list-intersection-type/51604379#51604379
type TupleTypes<T> = { [P in keyof T]: T[P] } extends { [key: number]: infer V }
  ? V
  : never;
type UnionToIntersection<U> = (U extends any
  ? (k: U) => void
  : never) extends ((k: infer I) => void)
  ? I
  : never;

/**
 * Merges multiple props objects together. Event handlers are chained,
 * classNames are combined, and ids are deduplicated. For all other props,
 * the last prop object overrides all previous ones.
 * @param a - The first set of props to merge.
 * @param rest - The remaining sets of props to merge.
 */
export function mergeProps<T extends Props, U extends Props[]>(
  a: T,
  ...rest: U
): T & UnionToIntersection<TupleTypes<U>> {
  let result: Props = { ...a };
  for (let b of rest) {
    for (let key in result) {
      // Chain events
      if (
        /^on[A-Z]/.test(key) &&
        typeof result[key] === "function" &&
        typeof b[key] === "function"
      ) {
        result[key] = chain(result[key], b[key]);

        // Merge classnames, sometimes classNames are empty string which eval to false, so we just need to do a type check
      } else if (
        key === "className" &&
        typeof result.className === "string" &&
        typeof b.className === "string"
      ) {
        result[key] = classNames(result.className, b.className);
      } else if (
        key === "UNSAFE_className" &&
        typeof result.UNSAFE_className === "string" &&
        typeof b.UNSAFE_className === "string"
      ) {
        result[key] = classNames(result.UNSAFE_className, b.UNSAFE_className);
      } else if (key === "id" && result.id && b.id) {
        result.id = mergeIds(result.id, b.id);

        // Override others
      } else {
        result[key] = b[key] !== undefined ? b[key] : result[key];
      }
    }

    // Add props from b that are not in a
    for (let key in b) {
      if (result[key] === undefined) {
        result[key] = b[key];
      }
    }
  }

  return result as T & UnionToIntersection<TupleTypes<U>>;
}