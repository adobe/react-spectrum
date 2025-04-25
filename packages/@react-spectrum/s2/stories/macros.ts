/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

interface ContainerOptions {
  variant?: 'default' | 'emphasized' | 'border',
  padding?: 8 | 12 | 16 | 24 | 32 | 40,
  borderRadius?: 'default' | 'sm' | 'lg' | 'xl'
}

export const container = ({variant = 'default', padding = 16, borderRadius = 'default'}: ContainerOptions = {}) => ({
  '--s2-container-bg': {
    type: 'backgroundColor',
    value: {
      default: ({
        default: 'layer-1',
        emphasized: 'elevated',
        border: '[inherit]'
      } as const)[variant],
      forcedColors: 'ButtonFace'
    }
  },
  backgroundColor: ({
    default: '--s2-container-bg',
    emphasized: '--s2-container-bg',
    border: 'transparent'
  } as const)[variant],
  boxShadow: {
    default: ({
      default: 'none',
      emphasized: 'emphasized',
      border: 'none'
    } as const)[variant]
  },
  borderStyle: 'solid',
  borderColor: {
    default: 'gray-100',
    forcedColors: 'ButtonBorder'
  },
  borderWidth: {
    default: variant === 'border' ? 1 as const : 0 as const,
    forcedColors: 1
  },
  padding,
  boxSizing: 'border-box',
  borderRadius,
  forcedColorAdjust: 'none'
} as const);


export const hstack = (gap: 0 | 2 | 4 | 8 | 12 | 16 | 20 | 24 | 28 | 32 | 36 | 40 | 44 | 48 | 56 | 64 | 80 | 96) => ({
  display: 'flex',
  flexDirection: 'row',
  columnGap: gap
} as const);

export const vstack = (gap: 0 | 2 | 4 | 8 | 12 | 16 | 20 | 24 | 28 | 32 | 36 | 40 | 44 | 48 | 56 | 64 | 80 | 96) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: gap
} as const);

export const centerChildren = () => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
} as const);

interface IconContainerOptions<C, I> {
  color: C,
  iconColor?: I,
  shape?: 'circle' | 'square',
  size?: number
}

export const iconContainer = <C, I>({color, iconColor, size = 32, shape = 'square'}: IconContainerOptions<C, I>) => ({
  ...centerChildren(),
  size,
  backgroundColor: color,
  borderRadius: shape === 'square' ? 'default' : 'full',
  '--iconPrimary': {
    type: 'fill',
    value: iconColor || '[lch(from self(backgroundColor) calc((61 - l) * infinity) 0 0)]' as const
  }
} as const);

export const gradientBorder = (border: string | [LinearGradient], width: 1 | 2 | 4 = 1) => {
  let stopVars: {[K in `--${string}`]: {type: 'borderColor', value: string}} = {};
  let grad = '';
  if (typeof border === 'object') {
    let i = 0;
    for (let stop of border[0].stops) {
      stopVars[`--bg${i++}`] = {
        type: 'borderColor',
        value: stop[0]
      };
    }
    grad = `linear-gradient(${border[0].angle}, ${border[0].stops.map(([, stop], i) => `var(--bg${i}) ${stop}%`)})`;
  } else {
    grad = border;
  }

  return {
    ...stopVars,
    borderWidth: width,
    borderStyle: 'solid',
    borderColor: {
      default: 'transparent',
      forcedColors: 'ButtonBorder'
    },
    backgroundImage: `linear-gradient(self(backgroundColor), self(backgroundColor)), ${grad}`,
    backgroundClip: '[padding-box, border-box]',
    backgroundOrigin: 'border-box'
  } as const;
};

interface LinearGradient {
  type: 'linear-gradient',
  angle: string,
  stops: [string, number][]
}
