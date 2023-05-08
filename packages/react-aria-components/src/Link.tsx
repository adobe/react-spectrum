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

import {AriaLinkOptions, mergeProps, useFocusRing, useHover, useLink} from 'react-aria';
import {ContextValue, RenderProps, SlotProps, useContextProps, useRenderProps} from './utils';
import {mergeRefs} from '@react-aria/utils';
import React, {createContext, ForwardedRef, forwardRef, useMemo} from 'react';

export interface LinkProps extends Omit<AriaLinkOptions, 'elementType'>, RenderProps<LinkRenderProps>, SlotProps {}

export interface LinkRenderProps {
  /**
   * Whether the link is the current item within a list.
   * @selector [aria-current]
   */
  isCurrent: boolean,
  /**
   * Whether the link is currently hovered with a mouse.
   * @selector [data-hovered]
   */
  isHovered: boolean,
  /**
   * Whether the link is currently in a pressed state.
   * @selector [data-pressed]
   */
  isPressed: boolean,
  /**
   * Whether the link is focused, either via a mouse or keyboard.
   * @selector :focus
   */
  isFocused: boolean,
  /**
   * Whether the link is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean,
  /**
   * Whether the link is disabled.
   * @selector [aria-disabled]
   */
  isDisabled: boolean
}

export const LinkContext = createContext<ContextValue<LinkProps, HTMLAnchorElement>>(null);

function Link(props: LinkProps, ref: ForwardedRef<HTMLAnchorElement>) {
  [props, ref] = useContextProps(props, ref, LinkContext);

  let elementType = typeof props.children === 'string' || typeof props.children === 'function' ? 'span' : 'a';
  let {linkProps, isPressed} = useLink({...props, elementType}, ref);

  let {hoverProps, isHovered} = useHover(props);
  let {focusProps, isFocused, isFocusVisible} = useFocusRing();

  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-Link',
    values: {
      isCurrent: !!props['aria-current'],
      isDisabled: props.isDisabled || false,
      isPressed,
      isHovered,
      isFocused,
      isFocusVisible
    }
  });

  let element: any = typeof renderProps.children === 'string'
    ? <span>{renderProps.children}</span>
    : React.Children.only(renderProps.children);

  return React.cloneElement(element, {
    ref: useMemo(() => element.ref ? mergeRefs(element.ref, ref) : ref, [element.ref, ref]),
    slot: props.slot,
    ...mergeProps(renderProps, linkProps, hoverProps, focusProps, {
      children: element.props.children,
      'data-hovered': isHovered || undefined,
      'data-pressed': isPressed || undefined,
      'data-focus-visible': isFocusVisible || undefined
    }, element.props)
  });
}

/**
 * A link allows a user to navigate to another page or resource within a web page
 * or application.
 */
const _Link = forwardRef(Link);
export {_Link as Link};
