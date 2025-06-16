'use client';

import {AdobeLogo} from './icons/AdobeLogo';
import {AutocompleteProps, Button, ButtonProps, Modal, useFilter} from 'react-aria-components';
import CardList from './CardList';
import {fontRelative, style} from '@react-spectrum/s2/style' with { type: 'macro' };
import {InternationalizedLogo} from './icons/InternationalizedLogo';
import {Page} from '@parcel/rsc';
import React, {CSSProperties, useEffect, useMemo, useRef, useState} from 'react';
import {ReactAriaLogo} from './icons/ReactAriaLogo';
import Search from '@react-spectrum/s2/icons/Search';
import SearchResultsMenu from './SearchResultsMenu';
import {Tab, TabList, TabPanel, Tabs} from './Tabs';
import {TextFieldRef} from '@react-types/textfield';

interface SearchMenuProps {
  pages: Page[],
  currentPage: Page,
  toggleShowSearchMenu: () => void,
  closeSearchMenu: () => void,
  isSearchOpen: boolean
}

interface FakeSearchFieldButtonProps extends Omit<ButtonProps, 'children' | 'className'> {
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void,
  isSearchOpen: boolean
}

function FakeSearchFieldButton({onPress, onKeyDown, isSearchOpen, ...props}: FakeSearchFieldButtonProps) {
  return (
    <Button
      {...props}
      aria-label="Open search and menu"
      onPress={onPress}
      onKeyDown={onKeyDown}
      className={({isHovered, isFocusVisible}) => style({
        height: 40,
        boxSizing: 'border-box',
        paddingX: 'edge-to-text',
        fontSize: 'ui-lg',
        borderRadius: 'full',
        borderWidth: 2,
        borderStyle: 'solid',
        transition: 'default',
        borderColor: {
          default: 'gray-300',
          isHovered: 'gray-400',
          isFocusVisible: 'gray-900'
        },
        backgroundColor: 'gray-25',
        color: 'neutral-subdued',
        cursor: 'text',
        width: '[500px]',
        display: 'flex',
        alignItems: 'center',
        gap: 'text-to-visual',
        outlineStyle: {
          default: 'none',
          isFocusVisible: 'solid'
        },
        outlineOffset: 2,
        outlineColor: {
          default: 'transparent',
          isFocusVisible: 'focus-ring'
        },
        outlineWidth: {
          default: 0,
          isFocusVisible: 2
        }
      })({isHovered, isFocusVisible})}
      style={{viewTransitionName: !isSearchOpen ? 'search-menu-search-field' : 'none'} as CSSProperties}>
      <Search
        UNSAFE_className={String(style({
          size: fontRelative(20),
          '--iconPrimary': {type: 'fill', value: 'currentColor'},
          flexShrink: 0
        }))} />
      <kbd
        className={style({
          marginStart: 'auto',
          font: 'detail',
          backgroundColor: 'layer-1',
          paddingY: '[1px]',
          paddingX: 2,
          borderRadius: 'xl',
          borderWidth: 1,
          borderColor: 'gray-300',
          borderStyle: 'solid',
          pointerEvents: 'none',
          alignSelf: 'center'
        })}>/</kbd>
    </Button>
  );
}

