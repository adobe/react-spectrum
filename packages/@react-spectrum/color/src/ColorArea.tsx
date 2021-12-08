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
import {mergeProps} from '@react-aria/utils';
import React, {CSSProperties, ReactElement, useRef} from 'react';
import {SpectrumColorAreaProps} from '@react-types/color';
import styles from '@adobe/spectrum-css-temp/components/colorarea/vars.css';
import {useColorArea} from '@react-aria/color';
import {useColorAreaState} from '@react-stately/color';
import {useFocusRing} from '@react-aria/focus';
import {useLocale} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';

function ColorArea(props: SpectrumColorAreaProps, ref: FocusableRef<HTMLDivElement>) {
  props = useProviderProps(props);

  let {isDisabled} = props;
  let size = props.size && dimensionValue(props.size);
  let {styleProps} = useStyleProps(props);

  let xInputRef = useRef(null);
  let yInputRef = useRef(null);
  let containerRef = useFocusableRef(ref, xInputRef);

  let state = useColorAreaState(props);

  let {channels: {xChannel, zChannel}} = state;
  let {
    colorAreaProps,
    gradientProps,
    xInputProps,
    yInputProps,
    thumbProps
  } = useColorArea(props, state, xInputRef, yInputRef, containerRef);
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
          <input className={classNames(styles, 'spectrum-ColorArea-slider')} {...mergeProps(xInputProps, focusProps)} ref={xInputRef} />
          <input className={classNames(styles, 'spectrum-ColorArea-slider')} {...mergeProps(yInputProps, focusProps)} ref={yInputRef} />
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

// this function looks scary, but it's actually pretty quick, just generates some strings
function useGradients({direction, state, zChannel, xChannel, isDisabled}): Gradients {
  let orientation = ['top', direction === 'rtl' ? 'left' : 'right'];
  let dir = false;
  let background = {colorAreaStyles: {}, gradientStyles: {}};
  let zValue = state.value.getChannelValue(zChannel);
  let {minValue: zMin, maxValue: zMax} = state.value.getChannelRange(zChannel);
  let alphaValue = (zValue - zMin) / (zMax - zMin);
  let lValue;
  let isHSL = state.value.getColorSpace() === 'hsl';
  let maskImage;
  if (!isDisabled) {
    switch (zChannel) {
      case 'red': {
        dir = xChannel === 'green';
        maskImage = `linear-gradient(to ${orientation[Number(!dir)]}, transparent, #000)`;
        background.colorAreaStyles = {
          /* the background represents the green channel as a linear gradient from min to max,
          with the blue channel minimized, adjusted by the red channel value. */
          backgroundImage: `linear-gradient(to ${orientation[Number(dir)]},rgb(${zValue},0,0),rgb(${zValue},255,0))`
        };
        background.gradientStyles = {
          /* the foreground represents the green channel as a linear gradient from min to max,
          with the blue channel maximized, adjusted by the red channel value. */
          backgroundImage: `linear-gradient(to ${orientation[Number(dir)]},rgb(${zValue},0,255),rgb(${zValue},255,255))`,
          /* the foreground gradient is masked by a perpendicular linear gradient from black to white */
          'WebkitMaskImage': maskImage,
          maskImage
        };
        break;
      }
      case 'green': {
        dir = xChannel === 'red';
        maskImage = `linear-gradient(to ${orientation[Number(!dir)]}, transparent, #000)`;
        background.colorAreaStyles = {
          /* the background represents the red channel as a linear gradient from min to max,
          with the blue channel minimized, adjusted by the green channel value. */
          backgroundImage: `linear-gradient(to ${orientation[Number(dir)]},rgb(0,${zValue},0),rgb(255,${zValue},0))`
        };
        background.gradientStyles = {
          /* the foreground represents the red channel as a linear gradient from min to max,
          with the blue channel maximized, adjusted by the green channel value. */
          backgroundImage: `linear-gradient(to ${orientation[Number(dir)]},rgb(0,${zValue},255),rgb(255,${zValue},255))`,
          /* the foreground gradient is masked by a perpendicular linear gradient from black to white */
          'WebkitMaskImage': maskImage,
          maskImage
        };
        break;
      }
      case 'blue': {
        dir = xChannel === 'red';
        maskImage = `linear-gradient(to ${orientation[Number(!dir)]}, transparent, #000)`;
        background.colorAreaStyles = {
          /* the background represents the red channel as a linear gradient from min to max,
          with the green channel minimized, adjusted by the blue channel value. */
          backgroundImage: `linear-gradient(to ${orientation[Number(dir)]},rgb(0,0,${zValue}),rgb(255,0,${zValue}))`
        };
        background.gradientStyles = {
          /* the foreground represents the red channel as a linear gradient from min to max,
          with the green channel maximized, adjusted by the blue channel value. */
          backgroundImage: `linear-gradient(to ${orientation[Number(dir)]},rgb(0,255,${zValue}),rgb(255,255,${zValue}))`,
          /* the foreground gradient is masked by a perpendicular linear gradient from black to white */
          'WebkitMaskImage': maskImage,
          maskImage
        };
        break;
      }
      case 'hue': {
        dir = xChannel !== 'saturation';
        lValue = isHSL ? 50 : 100;
        background.gradientStyles = {
          background: [
            (isHSL
              /* For HSL, foreground gradient represents lightness,
              from black to transparent to white. */
              ? `linear-gradient(to ${orientation[Number(dir)]}, hsla(0,0%,0%,1) 0%, hsla(0,0%,0%,0) 50%, hsla(0,0%,100%,0) 50%, hsla(0,0%,100%,1) 100%)`
              /* For HSB, foreground gradient represents brightness,
              from black to transparent. */
              : `linear-gradient(to ${orientation[Number(dir)]},hsl(0,0%,0%),hsla(0,0%,0%,0))`),
            /* background gradient represents saturation,
            from gray to transparent for HSL,
            or from white to transparent for HSB. */
            `linear-gradient(to ${orientation[Number(!dir)]},hsl(0,0%,${lValue}%),hsla(0,0%,${lValue}%,0))`,
            /* background color is the hue at full saturation and brightness */
            `hsl(${zValue}, 100%, 50%)`
          ].join(',')
        };
        break;
      }
      case 'saturation': {
        dir = xChannel === 'hue';
        background.gradientStyles = {
          background: [
            (isHSL
              /* for HSL, foreground gradient represents lightness, 
              from black to transparent to white, with alpha set to saturation value */
              ? `linear-gradient(to ${orientation[Number(!dir)]}, hsla(0,0%,0%,${alphaValue}) 0%, hsla(0,0%,0%,0) 50%, hsla(0,0%,100%,0) 50%, hsla(0,0%,100%,${alphaValue}) 100%)`
              /* for HSB, foreground gradient represents brightness,
              from black to transparent, with alpha set to saturation value */
              : `linear-gradient(to ${orientation[Number(!dir)]},hsla(0,0%,0%,${alphaValue}),hsla(0,0%,0%,0))`),
            /* background gradient represents the hue,
            from 0 to 360, with alpha set to saturation value */
            `linear-gradient(to ${orientation[Number(dir)]},hsla(0,100%,50%,${alphaValue}),hsla(60,100%,50%,${alphaValue}),hsla(120,100%,50%,${alphaValue}),hsla(180,100%,50%,${alphaValue}),hsla(240,100%,50%,${alphaValue}),hsla(300,100%,50%,${alphaValue}),hsla(359,100%,50%,${alphaValue}))`,
            (isHSL
              /* for HSL, the alpha transparency representing saturation 
              of the gradients above overlay a solid gray background */
              ? 'hsl(0, 0%, 50%)'
              /* for HSB, the alpha transparency representing saturation, 
              of the gradients above overlay a gradient from black to white */
              : `linear-gradient(to ${orientation[Number(!dir)]},hsl(0,0%,0%),hsl(0,0%,100%))`)
          ].join(',')
        };
        break;
      }
      case 'brightness': {
        dir = xChannel === 'hue';
        background.gradientStyles = {
          background: [
            /* foreground gradient represents saturation,
            from white to transparent, with alpha set to brightness value */
            `linear-gradient(to ${orientation[Number(!dir)]},hsla(0,0%,100%,${alphaValue}),hsla(0,0%,100%,0))`,
            /* background gradient represents the hue,
            from 0 to 360, with alpha set to brightness value */
            `linear-gradient(to ${orientation[Number(dir)]},hsla(0,100%,50%,${alphaValue}),hsla(60,100%,50%,${alphaValue}),hsla(120,100%,50%,${alphaValue}),hsla(180,100%,50%,${alphaValue}),hsla(240,100%,50%,${alphaValue}),hsla(300,100%,50%,${alphaValue}),hsla(359,100%,50%,${alphaValue}))`,
            /* for HSB, the alpha transparency representing brightness
            of the gradients above overlay a solid black background */
            '#000'
          ].join(',')
        };
        break;
      }
      case 'lightness': {
        dir = xChannel === 'hue';
        background.gradientStyles = {
          backgroundImage: [
            /* foreground gradient represents the color saturation from 0 to 100,
            adjusted by the lightness value */
            `linear-gradient(to ${orientation[Number(!dir)]},hsl(0,0%,${zValue}%),hsla(0,0%,${zValue}%,0))`,
            /* background gradient represents the hue, from 0 to 360,
            adjusted by the lightness value */
            `linear-gradient(to ${orientation[Number(dir)]},hsl(0,100%,${zValue}%),hsl(60,100%,${zValue}%),hsl(120,100%,${zValue}%),hsl(180,100%,${zValue}%),hsl(240,100%,${zValue}%),hsl(300,100%,${zValue}%),hsl(360,100%,${zValue}%))`
          ].join(',')
        };
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
