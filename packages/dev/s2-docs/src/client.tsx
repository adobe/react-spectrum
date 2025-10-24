'use client-entry';

import {fetchRSC, hydrate} from '@parcel/rsc/client';
import type {ReactElement} from 'react';

// Hydrate initial RSC payload embedded in the HTML.
let updateRoot = hydrate({
  // Intercept HMR window reloads, and do it with RSC instead.
  onHmrReload() {
    navigate(location.pathname + location.search + location.hash);
  }
});

// A very simple router. When we navigate, we'll fetch a new RSC payload from the server,
// and in a React transition, stream in the new page. Once complete, we'll pushState to
// update the URL in the browser.
async function navigate(pathname: string, push = false) {
  try {
    let res = await fetchRSC<ReactElement>(pathname.replace('.html', '.rsc'));
    let currentPath = location.pathname;
    let [newBasePath, newPathAnchor] = pathname.split('#');

    updateRoot(res, () => {
      if (push) {
        history.pushState(null, '', pathname);
        push = false;
      }

      // Reset scroll if navigating to a different page without an anchor
      if (currentPath !== newBasePath && !newPathAnchor) {
        window.scrollTo(0, 0);
      } else if (newPathAnchor) {
        let element = document.getElementById(newPathAnchor);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          });
        }
      }
    });
  } catch {
    let errorRes = await fetchRSC<ReactElement>('/error.rsc');
    updateRoot(errorRes, () => {
      if (push) {
        history.pushState(null, '', '/error.html');
      }
    });
  }
}

// Intercept link clicks to perform RSC navigation.
document.addEventListener('click', e => {
  let link = (e.target as Element).closest('a');
  let publicUrl = process.env.PUBLIC_URL || '/';
  let publicUrlPathname = publicUrl.startsWith('http') ? new URL(publicUrl).pathname : publicUrl;
  if (
    link &&
    link instanceof HTMLAnchorElement &&
    link.href &&
    (!link.target || link.target === '_self') &&
    link.origin === location.origin &&
    link.pathname !== location.pathname &&
    !link.hasAttribute('download') &&
    link.pathname.startsWith(publicUrlPathname) &&
    e.button === 0 && // left clicks only
    !e.metaKey && // open in new tab (mac)
    !e.ctrlKey && // open in new tab (windows)
    !e.altKey && // download
    !e.shiftKey &&
    !e.defaultPrevented
  ) {
    e.preventDefault();
    navigate(link.pathname + link.search + link.hash, true);
  }
});

// When the user clicks the back button, navigate with RSC.
window.addEventListener('popstate', () => {
  navigate(location.pathname + location.search + location.hash);
});
