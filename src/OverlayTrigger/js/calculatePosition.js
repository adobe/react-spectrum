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

import getCss from 'dom-helpers/style';
import getOffset from 'dom-helpers/query/offset';
import getPosition from 'dom-helpers/query/position';
import getScrollLeft from 'dom-helpers/query/scrollLeft';
import getScrollTop from 'dom-helpers/query/scrollTop';
import ownerDocument from 'dom-helpers/ownerDocument';
import ReactDOM from 'react-dom';

const AXIS = {
  top: 'top',
  bottom: 'top',
  left: 'left',
  right: 'left'
};

const FLIPPED_DIRECTION = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left'
};

const CROSS_AXIS = {
  top: 'left',
  left: 'top'
};

const AXIS_SIZE = {
  top: 'height',
  left: 'width'
};

const PARSED_PLACEMENT_CACHE = {};

function getContainerDimensions(containerNode) {
  let width, height, top = 0, left = 0;
  let scroll = {};

  const containerDOMNode = ReactDOM.findDOMNode(containerNode);

  if (containerDOMNode.tagName === 'BODY') {
    width = window.innerWidth;
    height = window.innerHeight;

    scroll.top =
      getScrollTop(ownerDocument(containerDOMNode).documentElement) ||
      getScrollTop(containerDOMNode);
    scroll.left =
      getScrollLeft(ownerDocument(containerDOMNode).documentElement) ||
      getScrollLeft(containerDOMNode);
  } else {
    ({width, height, top, left} = getOffset(containerDOMNode));
    scroll.top = getScrollTop(containerDOMNode);
    scroll.left = getScrollLeft(containerDOMNode);
  }

  return {width, height, scroll, top, left};
}

function getDelta(axis, offset, size, containerDimensions, padding) {
  const containerScroll = containerDimensions.scroll[axis];
  const containerHeight = containerDimensions[AXIS_SIZE[axis]];

  const startEdgeOffset = offset - padding - containerScroll;
  const endEdgeOffset = offset + padding - containerScroll + size;

  if (startEdgeOffset < 0) {
    return -startEdgeOffset;
  } else if (endEdgeOffset > containerHeight) {
    return Math.max(containerHeight - endEdgeOffset, -startEdgeOffset);
  } else {
    return 0;
  }
}

function shouldFlip(axis, offset, size, padding, placement, flipContainerDimensions, containerOffsetWithBoundary) {
  const containerScroll = flipContainerDimensions.scroll[axis];
  const containerHeight = flipContainerDimensions[AXIS_SIZE[axis]];

  const startEdgeOffset = containerOffsetWithBoundary[axis] + offset - padding - containerScroll;
  const endEdgeOffset = containerOffsetWithBoundary[axis] + offset + padding - containerScroll + size;

  if (startEdgeOffset < 0 && (placement === 'top' || placement === 'left')) {
    return true;
  } else if (endEdgeOffset > containerHeight && (placement === 'bottom' || placement === 'right')) {
    return true;
  } else {
    return false;
  }
}

function getMargins(node) {
  const style = window.getComputedStyle(node);
  return {
    top: parseInt(style.marginTop, 10) || 0,
    bottom: parseInt(style.marginBottom, 10) || 0,
    left: parseInt(style.marginLeft, 10) || 0,
    right: parseInt(style.marginRight, 10) || 0
  };
}

function parsePlacement(input) {
  if (PARSED_PLACEMENT_CACHE[input]) {
    return PARSED_PLACEMENT_CACHE[input];
  }
  let [placement, crossPlacement] = input.split(' ');
  let axis = AXIS[placement] || 'right';
  let crossAxis = CROSS_AXIS[axis];

  if (!AXIS[crossPlacement]) {
    crossPlacement = 'center';
  }

  let size = AXIS_SIZE[axis];
  let crossSize = AXIS_SIZE[crossAxis];
  PARSED_PLACEMENT_CACHE[input] = {placement, crossPlacement, axis, crossAxis, size, crossSize};
  return PARSED_PLACEMENT_CACHE[input];
}

