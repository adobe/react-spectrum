'use client';

import {Divider, PickerItem} from '@react-spectrum/s2';
import {MarkdownMenu} from './MarkdownMenu';
import {MobileOnPageNav, OnPageNav, SideNav, SideNavItem, SideNavLink} from './Nav';
import React from 'react';
import {ScrollableToc} from './ScrollableToc';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import type {TocNode} from '@parcel/rsc';
import {useRouter} from './Router';

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

export function OptimisticToc() {
  let {currentPage} = useRouter();
  let section = currentPage.exports?.section;
  let hasToC = (!currentPage.exports?.hideNav || section === 'Blog' || section === 'Releases') && currentPage.tableOfContents?.[0]?.children && currentPage.tableOfContents?.[0]?.children?.length > 0;
  if (!hasToC) {
    return null;
  }

  return (
    <aside
      className={style({
        position: 'sticky',
        top: 0,
        paddingTop: 32,
        marginBottom: -40,
        boxSizing: 'border-box',
        width: 180,
        flexShrink: 0,
        display: {
          default: 'none',
          lg: 'flex'
        },
        flexDirection: 'column'
      })}>
      <div className={style({font: 'title', minHeight: 32, paddingX: 12, display: 'flex', alignItems: 'center', marginBottom: 4, flexShrink: 0})}>On this page</div>
      <ScrollableToc>
        <Toc toc={currentPage.tableOfContents?.[0]?.children ?? []} key={currentPage.url} />
        {currentPage.exports?.relatedPages && (
          <RelatedPages pages={currentPage.exports.relatedPages} />
        )}
      </ScrollableToc>
      <div className={style({flexShrink: 0})}>
        <Divider size="S" styles={style({marginY: 12})} />
        <MarkdownMenu name={currentPage.name} url={currentPage.url} />
      </div>
    </aside>
  );
}

function isExternalUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

function RelatedPages({pages}: {pages: Array<{title: string, url: string}>}) {
  return (
    <div className={style({paddingTop: 24})}>
      <div className={style({font: 'title', minHeight: 32, paddingX: 12, display: 'flex', alignItems: 'center'})}>Related pages</div>
      <OnPageNav>
        <SideNav>
          {pages.map((page, i) => (
            <SideNavItem key={i}>
              <SideNavLink href={page.url} isExternal={isExternalUrl(page.url)}>{page.title}</SideNavLink>
            </SideNavItem>
          ))}
        </SideNav>
      </OnPageNav>
    </div>
  );
}

export function OptimisticMobileToc() {
  let {currentPage} = useRouter();

  if ((currentPage.tableOfContents?.[0]?.children?.length ?? 0) <= 1) {
    return null;
  }

  let withRelatedPages = currentPage.exports?.relatedPages ? [
    ...(currentPage.tableOfContents ?? []),
    {
      level: 2,
      title: 'Related pages',
      children: []
    }] : currentPage.tableOfContents!;

  return (
    <MobileOnPageNav>
      {renderMobileToc(withRelatedPages)}
    </MobileOnPageNav>
  );
}
