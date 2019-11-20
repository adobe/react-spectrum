import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {DOMProps} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import React, {forwardRef, RefObject, useRef} from 'react';
import {StyleProps, useStyleProps} from '@react-spectrum/view';
import styles from '@adobe/spectrum-css-temp/components/toggle/vars.css';
import {SwitchProps} from '@react-types/switch';
import {useSwitch} from '@react-aria/switch';
import {useToggleState} from '@react-stately/toggle';

interface SpectrumSwitchProps extends SwitchProps, DOMProps, StyleProps {
  isEmphasized?: boolean
}

export const Switch = forwardRef((props: SpectrumSwitchProps, ref: RefObject<HTMLLabelElement>) => {
  let completeProps = Object.assign({}, {
    isDisabled: false,
    isEmphasized: false,
    defaultSelected: false
  }, props);

  let {
    isEmphasized,
    isDisabled,
    children,
    ...otherProps
  } = completeProps;
  let {styleProps} = useStyleProps(otherProps);

  let inputRef = useRef<HTMLInputElement>();
  let {
    checked,
    setChecked
  } = useToggleState(completeProps);
  let {inputProps} = useSwitch(completeProps, {checked, setChecked});

  return (
    <label
      {...filterDOMProps(
        otherProps,
        {
          'aria-label': false
        }
      )}
      {...styleProps}
      ref={ref}
      className={
        classNames(
          styles,
          'spectrum-ToggleSwitch',
          {
            'spectrum-ToggleSwitch--quiet': !isEmphasized,
            'is-disabled': isDisabled
          },
          styleProps.className
        )
      }>
      <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
        <input
          {...inputProps}
          ref={inputRef}
          className={classNames(styles, 'spectrum-ToggleSwitch-input')} />
      </FocusRing>
      <span className={classNames(styles, 'spectrum-ToggleSwitch-switch')} />
      {children && (
        <span className={classNames(styles, 'spectrum-ToggleSwitch-label')}>
          {children}
        </span>
      )}
    </label>
  );
});
