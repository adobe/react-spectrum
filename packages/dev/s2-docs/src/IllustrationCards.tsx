'use client';

import {Autocomplete, GridLayout, ListBox, ListBoxItem, Size, useFilter, Virtualizer} from 'react-aria-components';
import {Content, Heading, IllustratedMessage, pressScale, ProgressCircle, Radio, RadioGroup, SearchField, SegmentedControl, SegmentedControlItem, Text} from '@react-spectrum/s2';
import {focusRing, style} from '@react-spectrum/s2/style' with {type: 'macro'};
// @ts-ignore
import Gradient from '@react-spectrum/s2/icons/Gradient';
import {illustrationAliases} from './illustrationAliases.js';
// eslint-disable-next-line monorepo/no-internal-import
import NoSearchResults from '@react-spectrum/s2/illustrations/linear/NoSearchResults';
import Polygon4 from '@react-spectrum/s2/icons/Polygon4';
import React, {Suspense, use, useCallback, useRef, useState} from 'react';

type IllustrationItemType = {
  id: string,
  Component: React.ComponentType<any>
};

const itemStyle = style({
  ...focusRing(),
  size: 'full',
  backgroundColor: {
    default: 'gray-50',
    isHovered: 'gray-100',
    isFocused: 'gray-100',
    isSelected: 'neutral'
  },
  font: 'ui-sm',
  borderRadius: 'default',
  transition: 'default',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  alignItems: 'center',
  justifyContent: 'center'
});

export function IllustrationCards() {
  let [variant, setVariant] = useState<'linear' | 'gradient'>('gradient');
  let [gradientStyle, setGradientStyle] = useState<'generic1' | 'generic2'>('generic1');

  let {contains} = useFilter({sensitivity: 'base'});
  let filter = useCallback((textValue: string, inputValue: string) => {
    // Check if input matches an alias that maps to this illustration name
    for (const alias of Object.keys(illustrationAliases)) {
      if (contains(alias, inputValue) && illustrationAliases[alias].includes(textValue)) {
        return true;
      }
    }
    // Also compare for substrings in the illustration's actual name
    return textValue != null && contains(textValue, inputValue);
  }, [contains]);

  return (
    <Autocomplete filter={filter}>
      <div className={style({display: 'flex', flexDirection: 'column', gap: 8})}>
        <div className={style({display: 'flex', justifyContent: 'center'})}>
          <SegmentedControl
            aria-label="Illustration type"
            onSelectionChange={(value) => setVariant(value as 'linear' | 'gradient')}
            selectedKey={variant}>
            <SegmentedControlItem id="gradient"><Gradient /><Text>Gradient</Text></SegmentedControlItem>
            <SegmentedControlItem id="linear"><Polygon4 /><Text>Linear</Text></SegmentedControlItem>
          </SegmentedControl>
        </div>
        <SearchField size="L" aria-label="Search illustrations" placeholder="Search illustrations" />
        {variant === 'gradient' && (
          <RadioGroup
            labelPosition="side"
            orientation="horizontal"
            value={gradientStyle}
            onChange={(value) => setGradientStyle(value as 'generic1' | 'generic2')}
            aria-label="Gradient Style"
            UNSAFE_style={{display: 'flex', justifyContent: 'center'}}
            styles={style({marginTop: 16})}>
            <Radio value="generic1">Generic 1</Radio>
            <Radio value="generic2">Generic 2</Radio>
          </RadioGroup>
        )}
        <Suspense fallback={<Loading />}>
          <IllustrationList variant={variant} gradientStyle={gradientStyle} />
        </Suspense>
      </div>
    </Autocomplete>
  );
}

function Loading() {
  return (
    <div className={style({height: 560, width: 'full', display: 'flex', alignItems: 'center', justifyContent: 'center'})}>
      <ProgressCircle isIndeterminate aria-label="Loading" />
    </div>
  );
}

let handleCopyImport = (id: string, variant: string, gradientStyle: string) => {
  let importText = variant === 'gradient' ? 
    `import ${id} from '@react-spectrum/s2/illustrations/gradient/${gradientStyle}/${id}';` :
    `import ${id} from '@react-spectrum/s2/illustrations/linear/${id}';`;
  navigator.clipboard.writeText(importText).then(() => {
    // noop
  }).catch(() => {
    // noop
  });
};

function IllustrationList({variant, gradientStyle}) {
  let items = use(loadIllustrations(variant, gradientStyle));
  return (
    <Virtualizer
      layout={GridLayout}
      layoutOptions={{
        minItemSize: new Size(164, 164),
        maxItemSize: new Size(164, 164),
        minSpace: new Size(20, 20),
        preserveAspectRatio: true
      }}>
      <ListBox
        aria-label="Illustrations"
        items={items}
        layout="grid"
        onAction={(item) => handleCopyImport(item.toString(), variant, gradientStyle)}
        className={style({height: 560, width: '100%', maxHeight: '100%', overflow: 'auto', scrollPaddingY: 4})}
        renderEmptyState={() => (
          <IllustratedMessage styles={style({marginX: 'auto', marginY: 32})}>
            <NoSearchResults />
            <Heading>
              No results
            </Heading>
            <Content>
              Try a different search term.
            </Content>
          </IllustratedMessage>
          )}>
        {(item: IllustrationItemType) => <IllustrationItem item={item} />}
      </ListBox>
    </Virtualizer>
  );
}

function IllustrationItem({item}: {item: IllustrationItemType}) {
  let Illustration = item.Component;
  let ref = useRef(null);
  return (
    <ListBoxItem id={item.id} value={item} textValue={item.id} className={itemStyle} ref={ref} style={pressScale(ref)}>
      <Illustration />
      <div
        className={style({
          display: 'flex',
          alignItems: 'center',
          padding: 4
        })}>
        {item.id}
      </div>
    </ListBoxItem>
  );
}

const cache = new Map();

function loadIllustrations(variant: string, style: string): Promise<IllustrationItemType[]> {
  let key = variant === 'gradient' ? `${variant}:${style}` : variant;
  if (cache.has(key)) {
    return cache.get(key);
  }

  let promise: Promise<IllustrationItemType[]>;
  if (variant === 'linear') {
    promise = import('./illustrations/linear').then(m => m.default);
  } else {
    promise = style === 'generic1'
      ? import('./illustrations/generic1').then(m => m.default)
      : import('./illustrations/generic2').then(m => m.default);
  }

  cache.set(key, promise);
  return promise;
}
