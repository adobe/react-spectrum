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

export function walk(obj, fn, k = null) {
  let recurse = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map((item, i) => walk(item, fn, k));
    } else if (obj && typeof obj === 'object') {
      let res = {};
      for (let key in obj) {
        res[key] = walk(obj[key], fn, key);
      }
      return res;
    } else {
      return obj;
    }
  };
  return fn(obj, k, recurse);
}

export function getUsedLinks(obj, links, usedLinks = {}) {
  walk(obj, (t, k, recurse) => {
    // don't follow the link if it's already in links, that's circular
    if (t && t.type === 'link' && !usedLinks[t.id]) {
      usedLinks[t.id] = links[t.id];
      getUsedLinks(links[t.id], links, usedLinks);
    }

    return recurse(t);
  });

  return usedLinks;
}

const BASE_URL = {
  dev: {
    'react-aria': 'http://localhost:1234',
    'v3': 'http://localhost:1234/v3'
  },
  stage: {
    'react-aria': 'https://d5iwopk28bdhl.cloudfront.net',
    'v3': 'https://d1pzu54gtk2aed.cloudfront.net/v3'
  },
  prod: {
    'react-aria': 'https://react-aria.adobe.com',
    'v3': 'https://react-spectrum.adobe.com/v3'
  }
};

export function getBaseUrl(library) {
  let env = process.env.DOCS_ENV;
  let base = env
    ? BASE_URL[env][library]
    : `http://localhost:1234/${library}`;
  let publicUrl = process.env.PUBLIC_URL;
  if (publicUrl) {
    let url = new URL(base);
    url.pathname = publicUrl.replace(/\/$/, '') + url.pathname.replace(/\/$/, '');
    base = url.href;
  }
  return base.replace(/\/$/, '');
}

export function getAnchorProps(href) {
  if (href.startsWith('v3:') || href.startsWith('react-aria:')) {
    let url = new URL(href);
    return {href: getBaseUrl(url.protocol.slice(0, -1)) + '/' + url.pathname};
  }

  if (!/^http/.test(href) || /localhost|reactspectrum\.blob\.core\.windows\.net|react-spectrum\.(corp\.)?adobe\.com|^#/.test(href)) {
    return {};
  }

  if (/^\//.test(href)) {
    return {};
  }

  return {target: '_blank', rel: 'noreferrer'};
}
