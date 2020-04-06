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

import {calculatePosition} from '../src/calculatePosition';

const FLIPPED_DIRECTION = {
  left: 'right'
};

function getTargetDimension(targetPosition, height = 100, width = 100) {
  return {
    ...targetPosition,
    bottom: targetPosition.top + height,
    right: targetPosition.left + width,
    width,
    height
  };
}

const containerDimensions = {
  width: 600,
  height: 600,
  scroll: {
    top: 0,
    left: 0
  },
  top: 0,
  left: 0
};

// Reset JSDom's default margin on the body
document.body.style.margin = 0;

function createElementWithDimensions(elemName, dimensions, margins) {
  margins = margins || {};
  let elem = document.createElement(elemName);

  Object.assign(elem.style, {
    width: 'width' in dimensions ? `${dimensions.width}px` : '0px',
    height: 'height' in dimensions ? `${dimensions.height}px` : '0px',
    top: 'top' in dimensions ? `${dimensions.top}px` : '0px',
    left: 'left' in dimensions ? `${dimensions.left}px` : '0px',
    marginTop: 'top' in margins ? `${margins.top}px` : '0px',
    marginBottom: 'bottom' in margins ? `${margins.bottom}px` : '0px',
    marginRight: 'right' in margins ? `${margins.right}px` : '0px',
    marginLeft: 'left' in margins ? `${margins.left}px` : '0px'
  });

  elem.scrollTop = 'scroll' in dimensions ? dimensions.scroll.top : 0;
  elem.scrollLeft = 'scroll' in dimensions ? dimensions.scroll.left : 0;

  elem.getBoundingClientRect = () => ({
    width: dimensions.width || 0,
    height: dimensions.height || 0,
    top: dimensions.top || 0,
    left: dimensions.left || 0,
    right: dimensions.right || 0,
    bottom: dimensions.bottom || 0
  });

  jest.spyOn(elem, 'scrollWidth', 'get').mockImplementation(() => dimensions.width || 0);
  jest.spyOn(elem, 'scrollHeight', 'get').mockImplementation(() => dimensions.height || 0);

  return elem;
}

const boundaryDimensions = {
  width: 600,
  height: 600,
  scroll: {
    top: 0,
    left: 0
  },
  top: 0,
  left: 0
};

const margins = {
  top: 0,
  left: 0,
  bottom: 0,
  right: 0
};

const overlaySize = {
  width: 200,
  height: 200
};

const PROVIDER_OFFSET = 50;

