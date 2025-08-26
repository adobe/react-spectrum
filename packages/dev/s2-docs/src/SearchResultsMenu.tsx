'use client';

import {ActionButton, Heading, Image, Menu, MenuItem, MenuSection, Header as RSPHeader, SearchField, Tag, TagGroup, Text} from '@react-spectrum/s2';
import {Autocomplete, AutocompleteProps, Collection, OverlayTriggerStateContext, Provider} from 'react-aria-components';
import Close from '@react-spectrum/s2/icons/Close';
import {ComponentCardItem, ComponentCardView} from './ComponentCardView';
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
  cardItems?: ComponentCardItem[],
  cardSections?: { id: string, name: string, children: ComponentCardItem[] }[],
  selectedCardSectionId?: string,
  onSelectedCardSectionChange?: (id: string) => void,
  filter?: AutocompleteProps['filter'],
  noResultsText?: (value: string) => string,
  closeSearchMenu: () => void,
  isPrimary?: boolean
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

export default function SearchResultsMenu({
  searchValue,
  onSearchValueChange,
  mainItems,
  libraryName,
  libraryKey,
  searchRef,
  showCards,
  cardItems,
  cardSections,
  selectedCardSectionId,
  onSelectedCardSectionChange,
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
            UNSAFE_style={{marginInlineEnd: 296, viewTransitionName: isPrimary ? 'search-menu-search-field' : 'none'} as CSSProperties}
            styles={style({width: '[500px]'})} />
        </div>

        <CloseButton closeSearchMenu={closeSearchMenu} />

        {showCards && (
          <div className={style({height: 'full', overflow: 'auto', paddingX: 16, paddingBottom: 16})}>
            {cardSections && cardSections.length > 0 ? (
              <>
                <div className={style({position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'white', paddingY: 8})}>
                  <TagGroup
                    selectionMode="single"
                    disallowEmptySelection
                    selectedKeys={selectedCardSectionId ? [selectedCardSectionId] : []}
                    onSelectionChange={(keys) => onSelectedCardSectionChange?.(Array.from(keys)[0] as string)}
                    aria-label="Select section">
                    {cardSections.map((section) => (
                      <Tag key={section.id} id={section.id}>
                        {section.name}
                      </Tag>
                    ))}
                  </TagGroup>
                </div>
                <ComponentCardView
                  items={(cardSections.find(s => s.id === selectedCardSectionId)?.children || []) as ComponentCardItem[]}
                  ariaLabel={cardSections.find(s => s.id === selectedCardSectionId)?.name || 'Items'} />
              </>
            ) : (
              <ComponentCardView items={cardItems || []} ariaLabel={`${libraryName} Components`} />
            )}
          </div>
        )}

        <div style={{display: showCards ? 'none' : 'block'}} className={style({height: 'full', overflow: 'auto'})}>
          {mainItems.length > 0 ? (
            <div
              className={style({marginX: 'auto', marginY: 8, maxWidth: '[500px]'})}
              role="region"
              aria-label="Main menu search">
              <Menu size="L" items={mainItems} aria-label={`${libraryName} Components`}>
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
