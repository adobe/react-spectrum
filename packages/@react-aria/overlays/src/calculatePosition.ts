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

import {Axis, Placement, PlacementAxis, SizeAxis} from '@react-types/overlays';
import {clamp, isWebKit} from '@react-aria/utils';

interface Position {
  top?: number,
  left?: number,
  bottom?: number,
  right?: number
}

interface Dimensions {
  width: number,
  height: number,
  totalWidth: number,
  totalHeight: number,
  top: number,
  left: number,
  scroll: Position
}

interface ParsedPlacement {
  placement: PlacementAxis,
  crossPlacement: PlacementAxis,
  axis: Axis,
  crossAxis: Axis,
  size: SizeAxis,
  crossSize: SizeAxis
}

interface Offset {
  top: number,
  left: number,
  width: number,
  height: number
}

interface PositionOpts {
  arrowSize: number,
  placement: Placement,
  targetNode: Element,
  overlayNode: Element,
  scrollNode: Element,
  padding: number,
  shouldFlip: boolean,
  boundaryElement: Element,
  offset: number,
  crossOffset: number,
  maxHeight?: number,
  arrowBoundaryOffset?: number
}

type HeightGrowthDirection = 'top' | 'bottom';

export interface PositionResult {
  position: Position,
  arrowOffsetLeft?: number,
  arrowOffsetTop?: number,
  triggerAnchorPoint: {x: number, y: number},
  maxHeight: number,
  placement: PlacementAxis
}

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

const TOTAL_SIZE = {
  width: 'totalWidth',
  height: 'totalHeight'
};

const PARSED_PLACEMENT_CACHE = {};

let visualViewport = typeof document !== 'undefined' ? window.visualViewport : null;

function getContainerDimensions(containerNode: Element): Dimensions {
  let width = 0, height = 0, totalWidth = 0, totalHeight = 0, top = 0, left = 0;
  let scroll: Position = {};
  let isPinchZoomedIn = (visualViewport?.scale ?? 1) > 1;

  if (containerNode.tagName === 'BODY') {
    let documentElement = document.documentElement;
    totalWidth = documentElement.clientWidth;
    totalHeight = documentElement.clientHeight;
    width = visualViewport?.width ?? totalWidth;
    height = visualViewport?.height ?? totalHeight;
    scroll.top = documentElement.scrollTop || containerNode.scrollTop;
    scroll.left = documentElement.scrollLeft || containerNode.scrollLeft;

    // The goal of the below is to get a top/left value that represents the top/left of the visual viewport with
    // respect to the layout viewport origin. This combined with the scrollTop/scrollLeft will allow us to calculate
    // coordinates/values with respect to the visual viewport or with respect to the layout viewport.
    if (visualViewport) {
      top = visualViewport.offsetTop;
      left = visualViewport.offsetLeft;
    }
  } else {
    ({width, height, top, left} = getOffset(containerNode, false));
    scroll.top = containerNode.scrollTop;
    scroll.left = containerNode.scrollLeft;
    totalWidth = width;
    totalHeight = height;
  }

  if (isWebKit() && (containerNode.tagName === 'BODY' || containerNode.tagName === 'HTML') && isPinchZoomedIn) {
    // Safari will report a non-zero scrollTop/Left for the non-scrolling body/HTML element when pinch zoomed in unlike other browsers.
    // Set to zero for parity calculations so we get consistent positioning of overlays across all browsers.
    // Also switch to visualViewport.pageTop/pageLeft so that we still accomodate for scroll positioning for body/HTML elements that are actually scrollable
    // before pinch zoom happens
    scroll.top = 0;
    scroll.left = 0;
    top = visualViewport?.pageTop ?? 0;
    left = visualViewport?.pageLeft ?? 0;
  }

  return {width, height, totalWidth, totalHeight, scroll, top, left};
}

function getScroll(node: Element): Offset {
  return {
    top: node.scrollTop,
    left: node.scrollLeft,
    width: node.scrollWidth,
    height: node.scrollHeight
  };
}

