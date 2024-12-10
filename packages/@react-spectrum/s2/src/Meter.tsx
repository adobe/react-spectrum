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

import {
  Meter as AriaMeter,
  MeterProps as AriaMeterProps,
  ContextValue
} from 'react-aria-components';
import {bar, track} from './bar-utils'  with {type: 'macro'};
import {createContext, forwardRef, ReactNode} from 'react';
import {DOMRef, DOMRefValue, LabelPosition} from '@react-types/shared';
import {FieldLabel} from './Field';
import {fieldLabel, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {lightDark, style} from '../style' with {type: 'macro'};
import {SkeletonWrapper} from './Skeleton';
import {Text} from './Content';
import {useDOMRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

interface MeterStyleProps {
  /** The [visual style](https://spectrum.adobe.com/page/meter/#-Options) of the Meter.
   * @default 'informative'
   */
  variant?: 'informative' | 'positive' | 'notice' | 'negative',
  /**
   * The size of the Meter.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /**
   * The static color style to apply. Useful when the button appears over a color background.
   */
  staticColor?: 'white' | 'black' | 'auto',
  /**
   * The label's overall position relative to the element it is labeling.
   * @default 'top'
   */
  labelPosition?: LabelPosition
}

export interface MeterProps extends Omit<AriaMeterProps, 'children' | 'className' | 'style'>, MeterStyleProps, StyleProps {
  /** The content to display as the label. */
  label?: ReactNode
}

export const MeterContext = createContext<ContextValue<MeterProps, DOMRefValue<HTMLDivElement>>>(null);

const wrapper = style({
  ...bar()
}, getAllowedOverrides());

const valueStyles = style({
  ...fieldLabel(),
  gridArea: 'value'
});

const trackStyles = style({
  ...track(),
  height: {
    default: 6,
    size: {
      S: 4, // progress-bar-thickness-small
      M: 6, // progress-bar-thickness-medium
      L: 8, // progress-bar-thickness-large
      XL: 10 // progress-bar-thickness-extra-large
    }
  }
});

const fillStyles = style<MeterStyleProps & {isStaticColor: boolean}>({
  height: 'full',
  borderStyle: 'none',
  borderRadius: 'full',
  backgroundColor: {
    default: lightDark('informative-800', 'informative-900'), // 'informative-visual',
    variant: {
      positive: lightDark('positive-800', 'positive-900'), // 'positive-visual',
      notice: lightDark('notice-800', 'notice-900'), // 'notice-visual',
      negative: lightDark('negative-800', 'negative-900') // 'negative-visual'
    },
    isStaticColor: 'transparent-overlay-900',
    forcedColors: 'ButtonText'
  }
});

/**
 * Meters are visual representations of a quantity or an achievement.
 * Their progress is determined by user actions, rather than system actions.
 */
export const Meter = forwardRef(function Meter(props: MeterProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, MeterContext);
  let domRef = useDOMRef(ref);

  let {
    label,
    size = 'M',
    staticColor,
    styles,
    UNSAFE_className = '',
    UNSAFE_style,
    variant = 'informative',
    labelPosition = 'top',
    ...groupProps
  } = props;
  let isStaticColor = !!staticColor;

  return (
    <AriaMeter
      {...groupProps}
      ref={domRef}
      style={UNSAFE_style}
      className={UNSAFE_className + wrapper({
        size,
        variant,
        staticColor,
        labelPosition
      }, styles)}>
      {({percentage, valueText}) => (
        <>
          {label && <FieldLabel size={size} labelAlign="start" labelPosition={labelPosition} staticColor={staticColor}>{label}</FieldLabel>}
          {label && <Text styles={valueStyles({size, labelAlign: 'end', isStaticColor})}>{valueText}</Text>}
          <SkeletonWrapper>
            <div className={trackStyles({isStaticColor, size})}>
              <div className={fillStyles({isStaticColor, variant})} style={{width: percentage + '%'}} />
            </div>
          </SkeletonWrapper>
        </>
      )}
    </AriaMeter>
  );
});
