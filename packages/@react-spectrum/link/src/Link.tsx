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

import {classNames, getWrappedElement, useSlotProps, useStyleProps} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import {mergeProps, mergeRefs} from '@react-aria/utils';
import React, {useRef} from 'react';
import {SpectrumLinkProps} from '@react-types/link';
import styles from '@adobe/spectrum-css-temp/components/link/vars.css';
import {useHover} from '@react-aria/interactions';
import {useLink} from '@react-aria/link';
import {useProviderProps} from '@react-spectrum/provider';

/**
 * Links allow users to navigate to a different location.
 * They can be presented inline inside a paragraph or as standalone text.
 */
export function Link(props: SpectrumLinkProps) {
  props = useProviderProps(props);
  props = useSlotProps(props, 'link');
  let {
    variant = 'primary',
    isQuiet,
    children,
    // @ts-ignore
    href
  } = props;
  let {styleProps} = useStyleProps(props);
  let {hoverProps, isHovered} = useHover({});

  if (href) {
    console.warn('href is deprecated, please use an anchor element as children');
  }

  let ref = useRef();
  let {linkProps} = useLink({
    ...props,
    elementType: typeof children === 'string' ? 'span' : 'a'
  }, ref);

  let wrappedChild = getWrappedElement(children);

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      {React.cloneElement(
        wrappedChild,
        {
          ...styleProps,
          ...mergeProps(wrappedChild.props, linkProps, hoverProps),
          // @ts-ignore https://github.com/facebook/react/issues/8873
          ref: wrappedChild.ref ? mergeRefs(ref, wrappedChild.ref) : ref,
          className: classNames(
            styles,
            'spectrum-Link',
            {
              'spectrum-Link--quiet': isQuiet,
              [`spectrum-Link--${variant}`]: variant,
              'is-hovered': isHovered
            },
            styleProps.className
          )
        }
      )}
    </FocusRing>
  );
}
