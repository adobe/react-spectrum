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

export function keyDiff<T>(a: Map<T, any>, b: Map<T, any>): Set<T> {
  let res = new Set<T>();

  for (let key of a.keys()) {
    if (!b.has(key)) {
      res.add(key);
    }
  }

  return res;
}

/**
 * Returns the key difference between two maps. Returns a set of
 * keys to add to and remove from a to make it equal to b.
 * @private
 */
export function difference<T>(a: Map<T, any>, b: Map<T, any>) {
  let toRemove = keyDiff(a, b);
  let toAdd = keyDiff(b, a);
  let toUpdate = new Set;
  for (let key of a.keys()) {
    if (b.has(key)) {
      toUpdate.add(key);
    }
  }
  return {toRemove, toAdd, toUpdate};
}

/**
 * Returns an iterator that yields the items in all of the given iterators.
 * @private
 */
export function* concatIterators<T>(...iterators: Iterable<T>[]) {
  for (let iterator of iterators) {
    yield* iterator;
  }
}

/**
 * Inverts the keys and values of an object.
 * @private
 */
export function invert(object) {
  let res = {};
  for (let key in object) {
    res[object[key]] = key;
  }

  return res;
}
