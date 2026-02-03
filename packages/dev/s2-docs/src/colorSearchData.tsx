'use client';

import {getColorHexMap} from './color.macro' with {type: 'macro'};
import {Header, ListBox, ListBoxItem, ListBoxSection} from 'react-aria-components';
import {iconStyle, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import InfoCircle from '@react-spectrum/s2/icons/InfoCircle';
import {Link, Skeleton, Text} from '@react-spectrum/s2';
import React, {useMemo, useRef} from 'react';

export const colorHexMaps = getColorHexMap();

const backgroundColors = [
  'black', 'white',
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
  'black', 'white',
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

const skeletonItemStyle = style({
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

const skeletonSwatchStyle = style({
  size: 20,
  borderRadius: 'sm',
  borderWidth: 1,
  borderColor: 'gray-1000/15',
  borderStyle: 'solid',
  flexShrink: 0,
  forcedColorAdjust: 'none'
});

const listBoxStyle = style({
  width: 'full',
  display: 'flex',
  flexDirection: 'column',
  gap: 24
});

const sectionStyle = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
  gap: 32,
  padding: 8,
  marginBottom: 16
});

const headerStyle = style({
  font: 'heading-sm',
  gridColumnStart: 1,
  gridColumnEnd: -1,
  marginBottom: 4
});

interface InfoMessageProps {
  /** The content to display in the message. */
  children: React.ReactNode
}

export function InfoMessage({children}: InfoMessageProps) {
  return (
    <div className={style({display: 'flex', gap: 4, padding: 8, alignItems: 'center'})}>
      <InfoCircle styles={iconStyle({size: 'XS'})} />
      <span className={style({font: 'ui'})}>
        {children}
      </span>
    </div>
  );
}

function SkeletonColorItem({item}: {item: {id: string}}) {
  const ref = useRef(null);
  return (
    <ListBoxItem 
      id={item.id} 
      value={item} 
      textValue="skeleton" 
      className={skeletonItemStyle} 
      ref={ref}>
      <div
        className={skeletonSwatchStyle}
        style={{
          width: '48px',
          height: '48px',
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
        <Text styles={style({font: 'ui-sm'})}>Color Name</Text>
      </div>
    </ListBoxItem>
  );
}

export function ColorSearchSkeleton() {
  const mockSections = useMemo(() => [
    {
      id: 'background',
      name: 'Background colors',
      items: Array.from({length: 59}, (_, i) => ({id: `skeleton-background-${i}`}))
    },
    {
      id: 'text',
      name: 'Text colors',
      items: Array.from({length: 12}, (_, i) => ({id: `skeleton-text-${i}`}))
    },
    {
      id: 'semantic',
      name: 'Semantic colors',
      items: Array.from({length: 80}, (_, i) => ({id: `skeleton-semantic-${i}`}))
    },
    {
      id: 'global',
      name: 'Global colors',
      items: Array.from({length: 301}, (_, i) => ({id: `skeleton-global-${i}`}))
    }
  ], []);

  return (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 8})}>
      <InfoMessage>Press a color to copy its name. See <Link href="styling">styling</Link> for more information.</InfoMessage>
      <Skeleton isLoading>
        <ListBox
          aria-label="Colors loading"
          layout="grid"
          className={listBoxStyle}
          items={mockSections}>
          {section => (
            <ListBoxSection id={section.id} className={sectionStyle}>
              <Header className={headerStyle}>{section.name}</Header>
              {section.items.map(item => (
                <SkeletonColorItem key={item.id} item={item} />
              ))}
            </ListBoxSection>
          )}
        </ListBox>
      </Skeleton>
    </div>
  );
}
