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

import {classNames, useMediaQuery, useStyleProps} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import inputgroupStyles from '@adobe/spectrum-css-temp/components/inputgroup/vars.css';
import {Label} from '@react-spectrum/label';
import {LabelPosition} from '@react-types/shared';
import labelStyles from '@adobe/spectrum-css-temp/components/fieldlabel/vars.css';
import {mergeProps} from '@react-aria/utils';
import React, {RefObject, useRef} from 'react';
import {SpectrumNumberFieldProps} from '@react-types/numberfield';
import {StepButton} from './StepButton';
import stepperStyle from '@adobe/spectrum-css-temp/components/stepper/vars.css';
import {TextFieldBase} from '@react-spectrum/textfield';
import {useFormProps} from '@react-spectrum/form';
import {useNumberField} from '@react-aria/numberfield';
import {useNumberFieldState} from '@react-stately/numberfield';
import {useProviderProps} from '@react-spectrum/provider';

// TODO: where should ref go
function NumberField(props: SpectrumNumberFieldProps, ref: RefObject<HTMLDivElement>) {
  props = useProviderProps(props);
  props = useFormProps(props);
  let {
    isQuiet,
    isDisabled,
    showStepper = true,
    autoFocus,
    isRequired,
    necessityIndicator,
    label,
    labelPosition = 'top' as LabelPosition,
    labelAlign,
    // value/defaultValue/onChange can't be spread onto TextfieldBase
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    value,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    defaultValue,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onChange,
    ...otherProps
  } = props;
  // either we don't pass otherProps to input... seems not ideal
  // or we figure out some way to take the styleprops out of otherProps...?
  let {styleProps} = useStyleProps(props);
  let state = useNumberFieldState(props);
  let inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>();
  let domRef = useRef<HTMLDivElement>(null);
  let {
    numberFieldProps,
    labelProps,
    inputFieldProps,
    incrementButtonProps,
    decrementButtonProps
  } = useNumberField(props, state, inputRef);
  let isMobile = useMediaQuery('(max-width: 700px)');
  let showStepperButtons = showStepper && !isMobile;

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
        'spectrum-Stepper--showStepper': showStepperButtons
      },
      styleProps.className
    )
  );

  let numberfield = (
    <FocusRing
      within
      isTextInput
      focusClass={classNames(inputgroupStyles, 'is-focused', classNames(stepperStyle, 'is-focused'))}
      focusRingClass={classNames(inputgroupStyles, 'focus-ring', classNames(stepperStyle, 'focus-ring'))}
      autoFocus={autoFocus}>
      <div
        {...styleProps}
        {...numberFieldProps}
        ref={ref}
        className={className}>
        {/* remove label from props since we render it out here already */}
        <TextFieldBase
          {...otherProps}
          isQuiet={isQuiet}
          inputClassName={classNames(stepperStyle, 'spectrum-Stepper-input')}
          inputRef={inputRef}
          validationState={props.validationState}
          label={null}
          labelProps={labelProps}
          inputProps={inputFieldProps} />
        {showStepperButtons &&
        <span
          className={classNames(stepperStyle, 'spectrum-Stepper-buttons')}
          role="presentation">
          <StepButton direction="up" isQuiet={isQuiet} {...incrementButtonProps} />
          <StepButton direction="down" isQuiet={isQuiet} {...decrementButtonProps} />
        </span>
        }
      </div>
    </FocusRing>
  );
  // how to ignore a right click on the stepper buttons to prevent focus of just them

  if (label) {
    let labelWrapperClass = classNames(
      labelStyles,
      'spectrum-Field',
      {
        'spectrum-Field--positionTop': labelPosition === 'top',
        'spectrum-Field--positionSide': labelPosition === 'side'
      },
      styleProps.className
    );

    numberfield = React.cloneElement(numberfield, mergeProps(numberfield.props, {
      className: classNames(labelStyles, 'spectrum-Field-field')
    }));

    return (
      <div
        {...styleProps}
        ref={domRef}
        className={labelWrapperClass}>
        <Label
          {...labelProps}
          labelPosition={labelPosition}
          labelAlign={labelAlign}
          isRequired={isRequired}
          necessityIndicator={necessityIndicator}>
          {label}
        </Label>
        {numberfield}
      </div>
    );
  }

  return React.cloneElement(numberfield, mergeProps(numberfield.props, {
    ...styleProps
  }));
}


/**
 * Numberfield allow entering of numbers with steppers to increment and decrement that value.
 */
let _NumberField = React.forwardRef(NumberField);
export {_NumberField as NumberField};
