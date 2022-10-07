import {AriaLinkOptions, mergeProps, useFocusRing, useHover, useLink} from 'react-aria';
import React, {createContext, ForwardedRef, forwardRef} from 'react';
import {RenderProps, useContextProps, useRenderProps} from './utils';

interface LinkProps extends AriaLinkOptions, RenderProps<LinkRenderProps> {}

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

export const LinkContext = createContext(null);

function Link(props: LinkProps, ref: ForwardedRef<HTMLAnchorElement>) {
  [props, ref] = useContextProps(props, ref, LinkContext);

  let elementType = typeof props.children === 'string' ? 'span' : 'a';
  let {linkProps, isPressed} = useLink({...props, elementType}, ref);

  let {hoverProps, isHovered} = useHover(props);
  let {focusProps, isFocused, isFocusVisible} = useFocusRing();

  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-Link',
    values: {
      isCurrent: !!props['aria-current'],
      isDisabled: props.isDisabled,
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
    ref,
    ...element.props,
    ...mergeProps(linkProps, hoverProps, focusProps),
    ...renderProps,
    children: element.props.children,
    'data-hovered': isHovered || undefined,
    'data-pressed': isPressed || undefined,
    'data-focus-visible': isFocusVisible || undefined
  });
}

const _Link = forwardRef(Link);
export {_Link as Link};
