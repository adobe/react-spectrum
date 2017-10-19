import assert from 'assert';
import {calculatePositionInternal} from '../../src/OverlayTrigger/js/calculatePosition';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';

describe('calculatePosition', function () {
  function checkPosition(placement, targetPosition, expected) {
    const expectedPosition = {
      positionLeft: expected[0],
      positionTop: expected[1],
      arrowOffsetLeft: expected[2],
      arrowOffsetTop: expected[3],
      maxHeight: expected[4]
    };

    const containerDimensions = {
      width: 600,
      height: 600,
      scroll: {
        top: 0,
        left: 0
      }
    };

    const overlaySize = {
      width: 200,
      height: 200
    };

    const margins = {
      top: 0,
      left: 0,
      bottom: 0,
      right: 0
    };

    it('Should calculate the correct position', function () {
      const childOffset = {
        ...targetPosition,
        bottom: targetPosition.top + 100,
        right: targetPosition.left + 100,
        width: 100,
        height: 100
      };

      const result = calculatePositionInternal(placement, containerDimensions, childOffset, overlaySize, margins, 50);
      assert.deepEqual(result, expectedPosition);
    });
  }

  [
    {
      placement: 'left',
      noOffset: [50, 200, undefined, '50%', 350],
      offsetBefore: [-200, 50, undefined, '0%', 500],
      offsetAfter: [300, 350, undefined, '100%', 200]
    },
    {
      placement: 'left top',
      noOffset: [50, 250, undefined, '50%', 300],
      offsetBefore: [-200, 50, undefined, '25%', 500],
      offsetAfter: [300, 350, undefined, '125%', 200]
    },
    {
      placement: 'left bottom',
      noOffset: [50, 150, undefined, '50%', 400],
      offsetBefore: [-200, 50, undefined, '-25%', 500],
      offsetAfter: [300, 350, undefined, '75%', 200]
    },
    {
      placement: 'top',
      noOffset: [200, 50, '50%', undefined, 500],
      offsetBefore: [50, -200, '0%', undefined, 750],
      offsetAfter: [350, 300, '100%', undefined, 250]
    },
    {
      placement: 'top left',
      noOffset: [250, 50, '50%', undefined, 500],
      offsetBefore: [50, -200, '25%', undefined, 750],
      offsetAfter: [350, 300, '125%', undefined, 250]
    },
    {
      placement: 'top right',
      noOffset: [150, 50, '50%', undefined, 500],
      offsetBefore: [50, -200, '-25%', undefined, 750],
      offsetAfter: [350, 300, '75%', undefined, 250]
    },
    {
      placement: 'bottom',
      noOffset: [200, 350, '50%', undefined, 200],
      offsetBefore: [50, 100, '0%', undefined, 450],
      offsetAfter: [350, 600, '100%', undefined, 0]
    },
    {
      placement: 'bottom left',
      noOffset: [250, 350, '50%', undefined, 200],
      offsetBefore: [50, 100, '25%', undefined, 450],
      offsetAfter: [350, 600, '125%', undefined, 0]
    },
    {
      placement: 'bottom right',
      noOffset: [150, 350, '50%', undefined, 200],
      offsetBefore: [50, 100, '-25%', undefined, 450],
      offsetAfter: [350, 600, '75%', undefined, 0]
    },
    {
      placement: 'right',
      noOffset: [350, 200, undefined, '50%', 350],
      offsetBefore: [100, 50, undefined, '0%', 500],
      offsetAfter: [600, 350, undefined, '100%', 200]
    },
    {
      placement: 'right top',
      noOffset: [350, 250, undefined, '50%', 300],
      offsetBefore: [100, 50, undefined, '25%', 500],
      offsetAfter: [600, 350, undefined, '125%', 200]
    },
    {
      placement: 'right bottom',
      noOffset: [350, 150, undefined, '50%', 400],
      offsetBefore: [100, 50, undefined, '-25%', 500],
      offsetAfter: [600, 350, undefined, '75%', 200]
    },
  ].forEach(function (testCase) {
    const placement = testCase.placement;

    describe(`placement = ${placement}`, function () {
      describe('no viewport offset', function () {
        checkPosition(
          placement, {left: 250, top: 250}, testCase.noOffset
        );
      });

      describe('viewport offset before', function () {
        checkPosition(
          placement, {left: 0, top: 0}, testCase.offsetBefore
        );
      });

      describe('viewport offset after', function () {
        checkPosition(
          placement, {left: 500, top: 500}, testCase.offsetAfter
        );
      });
    });
  });
});
