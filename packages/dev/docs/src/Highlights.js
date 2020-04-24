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

import docStyles from './docs.css';
import React from 'react';
import typographyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';

export function Highlights({items}) {
  return (
    <div className={docStyles.highlights}>
      {items.map(i => (
        <div key={i.title}>
          <h3 className={typographyStyles['spectrum-Heading3']}>{i.title}</h3>
          <p className={typographyStyles['spectrum-Body3']}>{i.description}</p>
          <p className={typographyStyles['spectrum-Body3']}><a href={i.url}>Learn more</a></p>
        </div>
      ))}
    </div>
  );
}
