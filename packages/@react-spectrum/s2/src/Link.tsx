/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ContextValue, LinkRenderProps, Link as RACLink, LinkProps as RACLinkProps} from 'react-aria-components';
import {createContext, forwardRef, ReactNode, useContext} from 'react';
import {FocusableRef, FocusableRefValue} from '@react-types/shared';
import {focusRing, style} from '../style' with {type: 'macro'};
import {getAllowedOverrides, staticColor, StyleProps} from './style-utils' with {type: 'macro'};
import {SkeletonContext, useSkeletonText} from './Skeleton';
import {useFocusableRef} from '@react-spectrum/utils';
import {useLayoutEffect} from '@react-aria/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

interface LinkStyleProps {
  /**
   * The [visual style](https://spectrum.adobe.com/page/link/#Options) of the link.
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary',
  /** The static color style to apply. Useful when the link appears over a color background. */
  staticColor?: 'white' | 'black' | 'auto',
  /** Whether the link is on its own vs inside a longer string of text. */
  isStandalone?: boolean,
  /** Whether the link should be displayed with a quiet style. */
  isQuiet?: boolean
}

export interface LinkProps extends Omit<RACLinkProps, 'isDisabled' | 'className' | 'style' | 'children' | 'onHover' | 'onHoverStart' | 'onHoverEnd' | 'onHoverChange'>, StyleProps, LinkStyleProps {
  children?: ReactNode
}

export const LinkContext = createContext<ContextValue<LinkProps, FocusableRefValue<HTMLAnchorElement>>>(null);

const link = style<LinkRenderProps & LinkStyleProps & {isSkeleton: boolean, isStaticColor: boolean}>({
  ...focusRing(),
  ...staticColor(),
  borderRadius: 'sm',
  font: {
    isStandalone: 'ui'
  },
  color: {
    variant: {
      primary: 'accent',
      secondary: 'neutral' // TODO: should there be an option to inherit from the paragraph? What about hover states?
    },
    isStaticColor: 'transparent-overlay-1000',
    forcedColors: 'LinkText'
  },
  transition: 'default',
  fontWeight: {
    isStandalone: 'medium'
  },
  textDecoration: {
    default: 'underline',
    isStandalone: {
      // Inline links must always have an underline for accessibility.
      isQuiet: {
        default: 'none',
        isHovered: 'underline',
        isFocusVisible: 'underline'
      }
    }
  },
  outlineColor: {
    default: 'focus-ring',
    isStaticColor: 'transparent-overlay-1000',
    forcedColors: 'Highlight'
  },
  disableTapHighlight: true
}, getAllowedOverrides());

/**
 * Links allow users to navigate to a different location.
 * They can be presented inline inside a paragraph or as standalone text.
 */
export const Link = /*#__PURE__*/ forwardRef(function Link(props: LinkProps, ref: FocusableRef<HTMLAnchorElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, LinkContext);
  let {variant = 'primary', staticColor, isQuiet, isStandalone, UNSAFE_style, UNSAFE_className = '', styles, children} = props;

  let domRef = useFocusableRef(ref);
  let isSkeleton = useContext(SkeletonContext) || false;
  [children, UNSAFE_style] = useSkeletonText(children, UNSAFE_style);

  useLayoutEffect(() => {
    if (domRef.current) {
      // TODO: should RAC Link pass through inert?
      domRef.current.inert = isSkeleton;
    }
  }, [domRef, isSkeleton]);

  return (
    <RACLink
      {...props}
      ref={domRef}
      style={UNSAFE_style}
      className={renderProps => UNSAFE_className + link({...renderProps, variant, staticColor, isStaticColor: !!staticColor, isQuiet, isStandalone, isSkeleton}, styles)}>
      {children}
    </RACLink>
  );
});
