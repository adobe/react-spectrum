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

import {ContextValue, ProgressBar as RACProgressBar, ProgressBarProps as RACProgressBarProps} from 'react-aria-components';
import {createContext, forwardRef} from 'react';
import {DOMRef, DOMRefValue, GlobalDOMAttributes} from '@react-types/shared';
import {getAllowedOverrides, staticColor, StylesPropWithHeight, UnsafeStyles} from './style-utils' with {type: 'macro'};
import {keyframes} from '../style/style-macro' with {type: 'macro'};
import {pxToRem} from './progress-utils' with {type: 'macro'};
import {style} from '../style' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

const pxToRemDynamic = (px: number): string => (px / 16) + 'rem';
export interface ProgressCircleStyleProps {
  /**
   * The size of the ProgressCircle.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L',
  /** The static color style to apply. Useful when the button appears over a color background. */
  staticColor?: 'black' | 'white' | 'auto',
  /**
   * Whether presentation is indeterminate when progress isn't known.
   */
  isIndeterminate?: boolean
}

export const ProgressCircleContext = createContext<ContextValue<Partial<ProgressCircleProps>, DOMRefValue<HTMLDivElement>>>(null);

// Double check the types passed to each style, may not need all for each
const wrapper = style<ProgressCircleStyleProps>({
  ...staticColor(),
  size: {
    default: 32,
    size: {
      S: 16,
      L: 64
    }
  },
  aspectRatio: 'square'
}, getAllowedOverrides({height: true}));

const track = style({
  stroke: {
    default: 'gray-300',
    isStaticColor: 'transparent-overlay-300',
    forcedColors: 'Background'
  },
  strokeWidth: {
    default: `[${pxToRem(3)}]`,
    size: {
      S: `[${pxToRem(2)}]`,
      L: `[${pxToRem(4)}]`
    },
    forcedColors: {
      default: `[${pxToRem(2)}]`,
      size: {
        S: `[${pxToRem(1)}]`,
        L: `[${pxToRem(3)}]`
      }
    }
  }
});

const fill = style({
  stroke: {
    default: 'blue-900',
    isStaticColor: 'transparent-overlay-900',
    forcedColors: 'ButtonText'
  },
  rotate: -90,
  transformOrigin: 'center',
  strokeWidth: {
    default: `[${pxToRem(3)}]`,
    size: {
      S: `[${pxToRem(2)}]`,
      L: `[${pxToRem(4)}]`
    }
  }
});

const hcmStroke = style({
  stroke: {
    default: 'transparent',
    forcedColors: 'ButtonText'
  },
  strokeWidth: {
    default: `[${pxToRem(3)}]`,
    size: {
      S: `[${pxToRem(2)}]`,
      L: `[${pxToRem(4)}]`
    }
  }
});

export interface ProgressCircleProps extends Omit<RACProgressBarProps, 'children' | 'style' | 'valueLabel' | 'formatOptions' | 'label' | 'className' | keyof GlobalDOMAttributes>, ProgressCircleStyleProps, UnsafeStyles {
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight
}

const rotationAnimation = keyframes(`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
`);

// stroke-dashoffset represents `100 - percentage`. See below for how this works.
const dashoffsetAnimation = keyframes(`
  0%, 100% {
    stroke-dashoffset: 75;
  }

  30% {
    stroke-dashoffset: 20;
  }
`);

/**
 * ProgressCircles show the progression of a system operation such as downloading, uploading, or processing, in a visual way.
 * They can represent determinate or indeterminate progress.
 */
export const ProgressCircle = /*#__PURE__*/ forwardRef(function ProgressCircle(props: ProgressCircleProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, ProgressCircleContext);
  let {
    size = 'M',
    staticColor,
    UNSAFE_style,
    UNSAFE_className = ''
  } = props;
  let domRef = useDOMRef(ref);

  let strokeWidth = 3;
  if (size === 'S') {
    strokeWidth = 2;
  } else if (size === 'L') {
    strokeWidth = 4;
  }

  // SVG strokes are centered, so subtract half the stroke width from the radius to create an inner stroke.
  let radius = `calc(50% - ${pxToRemDynamic(strokeWidth / 2)})`;
  let isStaticColor = !!staticColor;

  return (
    <RACProgressBar
      {...props}
      ref={domRef}
      style={UNSAFE_style}
      className={renderProps => UNSAFE_className + wrapper({
        ...renderProps,
        size,
        staticColor
      }, props.styles)}>
      {({percentage, isIndeterminate}) => (
        <svg
          fill="none"
          width="100%"
          height="100%">
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            className={hcmStroke({size})} />
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            className={track({isStaticColor, size})} />
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            className={fill({isStaticColor, size})}
            style={{
              // These cubic-bezier timing functions were derived from the previous animation keyframes
              // using a best fit algorithm, and then manually adjusted to approximate the original animation.
              animation: isIndeterminate ? `${rotationAnimation} 1s cubic-bezier(.6, .1, .3, .9) infinite, ${dashoffsetAnimation} 1s cubic-bezier(.25, .1, .25, 1.3) infinite` : undefined
            }}
            // Normalize the path length to 100 so we can easily set stroke-dashoffset to a percentage.
            pathLength="100"
            // Add extra gap between dashes so 0% works in Chrome.
            strokeDasharray="100 200"
            strokeDashoffset={isIndeterminate || percentage == null ? undefined : 100 - percentage}
            strokeLinecap="round" />
        </svg>
      )}
    </RACProgressBar>
  );
});
