'use client';

import type {Page} from '@parcel/rsc';
import {PageSkeleton} from './PageSkeleton';
import React, {Suspense} from 'react';

let navigationPromise: Promise<void> | null = null;
let navigationResolve: (() => void) | null = null;
let targetPathname: string | null = null;

export function setNavigationLoading(loading: boolean, pathname?: string) {
  if (loading) {
    targetPathname = pathname || null;
    navigationPromise = new Promise(resolve => {
      navigationResolve = resolve;
    });
  } else {
    if (navigationResolve) {
      navigationResolve();
      navigationResolve = null;
      navigationPromise = null;
      targetPathname = null;
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
  if (navigationPromise) {
    throw navigationPromise;
  }
  return <>{children}</>;
}

export function NavigationSuspense({children, pages}: {children: React.ReactNode, pages: Page[]}) {
  const pageInfo = getPageInfo(pages, targetPathname);
  
  return (
    <Suspense fallback={<PageSkeleton title={pageInfo.title} section={pageInfo.section} hasToC={pageInfo.hasToC} />}>
      <NavigationContent>{children}</NavigationContent>
    </Suspense>
  );
}
