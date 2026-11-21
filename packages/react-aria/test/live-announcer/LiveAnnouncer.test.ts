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

import {announce, clearAnnouncer, destroyAnnouncer} from '../../src/live-announcer/LiveAnnouncer';

describe('LiveAnnouncer', () => {
  afterEach(() => {
    destroyAnnouncer();
    jest.restoreAllMocks();
  });

  function getLog(assertiveness: 'assertive' | 'polite') {
    return document.querySelector(`[data-live-announcer] [aria-live="${assertiveness}"]`)!;
  }

  it.each(['assertive', 'polite'] as const)('clears %s announcements', assertiveness => {
    announce('first', 'assertive');
    announce('second', 'polite');

    clearAnnouncer(assertiveness);

    let other = assertiveness === 'assertive' ? 'polite' : 'assertive';
    expect(getLog(assertiveness).childNodes).toHaveLength(0);
    expect(getLog(other).childNodes).toHaveLength(1);
    expect(getLog(assertiveness)).toHaveAttribute('role', 'log');
  });

  it('clears announcements without assigning innerHTML', () => {
    // Simulate a page that enforces Trusted Types, where assigning a string to innerHTML throws.
    jest.spyOn(Element.prototype, 'innerHTML', 'set').mockImplementation(() => {
      throw new TypeError("This document requires 'TrustedHTML' assignment.");
    });

    announce('first', 'assertive');
    announce('second', 'polite');

    expect(() => {
      clearAnnouncer('assertive');
      clearAnnouncer('polite');
    }).not.toThrow();
    expect(getLog('assertive').childNodes).toHaveLength(0);
    expect(getLog('polite').childNodes).toHaveLength(0);
  });
});
