'use client';

import {Divider, PickerItem} from '@react-spectrum/s2';
import {MarkdownMenu} from './MarkdownMenu';
import {MobileOnPageNav, OnPageNav, SideNav, SideNavItem, SideNavLink, usePendingPage} from './Nav';
import type {Page, TocNode} from '@parcel/rsc';
import React from 'react';
import {ScrollableToc} from './ScrollableToc';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

function anchorId(children) {
  return children.replace(/\s/g, '-').replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase();
}

function Toc({toc, isNested = false}: {toc: TocNode[], isNested?: boolean}) {
  return (
    <OnPageNav>
      <SideNav isNested={isNested}>
        {toc.map((c, i) => (
          <SideNavItem key={i}>
            <SideNavLink href={'#' + anchorId(c.title)}>{c.title}</SideNavLink>
            {c.children.length > 0 && <Toc toc={c.children} isNested />}
          </SideNavItem>
        ))}
      </SideNav>
    </OnPageNav>
  );
}

function renderMobileToc(toc: TocNode[], seen = new Map()) {
  return toc.map((c) => {
    let href = c.level === 1 ? '#top' : '#' + anchorId(c.title);
    if (seen.has(href)) {
      seen.set(href, seen.get(href) + 1);
      href += '-' + seen.get(href);
    } else {
      seen.set(href, 1);
    }
    return (<React.Fragment key={href}>
      <PickerItem id={href} href={href}>{c.title}</PickerItem>
      {c.children.length > 0 && renderMobileToc(c.children, seen)}
    </React.Fragment>);
  });
}

export function OptimisticToc({currentPage, pages}: {currentPage: Page, pages: Page[]}) {
  let pendingPage = usePendingPage(pages);
  let displayPage = pendingPage ?? currentPage;
  
  return (
    <>
      <div className={style({font: 'title', minHeight: 32, paddingX: 12, display: 'flex', alignItems: 'center', marginBottom: 4, flexShrink: 0})}>On this page</div>
      <ScrollableToc>
        <Toc toc={displayPage.tableOfContents?.[0]?.children ?? []} key={displayPage.url} />
      </ScrollableToc>
      <div className={style({flexShrink: 0})}>
        <Divider size="S" styles={style({marginY: 12})} />
        <MarkdownMenu url={currentPage.url} />
      </div>
    </>
  );
}

export function OptimisticMobileToc({currentPage, pages}: {currentPage: Page, pages: Page[]}) {
  let pendingPage = usePendingPage(pages);
  let displayPage = pendingPage ?? currentPage;
  
  if ((displayPage.tableOfContents?.[0]?.children?.length ?? 0) <= 1) {
    return null;
  }
  
  return (
    <MobileOnPageNav currentPage={currentPage}>
      {renderMobileToc(displayPage.tableOfContents ?? [])}
    </MobileOnPageNav>
  );
}
