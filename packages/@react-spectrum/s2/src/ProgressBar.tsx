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
  ProgressBar as AriaProgressBar,
  ProgressBarProps as AriaProgressBarProps,
  ContextValue
} from 'react-aria-components';
import {bar, track} from './bar-utils'  with {type: 'macro'};
import {createContext, forwardRef, ReactNode} from 'react';
import {DOMRef, DOMRefValue} from '@react-types/shared';
import {FieldLabel} from './Field';
import {fieldLabel, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {keyframes} from '../style/style-macro' with {type: 'macro'};
import {mergeStyles} from '../style/runtime';
import {size, style} from '../style/spectrum-theme' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

interface ProgressBarStyleProps {
  /**
   * The size of the ProgressBar.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /**
   * Whether presentation is indeterminate when progress isn't known.
   */
  isIndeterminate?: boolean,
  /** The static color style to apply. Useful when the button appears over a color background. */
  staticColor?: 'white' | 'black'
}

export interface ProgressBarProps extends Omit<AriaProgressBarProps, 'children' | 'className' | 'style'>, ProgressBarStyleProps, StyleProps {
  /** The content to display as the label. */
  label?: ReactNode
}

export const ProgressBarContext = createContext<ContextValue<ProgressBarProps, DOMRefValue<HTMLDivElement>>>(null);

// TODO:
// var(--spectrum-global-dimension-size-1700) -> 136px
// var(--spectrum-global-dimension-size-2400) -> 192px
const indeterminate = keyframes(`
  from {
    transform: translate(calc(136px * -1));
  }

  to {
    transform: translate(192px);
  }
`);

const wrapper = style<ProgressBarStyleProps>({
  ...bar(),
  width: {
    default: 192
  }
}, getAllowedOverrides());

const valueStyles = style({
  ...fieldLabel(),
  gridArea: 'value'
});

const trackStyles = style({
  ...track(),
  height: {
    default: size(6),
    size: {
      S: 4, // progress-bar-thickness-small
      M: size(6), // progress-bar-thickness-medium
      L: 8, // progress-bar-thickness-large
      XL: size(10) // progress-bar-thickness-extra-large
    }
  }
});

const fill = style<ProgressBarStyleProps>({
  height: 'full',
  borderStyle: 'none',
  backgroundColor: {
    default: 'accent',
    staticColor: {
      white: {
        default: 'transparent-white-900'
      },
      // TODO: Is there a black static color in S2?
      black: {
        default: 'transparent-black-900'
      }
    },
    forcedColors: 'ButtonText'
  },
  transition: '[width]',
  transitionDuration: 1000
});

const indeterminateAnimation = style({
  animation: indeterminate,
  animationDuration: 1000,
  animationIterationCount: 'infinite',
  animationTimingFunction: 'in-out',
  willChange: 'transform',
  position: 'relative'
});

function ProgressBar(props: ProgressBarProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, ProgressBarContext);
  let {label, size = 'M', staticColor, isIndeterminate, UNSAFE_style, UNSAFE_className = ''} = props;
  let domRef = useDOMRef(ref);
  return (
    <AriaProgressBar
      {...props}
      ref={domRef}
      style={UNSAFE_style}
      className={UNSAFE_className + wrapper({...props, size}, props.styles)}>
      {({percentage, valueText}) => (
        <>
          {label && <FieldLabel size={size} labelAlign="start" labelPosition="top" staticColor={staticColor}>{label}</FieldLabel>}
          {label && <span className={valueStyles({size, labelAlign: 'end', staticColor})}>{valueText}</span>}
          <div className={trackStyles({...props})}>
            <div
              className={mergeStyles(fill({...props, staticColor}), (isIndeterminate ? indeterminateAnimation : null))}
              style={{width: isIndeterminate ? `${100 * (136 / 192)}%` : percentage + '%'}} />
          </div>
        </>
      )}
    </AriaProgressBar>
  );
}

/**
 * ProgressBars show the progression of a system operation: downloading, uploading, processing, etc., in a visual way.
 * They can represent either determinate or indeterminate progress.
 */
const _ProgressBar = /*#__PURE__*/ forwardRef(ProgressBar);
export {_ProgressBar as ProgressBar};

