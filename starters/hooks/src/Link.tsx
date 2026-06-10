'use client';
import {mergeProps} from 'react-aria/mergeProps';
import {useLink, type AriaLinkOptions} from 'react-aria/useLink';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useHover} from 'react-aria/useHover';
import {useRef} from 'react';
import type {ReactNode} from 'react';
import './Link.css';

export function Link(props: AriaLinkOptions & {children?: ReactNode}) {
  let ref = useRef<HTMLAnchorElement>(null);
  // useLink provides consistent press behavior across browsers and devices.
  let {linkProps, isPressed} = useLink(props, ref);
  let {hoverProps, isHovered} = useHover(props);
  // Show a focus ring only when interacting with the keyboard.
  let {focusProps, isFocusVisible} = useFocusRing();

  return (
    <a
      {...mergeProps(linkProps, hoverProps, focusProps)}
      ref={ref}
      // Re-pass href/target since the untyped param drops them.
      href={props.href}
      target={props.target}
      className="react-aria-Link"
      data-hovered={isHovered || undefined}
      data-pressed={isPressed || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-disabled={props.isDisabled || undefined}>
      {props.children}
    </a>
  );
}
