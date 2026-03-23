/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {getOwnerWindow} from './domHelpers';

const supportsCheckVisibility = typeof Element !== 'undefined' && 'checkVisibility' in Element.prototype;

function isStyleVisible(element: Element) {
  const windowObject = getOwnerWindow(element);
  if (!(element instanceof windowObject.HTMLElement) && !(element instanceof windowObject.SVGElement)) {
    return false;
  }

  let {display, visibility} = element.style;

  let isVisible = (
    display !== 'none' &&
    visibility !== 'hidden' &&
    visibility !== 'collapse'
  );

  if (isVisible) {
    const {getComputedStyle} = element.ownerDocument.defaultView as unknown as Window;
    let {display: computedDisplay, visibility: computedVisibility} = getComputedStyle(element);

    isVisible = (
      computedDisplay !== 'none' &&
      computedVisibility !== 'hidden' &&
      computedVisibility !== 'collapse'
    );
  }

  return isVisible;
}

function isAttributeVisible(element: Element, childElement?: Element) {
  return (
    !element.hasAttribute('hidden') &&
    // Ignore HiddenSelect when tree walking.
    !element.hasAttribute('data-react-aria-prevent-focus') &&
    (element.nodeName === 'DETAILS' &&
      childElement &&
      childElement.nodeName !== 'SUMMARY'
      ? element.hasAttribute('open')
      : true)
  );
}

/**
 * Adapted from https://github.com/testing-library/jest-dom and
 * https://github.com/vuejs/vue-test-utils-next/.
 * Licensed under the MIT License.
 * @param element - Element to evaluate for display or visibility.
 */
export function isElementVisible(element: Element, childElement?: Element): boolean {
  if (supportsCheckVisibility) {
    return element.checkVisibility({visibilityProperty: true}) && !element.closest('[data-react-aria-prevent-focus]');
  }

  return (
    element.nodeName !== '#comment' &&
    isStyleVisible(element) &&
    isAttributeVisible(element, childElement) &&
    (!element.parentElement || isElementVisible(element.parentElement, element))
  );
}
