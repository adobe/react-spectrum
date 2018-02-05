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

const CROSS_AXIS = {
  top: 'left',
  left: 'top'
};

const AXIS_SIZE = {
  top: 'height',
  left: 'width'
};

function getContainerDimensions(containerNode) {
  let width, height;
  let scroll = {};

  if (containerNode.tagName === 'BODY') {
    width = window.innerWidth;
    height = window.innerHeight;

    scroll.top =
      getScrollTop(ownerDocument(ReactDOM.findDOMNode(containerNode)).documentElement) ||
      getScrollTop(containerNode);
    scroll.left =
      getScrollLeft(ownerDocument(ReactDOM.findDOMNode(containerNode)).documentElement) ||
      getScrollLeft(containerNode);
  } else {
    ({width, height} = getOffset(containerNode));
    scroll.top = getScrollTop(containerNode);
    scroll.left = getScrollLeft(containerNode);
  }

  return {width, height, scroll};
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
  let [placement, crossPlacement] = input.split(' ');
  let axis = AXIS[placement] || 'right';
  let crossAxis = CROSS_AXIS[axis];

  if (!AXIS[crossPlacement]) {
    crossPlacement = 'center';
  }

  let size = AXIS_SIZE[axis];
  let crossSize = AXIS_SIZE[crossAxis];
  return {placement, crossPlacement, axis, crossAxis, size, crossSize};
}

function computePosition(childOffset, overlaySize, placementInfo, offset, crossOffset) {
  const {placement, crossPlacement, axis, crossAxis, size, crossSize} = placementInfo;
  let position = {};

  position[crossAxis] = childOffset[crossAxis] + crossOffset;
  if (crossPlacement === 'center') {
    position[crossAxis] += (childOffset[crossSize] - overlaySize[crossSize]) / 2;
  } else if (crossPlacement !== crossAxis) {
    position[crossAxis] += (childOffset[crossSize] - overlaySize[crossSize]);
  }
  position[crossAxis] = Math.min(position[crossAxis], childOffset[crossAxis]);
  if (placement === axis) {
    position[axis] = childOffset[axis] - overlaySize[size] + offset;
  } else {
    position[axis] = childOffset[axis] + childOffset[size] + offset;
  }

  return position;
}

export function calculatePositionInternal(placementInput, containerDimensions, childOffset, overlaySize, margins, padding, offset = 0, crossOffset = 0) {
  const placementInfo = parsePlacement(placementInput);
  const {crossAxis, crossSize} = placementInfo;
  let position = computePosition(childOffset, overlaySize, placementInfo, offset, crossOffset);
  let delta = getDelta(crossAxis, position[crossAxis], overlaySize[crossSize], containerDimensions, padding);
  position[crossAxis] += delta;

  let maxHeight = Math.max(0, containerDimensions.height + containerDimensions.scroll.top - position.top - margins.top - margins.bottom - padding);
  overlaySize.height = Math.min(overlaySize.height, maxHeight);

  position = computePosition(childOffset, overlaySize, placementInfo, offset, crossOffset);
  delta = delta = getDelta(crossAxis, position[crossAxis], overlaySize[crossSize], containerDimensions, padding);

  position[crossAxis] += delta;

  const arrowPosition = {};
  arrowPosition[crossAxis] = childOffset[crossAxis] - position[crossAxis] + childOffset[crossSize] / 2;

  return {
    positionLeft: position.left,
    positionTop: position.top,
    maxHeight: maxHeight,
    arrowOffsetLeft: arrowPosition.left,
    arrowOffsetTop: arrowPosition.top
  };
}

export default function calculatePosition(placementInput, overlayNode, target, container, padding, offset = 0, crossOffset = 0) {
  const childOffset = container.tagName === 'BODY' ? getOffset(target) : getPosition(target, container);

  const overlaySize = getOffset(overlayNode);
  const margins = getMargins(overlayNode);
  overlaySize.width += margins.left + margins.right;
  overlaySize.height += margins.top + margins.bottom;

  const containerDimensions = getContainerDimensions(container);
  return calculatePositionInternal(placementInput, containerDimensions, childOffset, overlaySize, margins, padding, offset, crossOffset);
}
