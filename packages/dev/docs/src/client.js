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

import {ActionButton} from '@react-spectrum/button';
import docsStyle from './docs.css';
import React, {useEffect} from 'react';
import ReactDOM from 'react-dom';
import ShowMenu from '@spectrum-icons/workflow/ShowMenu';
import {ThemeSwitcher} from './ThemeSwitcher';

let title = document.querySelector('h1');

// Size the title to fit the available space.
function updateTitleFontSize() {
  let fontSize = parseInt(window.getComputedStyle(title).fontSize, 10);
  
  // Constrain font size to 58px, or 10% of the window width, whichever is smaller.
  let maxFontSize = Math.min(58, window.innerWidth * 0.1);
  if (fontSize > maxFontSize) {
    fontSize = maxFontSize;
    title.style.fontSize = maxFontSize + 'px';
  }

  // If the font size is less than the maximum font size,
  // increase the font size until it overflows.
  while (fontSize < maxFontSize && title.scrollWidth <= title.clientWidth) {
    fontSize++;
    title.style.fontSize = fontSize + 'px';
  }

  // Reduce the font size until it doesn't overflow.
  while (title.scrollWidth > title.clientWidth) {
    fontSize--;
    title.style.fontSize = fontSize + 'px';
  }
}

updateTitleFontSize();
window.addEventListener('resize', updateTitleFontSize);

function Hamburger() {
  let onPress = () => {
    document.querySelector('.' + docsStyle.nav).classList.toggle(docsStyle.visible);
  };

  useEffect(() => {
    let nav = document.querySelector('.' + docsStyle.nav);
    let main = document.querySelector('main');
    let onClick = () => {
      nav.classList.remove(docsStyle.visible);
    };

    main.addEventListener('click', onClick);
    return () => {
      main.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <ActionButton onPress={onPress}>
      <ShowMenu />
    </ActionButton>
  );
}

ReactDOM.render(<>
  <Hamburger />
  <ThemeSwitcher />
</>, document.getElementById('header'));
