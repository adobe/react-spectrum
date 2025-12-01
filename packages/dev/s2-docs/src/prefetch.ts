'use client';

import {fetchRSC} from '@parcel/rsc/client';
import {getRSCUrl} from './pageUtils';
import {type ReactElement} from 'react';

const prefetchPromises = new Map<string, Promise<ReactElement>>();

export function prefetchRoute(pathname: string) {
  let url = getRSCUrl(pathname);
  
  // Skip if currently prefetching
  if (prefetchPromises.has(url)) {
    return;
  }
  
  // Start prefetch and cache the promise
  const prefetchPromise = fetchRSC<ReactElement>(url)
    .then(res => {
      // Remove from cache once resolved (rely on browser cache for subsequent requests)
      prefetchPromises.delete(url);
      return res;
    })
    .catch(() => {
      prefetchPromises.delete(url);
      return Promise.reject<ReactElement>(new Error('Prefetch failed'));
    });

  // Silently handle prefetch failures
  prefetchPromise.catch(() => {});
  
  prefetchPromises.set(url, prefetchPromise);
}

export function getPrefetchedPromise(rscPath: string): Promise<ReactElement> | undefined {
  return prefetchPromises.get(rscPath);
}
