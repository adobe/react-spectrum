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

export let idsUpdaterMap: Map<string, {current: string | null}[]> = new Map();

/**
 * Merges two ids.
 * Different ids will trigger a side-effect and re-render components hooked up with `useId`.
 */
export function mergeIds(idA: string, idB: string): string {
  if (idA === idB) {
    return idA;
  }

  let setIdsA = idsUpdaterMap.get(idA);
  if (setIdsA) {
    setIdsA.forEach(ref => (ref.current = idB));
    return idB;
  }

  let setIdsB = idsUpdaterMap.get(idB);
  if (setIdsB) {
    setIdsB.forEach(ref => (ref.current = idA));
    return idA;
  }

  return idB;
}
