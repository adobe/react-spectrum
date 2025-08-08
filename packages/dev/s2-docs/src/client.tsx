'use client-entry';

import {fetchRSC, hydrate} from '@parcel/rsc/client';
import type {ReactElement} from 'react';

// Hydrate initial RSC payload embedded in the HTML.
let updateRoot = hydrate({
  // Intercept HMR window reloads, and do it with RSC instead.
  onHmrReload() {
    navigate(location.pathname);
  }
});

// A very simple router. When we navigate, we'll fetch a new RSC payload from the server,
// and in a React transition, stream in the new page. Once complete, we'll pushState to 
// update the URL in the browser.
async function navigate(pathname: string, push = false) {
  let res = fetchRSC<ReactElement>(pathname.replace('.html', '.rsc'));
  updateRoot(res, () => {
    if (push) {
      history.pushState(null, '', pathname);
      push = false;
    }
  });
}

// Intercept link clicks to perform RSC navigation.
document.addEventListener('click', e => {
  let link = (e.target as Element).closest('a');
  if (
    link &&
    link instanceof HTMLAnchorElement &&
    link.href &&
    (!link.target || link.target === '_self') &&
    link.origin === location.origin &&
    link.pathname !== location.pathname &&
    !link.hasAttribute('download') &&
    e.button === 0 && // left clicks only
    !e.metaKey && // open in new tab (mac)
    !e.ctrlKey && // open in new tab (windows)
    !e.altKey && // download
    !e.shiftKey &&
    !e.defaultPrevented
  ) {
    e.preventDefault();
    navigate(link.pathname, true);
  }
});

// When the user clicks the back button, navigate with RSC.
window.addEventListener('popstate', () => {
  navigate(location.pathname);
});
