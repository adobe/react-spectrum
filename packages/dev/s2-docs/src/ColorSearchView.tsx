'use client';

import {Badge, Content, Heading, IllustratedMessage, Link, pressScale, Text} from '@react-spectrum/s2';
import Checkmark from '@react-spectrum/s2/icons/Checkmark';
import CheckmarkCircle from '@react-spectrum/s2/icons/CheckmarkCircle';
import {colorSwatch, getColorScale} from './color.macro' with {type: 'macro'};
import {focusRing, iconStyle, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Header, ListBox, ListBoxItem, ListBoxSection} from 'react-aria-components';
import InfoCircle from '@react-spectrum/s2/icons/InfoCircle';
// eslint-disable-next-line monorepo/no-internal-import
import NoSearchResults from '@react-spectrum/s2/illustrations/linear/NoSearchResults';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import Similar from '@react-spectrum/s2/icons/Similar';

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

const backgroundSwatches: Record<string, string> = {
  'black': colorSwatch('black'),
  'white': colorSwatch('white'),
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
  'black': colorSwatch('black', 'color'),
  'white': colorSwatch('white', 'color'),
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


export function CopyInfoMessage() {
  return (
    <div
      className={style({
        display: 'flex',
        gap: 4,
        padding: 8
      })}>
      <InfoCircle styles={iconStyle({size: 'XS'})} />
      <span className={style({font: 'ui'})}>Press a color to copy its name. See <Link href="styling">styling</Link> for more information.</span>
    </div>
  );
}

interface ColorSearchViewProps {
  filteredItems: Array<{
    id: string,
    name: string,
    items: Array<{name: string, section: string, type: string}>
  }>,
  /** Names of colors that exactly match the searched hex value. */
  exactMatches?: Set<string>,
  /** Names of the closest matching colors when no exact matches exist. */
  closestMatches?: Set<string>
}

export function ColorSearchView({filteredItems, exactMatches = new Set(), closestMatches = new Set()}: ColorSearchViewProps) {
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
    <div className={style({display: 'flex', flexDirection: 'column', gap: 8, height: 'full'})}>
      <CopyInfoMessage />
      <div className={style({flexGrow: 1, overflow: 'auto'})}>
        <ListBox
          aria-label="Colors"
          onAction={(key) => {
            for (const section of sections) {
              const item = section.items.find(item => item.id === key.toString());
              if (item) {
                handleCopyColor(item.name, item.id);
                break;
              }
            }
          }}
          layout="grid"
          className={listBoxStyle}
          dependencies={[copiedId, exactMatches, closestMatches]}
          items={sections}>
          {section => (
            <ListBoxSection id={section.id} className={sectionStyle}>
              <Header className={headerStyle}>{section.name}</Header>
              {section.items.map(item => (
                <ColorItem 
                  key={item.id}
                  item={item} 
                  sectionId={section.id}
                  isCopied={copiedId === item.id}
                  isBestMatch={exactMatches.has(item.name) || closestMatches.has(item.name)}
                  isExactMatch={exactMatches.has(item.name)} />
              ))}
            </ListBoxSection>
          )}
        </ListBox>
      </div>
    </div>
  );
}

interface ColorItemProps {
  item: {id: string, name: string, type?: string, scale?: string},
  sectionId: string,
  isCopied?: boolean,
  isBestMatch?: boolean,
  isExactMatch?: boolean
}

function ColorItem({item, sectionId, isCopied = false, isBestMatch = false, isExactMatch = false}: ColorItemProps) {
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
      <div
        className={`${swatchClass || swatchStyle} ${style({position: 'relative'})}`}
        style={{
          width: '48px',
          height: '48px',
          '--s2-container-bg': 'var(--v)'
        } as React.CSSProperties}>
        <div
          className={style({
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'inherit',
            color: 'auto',
            '--iconPrimary': {
              type: 'fill',
              value: 'currentColor'
            },
            transition: 'default'
          })}
          style={{
            opacity: isCopied ? 1 : 0,
            transform: isCopied ? 'scale(1)' : 'scale(0.5)'
          }}>
          <CheckmarkCircle styles={iconStyle({size: 'XL'})} />
        </div>
      </div>
      {isBestMatch && !isCopied ? (
        <Badge 
          size="S" 
          variant={isExactMatch ? 'positive' : 'informative'}
          UNSAFE_style={{width: 'max-content'}}>
          {isExactMatch ? <Checkmark /> : <Similar />}
          <Text>{item.name}</Text>
        </Badge>
      ) : (
        <div
          className={style({
            position: 'relative',
            width: 'full',
            textAlign: 'center',
            minHeight: 24
          })}>
          <span
            className={style({
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'default'
            })}
            style={{
              opacity: isCopied ? 0 : 1
            }}>
            <span className={style({textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 'full'})}>
              {item.name}
            </span>
          </span>
          <span
            className={style({
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'default'
            })}
            style={{
              opacity: isCopied ? 1 : 0
            }}>
            Copied!
          </span>
        </div>
      )}
    </ListBoxItem>
  );
}
