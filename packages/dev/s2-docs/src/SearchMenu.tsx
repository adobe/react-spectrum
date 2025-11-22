'use client';

import {ActionButton, SearchField} from '@react-spectrum/s2';
import {Autocomplete, Dialog, Key, OverlayTriggerStateContext, Provider} from 'react-aria-components';
import Close from '@react-spectrum/s2/icons/Close';
import {ComponentCardView} from './ComponentCardView';
import {
  type ComponentItem,
  createSearchOptions,
  filterAndSortSearchItems,
  getOrderedLibraries,
  getPageTitle,
  getResourceTags,
  SearchEmptyState,
  sortItemsForDisplay,
  sortSearchItems,
  useFilteredIcons,
  useSearchTagSelection,
  useSectionTagsForDisplay
} from './searchUtils';
import {getLibraryFromPage, getLibraryFromUrl} from './library';
import {IconSearchSkeleton, useIconFilter} from './IconSearchView';
import {type Library, TAB_DEFS} from './constants';
// @ts-ignore
import {Page} from '@parcel/rsc';
import React, {CSSProperties, lazy, Suspense, useEffect, useMemo, useRef, useState} from 'react';
import {SearchTagGroups} from './SearchTagGroups';
import {style} from '@react-spectrum/s2/style' with { type: 'macro' };
import {Tab, TabList, TabPanel, Tabs} from './Tabs';
import {TextFieldRef} from '@react-types/textfield';

export function stripMarkdown(description: string | undefined) {
  return (description || '').replace(/\[(.*?)\]\(.*?\)/g, '$1');
}

export const divider = style({
  marginY: 8,
  marginStart: -8,
  marginEnd: 0,
  alignSelf: 'stretch',
  backgroundColor: {
    default: 'gray-400',
    forcedColors: 'ButtonBorder'
  },
  borderStyle: 'none',
  borderRadius: 'full',
  flexGrow: 0,
  flexShrink: 0,
  width: '[3px]'
});

const IconSearchView = lazy(() => import('./IconSearchView').then(({IconSearchView}) => ({default: IconSearchView})));

interface SearchMenuProps {
  pages: Page[],
  currentPage: Page,
  onClose: () => void,
  overlayId?: string,
  initialSearchValue: string,
  isSearchOpen: boolean
}

function CloseButton({onClose}: {onClose: () => void}) {
  return (
    <div style={{position: 'absolute', top: 8, right: 8}}>
      <Provider values={[[OverlayTriggerStateContext, null]]}>
        <ActionButton isQuiet onPress={onClose}>
          <Close />
        </ActionButton>
      </Provider>
    </div>
  );
}

