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

import {classNames, SlotProvider, DOMRef, filterDOMProps, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {mergeProps} from '@react-aria/utils';
import {SpectrumBadgeProps} from '@react-types/$badge';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/label/vars.css';
import {Text} from '@react-spectrum/text';
import {useProviderProps} from '@react-spectrum/provider';

function Badge(props: SpectrumBadgeProps, ref: DOMRef) {
  let {
    children,
    variant,
    size,
    anchorEdge,
    ...otherProps
  } = useProviderProps(props);
  let {styleProps} = useStyleProps(props);
  let domRef = useDOMRef(ref);
  let isTextOnly = React.Children.toArray(props.children).every(c => !React.isValidElement(c));

  return (
    <span
    className={classNames(
      styles,
      'spectrum-Label',
      `spectrum-Label--${variant}`,
      styleProps.className
    )}
    ref={domRef}>
      <SlotProvider
        slots={{
          icon: {
            size: 'S',
            UNSAFE_className: classNames(styles, styleProps, 'spectrum-Icon')
          },
          text: {
            UNSAFE_className: classNames(styles, styleProps, 'spectrum-Label', `spectrum-Label-${variant}`)
          }
        }}>
        {typeof children === 'string' || isTextOnly
          ? <Text>{children}</Text>
          : children}
      </SlotProvider>
    </span>
  );
}

const _Badge = React.forwardRef(Badge);
export {_Badge as Badge};
