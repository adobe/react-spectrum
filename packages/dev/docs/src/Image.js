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

export const ImageContext = React.createContext();

export function Hero({wide, narrow, wide2x, narrow2x, alt}) {
  // Temporary fix for parcel issue with relative urls in server rendering.
  let publicUrl = React.useContext(ImageContext);
  let baseUrl = publicUrl.replace(/\/$/, '');
  let narrowUrl = baseUrl + narrow;
  let narrow2xUrl = baseUrl + narrow2x;
  let wideUrl = baseUrl + wide;
  let wide2xUrl = baseUrl + wide2x;
  return (
    <div className={docStyles.heroImage}>
      <picture>
        <source srcset={` ${wideUrl} 967w,  ${wide2xUrl} 2x`} media="(min-width: 600px)" />
        <source srcset={`${narrowUrl} 600w, ${narrow2xUrl} 2x`} media="(max-width: 600px)" />
        <img src={wideUrl} alt={alt} />
      </picture>
    </div>
  );
}
