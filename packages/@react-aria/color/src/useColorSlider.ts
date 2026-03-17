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

import {AriaColorSliderProps} from '@react-types/color';
import {ColorSliderState} from '@react-stately/color';
import {DOMAttributes, RefObject} from '@react-types/shared';
import {InputHTMLAttributes} from 'react';
import {mergeProps} from '@react-aria/utils';
import {useLocale} from '@react-aria/i18n';
import {useSlider, useSliderThumb} from '@react-aria/slider';
import {useVisuallyHidden} from '@react-aria/visually-hidden';

export interface AriaColorSliderOptions extends AriaColorSliderProps {
  /** A ref for the track element. */
  trackRef: RefObject<Element | null>,
  /** A ref for the input element. */
  inputRef: RefObject<HTMLInputElement | null>
}

export interface ColorSliderAria {
  /** Props for the label element. */
  labelProps: DOMAttributes,
  /** Props for the track element. */
  trackProps: DOMAttributes,
  /** Props for the thumb element. */
  thumbProps: DOMAttributes,
  /** Props for the visually hidden range input element. */
  inputProps: InputHTMLAttributes<HTMLInputElement>,
  /** Props for the output element, displaying the value of the color slider. */
  outputProps: DOMAttributes
}

/**
 * Provides the behavior and accessibility implementation for a color slider component.
 * Color sliders allow users to adjust an individual channel of a color value.
 */
export function useColorSlider(props: AriaColorSliderOptions, state: ColorSliderState): ColorSliderAria {
  let {trackRef, inputRef, orientation, channel, 'aria-label': ariaLabel, name, form} = props;

  let {locale, direction} = useLocale();

  // Provide a default aria-label if there is no other label provided.
  if (!props.label && !ariaLabel && !props['aria-labelledby']) {
    ariaLabel = state.value.getChannelName(channel, locale);
  }

  // @ts-ignore - ignore unused incompatible props
  let {groupProps, trackProps, labelProps, outputProps} = useSlider({...props, 'aria-label': ariaLabel}, state, trackRef);
  let {inputProps, thumbProps} = useSliderThumb({
    index: 0,
    orientation,
    isDisabled: props.isDisabled,
    name,
    form,
    trackRef,
    inputRef
  }, state);

  let value = state.getDisplayColor();
  let generateBackground = () => {
    let to: string;
    if (orientation === 'vertical') {
      to = 'top';
    } else if (direction === 'ltr') {
      to = 'right';
    } else {
      to = 'left';
    }
    switch (channel) {
      case 'hue': {
        let stops = [0, 60, 120, 180, 240, 300, 360].map(hue => value.withChannelValue('hue', hue).toString('css')).join(', ');
        return `linear-gradient(to ${to}, ${stops})`;
      }
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

  let forcedColorAdjustNoneStyle = {forcedColorAdjust: 'none'};

  if (channel === 'hue') {
    inputProps['aria-valuetext'] += `, ${value.getHueName(locale)}`;
  } else if (channel !== 'alpha') {
    inputProps['aria-valuetext'] += `, ${value.getColorName(locale)}`;
  }

  let {visuallyHiddenProps} = useVisuallyHidden({
    style: {
      opacity: '0.0001',
      width: '100%',
      height: '100%',
      pointerEvents: 'none'
    }
  });

  return {
    trackProps: {
      ...mergeProps(groupProps, trackProps),
      style: {
        ...trackProps.style,
        ...forcedColorAdjustNoneStyle,
        background: generateBackground()
      }
    },
    inputProps: {
      ...inputProps,
      style: {
        ...inputProps.style,
        ...visuallyHiddenProps.style
      }
    },
    thumbProps: {
      ...thumbProps,
      style: {
        ...thumbProps.style,
        ...forcedColorAdjustNoneStyle
      }
    },
    labelProps,
    outputProps
  };
}
