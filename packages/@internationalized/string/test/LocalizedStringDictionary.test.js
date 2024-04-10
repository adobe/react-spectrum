/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {LocalizedStringDictionary} from '..';

describe('LocalizedStringDictionary', function () {

  describe('getStringForLocale', function () {
    const messages = Object.freeze({
      'en-US': {
        'hello': 'Hello',
        'goodbye': 'Good bye'
      },
      'ja-JP': undefined,
      'es-ES': {
        'hello': 'Hola',
        'goodbye': 'Adiós'
      },
      'it-IT': {
        'hello': 'Ciao',
        'goodbye': 'Arrivederci'
      }
    });

    it('throws when attempt to get a missing message key is made', function () {
      expect(() => {
        const localizedStringDictionary = new LocalizedStringDictionary(messages);
        localizedStringDictionary.getStringForLocale('missing.key', 'it-IT');
      }).toThrow(/Could not find intl message/);
    });

    it('uses closest match by language when specified locale does not contain requested message key', function () {
      const localizedStringDictionary = new LocalizedStringDictionary(messages);
      expect(localizedStringDictionary.getStringForLocale('goodbye', 'es-MX')).toBe('Adiós');
    });

    it('uses default locale when specified locale is missing and there is no closest match found', function () {
      const localizedStringDictionary = new LocalizedStringDictionary(messages, 'it-IT');
      expect(localizedStringDictionary.getStringForLocale('hello', 'hy-AM')).toBe('Ciao');
    });

    it('uses default locale when specified locale key exists, but the value is falsy', function () {
      const localizedStringDictionary = new LocalizedStringDictionary(messages, 'es-ES');
      expect(localizedStringDictionary.getStringForLocale('hello', 'ja-JP')).toBe('Hola');
    });
  });
});
