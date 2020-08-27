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
import path from 'path';
import React from 'react';

export const ImageContext = React.createContext();

export function Hero({wide, narrow, wide2x, narrow2x, wideWebp, narrowWebp, wide2xWebp, narrow2xWebp, alt}) {
  // Temporary fix for parcel issue with relative urls in server rendering.
  let publicUrl = React.useContext(ImageContext);
  let baseUrl = publicUrl.replace(/\/$/, '');
  let narrowUrl = baseUrl + '/' + path.basename(narrow);
  let narrow2xUrl = baseUrl + '/' + path.basename(narrow2x);
  let wideUrl = baseUrl + '/' + path.basename(wide);
  let wide2xUrl = baseUrl + '/' + path.basename(wide2x);
  let narrowWebpUrl = baseUrl + '/' + path.basename(narrowWebp);
  let narrow2xWebpUrl = baseUrl + '/' + path.basename(narrow2xWebp);
  let wideWebpUrl = baseUrl + '/' + path.basename(wideWebp);
  let wide2xWebpUrl = baseUrl + '/' + path.basename(wide2xWebp);

  return (
    <div className={docStyles.heroImage}>
      <picture>
        <source srcSet={` ${wideWebpUrl} 967w,  ${wide2xWebpUrl} 2x`} type="image/webp" media="(min-width: 600px)" />
        <source srcSet={`${narrowWebpUrl} 600w, ${narrow2xWebpUrl} 2x`} type="image/webp" media="(max-width: 600px)" />
        <source srcSet={` ${wideUrl} 967w,  ${wide2xUrl} 2x`} type="image/png" media="(min-width: 600px)" />
        <source srcSet={`${narrowUrl} 600w, ${narrow2xUrl} 2x`} type="image/png" media="(max-width: 600px)" />
        <img src={wideUrl} alt={alt} />
      </picture>
    </div>
  );
}

export function Video({src, ...otherProps}) {
  let publicUrl = React.useContext(ImageContext);
  let baseUrl = publicUrl.replace(/\/$/, '');
  let url = baseUrl + '/' + path.basename(src);

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video src={url} playsInline className={docStyles.video} {...otherProps} />
  );
}
