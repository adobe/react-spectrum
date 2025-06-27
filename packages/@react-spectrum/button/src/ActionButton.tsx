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

import {classNames, ClearSlots, SlotProvider, useFocusableRef, useSlotProps, useStyleProps} from '@react-spectrum/utils';
import CornerTriangle from '@spectrum-icons/ui/CornerTriangle';
import {FocusableRef} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import {mergeProps} from '@react-aria/utils';
import React from 'react';
import {SpectrumActionButtonProps} from '@react-types/button';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {Text} from '@react-spectrum/text';
import {useButton} from '@react-aria/button';
import {useHover} from '@react-aria/interactions';
import {useProviderProps} from '@react-spectrum/provider';

/**
 * ActionButtons allow users to perform an action.
 * They’re used for similar, task-based options within a workflow, and are ideal for interfaces where buttons aren’t meant to draw a lot of attention.
 */
export const ActionButton = React.forwardRef(function ActionButton(props: SpectrumActionButtonProps, ref: FocusableRef<HTMLButtonElement>) {
  props = useProviderProps(props);
  props = useSlotProps(props, 'actionButton');
  let textProps = useSlotProps({UNSAFE_className: classNames(styles, 'spectrum-ActionButton-label')}, 'text');

  let {
    isQuiet,
    isDisabled,
    staticColor,
    children,
    autoFocus,
    // @ts-ignore (private)
    holdAffordance,
    // @ts-ignore (private)
    hideButtonText,
    ...otherProps
  } = props;

  let domRef = useFocusableRef(ref);
  let {buttonProps, isPressed} = useButton(props, domRef);
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
              'spectrum-ActionButton--staticColor': !!staticColor,
              'spectrum-ActionButton--staticWhite': staticColor === 'white',
              'spectrum-ActionButton--staticBlack': staticColor === 'black',
              'is-active': isPressed,
              'is-disabled': isDisabled,
              'is-hovered': isHovered
            },
            styleProps.className
          )
        }>
        {holdAffordance &&
          <CornerTriangle UNSAFE_className={classNames(styles, 'spectrum-ActionButton-hold')} />
        }
        <ClearSlots>
          <SlotProvider
            slots={{
              icon: {
                size: 'S',
                UNSAFE_className: classNames(
                  styles,
                  'spectrum-Icon',
                  {
                    'spectrum-ActionGroup-itemIcon': hideButtonText
                  }
                )
              },
              text: {
                ...textProps
              }
            }}>
            {typeof children === 'string' || isTextOnly
              ? <Text>{children}</Text>
              : children}
          </SlotProvider>
        </ClearSlots>
      </button>
    </FocusRing>
  );
});
