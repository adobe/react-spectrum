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

import {useCollator} from './useCollator';

export interface Filter {
  /** Returns whether a string starts with a given substring. */
  startsWith(string: string, substring: string): boolean,
  /** Returns whether a string ends with a given substring. */
  endsWith(string: string, substring: string): boolean,
  /** Returns whether a string contains a given substring. */
  contains(string: string, substring: string): boolean
}

/**
 * Provides localized string search functionality that is useful for filtering or matching items
 * in a list. Options can be provided to adjust the sensitivity to case, diacritics, and other parameters.
 */
export function useFilter(options?: Intl.CollatorOptions): Filter {
  let collator = useCollator({
    usage: 'search',
    ...options
  });

  // TODO(later): these methods don't currently support the ignorePunctuation option.

  return {
    startsWith(string, substring) {
      if (substring.length === 0) {
        return true;
      }

      // Normalize both strings so we can slice safely
      // TODO: take into account the ignorePunctuation option as well...
      string = string.normalize('NFC');
      substring = substring.normalize('NFC');
      return collator.compare(string.slice(0, substring.length), substring) === 0;
    },
    endsWith(string, substring) {
      if (substring.length === 0) {
        return true;
      }

      string = string.normalize('NFC');
      substring = substring.normalize('NFC');
      return collator.compare(string.slice(-substring.length), substring) === 0;
    },
    contains(string, substring) {
      if (substring.length === 0) {
        return true;
      }

      string = string.normalize('NFC');
      substring = substring.normalize('NFC');

      let scan = 0;
      let sliceLen = substring.length;
      for (; scan + sliceLen <= string.length; scan++) {
        let slice = string.slice(scan, scan + sliceLen);
        if (collator.compare(substring, slice) === 0) {
          return true;
        }
      }

      return false;
    }
  };
}
