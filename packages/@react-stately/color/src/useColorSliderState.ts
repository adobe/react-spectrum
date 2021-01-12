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
import {ColorSliderProps, Color as IColor} from '@react-types/color';
import {SliderState, useSliderState} from '@react-stately/slider';
import {useControlledState} from '@react-stately/utils';

export interface ColorSliderState extends SliderState {
  value: IColor,
  setValue(value: string | IColor): void,
  /** Returns the color that should be displayed in the slider instead of `value` or the optional parameter. */
  getDisplayColor(c?: IColor): IColor
}


interface ColorSliderStateOptions extends ColorSliderProps {
  numberFormatter: Intl.NumberFormat
}

function normalizeColor(v: string | IColor) {
  if (typeof v === 'string') {
    return new Color(v);
  } else {
    return v;
  }
}

export function useColorSliderState(props: ColorSliderStateOptions): ColorSliderState {
  let {channel, value, defaultValue, onChange, numberFormatter, ...otherProps} = props;
  if (value == null && defaultValue == null) {
    throw new Error('useColorSliderState requires a value or defaultValue');
  }

  let [color, setColor] = useControlledState(value && normalizeColor(value), defaultValue && normalizeColor(defaultValue), onChange);

  let sliderState = useSliderState({
    ...Color.getRange(channel),
    ...otherProps,
    numberFormatter,
    value: [color.getChannelValue(channel)],
    onChange([v]) {
      setColor(color.withChannelValue(channel, v));
    },
    onChangeEnd([v]) {
      // onChange will have already been called with the right value, this is just to trigger onChangEnd
      if (props.onChangeEnd) {
        props.onChangeEnd(color.withChannelValue(channel, v));
      }
    }
  });

  return {
    ...sliderState,
    value: color,
    setValue(value) {
      setColor(normalizeColor(value));
    },
    getDisplayColor(c: IColor = color) {
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
