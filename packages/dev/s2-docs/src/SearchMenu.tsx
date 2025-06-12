'use client';

import {AdobeLogo} from './icons/AdobeLogo';
import {AutocompleteProps, Button, ButtonProps, Modal, useFilter} from 'react-aria-components';
import CardList from './CardList';
import {fontRelative, style} from '@react-spectrum/s2/style' with { type: 'macro' };
import {InternationalizedLogo} from './icons/InternationalizedLogo';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ReactAriaLogo} from './icons/ReactAriaLogo';
import Search from '@react-spectrum/s2/icons/Search';
import SearchResultsMenu from './SearchResultsMenu';
import {Tab, TabList, TabPanel, Tabs} from './Tabs';
import {TextFieldRef} from '@react-types/textfield';

interface ComponentItem {
  id: string,
  name: string,
  category?: string,
  description?: string,
  href?: string
}

interface SubmenuItem {
  id: string,
  name: string,
  href: string
}

interface FakeSearchFieldButtonProps extends Omit<ButtonProps, 'children' | 'className'> {
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void
}

function FakeSearchFieldButton({onPress, onKeyDown, ...props}: FakeSearchFieldButtonProps) {
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
      })({isHovered, isFocusVisible})}>
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
  // Matches header
  maxWidth: 1240,
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
  maxHeight: '[90vh]'
});

