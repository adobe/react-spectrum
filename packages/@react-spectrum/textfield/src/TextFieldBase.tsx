import Alert from '@spectrum-icons/workflow/Alert';
import Checkmark from '@spectrum-icons/workflow/Checkmark';
import {classNames, cloneIcon, filterDOMProps, TextInputDOMPropNames} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import React, {forwardRef, RefObject} from 'react';
import {SpectrumTextFieldProps} from './types';
import styles from '@adobe/spectrum-css-temp/components/textfield/vars.css';
import {useProviderProps} from '@react-spectrum/provider';
import {useStyleProps} from '@react-spectrum/view';
import {useTextField} from '@react-aria/textfield';

interface TextFieldBaseProps extends SpectrumTextFieldProps {
  wrapperClassName?: string,
  inputClassName?: string
}

export const TextFieldBase = forwardRef((props: TextFieldBaseProps, ref: RefObject<HTMLInputElement & HTMLTextAreaElement>) => {
  props = useProviderProps(props);
  let {
    validationState,
    icon,
    isQuiet = false,
    multiLine,
    isDisabled = false,
    value,
    defaultValue,
    wrapperClassName,
    inputClassName,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  
  let {textFieldProps} = useTextField(props);
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
      {...styleProps}
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
          wrapperClassName
        )
      }>
      <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
        <ElementType
          {...filterDOMProps(otherProps, TextInputDOMPropNames)}
          {...textFieldProps}
          ref={ref}
          value={value}
          defaultValue={defaultValue}
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
    </div>
  );

  return component;
});
