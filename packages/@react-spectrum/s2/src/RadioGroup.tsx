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
  RadioGroup as AriaRadioGroup,
  RadioGroupProps as AriaRadioGroupProps,
  RadioProps as AriaRadioProps,
  RadioButton,
  RadioField,
  RadioRenderProps
} from 'react-aria-components/RadioGroup';
import {baseColor, focusRing, space, style} from '../style' with {type: 'macro'};
import {CenterBaseline} from './CenterBaseline';
import {ContextValue} from 'react-aria-components/slots';
import {
  controlFont,
  controlSize,
  field,
  getAllowedOverrides,
  StyleProps
} from './style-utils' with {type: 'macro'};
import {
  DOMRef,
  DOMRefValue,
  FocusableRef,
  GlobalDOMAttributes,
  HelpTextProps,
  Orientation,
  SpectrumLabelableProps
} from '@react-types/shared';
import {FieldLabel, HelpText} from './Field';
import {FormContext, useFormProps} from './Form';
import {pressScale} from './pressScale';
import React, {createContext, forwardRef, ReactNode, useContext, useRef} from 'react';
import {useDOMRef, useFocusableRef} from './useDOMRef';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface RadioGroupProps
  extends
    Omit<
      AriaRadioGroupProps,
      'className' | 'style' | 'render' | 'children' | keyof GlobalDOMAttributes
    >,
    StyleProps,
    SpectrumLabelableProps,
    HelpTextProps {
  /**
   * The Radios contained within the RadioGroup.
   */
  children: ReactNode;
  /**
   * The size of the RadioGroup.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL';
  /**
   * The axis the radio elements should align with.
   *
   * @default 'vertical'
   */
  orientation?: Orientation;
  /**
   * Whether the RadioGroup should be displayed with an emphasized style.
   */
  isEmphasized?: boolean;
}

export const RadioGroupContext =
  createContext<ContextValue<Partial<RadioGroupProps>, DOMRefValue<HTMLDivElement>>>(null);

/**
 * Radio groups allow users to select a single option from a list of mutually exclusive options.
 * All possible options are exposed up front for users to compare.
 */
export const RadioGroup = /*#__PURE__*/ forwardRef(function RadioGroup(
  props: RadioGroupProps,
  ref: DOMRef<HTMLDivElement>
) {
  [props, ref] = useSpectrumContextProps(props, ref, RadioGroupContext);
  let formContext = useContext(FormContext);
  props = useFormProps(props);
  let domRef = useDOMRef(ref);

  let {
    label,
    description,
    errorMessage,
    children,
    isEmphasized,
    labelPosition = 'top',
    labelAlign = 'start',
    necessityIndicator = 'icon',
    size = 'M',
    orientation = 'vertical',
    UNSAFE_className = '',
    UNSAFE_style,
    ...groupProps
  } = props;
  return (
    <AriaRadioGroup
      {...groupProps}
      orientation={orientation}
      ref={domRef}
      style={UNSAFE_style}
      className={
        UNSAFE_className +
        style(
          {
            ...field(),
            // Double the usual gap because of the internal padding within checkbox that spectrum has.
            '--field-gap': {
              type: 'rowGap',
              value: 'calc(var(--field-height) - 1lh)'
            }
          },
          getAllowedOverrides()
        )(
          {
            size,
            labelPosition,
            isInForm: !!formContext
          },
          props.styles
        )
      }>
      {({isDisabled, isInvalid}) => (
        <>
          <FieldLabel
            isDisabled={isDisabled}
            isRequired={props.isRequired}
            size={size}
            labelPosition={labelPosition}
            labelAlign={labelAlign}
            isQuiet // Make the label affect the width of the group
            necessityIndicator={necessityIndicator}
            contextualHelp={props.contextualHelp}>
            {label}
          </FieldLabel>
          <div
            className={style({
              gridArea: 'input',
              display: 'flex',
              flexDirection: {
                orientation: {
                  vertical: 'column',
                  horizontal: 'row'
                }
              },
              flexWrap: {
                orientation: {
                  horizontal: 'wrap'
                }
              },
              // Spectrum uses a fixed spacing value for horizontal (column),
              // but the gap changes depending on t-shirt size in vertical (row).
              columnGap: 16,
              rowGap: '--field-gap'
            })({orientation})}>
            <FormContext.Provider value={{...formContext, size, isEmphasized}}>
              {children}
            </FormContext.Provider>
          </div>
          <HelpText
            size={size}
            isDisabled={isDisabled}
            isInvalid={isInvalid}
            description={description}
            showErrorIcon>
            {errorMessage}
          </HelpText>
        </>
      )}
    </AriaRadioGroup>
  );
});

