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

type Revert = () => void;

const currentDocument = typeof document !== 'undefined' ? document : undefined;

/**
 * Acts as a polyfill for `aria-modal` by watching for added modals and hiding any surrounding DOM elements with `aria-hidden`.
 */
export function watchModals(selector:string = 'body', {document = currentDocument}: {document?: Document} = {}): Revert {
  /**
   * Listen for additions to the child list of the selected element (defaults to body). This is where providers render modal portals.
   * When one is added, see if there is a modal inside it, if there is, then hide everything else from screen readers.
   * If there was already a modal open and a new one was added, undo everything that the previous modal had hidden and hide based on the new one.
   *
   * If a modal container is removed, then undo the hiding based on the last hide others. Check if there are any other modals still around, and
   * hide based on the last one added.
   */
  if (!document) {
    return () => {};
  }
  let target = document.querySelector(selector);
  if (!target) {
    return () => {};
  }
  let config = {childList: true};
  let modalContainers: Array<Element> = [];
  let undo: Revert | undefined;

  let observer = new MutationObserver((mutationRecord) => {
    const liveAnnouncer =  document.querySelector('[data-live-announcer="true"]');
    for (let mutation of mutationRecord) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        let addNode: Element = (Array.from(mutation.addedNodes).find((node: any) => node.querySelector?.('[aria-modal="true"], [data-ismodal="true"]')) as HTMLElement);
        if (addNode) {
          modalContainers.push(addNode);
          let modal = addNode.querySelector('[aria-modal="true"], [data-ismodal="true"]') as HTMLElement;
          undo?.();
          let others = [modal, ... liveAnnouncer ? [liveAnnouncer as HTMLElement] : []];
          undo = hideOthers(others);
        }
      } else if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
        let removedNodes = Array.from(mutation.removedNodes);
        let nodeIndexRemove = modalContainers.findIndex(container => removedNodes.includes(container));
        if (nodeIndexRemove >= 0) {
          undo?.();
          modalContainers = modalContainers.filter((val, i) => i !== nodeIndexRemove);
          if (modalContainers.length > 0) {
            let modal = modalContainers[modalContainers.length - 1].querySelector('[aria-modal="true"], [data-ismodal="true"]') as HTMLElement;
            let others = [modal, ... liveAnnouncer ? [liveAnnouncer as HTMLElement] : []];
            undo = hideOthers(others);
          } else {
            undo = undefined;
          }
        }
      }
    }
  });
  observer.observe(target, config);
  return () => {
    undo?.();
    observer.disconnect();
  };
}
