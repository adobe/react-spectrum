'use client';

import CheckmarkCircle from '@react-spectrum/s2/icons/CheckmarkCircle';
import {colorSwatch, getColorScale} from './color.macro' with {type: 'macro'};
import {Content, Heading, IllustratedMessage, pressScale, Skeleton, Text} from '@react-spectrum/s2';
import {focusRing, iconStyle, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {GridLayout, ListBox, ListBoxItem, Size, Virtualizer} from 'react-aria-components';
import InfoCircle from '@react-spectrum/s2/icons/InfoCircle';
// eslint-disable-next-line monorepo/no-internal-import
import NoSearchResults from '@react-spectrum/s2/illustrations/linear/NoSearchResults';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

const backgroundColors = [
  'base', 'layer-1', 'layer-2', 'pasteboard', 'elevated',
  'accent', 'accent-subtle', 'neutral', 'neutral-subdued', 'neutral-subtle',
  'negative', 'negative-subtle', 'informative', 'informative-subtle',
  'positive', 'positive-subtle', 'notice', 'notice-subtle',
  'gray', 'gray-subtle', 'red', 'red-subtle', 'orange', 'orange-subtle',
  'yellow', 'yellow-subtle', 'chartreuse', 'chartreuse-subtle',
  'celery', 'celery-subtle', 'green', 'green-subtle', 'seafoam', 'seafoam-subtle',
  'cyan', 'cyan-subtle', 'blue', 'blue-subtle', 'indigo', 'indigo-subtle',
  'purple', 'purple-subtle', 'fuchsia', 'fuchsia-subtle', 'magenta', 'magenta-subtle',
  'pink', 'pink-subtle', 'turquoise', 'turquoise-subtle',
  'cinnamon', 'cinnamon-subtle', 'brown', 'brown-subtle',
  'silver', 'silver-subtle', 'disabled'
];

const textColors = [
  'accent', 'neutral', 'neutral-subdued', 'negative', 'disabled',
  'heading', 'title', 'body', 'detail', 'code'
];

const semanticColorRanges: Record<string, number[]> = {
  'accent-color': [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600],
  'informative-color': [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600],
  'negative-color': [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600],
  'notice-color': [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600],
  'positive-color': [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600]
};

const globalColorRanges: Record<string, number[]> = {
  'gray': [25, 50, 75, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
  'blue': [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600],
  'red': [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600],
  'orange': [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600],
  'yellow': [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600],
  'chartreuse': [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600],
  'celery': [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600],
  'green': [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600],
  'seafoam': [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600],
  'cyan': [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600],
  'indigo': [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600],
  'purple': [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600],
  'fuchsia': [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600],
  'magenta': [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600],
  'pink': [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600],
  'turquoise': [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600],
  'brown': [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600],
  'silver': [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600],
  'cinnamon': [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600]
};

const semanticColors = Object.entries(semanticColorRanges).flatMap(([scale, ranges]) =>
  ranges.map(value => ({name: `${scale.replace('-color', '')}-${value}`, section: 'Semantic colors', type: 'backgroundColor'}))
);

const globalColors = Object.entries(globalColorRanges).flatMap(([scale, ranges]) =>
  ranges.map(value => ({name: `${scale}-${value}`, section: 'Global colors', type: 'backgroundColor'}))
);

export const colorSections = [
  {
    id: 'background',
    name: 'Background colors',
    items: backgroundColors.map(name => ({name, section: 'Background colors', type: 'backgroundColor'}))
  },
  {
    id: 'text',
    name: 'Text colors',
    items: textColors.map(name => ({name, section: 'Text colors', type: 'color'}))
  },
  {
    id: 'semantic',
    name: 'Semantic colors',
    items: semanticColors
  },
  {
    id: 'global',
    name: 'Global colors',
    items: globalColors
  }
];

const itemStyle = style({
  ...focusRing(),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 8,
  padding: 8,
  backgroundColor: {
    default: 'gray-50',
    isHovered: 'gray-100',
    isFocused: 'gray-100',
    isSelected: 'neutral'
  },
  color: {
    default: 'body',
    isSelected: 'gray-25'
  },
  font: 'ui-sm',
  borderRadius: 'default',
  transition: 'default',
  cursor: 'default',
  size: 'full'
});

const swatchStyle = style({
  size: 20,
  borderRadius: 'sm',
  borderWidth: 1,
  borderColor: 'gray-1000/15',
  borderStyle: 'solid',
  flexShrink: 0
});

const backgroundSwatches: Record<string, string> = {
  'base': colorSwatch('base'),
  'layer-1': colorSwatch('layer-1'),
  'layer-2': colorSwatch('layer-2'),
  'pasteboard': colorSwatch('pasteboard'),
  'elevated': colorSwatch('elevated'),
  'accent': colorSwatch('accent'),
  'accent-subtle': colorSwatch('accent-subtle'),
  'neutral': colorSwatch('neutral'),
  'neutral-subdued': colorSwatch('neutral-subdued'),
  'neutral-subtle': colorSwatch('neutral-subtle'),
  'negative': colorSwatch('negative'),
  'negative-subtle': colorSwatch('negative-subtle'),
  'informative': colorSwatch('informative'),
  'informative-subtle': colorSwatch('informative-subtle'),
  'positive': colorSwatch('positive'),
  'positive-subtle': colorSwatch('positive-subtle'),
  'notice': colorSwatch('notice'),
  'notice-subtle': colorSwatch('notice-subtle'),
  'gray': colorSwatch('gray'),
  'gray-subtle': colorSwatch('gray-subtle'),
  'red': colorSwatch('red'),
  'red-subtle': colorSwatch('red-subtle'),
  'orange': colorSwatch('orange'),
  'orange-subtle': colorSwatch('orange-subtle'),
  'yellow': colorSwatch('yellow'),
  'yellow-subtle': colorSwatch('yellow-subtle'),
  'chartreuse': colorSwatch('chartreuse'),
  'chartreuse-subtle': colorSwatch('chartreuse-subtle'),
  'celery': colorSwatch('celery'),
  'celery-subtle': colorSwatch('celery-subtle'),
  'green': colorSwatch('green'),
  'green-subtle': colorSwatch('green-subtle'),
  'seafoam': colorSwatch('seafoam'),
  'seafoam-subtle': colorSwatch('seafoam-subtle'),
  'cyan': colorSwatch('cyan'),
  'cyan-subtle': colorSwatch('cyan-subtle'),
  'blue': colorSwatch('blue'),
  'blue-subtle': colorSwatch('blue-subtle'),
  'indigo': colorSwatch('indigo'),
  'indigo-subtle': colorSwatch('indigo-subtle'),
  'purple': colorSwatch('purple'),
  'purple-subtle': colorSwatch('purple-subtle'),
  'fuchsia': colorSwatch('fuchsia'),
  'fuchsia-subtle': colorSwatch('fuchsia-subtle'),
  'magenta': colorSwatch('magenta'),
  'magenta-subtle': colorSwatch('magenta-subtle'),
  'pink': colorSwatch('pink'),
  'pink-subtle': colorSwatch('pink-subtle'),
  'turquoise': colorSwatch('turquoise'),
  'turquoise-subtle': colorSwatch('turquoise-subtle'),
  'cinnamon': colorSwatch('cinnamon'),
  'cinnamon-subtle': colorSwatch('cinnamon-subtle'),
  'brown': colorSwatch('brown'),
  'brown-subtle': colorSwatch('brown-subtle'),
  'silver': colorSwatch('silver'),
  'silver-subtle': colorSwatch('silver-subtle'),
  'disabled': colorSwatch('disabled')
};

const textSwatches: Record<string, string> = {
  'accent': colorSwatch('accent', 'color'),
  'neutral': colorSwatch('neutral', 'color'),
  'neutral-subdued': colorSwatch('neutral-subdued', 'color'),
  'negative': colorSwatch('negative', 'color'),
  'disabled': colorSwatch('disabled', 'color'),
  'heading': colorSwatch('heading', 'color'),
  'title': colorSwatch('title', 'color'),
  'body': colorSwatch('body', 'color'),
  'detail': colorSwatch('detail', 'color'),
  'code': colorSwatch('code', 'color')
};

const accentScale = getColorScale('accent-color');
const informativeScale = getColorScale('informative-color');
const negativeScale = getColorScale('negative-color');
const noticeScale = getColorScale('notice-color');
const positiveScale = getColorScale('positive-color');
const grayScale = getColorScale('gray');
const blueScale = getColorScale('blue');
const redScale = getColorScale('red');
const orangeScale = getColorScale('orange');
const yellowScale = getColorScale('yellow');
const chartreuseScale = getColorScale('chartreuse');
const celeryScale = getColorScale('celery');
const greenScale = getColorScale('green');
const seafoamScale = getColorScale('seafoam');
const cyanScale = getColorScale('cyan');
const indigoScale = getColorScale('indigo');
const purpleScale = getColorScale('purple');
const fuchsiaScale = getColorScale('fuchsia');
const magentaScale = getColorScale('magenta');
const pinkScale = getColorScale('pink');
const turquoiseScale = getColorScale('turquoise');
const brownScale = getColorScale('brown');
const silverScale = getColorScale('silver');
const cinnamonScale = getColorScale('cinnamon');

const scaleSwatches: Record<string, string> = {
  ...Object.fromEntries(accentScale),
  ...Object.fromEntries(informativeScale),
  ...Object.fromEntries(negativeScale),
  ...Object.fromEntries(noticeScale),
  ...Object.fromEntries(positiveScale),
  ...Object.fromEntries(grayScale),
  ...Object.fromEntries(blueScale),
  ...Object.fromEntries(redScale),
  ...Object.fromEntries(orangeScale),
  ...Object.fromEntries(yellowScale),
  ...Object.fromEntries(chartreuseScale),
  ...Object.fromEntries(celeryScale),
  ...Object.fromEntries(greenScale),
  ...Object.fromEntries(seafoamScale),
  ...Object.fromEntries(cyanScale),
  ...Object.fromEntries(indigoScale),
  ...Object.fromEntries(purpleScale),
  ...Object.fromEntries(fuchsiaScale),
  ...Object.fromEntries(magentaScale),
  ...Object.fromEntries(pinkScale),
  ...Object.fromEntries(turquoiseScale),
  ...Object.fromEntries(brownScale),
  ...Object.fromEntries(silverScale),
  ...Object.fromEntries(cinnamonScale)
};


function CopyInfoMessage() {
  return (
    <div className={style({display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4})}>
      <InfoCircle styles={iconStyle({size: 'XS'})} />
      <span className={style({font: 'ui'})}>Press a color to copy its name</span>
    </div>
  );
}

interface ColorSearchViewProps {
  filteredItems: typeof colorSections
}

export function ColorSearchView({filteredItems}: ColorSearchViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  const handleCopyColor = useCallback((colorName: string, itemId: string) => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    navigator.clipboard.writeText(colorName).then(() => {
      setCopiedId(itemId);
      timeout.current = setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      // noop
    });
  }, []);

  const sections = filteredItems.map(section => ({
    ...section,
    items: section.items.map(item => ({
      ...item,
      id: `${section.id}-${item.name}`
    }))
  })).filter(section => section.items.length > 0);

  if (sections.length === 0) {
    return (
      <IllustratedMessage styles={style({marginX: 'auto', marginY: 32})}>
        <NoSearchResults />
        <Heading>No results</Heading>
        <Content>Try a different search term.</Content>
      </IllustratedMessage>
    );
  }

  return (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 8})}>
      <CopyInfoMessage />
      {sections.map(section => (
        <div key={section.id} className={style({display: 'flex', flexDirection: 'column', gap: 8})}>
          <Heading styles={style({font: 'heading-sm', marginBottom: 0})}>{section.name}</Heading>
          <Virtualizer layout={GridLayout} layoutOptions={{minItemSize: new Size(100, 100), maxItemSize: new Size(100, 100), minSpace: new Size(12, 24), preserveAspectRatio: true}}>
            <ListBox
              onAction={(key) => {
                const item = section.items.find(item => item.id === key.toString());
                if (item) {
                  handleCopyColor(item.name, item.id);
                }
              }}
              items={section.items}
              layout="grid"
              className={style({width: 'full'})}
              dependencies={[copiedId]}>
              {item => (
                <ColorItem 
                  key={item.id}
                  item={item} 
                  sectionId={section.id}
                  isCopied={copiedId === item.id} />
              )}
            </ListBox>
          </Virtualizer>
        </div>
      ))}
    </div>
  );
}

