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

import {Breadcrumb as AriaBreadcrumb, BreadcrumbsProps as AriaBreadcrumbsProps, ContextValue, HeadingContext, Link, Provider, Breadcrumbs as RACBreadcrumbs, useSlottedContext} from 'react-aria-components';
import {AriaBreadcrumbItemProps, useLocale} from 'react-aria';
import ChevronIcon from '../ui-icons/Chevron';
import {createContext, forwardRef, ReactNode, useRef} from 'react';
import {DOMRef, DOMRefValue, LinkDOMProps} from '@react-types/shared';
import {focusRing, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {forwardRefType} from './types';
import {size, style} from '../style/spectrum-theme' with { type: 'macro' };
import {useDOMRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

interface BreadcrumbsStyleProps {
  /**
   * Size of the Breadcrumbs including spacing and layout.
   *
   * @default 'M'
   */
  size?: 'M' | 'L',
  /** Whether the breadcrumbs are disabled. */
  isDisabled?: boolean
  /**
   * Whether to place the last Breadcrumb item onto a new line.
   */
  // TODO: isMultiline?: boolean
  /** Whether to always show the root item if the items are collapsed. */
  // TODO: showRoot?: boolean,
}

export interface BreadcrumbsProps<T> extends Omit<AriaBreadcrumbsProps<T>, 'children' | 'items' | 'style' | 'className'>, BreadcrumbsStyleProps, StyleProps {
  /** The children of the Breadcrumbs. */
  children?: ReactNode
}

export const BreadcrumbsContext = createContext<ContextValue<BreadcrumbsProps<any>, DOMRefValue<HTMLOListElement>>>(null);

const wrapper = style<BreadcrumbsStyleProps>({
  display: 'flex',
  justifyContent: 'start',
  listStyleType: 'none',
  flexWrap: 'nowrap',
  flexGrow: 1,
  flexShrink: 0,
  flexBasis: 0,
  gap: {
    size: {
      M: size(6), // breadcrumbs-text-to-separator-medium
      L: size(9) // breadcrumbs-text-to-separator-large
    }
  },
  padding: 0,
  transition: 'default',
  marginTop: 0,
  marginBottom: 0,
  marginStart: {
    size: {
      M: size(6),
      L: size(9)
    }
  }
}, getAllowedOverrides());

function Breadcrumbs<T extends object>(props: BreadcrumbsProps<T>, ref: DOMRef<HTMLOListElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, BreadcrumbsContext);
  let {
    UNSAFE_className = '',
    UNSAFE_style,
    styles,
    size = 'M',
    children,
    ...otherProps
  } = props;
  let domRef = useDOMRef(ref);
  return (
    <RACBreadcrumbs
      {...otherProps}
      ref={domRef}
      style={UNSAFE_style}
      className={UNSAFE_className + wrapper({
        size
      }, styles)}>
      <BreadcrumbsContext.Provider value={props}>
        {children}
      </BreadcrumbsContext.Provider>
    </RACBreadcrumbs>
  );
}

/** Breadcrumbs show hierarchy and navigational context for a user’s location within an application. */
let _Breadcrumbs = /*#__PURE__*/ (forwardRef as forwardRefType)(Breadcrumbs);
export {_Breadcrumbs as Breadcrumbs};

const breadcrumbStyles = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'start',
  height: 'control',
  transition: 'default',
  position: 'relative',
  color: {
    default: 'neutral',
    isDisabled: 'disabled',
    forcedColors: {
      default: 'ButtonText',
      isDisabled: 'GrayText'
    }
  },
  borderStyle: 'none'
});

const chevronStyles = style({
  scale: {
    direction: {
      rtl: -1
    }
  },
  marginStart: 'text-to-visual',
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
});

const linkStyles = style({
  ...focusRing(),
  borderRadius: 'sm',
  color: {
    default: 'neutral-subdued',
    isDisabled: 'disabled',
    isCurrent: 'neutral',
    forcedColors: {
      default: 'LinkText',
      isDisabled: 'GrayText'
    }
  },
  transition: 'default',
  font: 'control',
  fontWeight: {
    default: 'normal',
    isCurrent: 'bold'
  },
  textDecoration: {
    default: 'none',
    isHovered: 'underline',
    isFocusVisible: 'underline',
    isDisabled: 'none'
  },
  cursor: {
    default: 'pointer',
    isDisabled: 'default'
  },
  outlineColor: {
    default: 'focus-ring',
    forcedColors: 'Highlight'
  },
  disableTapHighlight: true
});

const currentStyles = style<{size: string}>({
  color: {
    default: 'neutral',
    forcedColors: 'ButtonText'
  },
  transition: 'default',
  font: 'control',
  fontWeight: 'bold'
});

// TODO: support user heading size customization, for now just set it to large
const heading = style({
  margin: 0,
  font: 'heading-lg',
  fontWeight: 'extra-bold'
});

export interface BreadcrumbProps extends Omit<AriaBreadcrumbItemProps, 'children' | 'style' | 'className' | 'autoFocus'>, LinkDOMProps {
  /** The children of the breadcrumb item. */
  children?: ReactNode
}

export function Breadcrumb({children, ...props}: BreadcrumbProps) {
  let {href, target, rel, download, ping, referrerPolicy, ...other} = props;
  let {size = 'M', isDisabled} = useSlottedContext(BreadcrumbsContext)!;
  let ref = useRef(null);
  let {direction} = useLocale();
  return (
    <AriaBreadcrumb
      {...other}
      ref={ref}
      className={({isCurrent}) => breadcrumbStyles({size, isCurrent})}>
      {({isCurrent}) => (
        isCurrent ?
          <span
            className={currentStyles({size})}>
            <Provider
              values={[
                [HeadingContext, {className: heading}]
              ]}>
              {children}
            </Provider>
          </span>
          : (
            <>
              <Link
                style={({isFocusVisible}) => ({clipPath: isFocusVisible ? 'none' : 'margin-box'})}
                href={href}
                target={target}
                rel={rel}
                download={download}
                ping={ping}
                referrerPolicy={referrerPolicy}
                isDisabled={isDisabled || isCurrent}
                className={({isFocused, isFocusVisible, isHovered, isDisabled, isPressed}) => linkStyles({isFocused, isFocusVisible, isHovered, isDisabled, size, isCurrent, isPressed})}>
                {children}
              </Link>
              <ChevronIcon
                size="M"
                className={chevronStyles({direction})} />
            </>
          )
        )}
    </AriaBreadcrumb>
  );
}
