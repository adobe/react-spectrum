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
  /**
   * The writing direction to apply to the children, overriding the direction implied by the
   * locale. Use this for content whose direction comes from the content itself rather than from
   * the reading order of the UI, such as a media playback bar that stays `'ltr'` in an RTL UI.
   * Set `dir` on an element inside the provider as well, so that CSS logical properties resolve
   * the same way the components do.
   *
   * @default the direction implied by the locale
   */
  direction?: Direction;
}

const I18nContext = React.createContext<Locale | null>(null);

interface I18nProviderWithLocaleProps extends I18nProviderProps {
  locale: string;
}

/**
 * Internal component that handles the case when locale is provided.
 */
function I18nProviderWithLocale(props: I18nProviderWithLocaleProps): JSX.Element {
  let {locale, direction, children} = props;
  let value: Locale = React.useMemo(
    () => ({
      locale,
      direction: direction ?? (isRTL(locale) ? 'rtl' : 'ltr')
    }),
    [locale, direction]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

interface I18nProviderWithDefaultLocaleProps {
  children: ReactNode;
  direction?: Direction;
}

/**
 * Internal component that handles the case when no locale is provided.
 */
function I18nProviderWithDefaultLocale(props: I18nProviderWithDefaultLocaleProps): JSX.Element {
  let {direction, children} = props;
  let defaultLocale = useDefaultLocale();
  let value: Locale = React.useMemo(
    () => (direction ? {locale: defaultLocale.locale, direction} : defaultLocale),
    [defaultLocale, direction]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Provides the locale for the application to all child components.
 */
export function I18nProvider(props: I18nProviderProps): JSX.Element {
  let {locale, direction, children} = props;

  // Conditionally render different components to avoid calling useDefaultLocale.
  // This is necessary because useDefaultLocale triggers a re-render.
  if (locale) {
    return <I18nProviderWithLocale locale={locale} direction={direction} children={children} />;
  }

  return <I18nProviderWithDefaultLocale direction={direction} children={children} />;
}

/**
 * Returns the current locale and layout direction.
 */
export function useLocale(): Locale {
  let defaultLocale = useDefaultLocale();
  let context = useContext(I18nContext);
  return context || defaultLocale;
}
