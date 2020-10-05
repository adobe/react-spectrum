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

import {classNames} from '@react-spectrum/utils';
import {Color, ColorSliderState, useColorSliderState} from '@react-stately/color';
import {ColorChannel, ColorSliderProps} from '@react-types/color';
import {ColorThumb} from './ColorThumb';
import {Direction} from '@react-types/shared';
import {Flex} from '@react-spectrum/layout';
import {Label} from '@react-spectrum/label';
import React, {useRef, useState} from 'react';
import styles from '@adobe/spectrum-css-temp/components/colorslider/vars.css';
import {useColorSlider} from '@react-aria/color';
import {useFocus, useFocusVisible} from '@react-aria/interactions';
import {useLocale} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';

function getDisplayColor(value: Color, channel: ColorChannel): Color {
  switch (channel) {
    case 'hue':
      return new Color(`hsl(${value.getChannelValue('hue')}, 100%, 50%)`);
    case 'lightness':
      value = value.withChannelValue('saturation', 0);
    case 'brightness':
    case 'saturation':
    case 'red':
    case 'green':
    case 'blue':
      return value.withChannelValue('alpha', 1);
    case 'alpha': {
      return value;
    }
    default:
      throw new Error('Unknown color channel: ' + channel);
  }
}

function getBackground(state: ColorSliderState, channel: ColorChannel, vertical: boolean, direction: Direction) {
  let value = getDisplayColor(state.value, channel);
  let to: string;
  if (vertical) {
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
}

function ColorSlider(props: ColorSliderProps) {
  props = useProviderProps(props);

  let {isDisabled, channel, orientation} = props;
  let vertical = orientation === 'vertical';

  let {direction} = useLocale();

  let inputRef = useRef();
  let trackRef = useRef();


  let state = useColorSliderState(props);
  let {inputProps, thumbProps, containerProps, trackProps} = useColorSlider({
    ...props,
    // TODO label situation
    // If you do not provide a visible label, you must specify an aria-label or aria-labelledby attribute for accessibility
    'aria-label': channel,
    trackRef,
    inputRef
  }, state);

  let {isFocusVisible} = useFocusVisible();
  let [isFocused, setIsFocused] = useState(false);
  let {focusProps} = useFocus({
    isDisabled,
    onFocusChange: setIsFocused
  });

  let thumbPosition = state.getThumbPercent(0);
  if (vertical || direction === 'rtl') {
    thumbPosition = 1 - thumbPosition;
  }

  return (
    <div>
      <Flex direction="row" justifyContent="space-between">
        {/* TODO: connect this label with the slider input */}
        <Label>{channel[0].toUpperCase() + channel.slice(1)}</Label>
        <Label>{state.getThumbValueLabel(0)}</Label>
      </Flex>
      <div className={classNames(styles, 'spectrum-ColorSlider', {'is-disabled': isDisabled, 'spectrum-ColorSlider--vertical': vertical})} {...containerProps}>
        <div className={classNames(styles, 'spectrum-ColorSlider-checkerboard')} role="presentation" ref={trackRef} {...trackProps}>
          <div className={classNames(styles, 'spectrum-ColorSlider-gradient')} role="presentation" style={{background: getBackground(state, channel, vertical, direction)}} />
        </div>

        <ColorThumb
          value={getDisplayColor(state.value, channel)}
          isFocused={isFocused && isFocusVisible}
          isDisabled={isDisabled}
          isDragging={state.isThumbDragging(0)}
          style={{[vertical ? 'top' : 'left']: `${thumbPosition * 100}%`}}
          className={classNames(styles, 'spectrum-ColorSlider-handle')}
          {...thumbProps}>
          <input {...inputProps} {...focusProps} ref={inputRef} className={classNames(styles, 'spectrum-ColorSlider-slider')} />
        </ColorThumb>
      </div>
    </div>);
}

export {ColorSlider};