function ColorItem({item, sectionId, isCopied = false}: {item: {id: string, name: string, type?: string, scale?: string}, sectionId: string, isCopied?: boolean}) {
  let ref = useRef(null);
  
  // Look up the pre-generated swatch class for this color
  const swatchClass = sectionId === 'text' 
    ? textSwatches[item.name] 
    : backgroundSwatches[item.name] || scaleSwatches[item.name] || '';
  
  return (
    <ListBoxItem 
      id={item.id}
      textValue={item.name} 
      className={itemStyle} 
      ref={ref} 
      style={pressScale(ref)}>
      {isCopied ? (
        <div
          className={style({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          })}
          style={{
            width: '48px',
            height: '48px'
          } as React.CSSProperties}>
          <CheckmarkCircle styles={iconStyle({size: 'XL'})} />
        </div>
      ) : (
        <div
          className={swatchClass || swatchStyle}
          style={{
            width: '48px',
            height: '48px'
          } as React.CSSProperties} />
      )}
      <div
        className={style({
          maxWidth: 'full',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textAlign: 'center'
        })}>
        {isCopied ? 'Copied!' : item.name}
      </div>
    </ListBoxItem>
  );
}

function SkeletonColorItem({item}: {item: {id: string}}) {
  const ref = useRef(null);
  
  return (
    <ListBoxItem 
      id={item.id} 
      value={item} 
      textValue="skeleton" 
      className={itemStyle} 
      ref={ref}>
      <div
        className={swatchStyle}
        style={{
          width: '32px',
          height: '32px',
          backgroundColor: 'var(--s2-gray-200)'
        } as React.CSSProperties} />
      <div
        className={style({
          maxWidth: 'full',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textAlign: 'center'
        })}>
        <Text styles={style({font: 'ui-sm'})}>Name</Text>
      </div>
    </ListBoxItem>
  );
}

