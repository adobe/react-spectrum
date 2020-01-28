import {classNames, filterDOMProps, useFocusableRef, useStyleProps} from '@react-spectrum/utils';
import {FocusableRef} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import React, {forwardRef, useRef} from 'react';
import {SpectrumSwitchProps} from '@react-types/switch';
import styles from '@adobe/spectrum-css-temp/components/toggle/vars.css';
import {usePress} from '@react-aria/interactions';
import {useProviderProps} from '@react-spectrum/provider';
import {useSwitch} from '@react-aria/switch';
import {useToggleState} from '@react-stately/toggle';

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


  let {pressProps} = usePress({ref: inputRef});
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
          {...pressProps}
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
