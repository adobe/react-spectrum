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

import {ActionButton} from '@react-spectrum/button';
import ChevronDownSmall from '@spectrum-icons/ui/ChevronDownSmall';
import ChevronUpSmall from '@spectrum-icons/ui/ChevronUpSmall';
import {classNames, filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import inputgroupStyles from '@adobe/spectrum-css-temp/components/inputgroup/vars.css';
import React, {RefObject, useRef} from 'react';
import {SpectrumNumberFieldProps} from '@react-types/numberfield';
import stepperStyle from '@adobe/spectrum-css-temp/components/stepper/vars.css';
import {TextFieldBase} from '@react-spectrum/textfield';
import {useNumberField} from '@react-aria/numberfield';
import {useNumberFieldState} from '@react-stately/numberfield';
import {useProviderProps} from '@react-spectrum/provider';

export const NumberField = React.forwardRef((props: SpectrumNumberFieldProps, ref: RefObject<HTMLDivElement>) => {
  props = useProviderProps(props);
  let {
    // formatOptions,
    isQuiet,
    isDisabled,
    showStepper = true,
    autoFocus,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(props);
  let state = useNumberFieldState(otherProps);
  let inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>();
  let {
    numberFieldProps,
    labelProps,
    inputFieldProps,
    incrementButtonProps,
    decrementButtonProps
  } = useNumberField(props, state, inputRef);

  let className = classNames(
    inputgroupStyles,
    'spectrum-InputGroup',
    {
      'spectrum-InputGroup--quiet': isQuiet,
      'is-invalid': state.validationState === 'invalid',
      'is-disabled': isDisabled
    },
    classNames(
      stepperStyle,
      'spectrum-Stepper',
      {'spectrum-Stepper--quiet': isQuiet},
      styleProps.className
    )
  );

  return (
    <FocusRing
      within
      focusClass={classNames(inputgroupStyles, 'is-focused', classNames(stepperStyle, 'is-focused'))}
      focusRingClass={classNames(inputgroupStyles, 'focus-ring', classNames(stepperStyle, 'focus-ring'))}
      autoFocus={autoFocus}>
      <div
        {...filterDOMProps(props)}
        {...styleProps}
        {...numberFieldProps}
        ref={ref}
        className={className}>
        <TextFieldBase
          isQuiet={isQuiet}
          inputClassName={classNames(stepperStyle, 'spectrum-Stepper-input')}
          inputRef={inputRef}
          labelProps={labelProps}
          inputProps={inputFieldProps} />
        {showStepper &&
        <span
          className={classNames(stepperStyle, 'spectrum-Stepper-buttons')}
          role="presentation">
          <ActionButton
            UNSAFE_className={
              classNames(
                stepperStyle,
                'spectrum-Stepper-stepUp',
                'spectrum-ActionButton'
              )
            }
            {...incrementButtonProps}
            isQuiet={isQuiet}>
            <ChevronUpSmall UNSAFE_className={classNames(stepperStyle, 'spectrum-Stepper-stepUpIcon')} />
          </ActionButton>
          <ActionButton
            UNSAFE_className={
              classNames(
                stepperStyle,
                'spectrum-Stepper-stepDown',
                'spectrum-ActionButton'
              )
            }
            {...decrementButtonProps}
            isQuiet={isQuiet}>
            <ChevronDownSmall UNSAFE_className={classNames(stepperStyle, 'spectrum-Stepper-stepDownIcon')} />
          </ActionButton>
        </span>
        }
      </div>
    </FocusRing>
  );
});
