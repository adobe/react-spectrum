/* eslint-disable rsp-rules/imports */
'use client';

import {
  adobeA,
  adobeB,
  adobeD,
  adobeE,
  adobeO,
  aiLogo,
  arrow,
  bargraph,
  brush,
  cart,
  type Cell,
  cloud,
  comment,
  crop,
  dial,
  document,
  eye,
  eyedrop,
  filter,
  floppy,
  flower,
  folder,
  graph,
  hourglass,
  image,
  journey,
  lasso,
  mag,
  microphone,
  page,
  pencil,
  PixelLoader,
  potion,
  shop,
  slider,
  timeline,
  trefoil,
  wand
} from '@react-spectrum/ai/loader';
import {
  Autocomplete,
  GridLayout,
  ListBox,
  ListBoxItem,
  Size,
  useFilter,
  Virtualizer
} from 'react-aria-components';
import CheckmarkCircle from '@react-spectrum/s2/icons/CheckmarkCircle';
import {
  Content,
  Heading,
  IllustratedMessage,
  Link,
  pressScale,
  SearchField,
  ToastQueue
} from '@react-spectrum/s2';
import {focusRing, iconStyle, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {InfoMessage} from './colorSearchData';
import NoSearchResults from '@react-spectrum/s2/illustrations/linear/NoSearchResults';
import {useCallback, useRef, useState} from 'react';

export const aiIconList: {id: string; cells: Cell[]}[] = [
  {id: 'aiLogo', cells: aiLogo},
  {id: 'brush', cells: brush},
  {id: 'eye', cells: eye},
  {id: 'hourglass', cells: hourglass},
  {id: 'mag', cells: mag},
  {id: 'crop', cells: crop},
  {id: 'flower', cells: flower},
  {id: 'image', cells: image},
  {id: 'lasso', cells: lasso},
  {id: 'page', cells: page},
  {id: 'wand', cells: wand},
  {id: 'bargraph', cells: bargraph},
  {id: 'trefoil', cells: trefoil},
  {id: 'dial', cells: dial},
  {id: 'folder', cells: folder},
  {id: 'arrow', cells: arrow},
  {id: 'cloud', cells: cloud},
  {id: 'comment', cells: comment},
  {id: 'filter', cells: filter},
  {id: 'microphone', cells: microphone},
  {id: 'pencil', cells: pencil},
  {id: 'potion', cells: potion},
  {id: 'slider', cells: slider},
  {id: 'timeline', cells: timeline},
  {id: 'eyedrop', cells: eyedrop},
  {id: 'adobeA', cells: adobeA},
  {id: 'adobeD', cells: adobeD},
  {id: 'adobeO', cells: adobeO},
  {id: 'adobeB', cells: adobeB},
  {id: 'adobeE', cells: adobeE},
  {id: 'document', cells: document},
  {id: 'graph', cells: graph},
  {id: 'cart', cells: cart},
  {id: 'shop', cells: shop},
  {id: 'journey', cells: journey},
  {id: 'floppy', cells: floppy}
];

export function useAIIconFilter() {
  let {contains} = useFilter({sensitivity: 'base'});
  return useCallback(
    (textValue: string, inputValue: string) => {
      let trimmedInput = inputValue.trim();
      if (!trimmedInput) {
        return true;
      }
      return textValue != null && contains(textValue, trimmedInput);
    },
    [contains]
  );
}

export function useCopyAIImport() {
  let [copiedId, setCopiedId] = useState<string | null>(null);
  let timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  let handleCopyImport = useCallback((id: string) => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    navigator.clipboard
      .writeText(`import {${id}} from '@react-spectrum/ai/loader';`)
      .then(() => {
        setCopiedId(id);
        timeout.current = setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(() => {
        ToastQueue.negative('Failed to copy import statement.');
      });
  }, []);

  return {copiedId, handleCopyImport};
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
  color: {
    default: 'neutral',
    isSelected: 'gray-25'
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

function AIIconItem({
  item,
  isCopied = false
}: {
  item: (typeof aiIconList)[number];
  isCopied?: boolean;
}) {
  let ref = useRef(null);
  // oxlint-disable react/react-compiler
  return (
    <ListBoxItem
      id={item.id}
      value={item}
      textValue={item.id}
      className={itemStyle}
      ref={ref}
      style={pressScale(ref)}>
      {({isHovered, isFocusVisible}) =>
        isCopied ? (
          <>
            <CheckmarkCircle styles={iconStyle({size: 'XL'})} />
            <div
              className={style({
                maxWidth: '100%',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              })}>
              Copied!
            </div>
          </>
        ) : (
          <>
            {/* Only animate the tile under the pointer or keyboard focus, so the grid isn't
                looping dozens of pixel animations simultaneously. */}
            <PixelLoader icon={item.cells} size={32} isPlaying={isHovered || isFocusVisible} />
            <div
              className={style({
                maxWidth: '100%',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              })}>
              {item.id}
            </div>
          </>
        )
      }
    </ListBoxItem>
  );
  // oxlint-enable react/react-compiler
}

interface AIIconListBoxProps {
  items: typeof aiIconList;
  copiedId: string | null;
  onAction: (item: string) => void;
  listBoxClassName?: string;
}

function AIIconListBox({items, copiedId, onAction, listBoxClassName}: AIIconListBoxProps) {
  return (
    <Virtualizer
      layout={GridLayout}
      layoutOptions={{
        minItemSize: new Size(64, 64),
        maxItemSize: new Size(64, 64),
        minSpace: new Size(12, 12),
        preserveAspectRatio: true
      }}>
      <ListBox
        onAction={item => onAction(item.toString())}
        items={items}
        layout="grid"
        className={listBoxClassName || style({width: '100%', scrollPaddingY: 4, padding: 8})}
        dependencies={[copiedId]}
        renderEmptyState={() => (
          <IllustratedMessage styles={style({marginX: 'auto', marginY: 32})}>
            <NoSearchResults />
            <Heading>No results</Heading>
            <Content>Try a different search term.</Content>
          </IllustratedMessage>
        )}>
        {item => <AIIconItem item={item} isCopied={copiedId === item.id} />}
      </ListBox>
    </Virtualizer>
  );
}

export function AIIconsPageSearch() {
  let filter = useAIIconFilter();
  let {copiedId, handleCopyImport} = useCopyAIImport();

  return (
    <Autocomplete filter={filter}>
      <div className={style({display: 'flex', flexDirection: 'column', gap: 8})}>
        <SearchField size="L" aria-label="Search AI icons" placeholder="Search icons" />
        <InfoMessage>
          Press an item to copy its import statement. Hover or focus a tile to preview its
          animation. See <Link href="ai-components#loaders">Loaders</Link> for more information.
        </InfoMessage>
        <AIIconListBox
          items={aiIconList}
          copiedId={copiedId}
          onAction={handleCopyImport}
          listBoxClassName={style({
            height: 380,
            width: '100%',
            maxHeight: '100%',
            overflow: 'auto',
            scrollPaddingY: 4
          })}
        />
      </div>
    </Autocomplete>
  );
}
