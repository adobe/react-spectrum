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
import React, {JSX, ReactNode, useContext} from 'react';
import {useDefaultLocale} from './useDefaultLocale';

export interface Locale {
  /** The [BCP47](https://www.ietf.org/rfc/bcp/bcp47.txt) language code for the locale. */
  locale: string;
  /** The writing direction for the locale. */
  direction: Direction;
}

export interface I18nProviderProps {
  /** Contents that should have the locale applied. */
  children: ReactNode;
  /** The locale to apply to the children. */
  locale?: string;
}

const I18nContext = React.createContext<Locale | null>(null);

interface I18nProviderWithLocaleProps extends I18nProviderProps {
  locale: string;
}

/**
 * Internal component that handles the case when locale is provided.
 */
function I18nProviderWithLocale(props: I18nProviderWithLocaleProps): JSX.Element {
  let {locale, children} = props;
  let value: Locale = React.useMemo(
    () => ({
      locale,
      direction: isRTL(locale) ? 'rtl' : 'ltr'
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

interface I18nProviderWithDefaultLocaleProps {
  children: ReactNode;
}

/**
 * Internal component that handles the case when no locale is provided.
 */
function I18nProviderWithDefaultLocale(props: I18nProviderWithDefaultLocaleProps): JSX.Element {
  let {children} = props;
  let defaultLocale = useDefaultLocale();

  return <I18nContext.Provider value={defaultLocale}>{children}</I18nContext.Provider>;
}

/**
 * Provides the locale for the application to all child components.
 */
export function I18nProvider(props: I18nProviderProps): JSX.Element {
  let {locale, children} = props;

  // Conditionally render different components to avoid calling useDefaultLocale.
  // This is necessary because useDefaultLocale triggers a re-render.
  if (locale) {
    return <I18nProviderWithLocale locale={locale} children={children} />;
  }

  return <I18nProviderWithDefaultLocale children={children} />;
}

/**
 * Returns the current locale and layout direction.
 */
export function useLocale(): Locale {
  let defaultLocale = useDefaultLocale();
  let context = useContext(I18nContext);
  return context || defaultLocale;
}
