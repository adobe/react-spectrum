'use client';

import {baseColor, focusRing, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {CloseButton, Content, Heading, IllustratedMessage, SearchField, Tag, TagGroup, TextContext} from '@react-spectrum/s2';
import {ComponentCardItem, ComponentCardView} from './ComponentCardView';
import {getLibraryFromPage} from './library';
import {type Library, TAB_DEFS} from './constants';
// eslint-disable-next-line monorepo/no-internal-import
import NoSearchResults from '@react-spectrum/s2/illustrations/linear/NoSearchResults';
import {OverlayTriggerStateContext, Provider, Dialog as RACDialog, DialogProps as RACDialogProps, Tab as RACTab, TabList as RACTabList, TabPanel as RACTabPanel, TabPanelProps as RACTabPanelProps, TabProps as RACTabProps, Tabs as RACTabs, SelectionIndicator, TabRenderProps} from 'react-aria-components';
import type {PageProps} from '@parcel/rsc';
import React, {ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {useId} from '@react-aria/utils';


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

// Mobile tabs styles - horizontal layout with scrolling
const mobileTabsWrapper = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  font: 'ui'
});

const mobileTabListContainer = style({
  position: 'sticky',
  top: 0,
  zIndex: 2,
  backgroundColor: 'layer-2'
});

const mobileTabListWrapper = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: 8
});

const mobileTabList = style({
  display: 'flex',
  flexDirection: 'row',
  gap: 8,
  paddingX: 12,
  paddingY: 8,
  overflow: 'auto',
  flexGrow: 1,
  scrollbarWidth: 'none',
  '::-webkit-scrollbar': {
    display: 'none'
  }
});

const mobileTab = style<TabRenderProps>({
  ...focusRing(),
  display: 'flex',
  gap: 8,
  color: {
    default: baseColor('neutral-subdued'),
    isSelected: baseColor('neutral'),
    forcedColors: {
      isSelected: 'Highlight'
    }
  },
  borderRadius: 'sm',
  paddingX: 12,
  paddingY: 8,
  alignItems: 'center',
  position: 'relative',
  cursor: 'default',
  flexShrink: 0,
  transition: 'default',
  disableTapHighlight: true,
  whiteSpace: 'nowrap',
  fontSize: 'body',
  fontWeight: {
    default: 'normal',
    isSelected: 'medium'
  }
});

const mobileSelectionIndicator = style({
  position: 'absolute',
  left: 0,
  bottom: 0,
  width: 'full',
  height: 2,
  backgroundColor: {
    default: 'neutral',
    forcedColors: 'Highlight'
  },
  borderStyle: 'none',
  borderRadius: 'full',
  transition: '[translate, width, height]'
});

const mobileTabPanel = style({
  ...focusRing(),
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  outlineStyle: 'none'
});

const stickySearchContainer = style({
  width: 'full',
  position: 'sticky',
  top: 64,
  zIndex: 1,
  backgroundColor: 'layer-2',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  paddingTop: 8
});

function MobileTab(props: Omit<RACTabProps, 'children'> & {children: ReactNode}) {
  let contentId = useId();
  return (
    <RACTab
      {...props}
      className={renderProps => mobileTab(renderProps)}>
      <Provider
        values={[
          [TextContext, {
            id: contentId
          }]
        ]}>
        {props.children}
      </Provider>
      <SelectionIndicator className={mobileSelectionIndicator} />
    </RACTab>
  );
}

interface MobileTabListProps {
  children: ReactNode
}

function MobileTabList({children}: MobileTabListProps) {
  return (
    <div className={mobileTabListWrapper}>
      <div className={style({position: 'relative', flexGrow: 1, overflow: 'hidden'})}>
        <RACTabList className={mobileTabList}>
          {children}
        </RACTabList>
      </div>
      <div className={style({paddingEnd: 12, flexShrink: 0})}>
        <CloseButton />
      </div>
    </div>
  );
}

function MobileTabPanel(props: Omit<RACTabPanelProps, 'children'> & {children: ReactNode}) {
  return (
    <RACTabPanel
      {...props}
      className={mobileTabPanel}>
      {props.children}
    </RACTabPanel>
  );
}

export function MobileSearchMenu({pages, currentPage}) {
  return (
    <MobileCustomDialog padding="none">
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
      {props.children}
    </RACDialog>
  );
};

