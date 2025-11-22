import {divider} from './SearchMenu';
import {Key, Separator as RACSeparator} from 'react-aria-components';
import React from 'react';
import {SelectableCollectionContext} from '../../../react-aria-components/src/RSPContexts';
import {style} from '@react-spectrum/s2/style' with { type: 'macro' };
import {Tag, TagGroup} from '@react-spectrum/s2';

interface TagItem {
  id: string,
  name: string
}

interface SearchTagGroupsProps {
  sectionTags: TagItem[],
  resourceTags?: TagItem[],
  selectedTagId: string | undefined,
  onSectionSelectionChange: (keys: Iterable<Key>) => void,
  onResourceSelectionChange?: (keys: Iterable<Key>) => void,
  isMobile?: boolean,
  wrapperClassName?: string,
  contentClassName?: string
}

export function SearchTagGroups({
  sectionTags,
  resourceTags = [],
  selectedTagId,
  onSectionSelectionChange,
  onResourceSelectionChange,
  isMobile = false,
  wrapperClassName,
  contentClassName
}: SearchTagGroupsProps) {
  if (sectionTags.length === 0 && resourceTags.length === 0) {
    return null;
  }

  const defaultWrapperClassName = style({flexShrink: 0, zIndex: 1, paddingTop: 16});
  const defaultContentClassName = style({display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, marginX: 16});

  const resourceTagIds = resourceTags.map(tag => tag.id);
  const isResourceSelected = selectedTagId && resourceTagIds.includes(selectedTagId);

  return (
    <div className={wrapperClassName || defaultWrapperClassName}>
      <SelectableCollectionContext.Provider value={null}>
        <div className={contentClassName || defaultContentClassName}>
          {sectionTags.length > 0 && (
            <div className={style({flexShrink: 0})}>
              <TagGroup
                escapeKeyBehavior="none"
                selectionMode="single"
                selectedKeys={selectedTagId && !isResourceSelected ? [selectedTagId] : []}
                onSelectionChange={onSectionSelectionChange}
                aria-label="Sections"
                items={sectionTags}
                UNSAFE_style={isMobile ? {whiteSpace: 'nowrap'} : undefined}>
                {(tag) => (
                  <Tag key={tag.id} id={tag.id}>
                    {tag.name}
                  </Tag>
                )}
              </TagGroup>
            </div>
          )}
          {resourceTags.length > 0 && sectionTags.length > 0 && (
            <RACSeparator className={divider} />
          )}
          {resourceTags.length > 0 && (
            <div className={style({flexShrink: 0})}>
              <TagGroup
                escapeKeyBehavior="none"
                selectionMode="single"
                selectedKeys={isResourceSelected && selectedTagId ? [selectedTagId] : []}
                onSelectionChange={onResourceSelectionChange}
                aria-label="Resources"
                items={resourceTags}
                UNSAFE_style={isMobile ? {whiteSpace: 'nowrap'} : undefined}>
                {(tag) => (
                  <Tag key={tag.id} id={tag.id}>
                    {tag.name}
                  </Tag>
                )}
              </TagGroup>
            </div>
          )}
        </div>
      </SelectableCollectionContext.Provider>
    </div>
  );
}
