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

import {isRTL} from './utils';
import {Locale, useDefaultLocale} from './useDefaultLocale';
import React, {ReactNode, useContext} from 'react';

export interface I18nProviderProps {
  /** Contents that should have the locale applied. */
  children: ReactNode,
  /** The locale to apply to the children. */
  locale?: string
}

const I18nContext = React.createContext<Locale | null>(null);

/**
 * Provides the locale for the application to all child components.
 */
export function I18nProvider(props: I18nProviderProps) {
  let {locale, children} = props;
  let defaultLocale = useDefaultLocale();

  let value: Locale = React.useMemo(() => {
    if (!locale) {
      return defaultLocale;
    }

    return {
      locale,
      direction: isRTL(locale) ? 'rtl' : 'ltr'
    };
  }, [defaultLocale, locale]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Returns the current locale and layout direction.
 */
export function useLocale(): Locale {
  let defaultLocale = useDefaultLocale();
  let context = useContext(I18nContext);
  return context || defaultLocale;
}