// Determines the amount of space required when moving the overlay to ensure it remains in the boundary
function getDelta(
  axis: Axis,
  offset: number,
  size: number,
  // The dimensions of the boundary element that the popover is
  // positioned within (most of the time this is the <body>).
  boundaryDimensions: Dimensions,
  // The dimensions of the containing block element that the popover is
  // positioned relative to (e.g. parent with position: relative).
  // Usually this is the same as the boundary element, but if the popover
  // is portaled somewhere other than the body and has an ancestor with
  // position: relative/absolute, it will be different.
  containerDimensions: Dimensions,
  padding: number,
  containerOffsetWithBoundary: Offset
) {
  let containerScroll = containerDimensions.scroll[axis] ?? 0;
  // The height/width of the boundary. Matches the axis along which we are adjusting the overlay position
  let boundarySize = boundaryDimensions[AXIS_SIZE[axis]];
  // Calculate the edges of the boundary (accomodating for the boundary padding) and the edges of the overlay.
  // Note that these values are with respect to the visual viewport (aka 0,0 is the top left of the viewport)
  let boundaryStartEdge = boundaryDimensions.scroll[AXIS[axis]] + padding;
  let boundaryEndEdge = boundarySize + boundaryDimensions.scroll[AXIS[axis]] - padding;
  let startEdgeOffset = offset - containerScroll + containerOffsetWithBoundary[axis] - boundaryDimensions[AXIS[axis]];
  let endEdgeOffset = offset - containerScroll + size + containerOffsetWithBoundary[axis] - boundaryDimensions[AXIS[axis]];

  // If any of the overlay edges falls outside of the boundary, shift the overlay the required amount to align one of the overlay's
  // edges with the closest boundary edge.
  if (startEdgeOffset < boundaryStartEdge) {
    return boundaryStartEdge - startEdgeOffset;
  } else if (endEdgeOffset > boundaryEndEdge) {
    return Math.max(boundaryEndEdge - endEdgeOffset, boundaryStartEdge - startEdgeOffset);
  } else {
    return 0;
  }
}

function getMargins(node: Element): Position {
  let style = window.getComputedStyle(node);
  return {
    top: parseInt(style.marginTop, 10) || 0,
    bottom: parseInt(style.marginBottom, 10) || 0,
    left: parseInt(style.marginLeft, 10) || 0,
    right: parseInt(style.marginRight, 10) || 0
  };
}

function parsePlacement(input: Placement): ParsedPlacement {
  if (PARSED_PLACEMENT_CACHE[input]) {
    return PARSED_PLACEMENT_CACHE[input];
  }

  let [placement, crossPlacement] = input.split(' ');
  let axis: Axis = AXIS[placement] || 'right';
  let crossAxis: Axis = CROSS_AXIS[axis];

  if (!AXIS[crossPlacement]) {
    crossPlacement = 'center';
  }

  let size = AXIS_SIZE[axis];
  let crossSize = AXIS_SIZE[crossAxis];
  PARSED_PLACEMENT_CACHE[input] = {placement, crossPlacement, axis, crossAxis, size, crossSize};
  return PARSED_PLACEMENT_CACHE[input];
}

function computePosition(
  childOffset: Offset,
  boundaryDimensions: Dimensions,
  overlaySize: Offset,
  placementInfo: ParsedPlacement,
  offset: number,
  crossOffset: number,
  containerOffsetWithBoundary: Offset,
  isContainerPositioned: boolean,
  arrowSize: number,
  arrowBoundaryOffset: number
) {
  let {placement, crossPlacement, axis, crossAxis, size, crossSize} = placementInfo;
  let position: Position = {};

  // button position
  position[crossAxis] = childOffset[crossAxis] ?? 0;
  if (crossPlacement === 'center') {
    //  + (button size / 2) - (overlay size / 2)
    // at this point the overlay center should match the button center
    position[crossAxis]! += ((childOffset[crossSize] ?? 0) - (overlaySize[crossSize] ?? 0)) / 2;
  } else if (crossPlacement !== crossAxis) {
    //  + (button size) - (overlay size)
    // at this point the overlay bottom should match the button bottom
    position[crossAxis]! += (childOffset[crossSize] ?? 0) - (overlaySize[crossSize] ?? 0);
  }/* else {
    the overlay top should match the button top
  } */

  position[crossAxis]! += crossOffset;

  // overlay top overlapping arrow with button bottom
  const minPosition = childOffset[crossAxis] - overlaySize[crossSize] + arrowSize + arrowBoundaryOffset;
  // overlay bottom overlapping arrow with button top
  const maxPosition = childOffset[crossAxis] + childOffset[crossSize] - arrowSize - arrowBoundaryOffset;
  position[crossAxis] = clamp(position[crossAxis]!, minPosition, maxPosition);

  // Floor these so the position isn't placed on a partial pixel, only whole pixels. Shouldn't matter if it was floored or ceiled, so chose one.
  if (placement === axis) {
    // If the container is positioned (non-static), then we use the container's actual
    // height, as `bottom` will be relative to this height.  But if the container is static,
    // then it can only be the `document.body`, and `bottom` will be relative to _its_
    // container, which should be as large as boundaryDimensions.
    const containerHeight = (isContainerPositioned ? containerOffsetWithBoundary[size] : boundaryDimensions[TOTAL_SIZE[size]]);
    position[FLIPPED_DIRECTION[axis]] = Math.floor(containerHeight - childOffset[axis] + offset);
  } else {
    position[axis] = Math.floor(childOffset[axis] + childOffset[size] + offset);
  }
  return position;
}

