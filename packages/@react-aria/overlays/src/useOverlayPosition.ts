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

import {calculatePosition} from './calculatePosition';
import {HTMLAttributes, RefObject, useEffect, useState} from 'react';
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
  boundaryElement?: Element,
  isOpen?: boolean
}

interface AriaPositionProps extends PositionProps {
  containerRef: RefObject<Element>,
  targetRef: RefObject<Element>,
  overlayRef: RefObject<Element>,
  shouldUpdatePosition?: boolean
}

interface PositionAria {
  overlayProps: HTMLAttributes<Element>,
  arrowProps: HTMLAttributes<Element>,
  placement: Placement
}

interface PositionState {
  positionLeft?: number,
  positionTop?: number,
  arrowOffsetLeft?: number,
  arrowOffsetTop?: number,
  maxHeight?: number,
  placement: Placement
}

export function useOverlayPosition(props: AriaPositionProps): PositionAria {
  let {direction} = useLocale();
  let {
    containerRef,
    targetRef,
    overlayRef,
    placement = 'bottom' as Placement,
    containerPadding = 8,
    shouldFlip = true,
    boundaryElement = document.body,
    offset = 0,
    crossOffset = 0,
    shouldUpdatePosition = true,
    isOpen = true
  } = props;
  let [position, setPosition] = useState<PositionState>({
    positionLeft: 0,
    positionTop: 0,
    arrowOffsetLeft: undefined,
    arrowOffsetTop: undefined,
    maxHeight: undefined,
    placement
  });

  let deps = [
    shouldUpdatePosition,
    placement,
    overlayRef.current,
    targetRef.current,
    containerRef.current,
    containerPadding,
    shouldFlip,
    boundaryElement,
    offset,
    crossOffset,
    isOpen,
    direction
  ];

  let updatePosition = () => {
    if (shouldUpdatePosition === false || !overlayRef.current || !targetRef.current || !containerRef.current) {
      return;
    }

    setPosition(
      calculatePosition(
        translateRTL(placement, direction),
        overlayRef.current,
        targetRef.current,
        containerRef.current,
        containerPadding,
        shouldFlip,
        boundaryElement,
        offset,
        crossOffset
      )
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
        left: position.positionLeft,
        top: position.positionTop,
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
