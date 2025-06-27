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
import {FocusRing} from '@react-aria/focus';
import {mergeProps} from '@react-aria/utils';
import React from 'react';
import {SpectrumLogicButtonProps} from '@react-types/button';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {useButton} from '@react-aria/button';
import {useHover} from '@react-aria/interactions';
import {useProviderProps} from '@react-spectrum/provider';

/**
 * A LogicButton displays an operator within a boolean logic sequence.
 */
export const LogicButton = React.forwardRef(function LogicButton(props: SpectrumLogicButtonProps, ref: FocusableRef<HTMLButtonElement>) {
  props = useProviderProps(props);
  let {
    variant,
    children,
    isDisabled,
    autoFocus,
    ...otherProps
  } = props;
  let domRef = useFocusableRef(ref);
  let {buttonProps, isPressed} = useButton(props, domRef);
  let {hoverProps, isHovered} = useHover({isDisabled});
  let {styleProps} = useStyleProps(otherProps);

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')} autoFocus={autoFocus}>
      <button
        {...styleProps}
        {...mergeProps(buttonProps, hoverProps)}
        ref={domRef}
        className={
          classNames(
            styles,
            'spectrum-LogicButton',
            {
              [`spectrum-LogicButton--${variant}`]: variant,
              'is-disabled': isDisabled,
              'is-active': isPressed,
              'is-hovered': isHovered
            },
            styleProps.className
          )
        }>
        <span className={classNames(styles, 'spectrum-Button-label')}>{children}</span>
      </button>
    </FocusRing>
  );
});
