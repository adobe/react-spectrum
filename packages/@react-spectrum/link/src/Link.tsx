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

import {classNames, filterDOMProps, getWrappedElement, useStyleProps} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import React, {useRef} from 'react';
import {SpectrumLinkProps} from '@react-types/link';
import styles from '@adobe/spectrum-css-temp/components/link/vars.css';
import {useLink} from '@react-aria/link';
import {useProviderProps} from '@react-spectrum/provider';

export function Link(props: SpectrumLinkProps) {
  props = useProviderProps(props);
  let {
    variant = 'primary',
    isQuiet,
    children,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(props);

  let ref = useRef();
  let {linkProps} = useLink({...props, ref});

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      {React.cloneElement(
        getWrappedElement(children),
        {
          ...filterDOMProps(otherProps),
          ...styleProps,
          ...linkProps,
          ref,
          className: classNames(
            styles,
            'spectrum-Link',
            {
              'spectrum-Link--quiet': isQuiet,
              [`spectrum-Link--${variant}`]: variant
            },
            styleProps.className
          )
        }
      )}
    </FocusRing>
  );
}
