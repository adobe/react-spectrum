/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {getPackageLocalizationScript} from '../src/server';

describe('i18n server', () => {
  it('should generate a script with localized strings', () => {
    let res = getPackageLocalizationScript('en-US', {
      '@react-aria/button': {
        test: 'foo'
      },
      '@react-aria/checkbox': {
        test: 'foo'
      }
    });

    expect(res).toBe("window[Symbol.for('react-aria.i18n.locale')]=\"en-US\";{let A=\"foo\";window[Symbol.for('react-aria.i18n.strings')]={'@react-aria/button':{test:A},'@react-aria/checkbox':{test:A}};}");
  });
});