function getMaxHeight(
  position: Position,
  boundaryDimensions: Dimensions,
  containerOffsetWithBoundary: Offset,
  isContainerPositioned: boolean,
  margins: Position,
  padding: number,
  overlayHeight: number,
  heightGrowthDirection: HeightGrowthDirection
) {
  const containerHeight = (isContainerPositioned ? containerOffsetWithBoundary.height : boundaryDimensions[TOTAL_SIZE.height]);
  // For cases where position is set via "bottom" instead of "top", we need to calculate the true overlay top with respect to the boundary. Reverse calculate this with the same method
  // used in computePosition.
  let overlayTop = position.top != null ? containerOffsetWithBoundary.top + position.top : containerOffsetWithBoundary.top + (containerHeight - (position.bottom ?? 0) - overlayHeight);
  let maxHeight = heightGrowthDirection !== 'top' ?
    // We want the distance between the top of the overlay to the bottom of the boundary
    Math.max(0,
      (boundaryDimensions.height + boundaryDimensions.top + (boundaryDimensions.scroll.top ?? 0)) // this is the bottom of the boundary
      - overlayTop // this is the top of the overlay
      - ((margins.top ?? 0) + (margins.bottom ?? 0) + padding) // save additional space for margin and padding
    )
    // We want the distance between the bottom of the overlay to the top of the boundary
    : Math.max(0,
      (overlayTop + overlayHeight) // this is the bottom of the overlay
      - (boundaryDimensions.top + (boundaryDimensions.scroll.top ?? 0)) // this is the top of the boundary
      - ((margins.top ?? 0) + (margins.bottom ?? 0) + padding) // save additional space for margin and padding
    );
  return Math.min(boundaryDimensions.height - (padding * 2), maxHeight);
}

function getAvailableSpace(
  boundaryDimensions: Dimensions,
  containerOffsetWithBoundary: Offset,
  childOffset: Offset,
  margins: Position,
  padding: number,
  placementInfo: ParsedPlacement
) {
  let {placement, axis, size} = placementInfo;
  if (placement === axis) {
    return Math.max(0, childOffset[axis] - boundaryDimensions[axis] - (boundaryDimensions.scroll[axis] ?? 0) + containerOffsetWithBoundary[axis] - (margins[axis] ?? 0) - margins[FLIPPED_DIRECTION[axis]] - padding);
  }

  return Math.max(0, boundaryDimensions[size] + boundaryDimensions[axis] + boundaryDimensions.scroll[axis] - containerOffsetWithBoundary[axis] - childOffset[axis] - childOffset[size] - (margins[axis] ?? 0) - margins[FLIPPED_DIRECTION[axis]] - padding);
}

