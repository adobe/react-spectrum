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

import {classNames, dimensionValue, useFocusableRef, useStyleProps} from '@react-spectrum/utils';
import {ColorThumb} from './ColorThumb';
import {ColorWheelContext, useContextProps} from 'react-aria-components';
import {FocusableRef} from '@react-types/shared';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {SpectrumColorWheelProps} from '@react-types/color';
import styles from '@adobe/spectrum-css-temp/components/colorwheel/vars.css';
import {useColorWheel} from '@react-aria-nutrient/color';
import {useColorWheelState} from '@react-stately/color';
import {useFocusRing} from '@react-aria-nutrient/focus';
import {useProviderProps} from '@react-spectrum/provider';
import {useResizeObserver} from '@react-aria-nutrient/utils';

const WHEEL_THICKNESS = 24;

/**
 * ColorWheels allow users to adjust the hue of an HSL or HSB color value on a circular track.
 */
export const ColorWheel = React.forwardRef(function ColorWheel(props: SpectrumColorWheelProps, ref: FocusableRef<HTMLDivElement>) {
  props = useProviderProps(props);
  let inputRef = useRef(null);
  let containerRef = useFocusableRef(ref, inputRef);
  [props, containerRef] = useContextProps(props, containerRef, ColorWheelContext);

  let {isDisabled} = props;
  let size = props.size && dimensionValue(props.size);
  let {styleProps} = useStyleProps(props);


  let [wheelRadius, setWheelRadius] = useState<number>(0);
  let [wheelThickness, setWheelThickness] = useState(WHEEL_THICKNESS);

  let resizeHandler = useCallback(() => {
    if (containerRef.current) {
      setWheelRadius(containerRef.current.offsetWidth / 2);
      let thickness = window.getComputedStyle(containerRef.current)
        .getPropertyValue('--spectrum-colorwheel-track-thickness');
      if (thickness) {
        setWheelThickness(parseInt(thickness, 10));
      }
    }
  }, [containerRef, setWheelRadius, setWheelThickness]);

  useEffect(() => {
    // the size observer's fallback to the window resize event doesn't fire on mount
    if (wheelRadius === 0) {
      resizeHandler();
    }
  }, [wheelRadius, resizeHandler]);

  useResizeObserver({
    ref: containerRef,
    onResize: resizeHandler
  });

  let state = useColorWheelState(props);

  let {trackProps, inputProps, thumbProps} = useColorWheel({
    ...props,
    innerRadius: wheelRadius - wheelThickness,
    outerRadius: wheelRadius
  }, state, inputRef);

  let {focusProps, isFocusVisible} = useFocusRing();

  return (
    <div
      className={
        classNames(
          styles,
          'spectrum-ColorWheel',
          {
            'is-disabled': isDisabled
          },
          styleProps.className
        )
      }
      ref={containerRef}
      style={{
        ...styleProps.style,
        // Workaround around https://github.com/adobe/spectrum-css/issues/1032
        'width': size,
        'height': size
      }}>
      <div {...trackProps} className={classNames(styles, 'spectrum-ColorWheel-gradient')} />
      <ColorThumb
        value={state.getDisplayColor()}
        isFocused={isFocusVisible}
        isDisabled={isDisabled}
        isDragging={state.isDragging}
        containerRef={containerRef}
        className={classNames(styles, 'spectrum-ColorWheel-handle')}
        {...thumbProps}>
        <input {...focusProps} className={classNames(styles, 'spectrum-ColorWheel-slider')} {...inputProps} ref={inputRef} />
      </ColorThumb>
    </div>
  );
});