let modalStyle = style({
  position: 'absolute',
  top: 8,
  width: 'full',
  // Matches body
  maxWidth: 1600,
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

const getCurrentLibrary = (currentPage: Page) => {
  if (currentPage.url.includes('react-aria')) {
    return 'react-aria';
  } else if (currentPage.url.includes('react-internationalized')) {
    return 'internationalized';
  }
  return 'react-spectrum';
};

export default function SearchMenu(props: SearchMenuProps) {
  let {pages, currentPage, toggleShowSearchMenu, closeSearchMenu, isSearchOpen} = props;

  let isMac = useMemo(() => /Mac/.test(navigator.platform), []);
  
  const currentLibrary = getCurrentLibrary(currentPage);
  let [selectedLibrary, setSelectedLibrary] = useState<'react-spectrum' | 'react-aria' | 'internationalized'>(currentLibrary);
  let [searchValue, setSearchValue] = useState('');

  const getOrderedTabs = () => {
    const allTabs = [
      {
        id: 'react-spectrum',
        label: 'React Spectrum',
        description: "Components for Adobe's Spectrum design system",
        icon: <AdobeLogo />
      },
      {
        id: 'react-aria',
        label: 'React Aria', 
        description: 'Style-free components and hooks for building accessible UIs',
        icon: <ReactAriaLogo />
      },
      {
        id: 'internationalized',
        label: 'Internationalized',
        description: 'Framework-agnostic internationalization utilities', 
        icon: <InternationalizedLogo />
      }
    ];

    // Find current tab and move it to first position
    const currentTabIndex = allTabs.findIndex(tab => tab.id === currentLibrary);
    if (currentTabIndex > 0) {
      const currentTab = allTabs.splice(currentTabIndex, 1)[0];
      allTabs.unshift(currentTab);
    }
    
    return allTabs;
  };

  const orderedTabs = getOrderedTabs();
  let searchRef = useRef<TextFieldRef<HTMLInputElement> | null>(null);

  // Transform pages data into component data structure
  const transformedComponents = useMemo(() => {
    if (!pages || !Array.isArray(pages)) {
      return [];
    }

    const components = pages
      .filter(page => {
        if (!page.url || !page.url.endsWith('.html')) {
          return false;
        }

        // Determine library from URL
        let library: 'react-spectrum' | 'react-aria' | 'internationalized' = 'react-spectrum';
        if (page.url.includes('react-aria')) {
          library = 'react-aria';
        } else if (page.url.includes('react-internationalized')) {
          library = 'internationalized';
        }
        
        return library === selectedLibrary;
      })
      .map(page => {
        const name = page.url.replace(/^\//, '').replace(/\.html$/, '');
        const title = page.tableOfContents?.[0]?.title || name;
        
        return {
          id: name,
          name: title,
          category: 'Components', // TODO
          href: page.url,
          description: `${title} documentation` // TODO
        };
      });

    return components;
  }, [pages, selectedLibrary]);

  // Create sections structure expected by the existing code
  const componentSections = useMemo(() => {
    const sections = [{
      id: 'components',
      name: 'Components',
      children: transformedComponents
    }];
    return sections;
  }, [transformedComponents]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeSearchMenu();
      } else if (((e.key === 'k' && (isMac ? e.metaKey : e.ctrlKey)) || e.key === '/')) {
        e.preventDefault();
        toggleShowSearchMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeSearchMenu, isMac, toggleShowSearchMenu]);

  let onFocusSearch = () => {
    toggleShowSearchMenu();
    if (isSearchOpen) {
      setTimeout(() => searchRef.current?.focus(), 10);
    }
  };

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

  let filter: AutocompleteProps['filter'] = (textValue, inputValue) => {
    return textValue != null && contains(textValue, inputValue);
  };

  let showCards = useMemo(() => searchValue.trim() === '', [searchValue]);

  let filteredComponents = useMemo(() => {
    if (!searchValue) {
      return componentSections;
    }
    return componentSections.map(section => ({
      ...section,
      children: section.children.filter(item => contains(item.name, searchValue))
    })).filter(section => section.children.length > 0);
  }, [componentSections, searchValue, contains]);

  // Type to search handler
  const handleButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Ignore modifier keys, navigation keys, Enter, Escape, etc.
    if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey && e.key !== ' ') {
      e.preventDefault();
      onFocusSearch(); // Open the search overlay
      setSearchValue(e.key); // Set the initial search value
    }
  };

  let handleButtonPress = () => {
    toggleShowSearchMenu();
  };

  return (
    <div
      className={style({ 
        width: 'full', 
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center',
        gap: 16
      })}>
      <FakeSearchFieldButton onKeyDown={handleButtonKeyDown} onPress={handleButtonPress} isSearchOpen={isSearchOpen} />
      <Modal isDismissable isOpen={isSearchOpen} onOpenChange={toggleShowSearchMenu} className={modalStyle}>
        <Tabs
          aria-label="Libraries"
          keyboardActivation="manual"
          orientation="vertical"
          selectedKey={selectedLibrary}
          onSelectionChange={(key) => {
            if (searchValue) {
              setSearchValue('');
            }
            setSelectedLibrary(key as typeof selectedLibrary);
            // Focus main search field of the newly selected tab
            setTimeout(() => {
              // Check ref exists and points to the correct main search field before focusing
              const keyString = key as string;
              const expectedLabel = `Search ${keyString.charAt(0).toUpperCase() + keyString.slice(1).replace('-', ' ')}`;
              if (searchRef.current && searchRef.current.getInputElement()?.getAttribute('aria-label') === expectedLabel) {
                searchRef.current.focus();
              }
            }, 10);
          }}>
          <TabList aria-label="Library">
            {orderedTabs.map((tab, i) => (
              <Tab key={tab.id} id={tab.id}>
                <div className={style({display: 'flex', gap: 12, marginTop: 4})}>
                  <div style={{viewTransitionName: i === 0 ? 'search-menu-icon' : 'none'} as CSSProperties}>
                    {tab.icon}
                  </div>
                  <div>
                    <span style={{viewTransitionName: i === 0 ? 'search-menu-label' : 'none'} as CSSProperties} className={style({fontSize: 'heading-xs'})}>
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
              <SearchResultsMenu
                libraryName={tab.label}
                libraryKey={tab.id as 'react-spectrum' | 'react-aria' | 'internationalized'}
                searchValue={searchValue}
                onSearchValueChange={setSearchValue}
                mainItems={filteredComponents}
                searchRef={searchRef}
                showCards={showCards}
                renderCardList={() => <CardList selectedLibrary={selectedLibrary} pages={pages} />}
                filter={filter}
                noResultsText={(value) => `No results for "${value}" in ${tab.label}`}
                closeSearchMenu={closeSearchMenu}
                isPrimary={i === 0} />
            </TabPanel>
          ))}
        </Tabs>
      </Modal>
    </div>
  );
}