export default function SearchMenu(props) {
  let {pages, currentPage, toggleShowSearchMenu, isSearchOpen, isSubmenuOpen, setIsSubmenuOpen} = props;

  let isMac = useMemo(() => /Mac/.test(navigator.platform), []);
  
  const getCurrentLibrary = (currentPage) => {
    if (currentPage.url.includes('react-aria')) {
      return 'react-aria';
    } else if (currentPage.url.includes('react-internationalized')) {
      return 'internationalized';
    }
    return 'react-spectrum';
  };

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

  const [submenuItems, setSubmenuItems] = useState<SubmenuItem[]>([]);
  const [previousSearchValue, setPreviousSearchValue] = useState('');
  const [submenuSearchValue, setSubmenuSearchValue] = useState('');
  const [submenuParentItem, setSubmenuParentItem] = useState<ComponentItem | null>(null);

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

    // Handler for Breadcrumb action and closing submenu via Left Arrow
  const handleBreadcrumbAction = useCallback(() => {
    setIsSubmenuOpen(false);
    setSearchValue(previousSearchValue); // Restore main search value
    setSubmenuSearchValue('');
    setSubmenuParentItem(null);
    setSubmenuItems([]);
      // Focus the MAIN search field after state update allows it to render
    setTimeout(() => {
          // Check ref exists and points to the MAIN search field before focusing
      if (searchRef.current && searchRef.current.getInputElement()?.getAttribute('aria-label') === 'Search React Spectrum') {
        searchRef.current.focus();
      }
    }, 10);
  }, [previousSearchValue, searchRef, setIsSubmenuOpen, setSearchValue, setSubmenuItems, setSubmenuParentItem, setSubmenuSearchValue]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (isSubmenuOpen) {
          handleBreadcrumbAction();
        } else {
          toggleShowSearchMenu();
        }
      } else if (!isSubmenuOpen &&
        ((e.key === 'k' && (isMac ? e.metaKey : e.ctrlKey)) || e.key === '/')) {
        e.preventDefault();
        toggleShowSearchMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleBreadcrumbAction, isMac, isSubmenuOpen, previousSearchValue, toggleShowSearchMenu]);

  let onFocusSearch = () => {
    toggleShowSearchMenu();
    if (isSearchOpen && !isSubmenuOpen) {
      setTimeout(() => searchRef.current?.focus(), 10);
    }
  };

  useEffect(() => {
    if (isSearchOpen && !isSubmenuOpen) {
      setTimeout(() => {
        // Focus the search field of the currently selected library
        if (searchRef.current) {
          searchRef.current.focus();
        }
      }, 10);
    }
  }, [isSearchOpen, isSubmenuOpen, selectedLibrary]);

  useEffect(() => {
    if (!isSearchOpen) {
      if (searchValue.trim() === '' && submenuSearchValue.trim() === '') {
        setSelectedLibrary(currentLibrary);
      }
      setIsSubmenuOpen(false);
      setSubmenuParentItem(null);
      setSubmenuItems([]);
      setPreviousSearchValue('');
      setSubmenuSearchValue('');
    }
  }, [currentLibrary, isSearchOpen, searchValue, setIsSubmenuOpen, submenuSearchValue]);

  let {contains} = useFilter({sensitivity: 'base'});

  let filter: AutocompleteProps['filter'] = (textValue, inputValue) => {
    return textValue != null && contains(textValue, inputValue);
  };

  let showCards = useMemo(() => searchValue.trim() === '' && !isSubmenuOpen, [searchValue, isSubmenuOpen]);

  let filteredComponents = useMemo(() => {
    if (!searchValue) {
      return componentSections;
    }
    return componentSections.map(section => ({
      ...section,
      children: section.children.filter(item => contains(item.name, searchValue))
    })).filter(section => section.children.length > 0);
  }, [componentSections, searchValue, contains]);

  // Filter submenu items based on submenu search value
  let filteredSubmenuItems = useMemo(() => {
    if (!submenuSearchValue) {
      return submenuItems; // Return all items if search is empty
    }
    return submenuItems.filter(item => contains(item.name, submenuSearchValue));
  }, [submenuItems, submenuSearchValue, contains]);

  // Handler to open the submenu
  const handleOpenSubmenu = (item: ComponentItem, libraryKey: 'react-spectrum' | 'react-aria' | 'internationalized') => {
    const page = pages.find(p => p.url === item.href);
    let newSubmenuItems: SubmenuItem[] = [];

    if (page && page.tableOfContents) {
      const parentHref = `/${libraryKey}/${item.name}.html`;

      const flattenToc = (items: any[]): SubmenuItem[] => {
        let flattened: SubmenuItem[] = [];
        for (const tocItem of items) {
          if (tocItem.title) {
            const id = tocItem.title.toLowerCase().replace(/\s+/g, '-');
            flattened.push({
              id,
              name: tocItem.title,
              href: `${parentHref}#${id}`
            });
          }
          if (tocItem.children) {
            flattened.push(...flattenToc(tocItem.children));
          }
        }
        return flattened;
      };

      const topLevelToc = page.tableOfContents[0];
      if (topLevelToc && topLevelToc.children) {
        newSubmenuItems = flattenToc(topLevelToc.children);
      }
    } else {
      console.error('Page or table of contents not found for item:', item);
    }
    
    setPreviousSearchValue(searchValue);
    setSearchValue('');
    setSubmenuSearchValue('');
    setSubmenuParentItem(item);
    setSubmenuItems(newSubmenuItems);
    setIsSubmenuOpen(true);
  };

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
    setIsSubmenuOpen(false);
  };

  return (
    <div
      className={style({ 
        width: 'full', 
        maxWidth: '[1280px]', 
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center',
        gap: 16
      })}>
      <FakeSearchFieldButton onKeyDown={handleButtonKeyDown} onPress={handleButtonPress} />
      <Modal isDismissable isOpen={isSearchOpen} onOpenChange={toggleShowSearchMenu} className={modalStyle}>
        <Tabs
          aria-label="Libraries"
          keyboardActivation="manual"
          orientation="vertical"
          selectedKey={selectedLibrary}
          onSelectionChange={(key) => {
            // Reset submenu state when changing tabs
            setIsSubmenuOpen(false);
            setSubmenuParentItem(null);
            setSubmenuItems([]);
            if (previousSearchValue && !searchValue && !submenuSearchValue) {
              setSearchValue(previousSearchValue);
            }
            setSubmenuSearchValue('');
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
                  {/* @ts-ignore */}
                  <div style={{viewTransitionName: i === 0 ? 'search-menu-icon' : 'none'}}>
                    {tab.icon}
                  </div>
                  <div className={style({display: 'flex', flexDirection: 'column', gap: 0})}>
                    {/* @ts-ignore */}
                    <span style={{viewTransitionName: i === 0 ? 'search-menu-label' : 'none'}} className={style({fontSize: 'heading-xs'})}>
                      {tab.label}
                    </span>
                    <span className={style({fontSize: 'ui-sm'})}>{tab.description}</span>
                  </div>
                </div>
              </Tab>
            ))}
          </TabList>
          {orderedTabs.map((tab) => (
            <TabPanel key={tab.id} id={tab.id}>
              <SearchResultsMenu
                libraryName={tab.label}
                libraryKey={tab.id as 'react-spectrum' | 'react-aria' | 'internationalized'}
                isSubmenuOpen={isSubmenuOpen}
                submenuParentItem={submenuParentItem}
                searchValue={searchValue}
                onSearchValueChange={setSearchValue}
                submenuSearchValue={submenuSearchValue}
                onSubmenuSearchValueChange={setSubmenuSearchValue}
                mainItems={filteredComponents}
                filteredSubmenuItems={filteredSubmenuItems}
                searchRef={searchRef}
                onOpenSubmenu={(item, libraryKey) => handleOpenSubmenu(item, libraryKey)}
                onCloseSubmenu={handleBreadcrumbAction}
                showCards={showCards}
                renderCardList={() => <CardList selectedLibrary={selectedLibrary} pages={pages} />}
                filter={filter}
                noResultsText={(value) => `No results for "${value}" in ${tab.label}`} />
            </TabPanel>
          ))}
        </Tabs>
      </Modal>
    </div>
  );
}