export interface RadioProps
  extends
    Omit<
      AriaRadioProps,
      | 'className'
      | 'style'
      | 'render'
      | 'children'
      | 'onHover'
      | 'onHoverStart'
      | 'onHoverEnd'
      | 'onHoverChange'
      | 'onClick'
      | keyof GlobalDOMAttributes
    >,
    StyleProps,
    Pick<HelpTextProps, 'description'> {
  /**
   * The label for the element.
   */
  children?: ReactNode;
}

interface ContextProps {
  /**
   * The size of the Radio.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL';
  /**
   * Whether the Radio within a RadioGroup should be displayed with an emphasized style.
   */
  isEmphasized?: boolean;
}

interface RadioContextProps extends RadioProps, ContextProps {}

interface RenderProps extends RadioRenderProps, ContextProps {}

const radioField = style(
  {
    display: 'grid',
    gridTemplateColumns: {
      default: ['max-content', '1fr'],
      isNoVisibleLabel: ['max-content']
    },
    columnGap: 'text-to-control',
    alignContent: 'start',
    font: controlFont(),
    '--field-height': {
      type: 'height',
      value: controlSize()
    },
    rowGap: {
      size: {
        S: space(1),
        M: space(1),
        L: 2,
        XL: 2
      }
    },
    gridColumnStart: {
      isInForm: 'field'
    }
  },
  getAllowedOverrides()
);

const wrapper = style({
  display: 'grid',
  gridTemplateColumns: 'subgrid',
  gridColumnStart: 1,
  gridColumnEnd: -1,
  position: 'relative',
  alignItems: 'baseline',
  transition: 'colors',
  color: {
    default: baseColor('neutral'),
    isDisabled: {
      default: 'disabled',
      forcedColors: 'GrayText'
    }
  },
  disableTapHighlight: true
});

const circle = style<RenderProps>({
  ...focusRing(),
  size: controlSize('sm'),
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'default',
  borderRadius: 'full',
  borderStyle: 'solid',
  boxSizing: 'border-box',
  borderWidth: {
    default: space(2),
    isSelected: 'calc((self(height) - (4 / 16) * 1rem) / 2)'
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
      default: baseColor('negative'),
      forcedColors: 'Mark'
    },
    isDisabled: {
      default: 'gray-400',
      forcedColors: 'GrayText'
    }
  }
});

const smallerSize = {
  S: 'XS',
  M: 'S',
  L: 'M',
  XL: 'L'
} as const;

/**
 * Radio buttons allow users to select a single option from a list of mutually exclusive options.
 * All possible options are exposed up front for users to compare.
 */
export const Radio = /*#__PURE__*/ forwardRef(function Radio(
  props: RadioProps,
  ref: FocusableRef<HTMLInputElement, HTMLDivElement>
) {
  let {children, UNSAFE_className = '', UNSAFE_style} = props;
  let circleRef = useRef(null);
  let inputRef = useRef<HTMLInputElement | null>(null);
  let domRef = useFocusableRef(ref, inputRef);
  let isInForm = !!useContext(FormContext);
  let {size = 'M', ...allProps} = useFormProps<RadioContextProps>(props);

  return (
    <RadioField
      {...allProps}
      ref={domRef}
      inputRef={inputRef}
      style={UNSAFE_style}
      className={renderProps =>
        UNSAFE_className +
        radioField({...renderProps, isInForm, size, isNoVisibleLabel: !children}, allProps.styles)
      }>
      {renderProps => (
        <>
          <RadioButton className={renderProps => wrapper({...renderProps, isInForm, size})}>
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
                    })}
                  />
                </CenterBaseline>
                {children}
              </>
            )}
          </RadioButton>
          <HelpText
            size={smallerSize[size]}
            styles={style({
              gridColumnStart: 2,
              paddingTop: 0
            })}
            isDisabled={renderProps.isDisabled}
            description={props.description}
          />
        </>
      )}
    </RadioField>
  );
});
