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
  Radio as AriaRadio,
  RadioProps as AriaRadioProps,
  RadioRenderProps
} from 'react-aria-components';
import {baseColor, focusRing, style} from '../style' with {type: 'macro'};
import {CenterBaseline} from './CenterBaseline';
import {FocusableRef} from '@react-types/shared';
import {FormContext, useFormProps} from './Form';
import {forwardRef, ReactNode, useContext, useRef} from 'react';
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {pressScale} from './pressScale';
import {useFocusableRef} from '@react-spectrum/utils';

export interface RadioProps extends Omit<AriaRadioProps, 'className' | 'style' | 'children' | 'onHover' | 'onHoverStart' | 'onHoverEnd' | 'onHoverChange'>, StyleProps {
  /**
   * The label for the element.
   */
  children?: ReactNode
}

interface ContextProps {
  /**
   * The size of the Radio.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /**
   * Whether the Radio within a RadioGroup should be displayed with an emphasized style.
   */
  isEmphasized?: boolean
}

interface RadioContextProps extends RadioProps, ContextProps {}

interface RenderProps extends RadioRenderProps, ContextProps {}

const wrapper = style({
  display: 'flex',
  columnGap: 'text-to-control',
  alignItems: 'baseline',
  font: 'control',
  transition: 'colors',
  color: {
    default: 'neutral',
    isDisabled: {
      default: 'disabled',
      forcedColors: 'GrayText'
    }
  },
  gridColumnStart: {
    isInForm: 'field'
  },
  disableTapHighlight: true
}, getAllowedOverrides());

const circle = style<RenderProps>({
  ...focusRing(),
  size: 'control-sm',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'default',
  borderRadius: 'full',
  borderStyle: 'solid',
  boxSizing: 'border-box',
  borderWidth: {
    default: 2,
    isSelected: '[calc((self(height) - 4px) / 2)]'
  },
  forcedColorAdjust: 'none',
  backgroundColor: 'gray-25',
  borderColor: {
    default: baseColor('gray-800'),
    forcedColors: 'ButtonBorder',
    isSelected: {
      isEmphasized: baseColor('accent-900'),
      forcedColors: 'Highlight'
    },
    isInvalid: {
      default: 'negative',
      forcedColors: 'Mark'
    },
    isDisabled: {
      default: 'gray-400',
      forcedColors: 'GrayText'
    }
  }
});

/**
 * Radio buttons allow users to select a single option from a list of mutually exclusive options.
 * All possible options are exposed up front for users to compare.
 */
export const Radio = /*#__PURE__*/ forwardRef(function Radio(props: RadioProps, ref: FocusableRef<HTMLLabelElement>) {
  let {children, UNSAFE_className = '', UNSAFE_style} = props;
  let circleRef = useRef(null);
  let inputRef = useRef<HTMLInputElement | null>(null);
  let domRef = useFocusableRef(ref, inputRef);
  let isInForm = !!useContext(FormContext);
  let {
    size = 'M',
    ...allProps
  } = useFormProps<RadioContextProps>(props);

  return (
    <AriaRadio
      {...allProps}
      ref={domRef}
      inputRef={inputRef}
      style={UNSAFE_style}
      className={renderProps => UNSAFE_className + wrapper({...renderProps, isInForm, size}, allProps.styles)}>
      {renderProps => (
        <>
          <CenterBaseline>
            <div
              ref={circleRef}
              style={pressScale(circleRef)(renderProps)}
              className={circle({
                ...renderProps,
                isEmphasized: allProps.isEmphasized,
                isSelected: renderProps.isSelected,
                size
              })} />
          </CenterBaseline>
          {children}
        </>
      )}
    </AriaRadio>
  );
});
