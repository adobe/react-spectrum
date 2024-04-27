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

import {AriaColorSwatchProps, useColorSwatch} from '@react-aria/color';
import {DOMRef, StyleProps} from '@react-types/shared';
import React, {forwardRef} from 'react';
import {style} from '@react-spectrum/style-macro-s1' with {type: 'macro'};
import {useDOMRef, useStyleProps} from '@react-spectrum/utils';

export interface SpectrumColorSwatchProps extends AriaColorSwatchProps, StyleProps {
  size?: 'XS' | 'S' | 'M' | 'L',
  rounding?: 'default' | 'none' | 'full'
}

function ColorSwatch(props: SpectrumColorSwatchProps, ref: DOMRef<HTMLDivElement>) {
  let {colorSwatchProps, color} = useColorSwatch(props);
  let domRef = useDOMRef(ref);
  let {styleProps} = useStyleProps(props);

  return (
    <div
      {...colorSwatchProps}
      {...styleProps}
      ref={domRef}
      style={{
        ...styleProps.style,
        // TODO: should there be a distinction between transparent and no value (e.g. null)?
        background: color.getChannelValue('alpha') > 0
          ? `linear-gradient(${color.toString('css')}, ${color.toString('css')}), repeating-conic-gradient(#e6e6e6 0% 25%, white 0% 50%) 50% / 16px 16px`
          // Red slash to indicate there is no selected color.
          : 'linear-gradient(to bottom right, transparent calc(50% - 2px), var(--spectrum-red-900) calc(50% - 2px) calc(50% + 2px), transparent calc(50% + 2px)) no-repeat'
      }}
      className={style({
        size: {
          size: {
            XS: 4,
            S: 6,
            M: 8,
            L: 10
          }
        },
        borderRadius: {
          rounding: {
            default: 'default',
            none: 'none',
            full: 'full'
          }
        },
        // Trick to create a partially transparent color from a variable.
        // Ideally we'd use relative color syntax for this but it's not in Firefox yet.
        borderColor: '[color-mix(in srgb, var(--spectrum-gray-900), transparent 49%)]',
        borderWidth: 1,
        borderStyle: 'solid',
        boxSizing: 'border-box',
        forcedColorAdjust: 'none'
      })({size: props.size || 'M', rounding: props.rounding || 'default'})} />
  );
}

/**
 * A ColorSwatch displays a preview of a selected color.
 */
let _ColorSwatch = forwardRef(ColorSwatch);
export {_ColorSwatch as ColorSwatch};
