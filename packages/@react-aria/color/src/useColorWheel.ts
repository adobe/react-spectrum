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

import {ColorWheelAriaProps, ColorWheelAriaResult, ColorWheelState} from '@react-types/color';
import {focusWithoutScrolling, mergeProps} from '@react-aria/utils';
import React, {useCallback, useRef} from 'react';
import {useMove} from '@react-aria/interactions';

function degToRad(deg: number) {
  return deg * Math.PI / 180;
}

function radToDeg(rad: number) {
  return rad * 180 / Math.PI;
}

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

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}


export function useColorWheel(props: ColorWheelAriaProps, state: ColorWheelState): ColorWheelAriaResult {
  let {inputRef, containerRef, isDisabled, step = 1, innerRadius, outerRadius} = props;

  let thumbRadius = (innerRadius + outerRadius) / 2;

  let focusInput = useCallback(() => {
    if (inputRef.current) {
      focusWithoutScrolling(inputRef.current);
    }
  }, [inputRef]);

  let isOnWheel = useRef<boolean>(false);

  let stateRef = useRef<ColorWheelState>(null);
  stateRef.current = state;

  let currentPosition = useRef<{x: number, y: number}>(null);
  let moveHandler = {
    onMoveStart() {
      currentPosition.current = null;
    },
    onMove({deltaX, deltaY, pointerType}) {
      if (currentPosition.current == null) {
        currentPosition.current = angleToCartesian(stateRef.current.value.getChannelValue('hue'), thumbRadius);
      }
      currentPosition.current.x += deltaX;
      currentPosition.current.y += deltaY;
      if (pointerType === 'keyboard') {
        if (deltaX > 0) {
          stateRef.current.setHue(stateRef.current.value.getChannelValue('hue') + step);
        } else if (deltaX < 0) {
          stateRef.current.setHue(stateRef.current.value.getChannelValue('hue') - step);
        }
      } else {
        stateRef.current.setHue(roundToStep(cartesianToAngle(currentPosition.current.x, currentPosition.current.y, thumbRadius), step));
      }
    }
  };
  let movePropsContainer = useMove({
    ...moveHandler,
    onMove(e) {
      if (isOnWheel.current) {
        moveHandler.onMove(e);
      }
    }
  });
  let movePropsThumb = useMove(moveHandler);

  let onEnd = () => {
    isOnWheel.current = false;
    focusInput();
    state.setDragging(false);
    window.removeEventListener('mouseup', onEnd, false);
    window.removeEventListener('touchend', onEnd, false);
  };

  let onStart = (pageX: number, pageY: number) => {
    let rect = (containerRef.current as HTMLElement).getBoundingClientRect();
    let x = pageX - rect.x - rect.width / 2;
    let y = pageY - rect.y - rect.height / 2;
    let radius = Math.sqrt(x * x + y * y);
    let angle = cartesianToAngle(x, y, radius);
    if (innerRadius < radius && radius < outerRadius) {
      isOnWheel.current = true;
      stateRef.current.setHue(roundToStep(angle, step));

      focusInput();
      state.setDragging(true);
      window.addEventListener('mouseup', onEnd, false);
      window.addEventListener('touchend', onEnd, false);
    }
  };

  return {
    containerProps: mergeProps({
      onMouseDown: (e: React.MouseEvent) => onStart(e.pageX, e.pageY),
      onTouchStart: (e: React.TouchEvent) => onStart(e.touches[0].pageX, e.touches[0].pageY)
    }, movePropsContainer),
    thumbProps: movePropsThumb,
    inputProps: {
      type: 'range',
      'aria-label': 'hue',
      min: '0',
      max: '360',
      step: step,
      disabled: isDisabled
    },
    thumbPosition: angleToCartesian(state.value.getChannelValue('hue'), thumbRadius)
  };
}
