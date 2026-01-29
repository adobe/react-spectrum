'use client';

import {ActionButton, DialogTrigger, Link, Popover, Text, ToggleButton, ToggleButtonGroup} from '@react-spectrum/s2';
import {CopyButton} from './CopyButton';
import {focusRing, iconStyle, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Header, Key, ListBox, ListBoxItem, ListBoxSection} from 'react-aria-components';
import InfoCircle from '@react-spectrum/s2/icons/InfoCircle';
import React, {useMemo, useState} from 'react';

const listBoxStyle = style({
  width: 'full',
  display: 'flex',
  flexDirection: 'row',
  gap: 24,
  flexWrap: 'wrap',
  alignItems: 'start'
});

const sectionStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 4
});

const headerStyle = style({
  font: 'heading-xs',
  marginBottom: 4,
  color: 'neutral-subdued',
  display: 'flex',
  alignItems: 'center',
  gap: 4
});

function InfoMessage() {
  return (
    <div
      className={style({
        display: 'flex',
        gap: 4,
        padding: 8
      })}>
      <InfoCircle styles={iconStyle({size: 'XS'})} />
      <span className={style({font: 'ui'})}>Select a typography style to preview and copy its code snippet. See <Link href="styling">styling</Link> for more information.</span>
    </div>
  );
}

const typographySections = [
  {
    id: 'heading',
    name: 'Heading',
    description: 'Use for headings in content pages',
    items: ['heading-2xs', 'heading-xs', 'heading-sm', 'heading', 'heading-lg', 'heading-xl', 'heading-2xl', 'heading-3xl']
  },
  {
    id: 'title',
    name: 'Title',
    description: 'Use for titles within UI components such as cards or panels',
    items: ['title-xs', 'title-sm', 'title', 'title-lg', 'title-xl', 'title-2xl', 'title-3xl']
  },
  {
    id: 'body',
    name: 'Body',
    description: 'Use for the content of pages that are primarily text',
    items: ['body-2xs', 'body-xs', 'body-sm', 'body', 'body-lg', 'body-xl', 'body-2xl', 'body-3xl']
  },
  {
    id: 'ui',
    name: 'UI',
    description: 'Use within interactive UI components',
    items: ['ui-xs', 'ui-sm', 'ui', 'ui-lg', 'ui-xl', 'ui-2xl', 'ui-3xl']
  },
  {
    id: 'detail',
    name: 'Detail',
    description: 'Use for less important metadata',
    items: ['detail-sm', 'detail', 'detail-lg', 'detail-xl']
  },
  {
    id: 'code',
    name: 'Code',
    description: 'Use for source code',
    items: ['code-sm', 'code', 'code-lg', 'code-xl']
  }
];

const htmlElements = [
  {id: 'h1', name: '<h1>'},
  {id: 'h2', name: '<h2>'},
  {id: 'h3', name: '<h3>'},
  {id: 'h4', name: '<h4>'},
  {id: 'h5', name: '<h5>'},
  {id: 'h6', name: '<h6>'},
  {id: 'p', name: '<p>'},
  {id: 'span', name: '<span>'},
  {id: 'div', name: '<div>'},
  {id: 'label', name: '<label>'},
  {id: 'strong', name: '<strong>'},
  {id: 'em', name: '<em>'}
];

const itemStyle = style({
  ...focusRing(),
  display: 'flex',
  alignItems: 'center',
  paddingX: 12,
  paddingY: 8,
  backgroundColor: {
    default: 'gray-50',
    isHovered: 'gray-100',
    isFocused: 'gray-100',
    isSelected: 'accent'
  },
  color: {
    default: 'body',
    isSelected: 'white'
  },
  borderRadius: 'lg',
  transition: 'default',
  cursor: 'default'
});

const fontStyles = {
  // UI
  'ui-xs': style({font: 'ui-xs', color: 'inherit'}),
  'ui-sm': style({font: 'ui-sm', color: 'inherit'}),
  'ui': style({font: 'ui', color: 'inherit'}),
  'ui-lg': style({font: 'ui-lg', color: 'inherit'}),
  'ui-xl': style({font: 'ui-xl', color: 'inherit'}),
  'ui-2xl': style({font: 'ui-2xl', color: 'inherit'}),
  'ui-3xl': style({font: 'ui-3xl', color: 'inherit'}),
  // Body
  'body-2xs': style({font: 'body-2xs', color: 'inherit'}),
  'body-xs': style({font: 'body-xs', color: 'inherit'}),
  'body-sm': style({font: 'body-sm', color: 'inherit'}),
  'body': style({font: 'body', color: 'inherit'}),
  'body-lg': style({font: 'body-lg', color: 'inherit'}),
  'body-xl': style({font: 'body-xl', color: 'inherit'}),
  'body-2xl': style({font: 'body-2xl', color: 'inherit'}),
  'body-3xl': style({font: 'body-3xl', color: 'inherit'}),
  // Heading
  'heading-2xs': style({font: 'heading-2xs', color: 'inherit'}),
  'heading-xs': style({font: 'heading-xs', color: 'inherit'}),
  'heading-sm': style({font: 'heading-sm', color: 'inherit'}),
  'heading': style({font: 'heading', color: 'inherit'}),
  'heading-lg': style({font: 'heading-lg', color: 'inherit'}),
  'heading-xl': style({font: 'heading-xl', color: 'inherit'}),
  'heading-2xl': style({font: 'heading-2xl', color: 'inherit'}),
  'heading-3xl': style({font: 'heading-3xl', color: 'inherit'}),
  // Title
  'title-xs': style({font: 'title-xs', color: 'inherit'}),
  'title-sm': style({font: 'title-sm', color: 'inherit'}),
  'title': style({font: 'title', color: 'inherit'}),
  'title-lg': style({font: 'title-lg', color: 'inherit'}),
  'title-xl': style({font: 'title-xl', color: 'inherit'}),
  'title-2xl': style({font: 'title-2xl', color: 'inherit'}),
  'title-3xl': style({font: 'title-3xl', color: 'inherit'}),
  // Detail
  'detail-sm': style({font: 'detail-sm', color: 'inherit'}),
  'detail': style({font: 'detail', color: 'inherit'}),
  'detail-lg': style({font: 'detail-lg', color: 'inherit'}),
  'detail-xl': style({font: 'detail-xl', color: 'inherit'}),
  // Code
  'code-sm': style({font: 'code-sm', color: 'inherit'}),
  'code': style({font: 'code', color: 'inherit'}),
  'code-lg': style({font: 'code-lg', color: 'inherit'}),
  'code-xl': style({font: 'code-xl', color: 'inherit'})
} as const;

