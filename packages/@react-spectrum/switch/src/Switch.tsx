import {classNames, filterDOMProps, FocusableRef, useFocusableRef} from '@react-spectrum/utils';
import {DOMProps} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import React, {forwardRef, useRef} from 'react';
import {StyleProps, useStyleProps} from '@react-spectrum/view';
import styles from '@adobe/spectrum-css-temp/components/toggle/vars.css';
import {SwitchProps} from '@react-types/switch';
import {useSwitch} from '@react-aria/switch';
import {useToggleState} from '@react-stately/toggle';

interface SpectrumSwitchProps extends SwitchProps, DOMProps, StyleProps {
  isEmphasized?: boolean
}

function Switch(props: SpectrumSwitchProps, ref: FocusableRef<HTMLLabelElement>) {
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

  let {
    checked,
    setChecked
  } = useToggleState(completeProps);
  let {inputProps} = useSwitch(completeProps, {checked, setChecked});
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
}

const _Switch = forwardRef(Switch);
export {_Switch as Switch};
