'use client';

import type {Page} from '@parcel/rsc';
import {PageSkeleton} from './PageSkeleton';
import React, {createContext, useContext, useEffect, useState} from 'react';
import {useLayoutEffect} from '@react-aria/utils';

const SKELETON_DELAY = 150;
const MIN_SKELETON_TIME = 300;

let navigationPromise: Promise<void> | null = null;
let targetPathname: string | null = null;
let listeners = new Set<() => void>();
let cachedSnapshot: {promise: Promise<void> | null, pathname: string | null} = {promise: null, pathname: null};

export function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function getSnapshot() {
  if (cachedSnapshot.promise !== navigationPromise || cachedSnapshot.pathname !== targetPathname) {
    cachedSnapshot = {promise: navigationPromise, pathname: targetPathname};
  }
  return cachedSnapshot;
}

export function setNavigationPromise(promise: Promise<void> | null, pathname?: string) {
  targetPathname = pathname || null;
  navigationPromise = promise;
  
  if (promise) {
    promise.finally(() => {
      if (navigationPromise === promise) {
        navigationPromise = null;
        listeners.forEach(callback => callback());
      }
    });
  }
  
  listeners.forEach(callback => callback());
}

export function getPageFromPathname(pages: Page[], url: string | null): Page | null {
  if (!url) {
    return null;
  }
  
  return pages.find(p => p.url === url) ?? null;
}

function useDelayedSnapshot() {
  let [delayedSnapshot, setDelayedSnapshot] = useState(getSnapshot());
  useEffect(() => {
    let timeout;
    let skeletonMinTime = 0;
    return subscribe(() => {
      clearTimeout(timeout);
      
      let snapshot = getSnapshot();
      if (snapshot.promise) {
        timeout = setTimeout(() => {
          setDelayedSnapshot(snapshot);
          skeletonMinTime = Date.now() + MIN_SKELETON_TIME;
        }, SKELETON_DELAY);
      } else {
        let skeletonTimeout = skeletonMinTime - Date.now();
        if (skeletonTimeout > 0) {
          timeout = setTimeout(() => {
            setDelayedSnapshot(snapshot);
            skeletonMinTime = 0;
          }, skeletonTimeout);
        } else {
          setDelayedSnapshot(snapshot);
          skeletonMinTime = 0;
        }
      }
    });
  }, []);

  return delayedSnapshot;
}

export function NavigationSuspense({children}: {children: React.ReactNode}) {
  let {isLoading} = useContext(RouterContext)!;

  useLayoutEffect(() => {
    // Scroll to the top when we show the skeleton on mobile.
    if (isLoading) {
      window.scrollTo({top: 0});
    }
  }, [isLoading]);

  return isLoading
    ? <PageSkeleton />
    : children;
}

interface RouterContextValue {
  currentPage: Page,
  pages: Page[],
  isLoading: boolean
}

const RouterContext = createContext<RouterContextValue | null>(null);

export function Router({currentPage, pages, children}) {
  let snapshot = useDelayedSnapshot();
  let displayPage = snapshot.promise ? getPageFromPathname(pages, snapshot.pathname) : currentPage;

  return (
    <RouterContext value={{currentPage: displayPage, pages, isLoading: !!snapshot.promise}}>
      {children}
    </RouterContext>
  );
}

export function useRouter(): RouterContextValue {
  return useContext(RouterContext)!;
}

export function Main(props) {
  // Reset key when page changes. This causes the content to scroll to the top.
  let {currentPage} = useRouter();
  return <main key={currentPage.url} {...props} />;
}
