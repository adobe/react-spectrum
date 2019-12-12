import Alert from '@spectrum-icons/workflow/Alert';
import Checkmark from '@spectrum-icons/workflow/Checkmark';
import {classNames, cloneIcon, createFocusableRef, filterDOMProps, TextInputDOMPropNames, useStyleProps} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import {mergeProps} from '@react-aria/utils';
import React, {forwardRef, Ref, useImperativeHandle, useRef} from 'react';
import {SpectrumTextFieldProps, TextFieldRef} from '@react-types/textfield';
import styles from '@adobe/spectrum-css-temp/components/textfield/vars.css';
import {useProviderProps} from '@react-spectrum/provider';
import {useTextField} from '@react-aria/textfield';

function TextField(props: SpectrumTextFieldProps, ref: Ref<TextFieldRef>) {
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
          className={
            classNames(
              styles,
              'spectrum-Textfield-input',
              {
                'spectrum-Textfield-inputIcon': icon
              },
              styleProps.className // TODO: move this to the top-level element
            )
          } /> 
      </FocusRing> 
      {icon}
      {validationState ? validation : null}
    </div>
  );

  return component;
}

const _TextField = forwardRef(TextField);
export {_TextField as TextField};
