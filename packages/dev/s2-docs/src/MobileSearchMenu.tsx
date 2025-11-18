'use client';

import {Autocomplete, Key, OverlayTriggerStateContext, Provider, Dialog as RACDialog, DialogProps as RACDialogProps, Tab as RACTab, TabList as RACTabList, TabPanel as RACTabPanel, TabPanelProps as RACTabPanelProps, TabProps as RACTabProps, Tabs as RACTabs, SelectionIndicator, TabRenderProps} from 'react-aria-components';
import {baseColor, focusRing, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {CloseButton, SearchField, TextContext} from '@react-spectrum/s2';
import {ComponentCardItem, ComponentCardView} from './ComponentCardView';
import {
  filterAndSortSearchItems,
  getOrderedLibraries,
  getPageTitle,
  getResourceTags,
  SearchEmptyState,
  type Section,
  sortItemsForDisplay,
  useFilteredIcons,
  useSearchTagSelection,
  useSectionTagsForDisplay
} from './searchUtils';
import {getLibraryFromPage} from './library';
import {IconSearchSkeleton, useIconFilter} from './IconSearchView';
// @ts-ignore
import {type Library} from './constants';
import {Page} from '@parcel/rsc';
import React, {lazy, ReactNode, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {SearchTagGroups} from './SearchTagGroups';
import {stripMarkdown} from './SearchMenu';
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

const IconSearchView = lazy(() => import('./IconSearchView').then(({IconSearchView}) => ({default: IconSearchView})));

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
        <Provider values={[[OverlayTriggerStateContext, null]]}>
          <CloseButton onPress={() => {}} />
        </Provider>
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

export function MobileSearchMenu({pages, currentPage}: {pages: Page[], currentPage: Page}) {
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

function MobileNav({pages, currentPage}: {pages: Page[], currentPage: Page}) {
  let overlayTriggerState = useContext(OverlayTriggerStateContext);
  let [searchFocused, setSearchFocused] = useState(false);
  let [searchValue, setSearchValue] = useState('');
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


  let libraries = useMemo(() => getOrderedLibraries(currentPage), [currentPage]);

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

  let filterPages = (pages: Page[], searchValue: string) => {
    return filterAndSortSearchItems(pages, searchValue, {
      getName: (page: Page) => getPageTitle(page),
      getTags: (page: Page) => page.exports?.tags || [],
      getDate: (page: Page) => page.exports?.date,
      shouldUseDateSort: (page: Page) => {
        const section = page.exports?.section;
        return section === 'Blog' || section === 'Releases';
      }
    });
  };

  let getSectionContent = (sectionName: string, libraryId: string, searchValue: string = ''): ComponentCardItem[] => {
    let librarySections = getSectionsForLibrary(libraryId);
    let pages = librarySections.get(sectionName) ?? [];

    let filteredPages = filterPages(pages, searchValue);

    let items = filteredPages.map(page => ({
      id: page.url.replace(/^\//, ''),
      name: getPageTitle(page),
      href: page.url,
      description: stripMarkdown(page.exports?.description),
      date: page.exports?.date
    }));

    return sortItemsForDisplay(items, searchValue);
  };

  let getAllContent = (libraryId: string, searchValue: string = ''): ComponentCardItem[] => {
    let librarySections = getSectionsForLibrary(libraryId);
    let allPages = Array.from(librarySections.values()).flat();
    let filteredPages = filterPages(allPages, searchValue);
    
    let items = filteredPages.map(page => ({
      id: page.url.replace(/^\//, ''),
      name: getPageTitle(page),
      href: page.url,
      description: stripMarkdown(page.exports?.description),
      date: page.exports?.date
    }));

    return sortItemsForDisplay(items, searchValue);
  };

  let getItemsForSelection = (section: string | undefined, libraryId: string, searchValue: string = ''): ComponentCardItem[] => {
    if (!section) {
      return [];
    }
    let items: ComponentCardItem[] = [];
    if (section === 'all') {
      items = getAllContent(libraryId, searchValue);
    } else {
      // Check if this is a resource tag (e.g., icons)
      const libraryResourceTags = getResourceTags(libraryId as Library);
      const libraryResourceTagIds = libraryResourceTags.map(t => t.id);
      if (libraryResourceTagIds.includes(section)) {
        // Resources are handled separately, return empty for now
        return [];
      }
      // Convert lowercase ID back to section name for getSectionContent
      const librarySections = getSectionNamesForLibrary(libraryId);
      const sectionName = librarySections.find(s => s.toLowerCase() === section) || section;
      items = getSectionContent(sectionName, libraryId, searchValue);
    }

    items = sortItemsForDisplay(items, searchValue);

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

  const sectionsForDisplay: Section[] = useMemo(() => {
    return currentLibrarySections.map(name => ({
      id: name.toLowerCase(),
      name,
      children: []
    }));
  }, [currentLibrarySections]);

  const initialSelectedSection = useMemo(() => {
    const section = currentPage.exports?.section;
    const firstSection = currentLibrarySections[0]?.toLowerCase() || 'components';
    return section ? section.toLowerCase() : firstSection;
  }, [currentPage, currentLibrarySections]);

  const resourceTags = useMemo(() => getResourceTags(selectedLibrary), [selectedLibrary]);

  const [selectedSection, setSelectedSection] = useSearchTagSelection(
    searchValue,
    sectionsForDisplay.map(s => ({id: s.id, name: s.name})),
    resourceTags,
    initialSelectedSection
  );

  const sectionTags = useSectionTagsForDisplay(
    sectionsForDisplay,
    searchValue,
    selectedSection,
    resourceTags.map(t => t.id)
  );

  const filteredIcons = useFilteredIcons(searchValue);
  const iconFilter = useIconFilter();

  let handleSectionSelectionChange = useCallback((keys: Iterable<Key>) => {
    const firstKey = Array.from(keys)[0] as string;
    if (firstKey) {
      setSelectedSection(firstKey);
    }
  }, [setSelectedSection]);

  let handleResourceSelectionChange = useCallback((keys: Iterable<Key>) => {
    const firstKey = Array.from(keys)[0] as string;
    if (firstKey) {
      setSelectedSection(firstKey);
    }
  }, [setSelectedSection]);

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
                setSelectedSection(nextSections[0].toLowerCase());
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
          {libraries.map(library => {
            const isIconsSelected = selectedSection === 'icons' && library.id === 'react-spectrum';
            const libraryResourceTags = getResourceTags(library.id);
            const selectedResourceTag = libraryResourceTags.find(tag => tag.id === selectedSection);
            const placeholderText = selectedResourceTag 
              ? `Search ${selectedResourceTag.name}` 
              : `Search ${library.label}`;
            return (
              <MobileTabPanel key={library.id} id={library.id}>
                <Autocomplete filter={isIconsSelected ? iconFilter : undefined}>
                  <div className={stickySearchContainer}>
                    <SearchField
                      aria-label="Search"
                      value={searchValue}
                      onChange={handleSearchChange}
                      onFocus={handleSearchFocus}
                      onBlur={handleSearchBlur}
                      placeholder={placeholderText}
                      styles={style({marginX: 16})} />
                    <div className={style({overflow: 'auto', paddingX: 8, paddingBottom: 8})}>
                      <SearchTagGroups
                        sectionTags={sectionTags}
                        resourceTags={resourceTags}
                        selectedTagId={selectedSection}
                        onSectionSelectionChange={handleSectionSelectionChange}
                        onResourceSelectionChange={handleResourceSelectionChange}
                        isMobile
                        wrapperClassName={style({paddingTop: 0})}
                        contentClassName={style({display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, marginX: 0})} />
                    </div>
                  </div>
                  <div ref={scrollContainerRef} className={style({paddingX: 12, flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column'})}>
                    {isIconsSelected ? (
                      <Suspense fallback={<IconSearchSkeleton />}>
                        <IconSearchView 
                          filteredItems={filteredIcons} 
                          listBoxClassName={style({flexGrow: 1, overflow: 'auto', width: '100%', scrollPaddingY: 4})} />
                      </Suspense>
                    ) : (
                      <ComponentCardView
                        onAction={() => {
                          setSearchValue('');
                          overlayTriggerState?.close();
                        }}
                        items={getItemsForSelection(selectedSection, library.id, searchValue)}
                        ariaLabel="Pages"
                        size="S"
                        renderEmptyState={() => <SearchEmptyState searchValue={searchValue} libraryLabel={library.label} />} />
                    )}
                  </div>
                </Autocomplete>
              </MobileTabPanel>
            );
          })}
        </RACTabs>
      </div>
    </div>
  );
}

