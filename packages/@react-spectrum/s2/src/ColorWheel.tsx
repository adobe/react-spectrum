/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  ColorWheel as AriaColorWheel,
  ColorWheelProps as AriaColorWheelProps,
  ColorWheelTrack,
  ContextValue
} from 'react-aria-components';
import {ColorHandle} from './ColorHandle';
import {createContext, forwardRef} from 'react';
import {DOMRef, DOMRefValue} from '@react-types/shared';
import {style} from '../style' with {type: 'macro'};
import {StyleProps} from './style-utils';
import {useDOMRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface ColorWheelProps extends Omit<AriaColorWheelProps, 'children' | 'className' | 'style' | 'outerRadius' | 'innerRadius'>, StyleProps {
  /**
   * @default 192
   */
  size?: number
}

export const ColorWheelContext = createContext<ContextValue<ColorWheelProps, DOMRefValue<HTMLDivElement>>>(null);

/**
 * A ColorWheel allows users to adjust the hue of an HSL or HSB color value on a circular track.
 */
export const ColorWheel = forwardRef(function ColorWheel(props: ColorWheelProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, ColorWheelContext);
  let {UNSAFE_className = '', UNSAFE_style, styles = ''} = props;
  let containerRef = useDOMRef(ref);
  // TODO: how to do mobile scaling?
  let {size = 192} = props;
  let outerRadius = Math.max(size, 175) / 2;
  let thickness = 24;
  let innerRadius = outerRadius - 24;
  return (
    <AriaColorWheel 
      {...props}
      outerRadius={outerRadius}
      innerRadius={innerRadius}
      ref={containerRef}
      style={UNSAFE_style}
      className={UNSAFE_className + styles}>
      {({isDisabled, state}) => (<>
        <ColorWheelTrack
          style={({defaultStyle, isDisabled}) => ({
            background: isDisabled ? undefined : defaultStyle.background
          })}
          className={style({
            // Outer border
            borderRadius: 'full',
            outlineColor: {
              default: 'gray-1000/10',
              forcedColors: 'ButtonBorder'
            },
            outlineWidth: 1,
            outlineOffset: -1,
            outlineStyle: {
              default: 'solid',
              isDisabled: 'none'
            },
            backgroundColor: {
              isDisabled: 'disabled'
            }
          })} />
        <div
          className={style({
            // Inner border
            position: 'absolute',
            inset: 24,
            pointerEvents: 'none',
            borderRadius: 'full',
            outlineColor: {
              default: 'gray-1000/10',
              forcedColors: 'ButtonBorder'
            },
            outlineWidth: 1,
            outlineStyle: {
              default: 'solid',
              isDisabled: 'none'
            }
          })({isDisabled})} />
        <ColorHandle
          containerRef={containerRef}
          getPosition={() => {
            let {x, y} = state.getThumbPosition(outerRadius - thickness / 2);
            return {
              x: (outerRadius + x) / (outerRadius * 2),
              y: (outerRadius + y) / (outerRadius * 2)
            };
          }} />
      </>)}
    </AriaColorWheel>
  );
});
