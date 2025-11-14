'use client';

import {fetchRSC} from '@parcel/rsc/client';
import {type ReactElement} from 'react';

const prefetchPromises = new Map<string, Promise<ReactElement>>();

export function prefetchRoute(pathname: string) {
  let [basePath] = pathname.split('#');
  let rscPath = basePath.replace('.html', '.rsc');
  
  // Skip if currently prefetching
  if (prefetchPromises.has(rscPath)) {
    return;
  }
  
  // Start prefetch and cache the promise
  const prefetchPromise = fetchRSC<ReactElement>(rscPath)
    .then(res => {
      // Remove from cache once resolved (rely on browser cache for subsequent requests)
      prefetchPromises.delete(rscPath);
      return res;
    })
    .catch(() => {
      prefetchPromises.delete(rscPath);
      return Promise.reject<ReactElement>(new Error('Prefetch failed'));
    });

  // Silently handle prefetch failures
  prefetchPromise.catch(() => {});
  
  prefetchPromises.set(rscPath, prefetchPromise);
}

export function getPrefetchedPromise(rscPath: string): Promise<ReactElement> | undefined {
  return prefetchPromises.get(rscPath);
}
