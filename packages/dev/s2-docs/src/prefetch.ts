'use client';

import {fetchRSC} from '@parcel/rsc/client';
import {type ReactElement} from 'react';

const prefetchedRoutes = new Set<string>();
const prefetchPromises = new Map<string, Promise<ReactElement>>();

export function prefetchRoute(pathname: string) {
  let [basePath] = pathname.split('#');
  let rscPath = basePath.replace('.html', '.rsc');
  
  // Skip if already prefetched or currently prefetching
  if (prefetchedRoutes.has(rscPath) || prefetchPromises.has(rscPath)) {
    return;
  }
  
  // Start prefetch and cache the promise
  const prefetchPromise = fetchRSC<ReactElement>(rscPath)
    .then(res => {
      prefetchedRoutes.add(rscPath);
      prefetchPromises.delete(rscPath);
      return res;
    })
    .catch(() => {
      prefetchPromises.delete(rscPath);
      return Promise.reject<ReactElement>(new Error('Prefetch failed'));
    });
  
  prefetchPromises.set(rscPath, prefetchPromise);
}

export function getPrefetchedPromise(rscPath: string): Promise<ReactElement> | undefined {
  return prefetchPromises.get(rscPath);
}
