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
  ColorArea as AriaColorArea,
  ColorAreaProps as AriaColorAreaProps,
  ContextValue
} from 'react-aria-components';
import {ColorHandle} from './ColorHandle';
import {createContext, forwardRef} from 'react';
import {DOMRef, DOMRefValue} from '@react-types/shared';
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {style} from '../style' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface ColorAreaProps extends Omit<AriaColorAreaProps, 'children' | 'className' | 'style'>, StyleProps {}

export const ColorAreaContext = createContext<ContextValue<ColorAreaProps, DOMRefValue<HTMLDivElement>>>(null);

/**
 * A ColorArea allows users to adjust two channels of an RGB, HSL or HSB color value against a two-dimensional gradient background.
 */
export const ColorArea = forwardRef(function ColorArea(props: ColorAreaProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, ColorAreaContext);
  let {UNSAFE_className = '', UNSAFE_style, styles} = props;
  let containerRef = useDOMRef(ref);
  return (
    <AriaColorArea
      {...props}
      ref={containerRef}
      style={({defaultStyle, isDisabled}) => ({
        ...defaultStyle,
        background: isDisabled ? undefined : defaultStyle.background,
        // Move position: relative to style macro so it can be overridden.
        position: undefined,
        ...UNSAFE_style
      })}
      className={renderProps => UNSAFE_className + style({
        position: 'relative',
        size: 192,
        minSize: 64,
        borderRadius: 'default',
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
      }, getAllowedOverrides({height: true}))(renderProps, styles)}>
      {({state}) =>
        (<ColorHandle
          containerRef={containerRef}
          getPosition={() => state.getThumbPosition()} />)
      }
    </AriaColorArea>
  );
});
