/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import CheckmarkSmall from '@spectrum-icons/ui/CheckmarkSmall';
import {classNames, filterDOMProps, useFocusableRef, useSlotProvider, useStyleProps} from '@react-spectrum/utils';
import DashSmall from '@spectrum-icons/ui/DashSmall';
import {FocusableRef} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import React, {forwardRef, useRef} from 'react';
import {SpectrumCheckboxProps} from '@react-types/checkbox';
import styles from '@adobe/spectrum-css-temp/components/checkbox/vars.css';
import {useCheckbox} from '@react-aria/checkbox';
import {useProviderProps} from '@react-spectrum/provider';
import {useToggleState} from '@react-stately/toggle';

function Checkbox(props: SpectrumCheckboxProps, ref: FocusableRef<HTMLLabelElement>) {
  props = useProviderProps(props);
  let {
    isIndeterminate = false,
    isEmphasized = false,
    isDisabled = false,
    autoFocus,
    children,
    slot,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let slotProps = useSlotProvider(slot);

  let inputRef = useRef<HTMLInputElement>(null);
  let domRef = useFocusableRef(ref, inputRef);
  let state = useToggleState(props);
  let {inputProps} = useCheckbox(props, state, inputRef);

  let markIcon = isIndeterminate
    ? <DashSmall UNSAFE_className={classNames(styles, 'spectrum-Checkbox-partialCheckmark')} />
    : <CheckmarkSmall UNSAFE_className={classNames(styles, 'spectrum-Checkbox-checkmark')} />;

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
          'spectrum-Checkbox',
          {
            'is-indeterminate': isIndeterminate,
            'spectrum-Checkbox--quiet': !isEmphasized,
            'is-invalid': inputProps['aria-invalid'],
            'is-disabled': isDisabled
          },
          styleProps.className,
          slotProps.className
        )
      }>
      <FocusRing focusRingClass={classNames(styles, 'focus-ring')} autoFocus={autoFocus}>
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
}
/**
 * Checkboxes allow users to select multiple items from a list of individual items,
 * or to mark one individual item as selected.
 */
let _Checkbox = forwardRef(Checkbox);
export {_Checkbox as Checkbox};
