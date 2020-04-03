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
import {HTMLAttributes, RefObject, useEffect, useState} from 'react';
import {PlacementAxis} from '@react-types/overlays';
import {useLocale} from '@react-aria/i18n';

export type Placement = 'bottom' | 'bottom left' | 'bottom right' | 'bottom start' | 'bottom end' |
    'top' | 'top left' | 'top right' | 'top start' | 'top end' |
    'left' | 'left top' | 'left bottom' | 'start' | 'start top' | 'start bottom' |
    'right' | 'right top' | 'right bottom' | 'end' | 'end top' | 'end bottom';

export interface PositionProps {
  placement?: Placement,
  containerPadding?: number,
  offset?: number,
  crossOffset?: number,
  shouldFlip?: boolean,
  boundaryElement?: HTMLElement,
  isOpen?: boolean
}

interface AriaPositionProps extends PositionProps {
  targetRef: RefObject<HTMLElement>,
  overlayRef: RefObject<HTMLElement>,
  scrollRef?: RefObject<HTMLElement>,
  shouldUpdatePosition?: boolean
}

interface PositionAria {
  overlayProps: HTMLAttributes<Element>,
  arrowProps: HTMLAttributes<Element>,
  placement: PlacementAxis
}

export function useOverlayPosition(props: AriaPositionProps): PositionAria {
  let {direction} = useLocale();
  let {
    targetRef,
    overlayRef,
    scrollRef = overlayRef,
    placement = 'bottom' as Placement,
    containerPadding = 12,
    shouldFlip = true,
    boundaryElement = document.body,
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

  let updatePosition = () => {
    if (shouldUpdatePosition === false || !isOpen || !overlayRef.current || !targetRef.current || !scrollRef.current) {
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
  };

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
    }
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
