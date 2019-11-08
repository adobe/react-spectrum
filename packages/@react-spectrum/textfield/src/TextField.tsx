import Alert from '@spectrum-icons/workflow/Alert';
import Checkmark from '@spectrum-icons/workflow/Checkmark';
import {classNames, cloneIcon, filterDOMProps} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import {mergeProps} from '@react-aria/utils';
import React, {forwardRef, RefObject} from 'react';
import {SpectrumTextFieldProps} from './types';
import styles from '@adobe/spectrum-css-temp/components/textfield/vars.css';
import {useProviderProps} from '@react-spectrum/provider';
import {useTextField} from '@react-aria/textfield';

export const TextField = forwardRef((props: SpectrumTextFieldProps, ref: RefObject<HTMLDivElement>) => {
  props = useProviderProps(props);
  let {
    validationState,
    icon,
    isQuiet = false,
    className,
    multiLine,
    isDisabled = false,
    value,
    defaultValue,
    placeholder,
    name,
    pattern,
    minLength,
    maxLength,
    autoComplete,
    childElementProps: {
      input: inputChildProps = {}
    } = {},
    ...otherProps
  } = props;
  
  let {inputProps} = useTextField(props);
  let ElementType: React.ElementType = multiLine ? 'textarea' : 'input';
  let isInvalid = validationState === 'invalid';

  if (icon) {
    icon = cloneIcon(icon, {
      className: classNames(
        styles,
        'spectrum-Textfield-icon',
        {
          'disabled': isDisabled
        }
      ),
      size: 'S'
    });
  } 

  let validationIcon = isInvalid ? <Alert /> : <Checkmark />;
  let validation = cloneIcon(validationIcon, {
    className: classNames(
      styles,
      'spectrum-Textfield-validationIcon',
      {
        'is-invalid': isInvalid,
        'is-valid': validationState === 'valid'
      }
    )
  });

  let component = (
    <div
      {...filterDOMProps(otherProps, {
        value: false,
        defaultValue: false,
        onChange: false,
        placeholder: false
      })}
      ref={ref}
      className={
        classNames(
          styles,
          'spectrum-Textfield',
          {
            'is-invalid': isInvalid,
            'is-valid': validationState === 'valid',
            'spectrum-Textfield--quiet': isQuiet,
            'spectrum-Textfield--multiline': multiLine
          },
          className
        )
      }>
      <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
        <ElementType
          {...mergeProps(inputProps, filterDOMProps(inputChildProps))}
          ref={inputChildProps.ref}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          name={name}
          pattern={pattern}
          minLength={minLength}
          maxLength={maxLength}
          autoComplete={autoComplete}
          className={
            classNames(
              styles,
              'spectrum-Textfield-input',
              {
                'spectrum-Textfield-inputIcon': icon
              },
              inputProps.className
            )
          } /> 
      </FocusRing> 
      {icon}
      {validationState ? validation : null}
    </div>
  );

  return component;
});
