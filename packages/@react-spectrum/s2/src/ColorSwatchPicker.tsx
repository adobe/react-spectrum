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

import {ColorSwatchPicker as AriaColorSwatchPicker, ColorSwatchPickerItem as AriaColorSwatchPickerItem} from 'react-aria-components';
import {Color} from '@react-types/color';
import {DOMRef, ValueBase} from '@react-types/shared';
import {forwardRef, ReactElement, ReactNode} from 'react';
import {SpectrumColorSwatchContext, ColorSwatchProps} from './ColorSwatch';
import {style, size as sizeValue} from '../style/spectrum-theme' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';
import {StyleProps, focusRing, getAllowedOverrides} from './style-utils' with {type: 'macro'};

export interface ColorSwatchPickerProps extends ValueBase<string | Color | null, Color>, StyleProps {
  /** The ColorSwatches within the ColorSwatchPicker. */
  children: ReactNode,
  /**
   * The amount of padding between the swatches.
   * @default "regular"
   */
  density?: 'compact' | 'regular' | 'spacious',
  /**
   * The size of the color swatches.
   * @default "M"
   */
  size?: 'XS' | 'S' | 'M' | 'L',
  /**
   * The corner rounding of the color swatches.
   * @default "none"
   */
  rounding?: 'none' | 'default' | 'full'
}

function ColorSwatchPicker(props: ColorSwatchPickerProps, ref: DOMRef<HTMLDivElement>) {
  let {
    density = 'regular',
    size = 'M',
    rounding = 'none',
    ...otherProps
  } = props;
  let domRef = useDOMRef(ref);

  return (
    <AriaColorSwatchPicker
      {...otherProps}
      ref={domRef}
      className={props.UNSAFE_className + style({
        display: 'flex',
        flexWrap: 'wrap',
        gap: {
          density: {
            compact: sizeValue(2),
            regular: 4,
            spacious: sizeValue(6)
          }
        }
      }, getAllowedOverrides())({density}, props.styles)}>
      <SpectrumColorSwatchContext.Provider value={{useWrapper, size, rounding}}>
        {props.children}
      </SpectrumColorSwatchContext.Provider>
    </AriaColorSwatchPicker>
  );
}

/**
 * A ColorSwatchPicker displays a list of color swatches and allows a user to select one of them.
 */
let _ColorSwatchPicker = forwardRef(ColorSwatchPicker);
export {_ColorSwatchPicker as ColorSwatchPicker};

function useWrapper(swatch: ReactElement, color: Color, rounding: ColorSwatchProps['rounding']) {
  return (
    <AriaColorSwatchPickerItem
      color={color}
      className={renderProps => style({
        ...focusRing(),
        position: 'relative',
        borderRadius: {
          rounding: {
            none: 'none',
            default: 'sm',
            full: 'full'
          }
        }
      })({...renderProps, rounding})}>
      {({isSelected}) => (<>
        {swatch}
        {isSelected && (
          <div
            aria-hidden
            className={style({
              position: 'absolute',
              pointerEvents: 'none',
              inset: 0,
              boxSizing: 'border-box',
              borderColor: 'gray-900',
              borderStyle: 'solid',
              borderWidth: 2,
              outlineColor: 'gray-25',
              outlineStyle: 'solid',
              outlineWidth: 2,
              outlineOffset: -4,
              forcedColorAdjust: 'none',
              borderRadius: '[inherit]'
            })} />
        )}
      </>)}
    </AriaColorSwatchPickerItem>
  );
}
