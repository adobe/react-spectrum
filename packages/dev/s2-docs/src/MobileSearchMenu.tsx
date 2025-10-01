'use client';

import {CloseButton, Content, Heading, IllustratedMessage, SearchField, Tab, TabList, TabPanel, Tabs, Tag, TagGroup} from '@react-spectrum/s2';
import {ComponentCardItem, ComponentCardView} from './ComponentCardView';
import {composeRenderProps, OverlayTriggerStateContext, Dialog as RACDialog, DialogProps as RACDialogProps} from 'react-aria-components';
import {getLibraryFromPage} from './library';
import {type Library, TAB_DEFS} from './constants';
// eslint-disable-next-line monorepo/no-internal-import
import NoSearchResults from '@react-spectrum/s2/illustrations/linear/NoSearchResults';
import type {PageProps} from '@parcel/rsc';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

interface MobileDialogProps extends Omit<RACDialogProps, 'className' | 'style'> {
  size?: 'S' | 'M' | 'L' | 'fullscreen' | 'fullscreenTakeover',
  isDismissible?: boolean,
  isKeyboardDismissDisabled?: boolean,
  padding?: 'default' | 'none'
}

const dialogStyle = style({
  padding: {
    padding: {
      default: {
        default: 24,
        sm: 32
      },
      none: 0
    }
  },
  boxSizing: 'border-box',
  outlineStyle: 'none',
  borderRadius: 'inherit',
  overflow: 'auto',
  position: 'relative',
  size: 'full',
  maxSize: 'inherit'
});

export function MobileSearchMenu({pages, currentPage}) {
  return (
    <MobileCustomDialog padding="none">
      <CloseButton styles={style({position: 'fixed', top: 12, insetEnd: 12, zIndex: 101})} />
      <MobileNav pages={pages} currentPage={currentPage} />
    </MobileCustomDialog>
  );
}

const MobileCustomDialog = function MobileCustomDialog(props: MobileDialogProps) {
  let {
    padding = 'default'
  } = props;

  return (
    <RACDialog
      {...props}
      className={dialogStyle({padding})}>
      {composeRenderProps(props.children, (children) => (
        <OverlayTriggerStateContext.Provider value={null}>
          {children}
        </OverlayTriggerStateContext.Provider>
      ))}
    </RACDialog>
  );
};

function MobileNav({pages, currentPage}: PageProps) {
  let [searchFocused, setSearchFocused] = useState(false);
  let [searchValue, setSearchValue] = useState('');
  let [selectedSection, setSelectedSection] = useState<string | undefined>(undefined);
  let prevSearchWasEmptyRef = useRef<boolean>(true);
  let headerRef = useRef<HTMLDivElement>(null);
  let scrollContainerRef = useRef<HTMLDivElement>(null);
  let tabListRef = useRef<HTMLDivElement>(null);
  let [tabListHeight, setTabListHeight] = useState(0);
  let [selectedLibrary, setSelectedLibrary] = useState<Library>(getLibraryFromPage(currentPage));

  let getSectionsForLibrary = useCallback((libraryId: string) => {
    let sectionsMap = new Map();
    let filteredPages = pages.filter(page => getLibraryFromPage(page) === libraryId);
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
    let allLibraries = (Object.keys(TAB_DEFS) as Library[]).map(id => ({id, label: TAB_DEFS[id].label}));
    let currentLibId = getLibraryFromPage(currentPage);

    // Move current library to first position
    let currentLibraryIndex = allLibraries.findIndex(lib => lib.id === currentLibId);
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
    
    // Filter items where name or tags start with search value
    let matchedPages = pages.filter(page => {
      let pageTitle = title(page).toLowerCase();
      let nameMatch = pageTitle.startsWith(searchLower);
      let tags: string[] = page.exports?.tags || [];
      let tagMatch = tags.some(tag => tag.toLowerCase().startsWith(searchLower));
      return nameMatch || tagMatch;
    });
    
    // Sort to prioritize name matches over tag matches
    return matchedPages.sort((a, b) => {
      let aNameMatch = title(a).toLowerCase().startsWith(searchLower);
      let bNameMatch = title(b).toLowerCase().startsWith(searchLower);
      
      if (aNameMatch && !bNameMatch) {
        return -1;
      }
      if (!aNameMatch && bNameMatch) {
        return 1;
      }
      
      // If both match by name or both match by tag, maintain original order
      return 0;
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
    let items: ComponentCardItem[] = [];
    if (section === 'all') {
      items = getAllContent(libraryId, searchValue);
    } else {
      items = getSectionContent(section, libraryId, searchValue);
    }
    
    // Sort to show "Introduction" first when search is empty
    if (searchValue.trim().length === 0) {
      items = [...items].sort((a, b) => {
        const aIsIntro = a.name === 'Introduction';
        const bIsIntro = b.name === 'Introduction';
        
        if (aIsIntro && !bIsIntro) {
          return -1;
        }
        if (!aIsIntro && bIsIntro) {
          return 1;
        }
        return 0;
      });
    }
    
    return items;
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
          let newLib = key as Library;
          setSelectedLibrary(newLib);
          if (!searchFocused) {
            let nextSections = getSectionNamesForLibrary(newLib);
            if (nextSections.length > 0) {
              setSelectedSection(nextSections[0]);
            }
          }
        }}
        styles={style({marginX: 12, marginTop: 12})}>
        <div ref={tabListRef} className={style({position: 'sticky', top: 0, zIndex: 2, backgroundColor: 'layer-2'})}>
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
              className={style({position: 'sticky', zIndex: 1, backgroundColor: 'layer-2'})}
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
                UNSAFE_style={{overflow: 'auto', whiteSpace: 'nowrap', paddingBlock: 8}}
                items={tags}>
                {tag => <Tag key={tag.id} id={tag.id}>{tag.name}</Tag>}
              </TagGroup>
            </div>
            <div ref={scrollContainerRef}>
              <ComponentCardView
                items={getItemsForSelection(selectedSection, library.id, searchValue)}
                ariaLabel="Pages"
                size="S"
                renderEmptyState={() => (
                  <IllustratedMessage styles={style({margin: 32})}>
                    <NoSearchResults />
                    <Heading>No results</Heading>
                    {searchValue.trim().length > 0 ? (
                      <Content>
                        No results found for <strong className={style({fontWeight: 'bold'})}>{searchValue}</strong> in {selectedLibrary}.
                      </Content>
                    ) : (
                      <Content>
                        No results found in {selectedLibrary}.
                      </Content>
                    )}
                  </IllustratedMessage>
                )} />
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