export function SearchMenu(props: SearchMenuProps) {
  let {pages, currentPage, onClose, overlayId, isSearchOpen} = props;

  const currentLibrary = getLibraryFromPage(currentPage);
  let [selectedLibrary, setSelectedLibrary] = useState<Library>(currentLibrary);
  let [searchValue, setSearchValue] = useState(props.initialSearchValue);

  const orderedTabs = useMemo(() => getOrderedLibraries(currentPage), [currentPage]);

  const searchRef = useRef<TextFieldRef<HTMLInputElement> | null>(null);

  // Auto-focus search field when menu opens
  // We don't put autoFocus on the SearchField because it will cause a flicker when switching tabs
  useEffect(() => {
    const timer = setTimeout(() => {
      searchRef.current?.focus();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Transform pages data into component data structure
  const transformedComponents = useMemo(() => {
    if (!pages || !Array.isArray(pages)) {
      return [];
    }

    const components = pages
      .filter(page => page.url && page.url.endsWith('.html') && getLibraryFromUrl(page.url) === selectedLibrary && !page.exports?.hideFromSearch)
      .map(page => {
        const name = page.url.replace(/^\//, '').replace(/\.html$/, '');
        const title = getPageTitle(page);
        const section: string = (page.exports?.section as string) || 'Components';
        const tags: string[] = (page.exports?.tags || page.exports?.keywords as string[]) || [];
        const description: string = stripMarkdown(page.exports?.description);
        const date: string | undefined = page.exports?.date;
        return {
          id: name,
          name: title,
          href: page.url,
          section,
          tags,
          description,
          date
        };
      });

    return components;
  }, [pages, selectedLibrary]);

  // Build sections for the selected library
  const sections = useMemo(() => {
    const sectionNames = Array.from(new Set(transformedComponents.map(c => c.section || 'Components')));
    return sectionNames.map(sectionName => ({
      id: sectionName.toLowerCase(),
      name: sectionName,
      children: transformedComponents.filter(c => (c.section || 'Components') === sectionName)
    })).sort((a, b) => {
      if (a.id === 'components') {
        return -1;
      }
      if (b.id === 'components') {
        return 1;
      }
      return 0;
    });
  }, [transformedComponents]);

  const sectionTags = useMemo(() => sections.map(s => ({id: s.id, name: s.name})), [sections]);
  const resourceTags = useMemo(() => getResourceTags(selectedLibrary), [selectedLibrary]);

  const [selectedTagId, setSelectedTagId] = useSearchTagSelection(
    searchValue,
    sectionTags,
    resourceTags,
    currentPage.exports?.section?.toLowerCase() || 'components'
  );

  const filteredIcons = useFilteredIcons(searchValue);
  const iconFilter = useIconFilter();

  let filteredComponents = useMemo(() => {
    if (!searchValue) {
      return sections;
    }

    const allItems = sections.flatMap(section => section.children);

    const sortedItems = filterAndSortSearchItems(allItems, searchValue, createSearchOptions<ComponentItem>());

    const resultsBySection = new Map<string, typeof transformedComponents>();

    sortedItems.forEach(item => {
      const section = item.section || 'Components';
      if (!resultsBySection.has(section)) {
        resultsBySection.set(section, []);
      }
      resultsBySection.get(section)!.push(item);
    });

    return sections
      .map(section => ({
        ...section,
        children: resultsBySection.get(section.name) || []
      }))
      .filter(section => section.children.length > 0);
  }, [sections, searchValue]);

  const sectionTagsForDisplay = useSectionTagsForDisplay(
    sections,
    searchValue,
    selectedTagId,
    resourceTags.map(t => t.id)
  );

  const handleTabSelectionChange = React.useCallback((key: Key) => {
    setSelectedLibrary(key as typeof selectedLibrary);
    // Focus main search field of the newly selected tab
    setTimeout(() => {
      const lib = key as Library;
      const expectedLabel = `Search ${TAB_DEFS[lib].label}`;
      if (searchRef.current && searchRef.current.getInputElement()?.getAttribute('aria-label') === expectedLabel) {
        searchRef.current.focus();
      }
    }, 10);
  }, []);

  const handleSectionSelectionChange = React.useCallback((keys: Iterable<Key>) => {
    const firstKey = Array.from(keys)[0] as string;
    if (firstKey) {
      setSelectedTagId(firstKey);
    }
  }, [setSelectedTagId]);

  const handleIconSelectionChange = React.useCallback((keys: Iterable<Key>) => {
    const firstKey = Array.from(keys)[0] as string;
    if (firstKey) {
      setSelectedTagId(firstKey);
    }
  }, [setSelectedTagId]);

  const selectedItems = useMemo(() => {
    let items: typeof transformedComponents = [];
    if (searchValue.trim().length > 0 && selectedTagId === 'all') {
      items = filteredComponents.flatMap(s => s.children) || [];
      items = sortSearchItems(items, searchValue, createSearchOptions<ComponentItem>());
    } else {
      items = (filteredComponents.find(s => s.id === selectedTagId)?.children) || [];
      items = sortItemsForDisplay(items, searchValue);
    }

    return items;
  }, [filteredComponents, selectedTagId, searchValue]);

  const selectedSectionName = useMemo(() => {
    if (searchValue.trim().length > 0 && selectedTagId === 'all') {
      return 'All';
    }
    return (filteredComponents.find(s => s.id === selectedTagId)?.name)
      || (sections.find(s => s.id === selectedTagId)?.name)
      || 'Items';
  }, [filteredComponents, sections, selectedTagId, searchValue]);

  useEffect(() => {
    const handleNavigationStart = () => {
      setSearchValue('');
      onClose();
    };

    window.addEventListener('rsc-navigation-start', handleNavigationStart);
    return () => {
      window.removeEventListener('rsc-navigation-start', handleNavigationStart);
    };
  }, [onClose]);

  return (
    <Dialog id={overlayId} className={style({height: 'full'})} aria-label="Search menu">
      <Tabs
        aria-label="Libraries"
        keyboardActivation="manual"
        orientation="vertical"
        selectedKey={selectedLibrary}
        onSelectionChange={handleTabSelectionChange}>
        <TabList aria-label="Library">
          {orderedTabs.map((tab, i) => (
            <Tab key={tab.id} id={tab.id}>
              <div className={style({display: 'flex', gap: 12, marginTop: 4})}>
                <div style={{viewTransitionName: (i === 0 && isSearchOpen) ? 'search-menu-icon' : 'none'} as CSSProperties}>
                  {tab.icon}
                </div>
                <div>
                  <span style={{viewTransitionName: (i === 0 && isSearchOpen) ? 'search-menu-label' : 'none'} as CSSProperties} className={style({font: 'ui-2xl'})}>
                    {tab.label}
                  </span>
                  <div className={style({fontSize: 'ui-sm'})}>{tab.description}</div>
                </div>
              </div>
            </Tab>
          ))}
        </TabList>
        {orderedTabs.map((tab, i) => {
          const tabResourceTags = getResourceTags(tab.id);
          const selectedResourceTag = tabResourceTags.find(tag => tag.id === selectedTagId);
          const placeholderText = selectedResourceTag 
            ? `Search ${selectedResourceTag.name}` 
            : `Search ${tab.label}`;
          return (
            <TabPanel key={tab.id} id={tab.id}>
              <Autocomplete filter={selectedTagId === 'icons' ? iconFilter : undefined}>
                <div className={style({display: 'flex', flexDirection: 'column', height: 'full'})}>
                  <div className={style({flexShrink: 0, marginStart: 16, marginEnd: 64})}>
                    <SearchField
                      value={searchValue}
                      onChange={setSearchValue}
                      ref={searchRef}
                      size="L"
                      aria-label={`Search ${tab.label}`}
                      placeholder={placeholderText}
                      UNSAFE_style={{marginInlineEnd: 296, viewTransitionName: (i === 0 && isSearchOpen) ? 'search-menu-search-field' : 'none'} as CSSProperties}
                      styles={style({width: 500})} />
                  </div>

                  <CloseButton onClose={onClose} />

                  <SearchTagGroups
                    sectionTags={sectionTagsForDisplay}
                    resourceTags={tabResourceTags}
                    selectedTagId={selectedTagId}
                    onSectionSelectionChange={handleSectionSelectionChange}
                    onResourceSelectionChange={handleIconSelectionChange} />
                  {selectedTagId === 'icons' ? (
                    <div className={style({flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column'})}>
                      <Suspense fallback={<IconSearchSkeleton />}>
                        <IconSearchView 
                          filteredItems={filteredIcons} 
                          listBoxClassName={style({flexGrow: 1, overflow: 'auto', width: '100%', scrollPaddingY: 4})} />
                      </Suspense>
                    </div>
                  ) : (
                    <ComponentCardView
                      onAction={onClose}
                      items={selectedItems.map(item => ({
                        id: item.id,
                        name: item.name,
                        href: item.href ?? `/${tab.id}/${item.name}.html`,
                        description: item.description
                      }))}
                      ariaLabel={selectedSectionName}
                      renderEmptyState={() => <SearchEmptyState searchValue={searchValue} libraryLabel={tab.label} />} />
                  )}
                </div>
              </Autocomplete>
            </TabPanel>
          );
        })}
      </Tabs>
    </Dialog>
  );
}

export {MobileSearchMenu} from './MobileSearchMenu';
