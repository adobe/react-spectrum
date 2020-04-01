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

import {classNames, filterDOMProps, useDOMRef, useSlotProps, useStyleProps} from '@react-spectrum/utils';
import {DOMRef, LabelPosition} from '@react-types/shared';
import {Label} from '@react-spectrum/label';
import labelStyles from '@adobe/spectrum-css-temp/components/fieldlabel/vars.css';
import {RadioGroupState, useRadioGroupState} from '@react-stately/radio';
import React, {useContext} from 'react';
import {SpectrumRadioGroupProps} from '@react-types/radio';
import styles from '@adobe/spectrum-css-temp/components/fieldgroup/vars.css';
import {useFormProps} from '@react-spectrum/form';
import {useProviderProps} from '@react-spectrum/provider';
import {useRadioGroup} from '@react-aria/radio';

interface RadioGroupContext {
  isDisabled?: boolean,
  isRequired?: boolean,
  isReadOnly?: boolean,
  isEmphasized?: boolean,
  name?: string,
  validationState?: 'valid' | 'invalid',
  state: RadioGroupState
}

const RadioContext = React.createContext<RadioGroupContext | null>(null);

export function useRadioProvider(): RadioGroupContext {
  return useContext(RadioContext);
}

function RadioGroup(props: SpectrumRadioGroupProps, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);
  props = useFormProps(props);
  props = useSlotProps(props);
  let {
    isEmphasized,
    isRequired,
    necessityIndicator,
    isReadOnly,
    isDisabled,
    label,
    labelPosition = 'top' as LabelPosition,
    labelAlign,
    validationState,
    children,
    orientation = 'vertical',
    ...otherProps
  } = props;
  let domRef = useDOMRef(ref);
  let {styleProps} = useStyleProps(otherProps);

  let state = useRadioGroupState(props);

  let {radioGroupProps, labelProps, radioProps} = useRadioGroup(props, state);

  return (
    <div
      {...filterDOMProps(otherProps)}
      {...styleProps}
      {...radioGroupProps}
      className={
        classNames(
          styles,
          'spectrum-FieldGroup',
          {
            'spectrum-FieldGroup--positionSide': labelPosition === 'side'
          },
          // This is so radio works inside a <Form>
          classNames(
            labelStyles,
            'spectrum-Field'
          ),
          styleProps.className
        )
      }
      ref={domRef}>
      {label &&
        <Label
          {...labelProps}
          elementType="span"
          labelPosition={labelPosition}
          labelAlign={labelAlign}
          isRequired={isRequired}
          necessityIndicator={necessityIndicator}>
          {label}
        </Label>
      }
      <div
        className={
          classNames(
            styles,
            'spectrum-FieldGroup-group',
            {
              'spectrum-FieldGroup-group--horizontal': orientation === 'horizontal'
            }
          )
        }>
        <RadioContext.Provider
          value={{
            isEmphasized,
            isRequired,
            isReadOnly,
            isDisabled,
            validationState,
            ...radioProps,
            state
          }}>
          {children}
        </RadioContext.Provider>
      </div>
    </div>
  );
}

const _RadioGroup = React.forwardRef(RadioGroup);
export {_RadioGroup as RadioGroup};
