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

function testUserAgent(re: RegExp) {
  if (typeof window === 'undefined' || window.navigator == null) {
    return false;
  }
  return (
    window.navigator['userAgentData']?.brands.some((brand: {brand: string, version: string}) => re.test(brand.brand))
  ) ||
  re.test(window.navigator.userAgent);
}

function testPlatform(re: RegExp) {
  return typeof window !== 'undefined' && window.navigator != null
    ? re.test(window.navigator['userAgentData']?.platform || window.navigator.platform)
    : false;
}

function cached(fn: () => boolean) {
  if (process.env.NODE_ENV === 'test') {
    return fn;
  }
  
  let res: boolean | null = null;
  return () => {
    if (res == null) {
      res = fn();
    }
    return res;
  };
}

export const isMac = cached(function () {
  return testPlatform(/^Mac/i);
});

export const isIPhone = cached(function () {
  return testPlatform(/^iPhone/i);
});

export const isIPad = cached(function () {
  return testPlatform(/^iPad/i) ||
    // iPadOS 13 lies and says it's a Mac, but we can distinguish by detecting touch support.
    (isMac() && navigator.maxTouchPoints > 1);
});

export const isIOS = cached(function () {
  return isIPhone() || isIPad();
});

export const isAppleDevice = cached(function () {
  return isMac() || isIOS();
});

export const isWebKit = cached(function () {
  return testUserAgent(/AppleWebKit/i) && !isChrome();
});

export const isChrome = cached(function () {
  return testUserAgent(/Chrome/i);
});

export const isAndroid = cached(function () {
  return testUserAgent(/Android/i);
});

export const isFirefox = cached(function () {
  return testUserAgent(/Firefox/i);
});
