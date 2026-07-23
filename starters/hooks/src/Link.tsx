'use client';
import {mergeProps} from 'react-aria/mergeProps';
import {useLink, type AriaLinkOptions} from 'react-aria/useLink';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useHover} from 'react-aria/useHover';
import {useRef} from 'react';
import type {ReactNode} from 'react';
import './Link.css';

export interface LinkProps extends AriaLinkOptions {
  children?: ReactNode;
}

export function Link(props: LinkProps) {
  let ref = useRef<HTMLAnchorElement>(null);
  let {linkProps, isPressed} = useLink(props, ref);
  let {hoverProps, isHovered} = useHover(props);
  let {focusProps, isFocusVisible} = useFocusRing();

  return (
    <a
      {...mergeProps(linkProps, hoverProps, focusProps)}
      ref={ref}
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
