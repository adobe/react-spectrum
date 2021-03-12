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

import {Breakpoints, ColorScheme, Scale} from '@react-types/provider';
import {Theme} from '@react-types/provider';
import {useEffect, useState} from 'react';
import {useIsSSR} from '@react-aria/ssr';
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
  let matchesFine = useMediaQuery('(any-pointer: fine)');
  if (matchesFine && theme.medium) {
    return 'medium';
  }

  if (theme.large) {
    return 'large';
  }

  return 'medium';
}

export function useBreakpoint(breakpoints: Breakpoints) {
  // sort breakpoints in ascending order.
  let entries = Object.entries(breakpoints).sort(([, valueA], [, valueB]) => valueA - valueB);
  let breakpointQueries = entries.map(([, value], index) => {
    if (index === entries.length - 1) {
      return `(min-width: ${value}px)`;
    } else {
      return `(min-width: ${value}px) and (max-width: ${entries[index + 1][1]}px)`;
    }
  });

  let supportsMatchMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function';
  let getBreakpointHandler = () => {
    let point = 'base';
    for (let i in breakpointQueries) {
      let query = breakpointQueries[i];
      if (window.matchMedia(query).matches) {
        point = entries[i][0];
        break;
      }
    }
    return point;
  };

  let [breakpoint, setBreakpoint] = useState(() =>
    supportsMatchMedia
      ? getBreakpointHandler()
      : 'base'
  );

  useEffect(() => {
    if (!supportsMatchMedia) {
      return;
    }

    let onResize = () => {
      setBreakpoint(getBreakpointHandler());
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [supportsMatchMedia]);

  // If in SSR, the media query should never match. Once the page hydrates,
  // this will update and the real value will be returned.
  let isSSR = useIsSSR();
  return isSSR ? 'base' : breakpoint;
}
