import getOffset from 'dom-helpers/query/offset';
import getPosition from 'dom-helpers/query/position';
import getScrollTop from 'dom-helpers/query/scrollTop';
import getScrollLeft from 'dom-helpers/query/scrollLeft';
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
    ({ width, height } = getOffset(containerNode));
    scroll.top = getScrollTop(containerNode);
    scroll.left = getScrollLeft(containerNode);
  }

  return {width, height, scroll};
}

function getDelta(axis, offset, size, container, padding) {
  const containerDimensions = getContainerDimensions(container);
  const containerScroll = containerDimensions.scroll[axis];
  const containerHeight = containerDimensions[AXIS_SIZE[axis]];

  const startEdgeOffset = offset - padding - containerScroll;
  const endEdgeOffset = offset + padding - containerScroll + size;

  if (startEdgeOffset < 0) {
    return -startEdgeOffset;
  } else if (endEdgeOffset > containerHeight) {
    return containerHeight - endEdgeOffset;
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

function computePosition(childOffset, overlaySize, placementInfo) {
  const {placement, crossPlacement, axis, crossAxis, size, crossSize} = placementInfo;
  let position = {};

  position[crossAxis] = childOffset[crossAxis];
  if (crossPlacement === 'center') {
    position[crossAxis] += (childOffset[crossSize] - overlaySize[crossSize]) / 2;
  } else if (crossPlacement !== crossAxis) {
    position[crossAxis] += (childOffset[crossSize] - overlaySize[crossSize]);
  }

  if (placement === axis) {
    position[axis] = childOffset[axis] - overlaySize[size];
  } else {
    position[axis] = childOffset[axis] + childOffset[size];
  }

  return position;
}

export default function calculatePosition(placementInput, overlayNode, target, container, padding) {
  const childOffset = container.tagName === 'BODY' ? getOffset(target) : getPosition(target, container);

  const overlaySize = getOffset(overlayNode);
  const margins = getMargins(overlayNode);
  overlaySize.width += margins.left + margins.right;
  overlaySize.height += margins.top + margins.bottom;

  const containerDimensions = getContainerDimensions(container);

  const placementInfo = parsePlacement(placementInput);
  const {crossAxis, crossSize} = placementInfo;

  let position = computePosition(childOffset, overlaySize, placementInfo);
  let delta = getDelta(crossAxis, position[crossAxis], overlaySize[crossSize], container, padding);
  position[crossAxis] += delta;

  let maxHeight = containerDimensions.height - position.top - margins.top - margins.bottom - padding;
  overlaySize.height = Math.min(overlaySize.height, maxHeight);

  position = computePosition(childOffset, overlaySize, placementInfo);
  delta = delta = getDelta(crossAxis, position[crossAxis], overlaySize[crossSize], container, padding);

  position[crossAxis] += delta;

  let arrowPosition = {};
  arrowPosition[crossAxis] = 50 * (1 - 2 * delta / overlaySize[crossSize]) + '%';

  return {
    positionLeft: position.left,
    positionTop: position.top,
    maxHeight: maxHeight,
    arrowOffsetLeft: arrowPosition.left,
    arrowOffsetTop: arrowPosition.top
  };
}
