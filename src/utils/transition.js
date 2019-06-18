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

// Determine which event to add a transition event to depending on the browser being used.
let transitionEvent;
export function getTransitionEvent() {
  if (!transitionEvent) {
    const el = document.createElement('fakeelement');
    const transitions = {
      transition: 'transitionend',
      OTransition: 'oTransitionEnd',
      MozTransition: 'transitionend',
      WebkitTransition: 'webkitTransitionEnd'
    };
    const keys = Object.keys(transitions);

    for (let i = 0; i < keys.length; i++) {
      const t = keys[i];
      if (el.style[t] !== undefined) {
        transitionEvent = transitions[t];
        break;
      }
    }
  }
  return transitionEvent;
}
