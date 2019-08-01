import {Dispatch, SetStateAction, useRef, useState} from 'react';
import {orientation, point} from '@react-types/shared';
import {useControlledState} from '@react-stately/utils';

export interface SplitViewStatelyProps {
  allowsCollapsing?: boolean,
  onResize?: (primarySize: number) => void,
  onResizeEnd?: (primarySize: number) => void,
  primarySize?: number,
  defaultPrimarySize?: number,
  orientation?: orientation
}

export interface SplitViewHandleState {
  offset: number,
  dragging: boolean,
  hovered: boolean
  setOffset: (value: point) => void,
  setDragging: (value: boolean) => void,
  setHover: (value: boolean) => void,
  increment: (axis: orientation) => void,
  decrement: (axis: orientation) => void,
  incrementToMax: () => void,
  decrementToMin: () => void,
  collapseToggle: () => void
}

export interface SplitViewContainerState {
  minPos: number,
  maxPos: number,
  setMinPos: Dispatch<SetStateAction<number>>,
  setMaxPos: Dispatch<SetStateAction<number>>
}

export interface SplitViewState {
  handleState: SplitViewHandleState,
  containerState: SplitViewContainerState
}

const COLLAPSE_THRESHOLD = 50;

export function useSplitViewState(props: SplitViewStatelyProps): SplitViewState {
  let {
    defaultPrimarySize,
    primarySize,
    allowsCollapsing,
    orientation = 'horizontal',
    onResize,
    onResizeEnd
  } = props;

  let [minPos, setMinPos] = useState(0);
  let [maxPos, setMaxPos] = useState(0);
  let [dragging, setDragging] = useState(false);
  let realTimeDragging = useRef(false);
  let [hovered, setHovered] = useState(false);
  let [offset, setOffset] = useControlledState(primarySize, defaultPrimarySize, () => {});
  let prevOffset = useRef(offset);

  let callOnResize = (value) => {
    if (onResize && value !== offset) {
      onResize(value);
    }
  };
  let callOnResizeEnd = (value) => {
    if (onResizeEnd && value !== offset) {
      onResizeEnd(value);
    }
  };

  let boundOffset = (offset) => {
    let dividerPosition = offset;
    if (allowsCollapsing && offset < minPos - COLLAPSE_THRESHOLD) {
      dividerPosition = 0;
    } else if (offset < minPos) {
      dividerPosition = minPos;
    } else if (offset > maxPos) {
      dividerPosition = maxPos;
    }
    return dividerPosition;
  };

  let setOffsetValue = (value:point) => {
    let coord = orientation === 'horizontal' ? value.x : value.y;
    let nextOffset = boundOffset(coord);
    callOnResize(nextOffset);
    if (!realTimeDragging.current) {
      callOnResizeEnd(nextOffset);
    }
    setOffset(nextOffset);
  };

  let setDraggingValue = (value) => {
    realTimeDragging.current = value;
    setDragging(value);
  };

  let setHoverValue = (value) => {
    setHovered(value);
  };

  let increment = (axis) => {
    if (orientation !== axis) {
      return;
    }
    setOffset(prevHandleOffset => {
      let nextOffset = boundOffset(prevHandleOffset + 10);
      callOnResize(nextOffset);
      callOnResizeEnd(nextOffset);
      return nextOffset;
    });
  };

  let decrement = (axis) => {
    if (orientation !== axis) {
      return;
    }
    setOffset(prevHandleOffset => {
      let nextOffset = boundOffset(prevHandleOffset - 10);
      callOnResize(nextOffset);
      callOnResizeEnd(nextOffset);
      return nextOffset;
    });
  };

  let decrementToMin = () => {
    let nextOffset = allowsCollapsing ? 0 : minPos;
    callOnResize(nextOffset);
    callOnResizeEnd(nextOffset);
    setOffset(nextOffset);
  };

  let incrementToMax = () => {
    let nextOffset = maxPos;
    callOnResize(nextOffset);
    callOnResizeEnd(nextOffset);
    setOffset(nextOffset);
  };

  let collapseToggle = () => setOffset(prevHandleOffset => {
    let oldOffset = prevOffset.current;
    if (prevHandleOffset !== prevOffset.current) {
      prevOffset.current = prevHandleOffset;
    }
    let nextOffset;
    if (allowsCollapsing) {
      nextOffset = prevHandleOffset === 0 ? oldOffset : 0;
    } else {
      nextOffset = prevHandleOffset <= minPos ? oldOffset : minPos;
    }
    callOnResize(nextOffset);
    callOnResizeEnd(nextOffset);
    return nextOffset;
  });

  return {
    handleState: {
      offset,
      dragging,
      hovered,
      setOffset: setOffsetValue,
      setDragging: setDraggingValue,
      setHover: setHoverValue,
      increment,
      decrement,
      incrementToMax,
      decrementToMin,
      collapseToggle
    },
    containerState: {
      minPos,
      maxPos,
      setMinPos,
      setMaxPos
    }
  };
}
