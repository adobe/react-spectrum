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

import {classNames} from '@react-spectrum/utils';
import React from 'react';
import {SpectrumSideNavHeadingProps} from '@react-types/sidenav';
import styles from '@adobe/spectrum-css-temp/components/sidenav/vars.css';

export function SideNavHeading<T>({item, ...otherProps}: SpectrumSideNavHeadingProps<T>) {
  return (
    <h2
      {...otherProps}
      className={classNames(styles, 'spectrum-SideNav-heading')} >
      {item.rendered}
    </h2>
  );
}
