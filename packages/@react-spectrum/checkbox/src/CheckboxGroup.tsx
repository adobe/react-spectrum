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

import {CheckboxGroupContext} from './context';
import {classNames, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef, LabelPosition} from '@react-types/shared';
import {Label} from '@react-spectrum/label';
import labelStyles from '@adobe/spectrum-css-temp/components/fieldlabel/vars.css';
import {Provider, useProviderProps} from '@react-spectrum/provider';
import React from 'react';
import {SpectrumCheckboxGroupProps} from '@react-types/checkbox';
import styles from '@adobe/spectrum-css-temp/components/fieldgroup/vars.css';
import {useCheckboxGroup} from '@react-aria/checkbox';
import {useCheckboxGroupState} from '@react-stately/checkbox';
import {useFormProps} from '@react-spectrum/form';

function CheckboxGroup(props: SpectrumCheckboxGroupProps, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);
  props = useFormProps(props);
  let {
    isEmphasized,
    isRequired,
    necessityIndicator,
    label,
    labelPosition = 'top' as LabelPosition,
    labelAlign,
    children,
    orientation = 'vertical',
    validationState,
    ...otherProps
  } = props;
  let domRef = useDOMRef(ref);
  let {styleProps} = useStyleProps(otherProps);
  let state = useCheckboxGroupState(props);
  let {labelProps, groupProps} = useCheckboxGroup(props, state);

  return (
    <div
      {...styleProps}
      {...groupProps}
      className={
        classNames(
          styles,
          'spectrum-FieldGroup',
          {
            'spectrum-FieldGroup--positionSide': labelPosition === 'side'
          },
          // This is so checkbox group works inside a <Form>
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
          necessityIndicator={necessityIndicator}
          includeNecessityIndicatorInAccessibilityName>
          {label}
        </Label>
      }
      <div
        role="presentation"
        className={
          classNames(
            styles,
            'spectrum-FieldGroup-group',
            {
              'spectrum-FieldGroup-group--horizontal': orientation === 'horizontal'
            }
          )
        }>
        <Provider isEmphasized={isEmphasized} validationState={validationState}>
          <CheckboxGroupContext.Provider value={state}>
            {children}
          </CheckboxGroupContext.Provider>
        </Provider>
      </div>
    </div>
  );
}

/**
 * A CheckboxGroup allows users to select one or more items from a list of choices.
 */
const _CheckboxGroup = React.forwardRef(CheckboxGroup);
export {_CheckboxGroup as CheckboxGroup};
