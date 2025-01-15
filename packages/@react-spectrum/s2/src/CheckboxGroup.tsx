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
  CheckboxGroup as AriaCheckboxGroup,
  CheckboxGroupProps as AriaCheckboxGroupProps,
  ContextValue
} from 'react-aria-components';
import {CheckboxContext} from './Checkbox';
import {createContext, forwardRef, ReactNode, useContext} from 'react';
import {DOMRef, DOMRefValue, HelpTextProps, Orientation, SpectrumLabelableProps} from '@react-types/shared';
import {field, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {FieldLabel, HelpText} from './Field';
import {FormContext, useFormProps} from './Form';
import {style} from '../style' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface CheckboxGroupProps extends Omit<AriaCheckboxGroupProps, 'className' | 'style' | 'children'>, StyleProps, SpectrumLabelableProps, HelpTextProps {
  /**
   * The size of the Checkboxes in the CheckboxGroup.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /**
   * The axis the checkboxes should align with.
   *
   * @default 'vertical'
   */
  orientation?: Orientation,
  /**
   * The Checkboxes contained within the CheckboxGroup.
   */
  children?: ReactNode,
  /**
   * By default, checkboxes are not emphasized (gray).
   * The emphasized (blue) version provides visual prominence.
   */
  isEmphasized?: boolean
}

export const CheckboxGroupContext = createContext<ContextValue<CheckboxGroupProps, DOMRefValue<HTMLDivElement>>>(null);

/**
 * A CheckboxGroup allows users to select one or more items from a list of choices.
 */
export const CheckboxGroup = forwardRef(function CheckboxGroup(props: CheckboxGroupProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, CheckboxGroupContext);
  let formContext = useContext(FormContext);
  props = useFormProps(props);
  let {
    label,
    description,
    errorMessage,
    children,
    labelPosition = 'top',
    labelAlign = 'start',
    necessityIndicator = 'icon',
    size = 'M',
    orientation = 'vertical',
    UNSAFE_className = '',
    UNSAFE_style,
    isEmphasized,
    ...groupProps
  } = props;
  let domRef = useDOMRef(ref);

  return (
    <AriaCheckboxGroup
      {...groupProps}
      ref={domRef}
      style={UNSAFE_style}
      className={UNSAFE_className + style({
        ...field(),
        // Double the usual gap because of the internal padding within checkbox that spectrum has.
        '--field-gap': {
          type: 'rowGap',
          value: '[calc(var(--field-height) - 1lh)]'
        }
      }, getAllowedOverrides())({
        size: props.size,
        labelPosition,
        isInForm: !!formContext
      }, props.styles)}>
      {({isDisabled, isInvalid}) => (<>
        <FieldLabel
          isDisabled={isDisabled}
          isRequired={props.isRequired}
          size={size}
          labelPosition={labelPosition}
          labelAlign={labelAlign}
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
            lineHeight: 'ui',
            rowGap: '--field-gap',
            // Spectrum uses a fixed spacing value for horizontal,
            // but the gap changes depending on t-shirt size in vertical.
            columnGap: 16,
            flexWrap: 'wrap'
          })({orientation})}>
          <FormContext.Provider value={{...formContext, size, isRequired: undefined}}>
            <CheckboxContext.Provider value={{isEmphasized}}>
              {children}
            </CheckboxContext.Provider>
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
      </>)}
    </AriaCheckboxGroup>
  );
});
