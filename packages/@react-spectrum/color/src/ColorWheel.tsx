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
import {FocusableRef} from '@react-types/shared';
// @ts-ignore
import intlMessages from '../intl/*.json';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {SpectrumColorWheelProps} from '@react-types/color';
import styles from '@adobe/spectrum-css-temp/components/colorwheel/vars.css';
import {useColorWheel} from '@react-aria/color';
import {useColorWheelState} from '@react-stately/color';
import {useFocus, useFocusVisible} from '@react-aria/interactions';
import {useId, useResizeObserver} from '@react-aria/utils';
import {useMessageFormatter} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';

const SEGMENTS = [];
for (let i = 0; i < 360; i++) {
  SEGMENTS.push(<rect width="80" height="2" x="80" y="79" fill={`hsl(${i}, 100%, 50%)`} transform={`rotate(${i} 80 80)`} key={i} />);
}

const WHEEL_THICKNESS = 24;

function ColorWheel(props: SpectrumColorWheelProps, ref: FocusableRef<HTMLDivElement>) {
  props = useProviderProps(props);

  let {
    isDisabled,
    'aria-label': ariaLabel
  } = props;
  let size = props.size && dimensionValue(props.size);
  let {styleProps} = useStyleProps(props);

  let inputRef = useRef(null);
  let containerRef = useFocusableRef(ref, inputRef);

  let [wheelRadius, setWheelRadius] = useState<number | null>(null);

  useEffect(() => {
    // the size observer's fallback to the window resize event doesn't fire on mount
    if (containerRef.current && wheelRadius == null) {
      setWheelRadius(containerRef.current.offsetWidth / 2);
    }
  }, [containerRef, wheelRadius, setWheelRadius]);

  let resizeHandler = useCallback(() => {
    if (containerRef.current) {
      setWheelRadius(containerRef.current.offsetWidth / 2);
    }
  }, [containerRef, setWheelRadius]);

  useResizeObserver({
    ref: containerRef,
    onResize: resizeHandler
  });

  // Provide a default aria-label if none is given
  let formatMessage = useMessageFormatter(intlMessages);
  if (ariaLabel == null && props['aria-labelledby'] == null) {
    ariaLabel = formatMessage('hue');
  }

  let state = useColorWheelState(props);
  let {groupProps, inputProps, thumbProps, thumbPosition: {x, y}} = useColorWheel({
    ...props,
    'aria-label': ariaLabel,
    inputRef,
    containerRef,
    innerRadius: wheelRadius - WHEEL_THICKNESS,
    outerRadius: wheelRadius
  }, state);

  let {isFocusVisible} = useFocusVisible();
  let [isFocused, setIsFocused] = useState(false);
  let {focusProps} = useFocus({
    isDisabled,
    onFocusChange: setIsFocused
  });

  let maskId = useId();

  // We are keeping the svg viewbox at 160x160 so that SEGMENTS can remain constant.
  // Instead make sure that the track thickness remains constant after scaling.
  let svgInnerRadius = 80 - (WHEEL_THICKNESS * (80 / wheelRadius));

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
      {...groupProps}
      style={{
        ...styleProps.style,
        // Workaround around https://github.com/adobe/spectrum-css/issues/1032
        // @ts-ignore
        'width': size,
        'height': size
      }}>
      {wheelRadius && <>
        <svg className={classNames(styles, 'spectrum-ColorWheel-wheel')} viewBox="0 0 160 160" aria-hidden="true">
          <defs>
            <mask id={maskId}>
              <circle cx="80" cy="80" r="80" fill="white" />
              <circle cx="80" cy="80" r={svgInnerRadius} fill="black" />
            </mask>
          </defs>
          <g className={classNames(styles, 'spectrum-ColorWheel-segment')} mask={`url(#${maskId})`}>
            {SEGMENTS}
          </g>
          <circle cx="80" cy="80" r="79.5" className={classNames(styles, 'spectrum-ColorWheel-outerCircle')} mask={`url(#${maskId})`} />
          <circle cx="80" cy="80" r={svgInnerRadius} className={classNames(styles, 'spectrum-ColorWheel-innerCircle')} />
        </svg>
        <ColorThumb
          value={state.value}
          isFocused={isFocused && isFocusVisible}
          isDisabled={isDisabled}
          isDragging={state.isDragging}
          style={{transform: `translate(${x}px, ${y}px)`}}
          className={classNames(styles, 'spectrum-ColorWheel-handle')}
          {...thumbProps}>
          <input {...focusProps} className={classNames(styles, 'spectrum-ColorWheel-slider')} {...inputProps} ref={inputRef} />
        </ColorThumb>
      </>}
    </div>
  );
}

let _ColorWheel = React.forwardRef(ColorWheel);
export {_ColorWheel as ColorWheel};
