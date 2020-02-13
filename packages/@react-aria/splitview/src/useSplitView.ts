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
import {chain} from '@react-aria/utils';
import {HTMLAttributes, useEffect, useRef} from 'react';
import {SplitViewAriaProps, SplitViewState} from '@react-types/shared';
import {useDrag1D} from '@react-aria/utils';
import {useId} from '@react-aria/utils';

interface AriaSplitViewProps {
  containerProps: HTMLAttributes<HTMLElement>,
  handleProps: HTMLAttributes<HTMLElement>,
  primaryPaneProps: HTMLAttributes<HTMLElement>
}

export function useSplitView(props: SplitViewAriaProps, state: SplitViewState): AriaSplitViewProps {
  let {
    containerRef,
    id: providedId,
    primaryPane = 0,
    primaryMinSize = 304,
    primaryMaxSize = Infinity,
    secondaryMinSize = 304,
    secondaryMaxSize = Infinity,
    orientation = 'horizontal' as 'horizontal',
    allowsResizing = true,
    onMouseDown: propsOnMouseDown
  } = props;
  let {containerState, handleState} = state;
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

  let draggableProps = useDrag1D({
    containerRef,
    reverse,
    orientation,
    onHover: (hovered) => handleState.setHover(hovered),
    onDrag: (dragging) => handleState.setDragging(dragging),
    onPositionChange: (position) => handleState.setOffset(position),
    onIncrement: () => handleState.increment(),
    onDecrement: () => handleState.decrement(),
    onIncrementToMax: () => handleState.incrementToMax(),
    onDecrementToMin: () => handleState.decrementToMin(),
    onCollapseToggle: () => handleState.collapseToggle()
  });

  let ariaValueMin = 0;
  let ariaValueMax = 100;
  let ariaValueNow = (handleState.offset - containerState.minPos) / (containerState.maxPos - containerState.minPos) * 100 | 0;

  let onMouseDown = allowsResizing ? chain(draggableProps.onMouseDown, propsOnMouseDown) : undefined;
  let onMouseEnter = allowsResizing ? draggableProps.onMouseEnter : undefined;
  let onMouseOut = allowsResizing ? draggableProps.onMouseOut : undefined;
  let onKeyDown = allowsResizing ? draggableProps.onKeyDown : undefined;
  let tabIndex = allowsResizing ? 0 : undefined;

  return {
    containerProps: {
      id
    },
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
