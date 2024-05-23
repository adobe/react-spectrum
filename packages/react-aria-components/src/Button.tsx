/*
 * Copyright 2022 Adobe. All rights reserved.
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
  AriaButtonProps,
  HoverEvents,
  mergeProps,
  useButton,
  useFocusRing,
  useHover, useId,
  useLocalizedStringFormatter
} from 'react-aria';
import {
  ContextValue,
  createHideableComponent,
  RenderProps,
  SlotProps,
  useContextProps,
  useRenderProps
} from './utils';
import {filterDOMProps, isAppleDevice, isFirefox} from '@react-aria/utils';
// @ts-ignore
import intlMessages from '../intl/*.json';
import React, {createContext, ForwardedRef, ReactNode, useEffect, useState} from 'react';

export interface ButtonRenderProps {
  /**
   * Whether the button is currently hovered with a mouse.
   * @selector [data-hovered]
   */
  isHovered: boolean,
  /**
   * Whether the button is currently in a pressed state.
   * @selector [data-pressed]
   */
  isPressed: boolean,
  /**
   * Whether the button is focused, either via a mouse or keyboard.
   * @selector [data-focused]
   */
  isFocused: boolean,
  /**
   * Whether the button is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean,
  /**
   * Whether the button is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean
}

export interface ButtonProps extends Omit<AriaButtonProps, 'children' | 'href' | 'target' | 'rel' | 'elementType'>, HoverEvents, SlotProps, RenderProps<ButtonRenderProps> {
  /**
   * The `<form>` element to associate the button with.
   * The value of this attribute must be the id of a `<form>` in the same document.
   */
  form?: string,
  /**
   * The URL that processes the information submitted by the button.
   * Overrides the action attribute of the button's form owner.
   */
  formAction?: string,
  /** Indicates how to encode the form data that is submitted. */
  formEncType?: string,
  /** Indicates the HTTP method used to submit the form. */
  formMethod?: string,
  /** Indicates that the form is not to be validated when it is submitted. */
  formNoValidate?: boolean,
  /** Overrides the target attribute of the button's form owner. */
  formTarget?: string,
  /** Submitted as a pair with the button's value as part of the form data. */
  name?: string,
  /** The value associated with the button's name when it's submitted with the form data. */
  value?: string,
  /**
   * Whether to disable events immediately and display a loading spinner after a `pendingDelay`.
   */
  isPending?: boolean,
  /**
   * Number of milliseconds to wait before displaying the `isPending` state.
   * @default 1000
   */
  pendingDelay?: number,
  pendingRender?: ReactNode
}

interface ButtonContextValue extends ButtonProps {
  isPressed?: boolean
}

const additionalButtonHTMLAttributes = new Set(['form', 'formAction', 'formEncType', 'formMethod', 'formNoValidate', 'formTarget', 'name', 'value']);

export const ButtonContext = createContext<ContextValue<ButtonContextValue, HTMLButtonElement>>({});

function Button(props: ButtonProps, ref: ForwardedRef<HTMLButtonElement>) {
  [props, ref] = useContextProps(props, ref, ButtonContext);
  props = disablePendingProps(props);
  let ctx = props as ButtonContextValue;
  let {buttonProps, isPressed} = useButton(props, ref);
  let {focusProps, isFocused, isFocusVisible} = useFocusRing(props);
  let {hoverProps, isHovered} = useHover(props);
  let [isProgressVisible, setIsProgressVisible] = useState(false);
  let renderProps = useRenderProps({
    ...props,
    values: {isHovered, isPressed, isFocused, isFocusVisible, isDisabled: props.isDisabled || false, isProgressVisible},
    defaultClassName: 'react-aria-Button'
  });

  let formatter = useLocalizedStringFormatter(intlMessages, 'react-aria-components');
  let {isPending, pendingDelay = 1000, pendingRender} = ctx;
  // an aria label will block children and their labels from being read, this is undesirable for pending state
  let hasAriaLabel = !!buttonProps['aria-label'] || !!buttonProps['aria-labelledby'];
  let spinnerId = useId();
  let buttonId = useId();
  let containerId = useId();

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (isPending) {
      // Start timer when isPending is set to true.
      timeout = setTimeout(() => {
        setIsProgressVisible(true);
      }, pendingDelay);
    } else {
      // Exit loading state when isPending is set to false. */
      setIsProgressVisible(false);
    }
    return () => {
      // Clean up on unmount or when user removes isPending prop before entering loading state.
      clearTimeout(timeout);
    };
  }, [isPending]);

  const isPendingAriaLiveLabel = `${hasAriaLabel ? buttonProps['aria-label'] : ''} ${formatter.format('pending')}`.trim();
  const isPendingAriaLiveLabelledby = hasAriaLabel ? (buttonProps['aria-labelledby']?.replace(buttonId, spinnerId) ?? spinnerId) : `${containerId} ${spinnerId}`.trim();

  let ariaLive: 'off' | 'polite' | 'assertive' = 'polite';
  if (isAppleDevice() && (!hasAriaLabel || isFirefox())) {
    ariaLive = 'off';
  }

  return (
    <button
      {...filterDOMProps(props, {propNames: additionalButtonHTMLAttributes})}
      {...mergeProps(buttonProps, focusProps, hoverProps)}
      {...renderProps}
      ref={ref}
      aria-label={isPending ? isPendingAriaLiveLabel : buttonProps['aria-label']}
      aria-labelledby={isPending ? isPendingAriaLiveLabelledby : buttonProps['aria-labelledby']}
      slot={props.slot || undefined}
      aria-disabled={isPending ? 'true' : undefined}
      data-disabled={props.isDisabled || undefined}
      data-pressed={ctx.isPressed || isPressed || undefined}
      data-hovered={isHovered || undefined}
      data-focused={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}>
      <div style={{display: 'contents', visibility: isProgressVisible ? 'hidden' : 'visible'}} id={containerId} aria-atomic>{renderProps.children}</div>
      {isPending && (
        <div
          aria-hidden="true"
          style={{visibility: isProgressVisible ? 'visible' : 'hidden'}}
          className={'react-aria-ButtonPending'}>
          {pendingRender}
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
    </button>
  );
}

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
 * A button allows a user to perform an action, with mouse, touch, and keyboard interactions.
 */
const _Button = /*#__PURE__*/ createHideableComponent(Button);
export {_Button as Button};
