'use client';

import type {Page} from '@parcel/rsc';
import {PageSkeleton} from './PageSkeleton';
import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
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
  let skeletonDisplayTime = useRef(0);
  useEffect(() => {
    let timeout;
    return subscribe(() => {
      clearTimeout(timeout);
      
      let snapshot = getSnapshot();
      if (snapshot.promise) {
        // Delay skeleton slightly in case network is fast.
        timeout = setTimeout(() => {
          setDelayedSnapshot(snapshot);
        }, SKELETON_DELAY);
      } else {
        // Ensure that skeleton shows for a minimum amount of time
        // if it shows at all, to avoid a jarring flash.
        let skeletonTimeout = (skeletonDisplayTime.current + MIN_SKELETON_TIME) - Date.now();
        if (skeletonTimeout > 0) {
          timeout = setTimeout(() => {
            setDelayedSnapshot(snapshot);
          }, skeletonTimeout);
        } else {
          setDelayedSnapshot(snapshot);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (delayedSnapshot.promise) {
      skeletonDisplayTime.current = Date.now();
    }
  }, [delayedSnapshot]);

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

export function usePendingPage(): Page {
  let {pages, currentPage} = useRouter();
  let [snapshot, setSnapshot] = useState(getSnapshot());
  let pendingPage = snapshot.pathname ? getPageFromPathname(pages, snapshot.pathname) : null;

  useEffect(() => {
    return subscribe(() => {
      setSnapshot(getSnapshot());
    });
  }, []);

  return pendingPage ?? currentPage;
}

export function Main(props) {
  // Reset key when page changes. This causes the content to scroll to the top.
  let {currentPage} = useRouter();
  return <main key={currentPage.url} {...props} />;
}
