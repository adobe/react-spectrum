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

import {Flex} from '@react-spectrum/layout';
import {Link} from '@adobe/react-spectrum';
import React from 'react';
// @ts-ignore
import url from 'url:../pages/assets/wallpaper_collaborative_S2_desktop.webp';

export function MigrationBanner({currentPage}) {
  if (!currentPage || !currentPage.name) {
    return null;
  }

  let parts = currentPage.name.split('/');
  let section = parts[0];
  let isIndexPage = /^(?:[^/]+\/)?index\.html$/.test(currentPage.name);

  // only banner on react-stately index page, not other index pages
  if (isIndexPage && section !== 'react-stately') {
    return null;
  }

  let content;
  if (section === 'react-aria') {
    content = (
      <>
        <Link variant="overBackground">
          <a href="https://react-aria.adobe.com/index.html">
            React Aria
          </a>
        </Link>
        {' has a new home!'}
      </>
    );
  } else if (section === 'v3') {
    content = (
      <>
        <Link variant="overBackground">
          <a href="https://react-spectrum.adobe.com/index.html">
            React Spectrum
          </a>
        </Link>
        {' has a new home!'}
      </>
    );
  } else if (section === 'react-stately') {
    content = (
      <>
        <Link variant="overBackground">
          <a href="https://react-aria.adobe.com/index.html">
            React Aria
          </a>
        </Link>
        {' and '}
        <Link variant="overBackground">
          <a href="https://react-spectrum.adobe.com/index.html">
            React Spectrum
          </a>
        </Link>
        {' have a new home!'}
      </>
    );
  }

  return (
    <header
      style={{
        backgroundImage: `url(${url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        padding: '48px',
        marginBottom: '32px',
        borderRadius: '12px'
      }}>
      <Flex direction="row" alignItems="center" gap="size-100" wrap>
        <span
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'white',
            lineHeight: 1.3
          }}>
          {content}
        </span>
      </Flex>
    </header>
  );
}
