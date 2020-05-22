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

import {classNames, filterDOMProps, useFocusableRef, useStyleProps} from '@react-spectrum/utils';
import {FocusableRef} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import React, {forwardRef, useRef} from 'react';
import {SpectrumSwitchProps} from '@react-types/switch';
import styles from '@adobe/spectrum-css-temp/components/toggle/vars.css';
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

  let inputRef = useRef<HTMLInputElement>(null);
  let domRef = useFocusableRef(ref, inputRef);
  let state = useToggleState(props);
  let {inputProps} = useSwitch(props, state, inputRef);


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

/**
 * Switches allow users to turn an individual option on or off.
 * They are usually used to activate or deactivate a specific setting.
 */
const _Switch = forwardRef(Switch);
export {_Switch as Switch};
