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

import {classNames, useFocusableRef, useStyleProps} from '@react-spectrum/utils';
import {Field} from '@react-spectrum/label';
import {FocusableRef} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import inputgroupStyles from '@adobe/spectrum-css-temp/components/inputgroup/vars.css';
import React, {RefObject, useRef} from 'react';
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
    hideStepper,
    autoFocus,
    // value/defaultValue/onChange can't be spread onto TextfieldBase
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    value,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    defaultValue,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onChange,
    ...otherProps
  } = props;
  let fieldProps = Object.assign({}, props);
  // TS won't remove onChange from the type, so when using fieldProps below, cast it as omitted
  delete fieldProps['onChange'];

  let {styleProps} = useStyleProps(props);
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
  } = useNumberField({...props, incrementRef, decrementRef}, state, inputRef);
  let isMobile = provider.scale === 'large';
  let showStepper = !hideStepper && !(isMobile && isQuiet);

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
        // because FocusRing won't pass along the className from Field, we have to handle that ourselves
        [styleProps.className]: !props.label
      }
    )
  );
  // TODO: how to ignore a right click on the stepper buttons to prevent focus of just them

  return (
    <Field
      {...fieldProps as Omit<SpectrumNumberFieldProps, 'onChange'>}
      labelProps={labelProps}
      ref={domRef}
      noForwardRef>
      <FocusRing
        within
        isTextInput
        focusClass={classNames(inputgroupStyles, 'is-focused', classNames(stepperStyle, 'is-focused'))}
        focusRingClass={classNames(inputgroupStyles, 'focus-ring', classNames(stepperStyle, 'focus-ring'))}
        autoFocus={autoFocus}>
        <div
          {...(props.label ? {style: {width: '100%'}} : styleProps)}
          {...numberFieldProps}
          {...(props.label ? {} : {ref: domRef as RefObject<HTMLDivElement>})}
          className={className}>
          <TextFieldBase
            UNSAFE_className={classNames(stepperStyle, 'spectrum-Stepper-field', otherProps.UNSAFE_className)}
            isQuiet={isQuiet}
            inputClassName={classNames(stepperStyle, 'spectrum-Stepper-input')}
            inputRef={inputRef}
            validationState={props.validationState}
            inputProps={inputFieldProps} />
          {showStepper &&
          <>
            <StepButton direction="up" isQuiet={isQuiet} ref={incrementRef} {...incrementButtonProps} />
            <StepButton direction="down" isQuiet={isQuiet} ref={decrementRef} {...decrementButtonProps} />
          </>
          }
        </div>
      </FocusRing>
    </Field>
  );
}


/**
 * Numberfield allow entering of numbers with steppers to increment and decrement that value.
 */
let _NumberField = React.forwardRef(NumberField);
export {_NumberField as NumberField};
