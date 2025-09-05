'use client';

import {ActionButton, Content, Heading, IllustratedMessage, SearchField, Tag, TagGroup} from '@react-spectrum/s2';
import {AdobeLogo} from './icons/AdobeLogo';
import {Autocomplete, AutocompleteProps, Dialog, Key, Modal, OverlayTriggerStateContext, Provider, useFilter} from 'react-aria-components';
import Close from '@react-spectrum/s2/icons/Close';
import {ComponentCardView} from './ComponentCardView';
import FakeSearchFieldButton from './FakeSearchFieldButton';
import {InternationalizedLogo} from './icons/InternationalizedLogo';
// eslint-disable-next-line monorepo/no-internal-import
import NoSearchResults from '@react-spectrum/s2/illustrations/linear/NoSearchResults';
import {Page} from '@parcel/rsc';
import React, {CSSProperties, useEffect, useMemo, useRef, useState} from 'react';
// @ts-ignore
import reactAriaDocs from 'docs:react-aria-components';
import {ReactAriaLogo} from './icons/ReactAriaLogo';
// @ts-ignore
import reactSpectrumDocs from 'docs:@react-spectrum/s2';
import {SelectableCollectionContext} from '../../../react-aria-components/src/context';
import {style} from '@react-spectrum/s2/style' with { type: 'macro' };
import {Tab, TabList, TabPanel, Tabs} from './Tabs';
import {TextFieldRef} from '@react-types/textfield';

interface SearchMenuProps {
  pages: Page[],
  currentPage: Page,
  toggleShowSearchMenu: () => void,
  closeSearchMenu: () => void,
  isSearchOpen: boolean,
  overlayId: string
}

function CloseButton({closeSearchMenu}: {closeSearchMenu: () => void}) {
  return (
    <div style={{position: 'absolute', top: 8, right: 8}}>
      <Provider values={[[OverlayTriggerStateContext, null]]}>
        <ActionButton isQuiet onPress={closeSearchMenu}>
          <Close />
        </ActionButton>
      </Provider>
    </div>
  );
}

let modalStyle = style({
  position: 'absolute',
  top: 8,
  width: 'full',
  // 1280px matches body
  maxWidth: '[min(1280px, 95vw)]',
  backgroundColor: 'elevated',
  paddingX: 16,
  paddingY: 8,
  zIndex: 10,
  borderWidth: 1,
  borderColor: 'gray-300',
  borderStyle: 'solid',
  borderRadius: 'xl',
  boxShadow: 'elevated',
  left: 0,
  right: 0,
  margin: 'auto',
  height: '[90vh]'
});

export type Library = 'react-spectrum' | 'react-aria' | 'internationalized';

type TabDef = {
  label: string,
  description: string,
  icon: React.ReactNode
};

export const TAB_DEFS: Record<Library, TabDef> = {
  'react-spectrum': {
    label: 'React Spectrum',
    description: "Components for Adobe's Spectrum design system",
    icon: <AdobeLogo />
  },
  'react-aria': {
    label: 'React Aria',
    description: 'Style-free components and hooks for building accessible UIs',
    icon: <ReactAriaLogo />
  },
  'internationalized': {
    label: 'Internationalized',
    description: 'Framework-agnostic internationalization utilities',
    icon: <InternationalizedLogo />
  }
};

const getCurrentLibrary = (currentPage: Page): Library => {
  if (currentPage.url.includes('react-aria')) {
    return 'react-aria';
  } else if (currentPage.url.includes('react-internationalized')) {
    return 'internationalized';
  }
  return 'react-spectrum';
};

const getLibraryFromUrl = (url: string): Library => {
  if (url.includes('react-aria')) {
    return 'react-aria';
  }
  if (url.includes('react-internationalized')) {
    return 'internationalized';
  }
  return 'react-spectrum';
};

