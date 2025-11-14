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

function normalizePathname(urlOrPathname: string, publicUrlPrefix: string): string {
  let pathname: string;
  try {
    if (urlOrPathname.startsWith('http://') || urlOrPathname.startsWith('https://')) {
      pathname = new URL(urlOrPathname).pathname;
    } else {
      pathname = new URL(urlOrPathname, location.href).pathname;
    }
  } catch {
    const [basePathname] = urlOrPathname.split('?');
    const [cleanPathname] = basePathname.split('#');
    pathname = cleanPathname;
  }
  
  let pathnameWithoutPrefix = pathname;
  if (publicUrlPrefix !== '/' && pathname.startsWith(publicUrlPrefix)) {
    pathnameWithoutPrefix = pathname.slice(publicUrlPrefix.length);
    if (!pathnameWithoutPrefix.startsWith('/')) {
      pathnameWithoutPrefix = '/' + pathnameWithoutPrefix;
    }
  }
  
  return pathnameWithoutPrefix.startsWith('/') ? pathnameWithoutPrefix : '/' + pathnameWithoutPrefix;
}

function getPageTitle(page: Page): string {
  return page.exports?.title ?? page.tableOfContents?.[0]?.title ?? page.name;
}

export function getPageFromPathname(pages: Page[], pathname: string | null): Page | null {
  if (!pathname) {
    return null;
  }
  
  let publicUrl = process.env.PUBLIC_URL || '/';
  let publicUrlPathname = publicUrl.startsWith('http') ? new URL(publicUrl).pathname : publicUrl;
  let publicUrlPrefix = publicUrlPathname === '/' ? '/' : publicUrlPathname.replace(/\/$/, '');
  
  let normalizedPathname = normalizePathname(pathname, publicUrlPrefix);
  
  const targetPage = pages.find(p => {
    let normalizedPageUrl = normalizePathname(p.url, publicUrlPrefix);
    
    return normalizedPageUrl === normalizedPathname || 
          normalizedPageUrl === normalizedPathname.replace(/\.html$/, '') ||
          normalizedPageUrl === normalizedPathname + '.html';
  });
  
  return targetPage ?? null;
}

function getPageInfo(pages: Page[], pathname: string | null): {title?: string, section?: string, hasToC?: boolean} {
  const targetPage = getPageFromPathname(pages, pathname);
  
  if (!targetPage) {
    return {};
  }
  
  const title = getPageTitle(targetPage);
  const section = (targetPage.exports?.section as string) || 'Components';
  const hasToC = !targetPage.exports?.hideNav && targetPage.tableOfContents?.[0]?.children && targetPage.tableOfContents?.[0]?.children?.length > 0;
  
  return {title, section, hasToC};
}

function NavigationContent({children}: {children: React.ReactNode}) {
  // Subscribe to navigation promise changes to ensure React re-renders when setNavigationPromise() is called.
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  let [delayedPromise, setDelayedPromise] = useState<Promise<void> | null>(null);
  useEffect(() => {
    let promise = snapshot.promise;
    if (!promise) {
      return;
    }
    let timeout = setTimeout(() => {
      setDelayedPromise(promise);
    }, SKELETON_DELAY);
    return () => clearTimeout(timeout);
  }, [snapshot]);

  if (delayedPromise) {
    use(delayedPromise);
  }

  return <>{children}</>;
}

export function NavigationSuspense({children, pages}: {children: React.ReactNode, pages: Page[]}) {
  // Subscribe to get the latest targetPathname for skeleton page info
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const pageInfo = getPageInfo(pages, snapshot.pathname);
  
  return (
    <Suspense fallback={<PageSkeleton title={pageInfo.title} section={pageInfo.section} hasToC={pageInfo.hasToC} />}>
      <NavigationContent>{children}</NavigationContent>
    </Suspense>
  );
}
