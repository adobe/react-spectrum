import {classNames, filterDOMProps, FocusableRef, useFocusableRef} from '@react-spectrum/utils';
import {DOMProps} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import {RadioProps} from '@react-types/radio';
import React, {forwardRef, useRef} from 'react';
import {StyleProps, useStyleProps} from '@react-spectrum/view';
import styles from '@adobe/spectrum-css-temp/components/radio/vars.css';
import {useRadio} from '@react-aria/radio';
import {useRadioProvider} from './RadioGroup';

interface SpectrumRadioProps extends RadioProps, DOMProps, StyleProps {}

function Radio(props: SpectrumRadioProps, ref: FocusableRef<HTMLLabelElement>) {
  if (!props.children && !props['aria-label']) {
    console.warn('If no children are provided, an aria-label must be specified');
  }

  let {
    isDisabled,
    children,
    value,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);

  let radioGroupProps = useRadioProvider();
  let {
    isEmphasized,
    isRequired,
    isReadOnly,
    isDisabled: isGroupDisabled,
    validationState,
    name,
    labelPosition,
    selectedRadio,
    setSelectedRadio
  } = radioGroupProps;

  let {inputProps} = useRadio({
    value,
    isEmphasized,
    isRequired,
    isReadOnly,
    isDisabled: isDisabled || isGroupDisabled,
    name
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
            'spectrum-Radio--labelBelow': labelPosition === 'bottom',
            'spectrum-Radio--quiet': !isEmphasized,
            'is-disabled': isDisabled,
            'is-invalid': validationState === 'invalid'
          },
          styleProps.className
        )
      }>
      <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
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

const _Radio = forwardRef(Radio);
export {_Radio as Radio};
