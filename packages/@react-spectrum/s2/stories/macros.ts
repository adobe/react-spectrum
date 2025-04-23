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
      border: '[0 0 0 1px #333]'
    } as const)[variant],
    forcedColors: '[0 0 0 1px ButtonBorder]'
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
  color: iconColor || '[lch(from self(backgroundColor) calc((61 - l) * infinity) 0 0)]' as const,
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
} as const);
