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

import {scrollIntoView} from '../../src/utils/scrollIntoView';

describe('scrollIntoView', () => {
  let target: HTMLElement;

  beforeEach(() => {
    target = document.createElement('div');
    document.body.appendChild(target);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  describe('document root scrolling', () => {
    let scrollView: HTMLElement;

    beforeEach(() => {
      scrollView = (document.scrollingElement as HTMLElement) || document.documentElement;
      scrollView.scrollTop = 0;
      scrollView.scrollLeft = 0;
    });

    it('excludes root border from scroll port when scrolling to start', () => {
      // the config here is a window of 500 x 500 with a border of 100
      // the target top is at 100, 2100 aka border left of scrolling body, border top + 2000
      // scrollIntoView of block start + inline start should bring us to 100, 2100
      jest.spyOn(target, 'getBoundingClientRect').mockReturnValue({
        top: 2100, bottom: 3100, left: 100, right: 1100,
        width: 1000, height: 1000, x: 100, y: 2100
      } as DOMRect);

      jest.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
        if (el === scrollView) {
          return {
            borderTopWidth: '100px', borderBottomWidth: '100px',
            borderLeftWidth: '100px', borderRightWidth: '100px',
            scrollPaddingTop: '0px', scrollPaddingBottom: '0px',
            scrollPaddingLeft: '0px', scrollPaddingRight: '0px',
            direction: 'ltr'
          } as CSSStyleDeclaration;
        }
        return {
          scrollMarginTop: '0px', scrollMarginBottom: '0px',
          scrollMarginLeft: '0px', scrollMarginRight: '0px'
        } as CSSStyleDeclaration;
      });

      Object.defineProperty(scrollView, 'clientHeight', {get: () => 500, configurable: true});
      Object.defineProperty(scrollView, 'clientWidth', {get: () => 500, configurable: true});

      scrollIntoView(scrollView, target, {block: 'start', inline: 'start'});
      expect(scrollView.scrollLeft).toBe(100);
      expect(scrollView.scrollTop).toBe(2100);
    });

    it('excludes root border from scroll port when scrolling to end', () => {
      // the config here is a window of 500 x 500 with a border of 100
      // the target top is at 100, 2100 aka border left of scrolling body, border top + 2000
      // scrollIntoView of block end + inline end should bring us to 600, 2600
      jest.spyOn(target, 'getBoundingClientRect').mockReturnValue({
        top: 2100, bottom: 3100, left: 100, right: 1100,
        width: 1000, height: 1000, x: 100, y: 2100, toJSON: () => {}
      } as DOMRect);

      jest.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
        if (el === scrollView) {
          return {
            borderTopWidth: '100px', borderBottomWidth: '100px',
            borderLeftWidth: '100px', borderRightWidth: '100px',
            scrollPaddingTop: '0px', scrollPaddingBottom: '0px',
            scrollPaddingLeft: '0px', scrollPaddingRight: '0px',
            direction: 'ltr'
          } as CSSStyleDeclaration;
        }
        return {
          scrollMarginTop: '0px', scrollMarginBottom: '0px',
          scrollMarginLeft: '0px', scrollMarginRight: '0px'
        } as CSSStyleDeclaration;
      });

      Object.defineProperty(scrollView, 'clientHeight', {get: () => 500, configurable: true});
      Object.defineProperty(scrollView, 'clientWidth', {get: () => 500, configurable: true});

      scrollIntoView(scrollView, target, {block: 'end', inline: 'end'});
      expect(scrollView.scrollLeft).toBe(600);
      expect(scrollView.scrollTop).toBe(2600);
    });
  });
});
