import {AllHTMLAttributes, MouseEventHandler, MutableRefObject, useEffect, useRef} from 'react';
import {chain, useId} from '@react-aria/utils';
import {direction, orientation} from '@react-types/shared';
import {SplitViewState} from '@react-stately/splitview';
import {useMoveable} from '@react-aria/interactions';

export interface SplitViewAriaProps {
  id?: string,
  onMouseDown?: MouseEventHandler,
  allowsResizing?: boolean,
  allowsCollapsing?: boolean,
  orientation?: orientation,
  primaryPane?: 0 | 1,
  primaryMinSize?: number,
  primaryMaxSize?: number,
  secondaryMinSize?: number,
  secondaryMaxSize?: number,
  'aria-label'?: string,
  'aria-labelledby'?: string,
  containerRef?: MutableRefObject<HTMLDivElement>
}

export interface AriaSplitViewProps {
  handleProps: AllHTMLAttributes<HTMLElement>,
  primaryPaneProps: AllHTMLAttributes<HTMLElement>
}

export function useSplitView(props: SplitViewAriaProps, {containerState, handleState}: SplitViewState, textDirection: direction): AriaSplitViewProps {
  let {
    containerRef,
    id: providedId,
    primaryPane,
    primaryMinSize,
    primaryMaxSize,
    secondaryMinSize,
    secondaryMaxSize,
    orientation = 'horizontal',
    allowsResizing = true,
    allowsCollapsing,
    onMouseDown: propsOnMouseDown
  } = props;
  let id = useId(providedId);
  let size = useRef(0);
  let reverse = primaryPane === 1;

  useEffect(() => {
    let getSize = () => {
      if (orientation === 'horizontal') {
        return containerRef.current.offsetWidth;
      }
      return containerRef.current.offsetHeight;
    };

    let resize = () => {
      size.current = getSize();

      containerState.setMinPos(Math.max(primaryMinSize, size.current - secondaryMaxSize));
      containerState.setMaxPos(Math.min(primaryMaxSize, size.current - secondaryMinSize));
    };

    window.addEventListener('resize', resize, false);
    resize();
    return () => {
      window.removeEventListener('resize', resize, false);
    };
  }, [containerRef, containerState, primaryMinSize, primaryMaxSize, secondaryMinSize, secondaryMaxSize, orientation, size]);

  // LTR vs RTL flip across the y axis, they never flip across the x axis
  let flipAxis;
  if (textDirection === 'rtl') {
    if (orientation === 'horizontal' && !reverse) {
      flipAxis = 'y';
    } else if (orientation === 'vertical' && reverse) {
      flipAxis = 'x';
    }
  } else {
    if (orientation === 'horizontal' && reverse) {
      flipAxis = 'y';
    } else if (orientation === 'vertical' && reverse) {
      flipAxis = 'x';
    }
  }
  let draggableProps = useMoveable({
    containerRef,
    flipAxis,
    onHover: (hovered) => handleState.setHover(hovered),
    onDrag: (dragging) => handleState.setDragging(dragging),
    onPositionChange: (position) => handleState.setOffset(position),
    onIncrement: (axis) => handleState.increment(axis),
    onDecrement: (axis) => handleState.decrement(axis),
    onIncrementToMax: () => handleState.incrementToMax(),
    onDecrementToMin: () => handleState.decrementToMin(),
    onCollapseToggle: () => handleState.collapseToggle()
  });

  let ariaValueMin = 0;
  let ariaValueMax = 100;
  let ariaValueNow = allowsCollapsing ?
    (handleState.offset / containerState.maxPos * 100) | 0 :
    ((handleState.offset - containerState.minPos) / (containerState.maxPos - containerState.minPos) * 100) | 0;

  let onMouseDown = allowsResizing ? chain(draggableProps.onMouseDown, propsOnMouseDown) : undefined;
  let onMouseEnter = allowsResizing ? draggableProps.onMouseEnter : undefined;
  let onMouseOut = allowsResizing ? draggableProps.onMouseOut : undefined;
  let onKeyDown = allowsResizing ? draggableProps.onKeyDown : undefined;
  let tabIndex = allowsResizing ? 0 : undefined;

  return {
    handleProps: {
      tabIndex,
      'aria-valuenow': ariaValueNow,
      'aria-valuemin': ariaValueMin,
      'aria-valuemax': ariaValueMax,
      'aria-label': props['aria-label'],
      'aria-labelledby': props['aria-labelledby'],
      role: 'separator',
      'aria-controls': id,
      onMouseDown,
      onMouseEnter,
      onMouseOut,
      onKeyDown
    },
    primaryPaneProps: {
      id
    }
  };
}