export function ColorSearchSkeleton() {
  const mockSections = useMemo(() => [
    {
      id: 'background',
      name: 'Background colors',
      items: Array.from({length: 20}, (_, i) => ({id: `skeleton-background-${i}`}))
    },
    {
      id: 'text',
      name: 'Text colors',
      items: Array.from({length: 10}, (_, i) => ({id: `skeleton-text-${i}`}))
    },
    {
      id: 'semantic',
      name: 'Semantic colors',
      items: Array.from({length: 30}, (_, i) => ({id: `skeleton-semantic-${i}`}))
    },
    {
      id: 'global',
      name: 'Global colors',
      items: Array.from({length: 40}, (_, i) => ({id: `skeleton-global-${i}`}))
    }
  ], []);

  return (
    <Skeleton isLoading>
      <div className={style({display: 'flex', flexDirection: 'column', gap: 8})}>
        {mockSections.map(section => (
          <div key={section.id} className={style({display: 'flex', flexDirection: 'column', gap: 8})}>
            <Heading styles={style({font: 'heading-sm'})}>{section.name}</Heading>
            <Virtualizer layout={GridLayout} layoutOptions={{minItemSize: new Size(100, 100), maxItemSize: new Size(100, 100), minSpace: new Size(12, 24), preserveAspectRatio: true}}>
              <ListBox
                items={section.items}
                layout="grid"
                className={style({width: 'full'})}>
                {(item) => <SkeletonColorItem item={item} />}
              </ListBox>
            </Virtualizer>
          </div>
        ))}
      </div>
    </Skeleton>
  );
}
