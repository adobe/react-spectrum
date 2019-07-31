import {AllHTMLAttributes, MutableRefObject, useRef} from 'react';
import {getOffset} from '@react-aria/utils';
import {orientation, Coordinate} from '@react-types/shared';

interface UseMoveableProps {
  containerRef: MutableRefObject<HTMLElement>,
  flipAxis?: 'x' | 'y' | 'xy',
  onHover?: (hovered: boolean) => void,
  onDrag?: (dragging: boolean) => void,
  onPositionChange?: (relativePosition: Coordinate) => void,
  onIncrement?: (axis: orientation) => void,
  onDecrement?: (axis: orientation) => void,
  onIncrementToMax?: () => void,
  onDecrementToMin?: () => void,
  onCollapseToggle?: () => void
}

// handles movement in x and y either as
// relative position of cursor to a container
// or as keyboard events

export function useMoveable({containerRef, flipAxis, onHover, onDrag, onPositionChange, onIncrement, onDecrement, onIncrementToMax, onDecrementToMin, onCollapseToggle}: UseMoveableProps): AllHTMLAttributes<HTMLElement> {
  let getPosition = (e):Coordinate => ({x: e.clientX, y: e.clientY});
  let calculateCoordinateDistances = (element, position:Coordinate):Coordinate => {
    let rect = element.getBoundingClientRect();
    switch (flipAxis) {
      case 'x':
        return {x: position.x - rect.left, y: rect.bottom - position.y};
      case 'y':
        return {x: rect.right - position.x, y: position.y - rect.top};
      case 'xy':
        return {x: rect.right - position.x, y: rect.bottom - position.y};
      default:
        return {x: position.x - rect.left, y: position.y - rect.top};
    }
  };
  let getNextDistance = (e):Coordinate => {
    let mousePosition = getPosition(e);
    let nextOffset = calculateCoordinateDistances(containerRef.current, mousePosition);
    return nextOffset;
  };
  let dragging = useRef<boolean>(false);
  let prevPosition = useRef<Coordinate>({x: 0, y: 0});

  let onMouseDragged = (e) => {
    e.preventDefault();
    let nextOffset = getNextDistance(e);
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

  let onMouseUp = (e) => {
    dragging.current = false;
    let nextOffset = getNextDistance(e);
    if (onDrag) {
      onDrag(false);
    }
    if (onPositionChange) {
      onPositionChange(nextOffset);
    }
    window.removeEventListener('mouseup', onMouseUp, false);
    window.removeEventListener('mousemove', onMouseDragged, false);
  };

  let onMouseDown = () => {
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
    e.preventDefault();
    switch (e.key) {
      case 'Left':
      case 'ArrowLeft':
        if (onDecrement && (!flipAxis || !flipAxis.includes('y'))) {
          onDecrement('horizontal');
        } else if (onIncrement && (flipAxis && flipAxis.includes('y'))) {
          onIncrement('horizontal');
        }
        break;
      case 'Up':
      case 'ArrowUp':
        if (onDecrement && (!flipAxis || !flipAxis.includes('x'))) {
          onDecrement('vertical');
        } else if (onIncrement && (flipAxis && flipAxis.includes('x'))) {
          onIncrement('vertical');
        }
        break;
      case 'Right':
      case 'ArrowRight':
        if (onIncrement && (!flipAxis || !flipAxis.includes('y'))) {
          onIncrement('horizontal');
        } else if (onDecrement && (flipAxis && flipAxis.includes('y'))) {
          onDecrement('horizontal');
        }
        break;
      case 'Down':
      case 'ArrowDown':
        if (onIncrement && (!flipAxis || !flipAxis.includes('x'))) {
          onIncrement('vertical');
        } else if (onDecrement && (flipAxis && flipAxis.includes('x'))) {
          onDecrement('vertical');
        }
        break;
      case 'Home':
        if (onDecrementToMin) {
          onDecrementToMin();
        }
        break;
      case 'End':
        if (onIncrementToMax) {
          onIncrementToMax();
        }
        break;
      case 'Enter':
        if (onCollapseToggle) {
          onCollapseToggle();
        }
        break;
    }
  };

  return {onMouseDown, onMouseEnter, onMouseOut, onKeyDown};
}
