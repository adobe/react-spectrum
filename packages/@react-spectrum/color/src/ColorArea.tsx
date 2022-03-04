/*
 * Copyright 2021 Adobe. All rights reserved.
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
import {
  generateHSB_B,
  generateHSB_H,
  generateHSB_S,
  generateHSL_H,
  generateHSL_L,
  generateHSL_S,
  generateRGB_B,
  generateRGB_G,
  generateRGB_R,
  useColorArea
} from '@react-aria/color';
import {mergeProps} from '@react-aria/utils';
import React, {CSSProperties, ReactElement, useRef} from 'react';
import {SpectrumColorAreaProps} from '@react-types/color';
import styles from '@adobe/spectrum-css-temp/components/colorarea/vars.css';
import {useColorAreaState} from '@react-stately/color';
import {useFocusRing} from '@react-aria/focus';
import {useLocale} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';

function ColorArea(props: SpectrumColorAreaProps, ref: FocusableRef<HTMLDivElement>) {
  props = useProviderProps(props);

  let {isDisabled} = props;
  let size = props.size && dimensionValue(props.size);
  let {styleProps} = useStyleProps(props);

  let inputXRef = useRef();
  let inputYRef = useRef();
  let containerRef = useFocusableRef(ref, inputXRef);

  let state = useColorAreaState(props);

  let {channels: {xChannel, zChannel}} = state;
  let {
    colorAreaProps,
    gradientProps,
    xInputProps,
    yInputProps,
    thumbProps
  } = useColorArea({...props, inputXRef, inputYRef, containerRef}, state);
  let {direction} = useLocale();
  let {colorAreaStyleProps, gradientStyleProps, thumbStyleProps} = useGradients({direction, state, xChannel, zChannel, isDisabled: props.isDisabled});

  let {focusProps, isFocusVisible} = useFocusRing();

  return (
    <div
      {...colorAreaProps}
      className={
        classNames(
          styles,
          'spectrum-ColorArea',
          {
            'is-disabled': isDisabled
          },
          styleProps.className
        )
      }
      ref={containerRef}
      style={{
        ...colorAreaStyleProps.style,
        ...styleProps.style,
        // Workaround around https://github.com/adobe/spectrum-css/issues/1032
        width: size,
        height: size
      }}>
      <div {...gradientProps} {...gradientStyleProps} className={classNames(styles, 'spectrum-ColorArea-gradient')} />
      <ColorThumb
        value={state.getDisplayColor()}
        isFocused={isFocusVisible}
        isDisabled={isDisabled}
        isDragging={state.isDragging}
        className={classNames(styles, 'spectrum-ColorArea-handle')}
        {...thumbProps}
        {...thumbStyleProps}>
        <div role="presentation">
          <input className={classNames(styles, 'spectrum-ColorArea-slider')} {...mergeProps(xInputProps, focusProps)} ref={inputXRef} />
          <input className={classNames(styles, 'spectrum-ColorArea-slider')} {...mergeProps(yInputProps, focusProps)} ref={inputYRef} />
        </div>
      </ColorThumb>
    </div>
  );
}

let _ColorArea = React.forwardRef(ColorArea) as (props: SpectrumColorAreaProps & {ref?: FocusableRef<HTMLDivElement>}) => ReactElement;
export {_ColorArea as ColorArea};

interface Gradients {
  colorAreaStyleProps: {
    style: CSSProperties
  },
  gradientStyleProps: {
    style: CSSProperties
  },
  thumbStyleProps: {
    style: CSSProperties
  }
}

function useGradients({direction, state, zChannel, xChannel, isDisabled}): Gradients {
  let orientation = ['top', direction === 'rtl' ? 'left' : 'right'];
  let dir = false;
  let background = {colorAreaStyles: {}, gradientStyles: {}};
  let zValue = state.value.getChannelValue(zChannel);
  let {minValue: zMin, maxValue: zMax} = state.value.getChannelRange(zChannel);
  let alphaValue = (zValue - zMin) / (zMax - zMin);
  let isHSL = state.value.getColorSpace() === 'hsl';
  if (!isDisabled) {
    switch (zChannel) {
      case 'red': {
        dir = xChannel === 'green';
        background = generateRGB_R(orientation, dir, zValue);
        break;
      }
      case 'green': {
        dir = xChannel === 'red';
        background = generateRGB_G(orientation, dir, zValue);
        break;
      }
      case 'blue': {
        dir = xChannel === 'red';
        background = generateRGB_B(orientation, dir, zValue);
        break;
      }
      case 'hue': {
        dir = xChannel !== 'saturation';
        if (isHSL) {
          background = generateHSL_H(orientation, dir, zValue);
        } else {
          background = generateHSB_H(orientation, dir, zValue);
        }
        break;
      }
      case 'saturation': {
        dir = xChannel === 'hue';
        if (isHSL) {
          background = generateHSL_S(orientation, dir, alphaValue);
        } else {
          background = generateHSB_S(orientation, dir, alphaValue);
        }
        break;
      }
      case 'brightness': {
        dir = xChannel === 'hue';
        background = generateHSB_B(orientation, dir, alphaValue);
        break;
      }
      case 'lightness': {
        dir = xChannel === 'hue';
        background = generateHSL_L(orientation, dir, zValue);
        break;
      }
    }
  }

  let {x, y} = state.getThumbPosition();

  if (direction === 'rtl') {
    x = 1 - x;
  }

  return {
    colorAreaStyleProps: {
      style: {
        position: 'relative',
        touchAction: 'none',
        ...background.colorAreaStyles
      }
    },
    gradientStyleProps: {
      style: {
        touchAction: 'none',
        ...background.gradientStyles
      }
    },
    thumbStyleProps: {
      style: {
        position: 'absolute',
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform: 'translate(0%, 0%)',
        touchAction: 'none'
      }
    }
  };
}