export function calculatePositionInternal(
  placementInput: Placement,
  childOffset: Offset,
  overlaySize: Offset,
  scrollSize: Offset,
  margins: Position,
  padding: number,
  flip: boolean,
  boundaryDimensions: Dimensions,
  containerDimensions: Dimensions,
  containerOffsetWithBoundary: Offset,
  offset: number,
  crossOffset: number,
  isContainerPositioned: boolean,
  userSetMaxHeight: number | undefined,
  arrowSize: number,
  arrowBoundaryOffset: number
): PositionResult {
  let placementInfo = parsePlacement(placementInput);
  let {size, crossAxis, crossSize, placement, crossPlacement} = placementInfo;
  let position = computePosition(childOffset, boundaryDimensions, overlaySize, placementInfo, offset, crossOffset, containerOffsetWithBoundary, isContainerPositioned, arrowSize, arrowBoundaryOffset);
  let normalizedOffset = offset;
  let space = getAvailableSpace(
    boundaryDimensions,
    containerOffsetWithBoundary,
    childOffset,
    margins,
    padding + offset,
    placementInfo
  );

  // Check if the scroll size of the overlay is greater than the available space to determine if we need to flip
  if (flip && scrollSize[size] > space) {
    let flippedPlacementInfo = parsePlacement(`${FLIPPED_DIRECTION[placement]} ${crossPlacement}` as Placement);
    let flippedPosition = computePosition(childOffset, boundaryDimensions, overlaySize, flippedPlacementInfo, offset, crossOffset, containerOffsetWithBoundary, isContainerPositioned, arrowSize, arrowBoundaryOffset);
    let flippedSpace = getAvailableSpace(
      boundaryDimensions,
      containerOffsetWithBoundary,
      childOffset,
      margins,
      padding + offset,
      flippedPlacementInfo
    );

    // If the available space for the flipped position is greater than the original available space, flip.
    if (flippedSpace > space) {
      placementInfo = flippedPlacementInfo;
      position = flippedPosition;
      normalizedOffset = offset;
    }
  }

  // Determine the direction the height of the overlay can grow so that we can choose how to calculate the max height
  let heightGrowthDirection: HeightGrowthDirection = 'bottom';
  if (placementInfo.axis === 'top') {
    if (placementInfo.placement === 'top') {
      heightGrowthDirection = 'top';
    } else if (placementInfo.placement === 'bottom') {
      heightGrowthDirection = 'bottom';
    }
  } else if (placementInfo.crossAxis === 'top') {
    if (placementInfo.crossPlacement === 'top') {
      heightGrowthDirection = 'bottom';
    } else if (placementInfo.crossPlacement === 'bottom') {
      heightGrowthDirection = 'top';
    }
  }

  let delta = getDelta(crossAxis, position[crossAxis]!, overlaySize[crossSize], boundaryDimensions, containerDimensions, padding, containerOffsetWithBoundary);
  position[crossAxis]! += delta;

  let maxHeight = getMaxHeight(
    position,
    boundaryDimensions,
    containerOffsetWithBoundary,
    isContainerPositioned,
    margins,
    padding,
    overlaySize.height,
    heightGrowthDirection
  );

  if (userSetMaxHeight && userSetMaxHeight < maxHeight) {
    maxHeight = userSetMaxHeight;
  }

  overlaySize.height = Math.min(overlaySize.height, maxHeight);

  position = computePosition(childOffset, boundaryDimensions, overlaySize, placementInfo, normalizedOffset, crossOffset, containerOffsetWithBoundary, isContainerPositioned, arrowSize, arrowBoundaryOffset);
  delta = getDelta(crossAxis, position[crossAxis]!, overlaySize[crossSize], boundaryDimensions, containerDimensions, padding, containerOffsetWithBoundary);
  position[crossAxis]! += delta;

  let arrowPosition: Position = {};

  // All values are transformed so that 0 is at the top/left of the overlay depending on the orientation
  // Prefer the arrow being in the center of the trigger/overlay anchor element
  // childOffset[crossAxis] + .5 * childOffset[crossSize] = absolute position with respect to the trigger's coordinate system that would place the arrow in the center of the trigger
  // position[crossAxis] - margins[AXIS[crossAxis]] = value use to transform the position to a value with respect to the overlay's coordinate system. A child element's (aka arrow) position absolute's "0"
  // is positioned after the margin of its parent (aka overlay) so we need to subtract it to get the proper coordinate transform
  let origin = childOffset[crossAxis] - position[crossAxis]! - margins[AXIS[crossAxis]];
  let preferredArrowPosition = origin + .5 * childOffset[crossSize];

  // Min/Max position limits for the arrow with respect to the overlay
  const arrowMinPosition = arrowSize / 2 + arrowBoundaryOffset;
  // overlaySize[crossSize] - margins = true size of the overlay
  const overlayMargin = AXIS[crossAxis] === 'left' ? (margins.left ?? 0) + (margins.right ?? 0) : (margins.top ?? 0) + (margins.bottom ?? 0);
  const arrowMaxPosition = overlaySize[crossSize] - overlayMargin - (arrowSize / 2) - arrowBoundaryOffset;

  // Min/Max position limits for the arrow with respect to the trigger/overlay anchor element
  // Same margin accomodation done here as well as for the preferredArrowPosition
  const arrowOverlappingChildMinEdge = childOffset[crossAxis] + (arrowSize / 2) - (position[crossAxis] + margins[AXIS[crossAxis]]);
  const arrowOverlappingChildMaxEdge = childOffset[crossAxis] + childOffset[crossSize] - (arrowSize / 2) - (position[crossAxis] + margins[AXIS[crossAxis]]);

  // Clamp the arrow positioning so that it always is within the bounds of the anchor and the overlay
  const arrowPositionOverlappingChild = clamp(preferredArrowPosition, arrowOverlappingChildMinEdge, arrowOverlappingChildMaxEdge);
  arrowPosition[crossAxis] = clamp(arrowPositionOverlappingChild, arrowMinPosition, arrowMaxPosition);

  // If there is an arrow, use that as the origin so that animations are smooth.
  // Otherwise use the target edge.
  ({placement, crossPlacement} = placementInfo);
  if (arrowSize) {
    origin = arrowPosition[crossAxis];
  } else if (crossPlacement === 'right') {
    origin += childOffset[crossSize];
  } else if (crossPlacement === 'center') {
    origin += childOffset[crossSize] / 2;
  }

  let crossOrigin = placement === 'left' || placement === 'top' ? overlaySize[size] : 0;
  let triggerAnchorPoint = {
    x: placement === 'top' || placement === 'bottom' ? origin : crossOrigin,
    y: placement === 'left' || placement === 'right' ? origin : crossOrigin
  };

  return {
    position,
    maxHeight: maxHeight,
    arrowOffsetLeft: arrowPosition.left,
    arrowOffsetTop: arrowPosition.top,
    placement,
    triggerAnchorPoint
  };
}

