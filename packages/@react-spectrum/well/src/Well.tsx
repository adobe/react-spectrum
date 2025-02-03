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

import {classNames, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {filterDOMProps} from '@react-aria/utils';
import React, {forwardRef} from 'react';
import {SpectrumWellProps} from '@react-types/well';
import styles from '@adobe/spectrum-css-temp/components/well/vars.css';

/**
 * A Well is a content container that displays non-editable content separate from other content on the screen.
 * Often this is used to display preformatted text, such as code/markup examples on a documentation page.
 */
export const Well = forwardRef(function Well(props: SpectrumWellProps, ref: DOMRef<HTMLDivElement>) {
  let {
    children,
    role,
    ...otherProps
  } = props;
  let domRef = useDOMRef(ref);
  let {styleProps} = useStyleProps(otherProps);

  if (!role && (props['aria-label'] || props['aria-labelledby'])) {
    console.warn('A labelled Well must have a role.');
  }

  return (
    <div
      {...filterDOMProps(otherProps, {labelable: !!role})}
      {...styleProps}
      role={role}
      ref={domRef}
      className={classNames(
        styles,
        'spectrum-Well',
        styleProps.className
      )}>
      {children}
    </div>
  );
});
