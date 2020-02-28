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

import {SplitViewState, SplitViewStatelyProps} from '@react-types/shared';
import {useControlledState} from '@react-stately/utils';
import {useRef, useState} from 'react';

const COLLAPSE_THRESHOLD = 50;

export function useSplitViewState(props: SplitViewStatelyProps): SplitViewState {
  let {
    defaultPrimarySize = 304,
    primarySize,
    allowsCollapsing = false,
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

  let setOffsetValue = (value) => {
    let nextOffset = boundOffset(value);
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

  let increment = () => setOffset(prevHandleOffset => {
    let nextOffset = boundOffset(prevHandleOffset + 10);
    callOnResize(nextOffset);
    callOnResizeEnd(nextOffset);
    return nextOffset;
  });

  let decrement = () => setOffset(prevHandleOffset => {
    let nextOffset = boundOffset(prevHandleOffset - 10);
    callOnResize(nextOffset);
    callOnResizeEnd(nextOffset);
    return nextOffset;
  });

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
    if (!allowsCollapsing) {
      return prevHandleOffset;
    }
    let oldOffset = prevOffset.current;
    if (prevHandleOffset !== prevOffset.current) {
      prevOffset.current = prevHandleOffset;
    }
    let nextOffset = prevHandleOffset === 0 ? oldOffset || minPos : 0;
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
