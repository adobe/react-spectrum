/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
*/

import {Color} from '@react-types/color';
import {CSSProperties, useMemo} from 'react';
import {parseColor} from '@react-stately/color';

const hue = (color: Color) => [0, 60, 120, 180, 240, 300, 360].map(hue => color.withChannelValue('hue', hue).toString('css')).join(', ');
const saturation = (color: Color) => `${color.withChannelValue('saturation', 0)}, transparent`;

const hslChannels = {
  hue,
  saturation,
  lightness: () => 'black, transparent, white'
};

const hsbChannels = {
  hue,
  saturation,
  brightness: () => 'black, transparent'
};

interface Gradients {
  colorAreaStyleProps: {
    style: CSSProperties
  },
  thumbStyleProps: {
    style: CSSProperties
  }
}

export function useColorAreaGradient({direction, state, zChannel, xChannel, yChannel}): Gradients {
  let returnVal = useMemo<Gradients>(() => {
    let end = direction === 'rtl' ? 'left' : 'right';
    let colorAreaStyles = {};
    let zValue = state.value.getChannelValue(zChannel);

    switch (state.value.getColorSpace()) {
      case 'rgb': {
        let rgb = parseColor('rgb(0, 0, 0)');
        colorAreaStyles = {
          background: [
            // The screen blend mode multiplies the inverse of each channel, e.g. 1 - (1 - a) * (1 - b).
            // Create a layer for each channel, with the other channels as 0. After blending, this should
            // result in the gradients being combined channel by channel.
            `linear-gradient(to ${end}, ${rgb.withChannelValue(xChannel, 0)}, ${rgb.withChannelValue(xChannel, 255)})`,
            `linear-gradient(to top, ${rgb.withChannelValue(yChannel, 0)}, ${rgb.withChannelValue(yChannel, 255)})`,
            rgb.withChannelValue(zChannel, zValue)
          ].join(','),
          backgroundBlendMode: 'screen'
        };
        break;
      }
      case 'hsl': {
        let channels = state.value.getColorChannels();
        let value = parseColor('hsl(0, 100%, 50%)').withChannelValue(zChannel, zValue);

        let bg = channels
          .filter(c => c !== zChannel)
          .map(c => `linear-gradient(to ${c === xChannel ? end : 'top'}, ${hslChannels[c](value)})`)
          .reverse();
        if (zChannel === 'hue') {
          bg.push(value.toString('css'));
        }
    
        colorAreaStyles = {
          background: bg.join(', ')
        };
        break;
      }
      case 'hsb': {
        let channels = state.value.getColorChannels();
        let value = parseColor('hsb(0, 100%, 100%)').withChannelValue(zChannel, zValue);

        let bg = channels
          .filter(c => c !== zChannel)
          .map(c => `linear-gradient(to ${c === xChannel ? end : 'top'}, ${hsbChannels[c](value)})`)
          .reverse();
        if (zChannel === 'hue') {
          bg.push(value.toString('css'));
        }
    
        colorAreaStyles = {
          background: bg.join(', ')
        };
        break;
      }
    }

    let {x, y} = state.getThumbPosition();

    if (direction === 'rtl') {
      x = 1 - x;
    }

    let forcedColorAdjustNoneStyle = {forcedColorAdjust: 'none'};

    return {
      colorAreaStyleProps: {
        style: {
          position: 'relative',
          touchAction: 'none',
          ...forcedColorAdjustNoneStyle,
          ...colorAreaStyles
        }
      },
      thumbStyleProps: {
        style: {
          position: 'absolute',
          left: `${x * 100}%`,
          top: `${y * 100}%`,
          transform: 'translate(-50%, -50%)',
          touchAction: 'none',
          ...forcedColorAdjustNoneStyle
        }
      }
    };
  }, [direction, state, zChannel, xChannel, yChannel]);

  return returnVal;
}

