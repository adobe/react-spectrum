'use client';

import type {Page} from '@parcel/rsc';
import {PageSkeleton} from './PageSkeleton';
import React, {Suspense, use, useEffect, useState, useSyncExternalStore} from 'react';

const SKELETON_DELAY = 150;

let navigationPromise: Promise<void> | null = null;
let targetPathname: string | null = null;
let listeners = new Set<() => void>();
let cachedSnapshot: {promise: Promise<void> | null, pathname: string | null} = {promise: null, pathname: null};

export function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
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

function getPageInfo(pages: Page[], pathname: string | null) {
  const targetPage = getPageFromPathname(pages, pathname);
  
  if (!targetPage) {
    return {};
  }
  
  const title = targetPage.tableOfContents?.[0]?.title;
  const section = (targetPage.exports?.section as string) || 'Components';
  const hasToC = !targetPage.exports?.hideNav && targetPage.tableOfContents?.[0]?.children && targetPage.tableOfContents?.[0]?.children?.length > 0;
  let isSubpage = targetPage.exports?.isSubpage;
  let isLongForm = isSubpage && section === 'Blog';
  let isWide = !hasToC && !isLongForm && section !== 'Blog' && section !== 'Releases';

  return {title, section, hasToC, isLongForm, isWide};
}

export function useDelayedSnapshot() {
  let snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  let [delayedSnapshot, setDelayedSnapshot] = useState<typeof snapshot>(snapshot);
  useEffect(() => {
    let timeout = setTimeout(() => {
      setDelayedSnapshot(snapshot);
    }, SKELETON_DELAY);
    return () => clearTimeout(timeout);
  }, [snapshot]);

  return delayedSnapshot;
}

function NavigationContent({children}: {children: React.ReactNode}) {
  let snapshot = useDelayedSnapshot();
  if (snapshot.promise) {
    use(snapshot.promise);
  }

  return <>{children}</>;
}

export function NavigationSuspense({children, pages}: {children: React.ReactNode, pages: Page[]}) {
  // Subscribe to get the latest targetPathname for skeleton page info
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const pageInfo = getPageInfo(pages, snapshot.pathname);

  return (
    <Suspense fallback={<PageSkeleton title={pageInfo.title} section={pageInfo.section} hasToC={pageInfo.hasToC} isLongForm={pageInfo.isLongForm} isWide={pageInfo.isWide} />}>
      <NavigationContent>{children}</NavigationContent>
    </Suspense>
  );
}