/**
 * Determines where to place the overlay with regards to the target and the position of an optional indicator.
 */
export function calculatePosition(opts: PositionOpts): PositionResult {
  let {
    placement,
    targetNode,
    overlayNode,
    scrollNode,
    padding,
    shouldFlip,
    boundaryElement,
    offset,
    crossOffset,
    maxHeight,
    arrowSize = 0,
    arrowBoundaryOffset = 0
  } = opts;

  let container = overlayNode instanceof HTMLElement ? getContainingBlock(overlayNode) : document.documentElement;
  let isViewportContainer = container === document.documentElement;
  const containerPositionStyle = window.getComputedStyle(container).position;
  let isContainerPositioned = !!containerPositionStyle && containerPositionStyle !== 'static';
  let childOffset: Offset = isViewportContainer ? getOffset(targetNode, false) : getPosition(targetNode, container, false);

  if (!isViewportContainer) {
    let {marginTop, marginLeft} = window.getComputedStyle(targetNode);
    childOffset.top += parseInt(marginTop, 10) || 0;
    childOffset.left += parseInt(marginLeft, 10) || 0;
  }

  let overlaySize: Offset = getOffset(overlayNode, true);
  let margins = getMargins(overlayNode);
  overlaySize.width += (margins.left ?? 0) + (margins.right ?? 0);
  overlaySize.height += (margins.top ?? 0) + (margins.bottom ?? 0);

  let scrollSize = getScroll(scrollNode);
  let boundaryDimensions = getContainerDimensions(boundaryElement);
  let containerDimensions = getContainerDimensions(container);
  // If the container is the HTML element wrapping the body element, the retrieved scrollTop/scrollLeft will be equal to the
  // body element's scroll. Set the container's scroll values to 0 since the overlay's edge position value in getDelta don't then need to be further offset
  // by the container scroll since they are essentially the same containing element and thus in the same coordinate system
  let containerOffsetWithBoundary: Offset = boundaryElement.tagName === 'BODY' ? getOffset(container, false) : getPosition(container, boundaryElement, false);
  if (container.tagName === 'HTML' && boundaryElement.tagName === 'BODY') {
    containerDimensions.scroll.top = 0;
    containerDimensions.scroll.left = 0;
  }

  return calculatePositionInternal(
    placement,
    childOffset,
    overlaySize,
    scrollSize,
    margins,
    padding,
    shouldFlip,
    boundaryDimensions,
    containerDimensions,
    containerOffsetWithBoundary,
    offset,
    crossOffset,
    isContainerPositioned,
    maxHeight,
    arrowSize,
    arrowBoundaryOffset
  );
}

