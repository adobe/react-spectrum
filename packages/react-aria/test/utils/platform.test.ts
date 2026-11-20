/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {isAppleDevice, isIOS, isIPad, isIPhone} from '../../src/utils/platform';

describe('platform detection', function () {
  afterEach(() => {
    jest.restoreAllMocks();
    Reflect.deleteProperty(navigator, 'userAgentData');
  });

  it.each(['iPhone', 'iPad'])('detects %s with an iOS platform hint', platform => {
    jest.spyOn(navigator, 'platform', 'get').mockReturnValue(platform);
    Object.defineProperty(navigator, 'userAgentData', {
      configurable: true,
      value: {platform: 'iOS'}
    });

    expect(isIPhone()).toBe(platform === 'iPhone');
    expect(isIPad()).toBe(platform === 'iPad');
    expect(isIOS()).toBe(true);
    expect(isAppleDevice()).toBe(true);
  });
});
