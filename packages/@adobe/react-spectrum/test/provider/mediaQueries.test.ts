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

import {cleanup, setMedia} from 'mock-match-media';
import {renderHook} from '@react-spectrum/test-utils-internal';
import {useColorScheme} from '../../src/provider/mediaQueries';

let theme = {
  global: {},
  light: {},
  dark: {},
  medium: {},
  large: {}
};

let mediaQueryLight = {prefersColorScheme: 'light'};
let mediaQueryDark = {prefersColorScheme: 'dark'};

describe('mediaQueries', () => {
  afterEach(() => {
    cleanup();
  });

  describe('useColorScheme', () => {
    it('uses OS as default - dark', () => {
      setMedia(mediaQueryDark);
      let {result} = renderHook(() => useColorScheme(theme, 'light'));
      expect(result.current).toBe('dark');
    });

    it('uses OS as default - light', () => {
      setMedia(mediaQueryLight);
      let {result} = renderHook(() => useColorScheme(theme, 'light'));
      expect(result.current).toBe('light');
    });

    it('uses default light if OS is not useable', () => {
      let {result} = renderHook(() => useColorScheme(theme, 'light'));
      expect(result.current).toBe('light');
    });

    it('uses default dark if OS is not useable', () => {
      let {result} = renderHook(() => useColorScheme(theme, 'dark'));
      expect(result.current).toBe('dark');
    });
  });
});
