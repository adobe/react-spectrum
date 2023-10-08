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
import {DOMAttributes} from '@react-types/shared';
import {Placement, PlacementAxis, PositionProps} from '@react-types/overlays';
import {RefObject, useCallback, useRef, useState} from 'react';
import {useCloseOnScroll} from './useCloseOnScroll';
import {useLayoutEffect, useResizeObserver} from '@react-aria/utils';
import {useLocale} from '@react-aria/i18n';
import {flip, size, useFloating, offset, shift, useTransitionStatus} from '@floating-ui/react';
import {arrow} from '@floating-ui/dom';

export interface AriaPositionProps extends PositionProps {
  /**
   * Cross size of the overlay arrow in pixels.
   * @default 0
   */
  arrowSize?: number,
  /**
   * Element that that serves as the positioning boundary.
   * @default document.body
   */
  boundaryElement?: Element,
  /**
   * The ref for the element which the overlay positions itself with respect to.
   */
  targetRef: RefObject<Element>,
  /**
   * The ref for the overlay element.
   */
  overlayRef: RefObject<Element>,
  /**
   * A ref for the scrollable region within the overlay.
   * @default overlayRef
   */
  scrollRef?: RefObject<Element>,
  /**
   * Whether the overlay should update its position automatically.
   * @default true
   */
  shouldUpdatePosition?: boolean,
  /** Handler that is called when the overlay should close. */
  onClose?: () => void,
  /**
   * The maxHeight specified for the overlay element.
   * By default, it will take all space up to the current viewport height.
   */
  maxHeight?: number,
  /**
   * The minimum distance the arrow's edge should be from the edge of the overlay element.
   * @default 0
   */
  arrowBoundaryOffset?: number
}

export interface PositionAria {
  /** Props for the overlay container element. */
  overlayProps: DOMAttributes,
  /** Props for the overlay tip arrow if any. */
  arrowProps: DOMAttributes,
  /** Placement of the overlay with respect to the overlay trigger. */
  placement: PlacementAxis,
  /** Updates the position of the overlay. */
  updatePosition(): void
}

// @ts-ignore
let visualViewport = typeof document !== 'undefined' && window.visualViewport;

/**
 * Handles positioning overlays like popovers and menus relative to a trigger
 * element, and updating the position when the window resizes.
 */
export function useOverlayPosition(props: AriaPositionProps): PositionAria {
  let {direction} = useLocale();
  let {
    arrowSize = 0,
    targetRef,
    overlayRef,
    scrollRef = overlayRef,
    placement = 'bottom' as Placement,
    containerPadding = 12,
    shouldFlip = true,
    boundaryElement = typeof document !== 'undefined' ? document.body : null,
    offset: foo = 0,
    crossOffset = 0,
    shouldUpdatePosition = true,
    isOpen = true,
    onClose,
    maxHeight,
    arrowBoundaryOffset = 0,
    arrowRef
  } = props;

  let result = useFloating({
    transform: false,
    elements: {
      reference: targetRef.current,
      floating: overlayRef.current
    },
    placement: translateRTL(placement, direction),
    middleware: [
      flip({padding: 5}),
      shift({padding: 5}),
      size({
        padding: 5,
        apply({availableWidth, availableHeight, elements, placement, middlewareData}) {
          // Do things with the data, e.g.
          Object.assign(elements.floating.style, {
            maxWidth: `${availableWidth}px`,
            maxHeight: `${availableHeight - arrowSize - 5}px`
          });
        }
      }),
      offset(arrowSize + 5),
      arrow({
        element: arrowRef.current,
        padding: arrowBoundaryOffset
      })
    ]
  });
  console.log(result)

  return {
    overlayProps: {
      style: {...result.floatingStyles, zIndex: 1}
    },
    placement: result.placement.split('-')[0] as PlacementAxis,
    arrowProps: {
      'aria-hidden': 'true',
      role: 'presentation',
      style: {
        position: 'absolute',
        left: `${result?.middlewareData?.arrow?.x ?? 0}px`,
        top: `${result?.middlewareData?.arrow?.y ?? 0}px`
      }
    },
    updatePosition: result.update
  };
}

function translateRTL(position, direction) {
  if (direction === 'rtl') {
    return position.replace('start', 'right').replace('end', 'left').replace(' ', '-');
  }
  return position.replace('start', 'left').replace('end', 'right').replace(' ', '-');
}
