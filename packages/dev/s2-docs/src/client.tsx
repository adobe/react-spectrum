'use client-entry';

import {fetchRSC, hydrate} from '@parcel/rsc/client';
import {getPrefetchedPromise, prefetchRoute} from './prefetch';
import {getRSCUrl, isClientLink} from './pageUtils';
import {type ReactElement} from 'react';
import {setNavigationPromise} from './Router';
import {ToastQueue} from '@react-spectrum/s2';

if ('scrollRestoration' in history) {
  // Disable browser's automatic scroll restoration since we handle it manually
  history.scrollRestoration = 'manual';
}

// Hydrate initial RSC payload embedded in the HTML.
let updateRoot = hydrate({
  // Intercept HMR window reloads, and do it with RSC instead.
  onHmrReload() {
    navigate(location.pathname + location.search + location.hash);
  }
});

// Track the current navigation to prevent race conditions
let currentNavigationId = 0;
let currentAbortController: AbortController | null = null;

interface HistoryState {
  scrollTop?: number,
  windowScrollTop?: number
}

function getScrollContainer(): HTMLElement | null {
  return document.querySelector('main');
}

function saveScrollPosition() {
  let scrollContainer = getScrollContainer();
  let scrollTop = scrollContainer?.scrollTop ?? 0;
  let windowScrollTop = window.scrollY;
  let state: HistoryState = {
    ...(history.state as HistoryState | null),
    scrollTop,
    windowScrollTop
  };
  history.replaceState(state, '', location.href);
}

function restoreScrollPosition(state: HistoryState | null) {
  if (state?.scrollTop != null || state?.windowScrollTop != null) {
    requestAnimationFrame(() => {
      let scrollContainer = getScrollContainer();
      if (scrollContainer && state.scrollTop != null) {
        scrollContainer.scrollTop = state.scrollTop;
      }
      if (state.windowScrollTop != null) {
        window.scrollTo(0, state.windowScrollTop);
      }
    });
  }
}

// A very simple router. When we navigate, we'll fetch a new RSC payload from the server,
// and in a React transition, stream in the new page. Once complete, we'll pushState to
// update the URL in the browser.
async function navigate(pathname: string, push = false, popstateState: HistoryState | null = null) {
  let url = new URL(pathname, location.href);
  let basePath = url.pathname;
  let pathAnchor = url.hash.slice(1);
  let currentPath = location.pathname;
  let isSamePageAnchor = (!basePath || basePath === currentPath) && pathAnchor;
  
  // Save scroll position to current history entry before navigating away
  if (push) {
    saveScrollPosition();
  }
  
  if (isSamePageAnchor) {
    if (push) {
      history.pushState(null, '', pathname);
    }
    
    // Scroll to the anchor
    let element = document.getElementById(pathAnchor);
    if (element) {
      element.scrollIntoView();
    }
    return;
  }
  
  let rscPath = getRSCUrl(pathname);
  
  // Cancel any in-flight navigation
  if (currentAbortController) {
    currentAbortController.abort('Aborting due to new navigation');
  }
  
  // Create a new abort controller for this navigation
  const abortController = new AbortController();
  currentAbortController = abortController;
  const navigationId = ++currentNavigationId;
  
  const navigationPromise = (async () => {
    window.dispatchEvent(new CustomEvent('rsc-navigation-start'));
    
    // Use prefetched result if available, otherwise fetch
    const prefetchedPromise = getPrefetchedPromise(rscPath);
    const fetchPromise = prefetchedPromise ?? fetchRSC<ReactElement>(rscPath);
    
    try {
      let res = await fetchPromise;
      
      // Check if this navigation is still current before updating
      if (navigationId !== currentNavigationId) {
        // A newer navigation has started, ignore this result
        return;
      }
      
      // Check if this navigation was aborted
      if (abortController.signal.aborted) {
        return;
      }
      
      let currentPath = location.pathname;
      let [newBasePath, newPathAnchor] = pathname.split('#');

      // Return a promise that resolves after updateRoot callback completes
      await new Promise<void>((resolve) => {
        updateRoot(res, () => {
          if (push) {
            history.pushState(null, '', pathname);
            push = false;
          }

          // Handle scroll position
          if (popstateState) {
            // Restore scroll position from history state (back/forward navigation)
            restoreScrollPosition(popstateState);
          } else if (currentPath !== newBasePath && !newPathAnchor) {
            // Reset scroll for forward navigation to a different page without an anchor
            let scrollContainer = getScrollContainer();
            if (scrollContainer) {
              scrollContainer.scrollTop = 0;
            }
            window.scrollTo(0, 0);
          } else if (newPathAnchor) {
            // Scroll to anchor
            let element = document.getElementById(newPathAnchor);
            if (element) {
              element.scrollIntoView();
            }
          }

          queueMicrotask(() => {
            window.dispatchEvent(new CustomEvent('rsc-navigation'));
            resolve();
          });
        });
      });
    } catch (error) {
      // Check if this navigation was aborted
      if (abortController.signal.aborted) {
        return;
      }
      
      // Check if this navigation is still current
      if (navigationId !== currentNavigationId) {
        return;
      }
      
      try {
        let errorRes = await fetchRSC<ReactElement>('/error.rsc');
        
        // Check again if still current after error fetch
        if (navigationId !== currentNavigationId || abortController.signal.aborted) {
          return;
        }
        
        await new Promise<void>((resolve) => {
          updateRoot(errorRes, () => {
            if (push) {
              history.pushState(null, '', '/error.html');
            }
            resolve();
          });
        });
      } catch {
        // Only show error toast if this is still the current navigation
        if (navigationId === currentNavigationId && !abortController.signal.aborted) {
          ToastQueue.negative('Failed to load page. Check your connection and try again.');
        }
        throw error; // Re-throw to keep promise rejected
      }
    }
  })();
  
  url.hash = '';
  url.search = '';
  setNavigationPromise(navigationPromise, url.href);
}

