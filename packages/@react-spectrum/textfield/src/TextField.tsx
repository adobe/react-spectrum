// @ts-ignore
import Alert from '@spectrum-icons/ui/AlertMedium';
// @ts-ignore
import Checkmark from '@spectrum-icons/ui/CheckmarkMedium';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {cloneIcon} from '@react/react-spectrum/utils/icon';
import {FocusRing} from '@react-aria/focus';
import OverlayTrigger from '@react/react-spectrum/OverlayTrigger';
import React, {forwardRef, RefObject} from 'react';
import {SpectrumTextFieldProps} from './types';
import styles from '@adobe/spectrum-css-temp/components/textfield/vars.css';
import {useLocale} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';
import {useTextField} from '@react-aria/textfield';
import {useTextFieldState} from '@react-stately/textfield';

export const TextField = forwardRef((props: SpectrumTextFieldProps, ref: RefObject<HTMLInputElement & HTMLTextAreaElement>) => {
  props = useProviderProps(props);
  let {
    validationState,
    icon,
    isQuiet = false,
    validationTooltip,
    className,
    multiLine,
    isRequired = false,
    isDisabled = false,
    ...otherProps
  } = props;
  
  let state = useTextFieldState(props);
  let {textFieldProps} = useTextField(props, state);
  let ElementType: React.ElementType = multiLine ? 'textarea' : 'input';
  let isInvalid = validationState === 'invalid' || (isRequired && state.value === '');
  let {direction} = useLocale();

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

  // Note: tooltip positioning will be off if it doesn't fit within the page
  if (validationTooltip) {
    let placement = direction === 'ltr' ? 'right' : 'left';

    validation = (
      <OverlayTrigger placement={placement} trigger={['hover', 'focus']}>
        {validation}  
        {validationTooltip}
      </OverlayTrigger>
    );
  }

  let component = (
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
      <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
        <ElementType
          {...filterDOMProps(otherProps, {
            value: false,
            defaultValue: false,
            onChange: false
          })}
          {...textFieldProps}
          ref={ref}
          className={
            classNames(
              styles,
              'spectrum-Textfield-input',
              {
                'spectrum-Textfield-inputIcon': icon
              },
              className
            )
          } /> 
      </FocusRing> 
      {icon}
      {(validationState || (isRequired && state.value === '')) ? validation : null}
    </div>
  );

  return component;
});
