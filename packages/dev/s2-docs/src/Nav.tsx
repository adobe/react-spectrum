'use client';

import {BaseLink} from './Link';
import {
  Collection,
  SideNav as S2SideNav,
  SideNavItem as S2SideNavItem,
  SideNavSection as S2SideNavSection,
  SideNavHeader,
  SideNavItemContent,
  SideNavItemLink
} from '@react-spectrum/s2/SideNav';
import {focusRing, size, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {getLibraryFromPage, getLibraryLabel} from './library';
import LinkOutIcon from '../../../@react-spectrum/s2/ui-icons/LinkOut';
import type {Page} from '@parcel/rsc';
import {Picker, pressScale} from '@react-spectrum/s2';
import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
import {usePendingPage, useRouter} from './Router';

type SectionValue = Page[] | Map<string, Page[]>;

function isSectionMap(value: SectionValue): value is Map<string, Page[]> {
  return value instanceof Map;
}

export function Nav() {
  let {pages, currentPage} = useRouter();
  let [maskSize, setMaskSize] = useState(0);
  let displayPage = usePendingPage();

  if (currentPage.exports?.hideNav) {
    return null;
  }

  let currentLibrary = getLibraryFromPage(displayPage);
  let sections = new Map<string, SectionValue>();
  for (let page of pages) {
    if (page.exports?.hideNav || page.exports?.omitFromNav) {
      continue;
    }

    let library = getLibraryFromPage(page);

    if (currentLibrary === 'react-spectrum' && library !== currentLibrary) {
      continue;
    }

    // If the current library is React Aria, we only want to skip pages in React Spectrum so that include Internationalized pages in the side nav
    if (currentLibrary === 'react-aria' && library === 'react-spectrum') {
      continue;
    }

    let section = page.exports?.section ?? 'Components';
    let group = page.exports?.group ?? undefined;
    if (section === '' || page.exports?.isSubpage) {
      continue;
    }

    if (group && section) {
      let value = sections.get(group);
      let groupMap: Map<string, Page[]>;
      if (value instanceof Map) {
        groupMap = value;
      } else {
        groupMap = new Map<string, Page[]>();
      }
      let groupPages = groupMap.get(section) ?? [];
      groupPages.push(page);
      groupMap.set(section, groupPages);
      sections.set(group, groupMap);
    } else if (section) {
      let value = sections.get(section);
      let sectionPages = Array.isArray(value) ? value : [];
      sectionPages.push(page);
      sections.set(section, sectionPages);
    }
  }

  let sortedSections = [...sections].sort((a, b) => {
    if (a[0] === 'Overview') {
      return -1;
    }
    if (b[0] === 'Overview') {
      return 1;
    }

    return a[0].localeCompare(b[0]);
  });

  let libraryLabel = getLibraryLabel(currentLibrary);

  let overviewNodes: NavNode[] = [];
  let sectionNodes: NavNode[] = [];
  for (let [name, pages] of sortedSections) {
    if (name === 'Overview' && Array.isArray(pages)) {
      overviewNodes = sortOverview(pages).map(leafNode);
    } else if (isSectionMap(pages)) {
      sectionNodes.push({
        id: name,
        title: name,
        children: [...pages.entries()].map(([sub, subPages]) => ({
          id: sub,
          title: sub,
          children: sortSectionPages(subPages).map(leafNode)
        }))
      });
    } else {
      sectionNodes.push({id: name, title: name, children: sortSectionPages(pages).map(leafNode)});
    }
  }

  return (
    <nav
      onScroll={e => setMaskSize(Math.min(e.currentTarget.scrollTop, 32))}
      style={{
        maskImage:
          maskSize > 0 ? `linear-gradient(to bottom, transparent, black ${maskSize}px)` : undefined
      }}
      className={style({
        position: 'sticky',
        top: 40,
        maxHeight: 'calc(100vh - 72px)',
        paddingX: 12,
        minWidth: 200,
        display: {
          default: 'none',
          lg: 'flex'
        },
        flexDirection: 'column'
      })}>
      <S2SideNav
        aria-label={libraryLabel}
        selectedRoute={displayPage.url}
        defaultExpandedKeys={getDefaultExpandedKeys(currentPage)}
        styles={style({flexGrow: 1, flexShrink: 1, flexBasis: 0, minHeight: 0})}>
        {overviewNodes.length > 0 && (
          <S2SideNavSection>
            <SideNavHeader>Overview</SideNavHeader>
            <Collection items={overviewNodes}>{renderNode}</Collection>
          </S2SideNavSection>
        )}
        <S2SideNavSection aria-label={libraryLabel}>
          <Collection items={sectionNodes}>{renderNode}</Collection>
        </S2SideNavSection>
      </S2SideNav>
    </nav>
  );
}

interface NavNode {
  id: string;
  title: string;
  href?: string;
  children?: NavNode[];
}

function title(page) {
  return page.exports?.title ?? page.tableOfContents?.[0]?.title ?? page.name;
}

function isIntroduction(page) {
  return page.url.endsWith('/');
}

function leafNode(page: Page): NavNode {
  return {id: page.url, title: title(page), href: page.url};
}

function renderNode(node: NavNode) {
  return (
    <S2SideNavItem id={node.id} textValue={node.title} href={node.href}>
      <SideNavItemContent>
        {node.href ? <SideNavItemLink>{node.title}</SideNavItemLink> : node.title}
      </SideNavItemContent>
      {node.children && <Collection items={node.children}>{renderNode}</Collection>}
    </S2SideNavItem>
  );
}

function sortSectionPages(pages: Page[]): Page[] {
  return [...pages]
    .filter(page => !page.exports?.isSubpage)
    .sort((a, b) => {
      let aIntro = isIntroduction(a);
      let bIntro = isIntroduction(b);
      if (aIntro && !bIntro) {
        return -1;
      }
      if (!aIntro && bIntro) {
        return 1;
      }
      return title(a).localeCompare(title(b));
    });
}

function sortOverview(pages: Page[]): Page[] {
  return [...pages]
    .filter(page => !page.exports?.isSubpage)
    .sort((a, b) => {
      let aIntro = a.url.endsWith('getting-started');
      let bIntro = b.url.endsWith('getting-started');
      if (aIntro && !bIntro) {
        return -1;
      }
      if (!aIntro && bIntro) {
        return 1;
      }
      return title(a).localeCompare(title(b));
    });
}

function getDefaultExpandedKeys(currentPage: Page): string[] {
  let keys = new Set<string>();
  let section = currentPage.exports?.section ?? 'Components';
  let group = currentPage.exports?.group;
  if (group) {
    keys.add(group);
    keys.add(section);
  } else {
    keys.add(section);
  }
  return [...keys, 'Components'];
}

const SideNavContext = createContext('');

// Used by the ToC
export function SideNav({children, isNested = false}) {
  return (
    <ul
      className={style({
        listStyleType: 'none',
        padding: 0,
        paddingStart: {
          default: 0,
          ':is(li > ul)': 16
        },
        paddingTop: {
          default: 0,
          isNested: 8
        },
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: 'full',
        boxSizing: 'border-box'
      })({isNested})}>
      {children}
    </ul>
  );
}

export function SideNavItem(props) {
  return <li>{props.children}</li>;
}

export function SideNavLink(props) {
  let linkRef = useRef<HTMLAnchorElement | null>(null);
  let shouldAutoScrollOnMount = useRef(props.isSelected);
  let selected = useContext(SideNavContext);
  let {isExternal, ...linkProps} = props;

  useEffect(() => {
    let link = linkRef.current;
    if (!link || !props.isSelected || !shouldAutoScrollOnMount.current) {
      return;
    }

    shouldAutoScrollOnMount.current = false;
    link.scrollIntoView({block: 'start'});
  }, [props.isSelected]);

  // oxlint-disable react/react-compiler
  return (
    <BaseLink
      {...linkProps}
      ref={linkRef}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      aria-current={props.isSelected || selected === props.href ? 'page' : undefined}
      style={pressScale(linkRef)}
      className={style({
        ...focusRing(),
        minHeight: 32,
        boxSizing: 'border-box',
        paddingX: 4,
        // paddingY: centerPadding(),
        display: 'flex',
        alignItems: 'center',
        gap: size(6),
        font: 'ui',
        fontWeight: {
          default: 'normal',
          isCurrent: 'bold'
        },
        textDecoration: 'none',
        borderRadius: 'default',
        transition: 'default',
        scrollMarginTop: 64
      })}>
      {renderProps => (
        <>
          <span
            className={style({
              width: 2,
              height: '[1lh]',
              borderRadius: 'full',
              transition: 'default',
              backgroundColor: {
                default: 'transparent',
                isHovered: 'gray-400',
                isCurrent: 'gray-800'
              }
            })(renderProps)}
          />
          {props.children}
          {isExternal && (
            <LinkOutIcon
              aria-label="(opens in a new tab)"
              className={style({color: 'neutral', marginStart: 'auto', flexShrink: 0, paddingX: 8})}
            />
          )}
        </>
      )}
    </BaseLink>
  );
  // oxlint-enable react/react-compiler
}

function useCurrentSection() {
  let {currentPage} = useRouter();
  let [selected, setSelected] = useState('');

  useEffect(() => {
    let elements = Array.from(document.querySelectorAll('article [data-anchor-link]'));
    let visible = new Set();
    let observer = new IntersectionObserver(
      entries => {
        for (let entry of entries) {
          if (entry.isIntersecting) {
            visible.add(entry.target);
          } else {
            visible.delete(entry.target);
          }

          let firstVisible = elements.find(e => visible.has(e));
          if (firstVisible) {
            setSelected('#' + firstVisible.id);
          }
        }
      },
      {rootMargin: '0px 0px -50% 0px'}
    );

    for (let element of elements) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [currentPage]);

  return selected;
}

export function OnPageNav({children}) {
  let selected = useCurrentSection();

  return <SideNavContext.Provider value={selected}>{children}</SideNavContext.Provider>;
}

export function MobileOnPageNav({children}) {
  let {currentPage} = useRouter();
  let [selected, setSelected] = useState('');
  useEffect(() => {
    let elements = Array.from(document.querySelectorAll('article [data-anchor-link]'));
    elements.reverse();
    let visible = new Set();
    let observer = new IntersectionObserver(
      entries => {
        for (let entry of entries) {
          if (entry.isIntersecting) {
            visible.add(entry.target);
          } else {
            visible.delete(entry.target);
          }
        }

        let lastVisible = elements.find(e => visible.has(e));
        if (lastVisible) {
          setSelected('#' + lastVisible.id!);
        } else {
          setSelected('#' + elements.at(-1)!.id);
        }
      },
      {
        rootMargin: '9999999px 0px -100% 0px',
        // @ts-ignore
        scrollMargin: '0px 0px 62px 0px',
        threshold: 0.5
      }
    );

    for (let element of elements) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [currentPage]);

  return (
    <Picker aria-label="Table of contents" value={selected} isQuiet size="L">
      {children}
    </Picker>
  );
}
