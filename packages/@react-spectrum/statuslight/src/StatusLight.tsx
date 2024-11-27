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
import {SpectrumStatusLightProps} from '@react-types/statuslight';
import styles from '@adobe/spectrum-css-temp/components/statuslight/vars.css';
import {useProviderProps} from '@react-spectrum/provider';

/**
 * Status lights are used to color code categories and labels commonly found in data visualization.
 * When status lights have a semantic meaning, they should use semantic variant colors.
 */
export const StatusLight = forwardRef(function StatusLight(props: SpectrumStatusLightProps, ref: DOMRef<HTMLDivElement>) {
  let {
    variant,
    children,
    isDisabled,
    role,
    ...otherProps
  } = useProviderProps(props);
  let domRef = useDOMRef(ref);
  let {styleProps} = useStyleProps(otherProps);

  if (!children && !props['aria-label']) {
    console.warn('If no children are provided, an aria-label must be specified');
  }

  if (!role && (props['aria-label'] || props['aria-labelledby'])) {
    console.warn('A labelled StatusLight must have a role.');
  }

  return (
    <div
      {...filterDOMProps(otherProps, {labelable: !!role})}
      {...styleProps}
      role={role}
      className={classNames(
        styles,
        'spectrum-StatusLight',
        `spectrum-StatusLight--${variant}`,
        {
          'is-disabled': isDisabled
        },
        styleProps.className
      )}
      ref={domRef}>
      {children}
    </div>
  );
});
