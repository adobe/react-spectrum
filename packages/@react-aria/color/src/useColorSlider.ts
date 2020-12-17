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

import {ColorChannel} from '@react-types/color';
import {ColorSliderState} from '@react-stately/color';
import {HTMLAttributes} from 'react';
import {SliderThumbOptions, useSlider, useSliderThumb} from '@react-aria/slider';
import {useLocale} from '@react-aria/i18n';

interface ColorSliderAriaOptions extends Omit<SliderThumbOptions, 'index'> {
  channel: ColorChannel
}

interface ColorSliderAria {
  containerProps: HTMLAttributes<HTMLElement>,
  trackProps: HTMLAttributes<HTMLElement>,
  inputProps: HTMLAttributes<HTMLElement>,
  thumbProps: HTMLAttributes<HTMLElement>,
  labelProps: HTMLAttributes<HTMLElement>,
  gradientProps: HTMLAttributes<HTMLElement>
}

export function useColorSlider(props: ColorSliderAriaOptions, state: ColorSliderState): ColorSliderAria {
  let {trackRef, orientation, channel} = props;

  let {direction} = useLocale();

  let {containerProps, trackProps, labelProps} = useSlider(props, state, trackRef);
  let {inputProps, thumbProps} = useSliderThumb({
    ...props,
    // Avoid label being repeated on the thumb since it will already be labeled by the group
    'aria-label': undefined,
    index: 0
  }, state);

  let generateBackground = () => {
    let value = state.getDisplayColor();
    let to: string;
    if (orientation === 'vertical') {
      to = 'top';
    } else if (direction === 'ltr') {
      to = 'right';
    } else {
      to = 'left';
    }
    switch (channel) {
      case 'hue':
        return `linear-gradient(to ${to}, rgb(255, 0, 0) 0%, rgb(255, 255, 0) 17%, rgb(0, 255, 0) 33%, rgb(0, 255, 255) 50%, rgb(0, 0, 255) 67%, rgb(255, 0, 255) 83%, rgb(255, 0, 0) 100%)`;
      case 'saturation':
      case 'lightness':
      case 'brightness':
      case 'red':
      case 'green':
      case 'blue':
      case 'alpha': {
        let start = value.withChannelValue(channel, state.getThumbMinValue(0)).toString('css');
        let end = value.withChannelValue(channel, state.getThumbMaxValue(0)).toString('css');
        return `linear-gradient(to ${to}, ${start}, ${end})`;
      }
      default:
        throw new Error('Unknown color channel: ' + channel);
    }
  };

  return {
    containerProps,
    trackProps,
    inputProps,
    thumbProps,
    labelProps,
    gradientProps: {
      style: {
        background: generateBackground()
      }
    }
  };
}
