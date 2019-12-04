import {CheckboxProps} from '@react-types/checkbox';
import CheckmarkSmall from '@spectrum-icons/ui/CheckmarkSmall';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import DashSmall from '@spectrum-icons/ui/DashSmall';
import {DOMProps} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import React, {forwardRef, RefObject, useRef} from 'react';
import {StyleProps, useStyleProps} from '@react-spectrum/view';
import styles from '@adobe/spectrum-css-temp/components/checkbox/vars.css';
import {useCheckbox} from '@react-aria/checkbox';
import {useToggleState} from '@react-stately/toggle';

interface SpectrumCheckboxProps extends CheckboxProps, DOMProps, StyleProps {
  isEmphasized?: boolean
}

export const Checkbox = forwardRef((props: SpectrumCheckboxProps, ref: RefObject<HTMLLabelElement>) => {
  let completeProps = Object.assign({}, {
    isIndeterminate: false,
    isDisabled: false,
    isEmphasized: false,
    validationState: 'valid',
    defaultSelected: false
  }, props);

  let {
    isIndeterminate,
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
  let {inputProps} = useCheckbox(completeProps, {checked, setChecked}, inputRef);

  let markIcon = isIndeterminate
    ? <DashSmall className={classNames(styles, 'spectrum-Checkbox-partialCheckmark')} />
    : <CheckmarkSmall className={classNames(styles, 'spectrum-Checkbox-checkmark')} />;

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
          'spectrum-Checkbox',
          {
            'is-indeterminate': isIndeterminate,
            'spectrum-Checkbox--quiet': !isEmphasized,
            'is-invalid': inputProps['aria-invalid'],
            'is-disabled': isDisabled
          },
          styleProps.className
        )
      }>
      <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
        <input
          {...inputProps}
          ref={inputRef}
          className={classNames(styles, 'spectrum-Checkbox-input')} />
      </FocusRing>
      <span className={classNames(styles, 'spectrum-Checkbox-box')}>{markIcon}</span>
      {children && (
        <span className={classNames(styles, 'spectrum-Checkbox-label')}>
          {children}
        </span>
      )}
    </label>
  );
});
