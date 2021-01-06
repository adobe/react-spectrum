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
import inputgroupStyles from '@adobe/spectrum-css-temp/components/inputgroup/vars.css';
import {mergeProps} from '@react-aria/utils';
import {PressResponder, useHover} from '@react-aria/interactions';
import React, {HTMLAttributes, InputHTMLAttributes, RefObject, useRef} from 'react';
import {SpectrumNumberFieldProps} from '@react-types/numberfield';
import {StepButton} from './StepButton';
import stepperStyle from '@adobe/spectrum-css-temp/components/stepper/vars.css';
import {TextFieldBase} from '@react-spectrum/textfield';
import {useFormProps} from '@react-spectrum/form';
import {useNumberField} from '@react-aria/numberfield';
import {useNumberFieldState} from '@react-stately/numberfield';
import {useProvider, useProviderProps} from '@react-spectrum/provider';

function NumberField(props: SpectrumNumberFieldProps, ref: FocusableRef<HTMLElement>) {
  props = useProviderProps(props);
  props = useFormProps(props);
  let provider = useProvider();
  let {
    isQuiet,
    isDisabled,
    hideStepper
  } = props;

  let {styleProps: style} = useStyleProps(props);
  let state = useNumberFieldState(props);
  let inputRef = useRef<HTMLInputElement>();
  let domRef = useFocusableRef<HTMLElement>(ref, inputRef);
  let incrementRef = useRef<HTMLDivElement>();
  let decrementRef = useRef<HTMLDivElement>();
  let {
    numberFieldProps,
    labelProps,
    inputFieldProps,
    incrementButtonProps,
    decrementButtonProps
  } = useNumberField({...props, incrementRef, decrementRef, inputRef}, state);
  let isMobile = provider.scale === 'large';
  let showStepper = !hideStepper;

  let {isHovered, hoverProps} = useHover({isDisabled});

  let className = classNames(
    inputgroupStyles,
    'spectrum-InputGroup',
    {
      'spectrum-InputGroup--quiet': isQuiet,
      'is-invalid': props.validationState === 'invalid',
      'is-disabled': isDisabled
    },
    classNames(
      stepperStyle,
      'spectrum-Stepper',
      {
        'spectrum-Stepper--quiet': isQuiet,
        'is-invalid': props.validationState === 'invalid',
        'spectrum-Stepper--showStepper': showStepper,
        'spectrum-Stepper--isMobile': isMobile,
        'spectrum-Stepper--isHovered': isHovered,
        // because FocusRing won't pass along the className from Field, we have to handle that ourselves
        [style.className]: !props.label && style.className
      }
    )
  );
  // TODO: how to ignore a right click on the stepper buttons to prevent focus of just them

  return (
    <Field
      {...props as Omit<SpectrumNumberFieldProps, 'onChange'>}
      labelProps={labelProps}
      ref={domRef}>
      <NumberFieldInput
        {...props}
        numberFieldProps={mergeProps(numberFieldProps, hoverProps)}
        inputProps={inputFieldProps}
        inputRef={inputRef}
        incrementProps={incrementButtonProps}
        incrementRef={incrementRef}
        decrementProps={decrementButtonProps}
        decrementRef={decrementRef}
        className={className}
        style={style} />
    </Field>
  );
}


interface NumberFieldInputProps extends SpectrumNumberFieldProps {
  numberFieldProps: HTMLAttributes<HTMLDivElement>,
  inputProps: InputHTMLAttributes<HTMLInputElement>,
  inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement>,
  incrementProps: AriaButtonProps,
  incrementRef: RefObject<HTMLDivElement>,
  decrementProps: AriaButtonProps,
  decrementRef: RefObject<HTMLDivElement>,
  className?: string,
  style?: React.CSSProperties
}

const NumberFieldInput = React.forwardRef(function NumberFieldInput(props: NumberFieldInputProps, ref: RefObject<HTMLElement>) {
  let {
    numberFieldProps,
    inputProps,
    inputRef,
    incrementProps,
    incrementRef,
    decrementProps,
    decrementRef,
    className,
    style,
    autoFocus,
    isQuiet,
    hideStepper,
    validationState,
    label
  } = props;
  let showStepper = !hideStepper;

  return (
    <FocusRing
      within
      isTextInput
      focusClass={classNames(inputgroupStyles, 'is-focused', classNames(stepperStyle, 'is-focused'))}
      focusRingClass={classNames(inputgroupStyles, 'focus-ring', classNames(stepperStyle, 'focus-ring'))}
      autoFocus={autoFocus}>
      <div
        {...numberFieldProps}
        ref={ref as RefObject<HTMLDivElement>}
        {...(label ? {style: {...style, width: '100%'}} : {style})}
        className={className}>
        <TextFieldBase
          UNSAFE_className={classNames(stepperStyle, 'spectrum-Stepper-field')}
          isQuiet={isQuiet}
          inputClassName={classNames(stepperStyle, 'spectrum-Stepper-input')}
          inputRef={inputRef}
          validationState={validationState}
          inputProps={inputProps} />
        {showStepper &&
        <>
          <PressResponder preventFocusOnPress>
            <StepButton direction="up" isQuiet={isQuiet} ref={incrementRef} {...incrementProps} />
          </PressResponder>
          <PressResponder preventFocusOnPress>
            <StepButton direction="down" isQuiet={isQuiet} ref={decrementRef} {...decrementProps} />
          </PressResponder>
        </>
        }
      </div>
    </FocusRing>
  );
});

/**
 * Numberfield allow entering of numbers with steppers to increment and decrement that value.
 */
let _NumberField = React.forwardRef(NumberField);
export {_NumberField as NumberField};
