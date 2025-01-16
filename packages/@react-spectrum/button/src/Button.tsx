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

import {
  classNames,
  SlotProvider,
  useFocusableRef,
  useHasChild,
  useSlotProps,
  useStyleProps
} from '@react-spectrum/utils';
import {FocusableRef} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {isAppleDevice, isFirefox, mergeProps, useId} from '@react-aria/utils';
import {ProgressCircle} from '@react-spectrum/progress';
import React, {ElementType, ReactElement, useEffect, useState} from 'react';
import {SpectrumButtonProps} from '@react-types/button';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {Text} from '@react-spectrum/text';
import {useButton} from '@react-aria/button';
import {useFocus, useHover} from '@react-aria/interactions';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';

function disablePendingProps(props) {
  // Don't allow interaction while isPending is true
  if (props.isPending) {
    props.onPress = undefined;
    props.onPressStart = undefined;
    props.onPressEnd = undefined;
    props.onPressChange = undefined;
    props.onPressUp = undefined;
    props.onKeyDown = undefined;
    props.onKeyUp = undefined;
    props.onClick = undefined;
    props.href = undefined;
  }
  return props;
}

/**
 * Buttons allow users to perform an action or to navigate to another page.
 * They have multiple styles for various needs, and are ideal for calling attention to
 * where a user needs to do something in order to move forward in a flow.
 */
export const Button = React.forwardRef(function Button<T extends ElementType = 'button'>(props: SpectrumButtonProps<T>, ref: FocusableRef<HTMLElement>) {
  props = useProviderProps(props);
  props = useSlotProps(props, 'button');
  props = disablePendingProps(props);
  let {
    elementType: Element = 'button',
    children,
    variant,
    style = variant === 'accent' || variant === 'cta' ? 'fill' : 'outline',
    staticColor,
    isDisabled,
    isPending,
    autoFocus,
    ...otherProps
  } = props;
  let domRef = useFocusableRef(ref);
  let {buttonProps, isPressed} = useButton(props, domRef);
  let {hoverProps, isHovered} = useHover({isDisabled});
  let [isFocused, onFocusChange] = useState(false);
  let {focusProps} = useFocus({onFocusChange, isDisabled});
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/button');
  let {styleProps} = useStyleProps(otherProps);
  let hasLabel = useHasChild(`.${styles['spectrum-Button-label']}`, domRef);
  let hasIcon = useHasChild(`.${styles['spectrum-Icon']}`, domRef);
  // an aria label will block children and their labels from being read, this is undesirable for pending state
  let hasAriaLabel = !!buttonProps['aria-label'] || !!buttonProps['aria-labelledby'];
  let [isProgressVisible, setIsProgressVisible] = useState(false);
  let backupButtonId = useId();
  let buttonId = buttonProps.id || backupButtonId;
  let iconId = useId();
  let textId = useId();
  let spinnerId = useId();

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (isPending) {
      // Start timer when isPending is set to true.
      timeout = setTimeout(() => {
        setIsProgressVisible(true);
      }, 1000);
    } else {
      // Exit loading state when isPending is set to false. */
      setIsProgressVisible(false);
    }
    return () => {
      // Clean up on unmount or when user removes isPending prop before entering loading state.
      clearTimeout(timeout);
    };
  }, [isPending]);

  if (variant === 'cta') {
    variant = 'accent';
  } else if (variant === 'overBackground') {
    variant = 'primary';
    staticColor = 'white';
  }

  const isPendingAriaLiveLabel = `${hasAriaLabel ? buttonProps['aria-label'] : ''} ${stringFormatter.format('pending')}`.trim();
  const isPendingAriaLiveLabelledby = hasAriaLabel ? (buttonProps['aria-labelledby']?.replace(buttonId, spinnerId) ?? spinnerId) : `${hasIcon ? iconId : ''} ${hasLabel ? textId : ''} ${spinnerId}`.trim();

  let ariaLive: 'off' | 'polite' | 'assertive' = 'polite';
  if (isAppleDevice() && (!hasAriaLabel || isFirefox())) {
    ariaLive = 'off';
  }

  let isPendingProps = isPending ? {
    onClick: (e) => {
      if (e.currentTarget instanceof HTMLButtonElement) {
        e.preventDefault();
      }
    }
  } : {
    // no-op. 
    // Not sure why, but TypeScript wouldn't allow to have an empty object `{}`.
    onClick: () => {}
  };

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')} autoFocus={autoFocus}>
      <Element
        {...styleProps}
        {...mergeProps(buttonProps, hoverProps, focusProps, isPendingProps)}
        id={buttonId}
        ref={domRef}
        data-variant={variant}
        data-style={style}
        data-static-color={staticColor || undefined}
        aria-disabled={isPending ? 'true' : undefined}
        aria-label={isPending ? isPendingAriaLiveLabel : buttonProps['aria-label']}
        aria-labelledby={isPending ? isPendingAriaLiveLabelledby : buttonProps['aria-labelledby']}
        className={
          classNames(
            styles,
            'spectrum-Button',
            {
              'spectrum-Button--iconOnly': hasIcon && !hasLabel,
              'is-disabled': isDisabled || isProgressVisible,
              'is-active': isPressed,
              'is-hovered': isHovered,
              'spectrum-Button--pending': isProgressVisible
            },
            styleProps.className
          )
        }>
        <SlotProvider
          slots={{
            icon: {
              id: iconId,
              size: 'S',
              UNSAFE_className: classNames(styles, 'spectrum-Icon')
            },
            text: {
              id: textId,
              UNSAFE_className: classNames(styles, 'spectrum-Button-label')
            }
          }}>
          {typeof children === 'string'
            ? <Text>{children}</Text>
            : children}
          {isPending && (
            <div
              aria-hidden="true"
              style={{visibility: isProgressVisible ? 'visible' : 'hidden'}}
              className={classNames(styles, 'spectrum-Button-circleLoader')}>
              <ProgressCircle
                aria-label={isPendingAriaLiveLabel}
                isIndeterminate
                size="S"
                staticColor={staticColor} />
            </div>
          )}
          {isPending &&
            <>
              <div aria-live={isFocused ? ariaLive : 'off'}>
                {isProgressVisible &&
                  <div role="img" aria-labelledby={isPendingAriaLiveLabelledby} />
                }
              </div>
              {/* Adding the element here with the same labels as the button itself causes aria-live to pick up the change in Safari.
              Safari with VO unfortunately doesn't announce changes to *all* of its labels specifically for button
              https://a11ysupport.io/tests/tech__html__button-name-change#assertion-aria-aria-label_attribute-convey_name_change-html-button_element-vo_macos-safari
              The aria-live may cause extra announcements in other browsers. */}
              <div id={spinnerId} role="img" aria-label={isPendingAriaLiveLabel} />
            </>
          }
        </SlotProvider>
      </Element>
    </FocusRing>
  );
}) as <T extends ElementType = 'button'>(props: SpectrumButtonProps<T> & {ref?: FocusableRef<HTMLElement>}) => ReactElement;