type FontStyleKey = keyof typeof fontStyles;

const previewTextStyle = style({
  marginY: 'auto'
});

interface TypographySearchViewProps {
  searchValue?: string
}

export function TypographySearchView({searchValue = ''}: TypographySearchViewProps) {
  const [selectedFont, setSelectedFont] = useState<string>('heading');
  const [selectedElement, setSelectedElement] = useState<Key>('h1');

  const previewText = searchValue.trim() || 'Sample Text';

  const selectedElementTag = String(selectedElement || 'span');
  const codeSnippet = `<${selectedElementTag} className={style({font: '${selectedFont}'})}>${previewText}</${selectedElementTag}>`;
  const previewTextClassName = selectedFont in fontStyles
    ? `${fontStyles[selectedFont as FontStyleKey]} ${previewTextStyle}`
    : previewTextStyle;

  const sections = useMemo(() => typographySections.map(section => ({
    id: section.id,
    name: section.name,
    description: section.description,
    items: section.items.map(name => ({
      id: `${section.id}-${name}`,
      name
    }))
  })), []);

  const handleSelectionChange = (keys: Set<Key>) => {
    const selectedKey = Array.from(keys)[0];
    if (selectedKey) {
      // Extract font name from the key (format: "section-fontname")
      const parts = String(selectedKey).split('-');
      // Handle cases like "ui-2xl" or "heading-xl"
      const fontName = parts.slice(1).join('-');
      setSelectedFont(fontName);
    }
  };

  const handleElementChange = (keys: Set<Key>) => {
    const selectedKey = Array.from(keys)[0];
    if (selectedKey) {
      setSelectedElement(selectedKey);
    }
  };

  // Find the currently selected key for the ListBox
  const selectedKeys = useMemo(() => {
    for (const section of sections) {
      const item = section.items.find(item => item.name === selectedFont);
      if (item) {
        return new Set([item.id]);
      }
    }
    return new Set<Key>();
  }, [selectedFont, sections]);

  return (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 16, height: 'full'})}>
      <InfoMessage />

      <div className={style({flexGrow: 1, overflow: 'auto', padding: 8})}>
        <ListBox
          aria-label="Typography styles"
          selectionMode="single"
          selectedKeys={selectedKeys}
          onSelectionChange={handleSelectionChange as (keys: 'all' | Set<Key>) => void}
          className={listBoxStyle}
          items={sections}>
          {section => (
            <ListBoxSection id={section.id} className={sectionStyle}>
              <Header className={headerStyle}>
                {section.name}
                <DialogTrigger>
                  <ActionButton size="XS" isQuiet aria-label={`About ${section.name}`}><InfoCircle /></ActionButton>
                  <Popover>
                    <div className={style({padding: 8, maxWidth: 240})}>
                      <span className={style({font: 'body'})}>{section.description}</span>
                    </div>
                  </Popover>
                </DialogTrigger>
              </Header>
              {section.items.map(item => (
                <ListBoxItem
                  key={item.id}
                  id={item.id}
                  textValue={item.name}
                  className={itemStyle}>
                  <span className={item.name in fontStyles ? fontStyles[item.name as FontStyleKey] : undefined}>
                    {item.name}
                  </span>
                </ListBoxItem>
              ))}
            </ListBoxSection>
          )}
        </ListBox>
      </div>

      <div className={style({overflowX: 'auto', overflowY: 'visible', width: 'full', flexShrink: 0})}>
        <ToggleButtonGroup
          aria-label="Element type"
          density="compact"
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[selectedElement]}
          onSelectionChange={handleElementChange as (keys: Set<Key>) => void}>
          {htmlElements.map(option => (
            <ToggleButton key={option.id} id={option.id}>
              <Text>{option.name}</Text>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>
      
      <div
        className={style({
          backgroundColor: 'layer-1',
          borderRadius: 'lg',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          borderWidth: 1,
          borderColor: 'gray-200',
          borderStyle: 'solid',
          flexShrink: 0
        })}>
        <div
          className={style({
            backgroundColor: 'layer-2',
            borderRadius: 'default',
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 80
          })}>
          {React.createElement(selectedElementTag, {className: previewTextClassName}, previewText)}
        </div>
        
        <div className={style({display: 'flex', flexDirection: 'column', gap: 12})}>
          <div
            className={style({
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'gray-100',
              borderRadius: 'default',
              paddingX: 12,
              paddingY: 8,
              font: 'code-sm'
            })}>
            <code className={style({flexGrow: 1, overflow: 'auto', whiteSpace: 'nowrap'})}>
              {codeSnippet}
            </code>
            <CopyButton text={codeSnippet} tooltip="Copy code snippet" ariaLabel="Copy code snippet" />
          </div>
        </div>
      </div>
    </div>
  );
}
