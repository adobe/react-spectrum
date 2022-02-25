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
