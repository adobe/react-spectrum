/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import ModalManager from 'react-overlays/lib/ModalManager'; // needed for the modal manager class

export default class SpectrumModalManager extends ModalManager { // extending for the add and remove

  overflowMap = new Map;

  // For the sake of overriding add and remove methods, saving ModalManager's properties
  // This could be avoided if ModalManager had classMethods instead of arrow functions
  superAdd = this.add;
  superRemove = this.remove;

  addToModal(child, isOverlay = false) {
    const hideSiblingNodes = this.hideSiblingNodes;
    this.hideSiblingNodes = false;
    this.add(child, document.body, null, isOverlay);
    this.hideSiblingNodes = hideSiblingNodes;
  }

  removeFromModal(child) {
    const hideSiblingNodes = this.hideSiblingNodes;
    this.hideSiblingNodes = false;
    this.remove(child);
    this.hideSiblingNodes = hideSiblingNodes;
  }

  add = (modal, container, className, isOverlay) => {
    this.superAdd(modal, container, className);
    this.hideBodyOverflow(modal, isOverlay);
  };

  hideBodyOverflow = (modal, isOverlay) => {
    let currentBodyOverflow = getComputedStyle(document.body).overflow;
    // if it's not an overlay, it's a modal and scrolling should be disabled (i know, it's weird to think about)
    if (!isOverlay && currentBodyOverflow !== 'hidden') {
      this.overflowMap.set(modal, currentBodyOverflow);
      document.body.style.overflow = 'hidden';
    }
  };

  remove = (modal, container, className) => {
    this.superRemove(modal, container, className);
    this.resetBodyOverflow(modal);
  };

  resetBodyOverflow = (modal) => {
    if (this.overflowMap.has(modal)) {
      document.body.style.overflow = this.overflowMap.get(modal);
      this.overflowMap.delete(modal);
    }
  };
}
