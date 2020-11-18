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
import {useIsSSR} from '@react-aria/ssr';

export interface Locale {
  /** The [BCP47](https://www.ietf.org/rfc/bcp/bcp47.txt) language code for the locale. */
  locale: string,
  /** The writing direction for the locale. */
  direction: Direction
}

/**
 * Gets the locale setting of the browser.
 */
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

/**
 * Returns the current browser/system language, and updates when it changes.
 */
export function useDefaultLocale(): Locale {
  let isSSR = useIsSSR();
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

  // We cannot determine the browser's language on the server, so default to
  // en-US. This will be updated after hydration on the client to the correct value.
  if (isSSR) {
    return {
      locale: 'en-US',
      direction: 'ltr'
    };
  }

  return defaultLocale;
}
