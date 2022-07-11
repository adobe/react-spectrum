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

import {Message, MessageDictionary, Variables} from './MessageDictionary';

type InternalMessage = string | (() => string);

const pluralRulesCache = new Map<string, Intl.PluralRules>();
const numberFormatCache = new Map<string, Intl.NumberFormat>();

/**
 * Formats ICU Message strings to create localized strings from a MessageDictionary.
 */
export class MessageFormatter<K extends string = string, T extends Message = string> {
  private locale: string;
  private messages: MessageDictionary<K, T>;

  constructor(locale: string, messages: MessageDictionary<K, T>) {
    this.locale = locale;
    this.messages = messages;
  }

  format(key: K, variables: Variables): string {
    let message = this.messages.getStringForLocale(key, this.locale);
    if (!message) {
      throw new Error(`Could not find intl message ${key} in ${this.locale} locale`);
    }

    if (typeof message === 'function') {
      return message(variables, this);
    }

    return message;
  }

  protected plural(count: number, options: Record<string, InternalMessage>, type: Intl.PluralRuleType = 'cardinal') {
    let opt = options['=' + count];
    if (opt) {
      return typeof opt === 'function' ? opt() : opt;
    }

    let key = this.locale + ':' + type;
    let pluralRules = pluralRulesCache.get(key);
    if (!pluralRules) {
      pluralRules = new Intl.PluralRules(this.locale, {type});
      pluralRulesCache.set(key, pluralRules);
    }

    let selected = pluralRules.select(count);
    opt = options[selected] || options.other;
    return typeof opt === 'function' ? opt() : opt;
  }

  protected number(value: number) {
    let numberFormat = numberFormatCache.get(this.locale);
    if (!numberFormat) {
      numberFormat = new Intl.NumberFormat(this.locale);
      numberFormatCache.set(this.locale, numberFormat);
    }
    return numberFormat.format(value);
  }

  protected select(options: Record<string, InternalMessage>, value: string) {
    let opt = options[value] || options.other;
    return typeof opt === 'function' ? opt() : opt;
  }
}
