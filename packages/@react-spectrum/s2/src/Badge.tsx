/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaLabelingProps, DOMProps, DOMRef, DOMRefValue} from '@react-types/shared';
import {centerBaseline} from './CenterBaseline';
import {centerPadding, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {ContextValue, Provider, SlotProps} from 'react-aria-components';
import {filterDOMProps} from '@react-aria/utils';
import {fontRelative, style} from '../style/spectrum-theme' with {type: 'macro'};
import {IconContext} from './Icon';
import React, {createContext, forwardRef, ReactNode} from 'react';
import {Text, TextContext} from './Content';
import {useDOMRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface BadgeStyleProps {
  /**
   * The size of the badge.
   * 
   * @default 'S'
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /**
   * The variant changes the background color of the badge. When badge has a semantic meaning, they should use the variant for semantic colors.
   * 
   * @default 'neutral'
   */
  variant?: 'accent' | 'informative' | 'neutral' | 'positive' | 'notice' | 'negative' | 'gray' | 'red' | 'orange' | 'yellow' | 'charteuse' | 'celery' | 'green' | 'seafoam' | 'cyan' | 'blue' | 'indigo' | 'purple' | 'fuchsia' | 'magenta' | 'pink' | 'turquoise' | 'brown' | 'cinnamon' | 'silver',
  /**
   * The fill of the badge.
   * @default 'bold'
   */
  fillStyle?: 'bold' | 'subtle' | 'outline'
}

export interface BadgeProps extends DOMProps, AriaLabelingProps, StyleProps, BadgeStyleProps, SlotProps {
  /**
   * The content to display in the badge.
   */
  children: ReactNode
}

export const BadgeContext = createContext<ContextValue<Partial<BadgeProps>, DOMRefValue<HTMLDivElement>>>(null);

const badge = style<BadgeStyleProps>({
  display: 'flex',
  font: 'control',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 'control',
  minHeight: 'control',
  paddingX: {
    default: 'edge-to-text',
    ':has([slot=icon]:only-child)': 0
  },
  '--labelPadding': {
    type: 'paddingTop',
    value: centerPadding()
  },
  aspectRatio: {
    ':has([slot=icon]:only-child)': 'square'
  },
  '--iconMargin': {
    type: 'marginTop',
    value: {
      default: fontRelative(-2),
      ':has([slot=icon]:only-child)': 0
    }
  },
  columnGap: 'text-to-visual',
  color: {
    fillStyle: {
      bold: {
        default: 'white',
        variant: {
          notice: 'black',
          orange: 'black',
          yellow: 'black',
          charteuse: 'black',
          celery: 'black'
        }
      },
      subtle: 'gray-1000',
      outline: 'gray-1000'
    }
  },
  backgroundColor: {
    fillStyle: {
      bold: {
        variant: {
          accent: 'accent',
          informative: 'informative',
          neutral: 'neutral-subdued',
          positive: 'positive',
          notice: 'notice',
          negative: 'negative',
          gray: 'gray',
          red: 'red',
          orange: 'orange',
          yellow: 'yellow',
          charteuse: 'chartreuse',
          celery: 'celery',
          green: 'green',
          seafoam: 'seafoam',
          cyan: 'cyan',
          blue: 'blue',
          indigo: 'indigo',
          purple: 'purple',
          fuchsia: 'fuchsia',
          magenta: 'magenta',
          pink: 'pink',
          turquoise: 'turquoise',
          brown: 'brown',
          cinnamon: 'cinnamon',
          silver: 'silver'
        }
      },
      subtle: {
        variant: {
          accent: 'accent-200',
          informative: 'informative-subtle',
          neutral: 'neutral-subtle',
          positive: 'positive-subtle',
          notice: 'notice-subtle',
          negative: 'negative-subtle',
          gray: 'gray-100',
          red: 'red-200',
          orange: 'orange-200',
          yellow: 'yellow-200',
          charteuse: 'chartreuse-200',
          celery: 'celery-200',
          green: 'green-200',
          seafoam: 'seafoam-200',
          cyan: 'cyan-200',
          blue: 'blue-200',
          indigo: 'indigo-200',
          purple: 'purple-200',
          fuchsia: 'fuchsia-200',
          magenta: 'magenta-200',
          pink: 'pink-200',
          turquoise: 'turquoise-200',
          brown: 'brown-200',
          cinnamon: 'cinnamon-200',
          silver: 'silver-200'
        }
      },
      outline: 'gray-25'
    }
  },
  borderStyle: 'solid',
  boxSizing: 'border-box',
  borderWidth: 2,
  borderColor: {
    default: 'transparent',
    fillStyle: {
      outline: {
        variant: {
          accent: 'accent-800',
          informative: 'informative-800',
          neutral: 'gray-700',
          positive: 'positive-700',
          notice: 'notice-700',
          negative: 'negative-800',
        }
      }
    }
  },
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
}, getAllowedOverrides());

function Badge(props: BadgeProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, BadgeContext);
  let {
    children,
    variant = 'neutral',
    size = 'S',
    fillStyle = 'bold',
    ...otherProps
  } = props; // useProviderProps(props) in v3
  let domRef = useDOMRef(ref);
  let isTextOnly = React.Children.toArray(props.children).every(c => !React.isValidElement(c));

  return (
    <Provider
      values={[
        [TextContext, {styles: style({paddingY: '--labelPadding', order: 1})}],
        [IconContext, {
          render: centerBaseline({slot: 'icon', styles: style({order: 0})}),
          styles: style({size: fontRelative(20), marginStart: '--iconMargin', flexShrink: 0})
        }]
      ]}>
      <span
        {...filterDOMProps(otherProps)}
        role="presentation"
        className={(props.UNSAFE_className || '') + badge({variant, size, fillStyle}, props.styles)}
        ref={domRef}>
        {
          typeof children === 'string' || isTextOnly
            ? <Text>{children}</Text>
            : children
        }
      </span>
    </Provider>
  );
}

/**
 * Badges are used for showing a small amount of color-categorized metadata, ideal for getting a user's attention.
 */
let _Badge = forwardRef(Badge);
export {_Badge as Badge};
