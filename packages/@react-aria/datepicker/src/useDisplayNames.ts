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

// @ts-ignore
import intlMessages from '../intl/*.json';
import {MessageDictionary} from '@internationalized/message';
import {useLocale} from '@react-aria/i18n';
import {useMemo} from 'react';

type Field = 'era' | 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'dayPeriod' | 'timeZoneName' | 'weekday';
interface DisplayNames {
  of(field: Field): string
}

export function useDisplayNames(): DisplayNames {
  let {locale} = useLocale();
  return useMemo(() => {
    // Try to use Intl.DisplayNames if possible. It may be supported in browsers, but not support the dateTimeField
    // type as that was only added in v2. https://github.com/tc39/intl-displaynames-v2
    try {
      // @ts-ignore
      return new Intl.DisplayNames(locale, {type: 'dateTimeField'});
    } catch (err) {
      return new DisplayNamesPolyfill(locale);
    }
  }, [locale]);
}

class DisplayNamesPolyfill implements DisplayNames {
  private locale: string;
  private dictionary: MessageDictionary;

  constructor(locale: string) {
    this.locale = locale;
    this.dictionary = new MessageDictionary(intlMessages);
  }

  of(field: Field): string {
    return this.dictionary.getStringForLocale(field, this.locale);
  }
}
