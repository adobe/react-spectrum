import Alert from '@spectrum-icons/workflow/Alert';
import Checkmark from '@spectrum-icons/workflow/Checkmark';
import {classNames, cloneIcon, createFocusableRef, filterDOMProps, TextInputDOMPropNames} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import {mergeProps} from '@react-aria/utils';
import React, {forwardRef, ReactElement, Ref, useImperativeHandle, useRef} from 'react';
import {SpectrumTextFieldProps, TextFieldRef} from './types';
import styles from '@adobe/spectrum-css-temp/components/textfield/vars.css';
import {useProviderProps} from '@react-spectrum/provider';
import {useStyleProps} from '@react-spectrum/view';
import {useTextField} from '@react-aria/textfield';

interface TextFieldBaseProps extends SpectrumTextFieldProps {
  wrapperClassName?: string,
  wrapperChildren?: ReactElement | ReactElement[],
  inputClassName?: string
}

function TextFieldBase(props: TextFieldBaseProps, ref: Ref<TextFieldRef>) {
  props = useProviderProps(props);
  let {
    validationState,
    icon,
    isQuiet = false,
    multiLine,
    isDisabled = false,
    value,
    defaultValue,
    autoFocus,
    wrapperClassName,
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
      ref={domRef}
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
      <FocusRing focusRingClass={classNames(styles, 'focus-ring')} isTextInput autoFocus={autoFocus}>
        <ElementType
          {...mergeProps(
            textFieldProps,
            filterDOMProps(otherProps, TextInputDOMPropNames)
          )}
          ref={inputRef}
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
      {wrapperChildren}
    </div>
  );

  return component;
}

const _TextFieldBase = forwardRef(TextFieldBase);
export {_TextFieldBase as TextFieldBase};
