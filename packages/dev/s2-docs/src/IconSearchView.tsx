/* eslint-disable rulesdir/imports */
'use client';

import {Autocomplete, GridLayout, ListBox, ListBoxItem, Size, useFilter, Virtualizer} from 'react-aria-components';
import CheckmarkCircle from '@react-spectrum/s2/icons/CheckmarkCircle';
import Close from '@react-spectrum/s2/icons/Close';
import {Content, Heading, IllustratedMessage, pressScale, SearchField, Skeleton, Text, ToastQueue} from '@react-spectrum/s2';
import {focusRing, iconStyle, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {iconAliases} from './iconAliases.js';
// @ts-ignore
import icons from '/packages/@react-spectrum/s2/s2wf-icons/*.svg';
import InfoCircle from '@react-spectrum/s2/icons/InfoCircle';
// eslint-disable-next-line monorepo/no-internal-import
import NoSearchResults from '@react-spectrum/s2/illustrations/linear/NoSearchResults';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

export const iconList = Object.keys(icons).map(name => ({id: name.replace(/^S2_Icon_(.*?)(Size\d+)?_2.*/, '$1'), icon: icons[name].default}));

export function useIconFilter() {
  let {contains} = useFilter({sensitivity: 'base'});
  return useCallback((textValue: string, inputValue: string) => {
    // Check for alias matches
    for (const alias of Object.keys(iconAliases)) {
      if (contains(alias, inputValue) && iconAliases[alias].includes(textValue)) {
        return true;
      }
    }
    // Also compare for substrings in the icon's actual name
    return textValue != null && contains(textValue, inputValue);
  }, [contains]);
}

export function useCopyImport() {
  let [copiedId, setCopiedId] = useState<string | null>(null);
  let timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  let handleCopyImport = useCallback((id: string) => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    navigator.clipboard.writeText(`import ${id} from '@react-spectrum/s2/icons/${id}';`).then(() => {
      setCopiedId(id);
      timeout.current = setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      ToastQueue.negative('Failed to copy import statement.');
    });
  }, []);

  return {copiedId, handleCopyImport};
}

function CopyInfoMessage() {
  return (
    <div className={style({display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4})}>
      <InfoCircle styles={iconStyle({size: 'XS'})} />
      <span className={style({font: 'ui'})}>Press an item to copy its import statement</span>
    </div>
  );
}

interface IconListBoxProps {
  items: typeof iconList,
  copiedId: string | null,
  onAction: (item: string) => void,
  listBoxClassName?: string
}

function IconListBox({items, copiedId, onAction, listBoxClassName}: IconListBoxProps) {
  return (
    <Virtualizer layout={GridLayout} layoutOptions={{minItemSize: new Size(64, 64), maxItemSize: new Size(64, 64), minSpace: new Size(12, 12), preserveAspectRatio: true}}>
      <ListBox
        onAction={(item) => onAction(item.toString())}
        items={items}
        layout="grid"
        className={listBoxClassName || style({width: '100%', scrollPaddingY: 4, overflow: 'auto'})}
        dependencies={[copiedId]}
        renderEmptyState={() => (
          <IllustratedMessage styles={style({marginX: 'auto', marginY: 32})}>
            <NoSearchResults />
            <Heading>No results</Heading>
            <Content>Try a different search term.</Content>
          </IllustratedMessage>
        )}>
        {item => <IconItem item={item} isCopied={copiedId === item.id} />}
      </ListBox>
    </Virtualizer>
  );
}

const itemStyle = style({
  ...focusRing(),
  size: 'full',
  backgroundColor: {
    default: 'gray-50',
    isHovered: 'gray-100',
    isFocusVisible: 'gray-100',
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

interface IconSearchViewProps {
  filteredItems: typeof iconList,
  listBoxClassName?: string
}

export function IconSearchView({filteredItems, listBoxClassName}: IconSearchViewProps) {
  let {copiedId, handleCopyImport} = useCopyImport();

  return (
    <>
      <CopyInfoMessage />
      <IconListBox items={filteredItems} copiedId={copiedId} onAction={handleCopyImport} listBoxClassName={listBoxClassName} />
    </>
  );
}

function IconItem({item, isCopied = false}: {item: typeof iconList[number], isCopied?: boolean}) {
  let Icon = item.icon;
  let ref = useRef(null);
  return (
    <ListBoxItem id={item.id} value={item} textValue={item.id} className={itemStyle} ref={ref} style={pressScale(ref)}>
      {isCopied ? <CheckmarkCircle styles={iconStyle({size: 'XL'})} /> : <Icon styles={iconStyle({size: 'XL'})} />}
      <div
        className={style({
          maxWidth: '100%',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        })}>
        {isCopied ? 'Copied!' : item.id}
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
          className={style({flexGrow: 1, overflow: 'auto', width: '100%', scrollPaddingY: 4})}>
          {(item) => <SkeletonIconItem item={item} />}
        </ListBox>
      </Virtualizer>
    </Skeleton>
  );
}

export function IconsPageSearch() {
  let filter = useIconFilter();
  let {copiedId, handleCopyImport} = useCopyImport();

  return (
    <>
      <Autocomplete filter={filter}>
        <div className={style({display: 'flex', flexDirection: 'column', gap: 8})}>
          <SearchField size="L" aria-label="Search icons" placeholder="Search icons" />
          <CopyInfoMessage />
          <IconListBox
            items={iconList}
            copiedId={copiedId}
            onAction={handleCopyImport}
            listBoxClassName={style({height: 440, width: '100%', maxHeight: '100%', overflow: 'auto', scrollPaddingY: 4})} />
        </div>
      </Autocomplete>
    </>
  );
}
