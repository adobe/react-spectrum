import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import React, {forwardRef, RefObject, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/toggle/vars.css';
import {SwitchProps} from '@react-types/switch';
import {useSwitch} from '@react-aria/switch';
import {useToggleState} from '@react-stately/toggle';
import {useSlotProvider} from "@react-spectrum/layout";

export const Switch = forwardRef((props: SwitchProps, ref: RefObject<HTMLLabelElement>) => {
  let completeProps = Object.assign({}, {
    isDisabled: false,
    isEmphasized: false,
    defaultSelected: false
  }, props);

  let {
    isEmphasized,
    isDisabled,
    children,
    className,
    slot,
    ...otherProps
  } = completeProps;
  let {[slot ? slot : 'switch']: slotClassName} = useSlotProvider();

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
          'aria-label': false,
          onChange: false
        }
      )}
      ref={ref}
      className={
        classNames(
          styles,
          'spectrum-ToggleSwitch',
          {
            'spectrum-ToggleSwitch--quiet': !isEmphasized,
            'is-disabled': isDisabled
          },
          slotClassName,
          className
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
