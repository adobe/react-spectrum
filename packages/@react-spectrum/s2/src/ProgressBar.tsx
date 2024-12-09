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
import {DOMRef, DOMRefValue, LabelPosition} from '@react-types/shared';
import {FieldLabel} from './Field';
import {fieldLabel, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {keyframes} from '../style/style-macro' with {type: 'macro'};
import {mergeStyles} from '../style/runtime';
import {style} from '../style' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';
import {useLocale} from '@react-aria/i18n';
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

export interface ProgressBarProps extends Omit<AriaProgressBarProps, 'children' | 'className' | 'style'>, ProgressBarStyleProps, StyleProps {
  /** The content to display as the label. */
  label?: ReactNode
}

export const ProgressBarContext = createContext<ContextValue<ProgressBarProps, DOMRefValue<HTMLDivElement>>>(null);

const indeterminateLTR = keyframes(`
  0% {
    transform:  translateX(-70%) scaleX(0.7);
  }
  100% {
    transform:  translateX(100%) scaleX(0.7);
  }
`);

const indeterminateRTL = keyframes(`
  0% {
    transform:  translateX(100%) scaleX(0.7);
  }
  100% {
    transform:  translateX(-70%) scaleX(0.7);
  }
`);

const wrapper = style({
  ...bar(),
  gridTemplateColumns: {
    default: {
      labelPosition: {
        top: ['1fr', 'auto'],
        side: ['auto', '1fr']
      }
    },
    isIndeterminate: {
      labelPosition: {
        top: ['1fr'],
        side: ['auto', '1fr']
      }
    }
  },
  gridTemplateAreas: {
    default: {
      labelPosition: {
        top: [
          'label value',
          'bar bar'
        ],
        side: [
          'label bar value'
        ]
      }
    },
    isIndeterminate: {
      labelPosition: {
        top: [
          'label',
          'bar'
        ],
        side: [
          'label bar'
        ]
      }
    }
  }
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

const fill = style<ProgressBarStyleProps & {isStaticColor: boolean}>({
  height: 'full',
  borderStyle: 'none',
  borderRadius: 'full',
  backgroundColor: {
    default: 'accent',
    isStaticColor: 'transparent-overlay-900',
    forcedColors: 'ButtonText'
  },
  width: {
    isIndeterminate: 'full'
  },
  transformOrigin: {
    isIndeterminate: 'left'
  }
});

const indeterminateAnimation = style({
  animation: {
    direction: {
      ltr: indeterminateLTR,
      rtl: indeterminateRTL
    }
  },
  animationDuration: 1000,
  animationIterationCount: 'infinite',
  animationTimingFunction: 'in-out',
  willChange: 'transform',
  position: 'relative'
});

/**
 * ProgressBars show the progression of a system operation: downloading, uploading, processing, etc., in a visual way.
 * They can represent either determinate or indeterminate progress.
 */
export const ProgressBar = /*#__PURE__*/ forwardRef(function ProgressBar(props: ProgressBarProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, ProgressBarContext);
  let {
    label, size = 'M',
    staticColor,
    isIndeterminate,
    labelPosition = 'top',
    UNSAFE_style,
    UNSAFE_className = ''
  } = props;
  let domRef = useDOMRef(ref);
  let {direction} = useLocale();
  let isStaticColor = !!staticColor;

  return (
    <AriaProgressBar
      {...props}
      ref={domRef}
      style={UNSAFE_style}
      className={UNSAFE_className + wrapper({...props, size, labelPosition, staticColor}, props.styles)}>
      {({percentage, valueText}) => (
        <>
          {label && <FieldLabel size={size} labelAlign="start" labelPosition={labelPosition} staticColor={staticColor}>{label}</FieldLabel>}
          {label && !isIndeterminate && <span className={valueStyles({size, labelAlign: 'end', isStaticColor})}>{valueText}</span>}
          <div className={trackStyles({isStaticColor, size})}>
            <div
              className={mergeStyles(fill({...props, isStaticColor}), (isIndeterminate ? indeterminateAnimation({direction}) : null))}
              style={{width: isIndeterminate ? undefined : percentage + '%'}} />
          </div>
        </>
      )}
    </AriaProgressBar>
  );
});

