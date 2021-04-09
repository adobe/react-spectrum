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

import {classNames, SlotProvider, useFocusableRef, useStyleProps} from '@react-spectrum/utils';
import {FocusableRef} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import {mergeProps} from '@react-aria/utils';
import React from 'react';
import {SpectrumToggleButtonProps} from '@react-types/button';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {Text} from '@react-spectrum/text';
import {useHover} from '@react-aria/interactions';
import {useProviderProps} from '@react-spectrum/provider';
import {useToggleButton} from '@react-aria/button';
import {useToggleState} from '@react-stately/toggle';

function ToggleButton(props: SpectrumToggleButtonProps, ref: FocusableRef<HTMLButtonElement>) {
  props = useProviderProps(props);
  let {
    isQuiet,
    isDisabled,
    isEmphasized,
    children,
    autoFocus,
    ...otherProps
  } = props;

  let domRef = useFocusableRef(ref);
  let state = useToggleState(props);
  let {buttonProps, isPressed} = useToggleButton(props, state, domRef);
  let {hoverProps, isHovered} = useHover({isDisabled});
  let {styleProps} = useStyleProps(otherProps);
  let isTextOnly = React.Children.toArray(props.children).every(c => !React.isValidElement(c));

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')} autoFocus={autoFocus}>
      <button
        {...styleProps}
        {...mergeProps(buttonProps, hoverProps)}
        ref={domRef}
        className={
          classNames(
            styles,
            'spectrum-ActionButton',
            {
              'spectrum-ActionButton--quiet': isQuiet,
              'spectrum-ActionButton--emphasized': isEmphasized,
              'is-active': isPressed,
              'is-disabled': isDisabled,
              'is-hovered': isHovered,
              'is-selected': state.isSelected
            },
            styleProps.className
          )
        }>
        <SlotProvider
          slots={{
            icon: {
              size: 'S',
              UNSAFE_className: classNames(styles, 'spectrum-Icon')
            },
            text: {
              UNSAFE_className: classNames(styles, 'spectrum-ActionButton-label')
            }
          }}>
          {typeof children === 'string' || isTextOnly
            ? <Text>{children}</Text>
            : children}
        </SlotProvider>
      </button>
    </FocusRing>
  );
}

/**
 * ToggleButtons allow users to toggle a selection on or off, for example
 * switching between two states or modes.
 */
let _ToggleButton = React.forwardRef(ToggleButton);
export {_ToggleButton as ToggleButton};
