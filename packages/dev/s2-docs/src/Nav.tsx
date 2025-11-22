'use client';

import {Disclosure, DisclosurePanel, DisclosureTitle, Picker, pressScale} from '@react-spectrum/s2';
import {focusRing, size, space, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {getLibraryFromPage} from './library';
import {getPageFromPathname, getSnapshot, subscribe} from './NavigationSuspense';
import {Link} from 'react-aria-components';
import type {Page, PageProps} from '@parcel/rsc';
import React, {createContext, useContext, useEffect, useRef, useState, useSyncExternalStore} from 'react';

type SectionValue = Page[] | Map<string, Page[]>;

function isSectionMap(value: SectionValue): value is Map<string, Page[]> {
  return value instanceof Map;
}

export function Nav({pages, currentPage}: PageProps) {
  let currentLibrary = getLibraryFromPage(currentPage);
  let sections = new Map<string, SectionValue>();
  let sectionLibrary = new Map();
  for (let page of pages) {
    if (page.exports?.hideNav || page.exports?.omitFromNav) {
      continue;
    }

    let library = getLibraryFromPage(page);

    if ((currentLibrary === 'internationalized' || currentLibrary === 'react-spectrum') && library !== currentLibrary) {
      continue;
    }

    // If the current library is React Aria, we only want to skip pages in React Spectrum so that include Internationalized pages in the side nav
    if (currentLibrary === 'react-aria' && library === 'react-spectrum') {
      continue;
    }

    let section = page.exports?.section ?? 'Components';
    let group = page.exports?.group ?? undefined;
    if (section === '') {
      continue;
    }

    if (group && section && currentLibrary !== 'internationalized') {
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

    sectionLibrary.set(section, library);
  }

  let [maskSize, setMaskSize] = useState(0);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const pendingPage = snapshot.pathname ? getPageFromPathname(pages, snapshot.pathname) : null;
  let displayUrl = pendingPage?.url ?? currentPage.url;

  let sortedSections = [...sections].sort((a, b) => {
    if (a[0] === 'Overview') {
      return -1;
    }
    if (b[0] === 'Overview') {
      return 1;
    }

    if (a[0] === 'Guides') {
      return 1;
    }

    if (b[0] === 'Guides') {
      return -1;
    }
    
    return a[0].localeCompare(b[0]);
  });

  return (
    <nav
      onScroll={e => setMaskSize(Math.min(e.currentTarget.scrollTop, 32))}
      style={{
        maskImage: maskSize > 0 ? `linear-gradient(to bottom, transparent, black ${maskSize}px)` : undefined
      }}
      className={style({
        position: 'sticky',
        top: 40,
        height: 'fit',
        maxHeight: 'calc(100vh - 72px)',
        overflow: 'auto',
        paddingX: 12,
        minWidth: 200,
        display: {
          default: 'none',
          lg: 'block'
        }
      })}>
      {sortedSections.map(([name, pages]) => {
        let nav = <></>;
        if (isSectionMap(pages)) {
          nav = (
            <>
              {Array.from(pages.entries()).map(([section, items]) => (
                <SideNavSection title={section} key={section}>
                  <SideNav>
                    {items
                      .sort((a, b) => {
                        const aIntro = isIntroduction(a);
                        const bIntro = isIntroduction(b);
                        if (aIntro && !bIntro) {
                          return -1;
                        }
                        if (!aIntro && bIntro) {
                          return 1;
                        }
                        return title(a).localeCompare(title(b));
                      })
                      .filter(page => !page.exports?.isSubpage)
                      .map(page => (
                        <SideNavItem key={page.url}>
                          <SideNavLink href={page.url} page={page} isSelected={page.url === displayUrl}>
                            {title(page)}
                          </SideNavLink>
                        </SideNavItem>
                      ))}
                  </SideNav>
                </SideNavSection>
              ))}
            </>
          );
        } else {
          nav = (
            <SideNav>
              {pages
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
                })
                .filter(page => !page.exports?.isSubpage)
                .map(page => (
                  <SideNavItem key={page.url}><SideNavLink href={page.url} isSelected={page.url === currentPage.url}>{title(page)}</SideNavLink></SideNavItem>
              ))}
            </SideNav>
          );
        }

        if ((name === 'Overview' && Array.isArray(pages)) || (currentLibrary === 'internationalized' && Array.isArray(pages))) {
          return (
            <div className={style({paddingStart: space(26)})} key={name}>
              <SideNavSection title={name}>
                <SideNav>
                  {pages
                    .sort((a, b) => {
                      const aIntro = isIntroduction(a);
                      const bIntro = isIntroduction(b);
                      if (aIntro && !bIntro) {
                        return -1;
                      }
                      if (!aIntro && bIntro) {
                        return 1;
                      }
                      return title(a).localeCompare(title(b));
                    })
                    .filter(page => !page.exports?.isSubpage)
                    .map(page => (
                      <SideNavItem key={page.url}>
                        <SideNavLink href={page.url} isSelected={page.url === currentPage.url}>
                          {title(page)}
                        </SideNavLink>
                      </SideNavItem>
                    ))}
                </SideNav>
              </SideNavSection>
            </div>
          );
        }
        return (
          <Disclosure id={name} key={name} isQuiet density="spacious" defaultExpanded={name === 'Components' || name === currentPage.exports?.section} styles={style({minWidth: 185})}>
            <DisclosureTitle>{name}</DisclosureTitle>
            <DisclosurePanel>
              <div className={style({paddingStart: space(18)})}>{nav}</div>
            </DisclosurePanel>
          </Disclosure>
        );
      }
      )}
    </nav>
  );
}

