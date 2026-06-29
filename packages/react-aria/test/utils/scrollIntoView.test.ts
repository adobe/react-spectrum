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

import {scrollIntoView, scrollIntoViewport} from '../../src/utils/scrollIntoView';

describe('scrollIntoView', () => {
  let target: HTMLElement;
  let scrollIntoViewSpy: jest.SpyInstance;

  beforeEach(() => {
    target = document.createElement('div');
    document.body.appendChild(target);

    if (!HTMLElement.prototype.scrollIntoView) {
      HTMLElement.prototype.scrollIntoView = () => {};
    }
    scrollIntoViewSpy = jest.spyOn(HTMLElement.prototype, 'scrollIntoView');
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
      jest.spyOn(target, 'getBoundingClientRect').mockReturnValue({
        top: 2100,
        bottom: 3100,
        left: 100,
        right: 1100,
        width: 1000,
        height: 1000,
        x: 100,
        y: 2100
      } as DOMRect);

      jest.spyOn(window, 'getComputedStyle').mockImplementation(_el => {
        return {
          borderTopWidth: '100px',
          borderBottomWidth: '100px',
          borderLeftWidth: '100px',
          borderRightWidth: '100px',
          scrollPaddingTop: '0px',
          scrollPaddingBottom: '0px',
          scrollPaddingLeft: '0px',
          scrollPaddingRight: '0px',
          direction: 'ltr'
        } as unknown as CSSStyleDeclaration;
      });

      Object.defineProperty(scrollView, 'clientHeight', {get: () => 500, configurable: true});
      Object.defineProperty(scrollView, 'clientWidth', {get: () => 500, configurable: true});

      scrollIntoView(scrollView, target, {block: 'start', inline: 'start'});
      expect(scrollView.scrollLeft).toBe(100);
      expect(scrollView.scrollTop).toBe(2100);
    });

    it('excludes root border from scroll port when scrolling to end', () => {
      jest.spyOn(target, 'getBoundingClientRect').mockReturnValue({
        top: 2100,
        bottom: 3100,
        left: 100,
        right: 1100,
        width: 1000,
        height: 1000,
        x: 100,
        y: 2100,
        toJSON: () => {}
      } as DOMRect);

      jest.spyOn(window, 'getComputedStyle').mockImplementation(_el => {
        return {
          borderTopWidth: '100px',
          borderBottomWidth: '100px',
          borderLeftWidth: '100px',
          borderRightWidth: '100px',
          scrollPaddingTop: '0px',
          scrollPaddingBottom: '0px',
          scrollPaddingLeft: '0px',
          scrollPaddingRight: '0px',
          direction: 'ltr'
        } as unknown as CSSStyleDeclaration;
      });

      Object.defineProperty(scrollView, 'clientHeight', {get: () => 500, configurable: true});
      Object.defineProperty(scrollView, 'clientWidth', {get: () => 500, configurable: true});

      scrollIntoView(scrollView, target, {block: 'end', inline: 'end'});
      expect(scrollView.scrollLeft).toBe(600);
      expect(scrollView.scrollTop).toBe(2600);
    });
  });

  describe('scrollIntoViewport', () => {
    it('does not call scrollIntoView under any circumstances', () => {
      const containingElement = document.createElement('div');
      const targetElement = document.createElement('div');
      containingElement.appendChild(targetElement);
      document.body.appendChild(containingElement);

      jest.spyOn(window, 'getComputedStyle').mockImplementation(_el => {
        return {overflow: 'visible'} as CSSStyleDeclaration;
      });

      jest.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
        top: 50,
        bottom: 80,
        left: 50,
        right: 150,
        width: 100,
        height: 30
      } as DOMRect);

      scrollIntoViewport(targetElement, {containingElement});

      expect(scrollIntoViewSpy).not.toHaveBeenCalled();

      document.body.removeChild(containingElement);
    });

    it('does not trigger vertical scroll when only left changes (ArrowRight scenario)', () => {
      const containingElement = document.createElement('div');
      const targetElement = document.createElement('div');
      Object.setPrototypeOf(containingElement, HTMLElement.prototype);
      Object.setPrototypeOf(targetElement, HTMLElement.prototype);
      containingElement.appendChild(targetElement);
      document.body.appendChild(containingElement);

      jest.spyOn(window, 'getComputedStyle').mockImplementation(_el => {
        return {overflow: 'visible'} as CSSStyleDeclaration;
      });

      jest.spyOn(containingElement, 'getBoundingClientRect').mockReturnValue({
        top: 0,
        bottom: 300,
        left: 0,
        right: 800,
        width: 800,
        height: 300
      } as DOMRect);

      jest.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
        top: 50,
        bottom: 80,
        left: 50,
        right: 150,
        width: 100,
        height: 30
      } as DOMRect);

      scrollIntoViewport(targetElement, {containingElement});

      expect(scrollIntoViewSpy).not.toHaveBeenCalled();

      document.body.removeChild(containingElement);
    });

    it('does not center a containingElement that is larger than the viewport', () => {
      const containingElement = document.createElement('div');
      const targetElement = document.createElement('div');
      Object.setPrototypeOf(containingElement, HTMLElement.prototype);
      Object.setPrototypeOf(targetElement, HTMLElement.prototype);
      containingElement.appendChild(targetElement);
      document.body.appendChild(containingElement);

      jest.spyOn(window, 'getComputedStyle').mockImplementation(_el => {
        return {overflow: 'visible'} as CSSStyleDeclaration;
      });

      // Container is taller than the viewport (5000px vs typical 768px)
      jest.spyOn(containingElement, 'getBoundingClientRect').mockReturnValue({
        top: -100,
        bottom: 4900,
        left: 0,
        right: 600,
        width: 600,
        height: 5000
      } as DOMRect);

      jest.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
        top: -100,
        bottom: -50,
        left: 0,
        right: 100,
        width: 100,
        height: 50
      } as DOMRect);

      scrollIntoViewport(targetElement, {containingElement});

      expect(scrollIntoViewSpy).not.toHaveBeenCalled();

      document.body.removeChild(containingElement);
    });

    it('does not call scrollIntoView in the scroll-prevented (overlay) path', () => {
      const containingElement = document.createElement('div');
      const targetElement = document.createElement('div');
      Object.setPrototypeOf(containingElement, HTMLElement.prototype);
      Object.setPrototypeOf(targetElement, HTMLElement.prototype);
      containingElement.appendChild(targetElement);
      document.body.appendChild(containingElement);

      // Simulate body overflow:hidden (modal/popover)
      jest.spyOn(window, 'getComputedStyle').mockImplementation(_el => {
        return {overflow: 'hidden'} as CSSStyleDeclaration;
      });

      jest.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
        top: -200,
        bottom: -150,
        left: 0,
        right: 100,
        width: 100,
        height: 50
      } as DOMRect);

      scrollIntoViewport(targetElement, {containingElement});

      expect(scrollIntoViewSpy).not.toHaveBeenCalled();

      document.body.removeChild(containingElement);
    });
  });
});
