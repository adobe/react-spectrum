import {classNames, filterDOMProps, useFocusableRef, useStyleProps} from '@react-spectrum/utils';
import {FocusableRef} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import React, {forwardRef, useRef} from 'react';
import {SpectrumRadioProps} from '@react-types/radio';
import styles from '@adobe/spectrum-css-temp/components/radio/vars.css';
import {useRadio} from '@react-aria/radio';
import {useRadioProvider} from './RadioGroup';

function Radio(props: SpectrumRadioProps, ref: FocusableRef<HTMLLabelElement>) {
  if (!props.children && !props['aria-label']) {
    console.warn('If no children are provided, an aria-label must be specified');
  }

  let {
    isDisabled,
    children,
    autoFocus,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);

  let radioGroupProps = useRadioProvider();
  let {
    isEmphasized,
    isDisabled: isGroupDisabled,
    validationState,
    selectedRadio,
    setSelectedRadio
  } = radioGroupProps;

  let {inputProps} = useRadio({
    ...props,
    ...radioGroupProps,
    isDisabled: isDisabled || isGroupDisabled
  }, {selectedRadio, setSelectedRadio});

  let inputRef = useRef<HTMLInputElement>(null);
  let domRef = useFocusableRef(ref, inputRef);

  return (
    <label
      {...filterDOMProps(
        otherProps,
        {
          'aria-label': false
        }
      )}
      {...styleProps}
      ref={domRef}
      className={
        classNames(
          styles,
          'spectrum-Radio',
          {
            // Removing. Pending design feedback.
            // 'spectrum-Radio--labelBelow': labelPosition === 'bottom',
            'spectrum-Radio--quiet': !isEmphasized,
            'is-disabled': isDisabled,
            'is-invalid': validationState === 'invalid'
          },
          styleProps.className
        )
      }>
      <FocusRing focusRingClass={classNames(styles, 'focus-ring')} autoFocus={autoFocus}>
        <input
          {...inputProps}
          ref={inputRef}
          className={classNames(styles, 'spectrum-Radio-input')} />
      </FocusRing>
      <span className={classNames(styles, 'spectrum-Radio-button')} />
      {children && (
        <span className={classNames(styles, 'spectrum-Radio-label')}>
          {children}
        </span>
      )}
    </label>
  );
}
/**
 * Radio buttons allow users to select a single option from a list of mutually exclusive options.
 * All possible options are exposed up front for users to compare.
 */
const _Radio = forwardRef(Radio);
export {_Radio as Radio};
