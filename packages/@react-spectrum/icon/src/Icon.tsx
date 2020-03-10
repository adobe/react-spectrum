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

import {classNames, filterDOMProps, useSlotProvider, useStyleProps} from '@react-spectrum/utils';
import {DOMProps, StyleProps} from '@react-types/shared';
import React, {ReactElement} from 'react';
import styles from '@adobe/spectrum-css-temp/components/icon/vars.css';
import {useProvider} from '@react-spectrum/provider';

type Scale = 'M' | 'L'

interface IconProps extends DOMProps, StyleProps {
  /**
   * Alternate text for assistive technologies
   */
  alt?: string,
  /**
   * The content to display. Should be an SVG
   */
  children: ReactElement,
  /**
   * Size of Icon (changes based on scale)
   */
  size?: 'XXS' | 'XS' | 'S' | 'M' | 'L' |'XL' | 'XXL',
  /**
   * TODO
   */
  scale?: Scale,
  /**
   * TODO
   */
  color?: string,
  /**
   * TODO
   */
  slot?: string,
  /**
   * @default 'img'
   */
  role?: string
}

/**
 * Spectrum icons are clear, minimal, and consistent across platforms. They follow the focused and rational principles of the design system in both metaphor and style.
 */
export function Icon(props: IconProps) {
  let {
    children,
    alt,
    scale,
    color,
    size,
    'aria-label': ariaLabel,
    'aria-hidden': ariaHidden,
    role = 'img',
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let slotProps = useSlotProvider({slot: 'icon', ...otherProps});

  let provider = useProvider();
  let pscale = 'M';
  let pcolor = 'LIGHT';
  if (provider !== null) {
    pscale = provider.scale === 'large' ? 'L' : 'M';
    pcolor = provider.colorScheme === 'dark' ? 'DARK' : 'LIGHT';
  }
  if (scale === undefined) {
    scale = pscale as Scale;
  }
  if (color === undefined) {
    color = pcolor;
  }
  if (!ariaHidden || ariaHidden === 'false') {
    ariaHidden = undefined;
  }

  // Use user specified size, falling back to provider scale if size is undef
  let iconSize = size ? size : scale;

  return React.cloneElement(children, {
    ...filterDOMProps(otherProps),
    ...styleProps,
    scale: 'M',
    color,
    focusable: 'false',
    'aria-label': ariaLabel || alt,
    'aria-hidden': (ariaLabel || alt ? ariaHidden : true),
    role,
    className: classNames(
      styles,
      children.props.className,
      'spectrum-Icon',
      `spectrum-Icon--size${iconSize}`,
      styleProps.className,
      slotProps.className)
  });
}
