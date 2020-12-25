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

import {ColorWheelProps} from '@react-types/color';
import {ColorWheelState} from '@react-stately/color';
import {focusWithoutScrolling, mergeProps, useGlobalListeners} from '@react-aria/utils';
import React, {HTMLAttributes, InputHTMLAttributes, RefObject, useCallback, useRef} from 'react';
import {useKeyboard, useMove} from '@react-aria/interactions';

interface ColorWheelAriaProps extends ColorWheelProps {
  inputRef: RefObject<HTMLElement>,
  containerRef: RefObject<HTMLElement>,
  innerRadius: number,
  outerRadius: number
}

interface ColorWheelAria {
  thumbProps: HTMLAttributes<HTMLElement>,
  groupProps: HTMLAttributes<HTMLElement>,
  inputProps: InputHTMLAttributes<HTMLInputElement>,
  thumbPosition: {x: number, y: number}
}

const PAGE_MIN_STEP_SIZE = 6;

function degToRad(deg: number) {
  return deg * Math.PI / 180;
}

function radToDeg(rad: number) {
  return rad * 180 / Math.PI;
}

// 0deg = 3 o'clock. increases clockwise
function angleToCartesian(angle: number, radius: number): {x: number, y: number} {
  let rad = degToRad(360 - angle + 90);
  let x = Math.sin(rad) * (radius);
  let y = Math.cos(rad) * (radius);
  return {x, y};
}
function cartesianToAngle(x: number, y: number, radius: number): number {
  let deg = radToDeg(Math.atan2(y / radius, x / radius));
  return (deg + 360) % 360;
}

export function useColorWheel(props: ColorWheelAriaProps, state: ColorWheelState): ColorWheelAria {
  let {inputRef, containerRef, isDisabled, step = 1, innerRadius, outerRadius} = props;

  let {addGlobalListener, removeGlobalListener} = useGlobalListeners();

  let thumbRadius = (innerRadius + outerRadius) / 2;

  let focusInput = useCallback(() => {
    if (inputRef.current) {
      focusWithoutScrolling(inputRef.current);
    }
  }, [inputRef]);

  let stateRef = useRef<ColorWheelState>(null);
  stateRef.current = state;

  let currentPosition = useRef<{x: number, y: number}>(null);
  let moveHandler = {
    onMoveStart() {
      currentPosition.current = null;
      state.setDragging(true);
    },
    onMove({deltaX, deltaY, pointerType}) {
      if (currentPosition.current == null) {
        currentPosition.current = angleToCartesian(stateRef.current.hue, thumbRadius);
      }
      currentPosition.current.x += deltaX;
      currentPosition.current.y += deltaY;
      if (pointerType === 'keyboard') {
        if (deltaX > 0 || deltaY < 0) {
          state.increment();
        } else if (deltaX < 0 || deltaY > 0) {
          state.decrement();
        }
      } else {
        stateRef.current.setHue(cartesianToAngle(currentPosition.current.x, currentPosition.current.y, thumbRadius));
      }
    },
    onMoveEnd() {
      isOnWheel.current = undefined;
      state.setDragging(false);
      focusInput();
    }
  };
  let {moveProps: movePropsThumb} = useMove(moveHandler);

  let currentPointer = useRef<number | null | undefined>(undefined);
  let isOnWheel = useRef<boolean>(false);
  let {moveProps: movePropsContainer} = useMove({
    onMoveStart() {
      if (isOnWheel.current) {
        moveHandler.onMoveStart();
      }
    },
    onMove(e) {
      if (isOnWheel.current) {
        moveHandler.onMove(e);
      }
    },
    onMoveEnd() {
      if (isOnWheel.current) {
        moveHandler.onMoveEnd();
      }
    }
  });

  let onThumbDown = (id: number | null) => {
    if (!state.isDragging) {
      currentPointer.current = id;
      focusInput();
      state.setDragging(true);
      addGlobalListener(window, 'mouseup', onThumbUp, false);
      addGlobalListener(window, 'touchend', onThumbUp, false);
      addGlobalListener(window, 'pointerup', onThumbUp, false);
    }
  };

  let onThumbUp = (e) => {
    let id = e.pointerId ?? e.changedTouches?.[0].identifier;
    if (id === currentPointer.current) {
      focusInput();
      state.setDragging(false);
      currentPointer.current = undefined;
      isOnWheel.current = false;

      removeGlobalListener(window, 'mouseup', onThumbUp, false);
      removeGlobalListener(window, 'touchend', onThumbUp, false);
      removeGlobalListener(window, 'pointerup', onThumbUp, false);
    }
  };

  let onTrackDown = (id: number | null, pageX: number, pageY: number) => {
    let rect = (containerRef.current as HTMLElement).getBoundingClientRect();
    let x = pageX - rect.x - rect.width / 2;
    let y = pageY - rect.y - rect.height / 2;
    let radius = Math.sqrt(x * x + y * y);
    let angle = cartesianToAngle(x, y, radius);
    if (innerRadius < radius && radius < outerRadius && !state.isDragging && currentPointer.current === undefined) {
      isOnWheel.current = true;
      currentPointer.current = id;
      stateRef.current.setHue(angle);

      focusInput();
      state.setDragging(true);

      addGlobalListener(window, 'mouseup', onTrackUp, false);
      addGlobalListener(window, 'touchend', onTrackUp, false);
      addGlobalListener(window, 'pointerup', onTrackUp, false);
    }
  };

  let onTrackUp = (e) => {
    let id = e.pointerId ?? e.changedTouches?.[0].identifier;
    if (isOnWheel.current && id === currentPointer.current) {
      isOnWheel.current = false;
      currentPointer.current = undefined;
      state.setDragging(false);
      focusInput();

      removeGlobalListener(window, 'mouseup', onTrackUp, false);
      removeGlobalListener(window, 'touchend', onTrackUp, false);
      removeGlobalListener(window, 'pointerup', onTrackUp, false);
    }
  };

  let {keyboardProps} = useKeyboard({
    onKeyDown(e) {
      switch (e.key) {
        case 'PageUp':
          e.preventDefault();
          state.increment(PAGE_MIN_STEP_SIZE);
          break;
        case 'PageDown':
          e.preventDefault();
          state.decrement(PAGE_MIN_STEP_SIZE);
          break;
      }
    }
  });

  return {
    groupProps: isDisabled ? {} : mergeProps({
      onMouseDown: (e: React.MouseEvent) => {onTrackDown(undefined, e.pageX, e.pageY);},
      onPointerDown: (e: React.PointerEvent) => {onTrackDown(e.pointerId, e.pageX, e.pageY);},
      onTouchStart: (e: React.TouchEvent) => {onTrackDown(e.changedTouches[0].identifier, e.changedTouches[0].pageX, e.changedTouches[0].pageY);}
    }, movePropsContainer),
    thumbProps: isDisabled ? {} : mergeProps({
      onMouseDown: () => {onThumbDown(undefined);},
      onPointerDown: (e: React.PointerEvent) => {onThumbDown(e.pointerId);},
      onTouchStart: (e: React.TouchEvent) => {onThumbDown(e.changedTouches[0].identifier);}
    }, movePropsThumb, keyboardProps),
    inputProps: {
      type: 'range',
      'aria-label': 'hue',
      min: '0',
      max: '360',
      step: String(step),
      disabled: isDisabled
    },
    thumbPosition: angleToCartesian(state.value.getChannelValue('hue'), thumbRadius)
  };
}
