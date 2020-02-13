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
const loadingTypekitIds = new Set();

export default function configureTypekit(typeKitId) {
  if (!typeKitId || loadingTypekitIds.has(typeKitId)) {
    return;
  }

  loadingTypekitIds.add(typeKitId);

  const config = {
    kitId: typeKitId,
    scriptTimeout: 3000
  };

  const h = document.getElementsByTagName('html')[0];
  h.className += ' wf-loading';

  const t = setTimeout(() => {
    h.className = h.className.replace(/(\s|^)wf-loading(\s|$)/g, ' ');
    h.className += ' wf-inactive';
  }, config.scriptTimeout);

  const tk = document.createElement('script');
  let d = false;

  tk.src = `https://use.typekit.net/${config.kitId}.js`;
  tk.type = 'text/javascript';
  tk.async = 'true';
  tk.onload = tk.onreadystatechange = function onload() {
    const a = this.readyState;
    if (d || a && a !== 'complete' && a !== 'loaded') {
      return;
    }
    d = true;
    clearTimeout(t);
    try {
      window.Typekit.load(config);
    } catch (b) { /* empty */ }
  };

  const s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(tk, s);
}
