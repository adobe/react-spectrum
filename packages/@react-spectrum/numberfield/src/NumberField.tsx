/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaButtonProps} from '@react-types/button';
import {classNames, useFocusableRef, useStyleProps} from '@react-spectrum/utils';
import {Field} from '@react-spectrum/label';
import {FocusableRef} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import {mergeProps} from '@react-aria/utils';
import React, {HTMLAttributes, InputHTMLAttributes, RefObject, useRef} from 'react';
import {SpectrumNumberFieldProps} from '@react-types/numberfield';
import {StepButton} from './StepButton';
import stepperStyle from '@adobe/spectrum-css-temp/components/stepper/vars.css';
import {TextFieldBase} from '@react-spectrum/textfield';
import {useHover} from '@react-aria/interactions';
import {useLocale} from '@react-aria/i18n';
import {useNumberField} from '@react-aria/numberfield';
import {useNumberFieldState} from '@react-stately/numberfield';
import {useProvider, useProviderProps} from '@react-spectrum/provider';

function NumberField(props: SpectrumNumberFieldProps, ref: FocusableRef<HTMLElement>) {
  props = useProviderProps(props);
  let provider = useProvider();
  let {
    isQuiet,
    isReadOnly,
    isDisabled,
    hideStepper
  } = props;

  let {styleProps: style} = useStyleProps(props);

  let {locale} = useLocale();
  let state = useNumberFieldState({...props, locale});
  let inputRef = useRef<HTMLInputElement>();
  let domRef = useFocusableRef<HTMLElement>(ref, inputRef);
  let {
    groupProps,
    labelProps,
    inputProps,
    incrementButtonProps,
    decrementButtonProps,
    descriptionProps,
    errorMessageProps
  } = useNumberField(props, state, inputRef);
  let isMobile = provider.scale === 'large';
  let showStepper = !hideStepper;

  let {isHovered, hoverProps} = useHover({isDisabled});

  let className =
    classNames(
      stepperStyle,
      'spectrum-Stepper',
      {
        'spectrum-Stepper--isQuiet': isQuiet,
        'is-disabled': isDisabled,
        'spectrum-Stepper--readonly': isReadOnly,
        'is-invalid': props.validationState === 'invalid',
        'spectrum-Stepper--showStepper': showStepper,
        'spectrum-Stepper--isMobile': isMobile,
        'is-hovered': isHovered,
        // because FocusRing won't pass along the className from Field, we have to handle that ourselves
        [style.className]: !props.label && style.className
      }
    );

  return (
    <Field
      {...props as Omit<SpectrumNumberFieldProps, 'onChange'>}
      descriptionProps={descriptionProps}
      errorMessageProps={errorMessageProps}
      labelProps={labelProps}
      ref={domRef}
      wrapperClassName={classNames(
        stepperStyle,
        'spectrum-Stepper-container',
        {
          'spectrum-Stepper-container--isMobile': isMobile
        }
      )}>
      <NumberFieldInput
        {...props}
        groupProps={mergeProps(groupProps, hoverProps)}
        inputProps={inputProps}
        inputRef={inputRef}
        incrementProps={incrementButtonProps}
        decrementProps={decrementButtonProps}
        className={className}
        style={style} />
    </Field>
  );
}


interface NumberFieldInputProps extends SpectrumNumberFieldProps {
  groupProps: HTMLAttributes<HTMLDivElement>,
  inputProps: InputHTMLAttributes<HTMLInputElement>,
  inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement>,
  incrementProps: AriaButtonProps,
  decrementProps: AriaButtonProps,
  className?: string,
  style?: React.CSSProperties
}

const NumberFieldInput = React.forwardRef(function NumberFieldInput(props: NumberFieldInputProps, ref: RefObject<HTMLElement>) {
  let {
    groupProps,
    inputProps,
    inputRef,
    incrementProps,
    decrementProps,
    className,
    style,
    autoFocus,
    isQuiet,
    hideStepper,
    validationState
  } = props;
  let showStepper = !hideStepper;

  return (
    <FocusRing
      within
      isTextInput
      focusClass={classNames(stepperStyle, 'is-focused')}
      focusRingClass={classNames(stepperStyle, 'focus-ring')}
      autoFocus={autoFocus}>
      <div
        {...groupProps}
        ref={ref as RefObject<HTMLDivElement>}
        style={style}
        className={className}>
        <TextFieldBase
          UNSAFE_className={
            classNames(
              stepperStyle,
              'spectrum-Stepper-field'
            )
          }
          inputClassName={
            classNames(
              stepperStyle,
              'spectrum-Stepper-input'
            )
          }
          validationIconClassName={
            classNames(
              stepperStyle,
              'spectrum-Stepper-icon'
            )
          }
          isQuiet={isQuiet}
          inputRef={inputRef}
          validationState={validationState}
          inputProps={inputProps} />
        {showStepper &&
        <>
          <StepButton direction="up" isQuiet={isQuiet} {...incrementProps} />
          <StepButton direction="down" isQuiet={isQuiet} {...decrementProps} />
        </>
        }
      </div>
    </FocusRing>
  );
});

/**
 * NumberFields allow users to enter a number, and increment or decrement the value using stepper buttons.
 */
let _NumberField = React.forwardRef(NumberField);
export {_NumberField as NumberField};
