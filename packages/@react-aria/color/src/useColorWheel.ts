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

import {ColorWheelAriaProps} from '@react-types/color';
import {ColorWheelState} from '@react-stately/color';
import {focusWithoutScrolling, mergeProps, useGlobalListeners} from '@react-aria/utils';
import React, {HTMLAttributes, InputHTMLAttributes, useCallback, useRef} from 'react';
import {useKeyboard, useMove} from '@react-aria/interactions';

export interface ColorWheelAriaResult {
  thumbProps: HTMLAttributes<HTMLElement>,
  containerProps: HTMLAttributes<HTMLElement>,
  inputProps: InputHTMLAttributes<HTMLInputElement>,
  thumbPosition: {x: number, y: number}
}

const PAGE_STEP_SIZE = 6;

function degToRad(deg: number) {
  return deg * Math.PI / 180;
}

function radToDeg(rad: number) {
  return rad * 180 / Math.PI;
}

// 0deg = 3 o'clock. increses clockwise
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

export function useColorWheel(props: ColorWheelAriaProps, state: ColorWheelState): ColorWheelAriaResult {
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
          stateRef.current.setHue(stateRef.current.hue + step);
        } else if (deltaX < 0 || deltaY > 0) {
          stateRef.current.setHue(stateRef.current.hue - step);
        }
      } else {
        stateRef.current.setHue(cartesianToAngle(currentPosition.current.x, currentPosition.current.y, thumbRadius));
      }
    },
    onMoveEnd() {
      isOnWheel.current = false;
      state.setDragging(false);
      focusInput();
    }
  };
  let movePropsThumb = useMove(moveHandler);

  let isOnWheel = useRef<boolean>(false);
  let movePropsContainer = useMove({
    ...moveHandler,
    onMove(e) {
      if (isOnWheel.current) {
        moveHandler.onMove(e);
      }
    }
  });

  let onThumbDown = () => {
    focusInput();
    state.setDragging(true);
    addGlobalListener(window, 'mouseup', onUp, false);
    addGlobalListener(window, 'touchend', onUp, false);
    addGlobalListener(window, 'pointerup', onUp, false);
  };

  let onTrackDown = (pageX: number, pageY: number) => {
    let rect = (containerRef.current as HTMLElement).getBoundingClientRect();
    let x = pageX - rect.x - rect.width / 2;
    let y = pageY - rect.y - rect.height / 2;
    let radius = Math.sqrt(x * x + y * y);
    let angle = cartesianToAngle(x, y, radius);
    if (innerRadius < radius && radius < outerRadius) {
      isOnWheel.current = true;
      stateRef.current.setHue(angle);

      focusInput();
      state.setDragging(true);

      addGlobalListener(window, 'mouseup', onUp, false);
      addGlobalListener(window, 'touchend', onUp, false);
      addGlobalListener(window, 'pointerup', onUp, false);
    }
  };

  let onUp = () => {
    isOnWheel.current = false;
    state.setDragging(false);
    focusInput();

    removeGlobalListener(window, 'mouseup', onUp, false);
    removeGlobalListener(window, 'touchend', onUp, false);
    removeGlobalListener(window, 'pointerup', onUp, false);
  };

  let pageStepSize = Math.max(PAGE_STEP_SIZE, step);
  let {keyboardProps} = useKeyboard({
    onKeyDown(e) {
      switch (e.key) {
        case 'PageUp':
          e.preventDefault();
          state.setHue(Math.round((state.hue + pageStepSize) / pageStepSize) * pageStepSize);
          break;
        case 'PageDown':
          e.preventDefault();
          state.setHue(Math.round((state.hue - pageStepSize) / pageStepSize) * pageStepSize);
          break;
      }
    }
  });

  return {
    containerProps: isDisabled ? {} : mergeProps({
      onMouseDown: (e: React.MouseEvent) => {onTrackDown(e.pageX, e.pageY);},
      onPointerDown: (e: React.PointerEvent) => {onTrackDown(e.pageX, e.pageY);},
      onTouchStart: (e: React.TouchEvent) => {onTrackDown(e.targetTouches[0].pageX, e.targetTouches[0].pageY);}
    }, movePropsContainer),
    thumbProps: isDisabled ? {} : mergeProps({
      onMouseDown: onThumbDown,
      onPointerDown: onThumbDown,
      onTouchStart: onThumbDown
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
