'use client';

import {ComponentCardItem, ComponentCardView} from './ComponentCardView';
import {focusRing, size, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Link} from 'react-aria-components';
import type {PageProps} from '@parcel/rsc';
import {Picker, pressScale, SearchField, Tab, TabList, TabPanel, Tabs, Tag, TagGroup} from '@react-spectrum/s2';
import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';

export function Nav({pages, currentPage}: PageProps) {
  let currentLibrary = currentPage.url.match(/\/(react-aria|s2)\//)?.[1];
  let sections = new Map();
  for (let page of pages) {
    let library = page.url.match(/\/(react-aria|s2)\//)?.[1];
    if (library !== currentLibrary) {
      continue;
    }

    let section = page.exports?.section ?? 'Components';
    let sectionPages = sections.get(section) ?? [];
    sectionPages.push(page);
    sections.set(section, sectionPages);
  }

  let [maskSize, setMaskSize] = useState(0);

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
        minWidth: 180,
        display: {
          default: 'none',
          lg: 'block'
        }
      })}>
      {[...sections].sort((a, b) => a[0].localeCompare(b[0])).map(([name, pages]) => (
        <SideNavSection title={name} key={name}>
          <SideNav>
            {pages.sort((a, b) => title(a).localeCompare(title(b))).map(page => (
              <SideNavItem key={page.url}><SideNavLink href={page.url} isSelected={page.url === currentPage.url}>{title(page)}</SideNavLink></SideNavItem>
            ))}
          </SideNav>
        </SideNavSection>
      ))}
    </nav>
  );
}