export function getRect(node: Element, ignoreScale: boolean) {
  let {top, left, width, height} = node.getBoundingClientRect();

  // Use offsetWidth and offsetHeight if this is an HTML element, so that 
  // the size is not affected by scale transforms.
  if (ignoreScale && node instanceof node.ownerDocument.defaultView!.HTMLElement) {
    width = node.offsetWidth;
    height = node.offsetHeight;
  }

  return {top, left, width, height};
}

function getOffset(node: Element, ignoreScale: boolean): Offset {
  let {top, left, width, height} = getRect(node, ignoreScale);
  let {scrollTop, scrollLeft, clientTop, clientLeft} = document.documentElement;
  return {
    top: top + scrollTop - clientTop,
    left: left + scrollLeft - clientLeft,
    width,
    height
  };
}

function getPosition(node: Element, parent: Element, ignoreScale: boolean): Offset {
  let style = window.getComputedStyle(node);
  let offset: Offset;
  if (style.position === 'fixed') {
    offset = getRect(node, ignoreScale);
  } else {
    offset = getOffset(node, ignoreScale);
    let parentOffset = getOffset(parent, ignoreScale);
    let parentStyle = window.getComputedStyle(parent);
    parentOffset.top += (parseInt(parentStyle.borderTopWidth, 10) || 0) - parent.scrollTop;
    parentOffset.left += (parseInt(parentStyle.borderLeftWidth, 10) || 0) - parent.scrollLeft;
    offset.top -= parentOffset.top;
    offset.left -= parentOffset.left;
  }

  offset.top -= parseInt(style.marginTop, 10) || 0;
  offset.left -= parseInt(style.marginLeft, 10) || 0;
  return offset;
}

// Returns the containing block of an element, which is the element that
// this element will be positioned relative to.
// https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block
function getContainingBlock(node: HTMLElement): Element {
  // The offsetParent of an element in most cases equals the containing block.
  // https://w3c.github.io/csswg-drafts/cssom-view/#dom-htmlelement-offsetparent
  let offsetParent = node.offsetParent;

  // The offsetParent algorithm terminates at the document body,
  // even if the body is not a containing block. Double check that
  // and use the documentElement if so.
  if (
    offsetParent &&
    offsetParent === document.body &&
    window.getComputedStyle(offsetParent).position === 'static' &&
    !isContainingBlock(offsetParent)
  ) {
    offsetParent = document.documentElement;
  }

  // TODO(later): handle table elements?

  // The offsetParent can be null if the element has position: fixed, or a few other cases.
  // We have to walk up the tree manually in this case because fixed positioned elements
  // are still positioned relative to their containing block, which is not always the viewport.
  if (offsetParent == null) {
    offsetParent = node.parentElement;
    while (offsetParent && !isContainingBlock(offsetParent)) {
      offsetParent = offsetParent.parentElement;
    }
  }

  // Fall back to the viewport.
  return offsetParent || document.documentElement;
}

// https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
function isContainingBlock(node: Element): boolean {
  let style = window.getComputedStyle(node);
  return (
    style.transform !== 'none' ||
    /transform|perspective/.test(style.willChange) ||
    style.filter !== 'none' ||
    style.contain === 'paint' ||
    ('backdropFilter' in style && style.backdropFilter !== 'none') ||
    ('WebkitBackdropFilter' in style && style.WebkitBackdropFilter !== 'none')
  );
}
