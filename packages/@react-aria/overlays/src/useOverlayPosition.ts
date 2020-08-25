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

import {calculatePosition, PositionResult} from './calculatePosition';
import {HTMLAttributes, RefObject, useCallback, useEffect, useState} from 'react';
import {Placement, PlacementAxis, PositionProps} from '@react-types/overlays';
import {useLocale} from '@react-aria/i18n';

interface AriaPositionProps extends PositionProps {
  /**
   * Element that that serves as the positioning boundary.
   * @default document.body
   */
  boundaryElement?: HTMLElement,
  /**
   * The ref for the element which the overlay positions itself with respect to.
   */
  targetRef: RefObject<HTMLElement>,
  /**
   * The ref for the overlay element.
   */
  overlayRef: RefObject<HTMLElement>,
  /**
   * A ref for the scrollable region within the overlay.
   * @default overlayRef
   */
  scrollRef?: RefObject<HTMLElement>,
  /**
   * Whether the overlay should update its position automatically.
   * @default true
   */
  shouldUpdatePosition?: boolean
}

interface PositionAria {
  /** Props for the overlay container element. */
  overlayProps: HTMLAttributes<Element>,
  /** Props for the overlay tip arrow if any. */
  arrowProps: HTMLAttributes<Element>,
  /** Placement of the overlay with respect to the overlay trigger. */
  placement: PlacementAxis,
  /** Updates the position of the overlay. */
  updatePosition(): void
}

/**
 * Handles positioning overlays like popovers and menus relative to a trigger
 * element, and updating the position when the window resizes.
 */
export function useOverlayPosition(props: AriaPositionProps): PositionAria {
  let {direction} = useLocale();
  let {
    targetRef,
    overlayRef,
    scrollRef = overlayRef,
    placement = 'bottom' as Placement,
    containerPadding = 12,
    shouldFlip = true,
    boundaryElement = typeof document !== 'undefined' ? document.body : null,
    offset = 0,
    crossOffset = 0,
    shouldUpdatePosition = true,
    isOpen = true
  } = props;
  let [position, setPosition] = useState<PositionResult>({
    position: {},
    arrowOffsetLeft: undefined,
    arrowOffsetTop: undefined,
    maxHeight: undefined,
    placement: undefined
  });

  let deps = [
    shouldUpdatePosition,
    placement,
    overlayRef.current,
    targetRef.current,
    scrollRef.current,
    containerPadding,
    shouldFlip,
    boundaryElement,
    offset,
    crossOffset,
    isOpen,
    direction
  ];

  let updatePosition = useCallback(() => {
    if (shouldUpdatePosition === false || !isOpen || !overlayRef.current || !targetRef.current || !scrollRef.current || !boundaryElement) {
      return;
    }

    setPosition(
      calculatePosition({
        placement: translateRTL(placement, direction),
        overlayNode: overlayRef.current,
        targetNode: targetRef.current,
        scrollNode: scrollRef.current,
        padding: containerPadding,
        shouldFlip,
        boundaryElement,
        offset,
        crossOffset
      })
    );
  }, deps);

  // Update position when anything changes
  useEffect(updatePosition, deps);

  // Update position on window resize
  useResize(updatePosition);

  return {
    overlayProps: {
      style: {
        position: 'absolute',
        zIndex: 100000, // should match the z-index in ModalTrigger
        ...position.position,
        maxHeight: position.maxHeight
      }
    },
    placement: position.placement,
    arrowProps: {
      style: {
        left: position.arrowOffsetLeft,
        top: position.arrowOffsetTop
      }
    },
    updatePosition
  };
}

function useResize(onResize) {
  useEffect(() => {
    window.addEventListener('resize', onResize, false);
    return () => {
      window.removeEventListener('resize', onResize, false);
    };
  }, [onResize]);
}

function translateRTL(position, direction) {
  if (direction === 'rtl') {
    return position.replace('start', 'right').replace('end', 'left');
  }
  return position.replace('start', 'left').replace('end', 'right');
}
