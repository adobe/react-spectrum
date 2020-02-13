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
import AlertMedium from '@spectrum-icons/ui/AlertMedium';
import CheckmarkMedium from '@spectrum-icons/ui/CheckmarkMedium';
import {classNames, createFocusableRef, filterDOMProps, TextInputDOMPropNames, useStyleProps} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import {Label} from '@react-spectrum/label';
import {LabelPosition} from '@react-types/shared';
import labelStyles from '@adobe/spectrum-css-temp/components/fieldlabel/vars.css';
import {mergeProps} from '@react-aria/utils';
import React, {cloneElement, forwardRef, ReactElement, Ref, useImperativeHandle, useRef} from 'react';
import {SpectrumTextFieldProps, TextFieldRef} from '@react-types/textfield';
import styles from '@adobe/spectrum-css-temp/components/textfield/vars.css';
import {useFormProps} from '@react-spectrum/form';
import {useProviderProps} from '@react-spectrum/provider';
import {useTextField} from '@react-aria/textfield';

interface TextFieldBaseProps extends SpectrumTextFieldProps {
  wrapperChildren?: ReactElement | ReactElement[],
  inputClassName?: string,
  multiLine?: boolean
}

function TextFieldBase(props: TextFieldBaseProps, ref: Ref<TextFieldRef>) {
  props = useProviderProps(props);
  props = useFormProps(props);
  let {
    label,
    labelPosition = 'top' as LabelPosition,
    labelAlign,
    isRequired,
    necessityIndicator,
    validationState,
    icon,
    isQuiet = false,
    multiLine,
    isDisabled = false,
    value,
    defaultValue,
    autoFocus,
    inputClassName,
    wrapperChildren,
    ...otherProps
  } = props;
  let domRef = useRef<HTMLDivElement>(null);
  let inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  // Expose imperative interface for ref
  useImperativeHandle(ref, () => ({
    ...createFocusableRef(domRef, inputRef),
    select() {
      if (inputRef.current) {
        inputRef.current.select();
      }
    },
    getInputElement() {
      return inputRef.current;
    }
  }));
  
  let {styleProps} = useStyleProps(otherProps);
  let {labelProps, textFieldProps} = useTextField(props);
  let ElementType: React.ElementType = multiLine ? 'textarea' : 'input';
  let isInvalid = validationState === 'invalid';

  if (icon) {
    let UNSAFE_className = classNames(
      styles,
      {
        'disabled': isDisabled
      },
      icon.props && icon.props.UNSAFE_className,
      'spectrum-Textfield-icon'
    );
    
    icon = cloneElement(icon, {
      UNSAFE_className,
      size: 'S'
    });
  } 

  let validationIcon = isInvalid ? <AlertMedium /> : <CheckmarkMedium />;
  let validation = cloneElement(validationIcon, {
    UNSAFE_className: classNames(
      styles,
      'spectrum-Textfield-validationIcon',
      {
        'is-invalid': isInvalid,
        'is-valid': validationState === 'valid'
      }
    )
  });

  let textField = (
    <div
      className={
        classNames(
          styles,
          'spectrum-Textfield',
          {
            'is-invalid': isInvalid,
            'is-valid': validationState === 'valid',
            'spectrum-Textfield--quiet': isQuiet,
            'spectrum-Textfield--multiline': multiLine
          }
        )
      }>
      <FocusRing focusRingClass={classNames(styles, 'focus-ring')} isTextInput autoFocus={autoFocus}>
        <ElementType
          {...mergeProps(
            textFieldProps,
            filterDOMProps(otherProps, TextInputDOMPropNames)
          )}
          ref={inputRef}
          value={value}
          defaultValue={defaultValue}
          rows={multiLine ? 1 : undefined}
          className={
            classNames(
              styles,
              'spectrum-Textfield-input',
              {
                'spectrum-Textfield-inputIcon': icon
              },
              inputClassName
            )
          } /> 
      </FocusRing> 
      {icon}
      {validationState ? validation : null}
      {wrapperChildren}
    </div>
  );

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

    textField = React.cloneElement(textField, mergeProps(textField.props, {
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
        {textField}
      </div>
    );
  }

  return React.cloneElement(textField, mergeProps(textField.props, {
    ...styleProps,
    ref: domRef
  }));
}

const _TextFieldBase = forwardRef(TextFieldBase);
export {_TextFieldBase as TextFieldBase};
