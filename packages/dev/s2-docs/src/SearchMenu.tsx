'use client';

import {ActionButton, SearchField} from '@react-spectrum/s2';
import {Autocomplete, Dialog, Key, OverlayTriggerStateContext, Provider} from 'react-aria-components';
import Close from '@react-spectrum/s2/icons/Close';
import {ComponentCardView} from './ComponentCardView';
import {
  getResourceTags,
  LazyIconSearchView,
  SearchEmptyState,
  useSearchMenuState
} from './searchUtils';
import {IconSearchSkeleton, useIconFilter} from './IconSearchView';
import {type Library, TAB_DEFS} from './constants';
import React, {CSSProperties, Suspense, useCallback, useEffect, useRef, useState} from 'react';
import {SearchTagGroups} from './SearchTagGroups';
import {style} from '@react-spectrum/s2/style' with { type: 'macro' };
import {Tab, TabList, TabPanel, Tabs} from './Tabs';
import {TextFieldRef} from '@react-types/textfield';
import {useRouter} from './Router';
import './SearchMenu.css';
import {preloadComponentImages} from './ComponentCard';

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


interface SearchMenuProps {
  onClose: () => void,
  overlayId?: string,
  initialSearchValue: string,
  initialTag?: string,
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
  let {pages, currentPage} = useRouter();
  let {onClose, overlayId, isSearchOpen} = props;

  const searchRef = useRef<TextFieldRef<HTMLInputElement> | null>(null);
  const iconFilter = useIconFilter();

  const {
    selectedLibrary,
    setSelectedLibrary,
    orderedLibraries: orderedTabs,
    searchValue,
    setSearchValue,
    sectionTagsForDisplay,
    selectedTagId,
    handleTagSelectionChange,
    filteredIcons,
    isIconsSelected,
    selectedItems,
    selectedSectionName,
    getPlaceholderText,
    sections
  } = useSearchMenuState({
    pages,
    currentPage,
    initialSearchValue: props.initialSearchValue,
    initialTag: props.initialTag,
    isOpen: isSearchOpen
  });

  // Auto-focus search field when menu opens
  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        searchRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  const handleTabSelectionChange = useCallback((key: Key) => {
    setSelectedLibrary(key as Library);
    // Focus main search field of the newly selected tab
    setTimeout(() => {
      const lib = key as Library;
      const expectedLabel = `Search ${TAB_DEFS[lib].label}`;
      if (searchRef.current && searchRef.current.getInputElement()?.getAttribute('aria-label') === expectedLabel) {
        searchRef.current.focus();
      }
    }, 10);
  }, [setSelectedLibrary]);
  
  // Delay closing until the page updates (or the skeleton shows).
  let lastPage = useRef(currentPage);
  useEffect(() => {
    if (currentPage !== lastPage.current && isSearchOpen) {
      onClose();
    }
    lastPage.current = currentPage;
  }, [currentPage, onClose, isSearchOpen]);

  // Wait to update selection until after close animation.
  let [currentUrl, setCurrentUrl] = useState(currentPage.url);
  if (currentPage.url !== currentUrl && !isSearchOpen) {
    setCurrentUrl(currentPage.url);
  }

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
                <div className={style({width: 26, flexShrink: 0, display: 'flex', justifyContent: 'center'})} style={{viewTransitionName: (i === 0 && isSearchOpen && window.scrollY === 0) ? 'search-menu-icon' : undefined} as CSSProperties}>
                  {tab.icon}
                </div>
                <div>
                  <span style={{viewTransitionName: (i === 0 && isSearchOpen && window.scrollY === 0) ? 'search-menu-label' : undefined} as CSSProperties} className={style({font: 'heading-sm', fontWeight: 'bold'})}>
                    {tab.label}
                  </span>
                  <div className={style({fontSize: 'ui', marginTop: 2})}>{tab.description}</div>
                </div>
              </div>
            </Tab>
          ))}
        </TabList>
        {orderedTabs.map((tab, i) => {
          const tabResourceTags = getResourceTags(tab.id);
          const placeholderText = getPlaceholderText(tab.label);
          return (
            <TabPanel key={tab.id} id={tab.id}>
              <Autocomplete filter={isIconsSelected ? iconFilter : undefined}>
                <div className={style({display: 'flex', flexDirection: 'column', height: 'full'})}>
                  <div className={style({flexShrink: 0, marginStart: 16, marginEnd: 64})}>
                    <SearchField
                      value={searchValue}
                      onChange={setSearchValue}
                      ref={searchRef}
                      size="L"
                      aria-label={`Search ${tab.label}`}
                      placeholder={placeholderText}
                      UNSAFE_style={{marginInlineEnd: 296, viewTransitionName: (i === 0 && isSearchOpen && window.scrollY === 0) ? 'search-menu-search-field' : undefined} as CSSProperties}
                      styles={style({width: 500})} />
                  </div>

                  <CloseButton onClose={onClose} />

                  <SearchTagGroups
                    sectionTags={sectionTagsForDisplay}
                    resourceTags={tabResourceTags}
                    selectedTagId={selectedTagId}
                    onSectionSelectionChange={handleTagSelectionChange}
                    onResourceSelectionChange={handleTagSelectionChange}
                    onHover={tag => {
                      preloadComponentImages(sections.find(s => s.id === tag)?.children?.map(c => c.name) || []);
                    }} />
                  {isIconsSelected ? (
                    <div className={style({flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column'})}>
                      <Suspense fallback={<IconSearchSkeleton />}>
                        <LazyIconSearchView 
                          filteredItems={filteredIcons} 
                          listBoxClassName={style({flexGrow: 1, overflow: 'auto', width: '100%', scrollPaddingY: 4})} />
                      </Suspense>
                    </div>
                  ) : (
                    <ComponentCardView
                      key={selectedLibrary + selectedTagId}
                      currentUrl={currentUrl}
                      onAction={(key) => {
                        if (key === currentPage.url) {
                          onClose();
                        }
                      }}
                      items={selectedItems.map(item => ({
                        id: item.href,
                        name: item.name,
                        href: item.href ?? `/${tab.id}/${item.name}`,
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
