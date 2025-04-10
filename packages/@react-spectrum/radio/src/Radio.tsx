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

import {classNames, useFocusableRef, useStyleProps} from '@react-spectrum/utils';
import {FocusableRef} from '@react-types/shared';
import {FocusRing} from '@react-aria-nutrient/focus';
import React, {forwardRef, useRef} from 'react';
import {SpectrumRadioProps} from '@react-types/radio';
import styles from '@adobe/spectrum-css-temp/components/radio/vars.css';
import {useHover} from '@react-aria-nutrient/interactions';
import {useRadio} from '@react-aria-nutrient/radio';
import {useRadioProvider} from './context';

/**
 * Radio buttons allow users to select a single option from a list of mutually exclusive options.
 * All possible options are exposed up front for users to compare.
 */
export const Radio = forwardRef(function Radio(props: SpectrumRadioProps, ref: FocusableRef<HTMLLabelElement>) {
  let {
    isDisabled,
    children,
    autoFocus,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let {hoverProps, isHovered} = useHover({isDisabled});

  let inputRef = useRef<HTMLInputElement>(null);
  let domRef = useFocusableRef(ref, inputRef);

  let radioGroupProps = useRadioProvider();
  let {
    isEmphasized,
    state
  } = radioGroupProps;

  let {inputProps} = useRadio({
    ...props,
    ...radioGroupProps,
    isDisabled
  }, state, inputRef);

  return (
    <label
      {...styleProps}
      {...hoverProps}
      ref={domRef}
      className={
        classNames(
          styles,
          'spectrum-Radio',
          {
            // Removing. Pending design feedback.
            // 'spectrum-Radio--labelBelow': labelPosition === 'bottom',
            'spectrum-Radio--quiet': !isEmphasized,
            'is-disabled': isDisabled,
            'is-invalid': state.isInvalid,
            'is-hovered': isHovered
          },
          styleProps.className
        )
      }>
      <FocusRing focusRingClass={classNames(styles, 'focus-ring')} autoFocus={autoFocus}>
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
});
