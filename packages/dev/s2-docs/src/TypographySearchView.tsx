'use client';

import {ActionButton, Content, Heading, IllustratedMessage, Link} from '@react-spectrum/s2';
import {CopyButton} from './CopyButton';
import Edit from '@react-spectrum/s2/icons/Edit';
import {FieldInputContext, Header, Input, InputRenderProps, Key, ListBox, ListBoxItem, ListBoxSection, OverlayTriggerStateContext, TextField} from 'react-aria-components';
import {focusRing, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {InfoMessage} from './colorSearchData';
// eslint-disable-next-line monorepo/no-internal-import
import NoSearchResults from '@react-spectrum/s2/illustrations/linear/NoSearchResults';
import React, {useMemo, useRef, useState} from 'react';

const listBoxStyle = style({
  width: 'full',
  display: 'flex',
  flexDirection: 'row',
  gap: 12,
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
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  paddingX: 8
});

const typographySections = [
  {
    id: 'heading',
    name: 'Heading',
    description: 'Use for headings in content pages',
    items: ['heading-2xs', 'heading-xs', 'heading-sm', 'heading', 'heading-lg', 'heading-xl', 'heading-2xl', 'heading-3xl']
  },
  {
    id: 'body',
    name: 'Body',
    description: 'Use for the content of pages that are primarily text',
    items: ['body-2xs', 'body-xs', 'body-sm', 'body', 'body-lg', 'body-xl', 'body-2xl', 'body-3xl']
  },
  {
    id: 'title',
    name: 'Title',
    description: 'Use for titles within UI components such as cards or panels',
    items: ['title-xs', 'title-sm', 'title', 'title-lg', 'title-xl', 'title-2xl', 'title-3xl']
  },
  {
    id: 'ui',
    name: 'UI',
    description: 'Use within interactive UI components',
    items: ['ui-xs', 'ui-sm', 'ui', 'ui-lg', 'ui-xl', 'ui-2xl', 'ui-3xl']
  },
  {
    id: 'code',
    name: 'Code',
    description: 'Use for source code',
    items: ['code-sm', 'code', 'code-lg', 'code-xl']
  },
  {
    id: 'detail',
    name: 'Detail',
    description: 'Use for less important metadata',
    items: ['detail-sm', 'detail', 'detail-lg', 'detail-xl']
  }
];

const itemStyle = style({
  ...focusRing(),
  display: 'flex',
  alignItems: 'center',
  paddingX: 12,
  paddingY: 4,
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

// We hard-code these since the code is dynamic and we can't run our highlighter in the browser.
const syntaxStyles = {
  tag: style({color: 'red-1000'}),
  attribute: style({color: 'indigo-1000'}),
  string: style({color: 'green-1000'})
};

type FontStyleKey = keyof typeof fontStyles;

const defaultPreviewInputStyle = style({
  ...focusRing(),
  backgroundColor: 'transparent',
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: {
    default: 'transparent',
    isFocused: 'gray-900'
  },
  borderRadius: 'lg',
  textAlign: 'center',
  width: 'full',
  transition: 'default'
});

const editButtonStyle = style({
  position: 'absolute',
  insetStart: 'full',
  marginStart: 8,
  visibility: {
    default: 'visible',
    isHidden: 'hidden'
  }
});

interface TypographySearchViewProps {
  searchValue?: string
}

export function TypographySearchView({searchValue = ''}: TypographySearchViewProps) {
  const [selectedFont, setSelectedFont] = useState<string>('heading');
  const [previewText, setPreviewText] = useState<string>('Sample Text');
  const [isPreviewFocused, setIsPreviewFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const codeSnippet = `<div className={style({font: '${selectedFont}'})}>${previewText}</div>`;
  const fontStyleClass = selectedFont in fontStyles ? fontStyles[selectedFont as FontStyleKey] : undefined;
  const previewInputStyle = (renderProps: InputRenderProps) => `${defaultPreviewInputStyle(renderProps)} ${fontStyleClass || ''}`;

  const sections = useMemo(() => {
    const searchLower = searchValue.toLowerCase();
    
    return typographySections.map(section => ({
      id: section.id,
      name: section.name,
      description: section.description,
      items: section.items
        .filter(name => name.toLowerCase().includes(searchLower))
        .map(name => ({
          id: `${section.id}-${name}`,
          name
        }))
    })).filter(section => section.items.length > 0);
  }, [searchValue]);

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
    <>
      <InfoMessage>Select a typography style and customize the sample text to preview its rendered output and code snippet. See <Link href="styling">styling</Link> for more information.</InfoMessage>
      <div className={style({flexShrink: 1, minHeight: 0, overflow: 'auto', padding: 8})}>
        <ListBox
          aria-label="Typography styles"
          selectionMode="single"
          selectedKeys={selectedKeys}
          onSelectionChange={handleSelectionChange as (keys: 'all' | Set<Key>) => void}
          className={listBoxStyle}
          items={sections}
          renderEmptyState={() => (
            <IllustratedMessage styles={style({marginX: 'auto', marginY: 32})}>
              <NoSearchResults />
              <Heading>No results</Heading>
              <Content>Try a different search term.</Content>
            </IllustratedMessage>
          )}>
          {section => (
            <ListBoxSection id={section.id} className={sectionStyle}>
              <Header className={headerStyle}>
                {section.name}
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

      <div
        className={style({
          backgroundColor: 'layer-1',
          borderRadius: 'lg',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          gap: 16,
          borderWidth: 1,
          borderColor: 'gray-200',
          borderStyle: 'solid',
          margin: 8
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
          <div className={style({position: 'relative', display: 'inline-flex', alignItems: 'center', maxWidth: 'full'})}>
            <FieldInputContext.Provider value={null}>
              <TextField
                aria-label="Editable preview text"
                value={previewText}
                onChange={setPreviewText}
                onFocus={() => setIsPreviewFocused(true)}
                onBlur={() => {
                  setIsPreviewFocused(false);
                  if (previewText.trim() === '') {
                    setPreviewText('Sample Text');
                  }
                }}
                className={style({maxWidth: 'full', display: 'flex'})}>
                <Input
                  ref={inputRef}
                  className={previewInputStyle}
                  style={{
                    /* @ts-ignore - https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/field-sizing */
                    fieldSizing: 'content'
                  }} />
              </TextField>
            </FieldInputContext.Provider>
            <OverlayTriggerStateContext.Provider value={null}>
              <ActionButton
                aria-label="Edit sample text"
                isQuiet
                size="S"
                styles={editButtonStyle({isHidden: isPreviewFocused})}
                onPress={() => {
                  const input = inputRef.current;
                  if (input) {
                    input.focus();
                    input.select();
                  }
                }}>
                <Edit />
              </ActionButton>
            </OverlayTriggerStateContext.Provider>
          </div>
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
              font: 'code'
            })}>
            <code className={style({flexGrow: 1, overflow: 'auto', whiteSpace: 'nowrap'})}>
              &lt;
              <span className={syntaxStyles.tag}>div</span>
              {' '}
              <span className={syntaxStyles.attribute}>className</span>
              =
              {'{'}
              <span className={syntaxStyles.tag}>style</span>
              {'('}
              {'{'}
              <span className={syntaxStyles.attribute}>font</span>
              :
              {' '}
              <span className={syntaxStyles.string}>'{selectedFont}'</span>
              {'}'}
              {')'}
              {'}'}
              &gt;
              {previewText}
              &lt;/
              <span className={syntaxStyles.tag}>div</span>
              &gt;
            </code>
            <CopyButton size="M" text={codeSnippet} tooltip="Copy code snippet" ariaLabel="Copy code snippet" />
          </div>
        </div>
      </div>
    </>
  );
}
