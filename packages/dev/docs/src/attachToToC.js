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
import sideNavStyles from '@adobe/spectrum-css-temp/components/sidenav/vars.css';

export function attachToToC() {
  let tocLinks = document.querySelectorAll('#toc a');
  let headers = [];
  for (let link of tocLinks) {
    let headerId = link.href.split('#').pop();
    let header = document.querySelector(`#${headerId}`);
    headers.push({link, header});
  }

  function updateToc() {
    // this needs to be improved a little but the math hurts my head right now
    // right now it's impossible to select the last section if the last two heights combined are smaller than the viewport height
    headers.some((header, i) => {
      if ((header.header.offsetTop + header.header.getBoundingClientRect().height) > document.body.scrollTop) {
        let currentSelection = document.querySelectorAll(`#toc .${sideNavStyles['is-selected']}`);
        if (currentSelection) {
          currentSelection.forEach(node => node.classList.remove(sideNavStyles['is-selected']));
        }
        header.link.parentElement.classList.add(sideNavStyles['is-selected']);
        return true;
      }
    });
  }

  updateToc();

  document.addEventListener('scroll', () => {
    updateToc();
  });
}
