'use client-entry';

import {clearPendingPage} from './Nav';
import {fetchRSC, hydrate} from '@parcel/rsc/client';
import {getPrefetchedPromise, prefetchRoute} from './prefetch';
import {type ReactElement} from 'react';
import {setNavigationLoading} from './NavigationSuspense';
import {UNSTABLE_ToastQueue as ToastQueue} from '@react-spectrum/s2';

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
  let loadingShown = false;
  let [basePath] = pathname.split('#');
  let rscPath = basePath.replace('.html', '.rsc');
  
  window.dispatchEvent(new CustomEvent('rsc-navigation-start'));
  setNavigationLoading(true, pathname);
  loadingShown = true;
  
  // Use prefetched result if available, otherwise fetch
  const prefetchedPromise = getPrefetchedPromise(rscPath);
  const fetchPromise = prefetchedPromise ?? fetchRSC<ReactElement>(rscPath);
  
  try {
    let res = await fetchPromise;
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
          element.scrollIntoView();
        }
      }

      queueMicrotask(() => {
        window.dispatchEvent(new CustomEvent('rsc-navigation'));
        if (loadingShown) {
          setNavigationLoading(false);
        }
      });
    });
  } catch {
    clearPendingPage();
    try {
      let errorRes = await fetchRSC<ReactElement>('/error.rsc');
      updateRoot(errorRes, () => {
        if (push) {
          history.pushState(null, '', '/error.html');
        }
        if (loadingShown) {
          setNavigationLoading(false);
        }
      });
    } catch {
      if (loadingShown) {
        setNavigationLoading(false);
      }
      ToastQueue.negative('Failed to load page. Check your connection and try again.');
    }
  }
}

// Prefetch routes on pointerover
// Use a delay to avoid prefetching when quickly moving over multiple links.
const PREFETCH_DELAY_MS = 100;
let prefetchTimeout: ReturnType<typeof setTimeout> | null = null;
let currentPrefetchLink: HTMLAnchorElement | null = null;

function clearPrefetchTimeout() {
  if (prefetchTimeout) {
    clearTimeout(prefetchTimeout);
    prefetchTimeout = null;
  }
  currentPrefetchLink = null;
}

document.addEventListener('pointerover', e => {
  let link = (e.target as Element).closest('a');
  let publicUrl = process.env.PUBLIC_URL || '/';
  let publicUrlPathname = publicUrl.startsWith('http') ? new URL(publicUrl).pathname : publicUrl;
  
  // Clear any pending prefetch
  clearPrefetchTimeout();
  
  if (
    link &&
    link instanceof HTMLAnchorElement &&
    link.href &&
    (!link.target || link.target === '_self') &&
    link.origin === location.origin &&
    link.pathname !== location.pathname &&
    !link.hasAttribute('download') &&
    link.pathname.startsWith(publicUrlPathname)
  ) {
    currentPrefetchLink = link;
    prefetchTimeout = setTimeout(() => {
      prefetchRoute(link.pathname + link.search + link.hash);
      prefetchTimeout = null;
    }, PREFETCH_DELAY_MS);
  }
}, true);

// Clear prefetch timeout when pointer leaves a link
document.addEventListener('pointerout', e => {
  let link = (e.target as Element).closest('a');
  if (link && link === currentPrefetchLink) {
    clearPrefetchTimeout();
  }
}, true);

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
