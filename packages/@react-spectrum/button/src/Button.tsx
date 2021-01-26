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

import {classNames, SlotProvider, useFocusableRef, useSlotProps, useStyleProps} from '@react-spectrum/utils';
import {FocusableRef} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import {mergeProps} from '@react-aria/utils';
import React, {ElementType, ReactElement} from 'react';
import {SpectrumButtonProps} from '@react-types/button';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {Text} from '@react-spectrum/text';
import {useButton} from '@react-aria/button';
import {useHover} from '@react-aria/interactions';
import {useProviderProps} from '@react-spectrum/provider';
import useUxpProps from './uxp/useUxpProps';

// todo: CSS hasn't caught up yet, map
let VARIANT_MAPPING = {
  negative: 'warning'
};

function Button<T extends ElementType = 'button'>(props: SpectrumButtonProps<T>, ref: FocusableRef<HTMLElement>) {
  props = useProviderProps(props);
  props = useSlotProps(props, 'button');
  let uxpProps = useUxpProps(props);
  let {
    elementType: ElementType = 'button',
    children,
    variant,
    isQuiet,
    isDisabled,
    autoFocus,
    ...otherProps
  } = props;
  let domRef = useFocusableRef(ref);
  let {buttonProps, isPressed} = useButton(props, domRef);
  let {hoverProps, isHovered} = useHover({isDisabled});
  let {styleProps} = useStyleProps(otherProps);

  let buttonVariant = variant;
  if (VARIANT_MAPPING[variant]) {
    buttonVariant = VARIANT_MAPPING[variant];
  }

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')} autoFocus={autoFocus}>
      <ElementType
        {...styleProps}
        {...mergeProps(buttonProps, hoverProps)}
        {...uxpProps}
        ref={domRef}
        className={
          classNames(
            styles,
            'spectrum-Button',
            `spectrum-Button--${buttonVariant}`,
            {
              'spectrum-Button--quiet': isQuiet,
              'is-disabled': isDisabled,
              'is-active': isPressed,
              'is-hovered': isHovered
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
              UNSAFE_className: classNames(styles, 'spectrum-Button-label')
            }
          }}>
          {typeof children === 'string'
            ? <Text>{children}</Text>
            : children}
        </SlotProvider>
      </ElementType>
    </FocusRing>
  );
}

/**
 * Buttons allow users to perform an action or to navigate to another page.
 * They have multiple styles for various needs, and are ideal for calling attention to
 * where a user needs to do something in order to move forward in a flow.
 */
let _Button = React.forwardRef(Button) as <T extends ElementType = 'button'>(props: SpectrumButtonProps<T> & {ref?: FocusableRef<HTMLElement>}) => ReactElement;
export {_Button as Button};