describe('calculatePosition', function () {
  function checkPositionCommon(title, expected, placement, targetDimension, boundaryDimensions, offset, crossOffset, flip, providerOffset = 0) {
    const placementAxis = placement.split(' ')[0];

    // The tests are all based on top/left positioning. Convert to bottom/right positioning if needed.
    let pos = {};
    if ((placementAxis === 'left' && !flip) || (placementAxis === 'right' && flip)) {
      pos.right = boundaryDimensions.width - (expected[0] + overlaySize.width);
      pos.top = expected[1];
    } else if ((placementAxis === 'right' && !flip) || (placementAxis === 'left' && flip)) {
      pos.left = expected[0];
      pos.top = expected[1];
    } else if (placementAxis === 'top') {
      pos.left = expected[0];
      pos.bottom = boundaryDimensions.height - providerOffset - (expected[1] + overlaySize.height);
    } else if (placementAxis === 'bottom') {
      pos.left = expected[0];
      pos.top = expected[1];
    }
    
    const expectedPosition = {
      position: pos,
      arrowOffsetLeft: expected[2],
      arrowOffsetTop: expected[3],
      maxHeight: expected[4] - (placementAxis !== 'top' ? providerOffset : 0),
      placement: flip ? FLIPPED_DIRECTION[placementAxis] : placementAxis
    };

    const container = createElementWithDimensions('div', containerDimensions);
    const target = createElementWithDimensions('div', targetDimension);
    const overlay = createElementWithDimensions('div', overlaySize, margins);

    const parentElement = document.createElement('div');
    parentElement.appendChild(container);
    parentElement.appendChild(target);
    parentElement.appendChild(overlay);

    document.documentElement.appendChild(parentElement);

    const boundariesElem = createElementWithDimensions('div', {
      ...boundaryDimensions,
      height: boundaryDimensions.height - providerOffset
    });
    parentElement.appendChild(boundariesElem);


    it(title, function () {
      const result = calculatePosition({
        placement,
        overlayNode: overlay,
        targetNode: target,
        scrollNode: overlay,
        padding: 50,
        shouldFlip: flip,
        boundaryElement: boundariesElem,
        offset,
        crossOffset
      });
      expect(result).toEqual(expectedPosition);
      document.documentElement.removeChild(parentElement);
    });
  }

  function checkPosition(placement, targetDimension, expected, offset = 0, crossOffset = 0, flip = false) {
    checkPositionCommon(
      'Should calculate the correct position',
      expected,
      placement,
      targetDimension,
      boundaryDimensions,
      offset,
      crossOffset,
      flip
    );
  }

  function checkPositionForProvider(placement, targetDimension, expected, offset = 0, crossOffset = 0, flip = false) {
    checkPositionCommon(
      'Should calculate the correct position when provider does not start at top of screen',
      expected,
      placement,
      targetDimension,
      boundaryDimensions,
      offset,
      crossOffset,
      flip,
      PROVIDER_OFFSET
    );
  }

  const testCases = [
    {
      placement: 'left',
      noOffset: [50, 200, undefined, 100, 350],
      offsetBefore: [-200, 50, undefined, 0, 500],
      offsetAfter: [300, 350, undefined, 200, 200],
      crossAxisOffset: [50, 210, undefined, 90, 340],
      mainAxisOffset: [60, 200, undefined, 100, 350]
    },
    {
      placement: 'left top',
      noOffset: [50, 250, undefined, 50, 300],
      offsetBefore: [-200, 50, undefined, 0, 500],
      offsetAfter: [300, 350, undefined, 200, 200],
      crossAxisOffset: [50, 250, undefined, 50, 300],
      mainAxisOffset: [60, 250, undefined, 50, 300]
    },
    {
      placement: 'left bottom',
      noOffset: [50, 150, undefined, 150, 400],
      offsetBefore: [-200, 50, undefined, 0, 500],
      offsetAfter: [300, 350, undefined, 200, 200],
      crossAxisOffset: [50, 160, undefined, 140, 390],
      mainAxisOffset: [60, 150, undefined, 150, 400]
    },
    {
      placement: 'top',
      noOffset: [200, 50, 100, undefined, 200],
      offsetBefore: [50, -200, 0, undefined, 0],
      offsetAfter: [350, 300, 200, undefined, 450],
      mainAxisOffset: [200, 60, 100, undefined, 200],
      crossAxisOffset: [210, 50, 90, undefined, 200]
    },
    {
      placement: 'top left',
      noOffset: [250, 50, 50, undefined, 200],
      offsetBefore: [50, -200, 0, undefined, 0],
      offsetAfter: [350, 300, 200, undefined, 450],
      mainAxisOffset: [250, 60, 50, undefined, 200],
      crossAxisOffset: [250, 50, 50, undefined, 200]
    },
    {
      placement: 'top right',
      noOffset: [150, 50, 150, undefined, 200],
      offsetBefore: [50, -200, 0, undefined, 0],
      offsetAfter: [350, 300, 200, undefined, 450],
      mainAxisOffset: [150, 60, 150, undefined, 200],
      crossAxisOffset: [160, 50, 140, undefined, 200]
    },
    {
      placement: 'bottom',
      noOffset: [200, 350, 100, undefined, 200],
      offsetBefore: [50, 100, 0, undefined, 450],
      offsetAfter: [350, 600, 200, undefined, 0],
      mainAxisOffset: [200, 360, 100, undefined, 190],
      crossAxisOffset: [210, 350, 90, undefined, 200]
    },
    {
      placement: 'bottom left',
      noOffset: [250, 350, 50, undefined, 200],
      offsetBefore: [50, 100, 0, undefined, 450],
      offsetAfter: [350, 600, 200, undefined, 0],
      mainAxisOffset: [250, 360, 50, undefined, 190],
      crossAxisOffset: [250, 350, 50, undefined, 200]
    },
    {
      placement: 'bottom right',
      noOffset: [150, 350, 150, undefined, 200],
      offsetBefore: [50, 100, 0, undefined, 450],
      offsetAfter: [350, 600, 200, undefined, 0],
      mainAxisOffset: [150, 360, 150, undefined, 190],
      crossAxisOffset: [160, 350, 140, undefined, 200]
    },
    {
      placement: 'right',
      noOffset: [350, 200, undefined, 100, 350],
      offsetBefore: [100, 50, undefined, 0, 500],
      offsetAfter: [600, 350, undefined, 200, 200],
      crossAxisOffset: [350, 210, undefined, 90, 340],
      mainAxisOffset: [360, 200, undefined, 100, 350]
    },
    {
      placement: 'right top',
      noOffset: [350, 250, undefined, 50, 300],
      offsetBefore: [100, 50, undefined, 0, 500],
      offsetAfter: [600, 350, undefined, 200, 200],
      crossAxisOffset: [350, 250, undefined, 50, 300],
      mainAxisOffset: [360, 250, undefined, 50, 300]
    },
    {
      placement: 'right bottom',
      noOffset: [350, 150, undefined, 150, 400],
      offsetBefore: [100, 50, undefined, 0, 500],
      offsetAfter: [600, 350, undefined, 200, 200],
      crossAxisOffset: [350, 160, undefined, 140, 390],
      mainAxisOffset: [360, 150, undefined, 150, 400]
    }
  ];

  testCases.forEach(function (testCase) {
    const {placement} = testCase;

    describe(`placement = ${placement}`, function () {
      describe('no viewport offset', function () {
        checkPosition(
          placement, getTargetDimension({left: 250, top: 250}), testCase.noOffset
        );
        checkPositionForProvider(
          placement, getTargetDimension({left: 250, top: 250}), testCase.noOffset
        );
      });

      describe('viewport offset before', function () {
        checkPosition(
          placement, getTargetDimension({left: 0, top: 0}), testCase.offsetBefore
        );
        checkPositionForProvider(
          placement, getTargetDimension({left: 250, top: 250}), testCase.noOffset
        );
      });

      describe('viewport offset after', function () {
        checkPosition(
          placement, getTargetDimension({left: 500, top: 500}), testCase.offsetAfter
        );
      });

      describe('main axis offset', function () {
        checkPosition(
          placement, getTargetDimension({left: 250, top: 250}), testCase.mainAxisOffset, 10, 0
        );
      });

      describe('cross axis offset', function () {
        checkPosition(
          placement, getTargetDimension({left: 250, top: 250}), testCase.crossAxisOffset, 0, 10
        );
      });
    });
  });

  describe('flip from left to right', function () {
    checkPosition(
      // testCases[9] is for right placement
      'left', getTargetDimension({left: 0, top: 0}), testCases[9].offsetBefore, 0, 0, true
    );
  });

  describe('overlay smaller than target aligns in center', function () {
    checkPosition(
      'right', getTargetDimension({left: 250, top: 250}, overlaySize.height + 100, overlaySize.width + 100), [550, 300, undefined, null, 250]
    );
  });

  describe('overlay target has margin', () => {
    it('checks if overlay positions correctly', () => {
      const target = document.createElement('div');
      const overlayNode = document.createElement('div');
      const container = document.createElement('div');

      target.style = 'margin:20px';
      document.body.appendChild(target);

      let {position: {top: positionTop}} = calculatePosition({
        placement: 'bottom',
        overlayNode,
        targetNode: target,
        scrollNode: overlayNode,
        padding: 0,
        shouldFlip: false,
        boundaryElement: container,
        offset: 0,
        crossOffset: 0
      });
      expect(positionTop).toBe(0);

      document.body.removeChild(target);
    });
  });
});
