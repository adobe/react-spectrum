import AlertMedium from '@spectrum-icons/ui/AlertMedium';
import CheckmarkMedium from '@spectrum-icons/ui/CheckmarkMedium';
import {classNames, createFocusableRef, filterDOMProps, TextInputDOMPropNames, useStyleProps} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import {mergeProps} from '@react-aria/utils';
import React, {cloneElement, forwardRef, ReactElement, Ref, useImperativeHandle, useRef} from 'react';
import {SpectrumTextFieldProps, TextFieldRef} from '@react-types/textfield';
import styles from '@adobe/spectrum-css-temp/components/textfield/vars.css';
import {useProviderProps} from '@react-spectrum/provider';
import {useTextField} from '@react-aria/textfield';

interface TextFieldBaseProps extends SpectrumTextFieldProps {
  wrapperChildren?: ReactElement | ReactElement[],
  inputClassName?: string,
  multiLine?: boolean
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
          styleProps.className
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
