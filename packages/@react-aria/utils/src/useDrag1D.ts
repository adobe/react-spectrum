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

import {getOffset} from './getOffset';
import {HTMLAttributes, MutableRefObject, useRef} from 'react';
import {Orientation} from '@react-types/shared';

interface UseDrag1DProps {
  containerRef: MutableRefObject<HTMLElement>,
  reverse?: boolean,
  orientation?: Orientation,
  onHover?: (hovered: boolean) => void,
  onDrag?: (dragging: boolean) => void,
  onPositionChange?: (position: number) => void,
  onIncrement?: () => void,
  onDecrement?: () => void,
  onIncrementToMax?: () => void,
  onDecrementToMin?: () => void,
  onCollapseToggle?: () => void
}

// Keep track of elements that we are currently handling dragging for via useDrag1D.
// If there's an ancestor and a descendant both using useDrag1D(), and the user starts
// dragging the descendant, we don't want useDrag1D events to fire for the ancestor.
const draggingElements: HTMLElement[] = [];

// created for splitview, this should be reusable for things like sliders/dials
// It also handles keyboard events on the target allowing for increment/decrement by a given stepsize as well as minifying/maximizing and toggling between minified and previous size
// It can also take a 'reverse' param to say if we should measure from the right/bottom instead of the top/left
// It can also handle either a vertical or horizontal movement, but not both at the same time

export function useDrag1D(props: UseDrag1DProps): HTMLAttributes<HTMLElement> {
  let {containerRef, reverse, orientation, onHover, onDrag, onPositionChange, onIncrement, onDecrement, onIncrementToMax, onDecrementToMin, onCollapseToggle} = props;
  let getPosition = (e) => orientation === 'horizontal' ? e.clientX : e.clientY;
  let getNextOffset = (e: MouseEvent) => {
    let containerOffset = getOffset(containerRef.current, reverse, orientation);
    let mouseOffset = getPosition(e);
    let nextOffset = reverse ? containerOffset - mouseOffset : mouseOffset - containerOffset;
    return nextOffset;
  };
  let dragging = useRef(false);
  let prevPosition = useRef(0);

  let onMouseDragged = (e: MouseEvent) => {
    e.preventDefault();
    let nextOffset = getNextOffset(e);
    if (!dragging.current) {
      dragging.current = true;
      if (onDrag) {
        onDrag(true);
      }
      if (onPositionChange) {
        onPositionChange(nextOffset);
      }
    }
    if (prevPosition.current === nextOffset) {
      return;
    }
    prevPosition.current = nextOffset;
    if (onPositionChange) {
      onPositionChange(nextOffset);
    }
  };

  let onMouseUp = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    dragging.current = false;
    let nextOffset = getNextOffset(e);
    if (onDrag) {
      onDrag(false);
    }
    if (onPositionChange) {
      onPositionChange(nextOffset);
    }

    draggingElements.splice(draggingElements.indexOf(target), 1);
    window.removeEventListener('mouseup', onMouseUp, false);
    window.removeEventListener('mousemove', onMouseDragged, false);
  };

  let onMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;
    // If we're already handling dragging on a descendant with useDrag1D, then 
    // we don't want to handle the drag motion on this target as well.
    if (draggingElements.some(elt => target.contains(elt))) {
      return;
    }
    draggingElements.push(target);
    window.addEventListener('mousemove', onMouseDragged, false);
    window.addEventListener('mouseup', onMouseUp, false);
  };

  let onMouseEnter = () => {
    if (onHover) {
      onHover(true);
    }
  };

  let onMouseOut = () => {
    if (onHover) {
      onHover(false);
    }
  };

  let onKeyDown = (e) => {
    switch (e.key) {
      case 'Left':
      case 'ArrowLeft':
        e.preventDefault();
        if (orientation === 'horizontal') {
          if (onDecrement && !reverse) {
            onDecrement();
          } else if (onIncrement && reverse) {
            onIncrement();
          }
        }
        break;
      case 'Up':
      case 'ArrowUp':
        e.preventDefault();
        if (orientation === 'vertical') {
          if (onDecrement && !reverse) {
            onDecrement();
          } else if (onIncrement && reverse) {
            onIncrement();
          }
        }
        break;
      case 'Right':
      case 'ArrowRight':
        e.preventDefault();
        if (orientation === 'horizontal') {
          if (onIncrement && !reverse) {
            onIncrement();
          } else if (onDecrement && reverse) {
            onDecrement();
          }
        }
        break;
      case 'Down':
      case 'ArrowDown':
        e.preventDefault();
        if (orientation === 'vertical') {
          if (onIncrement && !reverse) {
            onIncrement();
          } else if (onDecrement && reverse) {
            onDecrement();
          }
        }
        break;
      case 'Home':
        e.preventDefault();
        if (onDecrementToMin) {
          onDecrementToMin();
        }
        break;
      case 'End':
        e.preventDefault();
        if (onIncrementToMax) {
          onIncrementToMax();
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (onCollapseToggle) {
          onCollapseToggle();
        }
        break;
    }
  };

  return {onMouseDown, onMouseEnter, onMouseOut, onKeyDown};
}
