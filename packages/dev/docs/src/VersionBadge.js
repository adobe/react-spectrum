
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


import badgeStyles from '@adobe/spectrum-css-temp/components/badge/vars.css';
import clsx from 'clsx';
import React from 'react';

export function VersionBadge(props) {
  let {
    version = '',
    size = 'small'
  } = props;

  let versionMap = {
    'alpha': 'spectrum-Badge--info',
    'beta': 'spectrum-Badge--info',
    'rc': 'spectrum-Badge--positive'
  };

  let preRelease = version.match(/(alpha)|(beta)|(rc)/);
  let sizeClass = `spectrum-Badge--${size}`;

  if (!preRelease) {
    return null;
  }

  return (
    <span style={props.style} className={clsx(badgeStyles['spectrum-Badge'], badgeStyles[sizeClass], badgeStyles[versionMap[preRelease[0]]])}>{preRelease[0]}</span>
  );
}
