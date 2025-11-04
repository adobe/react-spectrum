'use client';

import {ActionButton, Content, Heading, IllustratedMessage, SearchField, Tag, TagGroup} from '@react-spectrum/s2';
import {Autocomplete, Dialog, Key, OverlayTriggerStateContext, Provider, Separator as RACSeparator, useFilter} from 'react-aria-components';
import Close from '@react-spectrum/s2/icons/Close';
import {ComponentCardView} from './ComponentCardView';
import {getLibraryFromPage, getLibraryFromUrl} from './library';
import {iconAliases} from './iconAliases.js';
import {iconList, IconSearchSkeleton} from './IconSearchView';
import {type Library, TAB_DEFS} from './constants';
// eslint-disable-next-line monorepo/no-internal-import
import NoSearchResults from '@react-spectrum/s2/illustrations/linear/NoSearchResults';
// @ts-ignore
import {Page} from '@parcel/rsc';
import React, {CSSProperties, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {SelectableCollectionContext} from '../../../react-aria-components/src/RSPContexts';
import {style} from '@react-spectrum/s2/style' with { type: 'macro' };
import {Tab, TabList, TabPanel, Tabs} from './Tabs';
import {TextFieldRef} from '@react-types/textfield';

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
  overlayId: string,
  initialSearchValue: string
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
  let {pages, currentPage, onClose, overlayId} = props;

  const currentLibrary = getLibraryFromPage(currentPage);
  let [selectedLibrary, setSelectedLibrary] = useState<Library>(currentLibrary);
  let [searchValue, setSearchValue] = useState(props.initialSearchValue);

  const orderedTabs = useMemo(() => {
    const allTabs = (Object.keys(TAB_DEFS) as Library[]).map(id => ({id, ...TAB_DEFS[id]}));
    const currentTabIndex = allTabs.findIndex(tab => tab.id === currentLibrary);
    if (currentTabIndex > 0) {
      const currentTab = allTabs.splice(currentTabIndex, 1)[0];
      allTabs.unshift(currentTab);
    }
    return allTabs;
  }, [currentLibrary]);

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
        const title = page.tableOfContents?.[0]?.title || name;
        const section: string = (page.exports?.section as string) || 'Components';
        const tags: string[] = (page.exports?.tags || page.exports?.keywords as string[]) || [];
        const description: string = page.exports?.description;

        return {
          id: name,
          name: title,
          href: page.url,
          section,
          tags,
          description
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

  const sectionTags = useMemo(() => sections, [sections]);
  const iconTag = useMemo(() => {
    if (selectedLibrary === 'react-spectrum') {
      return [{id: 'icons', name: 'Icons'}];
    }
    return [];
  }, [selectedLibrary]);

  const [selectedSectionId, setSelectedSectionId] = useState<string>(() => currentPage.exports?.section?.toLowerCase() || 'components');
  const prevSearchWasEmptyRef = useRef<boolean>(true);

  // Icon filter function
  const {contains} = useFilter({sensitivity: 'base'});
  const iconFilter = useCallback((textValue, inputValue) => {
    // check if we're typing part of a category alias
    for (const alias of Object.keys(iconAliases)) {
      if (contains(alias, inputValue) && iconAliases[alias].includes(textValue)) {
        return true;
      }
    }
    // also compare for substrings in the icon's actual name
    return textValue != null && contains(textValue, inputValue);
  }, [contains]);

  const filteredIcons = useMemo(() => {
    if (!searchValue.trim()) {
      return iconList;
    }
    return iconList.filter(item => iconFilter(item.id, searchValue));
  }, [searchValue, iconFilter]);

  // Ensure selected section is valid for the current library
  const baseSectionIds = sectionTags.map(s => s.id);
  const baseIconIds = iconTag.map(t => t.id);
  const allBaseIds = [...baseSectionIds, ...baseIconIds];
  const sectionIds = searchValue.trim().length > 0 && selectedSectionId !== 'icons' ? ['all', ...allBaseIds] : allBaseIds;
  if (!selectedSectionId || !sectionIds.includes(selectedSectionId)) {
    setSelectedSectionId(sectionIds[0] || 'components');
  }

  // When search starts, auto-select the All tag (unless Icons is selected).
  useEffect(() => {
    const isEmpty = searchValue.trim().length === 0;
    if (prevSearchWasEmptyRef.current && !isEmpty && selectedSectionId !== 'icons') {
      setSelectedSectionId('all');
    }
    prevSearchWasEmptyRef.current = isEmpty;
  }, [searchValue, selectedSectionId]);

  let filteredComponents = useMemo(() => {
    if (!searchValue) {
      return sections;
    }

    const searchLower = searchValue.toLowerCase();
    const allItems = sections.flatMap(section => section.children);
    
    // Filter items where name or tags start with search value
    const matchedItems = allItems.filter(item => {
      const nameMatch = item.name.toLowerCase().startsWith(searchLower);
      const tagMatch = item.tags.some(tag => tag.toLowerCase().startsWith(searchLower));
      return nameMatch || tagMatch;
    });
    
    // Sort to prioritize name matches over tag matches
    const sortedItems = matchedItems.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().startsWith(searchLower);
      const bNameMatch = b.name.toLowerCase().startsWith(searchLower);
      
      if (aNameMatch && !bNameMatch) {
        return -1;
      }
      if (!aNameMatch && bNameMatch) {
        return 1;
      }
      
      // If both match by name or both match by tag, maintain original order
      return 0;
    });
    
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

  const tags = useMemo(() => {
    if (searchValue.trim().length > 0 && selectedSectionId !== 'icons') {
      // When searching, prepend an All tag (unless Icons is selected)
      return [{id: 'all', name: 'All'}, ...sectionTags];
    }
    return sectionTags;
  }, [searchValue, sectionTags, selectedSectionId]);

  const handleTabSelectionChange = React.useCallback((key: Key) => {
    if (searchValue) {
      setSearchValue('');
    }
    setSelectedLibrary(key as typeof selectedLibrary);
    // Focus main search field of the newly selected tab
    setTimeout(() => {
      const lib = key as Library;
      const expectedLabel = `Search ${TAB_DEFS[lib].label}`;
      if (searchRef.current && searchRef.current.getInputElement()?.getAttribute('aria-label') === expectedLabel) {
        searchRef.current.focus();
      }
    }, 10);
  }, [searchValue]);

  const handleSectionSelectionChange = React.useCallback((keys: Iterable<Key>) => {
    const firstKey = Array.from(keys)[0] as string;
    if (firstKey) {
      setSelectedSectionId(firstKey);
    }
  }, []);

  const handleIconSelectionChange = React.useCallback((keys: Iterable<Key>) => {
    const firstKey = Array.from(keys)[0] as string;
    if (firstKey) {
      setSelectedSectionId(firstKey);
    }
  }, []);

  const selectedItems = useMemo(() => {
    let items: typeof transformedComponents = [];
    if (searchValue.trim().length > 0 && selectedSectionId === 'all') {
      items = filteredComponents.flatMap(s => s.children) || [];
    } else {
      items = (filteredComponents.find(s => s.id === selectedSectionId)?.children) || [];
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
  }, [filteredComponents, selectedSectionId, searchValue]);

  const selectedSectionName = useMemo(() => {
    if (searchValue.trim().length > 0 && selectedSectionId === 'all') {
      return 'All';
    }
    return (filteredComponents.find(s => s.id === selectedSectionId)?.name)
      || (sections.find(s => s.id === selectedSectionId)?.name)
      || 'Items';
  }, [filteredComponents, sections, selectedSectionId, searchValue]);

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
                <div style={{viewTransitionName: i === 0 ? 'search-menu-icon' : 'none'} as CSSProperties}>
                  {tab.icon}
                </div>
                <div>
                  <span style={{viewTransitionName: i === 0 ? 'search-menu-label' : 'none'} as CSSProperties} className={style({font: 'ui-2xl'})}>
                    {tab.label}
                  </span>
                  <div className={style({fontSize: 'ui-sm'})}>{tab.description}</div>
                </div>
              </div>
            </Tab>
          ))}
        </TabList>
        {orderedTabs.map((tab, i) => {
          const tabIconTag = tab.id === 'react-spectrum' ? [{id: 'icons', name: 'Icons'}] : [];
          return (
            <TabPanel key={tab.id} id={tab.id}>
              <Autocomplete filter={selectedSectionId === 'icons' ? iconFilter : undefined}>
                <div className={style({display: 'flex', flexDirection: 'column', height: 'full'})}>
                  <div className={style({flexShrink: 0, marginStart: 16, marginEnd: 64})}>
                    <SearchField
                      value={searchValue}
                      onChange={setSearchValue}
                      ref={searchRef}
                      size="L"
                      aria-label={`Search ${tab.label}`}
                      placeholder={`Search ${tab.label}`}
                      UNSAFE_style={{marginInlineEnd: 296, viewTransitionName: i === 0 ? 'search-menu-search-field' : 'none'} as CSSProperties}
                      styles={style({width: 500})} />
                  </div>

                  <CloseButton onClose={onClose} />

                  {(tags.length > 0 || tabIconTag.length > 0) && (
                    <div className={style({flexShrink: 0, zIndex: 1, backgroundColor: 'layer-2', paddingTop: 16})}>
                      <SelectableCollectionContext.Provider value={null}>
                        <div className={style({display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, marginX: 16})}>
                          {tags.length > 0 && (
                            <TagGroup
                              selectionMode="single"
                              selectedKeys={selectedSectionId && selectedSectionId !== 'icons' ? [selectedSectionId] : []}
                              onSelectionChange={handleSectionSelectionChange}
                              aria-label="Select section"
                              items={tags}>
                              {(tag) => (
                                <Tag key={tag.id} id={tag.id}>
                                  {tag.name}
                                </Tag>
                              )}
                            </TagGroup>
                          )}
                          {tabIconTag.length > 0 && tags.length > 0 && (
                            <RACSeparator className={divider} />
                          )}
                          {tabIconTag.length > 0 && (
                            <TagGroup
                              selectionMode="single"
                              selectedKeys={selectedSectionId === 'icons' ? ['icons'] : []}
                              onSelectionChange={handleIconSelectionChange}
                              aria-label="Icons"
                              items={tabIconTag}>
                              {(tag) => (
                                <Tag key={tag.id} id={tag.id}>
                                  {tag.name}
                                </Tag>
                              )}
                            </TagGroup>
                          )}
                        </div>
                      </SelectableCollectionContext.Provider>
                    </div>
                  )}
                  {selectedSectionId === 'icons' ? (
                    <Suspense fallback={<IconSearchSkeleton />}>
                      <IconSearchView filteredItems={filteredIcons} />
                    </Suspense>
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
                      renderEmptyState={() => (
                        <IllustratedMessage styles={style({margin: 32})}>
                          <NoSearchResults />
                          <Heading>No results</Heading>
                          {searchValue.trim().length > 0 ? (
                            <Content>
                              No results found for <strong className={style({fontWeight: 'bold'})}>{searchValue}</strong> in {tab.label}.
                            </Content>
                          ) : (
                            <Content>
                              No results found in {tab.label}.
                            </Content>
                          )}
                        </IllustratedMessage>
                      )} />
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
