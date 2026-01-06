'use client';

import {Autocomplete, OverlayTriggerStateContext, Provider, Dialog as RACDialog, DialogProps as RACDialogProps, Tab as RACTab, TabList as RACTabList, TabPanel as RACTabPanel, TabPanelProps as RACTabPanelProps, TabProps as RACTabProps, Tabs as RACTabs, SelectionIndicator, TabRenderProps} from 'react-aria-components';
import {baseColor, focusRing, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {CloseButton, SearchField, TextContext} from '@react-spectrum/s2';
import {ComponentCardView} from './ComponentCardView';
import {
  getResourceTags,
  LazyIconSearchView,
  SearchEmptyState,
  useSearchMenuState
} from './searchUtils';
import {IconSearchSkeleton, useIconFilter} from './IconSearchView';
import {type Library} from './constants';
import React, {cloneElement, CSSProperties, ReactElement, ReactNode, Suspense, useContext, useEffect, useRef, useState} from 'react';
import {SearchTagGroups} from './SearchTagGroups';
import {useId} from '@react-aria/utils';
import {useRouter} from './Router';

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
  height: 'full',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  font: 'ui',
  backgroundColor: 'layer-1'
});

const mobileTabListContainer = style({
  flexShrink: 0
});

const mobileTabListWrapper = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: 8
});

const mobileTabList = style({
  display: {
    default: 'flex',
    '::-webkit-scrollbar': 'none'
  },
  flexDirection: 'row',
  gap: 8,
  paddingX: 12,
  paddingY: 8,
  overflow: 'auto',
  flexGrow: 1,
  scrollbarWidth: 'none'
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
  paddingX: 8,
  paddingY: 8,
  alignItems: 'center',
  position: 'relative',
  cursor: 'default',
  flexShrink: 0,
  transition: 'default',
  disableTapHighlight: true,
  whiteSpace: 'nowrap',
  fontSize: 'body',
  fontWeight: 'bold'
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
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  outlineStyle: 'none'
});

const stickySearchContainer = style({
  width: 'full',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  paddingTop: 8,
  flexShrink: 0,
  overflow: 'auto'
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

export function MobileSearchMenu({initialTag}: {initialTag?: string}) {
  return (
    <MobileCustomDialog padding="none">
      <MobileNav initialTag={initialTag} />
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

function MobileNav({initialTag}: {initialTag?: string}) {
  let {pages, currentPage} = useRouter();
  let overlayTriggerState = useContext(OverlayTriggerStateContext);
  let [searchFocused, setSearchFocused] = useState(false);
  let iconFilter = useIconFilter();
  let isOpen = !!overlayTriggerState?.isOpen;

  const {
    selectedLibrary,
    setSelectedLibrary,
    orderedLibraries: libraries,
    searchValue,
    setSearchValue,
    sectionTagsForDisplay: sectionTags,
    selectedTagId: selectedSection,
    setSelectedTagId: setSelectedSection,
    handleTagSelectionChange,
    filteredIcons,
    isIconsSelected,
    selectedItems,
    getPlaceholderText
  } = useSearchMenuState({
    pages,
    currentPage,
    initialTag,
    isOpen
  });

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

  // Delay closing until the page updates (or the skeleton shows).
  let lastPage = useRef(currentPage);
  useEffect(() => {
    if (currentPage !== lastPage.current && overlayTriggerState?.isOpen) {
      overlayTriggerState?.close();
    }
    lastPage.current = currentPage;
  }, [currentPage, overlayTriggerState]);

  // Wait to update selection until after close animation.
  let [currentUrl, setCurrentUrl] = useState(currentPage.url);
  if (currentPage.url !== currentUrl && !isOpen) {
    setCurrentUrl(currentPage.url);
  }

  return (
    <div className={style({height: 'full'})}>
      <div className={mobileTabsWrapper}>
        <RACTabs
          className={style({height: 'full', display: 'flex', flexDirection: 'column'})}
          aria-label="Libraries"
          selectedKey={selectedLibrary}
          onSelectionChange={(key) => {
            let newLib = key as Library;
            setSelectedLibrary(newLib);
            if (!searchFocused) {
              setSelectedSection('components');
            }
          }}>
          <div className={mobileTabListContainer}>
            <MobileTabList>
              {libraries.map((library, i) => (
                <MobileTab key={library.id} id={library.id}>
                  <div
                    className={style({display: 'flex', alignItems: 'center', gap: 8})}
                    style={{viewTransitionName: (i === 0 && isOpen) ? 'search-menu-icon' : 'none'} as CSSProperties}>
                    {cloneElement(library.icon as ReactElement<any>, {styles: style({size: 20})})}
                  </div>
                  <span style={{viewTransitionName: (i === 0 && isOpen && window.scrollY === 0) ? 'search-menu-label' : 'none'} as CSSProperties}>
                    {library.label}
                  </span>
                </MobileTab>
              ))}
            </MobileTabList>
          </div>
          {libraries.map(library => {
            const libraryResourceTags = getResourceTags(library.id);
            const placeholderText = getPlaceholderText(library.label);
            const showIcons = isIconsSelected && library.id === 'react-spectrum';
            return (
              <MobileTabPanel key={library.id} id={library.id}>
                <Autocomplete filter={showIcons ? iconFilter : undefined}>
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
                        resourceTags={libraryResourceTags}
                        selectedTagId={selectedSection}
                        onSectionSelectionChange={handleTagSelectionChange}
                        onResourceSelectionChange={handleTagSelectionChange}
                        isMobile
                        wrapperClassName={style({paddingTop: 0})}
                        contentClassName={style({display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, marginX: 0})} />
                    </div>
                  </div>
                  <div key={selectedLibrary + selectedSection} className={style({paddingX: 12, minHeight: 0, flexGrow: 1, overflow: 'clip', display: 'flex', flexDirection: 'column'})}>
                    {showIcons ? (
                      <Suspense fallback={<IconSearchSkeleton />}>
                        <LazyIconSearchView 
                          filteredItems={filteredIcons} 
                          listBoxClassName={style({flexGrow: 1, overflow: 'auto', width: '100%', scrollPaddingY: 4})} />
                      </Suspense>
                    ) : (
                      <ComponentCardView
                        currentUrl={currentUrl}
                        onAction={(key) => {
                          if (key === currentPage.url) {
                            overlayTriggerState?.close();
                          }
                        }}
                        items={library.id === selectedLibrary ? selectedItems : []}
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

