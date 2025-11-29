'use client';

import {fetchRSC} from '@parcel/rsc/client';
import {getRSCUrl} from './pageUtils';
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
    setTimeout(() => {
      prefetchPromises.delete(url);
    }, 30_000);
    return res;
  })
  .catch((err) => {
    prefetchPromises.delete(url);
  });
  
  prefetchPromises.set(url, prefetchPromise);
}

export function getPrefetchedPromise(rscPath: string): Promise<ReactElement> | undefined {
  return prefetchPromises.get(rscPath);
}
