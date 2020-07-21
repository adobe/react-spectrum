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

import {hideOthers} from 'aria-hidden';

/**
 * Acts as a polyfill for `aria-modal` by watching for added modals and hiding any surrounding DOM elements with `aria-hidden`.
 */
export function watchModals(selector:string = 'body'): void {
  /**
   * Listen for additions to the child list of body. This is where providers render modal portals.
   * When one is added, see if there is a modal inside it, if there is, then hide everything else from screen readers.
   * If there was already a modal open and a new one was added, undo everything that the previous modal had hidden and hide based on the new one.
   *
   * If a modal container is removed, then undo the hiding based on the last hide others. Check if there are any other modals still around, and
   * hide based on the last one added.
   */
  let target = document.querySelector(selector);
  let config = {childList: true};
  let modalContainers = [];
  let undo;

  let observer = new MutationObserver((mutationRecord) => {
    for (let mutation of mutationRecord) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        let addNode = Array.from(mutation.addedNodes).find((node: Element) => node.querySelector('[aria-modal="true"], [data-ismodal]')) as HTMLElement;
        if (addNode) {
          modalContainers.push(addNode);
          let modal = addNode.querySelector('[aria-modal="true"], [data-ismodal]') as HTMLElement;
          if (undo) {
            undo();
          }
          undo = hideOthers(modal);
        }
      } else if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
        let removedNodes = Array.from(mutation.removedNodes);
        let nodeIndexRemove = modalContainers.findIndex(container => removedNodes.includes(container));
        if (nodeIndexRemove >= 0) {
          undo();
          modalContainers = modalContainers.filter((val, i) => i !== nodeIndexRemove);
          if (modalContainers.length > 0) {
            let modal = modalContainers[modalContainers.length - 1].querySelector('[aria-modal="true"], [data-ismodal]');
            undo = hideOthers(modal);
          } else {
            undo = undefined;
          }
        }
      }
    }
  });
  observer.observe(target, config);
}
