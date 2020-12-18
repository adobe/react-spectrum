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

import {Color} from './Color';
import {ColorSliderProps} from '@react-types/color';
import {SliderState, useSliderState} from '@react-stately/slider';
import {useControlledState} from '@react-stately/utils';
import {useNumberFormatter} from '@react-aria/i18n';

export interface ColorSliderState extends SliderState {
  value: Color,
  setValue(value: string | Color): void,
  /** Returns the color that should be displayed in the slider instead of `value` or the optional parameter. */
  getDisplayColor(c?: Color): Color
}

function normalizeColor(v: string | Color) {
  if (typeof v === 'string') {
    return new Color(v);
  } else {
    return v;
  }
}

export function useColorSliderState(props: ColorSliderProps): ColorSliderState {
  let {channel, value, defaultValue, onChange, ...otherProps} = props;
  if (value == null && defaultValue == null) {
    throw new Error('useColorSliderState requires a value or defaultValue');
  }
  let numberFormatter = useNumberFormatter();

  let [color, setColor] = useControlledState(value && normalizeColor(value), defaultValue && normalizeColor(defaultValue), onChange);

  let sliderState = useSliderState({
    ...Color.getRange(channel),
    ...otherProps,
    numberFormatter,
    value: [color.getChannelValue(channel)],
    onChange([v]) {
      setColor(color.withChannelValue(channel, v));
    }
  });

  return {
    ...sliderState,
    value: color,
    setValue(value) {
      setColor(normalizeColor(value));
    },
    getDisplayColor(c: Color = color) {
      switch (channel) {
        case 'hue':
          return new Color(`hsl(${c.getChannelValue('hue')}, 100%, 50%)`);
        case 'lightness':
          c = c.withChannelValue('saturation', 0);
        case 'brightness':
        case 'saturation':
        case 'red':
        case 'green':
        case 'blue':
          return c.withChannelValue('alpha', 1);
        case 'alpha': {
          return c;
        }
        default:
          throw new Error('Unknown color channel: ' + channel);
      }
    }
  };
}