export function MobileNav({pages, currentPage}: PageProps) {
  let [searchFocused, setSearchFocused] = useState(false);
  let [searchValue, setSearchValue] = useState('');
  let [selectedSection, setSelectedSection] = useState<string | undefined>(undefined);
  let prevSearchWasEmptyRef = useRef<boolean>(true);
  let headerRef = useRef<HTMLDivElement>(null);
  let scrollContainerRef = useRef<HTMLDivElement>(null);
  let tabListRef = useRef<HTMLDivElement>(null);
  let [tabListHeight, setTabListHeight] = useState(0);

  let getCurrentLibrary = (page: any) => {
    if (page.url.includes('react-aria')) {
      return 'react-aria';
    } else if (page.url.includes('react-internationalized')) {
      return 'internationalized';
    }
    return 'react-spectrum';
  };

  let [selectedLibrary, setSelectedLibrary] = useState<'react-spectrum' | 'react-aria' | 'internationalized'>(getCurrentLibrary(currentPage));

  let getSectionsForLibrary = useCallback((libraryId: string) => {
    let sectionsMap = new Map();
    
    let filteredPages = pages.filter(page => {
      let pageLibrary: 'react-spectrum' | 'react-aria' | 'internationalized' = 'react-spectrum';
      if (page.url.includes('react-aria')) {
        pageLibrary = 'react-aria';
      } else if (page.url.includes('react-internationalized')) {
        pageLibrary = 'internationalized';
      }
      
      return pageLibrary === libraryId;
    });

    for (let page of filteredPages) {
      let section = page.exports?.section ?? 'Components';
      let sectionPages = sectionsMap.get(section) ?? [];
      sectionPages.push(page);
      sectionsMap.set(section, sectionPages);
    }
    return sectionsMap;
  }, [pages]);

  let currentLibrarySectionArray = useMemo(() => {
    let librarySections = getSectionsForLibrary(selectedLibrary);
    let sectionArray = [...librarySections.keys()];
    // Ensure order matches TagGroup: 'Components' first, then alphabetical
    sectionArray.sort((a, b) => {
      if (a === 'Components') {
        return -1;
      }
      if (b === 'Components') {
        return 1;
      }
      return a.localeCompare(b);
    });
    return sectionArray;
  }, [getSectionsForLibrary, selectedLibrary]);
  

  useEffect(() => {
      // Auto-select first section initially or when library changes
    if (currentLibrarySectionArray.length > 0 && !selectedSection) {
      setSelectedSection(currentLibrarySectionArray[0]);
    }
  }, [currentLibrarySectionArray, selectedSection]);

  // Auto-select first section when switching libraries (if not focused on search field)
  useEffect(() => {
    if (currentLibrarySectionArray.length > 0 && !searchFocused) {
      setSelectedSection(currentLibrarySectionArray[0]);
    }
  }, [selectedLibrary, currentLibrarySectionArray, searchFocused]);

  useEffect(() => {
    let measure = () => {
      if (tabListRef.current) {
        setTabListHeight(tabListRef.current.getBoundingClientRect().height);
      }
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [selectedLibrary]);

  let getOrderedLibraries = () => {
    let allLibraries = [
      {id: 'react-aria', label: 'React Aria'}, 
      {id: 'react-spectrum', label: 'React Spectrum'}
    ];
    
    let currentLibrary = getCurrentLibrary(currentPage);
    
    // Find current library and move it to first position
    let currentLibraryIndex = allLibraries.findIndex(lib => lib.id === currentLibrary);
    if (currentLibraryIndex > 0) {
      let currentLib = allLibraries.splice(currentLibraryIndex, 1)[0];
      allLibraries.unshift(currentLib);
    }
    
    return allLibraries;
  };

  let libraries = getOrderedLibraries();

  let handleSearchFocus = () => {
    setSearchFocused(true);
  };

  let handleSearchBlur = () => {
    if (searchValue === '') {
      setSearchFocused(false);
    }
  };

  let handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (value === '' && !searchFocused) {
      setSearchFocused(false);
    }
  };

  let filterPages = (pages: any[], searchValue: string) => {
    if (!searchValue.trim()) {
      return pages;
    }
    
    let searchLower = searchValue.toLowerCase();
    return pages.filter(page => {
      let pageTitle = title(page).toLowerCase();
      return pageTitle.includes(searchLower);
    });
  };

  let getSectionContent = (sectionName: string, libraryId: string, searchValue: string = ''): ComponentCardItem[] => {
    let librarySections = getSectionsForLibrary(libraryId);
    let pages = librarySections.get(sectionName) ?? [];
    
    let filteredPages = filterPages(pages, searchValue);
    
    return filteredPages
      .sort((a, b) => title(a).localeCompare(title(b)))
      .map(page => ({id: page.url.replace(/^\//, ''), name: title(page), href: page.url}));
  };

  let getAllContent = (libraryId: string, searchValue: string = ''): ComponentCardItem[] => {
    let librarySections = getSectionsForLibrary(libraryId);
    let allPages = Array.from(librarySections.values()).flat();
    let filteredPages = filterPages(allPages, searchValue);
    return filteredPages
      .sort((a, b) => title(a).localeCompare(title(b)))
      .map(page => ({id: page.url.replace(/^\//, ''), name: title(page), href: page.url}));
  };

  let getItemsForSelection = (section: string | undefined, libraryId: string, searchValue: string = ''): ComponentCardItem[] => {
    if (!section) {
      return [];
    }
    if (section === 'all') {
      return getAllContent(libraryId, searchValue);
    }
    return getSectionContent(section, libraryId, searchValue);
  };

  let getSectionNamesForLibrary = (libraryId: string) => {
    let librarySections = getSectionsForLibrary(libraryId);
    let sectionArray = [...librarySections.keys()];
    
    // Show 'Components' first
    sectionArray.sort((a, b) => {
      if (a === 'Components') {
        return -1;
      }
      if (b === 'Components') {
        return 1;
      }
      return a.localeCompare(b);
    });
    
    return sectionArray;
  };

  let currentLibrarySections = getSectionNamesForLibrary(selectedLibrary);

  let tags = useMemo(() => {
    let base = currentLibrarySections.map(name => ({id: name, name}));
    if (searchValue.trim().length > 0) {
      return [{id: 'all', name: 'All'}, ...base];
    }
    return base;
  }, [currentLibrarySections, searchValue]);

  useEffect(() => {
    let baseIds = currentLibrarySections;
    let ids = searchValue.trim().length > 0 ? ['all', ...baseIds] : baseIds;
    if (!selectedSection || !ids.includes(selectedSection)) {
      setSelectedSection(ids[0]);
    }
  }, [currentLibrarySections, searchValue, selectedSection]);

  // Auto-select All when search starts
  useEffect(() => {
    let isEmpty = searchValue.trim().length === 0;
    if (prevSearchWasEmptyRef.current && !isEmpty) {
      setSelectedSection('all');
    }
    prevSearchWasEmptyRef.current = isEmpty;
  }, [searchValue]);


  let handleTagSelection = (keys: any) => {
    let key = [...keys][0] as string;
    setSelectedSection(key);
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      // Ensure newly selected section starts at the top of the vertical scroll area
      scrollContainerRef.current.scrollTo({top: 0, behavior: 'auto'});
    }
  }, [selectedSection, selectedLibrary]);

  return (
    <div className={style({minHeight: '100dvh', paddingBottom: 24, boxSizing: 'border-box'})}>
      <Tabs 
        aria-label="Libraries"
        density="compact"
        selectedKey={selectedLibrary}
        onSelectionChange={(key) => {
          let newLib = key as 'react-spectrum' | 'react-aria' | 'internationalized';
          setSelectedLibrary(newLib);
          if (!searchFocused) {
            let nextSections = getSectionNamesForLibrary(newLib);
            if (nextSections.length > 0) {
              setSelectedSection(nextSections[0]);
            }
          }
        }}
        styles={style({marginX: 12, marginTop: 12})}>
        <div ref={tabListRef} className={style({position: 'sticky', top: 0, zIndex: 2, backgroundColor: 'white'})}>
          <TabList>
            {libraries.map(library => (
              <Tab key={library.id} id={library.id}>{library.label}</Tab>
            ))}
          </TabList>
        </div>
        {libraries.map(library => (
          <TabPanel key={library.id} id={library.id}>
            <div
              ref={headerRef}
              className={style({position: 'sticky', zIndex: 1, backgroundColor: 'white'})}
              style={{top: tabListHeight}}>
              <SearchField 
                aria-label="Search" 
                value={searchValue}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                styles={style({marginY: 12})} />
              <TagGroup
                aria-label="Navigation sections" 
                selectionMode="single" 
                selectedKeys={selectedSection ? [selectedSection] : []}
                onSelectionChange={handleTagSelection}
                styles={style({margin: 12})}
                items={tags}>
                {tag => <Tag key={tag.id} id={tag.id}>{tag.name}</Tag>}
              </TagGroup>
            </div>
            <div ref={scrollContainerRef}>
              <ComponentCardView
                items={getItemsForSelection(selectedSection, library.id, searchValue)}
                ariaLabel="Pages"
                size="S" />
            </div>
          </TabPanel>
        ))}
      </Tabs>
    </div>
  );
}

function title(page) {
  return page.exports?.title ?? page.tableOfContents?.[0]?.title ?? page.name;
}

function SideNavSection({title, children}) {
  return (
    <section className={style({marginBottom: 24})}>
      <div className={style({font: 'ui-sm', color: 'gray-600', minHeight: 32, paddingX: 12, display: 'flex', alignItems: 'center'})}>{title}</div>
      {children}
    </section>
  );
}

const SideNavContext = createContext('');

export function SideNav({children}) {
  return (
    <ul
      className={style({
        listStyleType: 'none',
        padding: 0,
        paddingStart: {
          default: 0,
          ':is(li > ul)': 16
        },
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: 'full',
        boxSizing: 'border-box'
      })}>
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
  return (
    <Link
      {...props}
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
    let elements = Array.from(document.querySelectorAll('article > :is(h2,h3,h4,h5)'));
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

export function MobileOnPageNav({children}) {
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
  }, []);

  return (
    <Picker aria-label="Table of contents" selectedKey={selected} isQuiet size="L">
      {children}
    </Picker>
  );
}
