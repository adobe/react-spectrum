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

export function getAnchorProps(href) {
  if (!/^http/.test(href) || /localhost|reactspectrum\.blob\.core\.windows\.net|react-spectrum\.(corp\.)?adobe\.com|^#/.test(href)) {
    return {};
  }

  if (/^\//.test(href)) {
    return {};
  }

  return {target: '_blank', rel: 'noreferrer'};
}
