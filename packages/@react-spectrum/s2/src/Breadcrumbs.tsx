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

import {Breadcrumbs as RACBreadcrumbs, BreadcrumbsProps as AriaBreadcrumbsProps, Breadcrumb as AriaBreadcrumb, Provider, Link, HeadingContext} from 'react-aria-components';
import {StyleProps, focusRing, getAllowedOverrides} from './style-utils' with {type: 'macro'};
import {size, style} from '../style/spectrum-theme' with { type: 'macro' };
import {forwardRefType} from './types';
import {Children, ReactElement, ReactNode, cloneElement, createContext, forwardRef, isValidElement, useContext, useRef} from 'react';
import {AriaBreadcrumbItemProps} from 'react-aria';
import ChevronIcon from '../ui-icons/Chevron';
import {LinkDOMProps} from '@react-types/shared';

interface BreadcrumbsStyleProps {
  /**
   * Size of the Breadcrumbs including spacing and layout.
   *
   * @default 'M'
   */
  size?: 'M' | 'L',
  /** Whether the breadcrumbs are disabled. */
  isDisabled?: boolean,
  /**
   * Whether to place the last Breadcrumb item onto a new line.
   */
  isMultiline?: boolean
  /** Whether to always show the root item if the items are collapsed. */
  // TODO: showRoot?: boolean,
}

export interface BreadcrumbsProps<T> extends Omit<AriaBreadcrumbsProps<T>, 'children' | 'style' | 'className'>, BreadcrumbsStyleProps, StyleProps {
  /** The children of the Breadcrumbs. */
  children?: ReactNode
}

const wrapper = style<BreadcrumbsStyleProps>({
  display: 'flex',
  justifyContent: 'start',
  listStyleType: 'none',
  flexWrap: {
    default: 'nowrap',
    isMultiline: 'wrap'
  },
  flexGrow: 1,
  flexShrink: 0,
  flexBasis: 0,
  gap: {
    size: {
      M: size(6), // breadcrumbs-text-to-separator-medium
      L: size(9) // breadcrumbs-text-to-separator-large
    },
    isMultiline: 4
  },
  padding: 0,
  transition: 'default',
  marginTop: 0,
  marginBottom: 0,
  marginStart: {
    size: {
      M: size(6),
      L: size(9)
    },
    isMultiline: 4
  }
}, getAllowedOverrides());

const BreadcrumbsInternalContext = createContext<BreadcrumbsProps<any> & {length: number}>({length: 0});

function Breadcrumbs<T extends object>({
    UNSAFE_className = '',
    UNSAFE_style,
    styles,
    ...props
}: BreadcrumbsProps<T>) {
  let {size = 'M', isMultiline, isDisabled} = props;
  let ref = useRef(null);
  // TODO: Remove when https://github.com/adobe/react-spectrum/pull/6440 is released
  let childArray: ReactElement[] = [];
  Children.forEach(props.children, (child, index) => {
    if (isValidElement<{index: number}>(child)) {
      child = cloneElement(child, {key: index, index});
      childArray.push(child);
    }
  });
  return (
    <RACBreadcrumbs
      {...props}
      ref={ref}
      style={UNSAFE_style}
      className={UNSAFE_className + wrapper({
        size,
        isMultiline
      }, styles)}>
      <Provider
        values={[
          [BreadcrumbsInternalContext, {size, isDisabled, isMultiline, length: childArray.length}]
        ]}>
        {childArray}
      </Provider>
    </RACBreadcrumbs>
  );
}

/** Breadcrumbs show hierarchy and navigational context for a user’s location within an application. */
let _Breadcrumbs = /*#__PURE__*/ (forwardRef as forwardRefType)(Breadcrumbs);
export {_Breadcrumbs as Breadcrumbs};

const breadcrumbStyles = style({
  display: 'inline-flex',
  flexShrink: {
    isMultiline: {
      isCurrent: 0
    }
  },
  flexBasis: {
    isMultiline: {
      isCurrent: 'full'
    }
  },
  alignItems: 'center',
  justifyContent: 'start',
  height: {
    default: 'control',
    isMultiline: {
      default: 24,
      isCurrent: 35
    }
  },
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
  fontFamily: 'sans',
  fontSize: {
    default: 'control',
    isMultiline: {
      default: 'ui-sm'
    }
  },
  fontWeight: {
    default: 'normal',
    isCurrent: 'bold',
    isMultiline: {
      isCurrent: 'extra-bold'
    }
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
  disableTapHighlight: true,
  marginTop: {
    default: {
      size: {
        M: size(6), // component-top-to-text-100
        L: size(9) // component-top-to-text-200
      }
    },
    isMultiline: size(4)
  },
  marginBottom: {
    default: {
      size: {
        M: size(8), // component-bottom-to-text-100
        L: size(11) // component-bottom-to-text-200
      }
    },
    isMultiline: size(5)
  }
});

const currentStyles = style({
  color: {
    default: 'neutral',
    forcedColors: 'ButtonText'
  },
  transition: 'default',
  fontFamily: 'sans',
  fontSize: {
    default: 'control',
    isMultiline: 'heading-lg' // TODO: Customizable, but it’s preferred to use: heading-size-s, heading-size-m, heading-size-l (default), and heading-size-xl
  },
  fontWeight: {
    default: 'bold',
    isMultiline: 'extra-bold'
  },
  marginTop: {
    default: {
      size: {
        M: size(6), // component-top-to-text-100
        L: size(9) // component-top-to-text-200
      }
    },
    isMultiline: 0
  },
  marginBottom: {
    default: {
      size: {
        M: size(9), // component-bottom-to-text-100
        L: size(11) // component-bottom-to-text-200
      }
    },
    isMultiline: size(9)
  }
});

// TODO: support user heading size customization, for now just set it to large
const heading = style({
  margin: 0,
  fontFamily: 'sans',
  fontSize: 'heading-lg',
  fontWeight: 'extra-bold'
});

export interface BreadcrumbProps extends Omit<AriaBreadcrumbItemProps, 'children' | 'style' | 'className'>, LinkDOMProps {
  /** The children of the breadcrumb item. */
  children?: ReactNode
}

export function Breadcrumb({children, ...props}: BreadcrumbProps) {
  let {href, target, rel, download, ping, referrerPolicy, ...other} = props;
  let {size = 'M', isMultiline, length, isDisabled} = useContext(BreadcrumbsInternalContext);
  let ref = useRef(null);
  // TODO: use isCurrent render prop when https://github.com/adobe/react-spectrum/pull/6440 is released
  let isCurrent = (props as BreadcrumbProps & {index: number}).index === length - 1;
  return (
    <AriaBreadcrumb
      {...other}
      ref={ref}
      className={breadcrumbStyles({size, isMultiline, isCurrent})} >
      {isCurrent ?
        <span
          className={currentStyles({size, isMultiline, isCurrent})}>
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
              className={({isFocused, isFocusVisible, isHovered, isDisabled, isPressed}) => linkStyles({isFocused, isFocusVisible, isHovered, isDisabled, size, isCurrent, isMultiline, isPressed})}>
              {children}
            </Link>
            <ChevronIcon
              size={isMultiline ? 'S' : 'M'}
              className={chevronStyles} />
          </>
        )}
    </AriaBreadcrumb>
  );
}
