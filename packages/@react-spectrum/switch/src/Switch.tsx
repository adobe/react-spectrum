import {classNames, filterDOMProps, FocusableRef, useFocusableRef} from '@react-spectrum/utils';
import {DOMProps} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import React, {forwardRef, useRef} from 'react';
import {StyleProps, useStyleProps} from '@react-spectrum/view';
import styles from '@adobe/spectrum-css-temp/components/toggle/vars.css';
import {SwitchProps} from '@react-types/switch';
import {useProviderProps} from '@react-spectrum/provider';
import {useSwitch} from '@react-aria/switch';
import {useToggleState} from '@react-stately/toggle';

interface SpectrumSwitchProps extends SwitchProps, DOMProps, StyleProps {
  isEmphasized?: boolean
}

function Switch(props: SpectrumSwitchProps, ref: FocusableRef<HTMLLabelElement>) {
  props = useProviderProps(props);
  let {
    isEmphasized = false,
    isDisabled = false,
    autoFocus,
    children,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);

  let state = useToggleState(props);
  let {inputProps} = useSwitch(props, state);
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
      <FocusRing focusRingClass={classNames(styles, 'focus-ring')} autoFocus={autoFocus}>
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
