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

    // 1. Manually attach a mock function to the jsdom prototype so it exists globally for all test blocks
    if (!HTMLElement.prototype.scrollIntoView) {
      HTMLElement.prototype.scrollIntoView = () => {};
    }
    // 2. Safely spy on it
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

  // ==========================================
  // SCROLL INTO VIEWPORT BLOCK FOR CONTAINING ELEMENT CONSTRAINTS
  // ==========================================
  describe('scrollIntoViewport', () => {
    it('should fall back to nearest block alignment if containingElement is larger than the viewport', () => {
      const containingElement = document.createElement('div');
      Object.setPrototypeOf(containingElement, HTMLElement.prototype);
      containingElement.appendChild(target);
      document.body.appendChild(containingElement);

      jest.spyOn(window, 'getComputedStyle').mockImplementation(_el => {
        return {overflow: 'visible'} as CSSStyleDeclaration;
      });

      jest.spyOn(target, 'getBoundingClientRect').mockReturnValue({
        top: -100,
        bottom: -50,
        left: 0,
        right: 100,
        width: 100,
        height: 50
      } as DOMRect);

      scrollIntoViewport(target, {containingElement});

      // Verification: Ensure it used 'nearest' rather than 'center' because it was too large
      const containerCalls = scrollIntoViewSpy.mock.calls.filter(
        call => call[0]?.block === 'center'
      );
      expect(containerCalls.length).toBe(0);

      document.body.removeChild(containingElement);
    });

    it('should not violently jump or center the containingElement if it is already fully visible in its ancestors', () => {
      // Setup a mock nested DOM structure mimicking a dashboard layout
      const outerParent = document.createElement('div');
      const containingElement = document.createElement('div');
      const targetElement = document.createElement('div');

      // Ensure elements explicitly pass strict HTMLElement prototype validations
      Object.setPrototypeOf(outerParent, HTMLElement.prototype);
      Object.setPrototypeOf(containingElement, HTMLElement.prototype);
      Object.setPrototypeOf(targetElement, HTMLElement.prototype);

      // Append structural tree
      outerParent.appendChild(containingElement);
      containingElement.appendChild(targetElement);
      document.body.appendChild(outerParent);

      // Mock layout dimensions to simulate complete visibility
      // Outer frame bounds
      jest.spyOn(outerParent, 'getBoundingClientRect').mockReturnValue({
        top: 0,
        left: 0,
        bottom: 500,
        right: 500,
        width: 500,
        height: 500
      } as DOMRect);

      // Container is fully inside the outer frame bounds
      jest.spyOn(containingElement, 'getBoundingClientRect').mockReturnValue({
        top: 50,
        left: 50,
        bottom: 450,
        right: 450,
        width: 400,
        height: 400
      } as DOMRect);

      jest.spyOn(targetElement, 'getBoundingClientRect').mockReturnValue({
        top: 60,
        left: 60,
        bottom: 90,
        right: 200,
        width: 140,
        height: 30
      } as DOMRect);

      jest.spyOn(window, 'getComputedStyle').mockImplementation(_el => {
        return {overflow: 'visible'} as CSSStyleDeclaration;
      });

      // Execute viewport routing
      scrollIntoViewport(targetElement, {containingElement});

      // VERIFICATION: The containingElement should NEVER be forced to 'center' since it's already fully visible.
      // Native scrollIntoView shouldn't be called with block: 'center' on the container frame.
      const containerCalls = scrollIntoViewSpy.mock.calls.filter(
        call => call[0]?.block === 'center'
      );

      expect(containerCalls.length).toBe(0);

      // Clean up DOM footprint
      document.body.removeChild(outerParent);
    });
  });
});
