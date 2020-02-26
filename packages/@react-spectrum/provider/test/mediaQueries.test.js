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

import MatchMediaMock from 'jest-matchmedia-mock';
import {cleanup} from '@testing-library/react';
import React from 'react';
import {renderHook} from 'react-hooks-testing-library';
import {useColorScheme} from '../src/mediaQueries';

let theme = {
  global: {},
  light: {},
  dark: {},
  medium: {},
  large: {}
};

let mediaQueryLight = '(prefers-color-scheme: light)';
let mediaQueryDark = '(prefers-color-scheme: dark)';

describe('mediaQueries', () => {
  let matchMedia;
  beforeEach(() => {
    matchMedia = new MatchMediaMock();
  });
  afterEach(() => {
    matchMedia.clear();
    cleanup();
  });

  describe('useColorScheme', () => {
    it('uses OS as default - dark', () => {
      matchMedia.useMediaQuery(mediaQueryDark);
      let {result} = renderHook(() => useColorScheme(theme, undefined, 'light'));
      expect(result.current).toBe('dark');
    });

    it('uses OS as default - light', () => {
      matchMedia.useMediaQuery(mediaQueryLight);
      let {result} = renderHook(() => useColorScheme(theme,undefined, 'light'));
      expect(result.current).toBe('light');
    });

    it('uses default light if OS is not useable', () => {
      let {result} = renderHook(() => useColorScheme(theme,undefined, 'light'));
      expect(result.current).toBe('light');
    });

    it('uses default dark if OS is not useable', () => {
      let {result} = renderHook(() => useColorScheme(theme,undefined, 'dark'));
      expect(result.current).toBe('dark');
    });
  });
});
