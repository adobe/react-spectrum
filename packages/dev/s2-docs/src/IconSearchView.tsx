/* eslint-disable rulesdir/imports */
'use client';

import {Autocomplete, GridLayout, ListBox, ListBoxItem, Size, useFilter, Virtualizer} from 'react-aria-components';
import Close from '@react-spectrum/s2/icons/Close';
import {Content, Heading, IllustratedMessage, pressScale, SearchField, Skeleton, Text} from '@react-spectrum/s2';
import {focusRing, iconStyle, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {iconAliases} from './iconAliases.js';
// @ts-ignore
import icons from '/packages/@react-spectrum/s2/s2wf-icons/*.svg';
// eslint-disable-next-line monorepo/no-internal-import
import NoSearchResults from '@react-spectrum/s2/illustrations/linear/NoSearchResults';
import React, {useCallback, useMemo, useRef} from 'react';

export const iconList = Object.keys(icons).map(name => ({id: name.replace(/^S2_Icon_(.*?)(Size\d+)?_2.*/, '$1'), icon: icons[name].default}));

const itemStyle = style({
  ...focusRing(),
  size: 'full',
  backgroundColor: {
    default: 'gray-50',
    isHovered: 'gray-100',
    isFocused: 'gray-100',
    isSelected: 'neutral'
  },
  '--iconPrimary': {
    type: 'color',
    value: {
      default: 'neutral',
      isSelected: 'gray-25'
    }
  },
  font: 'ui-sm',
  borderRadius: 'default',
  transition: 'default',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  alignItems: 'center',
  justifyContent: 'center',
  paddingX: 4,
  cursor: 'default'
});

let handleCopyImport = (id: string) => {
  navigator.clipboard.writeText(`import ${id} from '@react-spectrum/s2/icons/${id}';`).then(() => {
    // noop
  }).catch(() => {
    // noop
  });
};

interface IconSearchViewProps {
  filteredItems: typeof iconList
}

export function IconSearchView({filteredItems}: IconSearchViewProps) {
  return (
    <Virtualizer layout={GridLayout} layoutOptions={{minItemSize: new Size(64, 64), maxItemSize: new Size(64, 64), minSpace: new Size(12, 12), preserveAspectRatio: true}}>
      <ListBox
        onAction={(item) => handleCopyImport(item.toString())}
        items={filteredItems}
        layout="grid"
        className={style({width: '100%', scrollPaddingY: 4})}
        renderEmptyState={() => (
          <IllustratedMessage styles={style({marginX: 'auto', marginY: 32})}>
            <NoSearchResults />
            <Heading>No results</Heading>
            <Content>Try a different search term.</Content>
          </IllustratedMessage>
        )}>
        {item => <IconItem item={item} />}
      </ListBox>
    </Virtualizer>
  );
}

function IconItem({item}) {
  let Icon = item.icon;
  let ref = useRef(null);
  return (
    <ListBoxItem id={item.id} value={item} textValue={item.id} className={itemStyle} ref={ref} style={pressScale(ref)}>
      <Icon styles={iconStyle({size: 'XL'})} />
      <div
        className={style({
          maxWidth: '100%',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        })}>
        {item.id}
      </div>
    </ListBoxItem>
  );
}

export function SkeletonIconItem({item}: {item: {id: string}}) {
  const PlaceholderIcon = Close;
  const ref = useRef(null);
  
  const itemStyle = style({
    ...focusRing(),
    size: 'full',
    backgroundColor: {
      default: 'gray-50',
      isHovered: 'gray-100',
      isFocused: 'gray-100',
      isSelected: 'neutral'
    },
    '--iconPrimary': {
      type: 'color',
      value: {
        default: 'neutral',
        isSelected: 'gray-25'
      }
    },
    font: 'ui-sm',
    borderRadius: 'default',
    transition: 'default',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingX: 4
  });

  return (
    <ListBoxItem 
      id={item.id} 
      value={item} 
      textValue="skeleton" 
      className={itemStyle} 
      ref={ref}>
      <PlaceholderIcon styles={iconStyle({size: 'XL'})} />
      <div
        className={style({
          maxWidth: '100%',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        })}>
        <Text styles={style({font: 'ui-sm'})}>Name</Text>
      </div>
    </ListBoxItem>
  );
}

export function IconSearchSkeleton() {
  const mockItems = useMemo(() => Array.from({length: 140}, (_, i) => ({id: `skeleton-${i}`})), []);

  return (
    <Skeleton isLoading>
      <Virtualizer layout={GridLayout} layoutOptions={{minItemSize: new Size(64, 64), maxItemSize: new Size(64, 64), minSpace: new Size(12, 12), preserveAspectRatio: true}}>
        <ListBox
          items={mockItems}
          layout="grid"
          className={style({width: '100%', scrollPaddingY: 4})}>
          {(item) => <SkeletonIconItem item={item} />}
        </ListBox>
      </Virtualizer>
    </Skeleton>
  );
}

export function IconCards() {
  let {contains} = useFilter({sensitivity: 'base'});
  let filter = useCallback((textValue, inputValue) => {
    // check if we're typing part of a category alias
    for (const alias of Object.keys(iconAliases)) {
      if (contains(alias, inputValue) && iconAliases[alias].includes(textValue)) {
        return true;
      }
    }
    // also compare for substrings in the icon's actual name
    return textValue != null && contains(textValue, inputValue);
  }, [contains]);
  return (
    <Autocomplete filter={filter}>
      <div className={style({display: 'flex', flexDirection: 'column', gap: 8})}>
        <SearchField size="L" aria-label="Search icons" placeholder="Search icons" />
        <Virtualizer layout={GridLayout} layoutOptions={{minItemSize: new Size(64, 64), maxItemSize: new Size(64, 64), minSpace: new Size(12, 12), preserveAspectRatio: true}}>
          <ListBox
            onAction={(item) => handleCopyImport(item.toString())}
            items={iconList}
            layout="grid"
            className={style({height: 440, width: '100%', maxHeight: '100%', overflow: 'auto', scrollPaddingY: 4})}
            renderEmptyState={() => (
              <IllustratedMessage styles={style({marginX: 'auto', marginY: 32})}>
                <NoSearchResults />
                <Heading>No results</Heading>
                <Content>Try a different search term.</Content>
              </IllustratedMessage>
            )}>
            {item => <IconItem item={item} />}
          </ListBox>
        </Virtualizer>
      </div>
    </Autocomplete>
  );
}