export default function SearchMenu(props: SearchMenuProps) {
  let {pages, currentPage, toggleShowSearchMenu, closeSearchMenu, isSearchOpen, overlayId} = props;

  const currentLibrary = getCurrentLibrary(currentPage);
  let [selectedLibrary, setSelectedLibrary] = useState<Library>(currentLibrary);
  let [searchValue, setSearchValue] = useState('');

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

  // Transform pages data into component data structure
  const transformedComponents = useMemo(() => {
    if (!pages || !Array.isArray(pages)) {
      return [];
    }

    const components = pages
      .filter(page => page.url && page.url.endsWith('.html') && getLibraryFromUrl(page.url) === selectedLibrary)
      .map(page => {
        const name = page.url.replace(/^\//, '').replace(/\.html$/, '');
        const title = page.tableOfContents?.[0]?.title || name;
        const lib = getLibraryFromUrl(page.url);

        // get description from docs metadata
        const componentKey = title.replace(/\s+/g, '');
        let description: string | undefined = undefined;
        if (lib === 'react-aria') {
          description = (reactAriaDocs as any)?.exports?.[componentKey]?.description;
        } else if (lib === 'react-spectrum') {
          description = (reactSpectrumDocs as any)?.exports?.[componentKey]?.description;
        }

        const section: string = (page.exports?.section as string) || 'Components';

        return {
          id: name,
          name: title,
          href: page.url,
          description,
          section
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

  const [selectedSectionId, setSelectedSectionId] = useState<string>('components');
  const prevSearchWasEmptyRef = useRef<boolean>(true);

  // Ensure selected section is valid for the current library
  useEffect(() => {
    const baseIds = sections.map(s => s.id);
    const sectionIds = searchValue.trim().length > 0 ? ['all', ...baseIds] : baseIds;
    if (!selectedSectionId || !sectionIds.includes(selectedSectionId)) {
      setSelectedSectionId(sectionIds[0] || 'components');
    }
  }, [selectedLibrary, sections, selectedSectionId, searchValue]);

  // When search starts, auto-select the All tag.
  useEffect(() => {
    const isEmpty = searchValue.trim().length === 0;
    if (prevSearchWasEmptyRef.current && !isEmpty) {
      setSelectedSectionId('all');
    }
    prevSearchWasEmptyRef.current = isEmpty;
  }, [searchValue]);

  useEffect(() => {
    let isMac = /Mac/.test(navigator.platform);
    const isTextInputLike = (el: Element | null): boolean => {
      if (!el) {
        return false;
      }
      let h = el as HTMLElement;
      return h.isContentEditable || !!el.closest('input, textarea, [contenteditable], [role="textbox"]');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.isComposing) {
        // avoid intercepting IME input
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        closeSearchMenu();
      } else if (((e.key === 'k' && (isMac ? e.metaKey : e.ctrlKey)))) {
        e.preventDefault();
        toggleShowSearchMenu();
      } else if (e.key === '/' && !(isTextInputLike(e.target as Element | null) || isTextInputLike(document.activeElement))) {
        e.preventDefault();
        toggleShowSearchMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeSearchMenu, toggleShowSearchMenu]);

  let onFocusSearch = React.useCallback(() => {
    toggleShowSearchMenu();
    if (isSearchOpen) {
      setTimeout(() => searchRef.current?.focus(), 10);
    }
  }, [isSearchOpen, toggleShowSearchMenu]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        // Focus the search field of the currently selected library
        if (searchRef.current) {
          searchRef.current.focus();
        }
      }, 10);
    }
  }, [isSearchOpen, selectedLibrary]);

  useEffect(() => {
    if (!isSearchOpen) {
      if (searchValue.trim() === '') {
        setSelectedLibrary(currentLibrary);
      }
    }
  }, [currentLibrary, isSearchOpen, searchValue]);

  let {contains} = useFilter({sensitivity: 'base'});

  const filter: NonNullable<AutocompleteProps<any>['filter']> = React.useCallback((textValue, inputValue) => {
    return textValue != null && contains(textValue, inputValue);
  }, [contains]);


  let filteredComponents = useMemo(() => {
    if (!searchValue) {
      return sections;
    }
    return sections.map(section => ({
      ...section,
      children: section.children.filter(item => contains(item.name, searchValue))
    })).filter(section => section.children.length > 0);
  }, [sections, searchValue, contains]);

  const tags = useMemo(() => {
    if (searchValue.trim().length > 0) {
      // When searching, prepend an All tag
      return [{id: 'all', name: 'All'}, ...sections];
    }
    return sections;
  }, [searchValue, sections]);

  // Type to search handler
  const handleButtonKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Ignore modifier keys, navigation keys, Enter, Escape, etc.
    if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey && e.key !== ' ') {
      e.preventDefault();
      onFocusSearch(); // Open the search overlay
      setSearchValue(e.key); // Set the initial search value
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      toggleShowSearchMenu();
    }
  }, [onFocusSearch, toggleShowSearchMenu]);

  let handleButtonPress = React.useCallback(() => {
    toggleShowSearchMenu();
  }, [toggleShowSearchMenu]);

  let handleSearchFieldKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && !searchValue.trim()) {
      e.preventDefault();
      closeSearchMenu();
    }
  }, [closeSearchMenu, searchValue]);

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

  const selectedItems = useMemo(() => {
    if (searchValue.trim().length > 0 && selectedSectionId === 'all') {
      return filteredComponents.flatMap(s => s.children) || [];
    }
    return (filteredComponents.find(s => s.id === selectedSectionId)?.children) || [];
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
    <div
      className={style({
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        alignItems: 'center',
        gap: 16
      })}>
      <FakeSearchFieldButton onKeyDown={handleButtonKeyDown} onPress={handleButtonPress} isSearchOpen={isSearchOpen} overlayId={overlayId} />
      <Modal isDismissable isOpen={isSearchOpen} onOpenChange={(isOpen) => { if (!isOpen) { closeSearchMenu(); } }} className={modalStyle}>
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
            {orderedTabs.map((tab, i) => (
              <TabPanel key={tab.id} id={tab.id}>
                <Autocomplete filter={filter}>
                  <div className={style({margin: 'auto', width: '[fit-content]', paddingBottom: 4})}>
                    <SearchField
                      onKeyDown={handleSearchFieldKeyDown}
                      value={searchValue}
                      onChange={setSearchValue}
                      ref={searchRef}
                      size="L"
                      aria-label={`Search ${tab.label}`}
                      UNSAFE_style={{marginInlineEnd: 296, viewTransitionName: i === 0 ? 'search-menu-search-field' : 'none'} as CSSProperties}
                      styles={style({width: '[500px]'})} />
                  </div>

                  <CloseButton closeSearchMenu={closeSearchMenu} />

                  <div className={style({height: 'full', overflow: 'auto', paddingX: 16, paddingBottom: 16})}>
                    {sections.length > 0 && (
                      <div className={style({position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'white', paddingY: 8})}>
                        <SelectableCollectionContext.Provider value={null}>
                          <TagGroup
                            selectionMode="single"
                            disallowEmptySelection
                            selectedKeys={selectedSectionId ? [selectedSectionId] : []}
                            onSelectionChange={handleSectionSelectionChange}
                            aria-label="Select section"
                            items={tags}
                            styles={style({marginX: 12})}>
                            {(tag) => (
                              <Tag key={tag.id} id={tag.id}>
                                {tag.name}
                              </Tag>
                            )}
                          </TagGroup>
                        </SelectableCollectionContext.Provider>
                      </div>
                    )}
                    <ComponentCardView
                      onAction={() => {
                        setSearchValue('');
                        closeSearchMenu();
                      }}
                      items={selectedItems.map(item => ({
                        id: item.id,
                        name: item.name,
                        href: item.href ?? `/${tab.id}/${item.name}.html`
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
                  </div>
                </Autocomplete>
              </TabPanel>
            ))}
          </Tabs>
        </Dialog>
      </Modal>
    </div>
  );
}
