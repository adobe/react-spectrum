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

import {AriaLinkOptions, HoverEvents, mergeProps, useFocusRing, useHover, useLink} from 'react-aria';
import {
  ClassNameOrFunction,
  ContextValue,
  dom,
  PossibleLinkDOMRenderProps,
  RenderProps,
  SlotProps,
  useContextProps,
  useRenderProps
} from './utils';
import {DOMProps, forwardRefType, GlobalDOMAttributes} from '@react-types/shared';
import {filterDOMProps} from '@react-aria/utils';
import React, {createContext, ForwardedRef, forwardRef} from 'react';

export interface LinkProps extends Omit<AriaLinkOptions, 'elementType'>, HoverEvents, Omit<RenderProps<LinkRenderProps>, 'render'>, PossibleLinkDOMRenderProps<'span', LinkRenderProps>, SlotProps, DOMProps, Omit<GlobalDOMAttributes<HTMLAnchorElement>, 'onClick'> {
 /**
  * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state.
  * @default 'react-aria-Link'
  */
 className?: ClassNameOrFunction<LinkRenderProps>
}

export interface LinkRenderProps {
  /**
   * Whether the link is the current item within a list.
   * @selector [data-current]
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
   * @selector [data-focused]
   */
  isFocused: boolean,
  /**
   * Whether the link is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean,
  /**
   * Whether the link is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean
}

export const LinkContext = createContext<ContextValue<LinkProps, HTMLAnchorElement>>(null);

/**
 * A link allows a user to navigate to another page or resource within a web page
 * or application.
 */
export const Link = /*#__PURE__*/ (forwardRef as forwardRefType)(function Link(props: LinkProps, ref: ForwardedRef<HTMLAnchorElement>) {
  [props, ref] = useContextProps(props, ref, LinkContext);

  let elementType = props.href && !props.isDisabled ? 'a' : 'span';
  let {linkProps, isPressed} = useLink({...props, elementType}, ref);
  let ElementType = dom[elementType];

  let {hoverProps, isHovered} = useHover(props);
  let {focusProps, isFocused, isFocusVisible} = useFocusRing();

  let renderProps = useRenderProps<LinkRenderProps, 'span' | 'a'>({
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

  let DOMProps = filterDOMProps(props, {global: true});
  delete DOMProps.onClick;

  return (
    <ElementType
      ref={ref}
      slot={props.slot || undefined}
      {...mergeProps(DOMProps, renderProps, linkProps, hoverProps, focusProps)}
      data-focused={isFocused || undefined}
      data-hovered={isHovered || undefined}
      data-pressed={isPressed || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-current={!!props['aria-current'] || undefined}
      data-disabled={props.isDisabled  || undefined}>
      {renderProps.children}
    </ElementType>
  );
});