function title(page) {
  return page.exports?.title ?? page.tableOfContents?.[0]?.title ?? page.name;
}

function isIntroduction(page) {
  let navTitle = page.exports?.navigationTitle;
  if (typeof navTitle === 'string' && /introduction|home/i.test(navTitle)) {
    return true;
  }
  let t = title(page);
  return typeof t === 'string' && /introduction|home/i.test(t);
}

function SideNavSection({title, children}) {
  return (
    <section className={style({marginBottom: 16})}>
      <div className={style({font: 'ui-sm', color: 'gray-600', minHeight: 32, paddingX: 12, display: 'flex', alignItems: 'center'})}>{title}</div>
      {children}
    </section>
  );
}

const SideNavContext = createContext('');

export function usePendingPage(pages: Page[]): Page | null {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return snapshot.pathname ? getPageFromPathname(pages, snapshot.pathname) : null;
}

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
  return (
    <li>
      {props.children}
    </li>
  );
}

export function SideNavLink(props) {
  let linkRef = useRef(null);
  let selected = useContext(SideNavContext);
  let {...linkProps} = props;
  
  return (
    <Link
      {...linkProps}
      ref={linkRef}
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
        transition: 'default'
      })}>
      {(renderProps) => (<>
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
          })(renderProps)} />
        {props.children}
      </>)}
    </Link>
  );
}

function useCurrentSection() {
  let [selected, setSelected] = useState('');

  useEffect(() => {
    let elements = Array.from(document.querySelectorAll('article :is(h2,h3,h4,h5)'));
    let visible = new Set();
    let observer = new IntersectionObserver(entries => {
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
    }, {rootMargin: '0px 0px -50% 0px'});

    for (let element of elements) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  return selected;
}

export function OnPageNav({children}) {
  let selected = useCurrentSection();

  return (
    <SideNavContext.Provider value={selected}>
      {children}
    </SideNavContext.Provider>
  );
}

export function MobileOnPageNav({children, currentPage}) {
  let [selected, setSelected] = useState('');
  useEffect(() => {
    let elements = Array.from(document.querySelectorAll('article > :is(h1,h2,h3,h4,h5)'));
    elements.reverse();
    let visible = new Set();
    let observer = new IntersectionObserver(entries => {
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
    }, {
      rootMargin: '9999999px 0px -100% 0px',
      // @ts-ignore
      scrollMargin: '0px 0px 62px 0px',
      threshold: 0.5
    });

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
