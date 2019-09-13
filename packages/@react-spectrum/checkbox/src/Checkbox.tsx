import {CheckboxProps} from '@react-types/checkbox';
import CheckmarkSmall from '@spectrum-icons/ui/CheckmarkSmall';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import DashSmall from '@spectrum-icons/ui/DashSmall';
import {FocusRing} from '@react-aria/focus';
import React, {forwardRef, RefObject, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/checkbox/vars.css';
import {useCheckbox} from '@react-aria/checkbox';
import {useToggleState} from '@react-stately/toggle';

export const Checkbox = forwardRef((props: CheckboxProps, ref: RefObject<HTMLLabelElement>) => {
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
          'aria-label': false,
          onChange: false
        }
      )}
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
          }
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
