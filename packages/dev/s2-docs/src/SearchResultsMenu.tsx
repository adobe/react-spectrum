'use client';

import {ActionButton, Heading, Image, Menu, MenuItem, MenuSection, Header as RSPHeader, SearchField, Text} from '@react-spectrum/s2';
import {Autocomplete, AutocompleteProps, Collection, OverlayTriggerStateContext, Provider} from 'react-aria-components';
import Close from '@react-spectrum/s2/icons/Close';
import React, {CSSProperties} from 'react';
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

interface SearchResultsMenuProps {
  searchValue: string,
  onSearchValueChange: (value: string) => void,
  mainItems: ComponentSection[],
  libraryName: string,
  libraryKey: 'react-spectrum' | 'react-aria' | 'internationalized',
  searchRef: React.RefObject<TextFieldRef<HTMLInputElement> | null>,
  showCards: boolean,
  renderCardList: () => React.ReactNode,
  filter?: AutocompleteProps['filter'],
  noResultsText?: (value: string) => string,
  closeSearchMenu: () => void,
  isPrimary?: boolean
}

function CloseButton({closeSearchMenu}: {closeSearchMenu: () => void}) {
  return (
    <div style={{position: 'absolute', top: 8, right: 8}}>
      <Provider
        values={[
          // Remove the pressed state. S2/RAC bug?
          [OverlayTriggerStateContext, null]
        ]}>
        <ActionButton isQuiet onPress={closeSearchMenu}>
          <Close />
        </ActionButton>
      </Provider>
    </div> 
  );
}

export default function SearchResultsMenu({
  searchValue,
  onSearchValueChange,
  mainItems,
  libraryName,
  libraryKey,
  searchRef,
  showCards,
  renderCardList,
  filter,
  noResultsText = (value) => `No results for "${value}" in ${libraryName}`, // Default with library name
  closeSearchMenu,
  isPrimary = false
}: SearchResultsMenuProps) {

  return (
    <>
      <Autocomplete filter={filter}>
        {/* Main Search Field */}
        <div className={style({margin: 'auto', width: '[fit-content]'})}>
          <SearchField
            value={searchValue}
            onChange={onSearchValueChange}
            ref={searchRef}
            size="L"
            aria-label={`Search ${libraryName}`}
            UNSAFE_style={{marginInlineEnd: 308, viewTransitionName: isPrimary ? 'search-menu-search-field' : 'none'} as CSSProperties}
            styles={style({width: '[500px]'})} />
        </div>

        <CloseButton closeSearchMenu={closeSearchMenu} />

        {showCards && renderCardList()}

        <div style={{display: showCards ? 'none' : 'block'}} className={style({maxHeight: '[85vh]', overflow: 'auto'})}>
          {mainItems.length > 0 ? (
             
            <div
              className={style({marginX: 'auto', marginY: 8, maxWidth: '[500px]'})}
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
              <div className={style({display: 'block', textAlign: 'center', marginY: 32})}>
                {noResultsText(searchValue)}
              </div>
            )}
        </div>
      </Autocomplete>
    </>
  );
}
