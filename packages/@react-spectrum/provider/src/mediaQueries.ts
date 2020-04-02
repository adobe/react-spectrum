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

import {ColorScheme, Scale} from '@react-types/provider';
import {Theme} from '@react-types/provider';
import {useMediaQuery} from '@react-spectrum/utils';

export function useColorScheme(theme: Theme, defaultColorScheme: ColorScheme): ColorScheme {
  let matchesDark = useMediaQuery('(prefers-color-scheme: dark)');
  let matchesLight = useMediaQuery('(prefers-color-scheme: light)');

  // importance OS > default > omitted

  if (theme.dark && matchesDark) {
    return 'dark';
  }

  if (theme.light && matchesLight) {
    return 'light';
  }

  if (theme.dark && defaultColorScheme === 'dark') {
    return 'dark';
  }

  if (theme.light && defaultColorScheme === 'light') {
    return 'light';
  }

  if (!theme.dark) {
    return 'light';
  }

  if (!theme.light) {
    return 'dark';
  }

  return 'light';
}

export function useScale(theme: Theme): Scale {
  // iOS safari doesn't match any-pointer: course or any-pointer: fine :/
  // Desktop matches any-pointer: fine though, so look for that.
  let matchesFine = useMediaQuery('(any-pointer: fine)');

  // Edge on a Surface Go reports fine pointer support even without a mouse attached.
  // Check navigator.maxTouchPoints, and switch to large scale when touch is supported.
  if (navigator.maxTouchPoints > 0) {
    return 'large';
  }

  if (matchesFine && theme.medium) {
    return 'medium';
  }

  if (theme.large) {
    return 'large';
  }

  return 'medium';
}
