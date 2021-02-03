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

import {AriaSliderThumbProps} from '@react-types/slider';
import {ColorChannel} from '@react-types/color';
import {ColorSliderState} from '@react-stately/color';
import {HTMLAttributes, RefObject} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {useLocale, useMessageFormatter} from '@react-aria/i18n';
import {useSlider, useSliderThumb} from '@react-aria/slider';

interface ColorSliderAriaOptions extends Omit<AriaSliderThumbProps, 'index'> {
  channel: ColorChannel,
  trackRef: RefObject<HTMLElement>,
  inputRef: RefObject<HTMLInputElement>
}

interface ColorSliderAria {
  groupProps: HTMLAttributes<HTMLElement>,
  trackProps: HTMLAttributes<HTMLElement>,
  inputProps: HTMLAttributes<HTMLElement>,
  thumbProps: HTMLAttributes<HTMLElement>,
  labelProps: HTMLAttributes<HTMLElement>,
  gradientProps: HTMLAttributes<HTMLElement>
}

export function useColorSlider(props: ColorSliderAriaOptions, state: ColorSliderState): ColorSliderAria {
  let {trackRef, orientation, channel, 'aria-label': ariaLabel} = props;

  let {direction} = useLocale();

  let formatMessage = useMessageFormatter(intlMessages);
  let defaultLabel = formatMessage(channel);
  defaultLabel = defaultLabel[0].toUpperCase() + defaultLabel.slice(1);

  if (!ariaLabel || ariaLabel === channel) {
    ariaLabel = defaultLabel;
  }

  let {groupProps, trackProps, labelProps} = useSlider(props, state, trackRef);
  let {inputProps, thumbProps} = useSliderThumb({
    ...props,
    'aria-label': ariaLabel,
    index: 0
  }, state);

  if (groupProps['aria-label'] === undefined && groupProps['aria-labelledby'] === undefined) {
    inputProps['aria-labelledby'] = inputProps['aria-labelledby'].replace(groupProps.id, '').trim();
    if (inputProps['aria-labelledby'] === inputProps.id) {
      inputProps['aria-labelledby'] = undefined;
    }
  }

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
      case 'lightness': {
        // We have to add an extra color stop in the middle so that the hue shows up at all.
        // Otherwise it will always just be black to white.
        let min = state.getThumbMinValue(0);
        let max = state.getThumbMaxValue(0);
        let start = value.withChannelValue(channel, min).toString('css');
        let middle = value.withChannelValue(channel, (max - min) / 2).toString('css');
        let end = value.withChannelValue(channel, max).toString('css');
        return `linear-gradient(to ${to}, ${start}, ${middle}, ${end})`;
      }
      case 'saturation':
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
    groupProps,
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
