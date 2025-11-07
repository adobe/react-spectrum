'use client';

import type {Page} from '@parcel/rsc';
import {PageSkeleton} from './PageSkeleton';
import React, {Suspense, use, useSyncExternalStore} from 'react';

let navigationPromise: Promise<void> | null = null;
let navigationResolve: (() => void) | null = null;
let targetPathname: string | null = null;
let listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  return navigationPromise;
}

export function setNavigationLoading(loading: boolean, pathname?: string) {
  if (loading) {
    targetPathname = pathname || null;
    navigationPromise = new Promise(resolve => {
      navigationResolve = resolve;
    });
    listeners.forEach(callback => callback());
  } else {
    if (navigationResolve) {
      navigationResolve();
      navigationResolve = null;
      navigationPromise = null;
      listeners.forEach(callback => callback());
    }
  }
}

function getPageInfo(pages: Page[], pathname: string | null): {title?: string, section?: string, hasToC?: boolean} {
  if (!pathname) {
    return {};
  }
  
  const [basePathname] = pathname.split('?');
  const [cleanPathname] = basePathname.split('#');
  let normalizedPathname = cleanPathname.startsWith('/') ? cleanPathname : '/' + cleanPathname;
  
  const targetPage = pages.find(p => {
    const pageUrl = p.url.split('?')[0].split('#')[0];
    return pageUrl === normalizedPathname || 
          pageUrl === normalizedPathname.replace(/\.html$/, '') ||
          pageUrl === normalizedPathname + '.html';
  });
  
  if (!targetPage) {
    return {};
  }
  
  // Extract the h1 title (same logic as getTitle but just the page title part)
  const title = targetPage.tableOfContents?.[0]?.title ?? targetPage.name?.replace(/\.html$/, '');
  const section = (targetPage.exports?.section as string) || 'Components';
  const hasToC = !targetPage.exports?.hideNav && targetPage.tableOfContents?.[0]?.children && targetPage.tableOfContents?.[0]?.children?.length > 0;
  
  return {title, section, hasToC};
}

function NavigationContent({children}: {children: React.ReactNode}) {
  // Subscribe to navigation promise changes to ensure React re-renders when setNavigationLoading(true) is called.
  const promise = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  if (promise) {
    use(promise);
  }
  return <>{children}</>;
}

export function NavigationSuspense({children, pages}: {children: React.ReactNode, pages: Page[]}) {
  // Subscribe to get the latest targetPathname for skeleton page info
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const pageInfo = getPageInfo(pages, targetPathname);
  
  return (
    <Suspense fallback={<PageSkeleton title={pageInfo.title} section={pageInfo.section} hasToC={pageInfo.hasToC} />}>
      <NavigationContent>{children}</NavigationContent>
    </Suspense>
  );
}
