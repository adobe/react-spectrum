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

import {classNames} from '@react-spectrum/utils';
import {Color} from '@react-stately/color';
import {ColorThumb} from './ColorThumb';
import {ColorWheelProps, ColorWheelState} from '@react-types/color';
import {focusWithoutScrolling, mergeProps, useId} from '@react-aria/utils';
import React, {HTMLAttributes, InputHTMLAttributes, useCallback, useMemo, useRef, useState} from 'react';
import styles from '@adobe/spectrum-css-temp/components/colorwheel/vars.css';
import {useControlledState} from '@react-stately/utils';
import {useFocus, useFocusVisible, useMove} from '@react-aria/interactions';
import {useProviderProps} from '@react-spectrum/provider';

function normalizeColor(v: string | Color) {
  if (typeof v === 'string') {
    return new Color(v);
  } else {
    return v;
  }
}

function useColorWheelState(props: ColorWheelProps): ColorWheelState {
  let {value, defaultValue, onChange, channel} = props;

  let [state, setState] = useControlledState(normalizeColor(value), normalizeColor(defaultValue), onChange);

  let [dragging, setDragging] = useState(false);

  return {
    value: state,
    setValue(value) {
      setState(normalizeColor(value));
    },

    channelValue: state.getChannelValue(channel),
    channelValuePercent: state.getChannelValuePercent(channel),
    setChannelValue(value) {
      setState(state => state.withChannelValue(channel, value));
    },
    setChannelValuePercent(value) {
      setState(state => state.withChannelValuePercent(channel, value));
    },

    setDragging(value) {
      setDragging(value);
    },
    dragging,

    // TODODO
    minValue: 0,
    maxValue: 0
  };
}

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

let radius = 67.5;

function useColorWheel(props, state: ColorWheelState): {thumbProps: HTMLAttributes<HTMLElement>, containerProps: HTMLAttributes<HTMLElement>, inputProps: InputHTMLAttributes<HTMLInputElement>} {
  let {inputRef, containerRef, isDisabled} = props;

  const focusInput = useCallback(() => {
    if (inputRef.current) {
      focusWithoutScrolling(inputRef.current);
    }
  }, [inputRef]);

  const stateRef = useRef<ColorWheelState>(null);
  stateRef.current = state;

  let currentPosition = useRef<{x: number, y: number}>(null);
  let moveHandler = {
    onMoveStart() {
      currentPosition.current = null;
    },
    onMove({deltaX, deltaY, pointerType}) {
      if (currentPosition.current == null) {
        currentPosition.current = angleToCartesian(stateRef.current.channelValuePercent * 360, radius);
      }
      currentPosition.current.x += deltaX;
      currentPosition.current.y += deltaY;
      if (pointerType === 'keyboard') {
        if (deltaX > 0) {
          stateRef.current.setChannelValuePercent(stateRef.current.channelValuePercent + 0.01);
        } else if (deltaX < 0) {
          stateRef.current.setChannelValuePercent(stateRef.current.channelValuePercent - 0.01);
        }
      } else {
        stateRef.current.setChannelValuePercent((cartesianToAngle(currentPosition.current.x, currentPosition.current.y, radius) / 360));
      }
    }
  };
  let movePropsContainer = useMove(moveHandler);
  let movePropsThumb = useMove(moveHandler);

  let onEnd = () => {
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
    if (60 < radius && radius < 80) {
      stateRef.current.setChannelValuePercent(angle / 360);

      focusInput();
      state.setDragging(true);
      window.addEventListener('mouseup', onEnd, false);
      window.addEventListener('touchend', onEnd, false);
    }
  };

  return {
    containerProps: mergeProps({
      onMouseDown: (e) => onStart(e.pageX, e.pageY),
      onTouchStart: (e) => onStart(e.touches[0].pageX, e.touches[0].pageY)
    }, movePropsContainer),
    thumbProps: movePropsThumb,
    inputProps: {
      type: 'range',
      'aria-label': props.channel,
      min: state.minValue,
      max: state.maxValue,
      disabled: isDisabled
      // step: '`'
    }
  };
}

function ColorWheel(props: ColorWheelProps) {
  props = useProviderProps(props);

  let {isDisabled, channel} = props;
  let inputRef = useRef(null);
  let containerRef = useRef(null);
  let {isFocusVisible} = useFocusVisible();

  let state = useColorWheelState(props);
  let {containerProps, inputProps, thumbProps} = useColorWheel({...props, inputRef, containerRef}, state);

  let [isFocused, setIsFocused] = useState(false);
  let {focusProps} = useFocus({
    isDisabled,
    onFocusChange: setIsFocused
  });

  let colorToDisplay = state.value;
  if (channel === 'hue') {
    // TODO HSB doesn't have lightness
    colorToDisplay = colorToDisplay.withChannelValuePercent('saturation', 1).withChannelValuePercent('lightness', 0.5).withChannelValuePercent('alpha', 1);
  } else if (channel === 'saturation' || channel === 'lightness' || channel === 'red' || channel === 'green' || channel === 'blue') {
    colorToDisplay = colorToDisplay.withChannelValuePercent('alpha', 1);
  }

  let segments = useMemo(() => {
    let segments = [];
    for (let i = 0; i < 360; i++) {
      segments.push(<rect width="80" height="2" x="80" y="79" fill={colorToDisplay.withChannelValuePercent(channel, (i / 360)).toString('css')} transform={`rotate(${i} 80 80)`} key={i} />);
    }
    return segments;
  }, [channel, colorToDisplay.withChannelValuePercent(channel, 0).toString('css')]);

  let maskId = useId();

  let {x, y} = angleToCartesian(state.channelValuePercent * 360, radius);

  return (
    <div className={classNames(styles, 'spectrum-ColorWheel', {'is-disabled': isDisabled})} ref={containerRef} {...containerProps}>
      <svg className={classNames(styles, 'spectrum-ColorWheel-wheel')} viewBox="0 0 160 160" aria-hidden="true">
        <defs>
          <mask id={maskId}>
            <circle cx="80" cy="80" r="80" fill="white" />
            <circle cx="80" cy="80" r="56" fill="black" />
          </mask>
        </defs>
        <g className={classNames(styles, 'spectrum-ColorWheel-segment')} mask={`url(#${maskId})`}>
          {segments}
        </g>
        <circle cx="80" cy="80" r="79.5" className={classNames(styles, 'spectrum-ColorWheel-outerCircle')} mask={`url(#${maskId})`} />
        <circle cx="80" cy="80" r="56" className={classNames(styles, 'spectrum-ColorWheel-innerCircle')} />
      </svg>

      <ColorThumb
        value={colorToDisplay}
        isFocused={isFocused && isFocusVisible}
        isDisabled={isDisabled}
        isDragging={state.dragging}
        style={{transform: `translate(${x}px, ${y}px)`}}
        className={classNames(styles, 'spectrum-ColorWheel-handle')}
        {...thumbProps}>
        <input {...focusProps} className={classNames(styles, 'spectrum-ColorWheel-slider')} {...inputProps} ref={inputRef} />
      </ColorThumb>
    </div>
  );
}

export {ColorWheel};