// Prefetch routes on pointerover
// Use a delay to avoid prefetching when quickly moving over multiple links.
const PREFETCH_DELAY_MS = 65;
let prefetchTimeout: ReturnType<typeof setTimeout> | null = null;
let currentPrefetchLink: HTMLAnchorElement | null = null;

function clearPrefetchTimeout() {
  if (prefetchTimeout) {
    clearTimeout(prefetchTimeout);
    prefetchTimeout = null;
  }
  currentPrefetchLink = null;
}

document.addEventListener('pointerenter', e => {
  if (e.pointerType !== 'mouse') {
    return;
  }

  let link = e.target instanceof Element ? e.target.closest('a') : null;
  
  // Clear any pending prefetch
  clearPrefetchTimeout();
  
  if (link && isClientLink(link) && link.pathname !== location.pathname) {
    currentPrefetchLink = link;
    prefetchTimeout = setTimeout(() => {
      prefetchRoute(link.pathname + link.search + link.hash);
      prefetchTimeout = null;
    }, PREFETCH_DELAY_MS);
  }
}, true);

// Prefetch immediately on pointer down, with high priority.
document.addEventListener('pointerdown', e => {
  let link = e.target instanceof Element ? e.target.closest('a') : null;

  // Clear any pending prefetch
  clearPrefetchTimeout();

  if (link && isClientLink(link) && link.pathname !== location.pathname) {
    currentPrefetchLink = link;
    prefetchRoute(link.pathname + link.search + link.hash, 'high');
  }
}, true);

// Clear prefetch timeout when pointer leaves a link
document.addEventListener('pointerleave', e => {
  if (e.pointerType !== 'mouse') {
    return;
  }

  let link = e.target instanceof Element ? e.target.closest('a') : null;
  if (link && link === currentPrefetchLink) {
    clearPrefetchTimeout();
  }
}, true);

document.addEventListener('focus', e => {
  let link = e.target instanceof Element ? e.target.closest('a') : null;
  
  // Clear any pending prefetch
  clearPrefetchTimeout();
  
  if (link && isClientLink(link) && link.pathname !== location.pathname) {
    currentPrefetchLink = link;
    prefetchTimeout = setTimeout(() => {
      prefetchRoute(link.pathname + link.search + link.hash);
      prefetchTimeout = null;
    }, PREFETCH_DELAY_MS);
  }
}, true);

// Clear prefetch timeout when focus leaves a link
document.addEventListener('blur', e => {
  let link = e.target instanceof Element ? e.target.closest('a') : null;
  if (link && link === currentPrefetchLink) {
    clearPrefetchTimeout();
  }
}, true);

// Intercept link clicks to perform RSC navigation.
document.addEventListener('click', e => {
  let link = e.target instanceof Element ? e.target.closest('a') : null;
  if (
    link &&
    isClientLink(link) &&
    link.pathname !== location.pathname &&
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

// When the user clicks the back/forward button, navigate with RSC.
window.addEventListener('popstate', (e) => {
  navigate(location.pathname + location.search + location.hash, false, e.state as HistoryState | null);
});

// Save scroll position to history state when scrolling stops.
let scrollSaveTimeout: ReturnType<typeof setTimeout> | null = null;
function onScroll() {
  if (scrollSaveTimeout) {
    clearTimeout(scrollSaveTimeout);
  }
  scrollSaveTimeout = setTimeout(saveScrollPosition, 150);
}

window.addEventListener('scroll', onScroll, {passive: true, capture: true});

function scrollToCurrentHash() {
  if (!location.hash || location.hash === '#') {
    return;
  }

  let anchorId = location.hash.slice(1);
  try {
    anchorId = decodeURIComponent(anchorId);
  } catch {
    // Fall back to raw hash
  }

  if (!anchorId) {
    return;
  }

  requestAnimationFrame(() => {
    let element = document.getElementById(anchorId);
    if (element) {
      element.scrollIntoView();
    }
  });
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  scrollToCurrentHash();
} else {
  window.addEventListener('DOMContentLoaded', scrollToCurrentHash, {once: true});
}
