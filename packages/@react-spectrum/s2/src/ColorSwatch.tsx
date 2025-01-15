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
  ColorSwatch as AriaColorSwatch,
  ColorSwatchProps as AriaColorSwatchProps,
  ContextValue,
  parseColor
} from 'react-aria-components';
import {Color} from '@react-types/color';
import {createContext, forwardRef, JSX, ReactElement, useContext, useMemo} from 'react';
import {DOMRef, DOMRefValue} from '@react-types/shared';
import {getAllowedOverrides, StylesPropWithHeight, UnsafeStyles} from './style-utils' with {type: 'macro'};
import {style} from '../style' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface ColorSwatchProps extends Omit<AriaColorSwatchProps, 'className' | 'style'>, UnsafeStyles {
  /**
   * The size of the ColorSwatch.
   * @default 'M'
   */
  size?: 'XS' | 'S' | 'M' | 'L',
  /**
   * The corner rounding of the ColorSwatch.
   * @default 'default'
   */
  rounding?: 'default' | 'none' | 'full',
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight
}

interface SpectrumColorSwatchContextValue extends Pick<ColorSwatchProps, 'size' | 'rounding'> {
  useWrapper: (swatch: ReactElement, color: Color, rounding: ColorSwatchProps['rounding']) => JSX.Element
}

export const ColorSwatchContext = createContext<ContextValue<ColorSwatchProps, DOMRefValue<HTMLDivElement>>>(null);
export const InternalColorSwatchContext = createContext<SpectrumColorSwatchContextValue | null>(null);

/**
 * A ColorSwatch displays a preview of a selected color.
 */
export const ColorSwatch = forwardRef(function ColorSwatch(props: ColorSwatchProps, ref: DOMRef<HTMLDivElement>): JSX.Element {
  [props, ref] = useSpectrumContextProps(props, ref, ColorSwatchContext);
  let domRef = useDOMRef(ref);
  let ctx = useContext(InternalColorSwatchContext);
  let {
    size = ctx?.size || 'M',
    rounding = ctx?.rounding || 'default',
    color
  } = props;
  let nonNullValue = color || '#fff0';
  color = useMemo(() => typeof nonNullValue === 'string' ? parseColor(nonNullValue) : nonNullValue, [nonNullValue]);

  let swatch = (
    <AriaColorSwatch
      {...props}
      color={color}
      ref={domRef}
      style={({color}) => ({
        // TODO: should there be a distinction between transparent and no value (e.g. null)?
        background: color.getChannelValue('alpha') > 0
          ? `linear-gradient(${color}, ${color}), repeating-conic-gradient(#e6e6e6 0% 25%, white 0% 50%) 0% 50% / 16px 16px`
          // Red slash to indicate there is no selected color.
          : 'linear-gradient(to bottom right, transparent calc(50% - 2px), var(--slash-color) calc(50% - 2px) calc(50% + 2px), transparent calc(50% + 2px)) no-repeat'
      })}
      className={style({
        size: {
          size: {
            XS: 16,
            S: 24,
            M: 32,
            L: 40
          }
        },
        borderRadius: {
          rounding: {
            default: 'sm',
            none: 'none',
            full: 'full'
          }
        },
        borderColor: 'gray-1000/42',
        borderWidth: 1,
        borderStyle: 'solid',
        boxSizing: 'border-box',
        forcedColorAdjust: 'none',
        '--slash-color': {
          type: 'color',
          value: 'red-900'
        }
      }, getAllowedOverrides({height: true}))({size, rounding}, props.styles)} />
  );

  // ColorSwatchPicker needs to wrap the swatch in a ListBoxItem.
  if (ctx) {
    return ctx.useWrapper(swatch, color, rounding);
  }

  return swatch;
});
