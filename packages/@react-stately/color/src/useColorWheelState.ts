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
import {ColorWheelProps, ColorWheelState} from '@react-types/color';
import {useControlledState} from '@react-stately/utils';
import {useState} from 'react';

function normalizeColor(v: string | Color) {
  if (typeof v === 'string') {
    return new Color(v);
  } else {
    return v;
  }
}

const DEFAULT_COLOR = new Color('hsl(0, 100%, 50%)');

export function useColorWheelState(props: ColorWheelProps): ColorWheelState {
  let {value, defaultValue, onChange} = props;

  if (!value && !defaultValue) {
    defaultValue = DEFAULT_COLOR;
  }

  let [state, setState] = useControlledState(normalizeColor(value), normalizeColor(defaultValue), onChange);

  let [dragging, setDragging] = useState(false);

  return {
    value: state,
    setValue(value) {
      setState(normalizeColor(value));
    },

    hue: state.getChannelValue('hue'),
    setHue(value) {
      if (state.getChannelValue('hue') !== value) {
        setState(state.withChannelValue('hue', value));
      }
    },

    setDragging(value) {
      setDragging(value);
    },
    dragging
  };
}
