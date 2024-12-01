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

import {Checkbox as AriaCheckbox, CheckboxProps as AriaCheckboxProps, CheckboxGroupStateContext, CheckboxRenderProps, ContextValue, useSlottedContext} from 'react-aria-components';
import {baseColor, focusRing, style} from '../style' with {type: 'macro'};
import {CenterBaseline} from './CenterBaseline';
import CheckmarkIcon from '../ui-icons/Checkmark';
import {createContext, forwardRef, ReactNode, useContext, useRef} from 'react';
import DashIcon from '../ui-icons/Dash';
import {FocusableRef, FocusableRefValue} from '@react-types/shared';
import {FormContext, useFormProps} from './Form';
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {pressScale} from './pressScale';
import {useFocusableRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

interface CheckboxStyleProps {
  /**
   * The size of the Checkbox.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /** Whether the Checkbox should be displayed with an emphasized style. */
  isEmphasized?: boolean
}

interface RenderProps extends CheckboxRenderProps, CheckboxStyleProps {}

export interface CheckboxProps extends Omit<AriaCheckboxProps, 'className' | 'style' | 'children' | 'onHover' | 'onHoverStart' | 'onHoverEnd' | 'onHoverChange'>, StyleProps, CheckboxStyleProps {
  /** The label for the element. */
  children?: ReactNode
}

export const CheckboxContext = createContext<ContextValue<CheckboxProps, FocusableRefValue<HTMLLabelElement>>>(null);

const wrapper = style({
  display: 'flex',
  columnGap: 'text-to-control',
  alignItems: 'baseline',
  width: 'fit',
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

export const box = style<RenderProps>({
  ...focusRing(),
  size: 'control-sm',
  borderRadius: 'control-sm',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,
  boxSizing: 'border-box',
  borderStyle: 'solid',
  transition: 'default',
  forcedColorAdjust: 'none',
  backgroundColor: {
    default: 'gray-25',
    forcedColors: 'Background',
    isSelected: {
      default: 'neutral',
      isEmphasized: baseColor('accent-900'),
      forcedColors: 'Highlight',
      isInvalid: {
        default: baseColor('negative-900'),
        forcedColors: 'Mark'
      },
      isDisabled: {
        default: 'gray-400',
        forcedColors: 'GrayText'
      }
    }
  },
  borderColor: {
    default: baseColor('gray-800'),
    forcedColors: 'ButtonBorder',
    isInvalid: {
      default: 'negative',
      forcedColors: 'Mark'
    },
    isDisabled: {
      default: 'gray-400',
      forcedColors: 'GrayText'
    },
    isSelected: 'transparent'
  }
});

export const iconStyles = style({
  '--iconPrimary': {
    type: 'fill',
    value: {
      default: 'gray-25',
      forcedColors: 'HighlightText'
    }
  }
});

const iconSize = {
  S: 'XS',
  M: 'S',
  L: 'M',
  XL: 'L'
} as const;

/**
 * Checkboxes allow users to select multiple items from a list of individual items,
 * or to mark one individual item as selected.
 */
export const Checkbox = forwardRef(function Checkbox({children, ...props}: CheckboxProps, ref: FocusableRef<HTMLLabelElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, CheckboxContext);
  let boxRef = useRef(null);
  let inputRef = useRef<HTMLInputElement | null>(null);
  let domRef = useFocusableRef(ref, inputRef);
  let isInForm = !!useContext(FormContext);
  props = useFormProps(props);
  let isInCheckboxGroup = !!useContext(CheckboxGroupStateContext);
  let ctx = useSlottedContext(CheckboxContext, props.slot);

  return (
    <AriaCheckbox
      {...props}
      ref={domRef}
      inputRef={inputRef}
      style={props.UNSAFE_style}
      className={renderProps => (props.UNSAFE_className || '') + wrapper({...renderProps, isInForm, size: props.size || 'M'}, props.styles)}>
      {renderProps => {
        let checkbox = (
          <div
            ref={boxRef}
            style={pressScale(boxRef)(renderProps)}
            className={box({
              ...renderProps,
              isSelected: renderProps.isSelected || renderProps.isIndeterminate,
              size: props.size || 'M',
              isEmphasized: isInCheckboxGroup ? ctx?.isEmphasized : props.isEmphasized
            })}>
            {renderProps.isIndeterminate &&
              <DashIcon size={iconSize[props.size || 'M']} className={iconStyles} />
            }
            {renderProps.isSelected && !renderProps.isIndeterminate &&
              <CheckmarkIcon size={iconSize[props.size || 'M']} className={iconStyles} />
            }
          </div>
        );

        // Only render checkbox without center baseline if no label.
        // This avoids expanding the checkbox height to the font's line height.
        if (!children) {
          return checkbox;
        }

        return (
          <>
            <CenterBaseline>
              {checkbox}
            </CenterBaseline>
            {children}
          </>
        );
      }}
    </AriaCheckbox>
  );
});
