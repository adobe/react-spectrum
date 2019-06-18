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

export default (node, parentNode, alignToStart) => {
  if (parentNode && parentNode.contains(node)) {
    const {clientHeight, clientWidth, scrollTop, scrollLeft} = parentNode;
    const {offsetHeight, offsetWidth, offsetTop, offsetLeft} = node;
    const parentPosition = window.getComputedStyle(parentNode).position;
    let parentOffsetTop = parentNode.offsetTop;
    let parentOffsetLeft = parentNode.offsetLeft;

    if (parentPosition !== 'static') {
      parentOffsetTop = parentOffsetLeft = 0;
    }

    if (offsetTop < scrollTop) {
      parentNode.scrollTop = offsetTop;
    } else {
      const offsetBottom = offsetTop + offsetHeight;
      const scrollBottom = scrollTop + clientHeight;
      if (offsetBottom > scrollBottom) {
        parentNode.scrollTop = alignToStart ? offsetTop - parentOffsetTop : offsetBottom - clientHeight - parentOffsetTop;
      }
    }

    if (offsetLeft < scrollLeft) {
      parentNode.scrollLeft = offsetLeft;
    } else {
      const offsetRight = offsetLeft + offsetWidth;
      const scrollRight = scrollLeft + clientWidth;
      if (offsetRight > scrollRight) {
        parentNode.scrollLeft = alignToStart ? offsetLeft - parentOffsetLeft : offsetRight - clientWidth - parentOffsetLeft;
      }
    }
  }
};