function MobileNav({pages, currentPage}: PageProps) {
  let overlayTriggerState = useContext(OverlayTriggerStateContext);
  let [searchFocused, setSearchFocused] = useState(false);
  let [searchValue, setSearchValue] = useState('');
  let prevSearchWasEmptyRef = useRef<boolean>(true);
  let scrollContainerRef = useRef<HTMLDivElement>(null);
  let [selectedLibrary, setSelectedLibrary] = useState<Library>(getLibraryFromPage(currentPage));

  let getSectionsForLibrary = useCallback((libraryId: string) => {
    let sectionsMap = new Map();
    let filteredPages = pages.filter(page => getLibraryFromPage(page) === libraryId && !page.exports?.hideFromSearch);
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

  let [selectedSection, setSelectedSection] = useState<string | undefined>(() => currentPage.exports?.section || currentLibrarySectionArray[0]);

  // Ensure selected section is valid for the current library
  const sectionIds = searchValue.trim().length > 0 ? ['all', ...currentLibrarySectionArray] : currentLibrarySectionArray;
  if (!selectedSection || !sectionIds.includes(selectedSection)) {
    setSelectedSection(currentLibrarySectionArray[0] || 'Components');
  }

  let getOrderedLibraries = () => {
    let allLibraries = (Object.keys(TAB_DEFS) as Library[]).map(id => ({id, label: TAB_DEFS[id].label, icon: TAB_DEFS[id].icon}));
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
      if (a.date && b.date) {
        let aDate = new Date(a.date);
        let bDate = new Date(b.date);
        return bDate.getTime() - aDate.getTime();
      } else if (a.date && !b.date) {
        return 1;
      } else if (!a.date && b.date) {
        return -1;
      }

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
      .sort((a, b) => {
        return title(a).localeCompare(title(b));
      })
      .map(page => ({id: page.url.replace(/^\//, ''), name: title(page), href: page.url, description: page.exports?.description, date: page.exports?.date}));
  };

  let getAllContent = (libraryId: string, searchValue: string = ''): ComponentCardItem[] => {
    let librarySections = getSectionsForLibrary(libraryId);
    let allPages = Array.from(librarySections.values()).flat();
    let filteredPages = filterPages(allPages, searchValue);
    return filteredPages
      .sort((a, b) => {
        if (a.date && b.date) {
          let aDate = new Date(a.date);
          let bDate = new Date(b.date);
          return bDate.getTime() - aDate.getTime();
        } else if (a.date && !b.date) {
          return 1;
        } else if (!a.date && b.date) {
          return -1;
        }
        return title(a).localeCompare(title(b));
      })
      .map(page => ({id: page.url.replace(/^\//, ''), name: title(page), href: page.url, description: page.exports?.description}));
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
  }, [selectedSection, selectedLibrary, searchValue]);

  return (
    <div className={style({minHeight: '100dvh', paddingBottom: 24, boxSizing: 'border-box'})}>
      <div className={mobileTabsWrapper}>
        <RACTabs
          aria-label="Libraries"
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
          }}>
          <div className={mobileTabListContainer}>
            <MobileTabList>
              {libraries.map(library => (
                <MobileTab key={library.id} id={library.id}>
                  <div className={style({display: 'flex', alignItems: 'center', gap: 8})}>
                    {library.icon}
                  </div>
                  {library.label}
                </MobileTab>
              ))}
            </MobileTabList>
          </div>
          {libraries.map(library => (
            <MobileTabPanel key={library.id} id={library.id}>
              <div className={stickySearchContainer}>
                <SearchField
                  aria-label="Search"
                  value={searchValue}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  styles={style({marginX: 16})} />
                <div className={style({overflow: 'auto', paddingX: 8, paddingBottom: 8})}>
                  <TagGroup
                    aria-label="Navigation sections"
                    selectionMode="single"
                    selectedKeys={selectedSection ? [selectedSection] : []}
                    disallowEmptySelection
                    onSelectionChange={handleTagSelection}
                    UNSAFE_style={{whiteSpace: 'nowrap'}}
                    items={tags}>
                    {tag => <Tag key={tag.id} id={tag.id}>{tag.name}</Tag>}
                  </TagGroup>
                </div>
              </div>
              <div ref={scrollContainerRef} className={style({paddingX: 12})}>
                <ComponentCardView
                  onAction={() => {
                    setSearchValue('');
                    overlayTriggerState?.close();
                  }}
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
            </MobileTabPanel>
          ))}
        </RACTabs>
      </div>
    </div>
  );
}

function title(page) {
  return page.exports?.title ?? page.tableOfContents?.[0]?.title ?? page.name;
}
