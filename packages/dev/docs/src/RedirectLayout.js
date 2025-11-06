/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import React from 'react';

export function RedirectLayout(props) {
  let {redirectTo} = props;

  return (
    <html lang="en-US">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="refresh" content={`0; url=${redirectTo}`} />
        <link rel="canonical" href={redirectTo} />
        <title>Redirecting...</title>
      </head>
      <body>
        <p>This page has moved to <a href={redirectTo}>{redirectTo}</a>.</p>
      </body>
    </html>
  );
}
