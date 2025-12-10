'use client';

import {DOMRefValue} from '@react-types/shared';
import {fetchRSC} from '@parcel/rsc/client';
import {getRSCUrl, isClientLink} from './pageUtils';
import {type ReactElement} from 'react';

const prefetchPromises = new Map<string, Promise<ReactElement>>();

export function prefetchRoute(pathname: string, priority: RequestPriority = 'low') {
  let url = getRSCUrl(pathname);
  
  // Skip if already prefetched
  if (prefetchPromises.has(url)) {
    return;
  }

  if (priority === 'low' && 'connection' in navigator) {
    let conn: any = navigator.connection;
    if (conn.saveData || /2g/.test(conn.effectiveType)) {
      return;
    }
  }
  
  // Start prefetch and cache the promise
  const prefetchPromise = fetchRSC<ReactElement>(url, {priority});

  prefetchPromise.then(res => {
    // Remove from cache after 30 seconds (rely on browser cache for subsequent requests)
    // This is required so we can reuse the same promise on click.
    setTimeout(() => {
      prefetchPromises.delete(url);
    }, 30_000);
    return res;
  })
  .catch(() => {
    prefetchPromises.delete(url);
  });
  
  prefetchPromises.set(url, prefetchPromise);
}

export function getPrefetchedPromise(rscPath: string): Promise<ReactElement> | undefined {
  return prefetchPromises.get(rscPath);
}

let observer = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(entries => {
  for (let entry of entries) {
    if (entry.isIntersecting && entry.target instanceof HTMLAnchorElement) {
      let link = entry.target;
      prefetchRoute(link.pathname + link.search + link.hash);
    }
  }
}) : null;

export function registerLink(element: HTMLAnchorElement | null) {
  if (!element || !isClientLink(element) || element.pathname === location.pathname) {
    return;
  }
  
  observer?.observe(element);
  return () => observer?.unobserve(element);
}

export function registerSpectrumLink(value: DOMRefValue<HTMLAnchorElement> | null) {
  return registerLink(value?.UNSAFE_getDOMNode() || null);
}
