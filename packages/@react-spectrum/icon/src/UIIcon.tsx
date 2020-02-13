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
import {classNames, filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import {DOMProps, StyleProps} from '@react-types/shared';
import React, {ReactElement} from 'react';
import styles from '@adobe/spectrum-css-temp/components/icon/vars.css';
import {useProvider} from '@react-spectrum/provider';

interface IconProps extends DOMProps, StyleProps {
  alt?: string,
  children: ReactElement,
  slot?: string
}

export function UIIcon(props: IconProps) {
  let {
    alt,
    children,
    'aria-label': ariaLabel,
    'aria-hidden': ariaHidden,
    role = 'img',
    ...otherProps
  } = props;

  let {styleProps} = useStyleProps({slot: 'uiIcon', ...otherProps});
  let provider = useProvider();
  let scale = 'M';
  if (provider !== null) {
    scale = provider.scale === 'large' ? 'L' : 'M';
  }

  if (!ariaHidden || ariaHidden === 'false') {
    ariaHidden = undefined;
  }

  return React.cloneElement(children, {
    ...filterDOMProps(otherProps),
    ...styleProps,
    scale,
    focusable: 'false',
    'aria-label': ariaLabel || alt,
    'aria-hidden': (ariaLabel || alt ? ariaHidden : true),
    role,
    className: classNames(
      styles,
      children.props.className,
      'spectrum-Icon',
      {
        [`spectrum-UIIcon-${children.type['displayName']}`]: children.type['displayName']
      },
      styleProps.className)
  });
}
