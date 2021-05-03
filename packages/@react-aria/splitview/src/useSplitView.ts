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

import {HTMLAttributes, useEffect, useRef} from 'react';
import {mergeProps} from '@react-aria/utils';
import {SplitViewAriaProps, SplitViewHandleState, SplitViewState} from '@react-types/shared';
import {useHover, useKeyboard, useMove} from '@react-aria/interactions';
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
    allowsResizing = true
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

  let {hoverProps} = useHover({
    isDisabled: !allowsResizing,
    onHoverStart() {
      handleState.setHover(true);
    },
    onHoverEnd() {
      handleState.setHover(false);
    }
  });

  const handleStateRef = useRef<SplitViewHandleState>(null);
  handleStateRef.current = handleState;
  const currentPosition = useRef<number>(null);
  const {moveProps} = useMove({
    onMoveStart() {
      // console.log("start")
      handleState.setDragging(true);
      currentPosition.current = null;
    },
    onMove({deltaX, deltaY, pointerType}) {
      if (currentPosition.current == null) {
        currentPosition.current = handleState.offset;
      }

      let delta = orientation === 'horizontal' ? deltaX : deltaY;
      if (reverse) {
        delta *= -1;
      }

      if (pointerType === 'keyboard') {
        if (delta > 0) {
          handleState.increment();
        } else if (delta < 0) {
          handleState.decrement();
        }
      } else {
        // console.log("move", delta, currentPosition.current)
        currentPosition.current += delta;

        handleState.setOffset(currentPosition.current);
      }
    },
    onMoveEnd() {
      // console.log("end")
      handleStateRef.current.setDragging(false);
    }
  });

  let ariaValueMin = 0;
  let ariaValueMax = 100;
  let ariaValueNow = (handleState.offset - containerState.minPos) / (containerState.maxPos - containerState.minPos) * 100 | 0;

  let {keyboardProps} = useKeyboard({
    isDisabled: !allowsResizing,
    onKeyDown({key}) {
      if (key === 'Home') {
        handleState.setDragging(true);
        handleState.decrementToMin();
        handleState.setDragging(false);
      } else if (key === 'End') {
        handleState.setDragging(true);
        handleState.incrementToMax();
        handleState.setDragging(false);
      } else if (key === 'Enter') {
        handleState.collapseToggle();
      }
    }
  });

  // TODO should `handleState.setDragging` be set on press or on the first move?
  let onStart = () => {
    handleState.setDragging(true);
    document.addEventListener('mouseup', onEnd, false);
    document.addEventListener('touchend', onEnd, false);
  };
  let onEnd = () => {
    handleState.setDragging(false);
    document.removeEventListener('mouseup', onEnd, false);
    document.removeEventListener('touchend', onEnd, false);
  };

  return {
    containerProps: {
      id
    },
    handleProps: {
      tabIndex: allowsResizing ? 0 : undefined,
      'aria-valuenow': ariaValueNow,
      'aria-valuemin': ariaValueMin,
      'aria-valuemax': ariaValueMax,
      'aria-label': props['aria-label'],
      'aria-labelledby': props['aria-labelledby'],
      role: 'separator',
      'aria-controls': id,
      ...(allowsResizing && mergeProps({
        onMouseDown: onStart,
        onTouchStart: onStart
      }, moveProps, hoverProps, keyboardProps))
    },
    primaryPaneProps: {
      id
    }
  };
}
