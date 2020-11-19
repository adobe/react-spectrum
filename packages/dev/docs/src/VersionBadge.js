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


import badgeStyles from '@adobe/spectrum-css-temp/components/label/vars.css';
import clsx from 'clsx';
import React from 'react';

export function VersionBadge(props) {
  let {
    version = ''
  } = props;

  let versionMap = {
    'alpha': 'spectrum-Label--green',
    'beta': 'spectrum-Label--blue',
    'rc': 'spectrum-Label--green'
  };

  let preRelease = version.match(/(alpha)|(beta)|(rc)/);

  if (!preRelease) {
    return null;
  }

  return (
    <span className={clsx(badgeStyles['spectrum-Label'], badgeStyles[versionMap[preRelease[0]]])}>{preRelease[0]}</span>
  );
}
