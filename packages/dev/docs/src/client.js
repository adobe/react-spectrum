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
import {hideOthers} from 'aria-hidden';
import docsStyle from './docs.css';
import {listen} from 'quicklink';
import React, {useEffect} from 'react';
import ReactDOM from 'react-dom';
import ShowMenu from '@spectrum-icons/workflow/ShowMenu';
import {ThemeSwitcher} from './ThemeSwitcher';

window.addEventListener('load', () => listen());

let title = document.querySelector('h1');

// Size the title to fit the available space.
function updateTitleFontSize() {
  let fontSize = parseInt(window.getComputedStyle(title).fontSize, 10);

  // Constrain font size to 58px, or 10% of the window width, whichever is smaller.
  let maxFontSize = Math.min(58, Math.round(window.innerWidth * 0.1));
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

// Use ResizeObserver where available to detect size changes not related to window resizing, e.g. font loading.
if (typeof ResizeObserver !== 'undefined') {
  let observer = new ResizeObserver(() => {
    // Avoid updating the layout during the resize event and creating circular notifications.
    requestAnimationFrame(updateTitleFontSize);
  });
  observer.observe(title);
} else {
  window.addEventListener('resize', updateTitleFontSize);
}

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
    <ActionButton UNSAFE_className={docsStyle.hamburgerButton} onPress={onPress} aria-label="Open navigation panel">
      <ShowMenu />
    </ActionButton>
  );
}

ReactDOM.render(<>
  <Hamburger />
  <ThemeSwitcher />
</>, document.getElementById('header'));

document.addEventListener('mousedown', (e) => {
  // Prevent focusing on links to other pages with the mouse to avoid flash of focus ring during navigation.
  let link = e.target.closest('a');
  if (link && (link.host !== location.host || link.pathname !== location.pathname)) {
    e.preventDefault();
  }

  // Add mouse focus class to summary elements on mouse down to prevent native browser focus from showing.
  if (e.target.tagName === 'SUMMARY') {
    e.target.classList.add(docsStyle.mouseFocus);
  }
});

// Remove mouse focus class on blur of a summary element.
document.addEventListener('blur', (e) => {
  if (e.target.tagName === 'SUMMARY') {
    e.target.classList.remove(docsStyle.mouseFocus);
  }
}, true);

/**
 * Listen for additions to the child list of body. This is where providers render modal portals.
 * When one is added, see if there is a modal inside it, if there is, then hide everything else from screen readers.
 * If there was already a modal open and a new one was added, undo everything that the previous modal had hidden and hide based on the new one.
 *
 * If a modal container is removed, then undo the hiding based on the last hide others. Check if there are any other modals still around, and
 * hide based on the furthest one down in the dom.
 */
let target = document.querySelector('body');
let config = {childList: true};
let modalContainer = [];
let undo;

let bodyObserver = new MutationObserver((mutationRecord) => {
  for (let mutation of mutationRecord) {
    mutation.type === 'childList' && console.log(!modalContainer, mutation.addedNodes.length > 0, mutation.addedNodes, Array.from(mutation.addedNodes).some(node => node.attributes['data-modalcontainer']));
    if (mutation.type === 'childList' && !modalContainer && mutation.addedNodes.length > 0 && Array.from(mutation.addedNodes).some(node => node.attributes['data-modalcontainer'])) {
      modalContainer.push(mutation.addedNodes[mutation.addedNodes.length - 1]);
      let modal = modalContainer[modalContainer.length - 1].querySelector('[aria-modal="true"]');
      if (undo) {
        undo();
      }
      undo = hideOthers(modal);
    } else if (mutation.type === 'childList' && modalContainer && mutation.removedNodes.length > 0 && mutation.removedNodes[0] === modalContainer) {
      undo();
      delete modalContainer[mutation.removedNodes[0]];
      if (modalContainer.length > 0) {
        let modal = modalContainer[modalContainer.length - 1].querySelector('[aria-modal="true"]');
        undo = hideOthers(modal);
      } else {
        undo = undefined;
      }
    }
  }
});
bodyObserver.observe(target, config);
