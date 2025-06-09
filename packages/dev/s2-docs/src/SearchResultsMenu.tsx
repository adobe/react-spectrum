'use client';

import {Autocomplete, AutocompleteProps, Collection} from 'react-aria-components';
import {Breadcrumb, Breadcrumbs, Heading, Image, Menu, MenuItem, MenuSection, Header as RSPHeader, SearchField, Text} from '@react-spectrum/s2';
import React from 'react';
import {style} from '@react-spectrum/s2/style' with { type: 'macro' };
import type {TextFieldRef} from '@react-types/textfield';

export interface ComponentItem {
  id: string,
  name: string,
  href?: string,
  description?: string,
  thumbnail?: string | URL
}

export interface ComponentSection {
  id: string,
  name: string,
  children: ComponentItem[]
}

export interface SubmenuItem {
  id: string,
  name: string,
  href?: string
}

interface SearchResultsMenuProps {
  isSubmenuOpen: boolean,
  submenuParentItem: ComponentItem | null,
  searchValue: string,
  onSearchValueChange: (value: string) => void,
  submenuSearchValue: string,
  onSubmenuSearchValueChange: (value: string) => void,
  mainItems: ComponentSection[],
  filteredSubmenuItems: SubmenuItem[],
  libraryName: string,
  libraryKey: 'react-spectrum' | 'react-aria' | 'internationalized',
  searchRef: React.RefObject<TextFieldRef<HTMLInputElement> | null>,
  onOpenSubmenu: (item: ComponentItem, libraryKey: SearchResultsMenuProps['libraryKey']) => void,
  onCloseSubmenu: () => void,
  showCards: boolean,
  renderCardList: () => React.ReactNode,
  filter?: AutocompleteProps['filter'],
  noResultsText?: (value: string) => string
}

export default function SearchResultsMenu({
  isSubmenuOpen,
  submenuParentItem,
  searchValue,
  onSearchValueChange,
  submenuSearchValue,
  onSubmenuSearchValueChange,
  mainItems,
  filteredSubmenuItems,
  libraryName,
  libraryKey,
  searchRef,
  onOpenSubmenu,
  onCloseSubmenu,
  showCards,
  renderCardList,
  filter,
  noResultsText = (value) => `No results for "${value}" in ${libraryName}` // Default with library name
}: SearchResultsMenuProps) {

  // Handler for ArrowLeft in submenu view
  const handleSubmenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && submenuSearchValue === '') {
      e.preventDefault();
      e.stopPropagation();
      onCloseSubmenu();
    }
  };

  // Handler for ArrowRight in main menu view
  const handleMainMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      const targetElement = e.target as HTMLElement;
      if (targetElement.getAttribute('role') === 'menuitem') {
        const key = targetElement.getAttribute('data-key');
        if (key) {
          let foundItem: ComponentItem | null = null;
          for (const section of mainItems) {
            foundItem = section.children.find(child => child.id === key) || null;
            if (foundItem) {break;}
          }
          if (foundItem) {
            e.preventDefault();
            e.stopPropagation();
            onOpenSubmenu(foundItem, libraryKey);
          }
        }
      }
    }
  };

  return (
    <>
      {isSubmenuOpen && submenuParentItem ? (
        // --- Submenu Autocomplete ---
        <Autocomplete
          aria-label={`Submenu for ${submenuParentItem.name}`}>
          <div onKeyDown={handleSubmenuKeyDown} role="region" aria-label="Submenu search">
            {/* Search Field for Submenu */}
            <div className={style({display: 'flex', marginX: 'auto', justifyContent: 'center', alignItems: 'center'})}>
              <SearchField
                value={submenuSearchValue}
                onChange={onSubmenuSearchValueChange}
                // Ref is attached here when submenu is open
                ref={searchRef}
                size="L"
                aria-label={`Search sections within ${submenuParentItem.name}`}
                styles={style({width: '[500px]'})} />
            </div>

            {/* Breadcrumbs Wrapper */}
            <div className={style({marginX: 'auto', marginY: 8, maxWidth: '[500px]', paddingBottom: 8})}>
              <Breadcrumbs onAction={onCloseSubmenu}>
                <Breadcrumb id={libraryKey} key={libraryKey}>{libraryName}</Breadcrumb>
                <Breadcrumb id={submenuParentItem.id} key={submenuParentItem.id}>{submenuParentItem.name}</Breadcrumb>
              </Breadcrumbs>
            </div>

            {/* Submenu Menu Wrapper */}
            <div className={style({marginX: 'auto', marginY: 0, maxWidth: '[500px]', maxHeight: '[calc(85vh - 80px)]', overflow: 'auto', padding: 16})}>
              {/* Conditionally render Menu or No Results message */}
              {filteredSubmenuItems.length > 0 ? (
                <Menu
                  size="L"
                  items={filteredSubmenuItems}
                  aria-label={`${submenuParentItem.name} Sections`}
                  autoFocus="first">
                  {(item) => (
                    <MenuItem key={item.id} id={item.id} textValue={item.name} href={item.href}>
                      <Text slot="label">{item.name}</Text>
                    </MenuItem>
                  )}
                </Menu>
              ) : (
                submenuSearchValue && (
                <Text styles={style({display: 'block', textAlign: 'center', marginY: 32})}>
                  {/* No results message using props */}
                  No results for "{submenuSearchValue}" on the {submenuParentItem.name} page in {libraryName}
                </Text>
                )
              )}
            </div>
          </div>
        </Autocomplete>
      ) : (
        // --- Main Search Autocomplete ---
        <Autocomplete filter={filter}>
          {/* Main Search Field */}
          <div className={style({display: 'flex', marginX: 'auto', justifyContent: 'center', alignItems: 'center'})}>
            <SearchField
              value={searchValue}
              onChange={onSearchValueChange}
              ref={searchRef}
              size="L"
              aria-label={`Search ${libraryName}`}
              styles={style({width: '[500px]'})} />
          </div>
          {showCards && renderCardList()}

          <div style={{display: showCards ? 'none' : 'block'}} className={style({maxHeight: '[85vh]', overflow: 'auto'})}>
            {mainItems.length > 0 ? (
              <div
                className={style({marginX: 'auto', marginY: 8, maxWidth: '[500px]'})}
                onKeyDown={handleMainMenuKeyDown}
                role="region"
                aria-label="Main menu search">
                <Menu autoFocus="first" size="L" items={mainItems} aria-label={`${libraryName} Components`}>
                  {section => (
                    <MenuSection key={section.id}>
                      <RSPHeader><Heading>{section.name}</Heading></RSPHeader>
                      <Collection items={section.children}>
                        {item => (
                          <MenuItem key={item.id} id={item.id} href={`/${libraryKey}/${item.name}.html`} aria-label={item.name} textValue={item.name}>
                            {item.thumbnail && <Image src={item.thumbnail.toString()} alt={item.name} />}
                            <Text slot="label">{item.name}</Text>
                            {item.description && <Text slot="description">{item.description}</Text>}
                          </MenuItem>
                          )}
                      </Collection>
                    </MenuSection>
                    )}
                </Menu>
              </div>
              ) : (
                // No Results View
                <Text styles={style({display: 'block', textAlign: 'center', marginY: 32})}>
                  {noResultsText(searchValue)}
                </Text>
              )}
          </div>
        </Autocomplete>
      )}
    </>
  );
}
