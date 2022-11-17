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

import {classNames, useDOMRef} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {Field} from '@react-spectrum/label';
import {RadioContext} from './context';
import React from 'react';
import {SpectrumRadioGroupProps} from '@react-types/radio';
import styles from '@adobe/spectrum-css-temp/components/fieldgroup/vars.css';
import {useFormProps} from '@react-spectrum/form';
import {useProviderProps} from '@react-spectrum/provider';
import {useRadioGroup} from '@react-aria/radio';
import {useRadioGroupState} from '@react-stately/radio';

function RadioGroup(props: SpectrumRadioGroupProps, ref: DOMRef<HTMLElement>) {
  props = useProviderProps(props);
  props = useFormProps(props);
  let {
    isEmphasized,
    validationState,
    children,
    orientation = 'vertical'
  } = props;

  let domRef = useDOMRef(ref);
  let state = useRadioGroupState(props);
  let {radioGroupProps, labelProps, descriptionProps, errorMessageProps} = useRadioGroup(props, state);

  return (
    <Field
      {...props}
      ref={domRef}
      wrapperClassName={classNames(styles, 'spectrum-FieldGroup')}
      labelProps={labelProps}
      descriptionProps={descriptionProps}
      errorMessageProps={errorMessageProps}
      elementType="span">
      <div
        {...radioGroupProps}
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
            validationState,
            state
          }}>
          {children}
        </RadioContext.Provider>
      </div>
    </Field>
  );
}

/**
 * Radio groups allow users to select a single option from a list of mutually exclusive options.
 * All possible options are exposed up front for users to compare.
 */
const _RadioGroup = React.forwardRef(RadioGroup);
export {_RadioGroup as RadioGroup};
