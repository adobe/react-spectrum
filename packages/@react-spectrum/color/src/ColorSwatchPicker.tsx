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
import {DOMRef, StyleProps, ValueBase} from '@react-types/shared';
import React, {forwardRef, ReactElement, ReactNode} from 'react';
import {SpectrumColorSwatchContext, SpectrumColorSwatchProps} from './ColorSwatch';
import {style} from '@react-spectrum/style-macro-s1' with {type: 'macro'};
import {useDOMRef, useStyleProps} from '@react-spectrum/utils';

export interface SpectrumColorSwatchPickerProps extends ValueBase<string | Color, Color>, StyleProps {
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

/**
 * A ColorSwatchPicker displays a list of color swatches and allows a user to select one of them.
 */
export const ColorSwatchPicker = forwardRef(function ColorSwatchPicker(props: SpectrumColorSwatchPickerProps, ref: DOMRef<HTMLDivElement>) {
  let {
    density = 'regular',
    size = 'M',
    rounding = 'none',
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(props);
  let domRef = useDOMRef(ref);

  return (
    <AriaColorSwatchPicker
      {...otherProps}
      style={styleProps.style}
      ref={domRef}
      className={styleProps.className + style({
        display: 'flex',
        flexWrap: 'wrap',
        gap: {
          density: {
            compact: 0.5,
            regular: 1,
            spacious: 2
          }
        }
      })({density})}>
      <SpectrumColorSwatchContext.Provider value={{useWrapper, size, rounding}}>
        {props.children}
      </SpectrumColorSwatchContext.Provider>
    </AriaColorSwatchPicker>
  );
});

function useWrapper(swatch: ReactElement, color: Color, rounding: SpectrumColorSwatchProps['rounding']) {
  return (
    <AriaColorSwatchPickerItem
      color={color}
      className={renderProps => style({
        outlineStyle: {
          default: 'none',
          isFocusVisible: 'solid'
        },
        outlineColor: 'focus-ring',
        outlineWidth: 2,
        outlineOffset: 2,
        position: 'relative',
        borderRadius: {
          rounding: {
            none: 'none',
            default: 'default',
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
              boxShadow: '[inset 0 0 0 2px var(--spectrum-gray-900), inset 0 0 0 4px var(--spectrum-gray-50)]',
              forcedColorAdjust: 'none',
              borderRadius: '[inherit]'
            })()} />
        )}
      </>)}
    </AriaColorSwatchPickerItem>
  );
}
