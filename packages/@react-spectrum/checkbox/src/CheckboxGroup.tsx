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
import {classNames, useDOMRef} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {Field} from '@react-spectrum/label';
import {Provider, useProviderProps} from '@react-spectrum/provider';
import React from 'react';
import {SpectrumCheckboxGroupProps} from '@react-types/checkbox';
import styles from '@adobe/spectrum-css-temp/components/fieldgroup/vars.css';
import {useCheckboxGroup} from '@react-aria/checkbox';
import {useCheckboxGroupState} from '@react-stately/checkbox';
import {useFormProps} from '@react-spectrum/form';

/**
 * A CheckboxGroup allows users to select one or more items from a list of choices.
 */
export const CheckboxGroup = React.forwardRef(function CheckboxGroup(props: SpectrumCheckboxGroupProps, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);
  props = useFormProps(props);
  let {
    isEmphasized,
    children,
    orientation = 'vertical'
  } = props;
  let domRef = useDOMRef(ref);
  let state = useCheckboxGroupState(props);
  let {groupProps, ...otherProps} = useCheckboxGroup(props, state);

  return (
    <Field
      {...props}
      {...otherProps}
      ref={domRef}
      wrapperClassName={classNames(styles, 'spectrum-FieldGroup')}
      elementType="span"
      includeNecessityIndicatorInAccessibilityName>
      <div
        {...groupProps}
        className={
          classNames(
            styles,
            'spectrum-FieldGroup-group',
            {
              'spectrum-FieldGroup-group--horizontal': orientation === 'horizontal'
            }
          )
        }>
        <Provider isEmphasized={isEmphasized}>
          <CheckboxGroupContext.Provider value={state}>
            {children}
          </CheckboxGroupContext.Provider>
        </Provider>
      </div>
    </Field>
  );
});
