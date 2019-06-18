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

import css from 'dom-helpers/style';
import ModalManager from 'react-overlays/lib/ModalManager'; // needed for the modal manager class

export default class SpectrumModalManager extends ModalManager { // extending for the add and remove

  // For the sake of overriding add and remove methods, saving ModalManager's properties
  // This could be avoided if ModalManager had classMethods instead of arrow functions
  superAdd = this.add;
  superRemove = this.remove;

  addToModal(child) {
    const hideSiblingNodes = this.hideSiblingNodes;
    this.hideSiblingNodes = false;
    this.add(child, document.body);
    this.hideSiblingNodes = hideSiblingNodes;
  }

  removeFromModal(child) {
    const hideSiblingNodes = this.hideSiblingNodes;
    this.hideSiblingNodes = false;
    this.remove(child);
    this.hideSiblingNodes = hideSiblingNodes;
  }

  add = (modal, contaner, className) => {
    this.superAdd(modal, contaner, className);
    this.bodyOverflow = document.body.style.overflow;
    css(document.body, {overflow: 'hidden'});
  }

  remove = (modal, contaner, className) => {
    this.superRemove(modal, contaner, className);
    css(document.body, {overflow: this.bodyOverflow});
  }
}