function computePosition(childOffset, containerDimensions, overlaySize, placementInfo, offset, crossOffset) {
  const {placement, crossPlacement, axis, crossAxis, size, crossSize} = placementInfo;
  let position = {};

  position[crossAxis] = childOffset[crossAxis] + crossOffset;
  if (crossPlacement === 'center') {
    position[crossAxis] += (childOffset[crossSize] - overlaySize[crossSize]) / 2;
  } else if (crossPlacement !== crossAxis) {
    position[crossAxis] += (childOffset[crossSize] - overlaySize[crossSize]);
  }

  // Ensure overlay sticks to target(ignore for overlays smaller than target)
  if (childOffset[crossSize] < overlaySize[crossSize]) {
    const positionForPositiveSideOverflow = Math.min(position[crossAxis], childOffset[crossAxis]);
    position[crossAxis] = Math.max(positionForPositiveSideOverflow, childOffset[crossAxis] - overlaySize[crossSize] + childOffset[crossSize]);
  }

  if (placement === axis) {
    position[axis] = childOffset[axis] - overlaySize[size] + offset;
  } else {
    position[axis] = childOffset[axis] + childOffset[size] + offset;
  }

  return position;
}

export function calculatePositionInternal(placementInput, containerDimensions, childOffset, overlaySize, margins, padding, flip, boundaryDimensions, containerOffsetWithBoundary, offset, crossOffset) {
  let placementInfo = parsePlacement(placementInput);
  const {axis, size, crossAxis, crossSize, placement, crossPlacement} = placementInfo;
  let position = computePosition(childOffset, containerDimensions, overlaySize, placementInfo, offset, crossOffset);
  let normalizedOffset = offset;

  // First check if placement should be flipped
  if (flip && shouldFlip(axis, position[axis], overlaySize[size], padding, placement, boundaryDimensions, containerOffsetWithBoundary)) {
    const flippedPlacementInfo = parsePlacement(`${FLIPPED_DIRECTION[placement]} ${crossPlacement}`);
    const {axis, size} = flippedPlacementInfo;
    const flippedPosition = computePosition(childOffset, containerDimensions, overlaySize, flippedPlacementInfo, -1 * offset, crossOffset);

    // Check if flipped placement has enough space otherwise flip is not possible
    if (!shouldFlip(axis, flippedPosition[axis], overlaySize[size], padding, FLIPPED_DIRECTION[placement], boundaryDimensions, containerOffsetWithBoundary)) {
      placementInfo = flippedPlacementInfo;
      position = flippedPosition;
      normalizedOffset = -1 * offset;
    }
  }

  let delta = getDelta(crossAxis, position[crossAxis], overlaySize[crossSize], boundaryDimensions, padding);
  position[crossAxis] += delta;

  let maxHeight = Math.max(0, boundaryDimensions.height + boundaryDimensions.top + boundaryDimensions.scroll.top - containerOffsetWithBoundary.top - position.top - margins.top - margins.bottom - padding);
  overlaySize.height = Math.min(overlaySize.height, maxHeight);

  position = computePosition(childOffset, containerDimensions, overlaySize, placementInfo, normalizedOffset, crossOffset);
  delta = delta = getDelta(crossAxis, position[crossAxis], overlaySize[crossSize], boundaryDimensions, padding);

  position[crossAxis] += delta;

  const arrowPosition = {};
  arrowPosition[crossAxis] = childOffset[crossSize] > overlaySize[crossSize] ? null : (childOffset[crossAxis] - position[crossAxis] + childOffset[crossSize] / 2);

  return {
    positionLeft: position.left,
    positionTop: position.top,
    maxHeight: maxHeight,
    arrowOffsetLeft: arrowPosition.left,
    arrowOffsetTop: arrowPosition.top,
    placement: placementInfo.placement
  };
}

export default function calculatePosition(placementInput, overlayNode, target, container, padding, flip, boundariesElement, offset, crossOffset) {
  const isBodyContainer = container.tagName === 'BODY';
  const childOffset = isBodyContainer ? getOffset(target) : getPosition(target, container);

  if (!isBodyContainer) {
    childOffset.top += parseInt(getCss(target, 'marginTop'), 10) || 0;
    childOffset.left += parseInt(getCss(target, 'marginLeft'), 10) || 0;
  }

  const overlaySize = getOffset(overlayNode);
  const margins = getMargins(overlayNode);
  overlaySize.width += margins.left + margins.right;
  overlaySize.height += margins.top + margins.bottom;

  const containerDimensions = getContainerDimensions(container);
  const boundaryContainer = boundariesElement === 'container' ? container : boundariesElement();
  const boundaryDimensions = getContainerDimensions(boundaryContainer);
  const containerOffsetWithBoundary = boundaryContainer.tagName === 'BODY' ? getOffset(container) : getPosition(container, boundaryContainer);
  return calculatePositionInternal(placementInput, containerDimensions, childOffset, overlaySize, margins, padding, flip, boundaryDimensions, containerOffsetWithBoundary, offset, crossOffset);
}
