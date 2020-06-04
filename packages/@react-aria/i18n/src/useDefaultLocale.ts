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

import {Direction} from '@react-types/shared';
import {isRTL} from './utils';
import {useEffect, useState} from 'react';

export interface Locale {
  locale: string,
  direction: Direction
}

export function getDefaultLocale(): Locale {
  // @ts-ignore
  let locale = (typeof navigator !== 'undefined' && (navigator.language || navigator.userLanguage)) || 'en-US';
  return {
    locale,
    direction: isRTL(locale) ? 'rtl' : 'ltr'
  };
}

let currentLocale = getDefaultLocale();
let listeners = new Set<(locale: Locale) => void>();

function updateLocale() {
  currentLocale = getDefaultLocale();
  for (let listener of listeners) {
    listener(currentLocale);
  }
}

// Returns the current browser/system language, and updates when it changes.
export function useDefaultLocale() {
  let [defaultLocale, setDefaultLocale] = useState(currentLocale);

  useEffect(() => {
    if (listeners.size === 0) {
      window.addEventListener('languagechange', updateLocale);
    }

    listeners.add(setDefaultLocale);

    return () => {
      listeners.delete(setDefaultLocale);
      if (listeners.size === 0) {
        window.removeEventListener('languagechange', updateLocale);
      }
    };
  }, []);

  return defaultLocale;
}
